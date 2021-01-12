

`ApplicationContext` 은 여러가지 클래스를 상속받는다.

그 중  MessageSource 와 ApplicationEventPublisher , `ResourceLoader` 를 알아보자.

소개한 위 세 인터페이스 각각은 여러 메시지 기능(다국어, 캐시 등)을 제공하고, 이벤트 프로그래밍에 필요한 인터페이스를 제공하며, 리소스를 읽어오는 기능을 제공한다.



<br />

---

## MessageSource



Spring은 다국어 기능을 지원한다.

`MessageSource` 는 빈으로 등록되어 있는 클래스이기 때문에, `@Autowired` 로 의존성 주입이 가능하여 바로 끌어다 사용할 수 있다.

여기서 `getMessage()` 메소드를 사용하면 된다.



다국어 메시지 설정은 프로퍼티 파일을 생성하면 된다.

**messages_ko_KR.properties**

```properties
greeting=안녕 {0}
```



**messages.properties**

```properties
greeting=Hello {0}
```



Runner로 테스트를 해보자.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    MessageSource messageSource;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(messageSource.getClass());
        System.out.println(messageSource.getMessage("greeting", new String[]{"Rabbit"}, Locale.getDefault()));
        System.out.println(messageSource.getMessage("greeting", new String[]{"Rabbit"}, Locale.KOREA));
    }
}
```



내 프로젝트에서는 default 값이 KOREA 였는데, 영어를 원하면 `messages_en.properties` 를 만들어서 `Locale.ENGLISH` 로 가져오면 된다.



<br />



---

## ApplicationEventPublisher



옵저버 패턴 구현체로, 이벤트 기반 프로그래밍을 할 때 유용하다.

간단한 예제는 아래와 같다.

1) 이벤트를 만든다.

2) 이벤트를 Listener 에 등록시킨다.

3) AppRunner 에서 이벤트를 발생시키고, 위에서 등록한 이벤트 리스너가 이벤트를 작동시키도록 한다.

<br />

### **1) 이벤트 생성**

```java
public class BlueEvent extends ApplicationEvent {

    private int data;

    public int getData() {
        return data;
    }

    public BlueEvent(Object source, int data) {
        super(source);
        this.data = data;
    }
}

```

<br />

### **2) 이벤트 리스너 등록**

```java
@Component
public class BlueEventHandler implements ApplicationListener<BlueEvent> {

    @Override
    public void onApplicationEvent(BlueEvent blueEvent) {
        System.out.println("이벤트 받았다. data: " + blueEvent.getData());
    }
}
```

<br />



### **3) 이벤트 실행**

AppRunner 를 작성하여, `ApplicationEventPublisher` 를 주입시킨 후 `publishEvent()` 메소드를 실행해보자.

BlueEvent 라는 객체에 파라미터를 담아 전달해주어보자.

```java
@Component
public class AppRunner implements ApplicationRunner {

    // ApplicationContext 를 받아와도 된다.
    @Autowired
    ApplicationEventPublisher publisherEvent;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        publisherEvent.publishEvent(new BlueEvent(this, 100));
    }
}
```



---

<br />

### **이렇게 사용하길 권장합니다.**

이 코드를 스프링 코드 없이 애노테이션만 달고 만들어보자. 즉, 비침투성을 만족하는 코드를 만들어보자.

> 비침투성 (Non-Invasive) =  (Transparent)
>
> * 스프링 코드가 내 코드에 들어오지 않게 작성하는 것이다. POJO 기반 프로그래밍이다.

> POJO : Plain Old Java Object, 오래된 방식의 자바 오브젝트
>
> * 특별한 제한에 종속되지 않고, 클래스패스(classpath)를 필요로 하지 않는 자바 객체를 의미한다. 상속, 인터페이스 구현, 어노테이션 사용을 금지한다.
> * 테스트가 더 편하고, 코드를 유지보수하기 쉬워진다.

```java
public class BlueEvent {

    private int data;

    private Object source;

    public int getData() {
        return data;
    }

    public Object getSource() {
        return source;
    }

    public BlueEvent(Object source, int data) {
        this.source = source;
        this.data = data;
    }
}
```

이벤트는 더이상 ApplicationEvent 를 상속받지 않는다. 독립적인 코드다.

이렇게 할 수 있는 이유는 스프링 4.2버전 이후로 위 이벤트 클래스를 상속받지 않아도 이벤트가 등록이 되기 때문이다.



```java
@Component
public class BlueEventHandler {

