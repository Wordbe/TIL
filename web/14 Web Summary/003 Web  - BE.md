# 003 Web  - BE

# 1 JDK

* 실행만하는 사용자라면 JRE(Java SE Runtime Environment)만 설치해도 됨
* 개발자 입장에서는 JDK(Java SE Development Kit)을 설치(JRE 포함되어있음)하고 JAVA를 사용

### 환경변수

> * JAVA_HOME : JAVA가 설치된 경로를 지정
> * CLASSPATH : JAVA 클래스 경로를 지정
> * PATH(기존 OS에 존재) : JAVA 실행파일이 있는 경로 추가

**설치 확인**

```shell
$ java -version
$ javac -version
```

javac(java로 작성된 프로그램을 컴파일하는 프로그램)

**자바 파일 실행**

```shell
$ javac Hello.java
$ java Hello
```

---

# 2 Tomcat

* 웹 애플리케이션을 실행하기 위해 WAS가 필요
* WAS중 하나인 [Apache Tomcat](http://tomcat.apache.org/) 사용
* 그 외 WebLogic(BEA→Oracle, 미국), Jeus(Tmax, 한국) 등이 있음

**Web Server vs WAS**

![](https://gmlwjd9405.github.io/images/web/webserver-vs-was1.png)

<div style="text-align: center;"><em>출처 : https://gmlwjd9405.github.io/images/web/webserver-vs-was1.png</em></div>



---

# 3 Java Web Application

WAS에 배포(deploy)되어 동작하는 어플리케이션

> * JavaWebApplication/WEB-INF/web.xml (서블릿 3.0 미만에서 사용, 이상에서는 자바 annotation(`@WebServlet("url")`) 사용)
> * JavaWebApplication/WEB-INF/lib/*.jar
> * JavaWebApplication/WEB-INF/classes/*.java
> * JavaWebApplication/resources/(각종 폴더, 이미지, 다양한 리소스)

## Servlet

* 자바 앱 어플리케이션 구성요소 중 동적 처리 프로그램
* 서블릿은 WAS에 동작하는 JAVA 클래스
* `HttpServlet` 클래스 상속받아 사용
* JSP로 화면(HTML)구성, Servlet으로 복잡한 프로그래밍 구현

## Servlet Life Cycle

* Life Cycle(생명 주기) : 객체의 생명부터 소멸까지 이르는 과정
* `HttpServlet` 의 3가지 메소드 오버라이딩
  * `init()` : 서블릿 초기화 (리소스 로드)
  * `service(request, response)` : Accept requests, return responses
  * `destroy()` : 리소스 내보냄(unload)

## Request, Response

* WAS는 웹 브라우저로 Servlet 요청 받음
* HttpServletRequest, HttpServletReponse 객체를 생성하고, 웹 애플리케이션 안에 있는 서블릿에게 전달
* HttpServletRequest
  * http 프로토콜의 request정보를 서블릿에게 전달하기 위한 목적
  * **헤더정보, 파라미터, 쿠키, URI(URL)** 등 정보를 읽어들이는 메소드 가짐
  * Body의 Stream을 읽어 들이는 메소드 가짐
* HttpServletResponse
  * 클라이언트에게 응답을 보내기 위한 객체
  * 서블릿은 이 객체를 이용해서 **content type, 응답코드, 응답 메시지** 등을 전송















































































