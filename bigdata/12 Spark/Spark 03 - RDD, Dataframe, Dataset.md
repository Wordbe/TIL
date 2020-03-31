# Spark 03 - RDD, Dataframe, Dataset

스파크 애플리케이션 구현 방법은 Spark v1에서 발표한 RDD를 이용하는 방법, Spark v2 에서 RDD 단점을 개선하여 발표한 Dataset과 DataFrmae을 이용하는 방법 두 가지가 있습니다.

<br>

## RDD

Resilient Distributed Dataframe, 2014년 정식 출시된 스파크 v1은 RDD API를 시용하여 데이터를 처리하였습니다. 인메모리를 최적화하여 속도를 높일 수 있었지만, 테이블 join 효율화 같은 처리를 사용자가 직접 제어해야 하므로 최적화에 어려움을 겪었습니다.

```scala
// RDD 예제 
val data = Array(1, 2, 3, 4, 5)
val distData = sc.parallelize(data)
distData.map(x => if(x >= 3) x else 0).reduce((x, y) => x + y)
```

<br>

## DataFrame

데이터프레임은 스파크 1.3에서 처리 속도증가를 위해 프로젝트 텅스텐의 일부로 소개되었습니다. 데이터를 스키마 형태로 추상화하고, 카탈리스트 옵티마이저가 쿼리를 최적화하여 처리합니다.

```scala
val df = spark.read.json("examples/src/main/resources/people.json")
df.select($"name", $"age").filter($"age" > 20).show()
df.groupBy("age").count().show()
```

<br>

## Dataset

데이터셋은 스파크 1.6에서 추가되었습니다. 데이터의 타입체크, 데이터 직렬화를 위한 인코더, 카탈리스트 옵티마이저를 지원하여 데이터 처리 속도를 증가시켰습니다.

스파크 2.0에서 DataFrame과 Dataset을 통합하였습니다. 스칼라 API에서 Dataset[Row]은 DataFrame을 의미합니다.

```scala
// 데이터셋 예제 
val path = "examples/src/main/resources/people.json"
val peopleDS = spark.read.json(path).as[Person]
peopleDS.show()
```

스파크 애플리케이션을 개발할 때 RDD는 스파크 컨텍스트(SparkContext)를 이용하고, Dataset과 DataFrame은 스파크 세션(SparkSession) 객체를 이용합니다. 스파크 세션에서는 SQL을 이용하여 데이터를 처리할 수도 있습니다. sQL과 데이터셋, 데이터프레임을 이용한 처리는 동일한 엔진을 이용하므로 사용자에게 편리한 API를 이용하면 됩니다.

<br>

---

# RDD

## 1 SparkContext, RDD 초기화

RDD는 외부 데이터를 읽어서 처리하거나, 자체적으로 컬렉션 데이터를 생성하여 처리할 수도 있습니다. 데이터 처리는 **파티션 단위로 분리하여 작업을 처리**합니다.



RDD는 **트랜스포메이션(transformation)**, **액션(action)** 두가지 타입의 연산을 가지고 있습니다. 

* 트랜스포메이션 : 필터링 같은 작업으로 RDD에서 새로운 RDD를 반환합니다. 
* 액션 : RDD로 작업을 처리하여 결과를 반환합니다. 

스파크는 **지연 처리(lazy evalution)를 지원**하여 트랜스포메이션을 호출할 때는 작업을 처리하지 않고, 액션을 호출하는 시점에 작업을 처리하여 작업의 효율성을 제공합니다.

RDD는 액션이 실행될 때마다 새로운 연산을 처리합니다. **작업의 처리 결과를 재사용하고 싶으면 `persist()` 메소드를 사용하여 결과를 메모리에 유지하도록 할 수 있습니다.**

**RDD는 스파크 컨텍스트(SparkContext) 객체를 이용하여 생성**할 수 있습니다. 

<br>

### 스파크 컨텍스트 초기화

스파크 컨텍스트 객체는 `SparkConf` 객체를 이용해서 설정값을 생성하고, 이를 이용해서 초기화할 수 있습니다.

```scala
import org.apache.spark.SparkContext
import org.apache.spark.SparkConf

// SparkContext 객체 초기화 
// 클러스터 매니저의 타입 지정
val conf = new SparkConf().setAppName("sample").setMaster("yarn")
val sc = new SparkContext(conf)
```

<br>

스파크 쉘(spark-shell)을 이용할 경우 REPL쉘이 스파크 컨텍스트 객체를 생성합니다. 스파크 쉘 실행시 스파크 컨텍스트와 스파크 세션을 생성했다는 메세지를 확인할 수 있습니다.

```shell
$ spark-shell --master yarn --queue queue_name
Spark context Web UI available at http://127.0.0.1:4040
Spark context available as 'sc' (master = yarn, app id = application_1520227878653_37974).
Spark session available as 'spark'.
scala> sc
res0: org.apache.spark.SparkContext = org.apache.spark.SparkContext@3c910acd
```

<br>

## RDD 초기화

RDD는 내부 데이터 또는 외부 저장소의 데이터를 이용하는 두가지 방법으로 초기화할 수 있습니다.

### 1) 내부 데이터 이용(Parallelized Collections)

내부 데이터는 스파크 컨텍스트의 `parallelize()` 메소드를 이용하여 처리합니다. 사용자가 직접 데이터를 입력하여 생성합니다. 생성한 객체는 RDD 타입이고, 해당 객체를 `map()`, `reduce()`, `filter()` 등의 RDD 연산을 이용하여 처리할 수 있습니다.

```scala
val data = Array(1, 2, 3, 4, 5)
val distData = sc.parallelize(data)
val distData = sc.parallelize(data, 5)  // 파티션 개수 지정 

// 리듀스 처리 - 모든 수 더하기 
scala> distData.reduce((a, b) => a + b)
res26: Int = 15

// 맵으로 3이상일때만 모든수 더하기 
scala> distData.map(x => if(x >= 3) x else 0).reduce((x, y) => x + y)
res27: Int = 12

// 필터를 이용하여 4이상일때만 더하기 
scala> distData.filter(_ >= 4).reduce(_ + _)
res29: Int = 9    
```

<br>

### 2) 외부 데이터 이용

외부 데이터는 스파크 컨텍스트의 `textFile()` 메소드를 이용하여 처리합니다. 스파크는 HDFS, S3, hbase 등 다양한 파일시스템을 지원합니다. 생성한 객체는 RDD 타입이므로 RDD 연산을 이용하여 처리할 수 있습니다.

```scala
// 로컬파일을 지정하면 워커노드도 동일한 위치에 파일이 있어야 함 
val distFile = sc.textFile("data.txt")
// s3의 파일도 지정가능 
val distFile = sc.textFile("s3://your-bucket/data.txt")
// hdfs의 파일도 지정가능 
val distFile = sc.textFile("hdfs:///user/data.txt")
// 디렉토리를 지정하면 하위의 모든 파일을 처리 
val distFile = sc.textFile("hdfs:///user/")
// 와일드 카드 사용 가능 
val distFile = sc.textFile("hdfs:///user/*.txt")
// 압축파일도 지정 가능 
val distFile = sc.textFile("hdfs:///user/*.gz")

// RDD 객체 생성 확인 
scala> val distFile = sc.textFile("data.txt")
distFile: org.apache.spark.rdd.RDD[String] = data.txt MapPartitionsRDD[10] at textFile at <console>:26
```





---

**Reference**

https://wikidocs.net/28377

https://wikidocs.net/28387

https://wikidocs.net/28387