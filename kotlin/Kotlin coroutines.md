# Kotlin coroutines



# 1 Why coroutines

- 루틴의 일종
- 협동 루틴
- co 는 with 또는 together 를 뜻한다.
- 코루틴은 이전에 자신의 실행이 마지막으로 중단되었던 지점 다음의 장소에서 실행을 재개한다.
- 1958년 어셈블리 프로그램에 적용
- 코루틴은 협력작업, 예외, 이벤트루프, 반복자, 무한목록, 파이프와 같은 친숙한 프로그램 구성 요소를 구현하는데 적합하다.
- 코루틴은 concurrency design pattern. 비동기 실행하는 코드를 간단하게 만든다.
  - 비동기 콜백을 순차적 코드로 바꿔준다.
  - 비동기 순차적 코드를 만들기 위해 suspend function 을 사용한다.
- 애플리케이션의 메인 쓰레드를 블로킹해서 반응적이지 못하게 만드는 긴 실행 작업을 관리하는데 도움을 준다.



```kotlin
suspend fun loadUser() {
  // Network thread 가동
  val user = api.fetchUser()
  show(user)
}
```





# 2 Basics

> 정리
>
> - 코루틴 빌더
>
>   - launch
>   - runBlocking
>
> - Scope
>
>   - CoroutineScope
>   - GlablScope
>
> - Suspend function
>
>   - suspend
>   - delay()
>   - join()
>
> - Structured Concurrency
>
> - 코루틴 디버깅
>
>   - VM Options 에 `-Dkotlinx.coroutines.debug` 추가
>
>   - println 함수 오버라이딩하여 메인쓰레드 이름을 출력하게 함
>
>     ```kotlin
>     fun <T> println(msg: T) {
>       kotlin.io.println("$msg [${Thread.currentThread().name}]")
>     }
>     ```



```kotlin
fun main() {
  GlobalScope.launch {
    delay(1000L)
    println("World!")
  }
  
  println("Hello, ")
  Thead.sleep(2000L)
}
```

```kotlin
>
Hello,
World!
```



- launch 는 코루틴을 생성하여 반환한다. (coroutine builder)
- 본질적으로, 코루틴은 light-weight 쓰레드이다.
- GlobalScope.launch 를 thread 로 바꾸어도 동일한 결과가 나온다.



## Bridging blocking and non-blocking worlds

```kotlin
fun main() {
  GlobalScope.launch {
    delay(1000L)
    println("World!")
  }
  
  println("Hello, ")
  runBlocking {
    delay(2000L)
  }
}
```

- delay 는 suspend 함수고, suspend 함수는 코루틴 블록이나 다른 suspend 함수 안에서 사용가능하다.
- launch 는 자신을 호출한 쓰레드를 블로킹하지 않지만, runBlocking 은 블로킹한다.





```kotlin
fun main() = runBlocking {
  GlobalScope.launch {
    delay(1000L)
    println("World!")
  }
  
  println("Hello, ")
  delay(2000L)
}
```

- 조금 더 관용적인 코드 표현



## Waiting for a job

```kotlin
fun main() = runBlocking {
  val job = GlobalScope.launch {
    delay(3000L)
    println("World!")
  }
  
  println("Hello, ")
  job.join()
}
```

- launch 는 job 을 반환한다. 
- join 을 통해 코루틴 잡이 완료될 때까지 기다렸다가 메인쓰레드를 종료할 수 있다.



## Structured Concurrency

```kotlin
fun main() = runBlocking {
  launch {
    delay(1000L)
    println("World!")
  }
  
  launch {
    delay(1000L)
    println("World!")
  }
  
  println("Hello, ")
}
```

- job, join 보다 조금 더 코드가 깔끔한 방식
- 부모 코루틴이 자식 코루틴을 다 기다려주므로, runBlocking 안에 launch 로 코루틴을 실행시킬 수 있다.



## Extract function Refactoring

```kotlin
fun main() = runBlocking {
  launch {
    myWorld()
  }
  
  println("Hello, ")
}

suspend fun myWorld() {
  delay(1000L)
  println("World!")
}
```



## Coroutines are light-weight

```kotlin
fun main() = runBlocking {
  repeat(100_000) {
  	launch {
      delay(1000L)
      println(".")
    }  
  }
}
```

- thread 로 바꾸었으면, 약간 버벅거리는 현상이 발생한다. 하지만 코루틴은 경량화된 쓰레드 이므로 10만개도 거뜬하다.
- launch 100K coroutines



## Global coroutines are like daemon threads

