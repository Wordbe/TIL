

# Kotlin Cookbook 005



# 12 스프링 프레임워크

## 1 확장을 위해 스프링 관리 빈 클래스 오픈하기

- 스프링은 개발자가 작성한 클래스를 확장하는 프록시를 생성해야 한다.
- 코틀린 클래스는 기본적으로 닫혀있다. (final)
- 이를 해결하려면 all-open 플러그인을 사용한다.
  - 명시적으로 `open` 키워드를 추가하지 않아도 된다.
  - kotlin-spring 플러그인이 더 적합할 수도 있다.
  - 아래 스프링 어노테이션 클래스를 열도록 설정되어 있다.
    - `@Component`, `@Async`, `@Transactional`, `@Cacheable`, `@SpringBootTest`



## 2 data 클래스로 persistence 구현하기

- JPA 에서 기본 생성자가 필수이지만, data 클래스에는 기본 생성자가 없다.
  - `no-arg` 플러그인 추가 : 코틀린 엔티티에 기본 생성자를 자동으로 추가한다. 
  - `plugin-jpa` 는 아래 어노테이션이 붙은 객체에 기본생성자를 추가한다.
    - `@Entity`, `@Embeddable`, `@MapperSuperClass`
- val 속성과 함께 data 클래스를 생성하면 불변 객체가 생성되는데, JPA는 불변 객체로 작동하지 않는다.
  - 속성에 var 을 사용하는 단순 클래스 사용을 추천한다.
  - data class 사용 X



## 3 의존성 주입하기

1. 생성자가 하나뿐일 때는 의존성을 속성으로 선언하면 자동으로 오토와이어링한다.
2. `@Autowired` 를 생성자 인자에 명시적으로 사용한다.
3. 다수의 의존성을 주입할 때는 `@Autowired` 를 생성자 함수 앞에 위치시켜 간소화한다.
4. 필드 주입할 때는 `lateinit var` 구조를 사용한다.
   - 언제든지 값을 변경할 수 있으므로, 생성자 주입을 더 선호한다.
   - 속성이 필수가 아니라면 nullable 타입으로 선언할수도 있다.

```kotlin
// 1
@RestController
class GreetingController(val service: GreetingService) { ... }

// 2
@RestController
class GreetingController(@Autowired val service: GreetingService) { ... }

//3 
@RestController
class GreetingController @Autowired constructor(val service: GreetingService) { ... }

// 4
@RestController
class GreetingController {
  @Autowired
  lateinit var service: GreetingService
  ... 
}
```











---

# 13 코루틴과 구조적 동시성

- 코루틴은 동시성 코드를 마치 동기코드처럼 작성할 수 있게 도와준다.
  - 콜백 메소드나 리액티브 스트림과 같은 다른 방법보다 더 쉽게 동시성 코드를 작성할 수 있다.
- 코루틴 영역(scope), 코루틴 컨텍스트(context), 적절한 코루틴 빌더와 디스패처 선택하기, 코루틴 동작 조정하기
- 코루틴을 일시정지(suspend)하고 재개(resume)할 수 있다.
  - `suspend` 키워드로 함수를 만들면 복잡한 멀티스레딩 코드를 직접 작성하지 않고도 함수를 임시 정지하고 나중에 다른 스레드에서 이 정지된 함수를 재개할 수 도 있다는 것을 시스템에게 알려줄 수 있다.



## 1 코루틴 빌더 선택

- 새 코루틴 생성하려면 `runBlocking` (최상위 함수), `launch`, `async` (`CoroutineScope` 의 확장함수) 중 하나를 사용할 수 있다.



### runBlocking 빌더

- 현재 쓰레드를 블록하고, 모든 내부 코루틴이 종료될 때까지 블록한다.

- 시그니처

  ```kotlin
  fun <T> runBlocking(block: suspend CoroutineScope.() -> T): T
  ```

- 인자로 받은 suspend 함수를 실행하고, 실행한 함수가 리턴하는 값을 리턴한다.



### launch 빌더

- 독립된 프로세스를 실행하는 코루틴을 시작한다. 코루틴에서 리턴 받을 필요가 없을 때 사용

- launch 는 job 인스턴스를 리턴. 이를 통해 코루틴 취소가 가능

- 시그니처

  ```kotlin
  fun CoroutineScope.launch(
  	context: CoroutineContext = EmptyCoroutineContext, // 다른 코루틴과 상태를 공유하기 위해 사용
    start: CoroutineStart = CoroutineStart.DEFAULT, // DEFAULT, LAZY, ATOMIC, UNDISPATCHED
    block: suspend CoroutineScope.() -> Unit
  ): Job
  ```



### async 빌더

- 값을 리턴해야 하는 경우 async 를 사용한다.

