# JPA 009 - 객체지향 쿼리언어(JPQL) 기본문법



JPA 는 다양한 쿼리 방법을 지원한다.

* **JPQL**
* JPA Criteria : java 코드로 작성하고 나중에 JPQL로 번역된다.
* QueryDSL : java 코드로 작성하고 나중에 JPQL로 번역된다.
* 네이티브 SQL : 표준 SQL 문법이 아닌, 데이터베이스 벤더에 종속적 쿼리 사용시
* JDBC API 직접 사용, MyBatis, SpringJdbcTemplate 함께 사용



## JPQL

* JPA를 사용하면 엔티티 객체 중심으로 개발
* 문제는 검색 쿼리
* 검색할 때도 테이블이 아닌 엔티티 객체를 대상으로 검색한다.
* 모든 DB 데이터를 객체로 변환해서 검색하는 것은 불가능하다.
* 애플리케이션이 필요한 데이터만 DB에서 불러오려면 결국 검색 조건이 포함된 SQL이 필요하다.

 

* JPA는 SQL을 추상화한 JPQL 이라는 객체지향 쿼리 언어를 제공한다.
* SQL 문법과 유사해서 `SELECT, FROM, WHERE, GROUP BY, HAVING, JOIN` 등 ANSI 표준은 모두 지원
* JPQL은 엔티티 객체를 대상으로 쿼리한다.
* SQL은 데이터베이스 테이블을 대상으로 쿼리한다.

```java
List<Member> resultList = em.createQuery(
                    "select m from Member m where m.name like '%jack%'", Member.class
            ).getResultList();
            for (Member member : resultList) {
                System.out.println("member = " + member);
            }
```

```shell
Hibernate: 
    /* select
        m 
    from
        Member m 
    where
        m.name like '%jack%' */ select
            member0_.MEMBER_ID as MEMBER_I1_8_,
            member0_.city as city2_8_,
            member0_.street as street3_8_,
            member0_.zipcode as zipcode4_8_,
            member0_.name as name5_8_,
            member0_.TEAM_ID as TEAM_ID8_8_,
            member0_.endDate as endDate6_8_,
            member0_.startDate as startDat7_8_ 
        from
            Member member0_ 
        where
            member0_.name like '%jack%'
```

* SQL 로 번역되어 실행된다.
* 테이블이 아닌 객체를 대상으로 검색하는 객체 지향 쿼리이다.
* SQL을 추상화해서 특정 데이터베이스 SQL에 의존적이지 않다.
* **JPQL은 한마디로 정의하면 객체지향 SQL 이다.**

<br />

### Criteria

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Member> query = cb.createQuery(Member.class);

// 루트 클래스 (조회 시작할 클래스)
Root<Member> m = query.from(Member.class);

// 쿼리 생성
CriteriaQuery<Member> cq = query.select(m).where(cb.equal(m.get("name"), "kim"));
List<Member> resultList = em.createQuery(cq).getResultList();
```

* 문자가 아닌 자바코드로 JPQL을 작성할 수 있다.
* JPQL 빌더 역할
* JPA 공식 기능, 자바 표준 스펙
* 단점 : 너무 복잡하고 실용성이 없다.
  * Criteira 대신 **QueryDSL** 사용을 권장한다.



### QueryDSL

* 문자가 아닌 자바코드로 JPQL 작성 가능
* JPQL 빌더 역할
* 컴파일 시점에 문법 오류 찾을 수 있다.
* 동적쿼리 작성이 편하다.
* 단순하고 쉽다. 실무사용을 권장한다.



### Native SQL

* JPA가 제공하는 SQL을 직접 사용하는 기능
* JPQL로 해결할 수 없는 특정 DB에 의존적 기능
  * 예) 오라클 `CONNECT BY`, 특정 DB만 사용하는 SQL 힌트

```java
em.createNativeQuery("select MEMBER_ID, city, street, zipcode, name from MEMBER")
  .getResultList();
```



> flush 는 commit 이나 query 할 떄 발동한다.

### JDBC 직접 사용, SpringJdbcTemplate 등

* JPA를 사용하면서 JDBC 커넥션을 직접 사용하거나, 스프링 JdbcTemplate, MyBatis 등을 함께 사용 가능
* 단, 영속성 컨텍스트를 적절한 시점에 강제로 `flush()` 하는 것이 필요하다.
  * 예) JPA를 우회해서 실행하기 직전에 영속성 컨텍스트를 수동 플러시한다.



---

## JPQL

* 객체지향 쿼리 언어. 테이블을 대상으로 쿼리하는 것이 아닌 엔티티 객체를 대상으로 쿼리한다.
* JPQL은 SQL을 추상화해서 특정 DB SQL에 의존하지 않는다.
* JPQL은 결국 SQL로 변환된다. DB는 SQL만 받을 수 있으니까.



  ### JPQL 문법

```java
select_문 :: =
  select_절
  from_절
  [where_절]
  [groupby_절]
  [having_절]
  [orderby_절]
 
