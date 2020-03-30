# Spring Boot 011 - 프로파일, 기본 로깅



## 3. Profiles

Spring 프로파일은 어플리케이션 설정의 일부를 분리하고, 특정 환경에서만 작동하게 만드는 방법을 제공합니다. `@Component`, `@Configuration`, `@ConfigurationProperties` 는 로드될 때 제한시키기 위해`@Profile`로 표시될 수 있습니다. 



```java
@Configuration(proxyBeanMethods = false)
@Profile("production")
public class ProductionConfiguration {

    // ...

}
```



`spring.profiles.active, Environment` 속성을 이용해서 무슨 프로파일이 활성화되었는지 정할 수 있습니다. 

* Command Line Argument (4순위)
* 시스템 환경 변수 (10순위)
* `application.properties`(14 outside, 15 inner 순위)

 등의 방법으로 설명된 속성을 명시할 수 있습니다.



예를 들면,

`application.properties` 에 속성 설정을 하거나,

```properties
spring.profiles.active=dev,hsqldb
```



command line 아규먼트로 속성을 정할 수 있습니다.

```shell
--spring.profiles.active=dev,hsqldb
```



예제)

`DevBean` 클래스가 "dev" 환경에서만 빈으로 등록되도록 해봅시다.

root package에 **DevBean.java** 작성

```java
package me.whiteship.hello;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevBean {

}
```

<br>

**application.java** 에 빈 주입

```java
@SpringBootApplication
public class Application {

    @Autowired
    DevBean devBean;
    ...
}
```



**application.properties**

```properties
spring.profiles.active=dev
```

또는

**command line**

```shell
$ mvn clean package
$ java -jar target\springbootday004-1.0-SNAPSHOT.jar --spring.profiles.active=dev
```

<br>

---

### 3.1 Active profile 추가하기

active profile을 `application.properties`에 추가할 수 있고, command line 스위치로 사용함으로서 대체할 수도 있습니다.

우선순위가 높은 설정 방법을 이용해서 우선순위를 바꿀 수 있습니다.

무조건적으로 활성 파일을 추가하려면 `spring.profiles.include` 속성을 이용할 수 있습니다. yml 파일에서 사용할 수 있습니다.

```yml
---
my.property: fromyamlfile
---
spring.profiles: prod
spring.profiles.include:
  - proddb
  - prodmq
```

<br>

---

### 3.2 프로그램적으로 프로파일 세팅

애플리케이션이 실행되기 전에 `SpringApplication.setAdditionalProfiles(…)` 를 이용해서 활성 프로파일을 설정할 수 있습니다. `ConfigurableEnvironment`를 통해서도 가능합니다.

---

### 3.3 Profile-specific 설정 파일

application.properties (또는 application.yml) 과 `@ConfigurationProperties` 로 참조된 파일은 프로파일을 명세할 수 있습니다. application-{profile}.properties 를 등록하면 됩니다.

<br>

<br>

---

## 4. Logging

