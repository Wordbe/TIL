# Hadoop Cluster

하둡 클러스터를 운영하면서 알면 좋은 팁을 알아봅니다.

* **하둡 크러스터의 기본 포트(Port)**

| 타입      | 서버                   | 포트  | 사용법                                                       |
| :-------- | :--------------------- | :---- | :----------------------------------------------------------- |
| hdfs      | hdfs                   | 8020  | hadoop fs -ls hdfs://$(hostname -f):8020/                    |
| hdfs      | webhdfs                | 50070 | curl -s http://$(hostname -f):50070/webhdfs/v1/?op=GETFILESTATUS |
| hdfs      | webhdfs-proxy          | 14000 | curl -s "http:///$(hostname -f):14000/webhdfs/v1?op=GETFILESTATUS&user.name=hadoop" |
| yarn      | resourcemanager        | 8032  |                                                              |
| yarn      | resourcemanager web UI | 8088  | lynx http://$(hostname -f):8088                              |
| yarn      | timelineserver         | 8188  | curl -s http://$(hostname -f):8188/ws/v1/timeline            |
| yarn      | yarn-proxy-server      | 20888 |                                                              |
| Mapreduce | historyserver          | 19888 | curl -s http://$(hostname -f):19888/ws/v1/history/info       |
| hive      | metastore              | 9083  | thrift://$(hostname -f):9083                                 |
| hive      | hive-server2           | 10000 | jdbc:hive2://localhost:10000                                 |
| hive      | hive-server2 web UI    | 10002 | lynx http://$(hostname -f):10002                             |
| spark     | spark-history-server   | 18080 | curl http://$(hostname -f):18080/api/v1/applications         |
| spark     | livy-server            | 8998  | lynx http://localhost:8998                                   |
| kms       | hadoop-kms             | 9700  | curl http://$(hostname -f):9700/kms/v1/keys/names            |

HDFS : Hadoop Distributed File System

YARN : Yet Another Resource Negotiator





<br>

<br>

---

## 빅데이터 운영 주의 사항

아래는 빅데이터를 운영할 때 알아두면 좋은 몇가지 사항입니다.



### 작업 튜닝

클러스터의 크기가 제한된 상황에서는 **연산의 튜닝을 이용해서 작업 성능을 향상** 시킬 수 있습니다. 데이터의 형 변환, 객체의 재사용을 이용한 가비지 콜렉션 최적화 등입니다. 하나의 데이터를 처리하는데 0.1초를 줄인다면 큰 크기의 작업을 처리할 때는 많은 시간을 절약할 수 있습니다.

<br>

### 네트워크 사용량

빅데이터는 네트워크 사용량도 효율적으로 구성되어 있어야 합니다. 작업을 위한 데이터 복사와 HDFS 블록의 복사, 내부 메시지 처리 등 네트워크를 통해 데이터가 끊임없이 처리되기 대문에 **네트워크 모니터링을 통해 작업의 지연 여부를 확인**해 보아야 합니다.

HDFS, S3, NAS 같은 저장소에 저장된 데이터를 작업을 처리할 노드로 복사하거나, 리듀스 작업을 처리할 노드로 옮기는 것도 모두 **네트워크 처리량**과 관련이 있기 때문에 **네트워크 대역폭**도 작업 속도와 관련이 있습니다.

<br>

### 클러스터 부하

하나의 노드의 작업이 몰리게 되면 장비에 문제가 발생할 수도 있습니다. 따라서 적절한 설정을 통해 **여러 노드에 작업이 분산 될수 있도록 설정**하는 것이 좋습니다.



---

**[빅데이터 - 하둡, 하이브]** 정리



1. **빅데이터**

   1. 빅데이터란?
      1. 데이터의 형태 : 정형, 반정형, 비정형
      2. 분석 형태 : 대화형, 배치, 실시간 분석 / 기계학습
   2. 빅데이터 처리단계 : 수집 → 정제 → 적재 → 분석 → 시각화
   3. 빅데이터 에코시스템 
      * 수집(Flume, Kafka, NiFi, Sqoop, scribe, Fluentd)
      * 작업 관리 기술(Airflow, Azkaban, Oozie)
      * 데이터 직렬화(Avro, Thrift, Protocol Buffers)
      * 저장(HDFS, S3)
      * NoSQL(HBase)
      * 처리(MapReduce, Spark, Impala, Presto, Hive, Hcatalog, Pig)
      * 클러스터 관리(YARN, Mesos)
      * 분산 서버 관리(Zookeeper)
      * 시각화(Zeppelin)
      * 모니터링(Hue)

