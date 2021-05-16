# JPA 001 - JPA란

<br />

## 0. JPA 소개

JDBC > MyBatis, JdbcTemplate > JPA

### JPA 와 실무

* SQL 자동화, 수십줄의 코드가 한 두줄로

* 실무에 도입하면?

  실무는 수십 개 이상의 복잡한 객체와 테이블 사용

  * 객체와 테이블을 올바르게 매핑하는 방법을 모른다.

<br />

목표는 - 객체와 테이블을 설계 매핑하는 방법 알기

* 기본 키, 외래 키 매핑
* 1:N, N:1, 1:1, N:M
* 실무 노하우, 성능 고려
* 어떠한 복잡한 시스템도 JPA 로 설계 가능
  * JPA 가 어떤 SQL을 언제 만드는지 알게 될 것.

<br />

* JPA 표준 스펙 500페이지.
* 16시간, 하루 1시간 반 2주완성

<br />

### JPA 적용

* 우아한형제들, 쿠팡, 카카오, 네이버 등 JPA 적용
* 조 단위 거래금액 발생하는 다양한 서비스에서 사용, 검증됨
* 최신 스프링 예제 JPA 기본 기술 적용
* 토비 스프링 이일민님 JPA 기본 적용
* ibatis, Mybatis 점유율을 JPA 가 머지않아 제쳐질 것
  * 단순 SQL 작성으로 내 인생을 낭비하지 않게 될 수 있음
  * 남는 시간에 더 많은 설계 고민, 테스트 코드 작성
  * 개발이 즐거워진다.

<br />

---

## 1. JPA와 모던 자바 데이터 저장 기술

<br />

### SQL 중심적 개발 문제점

**1) SQL 의존적 개발을 피하기 어렵다**

객체지향언어 - Java, Scala

데이터베이스 세계의 헤게모니 - RDMBS 가 주축이다. Oracle, MySQL

코드를 열어보면 모두 SQL 이다. SQL 중심적 개발이 된다.

CRUD 는 무한 반복, 지루한 코드다.

* INSERT INTO VALUES
* UPDATE SET
* SELECT
* DELETE ...

SQL 의존적 개발을 피하기 어렵다. 객체 필드를 고치면, SQL 컬럼을 다 고쳐야 한다.

<br />

**2) 패러다임 불일치 - 객체지향 vs 관계형데이터베이스**

객체를 관계형 데이터베스에 저장하기 위해서는 객체를 SQL 변환하여 관계형데이터베이스에 넣는다. 개발자는 곧 SQL 매퍼다.

<br />

**객체와 테이블 간 매핑시 고민할 점**

1. 상속

   * 객체 상속 관계 : Table 슈퍼타입-서브타입 관계

   대응 관계로 설게를 하면, 조회시 JOIN, 각 객체의 매핑이라는 복잡한 문제가 따라온다. 따라서 DB에 저장할 객체는 상속 관계를 사용하지 않는다.

2. 연관관계

   * 객체는 참조를 사용한다. member.getTeam()
   * 테이블은 외래키를 사용한다. JOIN ON M.TEAM_ID = T.TEAM_ID

   테이블은 양방향 매핑이 가능한데, 객체는 단방향 연관관계가 적용된다. 따라서 객체를 테이블에 맞추어 모델링하게 된다.

   * 객체, RDBMS 같이 사용하려면 Member 모두 조회 하여 객체에 넣고, Team 모두 조회하여 객체에 넣은 후 `member.setTeam(team)` 하여 return 하여 조회하는 코드 작성한다. (번거롭다.) 이 때문에 모든 Memeber, Team 모든 데이터가 다 들어있는 슈퍼DTO 를 만들기도 했었다.. 생산성은 좋았다.
   * 객체 모델링에서 자바 컬렉션에서 관리하면 편하다!
   * 객체 그래프 탐색 : 객체는 자유롭게 객체 그래프를 탐색할 수 있어야 한다.
     * 엔티티를 신뢰할 수 없는 문제가 있다.
     * 모든 객체를 미리 로딩할 수는 없다.

3. 데이터 타입

4. 데이터 식별 방법

<br />

계층형 아키텍처에서 진정한 의미의 계층 분할이 어렵다.

>  SQL 로 객체를 가져왔을 때 vs 자바 컬렉션에서 객체 조회할 때
>
> member1 == member2 전자는 다르지만, 후자는 같다.

객체답게 모델링 할 수록 매핑 작업이 많이 늘어난다.

