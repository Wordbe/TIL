# Spring REST API 04 - Bad Request





## 빈 입력값 처리

JSR 303 라이브러리에 있는 Bean Validation 을 사용할 수 있다.

pom.xml

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

각 필드마다 필드의 속성들을 어노테이션으로 달아준다.

```java
@Builder @AllArgsConstructor @NoArgsConstructor
@Data
public class EventDto {

    @NotEmpty
    private String name;
    @NotEmpty
    private String description;
    @NotNull
    private LocalDateTime beginEnrollmentDateTime;
    @NotNull
    private LocalDateTime closeEnrollmentDateTime;
    @NotNull
    private LocalDateTime beginEventDateTime;
    @NotNull
    private LocalDateTime endEventDateTime;

    private String location; // null 이면 온라인 모임
    @Min(0)
    private int basePrice;
    @Min(0)
    private int maxPrice;
    @Min(0)
    private int limitOfEnrollment;
}
```

컨트롤러에서 메소드의 파라미터로 `@Valid` 를 붙여서 Dto 를 받고, 이것에 대한 에러가 있다면 `Errors` 객체에 담아지게 된다.

```java
@PostMapping
public ResponseEntity createEvent(@RequestBody @Valid EventDto eventDto, Errors errors) {
	// 에러값이 있으면 badRequest 를 리턴한다.
  if (errors.hasErrors()) return ResponseEntity.badRequest().build();
  ...
}
```



테스트코드는 아래와 같다.

```java
@SpringBootTest
@AutoConfigureMockMvc
public class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;
  	...
      
    @Test
    @TestDescription("입력값이 비어있는 경우 에러가 발생하는 이벤트 생성 테스트")
    public void createEvent_badRequest_emptyInput() throws Exception {
        EventDto eventDto = EventDto.builder().build();

        this.mockMvc.perform(post("/api/events")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(this.objectMapper.writeValueAsString(eventDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
```



> 테스트가 여러개인 경우, 무슨 테스트인지 서술해주기 위해 주석을 달아서 표현하면 좋다. 주석 대신에 커스텀 어노테이션을 사용해서 안에 서술할 수 도 있다. 만드는 방법은 간단하다.
>
> 패키지/common 폴더(이름은 자유)를 만들고 아래 클래스를 생성한다. 
>
> ```java
> @Target(ElementType.METHOD) // 메소드 위에 붙이는 주석(annotation)
> @Retention(RetentionPolicy.SOURCE) // 소스 단계까지 유지
> public @interface TestDescription {
>     String value();
> }
> ```
>
> RetentionPolicy 는 어노테이션의 유효기간을 나타낸다. 
>
> * SOURCE 는 컴파일 전이다. 즉 주석처럼 사용하는 것이다.
> * CLASS 는 컴파일까지만 메모리에 들어있고 런타임에서는 사라진다. 리플렉션으로 선언된 어노테이션 데이터를 가져올 수 없게 된다.
> * RUNTIME 은 런타임까지 사용할 수 있다. JVM이 자바 바이트코트가 담긴 class 파일에서 런타임환경을 구성하고, 런타임을 종료할 때까지 메모리가 살아있다.





<br />

---

## 잘못된 입력값 처리



어노테이션만으로 NotEmpty, NonNull, Min 등등은 가능하지만 구체적인 검증로직을 구현하는 것은 한계가 있다.

validator 를 별도로 구현해보자.

```java
@Component
public class EventValidator {

    public void validate(EventDto eventDto, Errors errors) {
        if (eventDto.getBasePrice() > eventDto.getMaxPrice()) {
            // 필드 에러
          	errors.rejectValue("basePrice", "wrongValue", "BasePrice 가 잘못되었습니다.");
	
          	// 글로벌 에러
            errors.reject("wrongValue", "price 가 잘못되었습니다.");
        }
      
        if (eventDto.getCloseEnrollmentDateTime().isBefore(eventDto.getBeginEnrollmentDateTime())) {
            errors.rejectValue("closeEnrollmentDateTime", "wrongValue", "closeEnrollmentDateTime 가 잘못되었습니다.");
        }

    }
}
```

위 예시와 같이 비즈니스 로직에 위반된 조건을 제시하고, 에러가 발생하면 `Errors.rejectValue()` 를 발생시켜준다.

 

