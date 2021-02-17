# Spring Web MVC 007 - 핸들러 메소드



핸들러 메소드에서 다양한 아규먼트를 사용할 수 있다.

| 핸들러 메소드 아규먼트                                       | 설명                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| WebRequest<br />NativeWebRequest<br />ServletRequest/Reponse<br />HttpServletRequest/Reponse | 요청 또는 응답 객체에 접근 가능한 API                        |
| InputStream<br />Reader<br />OutputStream<br />Writer        | 요청 본문을 읽어 오거나, 응답 본문을 쓸 때 사용할 수 있는 API |
| PushBuilder                                                  | Spring 5에 추가됨. HTTP/2에서 사용할 수 있다. 리소스 푸쉬에 사용된다.<br />일반적으로 일어나는 HTTP 요청 : 1 클라이언트가 뷰 요청 2 서버 응답 (이 때 뷰에 다른 리소스 자원이 있어서 불러오고 싶음) 3 클라이언트가 이미지를 요청 4 서버 응답<br />PushBuilder : 1 클라이언트가 뷰 요청 2 서버 뷰 응답 3 서버가 리소스도 응답 (pushBuilder를 통해 서버가 능동적으로 push 를 미리 할 수 있다.) |
| HttpMethod                                                   | GET, POST 등에 대한 정보                                     |
| Locale<br />TimeZone<br />ZoneId                             | LocaleResolver 가 분석한 요청의 Locale 정보를 파리미터로 받아서 사용할 수 있다. |
| `@PathVariable`                                              | URI 탬플릿 변수를 읽을 때 사용한다.                          |
| `@MatrixVariable`                                            | URI 경로 중 key/value 쌍을 읽어올 때 사용한다.               |
| `@RequestParam`                                              | 서블릿 요청 매개변수 값을 선언한 메소드 아규먼트 타입으로 변환해준다. 단순 타입인 경우 이 애노테이션을 생략할 수 있다. |
| `@RequestHeader`                                             | 요청 헤더값을 선언한 메소드 아규먼트 타입으로 변환해준다.    |
| `@ResponseBody`                                              | 리턴 값을 HttpMessqgeConverter 를 사용해서 응답 본문으로 바꾼다. |
| HttpEntity, ResponseEntity                                   | 응답 본문 뿐 아니라 헤더 정보까지, 전체 응답을 만들 때 사용한다. |
| String                                                       | ViewResolver 를 사용해서 뷰를 찾을 때 사용할 뷰 이름이다.    |
| View                                                         | 암묵적인 모델 정보를 렌더링 할 뷰 인서턴스이다.              |
| Map, Model                                                   | 암묵적으로 판단한 뷰 렌더링 때 사용할 모델 정보이다. (RequestToViewNameTranslaator 를 통해 판단한다.) |
| `@ModelAtrribute`                                            | 암묵적으로 판단한 뷰 렌더링 때 사용할 모델 정보에 축가한다.  (RequestToViewNameTranslaator 를 통해 판단한다.) 어노테이션 생략이 가능하다. |



핸들러 메소드 리턴은 주로 응답 또는 모델을 렌더링할 뷰에 대한 정보를 제공하는데 사용된다.



<br />

---

## URI 패턴



**`@PathVariable`**

요청 URI 패턴의 일부를 핸들러 메소드의 아규먼트로 받는 방법이다. 

타입 변환을 지원한다. 아래 컨트롤러 예시에서 보면, URI 는 `String` 타입인데 이를 자동으로 `Integer` 타입의  id 를 받아오는 것을 볼 수 있다. 

기본값이 반드시 있어야 한다. 만약 없다면 null 을 받아오는데 이 때는 `Optional` 을 사용해서 null 처리를 할수는 있다. `Optional<Integer>` 이런 식으로 받아온다.

<br />

**`@MatrixVariable`**

요청 URI 패턴에서 키/값 쌍의 데이터를 핸들러 메소드의 아규먼트로 받는 방법이다. 이 역시 타입변환을 지원한다. 기본값도 반드시 있어야 하고, Optional 도 지원한다.

<br />

간단한 테스트 코드 및 컨트롤러 예제이다.

```java
@WebMvcTest
class NewsControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void getNews() throws Exception {
      	// Given & When
        mockMvc.perform(get("/news/1;title=today"))
                .andDo(print())
        // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("id").value(1))
                .andExpect(jsonPath("title").value("today"))
                ;
    }

}
```

```java
@Getter @Setter
public class News {
    private Integer id;
    private String title;
}
```

```java
@Controller
public class NewsController {

    @GetMapping("/news/{id}")
    @ResponseBody
    public News news(@PathVariable Integer id, @MatrixVariable String title) {
        News news = new News();
        news.setId(id);
        news.setTitle(title);
        return news;
    }
}
```

이렇게 실행하면 오류가난다. 세미콜론을 자동으로 제거하는 옵션 때문이다. 그런데 `MatrixVariable` 문법을 사용하려면 이를 URL 에 포함시켜 주어야 한다. 따라서 웹설정을 바꿔보도록 하자.

