# Spring Boot

본 글은 [Spring Boot 공식 문서](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/index.html) 를 참고하였습니다.



## Introduction

Spring 은 처음 세팅이 상당히 고단합니다.

스프링 부트도 아주 쉬운 것은 아니지만, 그래도 `java -jar`로 쉽게 Spring configuration을 설정할 수 있고, 빨리 프로젝트를 시작할 수 있습니다.

이 글을 다 읽으시면, Spring boot를 통해 Hello World 가 보여지는 페이지를 서버에 띄우실 수 있는데, 방법이 참 간단합니다.



스프링 부트의 목표:

* 모든 Spring 개발에 있어서 빠르고, 범용적으로 적용가능한 시작 환경을 제공
* 코드 생성 없이, XML 설정 필요없이 작동하기 용이하게 함

<br>

## System 필요사항



#### 1) Java

Spring Boot 2.2.4.RELEASE 기준으로, **Java 8** 이상 필요.

**확인**

```shell
$ java -version
```

**Java SDK v1.8** 이상이면 spring boot 가 사용가능합니다.



#### 2) Build Tool

빌드 툴은 Maven 은 3.3+ 이상이며, Gradle을 사용하실 경우는 아래 버전에 해당하시면 됩니다.

| Build Tool | Version     |
| :--------- | :---------- |
| Maven      | 3.3+        |
| Gradle     | 5.x and 6.x |



#### 3) Servlet 컨테이너

| Name         | Servlet Version |
| :----------- | :-------------- |
| Tomcat 9.0   | 4.0             |
| Jetty 9.4    | 3.1             |
| Undertow 2.0 | 4.0             |





## 설치

1)  [Java SDK v1.8](https://www.java.com/) 이상 버전을 설치합니다.

2) Maven (여기서는 Gradle이 아닌, Maven 사용)

>  스프링부트 파일을 복사해서 사용해도 되지만, Maven 또는 Gradle 을 이용하는 것을 권장합니다.

​	**Mac :** `brew install maven`

​	**Ubuntu :** `sudo apt-get install maven`

​	**Windows :** `choco install maven`

		* 윈도우 유저의 경우 power shell 에서 [Chocolatey](https://chocolatey.org/) 라는 패키지 매니저를 사용하여 `choco` 키워드를 이용하면 설치가 편리합니다.



### Maven

`pom.xml`파일로 의존성 등의 정보를 설정합니다.

spring-boot-starter 로 시작하는 라이브러리가 많고, 자주 사용하게 될 것입니다.



**intelliJ > new project > maven 프로젝트 생성** > artifactId : spring-boot-day001

**pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>myproject</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <!-- Inherit defaults from Spring Boot -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.4.RELEASE</version>
    </parent>

    <!-- Override inherited settings -->
    <description/>
    <developers>
        <developer/>
    </developers>
    <licenses>
        <license/>
    </licenses>
    <scm>
        <url/>
    </scm>
    <url/>

    <!-- Add typical dependencies for a web application -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <!-- Package as an executable jar -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```



> `spring-boot-starter-parent` 는 스프링부트를 사용하는 유용한 방법입니다. 하지만, 다른 POM 으로부터 상속받고 싶다면, `import` scope을 이용하는 [using-spring-boot.html](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/using-spring-boot.html#using-boot-maven-without-a-parent) 를 사용하는 방법도 있습니다.



pom.xml 을 바꾸어 주었으면, 관련 패키지를 설치해줍니다.

프로젝트 경로로 들어가서, 아래 명령을 실행합니다.

```
$ mvn package
```



<br>

---

## 'Hello World' Application 만들어보기



* 프로젝트를 생성하기 쉽도록, 통합 개발 환경(IDE)는 [intelliJ](https://www.jetbrains.com/ko-kr/idea/)를 이용했습니다.

* 위 메이븐 설치에서 pom.xml 수정까지 한 단계에서 시작해봅니다.



* `src/main/java/Example.java` 파일을 생성합니다.

```java
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.web.bind.annotation.*;

@RestController
@EnableAutoConfiguration
public class Example {

    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }

    public static void main(String[] args) {
        SpringApplication.run(Example.class, args);
    }

}
```





아래 있는 어노테이션들은 **_stereotype_ annotation** 이라고 합니다. 마킹을 하는 역할로, 코드가 무슨 역할을 하는지 개발자 뿐 아니라 Spring 이 이를 알아챌 수 있게 도와줍니다.

```java
@RestController
@Controller
@Repository
@Service
@Component
```



@RequestMapping은 `"/"` (루트) 경로로 접근했을 때, home 메소드에 이어지도록 매핑을 합니다.

@RestController와 @RequestMapping은 Spring MVC 에서 제공하는 Annotation입니다.



@EnableAutoConfiguration 은 Spring Boot 어노테이션입니다.

	- classpath 의 의존성을 스프링 부트가 자동적으로 잘 정의해주도록 도와줍니다. 
	- Starter 과 잘 어울리도록 설계되어 있지만, tight하게 묶여있는 것은 아닙니다.



#### main method 실행

**방법 1:** 우클릭 후 자바 메인 메서드를 실행시킵니다.

**방법 2:** 터미널에 아래와 같이 입력합니다.

```
$ mvn spring-boot:run
```



localhost:8080 에 들어가시면 Hello World! 라고 적힌 문구를 보실 수 있습니다.





---

**Reference**

* 스프링 부트 2.0 Day 1. 스프링 부트 시작하기 - 백기선 https://www.youtube.com/watch?v=CnmTCMRTbxo&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=2&t=756s

* https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/getting-started.html#getting-started