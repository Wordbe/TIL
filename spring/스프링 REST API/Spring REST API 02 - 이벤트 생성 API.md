# Spring REST API 02 - 이벤트 생성 API



## 테스트



### @WebMvcTest

`@WebMvcTest` 는 슬라이싱 테스트다. 웹과 관련된 빈들을 등록해준다. `DispatcherServlet`, `EventController`, 여러 Data Handler, Mapper, Converter 가 조합이 된 상태로 진행되는 테스트이므로 단위테스트는 아니다.

또한 MockMvc 빈을 자동으로 등록해주므로, 그대로 주입하여 사용하면 편리하다.



### MockMvc

스프링 MVC 테스트의 핵심 클래스로, 웹 서버를 띄우지 않아도 스프링 MVC (DispatcherServlet)가 요청을 처리하는 과정을 확인할 수 있다. 때문에 컨트롤러 테스트로 자주 사용된다.



---

## Test1) 201 응답 받기





#### 1)  **Headers 의  `location` 정보에 링크(URI)를 받았는 지 확인한다.**

테스트 코드를 만들어보자.

POST 요청을 하고, 요청과 응답 결과를 프린트하고, 상태코드가 정상 생성(201)이 맞는지 확인해본다.

POST 요청시 컨텐츠 타입을 json으로 하고, 

```java
@WebMvcTest
public class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void createEvent() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaTypes.HAL_JSON)
                        )
          			.andDo(print())
                .andExpect(status().isCreated());

    }
}
```

* **HAL (Hypertext Application Language)** : application/hal+json 형식의 데이터 타입을 제공한다. self-descriptive message, HATEOAS 의 해결을 위한 용도이다.



컨트롤러를 아래와 같이 작성하고, 테스트를 진행해보자. HATEOAS를 만족하기 위해 응답값에 링크를 반영한다.

```java
...
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Controller
public class EventController {

    @PostMapping("/api/events")
    public ResponseEntity createEvent() {
      	// HATEOAS 가 lintTo(), methodOn() 을 제공한다.
        URI createdUri = linkTo(methodOn(EventController.class).createEvent())
                            .slash("{id}")
                            .toUri();
        return ResponseEntity.created(createdUri).build();
    }
}
```

<br />



결과)

```shell
MockHttpServletResponse:
           Status = 201
    Error message = null
          Headers = [Location:"http://localhost/api/events/%257Bid%257D"]
     Content type = null
             Body = 
    Forwarded URL = null
   Redirected URL = http://localhost/api/events/%257Bid%257D
          Cookies = []
```

성공적으로 201 상태코드 (정상, 생성) 를 반환했다.

또한 원하던대로 **Headers 에 `location` 정보에 링크(URI)를 받은 것을 확인할 수 있다.** 이 링크를 통해 이벤트를 조회할 수 있게 된다.



---

#### **id가 DB에 들어갈 때 자동생성된 값으로 나오는지 확인해본다.**



**1) set(id) 확인하기**

```java
...
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
public class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void createEvent() throws Exception {

        Event event = Event.builder()
                .name("Spring")
                .description("REST API Development")
                . ...
                .location("그랜드 컨퍼런스홀")
                .build();

        mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaTypes.HAL_JSON)
                    .content(objectMapper.writeValueAsString(event))
                        )
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("id").exists());

    }
}

```

스프링부트에서 MappingJacksonJson 이 의존성으로 들어가 있으면 `ObjectMapper` 를 자동으로 빈으로 등록해준다. `ObjectMapper` 는 객체를 json 형태의 string으로 바꾸어준다.



@RequestBody 로 요청바디를 받게 끔 수정한 테스트 코드.

```java
@RestController
@RequestMapping(value = "/api/events", produces = MediaTypes.HAL_JSON_VALUE)
public class EventController {

    @PostMapping
    public ResponseEntity createEvent(@RequestBody Event event) {
        URI createdUri = linkTo(EventController.class)
                .slash("{id}")
                .toUri();
        event.setId(10);
        return ResponseEntity.created(createdUri).body(event);
    }
}
```

