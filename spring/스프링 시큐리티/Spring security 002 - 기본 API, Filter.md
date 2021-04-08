# Spring security 002 - 기본 API, Filter

<br />

## 익명사용자 인증 필터 : AnonymousAuthenticationFilter



1. 요청을 받으면 `AnonymousAuthenticationFilter` 가 동작한다.

2. `SecurityContext` 안에 `Authentication` 객체가 존재하는지 확인한다. 객체가 존재하면 인증을 받은 것이므로 `chain.doFilter` 로 넘어가서 다른 필터로 넘어간다.

3. 인증 객체가 없다면, 인증 객체 생성을 위해 `AnonymousAuthenticationToken` 을 생성한다.

4. `SecurityContextHolder` 를 통해서 `SecurityContext` 객체 안에 `Authentication` 객체 안에 `principal="anonymousUser"` , `authorities=ROLE_ANONYMOUS` 속성이 담기게 된다. 

   이를 통해 인증객체가 생성되는데, 안에 속성이 설정되어 있기 때문에 나중에 `isAnonymous()` 메소드 등으로 익명 사용자인지 판단할 수 있게 된다.

   * `isAnonymous() == true` 이면 로그인을하고, `isAuthenticated() == true` 이면 로그아웃을 하는 등으로 사용할 수 있다.
   * 인증 객체를 세션에 저장하지 않는다. 익명 사용자의 인증 객체는 아무도 사용하지 않으므로, 세션에 저장할 필요가 없다. 하지만 익명 사용자의 인증 객체를 만들어주는 이유는 스프링 시큐리티에서 인증 객체가 없으면 예외를 발생시키는 로직이 있기 때문이다.



<br />

---

## 동시 세션 제어 (같은 아이디로 동시 로그인)



같은 아이디로 동시 로그인 했을 때

최대 세션 허용 개수를 초과할 경우의 상황을 보자. (최대 세션 허용 개수 = 1 일 때)

<br />

방법1) 첫 번째는 이전 사용자의 세션을 만료시킨다.

* 사용자1 이 로그인, 서버에 세션이 1개 생성된다.
* 사용자2 가 로그인, 세션이 1개 더 생성된다. 이 때 이전 사용자의 세션을 만료시킨다.
* 사용자1은 링크에 접속해도, 세션이 만료된 상태가 된다.

방법2) 두 번째는 현재 사용자의 인증을 실패시킨다.

* 사용자1이 로그인, 서버에 세션이 1개 생성된다.
* 사용자2가 로그인 하려하는데, 세션이 최대허용개수를 넘었으므로 인증 예외를 발생시킨다.



<br />

```java
@Configuration
@EnableWebSecurity
public class BookSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    UserDetailsService userDetailsService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
      
      http.sessionManagement() // 세션 관리 기능 작동
        .invalidSessionUrl("/invalid") // 세션이 유효하지 않을 때 이동할 페이지
        .maximumSessions(1) // 최대 허용 가능 세션, -1이면 무제한 로그인 세션 허용
        .maxSessionsPreventsLogin(true) // 동시 로그인 차단(방법2), false이면 기존 세션 만료(default)(방법1)
        .expiredUrl("/expired") // 세션이 만료된 경우 이동할 페이
    }
}
```

<br />

---

## 세션 고정(SF) 보호



**세션고정 (SF, Session Fixation)**

* 공격자가 WebApp 에 접속해서 JSESSIONID=1234 를 발급받는다.
* 공격자는 사용자에게 발급받은 쿠키 JSESSIONID를 심어놓는다.
* 사용자는 자신의 브라우저에 이 정보가 담긴 줄 모른채 WebApp 에 로그인한다.
* 이 때 공격자와 같은 쿠키 값으로 인증이 되었기 때문에, 공격자는 사용자의 정보를 공유할 수 있다.

**해결방법**

* 로그인할 때마다 새로운 세션ID 를 사용자에게 전달하면 된다.

<br />

