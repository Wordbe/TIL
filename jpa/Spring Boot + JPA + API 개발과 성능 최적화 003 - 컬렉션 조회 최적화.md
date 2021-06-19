# Spring Boot + JPA + API 개발과 성능 최적화 003 - 컬렉션 조회 최적화



컬렉션에서는 1대다 조회가 된다. 쿼리가 뻥튀기가 된다. 쿼리를 최적화하기 어려워진다.



Order 엔티티

```java
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "orders")
public class Order {

  @Id @GeneratedValue
  @Column(name = "order_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id")
  private Member member;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
  private List<OrderItem> orderItems = new ArrayList<>();

  @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JoinColumn(name = "delivery_id")
  private Delivery delivery;

  private LocalDateTime orderDate; // 주문시간

  @Enumerated(EnumType.STRING)
  private OrderStatus status; // 주문상태 [ORDER, CANCEL]
  ...
}
```

OrderItem 엔티티

```java
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class OrderItem {

  @Id @GeneratedValue
  @Column(name = "order_item_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_id")
  private Item item;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id")
  private Order order;

  private int orderPrice; // 주문 가격
  private int count; // 주문 수량
}
```







주문내역에서 추가로 주문한 상품 정보를 추가로 조회하자.

Order 기준으로 컬렉션인 OrderItem 과 Item 이 필요하다.

앞의 예제는 XtoOne 관계만 있었지만, 이번에는 컬렉션인 oneToMany 를 조회하고, 최적화하는 방법을 알아본다.

## 주문조회 v1 : 엔티티 직접 노출

OrderApiController

```java
@RestController
@RequiredArgsConstructor
public class OrderApiController {
    private final OrderRepository orderRepository;

    @GetMapping("/api/v1/orders")
    public List<Order> ordersV1() {
        List<Order> all = orderRepository.findAllByJPQL(new OrderSearch());
        for (Order order : all) {
            order.getMember().getName();
            order.getDelivery().getAddress();

            List<OrderItem> orderItems = order.getOrderItems(); // OrderItem 강제 로딩
            orderItems.forEach(o -> o.getItem().getName()); // Item 강제 로딩
        }
        return all;
    }
}
```

원래 1:다 는 LAZY 로딩이지만 위와같이 강제하면 EAGER 로 가져올 수 있다.



## 주문조회 v2 : 엔티티를 DTO로 반환



DTO 안에 엔티티가 있다면, 그것도 DTO 로 만들어주어야한다.

엔티티의 정보를 밖으로 노출시키지 말자. 이미 사용되고 있는 필드가 많을 수록 협업이 어려워져서 요구사항이 많아질 수도있고, 보안상 위험할 수도 있다.

```java
@GetMapping("/api/v2/orders")
public List<OrderDto> ordersV2() {
  List<Order> orders = orderRepository.findAllByJPQL(new OrderSearch());

  return orders.stream()
    .map(OrderDto::new)
    .collect(Collectors.toList());
}

@Getter
static class OrderDto {
  private Long orderId;
  private String name;
  private LocalDateTime orderDate;
  private OrderStatus orderStatus;
  private Address address;
  private List<OrderItemDto> orderItems;

  public OrderDto(Order order) {
    orderId = order.getId();
    name = order.getMember().getName();
    orderDate = order.getOrderDate();
    orderStatus = order.getStatus();
    address = order.getDelivery().getAddress();
    orderItems = order.getOrderItems().stream()
      .map(orderItem -> new OrderItemDto(orderItem))
      .collect(Collectors.toList());
  }

  @Getter
  static class OrderItemDto {
    private String itemName;
    private int orderPrice;
    private int count;

    public OrderItemDto(OrderItem orderItem) {
      itemName = orderItem.getItem().getName();
      orderPrice = orderItem.getItem().getPrice();
      count = orderItem.getCount();
    }
  }
}
```



```java
{
  "orderId": 4,
  "name": "kim",
  "orderDate": "2021-06-18T00:41:50.758",
  "orderStatus": "ORDER",
  "address": {
    "city": "서울",
    "street": "강",
    "zipcode": "21345"
  },
  "orderItems": [
    {
      "itemName": "카산드라",
      "orderPrice": 10000,
      "count": 1
    },
    {
      "itemName": "몽고디비",
      "orderPrice": 12000,
      "count": 2
    }
  ]
},
```