객체를 자바 컬렉션에 저장 하듯이 DB에 저장할 수는 없을까? JPA (Java Persistence API)

<br />

---

## 2. JPA란

Java Persistence API

- Java 진영 ORM 표준

ORM (Object-relational Mapping, 객체 관계 매핑)

* 객체는 객체대로 설계하고, RDBMS 는 RDBMS 대로 설계한다.
* ORM 프레임워크가 중간에서 매핑해준다.
* 대중적 언어에 대부분 ORM 기술이 존재 (typescript, python)

JPA는 애플리케이션과 JDBC 사이에서 동작한다.

java > JPA > JDBC API > DB

<br />

### JPA 동작 - 저장, 조회

* SQL 생성
* JDBC API 사용
* (조회시 ResultSet 매핑)
* 패러다임 불일치 해결

<br />

### 히스토리

* EJB - 엔티티 빈(자바 표준)
* 하이버네이트 (오픈소스)
* JPA (자바 표준)

<br />

JPA 는 표준 명세이다. 인터페이스의 모음이다. JPA 2.1 표준 명세를 구현한 3가지 구현체가 있다. (Hibernate, EclipseLink, DataNucleus)

JPA 2.0 이후로 왠만한 기능은 다 된다. 지금은 JPA 2.2 사용 (2021년)

<br />

### JPA 사용이유

* SQL 중심적 개발에서 객체 중심으로 개발
* 생산성
* 유지보수 : 객체만 수정하면되고, SQL 은 JPA 가 자동으로 생성
* 패러다임 불일치 해결
* 성능
* 데이터 접근 추상화와 벤더 독립성
* 표준

<br />

### 생산성 - JPA와 CRUD

* 저장 : `jpa.persist(member)`
* 조회 : `Member member = jpa.find(memberId)`
* **수정 : `member.setName("변경할 이름")`**
* 삭제 : `jpa.remove(member)`

<br />

### JPA와 상속

새로운 필드 추가 후 저장

```java
jpa.persist(album);
```

나머지는 JPA가 처리

```sql
INSERT INTO ITEM ...
INSERT INTO ALBUM ...
```

<br />

새로운 필드 추가 후 조회

```java
Album album = jpa.find(Album.class, albumId);
```

나머지는 JPA가 처리

```sql
SELECT I.*, A.*
  FROM ITEM I
  JOIN ALBUM A ON I.ITEM_ID = A.ITEM_ID
```

<br />

### JPA와 연관관계, 객체 그래프 탐색

연관관계 저장

```java
member.setTeam(team);
jpa.persist(member);
```

객체 그래프 탐색

```java
Member member = jpa.find(Member.class, memberId);
Team team = member.getTeam();
```

JPA를 통해 `Member` 객체를 가져온다면, 신뢰할 수 있다. 신뢰할 수 있는 엔티티, 계층이다. 따라서 2번째 줄처럼 자유롭게 객체그래프를 탐색할 수 있다.

<br />

### JPA와 비교하기

```java
String memberId = "100";
Member member1 = jpa.find(Member.class, memberId);
Member member2 = jpa.find(Member.class, memberId);
member1 == member2 // true
```

JPA는 동일한 트랜잭션에서 조회한 엔티티는 같음을 보장한다.

<br />

### JPA의 성능 최적화 기능

* 버퍼링 : 모아서 쏜다.
* 캐시 : 자주쓰는 것 저장하여 성능 개선

1. 1차 캐시와 동일성(identity) 보장
2. 트랜잭션을 지원하는 쓰기 지연(transactional write-behind)
3. 지연 로딩(Lazy Loading)

<br />

#### 1차 캐시와 동일성 보장

1. 같은 트랜잭션 안에서 같은 엔티티를 반환 - 조회 성능 약간 향상 (위 예제에서 같은 쿼리 호출시 첫번째는 호출되고, 두번째는 캐싱데이터를 가져온다.)

2. DB Isolation Level 이 Read Commit(1단계) 이어도 애플리케이션 Repeatable Read(2단계) 보장

   > 애플리케이션에서 고립수준을 지원하기 때문에, DB에서 고립수준을 한 단계 낮추어도 된다. DB에서 동시성을 향상시킨다. 때문에 일관성이 맞지 않을 수 있는데 이를 JPA가 잡아준다.

#### 트랜잭션을 지원하는 쓰기 지연

"버퍼링"

**INSERT**

1. 트랜잭션을 커밋할 때까지 INSERT SQL을 모은다.
2. JDBC BATCH SQL 기능을 사용해서 한번에 SQL을 전송한다.

