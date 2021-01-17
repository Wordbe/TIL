# Springboot 008 - Spring Web MVC







스프링부트에서는 sprin-boot-starter-web 의존성을 추가하면 스프링 webmvc 를 사용할 수 있다. 

spring-boot-autoconfigure 에서 자동으로 설정이 되는데 spring.factories 중에 `WebMvcAutoConfiguration` 클래스를 사용하게 된다.

스프링 부트 웹 MVC 는 이렇게 스프링 웹 MVC 에 몇가지 컨벤션을 더 추가하여 잘 정리해놓은 라이브러리이다.



스프링 MVC 를 확장하려면 `@Configuration` 과`WebMvcConfigurer` 를 사용하면 된다.

또한 스프링 MVC 를 재정의하려면 `@Configuration` 과 `@EnableWebMvc` 를 사용하면 된다.



<br />

---

## HttpMessageConverters



HTTP 요청 본문을 객체로 변경하거나, 객체를 HTTP 응답 본문으로 변경할 때 사용한다.

예를들어 POST 매핑시 http 요청을 할 때 객체를 http 요청안에 담을 문자열로 바꿔주어야 한다. 이 때 기본적으로 (리턴 값이 컴포지션 타입의 경우) json 메시지 컨버터가 사용된다. 리턴 값이 스트링이면 String 메시지 컨버터가 사용된다.



HTTP 요청 객체를 받아서, HTTP 응답 객체를 만들어주는 컨트롤러를 만들어보자.

```java
@RestController
public class BuyController {

    @PostMapping("/buy/list")
    public @ResponseBody BuyService create(@RequestBody BuyService buyService) {
        return null;
    }

}
```

`@RestController` 가 붙어있으면 `@ResponseBody` 를 생략해도 된다.



아래와 같이 다시 만들어 보자.

```java
@RestController
public class BuyController {
  
    @PostMapping("/buy/list")
    public BuyService create(@RequestBody BuyService buyService) {
        return buyService;
    }
}
```

```java
@Getter @Setter
@Service
public class BuyService {

    private String name;
}
```



`HttpMessageConverters` 가 요청을 객체로 변환해서 잘 전환하는지 (혹은 그 반대도 잘 하는지) 테스트해보자.

```java
...
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void createBuy_JSON() throws Exception {
        String buyJson = "{\"name\":\"Apple\"}";
        mockMvc.perform(post("/buy/list")
                        .contentType(MediaType.APPLICATION_JSON_UTF8)
                        .accept(MediaType.APPLICATION_JSON_UTF8)
                        .content(buyJson)
                        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is(equalTo("Apple"))));
    }
}

```

잘 작동하는 것을 확인할 수 있다.

위와 같이 스프링부트는 HTTP 요청/응답과 객체와의 상호전환을 해주는 라이브러리가 내부에 연동되어 있다.







<br />

---

## ViewResolve



ViewResolver 는 클라이언트가 요청한 것에 대해 응답 view를 렌더링하여 사용자에게 예쁘게 보여준다. 즉, view 이름으로부터 사용될 view 객체를 매핑한다.

우리는 위의 예제에서 `@BodyResponse` 로 buyService 객체를 리턴했다.

이 때 뷰 리졸버가 응답객체를 렌더링하여 화면에 잘 보일 수 있도록 돕는다.



<br />

`ContentNegotiationViewResolver` 는 컨텐츠의 알맞은 타입을 찾아 view resolver 에게 타입호환을 위임한다. 

요청은 json으로 응답은 xml 으로 받아오는 설정을 해보자.

```java
...
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.xpath;

@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void createBuy_JSON() throws Exception {
        String buyJson = "{\"name\":\"Apple\"}";
        mockMvc.perform(post("/buy/list")
                        .contentType(MediaType.APPLICATION_JSON_UTF8) // 요청
                        .accept(MediaType.APPLICATION_XML) // 응답
                        .content(buyJson)
                        )
                .andExpect(status().isOk())
                // xml은 jsonpath 대신 xpath를 사용한다.
                .andExpect(xpath("/BuyService/name").string("Apple"));
    }
}
```



