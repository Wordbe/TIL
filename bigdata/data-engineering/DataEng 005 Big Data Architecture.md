# DataEng 005 Big Data Architecture



1. Big Data Platforms
2. Data Ingestion and Stroage
3. Data Processing
4. Data Analysis
5. Data Modeling
6. Data Visualization





## 1. Big Data Platforms



### Cloudera Enterpise

![](https://i.ibb.co/2ngGsxY/2021-07-09-2-24-39.pnghttps://i.ibb.co/2ngGsxY/2021-07-09-2-24-39.png)

![](https://i.ibb.co/QmhvdJC/2021-07-09-2-25-13.png)



### Hadoop vs Spark

| Hadop                    | Spark                                    |
| ------------------------ | ---------------------------------------- |
| 기본 데이터 처리 엔진    | 데이터 분석 엔진                         |
| 대용량 데이터 배치 처리  | 실시간 이벤트로부터 스트리밍 데이터 처리 |
| High Latency 연산        | Low Latency 연산                         |
| 배치모드에서 데이터 처리 | 인터렉티브한 처리가능                    |
| 보안성 우수              | 보안성 낮음                              |



### Cloud Based Platforms - AWS

![](https://i.ibb.co/f9dwJ06/2021-07-09-2-30-14.png)



<br />

## 2. Storage and Ingestion

Buckets, Objects, Keys, Regions, S3 Consistency Model



### Objects

- Objects 는 S3 에 저장되는 기본 엔티티
- object data, metadata 로 구성



### Buckets

- 버킷은 S3 에 저장되는 objects 를 위한 컨테이너
- 계정으로 신원구별
- 접근 통제로 사용
- 이름은 파티션내에서 고유하다.
  - 파티션은 Regions 그룹이다.
  - AWS 는 세 개의 파티션이 있다.
    - aws (standard)
    - aws-cn (china)
    - aws-us-gov (AWS Govcloud in US Regions)



### Keys

- 버킷에서 객체를 식별하는 유니크한 식별자

```shell
# Virtaul-hosted-style 접근
https://bucketname.s3.region-name-2.amazonaws.com/keyname

# Path-style 접근
https://s3.region-name.amazonaws.com/bucket-name/key-name
```



### Regions

- 지리적 AWS Region 을 선택 가능
- 지연시간과 비용을 최적화

<br />

---

### S3 Glacier

- Cold Storage
- S3 의 저비용 버전
- 데이터 아카이빙과 장시간 백업에 좋다.
- 보안과 내구성은 구성되지 않는다.



---

### Ingestion

- Flume
- Sqoop
- Kafka
- NiFi, MiNiFi
- StreamSets



### Kafka

- publish/subscribe 메시징 시스템
- **`distributed commit log`** 라고 묘사된다.
  - 트랜잭션의 영속적인 레코드처럼 (commit log) 카프카에 저장된 데이터도 영속적으로 저장된다.
  - 여기에 추가로 시스템 안에서 데이터가 분산될 수 있다.

> 장점
>
> 1. Scalable - 여러 노드를 지원하는 분산 시스템이다.
> 2. Fault-tolerant - 데이터가 디스크에 영속화되고, 클러스터 안에서 복제될 수 있다. 자동 복원되고, 고가용성이다.
> 3. Very Fast
> 4. Flexible - producer 와 consumer 가 decoupled 되어 있다. 특별한 목적을 위한(ad-hoc) consumer 또는 batch consumers 를 지원한다.



#### Messages

- 메시지들은 topic 으로 조직화된다.
  - topic 은 파티션될 수 있다.
  - 파티션에서 순서가 보장되어 있다.
- 메시지는 변하는 바이트 배열 이다.
  - key, value, timestamp 를 가진 레코드처럼 생각
- 효율성을 위해 메시지는 배치로 쓰여진다.
- 카프카는 메시지 보유를 결정하기 위해 두 가지 파라미터 사용
  - 설정가능한 보유 기간 `log.retension.{ms, minutes, hours}`
  - 설정가능한 크기 제한 `log.retension.bytes`



#### Topics

- 토픽은 메시지가 발행된 카테고리나 피드이름이다.
- 토픽은 항상 multi-subscriber 이다.
- 토픽은 파티션으로 나누어진다. 순서가 있고, imuutable 한 레코드의 시퀀스이다. 계속 추가될 수 있다. (structured commit log)
- offset : 파티션의 레코드는 순차적 아이디 숫자가 있다. 파티션에서 각각의 레코드를 구분할 수 있다.
- 토픽은 파티션 단위로 복제된다.
- 토픽 안의 각 파티션은 1개의 리더와 0개 이상의 복제본이 있다.
- ISR (In-Sync Replicas) : 복제본들은 in-sync 로 여겨진다. 주키퍼로 서로 소통가능하다.



#### Topic Replication

- 영속성 (Durability) 는 producer configuration 으로 설정한다.
- `request.required.acks`
  - 0 : producer 는 ack 를 기다리지 않는다.
  - 1 : producer 는 리더 복제본이 데이터를 받은 후에 ack를 얻는다.
  - -1 : producer 는 모든 ISR 이 데이터를 받은 후에 ack 를 얻는다.



#### Distribution

![](https://i.ibb.co/svJ9zts/image.png)

#### Producers

- 생산자는 디스크에 영속화할 메시지를 푸쉬한다.
  - 보통 이 프로그램은 개발되어야 한다.
- 생산자는 카프카의 특정 토픽에게 메시지를 쓴다.
- 생산자는 소비자가 아니라 카프카와 소통한다.



#### Consumers

- 소비자는 consumer group 이름으로 자신들을 레이블한다.
- 토픽에 발행된 각 레코드는 구독중인 컨슈머 그룹의 <u>하나의</u> 컨슈머에게 전달된다.
- 컨슈머 인스턴스는 별도의 프로세스나 머신이 될 수 있다.
- 모든 컨슈머 인스턴스가 모두 다른 컨슈머 그룹이라면, 각 레코든ㄴ 모든 컨슈머 프로세스에게 broadcast 된다.

<br />

### Kafka Architecture

- 카프카 클러스터는 카프카 브로커 데몬을 실행하는 한개이상의 서버로 구성되어 있다.
- 카프카는 coordination 을 위해 zookeeper 서비스에 의존한다.
- 브로커는 카프카 클러스터에서 메인프로세스를 대변한다.
- 브로커는 디스크에 토픽 파티션을 저장한다.
- 하나의 브로커는 1000개 토픽 파티션을 호스트할 수 있다.
- 하나의 머신은 여러 브로커 프로세스를 실행할 수 있다.



#### Kafka CLI

- kafka-topics

```shell
# 토픽 생성
$ kafka-topics --create \
	--zookeeper zkhost1:2181,zkhost2:2181,zkhost3:2181 \
	--replication-factor 3 \
	--partitions 5 \
	--topic myTopic
	
# 가용한 토픽 보기
$ kafka-topics --list \
	--zookeeper zkhost1:2181,zkhost2:2181,zkhost3:2181
```

- kafka-console-producer

```shell
$ cat sometext.txt | kafka-console-producer \
	--broker-list brokerhost1:9092,brokerhost2:9093 \
	--topic myTopic
```

- kafka-console-consumer

```shell
$ kafka-console-consumer \
--zookeeper zkhost1:2181, zkhost2:2181, zkhost3:2181 \ 
--topic myTopic \
--from-beginning
```





---

## 3. Data Processing

### Batch Processing

- Big Data : Hadoop MapReduce (best)
- Time Scheduling : period of time 저장
- Batch Job



### Processing Workflows (Oozie, Airflow)

- Oozie : 하둡 잡을 관리하기 위한 workflow 및 coordination 서비스이다.
- Airflow
  - python 으로 workflows 생성
  - 하둡 뿐만 아니라 AWS, Azure, GCP 등 플러그-앤-플레이 제공한다.
  - 쉬운 User Interface
  - 오픈 소스



### Real-Time Stream Processing

- Spark Streaming : 실시간 스트림 데이터 처리 제공
- core spark 익스텐션
- n초당 데이터 스트림을 배치로 분할한다. : **DStream (Discretized Stream)**
- RDD 로써 스파크안에서 각 배치를 처리한다.
- 배치에서 RDD 연산 결과를 return
- `StreamingContext`

```python
 def printTop5(r,t):
  print "Top users @",t
  for count,user in r.take(5):
  	print "User:",user,"("+str(count)+")"

sc = SparkContext()
ssc = StreamingContext(sc, Seconds(2)) # Straming Data
mystream = ssc.socketTextStream(hostname, post) # get DStream(Discretized Stream)
userreqs = mystream.map(lambda line: (line.split('')[2], 1))
	.reduceByKey(lambda v1, v2: v1 + v2)

userreqs.pprint()

sortedreqs = userreqs \
	.map(lambda (k, v): (v, k)) \
  .transform(lambda rdd: rdd.sortByKey(False))
  
sortedreqs.foreachRDD(lambda time, rdd: printTop5(rdd, time))
  
ssc.start() # 모든 DStreams 를 시작한다.
ssc.awaitTermination() # 메인쓰레드가 종료되기 전까지 모든 백그라운드 쓰레드가 완료되기를 기다린다.
```



### Dstream Data Sources

- DStream 은 주어진 인풋 시스템 (Unix Socket) 새롭게 정의한다.

```python
ssc.socketTextStream(hostname, post)
```



- Spark Streaming 은 interacitve use 보다는 batch application 용도로 만들어졌다.

  ```shell
  $ spark-shell --master yarn
  $ pyspark --master yarn
  ```

  



### Processing Mutliple Batches

- DStream 은 일련의 배치 데이터로 구성되어있다. 각 배치는 RDD 이다.
- Slice : 배치 콜렉션 연산을 허용
- State : 누적 연산을 수행할 수 있도록 허용
- Windows : 슬라이딩 시간 기간에 걸쳐 데이터 aggregate 를 허용함

Time Slicing

- Dstream.slice(fromTime, toTime)
- StreamingContext.remember(duration)
- updateStateByKeyfunction