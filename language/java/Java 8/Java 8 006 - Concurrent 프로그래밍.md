# Java 8 006 - Concurrent 프로그래밍



## 1. Concurrent Programming

Concurrent 소프트웨어는 동시에 여러 작업을 할 수 있는 소프트웨어 이다.

자바에서 지원하는 concurrent 프로그래밍은 멀티프로세싱 (`PrecessBuilder`) 과 멀티쓰레드이다.

자바 멀티쓰레드 프로그래밍은 Thread 또는 Runnable 로 구현할 수 있다.

**방법 1) `Thread` 를 상속받아서 만든다.**

```java
public class Application {

  public static void main(String[] args) {
    // 다른 쓰레드
    MyThread myThread = new MyThread();
    myThread.start();

    // Main 쓰레드
    System.out.println(Thread.currentThread().getName()); // main

  }

  static class MyThread extends Thread {
    @Override
    public void run() {
      System.out.println("Thread: " + Thread.currentThread().getName());
    }
  }
}
```

<br />

쓰레드는 시작, 종료시기가 항상 같은 것이 아니므로, Main 쓰레드와 다른 쓰레드 중에 누가 더 빨리 끝나는데 100% 확류로 맞출 수는 없다.

**방법 2 `Runnable` 을 사용해서 만든다.**

```java
public static void main(String[] args) {
  Thread thread = new Thread(new Runnable() {
    @Override
    public void run() {
      System.out.println("익명클래스 쓰레드: " + Thread.currentThread().getName());
    }
  });
  thread.start();

  System.out.println("Hello: " + Thread.currentThread().getName()); // main
}
```

또는 `Runnable` 을 함수형인터페이스로 바꾸어서 람다식으로 표현한다.

```java
Thread thread = new Thread(() -> {
  System.out.println("익명클래스 쓰레드: " + Thread.currentThread().getName());
});
```

<br />

### 쓰레드의 주요 기능

* `sleep()` : 현재 쓰레드를 멈춘다. 다른 쓰레드가 처리할 수 있도록 기회를 주지만, 락을 놔주진 않는다.(데드락이 걸릴 수도 있다.) 주어진 시간만큼 쉬었다가 다시 실행된다. 잠들고 있는 사이에는 다른 쓰레드가 실행된다.

```java
public static void main(String[] args) {
  Thread thread = new Thread(() -> {
    try {
      Thread.sleep(1000L);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    System.out.println("익명클래스 쓰레드: " + Thread.currentThread().getName());
  });
  thread.start();

  System.out.println("Hello: " + Thread.currentThread().getName()); // main
}
```

* `interrupt` : 다른 쓰레드를 깨울 수 있다. 자고 있는 쓰레드를 깨운다. 깨운 후 `interruptedException` 을 발생시킨다. 에러 발생 후 해야할 일을 직접 작성할 수 있다. (종료 or 계속)

```java
public static void main(String[] args) throws InterruptedException {
  Thread thread = new Thread(() -> {
    while (true) {
      System.out.println("쓰레드: " + Thread.currentThread().getName());
      try {
        Thread.sleep(1000l);
      } catch (InterruptedException e) {
        System.out.println("exit!");
        return;
      }
    }
  });
  thread.start();

  System.out.println("Hello: " + Thread.currentThread().getName()); // main
  Thread.sleep(3000l);
  thread.interrupt();
}
```

```shell
쓰레드: Thread-0
Hello: main
쓰레드: Thread-0
쓰레드: Thread-0
exit!
```

* `join` : 다른 쓰레드를 기다릴 수 있다. 실행중인 다른 쓰레드가 끝날 때까지 기다린다.

```java
public static void main(String[] args) throws InterruptedException {
  Thread thread = new Thread(() -> {
    while (true) {
      System.out.println("쓰레드: " + Thread.currentThread().getName());
      try {
        Thread.sleep(1000l);
      } catch (InterruptedException e) {
        throw new IllegalStateException(e);
      }
    }
  });
  thread.start();

  thread.join();
  System.out.println(thread + "is finished!");
  System.out.println("Hello: " + Thread.currentThread().getName()); // main
}
```





<br />

---

## 2. Executors



### Executors 란?

