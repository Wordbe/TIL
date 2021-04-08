# Spring security 004 - Form 인증 구현



## WebIgnore 설정

js/css/image 파일 등 보안 필터를 적용할 필요가 없는 리소스를 설정할 수 있다. 



<br />

---

## 사용자 DB 등록 및 PasswordEncoder

평문 지원 - NoOpPasswordEncoder 보안에 취약하므로 현재는 Deprecated



Spring security 5.0 이후

```java
PasswordEncoderFactories.createDelegatingPasswordEncoder();
```

* 여러 PasswordEncoder 유형을 선택할 수 있다.
* Password 는 인터페이스이므로 커스텀 암호화방식도 만들어 적용할 수 있다.



암호화 포맷

* `{id}encodedPassword`
* 기본 포맷은 bcrypt 이다. {bcrypt}인코딩된암호
* 그 외 알고리즘 종류로, noop, pbkdf2, scrypt, sha256 등이 있다.



인터페이스

* encode(password) : 패스워드 암호화
* matches(rawPassword, encodedPassword) : 패스워드 비교

<br />

---

## 로그아웃, 화면 보안 처리



### 로그아웃

* `<form>` 태그를 사용해서 `POST` 요청한다.
* 또는 `<a>` 태그 사용해서 `GET` 요청한다. 이 떄 `SecurityContextLogoutHandler` 를 활용한다.
* 인증여부에 따라 로그인/로그아웃 표현
  * `<li sec:authorize="isAnonymous()"><a th:href="@{/login}">로그인<a></li>`
  * `<li sec:authorize="isAuthenticated()"><a th:href="@{/logout}">로그아웃<a></li>`



```java
@GetMapping("/logout")
public String logout(HttpServletRequest request, HttpServletResponse response) {
  Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

  if (authentication != null) {
    new SecurityContextLogoutHandler().logout(request, response, authentication);
  }
  return "redirect:/login";
}
```

<br />

---

## 인증부가기능



### WebAuthenticationDetails, AuthenticationDetailsSource

![](https://i.ibb.co/r62NY0H/2021-04-07-11-35-23.png)

* details 는 Object 타입으로 어떤 속성이든 저장할 수 있다.
* `WebAuthenticationDetails`
  * 인증 과정 중 전달된 데이터를 저장한다.
  * `Authentication` 객체의 deatils 속성에 저장된다.
* `AuthenticationDetailsSource`
  * `WebAuthenticationDetails` 객체를 생성한다.

<br />

* `UsernamePasswordAuthenticationFilter`
* `WebAuthenticationDeatilsSource`
* `WebAuthenticationDetails`

<br />

```java
@Getter
public class FormWebAuthenticationDetails extends WebAuthenticationDetails {

  private String secretKey;

  public FormWebAuthenticationDetails(HttpServletRequest request) {
    super(request);
    secretKey = request.getParameter("secret_key");
  }
}
```

```java
@Component
public class FormAuthenticationDetailsSource implements AuthenticationDetailsSource<HttpServletRequest, WebAuthenticationDetails> {
  @Override
  public WebAuthenticationDetails buildDetails(HttpServletRequest context) {
    return new FormWebAuthenticationDetails(context);
  }
}
```

```java
http.formLogin()
  ...
  .authenticationDetailsSource(authenticationDetailsSource)
  ...
```

<br />

---

 ## 인증 성공 핸들러



```java
@Component
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private RequestCache requestCache = new HttpSessionRequestCache();
  private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
    // 로그인 성공시 로직을 여기에 구현

    setDefaultTargetUrl("/");

    SavedRequest savedRequest = requestCache.getRequest(request, response);
    // 이전 정보없이 로그인 했을 경우
    if (savedRequest != null) {
      String redirectUrl = savedRequest.getRedirectUrl();
      redirectStrategy.sendRedirect(request, response, redirectUrl);
    } else {
      redirectStrategy.sendRedirect(request, response, getDefaultTargetUrl());
    }
  }
}
```

```java
http.formLogin()
  ...
  .successHandler(customAuthenticationSuccessHandler)
  ...
```

<br />

## 인증 실패 핸들러



인증예외는 인증 검증시, 계정 없거나 비밀번호 일치하지 않는 등 인증예외가 발생한 경우 파라미터로 받아올 수 있다.

```java
@Component
public class CustomAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {

    String errorMessage = "Invalid Username or Password";

    if (exception instanceof BadCredentialsException) {
      errorMessage = "Invalid Username or Password";
    } else if (exception instanceof InsufficientAuthenticationException) {
      errorMessage = "Invalid Secret Key";
    }

    setDefaultFailureUrl("/login?error=true&exception=" + errorMessage);

    // 부모 클래스에게 처리 위임
    super.onAuthenticationFailure(request, response, exception);
  }
}
```

```java
http.formLogin()
  ...
  .failureHandler(customAuthenticationFailureHandler)
  ...
```

<br />

---

## 인증 거부 처리



### AccessDenied

```java
@Setter
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

  private String errorPage;

  @Override
  public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
    String deniedUrl = errorPage + "?exception=" + accessDeniedException.getMessage();
    response.sendRedirect(deniedUrl);
  }
}
```

```java
http.formLogin()
  ...
.and()
  .exceptionHandling()
  .accessDeniedHandler(customAccessDeniedHandler)
```

<br />

