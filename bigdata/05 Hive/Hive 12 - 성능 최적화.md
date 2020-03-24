# Hive 12 - 성능 최적화

하이브 성능 최적화 설정을 알아봅니다.



### 작업엔진 선택: TEZ 엔진 사용

**맵리듀스(MR)엔진**은 연산의 중간 파일을 로컬 디스크에 쓰면서 진행하여 이로 인한 **잦은 IO 처리로 작업이 느려**집니다. **테즈(TEZ)엔진**은 **작업 처리 결과를 메모리에 저장하여 맵리듀스보다 빠른 속도**로 작업을 처리할 수 있습니다.

```shell
set hive.execution.engine=tez;
```

<br>

### 파일 저장 포맷: ORC 파일 사용

테이블 데이터를 **저장할 때 ORC 파일을 사용하여 처리 속도를 높일 수** 있습니다. ORC 파일 포맷은 데이터를 컬럼 단위로 저장하기 때문에 **검색 속도가 빠르고, 압축률이 높습니다.**

```shell
CREATE TABLE table1 (
) STORED AS ORC;
```

<br>

### 데이터 처리 방식: 벡터화(Vectorization) 사용

벡터화 처리는 한 번에 1행을 처리하지 않고, **한 번에 1024행을 처리하여 속도를 높이는 기술**입니다. **ORC 파일 포맷에서만 사용가능**합니다. 필터링, 조인, 집합 연산에서 40~50% 정도의 성능 향상을 기대할 수 있십니다.

```shell
set hive.vectorized.execution.enabled=true;
```

<br>

### 데이터 저장 효율화: 파티셔닝, 버켓팅 사용

하이브는 디렉토리 단위로 데이터를 처리하기 때문에 **검색에 사용되는 데이터를 줄이기 위한 방안으로 파티셔닝, 버켓팅 기능을 이용**하면 좋습니다.

**파티셔닝은 데이터를 폴더 단위로 구분하여 저장하고, 버켓팅은 지정한 개수의 파일에 컬럼의 해쉬값을 기준으로 데이터를 저장**합니다. **이를 이용하여 한번에 읽을 데이터의 크기를 줄일 수 있**습니다.

```shell
CREATE TABLE table1 (
) PARTITIONED BY(part_col STRING);
```

<br>

### 통계정보 이용: 하이브 stat 사용

하이브는 테이블, 파티션의 정보를 메타스토어에 저장하고 조회나 `count`, `sum` 같은 집계함수를 처리할 때 이 정보를 이용할 수 있습니다. **맵리듀스 연산없이 바로 작업할 수 있기 때문에 작업의 속도가 빨라**집니다.

```shell
set hive.stats.autogather=true;
```

<br>

### 옵티마이저 이용: CBO

하이브는 **카탈리스트 옵티마이저를 이용하여 효율적으로 작업**을 처리할 수 있습니다. `explain`을 이용하여 작업 분석 상태를 확인할 수 있습니다.

```shell
set hive.cbo.enable=true;

hive> explain select A from ta, tb where ta.id = tb.id;
```

<br>

### YARN: 작업 큐 설정

**YARN의 스케줄러 설정을 통해 작업의 효율성을 높일 수** 있습니다. 작업의 **성격에 따라 큐를 여러개 만들어서** 스케줄러의 사용 설정을 적용하면 좋습니다. 하나의 큐에 모든 작업을 넣지 않고, `batch`, `adhoc` 같은 형태로 큐를 만들어서 **큐의 최대 사용량 설정을 통해 적절하게 작업을 분산**하여 주는 것이 좋습니다.

<br>



---

## 1. TEZ

테즈는 YARN 기반의 비동기 사이클 그래프 프레임워크입니다.  하이브에서 맵리듀스 대신 실행엔진으로 사용이 가능합니다.

