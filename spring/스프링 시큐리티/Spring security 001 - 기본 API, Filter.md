# Spring security 001 - 기본 API, Filter





간단한 컨트롤러 구현

```java
@RestController
public class BookController {

  @GetMapping("/")
  public String index() {
    return "home";
  }
}
```







## Spring security 의존성 추가

pom.xml

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```



스프링 시큐리티 의존성을 추가하면,

모든 요청에 대해 인증 과정이 추가된다.

* 서버 가동시 보안설정이 이루어진다.

  * 모든 요청은 인증되어야 자원에 접근이 가능하다.

  * 인증방식은 Form 로그인 방식, HTTPBasic 로그인 방식을 제공한다.

  * 기본 로그인 페이지를 제공한다.

  * 기본 계정 1개를 제공한다. (user / password, 패스워드는 콘솔에 출력해준다.)

    ```shell
    Using generated security password: 6101f358-****-****-****-e144****ea23
    ```

    

하지만, 기본 보안기능 외에 시스템에서 필요로하는 추가 보안기능이 필요하다.

이제 계정추가, 권한추가, DB 연동 등이 필요하다.



<br />

---

## 사용자 정의 보안 기능



현재까지 진행했다면 사용자 계정이 1개, 권한도 추가, 변경 기능 없음, 보안 옵션도 부재

![](https://i.ibb.co/WpMxMfr/2021-04-16-12-31-52.png)



* `WebSecurityConfigurerAdapter` : 웹 보안 초기화 및 설정
* `HttpSecurity` : 세부 보안 기능 설정 API 제공
  * 인증 API 
    *  `http.formLogin()`, `logout()`
    * `csrf()`
    * `httpBasic()`
    * `SessionManagement()`
    * `RememberMe()`
    * `ExceptionHandling()`
    * `addFilter()`
  * 인가 API
    * `http.authorizeRequests()`
    * `antMatchers(/admin)`
    * `hasRole(USER)`
    * `permitAll()`
    * `authenticated()`
    * `fullyAuthentication()`
    * `access(hasRole(USER))`
    * `denyAll()`
* `SecurityConfig` : 사용자 정의 보안 설정 클래스, `WebSecurityConfigurerAdapter` 를 상속받는다.



### 인증 API - SecurityConfig 설정



`WebSecurityConfigurerAdapter` 를 상속받아서 `configure` 메소드를 오버라이딩한다.

* `@EnableWebSecurity` : 이 어노테이션은 `WebSecurityConfiguration.class, SpringWebMvcImportSelector.class, OAuth2ImportSelector.class` 를 임포트한다. 따라서 스프링 시큐리티 기본 보안 설정이 활성화 된다. 

**사용자 정의**

```java
@Configuration
@EnableWebSecurity
public class BookSecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .authorizeRequests()
      .anyRequest().authenticated();
    http
      .formLogin()
      ;
  }
}
```

**application.properties**

```properties
spring.security.user.name=user
spring.security.user.password=1234
```





<br />

---

## Form 인증

![](https://i.ibb.co/8xDVYhc/2021-04-16-12-34-45.png)

1) Client → Server : 페이지 요청

2) Server → Client : 인증 안되면 로그인 페이지 redirect

3) Client → Server : POST 요청 (form data로 username과 password를 준다.)

4) Server는 인증 성공시 새로운 Session (id) 을 만들고, 인증 토큰을 생성하고 세션에 저장한다. Authenticatioin 타입의 클래스를 만들어 SecurityContext 에 저장한다. SecurityContext 는 세션에 저장된다.

* Session id 는 응답으로 클라이언트에게 전달되고, 이는 클라이언트 측 쿠키에 저장된다.
* 클라이언트가 다음에 접속할 때 이 id 를 같이 가져온다.

5) Client → Server : 페이지 요청, 세션에 저장된 인증토큰으로 접근하고, 서버는 인증을 유지한다. 

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
      
  http.formLogin() // Form 로그인 인증 기능
    .loginPage("/login.html") // 사용자 정의 로그인 페이지
    .defaultSuccessUrl("/home") // 로그인 성공 후 이동 페이지
    .failureUrl("/login.html?error=true") // 로그인 실패 후 이동 페이지
    .usernameParameter("username") // 아이디 파라미터명 설정
    .passwordParameter("password") // 패스워드 파라미터명 설정
    .loginProcessingUrl("/login") // 로그인 Form Action Url
    .successHandler(loginSuccessHandler()) // 로그인 성공 후 핸들러
    .failureHandler(loginFailureHandler()) // 로그인 실패 후 핸들러
    ;
}
```



