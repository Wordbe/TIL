# RabbitMQ 004

# 3부 통합과 맞춤 설정

# 9 대체 프로토콜 사용

- AMQP 0-9-1 은 RabbitMQ 와 통신하는 대부분 애플리케이션의 요구 사항을 해결할 수 있는 강력한 프로토콜이다.
- 하지만 대기 시간이 길고 신뢰할 수 없는 모바일 장치와 네트워킹에는 문제가 될 수 있다.



## 1 MQTT 와 RabbitMQ

- MQTT(MQ Telemetry Transport) 는 모바일 애플리케이션에서 널리 사용되는 경량 메시지 프로토콜이다.
- RabbitMQ 플러그인 가능
- 발행자 소비자 패턴 기반
- LWT(Last Will and Testament) 를 사용하면 클라이언트가 연결이 끊어질 때 발행해야 하는 메시지를 지정할 수 있다.
- 메시지 크기는 최대 256MB (AMQP 는 최대 16엑사바이트 10^18)

### 1 MQTT Protocol

- AMQP 는 프로토콜 레벨에 익스체인지, 큐 같은 구조가 있지만
- MQTT 는 발행자와 소비자로만 구성된다.

MQTT 명령 메시지 내부 구조

1. 메시지 유형 : CONNECT, PUBLISH, SUBSCRIBE 4비트
2. DUP 플래그 : 메시지가 재전송인지 나타내는 1비트
3. QoS 플래그 : 메시지 서비스 품질을 나타내는 2비트, once at most | at least once | exactly once
4. 유지(Retain) 플래그 : 모든 구독자에게 메시지를 발행한 후 메시지를 유지해야 하는지 서버에 얼려주는 1비트 플래그



> 매슬로우의 법칙에 따르면, 가진 것이 망치밖에 없을 때 모든 것이 못처럼 보인다.
>
> 작은 메시지의 경우 MQTT 는 HTTP 보다 빠르지만, 파일과 같은 유형을 전송할 때는 HTTP 가 더 빠르다.

- 가변 헤더 : 메시지의 세부 사항을 포함하는 바이너리 압축 데이터

### 2 MQTT 로 발행하기

- MQTT 의 토픽 이름은 메시지 발행에 대한 강력한 라우팅 도구이다.
- RabbitMQ 의 토픽 익스체인지에 사용되는 라우팅 키와 비슷한 개념이다.
- 메시지 목적지 생성
- MQTT 발행자 작성하기
- AMQP를 통해 MQTT에서 발행한 메시지 받기

### 3 MQTT 구독자

### 4 MQTT 플러그인 설정

- `/etc/rabbitmq/rabbit.config`



## 2 STOMP 와 RabbitMQ

- STOMP (Streaming Text Oriented Message Protocol)
  - HTTP처럼 느슨한 모델, 읽기쉬운 텍스트 기반 프로토콜
- RabbitMQ 도 지원

### 1 STOMP Protocol

- 스트림 기반 처리가 가능하도록 설계됨
- STOMP 프레임은 널(0x00) 바이트로 끝나는 명령과 페이로드로 구성된 UTF-8 텍스트다.
- 끝에 널 바이트를 나타내기 위해 ASCII 로 `^@` (control-@) 가 사용된다.

```shell
CONNECT
accept-version:1.2
host:rabbitmq-nㄸㄷ

^@
```

### 2 메시지 발행하기

- destination (대상) 은 메시지를 보낼 위치
  - STOMP 큐에 메시지 발행 : `/queue/<queue-name>` 형식의 문자열을 사용한다.
- AMQP 정의 큐에 메시지 발행하기
- 익스체인지에 메시지 발행하기
  - `/exchange/<exchange-name>/<routing-key>` 형식 사용. STOMP 에서 유연하게 AMQP 에 메시지를 발행하는데 도움된다.
- STOMP 토픽에 메시지 발행하기
- 임시 응답 큐 사용하기
- STOMP 를 통한 AMQP 메시지 속성
  - STOMP 메시지 헤더는 임의의 메시지 헤더값을 메시지 브로커에 전달하는데 사용한다.
  - reply-to 헤더는 발행자에 대한 응답 큐를 자동으로 생성한다.

### 3 메시지 구독하기

- STOPM 클라이언트는 MQTT 와 마찬가지로 소비자가 아닌 구독자로 간주한다.
- RabbitMQ 는 AMQP 메시지 브로커이므로 STOMP 플러그인에서는 STOMP 구독자를 RabbitMQ 큐에서 메시지를 전달받는 AMQP 소비자로 취급한다.
- STOMP 로 정의한 큐 구독하기
- AMQP 에 정의한 큐 구독하기
- 익스체인지 또는 토픽 구독하기

### 4 STOMP 플러그인 환경 설정

- rabbitmq.config 파일에서 진행

```erlang
[{rabbit, [{tcp_listeners, [5672]}]},
 {rabbit_stomp, [{tcp_listeners, [61613]}]}].
```

### 5 웹 브라우저에서 STOMP 사용하기