```java
transaction.begin();
em.persist(memberA);
em.persist(memberB);
em.persist(memberC);
transaction.commit(); // 커밋하는 순간 데이터베이스에 INSERT SQL을 모아서 보낸다.
```

**UPDATE**

1. UPDATE, DELETE로 인한 ROW락 시간 최소화
2. 트랜잭션 커밋 시 UPDATE, DELETE SQL 실행하고, 바로 커밋한다.

```java
transaction.begin();
changeMember(memberA);
deleteMember(memberB);
비즈니스_로직_수행(); // 비즈니스 로직 수행 동안 DB 로우락이 걸리지 않는다.
transaction.commit(); // 커밋하는 순간 데이터베이스에 UPDATE, DELETE SQL을 모아서 보낸다.
```

<br />

#### 지연로딩과 즉시로딩

* 지연로딩 : 객체가 실제 사용될 때 로딩

  ```java
  Member member = jpa.find(memberId); // SELECT * FROM MEMBER
  Team team = member.getTeam();
  String teamName = team.getName(); // SELECT * FROM TEAM
  ```

* 즉시로딩 : JOIN SQL로 한번에 연관된 객체까지 미리 조회

  ```java
  Member member = jpa.find(memberId); // SELECT M.*, T.* FROM MEMBER JOIN TEAM ...
  Team team = member.getTeam();
  String teamName = team.getName();
  ```



ORM은 객체와 RDB 두 기둥위에 있는 기술이다. 둘 다 잘해야 한다. 관계형 데이터베이스 공부는 꾸준하게 필요하다.





---

## 3. JPA 실습



### h2 DB 로컬 설치 및 실행

```shell
$ brew install h2
$ h2 -web
```

브라우저에서 localhost:8082 들어가서 `jdbc:h2:~/test` 에 데이터베이스 생성

이러면 내 로컬에 `~/test` 경로에 `test.mv.db` 라는 이름으로 데이터베이스가 만들어진다.

```shell
# ctrl + c 눌러서 나오고 이번에는 백그라운드에서 실행
$ brew services start h2
```

DB 에 쿼리를 동작시키려면 TCP 네트워크로 접속해야함. 따라서 아래 주소로 접속한다.

브라우저에서 localhost:8082 로 드어간뒤 url `jdbc:h2:tcp://localhost/~/test` 로 접속한다. 

데이터베이스 접속 성공.



### java 설정

/resource/META-INF/persistence.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence" version="2.2"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd">
    <persistence-unit name="hello">
        <properties>
            <property name="javax.persistence.jdbc.driver" value="org.h2.Driver"/>
            <property name="javax.persistence.jdbc.user" value="sa"/>
            <property name="javax.persistence.jdbc.password" value=""/>
            <property name="javax.persistence.jdbc.url" value="jdbc:h2:tcp://localhost/~/test"/>
            <property name="hibernate.dialect" value="org.hibernate.dialect.H2Dialect"/>

            <property name="hibernate.show_sql" value="true"/>
            <property name="hibernate.format_sql" value="true"/>
            <property name="hibernate.use_sql_comments" value="true"/>
<!--            <property name="hibernate.hbm2ddl.auto" value="update"/>-->
        </properties>
    </persistence-unit>
</persistence>
```



간단한 엔티티 삽입 예제

```java
public class JpaMain {
    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("hello");
        EntityManager em = emf.createEntityManager();

        EntityTransaction tx = em.getTransaction();
        tx.begin();

        try {
            Member member = Member.builder()
                    .id(1L)
                    .name("jack")
                    .build();
            em.persist(member);
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
        } finally {
            em.close();
        }

        emf.close();
    }
}
```







JPA는 특정 데이터베이스에 종속되지 않는다.

각 데이터베이스가 제공하는 SQL 문법과 함수는 조금씩 다르다.

| MySQL       | Oracle   |
| ----------- | -------- |
| VARCHAR     | VARCHAR2 |
| SUBSTRING() | SUBSTR() |
| LIMIT       | ROWNUM   |

* 방언 (dialect) 이란 SQL 표준을 지키지 않는 특정 데이터베이스만의 고유 기능이다.
* JPA는 Dialect 를 사용한다.
* 하이버네이트는 40가지 이상의 데이터베이스 방언을 지원한다.



### JPA 구동방식

1. Persistence 가 설정정보를 조회한다. `META-INF/persistence.xml`
2. Persistence 는 EntityManagerFactory를 생성한다.
3. EntityManagerFactory는 EntityManger 들을 생성한다.







   









