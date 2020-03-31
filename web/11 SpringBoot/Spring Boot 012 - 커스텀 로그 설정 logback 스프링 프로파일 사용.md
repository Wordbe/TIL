# Spring Boot 012 - 커스텀 로그 설정 logback 스프링 프로파일 사용



## 4.6 Custom Log 설정

다양한 로깅 시스템은 classpath에 있는 적절한 라이브러리를 포함시켜 활성화시킬 수 있습니다. 루트 classpath 또는 `logging.config` 위치에 명시하여 적절한 설정을 커스터마이징 할 수 있습니다. 



`org.springframework.boot.logging.LoggingSystem` 에 원하는 시스템을 명시합니다. 그렇게 권장하진 않습니다. 



> 로깅은 `ApplicationContext` 가 생성되기 전에 초기화됩니다. 따라서 `@Configuration` 파일의 `@PropertySoruce`  로부터 로깅을 제어할 수는 없습니다. 로깅 시스템을 제어할 수 있는 유일한 방법은 시스템 property를 통해서 입니다.



| Logging System          | Customization                                                |
| :---------------------- | :----------------------------------------------------------- |
| Logback                 | `logback-spring.xml`, `logback-spring.groovy`, `logback.xml`, or `logback.groovy` |
| Log4j2                  | `log4j2-spring.xml` or `log4j2.xml`                          |
| JDK (Java Util Logging) | `logging.properties`                                         |

> 가능하면 `-spring` 를 이용해 이름을 짓는 것을 추천합니다. 예를 들면 `logback-spring.xml` 입니다. 표준 설정 위치를 사용하면, Spring은 완전히 로그 초기화를 할 수 없습니다.



**logback configuration 검색**

logback-spirng.xml

```xml
<configuration>

  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <!-- encoders are assigned the type
         ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>

  <root level="debug">
    <appender-ref ref="STDOUT" />
  </root>
</configuration>
```

level 을 debug 로 설정했고, 출력은 STDOUT (standard output)입니다.

출력을 보면 debug 레벨로 잘 출력되는 것을 볼 수 있습니다.

<br>

> 클래스 로딩 이슈가 있으므로 'executable jar'로 실행할 때는 Java Util Logging은 쓰지 않는 것을 권장합니다.

Logback이 성능이 좋고 spring 기본 값이니, Logback 사용을 권장합니다. 



Spring 환경에서 설정을 시스템 property에서도 쓸 수 있도록 변환된 폼을 제공합니다.

모든 지원 로깅 시스템은 System property를 참조할 수 있습니다. `spring-boot.jar`에 있는 기본 설정파일을 봅시다.

- [Logback](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/logback/defaults.xml)
- [Log4j 2](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/log4j2/log4j2.xml)
- [Java Util logging](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/java/logging-file.properties)



> Logback을 사용한다면 속성 이름 사이에 : 를 구분자로 사용합니다.

> `LOG_LEVEL_PATTERN`을 오버라이딩해서 MDC와 다른 ad-hoc 내용을 로그 라인에 추가할 수 있습니다.

---

## 4.7 Logback Extensions

`logback-spring.xml` 설정파일에서 확장을 사용하 수 있습니다.

> `logback.xml` 설정 파일은 너무 빨리 로딩되기 때문에, extension을 사용하기 어렵습니다. 그러므로 `logback-spring.xml` 을 사용하거나 `logging.conifg`에 정의합니다.

> Extension은 logbacks의 [configuration scanning](https://logback.qos.ch/manual/configuration.html#autoScan)을 사용할 수 없습니다. 

> configuration scanning: logback 설정이 바뀌면, 런타임시에도 애플리케이션을 껏다 킬 필요 없이 바로 적용됩니다.

<br>

### 4.7.1 프로파일에 따른 설정

`<springProfile>` 태그는 활성중인 스프링 프로파일에 있는 설정의 섹션을 선택적으로 포함 또는 배제 할 수 있게 합니다.

```xml
<springProfile name="staging">
    <!-- configuration to be enabled when the "staging" profile is active -->
</springProfile>

<springProfile name="dev | staging">
    <!-- configuration to be enabled when the "dev" or "staging" profiles are active -->
</springProfile>

<springProfile name="!production">
    <!-- configuration to be enabled when the "production" profile is not active -->
</springProfile>
```



예제)

**resources/logback-spring.xml**

```xml
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <!-- encoders are assigned the type
             ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="info">
        <appender-ref ref="STDOUT" />
    </root>

    <!-- dev env -->
    <springProfile name="dev">
        <logger name="org.springframework.boot" level="WARN" />
        <logger name="org.springframework.web" level="DEBUG" />
    </springProfile>

    <!-- prod env -->
    <springProfile name="prod">
        <logger name="org.springframework.*" level="info" />
    </springProfile>
</configuration>
```



**application.properties**

```properties
spring.profiles.active = prod
spring.profiles.active = dev
```

둘 다 테스트한 대로 잘 나오는 것을 확인할 수 있습니다.

<br>

### 4.7.2 Environment Properties

`<springProperty>`태그는 Logback 안에서 사용을 위해 스프링 `Environment` 으로부터 속성을 드러나도록(expose) 합니다.

```xml
<springProperty scope="context" name="fluentHost" source="myapp.fluentd.host"
        defaultValue="localhost"/>
<appender name="FLUENT" class="ch.qos.logback.more.appenders.DataFluentAppender">
    <remoteHost>${fluentHost}</remoteHost>
    ...
</appender>
```

Environment로부터 fluentHost라는 이름으로 context scope에 를 등록합니다.

> logback-spring.xml 의 source 는 kebab case (중간에 -를 사용) 로 명시되어야 합니다. 



---

**Reference**

https://www.youtube.com/watch?v=uVR2iBEb474&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=13&t=11s

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-custom-log-configuration