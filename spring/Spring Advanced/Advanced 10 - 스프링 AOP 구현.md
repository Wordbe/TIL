# Advanced 10 - 스프링 AOP 구현

# 1 스프링 AOP 구현



> 참고
>
> 스프링 AOP는 AspectJ의 문법을 차용하고, 프록시 방식의 AOP를 제공한다. 
>
> `@Aspect` 를 포함한 `org.aspectj` 패키지 관련 기능은 `aspectjweaver.jar` 라이브러리가 제공하는 기능이다. 앞서 `build.gradle` 에 `spring-boot-starter-aop` 를 포함했는데, 이러헤 하면 스프링 AOP 관련 기능과 함께 `aspectjweaver.jar` 도 함께 사용할 수 있게 의존관계에 포함된다.
>
> 그런데 스프링에서는 AspectJ 가 제공하는 어노테이션이나 관련 인터페이스만 사용하는 것이고, 실제 AspectJ 가 제공하는 컴파일, 로드타임 위버 등을 사용하는 것은 아니다. 스프링은 우리가 학습한 것처럼 프록시 방식의 AOP를 사용한다.



```java
@Slf4j
@Aspect
public class AspectV1 {

  @Around("execution(* co.wordbe.springaop.order..*(..))")
  public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
    log.info("[doLog] {}", joinPoint.getSignature()); // join point 시그니처
    return joinPoint.proceed();
  }
}
```

- `@Aspect` 는 애스펙트 표식이지 컴포넌트 스캔 대상이 되는 것은 아니다. 따라서 AOP로 사용하려면 스프링 빈으로 등록해주어야 한다.

스프링 빈으로 등록하려면

- `@Bean` 으로 직접 등록
- `@Component` 컴포넌트 스캔을 사용해서 자동 등록
- `@Import` 주로 설정 파일을 추가할 때 사용 `@Configuration`

```java
@Slf4j
@SpringBootTest
@Import(AspectV1.class)
public class AopTest {
  @Autowired
  OrderService orderService;

  @Autowired
  OrderRepository orderRepository;

  @Test
  void aopInfo() {
    log.info("isAopProxy, orderService: {}", AopUtils.isAopProxy(orderService));
    log.info("isAopProxy, orderRepository: {}", AopUtils.isAopProxy(orderRepository));
  }

  @Test
  void success() {
    orderService.orderItem("itemA");
  }

  @Test
  void exception() {
    Assertions.assertThatThrownBy(() -> orderService.orderItem("ex"))
      .isInstanceOf(IllegalStateException.class);
  }
}
```

<br />

---

# 2 포인트컷 분리

`@Around` 에 포인트컷 표현식을 직접 넣을 수 있지만, `@Pointcut` 어노테이션을 사용해서 별도로 분리할 수도 있다.

```java
@Slf4j
@Aspect
public class AspectV2 {

  // co.wordbe.springaop.order 패키지와 하위 패키지
  @Pointcut("execution(* co.wordbe.springaop.order..*(..))")
  public void allOrder() {} // pointcut signature 이라고 한다.

  @Around("allOrder()")
  public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
    log.info("[doLog] {}", joinPoint.getSignature()); // join point 시그니처
    return joinPoint.proceed();
  }
}
```

<br />

`@Pointcut`

- `@Pointcut` 에 포인트컷 표현식을 사용한다.
- 메서드 이름과 파라미터를 합쳐서 포인트컷 시그니처라 한다.
- 메서드의 반환 타입은 `void` 여야 한다.
- 코드 내용은 비워둔다.
- 포인트컷 시그니처는 `allOrder()` 이다. 이름 그대로 주문과 관련된 모든 기능을 대상으로 하는 포인트컷이다.
- `@Around` 어드바이스에서는 포인트컷을 직접 지정해도 되지만, 포인트컷 시그니처를 사용해도 된다.
- private, public 같은 접근 제어자는 내부에서만 사용하면 private 을 사용해도 되지만, 다른 애스펙트에서 참고하려면 public을 사용해야 한다.

포인트컷을 분리함으로써 하나의 포인트컷 표현식을 여러 어드바이스에서 함께 사용할 수 있게 되었다.

<br />

---

# 3 어드바이스 추가

트랜잭션을 적용하는 코드를 추가해보자. 진짜 트랜잭션을 실행하는 것은 아니고, 기능이 동작한 것처럼 로그만 남긴다.

## 트랜잭션 동작 로직

1. 핵심로직 실행 직전에 트랜잭션 시작
2. 핵심로직 실행
3. 핵심로직 실행에 문제가 없으면 커밋
4. 핵심로직 실행에 예외가 발생하면 롤백

