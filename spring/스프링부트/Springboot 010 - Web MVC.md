# Springboot 010 - Web MVC



<br >

## ExceptionHandler



에러를 처리하는 클래스를 만들어보자. 스프링 MVC 에서 어노테이션 기반 에러처리이다.

/except 요청을 받을 시 예외객체를 리턴한다.

```java
@Controller
public class ExceptionController {

    @GetMapping("/except")
    public String except() throws SampleException {
        throw new SampleException();
    }

    @ExceptionHandler(SampleException.class)
    public @ResponseBody AppError sampleError(SampleException e) {
        AppError appError = new AppError();
        appError.setMessage("error.app.key");
        appError.setReason("IDK IDK");
        return appError;
    }
}

```

```java
public class SampleException extends Throwable {
}
```

```java
@Getter @Setter
public class AppError {
    private String message;
    private String reason;
}
```

예외객체 (SampleException) 가 리턴 될 때, `@ExceptionHandler` 가 앱에러 객체를 호출하는 방식으로, 에러 페이지를 만든다.

따라서 /except 요청이 떨어지면, 브라우저에는 메소드에서 세팅된 AppError 객체가 떨어진다. (xml로 전송된다.)

<br />

예외처리를 전역적으로 처리하려면, 에러를 다루는 클래스를 따로 만들고 그 위에 `@ControllerAdvice` 어노테이션을 붙인다. 그리고 그 안에 에러핸들러 메소드를 구현한다.

<br />

---

스프링부트가 제공하는 예외 처리기는 `@BasicErrorController` 이다. HTML과 JSON 응답을 지원한다.

BasicErrorController 위에는 `@RequestMapping("${server.error.path:${error.path:/error}}")` 어노테이션이 붙어있다.

 `{error.path:/error}` 는 error.path 에 리소스가 없으면 error 주소를 요청하는 표현식이다.

이것을 커스터마이징하려면 BasicErrorController를 상속받아 ErrorController를 구현하면 된다.

<br />



---

좀 더 손 쉬운 에러페이지를 만들어보자.

상태 코드값에 따라 여러 에러 페이지를 보여줄 수 있다.

resources/static/error 또는 resources/template/error 아래

404.html (404 에러시 반환할 페이지), 5xx.html(500번대 에러시 반환할 페이지) 를 만들어주면 된다.

<br />

**/resources/static/error/404.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h1>404</h1>
</body>
</html>
```





동적인 에러 컨트롤 등 커스텀 에러를 리졸브하려면 `ErrorViewResovler` 를 상속받아 새로운 클래스를 만들면 된다.







<br />

---

## Spring HATEOAS



> HATEOAS, Hypermedia As The Engine Of Application State 란?
>
> * REST API 를 충족시키는 개념 중 하나로, 서버는 현재 리소스와 연관된 링크 정보를 함께 클라이언트에게 제공하고, 클라이언트는 연관된 링크 정보를 바탕으로 리소스에 접근한다는 원칙이다.
> * 연관된 링크정보란 Relation 과 Href(Hypertext Reference)를 말한다. 예를 들어, market 이라는 릴레이션이 있다면, 이 정보와 함께 market 관련 하이퍼링크를 리소스에 담아 전송하는 것을 말한다.



Springboot에서 이를 사용하려면 아래 의존성을 추가한다.

**pom.xml**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
```



서비스와 서비스를 호출하는 컨트롤러를 만들어보자.

```java
@Getter @Setter @ToString
@Service
public class BuyService {

    private String name;
    private int amt;
}
```

```java
...
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
public class BuyController {

    @GetMapping("/buy")
    public EntityModel<BuyService> buyService() {
        BuyService buyService = new BuyService();
        buyService.setName("Apple");
        buyService.setAmt(3);

        // link 추가 (HATEOAS를 위해)
        EntityModel<BuyService> buyServiceEntityModel = new EntityModel<>(buyService);
        buyServiceEntityModel.add(linkTo(methodOn(BuyController.class).buyService()).withSelfRel());

        return buyServiceEntityModel;
    }
}

```

<br />

