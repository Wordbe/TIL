# Spring security 006 - 인가, DB 연동



DB 와 연동하여 자원, 권한을 설정하고 제어하여 동적 권한 관리가 가능하도록 한다.

설정 클래스 소스에서 권한 관련 코드를 모두 제거한다.

**관리자 시스템 구축**

* 회원 관리 - 권한 부여
* 권한 관리 - 권한 생성, 삭제
* 자원 관리 - 자원 생성, 삭제, 수정, 권한 매핑

**권한 계층 구현**

* **URL** 요청시 인가 처리
* **Method** 호출 시 인가 처리
  * Method
  * Pointcut



<br />

---

# DB 연동 웹 계층 구현 (URL 인증)

## 관리자 시스템  - 권한 도메인, 서비스, 레포지토리 구성

![](https://i.ibb.co/ccrPqdG/2021-04-09-1-08-54.png)

![](https://i.ibb.co/wQ5qczH/2021-04-09-1-09-26.png)

<br />

---

## 주요 아키텍처 이해



* 스프링 시큐리티 인가처리
* `http.antMatchers("/user").access("hasRole('USER')")`

사용자가 `/user` 자원에 접근하기 위해서는 `ROLE_USER` 권한이 필요하다.

* 사용자 : **인증정보**
* /user 자원 : **요청정보**
* ROLE_USER : **권한정보**

스프링 시큐리티에서는 `FilterSecurityInterceptor` 에 위 3가지 정보를 구해서 `AccessDecisionManager` 에 등록한다.

필터에 들어 올 때 인증정보를 얻는다. 그 후 요청정보와 권한정보를 Map 객체에 key-value로 저장된다.

![](https://i.ibb.co/rFGYxLC/image.png)





![](https://i.ibb.co/nwZ28LB/image.png)



<br />

## FilterInvocationSecurityMetadataSource

![](https://i.ibb.co/gSfWZJc/image.png)



시큐리티 메타데이터 소스

* 사용자가 접근하고자 하는 Url 자원에 대한 권한 정보 추출
* AccessDecisionManager 에게 전달하여 인가처리 수행
* DB로부터 자원, 권한 정보를 매핑하여 맵으로 관리
* 사용자의 매 요청마다 요청정보에 매핑된 권한 정보 확인



![](https://i.ibb.co/Gnm7wZd/image.png)





<br />

![](https://i.ibb.co/t8Q3459/2021-04-10-3-11-23.png)

* `UrlFilterInvocationSecurityMetadataSource` 는 우리가 만든 클래스이다.
* DB로부터 얻은 권한, 자원 정보를 ResourceMap 을 빈으로 등록해서 위 클래스에게 전달할 것이다.



* `SecurityConfig`
* `UrlResourcesMapFactoryBean`
* `UrlFilterInvocationSecurityMetadataSource`
* `SecurityResourceService`



<br />

---

## 인가처리 실시간 반영하기

![](https://i.ibb.co/71WTb19/2021-04-11-7-33-43.png)



`UrlFilterInvocationSecurityMetadataSource.reload()`

+컨트롤러에 reload 로직 추가
<br />

---

## 인가 처리 허용 필터 ( 커스텀 클래스 PermitAllFilter ) 구현

![](https://i.ibb.co/7bj0Yzf/2021-04-11-10-06-30.png)

* 인증 및 권한심사를 할 필요 없는 자원 ("/", "/home", "login" 등) 들을 미리 설정해서 바로 리소스 접근이 가능하게 하는 필터
* PermitAllFilter 를 자체 구현해서 AbstractSecurityInterceptor 뒤의 과정을 생략하도록 로직을 만든다.



<br />

---

## 계층 권한 적용하기 - 커스텀 클래스 RoleHierarchy

![](https://i.ibb.co/Vxqv9nN/2021-04-11-10-25-22.png)



* `RoleHierarchy`
  * 상위 계층 role은 하위 계층 role 의 자원에 접근 가능함
  * `ROLE_ADMIN` > `ROLE_MANAGER` > `ROLE_USER` 일 경우, ROLE_ADMIN 권한만 있으면 하위 role 모두 포함 가능
* `RoleHierarchyVoter`
  * `RoleHierarchy` 를 생성자로 받으며 이 클래스에서 설정한 규칙이 적용되어 심사한다.

<br />

---

## IP 접속 제한하기

![](https://i.ibb.co/0tD8gYy/2021-04-11-11-30-08.png)

**심의 기준**

* 특정 IP만 접근 가능하도록 심의하는 Voter를 추가한다.
* Voter 중에서 가장 먼저 심사하도록 하여 허용된 IP 일 경우에만 최종 승인 및 거부 결정을 하도록 한다.
* 허용된 IP 이면 `ACCESS_GRANTED` 가 아닌 `ACCESS_ABSTAIN` 을 리턴해서 추가 심의를 계속 진행하도록 한다.
* 허용된 IP 가 아니면 `ACCESS_DENIED` 를 리턴하지 않고 즉시 예외를 발생시켜 최종 자원 접근을 거부한다.



<br />

---

# DB 연동 서비스 계층 구현 (Method 인증)



## Method 방식

* 서비스 계층의 인가처리 방식
  * 화면 메뉴 단위가 아닌 기능 단위로 인가 처리
  * 메소드 처리 전후로 보안 검사 수행하여 인가처리
* Method 방식은 AOP 기반 동작 (URL 방식은 Filter 기반이다)
  * 프록시, advice로 메소드 인가처리 수행
* 보안 설정 방식
  * 어노테이션 권한 설정 방식
    * `@PreAuthorize("hasRole('USER')")`
    * `@PostAuthorize("hasRole('USER')")`
    * `@Service("ROLE_USER")`
  * 맵 기반 권한 설정 방식
    * 맵 기반 방식으로 외부와 연동하여 메소드 보안 설정 구현



<br />

---

## AOP Method 기반 DB 연동 주요 아키텍처 이해

![](https://i.ibb.co/zHLhjLD/2021-04-12-12-40-24.png)

### 인가 처리를위한 초기화 과정, 진행

* 초기화 과정
  1. 초기화 시 전체 빈을 검사하면서 보안이 설정된 메소드가 있는지 탐색
  2. 빈의 **프록시 객체**를 생성
  3. 보안 메소드에 인가처리(권한심사) 기능을 하는 Advice를 등록
  4. 빈 참조시 실제 빈이 아닌 프록시 빈 객체를 참조

* 진행과정
  1. **메소드 호출 시 프록시 객체를 통해 메소드를 호출**
  2. Advice가 등록되어 있다면 Advice를 작동하게 하여 인가 처리
  3. 권한 심사 통과하면 실제 빈의 메소드를 호출

Method Map 에 권한 정보를 저장(캐싱)해 놓는다.

<br />

### 인가처리를 위한 초기화 과정

![](https://i.ibb.co/JQ7BbHM/2021-04-12-12-47-55.png)

* `MethodSecurityInterceptor` 가 어드바이스이다. 권한 승인시 실제 빈 메소드를 호출한다.

### 진행 과정

![](https://i.ibb.co/cvLjhHc/2021-04-12-12-52-43.png)

* `MethodSecurityMeatadataSourceAdvisor`







<br />

---

## 어노테이션 권한 설정

보안이 필요한 메소드에 설정한다.

### @PreAuthorize, @PostAuthorize

* SpEL 지원
* `@PreAuthorize("hasRole('ROLE_USER') and (#account.username == principal.username)")`
* `PrePostAnnotationSecurityMetadataSource` 가 담당한다.

### @Secured, @RolesAllowed

* SpEL 미지원
* @Service("ROLE_USER"), `@RolesAllowed("ROLE_USER")`
* `SecuredAnnotationSecurityMetadataSource`, `Jsr250MethodSecurityMetadataSource` 가 담당

> ★
>
> `@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)` 어노테이션을 붙여주어야 한다.

<br />

![](https://i.ibb.co/GTs1pnb/2021-04-12-12-19-14.png)



* `AopSecurityController`
* `AbstractSecurityInterceptor`
* `MethodSecurityInterceptor` > `AbstractSecurityInterceptor`
* `GlobalMethodSecurityConfiguration` > `MethodSecurityMetadataSource`
  * `PrePostEnabled`
  * `SecuredEnabled`
  * `Jsr250Enabled`
* `AbstractFallbackMethodSecurityMetadataSource`
* `DelegatingMethodSecurityMetadataSource`
  * `SecuredAnnotationSecurityMetadataSource`

<br />

---

## MapBasedSecurityMetadataSource



Filter 기반 URL 방식과

AOP 기반 Method 방식의 인가는 비슷하다.

둘 다 `SecurityMeatadataSource` 인터페이스의 구현체를 생성한다.

![](https://i.ibb.co/HF6Dh90/image.png)

<br />

`MapBasedSecurityMetadataSource`

![](https://i.ibb.co/fkZjj9s/2021-04-12-11-31-44.png)

<br />

메소드 방식 : Map 기반 DB 연동

![](https://i.ibb.co/QJPZ7f4/2021-04-12-11-33-01.png)

* admin() 메소드는 `ROLE_ADMIN` 만 접근 가능하다.
* 인터셉터(어드바이스)가 메소드 요청을 가로챈다. (AOP 기반)
* DB 에 저장된 메소드별 권한을 읽어 Map (캐시)에 저장한다.
* 메소드 정보와 매칭되는 권한이 권한 맵(목록)에 있다면 인가처리 다음으로 진행한다. (AccessDecisionManager)

<br />

<br />

<br />

<br />

```java
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {

  @Override
  protected MethodSecurityMetadataSource customMethodSecurityMetadataSource() {
    return new MapBasedMethodSecurityMetadataSource();
  }
}
```

* `EnableGlobalMethodSecurity` 를 명시해야 한다.
* `GlobalMethodSecurityConfiguration` 을 상속받는다. 메소드 보안 설정 관련 기능을 제공한다.

<br />

![](https://i.ibb.co/N3j3kmS/2021-04-12-11-43-42.png)

`MethodResourcesMapFactoryBean`

* DB로부터 얻은 권한/자원 정보를 `ResourceMap` 빈으로 생성해서 `MapBasedMethodSecurityMetadataSource` 에 전달한다.
* URL 요청 방식과 다른 점은 전달된 자원이 parsing 과정이 필요하다는 것이다.



![](https://i.ibb.co/s5n65Ym/image.png)

<br />

---

## ProtectPointcutPostProcessor

* 메소드 방식의 인가처리를 위한 자원 및 권한정보 설정 시
  * 자원에 포인트 컷 표현식을 사용할 수 있도록 지원하는 클래스이다.
* 빈 후처리기로써 스프링 초기화 과정에서 빈 들을 검사하여
  * 빈이 가진 메소드 중에서 포인트 컷 표현식과 매칭되는 클래스, 메소드, 권한 정보를 `MapBasedMethodSecurityMetadataSource` 에 전달하여 인가처리가 되도록 제공되는 클래스이다.
* DB 저장 방식
  * Method 방식
    * `io.security.service.OrderService.order` : `ROLE_USER`
  * Pointcut 방식
    * `execution(* io.security.service.*Service.*(..))` : `ROLE_USER`
* 설정 클래스에서 빈 생성시 접근제한자가 package 범위로 되어 있기 때문에 리플렉션을 이용해 생성한다.



![](https://i.ibb.co/CstkMrJ/2021-04-13-8-48-14.png)

![](https://i.ibb.co/PrS0pW0/2021-04-13-8-49-52.png)

`BeanPostProcessor`빈 후처리기에서 탐색 후 포인트컷 발견



## 실시간 DB 연동 메소드 보안 처리 (번외편)

* `addMethodSecured` : 보안 기능 추가
  * 메소드 보안 최초 설정 시
  * 리플렉션 사용해서 클래스이름 얻고,
  * 빈의 프록시객체를 생성한다.
  * 프록시로 메소드에 어드바이스 등록하여 AOP 적용
  * `MapBasedMethodSecurityMeatadataSource` 에 자원, 권한 정보 전달
  * `DefaultSingletonBeanRegistry` 로 실제 빈을 삭제하고, 프록시 객체를 빈 참조로 등록한다.
  * 보안이 적용된 메소드 호출 시 Advice 가 작동한다.
  * 메소드 보안 재 설정 시 메소드에 등록된 Advice를 다시 등록한다.
* `removeMethodSecured` : 보안 기능 제거
  * 메소드 보안 해제 시 메소드에 등록된 Advice 를 제거한다.
* `ResourceController` 컨트롤러 `createResource`, `removeResource`
* ` CustomMethodSecurityInterceptor`
* `AopLiveMethodService`, `AopSecurityController`

메소드 등록 후 삭제는 잘 작동하는데

삭제 후 등록할 시 완벽히 작동 안됨



---

## 마무리

1. 보안 API
   * 인증, 세션, 예외, 인가 등의 API 설정, 사용법, 기능 이해
   * 보안 시스템 구축은 비용이 많이 든다. 스프링 시큐리티는 기본 API 숙지를 통해서도 적은 비용으로 보안 시스템 구축을 가능하게 한다.
2. Filter
   * 요청에 따른 각 filter 들의 처리과정과 동작 방식 이해
   * 사용자 요청을 받아서 처리
3. 내부 아키텍처
   * 스프링 시큐리티 초기화 과정
   * 요청에 대한 시작과 마지막 처리과정의 아키텍처 이해
4. 실전 프로젝트
   * DB 연동 인증 - Form, Ajax
   * DB 연동 인가 - URL, Method



## 더 많은 주제들

1. 인증
   * Oauth2 인증
   * JWT 인증
   * 마이크로 서비스 인증 - Spring Cloud Security
2. 인가
   * ACL : Access Control List
     * 도메인 객체 단위 인가 처리













