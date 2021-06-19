# Spring Data JPA 001 - 인터페이스, 쿼리메소드 기능



## `JpaRepository<Entity, Id>`

레포지토리 인터페이스를 사용하면, Spring Data JPA 가 프록시 객체를 통해 구현체를 만들어서 주입해준다.

```java
memberRepository.getClass() // class com.sun.proxy.$ProxyXXX
```

- `@Repository` 어노테이션이 생략 가능하다. 
  - 컴포넌트 스캔을 스프링 데이터 JPA가 자동으로 처리해준다.
  - JPA 예외를 스프링 예외로 변환하는 과정도 자동으로 처리해준다.

<br />

---

## 공통 인터페이스 적용

JpaRepository 인터페이스는 공통 CRUD 기능을 제공한다. 제네릭은 <엔티티타입, 식별자타입> 으로 설정한다. 



- spring-data-commons
- spring-data-jpa

![](https://i.ibb.co/xCGfm0Z/2021-06-06-11-22-02.png)



### 제네릭 타입

- T : 엔티티
- ID : 엔티티의 식별자 타입
- S : 엔티티와 그 자식 타입

### 주요 메소드

- `save(S)` : 새로운 엔티티는 저장하고 이미 있는 엔티티는 반환한다.
- `delete(T)` : 엔티티 하나를 삭제한다. 내부에서 `EntityManger.remove()` 를 호출한다.
- `findById(ID)` : 엔티티 하나를 조회한다. 내부에서 `EntityManger.find()` 를 호출한다.
- `getOne(ID)` : 엔티티를 프록시로 조회한다. 내부에서 `EntityManager.getReference()` 를 호출한다.
- `findAll(...)` : 모든 엔티티를 조회한다. 정렬(`Sort`) 이나 페이징(`Pageable`) 조건을 파라미터로 넣을 수 있다.

<br />

---

## 쿼리메소드 기능

- 메소드 이름으로 쿼리 생성
- NamedQuery
- @Query - 레포지토리 메소드에 쿼리 정의
- 파라미터 바인딩
- 반환 타입
- 페이징과 정렬
- 벌크성 수정 쿼리
- `@EntityGraph`



### 스프링 데이터 JPA가 제공하는 마법 같은 기능

쿼리 메소드 기능 3가지

- 메소드 이름으로 쿼리 생성
- 메소드 이름으로 JPA NamedQuery 호출
- `@Query` 어노테이션으로 레포지토리 인터페이스에 쿼리 직접 정의



### 메소드 이름으로 쿼리 생성

- 스프링 데이터 JPA 는 메소드 이름을 분석해서 JPQL을 생성하고 실행한다.



**쿼리 필터 조건**

spring > project > spring data jpa > query creation 에서 다양한 기능을 볼 수 있다.

- 조회 : find...By, read...By, query...By, get...By
  - findHelloBy 처럼 ...에 식별하기 위한 내용(설명)이 들어가도 된다. (...은 생략도 가능)
- 카운트 : count...By 반환타입 long
- 존재 : exists...By 반환타입 boolean
- 삭제 : delete...By, remove...By 반환타입 long
- 중복제거 : findDistinct, findMemeberDistinctBy
- 갯수제한 : findFirst3, findFirst, findTop, FindTop3

> 엔티티 필드명이 변경되면 인터페이스에 정의한 메소드 이름도 변경해주어야 한다. 그렇지 않으면 애플리케이션 실행 시점에 오류가 발생한다. 스프링 데이터 JPA 의 큰 장점이다.



**오류의 심각성**

컴파일 시점에 나는 오류 < 애플리케이션 실행 시점에 나는 오류 < 고객이 버튼을 눌렀을 떄 나는 오류..



---

## JPA NamedQuery



- 코드를 만들기 번거로워서 자주 사용하지 않는다.
- NamedQuery 의 큰 장점은 애플리케이션 로딩 시점에 쿼리를 파싱해서 오류가 있으면 에러를 발생시킨다.
- 하지만 `@Query` 메소드가 위 기능을 다 담으면서, 더 막강한 기능을 제공한다.

```java
@Entity
@NamedQuery(
	name="Memeber.findByUserName",
  query="select m from Member m where m.username = :username"
)
public class Member {
  
}
```

@Repository (순수 JPA)

```java
public List<Member> findByUsername(String username) {
  return em.createNamedQuery("Member.findByUsername", Member.class)
    	.setParameter("username", username)
    	.getResultList();
}
```

또는

JpaRepository (Spring Data JPA)

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query(name = "Member.findByUsername")
    List<Member> findByUsername(@Param("username") String username);
}
```

- `@Query` 가 우선순위고, 다음으로 메소드 이름으로 쿼리를 생성한다.

<br />

---

## @Query, 레포지토리 메소드에 쿼리 정의하기



- `@Query` 안에 JPQL 에서 오타가 발생하면, 애플리케이션 로딩 시점에 오류를 발생시킨다.
- 쿼리가 복잡할 때 이 기능을 많이 사용한다.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {

    @Query("select m from Member m where m.username = :username and m.age = :age")
    List<Member> findUser(@Param("username") String username, @Param("age") int age);
}

```

