# MSA 004 - 트랜잭션 관리 Saga

# 1 MSA 에서 트랜잭션 관리

## 1 분산 트랜잭션의 필요성

## 2 분산 트랜잭션의 문제점

- XA 는 2단계 커밋(2PC, two-phase commit) 을 이용해 전체 트랜잭션 참여자가 반드시 커밋 또는 롤백하도록 보장한다.
- SQL DB는 대부분 XA와 호환되며 메시지 브로커도 일부는 호환된다.

문제

- 하지만 NoSQL, 메시지 브로커(Kafka, RabbitMQ) 등은 분산 트랜잭션 지원하지 않는다.
- 동기 IPC 라 가용성이 떨어지는 문제도 있다.

요즘 아키텍트는 일관성보다 가용성을 우선시 한다. `AP` 모델

## 3 데이터 일관성 유지 : Saga Pattern

- 트랜잭션 없이 데이터 일관성 유지하는 메커니즘
- 사가는 일련의 로컬 트랜잭션
- 비동기 메시징은 하나 이상 사가 참여자가 장애가 나도, 사가 전체 단계를 확실히 실행시킬 수 있다.
- 사가는 ACID 에서 격리성(I) 이 없다.
- 사가는 로컬 트랜잭션마다 변경분을 커밋한다. 보상 트랜잭션으로 롤백한다.

- 로컬 트랜잭션이 완료되면 메시지를 발행해 다음 사가 단계를 트리거 한다.
  - 느슨한 결합
  - 메시지 수신자가 일시장애가 나면, 브로커는 메시지를 버퍼링하고 대기한다.

### 보상 트랜잭션으로 롤백

- 보상트랜잭션을 미리 작성해야 한다.
- 모든 트랜잭션이 보상이 필요하진 않다.
  - 조회 서비스
  - 항상 성공하는 재시도 가능한 서비스 (retriable transaction, 멱등한 트랜잭션)

<br />

# 2 사가 편성

## 1 코레오그래피 사가 (Choreography Saga)

- 의사 결정과 순서화를 사가 참여자에게 맡긴다. 주로 이벤트 교환 방식
- 단순한 사가에 적합
- 느슨한 결합

단점

- 이해가 어려움
- 서비스 간 잠재적인 순환 의존성
- 단단히 결합될 위험성



### 확실한 이벤트 기반 통신

- 트랜잭셔널 메시징 해야 한다.
- 메시지를 주고받는 서비스간의 상관관계를 매핑하는 상관관계 ID를 건네주어야 한다.



## 2 오케스트레이션 사가 (Orchestration Saga) (권장)

- 중앙화된 사가 오케스트레이터가 사가 편성을 관리한다. 사가 참여자에게 커맨드 메시지를 보내 수행작업을 지시한다.
- **복잡한 사가에 적합**
- 의존 관계 단순화
- 낮은 결합도
- 관심사를 더 분리하고 비즈니스 로직 단순화

단점

- 비즈니스 로직을 너무 많이 중앙화하면, 로직이 오케스트레이터에 많이 담긴다.
  - 오케스트레이터가 순서화만 담당하고, 다른 로직은 각 서비스로 퍼뜨리므로써 해결

<br />



- 오케스트레이터 클래스 정의

### 사가 오케스트레이터를 상태 기계(State Machine)로 모델링

- 상태 기계는 상태와 이벤ㅌ에 의해 트리거되는 전이(transition)으로 구성

### 트랜잭셔널 메시징



<br />

# 3 비격리 문제 처리

## 1 비정상(anomaly)

- 소실된 업데이트 (lost updates)
  - 한 사가의 변경분을 다른 사가가 덮어쓴다.
- dirty reads
- non-repeatable reads (fuzzy raads)

## 2 비격리 대책

- 시맨틱 락 : 애플리케이션 수준의 락
- 교환적 업데이트 : 업데이트 작업은 어떤 순서로 실행해도 되게끔 설계
- 비관적 관점 : 사가 단계 순서를 재조정하여 비즈니스 리스크 최소화
- 값 다시 읽기 : 데이터를 덮어쓸 때 그전에 변경된 내용이 없는지 다시 읽고 확인하여 dirty writes 방지
- 버전 파일 : 순서를 재조정할 수 있게 업데이트를 기록
- 값에 의한(by value) : 요청별 비즈니스 위험성을 기준으로 동시성 메커니즘 동적 선택



