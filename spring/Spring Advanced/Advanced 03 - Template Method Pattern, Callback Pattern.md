# Advanced 03 - Template Method Pattern, Callback Pattern



- 요구사항을 만족하는 로그 추적기를 잘 만들었다.
- 파라미터를 넘기는 불편함을 제거하기 위해 쓰레드로컬도 도입했다.
- 그런데 로그 추적기를 프로젝트에 도입하려고 하니 개발자들의 반대 목소리가 높다.
  - 추가해야할 중복 코드가 많아지기 때문이다.



## 핵심기능 vs 부가기능

핵심기능은 비즈니스로직, 부가기능은 로그를 남기는 것

추가하려는 부가기능을 자세히보면 동일한 패턴을 가지고 있다.

```java
TraceStatus status = null;
try {
  status = trace.begin("message");
	// 핵심 기능 호출
  trace.end(status);
} catch (Exception e) {
  trace.exception(status, e);
  throw e;
}
```



## 좋은 설계란

좋은 설계는 변하는 것과 변하지 않는 것을 분리하는 것이다.

위에서 핵심 기능 부분은 변하고, 로그 추적기를 사용하는 부분은 변하지 않는 부분이다.

이 둘을 분리해서 모듈화해야 한다.

템플릿 메서드 패턴 (Template Method Pattern) 은 이런 문제를 해결하는 디자인 패턴이다.

<br />

---

# 1. 템플릿 메서드 패턴 (Template Method Pattern)

**템플릿 메서드는 다형성을 사용해서 변하는 부분과 변하지 않는 부분을 분리하는 방법이다.**

AbstractTemplate

- execute()
- call()

SubClassLogic1

- call()

SubClassLogic2

- call()

 ```java
 @Slf4j
 public abstract class AbstractTemplate {
   public void execute() {
     long startTime = System.currentTimeMillis();
     // 비즈니스 로직 실행
     call(); // 상속
     // 비즈니스 로직 종료
     long endTime = System.currentTimeMillis();
     long elapsedTime = endTime - startTime;
     log.info("elapsedTime = {}", elapsedTime);
   }
 
   protected abstract void call();
 }
 ```

```java
@Slf4j
public class SubClassLogic1 extends AbstractTemplate {
  @Override
  protected void call() {
    log.info("비즈니스 로직1 실행");
  }
}
```

```java
@Slf4j
public class SubClassLogic2 extends AbstractTemplate {
  @Override
  protected void call() {
    log.info("비즈니스 로직2 실행");
  }
}
```

<br />

## 템플릿 메서드 패턴 - 익명클래스

템플릿 메서드를 위해 클래스를 계속 만들어야 한다는 단점이 있다. 이 때 익명 내부 클래스를 사용하면 이런 단점을 보완할 수 있다.

익명 내부 클래스를 사용하면 객체 인스턴스를 생성하면서 동시에 생성할 클래스를 상속 받은 자식 클래스를 정의할 수 있다.

```java
@Test
void templateMethodV2() {
  AbstractTemplate template1 = new AbstractTemplate() {
    @Override
    public void call() {
      log.info("익명클래스: 비즈니스 로직1 실행");
    }
  };
  template1.execute();

  AbstractTemplate template2 = new AbstractTemplate() {
    @Override
    public void call() {
      log.info("익명클래스: 비즈니스 로직2 실행");
    }
  };
  template2.execute();
}
```

자바는 익명 내부클래스의 이름을 임의로 `TemplateMethodTest$`, `TemplateMethodTest$2` 라고 만들어준다.

<br />

예시)

```java
@RestController
@RequiredArgsConstructor
public class OrderControllerV4 {
  private final OrderServiceV4 orderServiceV1;
  private final LogTrace trace;

  @GetMapping("/v4/request")
  public String request(String orderId) {

    AbstractTemplate<String> template = new AbstractTemplate<>(trace) {
      @Override
      protected String call() {
        orderServiceV1.orderItem(orderId);
        return "OK";
      }
    };
    return template.execute("OrderControllerV4.request()");
  }
}
```

```java
@Service
@RequiredArgsConstructor
public class OrderServiceV4 {
  private final OrderRepositoryV4 orderRepository;
  private final LogTrace trace;

  public void orderItem(String itemId) {
    AbstractTemplate<Void> template = new AbstractTemplate<>(trace) {
      @Override
      protected Void call() {
        orderRepository.save(itemId);
        return null;
      }
    };
    template.execute("OrderServiceV4.orderItem()");
  }
}
```

```java
@Slf4j
@Repository
@RequiredArgsConstructor
public class OrderRepositoryV4 {
  private final LogTrace trace;

  public void save(String itemId) {

    AbstractTemplate<Void> template = new AbstractTemplate<Void>(trace) {
      @Override
      protected Void call() {
        // 저장 로직
        if ("ex".equals(itemId)) {
          throw new IllegalStateException("예외 발생");
        }
        sleep(1000);
        return null;
      }
    };
    template.execute("OrderRepositoryV4.save()");
  }

  private void sleep(int millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
      log.error("", e);
    }
  }
}
```