<br />

```java
@Slf4j
@Aspect
public class AspectV3 {
  // co.wordbe.springaop.order 패키지와 하위 패키지
  @Pointcut("execution(* co.wordbe.springaop.order..*(..))")
  public void allOrder() {} // pointcut signature 이라고 한다.

  // 클래스 이름 패턴이 *Service
  @Pointcut("execution(* *..*Service.*(..))")
  public void allService() {}

  @Around("allOrder()")
  public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
    log.info("[doLog] {}", joinPoint.getSignature()); // join point 시그니처
    return joinPoint.proceed();
  }

  // co.wordbe.springaop.order 패키지와 하위 패키지 이면서 클래스 이름 패턴이 *Service
  @Around("allOrder() && allService()")
  public Object doTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
    try {
      log.info("[트랜잭션 시작] {}", joinPoint.getSignature());
      Object result = joinPoint.proceed();
      log.info("[트랜잭션 커밋] {}", joinPoint.getSignature());
      return result;
    } catch (Exception e) {
      log.info("[트랜잭션 롤백] {}", joinPoint.getSignature());
      throw e;
    } finally {
      log.info("[리소스 릴리즈] {}", joinPoint.getSignature());
    }
  }
}
```

- 포인트컷은 3가지 조합이 가능하다. `&&` (AND), `||` (OR), `!` (NOT)
- 트랜잭션 후 로그를 찍는 등 어드바이스가 적용되는 순서를 변경하는 것은 아래에서 해본다.

**success 테스트**

```shell
[doLog] void co.wordbe.springaop.order.OrderService.orderItem(String)
[트랜잭션 시작] void co.wordbe.springaop.order.OrderService.orderItem(String)
[orderService] 실행
[doLog] void co.wordbe.springaop.order.OrderRepository.save(String)
[orderRepository] 실행
[트랜잭션 커밋] void co.wordbe.springaop.order.OrderService.orderItem(String)
[리소스 릴리즈] void co.wordbe.springaop.order.OrderService.orderItem(String)
```

**exception 테스트**

```shell
[doLog] void co.wordbe.springaop.order.OrderService.orderItem(String)
[트랜잭션 시작] void co.wordbe.springaop.order.OrderService.orderItem(String)
[orderService] 실행
[doLog] void co.wordbe.springaop.order.OrderRepository.save(String)
[orderRepository] 실행
[트랜잭션 롤백] void co.wordbe.springaop.order.OrderService.orderItem(String)
[리소스 릴리즈] void co.wordbe.springaop.order.OrderService.orderItem(String)
```

<br />

<br />

---

# 4 외부 포인트컷 참조

포인트컷을 공용으로 사용하기 위해 별도 외부 클래스에 모아두어도 된다. 이 때 접근제어자를 public 으로한다.

```java
package co.wordbe.springaop.order.aop;

import org.aspectj.lang.annotation.Pointcut;

public class Pointcuts {

  // co.wordbe.springaop.order 패키지와 하위 패키지
  @Pointcut("execution(* co.wordbe.springaop.order..*(..))")
  public void allOrder() {} // pointcut signature 이라고 한다.

  // 클래스 이름 패턴이 *Service
  @Pointcut("execution(* *..*Service.*(..))")
  public void allService() {}

  // allOrder() 와 allService()
  @Pointcut("allOrder() && allService()")
  public void allOrderService() {}
}
```

```java
@Slf4j
@Aspect
public class AspectV4Pointcut {

  @Around("co.wordbe.springaop.order.aop.Pointcuts.allOrder()")
  public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
    log.info("[doLog] {}", joinPoint.getSignature()); // join point 시그니처
    return joinPoint.proceed();
  }

  // co.wordbe.springaop.order 패키지와 하위 패키지 이면서 클래스 이름 패턴이 *Service
  @Around("co.wordbe.springaop.order.aop.Pointcuts.allOrderService()")
  public Object doTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
    try {
      log.info("[트랜잭션 시작] {}", joinPoint.getSignature());
      Object result = joinPoint.proceed();
      log.info("[트랜잭션 커밋] {}", joinPoint.getSignature());
      return result;
    } catch (Exception e) {
      log.info("[트랜잭션 롤백] {}", joinPoint.getSignature());
      throw e;
    } finally {
      log.info("[리소스 릴리즈] {}", joinPoint.getSignature());
    }
  }
}
```

- 외부 포인트컷을 사용할 때는 포인트컷이 위치한 패키지이름을 명시해주고, 포인트컷 시그니처를 그대로 적어주면 된다.

<br />

---

