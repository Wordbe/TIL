# Advanced 05 - 동적 프록시

<br />

# 1 리플렉션

자바가 기본으로 제공하는 JDK 동적 프록시 기술이나 CGLIB 같은 프록시 생성 오픈소스 기술을 활용하면, 프록시 객체를 동적으로 만들어 낼 수 있다.

프록시 클래스를 하나만 만들어두고 동적 프록시로 프록시 객체를 찍어낼 수 있다.



그 전에, 리플렉션을 이해해야 한다.

- 클래스나 메서드의 메타 정보를 동적으로 획득하고, 코드도 동적으로 호출 할 수 있다.
- 참고) 람다를 사용하여 공통화 하는 것도 가능하다.

```java
@Slf4j
public class ReflectionTest {
  @Test
  void reflection0() {
    Hello target = new Hello();

    //공통 로직1 시작
    log.info("start");
    String result1 = target.callA();
    log.info("result1: {}", result1);
    //공통 로직1 종료

    //공통 로직2 시작
    log.info("start");
    String result2 = target.callB();
    log.info("result2: {}", result2);
    //공통 로직2 종료
  }

  @Test
  void reflection1() throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    // 클래스 정보
    Class classHello = Class.forName("co.wordbe.advanced.proxy.jdkdynamic.ReflectionTest$Hello");

    Hello target = new Hello();
    // callA 메서드 정보
    Method methodCallA = classHello.getMethod("callA");
    Object result1 = methodCallA.invoke(target);
    log.info("result1: {}", result1);

    // callB 메서드 정보
    Method methodCallB = classHello.getMethod("callB");
    Object result2 = methodCallB.invoke(target);
    log.info("result2: {}", result2);
  }

  @Test
  void reflection2() throws Exception {
    // 클래스 정보
    Class classHello = Class.forName("co.wordbe.advanced.proxy.jdkdynamic.ReflectionTest$Hello");

    Hello target = new Hello();
    // callA 메서드 정보
    Method methodCallA = classHello.getMethod("callA");
    dynamicCall(methodCallA, target);

    // callB 메서드 정보
    Method methodCallB = classHello.getMethod("callB");
    dynamicCall(methodCallB, target);
  }

  private void dynamicCall(Method method, Object target) throws Exception {
    log.info("start");
    Object result = method.invoke(target);
    log.info("result: {}", result);
  }

  @Slf4j
  static class Hello {
    public String callA() {
      log.info("callA");
      return "A";
    }

    public String callB() {
      log.info("callB");
      return "B";
    }
  }
}
```

- 클래스 메타정보를 획득한다. 내부 클래스 구분을 위해 `$` 를 사용한다.
- 메서드를 직접 호출하는 부분이 `Method` 로 대체되면서 공통 로직을 만들 수 있게 되었다.

<br />

### **리플렉션 정리**

- 리플렉션을 사용하면 클래스와 메서드의 메타정보를 사용해서 애플리케이션을 동적으로 유연하게 만들 수 있다.
- 하지만, 리플렉션은 런타임에 동작하므로 컴파일타임에 오류를 잡을 수 없다.
- 가장 좋은 오류는 개발자가 즉시 확인할 수 있는 컴파일에러, 가장 무서운 오류는 사용자가 직접 실행할 때 발생하는 런타임 에러다.
- 프로그래밍 언어가 발달하면서 타입 정보를 기반으로 컴파일 시점에 오류를 잡아준 덕분에 개발자가 편해졌는데, 리플렉션은 이를 역행한다.
- 리플렉션은 프레임워크 개발이나 매우 일반적인 공통 처리가 필요할 때 부분적으로 주의해서 사용해야 한다.

<br />

---

# JDK 동적 프록시

JDK 동적 프록시는 인터페이스 기반으로 프록시를 동적으로 만들어 준다. 따라서 인터페이스가 필수다.