지금 가진 스프링부트 설정에는 xml 리졸버가 의존성으로 등록되어 있지 않아 에러가 발생하는 데, 아래를 추가해주면 xml 리졸브가 가능하다.

```xml
<dependency>
  <groupId>com.fasterxml.jackson.dataformat</groupId>
  <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```





<br />

---

## 정적 리소스 자원



정적 리소스 전송은 클라이언트가 브라우저에서 요청을 하면, 서버에서 이미 만들어진 자원을 응답으로 보내는 것을 말한다.

기본 리소스 위치는 classpath:/static, classpath:/public, classpath:/resources/, classpath:/META-INF/resources 이다.



static 폴더 아래 정적리소스를 하나만들어보자. (src/main/resources/)

/static/market.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Market</title>
</head>
<body>
    <h1>Market</h1>
    <div>apple</div>
    <div>banana</div>
</body>
</html>
```

어플리케이션을 실행하고 localhost:8080/market.html 을 요청하면 위의 html 화면이 나온다.

<br />

기본 url 로 root 설정(localhost:8080/**)이 되어있는데, 이것을 설정하려면 application.properties 에 아래와 같이 추가해준다.

```shell
spring.mvc.static-path-pattern=/custompath/**
```

이제는 localhost:8080/custompath/market.html 로 요청하면 된다.



이렇게 HTTP 요청이 들어오면 서버는 last-modified 헤더를 보고 304 응답을 보낸다. 크롬 개발자 도구(F12) > 네트워크 > Headers 탭에서 확인이 가능하다.



<br />

리소스 탐색 위치를 변경하려면 application.properties 에 아래와 같이 추가하면 된다.

```shell
spring.mvc.static-location="경로"
```

하지만 이렇게 설명하면 스프링이 설정해놓은 기본 리소스 위치가 이 경로로 바뀌므로, 다른 방법을 이용하는 것이 좋다.



WebConfig 클래스를 하나 만들자.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/custom/**")
                .addResourceLocations("classpath:/custom/")
                .setCachePeriod(604800); // 캐시 유효기간을 초단위로 지정 (604800초 = 3600 * 24 * 7초 = 7일)
    }
}

```

이렇게 되면 `/resources/custom` 폴더에 리소스를 넣어놓아도 읽어올 수 있다. 



/resources/custom/market.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Custom Market</title>
</head>
<body>
    <h1>Market</h1>
    <div>grape</div>
    <div>strawberry</div>
</body>
</html>
```

localhost:8080/custom/market.html 로 요청을 하면 위 html 화면을 볼 수 있다.





<br />

---

## Webjars



웹자르를 `/webjars/**` 경로로 매핑할 수 있다. 





웹자르로 올려져있는 라이브러리 중 하나인 jQuery의 의존성을 추가해보자. 

[https://mvnrepository.com](https://mvnrepository.com) 에 jQuery 를 검색하면 아래 의존성 코드를 보여준다.

```xml
<!-- https://mvnrepository.com/artifact/org.webjars.bower/jquery -->
<dependency>
  <groupId>org.webjars.bower</groupId>
  <artifactId>jquery</artifactId>
  <version>3.5.1</version>
</dependency>
```



화면에 스크립트 코드를 넣어 jQuery 를 불러오고, 간단한 알람 기능을 구현한다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Custom Market</title>
</head>
<body>
    <h1>Market</h1>
    <div>grape</div>
    <div>strawberry</div>

<script src="/webjars/jquery/3.5.1/dist/jquery.min.js"></script>
<script>
    $(function() {
        alert("Welcome!");
    })
</script>
</body>
</html>
```



<br />

버전을 명시하지 않아도 스크립트를 불러올 수 있게 하려면 webjars-locator-core 를 추가한다.

```xml
<!-- https://mvnrepository.com/artifact/org.webjars/webjars-locator-core -->
<dependency>
  <groupId>org.webjars</groupId>
  <artifactId>webjars-locator-core</artifactId>
  <version>0.46</version>
</dependency>
```



아래처럼 바꾸어도 잘 작동한다.

```html
<script src="/webjars/jquery/dist/jquery.min.js"></script>
```













