# RabbitMQ 001



# 1 RabbitMQ



## 1 기능과 장점

- 오픈소스
- 플랫폼과 업체 중심성 : AMQP (Advanced Message Queuing Protocol) 스펙을 구현한 메시지 브로커
- 경량성
- 다양한 클라이언트 라이브러리
- 유연한 성능과 안정성 절충 제어
- 대기 시간이 긴 네트워크 환경을 위한 플러그인
- 서드파티 플러그인
- 보안 계층



### 1 RabbitMQ 와 Erlang

- 얼랭은 실시간시스템에서 경량 프로세스 간 메시지를 전달하고, 공유하는 상태가 없도록 설계되어 있다. → 높은 수준의 동시성을 제공한다.
- RabbitMQ는 얼랭의 프로세스 간 통신(IPC)을 사용하므로 클러스터링 기능을 간단히 구현할 수 있다.



### 2 RabbitMQ 와 AMQP

- AMQP 스펙을 구현한 최초 메시지 브로커 중 하나
- MQTT, STOMP, XMPP 등 다양한 프로토콜도 지원
- RabbitMQ는 메시지 지향 미들웨어 (MOM, Messag oriented miidleware)



## 3 느슨하게 결합된 아키텍처 장점

### 1 애플리케이션의 의존성 제거

### 2 데이터베이스 쓰기 의존성 제거

### 3 새로운기능 추가하기

### 4 데이터와 이벤트 복제

- Federation 플러그인을 사용하면 다른 데이터센터의 RabbitMQ 서버 또는 클러스터를 쉽게 추가할 수 있다. 

### 5 다중 마스터 Federation

- 양방향 가능

### 6 AMQ 모델

- AMQP 스펙은 네트워크 뿐만 아니라 서버 측 서비스 동작방식도 정의한다. 
- AMQ(Advanced Message Queuing) 모델은 메시지 라우팅 동작을 정의하는 메시지 브로커의 3가지 추상 컴포넌트를 논리적으로 정의한다.
  - exchange : 메시지 브로커 → 큐로 메시지 전달하는 컴포넌트
  - queue : 메시지를 저장하는 디스크나 메모리상의 자료구조
  - binding : exchange 에 전달된 메시지가 어떤 큐에 저장돼야 하는지 정의하는 컴포넌트



1. 발행자 애플리케이션은 메시지를 RabbitMQ 에 전달한다
2. RabbitMQ는 전달받은 메세지를 `exchange` 에 전달한다
3. `exchange` 는 정의한 `binding` 을 평가해서 메시지를 적절한 큐에 전달한다.
   - 메시지를 특정 큐에 전달하도록 설정한 `binding` 은 `exchange` 와 큐를 연결한다.





---



# 2 AMQP 와 RabbitMQ 코드 작성하기

- AMQP 스펙은 프로토콜 수준에서 클라이언트와 메시지 브로커가 메시지를 주고받을 수 있도록 협상과 같이 정보를 중계하는 절차를 정의한다.

## 1 RPC 전송으로서 AMQP

- RabbitMQ 는 AMQP 메시지 브로커로 코어 서버와 통신하는 거의 모든 부분에서 RPC 패턴으로 엄격하게 통신한다.

> RPC(Remote Procedure Call)
>
> - 한 컴퓨터에서 다른 컴퓨터의 프로그램이나, 프로그램의 메소드를 원격에서 실행할 수 있게 해주는 컴퓨터 간 통신 유형

- AMQP 스펙은 서버와 클라이언트 모두 요청을 실행할 수 있다.



### 1 대화 시작하기

연결협상(connection negotiation) : 클라이언트가 RabbitMQ 와 통신할 때 RPC가 동작하는 형식을 정의한다.

- AMQP 통신 시작할 때 인사말은 프로토콜 헤더에 해당한다.
- 클라이언트 → 서버로 프로토콜 헤더 보낸다.
- 서버는 `Connection.Start` 로 응답
- 클라는 `Connection.StartOk` 응답 프레임으로 RPC 요청에 응답

### 2 올바른 채널로 튜닝

- 멀티플렉싱(multiplexing) : AMQP 연결에는 여러 채널이 있으므로 클라이언트와 서버 간 여러 대화를 수행할 수 있다.
  - 여러 작업을 수행하는 멀티스레드, 비동기 애플리케이션에 유용하다.



## 2 AMQP의 RPC 프레임 구조

- `Connection.Start` RPC 요청은 AMQP Connection 클래스와 Start 메소드로 구성된다.

### 1 AMQP 프레임 컴포넌트

- 저수준 AMQP 프레임 구성요소
  - 프레임 헤더
    - 프레임 유형
    - 채널 번호
    - 프레임 크기 (Byte)
  - 프레임 페이로드
  - 끝 바이트 표식(ASCII 값 206)

### 2 프레임 유형

- 프로토콜 헤더 프레임 : 연결시 한 번만 사용
- 메소드 프레임 : RabbitMQ 와 서로 주고 받는 RPC 요청이나 응답을 전달
- 콘텐츠 헤더 프레임 : 메시지 크기와 속성을 포함
- 바디 프레임 : 메시지 내용
- 하트비트 프레임 : RabbitMQ와 연결된 클라이언트와 서버가 주고받으며, 서로 사용 가능한 상태인지 확인