# 5 어드바이스 순서

어드바이스는 기본적으로 순서를 보장하지 않는다. 순서를 지정하려면 `@Aspect` 적용 단위로 `org.springframework.core.annotation.@Order` 어노테이션을 적용해야 한다.

문제는 이것을 어드바이스단위가 아니라 클래스 단위로 적용할 수 있다는 점이다. 그래서 지금처럼 하나의 애스펙트에여러 어드바이스가 있으면 순서를 보장 받을 수 없다. **따라서 애스팩트를 별도의 클래스로 분리해야 한다.**

```java
@Slf4j
public class AspectV5Order {

  @Aspect
  @Order(2)
  public static class LogAspect {
    @Around("co.wordbe.springaop.order.aop.Pointcuts.allOrder()")
    public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[doLog] {}", joinPoint.getSignature()); // join point 시그니처
      return joinPoint.proceed();
    }
  }

  @Aspect
  @Order(1)
  public static class TxAspect {
    // co.wordbe.springaop.order 패키지와 하위 패키지 이면서 클래스 이름 패턴이 *Service
    @Around("co.wordbe.springaop.order.aop.Pointcuts.allOrderService()")
    public Object doTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
      try {
        log.info("[트랜잭션 시작] {}", joinPoint.getSignature());
        Object result = joinPoint.proceed();
        log.info("[트랜잭션 커밋] {}", joinPoint.getSignature());
        return result;
      } catch (Exception e) {
        log.info("[트랜잭션 롤백] {}", joinPoint.getSignature());
        throw e;
      } finally {
        log.info("[리소스 릴리즈] {}", joinPoint.getSignature());
      }
    }
  }
}
```

- 클래스를 별도 파일에 나누어도 된다.

```java
@SpringBootTest
@Import({AspectV5Order.LogAspect.class, AspectV5Order.TxAspect.class})
public class AopTest {
  ...
}
```

```shell
[트랜잭션 시작] void co.wordbe.springaop.order.OrderService.orderItem(String)
[doLog] void co.wordbe.springaop.order.OrderService.orderItem(String)
[orderService] 실행
[doLog] void co.wordbe.springaop.order.OrderRepository.save(String)
[orderRepository] 실행
[트랜잭션 커밋] void co.wordbe.springaop.order.OrderService.orderItem(String)
[리소스 릴리즈] void co.wordbe.springaop.order.OrderService.orderItem(String)
```

<br />

---

# 6 어드바이스 종류

어드바이스는 여러 종류가 있다.

- `@Around` : 메서드 호출 전 후에 수행, 가장 강력한 어드바이스. 조인포인트 실행여부 선택, 반환 값 변환, 예외 변환 등 가능
- `@Before` : 조인포인트 실행 이전에 실행
- `@AfterReturning` : 조인포인트가 정상 완료후 실행
- `@AfterThrowing` : 메서드가 예외를 던지는 경우 실행
- `@After` : 조인포인트가 정상 또는 예외에 관계없이 실행(finally)

```java
@Slf4j
@Aspect
public class AspectV6Advice {

  @Around("co.wordbe.springaop.order.aop.Pointcuts.allOrderService()")
  public Object doTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
    try {
      // @Before
      log.info("[트랜잭션 시작] {}", joinPoint.getSignature());
      Object result = joinPoint.proceed();
      // @AfterReturning
      log.info("[트랜잭션 커밋] {}", joinPoint.getSignature());
      return result;
    } catch (Exception e) {
      // @AfterThrowing
      log.info("[트랜잭션 롤백] {}", joinPoint.getSignature());
      throw e;
    } finally {
      // @After
      log.info("[리소스 릴리즈] {}", joinPoint.getSignature());
    }
  }

  @Before("co.wordbe.springaop.order.aop.Pointcuts.allOrderService()")
  public void doBefore(JoinPoint joinPoint) {
    log.info("[Before] {}", joinPoint.getSignature());
  }

  @AfterReturning(value = "co.wordbe.springaop.order.aop.Pointcuts.allOrderService()", returning = "result")
  public void doAfterReturning(JoinPoint joinPoint, Object result) {
    log.info("[AfterReturning] {} result={}", joinPoint.getSignature(), result);
  }

  @AfterThrowing(value = "co.wordbe.springaop.order.aop.Pointcuts.allOrderService()", throwing = "e")
  public void doAfterThrowing(JoinPoint joinPoint, Throwable e) {
    log.info("[AfterThrowing] {} e={}", joinPoint.getSignature(), e);
  }

  @After("co.wordbe.springaop.order.aop.Pointcuts.allOrderService()")
  public void doAfter(JoinPoint joinPoint) {
    log.info("[After] {}", joinPoint.getSignature());
  }
}
```