```java
http.sessionManagement()
  .sessionFixation().changeSessionId() // 서블릿 3.1 이상에서 기본값, 기존 세션의 속성들은 유지한채 아이디만 변경
  // migrateSession : 서블릿 3.1 미만에서 기본값, 기존 세션의 속성들은 유지한채 아이디만 변경
  // none : 같은 쿠키 정보에 대해서 세션아이디 바뀌지않음 (SF 공격에 취약)
  // newSession : 세션 ID가 새로 만들어지지만, 이전에 세션에서 저장된 설정값을 사용하지 못한다.
```





<br />

---

## 세션 정책



4가지 세션 정책이 있다.

```java
http.sessionManagement()
  .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 기본값, 스프링 시큐리티가 필요시 생성
  ;
SessionCreationPolicy.ALWAYS // 항상 세션 생성
SessionCreationPolicy.NEVER // 생성하지 않지만, 이미 존재하면 사용
SessionCreationPolicy.STATELESS // 생성하지도 않고, 존재해도 사용하지 않음 (JWT 방식 등)
```





<br />

---

## 세션 제어 필터



### `SessionManagementFilter`

1. 세션관리 : 인증 시 사용자 세션정보를 등록, 조회, 삭제 등의 세션 이력 관리
2. 동시적 세션 제어 : 동일 계정으로 접속을 허용하는 최대 세션 수 제한
3. 세션 고정 보호 : 인증 시마다 세션쿠키를 새로 발급하여 공격자의 쿠키 조작 방지
4. 세션 생성 정책 : `ALWAYS`, `IF_REQUIRED`, `NEVER`, `STATELESS`



<br />

### `ConcurrentSessionFilter`

매 요청 마다 현재 사용자의 세션 만료 여부를 체크한다. 만료시 즉시 만료처리를 한다.

`session.isExpired()` 가 참이면 로그아웃 처리를 하고, 즉시 오류 페이지를 응답으로 리턴한다.

```shell
This session has been expired.
```



<br />

### 위 두 필터의 처리 과정

1) `/login` 요청시 `SessionManagementFilter` 의 최대 세션 허용 개수가 초과되었을 경우, 이전 사용자의 세션을 만료시킨다.

​	`session.expireNow()`

2) 이전 사용자가 요청을 보내면 `ConcurrentSessionFilter` 가 세션 만료 여부를 세션에서 확인한다. 만료되었다면 (`session.isExpired()`), 로그아웃시키고, 오류 페이지를 응답시킨다.



<br />

### 전반적 처리 과정



`UsernamePasswordAuthenticationFilter`

1. user1 가 로그인을 위해 `GET /login` 요청을 보낸다. `ConcurrentSessionControlAuthenticationStrategy` 클래스를 호출해서 session 의 count를 확인한다. 처음에는 0 이므로 통과한다.
2. 세션 고정 보호 처리를 한다. `ChangedSessionIdAuthenticationStrategy` 클래스가 새로운 세션 id 를 발급한다.
3. 사용자의 세션 session 1을 등록하고 정보를 저장한다.  `RegisterSessionAuthenticationStrategy` 클래스가 담당한다.
4. user2 가 동일한 아이디로 로그인을 위해 `GET /login` 요청을 보낸다. 
   * `인증 실패 전략` : 세션 카운드가 이미 1 증가한 상태이다. 이 떄 만약 최대 세션 허용개수가 1이라면 `SessionAuthenticationException` 이 발생하고 인증 실패 응답을 보낸다.
   * 또는 `세션 만료 전략`을 사용한다. `session.expireNow()` 메소드로 user1 의 세션을 만료시킨다. user2 는 인증이 성공하게 된다. 이어서 user2 도 세션 고정 보호처리를 하고, 새로운 세션 정보를 등록하여 이 때 총 세션의 개수는 2개가 된다.
5. 이 때 user1 이 어떤 요청을 보낸다. `ConcurrentSessionFilter` 가 세션이 만료되었는지 확인하는데, 이 때 user1 의 세션은 만료되었으므로 로그아웃하고, 오류 페이지를 응답으로 보낸다.



```java
http.sessionManagement()
  .maximumSessions(1) // 최대 허용 가능 세션, -1이면 무제한 로그인 세션 허용
  .maxSessionsPreventsLogin(true) // true: 인증 실패 전략, 최대 세션 수를 초과하면 마지막으로 접속한 사용자를 차단
  																// false(기본값): 세션 만료 전략, 최대 세션 수를 초과하면 이전에 접속한 사용자를 차단
```





