# Spring REST API 03 - 입력값 처리



테스트하면서 입력값을 제한해야 하는 필드가 있다.

예를 들어 자동 생성되도록 설정된 `id` 나 계산해야하는 값들이다.

이를 DTO 사용해서 해결해보자.

>  jackson 라이브러리를 통해 json 어노테이션을 붙이는 방법도 있다. 에노테이션이 다닥다닥 많이 붙어서 가독성이 안좋아 질가봐 DTO를 따로 만드는 예제를 만든다.



DTO (Data Transfer Object) 에 Entity 객체로부터 입력이 필요한 필드만 가지고와서 모델을 새로 정의한다.

```java
@Builder @AllArgsConstructor @NoArgsConstructor
@Data
public class EventDto {

    private String name;
    private String description;

    private LocalDateTime beginEnrollmentDateTime;
    private LocalDateTime closeEnrollmentDateTime;
    private LocalDateTime beginEventDateTime;
    private LocalDateTime endEventDateTime;

    private String location; // null 이면 온라인 모임
    private int basePrice;
    private int maxPrice;
    private int limitOfEnrollment;
}
```

_Event 객체로부터 입력이 필요한 필드만 가져와서 EventDTO 객체를 만들었다._

<br />

그리고 원래 로직에 적용하려면 Event 에 EventDto 를 일일이 매핑해주어야 한다.

```
Event event = Event.builder()
        .name(eventDto.getName())
        .description(eventDto.getDescription())
        .build();
```

하지만 이를 자동화해주는 라이브러리 `ModelMapper`가 있다. 

<br />

pom.xml 에 의존성을 추가한다. 버전은 최신버전을 사용하면 된다.

```xml
<dependency>
  <groupId>org.modelmapper</groupId>
  <artifactId>modelmapper</artifactId>
  <version>2.3.9</version>
</dependency>
```

<br />

ModelMapper 는 공용으로 사용가능한 객체이므로 빈으로 등록해서 사용할 수 있다.

설정파일이나 메인애플리케이션 아래 코드에 아래 빈을 추가해주자.

```java
		@Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
```



```java
@RestController
@RequestMapping(value = "/api/events", produces = MediaTypes.HAL_JSON_VALUE)
public class EventController {

    private final EventRepository eventRepository;

    private final ModelMapper modelMapper;

  	// eventRepository, modelMapper 생성자
    public EventController(EventRepository eventRepository, ModelMapper modelMapper) {
        this.eventRepository = eventRepository;
        this.modelMapper = modelMapper;
    }

    @PostMapping
    public ResponseEntity createEvent(@RequestBody EventDto eventDto) {
      	// 아래와 같이 한 줄 써주면 모델 매핑이 간편하게 된다.
        Event event = modelMapper.map(eventDto, Event.class);

        Event newEvent = this.eventRepository.save(event);
        URI createdUri = linkTo(EventController.class).slash(newEvent.getId()).toUri();
        return ResponseEntity.created(createdUri).body(event);
    }
}

```

<br /> <br />

**테스트**

<br />

Web 테스트를 할 때 슬라이스 테스트를 하면, Web에 기능이 추가될 때마다 테스트에도 추가할 Mock 이 많이 생긴다. 따라서 통합테스트이긴 하지만 `@SpringBootTest` 를 사용하면 편리하다. 이 때 MockMvc 를 사용하려면 `@AutoConfigureMockMvc` 를 붙이는 방법이 좋다.

```java
@SpringBootTest
@AutoConfigureMockMvc
public class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void createEvent() throws Exception {
        Event event = Event.builder()
      					// Event 에는 있지만 EventDto 에 없는 필드
          			.id(100)
			          .free(true)
                .offline(false)
                .eventStatus(EventStatus.PUBLISHED)
          
          			// EventDto 에만 있는 필드
                .name("Spring")
                ...
                .location("D2 스타트업 팩토리")
                .build();

        mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaTypes.HAL_JSON)
                    .content(objectMapper.writeValueAsString(event))
                        )
                .andDo(print())
                ...
          
          			// 입력값 테스트
                .andExpect(jsonPath("id").value(Matchers.not(100)))
                .andExpect(jsonPath("free").value(Matchers.not(true)))
                .andExpect(jsonPath("eventStatus").value(String.valueOf(EventStatus.DRAFT)));

    }
}
```







---

### 입력값 이외에 필드를 사용했을 때 에러 발생시키기

<br />

`status().isBadRequeust()` 메소드를 사용해보자.

```java
@SpringBootTest
@AutoConfigureMockMvc
public class EventControllerTest {
		...

    @Test
    public void createEvent_badRequest() throws Exception {
        Event event = Event.builder()
			          // Event 에는 있지만 EventDto 에 없는 필드
          			.id(100)
			          .free(true)
                .offline(false)
                .eventStatus(EventStatus.PUBLISHED)

          			// EventDto 에만 있는 필드          			
                .name("Spring")
                ...
                .location("D2 스타트업 팩토리")

                .build();

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaTypes.HAL_JSON)
                .content(objectMapper.writeValueAsString(event))
        )
                .andDo(print())
                .andExpect(status().isBadRequest()) // 400 응답으로 예상
        ;
    }
}
```

위의 예제들에서 이미 이 테스트는 정상적으로 실행이 가동되도록 적용시켜 놓았기 때문에,

추가설정을 통해, Dto 에 없는 필드들의 값을 설정했을 때 에러가 나도록 해보자. (그래야 isBadRequest 테스트는 통과가 된다.)

<br />

간단한 프로퍼티 설정을 통해 해결할 수 있다.

application.properites

```shell
spring.jackson.deserialization.fail-on-unknown-properties=true
```

* Serialization : 객체  → JSON 
* Deserialization : JSON → 객체

다음의 테스트같은 경우는 받을 수 없는 unknown 프로퍼티를 가져오므로, error 를 내보낸다.















