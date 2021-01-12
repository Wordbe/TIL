# Spring core 009 - AOP



Aspect-oriented Programming, 관점지향 프로그래밍



흩어진 관심사(Crosscutting concerns) 를 유기적으로 연결되도록 프로그래밍하는 것이다. 코드면에서는 중복된 코드가 제거되어 효율적이고, 비즈니스적으로는 관련된 업무가 연결되어 쉽게 통제가 가능할 것이다. 



여러 프로그래밍언어에서 AOP 구현체(implementation)가 있는데 java에서는 AspectJ 가 널리 쓰인다. 스프링에서는 스프링 AOP를 사용한다. 스프링 AOP는 AspectJ 보다 제한적인 기능을 제공한다.





**개념, 용어**

- `Aspect` : 기존 클래스들의 유기적 관계를 재정리할 새로운 관점 클래스들을 말한다. 한 관점은 하나의 모듈이 되는데 이 안에 advice와 pointcut 이 포함된다.
- `Advice` : Aspect가 해야할 일 들을 말한다.
- `Pointcut` : Aspect가 어디에 적용되야 하는지를 말한다. 특정 조건에서 특정 Joint point에 실행되어야 한다는 명세이다.
- `Target` : 타겟은 기존 클래스를 말한다. 적용이 되는 대상 클래스이다.
- `Joint point` : 주로 메소드 실행 시점이 조인포인트(합류점)가 된다. 생성자 호출 직전, 필드 접근 전, 필드에서 값을 가져갔을 때 등 여러 지점들이 있다.



AOP 를 적용하는 다양한 방법이 있다. 컴파일방법, 로드 타임 위빙 방법, 런타임 적용 방법이 있는데, Spring AOP는 런타임에서 AOP가 적용된다. 컴파일이나 런타임 적용 방법은 AspecJ에서 지원한다.





---

## 스프링 AOP

프록시 기반의 AOP 구현체이고, 스프링 빈에만 AOP를 적용할 수 있다.

프록시 패턴이란 기존 코드의 변경 없이 접근을 제어하거나 부가 기능을 추가하는 것을 말한다.

어떤 Subject 인터페이스 있고, 이것의 구현체인 Real Subject가 있다고 해보자.

개발자는 Real Subject에 추가 기능을 구현해야 하는데, 이 코드를 직접 건드리지 않아야 한다.

방법은 Subject 인터페이스의 또다른 구현체 Proxy를 만들고 Real Subject를 주입해 온 후, 기존 기능을 위임(delegation)하고 여기에 추가 기능을 만드는 것이다.



예제를 보자.

인터페이스를 만든다.

```java
public interface ColorEventService {
    void createEvent();
    void publishEvent();
    void deleteEvent();
}
```



인터페이스 구현체를 만든다.

```java
@Service
public class RedEventService implements ColorEventService {
    @Override
    public void createEvent() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("이벤트가 생성됨");
    }

    @Override
    public void publishEvent() {
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("이벤트가 발행됨");
    }

    public void deleteEvent() {
        System.out.println("이벤트가 삭제됨");
    }
}
```



이제 각 메소드의 실행 시간을 쟤는 추가기능을 구현한다고 해보자. Proxy 패턴으로 이를 만들어보면 아래와 같다.

```java
@Primary
@Service
public class ProxyRedEventService implements ColorEventService{

    @Autowired
    RedEventService redEventService;

    @Override
    public void createEvent() {
        long start = System.currentTimeMillis();
        redEventService.createEvent();
        System.out.println(System.currentTimeMillis() - start);
    }

    @Override
    public void publishEvent() {
        long start = System.currentTimeMillis();
        redEventService.publishEvent();
        System.out.println(System.currentTimeMillis() - start);
    }

    @Override
    public void deleteEvent() {
        long start = System.currentTimeMillis();
        redEventService.deleteEvent();
        System.out.println(System.currentTimeMillis() - start);
    }
}
```