<br />

---

## @Query, 값, DTO 조회하기



```java
public interface MemberRepository extends JpaRepository<Member, Long> {
		
  // 컬럼 하나 조회하기
  @Query("select m.username from Member m")
  List<String> findUsernameList();

  // DTO 조회하기
  @Query("select new co.wordbe.jpaspringdatajpa.dto.MemberDto(m.id, m.username, t.name) from Member m join m.team t")
  List<MemberDto> findMemberDto();
}
```

<br />

---

## 파라미터 바인딩

- 위치 기반 (순서가 바뀌면 큰일날 수 있으니 사용하지 않는 것이 좋다.)
- 이름 기반 (가독성과 유지보수성이 좋다.)

**IN 사용하기**

```java
@Query("select m from Member m where m.username in :names")
List<Member> findByNames(@Param("names") Collection<String> names);
```

<br />

---

## 반환 타입

- Spring Data JPA 는 유연한 반환타입을 지원한다.
- 같은 `findByUsername(String name)` 에 대하여 리턴값으로 `List<Member>`, `Member`, `Optional<Member>` 을 제공할 수 있다.

```java
List<Member> findMemberListByUsername(String usernae); // 컬렉션 -> 조회된 것이 없으면 빈 컬렉션 리턴
Member findMemberByUsername(String usernae); // 단건 -> 없으면 null 을 리턴한다.
Optional<Member> findOptionalMemberByUsername(String usernae); // 단건 옵셔널
```

- 조회된 대상이 없다면, JPA 에서는 `NoResultException` 예외를 던지는 반면, 스프링 데이터 JPA 에서는 이를 try, catch 로 감싸서 null 을 반환해준다. (위 코드 2번째줄의 경우)
- Optional 로 받는 것이 좋다.
- 여러 건 있는데 단건 리턴 타입으로 반환되면, JPA 에서 `NonUniqueResultException` 예외를 던진다. 스프링 데이터 JPA는 이를 `IncorrectResultSizeDataAccessException` 으로 바꾸어 예외를 던진다.

<br />

---

## 순수 JPA 페이징과 정렬

JPA 에서 페이징은 어떻게 하는가?

SQL 로 페이지하려면 힘들다. 특히 Oracle 은 rownum 을 세번 감싸서 조회한다.



```java
public List<Member> findByPage(int age, int offset, int limit) {
  return em.createQuery("select m from Member m where m.age = :age order by m.username desc", Member.class)
    .setParameter("age", age)
    .setFirstResult(offset)
    .setMaxResults(limit)
    .getResultList();
}

public long totalCount(int age) {
  return em.createQuery("select count(m) from Member m where m.age = :age", Long.class)
    .setParameter("age", age)
    .getSingleResult();
}
```

