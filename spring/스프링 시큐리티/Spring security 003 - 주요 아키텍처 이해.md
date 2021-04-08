# Spring security 003 - 주요 아키텍처 이해



## 1. 위임 필터, 필터 빈 초기화

![](https://i.ibb.co/f4GCfC7/2021-04-05-7-13-49.png)

### `DelegatingProxyChain`

* 필터를 위임하는 프록시(대리)
* 서블릿 필터는 스프링에서 정의된 빈을 주입해서 사용할 수 없다. 따라서
* 특정한 이름을 가진 스프링 빈을 찾아 그 빈에게 요청을 위임한다.
  * 이 때 `springSecurityFilterChain` 이름으로 생성된 빈을 `ApplicationContext` 에서 찾아 요청을 위임한다.
  * 실제 보안 처리는 하지 않고, 요청을 위임하기만 한다.

<br />

### `FilterChainProxy`

**0~14 번 기본 필터들이 있다.**

`springSecurityFilterChain` 이름으로 생성되는 필터 빈이다.

`DelegatingFilterProxy` 로부터 요청을 위임받고 실제 보안 처리를 한다.

스프링 ㅅ큐리티 초기화 시 생성되는 필터들을 관리하고 제어한다. 

* 스프링 시큐리티가 기본적으로 생성하는 필터
* 설정 클래스에서 API 에서 추가 시 생성되는 필터가 있다.

사용자의 요청을 필터 순서대로 호출하여 전달한다.

사용자 정의 필터를 생성해서 기존의 필터 전, 후로 추가가 가능하다. 필터의 순서를 잘 정의하면 된다.

마지막 필터까지 인증/인가 예외가 발생하지 않으면 보안이 통과된다.

<br />

![](https://i.ibb.co/d6Cx4nn/2021-04-05-7-20-55.png)



<br />

---

## 2. 필터 초기화와 다중 보안 설정

<br />

### 필터 초기화, 다중 설정 클래스

![](https://i.ibb.co/QCXrQDD/2021-04-05-7-32-37.png)

* 설정 클래스 별로 보안 기능이 각각 작동한다.
* 설정클래스 별로 `RequestMatcher`가 설정된다.
  * `http.antMathcer("/admin/**")`
* 설정클래스 별로 필터가 생성된다.
* `FilterChainProxy` 가 각 필터들을 가지고 있다.
* 요청에 따라 `RequestMatcher` 와 매칭되는 필터가 작동하도록 한다.



<br />

예시)

![](https://i.ibb.co/zXQb4q7/2021-04-05-7-38-28.png)

1) 사용자가 요청을 보낸다.

2) `FilterChainProxy` 는 url 과 매칭(`RequestMatcher` 에서 확인한다.)되는 필터를 선택한다.



<br />

---

## 3. Authentication

**"인증"**

당신이 누구인지 증명하는 것이다.



* 사용자의 인증 정보를 저장하는 토큰 개념이다.

* 인증시 id, password 담고 인증 검증을 위해 전달된다.

* 인증 후 최종 인증 결과 (User 객체, 권한정보)를 담고 `SecurityContext` 에 저장되어 전역적으로 참조 가능 하다.

  ```java
  Authentication authentication = SecurityContextHolder.getContext().getAuthentication()
  ```

  

### Authentication 구조

* `principal` : 사용자 아이디 또는 User 객체를 저장
* `credentials` : 사용자 비밀번호
* `authorities` : 인증된 사용자 권한 목록
* `Authenticated` : 인증 여부
* `details` : 인증 부가 정보

<br />

![](https://i.ibb.co/P9sX4Hv/image.png)



<br />

![](https://i.ibb.co/w0JKQLF/2021-04-05-9-44-43.png)

코드에서 직접 디버깅으로 탐색하기.



* `Authentication.java`
* `Principal.java` : 자바에서 제공하는 클래스
* `AbstractAuthenticationProcessingFilter` 필터 작동
* `UsernamePasswordAuthenticationFilter`
* `ProviderManager` (`AuthenticationManager` 구현체)
* `AbstractUserDetailsAuthenticationProvider`
* `UsernamePasswordAuthenticationToken` 인증 성공 후 다시 인증매니저에게 전달
* `AbstractAuthenticationProcessingFilter` 인증 필터에서 `Authentication` 객체를 `SecurityContextHolder` 에 담아준다.

<br />

---

## 4. 인증저장소 : SecurityContextHolder, SecurityContext



### SecurityContext

* Authenticaition 객체가 저장되는 보관소이다. 필요시 언제든지 `Authentication` 객체를 꺼내어 쓸 수 있도록 제공되는 클래스이다.
* `ThreadLocal` 에 저장되서 아무 곳에서나 참조가 가능하도록 설계되었다.
* 인증 완료되면 `HttpSession` 에 저장되어서 어플리케이션 전반에 걸쳐 전역적 참조가 가능하다.



### SecurityContextHolder

* `SecurityContext` 객체 저장 방식
  * `MODE_THREADLOCAL` : 쓰레드 당 `SecurityContext` 객체를 할당한다. 기본값이다.
  * `MODE_INHERITABLETHREADLOCAL` : 메인 스레드와 자식 스레드에 관하여 동일한 `SecurityContext` 를 유지한다.
  * `MODE_GLOBAL` : 응용 프로그램에서 단 하나의 `SecurityContext` 를 저장한다.
* `SecurityContextHolder.clearContext()` : `SecurityContext` 기존 정보를 초기화한다.



저장소 접근 방법

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication()
```



<br />

![](https://i.ibb.co/vmh7dTp/image.png)

<br />



디버깅 테스트

* `SecurityContextHolder.java`
* `ThreadLocalSecurityContextHolderStrategy.java`
* `SecurityContext.java`
* `SecurityContextImpl.java`



```java
@GetMapping("/")
public String index(HttpSession httpSession) {

  // SecurityContextHolder로부터 인증객체 가져옴
  Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

  // 세션에서 인증 객체 가져옴
  SecurityContext context = (SecurityContext) httpSession.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
  Authentication authentication1 = context.getAuthentication();

  System.out.println("두 객체는 동일한가? " + (authentication1 == authentication)); // true

  return "home";
}

@GetMapping("/thread")
public String thread() {
  new Thread(
    new Runnable() {
      @Override
      public void run() {
        // 기본 전략모드인 MODE_THREADLOCAL 메인 스레드에만 인증객체가 담기고 에서는 자식 스레드에 인증 객체가 담기지는 않는다.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // null
      }
    }
  ).start();
  return "thread";
}
```

만약 메인스레드에 있는 인증 객체를 자식 스레드와 공유하고 싶다면, SecurityConfig 파일에 설정을 추가한다.

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
	SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
  http.
    ...
}
```

<br />

---

## 5. 인증 저장소 필터

<br />

### SecurityContextPersistenceFilter

* `SecurityContext` 객체를 생성하고, 저장, 조회한다.
* 익명사용자
  * 새로운 `SecurityContext` 객체를 생성하고 `SecurityContextHolder`에 저장한다.
  * `AnonymousAuthenticationFilter` 에서 `AnonymousAuthenticationToken` 객체를 `SecurityContext`에 저장한다.
* 인증 시
  * `UsernamePasswordAuthentiationFilter` 에서 인증 성공 후 `SecurityContext` 에 `UsernamePasswordAuthentication` 객체를 저장한다.
  * 인증이 최종 완료되면 Session 에 `SecurityContext` 를 저장한다.
* 인증 후
  * 새로운 `SecurityContext` 객체를 생성하고 `SecurityContextHolder`에 저장한다.
  * Session 에서 `SecurityContext` 를 꺼내어 `SecurityContextHolder` 에 저장한다.
  * `SecurityContext` 안에 `Authentication` 객체가 존재하면 계속 인증을 유지한다.
* 최초 응답 시 공통
  * `SecurityContextHolder.clearContext()`

<br />

![](https://i.ibb.co/54C8pb6/image.png)



* `SecurityContextPersistneceFilter` 의 동작을 이해하자.
* `HttpSecurityContextRepository` 는 `SecurityContext` 를 생성한다.
* 응답(response) 전에 세션에 저장되고 Holder에 있는 SecurityContext 는 삭제된다. 매 요청할 때마다 SecurityContext 가 다시 생성되기 때문이다.



![](https://i.ibb.co/gSyhLVd/2021-04-05-11-35-40.png)



익명사용자면, 익명사용자 인증 객체 만들어서 저장

<br />

---

## 6. 인증 흐름 이해



### Authentication Flow



![](https://i.ibb.co/TbBsVRB/2021-04-05-11-50-20.png)

* Form 인증 방식일 경우 `UsernamePasswordAuthenticationFilter` 가 작동한다.
* `AuthenticationManager`안의  List 안에 여러 `AuthenticationProvider` 가 있고 하나 선택해서 검증을 위임한다.
* username 은 id 와 같다.

<br />

디버깅 테스트

ID, PW 입력하고 폼인증 요청

* `UsernamePasswordAuthenticationFilter`
* `ProviderManager` (`AuthenticationManager`의 구현체) 에서 폼인증을 할 수 있는 프로바이더(`DaoAuthenticationProvider`)를 선택한다.
* `AbstractUserDetailsAuthenticationProvider`
* `DaoAuthenticationProvider`
* `inMomoryUserDetailsManager`
  * user 가 null 이면 `UsernameNotFoundException`
  * password 다르면 `BadCredentialException`
* `AbstractAuthenticationProcessingFilter` : SecurityContxext 객체에 인증 객체를 담는다. 그리고 SecurityContextHolder에 담는다.

<br />

---

## 7. 인증 관리자

<br />

### AuthenticationManager



![](https://i.ibb.co/2Zj4bHR/image.png)

* `AuthenticationProvider` 목록 중에서 인증 처리 요건에 맞는 프로바이더를 찾아 인증처리를 위임한다.
* 부모 `ProviderManager` 를 설정하여 `AuthenticationProvider` 를 계쏙 탐색 할 수 있다.



디버깅테스트

* `AuthenticationManagerBuilder`
* `ProviderManager`

<br />

---

## 8. 인증 처리자



### AuthenticationProvider

![](https://i.ibb.co/GQSBZgs/2021-04-06-12-21-49.png)

스프링 시큐리티가 제공하는 프로바이더 인터페이스

* support 는 각 인증방식에 맞는 조건을 처리해준다.



* `AuthenticationProvider`
* `AbstractUserDetailsAuthenticationProvider`
* `DaoAuthenticationProvider`
* `inMemoryUserDetailsManager`
* `User` 객체



<br />

---

## 9. 인가 개념, 필터



### Authorization



인가란? 당신에게 무엇이 허가 되었는지 증명하는 것.

![](https://i.ibb.co/j4FcjFJ/2021-04-06-9-12-19.png)



스프링 시큐리티가 지원하는 권한 계층

* 웹 계층 : URL 요청에 따른 메뉴 또는 화면단위의 레벨 보안 ( `/user` →(request)→ `ROLE_USER`)
* 서비스 계층 : 화면단위가 아닌 메소드 같은 기능 단위의 레벨 보안 ( `user()` →invoke→ `ROLE_USER`)
* 도메인 계층 (Access Control List, 접근제어목록) : 객체 단위의 레벨 보안 (`user` →write→ `ROLE_USER`)

<br />

### FilterSecurityInterceptor

* 마지막에 위치한 필터이다. 인증된 사용자에 대하여 특정 요청의 승인/거부 여부를 최종적으로 결정한다.
* 인증객체 없이 보호자원에 접근을 시도할 경우 `AuthenticationException` 을 발생시킨다.
* 인증 후 자원에 접근 가능한 권한이 존재하지 않을 경우 `AccessDeniedException` 을 발생시킨다.
* 권한 제어 방식 중 HTTP 자원의 보안을 처리하는 필터이다.
* 권한 처리를 `AccessDecisionManager` 에게 맡긴다.



![](https://i.ibb.co/L1NWrg2/2021-04-06-9-19-06.png)

사용자가 요청하면,

1) 인증객체 있는지

2) 권한정보가 있는지

3) 접근 승인이 되었는지 

확인한다.

<br />

소스코드

* `FilterChainProxy` 에서 14개 필터 중 마지막 필터를 확인 `FilterSeucirtyInterceptor`
* `ExceptionTranslationFilter`
* `FilterSecurityInterceptor`
* `AbstractSecurityInterceptor`
* `MethodSecurityInterceptor` : AOP 기반 동
* `AccessDecisionVoter`

<br />

application.properties

```properties
spring.security.user.roles=USER
```

<br />

---

## 인가 결정 심의자



### AccessDecisionManager

* 인증정보, 요청정보, 권한정보를 이용해서 사용자의 자원접근을 허용할 것인지 거부할 것인지 최종 결정하는 주체이다.
* 여러 개의 Voter 을 가질 수 있다. Voter 들로부터 접근허용, 거부, 보류에 해당하는 각각의 값을 리턴받고 판단, 결정할 수 있다.
* 최종 접근 거부시 예외가 발생한다.



위 인터페이스는 3가지 구현체가 있다.

* `AffirmativeBased` : 여러개의 Voter 클래스 중 하나라도 접근 허가로 결론을 내리면 접근 허가로 판단한다.
* `ConsensusBased` : 다수표(승인 또는 거부)에 의해 최종 결정을 판단한다. 동수일 경우, 기본은 접근 허가이다. 하지만 `allowIfEqualGrantedDeniedDecisions` 를 `false` 로 설정할 경우 접근거부로 결정된다.
* `UnanimousBased` : Voter가 만장일치일 경우만 접근을 승인한다.



<br />

### AccessDecisionVoter

* 판단을 심사하는 클래스이다.
* Voter가 권한 부여과정에서 판단하는 자료
  1. `Authentication` : 인증정보(user)
  2. `FilterInvocation` : 요청정보(antMatcher("/user"))
  3. `ConfigAttributes` : 권한정보(hasRole("USER"))
* 결정방식
  1. `ACCESS_GRANTED` : 접근허용(1)
  2. `ACCESS_DENIED` : 접근 거부(0)
  3. `ACCESS_ABSTAIN` : 접근 보류(-1) - Voter 가 해당 타입의 요청에 대해 결정 내릴 수 없는 경우이다.

<br />

![](https://i.ibb.co/kgM4VDt/2021-04-06-9-41-31.png)



* `AffirmativeBased`
* `ConsensusBased`
* `UnanimousBased`
* `AccessDecisionVoter`
* `RoleVoter`



---

## 총정리

![](https://i.ibb.co/9TK4z76/2021-04-06-9-48-40.png)



* API
* Filter
* 관련 클래스

**흐름**

* `SecurityConfig` 설정 클래스 세팅
* `HttpSecurity` 가 필터를 생성한다
* 필터는 `WebSecurity` 로 전달된다.
* `FilterChainProxy` 의 빈 객체를 생성한다. 생성자로 filter를 전달한다.
* `DelegatingFilterProxy` 는 `springSecurityFilterChain` 이라는 이름의 빈을 찾는다. 이 이름을 가진 클래스는 `FilterChainProxy` 이고, 서블릿 영역의 `delegatingFilterProxy`의 요청을 위임한다.

**필터들**

* 위에 그림에서 필터는 9개, 왼쪽에서 오른쪽으로 필터를 통과하면서 진행된다.
* `SecurityContextPersistenceFilter`
* `LogoutFilter`
* `UsernamePasswordAuthenticationFilter` : 폼 설정 필터
* `SessionManagementFilter` 위 필터 시점에서 동시에 진행
* SecurityContext 를 세션에 저장!



* `ConcurrentSessionFilter` : 동일한 ID로 세션에 접속하는 경우에 발생
* `RememberMeAuthenticationFilter`
* `AnonymousAuthenticationFilter`
* `SessionManagementFilter`
* `ExceptionTranslationFilter` : 인가나 인증예외 있을 때 발동
* `FilterSecurityInterceptor` 
  * 인증 객체 없으면 `AuthenticationException`
  * 인가 처리 매니저, 접근판단 Voters



동일한 계정으로 인증사용하는 경우도 가능