- RabbitMQ 에서는 웹 STOMP 플러그인을 번들로 제공한다.
- STOMP 프로토콜은 사람이 읽을 수 있는 텍스트 기반 스트리밍 프로토콜. 다른 프로토콜보다 간단하며 쉽게 구현할 수 있다.
- AMQP, STOMP 모두 단일 트랜잭션이고, 상태가 없는 메시지 발행에는 너무 많은 추가 비용을 지불한다.
  - 상태가 없으며 고성능인 웹 애플리케이션 statelessd 참고



## 3 HTTP 로 상태 없이 메시지 발행하기

- RabbitMQ 연결을 유지하지 않으며 메시지를 빠르게 발행해야 하는 환경에서는 AMQP, MQTT, STOMP 와 같은 상태 유지 프로토콜이 많은 비용을 치른다.
- 이런 프로토콜은 메시지 관련 작업 전에 연결 작업에 비용이 발생하므로 짧은 연결에는 적합하지 않다.
- statelessd 는 연결 상태 관리의 추가 부하 없이 클라이언트 애플리케이션이 고성능으로 메시지를 발행 가능한 HTTP 에서 AMQP 메시지의 발행을 목적으로 개발됐다.

### 1 statelessd 개발 배경

- 웹 요청으로 1~2회당 수십만개의 메시지 발행. RabbitMQ 와 연결돈 수십만
- HTTP와 AMQP 메시지 발행 게이트웨이인 statelessd 개발

### 2 statelessd 사용하기

- statelessd 요청은 HTTP POST 를 사용하고
- 발행할 메시지의 본문과 속성을 표준 form/encoded 키/값 쌍으로 전송한다.
- 유효한 statelessd 요청은 실제 메시지 본문과 표준 AMQP 메시지 속성이 추가되고 - (dash)는 _ (underscore)로 치환된다.

### 3 운영 아키텍처

- statelessd 는 RabbitMQ 와 동일한 서버에서 실행됨
- 서버의 각 CPU 코어에 대해 백엔드 프로세스가 실행되도록 구성된 파이썬 기반 데몬이다.
- 각 백엔드 프로세스는 자체 HTTP 포트를 통해 수신 대기한다.
- 이 프로세스는 통합돼있고 Nginx 와 같은 reverse proxy 서버를 사용해 단일포트에 프록시를 구성해서 서버당 초당 수십만개의 메시지를 처리하는 스케일 아웃 구조로 구성된다.

### 4 statelessd 로 메시지 발행하기



---

# 10 데이터베이스와 연결하기



- 데이터를 직렬화해서 메시지로 발행하는 간단한 소비자 애플리케이션은 이벤트와 데이터베이스 사이 다리 역할을 한다.
- 또는 소비자 애플리케이션 없이 influxDB 스토리지 익스체인지 플러그인을 사용해 RabbitMQ 에서 데이터베이스에 메시지를 자동으로 저장할 수 있다.
- 또는 데이터베이스가 RabbitMQ 에 직접 메시지를 발행할 수도 있다.



## 1 PostgreSQL pg_amqp 확장 모듈

### 1 pg_amqp 확장 모듈 설치하기

### 2 pg_amqp 확장 모듈 설정하기

- amqp.publish, amqp.disconnect 호출할 때 사용되는 broker_id 필드와 AMQP 연결에 대한 설정이 포함돼있다.

### 3 pg_amqp 로 메시지 발행하기

## 2 PosgreSQL 알림 수신하기

- pg_amqp 는 PostgreSQL 에서 직접 메시지를 발행하여 편리하고 빠른 방법을 제공하지만, RabbitMQ 와 PostgreSQL 이 강결합된다는 단점이 있다.
- 문제가 발생해서 RabbitMQ 클러스터를 사용할 수 없으면 PostgreSQL 서버에도 악영향을 줄 수 있다.
- 이를 위해 PostgreSQL LISTEN 익스체인지를 개발했다.

### 1 PostgreSQL LISTEN Exchange 설치하기

### 2 정책 기반 환경 설정

### 3 PostgreSQL LISTEN exchange 만들기

### 4 테스트 큐 생성하고 연결하기

### 5 NOTIFY로 알림 전송하기





## 3 메시지를 InfluxDB 에 저장하기

- InfluxDB 는 Go로 작성된 오픈소스 분산 시계열(time-series) 데이터베이스인데 리눅스와 OS X 시스템 모두에 설치하기 쉽다.
- 분석을 위한 시계열 데이터를 저장하는 매력적 시스템으로 쉬운 프로토콜로 데이터를 채울 수 있다. 저장된 데이터를 조회할 수 있는 내장 웹 기반 질의 인터페이스를 제공한다.
- Influx 스토리지 익스체인지에 전달되는 메시지는 InfluxDB 에 저장해야 하는지를 검사한다.
- 메시지 유형이 `application/json` 일 경우 메시지는 적절한 형식으로 변환되고 InfluxDB 이벤트 이름의 라우팅 키를 사용해서 저장된다.
- 또는 timestamp 가 지정되면 InfluxDB 이벤트 시간 열에 자동으로 지정된다.

### 1 InfluxDB 설치와 설정

### 2 InfluxDB 스토리지 익스체인지 설치하기

### 3 test exchange 설정하기

### 4 InfluxDB 스토리지 익스체인지 테스트하기

 