# Spring Security  로그인 구현 (part 1) - form login





많은 서비스에서는 특정 사용자별로 할 수 있는 일이 다릅니다.

예를 들어, 네이버 밴드의 멤버탭을 들어가면 `Admin`, `Co-Admin` 권한을 특정 사람에게 부여할 수 있습니다.

이 들을 밴드 안의 글을 관리하고, 멤버를 초대하는 등의 역할을 할 수 있습니다.



이 글에서는 권한을 구현하기 위한 가장 기초,

회원가입과 로그인을 구현해보겠습니다.



## 회원가입 페이지 구성



**build.gradle**

```yaml
dependencies {
		implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
}
```

기본적으로 스프링 웹 MVC를 사용하고, 스프링 데이터 JPA 를 통해 데이터를 다루도록 하겠습니다.

<br />

**/web/controller**

```java
@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "home";
    }
}
```

home.html 파일은 [깃헙](https://github.com/Wordbe/community-webapp/blob/main/src/main/resources/templates/home.html)에 공유합니다.

홈에는 회원가입 버튼, 로그인 버튼을 만들어 놓습니다.

회원가입을 누르면 `/signup` URL 에 연결되며, 회원가입 페이지로 넘어가야 합니다. 이를 위해 컨트롤러와 화면을 하나 더 만듭니다.

```java
@RequiredArgsConstructor
@Controller
public class LoginController {
    private final AccountService accountService;

    @GetMapping("/signup")
    public String signup() {
        return "signup";
    }

    @PostMapping("/signup")
    public String signup(AccountSaveRequestDto requestDto) {
        accountService.save(requestDto);
        return "redirect:/";
    }
}
```

마찬가지로 signup.html 파일도 위 깃헙에 가시면 만들어 놓았습니다.

같은 URL 자원에 `PostMapping`도 매핑해놓았습니다. 이는 회원가입 등록 버튼을 누르면 서버에 회원정보가 전해져서 DB에 저장될 수 있도록 하기 위함입니다.



<br />

다음으로 사용자 정보를 담을 엔티티 객체와 레포지토리를 만듭니다.

**/domain/accounts**

```java
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@Entity
public class Account {

    @Id @GeneratedValue
    private Long id;

    private String username;

    private String password;

    private String email;

    @Enumerated(EnumType.STRING)
    private AccountRole role;
}
```

```java
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUsername(String username);
}
```

권한 값을 Enum으로 만들어 놓겠습니다.

```java
@Getter
@RequiredArgsConstructor
public enum AccountRole {
    USER("ROLE_USER", "일반사용자"),
    MANAGER("ROLE_MANAGER", "매니저"),
    ADMIN("ROLE_ADMIN", "관리자");

    private final String key;
    private final String title;
}
```

JPA 와 DB 연결은 [이 글](https://wordbe.tistory.com/entry/Spring-Data-JPA-Entity-%EA%B4%80%EA%B3%84-%EB%A7%A4%ED%95%91?category=1185015?category=1185015)을 참조해주시기 바랍니다. 간단한 구성을 위해 docker에서 postgreSQL 을 사용했습니다.

이렇게 되면 데이터베이스와 자바를 연결하는 객체를 생성하게 된 것입니다.

<br />

다음으로 컨트롤러에서 받은 데이터를 엔티티에 전달하도록 서비스를 만들어봅시다.

직접 엔티티 객체를 사용하는 대신 서비스에 맞는 DTO 객체를 따로 만들어 사용합니다.

**/web/dto**

```java
@Getter @Setter
@NoArgsConstructor
public class AccountSaveRequestDto {
    private String username;
    private String password;
    private String email;
    private AccountRole role;

    @Builder
    public AccountSaveRequestDto(String username, String password, String email, AccountRole role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    public Account toEntity() {
        return Account.builder()
                .username(username)
                .password(password)
                .email(email)
                .role(role).build();
    }
}
```

**/service**

```java
@RequiredArgsConstructor
@Service
public class AccountService {
    private final AccountRepository accountRepository;

    @Transactional
    public Long save(AccountSaveRequestDto requestDto) {
        return accountRepository.save(requestDto.toEntity()).getId();
    }
}
```

이 서비스를 위에서 만든 `LoginController`에 주입시켜서, 특정 요청과 매칭 시켜주면 됩니다.

서버를 실행시켜서 `localhost:8080` 자원을 요청해봅시다.

GET `/signup` 을 요청하면 회원 가입 페이지가 나오고, 여기에 정보를 입력한 후 버튼을 누르면

POST `/signup` 이 요청되면서, 내 정보가 서버의 DB에 저장될 것입니다.



이제 보안설정을 해봅시다.

<br />

## Spring Security 구성

보안 처리를 위해 스프링 시큐리티 프레임워크를 적극 이용해 봅니다.

스프링 시큐리티 의존성을 추가하면, 기본적으로 모든 자원에 인증을 요구하는 화면을 띄워줍니다.

먼저 의존성을 추가합니다.

**build.gradle**

```yaml
dependencies {
		...
    implementation 'org.springframework.boot:spring-boot-starter-security'
}
```



### Form Login

인증 방식에는 여러가지가 있는데 그 중 대표적으로 많이 사용하는 폼 로그인을 사용해봅시다.

우선 위 의존성을 추가하면, 아까 `/signup` 요청 시 보이던 화면이 보이지 않고, 인증화면으로 넘어갑니다.

그래서 특정 URL 은 인증을 허가하는 설정을 해봅시다.



**config/security/formlogin**

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/", "/signup").permitAll()
            .anyRequest().authenticated()
        .and()
            .formLogin()
            .loginPage("/login")
            .loginProcessingUrl("/login_proc")
            .permitAll()
    }

    @Override
    public void configure(WebSecurity web) {
        // /css/**, /images/**, /js/** 등 정적 리소스는 보안필터를 거치지 않게 한다.
        web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }
}
```

스프링 시큐리티 설정을 하기위해서는 `WebSecurityConfigurerAdapter` 클래스를 상속받습니다.

그리고 `@EnableWebSecurity` 어노테이션을 붙여야 합니다. 이 안에는 `@Configuration` 가 메타어노테이션으로 붙어있으므로, 스프링 빈에 등록되어 설정으로 관리가 됩니다.

그 후 `configure` 메소드를 오버라이딩하여 사용합니다.



* `"/", "/singup"` 요청은 허가도록 합니다.
* `anyRequest().authenticated` 그 외 요청에 대해서는 인증을 요구하도록 합니다.
* 폼로그인을 추가합니다.
  * 원래 기본 화면을 스프링 시큐리티가 제공하지만, 우리는 로그인 페이지를 따로만들겠습니다. `resources/templates/login.html` 
  * 로그인 페이지는 깃헙에 올려두었습니다.
  * `loginProcessingUrl()` : `login.html` 파일에서 로그인 버튼을 누르면 포스트 요청을 보내는데, 이 떄 액션 URL 을 등록합니다.
* 부모클래스에서 오버로딩된 configure 을 새롭게 오버라이딩하여 기본 설정을 추가합니다.
  * 스프링 시큐리티는 모든 자원에 대해 인증 요청을 요구하므로, 그럴 필요가 없는 정적파일 들에 대해서는 사용자에게 모두 보일 수 있게 하는 설정입니다.



컨트롤러에 간단하게 로그인 관련 요청을 매핑해봅시다.

**/web/controller*/LoginController.java***

```java
@GetMapping("/login")
public String login() {
  return "login";
}
```







