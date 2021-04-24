# Spring Security  로그인 구현 (part 3) - OAuth2.0





먼저 OAuth2.0 로그인용 엔티티를 생성합니다.

```java
@Getter
@NoArgsConstructor
@Entity
public class OAuthAccount {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column
    private String picture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountRole role;

    @Builder
    public OAuthAccount(String name, String email, String picture, AccountRole role) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.role = role;
    }

    public OAuthAccount update(String name, String picture) {
        this.name = name;
        this.picture = picture;

        return this;
    }

    public String getRoleKey() {
        return this.role.getKey();
    }
}
```

관련 레포지토리도 필요합니다. 소셜인증은 주로 이메일이 사용자를 구분하는 키가 될 수 있으니, 이메일로 찾아봅시다.

(물론 카카오의 다른 이메일도 있으니 추가적인 구분자를 필요로 할 수 있습니다. 여기서는 구글같이 이메일로 구분되는 케이스만 고려해봅시다.)

```java
public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {
    Optional<OAuthAccount> findByEmail(String email);
}
```



OAuth2.0 인증은 폼로그인과 마찬가지로 `WebSecurityConfigurerAdapter` 를 상속받아 configure 메소드를 오버라이딩하여 구현합니다.

```java
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    private final FormAuthenticationProvider formAuthenticationProvider;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/", "/signup").permitAll()
            .anyRequest().authenticated()
        .and()
            .oauth2Login()
                .userInfoEndpoint()
                    .userService(customOAuth2UserService)
        ;
    }
  ...
}
```

`userInfoEndpoint` 는 OAuth2 로그인 성공 후 사용자 정보를 가져올 때 설정을 담당합니다. 

`userService` 에 소셜 로그인 성공 시 진행할 `OAuth2UserService` 인터페이스의 구현체를 등록합니다. 리소스 서버(Google, 네이버, 카카오 등) 에서 사용자 정보를 가져온 상태에서 추가 진행하고자 하는 기능을 구현합니다.

<br />

**/security/oauth2login**

```java
@RequiredArgsConstructor
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final OAuthAccountRepository oAuthAccountRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        OAuthAttributes attributes = OAuthAttributes.of(registrationId,
                userNameAttributeName,
                oAuth2User.getAttributes());

        OAuthAccount oAuthAccount = saveOrUpdate(attributes);

        return new DefaultOAuth2User(Collections.singleton(new SimpleGrantedAuthority(oAuthAccount.getRoleKey())),
                attributes.getAttributes(),
                attributes.getNameAttributeKey());
    }

    private OAuthAccount saveOrUpdate(OAuthAttributes attributes) {
        OAuthAccount oAuthAccount = oAuthAccountRepository.findByEmail(attributes.getEmail())
                .map(entity -> entity.update(attributes.getName(), attributes.getPicture()))
                .orElse(attributes.toEntity());

        return oAuthAccountRepository.save(oAuthAccount);
    }
}
```

OAuth 인증 성공 후 `userRequest` 를 통해 사용자 정보를 받아옵니다. 여기서 `registrationId`, `userNameAttributeName`을 받아옵니다. 

`userNameAttributeName`는 로그인 진행 시 키가되는 필드값입니다. 

구글의 경우 기본적으로 코드를 제공합니다. 구글의 기본 코드는 `sub` 입니다. 반면 네이버는 이 코드를 기본적으로 제공하지 않으므로 이 코드가 필요합니다. 네이버의 기본코드는 `response` 입니다.



`OAuthAttributes` 는 모든 프로바이더에서 공통으로 사용할 커스텀한 인증프로퍼티 객체입니다.

```java
@Getter
public class OAuthAttributes {
    private Map<String, Object> attributes;
    private String nameAttributeKey;
    private String name;
    private String email;
    private String picture;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email, String picture) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.picture = picture;
    }

    public static OAuthAttributes of(String registrationId,
                                     String userNameAttributeName,
                                     Map<String, Object> attributes) {
        return ofGoogle(userNameAttributeName, attributes);
    }

    private static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .picture((String) attributes.get("picture"))
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    public OAuthAccount toEntity() {
        return OAuthAccount.builder()
                .name(name)
                .email(email)
                .picture(picture)
                .role(AccountRole.USER)
                .build();
    }
}
```

이제 `localhost:8080/oauth2/authorization/google` URL에 요청을 보내면 구글 인증으로 리다이렉트가 되면서

사용자는 자신의 구글계정을 인증하게 됩니다. 이 인증과정이 성공했을 경우, 로그인 성공 페이지로 돌아오게 됩니다. 기본은 "/" 입니다.



