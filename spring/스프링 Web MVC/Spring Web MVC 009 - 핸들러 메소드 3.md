# Spring Web MVC 009 - 핸들러 메소드 3



## SessionAttributes

모델 정보를 HTTP 세션에 저장해주는 어노테이션이다.

먼저 `HttpSession` 을 보자. 핸들러 메소드의 아규먼트로 받아와서 세션을 관리할 수 있게 도와주는 객체이다. 상대적으로 low 레벨 단위의 코딩을 할 수 있다.

```java
@GetMapping("/news/form")
public String newsForm(Model model, HttpSession httpSession) {
  News news = new News();
  news.setLimit(10);
  model.addAttribute("news", news);
  
  // 세션안에 news 라는 이름으로 객체를 넣어준다.
  httpSession.setAttribute("news", news);
  return "/news/form";
}
```

```java
@Test
public void newsForm() throws Exception {
  MockHttpServletRequest request = mockMvc.perform(get("/news/form"))
    .andDo(print())
    .andExpect(view().name("/news/form"))
    .andExpect(model().attributeExists("news"))
	   // Session Test
    .andExpect(request().sessionAttribute("news", notNullValue()))
    .andReturn().getRequest();
  Object news = request.getSession().getAttribute("news");
  System.out.println(news);
}
```

이 코드를 아래에서 간단하게 나타낼 수 있다.

<br />

**`@SessionAttributes()`**

```java
@Controller
@SessionAttributes("news")
public class NewsController { ...
```

이렇게 컨트롤러 클래스 위에 어노테이션을 붙이고, 저장할 이름을 정해주면 된다.

이렇게 되면 모델에 추가한 attribute 중에서 `SessionAttributes() `에 입력한 이름과 동일한 것이 있다면 자동으로 세션에도 추가해준다.

추가로 `@ModelAttribute` 는 세션에 있는 데이터도 같이 바인딩한다.

 `SessionAttributes() `는 여러 화면(요청)에서 사용해야하는 객체를 공유할 때 사용하면 용이하다.



> `SessionStatus` 객체를 핸들러 메소드의 아규먼트로 받아올 수 있다. `SessionStatus.setComplete()` 를 사용하면 세션 처리의 완료를 알려 줄 수 있고, 폼 처리가 끝난 후 세션을 비울 수 있다.



<br />

---

## 멀티 폼 서브밋



세션 상태 (`SesstionStatus`)를 이용해서 모델 객체의 데이터를 WAS의 세션 안에서 공유할 수 있다.

여기서 다루어 볼 예제는 2개의 폼을 만들어서, 첫 번째 폼에서 제목을 입력받아 제목이 저장된 객체를 세션에 저장한다. 이를 공유하여 두번째 폼에서 limit 필드를 받는 것이다.



첫 번째 화면 `/news/form-title.html`

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Form Title</title>
</head>
<body>
<form action="#" th:action="@{/news/form/title}" method="post" th:object="${news}">

    <p th:if="${#fields.hasErrors('title')}" th:errors="*{title}">Incorrect date</p>

    Title: <input type="text" title="title" th:field="*{title}" />
    <input type="submit" value="생성" />
</form>
</body>
</html>
```

두 번째 화면 `/news/form-limit.html`

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Form Title</title>
</head>
<body>
<form action="#" th:action="@{/news/form/limit}" method="post" th:object="${news}">

    <p th:if="${#fields.hasErrors('limit')}" th:errors="*{limit}">Incorrect date</p>

    Limit: <input type="text" title="limit" th:field="*{limit}" />
    <input type="submit" value="생성" />
</form>
</body>
</html>
```

마지막에 저장된 데이터를 보여줄 `/news/list.html`

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>News List</title>
</head>
<body>
<a th:href="@{/news/form}">Create News</a>
<div th:unless="${#lists.isEmpty(newsList)}">
    <ul th:each="news: ${newsList}">
        <p th:text="${news.Title}">news title</p>
        <p th:text="${news.Limit}">news limit</p>
    </ul>
</div>
</body>
</html>
```



<br />

컨트롤러

```java
@Controller
@SessionAttributes("news")
public class NewsController {

  	// 1. Title 폼 화면
    @GetMapping("/news/form/title")
    public String newsFormTitle(Model model) {
        model.addAttribute("news", new News());
        return "/news/form-title";
    }

