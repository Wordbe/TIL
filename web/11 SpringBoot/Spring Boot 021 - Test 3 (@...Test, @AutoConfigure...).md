# Spring Boot 021 - Test 3 (@...Test, @AutoConfigure...)

### 25.3.9 Mocking and Spying Beans

* SpyBean은 기존 있는 객체를 맵핑해서 사용합니다. 기존값을 불러올 수 있습니다.

* MockBean을 이용하면 새로운 객체를 생성하기 때문에 초깃값이 초기화됩니다.



```java
package me.whiteship;

import me.whtieship.Application;
import me.whtieship.SampleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.mockito.BDDMockito.given;

@SpringBootTest(classes = Application.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SampleControllerTest {

    @Autowired
    WebTestClient webTestClient;

    @SpyBean
    SampleService sampleService;

    @Test
    public void testFooWithWebTestClient() {
        System.out.println(sampleService.getNumber());

        given(sampleService.getName()).willReturn("Spy");

        webTestClient.get().uri("/foo").exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo("Spy");
    }
}
```

<br>

### 25.3.10 자동설정 테스트

어플리케이션을 slice 하여 일부만 테스트하고 싶은 경우가 있습니다. 

데이터베이스 콜을 제외하고 싶을 수도, JAP 객체만 테스트하고 싶을 수도 있습니다.

`spring-boot-test-autoconfigure` 모듈은 slice같은 설정을 자동으로 지원하는 많은 어노테이션을 포함합니다.

* `@...Test` 어노테이션 : `	ApplicationContext` 를 불러옴
* `@AutoConfigure...`  어노테이션 : 자동설정 세팅을 커스터마이징하는데 사용

> `excludeAutoConfiguration` 속성으로 제외하고 싶은 자동설정을 제거할 수 있습니다. 또는 `@ImportAutoConfiguration#exclude`를 사용할 수 있습니다.

> `@AutoConfigure...` 을 `@SpringBootTest`와 함께 조합하여 사용할 수 있습니다. 

<br>

### 25.3.11 Auto-configured JSON Tests

JSON serialization, deserialization 이 잘 작동하는지 확인하려면,  `@JsonTest` 를 사용할 수 있습니다. 

- Jackson `ObjectMapper`, any `@JsonComponent` beans and any Jackson `Module`s
- `Gson`
- `Jsonb`

자동설정의 구성요소들을 설정하려면 `@AutoConfigureJsonTesters` 를 사용합니다.

Spring Boot는 AssertJ 기반 헬퍼를 포함합니다. 

`JacksonTester`, `GsonTester`, `JsonbTester`, `BasicJsonTester` 를 주입받아서 사용할 수 있습니다. `@Autowired` 받아서 사용할 수 있습니다.



> JSON 헬퍼 클래스는 단위 테스트에서 직접 사용될 수 있습니다. `@JsonTest` 를 사용하지 않으려면, `@Before ` 메소드에서 헬퍼의 `initFields` 메소드를 호출합니다.

```java
package me.whiteship;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.whtieship.Application;
import me.whtieship.Sample;
import org.junit.Before;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.JsonContent;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = Application.class)
public class SampleJsonTest {

    JacksonTester<Sample> sampleJacksonTester;

    @Before
    public void setup() {
        JacksonTester.initFields(this, new ObjectMapper());
    }

    @Test
    public void testJson() {
        Sample sample = new Sample();
        sample.setName("seongho");
        sample.setNumber(100);

        JsonContent<Sample> sampleJsonContent = sampleJacksonTester.write(sample);
        assertThat(sampleJsonContent)
                .hasJsonPathStringValue("@.name")
                .extractingJsonPathStringValue("@.name").isEqualTo("seongho");

        assertThat(sampleJsonContent)
                .hasJsonPathNumberValue("@.number")
                .extractingJsonPathNumberValue("@.number").isEqualTo(100);
    }
}
```

<br>



### 25.3.12 Auto-configured Spring MVC 테스트

`@WebMvcTest` 는 Spring MVC 인프라구조를 자동 설정하고, 

``@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Converter`, `GenericConverter`, `Filter`, `HandlerInterceptor`, `WebMvcConfigurer`, and `HandlerMethodArgumentResolver`. bean 들의 스캔을 제한합니다. 일반적인 `@Component` 빈은 어노테이션에서 스캔되지 않습니다.

> 추가 컴포넌트를 등록하려면, `@Import` 를 써서 추가 설정을 임포트 할 수 있습니다.



`@WebMvcTest`는 단일 컨트롤러에 국한되고, `@MockBean` 과 함께 사용되어서 mock 구현을 제공할 수 있습니다. 또한 `MockMvc`를 자동설정해줍니다. Mock MVC는 full HTTP 서버를 시작할 필요없이 test MVC 컨트롤러를 빠르게 제공해줍니다.

>`@AutoConfigureMockMvc`를 사용해서 `@WebMvcTest` 안의 `MockMvc`를 자동설정 할 수 있습니다. 



> `@AutoConfigureMockMvc` 로 자동설정 안 구성요소를 설정할 수 있습니다.

<br>

> 기본값으로 스프링부트는 `WebDriver` 빈을 scope에 주입해서 각 테스트가 끝난 후 드라이버의 존재를 보증하고, 새로운 인스턴스가 주입되는 것을 보증합니다. 

<br>

### 25.3.13 Auto-configured Spring WebFlux Tests

`@WebFluxTest` 를 사용하면 되고, `WebTestlient` 클래스를 사용할 수 있습니다.



### 25.3.14 Auto-configured Data JPA Tests

`@DataJpaTest` 를 사용하면 디고, `@Entity` 클래스를 스캔하고, Data JPA 레퍼지토리를 설정합니다.

Data JPA 테스트는 [`TestEntityManager`](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot-test-autoconfigure/src/main/java/org/springframework/boot/test/autoconfigure/orm/jpa/TestEntityManager.java) 빈을 주입할 수 있습니다. 

In-memory 내장된 데이터베이스는 일반적으로 테스트에서 잘 작동합니다. 인메모리는 빠르고 설치가 필요 없기 때문입니다. 하지만, 실제 데이터베이스에서 테스트하고자 한다면, `@AutoConfigureTestDatabase` 를 사용할 수 있습니다.

<br>

### 25.3.15 Auto-configured JDBC 테스트

### 25.3.17 Auto-configured JOOQ 테스트

### 25.3.18 Auto-configured Data MongoDB 테스트

오버라이딩 하고 싶으면 `@DataMongoTest` 를 사용합니다.

### 25.3.19 Auto-configured Data Neo4j 테스트

### 25.3.20 Auto-configured Data Redis 테스트

### 25.3.21 Auto-configured Data LDAP 테스트

### 25.3.22 Auto-configured REST 클라이언트 테스트



---

**Reference**

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-testing-spring-boot-applications-testing-autoconfigured-jpa-test

https://www.youtube.com/watch?v=GECCfXZ0W6w&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=22&t=0s