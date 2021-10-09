# Spring Data JPA 003 - 스프링 데이터 JPA 분석



## JpaRepository

`JpaRepository` 인터페이스를 보면 기본적으로 `SimpleJpaRespository` 구현체를 사용함을 알 수 있다.



```java
@Repository
@Transactional(readOnly = true)
public class SimpleJpaRepository<T, ID> implements JpaRepositoryImplementation<T, ID> {
  ...
```

이 구현체에는 `@Repository` 어노테이션이 붙어있다. 따라서

- 스프링 빈으로 등록된다.
- 이에 따라 JPA 예외를 스프링 프레임워크가 제공하는 예외로 변환하여 반납한다. DBMS 가 바뀐다고 해도 동일한 상황에 동일한 예외를 발생시킬 수 있다.

또한 `@Transactional(readOnly = true)` 가 붙어있다.

- 서비스 계층에서 트랜잭션을 시작하지 않으면  리포지토리 레벨에서 모두 트랜잭션 처리된다.
- 서비스 계층에서 트랜잭션을 시작하면 리포지토리는 해당 트랜잭션을 전파 받아서 사용된다.
- 그래서 스프링 데이터 JPA 를 사용할 때 트랜잭션이 없어도 데이터 등록, 변경이 가능하다. (리포지토리 계층에 이미 걸려있다.)

`readOnly=true` : 데이터를 단순히 조회만 하는 트랜잭션에서는 이 옵션은 플러시를 생략해서 약간의 성능 향상을 얻을 수 있다. JPA 책 15.4.2

<br />

### save()

- 새로운 엔티티면 저장한다. (`persist`)
- 새로운 엔티티가 아니면 병합한다. (`merge`) : merge의 단점은 DB select 쿼리가 실행된다는 것이다. 가급적 merge를 사용하면 안되고, JPA에서는 변경감지를 사용해야 한다. 준영속상태인 엔티티를 다시 영속상태로 관리하고 싶을 때 merge를 사용한다.

<br />

---

## 새로운 엔티티를 구별하는 방법

- 식별자가 객체일 때 null 로 판단
- 식별자가 기본 타입(primitive type)일 때 0 으로 판단
- `Persistable` 인터페이스를 구현해서 판단 로직 변경 가능 (GeneratedValue 사용할 수 없을 때 유용)





### 식별자가 없을 때 null, 0로 판단

아래 테스트 코드를 보자.

```java
@Getter
@Entity
public class Item {

    @Id @GeneratedValue
    private String id;
}
```

```java
public interface ItemRepository extends JpaRepository<Item, Long> {
}
```

```java
@SpringBootTest
class ItemRepositoryTest {

    @Autowired ItemRepository itemRepository;

    @Test
    public void save() {
        Item item = new Item();
        itemRepository.save(item);
    }
}
```



```java
@Repository
@Transactional(readOnly = true)
public class SimpleJpaRepository<T, ID> implements JpaRepositoryImplementation<T, ID> {

	private static final String ID_MUST_NOT_BE_NULL = "The given id must not be null!";

	private final JpaEntityInformation<T, ?> entityInformation;
	private final EntityManager em;
	private final PersistenceProvider provider;
  
  ...
    
  @Transactional
	@Override
	public <S extends T> S save(S entity) {

		Assert.notNull(entity, "Entity must not be null.");

		if (entityInformation.isNew(entity)) { // 엔티티 식별자를 null(또는 0) 이라고 판단
			em.persist(entity); // DB에 저장되고
			return entity; // @GeneratedValue 에 의해 entity 에 식별자가(예: 1) 채워진다.
		} else {
			return em.merge(entity);
		}
	}
  ...
```

19줄에 breakpoint 를 걸고 테스트로 디버깅을 시도해보면, 위와 같은 순서대로 실행되며,

id = 1로 저장되는 것을 볼 수 있다. 즉, 식별자가 처음에 null 이라면 persist 를 해준 경우이다.

<br />

### 식별자가 존재하는 경우?

이제, 조금 수정해서 테스트 해보자.

```java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Item {

    @Id
    private String id;

    public Item(String id) {
        this.id = id;
    }
}
```

id 를 String 타입으로 바꾸고, GeneratedValue 를 없앤다. 생성자 하나를 만들어준다. JPA는 기본생성자를 필요로하므로 NoArgsConstructor 를 추가한다. 함부로 다른 곳에서 기본생성자로 만들지 못하도록 접근제어자는 protected 로 설정했다.

```java
@Test
public void save() {
  Item item = new Item("A");
  itemRepository.save(item);
}
```

이제 디버깅을 해보면,

```java
@Transactional
@Override
public <S extends T> S save(S entity) {

  Assert.notNull(entity, "Entity must not be null.");

  if (entityInformation.isNew(entity)) { // 엔티티 식별자를 "A" 라고 판단하여 false
    em.persist(entity);
    return entity;
  } else {
    return em.merge(entity); // merge 가 실행된다.
  }
}
```

위와는 다르게 merge 로 넘어간다. merge 는 일단 DB 를 select 해보고 없다면 새로 insert 한다.

```sql
select item0_.id as id1_0_0_ from item item0_ where item0_.id='A';
insert into item (id) values ('A');
```

조회 쿼리가 생기는 것이 맘에 들지 않는다. 조금 수정해보자.

> 참고로 지금은 생성하는 경우를 보는 것이고,
>
> 수정하는 경우에는 save를 호출하지 않고, 변경감지(dirty checking)를 통해 영속성 컨텍스트에 있는 엔티티를 바꾸어주고 트랜잭션이 끝날 때 JPA가 알아서 바꾸도록 업데이트하는 것이 좋다.



### Persistable 로 merge하지 않고 persist하도록 해결

createDate 를 이용해서 하면 실무에서 효율적이다.

```java
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Item implements Persistable<String> {

  @Id
  private String id;

  @CreatedDate
  private LocalDateTime createdDate;

  public Item(String id) {
    this.id = id;
  }

  @Override
  public String getId() {
    return id; // id로 설정
  }

  @Override
  public boolean isNew() {
    return createdDate == null; // 생성일자가 없을 경우 새것으로 인정
  }
}
```

디버깅 결과

```java
@Transactional
	@Override
	public <S extends T> S save(S entity) {

		Assert.notNull(entity, "Entity must not be null.");

		if (entityInformation.isNew(entity)) { // 생성일자가 없으므로 null로 판단, true
			em.persist(entity); // DB insert
			return entity; // JPA Auditing 을 통해 생성일자가 생성된다.
		} else {
			return em.merge(entity);
		}
	}
```

















