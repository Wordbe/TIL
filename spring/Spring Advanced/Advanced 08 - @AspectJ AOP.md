# Advanced 08 - @AspectJ AOP



# @Aspect 로 프록시 적용

스프링 애플리케이션에 프록시를 적용하려면 어드바이저 (포인트컷 + 어드바이스) 를 빈으로 등록하면 된다. 그러면 AOP 라이브러리의 자동프록시생성기가 빈으로 등록된 어드바이저를 감지하여 포인트컷으로 필터링하여 스프링 빈에 자동으로 프록시를 등록해준다.

스프링은 `@AspectJ` 어노테이션으로 매우 편리하게 어드바이저 생성 기능을 지원한다.

> `@AspectJ` 는 AOP (관점 지향 프로그래밍) 을 가능하게 하는 AspectJ 프로젝에서 제공하는 어노테이션이다. 스프링은 이것을 차용해서 프록시를 통한 AOP 를 가능하게 한다. 

<br />

```java
@Slf4j
@Aspect
public class LogTraceAspect {
  private final LogTrace logTrace;

  public LogTraceAspect(LogTrace logTrace) {
    this.logTrace = logTrace;
  }

  @Around("execution(* co.wordbe.advanced.app.proxy..*(..))")
  public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
    TraceStatus status = null;

    log.info("target={}", joinPoint.getTarget()); // 실제 호출 대상
    log.info("getArgs={}", joinPoint.getArgs()); // 전달 인자
    log.info("getSignature={}", joinPoint.getSignature()); // joint point 시그니처

    try {
      String message = joinPoint.getSignature().toShortString();
      status = logTrace.begin(message);

      // 로직 호출
      Object result = joinPoint.proceed();

      logTrace.end(status);
      return result;
    } catch (Exception e) {
      logTrace.exception(status, e);
      throw e;
    }
  }
}
```

- `@Aspect` : 어노테이션 기반 프록시를 적용할 때 필요하다.
- `@Around` : 포인트컷 표현식을 넣는다. AspectJ 표현식을 사용한다. `@Around` 의 메서드는 어드바이스(Advice)가 된다.
- `ProceedingJoinPoint` : 어드바이스에서 살펴본 `MethodInvocation invocation` 과 유사한 기능이다. 내부에 실제 호출 대상, 전달 인자, 그리고 어떤 객체와 어떤 메서드가 호출되었는지 정보가 포함되어 있다.
- `joinPoint.proceed()` : 실제 호출 대상(`target`) 을 호출한다.

<br />

---

# @Aspect 프록시 설명

자동프록시 생성기(`AnnotationAwareAutoProxyCreator`) 는 `Advisor` 를 자동으로 찾아와서 필요한 곳에 프록시를 생성하고 적용해준다. 

자동프록시 생성기는 여기에 추가로 하나의 역할을 더한다. `@Aspect` 를 찾아서 `Advisor` 로 만들어주는 것이다. 그래서 앞에 `AnnotationAware` (어노테이션을 인식하는) 가 붙어 있는 것이다.

```java
@Slf4j
@Aspect
public class LogTraceAspect {
    private final LogTrace logTrace;

    public LogTraceAspect(LogTrace logTrace) {
        this.logTrace = logTrace;
    }

    @Around("execution(* co.wordbe.advanced.app.proxy..*(..))") // 포인트컷(Pointcut)
    public Object execute(ProceedingJoinPoint joinPoint) throws Throwable { // 어드바이스(Advice)
			// Advice 로직 ...
```

- 자동 프록시 생성기는 2가지 일을 한다.
  1. `@Aspect` 를 보고 Advisor 로 변환해서 저장한다.
  2. 어드바이저를 기반으로 프록시를 생성한다.

<br />

### 1. `@Aspect` 를 어드바이저로 변환해서 저장하는 과정

![](https://i.ibb.co/t3j7mt8/2021-12-06-12-24-10.png)

- 1 실행 : 스프링 애플리케이션 로딩 시점에 자동프록시 생성기를 호출한다.
- 2 모든 `@Aspect` 빈 조회 : 자동프록시생성기는 스프링 컨테이너에서 `@Aspect` 가 붙은 스프링 빈을 모두 조회한다.
- 3 어드바이저 생성 : `@Aspect` 어드바이저 빌더를 통해 `@Aspect` 어노테이션 정보 기반으로 어드바이저를 생성한다.
  - 4 어드바이저 저장 : 생성한 어드바이저를 `@Aspect` 어드바이저 빌더 내부에 저장한다.

> `@Aspect 어드바이저 빌더`
>
> - `BeanFactoryAspectJAdvisorBuilder` 클래스이다. `@Aspect` 정보 기반으로 포인트컷, 어드바이스, 어드바이저를 생성하고 보관하는 것을 담당한다. `@Aspect` 어드바이저 빌더 내부 저장소에 어드바이저를 캐시하여, 이미 만들어져 있는 경우 캐시에 저장된 어드바이저를 반환한다.

<br />

### 2. 어드바이저를 기반으로 프록시를 생성

![](https://i.ibb.co/vq65rhY/2021-12-06-12-31-46.png)

자동프록시 생성기의 작동 과정

- 1 생성 : 스프링 빈 대상이 되는 객체를 생성한다. (`@Bean`, 컴포넌트 스캔을 모두 포함)
- 2 전달 : 생성된 객체를 빈 저장소에 등록하기 직전에 빈 후처리기에 전달한다.
- 3-1 Advisor 빈 조회 : 스프링 컨테이너에서 `Advisor` 빈을 모두 조회한다.
- 3-2 `@Aspect` Advisor 조회 : `@Aspect` 어드바이저 빌더 내부에 저장된 `Advisor`를 모두 조회한다.
- 4 프록시 적용 대상 확인 : 조회한 `Advisor` 에 포함되어 있는 포인트컷을 사용해서 해당 객체의 프록시를 생성할 것인지 판단한다. 
  - 객체의 클래스 정보는 물론이고, 해당 객체의 모든 메서드를 포인트것에 하나하나 모두 매칭해본다. 조건이 하나라도 만족하면 프록시 적용 대상이 된다. 예를 들어 메서드 하나만 포인트컷 조건에 만족해도 프록시 적용 대상이 된다. 
- 5 프록시 생성 : 프록시 적용 대상이면 프록시를 생성하고 반환한다. 그렇지 않으면 원본 객체를 반환한다.
- 6 빈 등록 : 반환된 객체는 스프링 빈으로 등록된다.

<br />

## @Aspect 정리 - 횡단 관심사 문제 해결 : AOP

![](https://i.ibb.co/6t6NYnY/2021-12-06-12-38-16.png)

- 실무에서 프록시를 적용할 떄 대부분 `@Aspect` 를 사용하여 어드바이저를 등록한다.
- 로그를 남기는 등의 기능은 특정 모듈 하나에 관심이 있는 기능이 아니다. 애플리케이션의 여러 기능들 사이에 걸쳐 들어가는 관심사이다.
- 이를 ***횡단 관심사(Cross-cutting concerns)*** 라고 한다.



