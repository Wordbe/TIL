# Spring Boot + JPA + API 개발과 성능 최적화 002 - API 개발고급



변경/등록은 소수여서 문제가 많이 발생하지 않는다. 조회에서 장애가 많이 일어난다.

 

## 데이터 준비



메모리 데이터베이스에서 미리 데이터 준비해놓기.

```java
@RequiredArgsConstructor
@Component
public class InitDb {

    private final InitService initService;

    @PostConstruct
    public void InitDb() {
        initService.doInit1();
        initService.doInit2();
    }

    @Component
    @Transactional
    @RequiredArgsConstructor
    static class InitService {

        private final EntityManager em;

        public void doInit1() {
            Member member = createMember("kim","서울", "강", "21345");
            em.persist(member);

            Book book1 = createBook("카산드라", 10000, 100);
            em.persist(book1);
            Book book2 = createBook("몽고디비", 12000, 100);
            em.persist(book2);

            OrderItem orderItem1 = OrderItem.createOrderItem(book1, 10000, 1);
            OrderItem orderItem2 = OrderItem.createOrderItem(book2, 12000, 2);

            Delivery delivery = new Delivery();
            delivery.setAddress(member.getAddress());
            Order order = Order.createOrder(member, delivery, orderItem1, orderItem2);
            em.persist(order);
        }

        public void doInit2() {
            Member member = createMember("lee", "성남", "별", "31345");
            em.persist(member);

            Book book1 = createBook("녹용", 20000, 100);
            em.persist(book1);
            Book book2 = createBook("동충하초", 40000, 100);
            em.persist(book2);

            OrderItem orderItem1 = OrderItem.createOrderItem(book1, 20000, 3);
            OrderItem orderItem2 = OrderItem.createOrderItem(book2, 40000, 4);

            Delivery delivery = new Delivery();
            delivery.setAddress(member.getAddress());
            Order order = Order.createOrder(member, delivery, orderItem1, orderItem2);
            em.persist(order);
        }

        private Member createMember(String name, String city, String street, String zipcode) {
            Member member = new Member();
            member.setName(name);
            member.setAddress(new Address(city, street, zipcode));
            return member;
        }

        private Book createBook(String name, int price, int stockQuantity) {
            Book book = new Book();
            book.setName(name);
            book.setPrice(price);
            book.setStockQuantity(stockQuantity);
            return book;
        }
    }
}
```



---

## 지연 로딩과 조회 성능 최적화



- 주문  + 배송정보 + 회원을 조회하는 API 만들기
- 지연 로딩 때문에 발생하는 성능 최적화하기



### V1 간단한 주문 조회(Entity 그대로)

- 엔티티를 직접 노출
- 다대일의 연관관계를 가진 엔티티들을 조회한다.

```java
/**
 * xToOne
 * (ManyToOne, OneToOne)
 * Order -> Member (ManyToOne)
 * Order -> Delivery (OneToOne)
 */
@RequiredArgsConstructor
@RestController
public class OrderSimpleApiController {

    private final OrderRepository orderRepository;

    @GetMapping("/api/v1/simple-orders")
    public List<Order> simpleOrders() {
        List<Order> orders = orderRepository.findAllByJPQL(new OrderSearch());
        return orders;
    }
}
```

이제 Postman 을 실행하여 GET 요청을 보내보자. 에러가 발생한다.



방법 1.

1. 순환참조 문제가 발생한다. (무한루프)

- 이 때 엔티티들이 양방향 매핑되어 있다면, 서로 순환 참조하여 무한히 JSON 객체를 만들어내게 된다.
- `@JsonIgnore` 어노테이션을 양방향 매핑이된 엔티티들 중에서 반대편 객체(Order 의 반대편 객체)를 골라서 매핑해주어서 json 으로 만들지 않도록 만든다.
- `@JsonIgnore` 옵션을 한 곳에 주면 된다.
- 하지만 밑의 2번 오류가 발생한다.

2. 다대일 객체 기본값 오류가 발생한다. (Hibernate)

   ```shell
   "org.springframework.http.converter.HttpMessageConversionException: Type definition error: [simple type, class org.hibernate.proxy.pojo.bytebuddy
   ```

- hibernate 는 `LAZY` 로 페치된 필드에 기본적으로 프록시 객체를 담아 놓는다. 프록시 객체는 필드 타입에 해당하는 클래스를 상속받아서 만들어진다. (byteBuddy 라이브러리 사용 `new ByteBuddyInterceptor()`)

