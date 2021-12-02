# Advanced 04 - Proxy Pattern, Decorator Pattern



# 주문 프로젝트

- v1 : 인터페이스와 구현 클래스 - 스프링 빈으로 수동 등록
- v2 : 인터페이스 없는 구체 클래스 - 스프링 빈으로 수동 등록
- v3 : 컴포넌트 스캔으로 스프링 빈 자동 등록



- 실무에서는 스프링 빈으로 등록할 클래스는 인터페이스가 있는 경우도 있고 없는 경우도 있다. 
- 스프링 빈을 수동으로 직접 등록할 때도 있고, `@ComponentScan` 으로 자동 등록할 때도 있다.



## V1

**컨트롤러 인터페이스**

```java
@RequestMapping
@ResponseBody
public interface OrderControllerV1 {

  @GetMapping("/v1/orders")
  String order(@RequestParam("itemId") String itemId);

  @GetMapping("/v1/no-log")
  String noLog();
}
```



- `@RequestMapping` : 스프링 MVC는 `@Controller` 또는 `@RequestMapping` 이 타입에 있어야 스프링 컨트롤러로 인식한다. 그리고 스프링 컨트롤러로 인식해야 HTTP URL 이 매핑되고 동작한다. 이 애노테이션은 인터페이스에 사용해도 된다.
  - `@Controller` 를 붙이면 `@Component ` 메타 어노테이션이 함께 붙고, 컴포넌트 스캔 대상이 될 때 빈으로 자동등록되므로 여기서는 사용하지 않는다. (수동 등록 하여 버전 별로 다른 예제를 보여주고자 함), RequestMapping 은 컴포넌트 스캔의 대상이 되지 않는다.
- `@ResponseBody` : HTTP 메시지 컨버터를 사용해서 응답한다. 이 애노테이션은 인터페이스에 사용해도 된다.
- `@RequestParam` : 인터페이스에서는 이를 명시해야 컴파일 시점에 itemId 변수를 알아볼 수 있다. 자바 버전별로 조금 다를 수 있다.



**애플리케이션**

```java
@Import(AppV1Config.class)
@SpringBootApplication(scanBasePackages = "co.wordbe.advanced.app.proxy")
public class AdvancedApplication {

  public static void main(String[] args) {
    SpringApplication.run(AdvancedApplication.class, args);
  }
}
```

- `@Import(AppV1Config.class)` : 클래스를 스프링 빈으로 등록한다. 일반적으로 `@Configuration` 같은 설정 파일을 등록할 때 사용하지만, 스프링 빈을 등록할 때도 사용할 수 있다.
- `@SpringBootApplication(scanBasePackages = "co.wordbe.advanced.app.proxy")` : `@ComponentScan` 의 기능과 같다. 컴포넌트 스캔을 시작할 위치를 지정한다. 해당 패키지의 하위 패키지를 컴포넌트 스캔한다. 이 값을 설정하지 않으면 AdvancedApplication 이 있는 패키지와 그 하위 패키지를 스캔한다.

<br />

## V2

- 인터페이스 만들지 않음
- Config 에서 빈으로 등록

## V3

- 인터페이스를 만들지 않음
- @Component, @Service, @Repository 어노테이션 추가



<br />

---

# 요구사항

- 원본 코드는 전혀 수정하지 않고, 로그 추적기를 적용한다.
- 특정 메서드는 로그를 출력하지 않는 기능
  - 보안상 일부는 로그를 출력하면 안된다.
- 다양한 케이스에 적용할 수 있어야 한다.
  - v1 - 인터페이스가 있는 구현 클래스에 적용
  - v2 - 인터페이스가 없는 구체 클래스에 적용
  - v3 - 컴포넌트 스캔 대상에 기능 적용

<br />

---

# 프록시, 프록시 패턴, 데코레이터 패턴

## 클라이언트와 서버

- 클라이언트 - 의뢰인
- 서버 - 서비스나 상품을 제공하는 사람이나 물건

