# Spring Boot + JPA + API 개발과 성능 최적화 004 - 컬렉션 조회 최적화 - JPA에서 DTO 직접 조회



## 주문 조회 v4 : JPA에서 DTO 직접 조회



```java
@GetMapping("/api/v4/orders")
public List<OrderQueryDto> orderV4() {
  return orderQueryRepository.findOrderQueryDtos();
}
```

```java
@Data
public class OrderItemQueryDto {

  @JsonIgnore
  private Long orderId;

  private String itemName;
  private int orderPrice;
  private int count;

  public OrderItemQueryDto(Long orderId, String itemName, int orderPrice, int count) {
    this.orderId = orderId;
    this.itemName = itemName;
    this.orderPrice = orderPrice;
    this.count = count;
  }
}
```

```java
@Repository
@RequiredArgsConstructor
public class OrderQueryRepository {

  private final EntityManager em;

  public List<OrderQueryDto> findOrderQueryDtos() {
    List<OrderQueryDto> orders = findOrders();
    orders.forEach(o -> {
      List<OrderItemQueryDto> orderItems = findOrderItems(o.getOrderId());
      o.setOrderItems(orderItems);
    });
    return orders;
  }

  private List<OrderItemQueryDto> findOrderItems(Long orderId) {
    return em.createQuery(
      "select new co.wordbe.jpashop.repository.order.query.OrderItemQueryDto(oi.order.id, i.name, oi.orderPrice, oi.count)" +
      "  from OrderItem oi" +
      "  join oi.item i" +
      " where oi.order.id = :orderId", OrderItemQueryDto.class)
      .setParameter("orderId", orderId)
      .getResultList();
  }

  private List<OrderQueryDto> findOrders() {
    return em.createQuery(
      "select new co.wordbe.jpashop.repository.order.query.OrderQueryDto(o.id, m.name, o.orderDate, o.status, d.address) " +
      "  from Order o" +
      "  join o.member m" +
      "  join o.delivery d", OrderQueryDto.class)
      .getResultList();
  }
}
```



- Query: 루트 1번, 컬렉션 N번을 실행한다. (1 + N 문제 발생)
- ToOne 관계들을 먼저 조회하고, ToMany 관계는 각각 별도로 처리한다. ToOne 관계는 조인해도 데이터 row 수가 증가하지 않고, ToMany 관계는 조인하면 row 수가 증가하기 때문이다.
- row 수가 증가하지 않는 ToOne 관계는 조인으로 최적화하기 쉬우므로 한 번에 조회하고, ToMany 관계는 최적화가 어려우므로 `findOrderItems()` 등의 별도 메소드로 조회한다.

<br />

## 주문 조회 v5 : 컬렉션 조회 최적화



**OrderQueryRepository.java**

```java
public List<OrderQueryDto> findAllByDto_optimization() {
  List<OrderQueryDto> orders = findOrders();

  List<Long> orderIds = orders.stream()
    .map(o -> o.getOrderId())
    .collect(Collectors.toList());

  List<OrderItemQueryDto> orderItems = em.createQuery(
    "select new co.wordbe.jpashop.repository.order.query.OrderItemQueryDto(oi.order.id, i.name, oi.orderPrice, oi.count)" +
    "  from OrderItem oi" +
    "  join oi.item i" +
    " where oi.order.id in :orderIds", OrderItemQueryDto.class)
    .setParameter("orderIds", orderIds)
    .getResultList();

  Map<Long, List<OrderItemQueryDto>> orderItemMap = orderItems.stream()
    .collect(Collectors.groupingBy(orderItemQueryDto -> orderItemQueryDto.getOrderId()));

  orders.forEach(o -> o.setOrderItems(orderItemMap.get(o.getOrderId())));
  return orders;
}
```

- Query: 루트 1번, 컬렉션 1번
- ToOne 관계들을 먼저 조회하고, 여기서 식별자 orderId 를 얻어 ToMany 관계인 OrderItem 을 한꺼번에 조회한다.
- Map 을 사용해서 매칭 성능을 향상시킨다. O(1)

생각보다 코드량이 많다.  



## 주문 조회 v6 : 플랫 데이터 최적화



```java
@GetMapping("/api/v6/orders")
public List<OrderQueryDto> ordersV6() {
  List<OrderFlatDto> flats = orderQueryRepository.findAllByDto_flat();

  return flats.stream()
    .collect(groupingBy(o -> new OrderQueryDto(o.getOrderId(), o.getName(), o.getOrderDate(), o.getOrderStatus(), o.getAddress()),
                        mapping(o -> new OrderItemQueryDto(o.getOrderId(), o.getItemName(), o.getOrderPrice(), o.getCount()), toList())
                       )).entrySet().stream()
    .map(e -> new OrderQueryDto(e.getKey().getOrderId(), e.getKey().getName(), e.getKey().getOrderDate(), e.getKey().getOrderStatus(), e.getKey().getAddress(), e.getValue()))
    .collect(toList());
}
```

