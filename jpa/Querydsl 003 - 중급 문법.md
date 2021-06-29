# Querydsl 003 - 중급 문법



## 프로젝션

프로젝션으로 select 의 대상을 지정할 수 있다.

- 프로젝션 대상이 하나면 타입을 명확하게 지정할 수 있다.
- 프로젝션 대상이 둘 이상이면 튜플이나 DTO로 조회한다.



### 튜플 조회

프로젝션 대상이 둘 이상일 때 사용한다. : `com.querydsl.core.Tuple`

튜플은 리포지토리 계층안에서 사용하는 것이 좋다. 컨트롤러, 서비스 단까지 나갈때는 DTO로 바꾸어 나가는 것이 좋다. Querydsl 을 사용하지 않게 되었을 때 의존성을 줄이기 위함이다.

```java
@Test
public void tupleProjection() {
  List<Tuple> fetch = queryFactory
    .select(member.username, member.age)
    .from(member)
    .fetch();
  for (Tuple tuple : fetch) {
    String username = tuple.get(member.username);
    Integer age = tuple.get(member.age);
    System.out.println("username = " + username);
    System.out.println("age = " + age);
  }
}
```

<br />

### 프로젝션 결과 반환 - DTO 조회

#### 순수 JPA 에서 DTO 조회

- 순수 JPA 에서 DTO를 조회할 때는 new 명령어를 사용해야 한다.
- DTO의 package 이름을 다 적어주어야 해서 지저분하다.
- 생성자 방식만 지원한다.

```java
@Test
public void findDtoByJPQL() {
  List<MemberDto> results = em.createQuery("select new co.wordbe.querydsl.dto.MemberDto(m.username, m.age) from Member m", MemberDto.class)
    .getResultList();
  for (MemberDto result : results) {
    System.out.println("result = " + result);
  }
}
```

#### Querydsl 빈 생성 (Bean population)

결과를 DTO 로 반환할 때 사용한다. 3가지 방법을 지원한다.

- 프로퍼티 접근
- 필드 직접 접근
- 생성자  사용

```java
@Test
public void findDtoBySetter() {
  List<MemberDto> results = queryFactory
    .select(Projections.bean(MemberDto.class,
                             member.username,
                             member.age))
    .from(member)
    .fetch();
  for (MemberDto result : results) {
    System.out.println("result = " + result);
  }
}

@Test
public void findDtoByField() {
  List<MemberDto> results = queryFactory
    .select(Projections.fields(MemberDto.class,
                               member.username,
                               member.age))
    .from(member)
    .fetch();
  for (MemberDto result : results) {
    System.out.println("result = " + result);
  }
}

@Test
public void findDtoByConstructor() {
  List<MemberDto> results = queryFactory
    .select(Projections.constructor(MemberDto.class,
                                    member.username,
                                    member.age))
    .from(member)
    .fetch();
  for (MemberDto result : results) {
    System.out.println("result = " + result);
  }
}
```

<br />

#### 별칭 (alias)

- 프로퍼티나 필드 접근 생성 방식에서 이름이 다를 때 해결 방안 : **별칭을 사용한다.**
- `ExpressionUtils.as(source, alias)` : 필드나, 서브 쿼리에 별칭을 적용할 수 있다.
- `username.as("name")` : 필드에 별칭을 적용할 수 있다. 간단히 사용할 때 좋다.

```java
@Test
public void findUserDto() {
  QMember memberSub = new QMember("memberSub");

  List<UserDto> results = queryFactory
    .select(Projections.fields(UserDto.class,
                               member.username.as("name"),
                               ExpressionUtils.as(JPAExpressions
                                                  .select(memberSub.age.max())
                                                  .from(memberSub), "age")
                              ))
    .from(member)
    .fetch();
  for (UserDto result : results) {
    System.out.println("result = " + result);
  }
}
```

반면, 생성자타입은 타입과 순서만 잘 맞추면, 다른 DTO 에도 결과를 담을 수 있다.

> UserDto 의 생성자와 기본 생성자를 잘 만들어주었는지 확인하자.

