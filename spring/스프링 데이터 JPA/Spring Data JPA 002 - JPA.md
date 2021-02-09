# Spring Data JPA 002 - JPA





application.properties

```shell
# datasource 설정 - postgreSQL DB
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=1234

# hibernate 설정
spring.jpa.hibernate.ddl-auto=create

# hibernate WARN 경고 출력 방지
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```



`spring-boot-starter-data-jpa` 를 의존성에 추가하면 jpa를 사용하기위해 필요한 빈들이 모두 등록된다. `HibernateJpaAutoConfiguration` 을 통해 hibernate 자동설정도 된다. 컨테이너가 관리하는 `EntityManager` (프록시) 빈을 설정해주고, `PlatformTransactionManager` 빈을 설정해준다.





`EntityManager` 는 JPA 의 핵심 클래스이다. 마치 스프링에서 `ApplicationContext` 정도의 중요성을 가진다.



데이터를 생성하는 등의 행위는 한 transaction 내에서 일어나야 하는 과정이므로, `@Transactional` 어노테이션을 붙여준다.





<br />

---

## Entity Mapping



#### `@Entity`

Entity 는 객체 관점에서 테이블에 대응되어 부르는 개념이다. `@Entity` 를 붙인 클래스의 이름으로 자동으로 데이터베이스의 테이블과 매핑이 된다. 하지만 Entity 를 다른 테이블과 매칭시키고 싶다면 `@Entity(name = "table")` 을 활용해보자. Entity 의 이름은 JQL에서 사용된다.

<br />

#### `@Table`

릴레이션 관점에서 부르는 테이블 개념이다. `@Entity` 의 이름이 기본값이다. 테이블의 이름은 SQL에서 사용된다. 

<br />

#### `@id`

Entity 의 주키를 매핑할 때 사용한다. 자바의 모든 primitive 타입과 해당 wrapper 타입을 사용할 수 있다. ( + `Date`, `BigDecimal`, `BigInteger` 등도 사용할 수 있다.)

> 1. wrapper 타입은 primitive 타입을 객체화 한 것이다. 예를 들면 `int` primitive 타입을 `Integer` wrapper 타입으로 객체화할 수 있다.
> 2. primitive 타입을 wrapper 타입으로 변환하는 것을 boxing 이라고 하고, 반대를 unboxing 이라고 한다. 앞에 타입 캐스트 연산을 통해 바꿀 수 있지만 java 1.5 버전 이상부터는 자동으로 변환해준다. 
> 3. wrapper 클래스는 장점이 있다. 제네릭(`<>`) 안에 wrapper 타입만 허용하고, wrapper 타입은 primitive 와 다르게 null 값을 넣을 수 있기 때문이다. 예를 들어 null 값이 필요한 데이터베이스에서는 `long` 대신 `Long` 래퍼 타입을 많이 이용한다.

예를 들어 `long` 값의 경우 기본값으로 0 이 데이터베이스에 들어갈 수 있다. 하지만 기존 데이터베이스에도 id 가 0 값으로 들어있다면 기존 데이터인지 추가로 들어온 데이터인지 구분이 어렵다. `Long` 타입으로 하면 null 로 들어가므로 구분이 쉬워진다.

그 외에 복합키 설정 매핑도 가능하다.

<br />

#### `@GeneratedValue`

주키의 생성 방법을 매핑하는 어노테이션이다. 생성 전략(strategy)과 생성기(generator)를 설정할 수 있다. 기본 전략은 `AUTO`이고 사용하는 DB 에 따라 적절한 전략(`GenerationType`)을 선택할 수 있다. `TALBLE`, `SEQUENCE`, `IDENTITY` 중 하나다.

```java
// 기본 설정
@GeneratedValue(strategy = GenerationType.AUTO)
```

<br />

#### `@Column`

unique, nullable, length, columnDefinition 등 컬럼에 다양한 제약조건을 줄 수 있다.

<br />

#### `@Temporal`

`import javax.persistence.*;` 라이브에서 가져온 것을 확인한다. `Date` 와 `Temporal` 을 지원한다.