update_문 :: = update_절 [where_절]
delete_문 :: = delete_절 [where_절]
```



```java
select m from Member as m where m.age > 18
```



* 엔티티와 속성은 대소문자 구분 O
* JPQL 키워드는 대소문자 구분 X (SELECT, FROM, where)
* 엔티티 이름 사용, 테이블 이름이 아니다.
* 별칭은 필수 (m) (as는 생략가능)



### 집합과 정렬

```sql
select
	COUNT(m),
	SUM(m.age),
	AVG(m.age),
	MAX(m.age),
	MIN(m.age)
from Member m
```



### TypeQuery, Query

* `TypeQuery` : 반환 타입이 명확할 때 사용한다.
* `Query` : 반환 타입이 명확지 않을때 사용한다.

```java
TypedQuery<Member> query1 = em.createQuery("select m from Member m", Member.class);
TypedQuery<String> query2 = em.createQuery("select m.name from Member m", String.class);
Query query3 = em.createQuery("select m.name, m.id from Member m");
```



### 결과 조회 API

* `query.getResultList()` :   결과가 하나 이상일 때 리스트 반환 ➞ 결과가 없으면 빈 리스트 반환 (NPE 걱정 없음)
* `query.getSingleResult()` : 결과가 정확히 하나일 때, 단일 객체를 반환한다.
  * 결과가 없으면: `javax.persistence.NoResultException`
  * 둘 이상이면 : `javax.persistence.NoUniqueResultException`
  * Spring Data JPA 를 사용하면, 결과가 없으면 null 반환하거나 Optional 반환한다. 내부적으로 try ~ catch 로 감싸져있다.



### 파라미터 바인딩 - 이름기준, 위치기준

* 이름기준

```java
Member member = new Member();
member.setName("jack");
em.persist(member);

Member singleResult = em.createQuery("select m from Member m where m.name = :name", Member.class)
  .setParameter("name", "jack")
  .getSingleResult();
System.out.println("singleResult = " + singleResult);
```

* 위치기준은 보기에도 명확하지 않고, 쿼리에서 변수 순서가 바뀌면 꼬이게 되므로 사용하지 않는 것이 바람직하다.

```java
SELECT m FROM Member m WHERE m.name = ?1
query.setParameter(1, nameParam);
```

<br />

### 프로젝션

* SELECT 절에 조회할 대상을 지정하는 것
* 프로젝션 대상: 엔티티, 임베디드타입, 스칼라타입(숫자, 문자등 기본 데이터 타입)

```sql
SELECT m FROM Member m (엔티티 프로젝션)
SELECT m.team FROM Member m (엔티티 프로젝션)
SELECT m.address FROM Member m (임베디트타입 프로젝션)
SELECT m.name, m.age FROM Member m (스칼라타입 프로젝션)
DISTINCT 로 중복 제거
```

* `em.createQuery` 결과로 받아오면 이 모두 다 영속성 컨텍스트에서 관리된다.



* Query 타입으로 조회

* `Object[]` 타입으로 조회

  ```java
  Member member = new Member();
              member.setName("jack");
              em.persist(member);
  
              List<Object[]> resultList = em.createQuery("select m.name, m.id from Member m")
                      .getResultList();
              Object[] result = resultList.get(0);
              System.out.println("result[0] = " + result[0]);
              System.out.println("result[1] = " + result[1]);
  ```

* `new` 명령어로 조회

  ```java
  Member member = new Member();
  member.setName("jack");
  em.persist(member);
  
  List<MemberDTO> resultList = em.createQuery("select new co.wordbe.shop.domain.jpql.MemberDTO(m.id, m.name) from Member m", MemberDTO.class)
    .getResultList();
  MemberDTO memberDTO = resultList.get(0);
  System.out.println("memberDTO = " + memberDTO.getName());
  System.out.println("memberDTO = " + memberDTO.getId());
  ```

  * 단순 값을 DTO로 바로 조회한다.
  * 패키지명을 포함한 전체 클래스명을 입력해야 한다.
  * 순서와 타입이 일치해야 한다. (중요)



---

## 페이징(Paging)

* 아트의 경지
* JPA는 페이징을 아래 두 API로 추상화
* `setFirstResult(int startPosition)` : 조회 시작 위치 (0부터 시작)
* `setMaxResult(int maxResult)` : 조회할 데이터 수



```java
for (int i=0; i<100; i++) {
  Member member = new Member();
  member.setName("jack" + i);
  member.setAge(i);
  em.persist(member);
}

