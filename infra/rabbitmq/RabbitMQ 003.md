# RabbitMQ 003



# 6 Exchange Routing 을 통한 메시지 패턴

- RabbitMQ 의 큰 강점은 발행자 애플리케이션이 제공한 라우팅 정보를 기반으로 메시지를 서로 다른 큐로 유연하게 라우팅할 수 있다는 점이다



## 1 Direct Exchange

- **라우팅 키의 값에 따라 연결된 큐에 라우팅하며 문자열 일치 매칭만 수행한다.**
- 메시지 발생시 사용하는 라우팅 키와 동일한 키로 익스체인지에 바인딩된 모든 큐에 메시지가 전달된다.
- RabbitMQ 는 다이렉트 익스체인지 바인딩의 라우팅키를 평가할 때 문자열이 동일한지만 평가한다.
- 익스체인지 선언
- RPC 작업자 생성
- RPC 발행자 코드 작성

## 2 Fanout Exchange 를 사용한 메시지 브로드캐스팅

- **메시지에 설정한 라우팅 키에 관계없이 연결된 모든 큐에 전달한다.**
- 발행된 모든 메시지는 팬아웃 익스체인지에 연결된 모든 큐에 전달된다.
- `exchange_type=fanout`



## 3 Topic Exchange 로 메세지를 선택적으로 라우팅하기

- **라우팅 키 패턴 매칭 및 문자열 동일 비교를 사용해 모든 연결된 큐에 전달한다.**
- 라우팅 키에 기간 구분형식의 와일드카드 기반 패턴 매칭을 사용해서 큐에 바인딩할 수 있다.
- {메시지 최상위 분류}.{애플리케이션의 메시지 유형}.{메시지의 추가적인 데이터분류 형식}
  - image.new.profile

## 4 Header Exchange 로 선택적 라우팅

- 메시지 속성 headers 테이블의 값을 기반으로 메시지를 연결된 큐에 전달한다.
- 추가적 계산 때문에 다른 익스체인지보다 상당히 느리다고 알려져 있다.

## 5 익스체인지 성능 벤치마크하기



## 6 익스체인지 간 라우팅하기

- AMQP 스펙엔 없지만 RabbitMQ 에는 익스체인지 조합으로 메시지를 라우팅할 수 있다.
- 큐 바인딩과 유사. 큐를 익스체인지에 연결하는 대신 Exchange.Bind RPC 메소드로 익스체인지를 다른 익스체인지를 연결한다.

## 7 Consistent Hashing Exchange

- 팬아웃 익스체인지와 유사하지만, 라우팅 키 또는 메시지 속성 헤더 값의 해시 값을 기반으로 메시지를 분배한다.
- RabbitMQ 가 배포하는 플러그인
- 연결된 큐에 메시지를 분배한다.
- 메시지를 발행할 큐의 로드를 조정하는 데 사용한다.
- 클러스터 내부에 다른 물리적 서버에 있는 큐 혹은 단일 사용자가 연결된 큐에 메시지를 분배할 수 있다. 단일 큐를 사용하는 여러 사용자에게 메세지를 전달하는 경우보다 처리량이 높다.
- consistent hashing exchange 로 미들웨이를 직접 작성하지 안호도 데이터를 샤딩할 수 있다.
- memcached 혹은 Riak, Cassandra, PostgreSQL(PL/Proxy 사용시)과 같은 분산 데이터베이스 시스템에서 사용된다.



---

# 2부 데이터 센터 또는 클라우드에서 RabbitMQ 운영하기



# 7 클러스터를 이용한 RabbitMQ 확장

- 메시지 브로커인 RabbitMQ 는 독립적으로 실행가능한 애플리케이션이다.

## 1 클러스터

- RabbitMQ 클러스터는 둘 이상 서버를 하나의 RabbitMQ 처럼 사용할 수 있도록 한다.
- 익스체인지, 큐, 바인딩, 사용자, 가상 호스트, 정책 등 런타임 상태의 모든 노드에서 사용할 수 있다.