    @EventListener
    public void handle(BlueEvent blueEvent) {
        System.out.println("이벤트 받았다. data: " + blueEvent.getData());
    }
}

```

핸들러 역시 더이상 ApplicationListener를 구현하지 않는다. 핸들러의 경우는 빈으로 등록을 해주어야 ApplicationContext에서 `publishEvent`로 불러와서 실행이 가능하므로 메소드위해 `@EventListener` 어노테이션을 붙여주자.

코드가 훨씬 깔끔해졌고, 잘 동작한다.



---

<br />

### **순서 정하기**

조금 더 응용해보자.

다른 이벤트 핸들러를 추가하면, publishEvent 호출 시 등록된 모든 이벤트 핸들러가 동작한다.

순서는 정해진 순서대로 발생하지만, `@Order` 어노테이션으로 순서를 정할수도 있다.

```java
@Component
public class BlueEventHandler {

    @EventListener
    @Order(Ordered.HIGHEST_PRECEDENCE // Blue 먼저
    public void handle(BlueEvent blueEvent) {
        System.out.println(Thread.currentThread().toString()); // 현재 스레드 확인
        System.out.println("BlueEventHandler " + blueEvent.getData());
    }
}

```



```java
@Component
public class GreenEventHandler {

    @EventListener
    @Order(Ordered.HIGHEST_PRECEDENCE + 1) // Green 나중
    public void handle(BlueEvent blueEvent) {
        System.out.println(Thread.currentThread().toString()); // 현재 스레드 확인
        System.out.println("GreenEventHandler " + blueEvent.getData());
    }
}

```



---

<br />

### 비동기

위 이벤트들은 기본적으로 동기적(synchronous) 으로 발생한다.

이벤트들이 비동기로 동작하게 하려면 `@Async` 어노테이션을 붙이면 된다. 이렇게 하려면 프로젝트 최상위 클래스인 메인 클래스 위에도 `@EnableAsync` 어노테이션을 붙이면 된다.





---

<br />

### 여러 이벤트들



```java
package me.wordbe.springgoahead;

import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class BlueEventHandler {

    @EventListener
    @Async
    public void handle(BlueEvent blueEvent) {
        System.out.println(Thread.currentThread().toString());
        System.out.println("이벤트 받았다. data: " + blueEvent.getData());
    }

    @EventListener
    @Async
    public void handle(ContextRefreshedEvent blueEvent) {
        System.out.println(Thread.currentThread().toString());
        System.out.println("컨텍스트 리프레쉬 이벤트");
    }

    @EventListener
    @Async
    public void handle(ContextClosedEvent blueEvent) {
        System.out.println(Thread.currentThread().toString());
        System.out.println("컨테스트 클로즈드 이벤트");
    }
}

```

* ContextRefreshedEvent 는 ApplicationContext 를 초기화하거나, 리프레시 했을 때 발생한다.
* ContextStartedEvent 는 ApplicationContext 를 start() 해서 라이프사이클 빈들이 시작 신호를 받은 시점에 발생한다.
* ContextStoppedEvent : ApplicationContext 를 stop() 해서 라이프사이클 빈들이 정지 신호를 받은 시점에 발생한다.
* ContextClosedEvent : ApplicationContext 를 close() 해서 싱글톤 빈이 소멸되는 시점에 발생한다. (실행 중인 스프링을 중지하면 발생한다.)
* RequestHandledEvent : HTTP 요청을 처리했을 때 발생한다.





<br />

---

## ResourceLoader





`Resourceloader` 를 통해 resources 폴더 안의 리소스들을 읽을 수 있다.



classpath 는 기본적으로 target/classes 로 되어있다.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    ResourceLoader resourceLoader;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Resource resource = resourceLoader.getResource("classpath:test.txt");
        System.out.println(resource.exists()); // 리소스(파일)가 존재하면 true
        System.out.println(resource.getURI()); // 리소스 위치
        System.out.println(Files.readString(Path.of(resource.getURI()))); // 리소스 안의 내용 읽기 (java 11)
    }
}
```

리소스는 파일 시스템, 클래스패스, URL, 상대/절대 경로 등 다양한 방법으로 읽어올 수 있다. 

