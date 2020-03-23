# Spring Boot 004 - Configuration

Spring Boot 003 내용과 이어집니다.



### 3.2 XML Configuration

**resources/application.xml** 에 Bean 을 설정해서 UserService를 등록해봅시다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="userService" class="me.whiteship.user.UserService" />

</beans>
```



main 메서드가 있는 클래스 위에 `@ImportResource("application.xml")`를 설정해주면, 성공적으로 bean을 찾을 수 있습니다.



---

### 4 Auto-Configuration

`@SpringBootApplication` 은 jar 의존성에 근거해서 자동으로 스프링 application을 설정할 수 있습니다. 아래 3개를 포함하고 있습니다.

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
```



>`@EnableAutoConfiguration`은 주 클래스 하나만 붙이는 것을 권장합니다. >> `@SpringBootApplication`을 붙이면 됩니다.

이제 `@ImportResource("application.xml")` 대신 `@SpringBootApplication`를 사용하겠습니다.

<br>

### 4.1 점차적으로 Auto-configuration을 대체

어느 순간이 되면, configuration을 직접 고쳐야 할 것입니다. 예를 들어 `DataSource` bean을 추가한다면, 예전에 추가했던 `HSQLDB`가 내장된 데이터베이스는 더이상 작동하지 않을 것입니다.

`--debug` 스위치와 함께 앱을 실행하면, 무슨 자동설정이 현재 적용되어 있는지, 왜 그런지 알 수 있습니다. debug 로그가 활성화 됩니다.



```shell
$ mvn package
$ java -jar target/spring-boot-day001-0.0.1-SNAPSHOT.jar --debug
```

콘솔에 condition 리포트를 로깅해준 것을 확인할 수 있습니다.



>  application.xml을 제거하고 하려면, xml을 제거하고, `mvn clear` 명령으로 target 디렉토리에 만들어진 xml 정보도 삭제해줍니다.



<br>

### 4.2 특정 자동설정 클래스를 비활성화

`exclude=`를 사용해서 비활성화 하고 싶은 클래스를 고를 수 있습니다.

```java
@EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class})
```



exclude는 `@EnableAutoConfiguration` 에도 있지만, 이 것을 포함하고 있는 `@SpringBootApplication` 의 파라미터에도 있습니다.

또한 `spring.autoconfigure.exclude` property에서도 비활성화가 가능합니다.

> 위와 같은 방법으로 annotation에서도 비활성화 시킬 수 있고, 또 다른 방법으로는 resources/property 에서 설정하여 비활성화 할 수도 있습니다.

<br>



---

## 5. Spring Bean 과 의존성 주입

Spring 에서는 Bean을 찾기 위해`@ComponentScan`, 생성자 주입을 위해 `@Autowired`를 사용합니다. 

또한 root 패키지 안에 어플리케이션을 위치시키는 규칙을 지킨다면, `@ComponentScan`은 아규먼트 없이 잘 작동합니다. 모든 어플리케이션 컴포넌트(@Component`, `@Service`, `@Repository`, `@Controller)도 자동적으로 Spring Bean 으로 잘 등록됩니다.

```java
package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DatabaseAccountService implements AccountService {

    private final RiskAssessor riskAssessor;

    @Autowired
    public DatabaseAccountService(RiskAssessor riskAssessor) {
        this.riskAssessor = riskAssessor;
    }

    // ...

}
```



bean이 생성자가 하나있으면, `@Autowired`를 생략할 수 있습니다. (하지만, 모든 사람들이 이해하려면 명시적 방법이 좋은 것 같습니다.)



---

### Application Example

intelliJ 실습

새 프로젝트 생성 > artifactId : springbootday004

**src/main/java/me.whiteship/Application.java**

```java
package me.whiteship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Application {

    @RequestMapping("/")
    public String hello() {
        return "Hello";
    }
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

```



**src/main/java/me.whiteship/user/UserSerivce.java**

```java
package me.whiteship.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserRepository getUserRepository() {
        return userRepository;
    }
}

```



**src/main/java/me.whiteship/user/UserRepository.java**

```java
package me.whiteship.user;

import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
}

```



**src/test/java/me.whiteship/ApplicationTest.java**

```java
package me.whiteship;

import me.whiteship.user.UserService;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ApplicationText {
    @Autowired
    UserService userService;

    @Test
    public void testDI() {
        Assert.assertNotNull(userService);
        Assert.assertNotNull(userService.getUserRepository());
    }
}

```



실행.



### 6. `@SpringBootApplication` 사용하기

```
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
```

위 어노테이션은 자주 사용하기 때문에, 스프링 부트에서는 @SpringBootApplication 에 묶어 놓았습니다. 물론 들어가보면, filter 등 조금 다른 구조가 되어 있긴 합니다.



### 7. Application 실행

스프링부트는 내장된 HTTP 서버를 사용하고, jar 로 패키징 된 어플리케이션을 다룰 수 있는 장점이 있습니다.



### IDE 에서 실행하기

프로젝트를 import 하면 됩니다. (eclipse IDE)

> 스프링부트 유저는 run 버튼이 아닌, relaunch 버튼을 눌러 "Port already in use" 에러를 해결할 수 있습니다.



### 패키지된 어플리케이션 실행

maven 빌드 후

```shell
$ java -jar target/myapplication-0.0.1-SNAPSHOT.jar
```



```shell
$ java -Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n \
       -jar target/myapplication-0.0.1-SNAPSHOT.jar
```

원격으로, 내 로컬에서 실행 중인 스프링 부트 애플리케이션을 디버그 할 수 있습니다.

<br>



### Maven 플러그인 사용

```shell
$ mvn spring-boot:run
```

또한 운영체제 환경변수 `MAVEN_OPTS`를 사용하고 싶으면 아래와 같이 입력합니다.

```shell
$ export MAVEN_OPTS=-Xmx1024m
```



### Hot Swapping

JVM 이 제공하는 hot-swapping이 제한적으로 작동합니다. 

`spring-boot-devtools`를 사용하면, 빠른 어플리케이션 재시작을 지원할 수 있습니다.

<br>



## 8. Developer Tools

`spring-boot-devtools`를 이용할려면, 메이븐을 사용하는 경우 아래 의존성을 삽입해주면 됩니다.

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```



> Devtools는 패키지 어플리케이션 실행에서는 자동으로 비활성화됩니다. `java -jar`로 실행을 하면, 프로덕션 모델이라 생각하고 개발 모델은 배제합니다. Maven 에서 `optional` 의존성을 주면, 현재 프로젝트를 사용중인 다른 모듈에게 타의적으로 적용되지 않습니다. 하지만 Gradle은 optional, provided scope 등을 지원하지 않습니다.



> 리패키지된 저장소는 기본으로 devtools를 포함하지 않습니다. 쓰고싶은 기능이 있으면 `excludeDevtools`를 비활성화 해야 합니다.





---

**Reference**

https://www.youtube.com/watch?v=jftcS1BQ_0g&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=4

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/using-spring-boot.html#using-boot-using-springbootapplication-annotation