그리고 테스트코드를 만들어보자.

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BuyController.class)
class BuyControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void buy() throws Exception {
        mockMvc.perform(get("/buy"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._links.self").exists());
    }
}

```

테스트 출력 결과를 보면, 응답객체 body 에 아래와 같이 name, amt 필드 뿐만 아니라 

_links 필드가 들어온 것을 볼 수 있다.

Body = {"name":"Apple","amt":3,"_links":{"self":{"href":"http://localhost/buy"}}} 



<br />

HATEOAS 의존성을 추가하면 스프링부트가 다양한 것을 제공해주는데, 그 중 ObjectMapper 와 LinkDiscovers 가 있다.

`ObjectMapper` 는 리소스 객체를 json으로 또는 json을 객체로 변환할 수 있는 매퍼이다. Autowired로 주입해서 사용할 수도 있고, 프로퍼티 파일에서 spring.jackson.* 로 설정해서 사용할 수 있다.

`LinkDiscovers` 는 xpath 를 확장해서 만든 유틸리티성 클라이언트 API 이다. REST API 호출 시 hateoas 지원하는(링크, 하이퍼링크정보 포함하는) 요청이라면, 링크 정보(_links의 self 정보)를 메소드를 통해 가져올 수 있는 API이다.   





<br />

---

## CORS



### SOP와 CORS

웹 브라우저가 지원하는 기술이다.

SOP(Same Origin Policy) 는 같은 오리진에만 요청을 보낼 수 있다는 규약이다.

CORS(Cross Origin Resource Sharing) 는 서로 다른 오리진끼리 리소스를 공유할 수 있는 표준기법이다.



기본은 SOP가 적용 되어있다. 하나의 리소스는 하나의 오리진으로만 호출할 수 있다.

오리진이란 아래 3개를 조합한 주소이다. 

* URI 스키마 (http, https)
* hostname (co.wordbe, localhost 등)
* port (8080, 18080 등)

같은 출처(오리진)라는 것은 스키마, 호스트(포트까지) 가 같다는 것이다. http://localhost:8080 과 http://localhost:18080은 다른 출처다. 그래서 localhost:8080 출처는 localhost:8080/hello 에 접근가능하지만, localhost:18080은 그렇지 못하다. 이것이 작동할 수 있도록 CORS 를 활용해보자.



인텔리제이에서 프로젝트 2개를 만들어서 다른 포트로 실행시켜보자. (2개의 오리진을 만들자.)



#### localhost:8080

```java
@RestController
public class BuyController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}

```



어플리케이션을 실행시킨 뒤, localhost:8080/hello 에 접속한다.



<br />

#### localhost:18080



다른 프로젝트를 열고, 포트 설정부터 바꾸자.

application.properties

```shell
server.port=18080
```



resources/static/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
Index
<script src="/webjars/jquery/3.5.1/jquery.min.js"></script>
<script>
    $(function () {
        $.ajax("http://localhost:8080/hello")
            .done(function (msg) {
                alert(msg);
            })
            .fail(function () {
                alert("fail");
            })
    })
</script>
</body>
</html>
```

화면을 하나만들어서, jQuery를 이용해서 http://localhost:8080/hello 를 호출하면 결과값을 msg 파라미터로 받아서 알람창에 msg를 출력하게 하자.

이제 어플리케이션을 실행하면, 에러가 발생한다. SOP 위반이기 떄문이다.



localhost:8080 서버 코드로 가서 CORS 어노테이션을 달아주자.

```java
@CrossOrigin(origins="http://localhost:18080")
@RestController
public class BuyController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}


```



이제 18080 서버는 8080/hello 데이터를 받을 수 있게 된다.



---

스프링 MVC는 `@CrossOrigin` 으로 CORS 를 지원한다. `@Controller` 나 `@RequestMapping` 에 어노테이션을 추가하여 사용 할 수 있다.



혹은 WebMvcConfigurer 를 구현하여 만든 클래스 위에 `@CrossOrigin` 어노테이션을 달아서 글로벌하게 사용할 수도 있다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:18080");
    }
}
```