```java
@SpringBootTest
@AutoConfigureMockMvc
public class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    @TestDescription("입력 값이 잘못된 경우 에러가 발생하는 이벤트 생성 테스트")
    public void createEvent_badRequest_wrongInput() throws Exception {
        EventDto eventDto = EventDto.builder()
								...
          			// 고의로 위반 로직 설정: 종료등록시간이 시작등록시간보다 이전일수 없음.
                .beginEnrollmentDateTime(LocalDateTime.of(2021,01,31,12,00,00)) 
                .closeEnrollmentDateTime(LocalDateTime.of(2021,01,30,12,00,00))
								...
          			// 고의로 위반 로직 설정: maxPrice >= basePrice 여야함.
                .basePrice(1000)
                .maxPrice(200)
                ...
                .build();

        this.mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(this.objectMapper.writeValueAsString(eventDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
```



<br />

<br />

<br />

---

### Custom Validator, 에러 Serializer 구현





시리얼라이즈 라는것은 모델 객체를 json 타입으로 변환해주는 것을 말한다.

<br />

modelMapper의  `BeanSerializer` 는 빈 객체를 json 으로 변환시킨다. (자바 빈 스펙을 준수한다.)

하지만 `Errors` 객체는 빈으로 등록되어 있지 않기 때문에 json으로 변환되지 못한다.

따라서 `Errors` 를 핸들링할 수 있는 커스텀 에러 시리얼라이저를 만들어보자.

```java
@JsonComponent
public class ErrorsSerializer extends JsonSerializer<Errors> {

    @Override
    public void serialize(Errors errors, JsonGenerator gen, SerializerProvider serializerProvider) throws IOException {
        gen.writeStartArray();
      
      	// 필드 에러
        errors.getFieldErrors().forEach(e -> {
            try {
                gen.writeStartObject();
                gen.writeStringField("field", e.getField());
                gen.writeStringField("objectName", e.getObjectName());
                gen.writeStringField("code", e.getCode());
                gen.writeStringField("defaultMessage", e.getDefaultMessage());

                Object rejectedValue = e.getRejectedValue();
                if (rejectedValue != null) {
                    gen.writeStringField("rejectedValue", rejectedValue.toString());
                }
                gen.writeEndObject();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        });

      	// 글로벌 에러
        errors.getGlobalErrors().forEach(e -> {
            try {
                gen.writeStartObject();
                gen.writeStringField("objectName", e.getObjectName());
                gen.writeStringField("code", e.getCode());
                gen.writeStringField("defaultMessage", e.getDefaultMessage());
                gen.writeEndObject();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        });

        gen.writeEndArray();
    }
}
```

스프링부트가 제공하는 `@JsonComponent` 를 이용하면 `JsonSerializer`를  `ObjectMapper` 에 등록할 수 있다.

`serialze` 메소드를 오버라이딩하고, 필드에러와, (필요하면) 글로벌 에러 json 을 만들면 된다.

<br />



테스트 코드를 보자.

```java
@Test
@TestDescription("입력 값이 잘못된 경우 에러가 발생하는 이벤트 생성 테스트")
public void createEvent_badRequest_wrongInput() throws Exception {
  EventDto eventDto = EventDto.builder()
    .name("Spring")
    .description("REST API Development")
    .beginEnrollmentDateTime(LocalDateTime.of(2021,01,31,12,00,00))
    .closeEnrollmentDateTime(LocalDateTime.of(2021,01,30,12,00,00))
    .beginEventDateTime(LocalDateTime.of(2021,01,29,12,00,00))
    .endEventDateTime(LocalDateTime.of(2021,01,23,12,00,00))
    .basePrice(1000)
    .maxPrice(200)
    .limitOfEnrollment(100)
    .location("D2 스타트업 팩토리")
    .build();

  this.mockMvc.perform(post("/api/events")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(this.objectMapper.writeValueAsString(eventDto)))
    .andDo(print())
    .andExpect(status().isBadRequest())
    .andExpect(jsonPath("$[0].objectName").exists())
    .andExpect(jsonPath("$[0].defaultMessage").exists())
    .andExpect(jsonPath("$[0].code").exists())
    ;
}
```

json 경로에 배열이 들어있고, 그 필드값으로 위 3개의 값이 담긴 것을 확인할 수 있다.