- hibernate 기본값을 null 을 넣도록 변경한다.

  ```groovy
  implementation 'com.fasterxml.jackson.datatype:jackson-datatype-hibernate5'
  ```

  

  ```java
  @Configuration
  public class ApiConfig {
  
      @Bean
      public Hibernate5Module hibernate5Module() {
          return new Hibernate5Module();
      }
  }
  ```

  또는 다대일에 해당하는 객체를 `EAGER`로 다 받아오도록 설정할 수 있다.

  ```java
  @Bean
  public Hibernate5Module hibernate5Module() {
    Hibernate5Module hibernate5Module = new Hibernate5Module();
    hibernate5Module.configure(Hibernate5Module.Feature.FORCE_LAZY_LOADING, true);
    return hibernate5Module;
  }
  ```

<br />

방법 2

- 양방향 매핑에 `JsonIgnore` 을 등록하고  `hibernate5Module` 을 등록해준 상태

- API 컨트롤러에서 레포지토리에서 order 를 불러온 후, 나머지 데이터도 강제로 로딩하게 만든다. 원하는 필드 객체의 필드를 호출 한다.

  ```java
  @GetMapping("/api/v1/simple-orders")
  public List<Order> simpleOrders() {
    List<Order> orders = orderRepository.findAllByJPQL(new OrderSearch());
    for (Order order : orders) {
      order.getMember().getName(); // LAZY 로딩에서 강제로 데이터 불러오기
      order.getDelivery().getStatus(); // LAZY 로딩에서 강제로 데이터 불러오기
    }
    return orders;
  }

하지만 그럼에도 불구하고 위 방법 2개는 아래의 큰 단점이 있다.

- 엔티티를 외부에 노출해버린다.
  - 불필요한 정보가 노출될 수 있다.
  - 보안 관련된 정보가 노출될 수 있다.
  - 엔티티가 수정되려고 할 때, 이미 타부서에서 수정해야할 필드가 있으면 협의해야 하는 과정이 필요하다.
- API 스펙이 바뀌면 기존 엔티티와 규격이 맞지 않을 수 있다.
- `EAGER` 로딩하면 성능상 문제가 생길 수 있다.

따라서

> - 엔티티는 응답으로 내보내지 않는것이 좋다. Hibernate5module 을 사용하기보다는, DTO 로 만들어 필요한 필드만 응답객체에 담는 것이 맞다.
> - 즉시로딩으로 설정하면 성능 튜닝이 어려워진다. 엔티티를 한 업무에서만 사용하는 것이 아니기 때문이다. 다른 업무에서는 가져올 필요가 없는 데이터를 무조건 가져오게 만들지 말자.
> - 항상 지연로딩을 기본으로 하고, 성능 최적화가 필요한 경우 fetch join을 한다.



---

### V2 간단한 주문 조회(DTO)

DTO 를 만들어서 응답객체를 미리 정의하자.



```java
@GetMapping("/api/v2/simple-orders")
public List<SimpleOrderDto> simpleOrders2() {
  return orderRepository.findAllByJPQL(new OrderSearch())
    .stream()
    .map(SimpleOrderDto::new)
    .collect(Collectors.toList());
}

@Data
static class SimpleOrderDto {
  private Long orderId;
  private String name;
  private LocalDateTime orderDate;
  private OrderStatus orderStatus;
  private Address address;

  public SimpleOrderDto(Order order) {
    this.orderId = order.getId();
    this.name = order.getMember().getName(); //LAZY 초기화
    this.orderDate = order.getOrderDate();
    this.orderStatus = order.getStatus();
    this.address = order.getDelivery().getAddress(); //LAZY 초기화
  }
}
```





하지만, v1, v2 모두 지연로딩의 문제에서 벗어날 수 없다. 

order 조회 쿼리를 한번 실행하면, order 안의 지연되고 있었던 필드의 쿼리가 N번(오더 수 만큼) 호출된다.

- 위 예제에서는 쿼리가 최악의경우 총 1 + 2 + 2번 실행된다.
  - 지연 로딩은 영속성컨텍스트(PersistentContext) 에서 먼저 조회하므로, 해당 값이 캐시에 존재하면 쿼리 호출을 생략하게 된다.
- order 조회 시 1번 (이 때 row 갯수가 N이 된다.)
- order → member 지연 로딩시 N번
- order → delibery 지연 로딩시 N번

<br />

---

### V3 간단한 주문 조회 (fetch join)



**fetch join**

- LAZY 로 페치 설정이 되어있어도, EAGER 처럼 모든 데이터를 조인하여 가져온다.
- 프록시를 만들어 놓는 것이 아니라, 진짜 객체에 모든 데이터를 담아서 반환한다.



> JPA 의 성능 문제의 90% 정도는 N + 1 (1 + N) 문제에서 발생한다. 기본으로 LAZY 를 설정하고, 필요한 객체만 FETCH JOIN 으로 가져오면 성능 문제의 대부분은 해결된다.



레포지토리에 아래 메소드를 만들어서 V2 와 똑같이 실행시키자.

```java
/**
 * V3 예제
 * JPQL fetch join
 */