`AbstractTemplate<Void>` : 제네릭에서 반환 타입이 필요할 때, 반환할 내용이 없으면 `Void` 타입을 사용하고 null 을 반환한다. 제네릭은 원시타입인 void, int 등을 사용할 수 없다.

<br />

## 좋은 설계란

- 변경이 일어날 때 번거롭지 않게 안정적으로 고칠 수 있는 소스
- **단일 책임의 원칙 (SRP) : 변경 지점을 하나로 모아 변경에 쉽게 대처할 수 있는 구조를 만드는 것이다.** 로그를 남기는 부분에 단일 책임 원칙을 잘 지켰다.

<br />

---

> ### GoF 의 디자인 패턴 - 에릭 감마 등 4인
>
> 에서 템플릿 메서드 패턴을 아래와 같이 정의
>
> - 템플릿 메서드 디자인 패턴의 목적 : 작업에서 알고리즘의 골격을 정의하고 일부 단계를 하위 클래스로 연기한다. 템플릿 메서드를 사용하면 하위 클래스가 알고리즘의 구조를 변경하지 않고도 알고리즘의 특정 단계를 재정의 할 수 있다.
>
> ```java
> AbstractTempalte
>   templateMethod()
>   primitive1()
>   primitive2()
> 
> SubClass1
>   primitive1()
>   primitive2()
> ```
>
> - 상속과 오버라이딩을 통한 다형성으로 문제를 해결하는 것이다.
> - 상속을 사용하므로 상속의 단점을 그대로 안고간다.
>   - 자식 클래스가 부모 클래스와 컴파일 시점에 강하게 결합한다. (의존 관계 문제)
>     - 자식 → 부모 (부모 클래스가 바뀌면 자식 클래스가 영향을 받는다.)
>   - 자식 클래스가 부모 클래스의 기능을 전혀 사용하지 않는데, 부모 클래스를 알아야 하므로 좋은 설계가 아니다.
>   - 별도 클래스나 익명 클래스를 만들어야하므로 복잡하다.
> - 템플릿 메서드 패턴과 비슷한 역할을 하면서 상속의 단점을 해결할 수 있는 디자인 패턴 → **전략 패턴(Strategy Pattern) :bulb:**
>   - **상속 보다는 합성(Composition) :bulb:**

<br />

---

# 2. 전략 패턴 (Strategy Pattern)

- 변하지 않는 부분을 Context, 변하는 부분을 Strategy 인터페이스에 만들고 이 인터페이스를 구현하여 문제를 해결한다.
- 상속이 아니라 위임(delegation) 으로 문제를 해결한다.
- Context 는 변하지 않는 템플릿 역할을 하고, Strategy 는 변하는 알고리즘 역할을 한다.

> GOF 디자인 패턴에서 정의한 전략패턴의 의도
>
> - 알고리즘 제품군을 정의하고 각각을 캡슐화 하여 상호 교환하게 만든다. 전략을 사용하면 알고리즘을 사용하는 클라이언트와 독립적으로 알고리즘을 변경할 수 있다.

