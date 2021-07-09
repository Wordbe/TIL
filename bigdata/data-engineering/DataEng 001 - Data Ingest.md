# Data Ingest



- Big Data Platform
- Data Collection
  - HDFS, Sqoop, Flume, Kafka
- Data Storage Engine (NoSQL)
  - HBase, Cassandra, MongoDB



## Big Data  Plaform

### Processing Step

- 빅데이터 수집/저장 : 
  - Ingest Layer : Sqoop, Flume, Kafka,StreamSets, NiFi
  - Storage Layer (Data Lake) : HDFS, NoSQL, Kudu, In-Memory DB, RDBMS
- 빅데이터 전처리 : 
  - Transform Layer (ETL) : Spark, Hive, Pig, Apache MR
- 빅데이터 분석 :
  - Analysis Layer
    - Speed Layder (실시간) : Spark Streaming
    - Batch Layer (배치) : Hive, Spark SQL, 대화형 쿼리(Impala)
  - Presentation Layer : 
    - ELK, Qlik, Tableau, Superset
- 인공지능 분석 플랫폼 : 
  - AI Layer : Spark (ML, MLlib
  - Inference Layer :  TensorFlow, Spark ML



## Flume

- 스트리밍 데이터의 수집, aggregation 을 위한 고성능 시스템
- 분산된, 신뢰성있는, 가용한 시스템
- 외부 데이터 → 에이전트 [ So(Source) → channel → Si(Sink) ] → 외부 저장소



## Kafka

- 발행/구독 메시징 시스템 (consumer 와 producer 를 분리(decoupling))



## Spark

- 대용량 데이터 처리의 빠르고 일반적 최적화
- 스파크가 제공하는 SQL, Streaming, MLlib, GraphX 등 라이브러리를 Java, Scala, Python, R, SQL 등 언어를 사용하여 분산처리 애플리케이션을 생성할 수 있다.



## Hive

- 배치 데이터 준비 / ETL
- 데이터 분석의 배치 처리를 위한 사용하기 쉬운 최고의 툴
- pig



## Impala

- 방대한 데이터를 위한 고성능 SQL 엔진
- 밀리세컨드 단위로 측정되는 쿼리 지연시간
- **MPP** :  Massively Parallel Processing (대용량 병렬 처리)



예시)

Low-latency(낮은 지연시간) 분석 아키텍처

- Kafka → Spark Streaming → Kudu → Impala (Spark SQL) → 화면

High-Throughput(높은 처리량) 분석 아키텍처

- Kafka → HDFS → Hive → 화면

<br />

---

## Hadoop

- 대용량 데이터의 분산 저장, 분산 처리를 위한 오픈소스 프레임 워크
- Core Hadoop
  - HDFS : 하둡 파일 시스템
    - 페타바이트 규모로 처리
    - SPOF(단일 장애) 없는 HA (고가용성) 지원
  - YARN/MR : 분산된 서버의 CPU/메모리 자원을 활용한 분산처리
- Hadoop Ecosystem
  - 여러 데이터 저장, 실행 엔진, 데이터 처리 (Spark, HBae, Hive)

<br />

Hadoop Cluster 안에 Hadoop Daemons

- Computation Layer : 리소스 매니저 - 노드 매니저 1, 2, 3
- Storage Layer : 네임 노드 - 데이터노드 1, 2, 3





### 하둡 특징

- 분산 병렬 처리
- 소프트웨어가 결함 허용 처리 (Fault tolerance)
- Scalability - 수평 확장성 제공(scale out)
- New eco system 과 지속적 발전
  - Spark, Sentry, Kafka



### Hadoop 클러스터

- **하둡 데몬은 노드에서 실행된다.** 
- MapReduce , Spark 는 데이터를 연산한다.
- 수백, 수천의 서버에 각각에 클러스터를 유지한다.



### Hadoop Component

1. Storage (HDFS, S3, Kudu)
2. Processing (Spark, MapReduce)
3. Resource Management (YARN, Mesos, Spark Standalone)



### Role Type

1. 마스터노드 (Master Node) : 작업을 지시하고 관리한다.
2. 작업노드 (Slave nodes/Worke nodes) : 실제 일을 수행한다.



### 배포 모드

1. LocalJobRunner mode

   단일 java 가상 머신

   - 데몬이 실행되지 않는다.
   - 파일 시스템은 HDFS 없이 로컬 시스템 사용
   - 개발자들이 사용하는 모드 - MapReduce 테스트할 때

