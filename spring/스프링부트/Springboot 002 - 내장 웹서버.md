# Springboot - 내장 웹 서버, HTTPS, HTTP2



스프링부트는 내장 웹 서버로 톰캣이 자동 설정되어있다.

spring-boot-starter-web이 톰캣을 가져온다.



톰캣은 아래와 같이 직접 구현하여 실행시킬 수도 있다. (대부분은 스프링부트로 바로 실행시킬 것이다..)

```java
public class Application {

    public static void main(String[] args) throws LifecycleException {
        // SpringApplication.run(Application.class, args);
      
        // 1 Tomcat 객체 생성
        Tomcat tomcat = new Tomcat();
      
        // 2 포트 설정, 커넥터 연결
        tomcat.setPort(8080);
        tomcat.getConnector();

        // 3 컨텍스트 추가
        Context context = tomcat.addContext("/", "/");

        // 4 서블릿 생성 (웹 페이지)
        HttpServlet servlet = new HttpServlet() {
            @Override
            protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
                PrintWriter writer = resp.getWriter();
                writer.println("<html><head><title>");
                writer.println("My Tomcat Server");
                writer.println("</title></head>");
                writer.println("<body><p>Hello Tomcat</p></body>");
                writer.println("</html>");
            }
        };
				
      	// 5 톰캣에 서블릿 추가
        String servletName = "helloServlet";
        tomcat.addServlet("/", servletName, servlet);
      
      	// 6 컨텍스트에 서블릿 매핑 (url 에 해당 서블릿 매핑)
        context.addServletMappingDecoded("/hello", servletName);

      	// 7 톰캣 실행 및 서버가동 유지
        tomcat.start();
        tomcat.getServer().await();
    }

}

```

스프링부트는 위 일련의 과정을 상세하고 유연하게 자동설정해준다.

`ServletWebServerFactoryAutoConfiguration` 은 서블릿 웹 서버를 생성하고, 여기서 `TomcatServletWebServerFactoryCustomizer` 를 통해 서버를 커스터마이징 한다. (1 ~ 2 과정)

또한 `DispatcherServletAutoConfiguration` 에서 서블릿을 만들고 등록한다. (3 ~ 6 과정)



<br />

---

## 컨테이너, 서버 포트

tomcat 대신 jetty, undertow, netty 등의 다른 웹서버로 바꿀 수 있다. (단, netty 는 webflux)

메이븐에서 exclusion 태그에 tomcat 을 담아 톰캣을 제외시키고, 다른 디펜던시로 (예를들면) undertow 로 교체할 수 있다.



**pom.xml**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <exclusions>
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-tomcat</artifactId>
    </exclusion>
  </exclusions>
</dependency>

<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```





또한 간단한 프로퍼티 등록으로 다양한 웹서버 기능을 사용할 수 있다. 

**application.properties**

```properties
# 스프링부트 실행 시 웹애플레키이션을 실행시키지 않음.
spring.main.web-application-type=none

# 포트번호를 지정
server.port=7070

# 포트번호를 임의로 지정 (Random Port)
server.port=0
```



또한 프로퍼티 파일말고도, 빈 설정을 통해 포트 정보를 확인하고 설정할 수 있다.

`ApplicationListener<ServletWebServerInitializedEvent>` 의 구현체를 만들고 메소드를 이용하면 된다.

```java
@Component
public class PortListener implements ApplicationListener<ServletWebServerInitializedEvent> {

    @Override
    public void onApplicationEvent(ServletWebServerInitializedEvent servletWebServerInitializedEvent) {
        ServletWebServerApplicationContext applicationContext = servletWebServerInitializedEvent.getApplicationContext();
        int port = applicationContext.getWebServer().getPort();
        System.out.println(port);
    }
}

