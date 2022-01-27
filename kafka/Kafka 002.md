# Kafka 002

# 카프카를 많이 사용하는 이유

- 링크드인 오픈소스 프로젝트
- 데이터 처리를 중앙집중화



## 장점

### 1 짧은 지연시간, 높은 처리량 (High throughput message capacity)

- 짧은 시간에 많은 데이터를 컨슈머까지 전달할 수 있다.
- 파티션 나누어, 여러 컨슈머에 병렬처리 가능

### 2 수평 확장성, 고가용성 (Scalability, Fault tolerant)

- 확장성이 뛰어나다. 신규 브로커 서버를 만들어 수평 확장이 가능하다.
- replica 로 복제된 데이터가 안전하게 보관되어 있으므로 장애 발생시 복구하여 처리할 수 있다.

### 3 로그가 삭제되지 않음 (Undeleted log)

- 컨슈머가 데이터를 가져가도, 토픽에서 사라지지 않는다.
- 컨슈머의 그룹 id 만 다르다면 동일한 데이터도 각 컨슈머그룹에서 다르게 처리할 수 있다.

<br />

## 빅데이터 처리 핵심

- 안정적 운영과 빠른 확장성
- 실시간 데이터처리, 데이터 파이프라 우수
- 아파치 카프카 생태계 발전
  - 기본개념 프로듀서, 컨슈머
  - 카프카 스트림, 커텍터, ksqldb, avro, rest proxy 지속적 개발, 발전
  - 3rd library 연동 지원 : fluented, telegraf



<br />

# 카프카 실행

Mac 에서 실행해보기

```shell
brew install kafka

# 의존관계인 zookeeper 도 설치된다.
```



주키퍼, 카프카 실행하기

```shell
brew services start zookeeper
brew services start kafka
```



카프카를 다운로드하면 기본적으로 테스트용 script 가 들어있다.

스크립트가 있는 경로로 들어가보자

```shell
brew info kafka
cd /usr/local/Cellar/kafka/3.0.0

# 토픽 생성
bin ./kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 -partitions 1 --topic devrdijin

# 프로듀싱
bin ./kafka-console-producer --broker-list localhost:9092 --topic devrdijin

# 컨슈밍
bin ./kafka-console-consumer --bootstrap-server localhost:9092 --topic devrdijin --from-begining
```



<br />

# 카프카 Consumer Lags

- 프로듀서가 마지막으로 넣은 offset 과 컨슈머가 마지막으로 읽은 offset 과의 차이
- 주로 컨슈머 상태를 볼 때 사용한다.
- 여러 파티션 또는 여러 컨슈머 그룹이 있어서 여러개의 lags 가 있을 때, 높은 값을 `records-lag-max` 라고 부른다.

![](https://i.ibb.co/7Xd47Kv/2022-01-26-12-32-56.png)

<br />

# 카프카 Consumer Lag 모니터링 필수요소

- Consumer log matric → influxdb, elasticsearch → Grafana 가능
- 컨슈머 로직단에서 lag 를 수집하는 것은 컨슈머 상태에 의존성이 걸린다.
- 그래서 아파치 카프카는 컨슈머 lags 를 위한 모니터링 도구로 `Burrow` 를 개발했다.
  - Golang 오픈소스
  - 멀티 카프카 클러스터 지원
    - 대부분은 카프카 클러스터가 2개 이상이다. 한 개의 Burrow 와 연동해서 사용할 수 있다.
  - Sliding Window 를 통한 Consumer 의 status 확인
    - Consumer status : `ERROR` , `WARNING`, `OK`
    - 데이터 양이 많아지고 offset 이 증가하면 `WARNING`, 많아지고 있는데 컨슈머가 데이터를 가져가지 않으면 `ERROR`
  - HTTP API 제공





<br />