  	// 2. Title 폼 서브밋
    @PostMapping("/news/form/title")
    public String newsFormTitleSubmit(@Validated @ModelAttribute News news,
                                     BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "/news/form-title";
        }
        return "redirect:/news/form/limit";
    }

    // 3. Limit 폼 화면
    @GetMapping("/news/form/limit")
    public String newsFormLimit(@ModelAttribute News news, Model model) {
        model.addAttribute("news", news);
        return "/news/form-limit";
    }

  	// 4. Limit 폼 서브밋
    @PostMapping("/news/form/limit")
    public String newsFormLimitSubmit(@Validated @ModelAttribute News news,
                                      BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "/news/form-limit";
        }
        return "redirect:/news/list";
    }

    @GetMapping("/news/list")
    public String getNews(@ModelAttribute News news, Model model) {
        List<News> newsList = new ArrayList<>();
        newsList.add(news);

        model.addAttribute(newsList);
        return "/news/list";
    }
}
```







세션에 있는 데이터를 없애려면 아래와 같이 `SessionStatus.setComplete()` 를 하면 된다.

```java
// 4. Limit 폼 서브밋
@PostMapping("/news/form/limit")
public String newsFormLimitSubmit(@Validated @ModelAttribute News news,
                                  BindingResult bindingResult,
                                  SessionStatus sessionStatus) {
  if (bindingResult.hasErrors()) {
    return "/news/form-limit";
  }
  sessionStatus.setComplete();
  return "redirect:/news/list";
}
```





<br />

---

## `@SessionAttribute`

`@SessionAttributes` 와 다름을 주의하자. (s가 없다.) `@SessionAttributes` 는 해당 컨트롤러 내에서만 동작하며, 컨트롤러 안에서 다루는 특정 모델 객체를 세션에 넣고 공유할 때 사용한다. 반면, `@SessionAttribute` 는 컨트롤러 밖(인터셉터 또는 필터 등)에서 만들어 준 데이터에 접근할 때 사용할 수 있다.

HTTP 세션에 들어 있는 값을 참조할 때 사용한다. `HttpSession.getAttribute("세션애트리뷰트")` 를 사용할 수 있지만, `@SessionAttribute` 는 타입 변환을 자동으로 지원하기 때문에 조금 더 편리하다. HTTP 세션에 데이터를 넣고 빼고 싶은 경우에 `HttpSession` 을 사용하면 좋다.



<br />

브라우저에 URL을 입력하면 HttpServletRequest 요청을 보내게 되는데, `DispatcherServlet` 이 컨트롤러를 호출하게 된다. 인터셉터를 만들면 중간에 이 요청을 가로채서 원하는 일을 할 수 있다. 우리는 이 때 현재시간을 세션에 넣어주도록 하자.

```java
public class VisitTimeInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession();
        if (session.getAttribute("visitTime") == null) {
            session.setAttribute("visitTime", LocalDateTime.now());
        }
        return true;
    }
}
```

<br />

자바 웹 설정에 이 인터셉터를 등록해주면 된다.

```java
@Configuration
public class StoreWebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new VisitTimeInterceptor());
    }
}
```

```java
@GetMapping("/news/list")
    public String getNews(@SessionAttribute LocalDateTime visitTime) {
        System.out.println("visitTime: " + visitTime);
        return "/news/list";
    }
