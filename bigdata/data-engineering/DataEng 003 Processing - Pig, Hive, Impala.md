# DataEng 003 Processing - Pig, Hive, Impala



## HDFS & YARN

Scale out 필요

### Hadoop Component

- Storage : HDFS,  S3, Kudu
- Processing : Spark, MapReduce
- Resource Management : YARN, Mesos, Spark Standalone

### Hadoop Cluster

- **마스터노드 (Master Node)** : 일을 관리, 감독한다.
  - **네임노드 (Name Node)**
    - HDFS 는 한개의 네임노드를 가진다. 
    - fsimage, edits
    - 데이터노드와 heartbeat, blockreport 를 주고받는다.
    - 보조네임노드 (Secondary NameNode)
  - **리소스 매니저**
- **작업 노드 (Worker Nodes/Slave Node)** : 실제 일을 한다.
  - **데이터노드**
  - **노드 매니저**



### YARN

- YARN 은 하둡클러스터안의 자원을 관리하는 플랫폼이다.
- 하둡 분산 처리 프레임워크를 지원한다.
  - MapReduce v2, Spark, Impala



- 클러스터 당 RM (Resource Manager)
  - 노드매니저로부터 heartbeats 를 추적한다.
  - 스케쥴링을 실행한다.
  - 클러스터 레벨 보안을 유지한다.
- 노드 당 NM (Node Manager)
  - node 자원에 정보를 등록하고 제공한다.
  - 컨테이너에 의한 자원 사용량을 모니터링한다.
  - 애플리케이션 로그를 취합하고, HDFS 에 저장한다.
  - 노드 레벨 보안을 유지한다.
- 애플리케이션 당 AM (Application Master)
  - 컨테이너에서 실행된다.
  - 애플리케이션 업무를 실행하려고 컨테이너에게 요청하기 위해 RM 스케쥴러와 소통한다.

<br />

### MapReduce

1. Map
   - HDFS 블록으로 나누어 분산처리
   - 데이터를 가지고 있는 노드에서 task 실행
   - 수행 결과는 임시 파일에 저장
2. Shuffle
3. Sort
4. Reduce
   - 병럴로 실행된다.
   - bottleneck : map 수행단계 완료 이후 진행이 가능하다.
   - 최종 결과를 수행시켜 HDFS 에 저장





## Pig 전처리

- Data Sampling 용으로 사용 가능

- ETL 기능으로 사용 가능

  

- Interactive Mode (Grunt shell)

- Batch Mode (Script) - Pig Latin 언어로 작성된 .pig 스크립트 파일 활용

- Embedded Mode (UDF)





## Hive



Hive Metastore

- 데이터 스키마
- 데이터베이스 테이블 및 필드, 필드 유형

Hive 에서 데이터 검색

- 스키마에서 데이터 구조정보 : 테이블의 필드정보, 유형 및 위치 검색
- 실제 데이터느 HDFS 에서 찾는다.



- 테이블 생성 방식
  - Managed : 테이블 drop 되면 HDFS 데이터 삭제된다.
  - External : 테이블 drop 되면 스키마만 삭제되고 HDFS 데이터는 보존된다.
  - 기본 저장 위치는 /user/hive/warehouse
- Hive 데이터 모델 in HDFS
  - Table = Directory
    - partitions = sub-directory
      - buckets = file

- Hive는 RDBMS 가 아니기 때문에 트랜잭션 쿼리를 지원하지 않는다.
  - 특정 포맷에 대해 부분적으로 지원한다.
  - 실시간 쿼리에 적합하지 않고, update, delete 지원하지 않는다.



### Hive Service Roles

- Hive Metastore Server
- HiveServer2
  - 클라이언트가 사용하는 Thrift API 지원한다.
  - Beeline 이라는 Hive CLI를 지원한다.
- Hive Gateway
  - Hive 를 사용하고 싶은 노드에 하이브 게이트웨이 롤 인스턴스 추가



### Beeline CLI

```shell
$ beeline -u jdbc:hive2://hiveserver2.example.com:10000 -n username -p password
```



### 실행 엔진

- MapReduce 보다 인메모리 기반 Spark를 많이 사용한다. 



