# Spring Web MVC 001 - MVC





## 스프링 MVC



MVC 모델

M 은 model, V는 view, C는 controller 를 말한다.

* **모델**은 자바 객체이다. 다른 의존관계가 섞이지 않은 POJO 로 보통 만들어진다. 도메인 객체로써, 어떤 전달할 데이터를 담고 있다(DTO). 화면에 전달할 데이터나 화면으로부터 전달 받은 데이터를 담고 있는 객체이다.
* **뷰**는 사용자가 보는 브라우저 화면에 데이터를 보여주는 역할을 한다. 모델이 제공하는 데이터를 여기서 사용한다. 보통 HTML 로 만들어지고 이를 위한 다양한 템플릿(JSP, Thymeleaf)이 있다. 또한 json, xml 등의 형태로 데이터를 바로 던져주기도 한다. 
* **컨트롤러**는 특정 url에 전달할 뷰를 매핑해준다. 사용자의 입력을 받아 모델 객체의 데이터를 변경하거나 모델 객체를 뷰에 전달하는 역할을 한다. 입력값을 검증하고, 입력 받은 데이터로 모델 객체를 변경한 후, 변경된 모델 객체를 뷰에 전달한다.

<br />



**예제)**

**모델 (= DTO, 도메인 객체)**

DTO 란 Data Transfer Object 로 계층간 데이터 교환을 위한 자바 빈을 의미한다. getter, setter 메소드를 가지고, 로직을 가지지 않는 순수 데이터 객체이다.

```java
@Getter @Setter
@Builder @NoArgsConstructor @AllArgsConstructor
public class Event {

    private String name;

    private int limitOfEnrollment;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;
}
```

**도메인 서비스**

```java
@Service
public class EventService {

    public List<Event> getEvents() {
        Event model3 = Event.builder()
                .name("모델3 시승 체험")
                .limitOfEnrollment(5)
                .startDateTime(LocalDateTime.of(2021,2,11,10,0,0))
                .endDateTime(LocalDateTime.of(2021,2,11,12,0,0))
                .build();

        Event sonata = Event.builder()
                .name("소나타 시승 체험")
                .limitOfEnrollment(10)
                .startDateTime(LocalDateTime.of(2021,2,12,10,0,0))
                .endDateTime(LocalDateTime.of(2021,2,12,12,0,0))
                .build();

        return List.of(model3, sonata);
    }
}
```



**컨트롤러**

```java
@Controller
public class EventController {

    @Autowired
    EventService eventService;

    @GetMapping("/events")
    public String events(Model model) {
      	// 서비스로부터 받은 데이터를 모델 객체에 추가
        model.addAttribute("events", eventService.getEvents());
        return "events";
    }
}
```

반환하는 문자열이 뷰 이름과 매핑된다.

> `@RequestMapping(value = "/events", method = RequestMethod.GET)` 대신 `@GetMapping("/events")` 라고 쓸 수 있다. `@GetMapping` 어노테이션을 들어가보면 `@RequestMapping` 이 나오는 것을 확인할 수 있다. (spring 4.3 부터)



**뷰**

`/resources/templates `에 만든다. 아래는 thymeleaf 로 만들었다.

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>이벤트</title>
</head>
<body>
    <h1>이벤트</h1>
    <table>
        <tr>
            <th>이름</th>
            <th>참가인원</th>
            <th>시작</th>
            <th>종료</th>
        </tr>
        <tr th:each="event: ${events}">
            <td th:text="${event.name}">이벤트 이름</td>
            <td th:text="${event.limitOfEnrollment}">50</td>
            <td th:text="${event.startDateTime}">2020년 2월 11일 오전 10시</td>
            <td th:text="${event.endDateTime}">2020년 2월 11일 오전 12시</td>
        </tr>
    </table>
</body>
</html>
```



<br />

**MVC 패턴의 장점**

1. 동시 다발적(Simultaneous) 개발을 할 수 있다. 뷰와 모델, 컨트롤러가 따로 있으므로 백엔드, 프론트 개발자가 독립적으로 개발을 진행할 수 있다.
2. 높은 결합도 - 관련된 기능을 하나의 컨트롤러로 묶거나, 관련된 뷰를 그룹화 할 수 있다. 뷰는 `templates/events` 이런 형식으로 하위 폴더를 만들어 관련된 화면을 묶을 수 있다.
3. 낮은 의존도 : 뷰, 모델, 컨트롤러는 Decoupling 되어 있다. 각각 독립적이다.
4. 개발이 용이하다. 책임의 구분으로 코드를 수정하는 것이 편리하다.
5. 한 모델에 대한 여러 형태의 뷰를 가질 수 있다.

<br />

**MVC 패턴의 단점**

1. 코드 네비게이션이 복잡하다. 서로 어떤 연관이 있는지 이해해야 한다.

2. 코드 일관성 유지에 노력이 필요하고, MVC 를 이해하기 위한 꾸준한 학습이 필요하다.