<br />

---

## Form Login 인증 필터

![](https://i.ibb.co/MChQdwK/2021-04-16-12-36-45.png)

1. 요청이 들어오면 `UsernamePasswordAuthenticationFilter` : 요청 정보가 매칭되는지 확인한다.
2. `AntPathRequestMatcher("/login")` : 요청 url 이 "/login" (기본값) 인지 확인한다. 매칭되지 않으면 `chain.doFilter` 한다. 그리고 "/login" 화면으로 리다이렉트한다.
3. 사용자가 이름과 비밀번호를 입력하면 `Authentication` 안에 username, password 를 저장해서 인증 요청을 한다.
4. `AuthenticationManager` 은 여러 `AuthenticationProvider` (매니저의 구현체) 중 하나를 선택해서 인증 처리를 위임한다. 인증이 실패하면 `AuthenticationException` 예외를 발생시킨다.
5. 프로바이더는 인증이 성공하면 인증 객체 `Authentication` 에 User 객체와 Autorities (권한) 객체를 담아서 매니저에게 반환한다.
6. 인증 객체는 `SecurityContext` 에 저장된다. 이는 세션에 저장된다.
7. 인증이 성공하면 `SuccessHandler` 가 동작한다.



`UsernamePasswordAuthenticationFilter` 에 브레이크 포인트를 놓고, 디버깅해보면서 위 단계를 찾아보자.

<br />

---

## Logout



로그아웃 처리, LogoutFilter 에 대해 알아보자.

1) Client → Server : `/logout` 요청

2) Server → Client : 세션을 무효화하고, 인증토큰을 삭제한다. (SecurityContext 삭제), 쿠키가 있으면 삭제, 로그인 페이지로 리다이렉트 한다.



```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  
  http.logout() // 로그아웃 기능
    .logoutUrl("/logout") // 로그아웃 처리 URL
    .logoutSuccessUrl("/login") // 로그아웃 성공 후 이동페이지
    .deleteCookies("JSESSIONID", "remember-me") // 로그아웃 후 쿠키삭제
    .addLogoutHandler(logoutHandler()) // 로그아웃 핸들러
    .logoutSuccessHandler(logoutSuccessHandler()) // 로그아웃 성공 후 핸들러
    ;
}
```

* 스프링 시큐리티에서 로그아웃 요청은 원칙적으로는 POST 요청을 날린다.
* GET 으로 구현할 수는 있다.

<br />

![](https://i.ibb.co/n6b03KZ/2021-04-16-12-39-19.png)

1) 요청이 들어오면 `LogoutFilter` 가 동작한다.

2) `AntPathRequestMatcher("/logout")` 에서 url 이 매칭되지 않으면, 로그아웃은 무시하고 `chain.doFilter` 를 진행하여 다음 다른 필터를 찾는다.

3) 로그아웃 요청이라면, `SecurityContext` 객체로부터  `Authentication` 객체를 꺼내와서 `SecurityContextLogoutHandler` 에게 전달한다.

4) 이는 세션을 무효화, 쿠키 삭제, `SecurityContextHolder.clearContext()` 하여 `SecurityContext` 를 삭제한다.

5) 로그아웃이 성공하면, `LogoutFilter` 는 `SimpleUrlLogoutSuccessHandler` 를 통해서 "/login" 페이지로 리다이렉트한다.



<br />

---

## Remember Me 인증