### 1 클러스터 및 관리자 UI

- RabbitMQ 관리자 UI 는 모든 작업들이 클러스터에서도 단일 노드와 동일하게 수행되도록 디자인 돼있다.

### 2 클러스터 노드 유형

- 디스크 노드
  - 클러스터의 런타임 상태를 RAM 과 디스크에 저장한다.
  - 디스크 노드와 연결된 통계 노드 : 통계 및 상태 데이터 수집한다. 
  - 기본 디스크 노드, 보조 디스크 노드로 사용 가능
- RAM 노드
  - 런타임 상태 정보를 메모리 데이터베이스에만 저장한다.
  - 관리자 기능이 없다.

### 3 클러스터 및 큐 동작

- Queue.Declare RPC 요청이 전송된 클러스터 노드에 큐가 생성된다.
- 발행자 고려하기
  - (빠름) 보장 없음 / 실패 통보 / 발행자 확인 / 대체 익스체인지 / HA 큐 / 트랜잭션 / 트랜잭션 HA 큐 (느림)
  - 오른쪽으로 갈수록 클러스터의 노드 간 통신량이 증가한다.
- 노드 특정 소비자
  - 소비자를 큐가 있는 노드에 연결하면 메시지 처리량이 향상된다.



## 2 클러스터 설정

- RabbitMQ 클러스터는 두 개 이상의 노드가 필요하다.

### 1 가상 머신 설정

### 2 클러스터에 노드 추가

- rabbitmq.config 환경 파일 편집

- 또는 rabbitmqctl 명령을 사용해 클러스터에 노드를 추가하거나 제거

- 얼랭 쿠키 : 다중 노드 통신의 보안을 위한 비밀 공유 파일 (`/var/lib/rabbitmq/.erlang.cookie`)

- 수동으로 클러스터 생성하기

  ```shell
  rabbitmqctl stop_app
  rabbitmqctl reset
  rabbitmqctl join_cluster rabbit@primary
  rabbitmqctl start_app
  
  # http://localhost:15672 관리자 UI 에 접속하면 두 개의 노드가 실행 중인 RabbitMQ 클러스터가 구성됐다.
  ```

- 환경 파일 기반 클러스터

  /etc/rabbitmq.config

  ```shell
  [{rabbit,
  	[{cluster_nodes, {['rabbit@primary', 'rabbit@secondary'], disc}}]
  }],
  
  # 혹은 ram 노드로 바꾸려면 disc 대신 ram 으로 수정
  ```

  

---

# 8 클러스터 간 메시지 발행

- 데이터 센터 간 메시지를 전달하거나 RabbitMQ 를 업그레이드하거나 서로 다른 RabbitMQ 클러스터 간에 투명하게 메시지를 전달하는 경우 Federation 플러그인을 추천한다.
- 메시지는 업스트림 노드에서 다운스트림 노드의 익스체인지 또는 큐로 전송된다.

## 1 Federation Exchange, Federation Queue

### 1 페더레이션 익스체인지

- **업스트림 노드의 익스체인지에 발행된 메세지를 다운스트림 노드의 동일한 이름의 익스체인지에 투명하게 발행할 수 있다.**
- RabbitMQ의 기본 제공 클러스터는 네트워크 파티션이 거의 일어나지 않고 대기 시간이 짧은 LAN 네트워크가 필요하다.
- 인터넷과 같이 대기 시간이 긴 네트워크를 통해 연결할 때는 네트워크 파티션이 흔하게 발생한다.
- 이 때 페더레이션 플러그인을 사용할 수 있다.
  - 업스트림 페더레이션 플러그인은 메시지에 대해 독점적인 자동 관리 큐를 만들고 연결한다.
  - 다운스트림의 페더레이션 플러그인은 소비자 및 발행자와 유사하게 동작하며, 업스트림 노드에서 메시지를 소비하고 실행 중인 노드에 메시지를 다시 발행한다.