2. Pseudo-distributed mode

   단일 서버에서 클러스터를 시뮬레이트한다.

   - 데이터 저장은 HDFS 파일 시스템 사용
   - 모든 데몬들은 하나의 로컬 서버에서 실행된다.
   - 프로그램 운영 전 기능 확인 및 테스트로 사용

3. Fully-distributed mode

   - Hadoop 시스템들이 클러스터의 각 노드에서 운영
   - HDFS는 데이터를 저장하는데 여러 개의 노드 사용
   - 실제 하둡 클러스터 운영시
     - NameNode, ResourceManager, JobHistoryServer **daemons** 은 별도의 서버로 운영하는 것이 효율적 이다.
     - small clusters(20 노드 이하) 의 경우 같은 서버에 여러 데몬들이 함께 수행 가능하다.



### Hadoop Stack

### Hadoop Cluster

- Cluster, Service, Role Type, Role Group, Instance

### Hadoop Clients

- Hadoop Cluster 내 서비스를 이용하기 위한 도구
- 하둡 컴포넌트와 연결을 위해 Hadoop API, configuration 정의 필요
  - 커맨드 라인 하둡 클라이언트
  - 서버 데몬 하둡 클라이언트 (Hue)
    - Hue : Hadoop User Interface `http://<hue_server>:8888`
    - 기능 Querying, Browsing, Scheduling



<br />

---

## Sqoop

스쿱은 RDB - Hadoop 간 import/export 를 위한 오픈소스 (Cloudera 개발, CDH에 포함되어 CM에 의해 관리)

다양한 Hadoop file types 지원

- Hive tables
- Avro, Parquet, Text, ORC files
- HBase tables
- Accumulo tables

RDBS 연결위해 JDBC, Direct mode 활용

Sqoop 1 : Client-based Mdodel

- Sqoop을 사용할 Node에 개별적으로 Sqoop, Connector, dirver 설치한다.
- 메인 RDBMS 에 대한 Custom Connector를 제공한다. (Direct mode)



### import

```shell
sqoop import \
--table sometable \
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword
```



### 저장할 파일 위치 지정해주기 in HDFS

```shell
sqoop import \
--table sometable \
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword \
--target-dir /som/path/to/file
```



### 기본 디렉토리 위치 정하기

```shell
sqoop import-all-table \ 
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword \
--warehouse-dir /some/directory/path
```

sql 처럼 명령어 가능

```shell
sqoop import \
--table sometable \
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword \
--columns "fname, lname, address" \
--where " state='CA'"
```



### 구분자 지정가능

**스쿱은 기본은 컴마 구분자의 텍스트 파일로 저장한다.** 

```shell
sqoop import \
--table sometable \
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword \
--fields-terminated-by "\t"
```



### 압축 옵션

기본 압축은 gzip

```shell
sqoop import \
--table sometable \
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword \
--compression-codec \
org.apache.hadoop.io.compress.SnappyCodec
```



### 데이터 포매 옵션

기본은 텍스트파일

```shell
sqoop import \
--table sometable \
--connect jdbc:mysql://dbhost/somedatabase \
--username somename --password somepassword \
--as-parquetfile
```

- `--as-avrodatafile`
- `--as-sequencefile`
- `--as-texfile`(default)
- `--as-parquetfile`







## Sqoop Architecture

1. sqoop import 간단한 스크립트 작성
2. simple MapReduce jobs → Hadoop Cluster
3. Data import / export

<br />

---

```shell
$ sqoop import \
--username username --password password \
--connect  jdbc:mysql://dbdomain.example.com/database --table table \
--split-by col1 \
--where "col1 > 10"
```

- `--split-by` : Mapper 를 통해 병렬적으로 import 할 때 기준이 되는 컬럼 지정, PK 가 있으면 별도로 지정하지 않아도 된다.



```shell
$ sqoop import \
--username username --password password \
--connect  jdbc:mysql://localhost:3306/market --table table \
--split-by col1 \
--query "SELECT * FROM products WHERE id >= 4 AND $CONDITIONS" \
--target-dir /user/cloudera/products
--hive-import
--create-hive-table
--hive-table default.products \
-m 3
```

- `--target-dir` : HDFS 저장 위치 
- hive table 저장 위치
  - database : market, table: products
  - 이미 products 테이블이 존재하면 임포트하지 못하도록
- mapper 수 3



### export

RDBMS → HDFS

```shell
$ sqoop export \
--connect jdbc:mysql://dbhost/somedatabase \
--usrname username --password somepassword \
--export-dir /path/to/files \
--update-mode allowinsert \
--table sometable
```

<br />

---

## Flume



### 일반적인 소스데이터

