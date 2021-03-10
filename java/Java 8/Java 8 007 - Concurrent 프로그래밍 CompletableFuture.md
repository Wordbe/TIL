# Java 8 007 - Concurrent 프로그래밍 CompletableFuture



## CompletableFuture



자바에서 비동기(Asynchronous) 프로그래밍을 가능하게 하는 인터페이스이다. `Future` 를 사용해서도 어느정도 가능하지만 몇가지 어려운 점이 있었다.

<br />

### `Future` 로 하기 어려운 일들

* `Future` 를 외부에서 완료시킬 수 없다. 취소하거나, `get()` 에 타임아웃을 설정할 수는 있다.
* Blocking 코드(`get()`) 를 사용하지 않고서는 작업이 끝났을 때 콜백을 실행할 수 없다.
* 여러 `Future` 를 조합할 수 없다. 예) `Event` 정보를 가져온 다음 `Event` 에 참석하는 회원 목록을 가져오기
* 예외 처리용 API를 제공하지 않는다.

<br />

예시를 보자.

```java
ExecutorService executorService = Executors.newFixedThreadPool(4);
Future<String> future = executorService.submit(() -> "hello");

// TODO

future.get();
```

`Future` 를 만들고, `get()` 을 하기 전까지는 아무 것도 할 수 없다. `get()`이 blocking 코드이므로 `get()` 전에 실행하고 싶은 것들을 잔뜩 적어놔야 한다. 따라서 java 5 에서 제공하는 `Future` 만으로는 javascript 처럼 비동기 프로그래밍 형태의 코드를 짜는 일이 쉽지 않다.

<br />

### CompletableFuture 로 비동기 작업 실행하기

`CompletableFuture` 를 활용해서 비동기 프로그래밍에 가까운 프로그래밍을 해보자.

`CompletableFuture` 는 `Future` 인터페이스를 구현한 구현 클래스이다. 이와 동시에 `CompletionStage` 인터페이스의 구현 클래스이기도 하다.

`CompletableFuture` 는 외부에서 complete 을 할 수 있다.

```java
CompletableFuture<String> future = new CompletableFuture<>();
// 명시적으로 값을 입력할 수 있다.
future.complete("jack");

System.out.println(future.get()); // jack
```

또는 아래처럼 사용할 수 있다.

```java
CompletableFuture<String> future = CompletableFuture.completedFuture("jack");

System.out.println(future.get()); // jack
```

<br />

리턴 값이 없는 경우

```java
CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
});
future.get();
```

리턴 값이 있는 경우

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
});
System.out.println(future.get());
```

여기까지는 기존 `Future` 와 사용법이 비슷하다.



### Callback 제공하기

콜백 함수를 `get()` 전에 정의할 수 있다.

리턴 값이 있는 경우 `thenApply` 를 사용한다.

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
}).thenApply((s) -> {
  System.out.println(Thread.currentThread().getName());
  return s.toUpperCase();
});
System.out.println(future.get());
```

리턴 값이 필요 없을 때는 `thenAccept` 를 사용한다.

```java
CompletableFuture<Void> future = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
}).thenAccept((s) -> {
  System.out.println(Thread.currentThread().getName());
  System.out.println(s.toUpperCase());
});
future.get();
```

단지 실행만 하고 싶은 경우 `thenRun` 을 사용하면 된다. `Runnable` 과 흡사하다.

```java
CompletableFuture<Void> future = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
}).thenRun(() -> {
  System.out.println(Thread.currentThread().getName());
});
System.out.println(future.get());
```



Deque 를 사용한다.

Fork/Join 프레임워크 기술을 이용한다.

별도의 ExecutorService 를 사용하지 않고 common pool 을 사용한다.

하지만 원한다면 ExecutorService 를 사용할 수 있다.

```java
ExecutorService executorService = Executors.newFixedThreadPool(4);

CompletableFuture<Void> future = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
}, executorService).thenRunAsync(() -> {
  System.out.println(Thread.currentThread().getName());
}, executorService);
future.get();
executorService.shutdown();
```



---

### 조합하기

* `thenCompose()` : 두 작업을 서로 이어서 실행하도록 조합할 수 있다.
* `thenCombine()` : 두 작업을 독립적으로 실행하고 둘 다 종료 했을 때 콜백이 실행된다.
* `allOf()` : 여러 작업을 모두 실행하고 모든 작업 결과가 끝났을 때 콜백을 실행한다.
* `anyOf()` : 여러 작업 중에서 가장 빨리 끝난 작업을 기준으로 콜백을 실행한다.

