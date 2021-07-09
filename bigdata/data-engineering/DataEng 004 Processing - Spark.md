# DataEng 004 Processing - Spark



- 빠른, 대용량 데이터 처리의 일반적인 엔진
- Scala로 쓰여짐
- Python , Scala, Java
- Python shell : pyspark
- Scala shell : spark-shell



## RDD (회복성 분산 데이터셋)

Resilient Distributed Dataset

- 스파크에서 데이터의 기본 단위
- 생성 방법
  - 파일, 파일 셋으로부터
  - 메모리 안의 데이터로 부터
  - 다른 RDD 로부터



### RDD 연산 : Actions

액션 결과 값이 나온다.

```python
mydata = sc.textFile("purplecow.txt") # 파일 안의 각각의 라인이 RDD의 각각 레코드로 저장된다.
mydata.count()
mydata.take(n)
mydata.collect()
mydata.savaAsTextFile(dir)
```



### RDD 연산 : Transform

- Transform 은 기존 RDD 에서 새로운 RDD를 생성한다.
- RDD 는 immutable 하다.

```python
mydata.map(lambda line: line.upper())
mydata.filter(lambda line: line.startswith('I'))
```



### Lazy Execution

RDD 는 `action` 수행 전까지 처리되지 않는다.



### RDD Lineage

Spark 는 RDD 의 족보를 유지한다. 

```python
mydata_filt = sc.textFile("purplecow.txt") \
	.map(lambda line: line.upper()) \
	.filter(lambda line: line.startswith('I'))
print(mydata_filt.toDebugString) # Show Lineage
```



### Pipelining

스파크는 가능함녀 데이터가 중간에 저장하지 않고, 트랜스폼 시퀀스를 수행한다.



- 스파크는 함수형 프로그래밍 개념에 의존적이다.

  - 함수가 인풋, 아웃풋을 가진다. 상태가 없고, 부작용이 없다.

  - 다른 함수에 인풋으로 함수를 전달할 수 있다.

  - 익명 함수 가능

    ```python
    lambda x: ... # python
    x => ... # scala
    x -> ... # java 8
    ```



---

<br />

### Working with RDDs

- RDD 는 원소의 연속적 타입(serializable type)을 가질 수 있다.
  - primitive type : integers, characters, booleans
  - sequence type : strings, lists, arrays, tuples, dicts
  - Scala/Java Object (if serializable)
  - 복합 타입
- Pair RDDs
  - key-value 쌍으로 구성되어 있다.
- Double RDDs
  - 숫자 데이터로 구성되어 있다.



콜렉션으로부터 RDD 생성가능하다.

```python
mydata = ["Alice","Carlos","Frank","Barbara"]
mydata = sc.parallelize(mydata)
mydata.take(2)
```



```python
sc.wholeTextFiles(dir) # 폴더안의 각각 파일의 전체 내용을 하나의 RDD 원소에 담는다.
```



### RDD 연산

- Single RDD Transformations
  - flatMap : 기존 RDD 의 한 element(record)를 여러 eleements(records)로 매핑한다.
  - distinct
  - sortBy
- Mutli-RDD Transformations
  - intersection
  - union
  - zip
  - subtract

```python
sc.textFile(file) \
	.flatMap(lambda line: line.split(' ')) \
  .distinct()
```