`Executors` 는 고수준 (High-Level) 동시성(Concurrency) 프로그래밍이다. 쓰레드를 만들고 관리하는 작업을 애플리케이션에서 분리했다. `Runnable` 을 `Executor` 에게 위임하고, 개발자는 쓰레드 기술을 쉽게 이용할 수 있다.

<br />

### Excutors 가 하는 일

애플리케이션이 사용할 쓰레드 풀을 만들어서 관리한다. 쓰레드를 생성하고, 쓰레드의 생명주기를 관리한다. 또한 쓰레드로 실행할 작업을 돕는 API를 제공한다.

### 주요 인터페이스

* `ExecutorService.(Runnable)`
* `ExecutorService` 는 `Excutors` 를 상속 받은 인터페이스로, `Executor` 를 실행하고 종료시킬 수 있고, `Callable` 을 실행하고 여러 `Callable` 을 동시에 실행하는 등의 기능을 제공한다.
* `ScheduledExecutorService`는 `ExecutorService` 를 상속받은 인터페이스로 특정 시간 이후 또는 주기적으로 작업을 실행할 수 있다.

<br />

#### 싱글쓰레드

아래처럼 `execute` 로 싱글 쓰레드를 실행시킬 수 있다.

```java
public static void main(String[] args) {
  ExecutorService executorService = Executors.newSingleThreadExecutor();
  executorService.execute(new Runnable() {
    @Override
    public void run() {
      System.out.println("Thead " + Thread.currentThread().getName());
    }
  });
}
```

또는 아래와 같이 `submit` 과 람다식을 사용한다.

```java
ExecutorService executorService = Executors.newSingleThreadExecutor();
executorService.submit(() -> {
  System.out.println("Thread " + Thread.currentThread().getName());
});
```

<br />

`ExecutorService` 는 실행시키면 쓰레드가 끝나지 않고 다른 작업을 계속 기다린다. 따라서 실행을 끝내고 싶으면 명시적으로 `shutdown` 을 해주어야 한다.

```java
executorService.shutdown();
```

* `shutdown` : graceful shutdown 이다. 현재 작업 중인 작업을 끝까지 마치고, 쓰레드를 종료한다.
* `shutdownNow()` : 지금 바로 쓰레드를 종료한다.

<br />

#### 멀티쓰레드

`newFixedThreadPool` 로 여러 개의 쓰레드를 생성할 수 있다.

```java
// 쓰레드 2개를 사용한다.
ExecutorService executorService = Executors.newFixedThreadPool(2);
executorService.submit(getRunnable("one"));
executorService.submit(getRunnable("two"));
executorService.submit(getRunnable("three"));
executorService.submit(getRunnable("four"));
executorService.submit(getRunnable("five"));
executorService.shutdown();
```

결과

```shell
one pool-1-thread-1
two pool-1-thread-2
three pool-1-thread-1
four pool-1-thread-1
five pool-1-thread-1
```



> Q. 2개의 쓰레드에서 5개의 쓰레드를 어떻게 작업할까?
>
> ExecutorService 안에 하나의 풀 안에 2개의 쓰레드가 있는 상황이다. 이 외에 Blocking Queue 가 존재하는데 여기에 대기 중인 작업을 쌓아놓는다. 그래서 처음에 2개의 작업이 쓰레드에서 실행되는 동안 나머지 3개의 작업은 큐에 들어가서 대기하고 있는 환경이 만들어진다.

<br >

#### 쓰레드 스케쥴링

```java
ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
executorService.schedule(getRunnable("one"), 3, TimeUnit.SECONDS);
executorService.shutdown();
```

위와 같이 하면 쓰레드를 3초 후에 실행시킬 수 있다.

```java
ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
executorService.scheduleAtFixedRate(getRunnable("two"), 1, 2, TimeUnit.SECONDS);
```

Runnable 함수 다음에 두번째인자는 `initalDelay`, 세번째인자는 `period` 이다. 즉, 실행되고 1초가 지난 뒤 2초간격으로 반복해서 실행된다.



<br />

#### Fork/Join 프레임워크

* `ExecutorService` 의 구현체로 손쉽게 멀티 프로세서를 활용할 수 있게 도와준다.

<br />

---

## 3. Callable 과 Future

<br />