'리멤버 미'란 세션이 만료되고 웹 브라우저가 종료된 후에도 애플리케이션이 사용자를 기억하는 기능이다.

* 로그인 시 사용자 기억
* 자동로그인

Remember-Me 쿠키에 대한 HTTP 요청을 확인한 후 토큰 인증을 사용해서 유효성 검사후 로그인 처리한다.

사용자 라이프 사이클

1) 인증 성공 (Remember-Me 쿠키 설정)

2) 인증 실패 (쿠키가 존재하면 쿠키 무효화)

3) 로그아웃 (쿠키가 존재하면 쿠키 무효화)

<br />

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {

    http.rememberMe() // rememberMe 기능 작동
      .rememberMeParameter("remember-me") // 기본 파라미터명은 remember-me
      .tokenValiditySeconds(3600) // Default는 14일
      .alwaysRemember(false) // true 로 하면 리멤버 미 기능이 활성화되지 않아도 항상 실
      .userDetailsService(userDetailsService) // 사용자 계정 조회시 필요
      ;
  }
}
```

<br />

[EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg/related?hl=ko) 크롬 확장 프로그램을 추가하면, 해당 크롬 탭의 쿠키정보를 보고, 삭제할 수도 있다.

로그인을 하면 JSESSION 에 쿠키가 하나 생성된다.

![](https://i.ibb.co/LYGF3PJ/2021-03-31-12-37-58.png)

따라서 새로고침을 누르면, 다시 로그인을 할 필요가 없다.

새로고침, 즉 같은 url 을 요청할 때 쿠키에 있던 세션 id 를 같이 전달해주고, 서버는 이를 확인하여 세션에 있는 인증정보와 맞으면 요청을 인가해준다.

하지만 이 쿠키를 삭제하고, 다시 새로고침을 하면 로그인 화면으로 돌아가게 된다.



### Remember me



![](https://i.ibb.co/xJGZzrx/2021-03-31-12-41-09.png)

리멤버 미를 누르고 로그인을 해보자.

이번에는 쿠키정보에 리멤버미가 있는 것을 볼 수 있다.

![](https://i.ibb.co/WGcXmLf/2021-03-31-12-42-00.png)

이제 JSESSIONID 쿠키 정보를 삭제해도, 리멤버미에 user 정보, 세션 아이디 정보가 있으므로

새로고침하여도 로그인화면 없이 인증이 되게 된다.



<br />

---

## Remember Me 인증 필터

![](https://i.ibb.co/fMLp1gN/2021-04-16-12-42-06.png)

<br />

1. 요청이 들어오면 `RememberMeAuthenticationFilter` 가 작동한다.
   * `Authentication` 객체가 null 이 아닐 경우 이 필터가 동작한다. `Authentication` 이 있어서 인증을 받았다면, 이 필터가 작동할 필요가 없기 때문이다.
   * 또는 요청 시 헤더에 remember-me 쿠키를 가져온 경우 작동할 수 있다.
2. `RememberMeServices` 를 인터페이스를 호출한다. 이 인터페이스는 두 개의 구현체를 제공한다.
   * `TokenBasedRememberMeServices` 구현클래스는 메모리에 있는 토큰과 사용자가 들고온 토큰을 비교한다.
   * `PersisentTokenBasedRememberMeServices` 는 DB 에 저장된 토큰과 사용자가 들고온 토큰을 비교하여 인증 처리를 한다.
3. Token 을 추출하고, Token 이 존재하는지 판단하여 없으면 `chain.doFilter` 를 통해 다음 필터로 넘어간다.
4. 토큰이 존재한다면 Decode Token 하여 정상 유무를 판단한다. 비정상이면 예외를 발생시킨다.
   * 토큰이 서로 일치하지 않으면 예외 발생시킨다.
   * User 계정이 존재하지 않으면 예외를 발생시킨다.
   * 여기까지 다 통과했다면, 새로운 `Authentication` 객체를 생성하여 `AuthenticationManager` 에게 전달하여 인증처리를 완료한다.









