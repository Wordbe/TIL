# Spring Web MVC 008 - 핸들러 메소드 2



## @ModelAttribute



```java
@Controller
public class NewsController {
  
    @PostMapping("/news")
    @ResponseBody
    public News news(@ModelAttribute News news) {
        return news;
    }
}
```

```java
@Test
public void postNews() throws Exception {
  mockMvc.perform(post("/news")
                  .param("title", "blue")
                  .param("limit", "10"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(jsonPath("title").value("blue"))
    ;
}
```

이전 예제에서 `@RequestParam` 으로 파라미터를 받아서, 객체에 setter 메소드로 직접 넣어주어 반납했었다면,

이번에는 `@ModelAttribute` 를 통해 들어오는 POST 요청 본문의 데이터를 객체에 자동으로 넣어줄 수 있다. 심지어 `@ModelAttribute` 애노테이션은 생략도 가능하다.



POST 요청에 요청본문을 담아 보내는 방법은 다양하다. 테스트 코드에서 `param()` 메소드로 직접 담아주어도 되고, 아래와 같이 쿼리메소드로 넣어주어도 된다.

```java
/news?title=blue&limit=10
```

두 가지 방법을 섞어서 사용해도 되는데, 보기 안 좋으므로 굳이 그렇게 하진 않는다.

<br />

**바인딩 에러**

위에서 예를 들어서 limit 필드에 문자열 타입의 값을 넣으면 400 (Bad Request 중에서 BindingException 에러) 에러가 난다.

```java
@Test
public void postNews() throws Exception {
  mockMvc.perform(post("/news")
                  .param("title", "blue")
                  .param("limit", "not number"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(jsonPath("title").value("blue"))
    ;
}
```



하지만 이렇게 잘못된 값을 POST 요청했을 경우 `BindingResult` 타입의 아규먼트를 추가로 파라미터에 받아오면, 에러는 발생하지 않고, 에러 내용이 `BindingResult` 에 담겨지게 할 수 있다. 이를 통해서 사용자가 잘못된 데이터를 입력했을 경우, 다시 원래 form 화면을 주고 올바른 값을 입력하라고 프로그래밍이 가능하다.

<br />

**검증 작업**

바인딩 이후에 검증 작업을 하려면 `@Valid` 또는 `@Validated` (스프링 제공) 어노테이션을 이용한다.

`@Valid` 어노테이션을 붙이고 올바르지 않은 값이 들어오면 일단 객체에 파라미터 값이 들어오는 것은 성공한다 (바인딩된다). 하지만, `@Valid` 에 위반된 데이터가 들어오면 `BindingResult` 객체에 에러로 담기게 된다.



먼저 이를 사용하기 위해서는 `javax.validation` 라이브러리를 의존성에 추가해주어야 한다.

**gradle.build**

```java
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

```java
@PostMapping("/news")
@ResponseBody
public News news(@Valid @ModelAttribute News news, BindingResult bindingResult) {
  if (bindingResult.hasErrors()) {
    System.out.println("----------------------------");
    bindingResult.getAllErrors().forEach(e -> {
      System.out.println(e.toString());
    });
  }
  return news;
}
```

```java
@Getter @Setter
public class News {
    private Integer id;
    private String title;
  
  	// limit는 최소값이 0이다.
    @Min(0)
    private Integer limit;
}
```

이제 limit 에 -10 값을 넣으면 0 미만의 값이기 때문에 에러가 `BindingResult` 에 묶이게 된다.

<br />

**`@Validated`**

`@Validated` 는 우선 `@Valid` 와 똑같은 용도로 같이 사용할 수 있다. 위 코드에서 `@Validated` 로 바꾸어도 테스트는 그대로 통과한다. 여기에 추가로 제공해주는 기능은 '그룹 지정'이다.

`@Validated` 는 스프링 MVC 핸들러 메소드 아규먼트에서 사용할 수 있고, validation group 이라는 힌트를 사용할 수 있다.

아래와 같이 설정해보자.

```java
@Getter @Setter
public class News {

    interface ValidatedName {}
    interface ValidateLimit {}

    private Integer id;

    @NotBlank(groups = ValidatedName.class)
    private String title;
    
    @Min(value = 0, groups = ValidateLimit.class)
    private Integer limit;
}
```

```java
 @PostMapping("/news")
