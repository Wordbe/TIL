
# 목차

- Spring WebFlux
- Functinal Endpoints
- WebClient
- Spring Data Reactive MongoDB
- Spring Data R2DBC
- Reactive Microservices
- Server Sent Events (SSE)


---

# 1. Spring WebFlux


# 간단한 MathService vs Reactive MathService

MVC 로 만든 컨트롤러와, WebFlux 로 만든 컨트롤러는 구조상으로 비슷하다.

하지만, 작동하는 방식이 다르다.


producer 타입을 stream 으로 하면 브라우저에서 Flux 요소 단위의 실시간 응답을 받아볼 수 있다.

```java
@RestController
@RequestMapping("reactive-math")
@RequiredArgsConstructor
public class ReactiveMathController {
    private final ReactiveMathService mathService;

    @GetMapping("square/{input}")
    public Mono<MathResponse> findSquare(@PathVariable int input) {
        return mathService.findSquare(input);
    }

    @GetMapping("table/{input}")
    public Flux<MathResponse> multiplicationTable(@PathVariable int input) {
        return mathService.multiplicationTable(input);
    }

    @GetMapping(value = "table/{input}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<MathResponse> multiplicationTableStream(@PathVariable int input) {
        return mathService.multiplicationTable(input);
    }
}
```


---


## MVC 문제점

- 브라우저(subscriber)가 중간에 요청을 취소해도, 서버는 요청한 작업을 끝까지 완료한다.
- 리액티브 프로그래밍은 클라이언트가 요청을 취소하면 서버작업을 중간에 멈춘다.

<br />

- 브라우저에서 취소를 눌러도 서버가 바로 멈추지 않는 이유? Sleep 은 blocking 메소드이기 때문이다.
- Flux 에서 Non blocking sleep 하게 하려면?
- `.delayElements(Duration.ofSeconds(1))` 을 사용하면 된다.

![](https://i.ibb.co/C7BP1vv/2021-12-28-11-13-40.png)

- AbstractJackson2Encoder 컨트롤러 응답과정에 작동해서 Flux 를 `Mono<List<MathResponse>>` 이런 형식으로 만들어준다.


## 리액티브 파이프라인

파이프라인을 아래와 같이 분리하면, 클라이언트와의 통신이 불가능하다.

```java
public Flux<MathResponse> multiplicationTable(int input) {
    List<MathResponse> list = IntStream.range(1, 10)
            .peek(i -> SleepUtil.sleepSeconds(1))
            .peek(i -> System.out.println("math-service processing: " + i))
            .mapToObj(i -> new MathResponse(i * input))
            .collect(Collectors.toList());
    return Flux.fromIterable(list);
}
```


## WebFlux 는 Streaming Response 를 만들 수 있다는 장점이 있음
- 요청을 받아서 처리를 하고, publisher (Mono / Flux) 를 반환한다.
- Blocking 을 하지 않아야 한다. subscribe 도 하지 않아야 한다. ( publisher 자체로 반환해주어서 안에 있는 요소가 흐를 수 있도록 해야 한다.)


---


# 2. Functional Endpoint

- lightweight functional endpoint
- 스프링 컨트롤러 어노테이션으로 사용하는 것을 더 권장. (있는 것을 굳이 함수형 엔드포인트로 할 필요는 없음)
-  Path 기반 라우팅
-  Path + Condition 기반 라우팅
-  Nested 라우팅
-  Error 핸들링
-  ServerRequest 로 여러가지 받을 수 있음
	- headers / cookies / principal / path variables / query params
- Mono<ServerResponse>
	- ServerResponse builder 로 만들 수 있다.


