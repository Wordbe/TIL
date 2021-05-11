# Spring Security  로그인 구현 (part 2) - form login



본 글은 [Spring Security  로그인 구현 (part 1) - form login](https://wordbe.tistory.com/entry/Spring-Security-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84-part-1-form-login) 과 이어지는 글 입니다.

이전 글에서

1. 회원가입 후 회원정보를 DB 에 담기
2. 로그인 기능 구현

을 했습니다.



하지만, 로그인의 경우 기본 스프링이 제공해주는 `user` 라는 아이디와 콘솔창에서 제공해주는 패스워드를 사용해 로그인이 가능했었습니다.

이번 글에서는 DB에 저장된 사용자 아이디, 비밀번호를 비교하여 로그인 인증을 처리하는 방법을 서술합니다.



## 사용자이름 검증하기

1. 로그인 정보를 입력하고 post 요청을 하면, 이 때 전달한 username을 받아올 수 있습니다.
2. 받아온 username은 DB에 저장된 유저이름과 비교합니다.
3. 유저이름을 찾았다면 `AccountContext` 객체를 반환합니다.
4. 그렇지 않으면 예외를 던집니다.



먼저 `Authentication` 객체로부터 유저정보를 가져올 수 있는 구현체를 사용합니다. `UserDetailsService` 인터페이스를 구현합니다.

```java
@RequiredArgsConstructor
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("username 이 존재하지 않습니다: " + username));
        return new AccountContext(account);
    }
}
```

우리는 이를 구현함으로써 유저이름을 받아와서 DB에서 검색한 후, 

유저정보가 있다면 해당 유저정보를 담아서 다시 User 객체를 만들어 스프링 시큐리티에게 건내줄 것 입니다.

유저정보가 없다면, `UsernameNotFoundException` 예외를 발생시킵니다.



아래는 AccountContext 객체입니다.

```java
@Getter
public class AccountContext extends User{
    private final Account account;

    public AccountContext(Account account) {
        super(account.getUsername(), account.getPassword(), getAuthorities(account.getRole()));
        this.account = account;
    }

    private static Collection<? extends GrantedAuthority> getAuthorities(AccountRole role) {
        return Collections.singleton(new SimpleGrantedAuthority(role.getKey()));
    }
}
```

이 객체에 DB로 부터 받은 정보를 담아 스프링 시큐리티의 `AuthenticationProvider` 에게 전달해줄 것 입니다.

<br />

## 비밀번호 검증하기

1. 위에서 만든 `CustomUserDetilsService` 를 주입 받아 이용합니다.
2. 인증객체 `Authentication` 을 전달받아서 비밀번호를 비교합니다.
3. 비밀번호가 올바르면 인증토큰을 만들어 반환합니다.
4. 그렇지 않으면 예외를 던집니다.

```java
@RequiredArgsConstructor
@Component
public class FormAuthenticationProvider implements AuthenticationProvider {
    private final CustomUserDetailsService customUserDetailsService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = (String) authentication.getCredentials();

        AccountContext accountContext = (AccountContext) customUserDetailsService.loadUserByUsername(username);
        String passwordFromDb = accountContext.getAccount().getPassword();

        if (!passwordEncoder.matches(password, passwordFromDb)) {
            throw new BadCredentialsException("비밀번호가 틀립니다.");
        }

        return new UsernamePasswordAuthenticationToken(accountContext.getAccount(), null, accountContext.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
```

요청에서 받아온 회원정보와 DB 에서 가져온 회원정보를 비교하여, 비밀번호가 다르면 `BadCredentialException` 예외를 던집니다.

검증을 통과하면 `UsernamePasswordAuthenticationToekn` 에 인증 엔티티와 (비밀번호: null), 권한을 담아 반환합니다.



**config/security/SecuityConfig**

```java
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    private final FormAuthenticationProvider formAuthenticationProvider;
  
  	@Override
  	public void configure(HttpSecurity http) throws Exception {
      http.
        .formLogin()
          .loginPage("/login")
          .loginProcessingUrl("/login_proc")
          .successHandler(formSuccessHandler)
          .permitAll()
        .and()
        	.authenticationProvider(formAuthenticationProvider)
    }
      
    @Override
    protected void configure(AuthenticationManagerBuilder auth) {
      auth.authenticationProvider(formAuthenticationProvider);
    }
}
```

마지막으로 위에서 만들어준 객체를 `SecurityConfig` 에 빈으로 주입하여 `authenticationProvider()` 메소드에 등록합니다.



이로써 DB의 사용자 이름, 비밀번호를 비교하여 인증하는 간단한 절차를 알아보았습니다.