---

## Impala

- Hive 는 달리 MR, Spark 등 실행 엔진을 사용하지 않고 자체 Query Engine 을 사용한다. 임팔라 데몬을 통해 쿼리를 실행한다 따라서 Hive 에 비해 10~50배 정도 속도 개선 효과가 있다.
- multi-client 동시 접속을 효율적을 제공한다.
- Hive 와 metastore (RDBMS) 을 공유한다. 따라서 하이브에서 생성된 테이블을 사용할 수 있다. 반대도 마찬가지이다.
- 주로 **Interactive Query** 에 많이 활용된다.
- transaction, delete, update 지원하지 않는다.
- Data size는 Hive 와 마찬가지로 petabytes 단위를 다룬다.
- Storage Cost 가 싸다.



### 구성요소

- 마스터노드 : 클러스터 당 하나의 State Store, Catalog Server
- 워커노드 : 임팔라 데몬은 각 워커노드에서 실행된다.
- Query Planner
- Query Coordinator
- Query Executor
- HDFS DN, HBase



### Impala Shell

```shell
$ impala-shell -u cloudera
```



### Impala Metadata Cache Invalidation

- **임팔라는 쿼리 지연시간을 줄이기위해 메타데이터를 캐싱한다.**

  - 메타스토어로부터 테이블 구조, 데이터 위치
  - HDFS 로부터 파일 정보

- 따라서 임팔라 외부에서 발생한 변화는 cache invalidation (캐시 무효화) 을 필요로 한다.

  다음의 경우 아래 명령어가 필요

  ```shell
  invalidate metadata;
  ```

  1. Hive 로 테이블을 생성했을 경우
  2. Sqoop 으로 테이블 데이터를 가져왔을 경우
  3. HDFS 에서 테이블 데이터를 추가했을 경우



---

## Hive and Impala

### Data Validation

- RDBMS와는 다르게 INSERT 할 때 검증하지 않는다. 

- 파일이 단순히 장소에 옮겨진다.

  - 데이터 적재는 HDFS 에 file을 추가하는 것과 같다.

    ```shell
    $ hdfs dfs -mv data.txt /user/hive/warehouse/test
    ```

  - 다른 방법 (이 때는 소스가 파일 또는 디렉토리도 가능)

    ```sql
    LOAD DATA INPATH '/user/customer.csv' INTO TABLE sales
    ```

- 따라서 데이터 적재가 빠르다.

- 파일포맷 오류는 쿼리가 실행되었을 때서야 발견된다.

- Missing 또는 무효한 데이터는 NULL 로 표기된다.



- OVERWRITE 키워드는 모든 행을 삭제하고, 데이터를 적재한다.



### Sqoop 으로 적재

```shell
$ sqoop import \
--connect jdbc:mysql://localhost/dbname \
--username training \
--password training \
--fields-terminated-by '\t' \
--table test \
--hive-import \
--hive-database default \
--hive-table test
```



### Partioning

- 전체 데이터를 읽는데 너무 오랜 시간이 걸릴 때
- 쿼리가 거의 항상 파티션 컬럼을 필터링 할 때
- 파티션 컬럼에 수많은 다른 값이 있을 때
- 데이터 생성 또는 ETL 처리가 파일 또는 폴더명으로 데이터를 쪼갤 때
- 파티션 컬럼값이 데이터 자체에 없을 때



## Kudu

아래 3개를 모두 지원한다.

- 빠른 순차 접근
- 빠른 임의 접근
- 데이터 updatre



### Tablet

- 테이블은 테블릿에 파티션된다.
- 각 테블릿은 테이블의 행의 부분집합을 보관한다.
- 테블릿은 여러 노드에 저장되고 서빙된다.



## Kudu Directories

- 마스터와 태블릿 서버 둘다 WAL(write-ahead logs) 과 데이터를 저장한다.
- 마스터와 태블릿서버 노드는 같은 호스트에 같이 위치할 수 있다.



임팔라와 쿠두를 같이 사용하면 좋다.

- 하이브를 사용해서는 kudu 에 접근할 수 없다.
- Impala SQL  은 쿠두 C++, Java, Python API 의 간단한 대체제이다.



