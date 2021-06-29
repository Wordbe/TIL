# Querydsl 001 - 환경설정, 기본 문법

Query DSL (Domain Specific Language)



<br />

---

# 1. 환경설정

Querydsl 사용을 위해 설정이 필요하다.



Gradle > Tasks > other > compileQuerydsl

```groovy
plugins {
    id 'org.springframework.boot' version '2.5.1'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    // querydsl plugin 추가
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
    id 'java'
}

group = 'co.wordbe'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    // querydsl library 추가
    implementation 'com.querydsl:querydsl-jpa'
    implementation 'org.projectlombok:lombok:1.18.18'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
    useJUnitPlatform()
}

// querydsl 버전에 맞게 추가
def querydslDir = "$buildDir/generated/querydsl"
querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}
sourceSets {
    main.java.srcDir querydslDir
}
configurations {
    querydsl.extendsFrom compileClasspath }
compileQuerydsl {
    options.annotationProcessorPath = configurations.querydsl
}
```



엔티티를 다 만들었다면, 아래 명령어로 Q엔티티를 생성한다.

```shell
$ ./gradlew clean compileQuerydsl
```

<br />

---

# 2. Querydsl 문법

<br />

## 기본 Q-Type 활용

Q클래스 인스턴스 사용하는 2가지 방법

```java
QMember qMemeber = new QMember("m"); // 1. 별칭 직접 지정 (기본은 member1 로 쓰여있다.)
QMember qMemeber = QMember.member; // 2. 기본 인스턴스 사용
```

2번의 경우 스태틱 임포트를 통해 예쁘게 사용할 수도 있다.

```java
import static co.wordbe.querydsl.entity.QMember.*;

Member member1 = queryFactory
                .select(member)
                .from(member)
                .where(member.username.eq("member1"))
                .fetchOne();
```

```properties
jpa:
    properties:
      hibernate:
        format_sql: true # 실행한 SQL 로그
        use_sql_comments: true # 실행한 JPQL 로그
```

JPQL 로그를 보면 기본으로 alias 는 member1 인 것을 볼 수 있지만,

1번 방법 처럼 별칭을 정해주면 m 으로 바뀐 것을 확인할 수 있다.

<br />

---

## 검색 조건 쿼리



- 검색조건 : `.and()`, `or()`
- .eq
- .ne
- .not
- .isNotNull
- .in
- .notIn
- .between
- .goe (>=)
- .gt (>)
- .loe (<=)
- .lt (<)
- .like
- .contains("member") (like '%member%')
- .startsWith("member") (like 'member%')

```java
@Test
public void search() {
  Member member1 = queryFactory
    .selectFrom(member)
    .where(member.username.eq("member1")
           .and(member.age.eq(10)))
    .fetchOne();
  assertThat(member1.getUsername()).isEqualTo("member1");
}

@Test
public void searchAndParam() {
  // search 와 똑같다.
  // 동적 쿼리 만들 때 좋다.

  Member member1 = queryFactory
    .selectFrom(member)
    .where(
    member.username.eq("member1"),
    member.age.eq(10)
  )
    .fetchOne();
  assertThat(member1.getUsername()).isEqualTo("member1");
}
```



## 결과 조회

- fetch() : 리스트 조회, 데이터 없으면 빈 리스트 반환
- fetchOne() : 단 건 조회
  - 결과 없으면 null
  - 결과가 둘 이상이면 `com.querydsl,core.NullUniqueResultException`
- fetchFirst() = limit(1).fetchOne()
- fetchResults() : 페이징 정보 포함, total count 쿼리 추가 실행
- fetchCount() : count 쿼리로 변경해서 count 수 조회

```java
@Test
public void resultFetch() {
  List<Member> fetch = queryFactory
    .selectFrom(member)
    .fetch();

  Member fetchOne = queryFactory
    .selectFrom(QMember.member)
    .fetchOne();

  Member fetchFirst = queryFactory
    .selectFrom(QMember.member)
    .fetchFirst();

  QueryResults<Member> fetchResults = queryFactory
    .selectFrom(member)
    .fetchResults();
  fetchResults.getTotal();
  List<Member> content = fetchResults.getResults();

  long fetchCount = queryFactory
    .selectFrom(member)
    .fetchCount();
  System.out.println("fetchCount = " + fetchCount);
}
```





