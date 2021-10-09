# Spring Data JPA 004 - 나머지 기능들



## Specifications (명세)

도메인 주도 설계(Domain Driven Design) 은 specifiation (명세) 라는 개념을 소개한다.

스프링 데이터 JPA는 JPA Criteria 를 활용해서 이 개념을 사용할 수 있도록 지원한다.



### 술어 (predicate)

- 참 또는 거짓으로 평가
- AND, OR 같은 연산자로 조합해서 다양한 검색조건을 쉽게 생성한다. (composite pattern)
  - 예) 검색 조건 하나하나
- 스프링 데이터 JPA는 `org.springframework.data.jpa.domain.Specification` 클래스로 정의한다.

<br />

### 명세 기능 사용 방법

`JpaSpecificationExcecutor` 인터페이스를 상속한다.

```java
public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> { ...
```

```java
@Test
public void specificationBasic() {
  //given
  Team teamA = new Team("teamA");
  em.persist(teamA);

  Member m1 = new Member("m1", 0, teamA);
  Member m2 = new Member("m2", 0, teamA);
  em.persist(m1);
  em.persist(m2);
  em.flush();
  em.clear();

  //when
  Specification<Member> spec = MemberSpec.username("m1").and(MemberSpec.teamName("teamA"));
  List<Member> result = memberRepository.findAll(spec);

  //then
  assertThat(result.size()).isEqualTo(1);
}
```

- specification 을 구현하면 명세들을 조립할 수 있다. where(), and(), or(), not() 을 제공한다.
- findAll 을 보면 회원이름 명세(username) 와 팀이름 명세(teamName)를 and으로 조합해서 검색 조건으로 사용한다.

```java
public class MemberSpec {

  public static Specification<Member> teamName(final String teamName) {
    return (root, query, builder) -> {
      if (!StringUtils.hasText(teamName)) {
        return null;
      }

      Join<Member, Team> team = root.join("team", JoinType.INNER);// 회원과 조인
      return builder.equal(team.get("name"), teamName);
    };
  }

  public static Specification<Member> username(final String username) {
    return (root, query, builder) -> builder.equal(root.get("username"), username);
  }
}
```

- 명세를 정의하려면 specification 인터페이스를 구현한다.
- 명세를 정의할 때는 toPredicate() 메서드만 구현하면 된다. JPA Criteria 의 root, criteriaQuery, criteriaBuilder 클래스 파라미터를 제공한다.

> 실무에서는 JPA Criteria 안쓴다. 대신 QueryDSL 사용한다.

<br />

---

## Query By Example



```java
@Test
public void queryByExample() {
  //given
  Team teamA = new Team("teamA");
  em.persist(teamA);

  Member m1 = new Member("m1", 0, teamA);
  Member m2 = new Member("m2", 0, teamA);
  em.persist(m1);
  em.persist(m2);
  em.flush();
  em.clear();

  //when
  //Probe (검색조건)
  Member member = new Member("m1");
  Team team = new Team("teamA");
  member.setTeam(team);

  ExampleMatcher matcher = ExampleMatcher.matching().withIgnorePaths("age");
  Example<Member> example = Example.of(member, matcher);
  List<Member> result = memberRepository.findAll(example); // QueryByExample 은 이미 JpaRepository가 상속받고 있다.

  //then
  assertThat(result.size()).isEqualTo(1);
  assertThat(result.get(0).getUsername()).isEqualTo("m1");
}
```

수행된 쿼리

```sql
select
        member0_.member_id as member_i1_1_,
        member0_.age as age2_1_,
        member0_.team_id as team_id4_1_,
        member0_.username as username3_1_ 
    from
        member member0_ 
    inner join
        team team1_ 
            on member0_.team_id=team1_.team_id 
    where
        member0_.username=? 
        and team1_.name=?
```



- Probe : 필드에 데이터가 있는 실제 도메인 객체
- ExampleMatcher : 특정 필드를 일치시키는 상세한 정보를 제공한다. 재사용 가능
- Example : Probe 와 ExampleMatcher로 구성, 쿼리를 생성하는데 사용

**장점**

- 동적 쿼리를 편하게 처리
- 도메인 객체 그대로 사용
- 데이터 저장소를 RDB에서 NoSQL로 변경해도 코드 변경없게 추상화 되어있다.
- 스프링 데이터 JPA `JpaRepository` 인터페이스에 이미 포함되어있다.

**단점**

- 조인은 가능하지만 내부조인(inner join)만 가능하고, 외부조인(left join) 안된다.
- 중첩 제약조건이 안된다.
  - firstname = ?0 or (firstname = ?1 and lastname ?2)
- 매칭조건이 매우 단순하다.
  - 문자는 starts / contains / ends / regex
  - 다른 속성은 정확한 매칭 ( = ) 만 지원한다.

> 실무에서 사용하기에는 매칭 조건이 너무 단순하고, left 조인이 안된다.
>
> 실무에서는 QueryDSL 을 사용한다.

<br />

---

## Projections

도움이 될 때가 있다.

엔티티 대신에 DTO를 편리하게 조회할 때 사용한다. 전체 엔티티가 아니라 회원이름만 조회하고 싶을 때?

<br />