```java
@Test
public void paging() {
  //given
  memberJpaRepository.save(new Member("member1", 10));
  memberJpaRepository.save(new Member("member2", 10));
  memberJpaRepository.save(new Member("member3", 10));
  memberJpaRepository.save(new Member("member4", 10));
  memberJpaRepository.save(new Member("member5", 10));

  int age = 10;
  int offset = 0;
  int limit = 3;

  //when
  List<Member> members = memberJpaRepository.findByPage(age, offset, limit);
  long totalCount = memberJpaRepository.totalCount(age);

  // 페이지 계산 공식 적용...
  // totalPage = totalCount / size...
  // 마지막 페이지...
  // 최초 페이지...

  //then
  assertThat(members.size()).isEqualTo(3);
  assertThat(totalCount).isEqualTo(5);
}
```

<br />

---

## 스프링 데이터 JPA 페이징과 정렬

**페이징과 정렬 파라미터**

- `org.springframework.data.domain.Sort` : 정렬 기능
- `org.springframework.data.domain.Pageable` : 페이징 기능 (내부에 Sort 포함)

**특별한 반환 타입**

- `org.springframework.data.domain.Page` : 추가 count 쿼리 결과를 포함하는 페이징
- `org.springframework.data.domain.Slice` : 추가 count 쿼리 없이 다음 페이지만 확인 가능 (내부적으로 limit + 1 조회)
- `List` 자바 컬렉션 : 추가 count 쿼리 없이 결과만 반환



**페이징과 정렬 사용 예제**



```java
Page<Member> findByAge(int age, Pageable pageable);
```

```java
@Test
public void paging() {
  //given
  memberRepository.save(new Member("member1", 10));
  memberRepository.save(new Member("member2", 10));
  memberRepository.save(new Member("member3", 10));
  memberRepository.save(new Member("member4", 10));
  memberRepository.save(new Member("member5", 10));

  int age = 10;
  PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "username"));

  //when
  Page<Member> page = memberRepository.findByAge(age, pageRequest);

  //then
  List<Member> content = page.getContent();
  long totalElements = page.getTotalElements();

  assertThat(content.size()).isEqualTo(3);
  assertThat(totalElements).isEqualTo(5);
  assertThat(page.getNumber()).isEqualTo(0);
  assertThat(page.getTotalPages()).isEqualTo(2);
  assertThat(page.isFirst()).isTrue();
  assertThat(page.hasNext()).isTrue();

}
```

<br />

- Page 는 Slice를 상속받는다.
- Slice 는 조회하라고 요청한 갯수보다 (size) 하나 더 조회한다. 그래서 다음 개체가 있는지 확인한다.
- totalElements, totalPages 등은 구하지 않는다. 따라서 자세한 값을 원하는 경우 Page를 사용한다.

<br />

```java
@Query(value = "select m from Member m left join m.team t",
       countQuery = "select count(m) from Member m")
Page<Member> findByAge(int age, Pageable pageable);
```

쿼리가 복잡해지면 카운트 쿼리를 분리하여 수정할 수 있다.

정렬도 복잡해지면, 위 쿼리(value)에 직접 JPQL 추가하여 수정ㅎ나다.

<br />

DTO 로 바꾸기

- Page<MemberDto> toMap = page.map(member -> new MemberDto(m.getId(), m.getUsername));

Page 는 1이 아니라 0부터 시작이다.















---

## @EntityGraph

연관된 엔티티들을 SQL 한번에 조회하는 방법