이제는 프록시 클래스 하나만 만들고, 이를 재사용할 수 있는 동적 프록시를 구성해보자.

```java
public interface AInterface {
  String call();
}
```

```java
@Slf4j
public class AImpl implements AInterface{
  @Override
  public String call() {
    log.info("A 호출");
    return "a";
  }
}
```

B 도 이와 같이 똑같이 만들어준다.

그리고 `InvocationHandler` 의 구현체를 만든다.

```java
@Slf4j
public class TimeInvocationHandler implements InvocationHandler {
  private final Object target;

  public TimeInvocationHandler(Object target) {
    this.target = target;
  }

  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    log.info("TimeProxy 실행");
    long start = System.currentTimeMillis();
    Object result = method.invoke(target, args);
    long end = System.currentTimeMillis();
    log.info("TimeProxy 실행 완료. 실행 시간: {}", end - start);
    return result;
  }
}
```

이제 구현 클래스를 생성하고, invocationHandler 에게 이 타겟 클래스를 넘긴 후 프록시를 생성해보자.

```java
@Slf4j
public class JdkDynamicProxyTest {
  @Test
  void dynamicA() {
    AInterface target = new AImpl();
    TimeInvocationHandler handler = new TimeInvocationHandler(target);
    AInterface proxy = (AInterface) Proxy.newProxyInstance(AInterface.class.getClassLoader(), new Class[]{AInterface.class}, handler);
    proxy.call();

    log.info("targetClass: {}", target.getClass());
    log.info("proxyClass: {}", proxy.getClass());
  }

  @Test
  void dynamicB() {
    BInterface target = new BImpl();
    TimeInvocationHandler handler = new TimeInvocationHandler(target);
    BInterface proxy = (BInterface) Proxy.newProxyInstance(BInterface.class.getClassLoader(), new Class[]{BInterface.class}, handler);
    proxy.call();

    log.info("targetClass: {}", target.getClass());
    log.info("proxyClass: {}", proxy.getClass());
  }
}
```

결과

```java
23:23:40.380 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.code.TimeInvocationHandler - TimeProxy 실행
23:23:40.384 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.code.AImpl - A 호출
23:23:40.384 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.code.TimeInvocationHandler - TimeProxy 실행 완료. 실행 시간: 0
23:23:40.386 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.JdkDynamicProxyTest - targetClass: class co.wordbe.advanced.proxy.jdkdynamic.code.AImpl
23:23:40.386 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.JdkDynamicProxyTest - proxyClass: class com.sun.proxy.$Proxy11
23:23:40.395 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.code.TimeInvocationHandler - TimeProxy 실행
23:23:40.396 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.code.BImpl - B 호출
23:23:40.396 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.code.TimeInvocationHandler - TimeProxy 실행 완료. 실행 시간: 0
23:23:40.396 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.JdkDynamicProxyTest - targetClass: class co.wordbe.advanced.proxy.jdkdynamic.code.BImpl
23:23:40.396 [Test worker] INFO co.wordbe.advanced.proxy.jdkdynamic.JdkDynamicProxyTest - proxyClass: class com.sun.proxy.$Proxy12
```



<br />

<br />