<br />

---

## 인가: 권한설정과 표현식



선언적 방식: URL, Method

동적 방식 - DB 연동 : URL, Method



<br />

> 구체적인 경로가 윗 줄에 오고, 그것보다 큰 범위를 가진 경로는 아랫 줄에 오도록 해야 한다.

```java
http.antMatcher("/book/**")
  .authorizeRequests()
  .antMatchers("/book/login", "/book/users/**").permitAll()
  .antMatchers("/book/mypage").hasRole("USER")
  .antMatchers("/book/admin/pay").access("hasRole('ADMIN')")
  .antMatchers("/book/admin/**").access("hasRole('ADMIN') or hasRole('SYS')")
  .anyRequest().authenticated()
  ;
```

<br />

| 메소드                       | 동작                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `authenticated()`            | 인증된 사용자 접근 허용                                |
| `fullyAuthenticated()`       | 인증된 사용자 접근 허용, rememberMe 인증 제외          |
| `permitAll()`                | 모두 접근 허용                                         |
| `denyAll()`                  | 모두 접근 허용하지 않음                                |
| `anonymous()`                | 익명사용자의 접근 허용                                 |
| `rememberMe()`               | 기억하기를 통한 인증된 사용자 접근 허용                |
| `access(String)`             | SpEL 표현식이 참이면 접근 허용                         |
| `hasRole(String)`            | 사용자가 주어진 역할을 가지면 접근 허용                |
| `hasAuthority(String)`       | 사용자가 주어진 권한을 가지면 접근 허용                |
| `hasAnyRole(String...)`      | 사용자가 주어진 역할 중 어떤 것이라도 있으면 접근 허용 |
| `hasAnyAuthority(String...)` | 사용자가 주어진 권한 중 어떤 것이라도 있으면 접근 허용 |
| `hasIpAddress(String)`       | 주어진 IP로부터 요청이 왔다면 접근 허용                |



<br />

```java
@Configuration
@EnableWebSecurity
public class BookSecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    // 테스트용으로 사용자 아이디를 만들기 좋다.
    auth.inMemoryAuthentication().withUser("user").password("{noop}1234").roles("USER");
    auth.inMemoryAuthentication().withUser("sys").password("{noop}1234").roles("SYS", "USER");
    auth.inMemoryAuthentication().withUser("admin").password("{noop}1234").roles("ADMIN", "SYS", "USER");
  }
}
```

실제 운영에서는 아이디가 사용자에 의해 동적으로 만들어지므로 다른 방법을 사용한다.





<br />

---

## 예외 처리, 요청 캐시 필터



`ExceptionTranslatorFilter` 는 스프링 시큐리티에서 아래와 같은 구조로 위치해있다.

```java
try {
  // Spring Security 보안 필터 중 맨 마지막 위치
  FilterSecurityInterceptor
} catch (e) {
	// 예외 필터
  ExceptionTranslatorFilter
}
```



### `AuthenticationException` : 인증 예외 처리

1. `AuthenticationEntryPoint` 호출하여 로그인 페이지로 이동 또는 401 오류 코드를 전달 등의 처리를 한다.
2. 인증 예외가 발생하기 전 요청 정보를 저장한다.
   * RequestCache : 사용자의 이전 요청 정보를 세션에 저장하고, 이를 꺼내온다.
     * SavedRequest : 사용자가 요청했던 요청 파라미터 값들, 헤더값들을 저장한다.

<br />

### `AccessDeniedException` : 인가 예외 처리

* AcceeDeniedHandler 에서 예외를 처리하도록 제공한다.



<br/>

그림

