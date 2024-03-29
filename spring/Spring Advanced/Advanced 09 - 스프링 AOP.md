# Advanced 09 - 스프링 AOP

<br />

# 1. AOP - 핵심 기능과 부가 기능

## 핵심기능과 부가기능

애플리케이션은 핵심 기능과 부가 기능으로 나눌 수 있다.

- 핵심기능 : 객체가 제공하는 고유 기능이다. 예) 주문 로직
- 부가기능 : 핵심 기능을 보조하기위해 제공되는 기능이다. 예) 로그 추적, 트랜잭션 기능, 보안 체크 기능
  - 부가기능은 횡단관심사(cross-cutting concerns) 가 된다. 하나의 부가 기능은 여러 곳에서 동일하게 사용된다는 뜻이다.

<br />

## 부가기능 적용 문제

- 여러 곳에 반복해서 적용하기가 번거롭다.
- 유틸리티코드를 만들어도, 핵심기능이 담긴 객체에서 유틸리티 코드를 만들어야 한다.
- `try ~ catch ~ finally` 등 복잡한 로직이라면 더 복잡해진다.
- 가장 큰 문제는 `변경` 이다. 하나의 수정이 발생하면 100개의 클래스 로직을 모두 동일하게 바꾸어야 한다.

부가기능 적용 문제를 정리하면

1. 아주 많은 반복이 필요하다.
2. 여러 곳에 퍼져서 중복 코드를 만들어낸다.
3. 변경시 중복 때문에 많은 수정이 필요하다.
4. 부가 기능의 적용 대상을 변경할 때 많은 수정이 필요하다.

> 소프트웨어 개발에서 변경 지점은 하나가 될 수 있도록 잘 모듈화 되어야 한다. 그런데 부가기능처럼 특정 로직을 애플리케이션 전반에 적용하는 문제는 일반적인 OOP 방식으로는 해결이 어렵다.

<br />

---

# 2 AOP - Aspect



## 부가기능 도입의 문제점을 해결하기 위한 고민의 결과

- 부가기능을 핵심기능에서 분리하고 한곳에서 관리하도록 했다. 부가 기능을 어디에 적용할지 선택하는 기능도 만들었다.
- 부가기능 (Advice) + 어디에 적용할지 선택하는 기능 (Pointcut) 을 합해 하나의 모듈로 만들었는데, 이를 Aspect 라고 한다.

애스팩트는 우리말로 관점이다. 애플리케이션을 바라보는 관점 하나하나의 기능에서 횡단 관심사(cross-cutting concerns) 관점으로 달리 보는 것이다.

- 애스팩트를 사용한 프로그래밍 방식을 ***관점 지향 프로그래밍(AOP, Aspect-Oriented Programming)*** 이라고 한다.
- AOP는 OOP를 대체하기 위한 것이 아니라 횡단 관심사를 깔끔하게 처리하기 어려운 OOP 의 부족한 부분을 보조하는 목적으로 개발되었다.

<br />

## AspectJ 프레임워크

- AOP 대표적 구현으로 AspectJ 프레임워크가 있다. 물론 스프링도 AOP를 지원하지만 대부분 AspectJ 문법을 차용하고, AspectJ 가 제공하는 기능의 일부만 제공한다.
- 자바 프로그래밍 언어에 대한 완벽한 관점 지향 확장
- 횡단 관심사의 깔끔한 모듈화
  - 오류 검사 및 처리
  - 동기화
  - 성능 최적화 (캐싱)
  - 모니터링
  - 로깅

<br />

## AOP 적용 방식

### 부가 기능 로직은 실제 어떤 방식으로 로직에 추가되는가?

1. 컴파일 시점 : 실제대상 코드에 aspect 를 통한 부가기능 호출 코드가 포함된다. AspectJ를 직접 사용해야 한다.
2. 클래스 로딩 시점 : 실제대상 코드에 aspect 를 통한 부가기능 호출 코드가 포함된다. AspectJ를 직접 사용해야 한다.
3. 런타임 시점 (프록시) : 실제대상 코드는 그대로 유지된다. 대신 프록시를 통해 부가 기능이 적용된다. 따라서 항상 프록시를 통해야 부가기능을 사용할 수 있다. 스프링 AOP는 이 방식을 사용한다.

<br />

## 1 컴파일 시점

