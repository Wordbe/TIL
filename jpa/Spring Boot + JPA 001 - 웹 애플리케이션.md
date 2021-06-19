# Spring Boot + JPA 001 - 웹 애플리케이션



```shell
# 그래들 의존성 조회
$ ./gradlew dependencies

# 컴파일 단계 의존성만 보려면
$ ./gradlew dependencies --configuration compileClasspath
```

* 커넥션 풀 : HikariCP 



>  `templates` : 타임리프 사용해서 화면에 데이터 렌더링
>
> * 스프링부트의 thymeleaf viewName 매핑
> * `resource:templates/{viewName}.html`

> `static`:  더 이상 동적인 컨텐츠를 렌더링 하지 않고, 정적으로 순수한 html 을 화면에 보여주고 싶다. 
>
> * index.html : 메인 페이지("/")에 매핑된다.



> spring-boot-devtools
>
> * html 파일 수정 했을 때, shift + cmd + f9 눌러서 recompile 만하고, 화면을 새로고침하면 수정된 사항이 반영된다.



<br />

---

# 도메인 분석 설계

1. 요구사항 분석
2. 도메인 모델과 테이블 설계
3. 엔티티 클래스 개발
4. 엔티티 설계시 주의점



간단한 쇼핑몰

* 회원가입, 회원목록
* 상품 등록, 상품목록
* 상품주문, 주문내역



실제 동작하는 화면을 먼저 확인한다.

* 회원 기능
  * 회원 등록
  * 회원 조회
* 상품 기능
  * 상품 등록
  * 상품 수정
  * 상품 조회
* 주문 기능
  * 상품 주문
  * 주문 내역조회
  * 주문 취소
* 기타 요구사항
  * 상품은 재고 관리 필요하다.
  * 상품의 종류는 도서, 음반, 영화가 있다.
  * 상품을 카테고리로 구분할 수 있다.
  * 상품 주문시 배송 정보를 입력할 수 있다.



## 도메인 모델과 테이블 설계



**객체 모델**

