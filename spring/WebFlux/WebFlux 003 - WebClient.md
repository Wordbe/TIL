# WebFlux 003 - WebClient





mutate 는 immutable 을 사용할 때 좋다. 복제본을 사용한다.



## StepVerifier

- 테스트하려면 response 가 다 전달되어야 하는데, 서버가 먼저 닫힐 수도 있다.
- 그래서 `block()` 을 하는데, `StepVerifier` 를 사용하면 테스트하기 위해서 Mono 를 `block()` 할 필요가 없다.
- 단계 단계 마다 publisher 가 하는 행위를 명시하고, 검증할 수 있다.
- 작성하는 로직이 non-blocking, asynchronous 이므로 필요

```java
StepVerifier.create()
Next
Verify
StepVerifierOptions
```