- 클라이언트가 요청한 결과를 서버에 직접 요청하는 것이 아니라, **대리자(Proxy)**를 통해 대신 간접적으로 서버에 요청

### 프록시 장점

- 접근 제어, 캐싱

- 부가기능 추가

- 프록시 체인

- 대체 가능

  - 개게에서 ㅍ록시가 되려면, 클라이언트는 서버에게 요청을 한 것인지, 프록시에게 요청을 한 것인지 조차 몰라야 한다.

  - 서버와 프록시는 같은 인터페이스를 사용해야 한다. 클라이언트가 사용하는 서버 객체를 프록시 객체로 변경해도 클라이언트 코드를 변경하지 않고 동작할 수 있어야 한다.

    ![스크린샷 2021-12-01 오전 12.15.37](/Users/rdijin/Library/Application Support/typora-user-images/스크린샷 2021-12-01 오전 12.15.37.png)

클래스 의존관계를 보면 클라이언트는 서버 인터페이스에만 의존한다. 서버와 프록시가 같은 인터페이스를 사용한다. 따라서 DI를 사용해서 대체가 가능하다.

![스크린샷 2021-12-01 오전 12.17.31](/Users/rdijin/Library/Application Support/typora-user-images/스크린샷 2021-12-01 오전 12.17.31.png)

런타임 객체 의존 관계

- 런타임(애플리케이션 실행 시점)에 클라이언트 객체에 DI를 사용해서 Client → Server 에서 Client → Proxy 로 객체 의존관계를 변경해도 클라이언트 코드를 전혀 변경하지 않아도 된다. 클라이언트 입장에서는 변경 사실 조차 모른다.
- DI 를 사용하면 클라이언트 코드 변경 없이 유연하게 프록시를 주입할 수 있다.

<br />

### 프록시 주요 기능

- **접근 제어**
  - 권한에 따른 접근 차단
  - 캐싱
  - 지연 로딩
- **부가 기능 추가**
  - 원래 서버가 제공하는 기능에 더해서 부가 기능을 수행한다.
  - 예) 요청 값이나 응답 값을 중간에 변형한다.
  - 예) 실행시간을 측정해서 추가 로그를 남긴다.

> GOF 디자인 패턴
>
> 둘다 프록시를 사용하는 방법이지만 이 둘을 의도(intent) 에 따라 프록시 패턴과 데코레이터 패턴으로 구분한다.
>
> - **프록시 패턴 : 접근제어가 목적**
> - **데코레이터 패턴 : 새로운 기능 추가가 목적**

프록시라는 개념은 클라이언트 서버라는 큰 개념안에서 자연스럽게 발생할 수 있다. 프록시는 객체안에서의 개념도 있고, 웹 서버에서의 프록시도 있다. 객체 안에서 객체로 구현되어있는가, 웹 서버로 구현되어 있는가 처럼 규모의 차이가 있을 뿐 근본적 역할은 같다.

<br />

---

# 프록시 패턴 (접근 제어가 목적)



### **프록시가 없을 때**

```java
public class ProxyPatternTest {

  @Test
  void noProxyTest() {
    RealSubject realSubject = new RealSubject();
    ProxyPatternClient client = new ProxyPatternClient(realSubject);
    client.execute();
    client.execute();
    client.execute();
  }
}
```

3초 소요

<br />

### **프록시 접근 제어 (캐시) 적용**

```java
@Slf4j
public class CacheProxy implements Subject {
  private Subject target;
  private String cacheValue;

  public CacheProxy(Subject target) {
    this.target = target;
  }

  @Override
  public String operation() {
    log.info("프록시 호출");
    if (cacheValue == null) {
      cacheValue = target.operation();
    }
    return cacheValue;
  }
}
```

