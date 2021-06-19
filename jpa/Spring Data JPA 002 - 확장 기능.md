# Spring Data JPA 002 - 확장 기능



## 사용자 정의 Respoitory 구현

- 스프링 데이터 JPA 레포지토리는 인터페이스만 정의하고 구현체는 스프링이 자동 생성한다.
- 이 인터페이스를 직접 구현하면 구현해야 하는 기능이 너무 많다.
- 다양한 이유로 인터페이스 메서드를 직접 구현해야 하는 경우?
  - JPA 직접 사용 : EntityManger
  - **Spring JDBC Template 사용**
  - MyBatis 사용
  - 데이터베이스 커넥션 직접 사용
  - **QueryDsl 사용 (90%)**



새로운 인터페이스를 만들고,

```java
public interface MemberRepositoryCustom {
    List<Member> findMemberCustom();
}
```

인터페이스이 구현체를 만들고, (이 때 구현체의 맨 뒤에 postfix 는 `Impl` 로 맞춰주어야 작동한다. 설정을 변경할 수도 있다.)

```java
@RequiredArgsConstructor
public class MemberRepositoryCustomImpl implements MemberRepositoryCustom {
    private final EntityManager em;

    @Override
    public List<Member> findMemberCustom() {
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }
}
```

원래 레포지토리가 우리가 만들었던 레포지토리를 상속시키도록 한다.

```java
public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom { ...
```

```java
@Test
public void callCustom() {
  List<Member> result = memberRepository.findMemberCustom();
}
```

> 항상 사용자 정의 리포지토리가 필요한 것은 아니다. 임의의 리포지토리를 만들어도된다. 인터페이스가 아닌 클래스로 만들고 스프링 빈으로 등록해서 직접 사용해도 문제없다. 물론 이 경우 스프링 데이터 JPA 와는 아무런 관련없이 별도로 작동한다.

<br />



```java
@RequiredArgsConstructor
@Repostiory
public class CustomMemberRepository {
  private final EntityManager em;
  
	public List<Member> findMemberCustom() {
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }
}
```

다른 서비스에서 `CustomMemberRepository` 빈을 주입해서 사용하면 된다.

<br />

---

## Auditing

엔티티 생성, 변경할 때 변경한 사람과 시간을 추적한다.

- 등록일
- 수정일
- 등록자
- 수정자



### 순수 JPA 사용

```java
@Getter
@MappedSuperclass
public class JpaBaseEntity {

  @Column(updatable = false)
  private LocalDateTime createdDate;
  private LocalDateTime updatedDate;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    createdDate = now;
    updatedDate = now;
  }

  @PreUpdate
  public void preUpdate() {
    updatedDate = LocalDateTime.now();
  }
}
```

- 이 공통 속성을 사용할 엔티티 들에게 `extends JpaBaseEntity` 하면 된다.
- `@MappedSuperclass` 을 붙여야 자식 엔티티에게 속성이 입력된다.
- JPA에서 제공하는 어노테이션으로, 저장되기전에 추가할 행위로 `@PrePost`, 변경되기 전에 `@PreUpdate` 어노테이션을 사용할 수 있다. 마찬가지로 저장한 후, 변경한 후는 각각 `@PostPersist`, `@PostUpdate` 를 사용할 수 있다.

<br />

### Spring Data JPA 사용

보다 더 쉽고 깔끔한 설정을 도와준다.

우선 메인 애플리케이션 위에 어노테이션을 추가한다.

```java
@EnableJpaAuditing
@SpringBootApplication
public class JpaSpringdatajpaApplication {
    public static void main(String[] args) {
        SpringApplication.run(JpaSpringdatajpaApplication.class, args);
    }
}
```

```java
@EntityListeners(AuditingEntityListener.class)
@Getter
@MappedSuperclass
public class BaseEntity extends BaseTimeEntity {

  @CreatedBy
  @Column(updatable = false)
  private String createdBy;

  @LastModifiedBy
  private String lastModifiedBy;
}
```

```java
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
@Getter
public class BaseTimeEntity {
  @CreatedDate
  @Column(updatable = false)
  private LocalDateTime createdDate;

  @LastModifiedDate
  private LocalDateTime lastModifiedDate;
}
```

생성한사람, 수정한사람 컬럼이 필요없는 테이블도 있기 때문에, `BaseEntity` 와 `BaseTimeEntity`  를 따로 만들면 효율적이다.

<br />

---

## Web 확장 - 도메인 클래스 컨버터

HTTP 파라미터로 넘어온 엔티티의 아이디로 엔티티 객체를 찾아서 바인딩한다.

```java
@GetMapping("/members/{id}")
public String findMember(@PathVariable("id") Long id) {
  Member member = memberRepository.findById(id).get();
  return member.getUsername();
}

// 위 결과와 같다.
@GetMapping("/members2/{id}")
public String findMember(@PathVariable("id") Member member) {
  return member.getUsername();
}
```