List<Member> resultList = em.createQuery("select m from Member m order by m.age desc", Member.class)
  .setFirstResult(0) // 0번부터 (처음부터)
  .setMaxResults(10) // 10개 조회
  .getResultList();


System.out.println("resultList.size() = " + resultList.size());
for (Member member1 : resultList) {
  System.out.println("member1 = " + member1);
}
```





자동으로 SQL 을 만들어준다. 밑에는 H2Dialect 이다. (H2 데이터베이스 방언)

 ```sql
 Hibernate: 
 /* select
         m 
     from
         Member m 
     order by
         m.age desc */ select
           member0_.MEMBER_ID as MEMBER_I1_7_,
 member0_.age as age2_7_,
 member0_.name as name3_7_ 
   from
   Member member0_ 
   order by
   member0_.age desc limit ?
 ```

`persistence.xml` 설정에서 Oracle 데이터베이스 방언으로 벤더를 변경해보면 아래와 같이 Oracle 페이징 정식 쿼리가 출력된다.

```sql
Hibernate: 
    /* select
        m 
    from
        Member m 
    order by
        m.age desc */ select
            * 
        from
            ( select
             row_.*,
             rownum rownum_ 
             from
             ( select
              member0_.MEMBER_ID as MEMBER_ID1_7_,
              member0_.age as age2_7_,
              member0_.name as name3_7_ 
              from
              Member member0_ 
              order by
              member0_.age desc ) row_ 
             where
             rownum <= ?
            ) 
        where
            rownum_ > ?
```

MySQL 방언도 H2Dialect와 유사하다.

```sql
select
  member0_.MEMBER_ID as MEMBER_I1_7_,
  member0_.age as age2_7_,
  member0_.name as name3_7_ 
from
  Member member0_ 
order by
  member0_.age desc limit {offset}, {limit}
```



<br />

---

## 조인 (Join)



* 내부 조인 : 두 테이블에서 조건에 맞는 컬럼이 있을 때만 조인

  ```sql
  select * from Member m [inner] join m.team t
  ```

  

* 외부 조인 : 한 테이블 기준으로 다른 테이블에 조인이 되는 것이 없더라도 옆에 붙여서 모두 조인

  ```sql
  select m from Member m left [outer] join m.team t
  ```

  

* 세타 조인 (막(하는) 조인): 연관관계가 없는 테이블을 이상한? 조건으로 조인하는 것. (cartesian join = cross join)

  ```sql
  select count(m) from Member m, Team t where m.username = t.name
  ```



```java
@Getter @Setter
@NoArgsConstructor
@ToString(exclude = {"id", "team"})
@Entity
public class Member {

  @Id @GeneratedValue
  @Column(name = "MEMBER_ID")
  private Long id;

  private String name;

  private int age;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "TEAM_ID")
  private Team team;

  public void changeTeam(Team team) {
    this.team = team;
    team.getMembers().add(this);
  }
}
```

```java
@Getter @Setter
@Entity
public class Team {

  @Id @GeneratedValue
  @Column(name = "TEAM_ID")
  private Long id;

  private String name;

  // 양방향 매핑
  @OneToMany(mappedBy = "team")
  private List<Member> members = new ArrayList<>();
}
```

```java
Team team = new Team();
team.setName("Square");
em.persist(team);

Member member = new Member();
member.setName("Jack");
member.setAge(20);
member.changeTeam(team);

em.persist(member);

em.flush();
em.clear();

List<Member> resultList = em.createQuery("select m from Member m join m.team t", Member.class)
  .getResultList();
for (Member member1 : resultList) {
  System.out.println("member1 = " + member1);
}
```

<br />

### 조인 - On 절

* On 절을 활용한 조인(JPA 2.1부터 지원)

  1. 조인 대상 필터링

     ```sql
     JPQL:
     select m, t from Member m left join m.team t on t.name = 'A'
     
     SQL:
     select m.*, t.*
       from Member m
       left join Team t
       on t.TEAM_ID = t.id
       and t.name = 'A'
     ```

     

  2. 연관관계 없는 엔티티 외부 조인(하이버네이트 5.1부터)

     ```sql
     JPQL:
     select m, t from Member m left join Team t on m.username = t.name
     
     SQL:
     select m.*, t.*
       from Member m
       left join Team t
       on m.username = t.name
     ```

<br />

---

## 서브 쿼리 (Sub query)



```sql
-- 나이가 평균보다 많은 회원
select m from Member m
 where m.age > (select avg(m2.age) from Member m2)
 