![](https://i.ibb.co/MBcbRBT/2021-12-02-11-20-43.png)

## 실행 순서

1. 클라이언트는 JDK 동적 프록시의 `call()` 을 실행한다.
2. JDK 동적 프록시는 `InvocationHandler.invoke()` 를 호출한다. `TimeInvocationHandler` 가 구현체로 있으므로 `TimeInvocationHandler.invoke()` 가 호출된다.
3. `TimeInvocationHandler` 가 내부로직을 수행하고, `method.invoke(target, args)` 를 호출해서 `target` 인 실제 객체 (AImpl) 를 호출한다.
4. `AImpl` 인스턴스의 call() 이 실행된다.
5. call() 이 끝나면 `TimeInvocationHandler` 로 응답이 돌아온다. 나머지 로직을 수행하고 결과를 반환한다.

<br />

## 정리

- `AImpl`, `BImpl` 각각 프록시를 만들지 않았다. 프록시는 JDK 동적 프록시를 사용해서 동적으로 만들고 `TimeInvocationHandler` 는 공통으로 사용했다.

![](https://i.ibb.co/ZYyPMVP/2021-12-02-11-27-25.png)

![](https://i.ibb.co/NYTtvxX/2021-12-02-11-28-10.png)



<br />

# JDK 동적 프록시 적용

JDK 동적 프록시는 인터페이스가 필수이기 때문에 V1 애플리케이션에만 적용가능하다.



`Method` 를 통해서 호출되는 메서드 정보와 클래스 정보를 동적으로 확인할 수 있다. 



## 의존 관계

![](https://i.ibb.co/25NbMfc/2021-12-02-11-52-57.png)

## 런타임에 어떻게 동작하는가?

![](https://i.ibb.co/JKCmFxS/2021-12-02-11-54-43.png)

 ## 남은 문제

- `http://localhost:8080/v1/no-log` 호출시에도 동적 프록시가 생성되고, `LogTraceBasicHandler` 가 실행되므로 로그가 남는다.
- 로그가 남지 않도록 처리해야 한다.



## PatternMatchUtils.simpleMatch() 사용하여 특정 패턴 필터링

```java
public class LogTraceFilterHandler implements InvocationHandler {
  private final Object target;
  private final LogTrace logTrace;
  private final String[] patterns;

  public LogTraceFilterHandler(Object target, LogTrace logTrace, String[] patterns) {
    this.target = target;
    this.logTrace = logTrace;
    this.patterns = patterns;
  }

  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

    // 메서드 이름 필터
    String methodName = method.getName();
    // save, order, orde*, *der
    if (!PatternMatchUtils.simpleMatch(patterns, methodName)) {
      return method.invoke(target, args);
    }

    TraceStatus status = null;
    try {
      String message = method.getDeclaringClass().getSimpleName() + "." + methodName + "()";
      status = logTrace.begin(message);

      // 로직 호출
      Object result = method.invoke(target, args);

      logTrace.end(status);
      return result;
    } catch (Exception e) {
      logTrace.exception(status, e);
      throw e;
    }
  }
}
```

이렇게 하면 pattern 으로 들어오는 특별한 패턴은 따로 처리할 수 있다.



## JDK 동적 프록시 한계

- 인터페이스가 필수이다.
- V2 애플리케이션처럼 클래스만 있는 경우 동적 프록시 처리는?
  - `CGLIB` 라는 바이트코드를 조작하는 특별한 라이브러리를 사용해야 한다.

<br />

---

# CGLIB

**Code Generator Library, CGLIB**

- 바이트코드를 조작해서 동적으로 클래스를 생성하는 기술을 제공
- 인터페이스가 없어도 구체 클래스만 가지고 동적프록시를 만들 수 있다.
- 원래 외부 라이브러리인데, 스프링 프레임워크가 내부 소스코드에 포함했다. 스프링 프로젝트 안에 있다.

우리가 CGLIB 를 직접 사용하는 경우는 거의 없다. 스프링의 `ProxyFactory` 가 이 기술을 편리하게 사용하게 돕는다.

<br />

```java
@Slf4j
public class CglibTest {
  @Test
  void cglib() {
    ConcreteService target = new ConcreteService();
    Enhancer enhancer = new Enhancer();
    enhancer.setSuperclass(ConcreteService.class); // 구체 클래스를 상속 받아서 프록시를 생성할 수 있다. 구체 클래스 설정
    enhancer.setCallback(new TimeMethodInterceptor(target)); // 프록시에 적용할 실행 로직

    // concrete 서비스를 상속받아서 프록시가 생성되므로 업캐스팅이 가능하다.
    ConcreteService proxy = (ConcreteService) enhancer.create();
    log.info("targetClass={}", target.getClass());
    log.info("proxyClass={}", proxy.getClass());

    proxy.call();
  }
}
```



```java
@Slf4j
public class TimeMethodInterceptor implements MethodInterceptor {
  private final Object target;

  public TimeMethodInterceptor(Object target) {
    this.target = target;
  }

  @Override
  public Object intercept(Object obj, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
    log.info("TimeMethodInterceptor 실행");
    long start = System.currentTimeMillis();

    Object result = methodProxy.invoke(target, args); // method 를 사용해도 되지만 CGLIB 는 성능상 methodProxy 를 권장

    long end = System.currentTimeMillis();
    log.info("TimeMethodInterceptor 실행 완료. 실행 시간: {}", end - start);
    return result;
  }
}
```

- JDK 동적 프록시에서 실행 로직을 위해 `InvocationHandler` 를 제공했듯이, CGLIB 는 `MethodInterceptor` 를 제공한다.
- `obj` : CGLIB 가 적용된 객체
- `method` : 호출된 메서드
- `args` : 메서드를 호출하면서 전달된 인수
- `proxy` : 메서드 호출에 사용

결과

```java
00:55:25.169 [Test worker] INFO co.wordbe.advanced.proxy.cglib.CglibTest - targetClass=class co.wordbe.advanced.proxy.common.service.ConcreteService
00:55:25.174 [Test worker] INFO co.wordbe.advanced.proxy.cglib.CglibTest - proxyClass=class co.wordbe.advanced.proxy.common.service.ConcreteService$$EnhancerByCGLIB$$97ddb6d6
00:55:25.175 [Test worker] INFO co.wordbe.advanced.proxy.cglib.code.TimeMethodInterceptor - TimeMethodInterceptor 실행
00:55:25.185 [Test worker] INFO co.wordbe.advanced.proxy.common.service.ConcreteService - ConcreteService 호출
00:55:25.185 [Test worker] INFO co.wordbe.advanced.proxy.cglib.code.TimeMethodInterceptor - TimeMethodInterceptor 실행 완료. 실행 시간: 10
```

![](https://i.ibb.co/QdSKSW2/2021-12-03-12-57-43.png)

<br />

클래스 기반 프록시는 상속을 사용하기 때문에 제약이 있다.

- 부모 클래스의 생성자를 체크해야 한다. CGLIB 는 자식 클래스를 동적으로 생성하기 때문에 기본 생성자가 필요하다.
- 클래스에 `final` 키워드가 붙으면 상속이 불가능하다. CGLIB 에서는 예외가 발생한다.
- 메서드에 `final` 키워드가 붙으면 해당 메서드를 오버라이딩 할 수 없다. CGLIB 에서는 프록시 로직이 동작하지 않는다.



> CGLIB 를 사용하면 인터페이스가 없는 V2 애플리케이션에 동적프록시를 적용할 수 있다.
>
> V2 애플리케이션에 기본 생성자를 추가하고, 의존관계를 `setter` 를 이용해서 주입하면 CGLIB 를 적용할 수 있다. 하지만 `ProxyFactory` 를 통해서 CGLIB 를 적용하면 이런 단점을 해결하고, 더 편리하기 때문에 이를 사용하는 편이 낫다.



## 남은 문제

- 인터페이스가 있는 경우에는 JDK 동적 프록시를 적용하고, 그렇지 않은 경우에는 CGLIB 를 적용하려면 어떻게 해야할까?
- 두 기술을 함께사용할 때 부가기능을 제공하기 위해서 JDK 동적 프록시가 제공하는 `InvocationHandler` 와 CGLIB 가 제공하는 `MethodInterceptor` 를 중복으로 만들어서 관리해야 하나?
- 특정 조건에 따라 프록시 로직을 적용하는 공통 기능 추가는 어떻게 하나?

<br />

<br />

<br />