### Closed Projection

1. 인터페이스 정의 (구현체는 스프링데이터JPA 가 만든다.)

```java
public interface UsernameOnly {
    String getUsername();
}
```

2. Repository 에 등록

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
  List<UsernameOnly> findProjectionsByUsername(String username);
}
```

<br />

### Open Projection

```java
public interface UsernameOnly {

    @Value("#{target.username + ' ' + target.age}")
    String getUsername();
}
```

단점은 모든 컬럼을 다 조회한 후, 위에 명시한 두 컬럼을 가져온다.

SpEL을 지원한다.

<br />

### Class based Projection (Not Interface)

```java
public class UsernameOnlyDto {
    private final String username;

    public UsernameOnlyDto(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }
}
```

```java
List<UsernameOnlyDto> findClassProjectionsByUsername(String username);
```

또는 제네릭으로 구현하여 클래스타입에 따른 동적 쿼리를 만들 수도 있다.

```java
<T> List<T> findClassProjectionsByUsername(String username, Class<T> type);
```

```java
List<UsernameOnlyDto> result = memberRepository.findClassProjectionsByUsername("m1", UsernameOnlyDto.class);
for (UsernameOnlyDto usernameOnly : result) {
  System.out.println("usernameOnly = " + usernameOnly);
}
```

<br />

### 중첩 구조 처리 (Nested)

```java
public interface NestedClosedProjections {
    String getUsername();
    TeamInfo getTeam();

    interface TeamInfo {
        String getName();
    }
}
```

```java
List<NestedClosedProjections> result = memberRepository.findClassProjectionsByUsername("m1", NestedClosedProjections.class);
for (NestedClosedProjections nestedClosedProjections : result) {
  String username = nestedClosedProjections.getUsername();
  System.out.println("username = " + username);
  String name = nestedClosedProjections.getTeam().getName();
  System.out.println("name = " + name);
}
```

- 프로젝션 대상이 root 엔티티이면 JQPL SELECT 최적화가 가능하다.
- 프로젝션 대상이 root가 아니면
  - left outer join 처리
  - 모든 필드를 select 해서 엔티티로 조회한 다음에 계산한다.



> Projections
>
> 따라서 실무의 복잡한 쿼리를 해결하기에는 한계가 있다.
>
> 실무에서는 단순할 때만사용하고, 복잡해지면 QueryDSL을 사용하자.



---

## 네이티브 쿼리 (Native Query)

가급적 네이티브 쿼리를 사용하지 않는 것이 좋으나, 정말 어쩔 수 없을 때 사용한다. 

최근의 나온 궁극의 방법은 스프링 데이터 Projections를 활용하는 것이다.

### 스프링 데이터 JPA 기반 네이티브 쿼리

- 페이징 지원
- 반환 타입
  - Object[]
  - Tuple
  - DTO(스프링 데이터 인터페이스 Projections 지원)
- 제약
  - Sort 파라미터를 통한 정렬이 정상 동작하지 않을 수 있다. (믿지 말고 직접 처리한다.)
  - JQPL처럼 애플리케이션 로딩 시점에 문법 확인이 불가하다.
  - 동적 쿼리 불가하다.

<br />

### JPA 네이티브 SQL 지원

```java
@Query(value = "select * from member where username = ?", nativeQuery = true)
Member findByNativeQuery(String username);
```

- JPQL은 위치기반 파라미터를 1부터 시작하지만 네이티브 SQL은 0부터 시작한다.
- 네이티브 SQL을 엔티티가 아닌 DTO로 변환 하려면
  - DTO 대신 JPA TUPLE 조회
  - DTO 대신 MAP 조회
  - @SqlResultSetMaping (복잡)
  - Hibernate ResultTransformer 사용해야함 (복잡)
  - **네이티브 SQL을 DTO로 조회할 때는 JdbcTemplate 또는 myBatis 를 권장한다.**

<br />

### :star: Projections 활용

예) 스프링 데이터 JPA 네이티브 쿼리 + 인터페이스 기반 Projections 활용

```java
@Query(value = "select m.member_id as id, m.username, t.name as teamName " +
            "from member m left join team t",
            countQuery = "select count(*) from member",
            nativeQuery = true)
Page<MemberProjection> findByNativeProjection(Pageable pageable);
```

```java
Page<MemberProjection> result = memberRepository.findByNativeProjection(PageRequest.of(0, 10));
List<MemberProjection> content = result.getContent();
for (MemberProjection memberProjection : content) {
  System.out.println("memberProjection.getUsername() = " + memberProjection.getUsername());
  System.out.println("memberProjection.getTeamName() = " + memberProjection.getTeamName());
}
```



<br />

### 동적 네이티브 쿼리

- 하이버네이트 직접 활용한다.
- 스프링 JdbcTemplate, myBatis, jooq 같은 외부라이브러리를 사용한다.

```java
String sql = "select m.username as username from member m";
List<MemberDto> username = em.createNamedQuery(sql)
  .setFirstResult(0)
  .setMaxResults(10)
  .unwrap(NativeQuery.class)
  .addScalar("username")
  .setResultTransformer(Transformers.aliasToBean(MemberDto.class))
  .getResultList();
```