- Syslog
- Netcat : TCP
- Exec
- Spooldir : 로컬 디렉토리에 명시된 파일로부터 이벤트 추출
- HTTP Source : HTTP 요청으로부터 메시지 받음
- Kafka : kafka topic 으로 부터 메시지 받음

Agent 안에는 Source - Channel - Sink,

중간에 Channel 은 Transactional 하다.

<br />

### 이미 있는 Built-in channel

- memory channel : RAM
- file channel : local disk
- JDBC channel
- Kafka channel



Scalibility, Extensibility 



### Flume Agent 시작

```shell
$ sudo flume-ng agent \
--conf /etc/flume-ng/conf \
--conf-file /path/pto/flume.conf \
--name agent1 \
--Dflume.root.logger=INFO,console
```

<br />

---

## Kafka

기존의 복잡한 발행/구독 시스템을 개선하고자 한 publish-subscribe 메시징 시스템

- 분산 커밋 로그 (distributed commit log)
  - 카프카에 저장된 데이터는 안전하게, 순서대로 저장된다. deterministically 하게 읽을 수 있다.
- Scalable
  - 여러 노드를 지원하는 분산 시스템
- Fault-Tolterant
  - 디스크에 데이터가 저장되어 클러스터 안에서 복제될 수 있다.
  - 자동 복원된다.
  - 고가용성
- Very Fast 
  - 초당 수십만 메시지
  - 밀리세컨드 안에 데이터 전달된다.
- Flexible
  - 메시지의 producers 와 consumers 는 decoupled 되어 있다.
  - 배치 컨슈머 뿐만 아니라 ad-hoc 컨슈머도 지원한다.



### 기본

1. 메시지가 topic 에 만들어진다.
2. producers 는 메시지를 push 한다.
3. consumers 는 메시지를 pull 한다.
4. Kafka는 클러스터에서 실행된다.
5. 클러스터 안의 노드는 brokers 이다.



### Messages

- 메시지는 토픽으로 조직된다.
  - 토픽은 partition 가능하다.
  - 순서는 partition 안에서만 가능하다.
- 메시지는 사이즈가 변화하는 바이트 배열이다.
  - DB 레코드와 비슷하다.
  - 각 레코드는 key, value, timestamp 가진다.
- 메시지 사이즈는 제한은 없지만, KB 정도가 적당하다.
- 효율성을 위해 배치안에서 메시지가 읽힌다. (network, setup 비용 삭감)
- producer 와 consumer의 효율적인 decoupling 을 위해 일관성있는 데이터 포맷은 중요하다. (JSON, XML)
- Kafka 두 개의 파라미터
  1. 유지 기간 (log.retension.{ms, minutes, hours})
  2. 사이즈 제한 (log.retention.bytes)

<br />

### Topics

- 토픽은 메시지가 발행되는 곳의 피드 이름이나 카테고리이다.
- 토픽은 항상 여러 구독자다.
- 토픽은 **파티션**으로 분리된다. orderd + immutable sequnce of record
- 파티션 안의 레코드는 순차적인 id 숫자를 가진다. (offset)
- offsets 은 파티션안에서 각 레코드를 유니크하게 구분할 수 있다.



### Topics Replication

- 토픽은 복제되어야 한다.
- **복제 단위는 파티션이다.**
- 토픽 안의 각 파티션은 한 개의 리더(leader)와 0이상의 복제(replicas)를 가지고 있다.
- in-sync replicas 의 그룹을 를 ISR 이라 부른다.
- 내구성 (Durability) 는 프로듀서 configuration 으로 설정된다.
  - 0 : 프로듀서가 ack 를 기다리지 않는다.
  - 1 : 리더 복제가 데이터를 받은 후 프로듀서가 ack 를 받는다.
  - -1 : 모든 ISR 가 데이터를 받은 후 프로듀서가 ack 를 받는다.



### Distribution

- log 의 파티션은 브로커들에게 분산된다.
- 각 브로커는 데이터를 다루고, 파티션의 공유를 요청한다.
- 파티션의 리더는 모든 read, wirte 요청을 다룬다. 팔로워는 수동적으로 리더를 복제한다.
- 리더가 죽으면, 팔로워 중 한명이 자동으로 리더가 된다.
- 각 브로커는 어떤 파티션에서 팔로워처럼 행동한다. 

Topic - Broker A, Broker B, Broker C

Broker - Partion 1 (Leader), Partion 2 (Follower), Partion 3 (Follower)

<br />

