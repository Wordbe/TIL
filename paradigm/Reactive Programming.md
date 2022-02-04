# Reactive Programming



## Reactive ?

- 스프링 프레임워크 오픈소스를 리딩하고 있는 Pivotal 은 리액티브 프로그래밍을 위한 프로젝트 Reactor 를 출시
- Reactive Streams 구현체이자 스프링 5 리액티브 프로그래밍의 핵심 라이브러리
- 리액티브
  - streaming, lightweight, real-time
  - 사용자가 입력을 발생시켰을 때 꾸물거리지 않고 빠른 시간 내에 응답하는 것
  - 비동기 구성, 이벤트 기반 시퀀스, 논블로킹 연산 사용

## 리액티브 선언문

리액티브 4가지 속성

- 응답성 (responsive)
- 탄력성 (resilient)
- 유연성 (elastic)
- 메시지 주도 (message driven)



## Flux, Mono

- Flux, Mono 는 Reactive Streams 인터페이스 중에서 데이터(시퀀스)를 제공하는 발행자 역할을 하는 `Publisher` 의 구현체
- Flux : 0 ~ N 개 데이터 전달
  - 하나의 데이터 전달할 때마다 `onNext` 이벤트 발생
  - 모든 데이터 전달 완료되면 `onComplete` 이벤트 발생
  - 전달 중 오류가 나면 `onError` 이벤트 발생
- Mono : 0 ~ 1 개 데이터 전달
  - 작동은 Flux 와 동일



## Flux, Mono 생성

- Flux 클래스에서 제공하는 팩토리 메서드를 사용
  - `just`
  - `range`
  - `fromArray`, `fromIterable`, `fromStream`
  - `empty`

```java
Flux<String> flux = Flux.just("apple", "amazon").log();
| onSubscribe([Synchronous Fuseable] FluxArray.ArraySubscription)
| request(unbounded)
| onNext(apple)
| onNext(amazon)
| onComplete()
```



## subscribe() 동작

- Reactive Streams 는 publisher, subscriber, subscription, processor 가 정의되어 있다.
- Reactor 의 Flux, Mono 는 publisher 의 구현체이다.
- subscribe() 메소드를 호출하면 자동으로 subscriber 를 자동으로 등록해준다.
  - 기본은 LambdaSubscriber