도메인 클래스 컨버터를 활용하여, 컨트롤러 메소드 파라미터에 엔티티를 넣으면, id 기준으로 member 를 자동 조회해가지고 온다. 즉, 도메인 클래스 컨버터는 레포지토리를 사용해서 엔티티를 찾는다.

이는 트랜잭션이 없는 범위에서 엔티티를 조회했으므로, 영속성컨텍스트에 반영되지 않으며, 엔티티를 변경해도 DB에 반영되지 않는다.

사용하지 않는 것을 추천한다. 이렇게 단순한 쿼리를 조회할 일도 많이 없다.



<br />

---

## Web 확장 - 페이징과 정렬



### Pageable 인터페이스

스프링 데이터가 제공하는 페이징과 정렬을 스프링 MVC에서 편리하게 사용할 수 있다.

```java
@RestController
@RequiredArgsConstructor
public class MemberController {
    private final MemberRepository memberRepository;

    @GetMapping("/members")
    public Page<Member> list(Pageable pageable) {
        return memberRepository.findAll(pageable);
    }

    @PostConstruct
    public void init() {
        for (int i=0; i<100; i++) {
            memberRepository.save(new Member("user" + i, i));
        }
    }
}
```

`Pageable` 인터페이스를 파라미터로 넣어주면, `org.springframework.data.domain.PageRequest` 객체를 생성해서 값을 채워서 주입해준다.

```shell
http://localhost:8080/members?page=0
http://localhost:8080/members?page=1
http://localhost:8080/members?page=0&size=3
http://localhost:8080/members?page=1&size=20&sort=id,desc&sort=username,desc
```

- page : 현재 페이지, 0부터 시작한다.
- size : 한 페이지에 노출할 데이터 건수, 기본값은 20이다.
- sort : 정렬 조건을 정의한다. 정렬 속성 asc | desc 인데 기본값은 asc(오름차순) 이므로 보통 많이 생략한다.

파라미터를 아무것도 넣지 않았을 때, 기본값을 변경하는 방법 (전역적)

```yaml
spring:
	data:
    web:
      pageable:
        default-page-size: 20 # 기본값
        max-page-size: 2000 # 기본값
```

개별적으로 파라미터 기본값을 적용할 수도 있다. (`@PageableDefault`)

```java
@GetMapping("/members")
public Page<Member> list(@PageableDefault(size = 5, sort = "username") Pageable pageable) {
  return memberRepository.findAll(pageable);
}
```



### 접두사

- 페이징 정보가 둘 이상이면 접두사로 구분한다.

- `@Qualifier` 에 접두사명을 추가한다. {접두사명}_{파라미터}

- 예제) `/members?member_page=0&order_page=1`

  ```java
  public String getList(
    @Qualifier("member") Pageable memberPageable,
    @Qualifier("order") Pageable orderPageable ... ) { ... }
  ```



### Page 내용을 DTO로 변환하기

```java
@GetMapping("/members")
public Page<MemberDto> list(@PageableDefault(size = 3, sort = "username") Pageable pageable) {
  Page<Member> page = memberRepository.findAll(pageable);
  Page<MemberDto> map = page.map(member -> new MemberDto(member.getId(), member.getUsername(), null));
  return map;
}

... 
// 생성자를 추가해서 람다함수를 메소드 레퍼런스로 바꾸면 더 깔끔한 코드를 만들 수 있다.
@GetMapping("/members")
public Page<MemberDto> list(@PageableDefault(size = 3, sort = "username") Pageable pageable) {
	return memberRepository.findAll(pageable)
    .map(MemberDto::new);
}
```

<br />

### Page를 1부터 시작하기

- 스프링 데이터는 Page 를 0부터 시작하는데, 1부터 시작하려면?

1. Pageable, Page 를 파라미터와 응답 값으로 사용하지 않고, 직접 클래스를 만들어서 처리한다. 직접 PageRequest(Pageable 구현체)를 생성해서 레포지토리에 넘긴다. 응답값도 Page 대신에 직접 만들어서 제공한다.
2. `spring.data.web.pageable.one-indexed-parameters = true` 로 설정한다. 그런데 이 방법은 web 에서 page 파라미터를 -1 로 처리할 뿐이다. 따라서 응답값인 Page 에 모두 0 페이지 인덱스를 사용하는 한계가 있다. Page 응답값은 모두 기본 인덱스(0)를 따라서 간다.

```java
@GetMapping("/members")
public MyPage<MemberDto> list(Long id, Long size) {
  PageRequest request = PageRequest.of(id, size);
	MyPage<MemberDto> map = memberService.findMyPage(request)
    .map(MemberDto::new);
  return map
}
```





























