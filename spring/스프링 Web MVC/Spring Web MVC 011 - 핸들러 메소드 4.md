# Spring Web MVC 011 - 핸들러 메소드 4



## @RequestBody

`@RequestBody` 는 핸들러의 아규먼트로 받아 올 수 있다. 요청 본문(body)에 들어있는 데이터를 `HttpMessageConverter`를 통해 변환한 객체로 받아올 수 있다.

> `HttpMessageConverter` : 스프링 MVC 설정 (WebMvcConfigurer) 에서 설정할 수 있다. 이 때 `configureMessageConverters` 를 오버라이딩하면 기본 메시지 컨버터를 대체하게 되어, 기본설정이 바뀔 수 있으므로 조심한다. 대신 `extendMessageConverters` 를 이용하면 원하는 메시지 컨버터를 추가할 수 있다. (객체를 XML으로 바꾼다든지)
>
> 기본 컨버터는 `WebMvcConfigurationSupport.addDefaultHttpMessageConverters` 이다.

<br />

```java
@RestController
@RequestMapping("/api/refnews")
public class RefNewsApi {

    @PostMapping
    public News createNews(@RequestBody News news) {
        // save news 로직이 들어갈 자리
        return news;
    }
}
```

News 객체를 받아서 다시 그대로 화면에 News 를 반환하는 컨트롤러이다. 단순한 컨트롤러.

테스트코드를 만들어보자.

```java
@SpringBootTest
@AutoConfigureMockMvc
class RefNewsApiTest {

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    MockMvc mockMvc;

    @Test
    public void createNews() throws Exception {
      	// Given
        News news = new News();
        news.setTitle("Oil");
        news.setLimit(30);

        String json = objectMapper.writeValueAsString(news);

        // When
        mockMvc.perform(post("/api/refnews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
        // Then
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("title").value("Oil"))
                .andExpect(jsonPath("limit").value(30))
                ;
    }
}
```

* `ObjectMapper` 를 이용하면 객체를 json 으로 쉽게 바꿀 수 있다. (스프링부트가 자동설정해준다. shift 두번 누르고 `JacksonAutoConfiguration` 을 보면 `jacksonObjectMapper` 를 볼 수 있다.)
* 테스트코드에서 `contentType(MediaType.APPLICATION_JSON)` 를 적어주어서 콘텐츠타입이 json 임을 명시해주었다.

<br />

## HttpEntity

`@RequestBody` 와 비슷하지만 추가로 본문정보와 더불어 헤더 정보를 사용할 수 있다.

```java
@RestController
@RequestMapping("/api/refnews")
public class RefNewsApi {

    @PostMapping
    public News createNews(HttpEntity<News> request) {
        // save news 로직이 들어갈 자리
      
      	// 헤더 정보 이용가능
        MediaType contentType = request.getHeaders().getContentType();
        System.out.println(contentType);

        return request.getBody();
    }
}
```



> `@RequestBody`, `HttpEntity` 둘 다 `@Valid`또는 `@Validated` 를 사용해서 값을 검증할 수 있다. 또한 `BindingResult` 아규먼트를 사용해서 바인딩 에러를 없애(400 응답 에러 대신 200 정상 응답 코드가 나온다.)는 대신, 코드 단에서 바인딩 또는 검증 에러 로직을 처리할 수 있다.



<br />

---

## @ResponseBody



`@ResponseBody` 는 컨트롤러가 데이터를 반환할 때 `HttpMessageConverter` 를 사용해서 응답 본문 메시지를 만들어 반환할 수 있게 도와준다.

`@RestController` 를 사용하면 자동으로 모든 핸들러 메소드에 `@ResponseBody` 가 적용된다.



### ResponseEntity

* 응답 헤더의 상태 코드 본문을 직접 다루고 싶다면 사용하면 된다. `ResponseEntity.ok()`, `ResponseEntity.badRequest().build()`, `ResponseEntity.created()` 등을 사용할 수 있다.

```java
@RestController
@RequestMapping("/api/refnews")
public class RefNewsApi {

    @PostMapping
    public ResponseEntity<News> createNews(@Valid @RequestBody News news,
                                           BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(news);
    }
}
```

> ResponseEntity 는 응답 헤더, 본문 양식을 맞추어 반환하므로 `@ResponseBody` 가 필요없다. 따라서 `@RestController` 대신 `@Controller` 를 등록해도 잘 동작한다.



