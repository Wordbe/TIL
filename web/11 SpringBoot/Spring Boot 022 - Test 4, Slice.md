# Spring Boot 022 - Test 4, Slice

### 25.3.22 자동설정된 REST Clients

### 25.3.23 자동설정된 Spring REST Docs 테스트

Mock MVC, REST Assured, WebTestClient 에서 스프링 REST Docs 를 사용하기 위해`@AutoConfigureRestDocs` 를 쓰면 됩니다. JUnit 확장을 쓰지 않아도 됩니다.

`@AutoConfigureRestDocs` 는 기본 아웃풋 폴더를 오버라이드하는데 사용됩니다. (target/generated-snippets, Maven에서)

Mock MVC를 가지고 Spring REST Docs를 자동설정할 수 있습니다.

<br>

### 25.3.25 사용자 설정, 슬라이싱

합리적 방법으로 코드를 작성하고 싶다면, `@SpringBootApplication` 클래스가 기본적으로 사용될 수 있습니다.

Spring Batch, 자동설정을 사용하고 있다고 가정해봅시다. `@SpringBootApplication` 을 정의해봅시다.

```java
@SpringBootApplication
@EnableBatchProcessing
public class SampleApplication { ... }
```



위와 같이 작성하면, 테스트에 대한 소스설정이 이 클래스로 되기 때문에 모든 슬라이스 테스트는 사실상 Spring Batch를 시도하게 됩니다. 추천하는 방법은 같은 레벨의 `@Configuration` 클래스를 분리하는 area-specific  한 설정으로 바꾸는 것입니다.

```java
@Configuration(proxyBeanMethods = false)
@EnableBatchProcessing
public class BatchConfiguration { ... }
```

> 필요하면 `@Import`를 사용해서 여러 설정파일을 읽어올 수 있습니다.



테스트 슬라이스는 `@Configuration` 클래스를 스캐닝 할 때 배제합니다. 

다른 문제는 classpath scanning입니다. 따라서 클래스를 나누는 것이 도움이 됩니다.

<br>

## 25.4 Test Utilities

### 25.4.1 ConfigFileApplicationContextInitializer

### 25.4.2  TestPropertyValues

### 25.4.3 OutputCapture

​	JUnit Rule 확장

> output 캡쳐 보다는 logger 캡쳐가 더 실용적일 것 같다는 의견.
>
> 실제 System.out.println("Hello World!"); 로 디버깅하지 않고, 로거를 확인하기 때문

### 25.4.4 TestRestTemplate











---

**Reference**

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-testing-spring-boot-applications-testing-autoconfigured-jpa-test

https://www.youtube.com/watch?v=Tb0guL8hURs&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=22