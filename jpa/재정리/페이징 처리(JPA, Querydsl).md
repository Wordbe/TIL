# 일대다(1:N) 페이징 처리(Spring Data JPA)



## TL;DR

- 1:N 연관관계인 두 엔티티가 즉시 로딩된다면 (엔티티 그래프나 fetch join 으로 연결되어 있다면) 페이징 처리시 쿼리에 `limit` 가 붙지 않고 모든 데이터가 메모리에 불러와진다.

- 페이징 처리를 위해서는 연관된 컬렉션을 한꺼번에 가져올 배치 사이즈를 정한다. (예시: 100개로 정하기)

  ```yaml
  spring:
    jpa:
      properties:
        hibernate:
          default_batch_fetch_size: 100
  ```

<br />

## 요구사항

어드민 화면에서 모든 사용자의 주문내역을 불러오는 화면이 필요합니다.

우리는 수많은 주문들을 한 화면에 불러오기 보다는 페이징 처리를 통해 한번에 필요한 갯수만큼 가져오겠습니다.

<br />

## Entity 연관관계

주문과 주문상품이 있다고 가정해봅시다. 한 주문에 대하여 여러 주문상품이 있을 수 있습니다. 따라서 두 엔티티의 관계는 1:N 입니다.

```java
@Entity
@Table(name = "`order`") // DB 예약어와 겹치지 않도록
public class OrderEntity {
  private Long id;
  
  @OneToMany(mappedBy="order", fetch=FetchType.LAZY)
  private Set<OrderProduct> orderProducts = new LinkedHastSet();
}
```

```java
@Entity
public class OrderProductEntity {
  private Long id;
  private String name;
  private int quantity;
  
  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="order_id")
  private Order order;
}
```

<br />

## Spring Data JPA 의 @EntityGraph

- 주문 - 주문상품과 같이 LAZY 로딩으로 설정된 일대'다' 엔티티를 같이 불러오기 위해 `@EntityGraph` 를 사용합니다.
- pageable 구현체를 파라미터로 넘깁니다.

OrderRepository 에는 아래와 같은 쿼리메소드가 필요합니다.

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
  @EntityGraph(
    attributePaths = {"orderProducts"},
    type = EntityGraph.EntityGraphType.LOAD)
  Page<OrderEntity> findOrderWithOrderProducts(Pageable pageable);
}
```

- 위와 같이 엔티티그래프로 주문에 연결된 콜렉션인 주문상품을 불러오면 쿼리에 자동적으로 left join 이 붙게 되어 하나의 쿼리에서 연관된 모든 데이터를 가져오게 됩니다.
- 위 쿼리는 Order 와 OrderProduct 에 대한 모든 컬럼을 가져옵니다. 원하는 컬럼만 가져오는 프로젝션이나 복잡한 조건절이 있는 쿼리를 위해서는 Querydsl 을 사용하는 것이 좋습니다.

이를 호출하는 OrderService 에서는 `pageRequest` 를 만들어주어서 파라미터로 넘겨 호출하면 됩니다.

```java
public Page<OrderEntity> findOrdersAsPagination(OrderRequestDto requestDto) {
  Pageable pageRequest = PageRequest.of(requestDto.getPage(), requestDto.getSize());
  return orderRepository.findOrderWithOrderProducts(pageRequest);
}
```

- 필요하면 아래와 같이 정렬 옵션도 넣을 수 있습니다. 아래 예시에는 생성일자 기준으로 내림차순 정렬했습니다. 하지만 정렬조건이 많아지면 pageRequest 에 담기보다 쿼리에 직접 명시하는 것이 덜 복잡합니다.

  ```java
  Pageable pageRequest =
      PageRequest.of(
      requestDto.getPage(), requestDto.getSize(), Sort.Direction.DESC, "createdAt");
  ```



<br/>

## Pagination 결과

이제 원하는 페이지 값과 사이즈를 넣어 데이터를 조회해봅시다. 예를 들어 page=0, size=10 이면 첫번째 페이지의 주문 10개 결과가 나오게 됩니다.

하지만, 쿼리 결과를 보면 우리가 원하지 않는 결과가 나오는 것을 볼 수 있습니다.

```sql
select
            orderentit0_.id as id1_15_0_,
            orderprodu4_.id as id1_17_5_,
            orderprodu4_.name as created_2_17_5_,
            orderprodu4_.quantity as updated_3_17_5_,
            orderprodu4_.order_id as order_id6_17_0__,
        from
            `
        order` orderentit0_  left outer join
            order_product orderprodu4_ 
                on orderentit0_.id=orderprodu4_.order_id
                
