# Spring Web MVC 004 - Springboot와 MVC



JSP 제약 사항

* jar 프로젝트로는 만들 수 없다. war 로 만들어야 한다.
* `java -jar` 명령어로 실행은 할 수 있지만, 실행가능한 jar 파일은 지원하지 않는다.
* undertow 는 jboss에서 만든 서블릿 컨테이너인데, 여기서는 jsp 를 지원하지 않는다.
* whitelabel 에러 파이지를 error.jsp 로 오버라이딩 할 수 없다.

<br />

JSP 실행 방법

1) java -jar

```shell
$ java -jar /target/*.war
```

위 명령어로 war 파일을 실행시킬 수 있다.



2) SpringApplication.run 사용

IDE 에서 run 을 클릭해서 실행한다.



3) 서블릿 컨테이너(톰캣)에 WAR 배포하여 실행하기

> WAR : Web Application Archive

SpringBootServletInitializer (WebApplicationInitializer) 를 사용하면된다. 톰캣을 다운로드 받고, 인텔리제이와 연동해서 실행시키면 된다.

<br />

1)과 2) 는 스프링 애플리케이션에 내장톰캣이 들어가는 경우이고, 3)은 서블릿 컨테이너(톰캣) 안에 WAR 가 배포되어 들어간다는 점에서 다르다.



<br />

---

## Formatter 설정



구현할 컨트롤러를 보자. url 요청시 컨텐츠를 아래와 같이 반납하는 것이 목표이다.

```java
@WebMvcTest
class MvcControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void mvc() throws Exception {
        this.mockMvc.perform(get("/mvc/jack"))
                .andDo(print())
                .andExpect(content().string("mvc, jack"));
    }
}
```

`@PathVariable` 을 이용해서 url 을 통해 변수를 받은 후, 리턴 값에 적용할 수 있다.

```java
@RestController
public class MvcController {

    @GetMapping("/mvc/{name}")
    public String mvc(@PathVariable String name) {
        return "mvc, " + name;
    }
}
```

<br />

한편, 이런식으로 객체를 받아와서 `get` 메소드를 통해 리턴 값을 전달하는 방법도 있을 것이다.

```java
@RestController
public class MvcController {

    @GetMapping("/mvc/{name}")
    public String mvc(@PathVariable Person person) {
        return "mvc, " + person.getName();
    }
}
```

이럴 때는 파라미터를 자동으로 string 타입으로 바꿔줄 포매터가 필요하다.

```java
@Component
public class PersonFormatter implements Formatter<Person> {
    @Override
    public Person parse(String text, Locale locale) throws ParseException {
        Person person = new Person();
        person.setName(text);
        return person;
    }

    @Override
    public String print(Person object, Locale locale) {
        return object.toString();
    }
}
```

테스트도 살짝 고쳐준다. `@WebMvcTest` 는 웹에 관련된 빈만 등록해주고 테스트를 진행하므로 오류가 난다. 통합 테스트인 `@SpringBootTest` 를 사용하고, `@AutoConfigureMockMvc` 으로 mockMvc 를 사용하는 환경을 만들자. (WebMvcTest 에서는 자동 제공)

```java
@SpringBootTest
@AutoConfigureMockMvc
class MvcControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void mvc() throws Exception {
        this.mockMvc.perform(get("/mvc/jack"))
                .andDo(print())
                .andExpect(content().string("mvc, jack"));
    }
}
```

`http://localhost:8080/mvc?name=jack` 이런 식의 요청을 주는 방법으로 바뀐다.



<br />

---

## DomainClassConverter



위에서 포매터를 직접 구현했었다.  다른 방법으로 이를 해결해보자.

Spring Data JPA 의 도메인 클래스 컨버터는 도메인 객체에 관련된 컨버터를 자동으로 등록해준다.

```java
@SpringBootTest
@AutoConfigureMockMvc
class MvcControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    PersonRepository personRepository;

    @Test
    public void mvc() throws Exception {
        Person person = new Person();
        person.setName("jack");
        Person savedPerson = personRepository.save(person);

        this.mockMvc.perform(get("/mvc")
                            .param("id", savedPerson.getId().toString()))
                .andDo(print())
                .andExpect(content().string("mvc, 1"));
    }
}
```

```java
@RestController
public class MvcController {
  
    @GetMapping("/mvc")
    public String mvc(@RequestParam("id") Person person) {
        return "mvc, " + person.getId();
    }
}
```

<br />

---

## 핸들러 인터셉터

HandlerInterceptor 는 핸들러 매핑에 설정할 수 있는 인터셉터이다. 핸들러를 실행하기 전, 후(렌더링 전), 렌더링 후 인터셉터를 통해 시점에 부가 작업을 할 수 있다. 또한 여러 핸들러에서 반복적으로 일어나는 코드를 줄이고 싶을 때 사용할 수 있다. (로깅, 인증 체크, Locale 변경 등)



대략 아래의 모습과 같다. (여러 개가 있을 때 호출 순서도 확인)