문제 : LAZY 로 설정되어 있었던 페치타입의 객체 컬럼들이 호출되면서, 해당 필드를 불러오기 위한 다수의 쿼리가 호출된다.



<br />

## 주문조회 v3 : DTO + Fetch Join



위처럼 다수의 쿼리를 발생시켜서 DB 네트워크 비용을 높이는 대신, 조인을 해서 필요한 데이터를 한 번의 쿼리에 담아올 수 있다.

따라서 성능 이슈를 해결할 수 있다.

```java
public List<Order> findAllWithItem() {
  return em.createQuery(
    "select o from Order o" +
    "  join fetch o.member m" +
    "  join fetch o.delivery d" +
    "  join fetch o.orderItems oi" +
    "  join fetch oi.item i", Order.class)
    .getResultList();
}
```

```java
@GetMapping("/api/v3/orders")
public List<OrderDto> ordersV3() {
  List<Order> orders = orderRepository.findAllWithItem();

  return orders.stream()
    .map(OrderDto::new)
    .collect(Collectors.toList());
}
```



JPQL 의 fetch join 키워드를 통해 아래 쿼리를 생성하게 된다.

```sql
select
        order0_.order_id as order_id1_6_0_,
        member1_.id as id1_4_1_,
        delivery2_.delivery_id as delivery1_2_2_,
        orderitems3_.order_item_id as order_it1_5_3_,
        item4_.item_id as item_id2_3_4_,
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
        delivery2_.status as status5_2_2_,
        orderitems3_.count as count2_5_3_,
        orderitems3_.item_id as item_id4_5_3_,
        orderitems3_.order_id as order_id5_5_3_,
        orderitems3_.order_price as order_pr3_5_3_,
        orderitems3_.order_id as order_id5_5_0__,
        orderitems3_.order_item_id as order_it1_5_0__,
        item4_.name as name3_3_4_,
        item4_.price as price4_3_4_,
        item4_.stock_quantity as stock_qu5_3_4_,
        item4_.artist as artist6_3_4_,
        item4_.etc as etc7_3_4_,
        item4_.author as author8_3_4_,
        item4_.isbn as isbn9_3_4_,
        item4_.actor as actor10_3_4_,
        item4_.director as directo11_3_4_,
        item4_.dtype as dtype1_3_4_ 
    from
        orders order0_ 
    inner join
        member member1_ 
            on order0_.member_id=member1_.id 
    inner join
        delivery delivery2_ 
            on order0_.delivery_id=delivery2_.delivery_id 
    inner join
        order_item orderitems3_ 
            on order0_.order_id=orderitems3_.order_id 
    inner join
        item item4_ 
            on orderitems3_.item_id=item4_.item_id

```

distinct 키워드 없이 orders 와 order_item 을 조인하면 아래와 같이 4개의 row 가 나오는데,

이는 사실 Order 객체 입장에서는 1,2행이 같고 3,4행이 같은 데이터이다. (Order 객체 안에 Member, Item, OrderItem이 모두 들어있다.)

