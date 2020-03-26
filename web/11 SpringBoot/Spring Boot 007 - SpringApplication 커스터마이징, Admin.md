# Spring Boot 007 - SpringApplication 커스터마이징, Admin



## 1.7 웹 환경

`SpringApplication` 은 사용자 대신 `ApplicationContext`의 적절한 타입을 생성합니다.

`WebApplicationType`은 다음 룰로 정해집니다.

* Spring MVC가 존재하면 `AnnotationConfigServletWebServerApplicationContext`를 사용
* Spring MVC가 존재하지 않고, Spring WebFlux가 존재하면 `AnnotationConfigReactiveWebServerApplicationContext` 를 사용
* 그렇지 않으면, `AnnotationConfigApplicationContext`를 사용합니다.



예를 들어 Reactive 타입의 웹 앱을 적용하려면 아래와 같이 입력합니다.

```java
public static void main(String[] args) {
    SpringApplication application = new SpringApplication(Application.class);
    application.setWebApplicationType(WebApplicationType.REACTIVE);
    application.run(args);
}
```

<br>

### Application 아규먼트 접근

아규먼트를 사용해 스프링 부트를 실행하고 싶다면, `org.springframework.boot.ApplicationArguments` 를 `SpringApplication.run(…)`에 주입할 수 있습니다.

>  `@Value` 어노테이션으로 단일 어플리케이션 아규먼트를 주입할 수 있습니다.



**예제**

**hello/HelloService.java**

```java
package me.whiteship.hello;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HelloService {

    @Autowired
    ApplicationArguments arguments;

    /**
     * --hello=Hello --hello=World => ["Hello", "World"] => "Hello, World"
     * @return
     */
    public String getMessage() {
        List<String> helloValues = arguments.getOptionValues("hello");
        return helloValues.stream().collect(Collectors.joining(", "));
    }
}

```

그 후 main 메서드를 실행해봅시다. 콘솔에 argument를 입력해야 하니, `java -jar`로 실행합니다.

```shell
$ mvn package
$ java -jar target\springbootday004-1.0-SNAPSHOT.jar --hello=Hello --hello=World
```

웹페이지에 Hello, World 가 출력됩니다.

<br>

`@Value` 예제도 만들어봅니다.

```java
package me.whiteship.hello;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HelloService {

    @Autowired
    ApplicationArguments arguments;

    @Value("${hello}")
    String[] helloValues;
    
    @Value("${foo}")
    String fooValue;

    /**
     * --hello=Hello --hello=World => ["Hello", "World"] => "Hello, World"
     * @return
     */
    public String getMessage() {
        String collect = Arrays.stream(helloValues).collect(Collectors.joining(", "));
        collect += " " + fooValue;
        return collect;
    }
}
```

```shell
$ mvn package
$ java -jar target\springbootday004-1.0-SNAPSHOT.jar --hello=Hello --hello=World --foo=bar
```

실행이 잘 되는 것을 볼 수 있습니다.





<br>

### 1.9 ApplicationRunner 또는 CommandLineRunner

위와 기능은 같지만, ApplicationRunner 는 ApplicationArguments 를 사용하는 반면, CommandLineRunner는 string을 아규먼트로 받습니다. 



**첫번째, 두번째 ApplicationRunner을 실행시켜보는 예제**

**ApplicationRunnerFirst.java**

```java
package me.whiteship;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class ApplicationRunnerFirst implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("first runner");
    }
}
```

**ApplicationRunnerSecond.java**

```java
package me.whiteship;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class ApplicationRunnerSecond implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("Second");
    }
}

```

실행

<br>



### 1.10 Application Exit

`SpringApplication` 은 후처리 라이프사이클을 다 실행한 후에, 잘 종료될 수 있도록 shutdown hook을 JVM에 등록합니다. 따라서 `ApplicationContext`는 잘(gracefully) 종료될 수 있습니다.

`SpringApplication.exit()`이 호출되었을 때, 특정 코드를 리턴하고 싶으면 Bean에서 `org.springframework.boot.ExitCodeGenerator`를 구현할 수 있습니다.



또한 `ExitCodeGenerator` 인터페이스는 exception 상황에서도 구현될 수 있습니다.

Spring Boot는 `getExitCode()` 메소드를 제공합니다.

<br>

### 1.11 Admin Features

관리자 관련(admin-related) 특징을 활성화 하려면 `spring.application.admin.enabled` 프로퍼티를 true로 설정하면 됩니다.

어떤 HTTP 포트에서 애플리케이션이 실행되는지 알고 싶으면, `local.server.port` 의 키를 가진 프로퍼티를 얻어오면 됩니다.

서버를 실행시키고 터미널에 jconsole을 입력하면, 서버를 모니터링 할 수 있습니다.

```shell
$ jconsole
```

![](https://i.ibb.co/0sVbDbY/image.png)



강제 종료도 할 수 있습니다.

Mbean > admin > SpringApplication > Operation > shutdown

![](https://i.ibb.co/Hp2jbTr/image.png)





---

**Reference**

https://www.youtube.com/watch?v=8fK1tA7C6Ss

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-command-line-runner