![스크린샷 2021-11-29 오전 1.52.47](https://i.ibb.co/0jqNYhm/2021-11-29-1-52-47.pngg)



- `Context`는  변하지 않는 로직을 가지고 있는 템플릿 역할을 하는 코드다. 전략 패턴에서는 이를 컨텍스트(문맥)라 한다.
- `Strategy` 는 문맥 속에서 변경된 일부 전략이다.
- `Context` 는` Strategy` 의 인터페이스에만 의존한다. 덕분에 `Strategy` 의 구현체를 변경하거나 새로 만들어도 `Context` 에는 영향을 주지 않는다. (변경하지 않아도 된다.)
- **:bulb: 스프링에서 의존관계 주입에서 사용하는 방식이 바로 전략 패턴이다.**

![스크린샷 2021-11-29 오전 2.04.51](https://i.ibb.co/VCHPL1n/2021-11-29-2-04-51.png)

## 전략 패턴 -필드 주입

```java
/**
 * 필드에 전략을 보관하는 방식
 */
@Slf4j
public class ContextV1 {
  private Strategy strategy;

  public ContextV1(Strategy strategy) {
    this.strategy = strategy;
  }

  public void excute() {
    long startTime = System.currentTimeMillis();
    // 비즈니스 로직 실행
    strategy.call(); // 위임
    // 비즈니스 로직 종료
    long endTime = System.currentTimeMillis();
    long elapsedTime = endTime - startTime;
    log.info("elapsedTime = {}", elapsedTime);
  }
}
```

```java
public interface Strategy {
  void call();
}
```

```java
@Slf4j
public class StrategyLogic1 implements Strategy{
  @Override
  public void call() {
    log.info("[StrategyLogic1]: 비즈니스 로직1 실행");
  }
}
```

```java
public class ContextV1Test {
    /**
     * 전략 패턴 사용
     */
    @Test
    void strategyV1() {
        StrategyLogic1 strategyLogic1 = new StrategyLogic1();
        ContextV1 contextV1 = new ContextV1(strategyLogic1);
        contextV1.excute();

        StrategyLogic1 strategyLogic2 = new StrategyLogic1();
        ContextV1 contextV12 = new ContextV1(strategyLogic2);
        contextV12.excute();
    }
}

```

<br />

## 선 조립, 후 실행

`Context`, `Strategy` 를 한 번 조립하고 나면 이후로는 `Context` 를 실행하기만 하면 된다. 스프링으로 애플리케이션을 개발할 때 애플리케이션 로딩 시점에 의존관계 주입을 통해 필요한 의존관계를 모두 맺어두고 난 다음에 실제 요청을 처리하는 것과 같은원리이다.

전략 패턴의 단점은 `Context` 와 `Strategy` 를 조립한 이후에는 전략을 변경하기가 번거롭다는 점이다. `Context` 에 세터를 제공해서 `Strategy` 를 넘겨 받아서 변경하면 되지만, `Context` 를 사용할 때는 동시성 이슈 등 고려할 점이 많다. 따라서 전략을 실시간으로 변경하려면 `Context` 를 하나 더 생성하고 그곳에 다른 `Strategy` 를 주입하는 것이 더 나은 선택일 수 있다.

<br />

<br />

## 전략 패턴 - 파라미터 전달

Context 를 실행하는 시점에 파라미터로 전략을 전달한다.

```java
/**
 * 필드에 파라미터로 전달받는 방식
 */
@Slf4j
public class ContextV2 {

  public void excute(Strategy strategy) {
    long startTime = System.currentTimeMillis();
    // 비즈니스 로직 실행
    strategy.call(); // 위임
    // 비즈니스 로직 종료
    long endTime = System.currentTimeMillis();
    long elapsedTime = endTime - startTime;
    log.info("elapsedTime = {}", elapsedTime);
  }
}
```

```java
@Slf4j
public class ContextV2Test {

  /**
     * 전략 패턴 적용
     */
  @Test
  void strategyV1() {
    ContextV2 contextV2 = new ContextV2();
    contextV2.excute(new StrategyLogic1());
    contextV2.excute(new StrategyLogic2());
  }
}
```

클라이언트는 `Context` 를 실행하는 시점에 `Strategy` 를 전달할 수 있다. 필드 주입에 비해 전략을 더욱 유연하게 변경할 수 있다.

단점은 실행할 때마다 전략을 계속 지정해주어야 한다는 점이다.

<br />

## 템플릿

- 해결하고 싶은 문제는 변하는 부분(코드 조각)과 변하지 않는 부분(템플릿)을 분리하는 것이다.
- 위의 로그 추적기 예제에서는 애플리케이션 의존 관계를 설정하는 것처럼 선 조립, 후 실행이 아니다. 단순히 코드를 실행할 때 원하는 부분만 살짝 다른 코드를 넣어 실행하고 싶을 뿐이다. 따라서 파라미터 전달 방식의 전략 패턴이 조금 더 적합하다. 필드 주입은 전략 패턴의 '정석' 느낌.

<br />

---

# 3. 템플릿 콜백 패턴 (Callback Pattern)

다른 코드의 인수로 넘겨주는 실행 가능한 코드를 콜백(callback) 이라고 한다.

- call + back : 코드가 호출(call)되고, 코드를 넘겨준 곳의 뒤(back) 에서 실행된다는 뜻이다.
- 프로그래밍에서 콜백 또는 콜애프터 함수는 다른 코드의 인수로 넘겨주는 실행 가능한 코드를 말한다. 콜백을 넘겨받는 코드는 이 콜백을 필요에 따라 즉시 실행할 수도, 나중에 실행할 수도 있다.

## 자바 언어에서 콜백

- 실행가능한 코드를 인수로 넘기려면 객체가 필요하다. 자바8부터는 람다를 사용할 수 있다.
- 자바 8 이전에는 하나의 메소드를 가진 인터페이스를 구현하고, 주로 익명 내부 클래스를 사용했다. 최근에는 람다 사용

## 템플릿 콜백 패턴

- 스프링에서는 ContextV2 같은 방식의 전략 패턴을 템플릿 콜백 패턴이라고 한다. 전략 패턴에서 `Context` 가 템플릿 역할을 하고, `Strategy` 부분이 콜백으로 넘어온다.
- GOF 패턴은 아니고, 스프링 내부에서 자주 사용하는 패턴이므로 스프링에서만 이렇게 부른다. 전략패턴에서 템플릿과 콜백 부분이 강조된 패턴이다.
- 스프링에서는 `JdbcTemplate`, `RestTemplate`, `TransactionTemplate`, `RedisTemplate` 처럼 `XxxTemplate` 형식으로  다양한 템플릿 콜백 패턴이 사용된다.

<br />

# 한계

템플릿 메서드 패턴, 전략 패턴, 템플릿 콜백 패턴 모두 아무리 최적화를 해도 결국 로그 추적기를 적용하기 위해 원본 코드를 수정해야 한다는 단점이 있다.

이를 극복하기 위해 프록시 패턴을 알아보자.





