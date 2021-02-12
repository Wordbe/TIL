# Spring Web MVC 005 - Message Converter



## HTTP 메시지 컨버터

요청 본문에서 메시지를 읽어들이거나 (`@RequestBody`), 응답 본문에 메시지를 작성할 때(`@ResponseBody`) 사용한다.



기본 HTTP 메시지 컨버터

* 바이트 배열 컨버터, 문자열 컨버터, Resource 컨버터
* Form 컨버터(폼 데이터 to/from MultiValueMap<String, String>)
* JAXB2 컨버터 (xml)
* Jackson2, Jackson, Gson 컨버터 (json)
* Atom 컨버터 - 아톰 피드
* RSS 컨버터 - RSS 채널

<br />

테스트. String 타입으로 본문을 전달한 후, String 타입으로 본문 반환.

```java
@Test
public void stringMessage() throws Exception {
  this.mockMvc.perform(get("/message")
                       .content("person"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(content().string("person"));
}
```

```java
@RestController
public class MvcController {
  
    @GetMapping("/message")
    public String message(@RequestBody String body) {
        return body;
    }
}
```



**설정 방법**

방법 1: 기본으로 등록해주는 컨버터에 새로운 컨버터를 추가한다 : `extendMessageConverters`

방법 2: 기본으로 등록해주는 컨버터는 무시하고, 새로 컨버터를 설정한다 : `configureMessageConverters`

방법 3: 의존성 추가로 컨버터를 등록한다. (추천한다.)

* 메이븐, 그래들 설정에 의존성을 추가하여 컨버터가 자동으로 등록되도록 한다.
* `WebMvcConfigurationSupport`는 스프링 웹 MVC 에서 제공하는 클래스이다.



스프링 부트를 사용한다면 기본적으로 spring-boot-starter-web > spring-boot-starter-json 에 JacksonJSON 2 가 들어있다. 즉, JSON 용 HTTP 메시지 컨버터가 기본으로 등록되어 있다.

<br />

### HTTP 메시지 컨버터 (JSON)

테스트 코드. 이번에는 컨트롤러에서  json 객체를 받고, Person 객체를 리턴한다. 스프링부트를 사용하였기 때문에 중간에 JacksonJSON 2 가 메시지 컨버터 역할을 하여, 리턴된 Person 타입의 객체를 json 으로 바꾸어서 화면에 뿌리게 된다.

```java
@Autowired
ObjectMapper objectMapper;

@Test
public void jsonMessage() throws Exception {
  Person person = new Person();
  person.setId(2021l);
  person.setName("jack");

  String jsonString = objectMapper.writeValueAsString(person);

  this.mockMvc.perform(get("/jsonMessage")
                       .contentType(MediaType.APPLICATION_JSON)
                       .accept(MediaType.APPLICATION_JSON)
                       .content(jsonString))
    .andDo(print())
    .andExpect(status().isOk())
    ;
}
```

```java
@RestController
public class MvcController {

    @GetMapping("/jsonMessage")
    public Person jsonMessage(@RequestBody Person person) {
        return person;
    }
}
```



<br />

### HTTP 메시지 컨버터 (XML)



**의존성 추가(gradle)**

```shell
dependencies {
	...
  implementation 'javax.xml.bind:jaxb-api'
  implementation 'org.glassfish.jaxb:jaxb-runtime'
  implementation 'org.springframework:spring-oxm'
}
```



**빈 등록**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public Jaxb2Marshaller jaxb2Marshaller() {
        Jaxb2Marshaller jaxb2Marshaller = new Jaxb2Marshaller();
        jaxb2Marshaller.setPackagesToScan(Person.class.getPackageName());
        return jaxb2Marshaller;
    }
}
```

도메인 클래스에 어노테이션 추가

```java
@XmlRootElement
public class Person { ...
```



**테스트 코드**

```java
@Autowired
Marshaller marshaller;

@Test
public void xmlMessage() throws Exception {
  Person person = new Person();
  person.setId(2021l);
  person.setName("jack");

  StringWriter stringWriter = new StringWriter();
  StreamResult streamResult = new StreamResult(stringWriter);
  marshaller.marshal(person, streamResult);
  String xmlString = stringWriter.toString();

  this.mockMvc.perform(get("/xmlMessage")
                       .contentType(MediaType.APPLICATION_XML)
                       .accept(MediaType.APPLICATION_XML)
                       .content(xmlString))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(xpath("person/name").string("jack"))
    .andExpect(xpath("person/id").string("2021"))
    ;
    }
```

성공적으로 테스트가 완료되었다.





<br />

---

## + WebMvcConfigruer 설정



| 설정                | 내용                                                         |
| ------------------- | ------------------------------------------------------------ |
| CORS 설정           | - Cross Origin 요청처리 설정으로, 같은 도메인에서 온 요청이 아니더라도 처리를 허용하고 싶을 때 사용한다. |
| 리턴값 핸들러       | - 스프링 MVC가 제공하는 기본 리턴 값 핸들러 외에 리턴 핸들러를 추가한다. |
| 아규먼트 리졸버     | - 스프링 MVC가 제공하는 기본 아규먼트 리졸버 외에 아규먼트 리졸버를 추가한다. |
| 뷰 컨트롤러         | - 단순하게 요청 URL을 특정 뷰로 연결하는 컨트롤러를 설정에서 바로 작성할 수 있다. |
| 비동기 설정         | - 비동기 요청 처리에서 사용할 Timeout, TaskExecutor를 설정할 수 있다. |
| 뷰 리졸버 설정      | - 핸들러에서 리턴하는 뷰이름에 해당하는 문자열을 View 인스턴스로 바꿔줄 뷰 리졸버를 설정한다. |
| Content Negotiation | - 요청 본문, 응답 본문을 어떤(MIME) 타입으로 보내야 하는지에 대한 전략을 설정한다. |



스프링부트에서 스프링 MVC를 설정할 때, 1. 우선 `application.properties` 에서 key, value 설정으로 해결이 가능한지 확인한다. 2. WebMvcConfigurer 를 구현하여 오버라이딩하여 설정을 추가한다. 3. @Bean 으로 MVC 설정을 직접 등록한다.