```kotlin
fun main() = runBlocking {
  GlobalScope.launch {
  	repeat(1000) { i ->
      println("I'm sleeping $i ...")
      delay(500L)
    }  
  }
  
  delay(1300L)
}

//
I'm sleeping 0 ...
I'm sleeping 1 ...
I'm sleeping 2 ...
```

- 프로세스가 끝나면 코루틴도 끝난다.



## 코루틴을 교대로 실행

```kotlin
fun main() = runBlocking {
  launch {
    delay(1000L)
    println("World!")
  }
  
  launch {
    delay(1000L)
    println("World!")
  }
  
  println("Hello, ")
}
```



# 3 Cancellation and Timeouts

> 정리
>
> Job
>
> - cancel()
>
> Cacellation is cooperative
>
> - way 1 : to periodically invoke a suspending
> - way 2 : explictly check the cancellation status (isActive)
>
> Timeout
>
> - withTimeout
> - withTimeoutOrNull



## 코루틴 실행 취소하기

- job.cancel()

## Cancellation is cooperative

- 코루틴 안에 suspend 함수가 있어야 cancel 이 가능하다.
- delay() 함수 대신 yield() 함수도 가능하다. 둘 다 suspsend 함수다.
- cancel 할 때 suspend 함수에서 예외가 발생한다. try ~ catch 문으로 확인가능하다.

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    val job = launch(Dispatchers.Default) {
        var nextPrintTime = startTime
        var i = 0
        while (i < 5) {
            if (System.currentTimeMillis() >= nextPrintTime) {
//                delay(1L)
                yield()
                println("job: I'm sleeping ${i++} ...")
                nextPrintTime += 500L
            }
        }
    }

    delay(1300L)
    println("main: I'm tired of waiting!")
    job.cancelAndJoin()
    println("main: Now I can quit.")
}
```





- 또는 취소 상태를 명시적으로 확인하면 된다. (isActive)
  - 이 때는 예외를 던지지는 않는다.

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    val job = launch(Dispatchers.Default) {
        var nextPrintTime = startTime
        var i = 0
        println("isActive $isActive")
        while (isActive) {
            if (System.currentTimeMillis() >= nextPrintTime) {
                println("job: I'm sleeping ${i++} ...")
                nextPrintTime += 500L
            }
        }
        println("isActive $isActive")
    }

    delay(1300L)
    println("main: I'm tired of waiting!")
    job.cancelAndJoin()
    println("main: Now I can quit.")
}
```



## Closing resources with finally



## Run non-cancellable bloc

- 드문 상황
- 취소가능하지 않은 블록 실행

```kotlin
fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        try {
            repeat(1000) { i ->
                println("job: I'm sleeping $i ...")
                delay(500L)
            }
        } finally {
            withContext(NonCancellable) {
                println("job: I'm running finally")
                delay(1000L)
                println("job: And I've just delayed for 1 sec because I'm non-cancellable")
            }
        }
    }

    delay(1300L)
    println("main: I'm tired of waiting!")
    job.cancelAndJoin()
    println("main: Now I can quit.")
}
```



## Timeout

- withTimeout : 시간초과시 예외를 발생시키며 타임아웃을 낸다.
- withTimeoutOrNull : 예외 대신 null 반환

```kotlin
fun main() = runBlocking {
    val result = withTimeoutOrNull(1300L) {
        repeat(1000) { i ->
            println("job: I'm sleeping $i ...")
            delay(500L)
        }
    }
    println("Result is $result")
}
```



---

# 4 Composing Suspending Functions

> 정리
>
> Async to sequential
>
> - Sequentail by default
> - The Dream Code
>
> Async
>
> - Concurrent using async
> - Lazily started async
>
> Structured Concurrency
>
> - Async-style functions (strongly discouraged)
> - Structured concurrency with async

## Sequential by default

- 다른 코드와 마찬가지로 순차적으로 작성한다.
- main 쓰레드를 블로킹할 수도 있고 안할 수도 있다.



## Concurrent using async

- 코루틴으로 동시성 처리를 위해서는 `async` 를 붙여 명시적으로 표현하고, `await()` 으로 기다린다.
- `async` 를 붙인 함수의 반환값은 `Deffered` 다. 이는 Job 을 상속한다.

```kotlin
fun main() = runBlocking {
    val time = measureTimeMillis {
        val one = async { doSomethingUsefulOne() }
        val two = async { doSomethingUsefulTwo() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L)
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L)
    return 29
}
```



## Lazily started async

- start() 또는 await() 시 async 함수가 실행된다.





## Structured concurrency with async

- 정형화된 동시성 패턴으로 예외가 발생하면 모든 코루틴이 취소되게 할 수 있다.
- global 로 다루지 말고, (섞일 수 있어 위험하니까) coroutineScope 따로 정의해서 리팩토링할 것