2021-11-27 18:46:31.096 DEBUG 14174 --- [nio-8081-exec-1] org.hibernate.SQL                        : 
    select
            count(orderentit0_.id) as col_0_0_ 
        from
            `
        order` orderentit0_
```

페이지네이션 결과는 분명 `limit 10` 이 붙어서 10개의 주문데이터만 가져와야 하는데, 주문상품 모두를 left join 으로 바로 가져오고 있습니다. 페이징 처리가 전혀되지 않는 것을 볼 수 있습니다.

하나의 주문 엔티티를 조회할 때는 상관 없었지만, 이렇게 여러개의 주문 엔티티(List, Page 등으로)를 조회하는 상황에서는 한꺼번에 많은 데이터를 메모리에 가져오는 것이 부담이 될 수 있습니다.



<br />

## 해결방법 : 일대다 엔티티를 한꺼번에 가져올 배치 사이즈를 설정

스프링에서는 엔티티에 연결된 콜렉션을 fetch 할 때 배치 사이즈를 설정할 수 있습니다.

아래와 같이 100으로 설정해두면, 한 주문을 불러올 때 관련된 연관 주문상품 100개까지 불러올 수 있다는 말이됩니다.

즉, 페이지네이션에서 한 페이지당 size = 100 까지 끊어서 자동으로 가져올 수 있게 처리됩니다.

**application.yml**

```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```

이는 전역적으로 설정하는 방법이며, 지역적으로 설정하고 싶다면 Repository 에서 해당 쿼리메소드 위해 `@BatchSize` 어노테이션을 붙여 배치 사이즈를 설정할 수 있습니다.

이 설정과 더불어 기존 `@EntityGraph` 의 attributePaths 에 명시해 주었던 컬렉션을 제거하면 페이지네이션이 가능해집니다.

(제거하지 않으면 그대로 다 불러오게 됩니다.)

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
  Page<OrderEntity> findOrderWithOrderProducts(Pageable pageable);
}
```

이제 쿼리를 확인해보겠습니다.

<br />

## 수정된 Pagination 결과

```sql
select
            orderentit0_.id as id1_15_0_,
            orderprodu4_.id as id1_17_5_,
            orderprodu4_.name as created_2_17_5_,
            orderprodu4_.quantity as updated_3_17_5_,
            orderprodu4_.order_id as order_id6_17_0__,
        from
            `
        order` orderentit0_  left outer join
            order_product orderprodu4_ 
                on orderentit0_.id=orderprodu4_.order_id
			  limit ?
2021-11-27 23:58:30.788 DEBUG 17444 --- [nio-8081-exec-4] org.hibernate.SQL                        : 
    select
            count(orderentit0_.id) as col_0_0_ 
        from
            `
        order` orderentit0_
2021-11-27 23:58:30.839 DEBUG 17444 --- [nio-8081-exec-4] org.hibernate.SQL                        : 
    /* load one-to-many domain.order.domain.entity.OrderEntity.orderProducts */ select
        orderprodu0_.order_id as order_id6_17_1_,
        orderprodu0_.id as id1_17_1_,
        orderprodu0_.id as id1_17_0_,
        orderprodu0_.name as created_2_17_0_,
        orderprodu0_.quantity as updated_3_17_0_,
        orderprodu0_.order_id as order_id6_17_0_,
    from
        order_product orderprodu0_ 
    where
        orderprodu0_.order_id in (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        ) 
    order by
        orderprodu0_.id asc
```

- 맨 위의 쿼리를 보면 `limit` 절이 붙은 것을 확인할 수 있습니다. size 를 10 으로 설정했으니 ? 는 10 됩니다.

- 중간 쿼리는 페이지네이션 count 값을 구하기 위해 주문의 총 갯수를 불러오는 쿼리입니다.

- 마지막 쿼리를 보면, `in` 절을 활용해서 주문 상품들을 똑똑하게 가져오는 쿼리를 만들어준다는 것을 확인할 수 있습니다. 주문을 먼저 10개 불러와 놓고, 거기서 나온 주문 id 를 마지막쿼리의 in 절에 넣어 해당 주문상품만 가져오게 되는 구조입니다.

- order by 절을 만들어내기 위해서는 OrderEntity 에 아래와 같이 `@OrderBy("id asc")` 어노테이션을 추가해주면 됩니다.

  ```java
  @Entity
  @Table(name = "`order`") // DB 예약어와 겹치지 않도록
  public class OrderEntity {
    private Long id;
    
    @OneToMany(mappedBy="order", fetch=FetchType.LAZY)
    @OrderBy("id asc")
    private Set<OrderProduct> orderProducts = new LinkedHastSet();
  }
  ```

<br />

<br />

<br />