```java
public List<OrderFlatDto> findAllByDto_flat() {
  return em.createQuery(
    "select new co.wordbe.jpashop.repository.order.query.OrderFlatDto(o.id, m.name, o.orderDate, o.status, d.address, i.name, oi.orderPrice, oi.count)" +
    "  from Order o" +
    "  join o.member m" +
    "  join o.delivery d" +
    "  join o.orderItems oi" +
    "  join oi.item i", OrderFlatDto.class)
    .getResultList();
}
```



```sql
select
        order0_.order_id as col_0_0_,
        member1_.name as col_1_0_,
        order0_.order_date as col_2_0_,
        order0_.status as col_3_0_,
        delivery2_.city as col_4_0_,
        delivery2_.street as col_4_1_,
        delivery2_.zipcode as col_4_2_,
        item4_.name as col_5_0_,
        orderitems3_.order_price as col_6_0_,
        orderitems3_.count as col_7_0_ 
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



- 장점: Query 는 1번 실행된다.
- 하지만 조인으로 인해 DB에서 애플리케이션에 전달하는 데이터가 중복되어 전달된다. 따라서 상황에 따라 V5 보다 더 느릴 수 있다.
- 애플리케이션에서 추가 작업이 크고, 페이징이 불가능한 것이 단점이다.



<br />

---

## API 개발 고급 정리

### 엔티티 조회

- 엔티티를 조회해서 그대로 반환 V1
- 엔티티 조회 후 DTO로 변환 V2
- 페치 조인으로 쿼리 수 최적화 V3
- 컬렉션 페이징과 한계 돌파 V3.1
  - 컬렉션은 페치 조인시 페이징 불가능
  - ToOne 관계는 페치 조인으로 쿼리 수 최적화
  - 컬렉션은 페치 조인 대신에 지연 로딩을 유지하고, hibernate.default_batch_fetch_size, @BatchSize로 최적화

### DTO 직접 조회

- JPA 에서 DTO를 직접 조회 V4
- 컬렉션 조회 최적화 - 일대다 관계인 컬렉션은 IN 절을 활용해서 메모리에 미리 조회해서 최적화 V5
- 플랫 데이터 최적화 - JOIN 결과를 그대로 조회 후 애플리케이션에서 원하는 모양으로 직접 변환 V6



### 권장 순서

1. 엔티티 조회 방식으로 우선 접근
   1. 페치조인으로 쿼리 수 최적화
   2. 컬렉션 최적화
      1. 페이징 필요하면 hibernate.default_batch_fetch_size, @BatchSize 로 최적화
      2. 페이징 필요 없으면 페치 조인 사용
2. 엔티티 조회 방식으로 해결이 안되면 DTO 조회 방식 사용
3. DTO 조회 방식으로 해결이 안되면 NativeSQL 또는 스프링 JdbcTemplate 사용

> 엔티티 조회 방식은 페치 조인이나, hibernate.default_batch_fetch_size, @BatchSize 를 통해 코드를 거의 수정하지 않고 옵션만 변경해서 다양한 성능 최적화를 시도할 수 있다. 반면에 DTO를 직접 조회하는 방식은 성능을 최적화 하는 방식을 변경할 때 많은 코드를 변경해야 하는 단점이 있다.



> 개발자는 성능 최적화와 코드 복잡도 사이에서 줄타기를 해야한다. 보통 성능 최적화는 복잡한 코드를 유발한다.
>
> 💡엔티티 조회 방식은 JPA가 많은 부분을 최적화 해주기 때문에, 단순한 코드를 유지하면서 성능을 최적화 할 수 있다.
>
> 반면에 DTO 조회 방식은 SQL을 직접 다루는 것과 유사하기 때문에, 둘 사이에 줄타기 해야 한다.



<br />

### DTO 조회 방식의 선택지

- DTO로 조회하는 방법은 각각 장단점이 있다. V4, V5, V6 에서 V6가 쿼리가 1번 실행된다고 해서 항상 좋은방법은 아니다.
- V4 는 코드가 단순하다. 특정 주문 한건만 조회하면 이 방식도 성능이 잘나온다. 예를 들어 조회한 Order 데이터가 1건이면 OrderItem 을 찾기 위한 쿼리도 1번만 실행하면 된다.
- V5 는 코드가 복잡하다. 여러 주문을 한꺼번에 조회하는 경우에는 V4 대신 V5 방식을 사용해야 한다. 예를들어 조회한 Order 데이터가 1000건일 때 V4 방식은 쿼리가 총 1+ 1000번 실행된다. 반면 V5 로 최적화 하면 쿼리가 총 1 + 1 번만 실행된다. 운영 환경에서 100배 이상 성능차이가 발생할 수 있다.
- V6 는 완전이 다른 방식으로, 쿼리 한번으로 최적화 되어서 상당히 좋아보이지만 Order 를 기준으로 페이징이 불가능하다. 실무에서는 이정도 데이터면 수백, 수천건 단위로 페이징 처리가 꼭 필요하므로, 이 경우 선택하기 어려운 방법이다. 데이터가 많으면 중복 전송이 증가해서 V5와 비교해서 성능 차이도 미비하다.

**결국 V5 를 많이 선택하게 된다.** 코드가 조금 복잡한데 엔티티조회에서 hibernate.default_batch_fetch_size 를 적용한 것을 직접 코딩했다고 생각하면 된다.

<br />

