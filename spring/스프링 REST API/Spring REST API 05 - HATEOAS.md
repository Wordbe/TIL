# Spring REST API 05 - HATEOAS





_HATEOAS_ 란 Hypermeida As The Engine Of Applicaton State 의 약자로, REST API 의 개념을 충족시키는 조건 중 하나이다.

서버는 리소스를 보낼 때 리소스와 연관된 링크 정보를 담아 클라이언트에게 제공해야하며, 클라이언트는 링크 정보를 바탕으로 리소스에 접근해야한다는 원칙이다. 

연관된 링크 정보는 { relation : href } 쌍으로 묶어서 _links 안에 넣어주면 된다.

예를 들면 아래와 같다.

`self` 는 자기 자신에 대한 href 정보를 제공한다. 그 외에 query-events 라는 relation 에는 해당 리소스 정보를 담고 있는 href 를 담아주면 된다.

```json
{
  ...,
  "_links":{
      "self":{
        "href":"http://localhost/api/events/1"
      },
      "query-events":{
        "href":"http://localhost/api/events"
      }
  }
}
```

또한 HATEOAS 외에도 여기에 `profile` 릴레이션을 등록하고, 응답 본문에 대한 문서의 URI 를 href에 담아주면, REST API 에서 self-descripvie message 조건을 만족시킬 수 있게된다.



<br />

스프링 HATEOAS 는 HATEOAS 조건을 만들 수 있는 다양한 기능을 지원한다.

* 링크를 만드는 기능
  *  `linkTo()`: 문자열을 넣을수도있고, 컨트롤러, 컨트롤러와 메소드를 이용한 방법이 있다.
* 리소스 만드는 기능
  * 리소스는 데이터 + 링크로 만들 수 있다.
* 링크 찾아주는 기능
  * Traverson, LinkDiscoverers 가 있다.



스프링 HATEOAS 를 적용해서 `_links` 정보를 생성하는 테스트를 해보자.

```java
@Test
public void createEvent() throws Exception {
  EventDto event = EventDto.builder()
    .name("Spring")
    ...
    .build();

  mockMvc.perform(post("/api/events")
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaTypes.HAL_JSON)
                  .content(objectMapper.writeValueAsString(event))
                 )
    .andDo(print())
    .andExpect(status().isCreated())
    .andExpect(jsonPath("_links.self").exists())
    .andExpect(jsonPath("_links.query-events").exists())
    .andExpect(jsonPath("_links.update-event").exists())
    ;
}
```



`_links` 안에 위 릴레이션 (self, query-events, update-event) 을 등록해보자.

우선 링크를 추가해 줄 `EntityModel` 클래스를 하나 만든다.

```java
...
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

public class EventResource extends EntityModel<Event> {
    public EventResource(Event event, Link... links) {
        super(event, links);
    }
}
```



```java
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@RequestMapping(value = "/api/events", produces = MediaTypes.HAL_JSON_VALUE)
public class EventController {

    private final EventRepository eventRepository;
    private final ModelMapper modelMapper;

    public EventController(EventRepository eventRepository, ModelMapper modelMapper) {
        this.eventRepository = eventRepository;
        this.modelMapper = modelMapper;
    }

    @PostMapping
    public ResponseEntity createEvent(@RequestBody EventDto eventDto) {
	      Event event = modelMapper.map(eventDto, Event.class);
        Event newEvent = this.eventRepository.save(event);

      	// "http://localhost:8080/api/events/{id}" 링크와 같음
        WebMvcLinkBuilder selfLinkBuilder = linkTo(EventController.class).slash(newEvent.getId());

        EventResource eventResource = new EventResource(event);
	      // "self" : {"href": "http://localhost:8080/{controller uri}/{event id}" }}
        eventResource.add(selfLinkBuilder.withSelfRel());
      	// "update-event" : {"href": "http://localhost:8080/api/events/{id}" }}
        eventResource.add(selfLinkBuilder.withRel("update-event"));
      	// "query-events" : {"href": "http://localhost:8080/api/events }}
        eventResource.add(linkTo(EventController.class).withRel("query-events"));

        return ResponseEntity.created(selfLinkBuilder.toURI()).body(eventResource);
    }
}
```



self는 EventResource 자원과 함께 만들어지는 릴레이션이므로,

컨트롤러에서 분리하여 아래와 같이 EntityModeld 에 담아주어도 된다.

```java
...
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

public class EventResource extends EntityModel<Event> {
    public EventResource(Event event, Link... links) {
        super(event, links);
      
        // self 릴레이션이 아래와 같은 형식으로 매핑된다.
      	// "self" : {"href": "http://localhost:8080/{controller uri}/{event id}" }}
        add(linkTo(EventController.class).slash(event.getId()).withSelfRel());
    }
}
```



위처럼 하는 방법 외에 `RepresentationModel` 를 상속받아서 사용할 수 도 있다. 하지만 이경우, 기존 필드 리소스 정보들이 한 객체에 묶인다.예를들면 아래와 같이 event 아래 묶이게 된다.

```json
{
  "event": {
    "id": 1,
    "name": "Spring",
    ...  	
 	},
  "_link": {
    "self": { "href": ...}
  }
}
```

이를 막기위해 `@JsonUnwrapped` 를 붙히는 방법도 있다.

`@JsonUnwrapped` 를 사용하면 필드들이 새로운 객체에 담겨서 가는 것을 방지할 수 있다.

```java
...
import org.springframework.hateoas.RepresentationModel;

@AllArgsConstructor
@Getter
public class EventResource extends RepresentationModel {

    @JsonUnwrapped
    private Event event;
}
```







