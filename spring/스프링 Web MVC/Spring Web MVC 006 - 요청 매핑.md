# Spring Web MVC 006 - 요청 매핑





## HTTP Method

HTTP 메소드에는 GET, POST, PUT, PATCH, DELETE 등이 있다.



예제를 하나 만들어보자.

**컨트롤러**

```java
@Controller
public class BookController {

    @RequestMapping(value = "/bookstore")
    @ResponseBody
    public String bookStore() {
        return "Welcome book store";
    }
}
```

**테스트 코드**

```java
@WebMvcTest
class BookControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void bookStoreTest() throws Exception {
        mockMvc.perform(get("/bookstore"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Welcome book store"))
        ;
    }
}
```

테스트코드에서 get 뿐만 아니라, post, put, delete 요청 모두 가능하다.

`@RequestMapping` 은 기본적으로 모든 메소드를 지원하기 때문이다.

<br />

특정 메소드만 지정하려면 아래와 같이 변경한다.

예를 들어 get 만 요청하려면 method 에 `GET` 을 추가한다. 

```java
@RequestMapping(value = "/bookstore", method = RequestMethod.GET)
@ResponseBody
public String bookStore() {
  return "Welcome book store";
}
```

`@RequestMapping(value = "/bookstore", method = RequestMethod.GET)` 는 `@GetMapping("/bookstore")` 로 바꿀 수 있다.

```java
@Test
public void bookStoreTest() throws Exception {
  mockMvc.perform(put("/bookstore"))
    .andDo(print())
    .andExpect(status().isMethodNotAllowed())
    ;
}
```

get 메소드를 받게 해놓고 예를 들어 put 요청을 하면 `405` 에러가 난다. 주어진 메소드 (put) 를 사용할 수 없다는 에러이다. 

따라서 `isMethodNotAllowed` 테스트는 성공적으로 테스트가 완료된다.

<br />

여러 메소드의 요청을 허락하고 싶은 경우는 `@RequestMapping(method = {RequestMethod.GET, RequestMethod.POST})` 등으로 해주면 된다.

<br />

| 요청       | 내용                                                         |
| ---------- | ------------------------------------------------------------ |
| **GET**    | - 클라이언트가 서버의 리소스를 요청할 때 사용한다.<br />- 캐싱이 가능해서 조건적으로 GET 요청 로직이 바뀔 수 있다. 예를 들어 GET 요청을 전에 받아온 적이 있는 상태에서 다시 GET 요청을 하면 응답코드 200(정상)이 아닌 304(수정되지 않음)이 나온다. 캐시로 효율적인 자원 관리를 한 셈이다.<br />- 브라우저 기록에 남는다. 북마크 할 수 있다.<br />- URL에 정보가 다 보이므로 민감한 데이터를 보낼 때 사용해서는 안된다.<br />- idemponent 하다. |
| **POST**   | - 클라이언트가 서버의 리소스를 수정하거나 새로 만들 때 사용한다.<br />- 서버에 보내는 데이터를 POST 요청 본문에 담는다.<br />- 캐시할 수 없다.<br />- 브라우저 기록에 남지 않는다. 북마크 할 수 없다.<br />- 데이터 길이의 제한이 없다. |
| **PUT**    | - URI에 해당하는 데이터를 새로 만들거나 수정할 때 사용한다.<br />- POST 의 URI 는 보내는 데이터를 처리할 리소스를 지칭한다. 반면, PUT 의 URI 는 보내는 데이터에 해당하는 리소스를 지칭한다.<br />- idemponent 하다. |
| **PATCH**  | - PUT 과 비슷하다. 다른점은 기존 엔티티와 새 데이터의 차이점만 보낸다는 것이다.<br />- idemponent 하다. |
| **DELETE** | - URI에 해당하는 리소스를 삭제한다.<br />- idemponent 하다.  |

