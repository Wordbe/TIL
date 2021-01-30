# Spring REST API 11 - 사용자 정보 조회





현재 사용자 정보를 조회하는 방법을 알아보자.



**방법 1) `SecurityContext`**

`SecurityContext` 는 자바 `ThreadLocal` 의 구현체로 인증 정보를 담고 있다.

인증정보는 아래와 같이 가져와서 사용할 수 있다.

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
User principal = (User) authentication.getPrincipal();
// principal.username 등등
```

<br />

**방법 2) `@AuthenticationPrincipal`**

```java
@RestController
@RequestMapping(value = "/api/events", produces = MediaTypes.HAL_JSON_VALUE)
public class EventController {

    ...

    @PostMapping
    public ResponseEntity createEvent(@RequestBody @Valid EventDto eventDto, 
                                      Errors errors,
                                      @AuthenticationPrincipal(expression = "account") Account currentUser) {
      
      	...

        Event event = modelMapper.map(eventDto, Event.class);
        event.update();
      	// 현재 사용자를 매니저에 추가 (manager 필드 : 이벤트를 담당하는 매니저)
        event.setManager(currentUser);

      	// INSERT event
        Event newEvent = this.eventRepository.save(event);

      	...
        return ResponseEntity.created(createdUri).body(eventResource);
    }
}
```

위와 같이 `@AuthenticationPrincipal` 을 사용하면 방법 1에서 보았던 principal 객체를 바로 컨트롤러 메소드의 파라미터로 담아올 수 있다.

expression 에는 spEL (spring expression language) 를 사용할 수 있다.

<br />

`@AuthenticationPrincipal spinrg.security User user` 의 형식으로 사용하는데, 여기서 인증을 하지 않은 경우 null 을 받아오고, 인증을 한 경우는 username 과 authorities 를 참조할 수 있다. 하지만 여기서는 User 를 가져올 수 있을 뿐, 우리가 생성한 엔터티 Account 와 연관지어주지는 못한다. 따라서 User 와 Account 를 연결지어주는 어댑터를 만들어야 한다.

`spring.security.User` 를 상속받아서 어탭터를 만들어 보자.

```java
@Getter
public class AccountAdapter extends User {

    private Account account;

    public AccountAdapter(Account account) {
        super(account.getEmail(), account.getPassword(), authorities(account.getRoles()));
        this.account = account;
    }

    private static Collection<? extends GrantedAuthority> authorities(Set<AccountRole> roles) {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                .collect(Collectors.toSet());
    }
}
```



<br />

스프핑 시큐리티를 사용할 때, `UserDetailsService` 의 구현체를 만들어 `loadUserByUsername` 메소드를 구현하면 요청한 사용자가 기존 DB 에 저장되어있는지 확인할 수 있다. 이에 따라 DB에서 사용자 정보를 찾지 못하면 에러를 발생시키고, 그렇지 않으면 account 정보를 리턴하도록 구현하였다.

```java
@Service
public class AccountService implements UserDetailsService {

    @Autowired
    AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return new AccountAdapter(account);
    }
}
```

위 코드를 보면 원래 리턴에 스프링 시큐리티가 제공하는 `User`객체를 리턴하면 된다. 그런데 `User` 를 상속받은 `AccountAdapter` 를 만들어서 리턴하도록 했다. 나중에 `Adapter.getUser().getId()` 형식으로 사용자 정보를 가져올 수 있다.





아래와 같이 custom 에노테이션을 따로 만들어주어 사용하면 편하다.

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : account")
public @interface CurrentUser {
}

```

현재 인증정보가 익명 유저인 경우 null 을 받고, 그렇지 않으면 account 를 받아온다.

```java
@PostMapping
public ResponseEntity createEvent(...
                                  @CurrentUser Account currentUser) 
```

위에 파라미터 어노테이션은 위와같이 바꾸면 된다.



<br />

---

