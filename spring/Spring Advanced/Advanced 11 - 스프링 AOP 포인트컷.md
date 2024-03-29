# Advanced 11 - 스프링 AOP 포인트컷

# 1 포인트컷 지시자

**포인트컷 지시자 (Poincut Designator, PCD) 종류**

- `execution` : 메소드 실행 조인 포인트를 매칭한다. 스프링 AOP 에서 가장많이 사용하고, 기능도 복잡하다.
- `within`  : 특정 타입 내의조인 포인트를 매칭한다.
- `args` : 인자가 주어진 타입의 인스턴스인 조인 포인트
- `this` : 스프링 빈 객체(스프링 AOP 프록시)를 대상으로 하는 조인 포인트
- `target` : Target 객체 (스프링 AOP 프록시가 가리키는 실제 대상)를 대상으로하는 조인 포인트
- `@target` : 실행 객체의 클래스에 주어진 타입의 애노테이션이 있는 조인 포인트
- `@within` : 주어진 애노테이션이 있는 타입 내 조인 포인트
- `@annotation` : 메서드가 주어진 애노테이션을 가지고 있는 조인 포인트를 매칭
- `@args` : 전달된 실제 인수의 런타임 타입이 주어진 타입의 애노테이션을 갖는 조인 포인트
- `bean` : 스프링 전용 포인트컷 지시자, 빈의 이름으로 포인트컷을 지정한다.

`execution` 을 많이 사용하고, 나머지는 잘 사용하지 않는다. `exeuction` 을 중점적으로 알아보자.

<br />

---

## ExecutionTest

```java
@Slf4j
public class ExecutionTest {
  AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
  Method helloMethod;

  @BeforeEach
  public void init() throws NoSuchMethodException {
    helloMethod = MemberServiceImpl.class.getMethod("hello", String.class);
  }

  @Test
  void printMethod() {
    // public java.lang.String co.wordbe.springaop.order.member.MemberServiceImpl.hello(java.lang.String)
    // execution 으로 시작하는 포인트컷 표현식은 이 메서드 정보를 매칭해서 포인트컷 대상을 찾아낸다.
    log.info("helloMethod: {}", helloMethod);
  }
}
```

- `AspectJExpressionPointcut` 이 바로 포인트컷 표현식을 처리해주는 클래스이다. 여기에 포인트컷 표현식을 지정하면 된다.
- `AspectJExpressionPointcut` 는 상위에 `Pointcut` 인터페이스를 가진다.
- `printMethod()` 테스트는 `MemberServiceImpl.hello(String)` 메서드의 정보를 출력해준다.

<br />

<br />

## Execution 1

```shell
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern?name-pattern(param-pattern) throws-pattern?)
execution(접근제어자? 반환타입 선언타입?메서드이름(파라미터) 예외?)
```

- 메소드 실행 조인포인트를 매칭한다.
- ? 는 생략할 수 있다.
- `*` 과 같은 패턴을 지정할 수 있다.

<br />

### 가장 정확한 포인트컷

`MemberServiceImpl.hello(String)` 메서드와 가장 정확하게 모든 내용이 매칭되는 표현식이다. 메서드와 포인트컷 표현식의 모든 내용이 정확히 일치한다. 따라서 true 를 반환한다.

