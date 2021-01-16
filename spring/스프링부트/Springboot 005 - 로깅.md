# Springboot 005 - 로깅





## Logging Facade vs Logger



로깅 퍼사드를 사용하면 그 안에서 다양한 로거들을 사용할 수 있다.

Commons Logging, *SLF4J* (Simple Logging Facade for Java) 등이 있다. 스프링부트는 Commons Logging을 사용한다.

> Common Logging 은 Spirng-JCL을 통해서 slf4j 또는 log4j2로 바꿀 수 있다.

로거는 JUL, Log4J2, Logback 등이 있고 스프링부트는 기본적으로 Logback 을 사용한다.

어떤 로깅 퍼사드, 로거를 사용하든 결국 기본설정에서는 최종적으로 **Logback** 을 사용한다. 

(jul, log4j2 로거는 모두 slf4j 로 처리되어 결국 logback 을 사용하게 된다.)





<br />

**application.properties**

```shell
# 콘솔에서 로그를 칼라로 예쁘게 출력. (그런데 기본 설정 되어 있음.)
spring.output.ansi.enabled=always

# 로그를 지정한 경로에 파일로 남김. 기본경로는 프로젝트 최상단 폴더(file:). 아래와 같이하면 springproject/logs/spring.log 로 로그가 남는다.
logging.file.path=logs
# 파일로 출력하려면 아래와 같이하면 된다. (파일명 mylog)
# logging.file.name=mylog

# 로그레벨을 패키지별로 설정할 수 있음. TRACE > DEBUG > INFO > WARN > ERROR (오른 쪽일 수록 심각)
logging.level.co.wordbe.springgoman=DEBUG
# 스프링 프레임워크에서 디버그레벨의 로그를 찍는다.
# logging.level.org.springframework=DEBUG
```



<br />

slf4j 로 로그를 남겨보자.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
...
  
@Component
public class AppRunner implements ApplicationRunner {

    private Logger logger = LoggerFactory.getLogger(AppRunner.class);

    @Override
    public void run(ApplicationArguments args) throws Exception {
        logger.info("-----------------------------");
        logger.info("Simple Logging Facade for Java");
        logger.info("-----------------------------");
    }
}
```

sprinproject/logs/spring.log 에 로그가 남는다. (새로고침, Refresh 하면 빨리보인다.)





<br />

---

### 커스텀 로그 설정 파일

Logback 은 logback-spring.xml 을 사용한다.

Log4j2 는 log4j2-spring.xml,

JUL 은 logging.properties (추천하지 않는다.)



logback-spring.xml 파일을 사용한는 것을 추천하는데,profile 이나 환경변수를 사용할 수 있기 때문이다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <include resource="org/springframework/boot/logging/logback/console-appender.xml" />
    <include resource="org/springframework/boot/logging/logback/file-appender.xml" />

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>

    <logger name="co.wordbe" level="DEBUG"/>
</configuration>
```

일단 defaults.xml 을 리소스로 포함시켜야 한다. 변환 규칙, 패턴 속성, 공통 로거 설정을 포함하는 xml 설정 파일이다.

콘솔-어펜더로 콘솔에 로그가 나오게하고,

파일-어펜더로 파일에 로그를 저장하게 한다.

root 태그도 같이 달아주어야 한다.



마지막으로 `<logger>` 태그는 원하는 패키지에, 원하는 레벨로 로거를 등록할 수 있다.



<br />

**로거 설정**

로거를 기본 logback 이 아닌, log4j2 로 변경할 수 있다.

pom.xml 의 일부분을 아래와 같이 변경하고 추가해준다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <exclusions>
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>

<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```