```kotlin
fun main() = runBlocking {
    val time = measureTimeMillis {
        println("The answer is ${concurrentSum()}")
    }
    println("Completed in $time ms")
}

suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}
```

- cancel 은 전파가되며, 예전에 동작시켰던 코루틴을 멈출 수 있다.



---

# 5 Coroutines under the hood

> 정리
>
> - There is no magic
>   - CPS == Callbacks
>   - CPS Transformation
> - Decompile
>   - Labels
>   - Callback
> - CPS simulation
>   - debugging

- 코루틴은 컴파일 후 CPS(Continuation Passing Style == Callback) 이 된다.
- 함수 매개변수 맨 뒤에 `Continuation<T> cont` 매개변수가 추가된다.
- 중단시 재개되어야 하므로 suspend 함수가 사용된 코드에는 label 이 붙는다.
  - switch 문에서 label 마다 분기 되는 코드가 만들어진다.
  - suspend 함수를 호출할 때 Continuation 을 같이 넣어 호출한다.
- CoroutineImpl 구현체가 (state machine) 매개변수로 들어가게 된다.
- Intellij > Tools > Kotlin > Show Kotlin Bytecode > Decompile > java 코드 확인



---

# 6 Coroutine Context and Dispatchers

## Dispatchers and threads

- coroutine context 는 coroutine dispatcher 를 포함한다.
- 실행할때 무슨 쓰레드를 사용할 지 결정한다.
- 모든 코루틴 빌더는 `CoroutineContext` 매개변수를 선택적으로 가질 수 있다. dispatcher 를 명시할 때 사용된다.

```kotlin
fun main() = runBlocking<Unit> {
    launch { // 부모 컨텍스트, main runBlocking coroutine
        println("main runBlocking       :" +
                " I'm working in thread ${Thread.currentThread().name}")
    }

    launch(Dispatchers.Unconfined) { // 갇히지 않고, main thread 와 같이 일한다.
        println("Unconfined             :" +
                " I'm working in thread ${Thread.currentThread().name}")
    }

    launch(Dispatchers.Default) { // DefaultDispatcher 쓰레드에 보내진다.
        println("Default                :" +
                " I'm working in thread ${Thread.currentThread().name}")
    }

    newSingleThreadContext("MyOwnThread").use { // use 를 써야 새로운 쓰레드 생성시 close 를 같이 해준다.
        launch(it) {
            println("newSingleThreadContext :" +
                    " I'm working in thread ${Thread.currentThread().name}")
        }
    }
}
```



## Debugging coroutines and threads

- kotlinx.coroutines 는 디버그 시설을 포함해놓았음
- JVM options 추가 : `-Dkotlinx.coroutines.debug`



## Jumping (Switching) between threads

- 같은 코루틴에 머물면서, 여러 쓰레드를 오고갈 수 있다.

```kotlin
// Jump between Threads
fun main() {
    newSingleThreadContext("context1").use { ctx1 ->
        newSingleThreadContext("context2").use { ctx2 ->
            runBlocking(ctx1) {
                println("started in context1")

                withContext(ctx2) {
                    println("working in context2")
                }

                println("back to context1")
            }
        }
    }
}
```



## Job in the Context

- 코루틴의 잡은 해당 코루틴 컨텍스트의 부분이다.
- `coroutineContext[Job]` 표현식 사용해서 얻을 수 있다.
- 참고)
  - isActive 는 사실 coroutineContext[Job]?.isActive ?: true 이었다.





## Children of a coroutine

- 새 코루틴의 잡은 부모 코루틴의 잡의 자식이 된다.
  - 부모 코루틴이 종료되면 자식 코루틴도 종료된다.
- 단, `GlobalScope` 은 코루틴을 시작하기 위해 사용되고, 해당 잡의 부모는 없다.



## Parental Responsibilities

- 부모 코루틴은 자식 코루틴의 완료를 항상 기다린다.
- 따라서 자식 코루틴을 명시적으로 추적할 필요는 없다.
- Job.join 등을 사용할 필요가 없다.



## Combining Context Elements

- 가끔 코루틴 컨텍스트에서 여러 요소를 정의해야하는데, 이 떄 + 연산자를 사용할 수 있다.

```kotlin
fun main() = runBlocking<Unit>() {
    launch(Dispatchers.Default + CoroutineName("test")) {
        println("I'm working in thread ${Thread.currentThread().name}")
    }
}
```



## Coroutine Scope

- 코루틴 스코프 선언
- 코루틴 스코프를 취소하면, 해당 스코프 안의 코루틴들도 모두 취소된다.