@ResponseBody
public News news(@Validated(News.ValidateLimit.class) @ModelAttribute News news, BindingResult bindingResult) {
  if (bindingResult.hasErrors()) {
    System.out.println("----------------------------");
    bindingResult.getAllErrors().forEach(e -> {
      System.out.println(e.toString());
    });
  }
  return news;
}
```

이렇게 되면 `ValidateLimit.class` 그룹만 검증하게된다.





<br />

---

## 폼 서브밋 에러처리, 리다이렉트



바인딩 에러 발생 시 Model 에 담기는 정보로는 모델에 담긴 객체 `News` 와 `BindingResult.news` 가 있다.

디버깅으로 확인가능하다.

> 디버깅 단축키 : cmd + shift + d

```java
@Test
public void postNews() throws Exception {
  ResultActions result = mockMvc.perform(post("/news")
                                         .param("title", "blue")
                                         .param("limit", "-10"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(model().hasErrors());

  ModelAndView mav = result.andReturn().getModelAndView();
  Map<String, Object> model = mav.getModel();
  System.out.println(model.size());
}
```

12번째 줄에 breakpoint 빨간 점을 잡아놓고 디버깅 해봄변, Model 안에 담기는 데이터를 확인할 수 있다.

모델에는 BindingResult 값도 같이 들어가므로, 화면에서 이를 이용해서 에러를 출력할 수 있다.

타임리프에서는 아래와 같은 방식으로 에러를 꺼내올 수 있다.

**news/form** 에 추가

```html
<p th:if="${#fields.hasErrors('limit')}" th:errors="*{limit}">Incorrect date</p>
```



```java
@PostMapping("/news")
public String news(@Validated @ModelAttribute News news,
                   BindingResult bindingResult,
                   Model model) {
  if (bindingResult.hasErrors()) {
    return "/news/form";
  }

  List<News> newsList = new ArrayList<>();
  newsList.add(news);
  model.addAttribute("newsList", newsList);

  return "/news/list";
}
```



애플리케이션을 실행하고, `/news/form` 에 들어가서 잘못된 데이터를 입력해보자. 예) limit = -10

0이상 입력해야한다고 에러메시지가 나올 것이다.

<br />



**POST, Redirect, GET 패턴을 만들어보자.**



POST 요청 이후에 특정 URL 로 이동을 시키고, 입력한 값을 조회하는 화면을 보여주려고 한다.

위 컨트롤러에서 newList 를 모델에 추가해주어서 뷰에 전송해주었기 때문에 아래 html 화면에서도 이 attribute 를 받아 데이터를 화면에 보여줄 수 있다.

**news/list**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>News List</title>
</head>
<body>
<h1>뉴스 데이터</h1>
<div th:unless="${#lists.isEmpty(newsList)}">
    <ul th:each="news: ${newsList}">
        <p th:text="${news.Title}">news title</p>
        <p th:text="${news.Limit}">news limit</p>
    </ul>
</div>
  
<a th:href="@{/news/form}">News 다시 생성</a>
</body>
</html>
```

위와 같이 뷰 URL 을 바로 반환하면, `/news/list` 를 호출하면서 위 화면이 성공적으로 보여질 것이다.

그러나, 여기서 화면이 갱신된 것을 다시보려고 브라우저를 새로고침하면 POST 요청(폼 서브밋)을 다시하게 된다. 그리고 브라우저는 같은 POST 요청을 다시 할 것인지 묻는 알림창을 보여준다.

따라서 전략을 바꾸어서, POST 요청 완료후 redirect 를 하여 GET 요청을 불러오도록 해보자. `redirect:` 를 붙여주면 된다.

```java
@PostMapping("/news")
public String news(@Validated @ModelAttribute News news,
                   BindingResult bindingResult,
                   Model model) {
  if (bindingResult.hasErrors()) {
    return "/news/form";
  }

  List<News> newsList = new ArrayList<>();
  newsList.add(news);
  model.addAttribute("newsList", newsList);
  // 입력받은 news는 데이터베이스에 저장해야 함.

  return "redirect:/news/list";
}

@GetMapping("/news/list")
public String getNews(Model model) {
  // 데이터베이스에서 읽어온 데이터 (테스트용으로 일단 만듬)
  News news = new News();
  news.setTitle("wordtory");
  news.setLimit(10);

  List<News> newsList = new ArrayList<>();
  newsList.add(news);

  model.addAttribute(newsList);
  return "/news/list";
}
```

`/news/list` 에 대한 GET 메소드 핸들러도 만들어준다. 

이렇게 하면, 브라우저에서 새로고침을 해도 다시 `GET` 요청을 불러는 행위를 하므로, 문제없이 잘 작동된다.



