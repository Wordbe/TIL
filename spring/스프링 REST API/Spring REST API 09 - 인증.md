# Spring REST API 09 - 인증



인증 엔터티를 하나 만들어보자.

```java
@Entity
@Getter @Setter @EqualsAndHashCode(of = "id")
@Builder @AllArgsConstructor @NoArgsConstructor
public class Account {

    @Id @GeneratedValue
    private Integer id;

    private String email;
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<AccountRole> roles;
}

```

roles 필드는 권한 정보를 담고 있는 `enum` 타입의 필드이다. 여러 값을 가지는데, `@ElementCollection` 은 이를 명시한다. 특히 타입이 Set 이기 때문에 이 필드가 특정 콜렉션에 해당한다고 설정할 수 있다. 컬렉션에 저장될 정보는 별도의 테이블에 존재하게 된다.

기본값은 `LAZY` 이지만, 이 필드를 자주 사용하는 경우가 많아서 `EAGER` 모드로 한다. `@ElementCollection(fetch = FetchType.EAGER)` 로 설정해서 즉시 로딩으로 가져오도록 한다.

<br />

enumerator 는 두 권한을 가진다고 설정한다.

```java
public enum AccountRole {
    ADMIN, USER
}
```



<br />

---

## Spring Security

기능은 크게 두가지가 있다.

* 웹 시큐리티 : 웹 요청에 보안 인증을 한다. Filter 기반의 시큐리티이다. (FilterSecurityInterceptor)
* 메소드 시큐리티 : 메소드가 호출 되었을 때 보안을 인증한다. 껍데기를 만들어서 보안 기능을 추가하는 AOP 형태로 되어있다.  (MethodSecurityInterceptor)

둘 다 **시큐리티 인터셉터**를 사용한다.

* 시큐리티 인터셉터는 **`SecurityContextHolder` 저장소**를 사용한다. 이는 `ThreadLocal`(자바에서 한 쓰레드 내에서 공유하는 저장소 클래스) 의 구현체이다. 여기서 인증 정보를 저장해놓았다가 꺼낼 것이다. 꺼낼 수 있다면 인증된 사용자가 있는 것이고, 없으면 인증된 적이 없는 것이다.
* 인증 정보를 받았다면 **로그인을 위해 `AuthenticationManager`** 를 사용한다. 이에 관한 구현체 2개가 있는데, `UserDetailsService`, `PasswordEncoder` 가 있다. 각각 사용자 정보와 패스워드 인코딩을 담당하고, 여기서 인증된 id, password 는 위의 `SecurityContextHolder` 에 저장된다.
* 인증이 되었다면 **`AccessDecisionManager`에서 권한 정보**가 적절한지 확인한다. 보통 User의 roles 정보를 사용한다. 예) ADMIN, USER





<br />

---

## Security 구현



`oauth2` 의존성을 추가한다.

pom.xml

```xml
<!-- https://mvnrepository.com/artifact/org.springframework.security.oauth.boot/spring-security-oauth2-autoconfigure -->
<dependency>
    <groupId>org.springframework.security.oauth.boot</groupId>
    <artifactId>spring-security-oauth2-autoconfigure</artifactId>
    <version>2.4.1</version>
</dependency>
```

> 주의
>
> 스프링 시큐리티 의존성이 추가되는 순간 스프링부트 자동설정에 시큐리티가 자동등록되므로, 모든 url은 인증을 필요로 하게 된다.
>
> 따라서 기존 작성해 놓은 테스트코드가 모두 실패할 수 있다.



accounts 패키지를 만들고, `Account` 엔터티(table)와, 레포지토리(DAO), 롤(권한 정보)을 만들자.

아, 그전에 테스트를 먼저 만들어보면서 만들 것이 무엇인지 목표를 잡아보자.

```java
@SpringBootTest
class AccountServiceTest {

    @Autowired
    AccountService accountService;

    @Autowired
    AccountRepository accountRepository;

    @Test
    public void findByUsername() {
        // Given
        String username = "red@example.com";
        String password = "1234";
        Account account = Account.builder()
                .email(username)
                .password(password)
                .roles(Set.of(AccountRole.ADMIN, AccountRole.USER))
                .build();
        this.accountRepository.save(account);

        // When
        UserDetailsService userDetailsService = accountService;
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails.getPassword()).isEqualTo(password);
    }
  
 	@Test
  public void findByUsernameFail() {
    String username = "fail@example.com";
    try {
      accountService.loadUserByUsername(username);
      fail("supposed to be failed");
    } catch (UsernameNotFoundException e) {
      assertThat(e.getMessage()).containsSequence(username);
    }
  }
}
```



**첫번째 Test**

엔터티와 서비스가 주어지고, 레포지토리가 주어졌다고 가정한다.

* Given : 사용자이름과 비밀번호를 입력하고, 이 때 모든 권한을 준 상태로 레포지토리에 저장한다. (INSERT)
* When : 이제, 서비스가 있을 것인데 우리는 Spring Security 의 `UserDetailsService` 의 구현체를 등록하여 웹 시큐리티를 구현할 것이다.

<br />



**두번째 Test**

등록되지 않은 아이디는 레포지토리에 없으므로 에러를 일으킬 것이다. 그래서 catch 구문으로 자연스럽게 들어간다고 가정하고 코드를 작성한다.

`UsernameNotFoundException` 의 메시지를 테스트해주는 코드를 작성하면 된다.



<br />

엔터티 생성.

```java
@Entity
@Getter @Setter @EqualsAndHashCode(of = "id")
@Builder @AllArgsConstructor @NoArgsConstructor
public class Account {

    @Id @GeneratedValue
    private Integer id;

    private String email;
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<AccountRole> roles;
}
```

레포지토리 생성

```java
public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByEmail(String username);
}
```

롤 enum 생성

```java
public enum AccountRole {
    ADMIN, USER
}
```

여기에 추가로 우리가 만든 인증(Account) 엔터리를 원래 Event 엔터티에 관계를 매핑해주면 된다.

```java
...
  @ManyToOne
  private Account manager;
```



<br />

<br />

<br />

이제 UserDetailsSerivce 를 구현하는 서비스를 만들어보자. 오버라이드 메소드를 만들어주면 `loadUserByUsername` 을 반드시 구현해야한다.

```java
@Service
public class AccountService implements UserDetailsService {

    @Autowired
    AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return new User(account.getEmail(), account.getPassword(), authorities(account.getRoles()));
    }

    private Collection<? extends GrantedAuthority> authorities(Set<AccountRole> roles) {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE " + r.name()))
                .collect(Collectors.toSet());
    }
}
```

이 메소드에서 레포지토리로부터 사용자이름과 비밀번호를 찾아와서, 권한 정보(`authorities`)를 같이주어 리턴하면 된다. 여기서 사용하는 `User()` 클래스는 스프링 시큐리티가 제공하는 유저 객체이다.

`authorties`는 아래 메소드로 구현하면 된다. 























