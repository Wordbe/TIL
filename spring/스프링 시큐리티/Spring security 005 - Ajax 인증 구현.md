# Spring security 005 - Ajax 인증 구현



![](https://i.ibb.co/Wnyj0FZ/2021-04-08-12-53-11.png)



Ajax 인증은 전체적인 구조는 Form Login 방식과 비슷하지만, Form Login 가 동기적 방식이라면 Ajax 는 비동기라는 차이점이 있다.

<br />

---

## 인증 필터

<br />

### AjaxAuthenticationFilter

* `AbstractAuthenticationProcessingFilter` 를 상속한다.

* 필터작동조건

  * `AntPathRequestMatcher("/api/login")` 로 요청정보와 매칭하여 요청방식이 Ajax 이면 필터가 작동하게 한다.

* `AjaxAuthenticationToken` 을 생성하여 `AuthenticationManager` 에게 전달하여 인증을 처리한다.

* Filter 추가

  ```java
  http.addFilterBefore(AjaxAuthentiationFilter(), UsernamePasswordAuthenticationFilter.class)
  ```

  



## 인증 처리자

<br />

### AjaxAuthenticationProvider

ajax를 위한 인증처리

```java
@RequiredArgsConstructor
@Component
public class AjaxAuthenticationProvider implements AuthenticationProvider {

  private final UserDetailsService userDetailsService;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {

    String username = authentication.getName();
    String password = (String) authentication.getCredentials();

    AccountContext accountContext = (AccountContext) userDetailsService.loadUserByUsername(username);

    if (!passwordEncoder.matches(password, accountContext.getAccount().getPassword())) {
      throw new BadCredentialsException("Invalid Password");
    }

    AjaxAuthenticationToken authenticationToken
      = new AjaxAuthenticationToken(accountContext.getAccount(), null,
                                    accountContext.getAuthorities());

    return authenticationToken;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(AjaxAuthenticationToken.class);
  }
}
```



```java
@RequiredArgsConstructor
@Configuration
@Order(99)
public class AjaxSecurityConfig extends WebSecurityConfigurerAdapter {

  private final AjaxLoginProcessingFilter ajaxLoginProcessingFilter;
  private final AjaxAuthenticationProvider ajaxAuthenticationProvider;

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(ajaxAuthenticationProvider);
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .antMatcher("/api/**")
      .authorizeRequests()
      .anyRequest().authenticated()
      .and()
      .addFilterBefore(ajaxLoginProcessingFilter, UsernamePasswordAuthenticationFilter.class)
      ;

    http.csrf().disable();

  }
}
```

`configure` 메소드를 오버라이딩하여 `auth` 를 파라미터로 받아 프로바이더를 등록해보자.

`ProviderManager` 에서 기본으로 `AnonymousAuthenticationProvider` 를 거치고, 추가로 parent 에 우리가 만든 `AjaxAuthenticationProvovider` 가 등록된다.

인증 성공시 `AjaxAuthenticationToken` 을 발급하게 된다.

<br />

---

## 인증 및 인가 예외 처리





```java
public class AjaxLoginAuthenticationEntryPoint implements AuthenticationEntryPoint {

  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e) throws IOException, ServletException {
    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "UnAuthorized");
  }
}

```

Ajax 로그인 인증 엔트리포인트

아래에서 예외 핸들링시 이 엔트리포인트를 호출하여 인가를 처리한다. (익명사용자가 접근했을 때 처리한다. (로그인화면으로 돌아간다던지))



```java
public class AjaxAccessDeniedHandler implements AccessDeniedHandler {

  @Override
  public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException e) throws IOException, ServletException {
    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access is denied");
  }
}
```

접근 거절시 동작할 핸들러이다. (인증을 받지 않은 사용자가 접근했을 때 처리한다.(에러 메시지를 보낸다던지) )



```java
http
  .exceptionHandling()
  .authenticationEntryPoint(new AjaxLoginAuthenticationEntryPoint())
  .accessDeniedHandler(new AjaxAccessDeniedHandler());
```

<br />

---

## DSL 도메인 특화 언어

### Ajax인증 - DSL(Domain-specific language) 로 Config 설정하기

Custom DSLs

* `AbstractHttpConfigurer`

  * 스프링 시큐리티 초기화 설정 클래스
  * 필터, 핸들러, 메서드, 속성 등을 한 곳에 정의하여 처리할 수 있는 편리함을 제공한다.

  ```java
  public void init(H http) throws Exception 초기화
  public void configure(H hhtp) 설정
  ```

* `HttpSecurity` 의 `apply(C configurer)` 메서드 사용



`SecurityConfigurer` 추상 클래스를 탐색한다.

* `AbstractConfiguredSecurityBuilder`
  * configurers
* `AjaxLoginConfigurer` (우리가 만든 클래스)

```java
public final class AjaxLoginConfigurer<H extends HttpSecurityBuilder<H>> extends
        AbstractAuthenticationFilterConfigurer<H, AjaxLoginConfigurer<H>, AjaxLoginProcessingFilter> {

  private AuthenticationSuccessHandler successHandler;
  private AuthenticationFailureHandler failureHandler;
  private AuthenticationManager authenticationManager;

  public AjaxLoginConfigurer() {
    super(new AjaxLoginProcessingFilter(), null);
  }

  @Override
  public void init(H http) throws Exception {
    super.init(http);
  }

  @Override
  public void configure(H http) {

    if(authenticationManager == null){
      authenticationManager = http.getSharedObject(AuthenticationManager.class);
    }
    getAuthenticationFilter().setAuthenticationManager(authenticationManager);
    getAuthenticationFilter().setAuthenticationSuccessHandler(successHandler);
    getAuthenticationFilter().setAuthenticationFailureHandler(failureHandler);

    SessionAuthenticationStrategy sessionAuthenticationStrategy = http
      .getSharedObject(SessionAuthenticationStrategy.class);
    if (sessionAuthenticationStrategy != null) {
      getAuthenticationFilter().setSessionAuthenticationStrategy(sessionAuthenticationStrategy);
    }
    RememberMeServices rememberMeServices = http
      .getSharedObject(RememberMeServices.class);
    if (rememberMeServices != null) {
      getAuthenticationFilter().setRememberMeServices(rememberMeServices);
    }
    http.setSharedObject(AjaxLoginProcessingFilter.class,getAuthenticationFilter());
    http.addFilterBefore(getAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
  }

  public AjaxLoginConfigurer<H> successHandlerAjax(AuthenticationSuccessHandler successHandler) {
    this.successHandler = successHandler;
    return this;
  }

  public AjaxLoginConfigurer<H> failureHandlerAjax(AuthenticationFailureHandler authenticationFailureHandler) {
    this.failureHandler = authenticationFailureHandler;
    return this;
  }

  public AjaxLoginConfigurer<H> setAuthenticationManager(AuthenticationManager authenticationManager) {
    this.authenticationManager = authenticationManager;
    return this;
  }

  @Override
  protected RequestMatcher createLoginProcessingUrlMatcher(String loginProcessingUrl) {
    return new AntPathRequestMatcher(loginProcessingUrl, "POST");
  }

}
```

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

  http
    .antMatcher("/api/**")
    .authorizeRequests()
    .antMatchers("/api/messages").hasRole("MANAGER")
    .antMatchers("/api/login").permitAll()
    .anyRequest().authenticated()
    .and()
    .exceptionHandling()
    .authenticationEntryPoint(new AjaxLoginAuthenticationEntryPoint())
    .accessDeniedHandler(ajaxAccessDeniedHandler())
    ;
  http.csrf().disable();

  customConfigurerAjax(http);
}

private void customConfigurerAjax(HttpSecurity http) throws Exception {
  http
    .apply(new AjaxLoginConfigurer<>())
    .successHandlerAjax(ajaxAuthenticationSuccessHandler())
    .failureHandlerAjax(ajaxAuthenticationFailureHandler())
    .setAuthenticationManager(authenticationManagerBean())
    .loginProcessingUrl("/api/login");
}
```

<br />

---

## 로그인 Ajax 구현

* 헤더 설정
  * 전송 방식이 Ajax 인지 여부를 위한 헤더설정
  * `xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")`



## CSRF 헤더 설정

https://github.com/onjsdnjs/corespringsecurity/blob/ch04-19/src/main/resources/templates/login.html