```





<br />

---

## HTTP, HTTP2





<br />

### https 서버 접근

스프링부트에서 웹서버를 실행할 때 localhost:8080 으로 보통 실행시킨다.

여기서 https 를 사용하도록 해보자.



우선 로컬에서 키스토어(인증서) 를 하나 만들자.

```shell
keytool -genkey -alias tomcat -storetype PKCS12 -keyalg RSA -keysize 2048 -keystore keystore.p12 -validity 4000
```



그리고 프로퍼티 설정에 방금 만들어준 키스토어 정보를 입력해준다. 그러면 스프링부트는 이 속성을 읽어서 https 인증서를 브라우저에게 전송할 것이다.

application.properties

```shell
server.ssl.key-store=keystore.p12
server.ssl.key-store-password=123456
server.ssl.keyStoreType=PKCS12
server.ssl.keyAlias=tomcat
server.port=8443
server.http2.enabled=true
```





일반적인 인증기관에서 발급하는 pub key는 대부분의 브라우저가 알고 있다.

하지만 로컬에서 인증서를 만들면 브라우저는 무슨 인증서인지 알지 못한다. 그래서 브라우저 주소창에 url을 치면 https 이지만 인증서를 모르기 때문에 접근할 지 되묻는다.

![](https://blog.kakaocdn.net/dn/cTiiGh/btqTyBfBdxP/pvdr5ILMDtgP6bHKixplo0/img.png)



(크롬 브라우저 기준) 밑에 고급을 눌러서 [localhost(안전하지 않음)]()로 이동을 눌러주면 된다. 

혹시 그런 링크가 없을 시에는 브라우저를 다시 시작하고, 오른쪽 세로 점 3개 아이콘 클릭 > 설정 > 안전확인 > 보안 > 인증서 관리 > 인증서 이름 검색 > 신뢰 > 이 인증서 사용 시 "항상 신뢰" 로 변경해 준다. (mac 기준)

이제 웹사이트에 접속된 것이 보인다. 물론 코딩해놓은 것이 없어서 Whitelabel Error Page 가 보일 것이다. 하지만 서버는 연결된 것이다.

<br />

curl 명령어로 콘솔에서 서버 정보를 받아올 수 도 있다.

```shell
$ curl -I -k https://localhost:8443/
```

> **curl 명령어 옵션**
>
> * `-k` : https 사이트를 SSL certificate 검증 없이 연결한다.
> * `-I` : Information 으로 HTTP 응답 유형, 결과, content-type, content-length, Date 를 출력한다.

<br />

---

### **새로운 커넥터 활성화**

프로퍼티 파일에 https 설정을 했는데, http 서버도 다른 포트로 열고 싶다면, 아래처럼 코딩을 해서 http 커넥터를 만들 수 있다.

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public ServletWebServerFactory serverFactory() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        tomcat.addAdditionalTomcatConnectors(createStandardConnector());
        return tomcat;
    }

    private Connector createStandardConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setPort(8080);
        return connector;
    }
}

```

이렇게 하고 애플리케이션을 실행시키면, 포트 8443 에서는 https 서버가, 포트 8080에서는 http 서버가 열린 것이 보일 것이다.





<br />

---

### HTTPS2 활성화

application.properties

```shell
# http2 활성화 추가
server.http2.enabled=true
```



이 조건만 추가하면 http2 통신도 사용할 수 있다.

```shell
$ curl -I -k https://localhost:8443/
>> HTTP/2 404 
>> ...
```





<br />

---

## 실행가능한 jar 파일



애플리케이션을 실행시킬 때 주로 사용하는 메이븐 명령어이다.

```shell
# target 폴더 및 하위 파일 모두 삭제
$ mvn clean

# target 폴더 생성, jar 파일 생성
$ mvn package

# maven 라이프사이클 중 테스트 건너뛰기(시간단축)
$ mvn package -DskipTests

# 스프링부트 실행
$ java -jar target/springgoman-0.0.1-SNAPSHOT.jar
```

`mvn package` 명령 실행 시 jar 하나를 만들어 주는데, 이 파일 하나로 스프링부트를 실행할 수 있다. 



spring-boot-maven-plugin 은 스프링부트 프로젝트를 패키징해준다. (pom.xml 설정파일에 의존성이 추가되어 있다.)

자바에는 내장 jar 를 로딩하는 표준적 방법은 없다. 따라서 같은 이름의 파일은 애플리케이션 클래스와 라이브러리의 경로를 구분한다.`org.springframework.boot.loader.jar.JarFile` 은 내장 jar를 읽고 `org.springframework.boot.loader.Launcher` 가 어플리케이션을 실행시킨다.















