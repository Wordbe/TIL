# Querydsl 002 - Join, Subquery 등



## 기본 조인

- 조인의 기본 문법은 첫 번째 파라미터에 **조인 대상을 지정**하고, 두 번째 파라미터에 **별칭(alias)으로 사용할 Q 타입**을 지정하면 된다.

```java
/**
 * 팀 A에 소속된 모든 회원
 */
@Test
public void join() {
  List<Member> teamA = queryFactory
    .select(member)
    .from(member)
    .join(member.team, team)
    .where(team.name.eq("teamA"))
    .fetch();
  assertThat(teamA).extracting("username")
    .containsExactly("member1", "member2");
}
```

> 연관관계가 없어도 특정 컬럼으로 조인할 수 있다 !!
>
> 이런 조인을 세타조인 (소위 막조인) 이라고 한다.

```java

/**
 * 세타 조인
 * 회원의 이름이 팀 이름과 같은 회원 조회
 */
@Test
public void theta_join() {
  em.persist(new Member("teamA"));
  em.persist(new Member("teamB"));
  em.persist(new Member("teamC"));

  List<Member> fetch = queryFactory
    .select(member)
    .from(member, team)
    .where(member.username.eq(team.name))
    .fetch();
  assertThat(fetch)
    .extracting("username")
    .containsExactly("teamA", "teamB");
}
```

```sql
/* select
        member1 
    from
        Member member1,
        Team team 
    where
        member1.username = team.name */
```

- from 절에 여러 엔티티를 선택해서 조인할 수 있다.
- 외부(outer) 조인이 불가능했었지만, `on` 을 사용하면 가능하다.

<br />

## 조인 on 절

JPA 2.1 부터 on절을 활용할 수 있다.

- 조인 대상을 필터링한다.
- 연관관계 없는 외부 엔티티를 조인할 수 있다.

```java
/**
 * 회원과 팀을 조인하면서, 팀 이름이 teamA인 팀만 조인하고, 회원은 모두 조회한다. (left outer join)
 * JPQL : select m, t from Member m left join m.team t on t.name = 'teamA'
 */
@Test
public void join_on_filtering() {
  List<Tuple> teamA = queryFactory
    .select(member, team)
    .from(member)
    .leftJoin(member.team, team).on(team.name.eq("teamA"))
    .fetch();

  for (Tuple tuple : teamA) {
    System.out.println("tuple = " + tuple);
  }
}
```

```shell
tuple = [Member(id=3, username=member1, age=10), Team(id=1, name=teamA)]
tuple = [Member(id=4, username=member2, age=20), Team(id=1, name=teamA)]
tuple = [Member(id=5, username=member3, age=30), null]
tuple = [Member(id=6, username=member4, age=40), null]
```



> on 절을 활용해 조인 대상을 필터링할 때, 외부조인이 아니라 내부조인(inner join)을 사용하면, where 절에서 필터링하는 것과 동일하다.
>
> 따라서 내부조인이면 익숙한 where 절로 해결하고, 외부조인이 필요한 경우에만 on을 사용하면 좋다.



```java
/**
 * 연관관계 없는 엔티티 외부 조인
 * 회원의 이름이 팀 이름과 같은 대상 외부 조인
 */
@Test
public void join_on_no_relation() {
  em.persist(new Member("teamA"));
  em.persist(new Member("teamB"));
  em.persist(new Member("teamC"));

  List<Tuple> fetch = queryFactory
    .select(member, team)
    .from(member)
    .leftJoin(team).on(member.username.eq(team.name))
    .fetch();

  for (Tuple tuple : fetch) {
    System.out.println("tuple = " + tuple);
  }
}
```

```shell
tuple = [Member(id=3, username=member1, age=10), null]
tuple = [Member(id=4, username=member2, age=20), null]
tuple = [Member(id=5, username=member3, age=30), null]
tuple = [Member(id=6, username=member4, age=40), null]
tuple = [Member(id=7, username=teamA, age=0), Team(id=1, name=teamA)]
tuple = [Member(id=8, username=teamB, age=0), Team(id=2, name=teamB)]
tuple = [Member(id=9, username=teamC, age=0), null]
```

> 하이버네이트 5.1부터 on 을 사용해서 서로 관계가 없는 필드로 외부 조인하는 기능이 추가되었다. 물론 내부조인도 가능하다.
>
> 주의 : `leftJoin()` 부분에 일반 조인과 다르게 엔티티 하나만 들어간다.
>
> - 일반조인 : `leftJoin(member.team, t)`
> - on조인 : `from(member).leftJoin(team).on(조건)`

<br />

---

## 페치 조인

SQL 에서 제공하는 기능은 아니고, SQL 조인을 활용해서 연관된 엔티티를 SQL 한번에 조회한느 기능이다. 주로 성능 최적화에 사용한다.