-- 한 건이라도 주문한 고객 (아래 쿼리는 성능 이슈)
select m from Member m
 where (select count(o) from Order o where m = o.member) > 0
```



### 서브 쿼리 지원함수

* [NOT] EXISTS (subquery) : 서브쿼리에 결과가 존재하면 참
  * {ALL | ANY | SOME} (subquery)
  * ALL : 모두 만족하면 참
  * ANY, SOME : 같은 의미, 조건을 하나라도 만족하면 참
* [NOT] IN (subquery) : 서브쿼리 결과 중 하나라도 같은 것이 있으면 참

```sql
-- 팀A 소속인 회원
select m from Member m
 where exists (select t from m.team t where t.name = '팀A')

-- 전체 상품 각각의 재고보다 주문량이 많은 주문들
select o from Order o
 where o.orderAmount > all (select p.stockAmount from Product p)

-- 어떤 팀이든 팀에 소속된 회원
select m from Member m
 where m.team = any (select t from Team t)
```



### JPA 서브 쿼리의 한계

* JPA는 `where`, `having` 절에서만 서브 쿼리 사용 가능

* `select` 절도 가능 (하이버네이트에서 지원)

* `from` 절의 서브 쿼리는 현재 JPA 에서 불가능 ➞ 조인으로 풀 수 있으면 풀어서 해결

  ```sql
  select mm.name, mm.age
    from (select m.name, m.age
            from Member m) as mm
  ```



<br />

## JPQL의 타입 표현

* 문자 : 'HELLO', 'She''s'

* 숫자 : 10L (Long), 10D (Double), 10F (Float)

* Boolean : TRUE, FALSE

* ENUM : 패키지명.클래스이름

* 엔티티 타입 : TYPE(m) = Member (상속관계에서 사용, DTYPE)

  ```java
  DescriminatorValue("Book")
  ```

  

```sql
String query = "select m.name, 'HELLO', true" +
  "from Member m" +
	"where m.type = jpql.MemberType.ADMIN";
```

```java
String query = "select m.name, 'HELLO', true" +
  "from Member m" +
	"where m.type = :memberType";
em.createQuery(query)
  .setParameter("memberType", MemeberType.ADMIN);
```

* EXISTS, IN
* AND, OR, NOT
* =, >=, <=, >, <, <>
* BETWEEN, LIKE, IS NULL 



### 조건식 (CASE 등)

```sql
-- 기본 CASE 식
select
	case when m.age <= 10 then '학생요금'
	case when m.age >= 60 then '경로요금'
	end '일반요금'
from Member m

-- 단순 CASE 식
select
	case t.name
		when '팀A' then '인센티브110%'
	  when '팀B' then '인센티브120%'
	  else '인센티브105%'
	end
from Team t

-- coalesce : 하나씩 조회해서 null이 아니면 반환
-- 사용자 이름이 없으면 이름 없는 회원을 반환
select coalesce(m.username, '이름 없는 회원') from Member m

-- nullif : 두 값이 같으면 null 반환, 다르면 첫번재 값 반환
-- 사용자 이름이 관리자이면 null을 반환하고, 다르면 본인의 이름을 반환
select nullif(m.username, '관리자') from Member m
```



## JPQL 기본함수

### 사용자 정의 함수 호출

* 하이버네이트는 사용 전 방언에 추가해야 한다.

* 사용하는 DB 방언을 상속받고, 사용자 정의 함수를 등록한다.

  ```sql
  select function('group_concat', i.name) from Item i 
  ```

  

  사용자 함수 정의

  ```java
  public class MyDialect extends H2Dialect {
      public MyDialect() {
          registerFunction("group_concat", new StandardSQLFunction("group_concat"StandardBasicTypes.STRING));
      }
  }
  ```

  persistence.xml 에 추가

  ```xml
  <property name="hibernate.dialect" value="패키지명.MyDialect"/>
  ```

  



### 기본 표준 함수

* CONCAT, ||
* SUBSTRING
* TRIM
* LOWER, UPPER
* LOCATE
* ABS, SQRT, MOD
* SIZE, INDEX(JPA 용도)

hql : hibernate query

























































