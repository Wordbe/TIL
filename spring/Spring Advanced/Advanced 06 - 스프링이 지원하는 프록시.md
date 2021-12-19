# Advanced 06 - 스프링이 지원하는 프록시

<br />

### Q. 인터페이스가 있는 경우에는 JDK 동적 프록시를 적용하고, 그렇지 않은 경우에는 CGLIB 를 적용하려면 어떻게 해야할까?

스프링은 유사한 구체적 기술들이 있을 때, 이들을 통합해서 일관성있게 접근할 수 있고 더욱 편리하게 사용할 수 있는 추상화된 기술을 제공한다.

스프링 동적 프록시를 통합해서 편리하게 만들어주는 프록시 팩토리(`ProxyFactory`) 라는 기능을 제공한다.

상황에 따라 JDK 동적 프록시나 CGLIB를 사용하는 대신, 프록시 팩토리 하나로 편리하게 동적 프록시를 생성할 수 있다.

![](https://i.ibb.co/Wtzds51/2021-12-03-1-17-48.png)

<br />

### Q. 두 기술을 함께사용할 때 부가기능을 제공하기 위해서 JDK 동적 프록시가 제공하는 `InvocationHandler` 와 CGLIB 가 제공하는 `MethodInterceptor` 를 중복으로 만들어서 관리해야 하나?

스프링은 이 문제를 해결하기 위해 부가 기능을 적용할 때 `Advice` 라는 새로운 개념을 도입했다. 개발자는 `InvocationHandler` 나 `MethodInterceptor` 를 신경쓰지 않고 `Advice` 만 만들면 된다.

프록시 팩토리를 사용하면 `Advice` 를 호출하는 전용  `InvocationHandler` , `MethodInterceptor` 를 내부에서 사용한다.

![](https://i.ibb.co/NTBL1hx/2021-12-03-1-25-14.png)



<br />

### Q. 특정 조건에 따라 프록시 로직을 적용하는 공통 기능 추가는 어떻게 하나?

스프링은 `Pointcut` 이라는 개념을 도입해서 이 문제를 일관성 있게 해결한다.



<br />

# 프록시 팩토리

## Advice 만들기

어드바이스는 프록시에 적용하는 부가기능 로직이다. JDK 동적프록시가 제공하는 `InvocationHandler` 와 `CGLIB` 가 제공하는 `MethodInterceptor` 개념과 유사하다. 둘을 개념적으로 추상화 한 것이다. 프록시 팩토리를 사용하면 둘 대신 `Advice` 를 사용한다.



```java
package org.aopalliance.intercept;

@FunctionalInterface
public interface MethodInterceptor extends Interceptor {

	/**
	 * Implement this method to perform extra treatments before and
	 * after the invocation. Polite implementations would certainly
	 * like to invoke {@link Joinpoint#proceed()}.
	 * @param invocation the method invocation joinpoint
	 * @return the result of the call to {@link Joinpoint#proceed()};
	 * might be intercepted by the interceptor
	 * @throws Throwable if the interceptors or the target object
	 * throws an exception
	 */
	@Nullable
	Object invoke(@Nonnull MethodInvocation invocation) throws Throwable;

}
```

- 내부에는 다음 메서드를 호출하는 방법, 현재 프록시 객체 인스턴스, `args`, 메서드 정보 등이 포함되어 있다.
- CGLIB 의 `MethodInterceptor` 와 이름이 같다.

<br />

```java
package co.wordbe.advanced.proxy.proxyfactory;

import co.wordbe.advanced.proxy.common.advice.TimeAdvice;
import co.wordbe.advanced.proxy.common.service.ServiceImpl;
import co.wordbe.advanced.proxy.common.service.ServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.aop.support.AopUtils;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
public class ProxyFactoryTest {
    @Test
    void 인터페이스가_있으면_JDK_동적프록시를_사용한다() {
        ServiceImpl target = new ServiceImpl();
        ProxyFactory proxyFactory = new ProxyFactory(target);
        proxyFactory.addAdvice(new TimeAdvice());
        ServiceInterface proxy = (ServiceInterface) proxyFactory.getProxy();
        log.info("targetClass={}", target.getClass());
        log.info("proxyClass={}", proxy.getClass());
        proxy.save();

        assertThat(AopUtils.isAopProxy(proxy)).isTrue();
        assertThat(AopUtils.isJdkDynamicProxy(proxy)).isTrue(); // 인터페이스 프록시를 만들 수 있다.
        assertThat(AopUtils.isCglibProxy(proxy)).isFalse();
    }
}

```

```shell
01:59:16.851 [Test worker] INFO co.wordbe.advanced.proxy.proxyfactory.ProxyFactoryTest - targetClass=class co.wordbe.advanced.proxy.common.service.ServiceImpl
01:59:16.856 [Test worker] INFO co.wordbe.advanced.proxy.proxyfactory.ProxyFactoryTest - proxyClass=class com.sun.proxy.$Proxy11
01:59:16.864 [Test worker] INFO co.wordbe.advanced.proxy.common.advice.TimeAdvice - TimeProxy 실행
01:59:16.864 [Test worker] INFO co.wordbe.advanced.proxy.common.service.ServiceImpl - save 호출
01:59:16.864 [Test worker] INFO co.wordbe.advanced.proxy.common.advice.TimeAdvice - TimeProxy 실행 완료. 실행 시간: 0
```



- `target` 클래스에 대한 정보는 `MethodInvocation invocation` 안에 모두 포함되어 있다. 프록시 팩토리로 프록시를 생성하는 단계에서 이미 `target` 정보를 파라미터로 전달받기 때문이다.
- 프록시 팩토리는 인스턴스 정보 기반으로 프록시를 생성한다. 인스턴스에 인터페이스가 있다면 JDK 동적 프록시를 기본으로 사용하고, 인터페이스가 없고 구체클래스만 있다면 CGLIB를 사용한다.
- `proxyFactory.addAdvice(new TimeAdvice())` : 프록시 팩토리를 통해 만든 프록시가 사용할 부가 기능 로직을 설정한다. 이 부가기능을 `Advice` 라고한다. JDK 동적 프록시가 제공하는 `InvocationHandler` 와 CGLIB가 제공하는 `MethodInterceptor` 의 개념과 유사하다.

<br />

---

```java
@Slf4j
public class ProxyFactoryTest {
  @Test
  void 인터페이스가_있으면_JDK_동적프록시를_사용한다() {
    ServiceImpl target = new ServiceImpl();
    ProxyFactory proxyFactory = new ProxyFactory(target);
    proxyFactory.addAdvice(new TimeAdvice());
    ServiceInterface proxy = (ServiceInterface) proxyFactory.getProxy();
    log.info("targetClass={}", target.getClass());
    log.info("proxyClass={}", proxy.getClass());
    proxy.save();

    assertThat(AopUtils.isAopProxy(proxy)).isTrue();
    assertThat(AopUtils.isJdkDynamicProxy(proxy)).isTrue(); // 인터페이스 프록시를 만들 수 있다. (JDK 동적 프록시)
    assertThat(AopUtils.isCglibProxy(proxy)).isFalse();
  }

  @Test
  void 구체클래스만_있으면_CGLIB를_사용한다() {
    ConcreteService target = new ConcreteService();
    ProxyFactory proxyFactory = new ProxyFactory(target);
    proxyFactory.addAdvice(new TimeAdvice());
    ConcreteService proxy = (ConcreteService) proxyFactory.getProxy();
    log.info("targetClass={}", target.getClass());
    log.info("proxyClass={}", proxy.getClass());
    proxy.call();

    assertThat(AopUtils.isAopProxy(proxy)).isTrue();
    assertThat(AopUtils.isJdkDynamicProxy(proxy)).isFalse();
    assertThat(AopUtils.isCglibProxy(proxy)).isTrue(); // 클래스 기반 프록시를 만들 수 있다. (CGLIB)
  }

  @Test
  void 인터페이스가_있어도_CGLIB를_사용한다() { // ProxyTargetClass 사
    ServiceImpl target = new ServiceImpl();
    ProxyFactory proxyFactory = new ProxyFactory(target);
    proxyFactory.setProxyTargetClass(true); // 클래스기반 프록시를 만들도록 설정
    proxyFactory.addAdvice(new TimeAdvice());
    ServiceImpl proxy = (ServiceImpl) proxyFactory.getProxy();
    log.info("targetClass={}", target.getClass());
    log.info("proxyClass={}", proxy.getClass());
    proxy.save();

    assertThat(AopUtils.isAopProxy(proxy)).isTrue();
    assertThat(AopUtils.isJdkDynamicProxy(proxy)).isFalse();
    assertThat(AopUtils.isCglibProxy(proxy)).isTrue(); // 인터페이스가 있어도 클래스 기반 프록시를 만들 수 있다. (CGLIB)
  }
}
```



프록시 부가 기능 로직도 특정 기술 종속적이지 않게 `Advice` 하나로 편리하게 사용할 수 있다. 프록시 팩토리가 내부에서 JDK 동적 프록시인 경우 `InvocationHandler` 가 `Advice` 를 호출하도록 개발해두고, `CGLIB` 인 경우 `MethodInterceptor` 가 `Advice` 를 호출하도록 기능을 개발해두었기 때문이다.

> 스프링 부트는 AOP를 적용할 때 기본적으로 `proxyTargetClass=true` 로 설정해서 사용한다.
>
> 따라서 인터페이스가 있어도 항상 CGLIB 를 사용해서 구체클래스 기반으로 프록시를 생성한다.

<br />

<br />

---

# 포인트컷, 어드바이스, 어드바이저 소개

- 포인트컷(pointcut) : 어디에 부가 기능을 적용할 지, 적용하지 않을 지 판단하는 필터링 로직이다. 주로 클래스와 메서드 이름으로 필터링 한다. 이름 그대로 어떤 포인트(point)에 기능을 적용할 지 하지 않을지 잘라서(cut) 구분하는 것이다.
- 어드바이스(advice) : 프록시가 호출하는 부가 기능이다. 프록시 로직이다.
- 어드바이저(advisior) : 하나의 포인트컷과 하나의 어드바이스를 가지고 있는 것이다.

> 쉽게 기억
>
> - 조언(Advice) 을 어디(Pointcut)에 할 것인가?
> - 조언자(Advisor) 는 조언(Advice)을 어디(Pointcut)에 해야할지 알고 있다.

> 역할과 책임
>
> 포인트컷, 어드바이스를 분리한 것은 역할과 책임을 명확하게 분리한 것이다.
>
> - 포인트컷은 대상 여부를 확인하는 필터 역할만 담당한다.
> - 어드바이스는 부가 기능을 로직만 담당한다.
> - 둘을 합쳐 어드바이저가 된다. 스프링 어드바이저는 하나의 포인트컷 + 하나의 어드바이스로 구성된다.

![](https://i.ibb.co/477WJ3X/2021-12-04-12-49-48.png)



## 예제1) 어드바이저 추가

```java
public class AdvisorTest {
    @Test
    void advisorTest1() {
      ServiceInterface target = new ServiceImpl();
      ProxyFactory proxyFactory = new ProxyFactory(target);
      DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(Pointcut.TRUE, new TimeAdvice());
      proxyFactory.addAdvisor(advisor);
      ServiceInterface proxy = (ServiceInterface) proxyFactory.getProxy();
      proxy.save();
      proxy.find();
    }
  }
```

결과

```shell
21:55:47.507 [Test worker] INFO co.wordbe.advanced.proxy.common.advice.TimeAdvice - TimeProxy 실행
21:55:47.510 [Test worker] INFO co.wordbe.advanced.proxy.common.service.ServiceImpl - save 호출
21:55:47.510 [Test worker] INFO co.wordbe.advanced.proxy.common.advice.TimeAdvice - TimeProxy 실행 완료. 실행 시간: 0
21:55:47.512 [Test worker] INFO co.wordbe.advanced.proxy.common.advice.TimeAdvice - TimeProxy 실행
21:55:47.512 [Test worker] INFO co.wordbe.advanced.proxy.common.service.ServiceImpl - find 호출
21:55:47.512 [Test worker] INFO co.wordbe.advanced.proxy.common.advice.TimeAdvice - TimeProxy 실행 완료. 실행 시간: 0
```

- `new DefaultPointcutAdvisor`  : `Advisor` 의 가장 일반적인 구현체이다. 생성자를 통해 하나의 어드바이저와 하나의 포인트컷을 넣어주면 된다.
- `Pointcut.TRUE` : 항상 true 를 반환하는 포인트컷
- `proxyFactory.addAdvice(new TimeAdvice())` 하면 어드바이스만 추가되는데, 실제로 소스를 들여다보면 `DefaultPointcutAdvisor(Pointcut.TRUE, new TimeAdvice())` 가 들어있게 된다.

<br />

<br />

## 예제2) 직접 포인트컷 만들기

이번에는 `save()` 메소드에는 어드바이스 로직을 적용하지만, `find()` 메소드에는 어드바이스를 적용하지 않도록 설정해보자. 어드바이스에 로직을 추가해서 메소드 이름을 보고 코드를 실행할 지 말지 분기를 타도된다. 하지만 어드바이스의 재사용이 떨어지게 되므로, 역할과 책임을 분리할 수 있도록 이런 기능에 특화된 포인트컷을 만들어보자.

우선, 스프링은 Pointcut 클래스를 제공한다.

```java
public interface Pointcut {

	/**
	 * Return the ClassFilter for this pointcut.
	 * @return the ClassFilter (never {@code null})
	 */
	ClassFilter getClassFilter();

	/**
	 * Return the MethodMatcher for this pointcut.
	 * @return the MethodMatcher (never {@code null})
	 */
	MethodMatcher getMethodMatcher();


	/**
	 * Canonical Pointcut instance that always matches.
	 */
	Pointcut TRUE = TruePointcut.INSTANCE;

}
```

```java
@FunctionalInterface
public interface ClassFilter {

	/**
	 * Should the pointcut apply to the given interface or target class?
	 * @param clazz the candidate target class
	 * @return whether the advice should apply to the given target class
	 */
	boolean matches(Class<?> clazz);
  ...
}
```

```java
public interface MethodMatcher {

	/**
	 * Perform static checking whether the given method matches.
	 * <p>If this returns {@code false} or if the {@link #isRuntime()}
	 * method returns {@code false}, no runtime check (i.e. no
	 * {@link #matches(java.lang.reflect.Method, Class, Object[])} call)
	 * will be made.
	 * @param method the candidate method
	 * @param targetClass the target class
	 * @return whether or not this method matches statically
	 */
	boolean matches(Method method, Class<?> targetClass);
	...
}
```

- 이름그대로 `ClassFilter` 는 클래스가 맞는지, `MethodMatcher` 는 메소드가 맞는지 판단하며, 둘 다 참이어야 어드바이스를 적용할 수 있다.

<br />

**직접 포인트컷 만들기**

```java
@Test
@DisplayName("직접 만든 포인트컷")
void advisorTest2() {
  ServiceInterface target = new ServiceImpl();
  ProxyFactory proxyFactory = new ProxyFactory(target);
  DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(new MyPointcut(), new TimeAdvice());
  proxyFactory.addAdvisor(advisor);
  ServiceInterface proxy = (ServiceInterface) proxyFactory.getProxy();
  proxy.save();
  proxy.find();
}

static class MyPointcut implements Pointcut {
  @Override
  public ClassFilter getClassFilter() {
    return ClassFilter.TRUE;
  }

  @Override
  public MethodMatcher getMethodMatcher() {
    return new MyMethodMatcher();
  }
}

static class MyMethodMatcher implements MethodMatcher {
  private String matchName = "save";

  @Override
  public boolean matches(Method method, Class<?> targetClass) {
    boolean result = matchName.equals(method.getName());
    log.info("포인컷 호출 method={} targetClass={}", method.getName(), targetClass);
    log.info("포인트컷 결과 result={}", result);
    return result;
  }

  @Override
  public boolean isRuntime() {
    return false;
  }

  @Override
  public boolean matches(Method method, Class<?> targetClass, Object... args) {
    return false;
  }
}
```

- 포인트컷을 직접 구현하기 위해서는 `Pointcut` 인터페이스를 구현한다.
- `matches()` 에 method, targetClass 정보가 넘어온다. 이 정보로 어드바이스를 적용할지 않을지 판단할 수 있다.
- `isRuntime()` 이 `true` 이면 밑의 `matches(... args)` 가 작동한다. 런타임에 동적으로 넘어오는 매개변수를 판단 로직으로 사용할 수 있다.
  - `isRuntime()` 이 `false` 이면 클래스의 정적 정보만 사용하기 때문에 스프링 내부에서 캐싱을 통해 성능 향상이 가능하다. 

![](https://i.ibb.co/mHFSP6y/2021-12-05-12-40-05.png)

![](https://i.ibb.co/dbC44r5/2021-12-05-12-40-34.png)

<br />

<br />

---

## 예제 3) 스프링이 제공하는 포인트컷

위에서 직접만든 포인트컷을 스프링이 제공하는 포인트컷으로 단 2줄 코딩만 했다.

```java
@Test
@DisplayName("스프링이 제공하는 포인트컷")
void advisorTest3() {
  ServiceInterface target = new ServiceImpl();
  ProxyFactory proxyFactory = new ProxyFactory(target);
  NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
  pointcut.setMappedName("save"); // 이름이 save 인 메소드만 포인트컷에 등록
  DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, new TimeAdvice());
  proxyFactory.addAdvisor(advisor);
  ServiceInterface proxy = (ServiceInterface) proxyFactory.getProxy();
  proxy.save();
  proxy.find();
}
```



### 스프링이 제공하는 포인트컷

- `NameMatchMethodPointcut` : 메서드이름 기반으로 매칭한다. 내부에서는 `PatternMatchUtils` 를 사용한다. 예) `*xxx*`를 허용한다.
- `JdkRegexpMethodPointcut` : JDK 정규표현식 기반으로 포인트컷을 매칭한다.
- `TruePointcut` : 항상 참 반환한다.
- `AnnotationMatchingPointcut` : 어노테이션으로 매칭한다.
- **`AspectJExpressionPointcut` : aspectJ 표현식으로 매칭한다.**
  - 실무에서는 사용하기도 편리하고 기능도 가장많은 aspectJ 표현식 기반 포인트컷을 많이 사용하게 된다.

<br />

---

## 예제 4) 여러 어드바이저 함께 적용

어드바이저는 하나의 포인트컷과 하나의 어드바이스를 가지고 있다.

여러 어드바이저를 하나의 target 에 적용하려면 어떻게 해야할까? 다시 말해서 하나의 target 에 여러 어드바이스를 적용하려면 어떻게 해야 할까?



### 여러 프록시

```java
public class MultiAdvisorTest {
  @Test
  @DisplayName("여러 프록시")
  void multiAdvisorTest1() {
    // client -> proxy2(advisor2) -> proxy1(advisor1) -> target

    // 프록시1 생성
    ServiceInterface target = new ServiceImpl();
    ProxyFactory proxyFactory1 = new ProxyFactory(target);
    DefaultPointcutAdvisor advisor1 = new DefaultPointcutAdvisor(Pointcut.TRUE, new Advice1());
    proxyFactory1.addAdvisor(advisor1);
    ServiceInterface proxy1 = (ServiceInterface) proxyFactory1.getProxy();

    // 프록시2 생성, target -> proxy1 입력
    ProxyFactory proxyFactory2 = new ProxyFactory(proxy1);
    DefaultPointcutAdvisor advisor2 = new DefaultPointcutAdvisor(Pointcut.TRUE, new Advice2());
    proxyFactory2.addAdvisor(advisor2);
    ServiceInterface proxy2 = (ServiceInterface) proxyFactory2.getProxy();

    // 실행
    proxy2.save();
  }

  @Slf4j
  static class Advice1 implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
      log.info("advice1 호출");
      return invocation.proceed();
    }
  }

  @Slf4j
  static class Advice2 implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
      log.info("advice2 호출");
      return invocation.proceed();
    }
  }
}
```

```shell
02:25:19.007 [Test worker] INFO co.wordbe.advanced.proxy.advisor.MultiAdvisorTest$Advice2 - advice2 호출
02:25:19.010 [Test worker] INFO co.wordbe.advanced.proxy.advisor.MultiAdvisorTest$Advice1 - advice1 호출
02:25:19.010 [Test worker] INFO co.wordbe.advanced.proxy.common.service.ServiceImpl - save 호출
```

잘 실행된다 하지만,

여러 프록시의 문제 : 프록시를 여러번 생성해야 한다.



### 하나의 프록시, 여러 어드바이저

스프링은 위 문제를 해결하기 위해 하나의 프록시에 여러 어드바이저를 적용할 수 있게 만들어준다.

```java
@Test
@DisplayName("하나의 프록시, 여러어드바이저")
void multiAdvisorTest2() {
  // client -> proxy -> advisor2 -> advisor1 -> target

  DefaultPointcutAdvisor advisor1 = new DefaultPointcutAdvisor(Pointcut.TRUE, new Advice1());
  DefaultPointcutAdvisor advisor2 = new DefaultPointcutAdvisor(Pointcut.TRUE, new Advice2());

  // 프록시 생성
  ServiceInterface target = new ServiceImpl();
  ProxyFactory proxyFactory1 = new ProxyFactory(target);
  proxyFactory1.addAdvisor(advisor2);
  proxyFactory1.addAdvisor(advisor1);
  ServiceInterface proxy = (ServiceInterface) proxyFactory1.getProxy();

  // 실행
  proxy.save();
}
```

- 프록시 팩토리로 원하는 만큼 `addAdvisor()` 로 어드바이저를 등록할 수 있다.
- 등록하는 순서대로 어드바이저가 호출된다.

결과적으로 여러 프록시를 사용할 때와 비교해서 결과는 같고, 성능은 더 좋다.

> **중요 - 하나의 타겟에 여러 AOP가 동시에 적용되더라도, 스프링의 AOP는 타겟마다 하나의 프록시만 생성한다.**
>
> 스프링 AOP 를 처음 공부하거나 사용하면, AOP 적용 수 만큼 프록시가 생성된다고 착각하게 된다. (아니다)
>
> 스프링은 AOP를 적용할 때, 최적화를 진행해서 지금처럼 프록시는 하나만 만들고, 하나의 프록시에 여러 어드바이저를 적용한다.

<br />

<br />

---

# 프록시 팩토리 - 애플리케이션에 적용

먼저 인터페이스가 있는 v1 애플리케이션에 `LogTrace` 기능을 프록시 팩토리를 통해 프록시를 만들어서 적용해보자.

- 어드바이스 생성

```java
public class LogTraceAdvice implements MethodInterceptor {
  private final LogTrace logTrace;

  public LogTraceAdvice(LogTrace logTrace) {
    this.logTrace = logTrace;
  }


  @Override
  public Object invoke(MethodInvocation invocation) throws Throwable {
    TraceStatus status = null;
    try {
      Method method = invocation.getMethod();
      String message = method.getDeclaringClass().getSimpleName() + "." + method.getName() + "()";
      status = logTrace.begin(message);

      // 로직 호출
      Object result = invocation.proceed();

      logTrace.end(status);
      return result;
    } catch (Exception e) {
      logTrace.exception(status, e);
      throw e;
    }
  }
}
```

```java
@Slf4j
@Configuration
public class ProxyFactoryConfigV1 {

  @Bean
  public OrderControllerV1 orderControllerV1(LogTrace logTrace) {
    OrderControllerV1Impl orderController = new OrderControllerV1Impl(orderServiceV1(logTrace));
    ProxyFactory factory = new ProxyFactory(orderController);
    factory.addAdvisor(getAdvisor(logTrace));
    OrderControllerV1 proxy = (OrderControllerV1) factory.getProxy();
    log.info("ProxyFactory proxy={}, target={}", proxy.getClass(), orderController.getClass());
    return proxy;
  }

  @Bean
  public OrderServiceV1 orderServiceV1(LogTrace logTrace) {
    OrderServiceV1Impl orderService = new OrderServiceV1Impl(orderRepository(logTrace));
    ProxyFactory factory = new ProxyFactory(orderService);
    factory.addAdvisor(getAdvisor(logTrace));
    OrderServiceV1 proxy = (OrderServiceV1) factory.getProxy();
    log.info("ProxyFactory proxy={}, target={}", proxy.getClass(), orderService.getClass());
    return proxy;
  }

  @Bean
  public OrderRepositoryV1 orderRepository(LogTrace logTrace) {
    OrderRepositoryV1Impl orderRepository = new OrderRepositoryV1Impl();

    ProxyFactory factory = new ProxyFactory(orderRepository);
    factory.addAdvisor(getAdvisor(logTrace));
    OrderRepositoryV1 proxy = (OrderRepositoryV1) factory.getProxy();
    log.info("ProxyFactory proxy={}, target={}", proxy.getClass(), orderRepository.getClass());
    return proxy;
  }

  private Advisor getAdvisor(LogTrace logTrace) {
    // pointcut
    NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
    pointcut.setMappedNames("order*", "orderItem*", "save*");
    // advice
    LogTraceAdvice advice = new LogTraceAdvice(logTrace);
    return new DefaultPointcutAdvisor(pointcut, advice);
  }
}
```



```shell
2021-12-05 03:04:58.660  INFO 75096 --- [           main] c.w.a.c.v.ProxyFactoryConfigV1           : ProxyFactory proxy=class com.sun.proxy.$Proxy50, target=class co.wordbe.advanced.app.proxy.v1.OrderRepositoryV1Impl
2021-12-05 03:04:58.663  INFO 75096 --- [           main] c.w.a.c.v.ProxyFactoryConfigV1           : ProxyFactory proxy=class com.sun.proxy.$Proxy52, target=class co.wordbe.advanced.app.proxy.v1.OrderServiceV1Impl
2021-12-05 03:04:58.665  INFO 75096 --- [           main] c.w.a.c.v.ProxyFactoryConfigV1           : ProxyFactory proxy=class com.sun.proxy.$Proxy53, target=class co.wordbe.advanced.app.proxy.v1.OrderControllerV1Impl
```

V1 애플리케이션은 인터페이스가 있어서 JDK 동적프록시가 생성된다.

<br />



```java
@Slf4j
@Configuration
public class ProxyFactoryConfigV2 {

  @Bean
  public OrderControllerV2 orderControllerV2(LogTrace logTrace) {
    OrderControllerV2 orderController = new OrderControllerV2(orderServiceV2(logTrace));
    ProxyFactory factory = new ProxyFactory(orderController);
    factory.addAdvisor(getAdvisor(logTrace));
    OrderControllerV2 proxy = (OrderControllerV2) factory.getProxy();
    log.info("ProxyFactory proxy={}, target={}", proxy.getClass(), orderController.getClass());
    return proxy;
  }

  @Bean
  public OrderServiceV2 orderServiceV2(LogTrace logTrace) {
    OrderServiceV2 orderService = new OrderServiceV2(orderRepository(logTrace));
    ProxyFactory factory = new ProxyFactory(orderService);
    factory.addAdvisor(getAdvisor(logTrace));
    OrderServiceV2 proxy = (OrderServiceV2) factory.getProxy();
    log.info("ProxyFactory proxy={}, target={}", proxy.getClass(), orderService.getClass());
    return proxy;
  }

  @Bean
  public OrderRepositoryV2 orderRepository(LogTrace logTrace) {
    OrderRepositoryV2 orderRepository = new OrderRepositoryV2();

    ProxyFactory factory = new ProxyFactory(orderRepository);
    factory.addAdvisor(getAdvisor(logTrace));
    OrderRepositoryV2 proxy = (OrderRepositoryV2) factory.getProxy();
    log.info("ProxyFactory proxy={}, target={}", proxy.getClass(), orderRepository.getClass());
    return proxy;
  }

  private Advisor getAdvisor(LogTrace logTrace) {
    // pointcut
    NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
    pointcut.setMappedNames("order*", "orderItem*", "save*");
    // advice
    LogTraceAdvice advice = new LogTraceAdvice(logTrace);
    return new DefaultPointcutAdvisor(pointcut, advice);
  }
}
```



V2 애플리케이션은 인터페이스가 없고 구체 클래스만 있기 때문에 프록시 팩토리가 CGLIB 를 적용한다. 애플리케이션 로딩 로그를 통해 CGLIB 프록시가 적용된 것을 확인할 수 있다.

```shell
2021-12-05 03:01:32.044  INFO 74828 --- [           main] c.w.a.c.v.ProxyFactoryConfigV2           : ProxyFactory proxy=class co.wordbe.advanced.app.proxy.v2.OrderRepositoryV2$$EnhancerBySpringCGLIB$$fc928bc7, target=class co.wordbe.advanced.app.proxy.v2.OrderRepositoryV2
2021-12-05 03:01:32.049  INFO 74828 --- [           main] c.w.a.c.v.ProxyFactoryConfigV2           : ProxyFactory proxy=class co.wordbe.advanced.app.proxy.v2.OrderServiceV2$$EnhancerBySpringCGLIB$$19401624, target=class co.wordbe.advanced.app.proxy.v2.OrderServiceV2
2021-12-05 03:01:32.053  INFO 74828 --- [           main] c.w.a.c.v.ProxyFactoryConfigV2           : ProxyFactory proxy=class co.wordbe.advanced.app.proxy.v2.OrderControllerV2$$EnhancerBySpringCGLIB$$fe99b27d, target=class co.wordbe.advanced.app.proxy.v2.OrderControllerV2
```

<br />

## 정리

프록시팩토리 덕분에 개발자는 매우 편하게 프록시를 생성할 수 있게 되었다. 추가로 어드바이저, 어드바이스, 포인트컷이라는 개념덕분에 부가기능을 어디에 적용할지 명확하게 이해할 수 있었다.

### 남은 문제 - 빈후처리기로 해결

- 원본 코드를 전혀 손대지 않고도 프록시를 통해 부가 기능(advice)을 적절한 곳(pointcut)에 적용할 수 있었다.
- **문제1 - 너무 많은 설정**
  - `ProxyFactoryConfigV1`, `ProxyFactoryConfigV2` 같은 설정 파일이 지나치게 많다.
  - 스프링 빈이 100개 있는데 여기에 프록시를 통해 부가기능을 적용할며녀 100개의 동적 프록시 생성 코드를 만들어야 한다! 무수히 많은 설정 파일 때문에 설정 지옥을 경험하게 될 것이다.
  - 최근에는 스프링 빈을 등록하기 귀찮아서 컴포넌트 스캔까지 사용하는데, 이렇게 직접 등록하는 것도 모자라서 프록시를 적용하는 코드까지 빈 생성 코드에 넣어야 한다.
- **문제2 - 컴포넌트 스캔**
  - 애플리케이션 V3 처럼 컴포넌트 스캔을 사용하는 경우 지금까지 학습한 방법으로는 프록시 적용이 불가능하다.
  - 프록시 대신 실제 객체를 컴포넌트 스캔으로 스프링 컨테이너에 스프릥 빈으로 등록을 다 해버린 상태이기 때문이다.
- 이 두 가지 문제를 해결하기 위해 **빈 후처리기** 기술을 사용한다.