![](https://i.ibb.co/NpSvC8Q/2021-12-06-1-13-30.png)

- `.java` 소스를 컴파일러를 사용해서 `.class` 를 만드는 시점에 부가 기능 로직을 추가한다.
- AspectJ가 제공하는 특별한 컴파일러를 사용해야 한다.
- 이렇게 원본 로직에 부가기능 로직이 추가되는 것을 위빙(Weaving, 옷감을 짜기)이라고 한다.
- 단점 : 특별한 컴파일러도 필요하고 복잡하다.

<br />

## 2 클래스 로딩 시점

![](https://i.ibb.co/1Gw6wH7/2021-12-06-1-19-47.png)

- 자바를 실행하면 자바 언어는 `.class` 파일을 JVM 내부의 클래스 로더에 보관한다. 이 때 중간에서 `.class` 파일을 조작한 다음 JVM에 올릴 수 있다.
- 자바 언어는 `.class` 를 JVM에 저장하기 전에 조작할 수 있는 기능을 제공한다. java instrumentation 참고.
- 이 시점에 Aspect 를 적용하는 것을 로드 타임 위빙 (Load Time Weaving) 이라고 한다.
- 단점 : 로드 타임 위빙은 자바를 실행할 때 특별한옵션 `java -javaagent` 을 통해 클래스 로더 조작기를 지정해야 하는데, 번거롭고 운영하기 힘들다.

<br />

## 3 런타임 시점

![](https://i.ibb.co/q05RrdH/2021-12-06-1-23-15.png)

- 런타임 시점은 컴파일도 끝나고, 클래스 로더에 클래스도 다 올라가서 이미 자바가 실행되고 난 다음을 말한다. 자바의 main 메서드가 이미 실행된 다음이다. 따라서 자바 언어가 제공하는 범위 안에서 부가기능을 적용해야 한다.
- 스프링과 같은 컨테이너의 도움을 받고, 프록시와 DI, 빈후처리기 같은 개념들을 총 동원해야 한다. 최종적으로 프록시를 통해 스프링 빈에 부가기능을 적용할 수 있다. 지금까지 학습한 것이 프록시 방식의 AOP 이다.
- 프록시를 사용하기 때문에 AOP 기능에 일부 제약이 있다. 하지만 특별한 컴파일러나 자바 실행할 때 복잡한 옵션과 클래스 로더 조작기를 실행하지 않아도 된다. 스프링만 있으면 AOP를 적용할 수 있다.

<br />

## AOP 적용 위치

- 적용 가능 지점 (조인포인트) : 생성자, 필드 값 접근, static 메서드 접근, 메서드실행
  - 이렇게 AOP를 적용할 수 있는 지점을 조인포인트(join point) 라 한다.
- AspectJ 를 사용해서 컴파일 시점과 클래스 로딩 시점에 적용하는 AOP는 바이트코드를 실제 조작하므로 해당 기능을 모든 지점에 다 적용할 수 있다.
- 프록시 방식을 사용하는 스프링 AOP는 조인포인트를 _**메서드 실행 지점에만 제한하여 AOP를 적용**_할 수 있다.
  - 프록시는 메서드 오버라이딩 개녀으로 동작한다. 따라서 생성자나 static 메서드, 필드 값 점근에는 프록시 개념이 적용될 수 없다.
- 프록시 방식을 사용하는 스프링 AOP는 스프링 컨테이너가 관리할 수 있는 _**스프링 빈에만 AOP를 적용**_할 수 있다.

> 스프링은 AspectJ의 문법만 차용하고, 프록시 방식의 AOP를 적용한다. AspectJ를 직접 사용하지 않는다.

> :bulb:  중요
>
> AspectJ 를 사용하면 더 복잡하고 다양한 기능을 사용할 수 있다.
>
> AspectJ 를 사용하려면 공부할 내용이 많고, 자바관련 설정 (특별한 컴파일러, AspectJ 전용 문법, 자바 실행 옵션)도 복잡하다. 반면에 스프링 AOP는 별도 추가 자바 설정 없이 스프링만 있으면 편리하게 AOP를 사용할 수 있다. 
>
> - **실무에서는 스프링이 제공하는 AOP 기능만 사용해도 대부분의 문제를 해결할 수 있다.** 스프링 AOP 가 제공하는 기능을 학습하는 것에 집중하자.

<br />

---

## 5 AOP 용어 정리

![](https://i.ibb.co/k5J3hGy/2021-12-06-1-37-21.png)

조인포인트

포인트컷, 어드바이스, 에스팩트, 어드바이저

타겟, 위빙, AOP프록시

### 조인 포인트 (Join point)

- 어드바이스가 적용될 수 있는 위치 : **메소드 실행 시점**, 생성자 호출, 필드 값 접근, static 메서드 접근 같은 프로그램 실행 중 지점
- 조인포인트는 추상 개념. AOP를 적용할 수 있는 모든 지점이다. (`ProceedingJoinPoint joinPoint`)
- 스프링 AOP는 프록시 방식을 사용하므로 메소드 실행 지점만 조인포인트가 될수 있다.

### 포인트컷 (Pointcut)

- 조인 포인트 중 어드바이스가 적용될 위치를 선별하는 기능
- 주로 AspectJ 표현식을 사용해서 지정
- 스프링 AOP는 프록시 방식을 사용하므로 메서드 실행 지점만 포인트컷으로 선별 가능

### 어드바이스 (Advice)

- 부가 기능
- 특정 조인 포인트에서 Aspect에 의해 취해지는 조치
- Around(주변), Before(전), After(후) 와 같은 다양한 종류의 어드바이스가 있다.

### 애스팩트 (Aspect)

- 어드바이스 + 포인트컷을 모듈화 한 것
- `@Aspect` 를 생각
- 여러 어드바이스와 포인트컷이 함께 존재한다.

### 어드바이저 (Advisor)

- 하나의 어드바이스와 하나의 포인트컷으로 구성
- 스프링 AOP 에서만 사용되는 특별한 용어

### 타겟 (Target)

- 어드바이스를 받는 객체, 포인트컷으로 결정

### 위빙 (Weaving)

- 포인트컷으로 결정한 타겟의 조인 포인트에 어드바이스를 적용하는 것
- 위빙을 통해 핵심 기능 코드에 영향을 주지 않고 부가기능을 추가할 수 있음
- AOP 적용을 위해 애스펙트를 객체에 연결한 상태
  - 컴파일 타임 (AspectJ Compiler)
  - 로드 타임
  - 런타임 (스프링 AOP는 런타임의 프록시 방식이다.)

### AOP 프록시

- AOP 기능을 구현하기 위해 만든 프록시 객체, 스프링에서 AOP 프록시는 JDK 동적 프록시 또는 CGLIB 프록시이다.

<br />