public List<Order> findAllWithMemberDelivery() {
  return em.createQuery(
    "select o from Order o" +
    "  join fetch o.member m" +
    "  join fetch o.delivery d", Order.class)
    .getResultList();
}
```

이번에는 쿼리 5번이 호출되는 것 대신 (네트워크 비용을 많이 잡아먹는다.) 쿼리 한 방으로 모든 데이터를 조회해온다.

```shell
select
        order0_.order_id as order_id1_6_0_,
        member1_.id as id1_4_1_,
        delivery2_.delivery_id as delivery1_2_2_,
        order0_.delivery_id as delivery4_6_0_,
        order0_.member_id as member_i5_6_0_,
        order0_.order_date as order_da2_6_0_,
        order0_.status as status3_6_0_,
        member1_.city as city2_4_1_,
        member1_.street as street3_4_1_,
        member1_.zipcode as zipcode4_4_1_,
        member1_.name as name5_4_1_,
        delivery2_.city as city2_2_2_,
        delivery2_.street as street3_2_2_,
        delivery2_.zipcode as zipcode4_2_2_,
        delivery2_.status as status5_2_2_ 
    from
        orders order0_ 
    inner join
        member member1_ 
            on order0_.member_id=member1_.id 
    inner join
        delivery delivery2_ 
            on order0_.delivery_id=delivery2_.delivery_id
```

- 하지만 모든 엔티티 필드를 가져온다는 단점이 있다.



---

### V4 간단한 주문 조회 (JPA에서 DTO로 바로 조회)



장점

- 원하는 컬럼을 선택해서 조회할 수 있다.
- new 명령어를 사용해서 JPQL 결과를 DTO로 즉시 반환한다.
- select 절에서 원하는 컬럼만 선택하므로, DB 에서 애플리케이션으로 전달되는 용량을 최적화할 수 있다.

단점

- 코드 상 지저분하다.
- 리포지토리 재사용성이 낮아진다. 리포지토리 안에 API 스펙에 맞춘 코드가 들어간다.
- 대부분의 경우 v3 과 성능차이가 그렇게 많이 차이나지 않는다. 성능은 대부분 테이블을 조인하거나 where 조건, index가 잘못잡힌 부분에서 발생한다.
  - 물론 컬럼 갯수가 너무 많을 때는 컬럼 선택을 고려해야 한다.



Repository 는 가급적 순수한 엔티티를 다루는 용도로 사용한다. 따라서 custom Repository 를 만들면 유지 보수성이 좋아진다.

```java
@RequiredArgsConstructor
@Repository
public class OrderSimpleQueryRepository {

    private final EntityManager em;

    public List<OrderSimpleQueryDto> findOrderDtos() {
        return em.createQuery(
                "select new co.wordbe.jpashop.repository.simpleOrder.OrderSimpleQueryDto(o.id, m.name, o.orderDate, o.status, d.address)" +
                        "  from Order o" +
                        "  join o.member m" +
                        "  join o.delivery d", OrderSimpleQueryDto.class)
                .getResultList();
    }
}
```



#### 쿼리 방식 선택 권장 순서

1. 엔티티를 DTO로 변환하는 방법을 선택한다. (V2)
2. 필요하면 fetch join으로 성능을 최적화한다. (95% 의 대부분 성능이슈가 해결된다.) (V3)
3. 그래도 안되면 DTO로 직접 조회하는 방법을 사용한다. (V4)
4. 최후의 방법은 JPA가 제공하는 네이티브 SQL 이나 스프링 JDBC template 을 사용해서 SQL을 직접 사용한다.





