```java
@Test
public void findUserDtoByConstructor() {
  List<UserDto> results = queryFactory
    .select(Projections.constructor(UserDto.class,
                                    member.username,
                                    member.age))
    .from(member)
    .fetch();
  for (UserDto result : results) {
    System.out.println("result = " + result);
  }
}
```

<br />



### 프로젝션과 결과 반환 - `@QueryProjection`

생성자로 DTO 를 조회하는 방식에 더하여, 다른 방법을 제공한다.



````java
@Data
@NoArgsConstructor
public class MemberDto {

  private String username;
  private int age;

  @QueryProjection
  public MemberDto(String username, int age) {
    this.username = username;
    this.age = age;
  }
}
````

- 생성자 위에 `@QueryProjection` 어노테이션을 붙이고, gradle > other > compileQuerydsl 을 실행시키자.
- QMemberDto 가 생성되고, `public QMemberDto(...)` 생성자가 생긴 것을 확인할 수 있다.

```java
@Generated("com.querydsl.codegen.ProjectionSerializer")
public class QMemberDto extends ConstructorExpression<MemberDto> {

  private static final long serialVersionUID = 1372245372L;

  public QMemberDto(com.querydsl.core.types.Expression<String> username, com.querydsl.core.types.Expression<Integer> age) {
    super(MemberDto.class, new Class<?>[]{String.class, int.class}, username, age);
  }

}
```



```java
@Test
public void findDtoByQueryProjection() {
  List<MemberDto> fetch = queryFactory
    .select(new QMemberDto(member.username, member.age))
    .from(member)
    .fetch();
  for (MemberDto memberDto : fetch) {
    System.out.println("memberDto = " + memberDto);
  }
}
```

- 장점 : **컴파일 시점에 에러를 잡을 수 있는 장점이 있다.**
- 단점 : 
  - Q파일을 생성해야 한다.
  - `@QueryProjection` 에 의존성이 생긴다.
  - DTO 가 컨트롤러, 서비스, 레포지토리 영역에 돌아다닐 텐데 무거워진다.



> **Tip**
>
> .distinct()
>
> ```java
> select(member.username).distinct()
> ```
>
> 

<br />

---

## 동적 쿼리

동적 쿼리를 해결하는 두가지 방식

- BooleanBuilder 사용
- Where 다중 파라미터 사용

<br />

### BooleanBuilder 사용

```java
@Test
public void dynamicQuery_BooleanBuilder() {
  String usernameParam = "member1";
  Integer ageParam = 10;

  List<Member> result = searchMember1(usernameParam, ageParam);
  assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember1(String usernameCond, Integer ageCond) {
  BooleanBuilder builder = new BooleanBuilder();
  if (usernameCond != null) {
    builder.and(member.username.eq(usernameCond));
  }
  if (ageCond != null) {
    builder.and(member.age.eq(ageCond));
  }
  return queryFactory
    .selectFrom(member)
    .where(builder)
    .fetch();
}
```

<br />

### Where 다중 파라미터 사용 (추천)

```java
@Test
public void dynamicQuery_WhereParam() {
  String usernameParam = "member1";
  Integer ageParam = 10;

  List<Member> result = searchMember2(usernameParam, ageParam);
  assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember2(String usernameCond, Integer ageCond) {
  return queryFactory
    .selectFrom(member)
    .where(usernameEq(usernameCond), ageEq(ageCond))
    .fetch();
}

private Predicate usernameEq(String usernameCond) {
  return usernameCond != null ? member.username.eq(usernameCond) : null;
}

private Predicate ageEq(Integer ageCond) {
  return ageCond != null ? member.age.eq(ageCond) : null;
}
```

- 메소드가 2개 더 생겨서 번거로울 수는 있지만, 쿼리 자체만 보면 가독성이 좋다. (다른 개발자는 쿼리만 본다.)
- `where()` 에 null 이 들어가면 querydsl 은 이를 무시한다.



아래처럼 조립하여 응용도 가능하다. 조립 부품들은 다른 곳에서 재사용성이 가능하다는 장점도 있다.