이제 앱 러너로 테스트를 해보자.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    ColorEventService colorEventService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        colorEventService.createEvent();
        colorEventService.publishEvent();
        colorEventService.deleteEvent();
    }
}
```







하지만 이렇게 매번 프록시를 작성하기란 껄끄러운 일이다. 여러개의 클래스와 여러 메소드의 적용하기는 번거롭다.

그래서 Spring AOP 가 나왔고, 스프링 IoC 컨테이너가 제공하는 기반 시설과 다이나믹 프록시로 여러 문제를 쉽게 해결할 수 있다.

타겟 클래스를 감싸는 프록시를 만드는데, 동적으로 프록시 객체를 생성한다고 하여 동적 프록시라 한다. 자바는 인터페이스 기반으로 프록시를 생성하고, CGlibrary는 클래스 기반으로 프록시를 생성한다.

스프링 IoC는 기존 빈을 대체하는 동적 프록시 빈을 만들어 등록시킨다. 클라이언트 코드를 변경하지 않아도 된다.



`BeanPostProcessor` 인터페이스를 구현한 `AbstractAutoProxyCreator` 를 이용하면 된다.



애노테이션 기반의 스프링 AOP를 만들어보자.

먼저 라이브러리 및 빌드 관리 툴에 의존성을 추가한다.

**Maven**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```



**Gradle**

```shell
dependencies {
	implementation "org.springframework.boot:spring-boot-starter-aop"
}
```





<br />

**Aspect 작성** - 성능측정 aspect

```java
@Component
@Aspect
public class PerfAspect {

    // Advice (Aspect가 해야할 일, 메소드)
    // Around 는 메소드 호출 전/후/에러발생시 등에서 pointCut을 정할 수 있다.
    @Around("execution(* me.wordbe..*.RedEventService.*(..))")
    public Object logPerf(ProceedingJoinPoint pjp) throws Throwable {
      
        long start = System.currentTimeMillis();
        Object ret = pjp.proceed();
        System.out.println(System.currentTimeMillis() - start);
        return ret;
    }
}
```

위와 같이 새로운 Aspect를 만들고, `ProceedingJointPoint` 를 받아와서 사용하면 된다. 조인포인트를 진행할 때는 에러가 날 수 있으므로 Throwable 에러처리를 한다.

`@Around` 에 `execution` 방법으로 aspect를 적용시킬 타겟 클래스를 찾았다.

<br />



포인트 컷을 정의하는 방법으로 `@Pointcut("표현식")` 이 있다. 표현식으로 위에서 사용했던 execution 외에도 @annotation, bean 이 있고, &&, ||, ! 등으로 조합할 수도 있다.

<br />

**@annotation**

어노테이션을 만들어서 타겟 클래스를 찾을 수도 있다.

```java
@Around("@annotation(PerfLogging)")   
```

단, 어노테이션 파일을 하나 더 만들어야 한다.

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.CLASS) // Retention(유지 범위) 기본값은 CLASS
@Documented // 자바 도큐먼트 작성
@Target(ElementType.METHOD) // 메소드 위에 어노테이션을 설정할 것임
public @interface PerfLogging {
}
```

그리고 적용할 클래스의 메소드에 이렇게 만든 어노테이션을 붙여주면 된다. `@PerfLoging`



<br />

**bean** 

마지막으로 등록 된 빈들에서 쉽게 타겟 클래스를 찾아주는 방법이 있다. `bean` 키워드를 이용하는 것이다.

```java
@Around("bean(redEventService)")
```

빈으로 등록된 타겟 클래스의 이름을 첫문자만 소문자로 바꾸어서 카멜케이스로 적어주면 된다.



<br />

마지막으로, 어드바이스를 정의하는 방법으로 @Around 말고 다른 어노테이션을 이용할 수 있다.

```java
@Component
@Aspect
public class PerfAspect {

    // Advice
    @Around("bean(redEventService)")
    public Object logPerf(ProceedingJoinPoint pjp) throws Throwable {
        ...
    }

    // Advice
    @Before("bean(redEventService)")
    public void printBefore() {
        System.out.println("-----메소드 실행 전-----");
    }
}
```

이 외에도 `@AfterReturning`, `@AfterThrowing` 등이 있다.