<br />

`thenCompose` 예시

```java
public class Application {

  public static void main(String[] args) throws ExecutionException, InterruptedException {
    CompletableFuture<String> hello = CompletableFuture.supplyAsync(() -> {
      System.out.println("Hello " + Thread.currentThread().getName());
      return "Hello";
    });

    CompletableFuture<String> future = hello.thenCompose(Application::getWorld);
    System.out.println(future.get());


  }

  private static CompletableFuture<String> getWorld(String message) {
    return CompletableFuture.supplyAsync(() -> {
      System.out.println("world " + Thread.currentThread().getName());
      return message + " world";
    });
  }
}
```

```shell
Hello ForkJoinPool.commonPool-worker-19
world ForkJoinPool.commonPool-worker-5
Hello world
```

hello 객체에 getWorld 함수를 이을 수 있다.

<br />

`thenCombine` 예시 : 연관 관계가 없는 경우

```java
CompletableFuture<String> hello = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
});

CompletableFuture<String> world = CompletableFuture.supplyAsync(() -> {
  System.out.println("world " + Thread.currentThread().getName());
  return "world";
});

CompletableFuture<String> future = hello.thenCombine(world, (h, w) -> h + " " + w);
System.out.println(future.get());
```

<br />

`allOf()` 예시

```java
CompletableFuture<String> hello = CompletableFuture.supplyAsync(() -> {
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
});

CompletableFuture<String> world = CompletableFuture.supplyAsync(() -> {
  System.out.println("world " + Thread.currentThread().getName());
  return "world";
});

CompletableFuture<Void> voidCompletableFuture = CompletableFuture.allOf(hello, world)
	  .thenAccept(System.out::println);
```

출력 결과는 `null` 이다.

각 쓰레드 작업의 결과에서 모든 값의 타입이 동일하지 않을 수도 있다. 타입이 다를 수도 있고 심지어 에러가 발생했을 수도 있다. 따라서 여러 `CompletableFuture` 의 결과를 받아서 `thenAccept` 를 하면 null을 반환한다.

정상적으로 동작하게 하려면 아래와 같이 코드를 작성한다.

```java
// Non-blocking
List<CompletableFuture<String>> futures = Arrays.asList(hello, world);
CompletableFuture[] futuresArray = futures.toArray(new CompletableFuture[futures.size()]);
CompletableFuture<List<String>> results = CompletableFuture.allOf(futuresArray)
  .thenApply(v -> futures.stream()
             .map(CompletableFuture::join)
             .collect(Collectors.toList())
            );
results.get().forEach(System.out::println);
```

결과

```shell
Hello ForkJoinPool.commonPool-worker-19
world ForkJoinPool.commonPool-worker-5
Hello
world
```

`join` 은 `get` 과 같은 역할을 하지만 예외시 uncheckedException 을 발생시킨다. 즉 어떤 사전 조치를 할 필요가 없다. 반면 `get()` 은 try~catch 구문으로 감싸주어야 하기 때문에 `join` 이 코드 작성시 좀 더 깔끔하다.

모든 작업을 동일하게 기다렸다가 처리한다.

<br />

`anyOf()` 예시

```java
CompletableFuture<Void> future = CompletableFuture.anyOf(hello, world)
                .thenAccept((s) -> {
                    System.out.println(s);
                });
future.get();
```

둘 다 호출하는데, 먼저 작업이 끝난 것이 먼저 출력된다.



예외 처리

```java
boolean throwError = true;

CompletableFuture<String> hello = CompletableFuture.supplyAsync(() -> {
  if (throwError) {
    throw new IllegalArgumentException();
  }
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
}).exceptionally(ex -> {
  System.out.println(ex);
  return "error!!";
});

System.out.println(hello.get());
```



```java
boolean throwError = true;

CompletableFuture<String> hello = CompletableFuture.supplyAsync(() -> {
  if (throwError) {
    throw new IllegalArgumentException();
  }
  System.out.println("Hello " + Thread.currentThread().getName());
  return "Hello";
}).handle((result, ex) -> {
  if (ex != null) {
    System.out.println(ex);
    return "error!!";
  }
  return result;
});

System.out.println(hello.get());
```

