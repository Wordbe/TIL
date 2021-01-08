# Spring AOP



스프링의 트라이앵글로 IoC, AOP, PSA 가 있다. 그 중 AOP를 공부해보자.





## AOP

Aspect Oriented Programming, 관점지향 프로그래밍

OOP 는 같은 종류의 대상을 최상위 클래스로 부터 아래 클래스를 긴밀한 관계(추상화, 캡슐화, 상속, 다형성)로 설계를 지향하는 프로그래밍이라면,

AOP는 종류가 다른 클래스 사이에서 효율적인 코드 설계(중복 제거 등)를 지향하는 프로그래밍이다. 





AOP를 구현하는 방법은 아래와 같다.

* sample.java 를 컴파일하여 sample.class 가 되는 사이에 AOP를 구현한다. (AspectJ)
* 바이트코드를 조작하여 sample.java ➞ sample.class 로 컴파일 후 실행시키는 과정에서 메모리에서 AOP를 구현한다. (클래스 로더 (AspectJ))
* **프록시패턴: 스프링 AOP가 사용하는 방법이다.**





---

## 프록시 패턴

기존의 객체를 건드리지 않으면서 새로운 코드만 추가하여 기존의 객체에 로직을 추가하는 방법이다.

클래스마다 구현해야 할 반복되는 로직이 있을 때, 프록시 패턴을 사용하면 코드의 중복을 막을 수 있다.





### 프록시 패턴 만들어보기

예제 ) Payment(인터페이스), Cash(Payment 인터페이스의 구현체), Store(클라이언트, 테스트용)

여기서 Cash 클래스에 추가 코드를 넣고 싶을 때 기존의 코드를 수정하지 않으려한다.



프록시 클래스 CashPerf 는 Payment 인터페이스를 받아 구현한다.

그리고 cash 클래스를 생성한 뒤 아래와 같이 넣고 싶은 코드를 넣으면 된다.

```java
public class CashPerf implements Payment{

	Payment cash = new Cash();

	@Override
	public void pay(int amount) {
    
    // 넣고싶은코드 ------------------------------ 
		StopWatch stopWatch = new StopWatch();
		stopWatch.start();
    // 넣고싶은코드 ------------------------------

		cash.pay(amount);

    // 넣고싶은코드 ------------------------------
		stopWatch.stop();
		System.out.println(stopWatch.prettyPrint());
    // 넣고싶은코드 ------------------------------
	}
}

```



이제 테스를 해보자.

```java
import org.junit.jupiter.api.Test;

class StoreTest {
	@Test
	public void testPay() {
    // Payment cash = new Cash();
    // 윗 줄 코드 대신 프록시 클래스 사용
		Payment cashPerf = new CashPerf();
		Store store = new Store(cashPerf);
		store.buy(200);
	}
}
```





프록시는 빈이 등록될 때 자동으로 생성되어 기존 객체(코드)와 연결된다.

> 참고) `@Transactional` 이 붙은 메소드나 필드의 클래스는 자동으로 프록시 패턴을 따른다.





### 어노테이션으로 프록시패턴 만들어보기

아래 코드는 모두 같은 패키지 안에 있다.



```java
@LogExecutionTime
public String smaple() {
  return "hellow";
}
```

코드를 추가하고 싶은 클래스는 sample 클래스이다.

그 위에 새로운 애노테이션을 만들자



**LogExecutionTime.java**

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
}

```

에노테이션의 타겟이 메소드 (위 코드에서 sample 클래스) 임을 명시한다.

애노테이션의 유지기한을 런타임에 한정한다.



에노테이션은 말그대로 주석이다. 여기까지만 작성했다면 아무것도 바뀌는 일은 없다.



이제 추가할 코드를 적어보자.

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

@Component
@Aspect
public class LogAspect {

	Logger logger = LoggerFactory.getLogger(LogAspect.class);

	@Around("@annotation(LogExecutionTime)")
	public Object logExecutionTime(ProceedingJoinPoint joinpoint) throws Throwable {
		StopWatch stopWatch = new StopWatch();
		stopWatch.start();

		// joinpoint 는 애노테이션이 붙은 메소드(타겟)이다.
		Object proceed = joinpoint.proceed(); // 메소드를 실행한다.

		stopWatch.stop();
		logger.info(stopWatch.prettyPrint());
		return proceed;
	}
}

```

`@Around` 는 다른 에노테이션을 읽어오도록 한다.

LogAspect 는 스프링 빈으로 등록되었을 뿐아니라, `@Aspect` 로 명시되어 프록시 패턴이 되었다.

Aspect 라고 이름 지은 것은 특정 클래스(sample) 에 우리가 원하는 관점대로 사용할 수 있도록 코드를 추가시켰기 때문이다. 즉 AOP 를 구현한것이다.