> *  `idemponent` : 멱등성이라 하고, 동일한 `GET` 요청은 항상 동일한 결과를 반환해야 한다는 속성이다.
>
> * POST vs PUT
>
>   똑같은 일련번호를 가진 게시글 2개를 올릴 때를 가정해보자. POST 의 경우 똑같은 게시글이 2개 만들어진다. 따라서 첫번째와 두번째는 다른결과가 나오므로 멱등성을 만족하지 못한다. PUT 의 경우는 첫 번째에 게시글이 생성되고, 두 번째는 같은 번호를 가진 게시글이 중복되므로 더 이상 만들지지지 않는다. 따라서 계속 반복하여도 결과는 같으므로 멱등성을 만족한다.



<br />

---

## URI 패턴



스프링 MVC 는 여러 URI 패턴의 매핑을 지원한다.

1. 요청 식별자로 매핑

   `@RequestMapping` 에서 ?(한글자 동일), *(여러글자 동일), \*\*(슬래시 하위 모든 패턴도 포함) 패턴을 지원한다.

2. 클래스위에 선언한 `@RequestMapping` 에서의 URI 패턴을 기본으로 하여 메소드 위에 `@RequestMapping` URI 를 이어 붙여 매핑이 가능하다.

3. 정규 표현식으로 매핑이 가능하다.

   예) `/{name:[a-z]+}` 는 name 으로 올 문자열이 [a-z]+ 라는 정규표현식에 맞는 요청만 처리한다.

   > [a-z]+ 는 한 개이상의 소문자 알파벳을 의미한다.

4. 패턴이 중복되는 경우, 가장 구체적으로 매핑되는 핸들러를 선택한다.

   예) `/**` 보다 `/name` 이 우선순위이다.

5. URL 확장자 매핑 지원

   스프링 MVC 에서는 `/index` 라고 매핑하면, `/index.html`, `/index.json`, `/index.xml` 등의 확장자를 자동으로 매핑해준다.

   하지만 스프링부트에서는 이 기능을 지원하지 않는다. 보안상의 이슈가 있기 때문이다.

   또한 URI 변수, Path 매개변수, URI 인코딩을 사용할 때 불명확해지므로 URL 확장자 매핑은 권장하지 않는다. 최근에는 accept 헤더에 무슨 타입으로 반환받기를 원하는지 판단하는 방식을 많이 사용한다.

   그래도 사용하려면, `/index.*` 이런식으로 표현하여 매핑하건, 요청 파라미터를 사용한다. `/index?type=xml`

> RFD Attack (Reflected File Download Attack)
>
> 예를 들어 브라우저에서 확장자 파일을 .zip 으로 설정하면 자동으로 리소스를 다운받게 된다. (과거) 이를 확장해서, 사용자는 정상적인 URI 을 입력해서 특정 서버에 접속했는데 마치 앞선 사례처럼 되어버려 임의 파일이 다운로드 된다. 사용자가 그 파일을 열면, 특정 정보를 서버로 전송한다던가, 쿠기정보를 다 가져간다던가 등의 일이 가능해진다. 하지만 이제는 RFD 공격을 막기 위해 헤더정보에 표시를 해두므로 이전보다는 안전하다.



<br />

---

## 미디어 타입 매핑



**Content-Type 매핑**

특정 타입의 요청만 처리하는 핸들러는 `@RequestMapping(consumes=)` 옵션으로 지정한다.

테스트코드의 경우 `content-type` 헤더를 입력하여 요청메시지를 보낸다.  content-type 이 매칭되지 않는 경우 경우 에러 415 (Unsupported Media Type) 응답이 발생한다.

```java
@Controller
public class BookController {

    @GetMapping(value = "/bookstore",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String bookStore() {
        return "Welcome book store";
    }
}
```

`MediaType.APPLICATION_JSON_VALUE` 은 `"application/json"` 문자열과 같다. 스프링에서 상수로 제공된다. 자동완성으로 간편한 코딩과 동시에, 오탈자를 방지할 수 있다.



```java
@WebMvcTest
class BookControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void bookStoreTest() throws Exception {
        mockMvc.perform(get("/bookstore")
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andDo(print())
                .andExpect(status().isOk())
        ;
    }
}
```



**Accept 타입 매핑**

특정 타입의 응답을 만드는 핸들러는 `@RequestMapping(produces=)` 를 이용한다.

테스트코드에서는 Accept 헤더로 필터링이 가능하다. 매칭되지 않는 경우에는 406 (Not Acceptable) 에러 응답이 돌아온다.