fetchCount 를 하면 pk 값으로 카운트를 조회하게 된다.

```sql
/* select
        count(member1) 
    from
        Member member1 */
```



---

## 정렬

```java
/**
 * 회원 정렬 순서
 * 1. 회원 나이 내림차순(desc)
 * 2. 회원 이름 오름차순(asc)
 * 단, 2에서 회원 이름이 없으면 마지막에 출력 (nulls last)
 */
@Test
public void sort() {
  em.persist(new Member(null, 100));
  em.persist(new Member("member5", 100));
  em.persist(new Member("member6", 100));
  List<Member> result = queryFactory
    .selectFrom(member)
    .where(member.age.eq(100))
    .orderBy(member.age.desc(), member.username.asc().nullsLast())
    .fetch();

  Member member5 = result.get(0);
  Member member6 = result.get(1);
  Member memberNull = result.get(2);
  assertThat(member5.getUsername()).isEqualTo("member5");
  assertThat(member6.getUsername()).isEqualTo("member6");
  assertThat(memberNull.getUsername()).isNull();
}
```



```sql
/* select
        member1 
    from
        Member member1 
    where
        member1.age = ?1 
    order by
        member1.age desc,
        member1.username asc nulls last */
```

<br />

---

## 페이징

```java
@Test
public void paging1() {
  List<Member> fetch = queryFactory
    .selectFrom(member)
    .orderBy(member.username.desc())
    .offset(1)
    .limit(2)
    .fetch();
  assertThat(fetch.size()).isEqualTo(2);
}

@Test
public void paging2() {
  QueryResults<Member> queryResults = queryFactory
    .selectFrom(member)
    .orderBy(member.username.desc())
    .offset(1)
    .limit(2)
    .fetchResults();
  assertThat(queryResults.getTotal()).isEqualTo(4);
  assertThat(queryResults.getOffset()).isEqualTo(1);
  assertThat(queryResults.getLimit()).isEqualTo(2);
  assertThat(queryResults.getResults().size()).isEqualTo(2);
}
```

<br />

---

## 집합

### Aggregation

```java
@Test
public void aggregation() {
  List<Tuple> fetch = queryFactory
    .select(member.count(),
            member.age.sum(),
            member.age.avg(),
            member.age.max(),
            member.age.min()
           ).from(member)
    .fetch();
  Tuple tuple = fetch.get(0);
  assertThat(tuple.get(member.count())).isEqualTo(4);
  assertThat(tuple.get(member.age.sum())).isEqualTo(100);
  assertThat(tuple.get(member.age.avg())).isEqualTo(25);
  assertThat(tuple.get(member.age.max())).isEqualTo(40);
  assertThat(tuple.get(member.age.min())).isEqualTo(10);
}
```

```sql
/* select
        count(member1),
        sum(member1.age),
        avg(member1.age),
        max(member1.age),
        min(member1.age) 
    from
        Member member1 */
```

<br />

### + groupBy

```java
/**
 * 팀의 이름과 각 팀의 평균 연령을 구한다.
 */
@Test
public void groupBy() {
  List<Tuple> fetch = queryFactory
    .select(team.name, member.age.avg())
    .from(member)
    .join(member.team, team)
    .groupBy(team.name)
    .fetch();

  Tuple teamA = fetch.get(0);
  Tuple teamB = fetch.get(1);

  assertThat(teamA.get(team.name)).isEqualTo("teamA");
  assertThat(teamA.get(member.age.avg())).isEqualTo(15);

  assertThat(teamB.get(team.name)).isEqualTo("teamB");
  assertThat(teamB.get(member.age.avg())).isEqualTo(35);
}
```

```sql
/* select
        team.name,
        avg(member1.age) 
    from
        Member member1   
    inner join
        member1.team as team 
    group by
        team.name */
```

<br />

### + having

```java
.groupBy(item.price)
.having(item.price.gt(1000))
```

<br />

