```



이제 같은 URL을 여러번 호출해보면서 확인해보면, 모두 처음에 시간이 잘 찍혀나오는 것을 확인할 수 있다.



<br />

---

## RedirectAttributes



위의 작업을 수행했다면, 처음에 `/news/form/title` 페이지에가서 제목을 입력하고, `/news/form/limit` 에 가서 limit 값을 입력했을 것이다. 그 후 `/news/form/list` 가 리다이렉트 될것이다.

리다이렉트 시 기본적으로 `Model` 에 들어있는 primitive type 데이터는 URI 쿼리 매개변수에 추가된다. 따라서 아래처럼 표시된다.

```shell
http://localhost:8080/news/list?title=wordtory&limit=10
```



스프링부트에서는 이 기능이 기본적으로 비활성화 되어있는데, 아래방법을 사용해서 활성화할 수 있다.

**application.properties**

```shell
spring.mvc.ignore-default-model-on-redirect=false
```

**Controller**

```java
@PostMapping("/news/form/limit")
public String newsFormLimitSubmit(@Validated @ModelAttribute News news,
                                  BindingResult bindingResult,
                                  Model model) {
  if (bindingResult.hasErrors()) {
    return "/news/form-limit";
  }
  
  // 모델에 값을 넣어준다.
  model.addAttribute("title", news.getTitle());
  model.addAttribute("limit", news.getLimit());

  return "redirect:/news/list";
}
```

<br />

 같은 작업을 `RedirectAttributes` 를 사용해서 해보자.

application.properites 에는 설정할 것이 따로 없다.

`RedirectAttributes` 를 핸들러 아규먼트로 받아와서 들어갈 속성들을 추가해주면 된다. 원하는 값만 리다리엑트에서 전달할 수도 있다.

```java
@PostMapping("/news/form/limit")
public String newsFormLimitSubmit(@Validated @ModelAttribute News news,
                                  BindingResult bindingResult,
                                  RedirectAttributes attributes) {
  if (bindingResult.hasErrors()) {
    return "/news/form-limit";
  }
  
  // Redirect Attribute 추가
  attributes.addAttribute("title", news.getTitle());
  attributes.addAttribute("limit", news.getLimit());

  return "redirect:/news/list";
}
```

<br />

**RequestParam 으로 파라미터 받아오기**

```java
@GetMapping("/news/list")
public String getNews(@RequestParam String title,
                      @RequestParam Integer limit,
                      Model model) {

  News requestParamNews = new News();
  requestParamNews.setTitle(title);
  requestParamNews.setLimit(limit);

  List<News> newsList = new ArrayList<>();
  newsList.add(requestParamNews);

  model.addAttribute(newsList);
  return "/news/list";
}
```



**@ModelAttribute 로 받아오기**

ModelAttribute 로 받아올 때는 주의할 점이 있다. 기존에 `@SessionAttributes` 안에 있던 세션 속성이름과 같게 받아오면 안된다는 것이다. 그렇게 되면 기존에 있던 것을 탐색하다가 없으면 가져오지 못해 500 에러를 발생시킨다. 그래서 기존 속성에 없을법한 이름을 임의로 지어서 ModelAttribute 를 사용했다.(`myRedirectedNews`)

```java
@GetMapping("/news/list")
public String getNews(@ModelAttribute("myRedirectedNews") News news,
                      Model model) {
  List<News> newsList = new ArrayList<>();
  newsList.add(news);

  model.addAttribute(newsList);
  return "/news/list";
}
```

<br />

---

## Flash Attributes



FlashAttributes 는 주로 리다이렉트 시 데이터 전달을 위해 사용한다. 데이터가 URL 에 노출되지 않고, 임의 객체를 저장할 수 있으며 보통 HTTP 세션을 사용합니다. 그리고 `Redirect` 하기 전에 데이터를 HTTP 세션에 저장하고, 리다이렉트 요청을 처리 한 다음 즉시 제거한다.

이름이 플래시인 이유도, 리다이렉트 되었을 때 세션에 저장된 값들이 삭제되기 때문이다.

```java
@PostMapping("/news/form/limit")
public String newsFormLimitSubmit(@Validated @ModelAttribute News news,
                                  BindingResult bindingResult,
                                  RedirectAttributes attributes) {
  if (bindingResult.hasErrors()) {
    return "/news/form-limit";
  }
  attributes.addFlashAttribute("myRedirectedNews", news);

  return "redirect:/news/list";
}
```

```java
@GetMapping("/news/list")
public String getNews(Model model) {

  News myRedirectedNews = (News) model.asMap().get("myRedirectedNews");

  List<News> newsList = new ArrayList<>();
  newsList.add(myRedirectedNews);
 
  model.addAttribute(newsList);
  return "/news/list";
}
```



테스트는 아래와 같이할 수 있다.

인터셉어세어 세션값으로 집어너주었던 `visitTime`,

그리고 flashAttribute 에서 만들었던 myRedirectedNews 를 속성으로 넣어준다.

그리고 상태가 정상인지 확인하고, xpath (xml path) 경로가 잘 맞는지 확인한다.

```java
@Test
public void getNewsFlashAttribute() throws Exception {
  News news = new News();
  news.setTitle("Wordtory");
  news.setLimit(1000);

  mockMvc.perform(get("/news/list")
                  .sessionAttr("visitTime", LocalDateTime.now())
                  .flashAttr("myRedirectedNews", news))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(xpath("//p").nodeCount(2))
    ;
}
```









