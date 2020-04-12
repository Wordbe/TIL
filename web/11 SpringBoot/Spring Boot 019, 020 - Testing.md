# Spring Boot 019, 020 - Testing

## 25. Testing

스프링 부트는 앱 테스트시 도움이되는 유틸리티와 어노테이션을 제공합니다. Test support는 두가지 모듈을 제공합니다.

* spring-boot-test
* spring-boot-test-autoconfigure

대부분 개발자는 `spring-boot-starter-test` Starter를 사용합니다. JUnit Jupiter, AssertJ, Hamcrest, 다양한 라이브러리를 가져옵니다.



### 25.1 Test Scope 의존성

Test scope 안의 `spring-boot-starter-test` 스타터는 아래 라이브러리를 포함합니다.

* [JUnit 5](https://junit.org/junit5) : 자바 어플리케이션의 단위 테스팅
* [Spring Test](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/testing.html#integration-testing) : 스프링 종합 테스트
* [AssertJ](https://joel-costigliola.github.io/assertj/) : aseertion
* [Hamcrest](https://github.com/hamcrest/JavaHamcrest) : matcher object
* [Mockito](https://mockito.github.io/) : java mocking(무시) 프레임워크, 유용함.
* [JSONassert](https://github.com/skyscreamer/JSONassert) : assertion
* [JsonPath](https://github.com/jayway/JsonPath) : XPath



### 25.2 Spring Application 테스트

Spring 관련 없이 new 연산자 사용해서 객체 초기화가 가능합니다. 테스트가 필요한 객체는 mock을 사용할 수 있습니다.

애플리케이션을 배포하지 않고도 종합 테스팅을 수행해 볼 수 있는 장점이 있습니다.



### 25.3 Spring Boot Application 테스트

스프링부트 애플리케이션은 Spring `ApplicationContext` 입니다.

> 외부 속성, 로깅, 다른 스프링 부트 특징은 `SpringApplication`을 생성할 때만 기본적으로 그 문맥안에서 설정됩니다.

`@SpringBootTest` 어노테이션을 제공합니다. `spring-test` 의 `@ContextConfiguration`어노테이션을 대체할 수 있습니다. 어노테이션은 `SpringApplication`을 통해 `ApplicationContext`를 생성함으로써 잘 작동합니다. 



`@SpringBootTest`는 서버를 시작하지 않습니다. `@SpringBootTest`의 webEnvironment 속성을 통해 아래 항목을 선택할 수 있습니다.

* `MOCK` : web `ApplicationContext` 를 불러오고, mock 웹 환경을 제공합니다. 만약 웹 환경이 classpath에서 이용불가능하면 이 모드는 실패해서 non-web `ApplicationContext`를 생성하게 됩니다.  [`@AutoConfigureMockMvc`](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-testing-spring-boot-applications-testing-with-mock-environment) 또는 `@AutoConfigureWebTestClient`와 같이 사용할 수 있습니다.
* `RANDOM_PORT` : `WebServerApplicationContext`를 롣하고, 실제 웹 환경을 제공합니다. 내장된 서버는 시작되고 임의 포트에서 listen합니다.
* `DEFINED_PORT` : RANDOM_PORT 에 추가하여, 80800 포트를 기본으로 listen 합니다.
* `NONE` : `SpringApplication` 을 사용함으로써 `ApplicationContext`를 로드합니다. 하지만 웹 환경은 제공하지 않습니다.

>테스트가 `@Transactional`이라면 기본적으로 각 테스트 메소드 끝마다 트랜잭션을 롤백합니다. 하지만 `RANDOM_PORT` 또는 `DEFINED_PORT` 와 사용하는 것은 묵시적으로 실제 서블릿 환경을 제공합므로, HTTP 클라이언트와 서버는 분리된 스레드에서 실행되고, 분리된 트랜잭션에 있게 됩니다. 서버에서 시작된 트랜잭션은 이 경우 롤백되지 않습니다.

<br>

### 25.3.1. Web Application Type 탐지

Spring MVC를 쓸 수 있다면, 일반 MVC 기반 application context가 설정됩니다. 

리액티브 웹 애플리케이션 테스트를 원하면, 아래와 같이 설정합니다.

```java
@SpringBootTest(properties = "spring.main.web-application-type=reactive")
class MyWebFluxTests { ... }
```

<br>

### 25.3.2 Test Configuration 탐지

Spring Framework에 익숙하다면, 무슨 `@Configuration` 을 불러올지 명시하기 위해`@ContextConfiguration(classes=…)`를 사용한다는 것을 알고 있을 것입니다. 테스트에서는 nested `@Configuration` 클래스가 종종 사용됩니다.

스프링 부트를 사용할 때는 이는 필요하지 않습니다. 명시적으로 정의하지 않았더라도 `@Test*` 어노테이션이 중요 설정을 자동적으로 검색해주기 때문입니다.

`@SpringBootApplication` 또는 `@SpringBootConfiguration` 으로 어노테이션된 클래스를 찾을 때까지 검색 알고리즘이 작동하게 됩니다. 실용적 방법으로 구조화된 코드를 구성하는 한 이 설정은 종종 발견됩니다.

> `@SpringBootApplication` 의 컴포넌트 스캔 설정은 쪼개진 작업을 확인하는 exclude 필터를 정의합니다. 명시적인 `@ComponentScan` 지시를 `@SpringBootApplication` 어노테이션 클래스에 사용하고 있다면, 그 필터들은 비활성화됩니다. 슬라이싱을 할 때는 이 필터들을 재정의 해주어야 합니다.

중요 설정을 커스터마이즈하려면 nested `@TestConfiguration` 를 사용할 수 있습니다. 

> Spring 테스트 프레임워크는 테스트 간 application context를 캐싱합니다. 따라서 테스트가 같은 설정을 공유하는 한 시간이 context가 로딩되는 소모되는 작업은 한 번만 일어납니다.

<br>

### 25.3.3 Test Configuration 배제

Top 레벨 클래스에 위치해 있을 때, `@TestConfiguration` 는 `src/test/java` 안 클래스가 스캐닝에 의해 골라지지 않도록 지시합니다. 이 때 필요한 클래스를 명시적으로 import 할 수 있습니다.

```java
@SpringBootTest
@Import(MyTestsConfiguration.class)
class MyTests {

    @Test
    void exampleTest() {
        ...
    }

}
```

>`@SpringBootApplication` 를 통해서가 아닌`@ComponentScan` 를 직접적으로 사용하려면, `TypeExcludeFilter` 를 등록해야 합니다.



---

### 25.3.4 Application Arguments 사용

`@SpringBootTest` 에서 `args` 속성을 주입할 수 있습니다.

```java
@SpringBootTest(args = "--app.test=one")
class ApplicationArgumentsExampleTests {

    @Test
    void applicationArgumentsPopulated(@Autowired ApplicationArguments args) {
        assertThat(args.getOptionNames()).containsOnly("app.test");
        assertThat(args.getOptionValues("app.test")).containsOnly("one");
    }
}
```

<br>

### 25.3.5 Mock 환경 테스트

기본값으로 `@SpringBootTest`는 서버를 시작하지 않습니다. 이 mock 환경에 대해 테스트하고 싶은 웹 endpoint 가 있다면, `MockMvc`를 추가로 설정할 수 있습니다.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class SampleControllerTest {

    @LocalServerPort
    int port;

    @Autowired
    MockMvc mockMvc;

    @Test
    public void testFoo() throws Exception {
        System.out.println("스프링 부트 테스트");
        System.out.println("================= PORT ================");
        System.out.println(port);

        mockMvc.perform(get("/foo"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello"))
                .andDo(print());
    }
}
```



<br>

### 25.3.6 실행서버 테스트

모든 실행 서버를 시작하려면, 랜덤 포트를 사용하는 것을 권장합니다. `@SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)` 를 이용하면, 테스트를 실행할 때마다 랜덤으로 가용한 포트가 골라집니다.

`@LocalServerPort` 어노테이션은 테스트에 사용된 실제 port를 주입시키는 데 사용될 수 있습니다. 편의를 위해, REST call이 시작되도록 해야하는 테스트는 `@Autowired`로 `WebTestClient`를 추가할 수 있습니다. 상대 링크를 실행 서버로 묶어주고(resolve), 응답을 검증하는 dedicated API 을 찾아냅니다. 

* `@LocalServerPort`는 Spring WebFlux 에서 가능합니다.

WebFlux 추가를 원하지 않으면, `TestRestTemplate` 을 사용할 수 있습니다.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class SampleControllerTest {

    @Autowired
    TestRestTemplate testRestTemplate;

    @Test
    public void testFooWithRestTemplate() {
        String body = this.testRestTemplate.getForObject("/foo", String.class);
        assertThat(body).isEqualTo("Hello");
    }
}
```



> @SpringBootTest : MVC, webflux 둘 다 가능
>
> @WebMvcTest : Mock 만 이용가능
>
> @WebFluxTest : WebTestClient 만 이용가능
>
> TestRestTemplate 은 둘 다에서 테스트 실행 가능





**webflux 기반 테스트 예시)**

**pom.xml** > webflux 추가

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
    <version>2.2.6.RELEASE</version>
</dependency>
```

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class SampleControllerTest {
    @Autowired
    WebTestClient webTestClient;

    @Test
    public void testFooWithWebTestClient() {
        webTestClient.get().uri("/foo").exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo("Hello");
    }
}
```

<br>

### 25.3.9 Mocking and Spying Beans

테스트 실행할 때, application context 안의 특정 컴포넌트를 무시(mock)할 필요가 있습니다. 

스프링 부트는 `ApplicationContext` 안의 beand을 위한 Mockito mock을 정의하는 `@MockBean` 어노테이션을 포함합니다. 테스트에서도 바로 사용 가능하며, `@Configuration` 클래스, 필드에서도 사용 가능합니다. 필드에서 사용할 경우 생성된 mock의 인스턴스는 주입됩니다. Mock beans은 테스트 메소드 실행 후 자동적으로 리셋됩니다.

> 테스트가 Spring Boot 테스트 어노테이션(`@SpringBootTest` 등)을 사용한다면,  이 특징은 자동적으로 활성화 됩니다. 특징을 다른 배치안에서 사용하려면 listener 는 반드시 명시적으로 추가되어야 합니다.
>
> ```java
> @TestExecutionListeners(MockitoTestExecutionListener.class)
> ```

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.*;
import org.springframework.boot.test.mock.mockito.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@SpringBootTest
class MyTests {

    @MockBean
    private RemoteService remoteService;

    @Autowired
    private Reverser reverser;

    @Test
    void exampleTest() {
        // RemoteService has been injected into the reverser bean
        given(this.remoteService.someCall()).willReturn("mock");
        String reverse = reverser.reverseSomeCall();
        assertThat(reverse).isEqualTo("kcom");
    }
}
```



* MockBean 으로 만든 객체의 기본값은 null





---

**Reference**

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-testing