![](https://2xbbhjxc6wk3v21p62t8n4d4-wpengine.netdna-ssl.com/wp-content/uploads/2016/03/H1H2Tez-1024x538.png)

맵리듀스는다음과 같이 작업의 중간결과를 HDFS에 계속 쓰게 됩니다. 이로 인한 IO 오버헤드가 맵리듀스작업의 가장 큰 문제점이었습니다.

![](https://tez.apache.org/images/PigHiveQueryOnMR.png)

테즈는 작업의 처리 결과를 메모리에 저장합니다. 이를 통해 IO 오버헤드를 줄여 속도를 높일 수 있습니다.

![](https://tez.apache.org/images/PigHiveQueryOnTez.png)



### 실행엔진 설정

하이브에서 테즈 엔진을 사용하는 방법은 다음과 같습니다.

```shell
-- 테즈 엔진 설정 
set hive.execution.engine=tez;
set tez.queue.name=tez_queue_name;

-- 맵리듀스 엔진 설정 
set hive.execution.engine=mr;
set mapred.job.queue.name=mr_queue_name;
```

<br>

---

## 2. ORC

**ORC(Optimized Row Columnar)**는 **칼럼 기반의 파일 저장방식**으로, Hadoop, Hive, Pig,  Spark 등에 적용 가능합니다. 데이터베이스의 데이터를 읽을 때 칼럼단위의 데이터를 이용하는 경우가 많습니다. **ORC는 칼럼 단위로 데이터를 저장하기 때문에 칼럼 데이터의 검색이 빠르고, 압축효율이 좋습니다.**

![](https://image.slidesharecdn.com/w-1205p-230a-radhakrishnanv3-140617155040-phpapp02/95/hive-and-apache-tez-benchmarked-at-yahoo-scale-21-638.jpg?cb=1403020414)

<br>

### ORC 설정

하이브에서는 다음과 같이 STORED AS를 ORC로 선언하고, TBLPROPERTIES에 설정정보를 입력합니다.

```
CREATE TABLE table1 (
    col1 string,
    col2 string
) STORED AS ORC
TBLPROPERTIES (
    "orc.compress"="ZLIB",  
    "orc.compress.size"="262144",
    "orc.create.index"="true",
    "orc.stripe.size"="268435456",
    "orc.row.index.stride"="3000",
    "orc.bloom.filter.columns"="col1,col2"
);
```

## ORC 설정 값

- orc.compress
  - 기본값: ZLIB
  - 압축방식 설정 (one of NONE, ZLIB, SNAPPY)
- orc.compress.size
  - 기본값: 262,144
  - 압축을 처리할 청크 사이즈 설정(256 * 1024 = 262,144)
- orc.create.index
  - 기본값: true
  - 인덱스 사용 여부
- orc.row.index.stride
  - 기본값: 10,000
  - 설정 row 이상일 때 인덱스 생성 (must be >= 1000)
- orc.stripe.size
  - 기본값: 67,108,864
  - 스트라이프를 생성할 사이즈 (64 * 1024 *1024 = 67,108,864)), 설정 사이즈마다 하나씩 생성
- orc.bloom.filter.columns
  - 기본값: ""
  - 블룸필터[1](https://wikidocs.net/23570#fn:1)를 생성할 컬럼 정보, 콤마(,)로 구분하여 입력
- orc.bloom.filter.fpp
  - 기본값: 0.05
  - 블룸필터의 오판 확률(fpp=false positive portability) 설정 (must >0.0 and <1.0)

<br>

---

## 3. CBO

**CBO(Cost-Based Optimizer)** 

하이브 0.14 버전부터 **사용자의 쿼리를 최적화하는 CBO를 지원**합니다. CBO가 적용되면 사용자의 쿼리를 분석해서 쿼리를 최적화 합니다. 예를 들어 테이블 A, B, 의 조인을 처리할 때 조인 데이터를 비교하여 **셔플 단계의 데이터를 줄일 수 있는 방향으로 쿼리를 수정**하여 줍니다. 다음과 같은 쿼리에서 t1, t2를 모두 읽어서 조인하지 않고, **t2를 읽을 때 먼저 필터링을 처리한뒤 조인하는 방향으로 쿼리를 최적화 하여 줍니다**. t2의 데이터가 많을 경우 네트워크를 통해 이동하는 데이터가 줄어들어서 처리 비용이 감소합니다.

```shell
SELECT sum(v)
  FROM (
    SELECT t1.id,
           t1.value AS v
      FROM t1 JOIN t2
     WHERE t1.id = t2.id
       AND t2.id > 50000) inner
  ) outer
```

![](https://wikidocs.net/images/page/33619/CBO.png)

<br>

<br>

### CBO 옵션

CBO를 적용하기 위해서는 다음의 옵션을 설정해야 합니다. 기본적으로 true 상태입니다.

```shell
-- CBO 적용
set hive.cbo.enable=true;
-- 새로 생성되는 테이블과 INSERT 처리를 할 때 자동으로 통계정보 수집 
set hive.stats.autogather=true;
set hive.stats.fetch.column.stats=true;
set hive.stats.fetch.partition.stats=true;
```



통계정보를 자동으로 수집하지 않으면 `ANALYZE`명령을 이용해서 수동으로 정보를 수집해야 합니다. 통계정보 수집도 맵리듀스 작업이기 때문에 데이터가 많으면 시간이 오래 걸릴 수 있습니다.

```shell
ANALYZE TABLE sample_table PARTITION(yymmdd='20180201') COMPUTE STATISTICS for columns;
ANALYZE TABLE sample_table PARTITION(yymmdd='20180201') COMPUTE STATISTICS;  
```

<br>

### explain 쿼리 확인

`explain` 명령으로 CBO 적용 여부를 확인할 수 있습니다. CBO가 작용되면 다음과 같이 "Plan optimized by CBO." 라는 메시지가 출력됩니다.

```shell
hive> explain INSERT OVERWRITE DIRECTORY 'hdfs:///user/data/location'
    > select name, count(1)
    >   from sample_table
    >  where yymmdd=20180201
    >  group by name
    >    
    > ;
OK
Plan optimized by CBO.
```

<br>

### CBO 적용 불가

CBO가 적용 불가능한 상황이 몇가지 있습니다. CBO 적용이 불가능한 경우 로그에 불가능한 원인을 다음과 같이 출력합니다. 따라서 "Plan not optimized by CBO." 메시지가 출력되면 하이브 로그를 확인하여 적용 불가 원인을 확인하고 수정하면 됩니다.

```shell
2019-04-05T08:08:12,490 INFO  [main([])]: parse.BaseSemanticAnalyzer (:()) - Not invoking CBO because the statement has sort by
```

<br>

### 적용 불가 상황

CBO 적용이 불가능한 몇가지 상황은 다음과 같습니다.

- 트랜스폼(transform)은 사용 불가
- 인라인 Lateral View Join 만 가능
- UNIQUE 조인은 불가
- 서브쿼리 사용 불가
- Having 절에 select의 alias 가 들어있으면 사용 불가
- Sort By 사용 불가







---

**Referene**

https://wikidocs.net/23572

https://wikidocs.net/23570

https://wikidocs.net/33619