- @EntityGraph 는 JPA 표준 스펙이다.
- 간단한 fetch join 을 어노테이션을 대체할 수 있다.
- select 엔티티할 때, fetch = LAZY 모드로 하면, 해당 필드는 가짜 객체(프록시)가 들어있게 된다.
- fetch join : join 후 select 절에 join 된 테이블의 컬럼도 다같이 가져와준다.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {

    @Query("select m from Member m left join fetch m.team")
    List<Member> findMemberFetchJoin();

    @Override
    @EntityGraph(attributePaths = {"team"})
    List<Member> findAll();
  
  
}
```

- `@EntityGraph(attributePaths = {"team"})` 와 같이 사용하면 바로 위의 findMemberFetchJoin 처럼 JPQL 로 페치 조인하는 것과 같다.
- 아래와 같이 사용할 수도 있다.

```java
@EntityGraph(attributePaths = {"team"})
@Query("select m from Member m")
List<Member> findMemberEntityGraph();
```

<br />

아래와 같이 응용할 수도 있다.

```java
@EntityGraph(attributePaths = {"team"})
List<Member> findEntityGraphByUsername(@Param("username") String name);
```



<br />

@NamedEntityGraph

엔티티에 매핑한 후 레포지토리에 어노테이션을 붙여 위와 같이 fetch 모드를 작동시킬 수 있다.

```java
@NamedEntityGraph(name = "Member.all", attributeNodes = @NamedAttributeNode("team"))
@Entity
public class Member { ... }
```

```java
@EntityGraph("Member.all")
List<Member> findEntityGraphByUsername(@Param("username") String name);
```

<br />



---

## 벌크성 수정 쿼리



### JPA 를 사용한 벌크성 수정 쿼리

```java
@RequiredArgsConstructor
@Repository
public class MemberJpaRepository {
	// 벌크성 업데이트
  public int bulkAgePlus(int age) {
    return em.createQuery(
      "update Member m set m.age = m.age + 1" +
      " where m.age >= :age")
      .setParameter("age", age)
      .executeUpdate();
  }
}
```

```java
@Test
public void bulkUpdate() throws Exception {
  //given
  memberJpaRepository.save(new Member("member1", 10));
  memberJpaRepository.save(new Member("member2", 19));
  memberJpaRepository.save(new Member("member3", 20));
  memberJpaRepository.save(new Member("member4", 21));
  memberJpaRepository.save(new Member("member5", 40));

  //when
  int resultCount = memberJpaRepository.bulkAgePlus(20);

  //then
  assertThat(resultCount).isEqualTo(3);
}
```



<br />

### 스프링 데이터 JPA 의 벌크성 수정 쿼리

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
	@Modifying
  @Query("update Member m set m.age = m.age + 1 where m.age >= :age")
  int bulkAgePlus(@Param("age") int age);
}	
```

> 위 JPA 코드에서 executeUpdate() 와 동일한 효과를 주기위해 `@Modifying` 어노테이션을 붙여야 업데이트 쿼리가 실행된다. 그렇지 않으면 에러가 난다.

```java
@Test
public void bulkUpdate() throws Exception {
  //given
  memberRepository.save(new Member("member1", 10));
  memberRepository.save(new Member("member2", 19));
  memberRepository.save(new Member("member3", 20));
  memberRepository.save(new Member("member4", 21));
  memberRepository.save(new Member("member5", 40));

  //when
  int resultCount = memberRepository.bulkAgePlus(20);

  // 여기서 중간에 영속성 컨텍스트의 값도 변경이 되었는지 확인해보자.
  List<Member> result = memberRepository.findByUsername("member5");
  Member member5 = result.get(0);
  System.out.println("member5 = " + member5); // 41 일줄 알았지만, 40 그대로이다. 업데이트 쿼리를 그대로 실행시키고 영속성 컨텍스트에 반영되지 않는다.

  //then
  assertThat(resultCount).isEqualTo(3);
}
```

따라서 업데이트 후 영속성 컨텍스트에서 추가로 조회할 것이 있다면,