### 사가의 구조

사가는 세 가지 트랜잭션으로 구성

- 보상 가능 트랜잭션 (사가 롤백)
- 피봇 트랜잭션
- 재시도 가능 트랜잭션 (사가 완료)

![](https://i.ibb.co/JjQXcqk/image.png)

### 대책 : 시맨틱 락

- 레코드가 아직 커밋전이라서 변경될지 모른다는 플래그를 표시
- 다른 트랜잭션이 접근하지 못하도록 락을 건다. (또는 경고)
- 플래그는 사가완료 또는 사가롤백시 해제된다.
- `Order.state`

### 대책: 교환법칙(Cummutative) 성립하는 업데이트

- 순서 상관없이 업데이트 가능하게 설계

### 대책 : 비관적 관점 (Pessimistic View)

- dirty read 로 인한 비즈니스 리스크 최소화 위해 사가 순서를 재조정한다.
  - 주문서비스
  - 배달서비스
  - 회계서비스 : 신용잔고늘린다. (이부분이 맨 마지막에 있으면 다른 트랜잭션에서 dirty read 하지 않게 된다.)

### 대책: 값 다시 읽기 (Reread value)

- lost update 방지
- 값을 다시 읽었더니 변경되었다면 사가를 중단하고 나중에 재시작 한다.
- 일종의 낙관적 오프라인 락 패턴

### 대책: 버전 파일 (Version File)

- 레코드에 수행한 작업을 하나하나 다 기록
- 즉, 비교환적 작업을 교환적 작업으로 변환하는 것.
- 작업이 도착하면 기록해두었다가 정확한 순서대로 실행한다.

### 대책: 값에 의한 (By Value)

- 비즈니스 위험성을 기준으로 분산 트랜잭션을 쓸지까지 고려



# 4 주문 서비스 및 주문 생성 Saga 설계

![](https://i.ibb.co/1RNRHrQ/image.png)

## 1 OrderService 클래스

```java
@Transactional
public class OrderService {
    @Autowired
    private SagaManager<CreateOrderService> createOrderService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private DomainEventPublisher eventPublisher;
    
    public Order createOrder(OrderDetails orderDetails) {
        ...
        // 주문 생성
        ResultWithEvents<Order> orderAndEvents = Order.createOrder(...);
        Order order = orderAndEvents.result;
        orderRepository.save(order);
        
        // 도메인 이벤트 발행
        eventPublisher.publish(Order.class, Long.toString(order.getId()), orderAndEvents.events);
        
        // CreateOrderSaga 생성
        CreateOrderSagaState data = new CreateOrderSagaState(order.getId(), orderDetails);
        CreateOrderSagaManager.create(data, Order.class, order.getId());
        
        return order;
    }
}
```

## 2 주문 생성 사가 구현

- `CreateOrderSaga` 오케스트레이터
- 사가 기초 인터페이스 `SimpleSaga` 구현

```java
public class CreateOrderSaga implements SimpleSaga<CreateOrderSagaState> {
    private SagaDefinition<CreateOrderSagaState> sagaDefinition;
    
    public CreateOrderSaga(OrderServiceProxy,
                          ConsumeServiceProxy,
                          KichenServiceProxy,
                          AccountingServiceProxy ) {
        this.sagaDefinition = step()
            .withCompensation()
            .step()
            .invokeParticipant()
            .step()
            .invokeParticipant() // 포워드 트랜잭션 정의
            .onReply() // 성공 응답을 수신하면 ... 호출
            .withCompensatation() // 보상 트랜잭션 정의
            .step()
            .invokeParticipants()
            .step()
            ...
            .build();
    }
}
```

- `CreateOrderSagaState` 클래스
- `KitchenServiceProxy` 클래스

### Eventuate Tram Saga 프레임워크

![](https://i.ibb.co/tXxGJKV/image.png)



