![](https://i.ibb.co/WHP905F/2021-05-30-6-29-04.png)



> 설계 시 고려사항
>
> 1. **다대다 매핑을 지양한다.**
>    * 다대다 매핑시 중간 테이블이 자동으로 생기는데, 중간 테이블은 수정이 불가능해서 이곳에 새로운 정보(컬럼)를 담을 수 없다. 따라서 사용에 제약이 생긴다.
> 2. **양방향 관계 매핑을 지양한다.**
>    * 단방향 매핑만으로 테이블의 연관관계를 충분히 매핑할 수 있다. 불필요한 반대방향 관계를 맺을 필요는 없다. 업무적으로 반대방향에 대한 조회가 필요할 경우 추가해도 된다.
> 3. **일대다 매핑(`@OneToMany`) 은 되도록 사용하지 않는다.**
>    * 1:N 관계에서는 반대편 테이블에 외래키를 가지는 구조인데, 객체는 자신이 외래키를 관리하게 되는 특이한 구조를 가진다.
>    * 연관관계 관리를 위해 추가로 UPDATE SQL을 실행한다. (반대편 객체를 insert 했을 경우, 자신 객체를 update 해주어야 한다.)
>    * 이렇게 되면 운영에서 쿼리를 관리하기 어려워질 수 있다.
>    * **단방향 다대일 매핑(`@ManyToOne`) 을 적극 사용한다.** 필요한 경우 여기에 양방향 매핑을 한다.



**테이블 물리 모델**

![](https://i.ibb.co/TwtFLJj/image.png)

* 회원과 주문 : 일대다 + 다대일 양방향 관계. 외래키가 있는 주문을 연관관계 주인으로 정하는 것이 좋다. `Order.member` 를 `ORDERS.MEMBER_ID` 외래 키와 매핑한다.
* 주문상품과 주문 : 다대일 양방향 관계. 외래키가 주문상품에 있으므로 주문상품이 연관관계 주인이다. `OrderItem.order` 를 `ORDER_ITEM.ORDER_ID` 외래키와 매핑한다.
* 주문상품과 상품 : 다대일 단방향 관계. `OrderItem.item` 을 `ORDER_ITEM.ITEM_ID` 외래키와 매핑한다.
* 주문과 배송 : 일대일 단방향 관계. 접근을 더 자주하는 객체(주문)에 외래키를 매핑한다. 외래키가 주문에 있으므로 `Order.delivery` 를 `ORDERS.DELIVERY_ID` 외래키와 매핑한다.
* 카테고리와 상품 : 다대다 양방향 관계. `@ManyToMany` 사용하여 중간테이블을 만든다. 실무에서는 사용하지 않는다. (예제용)

>**외래키가 있는 곳을 연관관계 주인으로 정한다.**
>
> 연관관계 주인은 외래키를 관리하는 객체로 정한다. 비즈니스 상 우위에 있는 객체를 정하는 것이 아니다.
>
>* 1:N 관계에서 외래키는 N쪽 테이블에 있다. N쪽 객체를 주인으로 정하면 된다.
>* 1쪽 객체를 주인으로 정할 수도 있다. 1:N (팀:멤버) 단방향 연관관계를 맺는 방법이다. 팀에서 멤버를 등록하고 저장을 하면, 멤버의 `team_id` 를 업데이트하는 쿼리가 함께 수행된다. 성능 저하가 발생하고, 팀 테이블이 관리하지 않는 멤버 테이블이 업데이트 되므로 운영측면에서 유지/보수가 어렵다.



<br />

---

## 엔티티 클래스 개발

실무에서는 `Getter` 는 등록해놓고, `Setter` 는 필요한 경우에만 등록하는 것을 권장한다.

> 실무에서 엔티티의 조회는 매우 빈번하므로 `Getter` 는 모두 열어두는 것이 편리하다. 조회는 문제가 발생하지 않지만, `Setter` 를 호출하면 데이터가 변하므로 엔티티 변경이 이루어진다. 
>
> 엔티티 변경 추적이 어려워지므로, `Setter` 대신 변경지점이 명확하게 보이도록 돕는 명시적인 비즈니스 메서드를 별도로 만드는 것이 좋다.

<br />

테이블 생성

> JPA가 생성해준 테이블은 그대로 사용하지말고, JPA가 만들어준 **DDL 을 검토해서** DB에서 직접 생성해 사용하도록 하면 좋다.



```java
@Getter @Setter
@Entity
public class Category {

    @Id @GeneratedValue
    @Column(name = "category_id")
    private Long id;

    private String name;
  
  	...

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> child = new ArrayList<>();
}

* 셀프 매핑의 경우, 이름만 내 것이지 다른 테이블과 양방향 매핑한다고 생각하면 이해가 쉽다.



```java
@Getter @Setter
@Entity
public class Member {

    @Id @GeneratedValue
    private Long id;

    private String name;

    @Embedded
    private Address address;

    @OneToMany(mappedBy = "member")
    private List<Order> orders = new ArrayList<>();
}

* 엔티티 식별자는 `id` 를 사용하고, 테이블에서 pk 컬럼명은 `member_id` 를 사용했다. 엔티티는 타입(Member)이 있으므로 `id` 필드만으로 쉽게 구분이 가능하지만, 테이블은 타입이 없으므로 구분이 어렵기 때문이다. 또한 테이블에서는 관례상 `테이블명_id` 를 많이 사용한다. 참고로 객체에서 `id` 대신 `memberId` 를 사용해도 된다. 중요한 것은 일관성이다.



```java
@Embeddable
@Getter
public class Address {

    private String city;
    private String street;
    private String zipcode;

    protected Address() {
    }

    public Address(String city, String street, String zipcode) {
        this.city = city;
        this.street = street;
        this.zipcode = zipcode;
    }
}
```

* 값 타입은 변경불가능(immutable)하게 설계해야 한다. 

* 변경불가능한 클래스를 만들기 위해 `Setter` 는 제거하고, 생성자를 통해서 값을 초기화할 수 있도록 만든다. JPA 스펙상 엔티티나 엠베디드타입은 자바 기본 생성자(default constructor)를 `public` 또는 `protected` 로 설정해야 한다. `protected` 로 설정해두어 다른 클래스에서 `new Address()` 처럼 기본 생성자를 만들지 못하도록하여 빈 값 초기화로 부터 안전하도록 만든다. 개발자들은 생성자를 만들기 위해 모든 필드를 입력해야 할 것이다.

  JPA가 이런 제약을 두는 이유는 JPA 구현 라이브러리 객체를 생성할 때 리플렉션 등의 기술을 사용할 수 있도록 지원하기 위해서이다.



## 엔티티 설계



### 엔티티는 가급적 Setter 사용하지 말자

* Setter 가 모두 열려있으면, 변경 포인트가 너무 많아서 유지보수가 어렵다.



### 모든 연관관계는 지연로딩으로 설정한다.

* 즉시로딩(`EAGER`)은 예측이 어렵고, 어떤 SQL 이 실행될지 추측이 어렵다.
  * 특히 JPQL을 실행할 때 `N + 1` 문제가 자주 발생한다.
* 연관된 엔티티를 함께 DB에서 조회해야 하면, `fetch join` 또는 엔티티 그래프 기능을 사용한다.
* **`@OneToOne`, `@ManyToOne` 은 기본이 즉시로딩이므로 직접 지연로딩으로 설정해야 한다.**



### 컬렉션은 필드에서 초기화하자

컬렉션은 필드에서 바로 초기화 하는 것이 안전하다.

* `null` 문제에 대해 안전하다.
* 하이버네이트는 엔티티를 영속화할 때 컬렉션을 감싸서 하이버네이트가 제공하는 내장 컬렉션으로 변경한다. `getOrders()` 처럼 임의의 메서드에서 컬렉션을 잘못 생성하면 하이버네이트 내부 메커니즘에 문제가 발생할 수 있다. 따라서 필드레벨에서 생성하는 것이 안전하고 코드도 간결하다.



### 테이블, 컬럼명 생성 전략

스프링부트에서 하이버네이트 기본 매핑 전략을 변경해서 실제 테이블 필드명은 다르다.

* 하이버네이트 : 엔티티의 필드명을 그대로 테이블 명으로 사용한다. `SpringPhysicalNamingStrategy`

* 스프링부트 :

  * camelCase → snake_case (underscore)
  * .(점) → _(언더스코어)
  * 대문자 → 소문자

* 논리명 생성 : 명시적으로 컬럼, 테이블명을 직접 적지 않으면 `ImplicitNamingStrategy` 사용

  ```properties
  spring.jpa.hibernate.naming.implicit-strategy
  ```

* 물리명 적용 : 모든 논리명에 적용된다. 실제 테이블에 적용된다.

  ```properties
  spring.jpa.hibernate.naming.physical-strategy
  ```



> 추가 네이밍 규칙이 필요할 경우 `SpringImplicitNamingStrategy`, `SpringPhysicalNamingStrategy` 을 찾아서 프로퍼티를 잘 변경해보자.

























