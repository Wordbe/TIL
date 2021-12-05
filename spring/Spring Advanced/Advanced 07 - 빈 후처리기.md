# Advanced 07 - 빈 후처리기



# 빈후처리기 BeanPostProcessor

스프링이 빈 저장소에 등록할 목적으로 생성한 객체를 빈 저장소에 등하기 직전에 조작하고 싶다면, 빈 후처리기를 사용하면 된다. 

객체를 조작할 수도 있고, 완전히 다른 객체로 바꿔치기하는 것도 가능하다.

![](https://i.ibb.co/7NCG1kQ/2021-12-05-5-53-45.png)

![](https://i.ibb.co/tsYJGTj/2021-12-05-5-54-20.png)

이처럼 빈포스트프로세서는 중간에 hooking 하는 역할을 한다.



## 일반적인 스프링 빈 등록과정

예제)

```java
public class BasicTest {
  @Test
  void basicConfig() {
    ApplicationContext context = new AnnotationConfigApplicationContext(BasicConfig.class);

    // A는 빈으로 등록된다.
    A a = context.getBean("beanA", A.class);
    a.helloA();

    // B는 빈으로 등록되지 않는다.
    //        B b = context.getBean("beanB", B.class);
    Assertions.assertThrows(NoSuchBeanDefinitionException.class, () -> context.getBean("beanB", B.class));
  }

  @Slf4j
  @Configuration
  static class BasicConfig {
    @Bean(name = "beanA")
    public A a() {
      return new A();
    }
  }

  @Slf4j
  static class A {
    public void helloA() {
      log.info("hello A");
    }
  }

  @Slf4j
  static class B {
    public void helloB() {
      log.info("hello B");
    }
  }
}
```

<br />

## 빈 후처리기로 빈 바꿔치기 예제

**BeanPostProcessor** 인터페이스 - 스프링이 제공

```java
public interface BeanPostProcessor {
  
	@Nullable
	default Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}
  
	@Nullable
	default Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

}
```

- 빈 후처리기를 사용하려면 `BeanPostProcessor` 를 구현하고 스프링 빈으로 등록해주면 된다.
- `postProcessBeforeInitialization` : 객체 생성 이후에 `@PostConstructor` 같은 초기화가 발생하기 전에 호출됨.
- `postProcessAfterInitialization` : 객체 생성 이후에 `@PostConstructor` 같은 초기화가 발생한 다음에 호출됨.

<br />

> 정리
>
> 빈후처리기는 빈을 조작하고 변경할 수 있는 후킹 포인트이다.
>
> 조작한다는 것은 해당 객체의 특정 메소드를 호출한다는 것이다.
>
> 일반적으로 스프링 컨테이너가 관리하는, 특히 컴포넌트 스캔으로 등록되는 빈은 중간에 조작할 방법이 없었는데, 빈 후처리기를 사용하면 개발자가 등록하는 모든 빈을 중간에서 변경할 수 있다. **이 말은 빈 객체를 프록시로 교체하는 것도 가능하다는 것이다.**



> 참고 - `@PostConstruct` 의 비밀
>
> `@PostConruct` 는 스프링 빈 생성 이후에 빈을 초기화하는 역할을 한다. 빈의 초기화라는 것은 단순히 `@PostConstruct` 가 붙은 초기화 메서드를 한 번 호출해주면 되는 것이다. 다시 말하면 생성된 빈을 조작하는 것이다. 따라서 빈을 조작하는 적절한 빈후처리기가 있으면 되는 것이다.
>
> 스프링은 `CommonAnnotationBeanPostProcessor` 라는 빈 후처리기를 자동으로 등록하는데, 여기이세 `@PostConstruct` 라는 어노테이션이 붙은 메서드를 호출한다. 스프링도 스프링 내부의 기능을 확장하기 위해서 빈 후처리기를 사용하고 있는 것이다.

<br />

---

## 빈 후처리기로 실제 객체 대신 프록시 빈 등록

수동으로 등록하는 빈, 컴포넌트 스캔으로 등록되는 빈까지 모두 프록시를 적용할 수 있다.

이를 통해 설정 파일에 있는 수 많은 프록시 생성 코드를 제거할 수 있는 장점이 있다.

![](https://i.ibb.co/B4dNn38/2021-12-05-6-42-25.png)



- 이제 프록시를 생성하는 코드가 설정 파일에는 필요 없다. 순수한 빈 등록만 고민하면 된다. 프록시를 생성하고 프록시를 스프링 빈으로 등록하는 것은 빈 후처리기가 모두 처리해준다.

```shell
# V1 : 인터페이스가 있으므로 JDK 동적 프록시 생성
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v1.OrderRepositoryV1Impl, proxyClass=class com.sun.proxy.$Proxy50
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v1.OrderServiceV1Impl, proxyClass=class com.sun.proxy.$Proxy51
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v1.OrderControllerV1Impl, proxyClass=class com.sun.proxy.$Proxy52

# V2 : 구체 클래스만 있으므로 CGLIB 프록시가 적용
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v2.OrderRepositoryV2, proxyClass=class co.wordbe.advanced.app.proxy.v2.OrderRepositoryV2$$EnhancerBySpringCGLIB$$2c8424c2
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v2.OrderServiceV2, proxyClass=class co.wordbe.advanced.app.proxy.v2.OrderServiceV2$$EnhancerBySpringCGLIB$$4931af1f
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v2.OrderControllerV2, proxyClass=class co.wordbe.advanced.app.proxy.v2.OrderControllerV2$$EnhancerBySpringCGLIB$$2e8b4b78
  
# V3 : 구체 클래스만 있으므로 CGLIB 프록시가 적용
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v3.OrderRepositoryV3, proxyClass=class co.wordbe.advanced.app.proxy.v3.OrderRepositoryV3$$EnhancerBySpringCGLIB$$3a657348
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v3.OrderServiceV3, proxyClass=class co.wordbe.advanced.app.proxy.v3.OrderServiceV3$$EnhancerBySpringCGLIB$$5d90f4bf
프록시 생성 targetClass=class co.wordbe.advanced.app.proxy.v3.OrderControllerV3, proxyClass=class co.wordbe.advanced.app.proxy.v3.OrderControllerV3$$EnhancerBySpringCGLIB$$3c6c99fe
```

- 애플리케이션 실행 로그를 보면 알겠지만, 빈후처리기에 스프링 컨테이너에 등록된 모든 빈이 들어온다. 따라서 어떤 빈을 프록시를 만들 것인지 기준이 중요한데, 여기서는 간단히 base package 를 정해 이 안에 있는 클래스 들만 프록시를 등록하도록 만들어 두었다.

> 참고
>
> 스프링 빈 들 중에서는 프록시로 만들 수 없는 빈도 존재한다. 따라서 모든 빈을 프록시로 만들면 오류가 난다.



> 중요
>
> 프록시의 적용 대상 여부를 여기서는 간단히 패키지 기준으로 설정했다. 
>
> 잘 생각해보면 포인트컷을 사용하면 더 깔끔할 것 같다.
>
> 포인트컷은 이미 클래스, 메서드 단위의 필터 기능을 가지고 있기 때문에, 프록시 적용 대상 여부를 정밀하게 설정할 수 있다.
>
> 참고로 어드바이저는 포인트컷을 가지고 있다. 따라서 어드바이저를 통해 포인트컷을 확인할 수 있다.
>
> - 스프링 AOP는 포인트컷을 사용해서 프록시 적용 대상 여부를 체크한다.
>
> **결과적으로 포인트컷은 다음 두 곳에서 사용된다.**
>
> 1. **프록시 적용 대상 여부를 체크해서 꼭 필요한 곳에만 프록시를 적용한다. (빈 후처리기 - 자동 프록시 생성)**
> 2. **프록시의 어떤 메서드가 호출 되었을 때 어드바이스를 적용할 지 판단한다. (프록시 내부)**

<br />

<br />

---

# 스프링이 제공하는 빈 후처리기

## 의존성 추가

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-aop'
}
```

- 이 라이브러리를 추가하면 `aspectjweaver` 라는 `aspectJ` 관련 라이브러리를 등록하고, 스프링 부트가 AOP 관련 클래스를 자동으로 스프링 빈에 등록한다.
- 스프링 부트가 없던 시절에는 `@EnableAspectJAutoProxy` 를 추가해주어야 했는데, 이부분을 스프링 부트가 자동으로 처리해준다. 스프링 부트가 활성화하는 빈은 `AopAutoConfiguration` 을 참고하자.

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(prefix = "spring.aop", name = "auto", havingValue = "true", matchIfMissing = true)
public class AopAutoConfiguration {

	@Configuration(proxyBeanMethods = false)
	@ConditionalOnClass(Advice.class)
	static class AspectJAutoProxyingConfiguration {

    @Configuration(proxyBeanMethods = false)
    @EnableAspectJAutoProxy(proxyTargetClass = false)
    @ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "false")
    static class JdkDynamicAutoProxyConfiguration {

    }

    @Configuration(proxyBeanMethods = false)
    @EnableAspectJAutoProxy(proxyTargetClass = true)
    @ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "true",
                           matchIfMissing = true)
    static class CglibAutoProxyConfiguration {

    }

  }

  @Configuration(proxyBeanMethods = false)
  @ConditionalOnMissingClass("org.aspectj.weaver.Advice")
  @ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "true",
                         matchIfMissing = true)
  static class ClassProxyingConfiguration {

    @Bean
    static BeanFactoryPostProcessor forceAutoProxyCreatorToUseClassProxying() {
      return (beanFactory) -> {
        if (beanFactory instanceof BeanDefinitionRegistry) {
          BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
          AopConfigUtils.registerAutoProxyCreatorIfNecessary(registry);
          AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
        }
      };
    }

  
}
```



## 자동 프록시 생성기 - AutoProxyCreator

- 앞에 이야기한 스프링 부트 자동 설정으로 `AnnotationAwareAspectJAutoProxyCreator` 라는 빈후처리기가 스프링 빈에 등록된다. 
- 자동으로 프록시를 생성해주는 빈 후처리기다.
- 스프링 빈으로 등록된 `Advisor` 를 자동으로 찾아서 프록시가 필요한 곳에 자동으로 프록시를 적용해준다.
- `Advisor` 안에는 `Advice` 와 `Pointcut` 이 있다. 따라서 어드바이저만 알고 있으면 그 안에 있는 포인트컷으로 어떤 스프링 빈에 적용해야 할지 알 수 있다. 그리고 어드바이스로 부가기능을 적용하면 된다.

> `AnnotationAwareAspectJAutoProxyCreator` 는 `@AspectJ` 와 관련된 AOP 기능도 자동으로 찾아서 처리해준다. `Advisor` 는 물론이고, `@AspectJ` 도 자동으로 인식해서 프록시를 만들고 AOP를 적용해준다. 

<br />

위 의존성을 추가하고 **아래처럼 어드바이스를 빈으로만 등록해주면 자동프록시 생성기가 '포인트컷' 정보를 파악하여 자동으로 프록시를 생성해준다.**

```java
@Configuration
@Import({AppV1Config.class, AppV2Config.class})
public class AutoProxyConfig {

  @Bean
  public Advisor advisor1(LogTrace logTrace) {
    // pointcut
    NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
    pointcut.setMappedNames("order*", "orderItem*", "save*");
    // advice
    LogTraceAdvice advice = new LogTraceAdvice(logTrace);
    return new DefaultPointcutAdvisor(pointcut, advice);
  }
}
```



### 자동프록시 생성기의 작동과정

1. 생성 : 스프링 빈 대상이 되는 객체를 생성한다. (`@Bean`, 컴포넌트 스캔을 모두 포함한다.)
2. 전달 : 생성된 객체를 빈 저장소에 등록하기 직전에 빈 후처리기에 전달한다.
3. 모든 advisors 빈 조회 : 빈후처리기는 스프링 컨테이너에서 모든 `Advisor` 를 조회한다.
4. 프록시 적용 대상 체크 : `Advisor` 에 포함되어 있는 포인트컷을 사용해서 객체가 프록시를 적용할 대상인지 아닌지 판단한다. 객체의 클래스정보와 모든 메소드를 포인트컷에 하나하나 비교해본다. 조건이 하나라도 만족하면 프록시 대상이 된다. 
5. 프록시 생성 : 프록시 적용 대상이면 프록시를 생성하고 반환해서 프록시를 빈으로 등록한다. 만약 적용 대상이라 아니면 원본 객체를 그대로 리턴해 그대로 빈으로 등록한다.
6. 빈 등록 : 반환된 객체는 스프링 빈으로 등록된다.

>포인트컷은 2가지에 사용된다.
>
>1. 프록시 적용 여부 판단 - (빈후처리기에서 빈 생성단계에서)
>2. 어드바이스 적용 여부 판단 - (실제 프록시가 호출되었을 때 사용단계에서)
>
>프록시를 모든 객체에 생성하는 것은 비용 낭비이다. 꼭 필요한 곳에 최소한의 프록시를 생성해야 한다. 자동 프록시 생성기는 모든 스프링 빈의 프록시를 생성하는 것이 아니라 포인트으로 한번 필터링해서 어드바이스가 사용될 가능성이 있는 곳에만 프록시를 생성한다.



---

## 정밀한 포인트컷

단순히 메소드 이름으로만 프록시 대상 객체를 매칭하면, 스프링 내부에서 사용하는 메소드의 이름과 겹칠 때 그 객체들도 모두 불필요하게 프록시가 생성되어 버린다. 

따라서 패키지에 메서드 이름까지 함께 지정할 수 있는 매우 정밀한 포인트컷이 필요하다.

### `AspectJExpressionPointcut`

- AspectJ 라는 AOP에 특화된 포인트컷 표현식을 적용할 수 있다. 

```java
@Configuration
@Import({AppV1Config.class, AppV2Config.class})
public class AutoProxyConfig {

//    @Bean // 등록 안함
    public Advisor advisor1(LogTrace logTrace) {
        // pointcut
        NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
        pointcut.setMappedNames("order*", "orderItem*", "save*");
        // advice
        LogTraceAdvice advice = new LogTraceAdvice(logTrace);
        return new DefaultPointcutAdvisor(pointcut, advice);
    }

    @Bean
    public Advisor advisor2(LogTrace logTrace) {
        // pointcut
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        pointcut.setExpression("execution(* co.wordbe.advanced.app.proxy..*(..))");
        // advice
        LogTraceAdvice advice = new LogTraceAdvice(logTrace);
        return new DefaultPointcutAdvisor(pointcut, advice);
    }
}
```

- `advisor1` 도 같이 등록하면 advisor1 과 advisor2 어드바이저가 중복적용된다.
- AspectJ 표현식
  - `*` : 모든 반환 타입
  - `co.wordbe.advanced.app.proxy..` : 해당 패키지와 그 하위 패키지
  - `*(..)` : `*` 는 모든 메소드이름, `(..)` 는 모든 파라미터

```java
@Bean
public Advisor advisor3(LogTrace logTrace) {
  // pointcut
  AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
  pointcut.setExpression("execution(* co.wordbe.advanced.app.proxy..*(..)) && !execution(* co.wordbe.advanced.app.proxy..noLog(..))");
  // advice
  LogTraceAdvice advice = new LogTraceAdvice(logTrace);
  return new DefaultPointcutAdvisor(pointcut, advice);
}
```

- noLog() 메소드는 포함하지 않도록 변경

<br />

---

## 하나의 프록시에 여러 Advisor 적용

### 프록시 자동생성기 상황별 정리

advisor1, advisor2 둘 다 빈으로 등록했을 경우

- advisor1 의 포인트컷만 만족 : 프록시 1개 생성, 프록시에 advisor1 만 포함
- advisor1, advisor2 의 포인트컷 둘다 만족 : 프록시 1개 생성, 프록시에 advisor1, advisor2 둘다 포함
- advisor1, advisor2 의 포인트컷 둘다 만족하지 않음 : 프록시를 생성하지 않음

![](https://i.ibb.co/4ph8dsh/2021-12-05-9-43-57.png)





