![](https://i.ibb.co/yPsYvQW/2021-04-01-11-19-33.png)

1. 익명사용자 또는 리멤버미로 인증시킨 사용자는 `인증 예외` 프로세스로 진행된다.

`AuthenticationException` 을 거쳐 인증 실패 이후 처리로 `AuthenticationEntryPoint` 에서 `response.redirect("/login")` 로그인 페이지로 이동한다.

이 때 사용자의 요청 정보를 캐싱해두어, 후에 사용자가 인증 처리를 받았을 때 해당 페이지에 빨리 접근할 수 있도록 돕는다. 요청 정보는 `DefaultSavedRequest` 에 저장되어, Session, 더 크게는 `HttpSessionRequestCache` 에 저장된다.



2. 인증을 받았는데, 권한이 없어서 `인가 예외`를 받을수도 있다.

`AccessDeniedException` → `AccessDeniedHandler`→ `response.redirect("/denied")` 보통 access denied 페이지로 이동한다.



```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  http.formLogin() // Form 로그인 인증 기능
     .successHandler(loginSuccessHandler()) // 로그인 성공 후 핸들러
     .permitAll()
    
  and().exceptionHandling()
    .authenticationEntryPoint(authenticationEntryPoint()) // 인증 실패 처리
    .accessDeniedHandler(accessDeniedHandler()) // 인가 실패 처리
}
  
  
private AuthenticationEntryPoint authenticationEntryPoint() {
  return new AuthenticationEntryPoint() {
    @Override
    public void commence(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AuthenticationException e) throws IOException, ServletException {
      httpServletResponse.sendRedirect("/login");
    }
  };
}

private AccessDeniedHandler accessDeniedHandler() {
  return new AccessDeniedHandler() {
    @Override
    public void handle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AccessDeniedException e) throws IOException, ServletException {
      httpServletResponse.sendRedirect("/denied");
    }
  };
}

private AuthenticationSuccessHandler loginSuccessHandler() {
  return new AuthenticationSuccessHandler() {
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
      HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
      SavedRequest savedRequest = requestCache.getRequest(request, response);
      String redirectUrl = savedRequest.getRedirectUrl();
      response.sendRedirect(redirectUrl);
    }
  };
}
```

* `authenticationEntryPoint` 안에서 `commence` 메소드로 로그인 페이지로 이동시키도록 한다.







<br />

---

## CSRF, 사이트 간 요청 위조



![](https://i.ibb.co/QcPzJZJ/2021-04-02-12-20-49.png)

<br />

### CSRF, Cross-Site Request Forgery

사용자 브라우저에 저장된 쿠키정보를 악용해서, 사용자의 개인정보 등을 탈취하는 해킹 기법이다



`CsrfFilter`

* 서버는 모든 요청에 대해 토큰을 랜덤하게 생성하여 클라이언트에게 발급한다.  
* 클라이어트가 서버에 접속하기 위해 이 토큰을 HTTP 파라미터로 요구한다. 서버에 저장된 토큰 값과 비교하여 일치하지 않으면 인증 실패



Client

* `<input type="hidden" name="${_crsf.parameterName}" value="${_crsf.token}"`
* HTTP 메소드는 PATCH, POST, PUT, DELETE 를 사용할 수 있다.



스프링 시큐리티는 기본적으로 `http.csrf()` 가 활성화 되어 있으며, `http.crsf().disabled()` 로 비활성화 할 수 있다.

<br />



**Spring Security 의 다양한 필터들**

```shell
this = {FilterChainProxy$VirtualFilterChain@5960} 
 originalChain = {ApplicationFilterChain@5963} 
 additionalFilters = {ArrayList@5966}  size = 16
    0 = {WebAsyncManagerIntegrationFilter@5965} 
    1 = {SecurityContextPersistenceFilter@6714} 
    2 = {HeaderWriterFilter@6715} 
    3 = {CsrfFilter@6716} 
    4 = {LogoutFilter@6717} 
    5 = {UsernamePasswordAuthenticationFilter@6718} 
    6 = {DefaultLoginPageGeneratingFilter@6719} 
    7 = {DefaultLogoutPageGeneratingFilter@6720} 
    8 = {ConcurrentSessionFilter@6721} 
    9 = {RequestCacheAwareFilter@6722} 
    10 = {SecurityContextHolderAwareRequestFilter@6723} 
    11 = {RememberMeAuthenticationFilter@6724} 
    12 = {AnonymousAuthenticationFilter@6725} 
    13 = {SessionManagementFilter@6726} 
    14 = {ExceptionTranslationFilter@6727} 
    15 = {FilterSecurityInterceptor@6728} 
```



```
token = "db45e1e0-df6b-4b3d-a90e-c7e5dda7a829"
parameterName = "_csrf"
headerName = "X-CSRF-TOKEN"
```







