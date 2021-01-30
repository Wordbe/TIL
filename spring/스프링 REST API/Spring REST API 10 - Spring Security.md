# Spring REST API 10 - Spring Security







<br />

spring security 를 추가하는 순간 기본적으로 모든 url 요청 시 로그인 인증 화면으로 넘어가게 된다.

커스터마이징 설정을 해보자.

Security 설정 파일을 만들어보자.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    AccountService accountService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Bean
    public TokenStore tokenStore() {
        return new InMemoryTokenStore();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(accountService)
                .passwordEncoder(passwordEncoder);
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().mvcMatchers("/docs/index.html");
        web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }
}
```

* `WebSecurityConfigurerAdapter` 를 상속받는 클래스를 `@Configuration` 을 통해 빈으로 등록하고, `@EnableWebSecurity` 어노테이션을 달아주는 순간 기존 스프링 시큐리티가 스프링부트에 제공하는 자동설정은 동작하지 않고, 우리가 작성하는대로 설정을 커스터마이징할 수 있다.
* TokenStore 는 토큰 정보를 인메모리에 저장해준다.
* `authenticationManagerBean` 인증을 관리하는 빈을 추가해준다.
* configure : auth 를 파라미터로 주었을 때, `UserDetailsService` 에 유저 설정을 넘겨주고, 패스워드 인코딩도 넘겨준다.
* configure : web 을 파라미터로 주었을 때, `ignoring()` 메소드로 필터기능을 할 수 있다. 즉 `/docs/index.html` 요청 시 인증하면으로 넘어가지 않도록 하고 있다. 뿐만 아니라 스프링부트가 제공하는 기본 staic 리소스들을 요청하여도 무시하도록 코드를 작성할 수 있다.





<br />

---

## 폼 인증 설정



Http 요청을 했을 시 폼인증 화면이 나오도록 만들어보자.

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  http
    .anonymous()
  	  .and()
    .formLogin()
    	.and()
    .authorizeRequests()
      .mvcMatchers(HttpMethod.GET, "/api/**").anonymous()
      .anyRequest().authenticated();
}
```

http 를 익명의 사용자가 접근할 때,

폼 로그인 화면을 보여주는데, 인증화면을 요청한다.

 `/api/**` url 요청의 경우 익명 사용자 아무에게나 열어주고, 그 밖에 다른 요청은 인증을 요청한다.



<br />

설정 파일에 다음을 추가시켜주자.

애플리케이션이 실행될 때, 인증정보를 저장소에 미리 넣어놓을 것이다. 즉 이 아이디와 비밀번호로 인증을 할 것이다.

```java
@Bean
public ApplicationRunner applicationRunner() {
  return new ApplicationRunner() {

    @Autowired
    AccountService accountService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
      Account woody = Account.builder()
        .email("woody@example.com")
        .password("1234")
        .roles(Set.of(AccountRole.ADMIN, AccountRole.USER))
        .build();
      accountService.saveAccount(woody);
    }
  };
}
```

<br />

AccountService 에는 패스워드 인코더를 추가해야한다. 사용자로부터 비밀번호를 입력받았을 때, 패스워드 인코딩을 하지 않고 저장소에 담으면, 법적으로 큰 문제가 생긴다.

```java
@Service
public class AccountService implements UserDetailsService {

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    public Account saveAccount(Account account) {
        account.setPassword(this.passwordEncoder.encode(account.getPassword()));
        return  this.accountRepository.save(account);
    }
		...
}
```





<br />

---

## OAuth2 인증 서버 설정 (AuthorizationServer)



스프링 시큐리티 OAuth 2.0 을 사용해보자.

`AuthorizationServer` 에서 `OAuth2` 는 토큰 발행(/oauth/token)과 토큰 인증(/oauth/authorize) 을 한다. Order 0 으로 리소스 서버보다 우선 순위가 높다.

`ResourceServer` 에서 리소스 요청 인증을 처리한다. 즉, OAuth2 토큰을 검사한다. Order 는 3 이다.



<br />

먼저 스프링 시큐리티 테스트 의존성을 추가한다.

pom.xml

```xml
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-test</artifactId>
  <version>${spring-security.version}</version>
  <scope>test</scope>
</dependency>
```



<br />

인증 토큰을 발급 받는 테스트 코드를 작성해보자.

```java
class AuthServerConfigTest extends BaseControllerTest {

    @Autowired
    AccountService accountService;

    @Test
    @DisplayName("인증 토큰을 발급 받는 테스트")
    public void getAuthToken() throws Exception {
        // Given
        String username = "reddy@example.com";
        String password = "4321";
        Account reddy = Account.builder()
                .email(username)
                .password(password)
                .roles(Set.of(AccountRole.ADMIN, AccountRole.USER))
                .build();
        this.accountService.saveAccount(reddy);

        // When    
	      String clientId = "snow";	
        String clientSecret = "1234";
        this.mockMvc.perform(post("/oauth/token")
                .with(httpBasic(clientId, clientSecret))
                .param("username", username)
                .param("password", password)
                .param("grant_type", "password")
        )
        // Then
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("access_token").exists());
    }
}
```