- `private Subject target` :  클라이언트가 프록시를 호출하면 프록시가 최종적으로 실제 객체를 호출해야 한다. 따라서 내부에 실제 객체의 참졸르 가지고 있어야 한다. 이렇게 프록시가 호출하는 대상을 target 이라고 한다.
- `operation()` : 구현한 코드를 보면 `cacheValue` 에 값이 없으면 실제 객체(target) 를 호출해서 값을 구한다. 만약 cacheValue 에 값이 있으면 실제 객체를 전혀 호출하지않고, 캐시 값을 그대로 반환한다. 따라서 처음 조회 이후에는 데이터를 빠르게 조회할 수 있다.

```java
public class ProxyPatternTest {

    @Test
    void noProxyTest() {
        RealSubject realSubject = new RealSubject();
        ProxyPatternClient client = new ProxyPatternClient(realSubject);
        client.execute();
        client.execute();
        client.execute();
    }

    @Test
    void cacheProxyTest() {
        RealSubject realSubject = new RealSubject();
        CacheProxy cacheProxy = new CacheProxy(realSubject);
        ProxyPatternClient client = new ProxyPatternClient(cacheProxy);
        client.execute();
        client.execute();
        client.execute();
    }
}
```



- realSubject와 cacheProxy 를 생성하고 둘을 연결한다. cacheProxy 가 realSubject 를 참조하는 런타임 객체 의존관계가 완성된다. 마지막으로 client 에 realSubject 가 아닌 cacheProxy 를 주입한다. 이 과정을 통해 `client -> cacheProxy -> realSubject` 런타임 객체 의존 관계가 완성된다.

```shell
01:35:30.370 [Test worker] INFO co.wordbe.advanced.proxy.pureproxy.proxy.code.CacheProxy - 프록시 호출
01:35:30.372 [Test worker] INFO co.wordbe.advanced.proxy.pureproxy.proxy.code.RealSubject - 실제 객체 호출
01:35:31.376 [Test worker] INFO co.wordbe.advanced.proxy.pureproxy.proxy.code.CacheProxy - 프록시 호출
01:35:31.376 [Test worker] INFO co.wordbe.advanced.proxy.pureproxy.proxy.code.CacheProxy - 프록시 호출
```

<br />

<br />

<br />

---

# 데코레이터 패턴 (부가 기능이 목적)



### 데코레이터 없을 때

```java
@Slf4j
public class DecoratorPatternTest {

  @Test
  void noDecorator() {
    RealComponent realComponent = new RealComponent();
    DecoratorPatternClient client = new DecoratorPatternClient(realComponent);
    client.execute();
  }
}
```



### **중간에 꾸미기 코드(Decorator) 추가**

```java
@Slf4j
public class MessageDecorator implements Component{
  private Component component;

  public MessageDecorator(Component component) {
    this.component = component;
  }

  @Override
  public String operation() {
    log.info("MessageDecorator 실행");
    String result = component.operation();
    String decoResult = "*****" + result + "*****";
    log.info("MessageDecorator 꾸미기 적용 전={}, 적용 후={}", result,decoResult);
    return decoResult;
  }
}
```



```java
@Test
void decorator1() {
  Component realComponent = new RealComponent();
  Component messageDecorator = new MessageDecorator(realComponent);
  DecoratorPatternClient client = new DecoratorPatternClient(messageDecorator);
  client.execute();
}
```

<br />

### 데코레이터 체인 (여러개)

![스크린샷 2021-12-01 오전 2.05.55](/Users/rdijin/Library/Application Support/typora-user-images/스크린샷 2021-12-01 오전 2.05.55.png)



```java
@Slf4j
public class TimeDecorator implements Component {
  private Component component;

  public TimeDecorator(Component component) {
    this.component = component;
  }

  @Override
  public String operation() {
    log.info("TimeDecorator 실행");

    long start = System.currentTimeMillis();
    String result = component.operation();
    long end = System.currentTimeMillis();
    log.info("Time taken: {}", end - start);
    return result;
  }
}
```