* `@RestContoller` 는 `@ResponseBody` 를 모든 메소드에 적용시킨 것과 같다.
* `ResponseEntity` 는 응답 코드, 헤더, 본문을 모두 다루기 편리한 API 이다.





```shell
MockHttpServletResponse:
           Status = 201
    Error message = null
          Headers = [Location:"http://localhost/api/events/%257Bid%257D", Content-Type:"application/hal+json;charset=UTF-8"]
     Content type = application/hal+json;charset=UTF-8
             Body = {"id":10,"name":"Spring","description":"REST API Development","beginEnrollmentDateTime":"2021-01-21T12:00:00","closeEnrollmentDateTime":"2021-01-22T12:00:00","beginEventDateTime":"2021-01-22T12:00:00","endEventDateTime":"2021-01-23T12:00:00","location":"D2 스타트업 팩토리","basePrice":100,"maxPrice":200,"limitOfEnrollment":100,"offline":false,"free":false,"eventStatus":null}
    Forwarded URL = null
   Redirected URL = http://localhost/api/events/%257Bid%257D
          Cookies = []
```

세팅한 id 값이 반영되어 나오는 것을 확인할 수 있다.



> 참고) 한글이 깨지지 않기 위해서는 따로 웹설정파일을 만드는 것이 좋다. 
>
> MediaType.APPLICATION_JSON_UTF8 이 스프링 5.2 부터 deprecated 되었기 때문이다.
>
> 웹설정파일
>
> ```java
> @Configuration
> public class SpringConfig implements WebMvcConfigurer {
> 
>     @Override
>     public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
>         converters.stream()
>                 .filter(converter -> converter instanceof MappingJackson2HttpMessageConverter)
>                 .findFirst()
>                 .ifPresent(converter -> ((MappingJackson2HttpMessageConverter) converter).setDefaultCharset(StandardCharsets.UTF_8));
>     }
> }
> 
> ```
>
> 



---



JPA 엔터티를 등록하고 레포지토리를 만든다.

```java
...
@Entity
public class Event {

    @Id @GeneratedValue
    private Integer id;
    ...

    @Enumerated(EnumType.STRING)
    private EventStatus eventStatus;
}
```

* `@Enumerated` 매핑시 `EnumType.STRING` 으로 할 것을 추천한다.`EnumType.ORDINAL` 의 경우 데이터의 순서가 바뀌었을 때 숫자가 꼬일 수 있으므로 STRING 으로 하는 것이 좋다.

```java
public interface EventRepository extends JpaRepository<Event, Integer> {
}
```

<br />

컨트롤러도 수정해준다.

```java
@RestController
@RequestMapping(value = "/api/events", produces = MediaTypes.HAL_JSON_VALUE)
public class EventController {

    private final EventRepository eventRepository;

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @PostMapping
    public ResponseEntity createEvent(@RequestBody Event event) {
        Event newEvent = this.eventRepository.save(event);
        ...
    }
}
```

만들었던 eventRepository 를 가져와서, 이를 통해 데이터를 DB 에 삽입한다. (`save`)



테스트코드도 고쳐준다.

```java
@WebMvcTest
public class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;
  
    @MockBean
    EventRepository eventRepository;

    @Test
    public void createEvent() throws Exception {

        Event event = Event.builder()
                ...
                .build();

      	
        event.setId(10);
        Mockito.when(eventRepository.save(event)).thenReturn(event);

        mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaTypes.HAL_JSON)
                    .content(objectMapper.writeValueAsString(event))
                        )
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("id").exists())
          
          			// 테스트 추가 
          			// 헤더에 Location 존재하는지 (HATEOAS)
                .andExpect(header().exists(HttpHeaders.LOCATION))
          			// ContentType 이 application/hal+json;charset=UTF-8 도 잘 정의되어 있는지
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaTypes.HAL_JSON_VALUE + ";charset=UTF-8"));

    }
}
```

MockMvc 가짜 객체는 null 을 반환하는데, 컨트롤러에 그대로 전달되면 save시 null 이 발생하고, newEvent.getId()에서 오류가 발생한다.(NullPointException)
따라서 @MockBean 에 레포지토리를 등록하고, `Mockito` 로 null 이 아닌  event 객체를 리턴하라고 하면 된다.















