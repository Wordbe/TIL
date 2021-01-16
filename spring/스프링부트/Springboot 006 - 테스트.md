# Springboot 006 - 테스트





# @SpringBootTest



@SpringBootTest 는 @SpringBootApplication 가 붙은 클래스를 참조하여 (주로 메인클래스) 그 밑의 모든 빈들을 찾아 테스트 빈으로 등록한다. 즉 @SpringBootTest 는 통합테스트용이다.



일부분만 테스트하는 슬라이스 테스트를 위해서는 아래 [@WebMvcTest](#@WebMvcTest) 를 참조한다.



**webEnvironment**

`@SpringBootTest` 의 webEnvironment 는 기본적으로 `SpringBootTest.WebEnvironment.MOCK` 으로 설정되어 있다. 내장 톰캣 구동을 하지 않고 가짜 빈을 만들어 테스트를 한다.

반면, RANDOM_PORT, DEFINED_PORT 는 내장 톰캣을 사용한다.

마지막으로 NONE은 서블릿 환경을 제공하지 않는다.



<br />

## MockMvc

MOCK 은 mockito 라이브러리가 필요하며, mock 이라는 가상 객체로 테스를 하게끔 도와준다.



간단한 테스트 예제를 만들어보자. 컨트롤러를 하나만들어서 클라이언트가 /buy라는 url을 호출하면 문자열이 나오도록 해보자.

```java
@RestController
public class BuyController {

    @Autowired
    private BuyService buyService;

    @GetMapping("buy")
    public String buy() {
        return "buy " + buyService.getName();
    }
}

```



물론 서비스 객체도 만들어서 빈으로 등록한다.

```java
@Service
public class BuyService {

    public String getName() {
        return "Apple";
    }
}
```



테스트 코드는 아래와 같다.

```java
...
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class BuyControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void buy() throws Exception {
        mockMvc.perform(get("/buy"))
                .andExpect(status().isOk())
                .andExpect(content().string("buy Apple"))
                .andDo(print());
    }
}
```

`@AutoConfigureMockMvc` 에노테이션을 붙이는 것이 MockMvc 를 사용하기 가장 쉬운 방법 즁 하나이다.

우선 MockMvc 객체를 주입시킨다.

그리고 MockMvc 요청/응답 관련 메소드를 사용한 것을 볼 수 있다.

localhost:8080/buy 이라는 URL 요청시, 응답상태가 ok 인지(응답코드가 200 정상인지), 내용이 원하는 메시지가 잘나오는지 검증하는 것이고, 마지막으로 응답핸들러를 통해 모든 것을 콘솔에 출력해본다.



<br />

---

## RestTemplate



```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
```

위와 같이 RANDOM_PORT 로 지정하면 임의의 포트번호로 테스트 웹서버가 실행된다.



```java
...
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BuyControllerTest {

  	@MockBean
    BuyService mockBuyService;
  
    @Autowired
    TestRestTemplate testRestTemplate;

    @Test
    void buy() throws Exception {
        // getName 메소드 호출 시 반환값을 "Grape"로 변경한다.
        when(mockBuyService.getName()).thenReturn("Grape");

        String result = testRestTemplate.getForObject("/buy", String.class);
        assertThat(result).isEqualTo("buy Grape");
    }
}
```

`@MockBean` 은 ApplicationContext 에 들어있는 빈을 Mock 으로 만든 객체로 교체한다. 모든 @Test 마다 자동으로 리셋된다.





<br />

---

## WebTestClient



기존 스프링부트에서는 테스트가 동기적으로 진행된다. (MockMvc, RestTemplate) 하지만 웹테스트클라이언트는 비동기로 적용된다. 뿐만 아니라 사용하기 손쉬운 직관적인 API 기능을 제공하기 때문에, 굳이 비동기 테스트를 원하지 않더라도 사용을 추천하는 테스트 방법이다.

WebTestClient를 사용하려면 우선 WebFlux 의존성이 필요하다. pom.xml 에 등록하자.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```



이제 테스트를 수정해보자.

```java
...
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BuyControllerTest {

  	@MockBean
    BuyService mockBuyService;
  
    @Autowired
    WebTestClient webTestClient;
  
    @Test
    void buy() throws Exception {
        when(mockBuyService.getName()).thenReturn("Grape");

      	// 설명을 하지 않아도 사용이 직관적이다.
        webTestClient.get().uri("/buy").exchange()
          			.expectStatus().isOk()
                .expectBody(String.class).isEqualTo("buy Grape");
    }
}
```



<br />

---

<h1 id="@WebMvcTest">@WebMvcTest</h1>



`@SpringBootTest` 로 전체 빈을 다 탐색해서 테스트하는 것이 아니라, 원하는 빈만 등록하고 싶다면 슬라이스 테스트를 해야 한다. 레이어 별로 잘라서 테스트를 하는 것이다. 

```java
...
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @MockBean
    BuyService mockBuyService;

    @Autowired
    MockMvc mockMvc;

    @Test
    void buy() throws Exception {
        when(mockBuyService.getName()).thenReturn("Grape");

        mockMvc.perform(get("/buy"))
                .andExpect(content().string("buy Grape"));
    }
}
```



슬라이스 테스트의 다른 종류로 `@JsonTest`, `@WebFluxTest`, `@DataJpaTest` 등이 있다.





<br />

---

# 테스트 유틸



OutputCaptureRule 사용법에 대해 알아보자.

로그 또는 콘솔로 원하는 문자열이 잘 찍혔는지 확인해보는 기능이다.



우선 로그를 찍고 콘솔에 출력하는 코드부터 만든다.

```java
...
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class BuyController {

    Logger logger = LoggerFactory.getLogger(BuyController.class);

    @Autowired
    private BuyService buyService;

    @GetMapping("/buy")
    public String buy() {
        logger.info("snow");
        System.out.println("skip");
        return "buy " + buyService.getName();
    }
}

```





JUnit 버전별로 사용법이 다르다.

1) JUit4

```java
...
@RunWith(SpringRunner.class)
@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @Rule
    OutputCaptureRule outputCaptureRule = new OutputCaptureRule();

    @MockBean
    BuyService mockBuyService;

    @Autowired
    MockMvc mockMvc;

    @Test
    void buy() throws Exception {
        when(mockBuyService.getName()).thenReturn("Grape");

        mockMvc.perform(get("/buy"))
                .andExpect(content().string("buy Grape"));

        assertThat(outputCaptureRule.toString())
                .contains("snow")
                .contains("skip");
    }
}
```

`OutputCaptureRule` 객체를 @Rule` 어노테이션을 붙여 사용한다.



<br />

JUint5

```java
...
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@ExtendWith(OutputCaptureExtension.class)
@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @MockBean
    BuyService mockBuyService;

    @Autowired
    MockMvc mockMvc;

    @Test
    void buy(CapturedOutput capturedOutput) throws Exception {
        when(mockBuyService.getName()).thenReturn("Grape");

        mockMvc.perform(get("/buy"))
                .andExpect(content().string("buy Grape"));

        assertThat(capturedOutput.toString())
                .contains("snow")
                .contains("skip");
    }
}
```

`@ExtendWith(OutputCaptureExtension.class)` 을 활용해서  `void buy(CapturedOutput capturedOutput) throws Exception ` 파라미터로 `CapturedOutput` 을 받아 사용한다.

[OutputCaptureExtension 참고](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/system/OutputCaptureExtension.html)

























