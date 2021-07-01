# Querydsl 005 - 실무활용 스프링 데이터 JPA와 Querydsl 



## 스프링 데이터 JPA 레포지토리



## 사용자 정의 리포지토리

- 사용법

  1. 사용자 정의 인터페이스 작성

     ```java
     public interface MemberRepositoryCustom {
       List<MemberTeamDto> search(MemberSearchCondition condition);
     }
     ```

  2. 사용자 정의 인터페이스 구현

     ```java
     public class MemberRepositoryImpl implements MemberRepositoryCustom {
       private final JPAQueryFactory queryFactory;
     
       public MemberRepositoryImpl(EntityManager em) {
         this.queryFactory = new JPAQueryFactory(em);
       }
     
       @Override
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
     }
     ```

  3. 스프링 데이터 리포지토리에 사용자 정의 인터페이스 상속

     ```java
     public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom {
     
         List<Member> findByUsername(String username);
     }
     ```

     

![](https://i.ibb.co/P46C2Gd/2021-07-01-12-14-54.png)

- 구현체는 `MemberRepository` 와 맞추고, 뒤에 `Impl` 을 붙여준다.



> - Custom 레포지토리 인터페이스를 새로 만들어서 구현체를 새로 등록하는 것이 기본이다.
> - 하지만 특정 API 에만 속하고, 쿼리가 복잡해서 다른 곳에서 재사용성의 가능성이 낮을 때는 따로 클래스를 만들고 `@Repository` 를 붙여 해결해도 된다.
>
> ```java
> @Repository
> public class MemberQueryRepository {
>   private final JPAQueryFactory queryFactory;
> 
>   public MemberQueryRepository(EntityManager em) {
>     this.queryFactory = new JPAQueryFactory(em);
>   }
> 
>   public List<MemberTeamDto> search(MemberSearchCondition condition) {
>     return queryFactory
>       .select(new QMemberTeamDto(
>         member.id.as("memberId"),
>         member.username,
>         member.age,
>         team.id.as("teamId"),
>         team.name.as("teamName")))
>       .from(member)
>       .leftJoin(member.team, team)
>       .where(
>       usernameEq(condition.getUsername()),
>       teamNameEq(condition.getTeamName()),
>       ageGoe(condition.getAgeGoe()),
>       ageLoe(condition.getAgeLoe())
>     )
>       .fetch();
>   }
> 
>   private BooleanExpression usernameEq(String username) {
>     return hasText(username) ? member.username.eq(username) : null;
>   }
> 
>   private BooleanExpression teamNameEq(String teamName) {
>     return hasText(teamName) ? team.name.eq(teamName) : null;
>   }
> 
>   private BooleanExpression ageGoe(Integer ageGoe) {
>     return ageGoe != null ? member.age.goe(ageGoe) : null;
>   }
> 
>   private BooleanExpression ageLoe(Integer ageLoe) {
>     return ageLoe != null ? member.age.loe(ageLoe) : null;
>   }
> }
> ```
>
> 

<br />

---

## 스프링 데이터 페이징 활용 1

- 스프링 데이터의 Page, Pageable 을 활용한다.

  1. 전체 카운트를 한번에 조회하는 단순한 방법

  2. 데이터 내용과 전체 카운트를 별도로 조회하는 방법



### 1 전체 카운트를 한번에 조회하는 단순한 방법

```java
@Override
public Page<MemberTeamDto> searchPageSimple(MemberSearchCondition condition, Pageable pageable) {
  QueryResults<MemberTeamDto> results = queryFactory
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
    .offset(pageable.getOffset())
    .limit(pageable.getPageSize())
    .fetchResults(); // Page 조회시 쿼리와 카운트 쿼리가 모두 수행된다.

  List<MemberTeamDto> content = results.getResults();
  long total = results.getTotal();

  return new PageImpl<>(content, pageable, total);
}
```



- Querydsl 이 제공하는 `fetchResults()` 를 사용하면 내용과 전체 카운트를 한번에 조회할 수 있다. 실제 쿼리는 2번 호출된다.
- `fetchResult()` 는 카운트쿼리 실행시 필요없는 `order by` 는 제거한다.



### 2 데이터 내용과 전체 카운트를 별도로 조회하는 방법

```java
@Override
public Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition, Pageable pageable) {
  List<MemberTeamDto> content = queryFactory
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
    .offset(pageable.getOffset())
    .limit(pageable.getPageSize())
    .fetch();

  long total = queryFactory
    .select(member)
    .from(member)
    .leftJoin(member.team, team)
    .where(
    usernameEq(condition.getUsername()),
    teamNameEq(condition.getTeamName()),
    ageGoe(condition.getAgeGoe()),
    ageLoe(condition.getAgeLoe())
  )
    .fetchCount();

  return new PageImpl<>(content, pageable, total);
}
```

<br />

---

## 스프링 데이터 페이징 활용 2 - CountQuery 최적화



- 스프링 데이터 라이브러리가 제공한다.
- count 쿼리가 생략 가능한 경우 생략해서 처리한다.
  - 페이지 시작이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때 count 를 하지 않아도 된다.
  - 마지막 페이지 일 때 (offset + 컨텐츠 사이즈를 더해서 전체 사이즈를 구한다.) count 를 하지 않아도 된다.
  - 이를 `PageableExecutionUtils` 가 해준다.

```java
@Override
public Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition, Pageable pageable) {
  List<MemberTeamDto> content = queryFactory
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
    .offset(pageable.getOffset())
    .limit(pageable.getPageSize())
    .fetch();

  JPAQuery<Member> countQuery = queryFactory
    .select(member)
    .from(member)
    .leftJoin(member.team, team)
    .where(
    usernameEq(condition.getUsername()),
    teamNameEq(condition.getTeamName()),
    ageGoe(condition.getAgeGoe()),
    ageLoe(condition.getAgeLoe())
  );

  return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchCount);
}
```

<br />

---

## 스프링 데이터 페이징 활용 3 - 컨트롤러 개발



```java
@GetMapping("/v2/members")
public Page<MemberTeamDto> searchMemberV2(MemberSearchCondition condition
                                          , Pageable pageable) {
  return memberRepository.searchPageSimple(condition, pageable);
}

@GetMapping("/v3/members")
public Page<MemberTeamDto> searchMemberV3(MemberSearchCondition condition
                                          , Pageable pageable) {
  return memberRepository.searchPageComplex(condition, pageable);
}
```

- `http://localhost:8080/v2/members?size=5&page=2` 등의 조합으로 사용할 수 있다.





### 스프링 데이터 정렬 (Sort)

- 스프링 데이터 JPA 는 자신의 정렬 (Sort) 을 Querydsl 의 정렬 (OrderSpecifier) 로 편리하게 변경하는 기능을 제공한다. 
- 스프링 데이터 Sort 를 Querydsl 의 OrderSpecifier 로 변환

```java
JPAQuery<Member> query = queryFactory.selectFrom(member);

for (Sort.Order o : pageable.getSort()) {
  PathBuilder pathBuilder = new PathBuilder(member.getType(), member.getMetadata());
  query.orderBy(new OrderSpecifier(o.isAscending() ? Order.ACS : Order.DESC, pathBuilder.get(o.getProperty())));
}
List<Member> result = query.fetch(); 
```



> 정렬 (Sort) 은 조건이 조금만 복잡해져도 `Pageable` 의 `Sort` 기능을 사용하기 어렵다. 루트 엔티티 범위를 넘어가는 동적 정렬 기능이 필요하면 스프링 데이터 페이징이 제공하는 `Sort` 를 사용하기 보다는 파라미터를 받아서 직접 처리하는 것을 권장한다.

