# Springboot 009 - Web MVC



홈페이지에 메인 화면인 웰컴페이지를 만들어보자.

index.html 을 찾아보고 있으면 제공한다. 또는 index.템플릿이 리소스 경로 위치에 있으면 자동으로 메인 페이지가 된다.

둘 다 없으면 White label 에러페이지가 반환된다.

<br />

파비콘을 설정해보자.

파비콘이란 브라우저 탭에 왼쪽에 보이는 작은 아이콘을 말한다.

favicon.ico 파일을 리소스 파일안에 넣어주면 된다. [https://favicon.io/](https://favicon.io/) 에서 파비콘을 만들 수 있다.

등록했는 데 파비콘이 바뀌지 않으면 캐시가 지워지지 않아서 그럴 수 있으니, 브라우저를 새로고침고, 종료했다가 다시 켜보자.





<br />

---

## 템플릿 엔진



템플릿 엔진은 주로 뷰를 만들 때 사용한다.

코드 제너레이션, 이메일 템플릿 등을 만들 때도 사용한다.



스프링 부트가 자동 설정을 지원하는 템플릿 엔진은 FreeMarker, Groovy, Thymeleaf, Mustache 이다.

JSP 는 자동설정을 지원하지도 않고, 권장하지도 않는다. jar 패키징 할 때 동작하지 않고, war 로 패키징 해야하기 때문이고, 특히 톰캣이 아닌 undertow 웹서버의 경우는 jsp를 아예 지원하지 않는다.

<br />

템플릿 엔진 중 타임리프(Thymeleaf)를 간단히 사용해보자.

```xml
<!-- Thymeleaf -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

의존성을 추가한다.



컨트롤러를 하나 만들어서 /buy 요청을 했을 경우, 모델과 뷰네임을 리턴하도록 해보자.

```java
@Controller
public class BuyController {

    @GetMapping("/buy")
    public String buy(Model model) {
        model.addAttribute("name", "Apple");
        return "buy";
    }
}
```



그리고 resources/templates 에 뷰네임으로 된 html을 만들어보자.

**buy.html**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Buy</title>
</head>
<body>
    <h1>Market</h1>
    <p>Buy</p>
    <p th:text="${name}">name</p>
</body>
</html>
```

중요한 것은 html 에 thymeleaf 를 연결시켜 주어야 한다는 것이다. 2번째 줄 참고.

그리고 변수는  `${name}$` 처럼 변수 표현식을 통해 가져올 수 있다.



마지막으로 테스트 코드를 만들어보자.

```java
...
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void buy() throws Exception {
        mockMvc.perform(get("/buy"))
                .andExpect(status().isOk())
                .andExpect(view().name("buy"))
                .andExpect(model().attribute("name", is("Apple")))
                .andExpect(content().string(containsString("Apple")));
    }
}
```

get 요청을 보냈을 때,

응답코드를 올바르게 반환했는지,

뷰네임이 buy 가 맞는지,

모델 속성중 name 이라는 필드의 값이 Apple이 맞는지

HTTP 응답 내용중에 Apple을 포함하는지를 확인한다.





---

## HtmlUnit



HtmlUnit은 Html 을 단위테스트느 하기 위한 툴이다.

HTML 템플릿 뷰 테스트를 보다 전문적으로 하기 위함이다.

WebClient 객체를 만들고 요청을하며, 여러 기능을 사용할 수 있다.



pom.xml

```xml
 <dependency>
   <groupId>org.seleniumhq.selenium</groupId>
   <artifactId>htmlunit-driver</artifactId>
   <scope>test</scope>
 </dependency>

 <dependency>
   <groupId>net.sourceforge.htmlunit</groupId>
   <artifactId>htmlunit</artifactId>
   <scope>test</scope>
 </dependency>
```



```java
@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @Autowired
    WebClient webClient;

    @Test
    public void buy() throws Exception {
        HtmlPage page = webClient.getPage("/buy");
        HtmlHHeading1 h1 = page.getFirstByXpath("//p");
        assertThat(h1.getTextContent()).isEqualToIgnoringCase("Apple");
    }
}

```

WebClient 를 통해 위와 같이 테스트를 하면 된다.

