```java
@Configuration
public class StoreWebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        UrlPathHelper urlPathHelper = new UrlPathHelper();
        urlPathHelper.setRemoveSemicolonContent(false);
        configurer.setUrlPathHelper(urlPathHelper);
    }
}
```





<br />

---

## @RequestParam



`@RequestParam` 를 통해 **요청 매개변수**에 들어있는 단순 타입 데이터를 핸들러 메소드의 아규먼트로 받아올 수 있다.

> 요청 매개변수란 쿼리 매개변수나 폼 데이터를 말한다.

이 애노테이션은 생략이 가능하지만, 명시적으로 코드가 헷갈리지 않게 적어주는 것을 추천한다.

```java
@PostMapping("/news")
@ResponseBody
public News news(@RequestParam(value = "title", required = false, defaultValue = "무제") String myTitle) {
  News news = new News();
  news.setTitle(myTitle);
  return news;
}
```

* 위와 같이하면, URL 에서 "title" 이라는 파라미터를 핸들러 메소드의 아규먼트로 받아올 수 있다.
* `required` 의 기본값은 true 이며, 파라미터로 받아온 값이 반드시 있어야 한다. 기본값을 정하지 않아도 된다면 `required = false` 로 할 수 있다. 그리고 이 때 기본값을 `defaultValue` 로 설정할 수 있다. 또는 `Optional` 로 기본값이 없는 경우 null 로 받아올 수도 있다.

<br />

간단하게 수정한 후 테스트를 해보자.

```java
@Controller
public class NewsController {

    @PostMapping("/news")
    @ResponseBody
    public News news(@RequestParam String title) {
        News news = new News();
        news.setTitle(title);
        return news;
    }
}
```

```java
@Test
public void postNews() throws Exception {
  // 쿼리 매개변수
  mockMvc.perform(post("/news?title=무제"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(jsonPath("title").value("무제"))
    ;
}

// 폼 데이터
// mockMvc.perform(post("/news")
//                .param("title", "무제"))
```

<br />

Map<String, String> 또는 MultiValueMap<String, String> 를 사용해서 요청 매개변수를 받아올 수 있다.

아래와 같이 코딩할 수 있다.

```java
@Controller
public class NewsController {

    @PostMapping("/news")
    @ResponseBody
    public News news(@RequestParam String title,
                     @RequestParam Integer limit) {
        News news = new News();
        news.setTitle(title);
        news.setLimit(limit);
        return news;
    }
}
```

```java
@Test
public void postNews() throws Exception {
  mockMvc.perform(post("/news")
                  .param("title", "무제")
                  .param("limit", "20"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(jsonPath("title").value("무제"))
    ;
}
```





<br />

---

## 폼 서브밋



**브라우저로 직접 확인하며 폼 서브밋 테스트하기**

1) `/news/form` GET 요청하여 폼 화면 불러오기

2) 화면에서 title 입력, limit 입력

3) 생성(submit) 버튼 클릭 하면 `/news` 로 POST 요청

4) POST 요청 컨트롤러를 통해 반환된 화면 보기

<br />

컨트롤러 구현

```java
@Controller
public class NewsController {

    // 1) /news/form GET 요청하여 폼 화면 불러오기
    @GetMapping("/news/form")
    public String newsForm(Model model) {
        News news = new News();
        news.setLimit(10); // 필드값 하나를 채워서 보내본다. 테스트용
        model.addAttribute("news", news);
        return "/news/form";
    }

    // 4) POST 요청 컨트롤러를 통해 반환된 화면 보기
    @PostMapping("/news")
    @ResponseBody
    public News news(@RequestParam String title,
                     @RequestParam Integer limit) {
        News news = new News();
        news.setTitle(title);
        news.setLimit(limit);
        return news;
    }
}
```



<br />

POST 요청을 보낼 form 화면을 만들어보자. `resources/templates` 폴더에 넣어주면 된다.

`resources/templates/news/form.html`

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Form</title>
</head>
<body>
<form action="#" th:action="@{/news}" method="post" th:object="${news}">
    <!-- 2) 화면에서 title 입력, limit 입력 -->
    <input type="text" title="title" th:field="*{title}" />
    <input type="text" title="limit" th:field="*{limit}" />
    <!-- 3) 생성(submit) 버튼 클릭 하면 `/news` 로 POST 요청 -->
    <input type="submit" value="생성" />
</form>
</body>
</html>
```

>Thymeleaf 문법
>
>* @{} : 링크(URL) 표현식
>* ${} : variable 표현식
>* *{} : selection 표현식

form 태그를 보면, `submit` 이 일어난 경우 `th:action="@{/news}"` 로 액션을 취하라고 되어있다. 즉 `<input type="submit" value="생성" />` 버튼을 누르게 되면, `/news` URL 로 POST 요청을 보내게 된다. 이 때 news 라는 이름의 object 가 함께 요청본문으로 보내진다.

<br />

또는 Postman 이라는 앱을 다운받고, POST 요청을 쉽게 전송할 수 있다.

<br />

테스트 코드 작성

```java
@Test
public void newsForm() throws Exception {
  mockMvc.perform(get("/news/form"))
    .andDo(print())
    .andExpect(view().name("/news/form"))
    .andExpect(model().attributeExists("news"))
    ;
}
```