<br />

#### `@Transient`

컬럼으로 매핑하고 싶지 않은 멤버 변수에 사용한다. 



<br />

---

## Value 타입 매핑



엔티티 타입과 Value 타입과 구분된다. 엔티티 타입은 식별자가 존재하고, 독립적으로 존재해야 한다.

Value 타입의 종류로는 기본타입 (String, Date, Boolean 등), Composite Value 타입, Collection Value 타입(기본 타입의 콜렉션, 컴포짓 타입의 콜렉션)이 있다. 

Composite Value 타입을 매핑해보자.

```java
@Embeddable
public class Address {

    private String street;

    private String city;

    private String state;

    private String zipCode;
}
```

```java
@Entity
public class Account {

    @Id @GeneratedValue
    private Long id;
  	...
      
    @Embedded
    private Address address;
}
```

이처럼 Composite value 타입 객체는 `@Embeddable`을 붙여서 만들 수 있고,  Entity 타입 객체에 `@Embedded` 로 연결해줄 수 있다.





<br />

---

## 1대다 맵핑



관계에는 항상 두 엔티티가 존재하는데, 둘 중 하나는 그 관계의 주인으로 다른 엔티티를 소유하고(owing), 다른 쪽은 종속된(non-owing) 엔터티가 된다. 관계의 반대쪽 레퍼런스를 가지고 있는 쪽이 주인이다. 



### 단방향 관계

Study 와 Account 엔터티의 관계를 보자.

```java
@Entity
public class Study {

    @Id @GeneratedValue
    private Long id;

    private String name;

    @ManyToOne
    private Account owner;
}
```

도메인적으로 생각해보면 여러 Account 가 하나의 Study 에 매핑될 수 있으므로 `@ManyToOne` 을 사용할 수 있다. Study 에 `owner_id` 라는 외래키가 자동으로 생성되어 Account 를 참조하게 된다. Study 엔터티가 관계를 정의했으므로, Study 가 주인이 된다. 



다른 방식으로 관계를 만들어보자.

```java
@Entity
public class Account {

    @Id @GeneratedValue
    private Long id;
  	...
    @OneToMany
    private Set<Study> studies = new HashSet<>();
}
```

이번에는 Account 가 주인이 되어 관계를 정의했다. 하나의 Account 는 여러 Study 와 관계를 맺을 수 있으므로 `@OneToMany` 를 붙인다. 여러 개와 관계를 맺으므로 `Set` 타입으로 만들어주고, HashSet 을 만들어준다. 이렇게하면 Account, Study 테이블 외에 account_studies 라는 조인 테이블을 하나 만들어서 관계를 관리하도록 하게 된다.



<br />

### 양방향 관계

위에서 설정한 것은 서로 엔터티간 단방향 관계로 이은 것이다.

위 단방향 관계 2개를 양방향 관계로 만들어 보자. `mappedBy` 를 추가해서 owner 필드를 연결해주어야 한다.

```java
@Entity
public class Account {

    @Id @GeneratedValue
    private Long id;
  	...
    @OneToMany(mappedBy = "owner")
    private Set<Study> studies = new HashSet<>();
}
```

이로써 관계의 주인은 Study 가 된다. 외래키(FK)를 가진 쪽 = `@ManyToOne` 을 가진 쪽이 주인이 된다.1:N 관계에서 1이 주인이 되는게 논리적으로 올바르게 보인다.

관계가 양방향이므로 아래와 같이 양방향 관계를 매핑해주고 DB 에 저장한다.

```java
@Component
@Transactional
public class JpaRunner implements ApplicationRunner {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Account account = new Account();
        account.setUsername("rdi");
        account.setPassword("1234");

        Study study = new Study();
        study.setName("Spring Data JPA");

        account.getStudy(study);

        // 양방향 관계 매핑
        study.setOwner(account);
        account.getStudies().add(study);

        Session session = entityManager.unwrap(Session.class);
        session.save(account);
        session.save(study);
    }
}
```