```java
@Test
void decorator_chain() {
  Component realComponent = new RealComponent();
  Component messageDecorator = new MessageDecorator(realComponent);
  Component timeDecorator = new TimeDecorator(messageDecorator);
  DecoratorPatternClient client = new DecoratorPatternClient(timeDecorator);
  client.execute();
}
```

<br />

<br />

---

![스크린샷 2021-12-01 오전 2.07.17](/Users/rdijin/Library/Application Support/typora-user-images/스크린샷 2021-12-01 오전 2.07.17.png)

- 꾸며주는 역할을 하는 Decorator 들은 스스로 존재할 수 없다. 항상 꾸며줄 대상이 있어야 한다.
- 따라서 내부 호출 대상인 component 를 가지고 있어야 한다. 그리고 component 를 항상 호출해야 한다. 이 부분이 중복이다.
- 중복 제거를 위해 component 를 속성으로 갖는 Decorator 라는 추상클래스를 만드는 방법도 고민할 수 있다. 이렇게 하면 추가로 클래스 다이어그램에서 어떤 것이 실제 컴포넌트인지, 데코레이터인지 명확하게 구분할 수 있다. 여기까지 고민한 것이 GOF에서 설명하는 데코레이터 패턴의 기본 예제이다.



디자인 패턴은 비슷한 구조를 가진 패턴이 많다.

이를 구분하는 것은 패턴을 만드는 의도(intent) 이다.

- 프록시 패턴 의도 : 다른 객체에 대한 접근을 제어하기 위한 대리자 제공
- 데코레이터 패턴의 의도 : 객체에 추가 책임(기능)을 동적으로 추가하고, 기능 확장을 위한 유연한 대안 제공

<br />

<br />

---

# 인터페이스 기반 프록시 - 적용

애플리케이션 실행 시점에 프록시를 사용하도록 의존 관계를 설정해주어야 한다. 이 부분은 빈을 등록하는 설정 파일을 활용하면 된다.

![스크린샷 2021-12-01 오후 11.22.29](/Users/rdijin/Library/Application Support/typora-user-images/스크린샷 2021-12-01 오후 11.22.29.png)

```java
@Configuration
public class InterfaceProxyConfig {
  @Bean
  public OrderControllerV1 orderController(LogTrace logTrace) {
    OrderControllerV1Impl controllerImpl = new OrderControllerV1Impl(orderService(logTrace));
    return new OrderControllerInterfaceProxy(controllerImpl, logTrace);
  }

  @Bean
  public OrderServiceV1 orderService(LogTrace logTrace) {
    OrderServiceV1Impl serviceImpl = new OrderServiceV1Impl(orderRepository(logTrace));
    return new OrderServiceInterfaceProxy(serviceImpl, logTrace);
  }

  @Bean
  public OrderRepositoryV1 orderRepository(LogTrace logTrace) {
    OrderRepositoryV1Impl repositoryImpl = new OrderRepositoryV1Impl();
    return new OrderRepositoryInterfaceProxy(repositoryImpl, logTrace);
  }
}
```

<br />

<br />