![](https://i.ibb.co/q04ydt0/2021-07-08-11-11-26.png)

 <br />

---

## Pair RDDs

```
(key1, value1)
(key2, value2)
(key3, value3)
```

- MapReduce 알고리즘을 사용하기 위함

- 공통 데이터 처리를 위해 추가적인 함수가 필요

  - sorting, joining, grouping, coutning

- 생성 방법

  - map

    ```python
    users = sc.textFile(file) \
    .map(lambda line: line.split('\t')) \ 
    .map(lambda fields: (fields[0],fields[1]))
    ```

  - flatMap / flatMapValues

    ```python
    sc.textFile(file) \
    .map(lambda line: line.split('\t')) \ 
    .map(lambda fields: (fields[0],fields[1])) \
    .flatMapValues(lambda skus: skus.split(':'))
    ```

  - keyBy

    ```python
    sc.textFile(logfile) \
    	.keyBy(lambda line: line.split(' ')[2])
    ```

    

스파크에서 맵리듀스는 pair RDDs 에 작동한다.

- Map Phase
  - 한 번에 한 레코드에 연산된다.
  - 각 행을 0개 이상의 새로운 레코드로 map 한다.
  - `map`, `flatMap`, `filter`, `keyBy`
- Reduce Phase
  - 맵 출력에 작동한다.
  - 여러 레코드를 합친다.
  - `reduceByKey`, `sortByKey`, `mean`, `countByKey`, `groupByKey`, `join`

- `keys`, `values`, `lookup`, `leftOuterJoin`, `rightOuterJoin`, `fullOuterJoin`, `mapValues`, `flatMapValues`

**Word Count 예제**

```python
counts = sc.textFile(file) \
	.flatMap(lambda line: line.split(' ')) \
  .map(lambda word: (word, 1)) \
  .reduceByKey(lambda v1, v2: v1 + v2)
```

![](https://i.ibb.co/wJbfprB/image.png)

<br />

---

## Spark Application 쓰고 실행하기

방법 3가지

- **Hadoop YARN**
  - CDH(Cloudera Data Hub) 에 포함되어 있음
  - 다른 애플리케이션과 클러스터 리소스 공유 가능
- Spark Standalone
  - Spark 에 내장되어 있다.
  - 설치, 실행이 쉽다.
  - 설정력, 확장력이 제한
  - 보안 지원 없다
  - 따라서 학습, 테스팅, 개발, 작은 시스템에서 유용하다.
- Apache Mesos
  - Spark 지원하는 첫번째 플랫폼
  - Cloudera 가 지원하지 않는다.



### YARN : ClientMode

Driver Program 안의 Spark Context 1 > Resource Manager > 여러 Node Manager 중 하나에서 Application Master 1 > 다른 노드매니저의 Executor 실행

Executor 는 Spark Context 1 를 공용으로 사용

이 때 다른 드라이버 프로그램에서 Spark Context 2 가 있으면, 리소스매니저가 다른 노드매니저의 Application Master 2 에게 지시하여 다른 노드매니저의 Executor 를 실행

이 Executor 들은 Spark Context 2 를 공용으로 사용

### YARN : Cluster Mode

- spark submit > Resource Manager > 여러 노드매니저 중 하나에서 Application Master 안에 Driver Program 이 생기고 그 안에 Spark Context 주입 > 다른 노드매니저의 Executor 를 실행
- 각 Executor 는 AM 안에 있는 Spark Context 를 공용으로 사용



### Local 에서 Spark Application 실행

```shell
$ spark-submit --master 'local[*]' # 코어 만큼의 여러 쓰레드로 실행
$ spark-submit --master 'local[n]' # n threads
$ spark-submit --master 'local' # single thread
```

```shell
$ spark-submit --master yarn-client
$ spark-submit --master yarn-cluster
```

```shell
$ pyspark --master yarn # (python) client 모드만 지원
$ spark-shell --master yarn # (scala) clinet 모드만 지원
```

<br />

---

### Dynamic Resource Allocation

- 동적 할당은 스파크 애플리케이션이 필요한 만큼 executor 를 추가하고 release 하는 것을 허용한다.
- 새로운 드라이브 프로그램을 만들지 않고, 기존 드라이버 프로그램 안의 Spark Context 가 추가로 Executor 에게 제공한다.



### Spark UI

http://localhost:4040



---

## RDDs On a Clutser

스파크에 의해 파티셔닝이 자동으로 된다.

```python
sc.textFile(file, minPartitions) # 최소 파티션 수를 지정할 수 있다. default=2 (cluster) defatul=1 (single thread)
```

대부분 RDD 연산은 RDD 의 각 레코드에 적용된다.

하지만 파티션 단위로 적용되는 것들

- foreachPartition
- mapPartitions
- mapPartitionsWithIndex



- 스파크는 블록 단위 파일 기반 RDD 를 나눈다. (partition)
  - 각각의 블록은 하나의 파티션으로 적재된다.
- Action 이 발생하면 executor 에 task 가 블록으로부터 데이터를 load 하여 파티션으로 넣는다.
- Action 이 값을 드라이버에게 리턴할 때까지 executors 에서 데이터는 분산된다.



- 각 파티션마다 병렬로 RDD 연산이 수행된다.
- 파티션을 보존한다 : map, flatMap, filter
- repartition 한다 ; reduceByKey, sortByKey, join, groupByKey



### Stages

- 스테이지에서는 같은 파티션에서 수행될 수 있는 연산이 실행된다.
- 스테이지의 Tasks 는 같이 pipelined 된다.
- 성능 향상을 위해 알아야 한다.



- Job : 액션의 결과로써 실행되는 tasks 셋이다.
- Stage : Job 에서 병렬로 실행될 수 있는 tasks 셋이다.
- Task : 한 executor 에게 보내진 일 단위이다.
- Application : 한 드라이버에 의해 관리되는 jobs 의 셋이다.



- 스파크는 RDD 의존성의 DAG(Directed Acyclic Graph) 로 구성된다.
- Narrow 의존성
  - 자식 RDD 의 각 파티션은 부모 RDD의 한 파티션에 의존한다.
  - 한 스테이지에서 수행 가능
  - map, filter, union
- Wide ( Shuffle ) 의존성
  - 자식 파티션은 부모 RDD의 여러 파티션에 의존한다.
  - 새로운 스테이지를 생성한다.
  - reduceByKey, join, groupByKey
  - 많은 파티션 = 많은 병렬 tasks 를 의미한다.
  - 파티션 수가 너무 적으면, 클러스터는 적게 사용될 것이다.



- 태스크 수 = 파티션 수



<br />

---

## RDD Persistence

RDD 영속성

- RDD 는 Action 이 발생하기 전까지 Transform을 수행하지 않는다. 그런데 중간에 Transform 결과를 (메모리에) 저장하고 싶다면?

- RDD 를 영속화는 데이터를 저장한다. 기본으로 인메모리에 저장

  ```python
  mydata = sc.textFile("purplecow.txt")
  myrdd1 = mydata.map(lambda s: s.upper())
  myrdd1.persist() # 영속화: 메모리에 현재 rdd 를 저장한다.
  
  myrdd2 = myrdd1.filter(lambda s: s.startswith('I'))
  myrdd2.count() # count 액션이 발생했을 때, 모든 족보를 다 거슬러올라가지 않고, myrdd1은 저장되있으므로 중간에 이것을 이용한다.
  ```

  

- 인메모리 영속화를 권장
  - 메모리가 만약 부족하면, 영속화된 파티션은 메모리로부터 삭제된다. LRU(Least Recently Used, 가장 최근에 사용하지 않은) 알고리즘으로.

- RDD partitions 는 클러스터에 분산되어 있다.
  - 기본으로 Executor JVMs 안 메모리에 파티션이 영속화되어 있다.

### RDD Fault-Tolerance

- 메모리에 파티션이 영속화되어 있지 않다면, 드라이버는 다른 노드에서 파티션을 recompute 하는 태스크를 시작한다.
  - Lineage 는 보존되고, 데이터는 날라가지 않는다.

<br />

### Persistence Levels

- persists 메소드는 메모리에만 데이터를 저장한다 (default)

- Storge Level 조절

  - 저장 장소(memory or disk)

    ```python
    myrdd.persist(StorageLevel.MEMORY_ONLY)
    myrdd.persist(StorageLevel.MEMORY_AND_DISK)
    myrdd.persist(StorageLevel.DISK_ONLY)
    ```

    

  - 메모리 안 포맷

    ```python
    myrdd.persist(StorageLevel.MEMORY_ONLY_SER) # 메모리에서 데이터를 serialize
    myrdd.persist(StorageLevel.MEMORY_AND_DISK_SER)
    ```

    직렬화하면 공간효율성은 좋아지지만, 시간 효율성은 낮아진다.

  - 파티션 복제

    - 두개의 노드에 파티션 저장
      - DISK_ONLY_2
      - MEMORY_AND_DISK_2
      - MEMORY_ONLY_2
      - MEMORY_AND_DISK_SER_2
      - MEMORY_ONLY_SER_2

  - 옵션 없이 사용할거면 persist() 대신 cache() 로 가능

  - unpersist() 로 영속화 삭제가능



### Disk Persistence



<br />

---

## Spark SQL

- DataFrame API 를 제공한다.
- Catalyst Optimizer - 확장가능한 최적화 프레임워크
- SQL 엔진과 CLI 제공



### SQL Context

- SparkContext 필요
  - 두 가지 구현체가 있음
  - SQLContext
  - HiveContext
    - Hive / HCatalog 테이블을 직접 read/write
    - HiveQL 지원
    - 클라우데라는 HiveContext 를 권장한다.

```python
from pyspark.sql import HiveContext
sc = SparkContext()
sqlContext = HiveContext(sc)
```



### DataFrame

- Core Spark 의 RDD 와 유사하다.
- 컬럼명으로 조직된 정형데이터의 분산된 콜렉션
- Row 객체를 포함하는 base RDD 로 구성된다.



- 생성 방법
  - 정형 데이터소스로 부터 : Hive table, Parquet file, JSON file
  - RDD 로부터
  - 다른 DataFrame 의 연산이나 쿼리로부터
  - 프로그래밍으로 스키마를 정의해서

```python
peopleDF = sqlContext.read.json("people.json") # from JSON file
customerDF = sqlContext.read.table("customers") # from Hive/Impala Table

# DataFrameReader 세팅
sqlContext.read \
	.format("com.databricks.spark.avro") \
  .load("/loudacre/accounts_avro")
  
sqlContext.read \
	.format("jdbc") \
  .option("url", "jdbc:mysql://localhost/loudacre") \
  .option("dbtable", "accounts") \
  .option("user", "training") \
  .option("password", "training") \
  .load()
```



### DataFrame 연산

```python
peopleDF.dtypes
```



- Queries - 새로운 DataFrame 을 만든다.
  - DataFrame 은 Immutable 하다.
  - RDD Transformation 과 유사
  - distinct, join, limit, select, where (= filter)
- Actions - 드라이버에게 데이터를 반환한다.
  - 액션은 쿼리의 lazy execution 을 trigger 한다.
  - collect, take(n), count, show(n)



- `HiveContext` 를 사용하면, HiveQL 을 통해 Hive/Impala 테이블 (json 파일도 가능) 을 쿼리할 수 있다

  ```python
  sqlContext
  	.sql("""SELECT * FROM customers WHERE name LIKE "A%" """)
  ```

- save

  ```python
  peopleDF.wirte.saveAsTable("people")
  
  peopleDF.wirte \
  	.format("parquet") \
    .mode("append") \
    .partitionBy("age") \
    .saveAsTable("people")
  ```

- DataFrame to RDD (Row objects)

  ```python
  peopleRDD = peopleDF.rdd
  ```

- RDD to DataFrame

  ```python
  from pyspark.sql.types import*
  schema = StructType([StructField("age",IntegerType(),True),
  										 StructField("name",StringType(),True),
  										 StructField("pcode",StringType(),True)])
  myrdd = sc.parallelize([(40,"Abram","01601"),
  												(16,"Lucia","87501")])
  mydf = sqlContext.createDataFrame(myrdd,schema)
  ```



<br />

### Impala vs Spark SQL

- Impala 는 SQL 엔진에 특화되어 있다.
  - 쿼링에 훨씬 성능이 좋다.
  - Sentry 를 사용하면 보안에 강하다.
  - Interactive 쿼리, 데이터 분석에 좋다.
- Spark SQL 은 Spark 안에 내장되어 있고, 일반적인 목적 처리 엔진이다.
  - ETL
  - 스파크 애플리케이션에 의해 필요한 정형데이터에 접근에 용이하다.



### Spark 2.x

- SparkSession 이 SQLContext, HiveContext 를 대체
- DataSets
  - 정형데이터 특화. RDD의 대체
  - DataFrame 은 Datasets 의 Row objects 이다.
  - Spark Catalyst Optimizer 사용가능