테스트코드

```java
@SpringBootTest
@AutoConfigureMockMvc
class RefNewsApiTest {

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    MockMvc mockMvc;

    @Test
    public void createNews() throws Exception {
        News news = new News();
        news.setTitle("Oil");
        news.setLimit(-30);

        String json = objectMapper.writeValueAsString(news);

        mockMvc.perform(post("/api/refnews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andDo(print())
                .andExpect(status().isBadRequest())
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("title").value("Oil"))
//                .andExpect(jsonPath("limit").value(30))
                ;
    }
}
```



<br />

---

## 모델 @ModelAttribute



`@ModelAttribute` 는 핸들러 메소드의 아규먼트로 사용해서 모델 속성을 가져오고 변경하여 사용할 수 있었다.

여기에 또 다른 기능이 있다. `@Controller`, `@ControllerAdvice` 를 사용한 클래스에서 모델 정보를 초기화할 때 사용할 수 있다. 

```java
@RestController
@RequestMapping("/api/refnews")
public class NewsApi {
  
  // "categrories" 라는 애트리뷰트를 추가할 수 있다.
  @ModelAttribute
  public void categories(Model model) {
    model.addAttribute("categories", List.of("Bloomberg", "Thomson Reuters", "Yahoo finance"));
  }
}
```





또한 `@RequestMapping`  과 메소드에서 같이 사용하면 해당 메소드에서 리턴하는 객체를 모델에 모두 넣어줄 수 있다. 이 때 `@ModelAttribute` 는 생략이 가능하다. 

그러면 원래 리턴자리에 있던 뷰 이름은 어떻게 연관시켜야할지 고민이 될 것이다. 이 때는 `RequestToViewNameTranslator` 가 `@GetMapping("/api/news")` 의 `/api/news` 와 같게 뷰 경로를 설정해준다.

```java
@GetMapping("/api/news")
// @ModelAttribute (생략가능)
public News getNews() {
  return new News();
}
```



<br />

---

## 데이터 바인더 @InitBinder



### 바인딩

`@InitBinder` 는 컨트롤러에서 바인딩 또는 검증 설정을 변경하려고 할 때 사용한다.

```java
@InitBinder
public void initNewsBinder(WebDataBinder webDataBinder) {
  webDataBinder.setDisallowedFields("id");
  // webDataBinder.setAllowedFields("title", "limit");
}
```

`setDisallowedFields` 는 데이터와 객체의 바인딩을 원하지 않는 필드를 골라서 설정할 수 있다. (blacklist)

`setAllowedFields` 는 바인딩을 원하는 필드만 골라서 설정할 수 있다. (whitelist)

<br />

### 포매터

`webDataBinder.addCustomFormatter()` 를 통해서 포매터도 설정할 수 있다. 예를 들어 문자열로 `2021-02-21` 날짜를 받으면 이를 `LocalDataTime` 이라는 타입으로 바꾸어주는 것을 말한다.

```java
public class News {
	...
  
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate startDate;
}
```

위에 iso 타입은 사실 `@DateTimeFormat(pattern = "yyyy-MM-dd")` 이렇게 해준 것과 같다. 그런데 상수로 미리 지정되어있으니 타입-세이프하게 위에 처럼 적어주면 좋을 것 같다.

`@DataTimeFormat` 은 사실 커스텀 포매터는 아니다. 이 어노테이션을 이해하는 포매터가 이미 스프링에 등록되어 있어서 별도 설정없이 위 코드가 작동한다. 커스텀 타입을 등록하고 싶으면 `webDataBinder.addCustomFormatter()` 를 사용해주면 된다.

<br />

### Validator 설정

복잡한 로직의 validator 를 설정하고 싶다면, 아래와 같이 `Validator` 를 구현하여 만들 수 있다. 여기서 만든 구현체를 `webDataBinder.addValidators()` 안에 등록해주면 밸리데이터를 사용할 수 있게 된다.

```java
public class NewsValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz) {
        return News.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        News news = (News) target;
        if (news.getTitle().contains("emergency")) {
            errors.rejectValue("title", "wrongValue", "No emergency news");
        }
    }
}
```