![](https://i.ibb.co/CnyWN8h/image.png)

![](https://i.ibb.co/4NHyGDn/image.png)



- 프록시 객체를 생성하고, 프록시를 실제 스프링 빈(`OrderControllerV1Impl`, `OrderServiceV1Impl`) 대신 등록한다. 실제 객체는 스프링 빈으로 등록하지 않는다.
- 프록시는 내부에 실제 객체를 참조하고 있다. `OrderServiceInterfaceProxy` 는 내부에서 실제 대상 객체인 `OrderSerivceV1Impl` 을 가지고 있다.
- 의존 관계는 다음과 같다.
  - `proxy -> target`
  - `orderServiceInterfaceProxy -> orderServiceImpl`
- 스프링 빈으로 프록시를 등록했기 때문에, 스프링 빈을 주입 받으면 실제 객체 대신 프록시 객체가 주입된다.
- 실제 객체가 스프링 빈으로 등록되지 않는다고 해서 사라지는 것이 아니다. 프록시 객체가 실제 객체를 참조하므로 프록시를 통해서 실제 객체를 호출할 수 있다.





- 프록시와 DI 덕분에 원본 코드를 전혀 수정하지 않고, 로그 추적기를 도입할 수 있었다. 
- 너무 많은 프록시 클래스를 만들어야 하는 단점이 있다. 이 부분은 나중에 해결해보자.

<br />

---

# 구체 클래스 기반 프록시

## 클래스 기반 프록시 도입

인터페이스 기반으로 프록시를 도입했다. 하지만 자바의 다형성은 인터페이스를 구현하든, 클래스를 상속하든 상위 타입만 맞으면 다형성이 적용된다. 인터페이스가 없어도 프록시를 만들 수 있다.

![](https://i.ibb.co/3dtxbdm/image.png) 

```java
public class ConcreteClient {
  private ConcreteLogic concreteLogic;

  public ConcreteClient(ConcreteLogic concreteLogic) {
    this.concreteLogic = concreteLogic;
  }

  public void execute() {
    concreteLogic.operation();
  }
}
```

```java
@Slf4j
public class TimeProxy extends ConcreteLogic {
  private ConcreteLogic concreteLogic;

  public TimeProxy(ConcreteLogic concreteLogic) {
    this.concreteLogic = concreteLogic;
  }

  @Override
  public String operation() {
    log.info("TimeDecorator 실행");

    long start = System.currentTimeMillis();
    String result = concreteLogic.operation();
    long end = System.currentTimeMillis();
    log.info("Time taken: {}", end - start);
    return result;
  }
}
```

```java
@Slf4j
public class ConcreteLogic {

  public String operation() {
    log.info("Concrete 로직 실행");
    return "data";
  }
}
```



```java
@Test
void addProxy() {
  ConcreteLogic concreteLogic = new ConcreteLogic();
  TimeProxy timeProxy = new TimeProxy(concreteLogic);
  ConcreteClient client = new ConcreteClient(timeProxy);
  client.execute();
}
```

- 핵심은 `ConcreteClient` 생성자에 `concreteLogic` 이 아니라 `timeProxy` 를 주입하는 부분이다.
- `ConcreteClient` 는 `ConcreteLogic` 에 의존하는데, 다형성에 의해 `ConcreteLogic` 에 `ConcreteLogic` (본인과 같은 타입) 도 들어갈 수 있고, `timeProxy` (자식 타입) 도 들어갈 수 있다

> 자바의 다형성
>
> - 인터페이스나 클래스 모두 적용된다.
> - 하위 타입은 모두 다형성이 적용된다. 

<br />

<br />

## 구체클래스 기반 프록시 - 적용



```java
public class OrderControllerConcreteProxy extends OrderControllerV2 {
  private final OrderControllerV2 target;
  private final LogTrace logTrace;

  public OrderControllerConcreteProxy(OrderControllerV2 target, LogTrace logTrace) {
    super(null);
    this.target = target;
    this.logTrace = logTrace;
  }

  @Override
  public String order(String itemId) {
    TraceStatus status = null;
    try {
      status = logTrace.begin("OrderController.order()");
      // target 호출
      String result = target.order(itemId);
      logTrace.end(status);
      return result;
    } catch (Exception e) {
      logTrace.exception(status, e);
      throw e;
    }
  }

  @Override
  public String noLog() {
    return target.noLog();
  }
}
```

```java
public class OrderServiceConcreteProxy extends OrderServiceV2 {
  private final OrderServiceV2 target;
  private final LogTrace logTrace;

  public OrderServiceConcreteProxy(OrderServiceV2 target, LogTrace logTrace) {
    super(null);
    this.target = target;
    this.logTrace = logTrace;
  }

  @Override
  public void orderItem(String itemId) {
    TraceStatus status = null;
    try {
      status = logTrace.begin("OrderServiceConcreteProxy.orderItem()");
      // target 호출
      target.orderItem(itemId);
      logTrace.end(status);
    } catch (Exception e) {
      logTrace.exception(status, e);
      throw e;
    }
  }
}
```

```java
public class OrderRepositoryConcreteProxy extends OrderRepositoryV2 {
  private final OrderRepositoryV2 target;
  private final LogTrace logTrace;

  public OrderRepositoryConcreteProxy(OrderRepositoryV2 target, LogTrace logTrace) {
    this.target = target;
    this.logTrace = logTrace;
  }

  @Override
  public void save(String itemId) {
    TraceStatus status = null;
    try {
      status = logTrace.begin("OrderRepositoryConcreteProxy.save()");
      // target 호출
      target.save(itemId);
      logTrace.end(status);
    } catch (Exception e) {
      logTrace.exception(status, e);
      throw e;
    }
  }
}
```



### 클래스 기반 프록시 단점

- `super(null)` : 자바 기본 문법에 의해 자식 클래스를 생성할 때 `super()` 로 부모클래스의 생성자를 호출해야 한다. `super() ` 를 생략하면 부모 클래스의 기본생성자가 호출된다. 그런데 부모 클래스가 기본 생성자가 없고, 다른 생성자가 있을 때는 생성자 파라미터를 넣어주어야 하는데 여기서 부모 클래스의 메서드는 사용하지 않으므로 `null` 을 넣어준다.

```java
@Configuration
public class ConcreteProxyConfig {

  @Bean
  public OrderControllerV2 orderControllerV2(LogTrace logTrace) {
    OrderControllerV2 controllerImpl = new OrderControllerV2(orderServiceV2(logTrace));
    return new OrderControllerConcreteProxy(controllerImpl, logTrace);
  }

  @Bean
  public OrderServiceV2 orderServiceV2(LogTrace logTrace) {
    OrderServiceV2 serviceImpl = new OrderServiceV2(orderRepositoryV2(logTrace));
    return new OrderServiceConcreteProxy(serviceImpl, logTrace);
  }

  @Bean
  public OrderRepositoryV2 orderRepositoryV2(LogTrace logTrace) {
    OrderRepositoryV2 repositoryImpl = new OrderRepositoryV2();
    return new OrderRepositoryConcreteProxy(repositoryImpl, logTrace);
  }
}
```



<br />

<br />

---

## 인터페이스 기반 프록시 vs 클래스 기반 프록시

- 클래스 기반 프록시는 해당 클래스에만 적용할 수 있다. 인터페이스 기반 프록시는 인터페이스만 같으면 모든 곳에 적용할 수 있다.
- 클래스 기반 프록시는 상속을 사용하기 때문에 몇가지 제약이 있다.
  1. 부모 클래스의 생성자를 호출해야 한다.
  2. 클래스에 final 키워드가 붙으면 상속이 불가능하다.
  3. 메서드에 final 키워드가 붙으면 해당 메서드를 오버라이딩 할 수 없다.
- 인터페이스를 사용하면 프로그래밍 관점에서도 역할과 구현을 명확하게 나누기 좋다.
  - 하지만 실제로는 구현을 거의 변경할 일이 없는 클래스도 많다. 이럴 경우 무작정 인터페이스를 도입하는 것은 번거롭고, 그렇게 실용적이지 않다.
  - 실용적 관점에서는 구체 클래스를 바로 사용하는 것이 좋을 수도 있다.
- 인터페이스 기반 프록시는 '인터페이스'를 만들어야 한다는 단점이 있다.
- 인터페이스 기반 프록시는 캐스팅 관련 단점이 있다.



### 프록시 클래스가 너무 많은 것 아닌가?

- 로직이 모두 똑같은데 프록시 클래스를 여러개 만들어야 한다.
- 이를 보완하기 위해 **프록시 클래스를 하나만 만들고 모든 곳에 적용하는 동적 프록시를 사용한다.**