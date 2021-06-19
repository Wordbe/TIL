# Spring Boot + JPA 002 - 도메인 개발



## 회원



Entity Manger Factory 를 주입받으려면 아래와 같이 작성한다.

```java
@PersistenceUnit
private EntityManagerFactory emf;
```





JPA 에서 데이터 조회할 떄 아래 옵션을 추가하자.

```java
@Transactional(readOnly = true)
public List<Member> findMembers() {
  return memberRepository.findAll();
}
```

* 영속성 컨텍스트를 `flush` 하지 않는다.
* dirty checking 을 하지 않는다.
* 데이터베이스에 따라 읽기전용 모드일 때 최적화해주는 드라이버가 있다.
* 따라서 읽기 용도에서는 읽기전용을 추가하여 성능 최적화를 하자.
* 변경 사항이 있을 때는 사용해서는 안된다. (변경되지 않는다.)



<br />

필드인젝션

* 변경할 수가 없다.

세터인젝션

* 변경하여 주입할 수 있다. 테스트 코드에서 mock 을 주입할 수 있다.
* 다른 쓰레드에서 바뀔 가능성이 있다.

**생성자인젝션**

* 변경하여 주입할 수 있다.
* 파라미터를 입력하지 않으면 컴파일시점에서 잡기 때문에, 실수를 방지할 수 있다. 테스트코드 작성이 수월하다.
* 다른 곳에서 변경할 수 없다. 쓰레드 세이프 하다.
* 롬복 `@RequiredArgsConstructor` 과 함께 사용하여 코드량을 줄인다.



```java
@Repository
public class MemberRepository {

  @PersistenceContext
  private EntityManager em;

  public void save(Member member) {
    em.persist(member);
  }

  public Member findOne(Long id) {
    return em.find(Member.class, id);
  }

  public List<Member> findAll() {
    return em.createQuery("select m from Member m", Member.class)
      .getResultList();
  }

  public List<Member> findByName(String name) {
    return em.createQuery("select m from Member m where m.name = :name", Member.class)
      .setParameter("name", name)
      .getResultList();
  }
}
```

<br />

```java
@Repository
public class MemberRepository {

  @PersistenceContext
  private EntityManager em;
}
```

Spring Boot 를 사용한다면 아래와 같이 쓸 수 있다. 스프링부트가 `@Autowired` 만으로 entity manager 를 기능을 담아 빈으로 등록하여 관리해준다.

```java
@RequiredArgsConstructor
@Repository
public class MemberRepository {

    private final EntityManager em;
}
```



테스트

```java
@SpringBootTest
@Transactional
class MemberServiceTest {

    @Autowired MemberService memberService;
    @Autowired MemberRepository memberRepository;
    @Autowired EntityManager em;

    @Test
    @Rollback
    public void 회원가입() throws Exception {
        //given
        Member member = new Member();
        member.setName("jack");

        //when
        Long savedId = memberService.join(member);

        //then
        em.flush();
        assertEquals(member, memberRepository.findOne(savedId));
    }

    @Test
    public void 중복회원_예외() throws Exception {
        //given
        Member member1 = new Member();
        member1.setName("kim");

        Member member2 = new Member();
        member2.setName("kim");

        //when
        memberService.join(member1);
        IllegalStateException illegalStateException = assertThrows(IllegalStateException.class, () -> {
            memberService.join(member2);
        });

        //then
        assertEquals(illegalStateException.getMessage(), "이미 존재하는 회원입니다.");
    }
}
```



---

## 상품







---

## 주문



```java
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;

    /**
     * 주문
     */
    @Transactional
    public Long order(Long memberId, Long itemId, int count) {

        Member member = memberRepository.findOne(memberId);
        Item item = itemRepository.findOne(itemId);

        //배송정보 생성
        Delivery delivery = new Delivery();
        delivery.setAddress(member.getAddress());

        //주문상품 생성
        OrderItem orderItem = OrderItem.createOrderItem(item, item.getPrice(), count);

        //주문 생성
        Order order = Order.createOrder(member, delivery, orderItem);

        //주문 저장
        orderRepository.save(order);

        return order.getId();


    }

    /**
     * 취소
     */
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findOne(orderId);
        order.cancel();
    }
}
```

주문 생성

`Cascade`