```java
@InitBinder
public void initNewsBinder(WebDataBinder webDataBinder) {
  webDataBinder.addValidators(new NewsValidator());
}
```

> 또는 NewsValidator 를 빈으로 등록해서 바로 사용할 수도 있다. (`@Compoent`) 그리고 컨트롤러에서 이 클래스를 주입받은 후, `newsvalidator.validate(news, bindingResult)` 이런식으로 사용할 수 있다.
>
> 그리고 NewsValidator 는 더 이상 Validator 를 구현하지 않아도 되며, 아래와 같이 코드를 간단하게 변경하면 된다.
>
> ```java
> public class NewsValidator {
> 
>     @Override
>     public void validate(News news, Errors errors) {
>         if (news.getTitle().contains("emergency")) {
>             errors.rejectValue("title", "wrongValue", "No emergency news");
>         }
>     }
> }
> ```

특별이 특정 모델 객체에만 바인딩 또는 Validator 설정을 원한다면 `@InitBinder("news")` 등으로 응용해서 사용하면 된다.



<br />

---

## 예외 처리 핸들러 @ExceptionHandler



예외를 구체적으로 처리하고 싶은 경우, 기존 있는 예외처리에서 지원을 하지 않는 예외일 경우 사용한다.

예시를 보자.

```java
public class NewsException extends RuntimeException {
}
```

```java
@ExceptionHandler
public String newsErrorHandler(NewsException newsException, Model model) {
  model.addAttribute("message", "news error");
  return "/news/error";
}

@GetMapping("/news/error-test")
public String errorTest() {
  throw new NewsException();
}
```



**`/resources/news/error.html`**

```java
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>Error</title>
</head>
<body>

<div th:if="${message}">
    <h2>Error</h2>
    <h3 th:text="${message}" />
</div>

</body>
</html>
```

위와 같이 만들면,`NewsException` 예외가 발생한 경우, `newsErrorHandler` 메소드가 호출되면서 `/news/error` 라는 이름을 가진 뷰가 화면에 보여지게 된다. 



여러 예외를 한 핸들러에서 동시에 처리하고 싶으면

```java
@ExceptionHandler({AException.class, BException.class, NewsException.class, ...})
public String newsErrorHandler(NewsException newsException, Model model) {
  model.addAttribute("message", "news error");
  return "/news/error";
}
```

위처럼 사용하면 된다. 단, 나머지 Exception 을 포괄하는 제일 부모 클래스의 Exception 을 아규먼트로 받아와서 사용하면 된다.

<br />

또한 에러 페이지를 따로 만들지 않고, `ResponseEntity` 를 사용해서 바로 응답본문을 반환할 수도 있다. 이렇게되면 응답코드 (400 = badRequest 등) 도 같이 보낼 수 있기 때문에 조금 더 친절한 설명을 보내줄 수 있을 것이다.

```java
@ExceptionHandler
public ResponseEntity<String> newsResponseEntityErrorHandler(NewsException newsException) {
  return ResponseEntity.badRequest().body("error message example");
}
```

<br />

---

## 전역 컨트롤러 @ControllerAdvice



InitBinder 나 ExceptionHadler 등을 여러 컨트롤러에 걸쳐서 한 번에적용하고 싶다면, 전역 컨트롤러인 `@ControllerAdvice` 를 이용하면 된다. 아래와 같이 베이스컨트롤러를 만들고, 어노테이션을 붙인 뒤 공통으로 적용하기 원하는 메소드를 입력한다.

특정 클래스에만 적용할 수 도 있고, 특정 패키지 이하의 컨트롤러에만 적용할 수도있다. 또는 특정 어노테이션을 가지고 있는 컨트롤러에만 적용할 수도있다.

```java
@ControllerAdvice(assignableTypes = {NewsController.class, RefNewsApi.class})
public class BaseController {

    @ExceptionHandler
    public String newsErrorHandler(NewsException newsException, Model model) {
        model.addAttribute("message", "news error");
        return "/news/error";
    }

    @InitBinder
    public void initNewsBinder(WebDataBinder webDataBinder) {
        webDataBinder.setDisallowedFields("id");
        webDataBinder.addValidators(new NewsValidator());
    }
}
```

특별히 모든 클래스에대해 `@RestController` 를 적용하고 싶다면, `@RestControllerAdvice` 를 사용하면 된다.





