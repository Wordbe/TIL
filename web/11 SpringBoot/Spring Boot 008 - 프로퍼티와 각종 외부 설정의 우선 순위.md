# Spring Boot 008 - 프로퍼티와 각종 외부 설정의 우선 순위



## 2. 외부 설정(Externalized Configuration)

Spring Boot는 현재 설정을 밖으로 내보낼 수 있어서, 이를 통해 다른 환경에서 같은 설정을 구현할 수 있습니다. 

* properties files
* YAML files
* 환경 변수
* 명령줄 아규먼트



Spring Boot는 `PropertySource` 순서를 따르며 설정 파일 우선순위를 정할 수 있습니다.

1. devtools 이용시`$HOME/.config/spring-boot` 폴더 안에서 Devtools 전역 설정 속성
2. `@TestPropertySource`
3. `@SpringBootText`
4. 명령줄 아규먼트
5. `SPRING_APPLIATION_JSON` 으로부터의 속성
6. `ServiceConfig`
7. `ServletContext`
8. `java:comp/env`
9. `System.getProperties()`
10. OS 환경변수
11. `RandomValuePropertySource`
12. `application-{profile}.properties` 의 밖 속성
13. `application-{profile}.properties` 의 안에 패키징된 속성
14. `application.properties` 밖 속성
15. `application.properties` 안 속성
16. `@Configuration` 클래스의 `@PropertySource`
17. `SpringApplicatioin.setDefaultProperties`의 기본 속성



**예제)**

```java
import org.springframework.stereotype.*;
import org.springframework.beans.factory.annotation.*;

@Component
public class MyBean {

    @Value("${name}")
    private String name;

    // ...

}
```

`application.properties` 로 속성을 설정해봅니다.

`java -jar app.jar --name="Spring"` : 4순위인 커맨드 라인 아규먼트 속성을 설정해봅니다.

<br>

**resources/application.properties**

```properties
name=seongho
```



**hello/HelloService.java**

```java
package me.whiteship.hello;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class HelloService {

    @Value("${name}")
    String name;

    public String getMessage() {
        return "Hello Service On, " + name;
    }
}

```

메이븐을 빌드하고, jar 파일을 실행시킵니다.

그러면 application.properties 에서 설정한 name 이 등장합니다.



하지만, 커맨드 라인에 아래와 같이 아규먼트를 추가하면 그 아규먼트 값이 우선순위로 나오게 됩니다.

```shell
$ java -jar target\springbootday004-1.0-SNAPSHOT.jar --name=JIN
```

<br>

한 가지 실험을 더 해봅시다.

```shell
$ java -jar -Dname=system-property-name target\springbootday004-1.0-SNAPSHOT.jar --name=argument-name
```

-Dname으로 입력하면 system property (우선순위 9) 이고,

뒤에 --name으로 입력하면 command line argument (우선순위 4) 입니다.

따라서 --name 값으로 덮여쓰기가 됩니다.



> `SPRING_APPLICATION_JSON` 속성은 환경변수와 함께 명령줄에서 지원됩니다.
>
> ```shell
> $ SPRING_APPLICATION_JSON='{"acme":{"name":"test"}}' java -jar myapp.jar
> ```
>
> 위와 같이 사용할 수 있습니다.

<br>

### 2.1 임의 값 설정

`RandomValuePropertySource` 는 임의 값을 주는 데 유용합니다.

**application.properites**

```properties
my.secret=${random.value}
my.number=${random.int}
my.bignumber=${random.long}
my.uuid=${random.uuid}
my.number.less.than.ten=${random.int(10)}
my.number.in.range=${random.int[1024,65536]}
```

<br>

### 2.2 명령줄 속성 접근

`SpringApplication`은 명령줄 옵션 아규먼트를 `property`로 전환한 후 Spring `Enviornment`에 추가합니다.

`Enviornment`에 추가하기 원하지 않으면, `SpringApplication.setAddCommandLineProperties(false)`를 사용하여 비활성화 할 수 있습니다.

<br>

### 2.3 애플리케이션 속성 파일

`SpringApplication`은 아래 위치에 있는 `application.properties`로부터 속성을 불러온 후, `Enviornment`에 추가합니다.

1. 현재 폴더의 `/config` 하위 폴더
2. 현재 폴더
3. classpath `/config` 패키지
4. classpath 루트

(높은 우선 순위대로 정리되어있습니다.)



현재폴더 안에 application.properties를 만들고

```properties
name=whiteship
```

을 입력합니다. jar파일을 실행시키면, 이 값이 우선순위가 되는 것을 볼 수 있습니다.

<br>

> 시스템 속성보다 환경변수를 사용하면, 대부분 운영체제는 주기적으로 나눠진 키 이름을 허락하지 않습니다. 이럴 때는 `spring.config.name`가 아닌 `SPRING_CONFIG_NAME`를 사용합니다.

<br>

### 2.4 Profile-specific Properties

여러 프로파일이 명시되면, 마지막 이긴(얻은) 전략(strategy)이 적용됩니다.

<br>

예제

**appllication-A.properties**

```properties
name=A
```



**appllication-B.properties**

```properties
name=B
```



**appllication.properties**

```properties
...
spring.profiles.active=A, B
```

실행 시키면, 뒤에 적은 B가 나타나게 됩니다.

<br>

### 2.5 속성에서 Placeholders

**application.properties**

```properties
foo=why...
name=seongho ${foo}
```

위와 같이 변수처럼 사용할 수도 있습니다.



>존재하는 Spring Boot 속성의 짧은 변수를 생성할 수도 있습니다.



---

**Reference**

https://www.youtube.com/watch?v=jv50m3yOemU

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config