2. **하둡(Hadoop)**

   1. 하둡이란? : 여러 대의 컴퓨터를 클러스터화하고, 빅데이터를 병렬로 빠른 속도로 동시 처리하는 분산처리를 위한 오픈소스 프레임워크

      Hadoop Common, HDFS, YARN, MapReduce

      1. 하둡 버전별 특징 v3

   2. HDFS
      1. 구조(Architecture)
         1. 블록
         2. 세컨더리 네임노드
      2. HDFS Federation : 디렉토리(네임스페이스) 단위로 네임노드를 등록하여 사용하는 것
      3. 고가용성(HA, High Availability) : QJM, NFS
      4. 세이프모드
      5. 데이터 블록 관리 `fsck`: 상태(corrupt, 복제 개수 부족한 블록) 체크
      6. 휴지통
      7. 명령어
      8. WebHDFS REST API : `hdfs-stie.xml` 설정
      9. 암호화

   3. 맵리듀스(MapReduce) : 간단한 단위작업을 처리하는 맵(Map), 결과물을 모아 집계하는 리듀스(Reduce)
      1. 처리 단계: 입력 → 맵 → 컴바이너(로컬리듀서) → 파티셔너 → 셔플 → 정렬 → 리듀서 → 출력
         1. WordCount 예제
         2. WordCount2 예제 - 카운터, 분산캐시
      2. 보조 도구 : 카운터, 분산 캐시
      3. 메모리 설정
      4. 성능 최적화
      5. '전국 cctv 표준 데이터' 맵리듀스 예제
   4. YARN (Yet Another Resource Negotiator) : 클러스터 리소스 관리, 애플리케이션 라이프 사이클 관리 아키텍처
      1.  YARN Scheduler
         1. 커패시티 스케줄러
         2. 페어 스케줄러
      2. YARN 메모리 설정
      3. YARN 명령어
      4. YARN REST API
      5. YARN Node Labels : 서버 특성(역할, 사양)에 맞게 구분하여 작업을 처리하는 기능
   5. 작업 지원 도구 : 작업 지원 및 모니터링
      1. DistCp (Distribute Copy) : 맵리듀스를 이용한 대규모 파일 병렬 복사
      2. 하둡 아카이브 (Hadoop Archive) : 작은 사이즈의 파일을 묶어서 볼록 사이즈의 파일로 관리

3. **하이브(Hive)**

   1. 하이브란? 하둡 에코시스템 중 데이터를 모델링하고 프로세싱하는 **데이터 웨어 하우징용 솔루션**, HDFS에 저장된 데이터 구조를 RDB, 테이블과 같은 형태로 정의하는 방법 제공, SQL과 유사한 HiveQL을 통해 데이터를 조회하는 방법 제공
      1. 버전별 하이브 특징
      2. 하이브 서비스
      3. 하이브 CLI
      4. 비라인(beeline) : SQLLine 기반 하이브서버2에 접속하여 쿼리를 실행하기 위한 도구
      5. 메타스토어 : 메타정보를 보관하고 사용자 요청에 따라 정보를 제공하는 곳
         1. 메타 데이터베이스
         2. 메타스토어 데이터베이스 설정
   2. 데이터베이스
   3. 테이블
      1. 데이터 타입
      2. 입력(Insert), 조회(Select), 복합타입 입력
      3. 파티션(Partition) : 데이터를 디렉토리 별 저장
      4. 버켓팅(Bucketing) : 칼럼 값을 해시 처리하고, 지정한 수의 파일로 나누어 저장
      5. 스큐(Skew) : 특정 데이터가 주로 들어오는 경우 분리하여 저장
      6. 정렬 : order by, sort by, distribute by, cluster by
      7. 서데(SerDe, Serializer/Deserializer) : 하이브가 데이터를 해석하는 방법 제공, 서데와 파일 포맷을 이용하여 데이터를 읽고, 쓰기 가능
      8. 가상칼럼(Virtual Column)
      9. 쿼리 분석 : EXPLAIN 명령으로 쿼리 실행 계획 확인
      10. 통계 정보
      11. 파일 병합(Merge)
      12. 파일 압축(Compression)
   4. 함수
      1. 유용한 기본 함수
      2. UDF(User-Defined Function) 구현 : 1개 열을 처리하여, 1개 열을 반환
      3. UDAF(User-Defiend Aggregation Function) 구현 : N개 열 이용, 1개열 반환
      4. UDTF(User-Defined Table Generating Function) 구현 : 1개 열 입력, N개 열 반환
      5. TRANSFORM 구현 : 비정형 데이터를 파이썬 스크립트를 이용하여 정형 데이터로 변경
   5. 트랜잭션 : 작업의 논리적 단위
      1. 락(Lock) : 트랜잭션과 락은 동시성 지원, 락은 트랜잭션을 처리할 때 테이블, 파티션에 접근 제어
   6. 성능 최적화
      1. TEZ : 작업 엔진 (작업 처리결과가 디스크가 아닌 메모리에 저장하여 맵리듀스보다 빠른 속도)
      2. ORC : 파일 저장 포맷(데이터를 컬럼 단위로 저장)
      3. CBO(Cost-Based Optimizer) : 카탈리스트 옵티마이저
   7. 설정

4. **하둡 클러스터 운영**

   1. 하둡 클러스터 기본 포트(Port)
   2. 빅데이터 운영 주의 사항 : 작업 튜닝, 네트워크 사용량, 클러스터 부하





---

**Reference**

https://wikidocs.net/72750

https://wikidocs.net/68073