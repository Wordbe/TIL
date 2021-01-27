# Spring REST API 08 - 조회, 수정





## 이벤트 목록 조회



이벤트 목록은 조회하는 API를 만들어보자

우선 만들 요건은 Event 30개가 담긴 목록이다. 각 이벤트는 Page 정보를 담고 있다.

TDD 방식으로 먼저 테스트 작성 후 그에 맞는 소스코드를 만든다.

```java
@Test
@DisplayName("30개의 이벤트를 10개씩 묶어서 두번재 페이지 조회")
public void queryEvents() throws Exception {
  // Given
  IntStream.range(0, 30).forEach(this::generateEvent);

  // When
  this.mockMvc.perform(get("/api/events")
                       .param("page", "1")
                       .param("size", "10")
                       .param("sort", "name,DESC"))
  // Then
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(jsonPath("page").exists())
    ;
}

private void generateEvent(int index) {
  Event event = Event.builder()
    .name("event " + index)
    .description("test index " + index)
    .build();

  this.eventRepository.save(event);
}
```

* Given : 이벤트 30개가 주어진다.
* When : 파라미터를 담은 url 을 요청한다.
  * page 는 0부터 시작하고, size 기본값은 20이다. sort 기준 필드를 입력하고, 오름(ASC), 내림(DESC) 차순 정렬을 선택할 수 있다.
* Then : 응답상태 확인, "page" 존재 유무를 확인한다.

위 코드를 실행하면 `405` 에러가 나온다. 컨트롤러에 위에 해당하는 url 를 만들어놓았는데 그게 POST 매핑밖에 없기 때문이다. GET 매핑은 찾지 못했다. 즉, 405 (Http method not supportred) 에러가 나온다.





<br />

이제 요청한 리소스를 받도록 컨트롤러에 가서 GetMapping 을 해보자.

```java
@RestController
@RequestMapping(value = "/api/events", produces = MediaTypes.HAL_JSON_VALUE)
public class EventController {
		...
    @GetMapping
    public ResponseEntity queryEvents(Pageable pageable, PagedResourcesAssembler<Event> assembler) {
        Page<Event> page = this.eventRepository.findAll(pageable);
      
        var pageResources = assembler.toModel(page, e -> EventResource.modelOf(e));
        return ResponseEntity.ok(pageResources);
    }
}
```

* `Pageable` 을 활용하면 30개의 이벤트에 대해서 페이징과 정렬이 가능하다.
* `Page<Event>` 안에 들어있는 Event 들은 하나씩 순회하면서 `EventResource` (EntityModel) 에 매핑시킬 수 있다.
  * 좀 더 편한 방법으로 `PagedResourcesAssembler` 를 사용하면 편하다.



<br />

테스트를 좀 더 추가하자.

```java
// Then
	.andExpect(jsonPath("_embedded.eventList[0]._links.self").exists())
  .andExpect(jsonPath("_links.self").exists())
  .andExpect(jsonPath("_links.profile").exists())
  .andDo(document("query-events"))
```

* 각 이벤트에 링크정보가 있는지 테스트
* 링크 정보, 프로필 정보 확인
* Spring REST Docs 생성



컨트롤러에 프로파일 리소소르르 담아주는 코드를 한 줄 추가한다.

```java
pageResources.add(Link.of("/docs/index.html#resources-events-list").withRel("profile"));
```





<br />

---

## 이벤트 하나 조회



```java
@Test
@DisplayName("이벤트 조회")
public void getEvent() throws Exception {
  // Given
  Event event = this.generateEvent(100);

  // When
  this.mockMvc.perform(get("/api/events/{id}", event.getId()))
  // Then
    .andExpect(status().isOk())
    .andExpect(jsonPath("name").exists())
    .andExpect(jsonPath("id").exists())
    .andExpect(jsonPath("_links.self").exists())
    .andExpect(jsonPath("_links.profile").exists())
    ;
}

private Event generateEvent(int index) {
  Event event = Event.builder()
    .name("event " + index)
    .description("test index " + index)
    .build();

  return this.eventRepository.save(event);
}
```

이벤트를 하나 조회하는 요건을 만들어보자. 테스트를 먼저 만들어보자.

이벤트를 받아왔을 때 (Then) 필드 중에 name, id, 그리고 링크정보(HATEOAS), 프로파일정보(self-descriptive message) 를 확인한다.

<br />

위 코드를 실행시키면 `404` 에러가 난다. `/api/events/100` 으로  GET 요청을 했지만, 이 url을 매핑하는 컨트롤러 메소드가 없기 떄문에 404 (Not Found) 에러가 나온다.

<br />

Not Found 테스트도 만든다.

```java
@Test
@DisplayName("존재하지 않는 이벤트 조회시 404 응답 받기")
public void getEvent404() throws Exception {
  // When
  this.mockMvc.perform(get("/api/events/9876432"))
    // Then
    .andExpect(status().isNotFound())
    ;
}
```





<br />

컨트롤러에 `/api/events/{id}` GET 매핑을 등록해보자.

```java
@GetMapping("/{id}")
public ResponseEntity getEent(@PathVariable Integer id) {
  Optional<Event> optionalEvent = this.eventRepository.findById(id);
  if (optionalEvent.isEmpty()) {
    return ResponseEntity.notFound().build();
  }

  Event event = optionalEvent.get();
  EntityModel<Event> eventResource = EventResource.modelOf(event);
  eventResource.add(Link.of("/docs/index.html#resources-events-get").withRel("profile"));
  return ResponseEntity.ok(eventResource);
}
```

이벤트를 조회한다. 받아서 프로파일 정보도 만들어준다.