```java
@Controller
public class BookController {

    @GetMapping(value = "/bookstore",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseBody
    public String bookStore() {
        return "Welcome book store";
    }
}
```

```java
@WebMvcTest
class BookControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void bookStoreTest() throws Exception {
        mockMvc.perform(get("/bookstore")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
        ;
    }
}
```



`@RequestMapping` 은 클래스에서 선언한 경우와 메소드에 선언한 경우가 있을 때 둘의 특성이 조합되는 것이 아니라, 메소드에 사용한 설정으로 덮여쓰인다. 





<br />

---

## 헤더와 파라미터 매핑



위에서 다루었던 방법보다 좀 더 일반적 방법이다.

`@RequestMapping` 에서 헤더정보를 추가할 수 있다.

* `header = "key"` : 특정 헤더가 있는 요청을 처리하고 싶을 때 사용

* `header = "!key"` : 특정 헤더가 없는 요청을 처리하고 싶을 때 사용

* `header = "key=value"` : 특정 헤더 키/값이 있는 요청을 처리하고 싶을 때 사용

  ```java
  @WebMvcTest
  class BookControllerTest {
  
      @Autowired
      MockMvc mockMvc;
  
      @Test
      public void bookStoreTest() throws Exception {
          mockMvc.perform(get("/bookstore")
                          .header(HttpHeaders.AUTHORIZATION, "auth"))
                  .andDo(print())
                  .andExpect(status().isOk())
          ;
      }
  }
  ```

  ```java
  @Controller
  public class BookController {
  
      @GetMapping(value = "/bookstore", headers = HttpHeaders.AUTHORIZATION + "=auth")
      @ResponseBody
      public String bookStore() {
          return "Welcome book store";
      }
  }
  ```

  

* `params = "a"` :  특정 요청 매개변수 키를 가진 요청을 처리하고 싶을 때 사용

* `params = "!a"` :  특정 요청 매개변수 키를 가지지 않은 요청을 처리하고 싶을 때 사용

* `params = "a=b"` :  특정 요청 매개변수 키/값을 가진 요청을 처리하고 싶을 때 사용

  ```java
  @WebMvcTest
  class BookControllerTest {
  
      @Autowired
      MockMvc mockMvc;
  
      @Test
      public void bookStoreTest() throws Exception {
          mockMvc.perform(get("/bookstore")
                          .param("a","b"))
                  .andDo(print())
                  .andExpect(status().isOk())
          ;
      }
  }
  ```

  ```java
  @Controller
  public class BookController {
  
      @GetMapping(value = "/bookstore", params = "a=b")
      @ResponseBody
      public String bookStore() {
          return "Welcome book store";
      }
  }
  ```

  

  

`consumes` 는 `headers = HttpHeaders.CONTENT_TYPE` 과 동일한 옵션이며,

`products` 또한 `headers = HttpHeaders.ACCEPT` 와 동일한 옵션이었음을 알 수 있다.



<br />

---

## HEAD 와 OPTIONS



HEAD와 OPTIONS 는 따로 구현하지 않아도 스프링 웹 MVC 에서 자동으로 처리가 되는 HTTP method 이다.

**HEAD** 는 GET 요청과 동일하지만 응답 본문을 받아오지 않고 응답헤더만 받아오는 기능이다.

```java
@Test
public void bookStoreTest() throws Exception {
  mockMvc.perform(head("/bookstore"))
    .andDo(print())
    .andExpect(status().isOk())
    ;
}
```

응답 본문은 받아지지 않는다.

<br />

**OPTIONS** 는 사용할 수 있는 HTTP method 를 제공하며, 서버 또는 특정 리소스가 제공하는 기능을 확인할 수 있다. 서버는 Allow 응답 헤더에 사용할 수 있는 Http method 목록을 제공해야 한다.

같은 URL 에 아래와 같이 GET, POST 매핑이 둘 다 되어있다고 가정해보자.

```java
@Controller
public class BookController {

    @GetMapping(value = "/bookstore")
    @ResponseBody
    public String bookStore() {
        return "Welcome book store";
    }

    @PostMapping("/bookstore")
    @ResponseBody
    public String bookStorePost() {
        return "bookstore post";
    }
}
```