```java
@Test
void exactMatch() {
  // public java.lang.String co.wordbe.springaop.order.member.MemberServiceImpl.hello(java.lang.String)
  pointcut.setExpression("execution(public String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

매칭 조건

- 접근제어자? : `public`
- 반환타입 : `String`
- 선언타입? : `co.wordbe.springaop.order.member.MemberServiceImpl`
- 메서드이름 : `hello`
- 파라미터 : `(String)`
- 예외? : 생략

<br />

### 가장 많이 생략한 포인트컷

```java
@Test
void allMatch() {
  pointcut.setExpression("execution(* *(..))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

매칭 조건

- 접근제어자? : 생략
- 반환타입 : `*`
- 선언타입? : 생략
- 메서드이름 : `*`
- 파라미터 : `(..)` , .. 은 파라미터의 타입과 파라미터 수가 상관이 없다는 뜻이다.
- 예외? : 없음

<br />

`co.wordbe.springaop.order.member.*(1).*(2)`

- (1) : 타입
- (2) : 메서드 이름

- `.` : 정확하게 해당 위치의 패키지
- `..` : 해당 위치의 패키지와 그 하위 패키지 포함

---

<br />

### 타입 매칭 - 부모 타입 허용

```java
@Test
void typeExactMatch() {
  pointcut.setExpression("execution(* co.wordbe.springaop.order.member.MemberServiceImpl.*(..))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

@Test
void typeMatchSuperType() {
  pointcut.setExpression("execution(* co.wordbe.springaop.order.member.MemberService.*(..))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

- `typeExactMatch()` 는 타입 정보가 정확하게 일치하기 때문에 매칭된다.
- `typeMatchSuperType()` 을 주의해서 보아야 한다.
  - `execution` 에서는 `MemberService` 처럼 부모타임을 선언해도 그 자식 타입은 매칭된다. 다형성에서 부모타입=자식타입이 할당 가능하다는 점을 떠올려보면 된다.

<br />

### 파라미터 매칭

```java
// String 타입의 파라미터 허용
// (String)
@Test
void argsMatch() {
  pointcut.setExpression("execution(* *(String))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

// 파라미터가 없어야 함
// ()
@Test
void argsMatchNoArgs() {
  pointcut.setExpression("execution(* *())");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isFalse();
}

// 정확히 하나의 파라미터 허용, 모든 타입 허용
// (Xxx)
@Test
void argsMatchStar() {
  pointcut.setExpression("execution(* *(*))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

// 숫자와 무관하게 모든 파라미터, 모든 타입 허용
// (), (Xxx), (Xxx, Xxx)
@Test
void argsMatchAll() {
  pointcut.setExpression("execution(* *(..))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

// String 타입으로 시작, 숫자와 무관하게 모든 파라미터, 모든 타입 허용
// (String), (String, Xxx), (String, Xxx, Xxx)
@Test
void argsMatchComplex() {
  pointcut.setExpression("execution(* *(String, ..))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

<br />

### within

타입이 매칭되면 그 안의 메서드(조인포인트) 들이 자동으로 매칭된다. 문법은 단순한데 `execution` 에서 타입 부분만 사용한다.

```java
@Test
void withinTest() {
  pointcut.setExpression("within(co.wordbe.springaop.order.member.MemberServiceImpl)");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

@Test
void withinStarTest() {
  pointcut.setExpression("with in(co.wordbe.springaop.order.member.*Service*)");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

@Test
void withinSubPackage() {
  pointcut.setExpression("within(co.wordbe.springaop.order..*)");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

@Test
@DisplayName("타겟의 타입에만 직접 적용, 인터페이스를 선정하면 안된다.")
void withinSuperTypeFalse() {
  pointcut.setExpression("within(co.wordbe.springaop.order.member.MemberService)");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isFalse();
}

@Test
@DisplayName("execution은 타입 기반, 인터페이스 선정 가능")
void executionSuperTypeFalse() {
  pointcut.setExpression("execution(* co.wordbe.springaop.order.member.MemberService.*(..))");
  assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

- 주의 : within 사용시 표현식에 부모 타입을 지정하면 안된다. 정확하게 타입이 맞아야 한다. 

<br />

### args

execution 의 args 와 같다.

- `execution` 은 파라미터 타입이 정확하게 매칭되어야 한다. `execution` 은 클래스에 선언된 정보를 기반으로 판단한다.
- `args` 는 부모 타입을 허용한다. 실제 넘어온 파라미터 객체 인스턴스를 보고 판단한다.

```java
@Test
void args() {
  assertThat(pointcut("args(String)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args(Object)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args(..)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args(*)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args(String, ..)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args()").matches(helloMethod, MemberServiceImpl.class)).isFalse();
}

/**
     * execution(* *(java.io.Serializable)): 메서드의 시그니처로 판단 (정적)
     * args(java.io.Serializable): 런타임에 전달된 인자로 판단 (동적)
     */
@Test
void argsVsExecution() {
  assertThat(pointcut("args(String)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args(java.io.Serializable)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("args(Object)").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("execution(* *(String))").matches(helloMethod, MemberServiceImpl.class)).isTrue();
  assertThat(pointcut("execution(* *(java.io.Serializable))").matches(helloMethod, MemberServiceImpl.class)).isFalse();
  assertThat(pointcut("execution(* *(Object))").matches(helloMethod, MemberServiceImpl.class)).isFalse();
}
```

- String 은 `Object`, `java.io.Serializable` 의 하위타입이다.
- 정적으로 클래스에 선언된 정보만 보고 판단하는 `execution(* *(Object))` 은 매칭에 실패한다.
- 동적으로 실제 파라미터로 넘어온 객체 인스턴스를 판단하는 `args(Object)` 는 매칭에 성공한다. (부모 타입 허용)

> `args` 지시자는 단독으로 사용되기 보다는 파라미터 바인딩에서 주로 사용된다.

<br />

---

### `@target`, `@within`

앳 타겟, 앳 윗인

- `@target` 은 인스턴스의 모든 메소드를 조인포인트로 적용한다. 부모 클래스의 메소드까지 어드바이스를 다 적용한다.
- `@within` 은 해당 타입 내에 있는 메서드만 조인 포인트로 적용한다. 자기 자신의 클래스에 정의된 메서드에만 어드바이스를 적용한다.

```java
@Slf4j
@Import(AtTargetAtWithinTest.Config.class)
@SpringBootTest
public class AtTargetAtWithinTest {

  @Autowired
  Child child;

  @Test
  void success() {
    log.info("child proxy={}", child.getClass());
    child.childMethod(); // 부모, 자식 모두 있는 메서드
    child.parentMethod(); // 부모 클래스에만 있는 메서든
  }

  static class Config {
    @Bean
    public Parent parent() {
      return new Parent();
    }

    @Bean
    public Child child() {
      return new Child();
    }

    @Bean
    public AtTargetAtWithinAspect atTargetAtWithinAspect() {
      return new AtTargetAtWithinAspect();
    }
  }

  static class Parent {
    public void parentMethod(){}
  }

  @ClassAop
  static class Child extends Parent {
    public void childMethod(){}
  }

  @Slf4j
  @Aspect
  static class AtTargetAtWithinAspect {
    // @target: 인스턴스 기준으로 모든 메소드의 조인포인트를 선정, 부모 타입의 메소드도 적용
    @Around("execution(* co.wordbe.springaop..*(..)) && @target(co.wordbe.springaop.order.member.annotation.ClassAop)")
    public Object atTarget(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[@target] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }

    // @within: 클래스 내부에 있는 메서드만 조인포인트로 선정, 부모 타입의 메소드는 적용되지 않음
    @Around("execution(* co.wordbe.springaop..*(..)) && @within(co.wordbe.springaop.order.member.annotation.ClassAop)")
    public Object atWithin(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[@within] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }
  }
}
```

```shell
c.w.s.pointcut.AtTargetAtWithinTest      : child proxy=class co.wordbe.springaop.pointcut.AtTargetAtWithinTest$Child$$EnhancerBySpringCGLIB$$f8d3dfcd
argetAtWithinTest$AtTargetAtWithinAspect : [@target] void co.wordbe.springaop.pointcut.AtTargetAtWithinTest$Child.childMethod()
argetAtWithinTest$AtTargetAtWithinAspect : [@within] void co.wordbe.springaop.pointcut.AtTargetAtWithinTest$Child.childMethod()
argetAtWithinTest$AtTargetAtWithinAspect : [@target] void co.wordbe.springaop.pointcut.AtTargetAtWithinTest$Parent.parentMethod()
```

> 참고
>
> `@target` , `@within` 지시자는 뒤에서 설명할 파라미터 바인딩과 함께 사용된다.

> 주의
>
> 다음 포인트컷 지시자는 단독으로 사용하면 안된다. `args, @args, @target`
>
> 이번 예제를 보면 `execution(* co.wordbe.springaop..*(..))` 를 통해 적용 대상을 줄여준 것을 확인할 수 있다. 위 지시자들은 실제 객체 인스턴스가 생성되고 실행될 때 어드바이스 적용 여부를 확인할 수 있다.
>
> 실행 시점에 일어나는 포인트컷 적용 여부도 프록시가 있어야 실행 시점에 판단할 수 있다. 스프링 컨테이너가 프록시를 생성하는 시점은 스프링 컨테이너가 만들어지는 애플리케이션 로딩 시점에 적용할 수 있다. 위 지시자들 같은 포인트컷 지시자가 있으면 스프링은 모든 스프링 빈에 AOP를 적용하려고 시도한다. 프록시가 없으면 실행 시점에 판단 자체가 불가능하다.
>
> 문제는 이렇게 모든 스프링 빈에 AOP 프록시를 적용하려고 하면 스프링 내부에서 사용하는 빈 중에 `final` 로 지정된 빈들도 있기 때문에 오류가 발생할 수 있다. 따라서 이러한 표현식은 최대한 범위를 줄여놓고 실행해야 한다.

---

<br />

### `@annotation`, `@args`

- `@annotation` : 메서드가 주어진 어노테이션을 가지고 있는 조인포인트를 매칭

```java
@Slf4j
@Import(AtAnnotationTest.AtAnnotationAspect.class)
@SpringBootTest
public class AtAnnotationTest {

  @Autowired
  MemberService memberService;

  @Test
  void success() {
    log.info("memberService Proxy={}", memberService.getClass());
    memberService.hello("helloA");
  }

  @Slf4j
  @Aspect
  static class AtAnnotationAspect {
    @Around("@annotation(co.wordbe.springaop.order.member.annotation.MethodAop)")
    public Object doAtAnnotation(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[@annotation] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }
  }
}
```

```shell
memberService Proxy=class co.wordbe.springaop.order.member.MemberServiceImpl$$EnhancerBySpringCGLIB$$a0559636
[@annotation] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String)
```

<br />

- `@args` : 전달된 실제 인수의 런타임 타입이 주어진 타입의 어노테이션을 갖는 조인포인트
- 전달된 인수의 런타임 타입에 `@Check` 어노테이션이 있는 경우에 매칭한다. `@args(test.Check)`

<br />

---

### bean

- 스프링 전용 포인트컷 지시자. 빈의 이름으로 지정한다.

```java
@Slf4j
@Import(BeanTest.BeanAspect.class)
@SpringBootTest
public class BeanTest {
  @Autowired
  OrderService orderService;

  @Test
  void success() {
    orderService.orderItem("itemA");
  }

  @Aspect
  static class BeanAspect {
    @Around("bean(orderService) || bean(*Repository)")
    public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[bean] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }
  }
}
```

```shell
[bean] void co.wordbe.springaop.order.OrderService.orderItem(String)
[orderService] 실행
[bean] void co.wordbe.springaop.order.OrderRepository.save(String)
[orderRepository] 실행
```

- 특정 빈에 Aspect 를 적용할 수 있다.

---

### 매개변수 전달

다음 포인트컷 표현식을 사용해서 어드바이스에 매개변수를 전달할 수 있다.

`this, target, args, @target, @within, @annotation, @args`

- 포인트컷의 이름과 매개변수의 이름을 맞추어야 한다. 여기서는 `arg` 로 맞추었다.
- 추가로 타입이 메서드에 지정한 타입으로 제한된다. 여기서느 메서드 타입이 `String` 으로 되어있으므로 
  - `args(arg,..)` --> `args(String,..)` 로 정의된다.

```java
@Slf4j
@Import(ParameterTest.ParameterAspect.class)
@SpringBootTest
public class ParameterTest {
  @Autowired
  MemberService memberService;

  @Test
  void success() {
    log.info("memberService Proxy={}", memberService.getClass());
    memberService.hello("안녕하세요");
  }

  @Slf4j
  @Aspect
  static class ParameterAspect {
    @Pointcut("execution(* co.wordbe.springaop.order.member..*(..))")
    private void allMember() {}

    @Around("allMember()")
    public Object logArgs1(ProceedingJoinPoint joinPoint) throws Throwable {
      Object arg1 = joinPoint.getArgs()[0];
      log.info("[logArgs1] {} arg1={}", joinPoint.getSignature(), arg1);
      return joinPoint.proceed();
    }

    @Around("allMember() && args(arg,..)")
    public Object logArgs2(ProceedingJoinPoint joinPoint, Object arg) throws Throwable {
      log.info("[logArgs2] {} arg1={}", joinPoint.getSignature(), arg);
      return joinPoint.proceed();
    }

    @Before("allMember() && args(arg,..)")
    public void logArgs3(String arg) {
      log.info("[logArgs3] arg={}", arg);
    }

    @Before("allMember() && target(obj)") // 실제 객체
    public void targetArgs(JoinPoint joinPoint, MemberService obj) {
      log.info("[target] {} arg={}", joinPoint.getSignature(), obj.getClass());
    }

    @Before("allMember() && this(obj)") // 프록시
    public void thisArgs(JoinPoint joinPoint, MemberService obj) {
      log.info("[thisArgs] {} obj={}", joinPoint.getSignature(), obj.getClass());
    }

    @Before("allMember() && @target(annotation)")
    public void atTarget(JoinPoint joinPoint, ClassAop annotation) {
      log.info("[@target] {} annotation={}", joinPoint.getSignature(), annotation);
    }

    @Before("allMember() && @within(annotation)")
    public void atWithin(JoinPoint joinPoint, ClassAop annotation) {
      log.info("[@within] {} annotation={}", joinPoint.getSignature(), annotation);
    }

    @Before("allMember() && @annotation(annotation)")
    public void atAnnotation(JoinPoint joinPoint, MethodAop annotation) {
      log.info("[@annotation] {} annotationValue={}", joinPoint.getSignature(), annotation.value());
    }
  }
}
```

```shell
memberService Proxy=class co.wordbe.springaop.order.member.MemberServiceImpl$$EnhancerBySpringCGLIB$$b7bd803f
[logArgs1] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) arg1=안녕하세요
[logArgs2] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) arg1=안녕하세요
[@annotation] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) annotationValue=test value
[@target] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) annotation=@co.wordbe.springaop.order.member.annotation.ClassAop()
[@within] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) annotation=@co.wordbe.springaop.order.member.annotation.ClassAop()
[logArgs3] arg=안녕하세요
[target] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) arg=class co.wordbe.springaop.order.member.MemberServiceImpl
[thisArgs] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String) obj=class co.wordbe.springaop.order.member.MemberServiceImpl$$EnhancerBySpringCGLIB$$b7bd803f
```

<br />

---

### this, target

- this : 스프링 빈 객체(스프링 AOP 프록시)를 대상으로 하는 조인포인트 (포인트컷을 매칭)
- target : 타겟 객체(스프링 AOP 프록시가 가리키는 실제 대상)를 대상으로 하는 조인 포인트 (포인트컷을 매칭)

위 둘 지시지는 적용 타입 하나를 정확하게 지정해야 한다.

- `*` 패턴을 사용할 수 없다.
- 부모 타입을 허용한다.

<br />

**this vs target**

**프록시 생성 방식에 따른 차이**

- JDK 동적 프록시 : 인터페이스를 구현한 프록시 객체 생성
- CGLIB 동적 프록시 : 인터페이스가 있어도 구체 클래스를 상속 받아서 프록시 생성

![](https://i.ibb.co/8K47Jvq/2021-12-08-12-58-20.png)

![](https://i.ibb.co/yW3t2vX/2021-12-08-1-01-14.png)

- 프록시를 대상으로 하는 `this` 의 경우 구체 클래스를 지정하면 프록시 생성 전략에 따라 다른 결과가 나올 수 있다.



<br />

```java
package co.wordbe.springaop.pointcut;

import co.wordbe.springaop.order.member.MemberService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/**
 * application.properties
 * spring.aop.proxy-target-class=true CGLIB, default
 * spring.aop.proxy-target-class=false JDK 동적 프록시
 */
@Slf4j
@Import(ThisTargetTest.ThisTargetAspect.class)
@SpringBootTest(properties = {"spring.aop.proxy-target-class=false"})
public class ThisTargetTest {
  @Autowired
  MemberService memberService;

  @Test
  void success() {
    log.info("memberService Proxy={}", memberService.getClass());
    memberService.hello("안녕하세요");
  }

  @Slf4j
  @Aspect
  static class ThisTargetAspect {

    // 부모 타입 허용
    @Around("this(co.wordbe.springaop.order.member.MemberService)")
    public Object doThisInterface(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[this-interface] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }

    // 부모 타입 허용
    @Around("target(co.wordbe.springaop.order.member.MemberService)")
    public Object doTargetInterface(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[target-interface] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }

    @Around("this(co.wordbe.springaop.order.member.MemberServiceImpl)")
    public Object doThis(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[this-impl {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }

    @Around("target(co.wordbe.springaop.order.member.MemberServiceImpl)")
    public Object doTarget(ProceedingJoinPoint joinPoint) throws Throwable {
      log.info("[target-impl] {}", joinPoint.getSignature());
      return joinPoint.proceed();
    }
  }
}
```

CGLIB

```shell
memberService Proxy=class co.wordbe.springaop.order.member.MemberServiceImpl$$EnhancerBySpringCGLIB$$acee5641
[target-impl] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String)
[target-interface] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String)
[this-impl String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String)
[this-interface] String co.wordbe.springaop.order.member.MemberServiceImpl.hello(String)
```

JDK 동적 프록시

```shell
memberService Proxy=class com.sun.proxy.$Proxy51
[target-impl] String co.wordbe.springaop.order.member.MemberService.hello(String)
[target-interface] String co.wordbe.springaop.order.member.MemberService.hello(String)
[this-interface] String co.wordbe.springaop.order.member.MemberService.hello(String)
```

- this-impl 에 어드바이스가 적용되지 않았다.
  - 이유는 this 대상은 인터페이스를 구현한 프록시인데, 이는 `MemberServiceImpl` 를 알지 못하기 때문이다.