![](https://i.ibb.co/M68wTPR/2021-06-18-1-26-46.png)



JPQL 에 `distinct` 키워드를 넣어주면, DB 의 distinct 처럼 중복을 제거하는 기능을 추가해준다. 

DB 에서는 row 의 모든 값이 같아야 중복을 없애준다. 하지만 JPA 에서는 Order 의 id 가 똑같으면 중복을 제거한다. (애플리케이션에서 엔티티의 중복을 한 번더 걸러준다.)

따라서 위 JPQL 의 select 옆에 distinct 를 넣어주면, 결과는 아래와 같이 나오게 된다. 원래는 중복된 결과가 하나 더 나와 총 4개가 나온다.

```json
[
    {
        "orderId": 4,
        "name": "kim",
        "orderDate": "2021-06-18T01:20:19.378",
        "orderStatus": "ORDER",
        "address": {
            "city": "서울",
            "street": "강",
            "zipcode": "21345"
        },
        "orderItems": [
            {
                "itemName": "카산드라",
                "orderPrice": 10000,
                "count": 1
            },
            {
                "itemName": "몽고디비",
                "orderPrice": 12000,
                "count": 2
            }
        ]
    },
    {
        "orderId": 11,
        "name": "lee",
        "orderDate": "2021-06-18T01:20:19.409",
        "orderStatus": "ORDER",
        "address": {
            "city": "성남",
            "street": "별",
            "zipcode": "31345"
        },
        "orderItems": [
            {
                "itemName": "녹용",
                "orderPrice": 20000,
                "count": 3
            },
            {
                "itemName": "동충하초",
                "orderPrice": 40000,
                "count": 4
            }
        ]
    }
]
```



단점은 페이징이 불가능하다는 것이다.

1대다 페치조인을 하는 순서의 기준이 달라져버린다. 다대일은 상관없지만, `join fetch o.orderItems oi` 의 경우 일대다 조건이므로 조인하는 순간 행의 갯수가 늘어나고 DB에서 페이징 기준을 잃게 된다. 따라서 하이버네이트는 DB에서 데이터를 모두 읽어온 뒤 메모리에서 작업을 하게 된다.

```java
public List<Order> findAllWithItem() {
  return em.createQuery(
    "select distinct o from Order o" +
    "  join fetch o.member m" +
    "  join fetch o.delivery d" +
    "  join fetch o.orderItems oi" +
    "  join fetch oi.item i", Order.class)
    .setFirstResult(1)
    .setMaxResults(100)
    .getResultList();
}
```

```shell
WARN 68877 --- [nio-8080-exec-2] o.h.h.internal.ast.QueryTranslatorImpl   : HHH000104: firstResult/maxResults specified with collection fetch; applying in memory!
```

- 위처럼 하이버네이트는 경고 로그를 남기면서 모든 데이터를 DB에서 읽어오고, 메모리에서 페이징을 해버린다. (OOM 에러가 날 수 있으니 매우 위험하다.)
- 컬렉션 페치 조인은 1개만 사용할 수 있다. 둘 이상에 페치조인을 사용하면 안된다. 데이터가 부정합하게 조회될 수 있다. 1대다를 연쇄적으로 2번이상 (A(1) → (N)B(1) → C(N))사용시 하이버네이트틑 경고를 낸다.

<br />

---

## 주문조회 v3.1 : DTO + Fetch Join : 페이징과 한계 돌파



Order 와 OrderItems 가 1대다로 있다면, OrderItems 기준으로 페이징이 된다.

### 페이징 한계 돌파

컬렉션을 패치 조인하면 페이징이 불가능하다.

- 컬렉션을 페치 조인하면 일대다 조인이 발생하므로 데이터가 예측할 수 없이 증가한다.
- 일대다에서 1을 기준으로 페이징을 하고 싶지만 데이터는 다(N)를 기준으로 row 가 생성된다.
- Order를 기준으로 페이징 하고 싶지만, OrderItem 이 기준이 되어버린다.

하이버네이트는 경로 로그를 남기고 모든 DB 데이터를 읽어서 메모리에서 페이징을 시도한다. 최악의 경우 장애로 이어진다.



### 한계 돌파

TL;DR

> ToOne 관계는 페치 조인해도 페이징이 가능하므로, 페치 조인하여 쿼리수를 줄이고,
>
> 나머지는 `hibernate.default_batch_fetch_size = 100`  으로 최적화 하자.





페이징 + 컬렉션 엔티티를 함께 조회하려면?

→ 코드도 간결하고, 성능 최적화도 보장하는 강력한 방법 소개, 대부분 페이징 + 엔티티 조회 문제를 해결

1. `OneToOne`, `ManyToOne` 은 모두 fetch join 한다. `ToOne` 관계는 row 를 증가시키지 않으므로 페이징 쿼리에 영향을 주지 않는다.
2. 컬렉션은 지연 로딩으로 조회한다.
3. 지연 로딩 성능 최적화를 위해 `hibernate.default_batch_fetch_size`, `@BatchSize` 를 적용한다.
   - hibernate.default_batch_fetch_size : 글로벌 설정
   - @BatchSize : 개별 최적화
   - 이 옵션은 **컬렉션이나 프록시 객체를 설정한 사이즈만큼 한꺼번에 IN 쿼리로 조회한다.**



아래 옵션을 통해 전역적으로 in 쿼리 안에 몇개의 조건을 담을지 정할 수 있다.

**application.yml**

```yaml
spring:
  jpa:
      properties:
        hibernate:
          default_batch_fetch_size: 100
```

또는 개별로 적용하려면 컬렉션 필드위에 `@BatchSize` 어노테이션을 붙인다.

```java
@BatchSize(size = 100)
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
private List<OrderItem> orderItems = new ArrayList<>();
```

컬렉션이 아닌 일반 객체 필드위에 적용하려면, 해당 엔티티에 가서 클래스 위에 `@BatchSize` 를 붙여준다.

```java
@BatchSize(size = 100)
@Getter
@Entity
public class Member {

    ...

    @JsonIgnore
    @OneToMany(mappedBy = "member")
    private List<Order> orders = new ArrayList<>();
}
```





```sql
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
  on order0_.delivery_id=delivery2_.delivery_id limit ?
```

```sql
select
        orderitems0_.order_id as order_id5_5_1_,
        orderitems0_.order_item_id as order_it1_5_1_,
        orderitems0_.order_item_id as order_it1_5_0_,
        orderitems0_.count as count2_5_0_,
        orderitems0_.item_id as item_id4_5_0_,
        orderitems0_.order_id as order_id5_5_0_,
        orderitems0_.order_price as order_pr3_5_0_ 
    from
        order_item orderitems0_ 
    where
        orderitems0_.order_id in (
          ?, ?
        )
```

```sql
select
        item0_.item_id as item_id2_3_0_,
        item0_.name as name3_3_0_,
        item0_.price as price4_3_0_,
        item0_.stock_quantity as stock_qu5_3_0_,
        item0_.artist as artist6_3_0_,
        item0_.etc as etc7_3_0_,
        item0_.author as author8_3_0_,
        item0_.isbn as isbn9_3_0_,
        item0_.actor as actor10_3_0_,
        item0_.director as directo11_3_0_,
        item0_.dtype as dtype1_3_0_ 
    from
        item item0_ 
    where
        item0_.item_id in (
          ?, ?, ?, ?
        )
```

1 + N + M (1 + 2 + 2) 쿼리 실행을 1 + 1 + 1 쿼리로 만들었다.

정규화된 쿼리가 최적으로 실행된다.

항상 트레이드오프 관계가 있다. 한 번에 가져오는 데이터 양 vs DB 네트워크 요청 cost

<br />

**장점**

- 쿼리 호출 수가 1 + N 에서 1 + 1 로 최적화 된다.
- 조인보다 DB 데이터 전송량이 최적화된다. Order 와 OrderItem 을 조회하면, 중복데이터가 나와 4개 row 가 조회되는 것이 아니라 중복이 없애진 2 row 만 조회된다.
- 페치 조인 방식과 비교해서 쿼리 호출 수가 증가하지만, DB 데이터 전송량은 감소한다.
- 컬렉션 페치 조인은 페이징이 불가능하지만, 이 방법은 페이징이 가능하다.



> - default_batch_fetch_size 크기는 100~1000 사이를 선택하는 것을 권장한다. 
> - WAS 와 DB 가 버티는 한 사이즈를 1000 정도 크게하는 것이 좋다.
>
> SQL IN 절을 사용하는데, 데이텁이스에 따라 IN 절을 1000개로 제한하기도 한다. 1000으로 잡으면 한 번에 1000개를 DB에서 애플리케이션에 불러오므로 DB에 순간 부하가 증가할 수 있다. 하지만 애플리케이션은 100이든 1000이든 List\<Order\>에 전체 데이터를 로딩해야 하므로 메모리 사용량이 길다. 즉, Out of Memory가 발생할 확률은 100이나 1000이나 비슷하다. 1000 으로 설정하는 것이 성능상 가장 좋지만, DB든 애플리케이션이든 순간 부하를 어디까지 견딜 수 있는지로 결정하면 된다.