### 3 메시지를 프레임으로 마샬링하기

- RabbitMQ에 메시지 발행시 메소드 프레임, 헤더 프레임, 바디 프레임을 사용한다.
- 메소드 프레임
  - Exchange, Routing key 를 함께 전송한다.
- 콘텐츠 헤더 프레임
  - 본문 크기, 메시지 속성
- 하나 이상의 바디 프레임
  - 정해진 본문 크기보다 크면 쪼개진다.





- Basic.Publish 메소드 프레임
  - RabbitMQ 서버에게 클라이언트가 메시지를 발행하려 하고 Basic.Properties 가 포함된 헤더 프레임이 있어야 함을 알린다.

### 4 메소드 프레임 해부하기

- 일반적으로 Basic.Publish RPC 요청은 단방향 통신이다.
- Basic
- Publish
- Exchange name
- Routing key-value
- Mandatory flag

### 5 콘텐츠 헤더 프레임

### 6 바디 프레임

## 3 프로토콜 사용하기

- 메시지 큐 발행전 최소한 익스체인지와 큐를 설정한 후 둘을 연결해야 한다.

### 1 익스체인지 선언

- 클라이언트 → 서버 : Exchange.Declare
- 서버는 Exchange.DeclareOk 응답

### 2 큐 선언하기

- 클라이언트 → 서버 : Queue.Declare
- 서버는 Queue.DeclareOk 응답

### 3 큐와 익스체인지 연결하기

- 클라이언트 → 서버 : Queue.Bind
- 서버는 Queue.BindOk 응답

### 4 RabbitMQ 에 메시지 발행하기

- 실제 메세지 본문을 전달하기 전에 클라이언트는 아래 프레임 헤더를 보낸다.
  - Basic.Publish 메소드 프레임 : 익스체인지이름과 라우팅키가 들어있고, RabbitMQ 는 DB와 비교한다.
  - 콘텐츠 헤더 프레임
  - 바디 프레임

### 5 RabbitMQ에서 메시지 소비하기

- 소비자 애플리케이션은 Basic.Consume 명령을 실행해서 RabbitMQ 의 큐를 구독한다.
- 서버는 Basic.ConsumeOk 응답
- 서버는 그 후 Basic.Deliver, 헤더, 바디 전송
- 클라이언트는 Baisc.Ack 응답



<br />

## 4 메시지 발행자 작성하기

## 5 RabbitMQ에서 메시지 받기





---

# 3 메시지 속성 심층 탐사

- 메시지를 설명하기 위한 일관된 방법으로 RabbitMQ 에 발행된 모든 메시지와 함께 전달되는 데이터구조인 AMQP 스펙의 Basic.Properties 를 사용한다.
- Basic.Properties를 통해 메시지가 자동으로 제거되거나 처리하기 전에 메시지의 출처와 유형을 검증할 수 있는 consumer 애플리케이션 작성이 가능하다.



## 1 메시지 속성 적절히 사용하기

- 발행된 메시지는 
  - Basic.Publish 메소드 프레임, 콘텐츠 헤더 프레임, 바디 프레임으로 구성된다.
- 콘텐츠 헤더 프레임에 있는 메시지 속성은 Basic.Properties 데이터 구조로 사전에 정의한 집합이다.



**[Basic.Properties 안의 속성들]**

## 2 content-type 으로 명시적 메시지 계약 작성하기

## 3 content-encoding 으로 메시지 크기 줄이기

- AMQP 를 이용해 전달한 메시지는 기본적으로 압축이 되지 않는다.
- 발행자는 메시지 발행 전 압축하고, 소비자로부터 메시지를 받아 압축을 풀 수 있다.
- content-encoding 속성을 base64, gzip 하면 메시지 본문을 인코딩 가능하다.

## 4 message-id, correlation-id 를 이용한 메시지 참조

- AMQP 스펙에서 애플리케이션 용도로 지정됐다.
- message-id : 메시지 식별 아이디
- correlation-id : 메시지가 다른 메시지의 응답임을 나타낸다. 이전 메시지의 message-id 값으로 표현한다. 또는 트랜잭션 ID 나 다른 참조 데이터를 사용한다.

## 5 timestamp 속성

- RabbitMQ 를 통한 메시지 흐름에서 예상치 못한 동작을 진단할 때 유용하다.
- 메시지 생성 시점을 기록하면, 메시지 발행시 성능을 측정할 수 있다.

## 6 expiration 자동으로 메시지 만료하기

## 7 delivery-mode 로 안정성과 속도 조절하기

- RabbitMQ 가 메시지를 큐에 삽입할 때 디스크에 저장할지 메모리에 보관할지 지정한다.

## 8 app-id, user-id 로 메시지의 출처 확인하기

- app-id : publisher 애플리케이션에서 자유롭게 사용할 수 있는 문자열
- user-id : 메시지 발행하는 RabbitMQ 사용자에 대해 유효성 검사

## 9 type 으로 메시지 특정하기

- 메시지의 내용을 설명한다. 메시지 유형 정의

## 10 동적인 작업 흐름에는 reply-to 사용

- RPC 스타일의 메시지 응답에 consumer 가 사용해야 하는 라우팅 키를 전달하는데 사용한다.

## 11 headers 로 사용자 속성 지정

- key-value 쌍

## 12 priority

- 0~9