아래와 같이 영속성컨텍스트(EntityManager) 를 비워주고(남은 쿼리를 실행시키고, flush), 삭제(clear) 하는 과정이 필요하다. 그렇다면 조회했을 때 DB에서 조회한 후 그 값을 담은 새롭게 영속성 컨텍스트가 생길 것이다.

```java
em.flush();
em.clear();
List<Member> result = memberRepository.findByUsername("member5");
Member member5 = result.get(0);
System.out.println("member5 = " + member5); // age = 41
```

하지만 스프링 데이터 JPA 에서는 이를 돕는 조금 더 간단한 방법을 지원한다.

```java
@Modifying(clearAutomatically = true)
@Query("update Member m set m.age = m.age + 1 where m.age >= :age")
int bulkAgePlus(@Param("age") int age);
```

clearAutomatically = true 옵션을 설정해주면 된다.

<br />

업데이트만 깔끔하게 하는 트랜잭션이라면 상관 없지만, 그 후에 조회를 하는 등의 로직이 있다면 이 부분은 반드시 확인하고 수정해야 주어야 할 것이다.



---

## JPA Hint & Lock



### Hint

SQL의 힌트가 아니라 JPA 힌트이다.

조회용으로만 쿼리를 쓰고싶을 때 사용한다.

우선 자동으로 변경감지가 되는 테스트를 보자

```java
@Test
public void queryHint() {
  //given
  Member member1 = new Member("member1", 10);
  memberRepository.save(member1);
  em.flush();
  em.clear();

  //when
  Member findMember = memberRepository.findById(member1.getId()).get();
  findMember.setUsername("member2");
  em.flush();
}
```

실행결과 아래처럼 조회 후 업데이트 쿼리가 자동으로 실행된다.

```sql
select
        member0_.member_id as member_i1_0_0_,
        member0_.age as age2_0_0_,
        member0_.team_id as team_id4_0_0_,
        member0_.username as username3_0_0_ 
    from
        member member0_ 
    where
        member0_.member_id=?

update
        member 
    set
        age=?,
        team_id=?,
        username=? 
    where
        member_id=?
```

<br />

```java
@QueryHints(value = @QueryHint(name = "org.hibernate.readOnly", value = "true'"))
Member findReadOnlyByUsername(String username);
```

```java
@Test
    public void queryHint() {
        //given
        Member member1 = new Member("member1", 10);
        memberRepository.save(member1);
        em.flush();
        em.clear();

        //when
        Member findMember = memberRepository.findReadOnlyByUsername("member1");
        findMember.setUsername("member2");
        em.flush();
    }
```

위와 같이 하면 업데이트 쿼리는 실행되지 않는다.

무엇을 결정할지는 성능 테스트를 해보고 결정하면 된다. 애플리케이션에서 정말 중요하고 트래픽이 많은 조회에 설정하면 좋다.



### Lock

- Pessimistic (비관적) Lock, Optimisitic Lock 등 JPA 에서도 lock 이 지원된다.
- 트랜잭션, 락, 고립수준레벨 등을 이해하고 사용하는 것이 좋다.
- 실시간 트래픽이 많은 경우 lock을 걸지 않는 것이 좋다. 하려면 버저닝 방법을 사용한 optimistic 락을 사용하는 것이 좋다.
- 데이터의 정합성이 중요한 경우(정산 등) pessimistic 락을 사용하는 것이 좋다.

```sql
select for update
```



```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
List<Member> findLockByUsername(String username);
```

```java
@Test
public void lock() {
  //given
  Member member1 = new Member("member1", 10);
  memberRepository.save(member1);
  em.flush();
  em.clear();

  //when
  List<Member> result = memberRepository.findLockByUsername("member1");
}
```

```sql
select
        member0_.member_id as member_i1_0_,
        member0_.age as age2_0_,
        member0_.team_id as team_id4_0_,
        member0_.username as username3_0_ 
    from
        member member0_ 
    where
        member0_.username=? for update
```