- 시그니처

  ```kotlin
  fun <T> CoroutineScope.async(
  	context: CoroutineContext = EmptyCoroutineContext,
    start: CoroutineStart = CoroutineStart.DEFAULT,
    block: suspend CoroutineScope.() -> T	
  ): Deferred<T>
  ```

- 지연된 인스턴스(`Diferred`)로 리턴값을 감싼다.

  - 자바스크립트의 Promise 또는 자바의 Future 과 비슷하다.
  - `await`은 이렇게 생산된 값을 리턴하기 전에 코루틴이 완료될 때까지 기다린다.



### coroutineScope 빌더

- 종료 전에 포함된 모든 코루틴이 완료될 때까지 기다리는 일시중단함수이다.

- runBlocking 과 다르게 메인 스레드를 블록하지 않지만, 반드시 일시중단함수의 일부로서 호출돼야 한다.

- 모든 자식 코루틴이 완료될 때까지 기다린다.

- 시그니처

  ```kotlin
  suspend fun <R> coroutineScope(
  	block: suspend CoroutineScope.() -> R
  ): R
  ```

- 구조화된 동시성 : **하나의 코루틴이 실패하면 모든 코루틴이 취소될 수 있게 coroutineScope 내부에서 모든 코루틴을 실행시키는 관습이다.**



---

## 2 async/await을 withContext로 변경하기

- await 코드 간소화

- 시그니처

  ```kotlin
  suspend fun <T> withContext(
  	context: CoroutineContext,
    block: suspend CoroutineScope.() -> T
  ): T
  ```

- `withContext` 는 주어진 코루틴 컨텍스트와 함께 명시한 일시정지 블록을 호출하고, 완료될 때까지 정지한 후 결과를 리턴한다.

- 인텔리제이에서도 async 뒤에 바로 await 이 나오면 변환해주는 추천 문구가 뜬다.





## 3 Dispatcher 사용하기

- 코루틴 컨텍스트에는 `CoroutineDispatcher` 클래스의 인스턴스에 해당하는 코루틴 디스패처가 포함돼 있다.
- 디스패처는 코루틴이 어떤 쓰레드 또는 쓰레드풀에서 코루틴을 실행할지 결정한다.
- launch, async 등 빌더에서 `CoroutineContext` 파라미터를 통해 디스패처를 명시할 수 있다.
  - `Dispatcher.Default`
    - 공유 백그라운드 스레드 풀 사용, 대규모 계산 리소스를 소모하는 경우 적합
  - `Dispatcher.IO`
    - 파일 I/O, 블로킹 네트워크 I/O 등 입출력 집약적 블로킹 작업을 제거하기 위해 디자인된 스레드 온디맨드 공유 풀 사용
  - `Dispatcher.Unconfined`
    - 일반적인 애플리케이션 코드에서 사용하지 않는다.



## 4 자바 스레드 풀에서 코루틴 실행하기

- 코루틴을 사용하는 사용자 정의 스레드 풀을 만든다.

- 자바의 `ExecutorService` 의 `asCoroutineDispatcher` 함수를 사용한다. `Excutors` 클래스로 사용자 정의 스레드 풀을 정의한 다음 디스패처로 사용할 수 있게 반환한다.

- 자동으로 close 할 방법을 만들었고, `use` 메소드를 사용해야 한다.

- 시그니처

  ```kotlin
  inline fun <T: Closeable?, R> T.use(block: (T) -> R): R
  ```

- use 는 자바 Closeable 인터페이스의 확장함수로 정의되어 있다.

```kotlin
Executors.newFixedThreadPool(10).asCoroutineDispatcher().use {
  withContext(it) {
    delay(100L)
    println(Thread.currentThread().name)
  }
}
```

- use 블록 끝에서 디스패처를 닫을 것이고, 그러면 기저의 스레드도 닫힌다.





## 5 코루틴 취소하기

- 코루틴 내의 비동기 처리를 취소한다.

- `withTimeout`, `withTimeoutOrNull` 같은 함수가 리턴하는 Job 레퍼런스를 사용한다.

- 시그니처

  ```kotlin
  suspend fun <T> withTimeout(
  	timeMillis: Long,
    block: suspend CoroutineScope.() -> T
  ): T
  ```

  - Timout 초과하면 `TimoutCancellationException` 던진다.
  - 이를 캐치하거나 타움 아웃시 예외 던지는 대신 null 리턴하는 `withTimoutOrNull` 사용 가능



## 6 코루틴 디버깅

- `-Dkotlinx.coroutines.debug` 플래그를 사용해서 JVM 을 실행한다.
- @coroutine#1 등으로 해당 코루틴 이름이 기본으로 적혀나온다.
- 이를 수정하고 싶다면, `CoroutineName("myCoroutine")` 등으로 사용할 수 있다.

```kotlin
suspend fun retrievel(url: String) = coroutineScope {
  async(Dispatcher.IO + CoroutineName("async")) {
    delay(100L)
    "async result"
  }.await()
}
```