테스트 코드에 `options()` 를 넣어준다.

```java
@Test
public void bookStoreTest() throws Exception {
  mockMvc.perform(options("/bookstore"))
    .andDo(print())
    .andExpect(status().isOk())
    ;
}
```

테스트를 실행시키면 응답 코드에서 아래 4가지 옵션이 나온 것을 확인할 수 있다. GET 과 POST 는 우리가 만들어준 컨트롤러에서 제공을 하고, HEAD 와 OPTIONS 는 스프링 웹 MVC 가 기본으로 제공한다.

```shell
Headers = [Allow:"POST,GET,HEAD,OPTIONS"]
```

<br />

테스트 코드에 이 옵션들이 모두 있는 것을 확인하는 코드를 만들어보자.

```java
@WebMvcTest
class BookControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void bookStoreTest() throws Exception {
        mockMvc.perform(options("/bookstore"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(header().stringValues(HttpHeaders.ALLOW,
                        hasItems(
                                containsString("GET"),
                                containsString("POST"),
                                containsString("HEAD"),
                                containsString("OPTIONS")
                        )))
        ;
    }
}
```

코드가 조금 번거롭긴 하지만 잘 작동한다. 위처럼하면 옵션들의 순서를 지키지 않아도 된다.



<br />

---

## 커스텀 애노테이션



클래스 위에 있는 애노테이션을 메타 애노테이션이라 한다. 메타 에노테이션이 붙어있는 것은 composite 애노테이션이라 한다. 

예를 들자면,

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RequestMapping(method = RequestMethod.GET)
public @interface GetMapping { ...
```

`@GetMapping` 은 composite 애노테이션이며, 이 위에 붙어있는 것들은 모두 메타 애노테이션이라 할 수 있다.

<br />

**메타 애노테이션**

* 애노테이션으로 사용할 수 있는 애노테이션이다. 스프링이 제공하는 대부분 애토에시녀은 메타 애노테이션이다. 그런데 `@GetMapping` 은 아니다. 따라서 요청 매핑 관련 애노테이션을 커스터마이징 할 때는 `@RequestMapping` 을 사용한다.

<br />

**`@Retention`**

애노테이션은 기본값으로 `RetentionPolicy.CLASS` 를 가진다. 컴파일되고 클래스 파일에는 남아있을 수 있다. 하지만 클래스로더가 클래스파일 바이트코드를 읽어올 때 이 애노테이션에 대한 정보는 사라진다. 즉,  런타임에는 사라진다. 

애노테이션을 언제까지 지속할지 정보를 설정할 수 있다. `RetentionPolicy.RUNTIME` 으로 설정하면 된다.

만약 애노테이션을 주석처럼 쓰고 싶다면, `RetentionPolicy.SORUCE` 로 바꾸어주면 된다. 컴파일 후에는 `.class` 파일에는 이 어노테이션이 남아있지 않게 된다.

<br />

```java
@Retention(RetentionPolicy.RUNTIME)
@RequestMapping(method = RequestMethod.GET, value = "book")
public @interface GetBookMapping {
}
```

```java
@Controller
public class BookController {

    @GetBookMapping
    @ResponseBody
    public String bookStore() {
        return "Welcome book store";
    }
}
```

```java
@WebMvcTest
class BookControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void bookStoreTest() throws Exception {
        mockMvc.perform(get("/book"))
                .andDo(print())
                .andExpect(status().isOk())
        ;
    }
}
```

위처럼 코드를 구성하면 정상적으로 작동한다.



<br />

**`@Target`**

* 애노테이션을 어디에 사용할 수 있는지 결정할 수 있다. 메소드 위에서 사용하고 싶다면 `ElementType.METHOD` 를 써주면 된다. 기본값이다. 여러 조건을 설정하려면 컴마 찍고 여러개 적어주면 된다. (`ElementType.CONSTRUCTOR` : 생성자 위 등)

<br />

**`@Documented`**

* 애노테이션을 사용한 코드의 문서에 이 애노테이션에 대한 정보를 표기할지 설정한다.



