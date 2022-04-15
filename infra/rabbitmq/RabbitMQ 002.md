# RabbitMQ 002



# 4 메시지 발행에서 성능 절충

- AMQP 스펙은 메시지 발행시 트랜잭션을 제공한다.
- 메시지를 디스크에 저장하는 경우 일반 메시지 발행보다 높은 수준의 안정성을 제공한다.
- RabbitMQ 는 발행자 확인 등 추가 기능을 제공한다. 여러 서버에 걸쳐 HA 큐 같은 메시지 배달 보장 수준을 선택할 수 있다.

## 1 발행 속도와 배달 보장의 균형 잡기

- Delivery guarantee 수준에는 골디락스 원칙을 적용할 수 있다.
- `Delivery guarantee ↔ 발행속도` tradeoff 조절
- **(빠름) 배달 보장 없음 - 실패 통보 - 발행자 확인 - 대체 익스체인지 - HA 큐 - 트랜잭션 - 트랜잭션 HA 큐 - 메시지 디스크에 저장 (느림)**

### 1 배달 보장 없음

### 2 실패 통보 : mandatory 플래그를 설정한 메시지를 라우팅할 수 없을 때

- 서버 모니터링 데이터가 항상 RabbitMQ로 배달되도록 보장하려면, collected 에서 RabbitMQ에 발행하는 메시지의 mandatory 를 설정한다.
- 발행자는 Basic.Publish RPC 명령을 사용해 라우팅할 수 없는 메시지를 `mandatory=True` 로 전송한다.
- 익스체인지가 메시지를 라우팅 할 수 없으면 RabbitMQ 는 Baisc.Return 을 통해 메시지를 보낸 그대로 전체 메시지와 함께 서버로 되돌려보낸다.

### 3 발행자 확인

- Publisher Confirms 는 AMQP 의 확장 기능이다.
- 발행자는 RabbitMQ 에게 Confirm.Select RPC 요청하고 서버는 Confirm.SelectOk 응답한다.
- 그 후 발행자가 Basic.Publish 로 메시지 발생하면, RabbitMQ는 Basic.Ack 또는 Basic.Nack 으로 응답한다.

### 4 대체 익스체인지 : 라우팅할 수 없는 메시지를 위함

- alternate exchange
  - 처음 익스체인지를 선언할 때 명시한다.
  - 익스체인지 라우팅할 수 없으면, 대체 익스체인지가 대신 지정된다.

### 5 트랜잭션으로 배치 처리하기

- 발행자 → RabbitMQ : Tx.Select 전송
- Tx.SelectOk 응답
- Basic.Publish 로 메시지 발행
- Basic.Return 응답
- Tx.Commit 으로 메시지 커밋
- Tx.CommitOk 로 응답

### 6 HA 큐를 사용해 노드 장애 대응하기

- 안정적 메시지 전달을 보장하기 위해 발행자와 RabbitMQ 간 계약을 강화해야하는 미션 크리티컬 메시징 아키텍처에서는 가용성 높은 HA 큐가 중요한 역할을 한다.

### 7 HA 큐 트랜잭션

- 트랜잭션 또는 발행자 확인을 사용하는 경우, 메시지가 HA 큐의 모든 활성 노드에 있는 것으로 확인할 때까지 RabbitMQ 는 성공 응답을 보내지 않는다.

### 8 delivery-mode 2 를 사용해 메시지를 디스크에 저장하기

- 대부분 사용자는 단지 글을 읽고 작성하지는 않는다.
- 읽기가 많고 쓰기는 적다.



## 2 RabbitMQ 푸시백

- RabbitMQ 3.2 버전부터 TCP 배압(Back Pressure) 메커니즘 작동
  - 발행자가 너무 많은 메시지를 보낼 경우 TCP 소켓 하위 수준의 데이터 수신을 중지한다.
- 새로운 연결 생성시, 연결에 사용할 수 있는 크레딧(credit) 양이 할당되고 RabbitMQ 가 각 RPC 명령을 수신하면 크레딧이 감소한다. RPC 요청이 처리되면 크레딧은 되돌려진다.
- Connection.Blocked, Connection.Unblocked 는 발행자 클라이언트르 차단하거나, 블록이 제거됐을 때 클라이언트에게 알릴 수 있는 비동기 메소드다.