* `Callable` 은 Runnable 과 비슷하게 새로운 쓰레드를 생성하게 도와줄 수 있지만, 다른 점은 리턴값으로 작업의 결과를 받아올 수 있다는 것이다.
* `Future` 는 비동기 작업의 현재 상태를 조회하거나 결과를 가져올 수 있다.

<br />

`Callable` 을 만들어보자. 제네릭에 원하는 타입을 넣어서 반환 값을 받을 수 있다.

```java
Callable<String> hello = new Callable<String>() {
  @Override
  public String call() throws Exception {
    return null;
  }
};
```

또는 `Callable<V>` 은 함수형 인터페이스이므로 아래와 같이 람다식으로 정의할 수도 있다.

```java
Callable<String> hello = () -> null;
```

<br />

### 비동기 결과 가져오기 `get()`

`get()` 은 블록킹 콜이며, 타임아웃(최대한으로 기다릴 시간)을 설정할 수 있다.

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
  ExecutorService executorService = Executors.newSingleThreadExecutor();

  Callable<String> hello = () -> {
    Thread.sleep(2000l);
    return "hello";
  };

  Future<String> submit = executorService.submit(hello);
  System.out.println("started!");

  submit.get(); // blocking

  System.out.println("end!");
  executorService.shutdown();
}
```

결과

```shell
started!
# (2초 후)
end!
```

<br />

### 작업 상태 확인하기 `isDone()`

`isDone()` 으로 `Future` 가 끝났는 지 여부를 알 수 있다.

```java
Future<String> helloFuture = executorService.submit(hello);
System.out.println(helloFuture.isDone()); // false
System.out.println("started!");

helloFuture.get(); // blocking

System.out.println(helloFuture.isDone()); // true
System.out.println("end!");
executorService.shutdown();
```

<br />

### 작업 취소하기 `cancel()`

* 취소했으면 `true`, 그렇지 않으면 `false`를 리턴한다.
* 파라미터로 `true` 를 전달하면 현재 진행중인 쓰레드를 인터럽트하고, `false`로 전달하면 현재 진행중인 작업이 끝날 때까지 기다린다.

```java
helloFuture.cancel(true); // 현재 작업 중인 쓰레드를 바로 취소한다. (취소했으므로 이후 get할 수 없다.)
helloFuture.cancel(false); // 현재 작업 중인 쓰레드에서 작업을 다 마치고 취소한다. (취소했으므로 이후 get할 수 없다.)
```

<br />

### 여러 작업 동시에 실행하기

**`invokeAll()`**

여러 쓰레드 작업이 모두 끝날 때 까지 기다린 후, 끝난 순서대로 `future` 리스트를 반환한다. 동시에 실행한 작업 중 제일 오래 걸리는 작업 만큼 시간이 걸린다. Blocking call 이다.

<br />

예시) red 가 2초, orange 가 3초, blue가 1초가 소요된다. (현재 가진 모든 주식으로부터 현재 가격을 구할 때 등)

```java
ExecutorService executorService = Executors.newSingleThreadExecutor();

Callable<String> red = () -> {
  Thread.sleep(2000l);
  return "red";
};

Callable<String> orange = () -> {
  Thread.sleep(3000l);
  return "orange";
};

Callable<String> blue = () -> {
  Thread.sleep(1000l);
  return "blue";
};

List<Future<String>> futures = executorService.invokeAll(Arrays.asList(red, orange, blue));
for (Future<String> f : futures) {
  System.out.println(f.get());
}

executorService.shutdown();
```

```shell
red
orange
blue
```



`invokeAny()` :  여러 쓰레드 중 하나라도 먼저 응답이 오면 전체를 끝내고, 응답 결과를 바로 반환한다. Blocking call 이고 바로 결과가 나온다.

```java
// 멀티 쓰레드 환경
ExecutorService executorService = Executors.newFixedThreadPool(4);

Callable<String> red = () -> {
  Thread.sleep(2000l);
  return "red";
};

Callable<String> orange = () -> {
  Thread.sleep(3000l);
  return "orange";
};

Callable<String> blue = () -> {
  Thread.sleep(1000l);
  return "blue";
};

String fastestCallable = executorService.invokeAny(Arrays.asList(red, orange, blue));
System.out.println(fastestCallable); // blue
executorService.shutdown();
```



java 8 에서 새롭게 등장한 `CompletableFuture` 는 다음 장에서 다룬다.