* cascade 대상 객체가 다른 곳에서 참조하는 경우가 없는지 확인한다. (변경, 삭제될 수 있기 때문이다.)
* 같은 트랜잭션안에서 persist 해야 할 라이프싸이클이 같은 지 확인한다. 혹시나 cascade로 데이터가 잘못될 수 있는지 확인을 해야 한다.

<br />

주문 취소

JPA의 변경감지(Dirty Checking) : 엔티티 필드의 값이 수정되면, 자동으로 업데이트 쿼리가 발생한다.



> `도메인 모델 패턴`
>
> 비즈니스로직이 대부분 엔티티 안에 있다. 서비스 계층은 단순히 엔티티에 필요한 요청을 위임하는 역할을 한다. 반대로 엔티티에는 비즈니스 로직이 없고 서비스 계층에서 대부분 처리하는 것을 `트랜잭션 스크립트 패턴`이라 한다.

단위 테스트를 하나하나 하는 것이 좋다. 도메인 모델 패턴을 적용하면, 엔티티 단위로 단위테스트 개발이 쉽다.

<br />

### 주문 검색 기능 개발

* JPA 에서 동적 쿼리는 어떻게 해결 하는가?

검색 조건 파라미터 `OrderSearch`

```java
public List<Order> findAll(OrderSearch orderSearch) {
  String jpql = "select o from Order o join o.member m" +
    " where o.status = :status" +
    " and m.name like :name";
  return em.createQuery(jpql, Order.class)
    .setParameter("status", orderSearch.getOrderStatus())
    .setParameter("name", orderSearch.getMemberName())
    .setMaxResults(1000)
    .getResultList();
}
```

정적 쿼리는 위와 같이 잘 작성이 가능하다.

반면, 동적 쿼리는 아래와 같이 코드량이 다소 길어지고, 한 눈에 들어오지 않아 버그도 잡기 쉽지 않다.

### 동적 쿼리 생성

1. 스트링 붙이기 방법

```java
public List<Order> findAll(OrderSearch orderSearch) {
  String jpql = "select o from Order o join o.member m";
  boolean isFirstCondition = true;

  // 주문 상태 검색
  if (orderSearch.getOrderStatus() != null) {
    if (isFirstCondition) {
      jpql += " where";
      isFirstCondition = false;
    } else {
      jpql += " and";
    }
    jpql += " o.status = :status";
  }

  // 회원 이름 검색
  if (StringUtils.hasText(orderSearch.getMemberName())) {
    if (isFirstCondition) {
      jpql += " where";
      isFirstCondition = false;
    } else {
      jpql += " and";
    }
    jpql += " m.name like :name";
  }

  TypedQuery<Order> query = em.createQuery(jpql, Order.class)
    .setMaxResults(1000);

  if (orderSearch.getOrderStatus() != null) {
    query = query.setParameter("status", orderSearch.getOrderStatus());
  }

  if (StringUtils.hasText(orderSearch.getMemberName())) {
    query = query.setParameter("name", orderSearch.getMemberName());
  }

  return query.getResultList();
}
```

2. JPA Criteria (JPA 표준스펙) (유지보수 어려워 권장하지 않음)

```java
/**
 * JPA Criteria
 */
public List<Order> findAllByCriteria(OrderSearch orderSearch) {
  CriteriaBuilder cb = em.getCriteriaBuilder();
  CriteriaQuery<Order> cq = cb.createQuery(Order.class);
  Root<Order> o = cq.from(Order.class);
  Join<Object, Object> m = o.join("member", JoinType.INNER);

  List<Predicate> criteria = new ArrayList<>();

  // 주문 상태 검색
  if (orderSearch.getOrderStatus() != null) {
    Predicate status = cb.equal(o.get("status"), orderSearch.getOrderStatus());
    criteria.add(status);
  }

  // 회원 이름 검색
  if (StringUtils.hasText(orderSearch.getMemberName())) {
    Predicate name = cb.like(m.<String>get("name"), "%" + orderSearch.getMemberName() + "%");
    criteria.add(name);
  }

  cq.where(cb.and(criteria.toArray(new Predicate[criteria.size()])));
  TypedQuery<Order> query = em.createQuery(cq).setMaxResults(1000);
  return query.getResultList();
}
```

3. QueryDSL 추천 (뒤에서)





 