# Spring REST API 01 - REST API, 도메인



### REST API 란?

> * API : Application Programming Interface
> * REST : REpresentational State Transfer, 인터넷 상 시스템 간 상호 운용성(interoperability)을 제공하는 방법 중 하나다. 통신 방법으로 주로  HTTP를 사용한다. 시스템 각각의 독립적인 진화를 보장하기 위한 아키텍처이다. 



### REST 아키텍처 스타일

1. 클라이언트-서버
2. Stateless
3. Cache
4. Uniform Interface
5. Layered System
6. Code-On-Demand (선택)



REST 아키텍처 스타일 중 uniform Interface 에서 `self-descrive messages` 와 `HATEOAS` 가 대부분 잘 지켜지지 않고 있다.

<br />

### Uniform Interface

* Identification of resources
* manipulation of resources through represenations
* **self-descrive messages**
* **hypermisa as the engine of appliaction state (HATEOAS)**



**Self-descriptive message**

* 메시지 스스로 메시지에 대한 서술이 가능해야 한다. 응답에 대한 설명(profile)이 포함되어 있으면 된다.
* 서버가 변경되어 메시지가 변해도, 클라이언트는 메시지를 보고 해석이 가능하다.
* 확장이 가능한 커뮤니케이션이다.

**→ :bulb: 해결방법** 

1. 미디어 타입 정의하고 IANA 에 등록해서 리소스를 리턴할 때 Content-Type 에 미디어 타입을 사용한다.
2. profile 링크 헤더를 추가한다. 하지만 미지원 브라우저가 많아서 대안으로 HAL 링크 데이터에 profile을 추가한다.



**HATEOAS**

* 응답에 하이퍼미디어(링크)가 함께 명세되어 있어야 한다. ("애플리케이션 상태의 엔진으로써 하이퍼미디어")
* 하이퍼미디어(링크) 통해 애플리케이션 상태 변화를 파악할 수 있다. 또한 정보를 동적으로 바꿀 수 있다.
* 클라이언트, 서버모두 잘 지켜야 한다.

**→ :bulb: 해결방법** 

1. 데이터에 링크를 제공한다. 링크 정의는 HAL 로 한다.
2. 링크 헤더나 Location을 사용한다.





---

## Event REST API 프로젝트 :seedling:

프로젝트 시작.



이벤트 등록/조회/수정 API 를 만든다.

URL 요청/응답 UI 툴 (REST API 테스트 클라이언트)로 Restlet(크롬 플러그인), Postman(애플리케이션)을 사용하면 편리하다.



---

## Event 도메인 생성





```java
package co.wordbe.eventrestapi.event;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor @NoArgsConstructor
@Getter @Setter
@EqualsAndHashCode(of = "id")
public class Event {

    private Integer id;
    private String name;
    private String description;

    private LocalDateTime beginEnrollmentDateTime;
    private LocalDateTime closeEnrollmentDateTime;
    private LocalDateTime beginEventDateTime;
    private LocalDateTime endEventDateTime;

    private String location;
    private int basePrice;
    private int maxPrice;
    private int limitOfEnrollment;
    private boolean offline;
    private boolean free;

    private EventStatus eventStatus;
}
```

* `@AllArgsConstructor` 는 모든 필드를 가진 생성자, `@NoArgsConstructor` 는 디폴트 생성자이다.

* `@EqualsAndHashCode` 사용시 주의 점

  다른 엔터티와 연관관계가 있는 필드가 있는데, 둘 다 `@EqualAndHashCode` 가 붙어있으면, 상호간 메소드 생성이 반복될 수 있어 스택오버플로우가 발생할 수 있다. 따라서 of 속성을 "id" 로 설정해주면 필드가 연관관계가 될 수 없기 때문에 이를 방지할 수 있다.

* `@Data` 사용시 주의점

  `@Data` 는 롬복의 모든 어노테이션을 제공해준다. 하지만 `@EqualsAndHashCode` 도 들어있기 때문에 위 주의사항을 반영하려면 별도로 쓰는 것이 좋다.

* 자주 사용하는 롬복 에노테이션을 하나의 에노테이션으로 묶을 수 없다. 롬복은 메타 에노테이션으로 적용되지 않는다.
* `@Builder` 빌더 생성, `@Getter` 게터 생성, `@Setter` 세터 생성



<br />

### Lombok

자바 기본 스팩을 생성한다. (기본 생성자, getter, setter, builder 등)

롬복 어노테이션만 붙이면 컴파일 전 단계에서 위 스팩들이 자동으로 생성된다.

`mvn package` 를 한 후에 `target/classes` 폴더에 생긴 클래스파일을 확인해보면, 메소드가 모두 구현된 것을 확인할 수 있다.

<br />

롬복 설정법은 간단하다.

1. 롬복 의존성을 pom.xml에 추가한다.
2. `cmd + ,` 눌러서 preference 를 들어간다음, 플러그인을 설치한다.
3. Anotation processing 을 활성화한다.

<br />

**빌더패턴**

생성자를 만들 때, 특정 필드에 특정 값을 넣는 것이 쉽다. 보기에도 편하고, . 으로 이어나가는 체이닝 기법도 사용하기 쉽다. 빌더 클래스 메소드를 구현하고자 할 때 롬복의 `@Builder` 어노테이션을 활용하면 편하다. 단 이 때 생성자는 정의되지 않는다.

```java
class EventTest {

    @Test
    public void builder() {
        Event event = Event.builder()
                .name("Event REST API")
                .description("REST API development")
                .build();
        assertThat(event).isNotNull();
    }
}
```