```java
private List<Member> searchMember2(String usernameCond, Integer ageCond) {
  return queryFactory
    .selectFrom(member)
    .where(allEq(usernameCond, ageCond))
    .fetch();
}
private BooleanExpression usernameEq(String usernameCond) {
  return usernameCond != null ? member.username.eq(usernameCond) : null;
}

private BooleanExpression ageEq(Integer ageCond) {
  return ageCond != null ? member.age.eq(ageCond) : null;
}

private BooleanExpression allEq(String usernaeeCond, Integer ageCond) {
  return usernameEq(usernaeeCond).and(ageEq(ageCond));
}
```

단, null 체크를 주의해서 처리해야 한다.

<br  />

## 수정, 삭제 배치 쿼리

### 쿼리 한번으로 대량 데이터 수정

변경감지는 개별 데이터가 건건이 발생한다. 대량의 변경이 필요할 때 사용해보자.

```java
@Test
@Commit
public void bulkUpdate() {
  // DB
  // member1 = 10 -> 비회원
  // member2 = 20 -> 비회원
  // member3 = 30 -> member3
  // member4 = 40 -> member4

  long count = queryFactory
    .update(member)
    .set(member.username, "비회원")
    .where(member.age.lt(28))
    .execute();

  // 영속성 컨텍스트
  // member1 = 10 -> member1
  // member2 = 20 -> member2
  // member3 = 30 -> member3
  // member4 = 40 -> member4

  List<Member> result = queryFactory
    .selectFrom(member)
    .fetch();
  for (Member member1 : result) {
    System.out.println("member1 = " + member1);
  }
}
```



- member1, member2, member3, member4 는 영속성 컨텍스트에 이미 올라와 있는데, update 쿼리는 영속성 컨텍스트를 무시하고, 바로 DB 데이터를 변경한다. 
- 업데이트 후에 같은 데이터를 가져와보면, 변경이 되지 않은 영속성 컨텍스트에서 값을 가져온다. 영속성 컨텍스트가 항상 우선권을 가지기 때문이다.
- 이를 `repeated read` 라고 한다. JPA 는 애플리케이션 레벨에서 2단계 고립레벨을 유지한다.



벌크 업데이트 시 영속성 컨텍스트를 비워주는 것이 필요하다.

```java
@Test
@Commit
public void bulkUpdate() {
  // DB
  // member1 = 10 -> 비회원
  // member2 = 20 -> 비회원
  // member3 = 30 -> member3
  // member4 = 40 -> member4

  long count = queryFactory
    .update(member)
    .set(member.username, "비회원")
    .where(member.age.lt(28))
    .execute();
  
  em.flush();
  em.clear();

  // 영속성 컨텍스트
  // member1 = 10 -> 비회원
  // member2 = 20 -> 비회원
  // member3 = 30 -> member3
  // member4 = 40 -> member4

  List<Member> result = queryFactory
    .selectFrom(member)
    .fetch();
  for (Member member1 : result) {
    System.out.println("member1 = " + member1);
  }
}
```

<br />



### 기존 숫자에 1 더하기

```java
@Test
public void bulkAdd() {
  long count = queryFactory
    .update(member)
    .set(member.age, member.age.add(1))
    .execute();
  // .multiply(2) 등도 가능
}
```



### 쿼리 한번으로 대량 데이터 삭제

```java
@Test
public void bulkDelete() {
  long count = queryFactory
    .delete(member)
    .where(member.age.gt(18))
    .execute();
}
```

<br />

---

## SQL function 호출하기



SQL function 은 JPA 와 같이 Dialect 에 등록된 내용만 호출할 수 있다.

예) member → M 으로 변경하는 replace 함수 사용



```java
public class H2Dialect extends Dialect {
```

위 클래스에 보면  replace 함수가 등록되어 있는 것을 볼 수 있다. 즉, 방언에 등록되어 있는 내장함수만 사용이 가능하다.

<br />

예) 소문자로 변경

```java
@Test
public void sqlFunction2() {
  List<String> result = queryFactory
    .select(member.username)
    .from(member)
    .where(member.username.eq(
          Expressions.stringTemplate("function('lower', {0})", member.username)))
    .fetch();
  for (String s : result) {
    System.out.println("s = " + s);
  }
}
```

- lower 같은 ANSI 표준 함수들은 querydsl 이 상당부분 내장하고 있다. 따라서 아래와 같이 처리해도 된다.

```java
.where(member.username.eq(member.username.lower()))
```