- `@Around` 를 제외한 나머지 어드바이스들은 `@Around` 가 할 수 있는 일의 일부만 제공한다. 따라서 `@Around`어드바이스만 사용해도 필요한 기능을 모두 수행할 수 있다.

> 참고
>
> 모든 어드바이스는 `org.aspectJ.lang.JoinPoint` 를 첫번째 파라미터로 사용할 수 있다. (생략해도 된다.) 단, `@Around` 는 `ProceedingJoinPoint` 를 사용해야 한다.
>
> `ProceedingJoinPoint` 는 `org.aspectJ.lang.JoinPoint` 의 하위 타입이다.

### JoinPoint 인터페이스 주요 메소드

- `getArgs()` : 메서드 인수를 반환
- `getThis()` : 프록시 객체를 반환
- `getTarget()` : 대상 객체를 반환
- `getSignature()` : 조언되는 메서드에 대한 설명 반환
- `toString()` : 조언되는 방법에 대한 유용한 설명 반환

### ProceedingJoinPoint 인터페이스 주요 메소드

- `proceed()` : 다음 어드바이스나 타겟 호출

추가로 호출시 전달한 매개변수를 파라미터를 통해 전달 받을 수 있다.

- `@Before` : `@Around` 와 다르게 작업 흐름을 변경할 수는 없다. 메서드 종료시 자동으로 다음 타겟이 호출된다. 물론 예외가 발생하면 다음 코드는 호출되지 않는다.
- `@AfterReturning` : `returning` 속성에 사용된 이름은 파라미터 이름과 일치해야 한다. 타입은 Object 로 하면 모든 타입을 받아올 수 있다. (부모 타입을 지정하면 모든 자식 타입은 인정된다.)
- `@AfterThrowing` : `throwing` 속성에 사용된 이름은 파라미터 이름과 일치해야 한다. 타입은 Throwable 로 하면 모든 예외 타입을 받아올 수 있다. (부모 타입을 지정하면 모든 자식 타입은 인정된다.)
- `@After` : 메서드 실행이 종료되면 실행된다. (finally 와 같다.) 정상 및 예외 반환 조건 모두 처리한다. 보통 리소스를 해제하는데 사용한다.
- `@Around`
  - 메서드 실행 주변에서 실행된다. 메서드 실행 전후의 작업을 수행한다.
  - 가장 강력한 어드바이스
    - 조인 포인트 실행 여부 선택 : `joinpoint.proceed()` 호출 여부 선택
    - 전달 값 변환 : `joinpoint.proceed(args[])`
    - 반환 값 변환
    - 예외 변환
    - 트랜잭션처럼 `try ~ catch ~ finally` 모두 들어가는 구문 처리 가능
  - 어드바이스의 첫번째 파라미터는 `ProceedingJoinpoint` 를 사용해야 한다.
  - `proceed()` 를 통해 대상을 실행한ㄷ. 여러번 실행 할 수도 있다. (재시도)

### 순서

- 스프링은 5.2.7 버전부터 동일한 `@Aspect` 안에서 동일한 조인포인트 우선순위를 정했다.
- 실행 순서 : `@Around`, `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`
- 호출 순서와 리턴 순서는 반대라는 점을 기억하자.
- `@Aspect` 안에 동일한 종류의 어드바이스가 2개 이상 있으면 순서가 보장되지 않는다. 이 경우는 `@Aspect` 를 분리하고 `@Order`를 적용해준다.

### `@Around` 외에 다른 어드바이스가 존재하는 이유

`@Around` 는 항상 `joinPoint.proceed()` 를 호출해야한다. 그렇지 않으면 타겟 메소드가 실행되지 않는다.

- 가장 넓은 기능을 제공하는 것은 맞지만, 실수할 가능성이 있다.

`@Before` 는 알아서 실행해주므로 고민하지 않아도 된다.

- 기능은 적지만 실수할 가능성이 낮고, 코드도 단순하다. **이 코드를 작성한 의도가 명확하게 드러난다.**

> ### **좋은 설계는 제약이 있는 것이다.**
>
> 만약 `@Around` 를 사용했는데, 중간에 다른 개발자가 해당 코드를 수정해서 호출하지 않았다면 큰 장애가 발생했을 것이다. `@Before` 는 이런문제 자체가 발생하지 않는다.
>
> 제약 덕분에 역할이 명확해진다. 다른 개발자도 이 코드를 보고 고민해야 하는 범위가 줄어들고 코드의 의도도 파악하기 쉽다.