### 2 페더레이션 큐

- 큐의 용량을 수평 확장할 수 있게 도와준다.
- 메시지 발행자는 업스트림 노드 또는 클러스터를 사용하고 메시지는 모든 다운스트림 노드의 동일한 이름의 큐로 분산된다.



## 2 RabbitMQ 가상 머신 만들기

- Amazon EC2 에서 VM 설정을 위해 첫 번째 인스턴스를 생성하고, RabbitMQ 를 설치한다.
- 인스턴스 이미지를 만들면 테스트를 위한 하나 이상의 서버 복사본을 만들 수 있다.

### 1 첫 번째 인스턴스 생성하기

- ubuntu

- AMI

- Free Tier Eligible - t2.micro

- 방화벽 규칙 추가

- 키 페어를 로컬 컴퓨터에 저장 - EC2 인스턴스에 SSH 접속을 위해 사용

- EC2 인스턴스 접속

  ```shell
  ssh -i ~/rabbitmq-in-depth.pem.txt ubuntu@[public IP]
  sudo su -
  ```

- 얼랭 및 RabbitMQ 설치

  - 우분투에서 외부 저장소를 사용하려면 패키지 서명 키와 외부 저장소의 구성을 추가해야 한다.

  ```shell
  # RabitMQ
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 6B73A36E6026DFCA
  
  # Erlang solutions
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv D208507CA14F4FCA
  
  apt-get update
  apt-get install -y rabbitmq-server
  
  # federation 기능 설정
  rabbitmq-plugins enable rabbitmq_management rabbitmq_federation rabbitmq_federaiton_management
  
  # 기본 guest 사용자가 localhost 외에 IP 에서 로그인할 수 있도록 설정
  vi /etc/rabbitmq/rabbitmq.config
  [{rabbit, [{loopback_users, []}]}].
  
  service rabbitmq-server restart
  
  rabbitmqctl set_cluster_name cluster-a
  ```

### 2 EC2 인스턴스 복제

- Create Image
- http://[public IP]:15672 웹 브라우저로 열어 관리자 UI 에 접속
- 클러스터 이름을 cluster-b 로 변경

### 3 업스트림에 접속하기

- Federation Upstreams 정의하기
  - 새 업스트림 연결 추가 - AMQP URI 
  - Name : cluster-a
  - URI : amqp://54.84.218.56
- 정책 정의
  - Policies
  - cluster-a 노드에서 익스체인지 선언
  - cluster-b 노드에서도 익스체인지 선언
  - cluster-b 노드가 업스트림 cluster-a 에 연결
  - cluster-b 에 test 큐 정의
  - demo 바인딩 키를 사용해 테스트 익스체인지에 연결한다. → cluster-b 에서 바인딩이 설정되고 cluster-a 에서 test 익스체인지에 대한 메시지 Federation 이 설정된다.
  - Publish Message 로 페이로드 필드에 원하는 내용을 담아 테스트해본다.
  - cluster-b 에 접속 후 Get Messages 를 클릭하여 확인
- 업스트림 집합 활용
- 리던던시 제공
  - 다운스트림 노드가 클러스터의 모든 노드에 연결될 수 있다.
  - 클러스터의 노드 1이 다운되더라도, 클러스터 노드 2를 통해 메시지를 수신할 수 있다.
- 지리적으로 분산된 애플리케이션
- 업스트림 집합 만들기

### 4 양방향 페더레이션 익스체인지

- 업스트림의 max-hops 로 조정. 기본값 1
- 발행된 메시지는 다운스트림에 전달되었다가 다시 업스트림으로 발행된다.
- 양방향 모드 페더레이션은 결함 내성 기법의 다중 데이터센터 애플리케이션 구조를 만드는데 적합하다.

### 5 클러스터 업그레이드를 위한 Federation

- 클러스터 크기가 큰 경우 한 노드의 트래픽 유입을 제한하고, 클러스터에서 노드를 제거하고 업그레이드 할 수 있다.