```java
// preHandle 1
// preHandle 2
// 요청 처리
// postHandle 2
// postHandle 1
// 뷰 렌더링
// afterCompletion 2
// afterCompletion 1
```

**`boolean preHandle(request, response, handler)`** 

* 핸들러 실행 전 호출 된다. 서블릿 필터 보다 세밀한 로직 구현이 가능하다. 반환값으로 다음 인터셉터 또는 핸들러로 요청, 응답을 전달할지(true), 끝낼지(false) 결정할 수 있다.

**`void postHandle(request, response, modelAndView)`**

* 핸들러 실행 후, 뷰 렌더링 전에 호출된다. 모델 정보를 담아 전달할 수 있다. 인터셉터 역순으로 호출된다. 비동기적 요청 처리시는 호출되지 않는다.

**`void afterCompletion(request, response, handler, ex)`**

* 뷰 렌더링 끝난 뒤 호출 된다. `preHandler` 에서 true 로 리턴한 경우만 호출된다. 인터셉터 역순으로 호출된다. 비동기적 요청 처리시는 호출되지 않는다.



**서블릿 필터와의 차이**

* 서블릿 보다 더 구체적인 처리가 가능하다. 일반적인 기능을 구현할 때는 서블릿 필터로, 스프링 로직에 관한 내용은 핸들러 인터셉터로 구현한다.
* 예시) XSS 를 차단할 수 있는 기능을 만들 때는 서블릿 필터에 구현을 해야할 것이다. (스프링과 관련 없음)

<br />

**구현**

```java
public class GreetingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle 1");
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle 1");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion 1");
    }
}
```

이렇게 `HandlerInterceptor` 를 구현하여 인터셉터를 만들고, 이와 같은 종류의 인터셉터를 이름만 달리하여 1개더 만든다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new GreetingInterceptor());
        registry.addInterceptor(new AnotherInterceptor());
    }
}
```

실행하고, 특정 요청을 실행하면, 인터셉터가 작동하는 것을 확인할 수 있다.





<br />

---

## 리소스 핸들러



> 정적 리소스 : 이미지, 자바스크립트, CSS, HTML 파일 등

리소스핸들러는 정적 리소스를 처리하는 핸들러를 제공한다.

**Default 서블릿**은 서블릿 컨테이너가 기본으로 제공하는 서블릿이다. 정적인 리소스를 처리할 때 사용한다. 

스프링 MVC 리소스 핸들러 맵핑을 등록은 가장 낮은 우선 순위로 등록된다. 다른 핸들러 맵핑이 "/" 이하 요청을 처리하도록 허용하고, 최종적으로 리소스 핸들러가 처리하도록 된다. 결국 우리가 만든 리소스 핸들러가 맨 나중에 잘 적용이 된다.



**리소스 핸들러 설정**

스프링부트는 기본 정적 리소스 핸들러와 캐싱을 제공한다.

 resources/static 경로는 기본적으로 정적 리소스 경로로 설정되어 있다.

**테스트 코드**

```java
@Test
public void helloStatic() throws Exception {
  this.mockMvc.perform(get("/index.html"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(content().string(Matchers.containsString("index")));
}
```

**static/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
<h1>Hello Index</h1>
</body>
</html>
```



**커스텀 정적 핸들러 추가**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/mobile/**") // 리소스 요청 패턴
                .addResourceLocations("classpath:/mobile/") // 리소스를 찾을 위치
                .setCacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES)) // 캐싱
//          			.resourceChain(true) 캐시를 사용하면 true, 아니면 false
          ;
    }
}

```

> `ResourceResolver` 는 요청에 해당하는 리소스를 찾는 전략이다. 캐싱, 인코딩(gzip, brotli), WebJar 등이 있다.
>
> `ResourceTransformer` 는 응답으로 보낼 리소스를 수정하는 전략이다. 캐싱, CSS링크, HTML5 AppCache 등이 있다.

`resources/mobile/index.html` 을 위처럼 똑같이 만든다.

**테스트 코드**

```java
@Test
public void helloStatic() throws Exception {
  this.mockMvc.perform(get("/mobile/index.html"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(content().string(Matchers.containsString("mobile")))
    .andExpect(header().exists(HttpHeaders.CACHE_CONTROL))
    ;
}
```

테스트는 성공적으로 완료된다.

이제 애플리케이션에서 실행시킨 후 브라우저에서 `http://localhost:8080/mobile/index.html` 를 요청해보자.

그리고 `f12`를 눌러서 개발자도구를 보면, 200 응답코드(정상)가 나온 것을 확인할 수 있다. 하지만, 여기서 같은 주소를 재요청하면 304 응답코드가 나온다. 304는 Not Modified 로, 캐시에 저장된 정적 파일을 그대로 불러왔으므로 달라진게 없다는 응답 신호이다. 따라서 새로 정적 리소스를 가져오지 않았기 때문에 네트워크를 효율적으로 활용하게 되었다.

