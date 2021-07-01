# Querydsl 004 - 실무활용 Querydsl



## 실무 활용 - 순수 JPA 와 Querydsl

## 순수 JPA 리포지토리와 Querydsl



```java
@Configuration
public class QuerydslConfig {

  @Bean
  public JPAQueryFactory jpaQueryFactory(EntityManager em) {
    return new JPAQueryFactory(em);
  }
}
```

```java
@RequiredArgsConstructor
@Repository
public class MemberJpaRepository {
  private final EntityManager em;
  private final JPAQueryFactory queryFactory;

  public void save(Member member) {
    em.persist(member);
  }

  public Optional<Member> findById(Long id) {
    Member member = em.find(Member.class, id);
    return Optional.ofNullable(member);
  }

  public List<Member> findAll() {
    return em.createQuery("select m from Member m", Member.class)
      .getResultList();
  }

  public List<Member> findAll_Querydsl() {
    return queryFactory
      .selectFrom(member)
      .fetch();
  }

  public List<Member> findByUsername(String username) {
    return em.createQuery("select m from Member m where m.username = :username", Member.class)
      .setParameter("username", username)
      .getResultList();
  }

  public List<Member> findByUsername_Querydsl(String username) {
    return queryFactory
      .selectFrom(member)
      .where(member.username.eq(username))
      .fetch();
  }
}
```

또는 Bean 등록을 하지 않고, 아래와 같이 사용할 수 있다. 레포지토리 안에서 코드량이 조금 증가하지만, 테스트코드를 작성할 때 entityManager 만 주입받으면 되므로 더 간편하게 사용할 수 있는 장점이 있다.

```java
@Repository
public class MemberJpaRepository {
  private final EntityManager em;
  private final JPAQueryFactory queryFactory;

  public MemberJpaRepository(EntityManager em) {
    this.em = em;
    this.queryFactory = new JpaQueryFactory(em);
  }
	...
}
```

> 💡동시성 문제를 걱정하지 않아도 된다.
>
> - JPAQueryFactory 는 EntityManager 가 동작하는 단위에 맞게 의존하여 실행되므로 동시성 문제를 걱정하지 않아도 된다.
> - 스프링이 주입해주는 EntityManager 는 실제 동작 시점에 진짜 EntityManager 를 찾아주는 프록시용 가짜 EntityManager 이다. 가짜 EntityManager는 실제 사용 시점에 트랜잭션 단위로 실제 EntityManager (영속성 컨텍스트) 를 할당해준다.



<br />

---

## 동적 쿼리와 성능 최적화 조회

### Builder 사용



```java
@Data
public class MemberTeamDto {

  private Long memberId;
  private String username;
  private int age;
  private Long teamId;
  private String teamName;

  @QueryProjection
  public MemberTeamDto(Long memberId, String username, int age, Long teamId, String teamName) {
    this.memberId = memberId;
    this.username = username;
    this.age = age;
    this.teamId = teamId;
    this.teamName = teamName;
  }
}
```

- compileQuerydsl 하여 QMemberTeamDto 를 생성해야 한다.

```java
@Data
public class MemberSearchCondition {
  // 회원명, 팀명, 나이(ageGoe, ageLoe)

  private String username;
  private String teamName;
  private Integer ageGoe;
  private Integer ageLoe;
}
```



```java
public List<MemberTeamDto> searchByBuilder(MemberSearchCondition condition) {
  BooleanBuilder builder = new BooleanBuilder();
  if (hasText(condition.getUsername())) {
    builder.and(member.username.eq(condition.getUsername()));
  }
  if (hasText(condition.getTeamName())) {
    builder.and(team.name.eq(condition.getTeamName()));
  }
  if (condition.getAgeGoe() != null) {
    builder.and(member.age.goe(condition.getAgeGoe()));
  }
  if (condition.getAgeLoe() != null) {
    builder.and(member.age.loe(condition.getAgeLoe()));
  }
  return queryFactory
    .select(new QMemberTeamDto(
      member.id.as("memberId"),
      member.username,
      member.age,
      team.id.as("teamId"),
      team.name.as("teamName")))
    .from(member)
    .leftJoin(member.team, team)
    .where(builder)
    .fetch();
}
```

```java
@Test
public void searchTest() {
  MemberSearchCondition condition = new MemberSearchCondition();
  condition.setAgeGoe(35);
  condition.setAgeLoe(40);
  condition.setTeamName("teamB");

  List<MemberTeamDto> result = memberJpaRepository.searchByBuilder(condition);

  assertThat(result).extracting("username")
    .containsExactly("member4");
}
```

<br />

### Where절 파라미터 사용



```java
public List<MemberTeamDto> search(MemberSearchCondition condition) {
  return queryFactory
    .select(new QMemberTeamDto(
      member.id.as("memberId"),
      member.username,
      member.age,
      team.id.as("teamId"),
      team.name.as("teamName")))
    .from(member)
    .leftJoin(member.team, team)
    .where(
    usernameEq(condition.getUsername()),
    teamNameEq(condition.getTeamName()),
    ageGoe(condition.getAgeGoe()),
    ageLoe(condition.getAgeLoe())
  )
    .fetch();
}

private BooleanExpression usernameEq(String username) {
  return hasText(username) ? member.username.eq(username) : null;
}

private BooleanExpression teamNameEq(String teamName) {
  return hasText(teamName) ? team.name.eq(teamName) : null;
}

private BooleanExpression ageGoe(Integer ageGoe) {
  return ageGoe != null ? member.age.goe(ageGoe) : null;
}

private BooleanExpression ageLoe(Integer ageLoe) {
  return ageLoe != null ? member.age.loe(ageLoe) : null;
}
```



Where절 파라미터의 장점.

- 반환타입 등이 바뀌어도 재사용이 가능하다.
- 조립이 가능하다. (`BooleanExpression`)

<br />

---

## 조회 API 컨트롤러 개발



메인 Application 실행하여, 컨트롤러 요청하여 직접 테스트해보는 경우 (Profile : local) 와 테스트코드로 테스트하는 환경 (Profile : test) 을 분리한다.

src/main/resources/application.yml

```yaml
spring:
  profiles:
    active: local
```

src/test/resources/application.yml

```yaml
spring:
  profiles:
    active: test
```

```java
@Profile("local")
@Component
@RequiredArgsConstructor
public class InitMember {

  private final InitMemberService initMemberService;

  @PostConstruct
  public void init() {
    initMemberService.init();
  }

  @Component
  static class InitMemberService {
    @PersistenceContext
    private EntityManager em;

    @Transactional
    public void init() {
      Team teamA = new Team("teamA");
      Team teamB = new Team("teamB");
      em.persist(teamA);
      em.persist(teamB);

      for (int i=0; i<100; i++) {
        Team selectedTeam = i % 2 == 0 ? teamA : teamB;
        em.persist(new Member("member" + i, i, selectedTeam));
      }
    }
  }
}
```

- 2 + 100개의 테스트 데이터를 넣는다.
- `@PostContructor` 와 `@Transactional` 을 동시에 사용할 수 없기 때문에 `initMemberService` 를 분리한다.



컨트롤러

```java
@RequiredArgsConstructor
@RestController
public class MemberController {
  private final MemberJpaRepository memberJpaRepository;

  @GetMapping("/v1/members")
  public List<MemberTeamDto> searchMemberV1(MemberSearchCondition condition) {
    return memberJpaRepository.search(condition);
  }
}
```



```
http://localhost:8080/v1/members?teamName=teamB&ageGoe=31&ageLoe=35&username=member31
```

등의 조건으로 테스트 성공