1. 프로듀서가 메시지를 보내면, 디스크에 저장한다. (Storage System)
2. 토픽에 발행된 안 레코드는 각 구독 컨슈머 그룹안의 한 컨슈머 인스턴스에게 전달된다.

<br />

## Kafka Usage

- Messaging
- Website Activity Tracking
- Metrics
- Logging and Log aggregation
- Stream Processing ( real time )
- Event Sourcing
- Commit log

## Kafka - Messaging System

- Queueing 처럼 프로세싱은 컨슈머 그룹 안의 컨슈머 프로세스에게 나뉠 수 있다.
  - 토픽은 여러 파티션으로 나뉘어져 병렬 접근이 가능하다. 비동기 통신 가능
  - 컨슈머 그룹에서 오직 하나의 컨슈머가 특정 파티션에 접근할 수 있다.
- pub/sub 시스템 처럼 메시지가 컨슈머 그룹에게 broadcast 될 수 있다.

<br />

---

## Kafka - Architecture

카프카 클러스터는 카프카 브로커 데몬을 실행하는 하나이상의 서버로 구성되어 있다.

분산 애플리케이션 중간에 zookeeper 가 coordination 서비스 제공할 수 있다.



## Kafka Brokers

- 브로커는 카프카클러스터 안에서 메인 프로세스를 말한다.
- 브로커는 토픽 파티션을 전부 디스크(commit log)에 저장한다.
- 하나의 브로커는 1000개 토픽 파티션을 담당할 수 있다.
- 하나의 브로커는 클러스터의 컨트롤러로 임명된다.
- 각 브로커 데몬은 JVM 안에서 실행된다.
- 싱글 머신은 여러 브로커 프로세스를 실행할 수 있다.



## Kafka Tools

```shell
# 카프카 토픽 생성
$ kafka-topics --create \
--zookeeper zkhost1:2181, zkhost2:2181, zkhost3:2181 \
--replication-factor 3 \
--partitions 5 \ 
--topic myTopic

# 토픽 리스트
$ kafka-topics --list \ 
--zookeeper zkhost1:2181, zkhost2:2181, zkhost3:2181
```



```shell
# 카프카 producer 생성
$ kafka-console-producer \
--broker-list brokerhost1:9092, brokerhost2:9093 \
--topic myTopic

# 텍스트파일을 토픽에 담기 (pipe 이용하기)
$ cat sometext.txt | kafka-console-producer \
--broker-list brokerhost1:9092, brokerhost2:9093 \
--topic myTopic
```



```shell
# 카프카 consumer 생성
$ kafka-console-consumer \
--broker-list brokerhost1:9092, brokerhost2:9093 \
--topic myTopic
--from-beginning # 메시지를 처음부터 읽기, 그렇지 않으면 새로운 메시지만 읽힌다.
```

<br />

---

## FLAFKA

Flume + Kafka

- Flume 은 소스를 하둡으로 옮기는데 효율적이다. 
  - HDFS, HBase, Kudu, Solr 등에 write 하는 SI(sink) 를 제공한다.
- Kafka
  - 여러 시스템을 연결하는데 더 유연하다.
  - 내구성, fault-tolerance 가 더 우수하다.
  - 하지만, 메시지를 처리하거나 하둡으로 적재하는 직접적인 지원을 하지 않는다.
  - 이미 만들어진 프로듀서, 컨슈머가 많지 않으므로 직접 개발해야 한다. + Transform 이 안된다. → 이 떄 플룸사용하면 효과적이다.



플룸이 카프카 소스, 카프카 채널, 카프카 싱크를 제공해준다. → flume agent가 카프카에게 메시지를 전달한다.

```shell
# /etc/flume-ng/conf
flume-conf.properties.template
flume.env.ps1.template
flume.env.sh
flume.env.sh.template
flume.conf
log4j.properties
```

```shell
# spooldir_kafka.conf
source
	type=spooldir
	spoolDir=local
sink
	type=org.apache.flume.sink.kafka.KafkaSink
	topic=weblogs
	brokerList=localhost:9092
	batchSize=20
channel
	type=memory
	capacity=100000
	transactionCapacity=1000
```

```shell
# 플룸 가동
$ flume-ng agent --conf /etc/flume-ng/conf --conf-file spooldir_kafka.conf --name agent01 -Dflume.root.logger=INFO,console
```

```shell
# 카프카싱크 가동 (컨슈머) 
# 이제 소스 spooldir에 파일변경이 생기면, 안의 내용을 플룸이 받아서 카프카싱크로 출력되게 한다.
$ kafka-console-consumer --zookeeper localhost:2181 --topic weblogs
```