**When**

* auth2 에서는 `/oauth/token` 주소에 토큰을 보내도록 정해놓았다.
* basic oauth 헤더를 만든다. 이 때 클라이언트 아이디와 비밀번홀ㄹ 넣는다.
* 파라미터로 사용자이름, 비밀번호, grant_type 을 만들어준다. grant_type=password 는 페이스북, 유투브 등이 쓰는 비밀번호 수여 방식이다. 사용자의 인증 정보를 직접 가지고 있는 앱에서만 사용하는 방식이다.



<br />

```java
@Configuration
@EnableAuthorizationServer
public class AuthServerConfig extends AuthorizationServerConfigurerAdapter {

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    AccountService accountService;

    @Autowired
    TokenStore tokenStore;

    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
        security.passwordEncoder(passwordEncoder);
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.inMemory()
                .withClient("snow")
                .authorizedGrantTypes("password", "refresh_token")
                .scopes("read", "write")
                .secret(this.passwordEncoder.encode("1234"))
                .accessTokenValiditySeconds(10 * 60)
                .refreshTokenValiditySeconds(6 * 10 * 60);
    }

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        endpoints.authenticationManager(authenticationManager)
                .userDetailsService(accountService)
                .tokenStore(tokenStore);
    }
}
```



configure 메소드 3개를 오버라이딩 할 것이다.

* 첫 번째는 우리가 만들어놓은 passwordEncoder 를 oauth2 가 사용하게 한다.
* 두 번째는 인메모리에 하나의 클라이언트 정보를 등록한다. (테스트용) jdbc 등을 써서 인메모리가 아닌 데이터베이스에서 관리하는게 이상적일 것이다.
* 세번째는 우리의 인증 정보를 아는 매니저로 선택해주고, 우리가 설정한 유저, tokenStore 를 설정한다.



<br />

---

## 리소스 서버 설정 (ResourceServer)



리소스 서버는 Oath 서버와 연동되어 사용된다. 외부 요청이 리소스에 접근할 때, oauth 서버에서 제공하는 토큰을 받아 인증된 정보인지 확인하고 제어한다.

리소스 서버는 이벤트 서버와 같이 있고, 인증 서버는 별도로 존재하는 것이 옳다.

로컬에서 테스트할 때는 두 서버 모두 같이 로컬서버로 사용한다.



리소스 서버 설정을 해보자.

```java
@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
        resources.resourceId("event");
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
            .anonymous()
                .and()
            .authorizeRequests()
                .mvcMatchers(HttpMethod.GET, "/api/**")
                    .anonymous()
                .anyRequest()
                    .authenticated()
                .and()
            .exceptionHandling()
                .accessDeniedHandler(new OAuth2AccessDeniedHandler());
    }
}
```



이제 테스트 코드로 넘어간다.

예전에 만들어놓았던 이벤트 컨트롤러 테스트 중 하나다.

```java
@Test
@DisplayName("이벤트 생성 정상 테스트")
public void createEvent() throws Exception {
  // Given
  EventDto event = EventDto.builder()
    .name("Spring")
    ...
    .build();

  // When
  mockMvc.perform(post("/api/events")
                  .header(HttpHeaders.AUTHORIZATION, getBearerToken())
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaTypes.HAL_JSON)
                  .content(objectMapper.writeValueAsString(event))
                 )
 // Then
    ...
}

private String getBearerToken() throws Exception {
  return "Bearer " + getAccessToken();
}

private String getAccessToken() throws Exception {
  // Given
  String username = "reddy@example.com";
  String password = "4321";
  Account reddy = Account.builder()
    .email(username)
    .password(password)
    .roles(Set.of(AccountRole.ADMIN, AccountRole.USER))
    .build();
  this.accountService.saveAccount(reddy);

  // When
  String clientId = "snow";
  String clientSecret = "1234";
  ResultActions perform = this.mockMvc.perform(post("/oauth/token")
                                               .with(httpBasic(clientId, clientSecret))
                                               .param("username", username)
                                               .param("password", password)
                                               .param("grant_type", "password")
                                              );
  String responseBody = perform.andReturn().getResponse().getContentAsString();
  Jackson2JsonParser parser = new Jackson2JsonParser();
  return parser.parseMap(responseBody).get("access_token").toString();
}
```

스프링 시큐리티가 추가되면서 기본적으로 모든 웹 요청은 인가를 받아야 들어갈 수 있는데,  `/api/events` 도 예외는 아니다.

따라서 요청 헤더에 `.header(HttpHeaders.AUTHORIZATION, getBearerToken())` 인증정보로 `AuthorizationServer` 생성한 토큰을 넣어주면 된다.





> 인증 정보 유무에 따른 url 요청/응답 테스트는 `Postman` 앱을 다운받아서 하면 편리하다.







