# Springboot 021 - Actuator



Actuator 는 스프링부트 운영 중 유용한 기능을 제공한다. 엔드포인트, 메트릭스, 모니터링 기능 등을 알아보자.



## Endpoint

아래 ID에 해당하는 모듈들이 모두 **활성화** 된다.(shutdown 제외)

* auditevents : 인증 정보 등록
* beans : 빈들
* conditions : 자동 설정 여부와 이유
* configprops : application.properties 에 정의 가능한 프로퍼티들
* env : 스프링 environment 를 등록
* flyway : 마이그레이션 정보
* liquibase : 마이그레이션 정보
* health : 애플리케이션의 정상 가동 유무
* httptrace : 최근 100개 HTTP 요청/응답
* info : application 관련 된 임의 정보
* loggers : 패키지 로깅 레벨, 운영 중 로깅 레벨 수정 가능
* metrics : 현재 애플리케이션 제 3의 모니터링을 위한 공통 포맷, 수치 넘으면 알람 기능 설정 가능
* mappings : 컨트롤러 매핑 정보
* scheduletasks : 배치 정보 등
* sessions : 세션 관련
* threaddump : 쓰레드 덤프
* shutdown : **비활성화** 되어있음, 애플리케이션 최적의 종료기능 제공

web application (Spring MVC, WebFlux, Jersey 등) 이라면 추가 엔드포인트 제공

* headdump : 헤드덤프 `hprof` 압축파일(GZip)
* jolokia : JMX (Java Management Extensions) Bean 이 HTTP에서 제공
* logfile : 로그파일
* prometheus : metric 정보를 프로메테우스 서버에서 사용가능한 포맷으로 제공



활성화와 공개여부(expose)는 따로 구분되어 있다. 위 엔드포인트 중 JMX 의 경우는 대부분 다 공개가 되어있지만, 웹(HTTP 를 사용할 때)은 공개된 정보가 health와 info 만 있다. 보안을 위함이다.

[http://localhost:8080/actuator](http://localhost:8080/actuator/) 에서 확인할 수 있다. HATEOAS 규약을 잘 맞추어서 self 에대한 하이퍼링크가 담겨있다.

위 주소를 요청하면 서버는 아래 json 응답을 내보낸다.

```json
{
  "_links": {
    "self": {
      "href": "http://localhost:8080/actuator",
      "templated": false
    },
    "health-path": {
      "href": "http://localhost:8080/actuator/health/{*path}",
      "templated": true
    },
    "health": {
      "href": "http://localhost:8080/actuator/health",
      "templated": false
    },
    "info": {
      "href": "http://localhost:8080/actuator/info",
      "templated": false
    }
  }
}
```

이런 기본 엔드포인트(health, info) 정보는 공개가 되어 있다.

<br />

* JConsole (JMX)

```shell
$ jconsole
```

작은 툴박스가 나오는데, 다양한 엔드포인트를 확인, 제어할 수 있다.



* VisualVM

visualvm 을 다운받아 실행한다. JMX와 비슷하지만 더 큰화면에 예쁘고 깔끔한 화면을 제공한다.



* HTTP 사용

웹 브라우저로 볼 수도 있다. 그런데 눈으로보기 상당히 힘들다. 공개로 한 순간 외부에서 볼 수도 있으니 해당 페이지들은 스프링 시큐리티로 막아놓는 것이 좋다.



application.properties

```shell
# Enpoint 모두 공개
management.endpoints.web.exposure.include=*

# 예) env, beans 는 공개 제외
management.endpoints.web.exposure.exclude=env,beans
```



[http://localhost:18080/actuator/conditions](http://localhost:18080/actuator/conditions) 등으로 json 정보를 볼 수 있다.



<br />

---

## Spring-Boot-Admin



스프링 부트 Actuator에 대한 깔끔한 UI 를 제공하는 어플리케이션이다.

먼저 인텔리제이 새 프로젝트를 열어서 어드민 서버를 띄워야 한다.

pom.xml

```xml
<dependency>
  <groupId>de.codecentric</groupId>
  <artifactId>spring-boot-admin-starter-server</artifactId>
  <version>2.3.1</version>
</dependency>
```

메인 애플리케이션 클래스 위에는 `@EnableAdminServer` 어노테이션을 붙이면 된다.

<br />

클라이언트에서는 아래 의존성을 추가한다.

pom.xml

```xml
<dependency>
  <groupId>de.codecentric</groupId>
  <artifactId>spring-boot-admin-starter-client</artifactId>
  <version>2.3.1</version>
</dependency>
```

그리고 어플리케이션 프로퍼티에 아래를 추가한다.

```shell
# actuator 모든 endpoint 를 공개한다.
management.endpoints.web.exposure.include=*

# admin server url을 등록한다.
spring.boot.admin.client.url=http://localhost:8080

# 서버와 포트가 겹치므로, 클라이언트 url을 18080으로 바꿔준다.
server.port=18080
```









