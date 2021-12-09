# Advanced 13 - 스프링 AOP 실무 주의사항



# 프록시와 내부 호출

# 문제 - 내부호출(Self-Invocation)

스프링은 프록시 방식의 AOP 를 사용한다.

따라서 AOP를 적용하려면 항상 프록시를 통해서 대상 객체(Target)를 호출해야 한다.

이렇게 하면 프록시에서 먼저 어드바이스를 호출하고, 이후 대상 객체를 호출한다.

만약 프록시를 거치지 않고 대상 객체를 직접 호출하게 되면 AOP는 적용되지 않고, 어드바이스도 호출되지 않는다.

<br />

AOP를 적용하면 스프링은 대상 객체 대신 프록시를 스프링 빈으로 등록한다. 따라서 스프링은 의존관계 주입시 항상 프록시 객체를 주입한다.

프록시 객체가 주입되므로 대상 객체를 직접 호출하는 문제는 일반적으로 발생하지 않는다.

**하지만 대상 객체 내부에서 메서드 호출이 발생하면 프록시를 거치지 않고 대상 객체를 직접 호출하는 문제가 발생한다.**

실무에서 한번은 만나 고생하는 문제이니 꼭 이해하고 넘어간다.

![](https://i.ibb.co/sKFDbkD/2021-12-08-5-01-20.png)

AOP 가 적용되려면 `1. 프록시 호출 → 2. 어드바이스 호출 → 3. target 메서드 호출` 이 되어야 한다.

하지만, target 메서드가 해당 클래스의 다른 메서드를 호출하면 프록시가 호출되지 않기 때문에 AOP가 적용되지 않는다.

```java
@Slf4j
@Aspect
public class CallLogAspect {

  @Before("execution(* co.wordbe.springaop.internalcall..*.*(..))") // 포인트컷
  public void doLog(JoinPoint joinPoint) { // 어드바이스
    log.info("aop={}", joinPoint.getSignature());
  }
}
```

```java
@Slf4j
@Component
public class CallServiceV0 {
  public void external() {
    log.info("call external");
    internal(); // 내부 메서드 호출(this.internal())
  }

  public void internal() {
    log.info("call internal");
  }
}
```

```java
@Slf4j
@Import(CallLogAspect.class)
@SpringBootTest
class CallServiceV0Test {

  @Autowired CallServiceV0 callServiceV0;

  @Test
  void external() {
    callServiceV0.external();
  }

  @Test
  void internal() {
    callServiceV0.internal();
  }
}
```

### 프록시 방식의 AOP 한계

내부 호출에 프록시를 적용할 수 없다. 이 문제를 해결하는 법을 알아보자.

> 실제 코드에 AOP 를 직접 적용하는 AspectJ 를 사용하면 이런 문제가 발생하지 않는다. 프록시를 통하는 것이 아니라 해당 코드에 직접 AOP 적용 코드가 붙어 있기 때문에 내부 호출과 무관하게 AOP를 적용할 수 있다.
>
> 하지만 로드 타임 위빙 등을 사용해야 하는데 설정이 복잡하고 JVM 옵션을 주어야 하는 부담이 있다. 프록시 방식의 AOP에서 내부 호출에 대응 할 수 있는 대안들이 있으니, AspectJ 를 직접 사용하는 방법은 실무에서 거의 사용하지 않는다.
>
> 스프링 애플리케이션과 함께 직접 AspectJ 사용하는 방법은 스프링 공식 메뉴얼을 참고하자.

<br />

---

# 프록시와 내부 호출 - 대안1 : 자기자신 주입

내부 호출을 해결하는 가장 간단한 방법은 자기자신을 의존관계 주입 받는 것이다.

![](https://i.ibb.co/4RDxYYM/2021-12-08-9-06-35.png)

```java
@Slf4j
@Component
public class CallServiceV1 {

  private CallServiceV1 callServiceV1;

  @Autowired
  public void setCallServiceV1(CallServiceV1 callServiceV1) {
    log.info("callServiceV1 setter={}", callServiceV1.getClass());
    this.callServiceV1 = callServiceV1;
  }

  public void external() {
    log.info("call external");
    callServiceV1.internal(); // 외부 메서드 호출(callServiceV1.internal())
  }

  public void internal() {
    log.info("call internal");
  }
}
```

```properties
# default is false
spring.main.allow-circular-references=true
```

```shell
aop=void co.wordbe.springaop.internalcall.CallServiceV1.external()
call external
aop=void co.wordbe.springaop.internalcall.CallServiceV1.internal()
call internal
```

<br />

---

# 프록시와 내부 호출 - 대안2 : 지연 조회

앞서 생성자 주입이 실패하는 이유는 자기 자신을 생성하면서 주입해야 하기 때문이다.

스프링 빈을 지연해서 조회하면 되는데, `ObjectProvider(Provider)`, `ApplicationContext` 를 사용하면 된다.

```java
@Slf4j
@Component
public class CallServiceV2 {

  private final ApplicationContext applicationContext;

  public CallServiceV2(ApplicationContext applicationContext) {
    this.applicationContext = applicationContext;
  }

  public void external() {
    log.info("call external");
    CallServiceV2 callServiceV2 = applicationContext.getBean(CallServiceV2.class);
    callServiceV2.internal(); // 외부 메서드 호출(callServiceV1.internal())
  }

  public void internal() {
    log.info("call internal");
  }
}
```

```java
@Slf4j
@Component
public class CallServiceV2 {

    private final ObjectProvider<CallServiceV2> callServiceProvider;

    public CallServiceV2(ObjectProvider<CallServiceV2> callServiceProvider) {
        this.callServiceProvider = callServiceProvider;
    }

    public void external() {
        log.info("call external");
        CallServiceV2 callServiceV2 = callServiceProvider.getObject();
        callServiceV2.internal(); // 외부 메서드 호출(callServiceV1.internal())
    }

    public void internal() {
        log.info("call internal");
    }
}
```

- `ApplicationContext` 는 너무 많은 기능을 제공하므로, `ObjectProvider` 로 빈 하나를 조회해온다.
- `ObjectProvider` 는 객체를 스프링 컨테이너에서 조회하는 것을 스프링 빈 생성 시점이 아니라 실제 객체를 사용하는 시점으로 지연할 수 있다.
- `callServiceProvider.getObject()` 를 호출하는 시점에 스프링 컨테이너에서 빈을 조회한다.
- 여기서는 자신을 주입받는 것이 아니므로 순환 참조가 발생하지 않는다.

---

# 프록시와 내부 호출 - 대안3 : 구조 변경

**가장 나은 대안은 내부 호출이 발생하지 않도록 구조를 변경하는 것이다. 실제 이 방법을 가장 권장한다.**

![](https://i.ibb.co/y6r7pLW/2021-12-08-11-05-01.png)

- 내부 호출 자체가 사라지고, `callService` → `internalService` 를 호출하는 구조로 변경되었다. 덕분에 자연스럽게 AOP가 적용된다.
- 구조 분리 다양한 방법
  - 클라이언트가 둘 다 호출
    - 클라이언트 → `external()`
    - 클라이언트 → `internal()`

> AOP 는 주로 트랜잭션 적용이나 주요 컴포넌트의 로그 출력 기능에 사용된다. 인터페이스에 메서드가 나올 정도의 규모에 AOP를 적용하는 것이 적당하다. 풀어서 이야기하면 AOP 는 `public` 메서드에만 적용한다. `private` 메서드처럼 작은 단위에는 AOP를 적용하지 않는다. (프록시가 타겟의 메소드를 호출하는 것이므로 private 에 AOP가 적용되지 않는다.)
>
> AOP 적용을 위해 `private` 메서드를 외부 클래스로 변경하고 `public` 으로 변경하는 일은 거의 없다. 그러나 위 예제와 같이 `public` 메서드에서 `public` 메서드를 내부 호출하는 경우에는 문제가 발생한다. AOP 가 잘 적용되지 않으면 내부 호출을 의심해보자.

<br />

---

# 프록시 기술과 한계 - 타입 캐스팅

스프링 프록시를 만들때 제공하는 `ProxyFactory` 에 `proxyTargetClass` 옵션에 따라 둘중 하나를 선택해서 프록시를 만들 수 있다.

- `proxyTargetClass=false` : JDK 동적 프록시를 사용해서 인터페이스 기반 프록시 생성
- `proxyTargetClass=true` : CGLIB 를 사용해서 구체 클래스 기반 프록시 생성
- 옵션과 무관하게 인터페이스가 없으면 JDK 동적 프록시를 적용할 수 없으므로 CGLIB를 사용한다.

### JDK 동적 프록시 한계

- 인터페이스 기반으로 프록시를 생성하는 JDK 동적 프록시는 구체 클래스로 타입 캐스팅이 불가능한 한계가 있다.



jdkProxy() 테스트

- `MemberServiceImpl` 타입을 기반으로 JDK 동적 프록시를 생서했다.
- `MemberServiceImpl` 타입은 `MemberService` 인터페이스를 구현한다. 따라서 JDK 동적 프록시는 `MemberService` 인터페이스 기반으로 프록시를 생성한다. 여기서 `MemberServiceProxy`가 바로 JDK proxy 이다.

### JDK 동적 프록시 캐스팅

- JDK proxy 를 `MemberServiceImpl` 로 타입 캐스팅 하려니 예외가 발생한다. JDK 동적 프록시는 인터페이스 기반으로 프록시를 생성하기 때문이다. JDK proxy 는 `MemberService` 로 캐스팅은 가능하지만 `MemberServiceImpl` 이 어떤 것인지 전혀 알지 못한다. 캐스팅을 시도하면 `ClassCastException.class` 예외가 발생한다.

<br />

### CGLIB

- CGLIB 는 구체 클래스기반으로 프록시를 생성하므로 `MemberServiceProxy` 가 바로 CGLIB proxy 이다.
- 여기에서 CGLIB proxy 를 대상 클래스인 `MemberServiceImpl` 타입으로 캐스팅하면 성공한다.
- CGLIB Proxy 는 `MemberServiceImpl` 구체 클래스 기반으로 생성된 프록시 이기 때문이다.

### 정리

- JDK 동적 프록시는 대상 객체로 캐스팅할 수 없다.
- CGLIB 프록시는 대상 객체로 캐스팅할 수 있다.



<br />

---

# 프록시 기술과 한계 - 의존관계 주입

JDK 동적 프록시 사용하면서 의존관계 주입을 할 때는 문제가 발생한다.

JDK proxy 는 `MemberService` 인터페이스 기반으로 만들어진다. 따라서 `MemberServiceImpl`  타입이 무엇인지 전혀 모른다. 그래서 해당 타입에 주입할 수 없다.

- `MemberServiceImpl = JDK Proxy` 성립하지 않는다.

```java
@Slf4j
//@SpringBootTest(properties = {"spring.aop.proxy-target-class=false"}) // JDK 동적 프록시
@SpringBootTest(properties = {"spring.aop.proxy-target-class=true"}) // JDK 동적 프록시
@Import(ProxyDIAspect.class)
public class ProxyDITest {
  @Autowired
  MemberService memberService;

  @Autowired
  MemberServiceImpl memberServiceImpl;

  @Test
  void go() {
    log.info("memberService class: {}", memberService.getClass());
    log.info("memberServiceImpl class: {}", memberServiceImpl.getClass());
    memberServiceImpl.hello("안녕하세요");
  }
}
```

```shell
BeanNotOfRequiredTypeException 발생
```



- JDK 동적프록시가 가지는 한계점을 알아보았다. 실제 개발할 때는 인터페이스가 있으면 인터페이스를 기반으로 의존관계를 주입 받는 것이 맞다.

> DI 의 장점
>
> - 클라이언트 코드의 변경 없이 구현 클래스를 변경할 수 있는 것이다.
> - 이렇게 하려면 인터페이스 기반으로 의존관계를 주입 받아야 한다.
> - `MemberServiceImpl` 타입으로 의존관계를 주입 받는 것처럼 구현 클래스에 의존관계를 주입하면 향후 구현 클래스를 변경할 때 의존관계 주입을 받는 클라이언트 코드도 함께 변경해야 한다.
> - 올바르게 잘 설계된 애플리케이션이라면 이런 문제가 자주 발생하지 않는다.
> - 그럼에도 불가하고 테스트, 또는 여러 이유로 AOP 프록시가 적용된 구체 클래스를 직접 의존관계 주입 받아야 하는 경우가 있다. CGLIB를 통해 구체 클래스 기반으로 AOP 프록시를 적용하면 된다. CGLIB 가 좋아보인다. 아래에서 CGLIB 의 단점도 알아보자.

<br />

---

# 프록시 기술과 한계 - CGLIB

## 한계1 : 대상 클래스에 기본 생성자 필수

- CGLIB 는 구체 클래스를상속 받는다. 자바에서 상속을 받으면 자식 클래스의 생성자를 호출할 때 자식 클래스의 생성자에서 부모 클래스의 생성자도 호출해야 한다. 생략되어 있다면 생성자 첫줄에 부모 클래스의 기본 생성자를 호출하는 `super()` 가 자동으로 들어간다. 자바 문법 규약이다.
- CGLIB 가 만드는 프록시 생성자는 우리가 호출하는 것이 아니다. CGLIB 프록시는 대상 클래스를 상속 받고, 생성자에서 대상 클래스의 기본 생성자를 호출한다. 따라서 대상 클래스에 기본 생성자를 만들어야 한다. (기본 생성자는 파라미터가 하나도 없는 생성자이다. 생성자가 하나도 없으면 자동으로 만들어진다.)

## 한계2 : 생성자 2번 호출 문제

- 실제 target 의 객체를 생성할 때
- 프록시 객체를 생성할 때 부모 클래스의 생성자 호출 (상속을 받으면 자식 클래스의 생성자를 호출할 때 부모 클래스의 생성자도 호출된다.)

![](https://i.ibb.co/Lds2kNh/2021-12-09-12-08-05.png)

## 한계3 : final 키워드 클래스, 메소드 사용 불가

- final 키워드가 클래스에 있으면 상속이 불가능하고, 메서드에 있으면 오버라이딩이 불가능하다. CGLIB 는 상속을 기반으로 하기 때문에 두 경우 프록시가 생성되지 않거나 정상 동작하지 않는다.
- 프레임워크 같은 개발이 아니라 웹 애플리케이션 개발할 때는 `final` 키워드를 잘 사용하지 않는다. 따라서 이 부분이 특별히 문제되지는 않는다.

결론적으로

JDK 동적프록시는 대상 클래스 타입으로 주입할 때 문제가 있고, CGLIB는 대상 클래스에 기본 생성자 필수, 생성자 2번 호출문제가 있다.

그렇다면 스프링의 권장 방법은 무엇일까?



<br />

---

# 프록시 기술과 한계 - 스프링의 해결책

- 스프링 3.2부터 CGLIB를 스프링 내부에 함께 패키징
- 스프링 4.0부터 CGLIB의 기본 생성자가 필수인 문제가 해결되었다.
  - `objenesis` 라는 특별한 라이브러리를 사용해서 기본 생성자 없이 객체 생성이 가능하다. 이 라이브러리는 생성자 호출 없이 객체를 생성할 수 있게 해준다.
- 스프링 4.0부터 CGLIB의 생성자 2번 호출 문제가 해결되었다.
  - 역시 `objenesis` 라는 특별한 라이브러리 덕분에 가능해졌다. 생성자가 1번만 호출된다.
- 스프링 부트 2.0 버전부터 CGLIB를 기본으로 사용하도록 했다.
  - 이를 통해 JDK 동적 프록시에서 나타나는 구체 클래스 타입으로 의존관계를 주입하지 못하는 문제를 해결했다.
  - 스프링 부트는 기본적으로 `proxyTargetClass=true` 로 설정해서 사용한다. 따라서 항상 CGLIB 사용해서 구체 클래스기반 프록시를 생성한다.



---

기술적 겸손함

- 개발 공부는 깊이있게 하면 할수록 더 공부할 내용이 넓고 많아진다.
- 실력있는 개발자들은 본인이 기술적으로 더 많이 공부해야 한다 생각한다.

