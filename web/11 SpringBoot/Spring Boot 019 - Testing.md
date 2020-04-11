# Spring Boot 019 - Testing

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





---

**Reference**

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-testing