Spring Boot는 [Commons Logging](https://commons.apache.org/logging) 을 사용합니다. 기본 제공 로깅은 [Java Util Logging](https://docs.oracle.com/javase/8/docs/api//java/util/logging/package-summary.html), [Log4J2](https://logging.apache.org/log4j/2.x/), and [Logback](https://logback.qos.ch/) 입니다.

로거(logger)는 미리 설정되어서 콘솔 출력으로 사용할 수 있습니다. 옵션으로 파일 출력이 가능합니다.

디폴트로 `Starters`를 사용하면, **Logback이 로깅으로 사용됩니다.** 적절한 로그백 라우팅은 의존성있는 라이브러리의 포함을 보장합니다.

Java Util Logging(jul), Commons Logging, Log4J, SLF4J 등의 다양한 로깅은 모두 slf4j로 변환되고, slf4j는 logback으로 전환하도록 도와 로깅이 잘 작동하도록 합니다.

<br>

### 4.1 Log 포맷

```shell
2019-03-05 10:57:51.112  INFO 45469 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/7.0.52
2019-03-05 10:57:51.253  INFO 45469 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2019-03-05 10:57:51.253  INFO 45469 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1358 ms
2019-03-05 10:57:51.698  INFO 45469 --- [ost-startStop-1] o.s.b.c.e.ServletRegistrationBean        : Mapping servlet: 'dispatcherServlet' to [/]
2019-03-05 10:57:51.702  INFO 45469 --- [ost-startStop-1] o.s.b.c.embedded.FilterRegistrationBean  : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
```

- Date and Time: Millisecond 정밀도, 손쉬운 정렬제공
- Log Level: `ERROR`, `WARN`, `INFO`, `DEBUG`, or `TRACE`.
- 프로세스 ID
- `---`  뒤에는 실제 에러메시지가 나옵니다.
- Thread name: [ ] (bracket)으로 둘러쌓여있습니다.
- Logger name: class name이거나, 줄여져 있습니다.
- 로그 메시지

> logback은 FATAL라는 레벨이 없고 대신 ERROR라고 맵핑이 됩니다.

---

### 4.2 Console 출력

기본적으로 레벨별로 로깅이 제공됩니다. 아래와 같이 debug 모드를 활성화 시킬 수 있습니다.

```shell
$ java -jar myapp.jar --debug
```

debug 모드가 활성화 되었을 경우, 코어 로거의 선택은 더 많은 정보를 나오게 설정합니다. 이 때 모든 메시지의 DEBUG 레벨을 출력하는 것은 아닙니다.

다른 방법으로는, trace 모드를 사용할 수 있습니다. (`--trace`) (또는  `application.properties`에서 `trace=true` ) 컨테이서 하이버네이트 스키마 생성, 전체 Spring 포트폴리오가 포함됩니다.

**trace로 해본 결과 매우 많은 로깅이 출력됩니다.**







### 4.2.1 칼라 출력

터미널이 [ANSI](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/api//org/springframework/boot/ansi/AnsiOutput.Enabled.html) 를 지원한다면, 칼라 출력이 가능합니다.

**application.properties**

```properties
spring.output.ansi.enabled = ALWAYS
```



---

### 4.3 파일 출력

기본적으로 스프링 부트는 console에만 로그를 남기고, 파일에 기록하지 않습니다. 로그 파일을 만들고 싶다면, `application.properties`에 `logging.file.name` 또는 `logging.file.path` 속성을 등록합니다.



| `logging.file.name` | `logging.file.path` | Example   | Description                                                  |
| :------------------ | :------------------ | :-------- | :----------------------------------------------------------- |
| *(none)*            | *(none)*            |           | Console만 로깅                                               |
| Specific file       | *(none)*            | `my.log`  | `my.log`파일이 현재경로에 생성됩니다.                        |
| *(none)*            | Specific directory  | `./logs/` | `spring.log` 파일이 현재 디렉토리 기준 상대경로(logs 폴더)에 저장됩니다.. |



<br>

로그파일은 10MB에 다다르면 회전합니다. `ERROR`레벨, `WARN`레벨, `INFO`레벨 메시지가 기본으로 로깅됩니다. 크기 제한은 `logging.file.max-size` 설정으로 바꿀 수 있습니다. 최근 일주일간의 회전되는 로그 파일은 기본적으로 유지됩니다. `logging.file.max-history` 속성으로 주기를 조절할 수 있습니다. 로그 저장소의 전체 크기는 `logging.file.total-size-cap`으로 설정할 수 있습니다. 이를 넘어가면 백업이 삭제됩니다. 저장소를 모두 지우려면 `logging.file.clean-history-on-start` 속성을 이용합니다.

> 로깅 속성은 실제 로깅 구조에 독립적입니다. 결과적으로 특정 설정 키(`logbaack.configurationFile` 등)는 spring boot에 의해 관리되지 않습니다.

<br>

### 4.4 Log Levels

모든 지원디는 로깅 시스템은 Spirng `Environment`에 설정된 로거 레벨을 가집니다.

**application.properties**

```properties
logging.level.root=warn
logging.level.org.springframework.web=debug
logging.level.org.hibernate=error
```



로거 레벨은 TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF 중에 하나를 고를 수 있습니다.



---

**Reference**

https://www.youtube.com/watch?v=h_VoxXhhNH0

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-logging