```java
@PersistenceUnit
EntityManagerFactory emf;

@Test
public void fetchJoin() {
  em.flush();
  em.clear();

  Member fetchOne = queryFactory
    .selectFrom(member)
    .where(member.username.eq("member1"))
    .fetchOne();

  boolean loaded = emf.getPersistenceUnitUtil().isLoaded(fetchOne.getTeam());
  assertThat(loaded).as("페치 조인 미적용").isFalse();
}

@Test
public void fetchJoinUse() {
  em.flush();
  em.clear();

  Member fetchOne = queryFactory
    .selectFrom(member)
    .join(member.team, team).fetchJoin()
    .where(member.username.eq("member1"))
    .fetchOne();

  boolean loaded = emf.getPersistenceUnitUtil().isLoaded(fetchOne.getTeam());
  assertThat(loaded).as("페치 조인 적용").isTrue();
}
```

<br />

---

## 서브 쿼리

`com.querydsl.jpa.JPAExpression` 을 사용한다.

```java
/**
 * 나이가 가장 많은 회원 조회
 */
@Test
public void subQuery() {

  QMember memberSub = new QMember("memberSub");

  List<Member> result = queryFactory
    .selectFrom(member)
    .where(member.age.eq(
      JPAExpressions
      .select(memberSub.age.max())
      .from(memberSub)
    ))
    .fetch();

  assertThat(result).extracting("age")
    .containsExactly(40);
}

/**
 * 나이가 평균 이상인 회원
 */
@Test
public void subQueryGoe() {
  QMember memberSub = new QMember("memberSub");

  List<Member> result = queryFactory
    .selectFrom(member)
    .where(member.age.goe(
      JPAExpressions
      .select(memberSub.age.avg())
      .from(memberSub)
    ))
    .fetch();

  assertThat(result).extracting("age")
    .containsExactly(30, 40);
}

@Test
public void subQueryIn() {
  QMember memberSub = new QMember("memberSub");

  List<Member> result = queryFactory
    .selectFrom(member)
    .where(member.age.in(
      JPAExpressions
      .select(memberSub.age)
      .from(memberSub)
      .where(memberSub.age.gt(10))
    ))
    .fetch();

  assertThat(result).extracting("age")
    .containsExactly(20, 30, 40);
}

@Test
public void selectSubQuery() {
  QMember memberSub = new QMember("memberSub");

  List<Tuple> fetch = queryFactory
    .select(member.username,
            JPAExpressions
            .select(memberSub.age.avg())
            .from(memberSub))
    .from(member)
    .fetch();
  for (Tuple tuple : fetch) {
    System.out.println("tuple = " + tuple);
  }
}
```



### from 절의 서브쿼리 한계

- JPA JPQL 서브쿼리는 from 절의 서브쿼리 (인라인 뷰)를 지원하지 않는다. Querydsl 도 지원하지 않는다.
- 하이버네이트 구현체를 상요하면 select 절의 서브쿼리는 지원한다. Querydsl도 하이버네이트 구현체를 사용하면 select 절의 서브쿼리를 지원한다.

### from 절의 서브쿼리 해결방안

- 서브쿼리를 join 으로 변경한다. (가능할 수도, 불가능할 수도 있다.)
- 애플리케이션에서 쿼리를 2번 분리해서 실행한다.
- nativeSQL 을 사용한다.

> - DB 는 데이터를 최소화해서 가져오는 데 집중한다. 포맷을 바꾸는 등의 영역은 프론트 쪽에서 해결한다.
> - 한 방 쿼리, 복잡한 쿼리는 정말 실시간으로 필요할 때 적용한다. 예를 들어 서버 부하가 많이 없는 어드민 서버에서는 쿼리를 간단히 여러번 짜는 것이 보기 좋다.

> SQL AntiPatterns - 빌 카윈 (윤성준 역)
>
> - 정말 복잡한 수천줄의 쿼리를, 나눠서 표현..

<br />

---

## Case 문

select, 조건절(where) 에서 사용 가능하다.

```java
@Test
public void basicCase() {
  List<String> fetch = queryFactory
    .select(member.age
            .when(10).then("열살")
            .when(20).then("스무살")
            .otherwise("기타"))
    .from(member)
    .fetch();

  for (String s : fetch) {
    System.out.println("s = " + s);
  }
}

@Test
public void complexCase() {
  List<String> result = queryFactory
    .select(new CaseBuilder()
            .when(member.age.between(0, 20)).then("0~20살")
            .when(member.age.between(21, 30)).then("21~30살")
            .otherwise("기타"))
    .from(member)
    .fetch();
  for (String s : result) {
    System.out.println("s = " + s);
  }
}
```

- 조건이나 범위를 구하는 로직은 애플리케이션하는 게 좋다.

<br />

---

## 상수, 문자 더하기

```java
@Test
public void constant() {
  List<Tuple> result = queryFactory
    .select(member.username, Expressions.constant("A"))
    .from(member)
    .fetch();
  for (Tuple tuple : result) {
    System.out.println("tuple = " + tuple);
  }
}

@Test
public void concat() {
  // {username}_{age}
  List<String> result = queryFactory
    .select(member.username.concat("_").concat(member.age.stringValue()))
    .from(member)
    .where(member.username.eq("member1"))
    .fetch();
  for (String s : result) {
    System.out.println("s = " + s);
  }
}
```



- `.stringValue()` 를 통해 문자가 아닌 다른 타입을 문자열로 바꿀 수 있다. 
- 특히 ENUM 을 처리할 때도 자주 사용된다.

<br />









