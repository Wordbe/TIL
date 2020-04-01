# Spark 06 - DataFrame

## 1 Spark Session 초기화

데이터셋, 데이터프레임은 스파크 세션을 이용합니다. 스파크 세션을 초기화합니다.

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession
  .builder()
  .appName("Spark SQL basic example")
  .config("spark.some.config.option", "some-value")
  .getOrCreate()
```

스파크 쉘(spark-shell)을 이용할 경우 REPL 쉘이 스파크 세션 객체를 초기화합니다. 스파크 쉘 실행 시 SparkContext 와 Spark Session 을 생성했다는 메시지를 확인할 수 있습니다.

```shell
$ spark-shell --master yarn --queue queue_name
Spark context Web UI available at http://127.0.0.1:4040
Spark context available as 'sc' (master = yarn, app id = application_1520227878653_37974).
Spark session available as 'spark'.
scala> spark
res40: org.apache.spark.sql.SparkSession = org.apache.spark.sql.SparkSession@21840920
```

<br>

### Hive 메타스토어 연결

스파크 세션은 단독으로도 사용가능하지만, 하이브 메타스토어와 연결할 수 도 있습니다. 스파크 세션 생성시 `hive.metastore.uris` 값을 설정합니다.

```scala
// hive.metastore.uris 옵션에 하이브 메타스토어 접속 주소를 입력한다. 
val spark = SparkSession.builder().appName("sample").config("hive.metastore.uris", "thrift://hive_metastore_ip:hive_metastore_port").enableHiveSupport().getOrCreate()
```

```shell
// 데이터베이스 조회 
scala> spark.sql("show databases").show()
+-------------+
| databaseName|
+-------------+
|      test_db1|
|      test_db2|
```

<br>

---

## 2 DataFrame 초기화

<br>

### 2-1) 데이터 프레임 초기화

데이터 프레임은 스파크세션의 `read` 메소드로 생성할 수 있습니다. **`read`는 json, parquet, orc, text 등 다양한 형식의 데이터를 읽을 수 있습니다.** 상세한 정보는 스파크 세션 API와 데이터프레임 리더 API를 확인하시면 됩니다.

다음 예제는 스파크 세션을 이용하여 데이터 프레임을 초기화 하는 방법입니다. people.json 파일을 읽어서 데이터 프레임을 생성합니다.

```shell
// json 형식의 데이터 입력 
$ cat people.json
{"name":"Michael"}
{"name":"Andy", "age":30}
{"name":"Justin", "age":19}

val df = spark.read.json("/user/people.json")
scala> df.show()
+----+-------+
| age|   name|
+----+-------+
|null|Michael|
|  30|   Andy|
|  19| Justin|
+----+-------+
```

<br>

### 2-2) RDD를 이용한 데이터 프레임 초기화

RDD를 이용해서 데이터 프레임을 생성할 수도 있습니다. RDD를 이용한 데이터 초기화는 여러가지 방법이 있습니다. 스키마구조를 지정할 수도 있고, 지정하지 않으면 스파크에서 임시 칼럼명을 지정합니다.

<br>

### 2-3) 배열 RDD 데이터를 데이터프레임으로 초기화

단일 데이터의 데이터 프레임 초기화는 다음과 같습니다.

```shell
val wordsRDD = sc.parallelize(Array("a", "b", "c", "d", "a", "a", "b", "b", "c", "d", "d", "d", "d"))
val wordsDF = wordsRDD.toDF()

// 데이터 프레임 확인 
scala> wordsDF.show()
+-----+
|value|
+-----+
|    a|
|    b|
|    c|

// 칼럼명을 지정했을 때 
val wordsDF = wordsRDD.toDF("word")
scala> wordsDF.show()
+----+
|word|
+----+
|   a|
|   b|
|   c|
```

<br>

### 2-4) 복합구조의 RDD를 데이터 프레임으로 초기화

칼럼이 여러개인 데이터를 이용하여 데이터 프레임을 초기화는 다음과 같습니다.

```shell
val peopleRDD = sc.parallelize(
  Seq( ("David", 150),
       ("White", 200),
       ("Paul",  170) )
)

val peopleDF = peopleRDD.toDF("name", "salary")
scala> peopleDF.show()
+-----+------+
| name|salary|
+-----+------+
|David|   150|
|White|   200|
| Paul|   170|
+-----+------+
```

<br>

### 2-5) 스키마를 생성하여 데이터 프레임 초기화

스키마를 이용하여 데이터를 검증하면서 데이터 프레임을 초기화하 하는 방법은 다음과 같습니다.

```scala
import org.apache.spark.sql._
import org.apache.spark.sql.types._

// RDD를 Row 로 초기화 
val peopleRDD = sc.parallelize(
  Seq(
       Row("David", 150),
       Row("White", 200),
       Row("Paul",  170)
  )
)

// RDD를 데이터프레임으로 변형하기 위한 스키마 생성
val peopleSchema = new StructType().add(StructField("name",   StringType, true)).add(StructField("salary", IntegerType, true))

// 데이터 프레임 생성 
val peopleDF = spark.createDataFrame(peopleRDD, peopleSchema)

scala> peopleDF.show()
+-----+------+
| name|salary|
+-----+------+
|David|   150|
|White|   200|
| Paul|   170|
+-----+------+
```

<br>

### 2-6) 외부 데이터를 읽어서 데이터 프레임 초기화

외부 데이터를 읽어서 데이터 프레임을 초기화 할 수도 있습니다. json 형태의 파일은 구조를 가지고 있기 때문에 자동으로 스키마를 생성합니다. txt 형태의 파일은 구조가 없기 때문에 스키마를 생성하여 초기화 합니다.

<br>

#### TXT 파일을 이용한 데이터 프레임 초기화

TXT 파일은 다음의 예제 처럼 읽은 데이터를 구조화하여 RDD로 생성하고, 스키마를 생성하여 초기화 하면 됩니다.

```shell
$ hadoop fs -cat /user/shs/people.txt
A, 29
B, 30
C, 19
D, 15
F, 20
```

```scala
val peopleRDD = sc.textFile("/user/people.txt")
val peopleSchema = new StructType().add(StructField("name",   StringType, true)).add(StructField("age", IntegerType, true))
val sepPeopleRdd = peopleRDD.map(line => line.split(",")).map(x => Row(x(0), x(1).trim.toInt))
val peopleDF = spark.createDataFrame(sepPeopleRdd, peopleSchema)
```

```shell
scala> peopleDS.show()
+----+---+
|name|age|
+----+---+
|   A| 29|
|   B| 30|
|   C| 19|
|   D| 15|
|   F| 20|
+----+---+
```

<br>

#### JSON 파일을 이용한 데이터 프레임 초기화

JSON 형태의 파일은 데이터가 구조화 되어 있기 때문에 자동으로 초기화 됩니다.

```shell
$ hadoop fs -cat /user/shs/people.json
{"name":"Michael"}
{"name":"Andy", "age":30}
{"name":"Justin", "age":19}
```



```shell
val peopleDF = spark.read.json("/user/shs/people.json")

scala> peopleDF.show()
+----+-------+
| age|   name|
+----+-------+
|null|Michael|
|  30|   Andy|
|  19| Justin|
+----+-------+
```

<br>

---

## 3 DataFrame 연산

데이터 프레임 연산 방법에 대해 알아봅니다. 데이터 프레임은 스키마 구조를 가지고 있어서 쿼리를 날리는 것처럼 작업할 수 있습니다.

데이터 프레임은 구조화된 형태의 데이터를 명령어 체인을 통해 연산할 수 도 있고, SQL 을 이용할 수도 있습니다.

### Schema 확인

`printSchema`를 이용합니다. 현재 데이터프레임의 구조를 출력합니다.

```scala
val df = spark.read.json("/user/people.json")
```

```shell
scala> df.printSchema()
root
 |-- age: long (nullable = true)
 |-- name: string (nullable = true)

scala> df.show()
+----+-------+
| age|   name|
+----+-------+
|null|Michael|
|  30|   Andy|
|  19| Justin|
+----+-------+
```

<br>

### 조회

`select`를 이용합니다. 칼럼 데이터에 대한 연산을 하려면 $(달러기호)를 이용하여 처리합니다.

```shell
// name 칼럼만 조회 
scala> df.select("name").show()
+-------+
|   name|
+-------+
|Michael|
|   Andy|
| Justin|
+-------+

// name, age 순으로 age에 값을 1더하여 조회 
scala> df.select($"name", $"age" + 1).show()
+-------+---------+
|   name|(age + 1)|
+-------+---------+
|Michael|     null|
|   Andy|       31|
| Justin|       20|
+-------+---------+
```

<br>

### show() 함수 설정

조회 결과를 확인하는 show() 함수 이용 시, 데이터 길이와 칼럼의 사이즈를 제한하여 출력할 수도 있습니다.

```scala
// show 함수 선언
def show(numRows: Int, truncate: Boolean): Unit = println(showString(numRows, truncate))
```

```shell
// 사용 방법
scala> show(10, false)
scala> show(100, true)
```

<br>

### Filtering

`filter`를 이용합니다.

```shell
// 필터링 처리 
scala> df.filter($"age" > 21).show()
+---+----+
|age|name|
+---+----+
| 30|Andy|
+---+----+

// select에 filter 조건 추가 
scala> df.select($"name", $"age").filter($"age" > 20).show()
scala> df.select($"name", $"age").filter("age > 20").show()
+----+---+
|name|age|
+----+---+
|Andy| 30|
+----+---+
```

### Grouping

`groupBy`를 이용합니다.

```shell
// 그룹핑 처리 
scala> df.groupBy("age").count().show()
+----+-----+
| age|count|
+----+-----+
|  19|    1|
|null|    1|
|  30|    1|
+----+-----+
```

### column 추가

새로운 칼럼을 추가할 때는 `withColumn`을 이용합니다.

```shell
// age가 NULL일 때는 KKK, 값이 있을 때는 TTT를 출력 
scala> df.withColumn("xx", when($"age".isNull, "KKK").otherwise("TTT")).show()
+----+-------+---+
| age|   name| xx|
+----+-------+---+
|null|Michael|KKK|
|  30|   Andy|TTT|
|  19| Justin|TTT|
+----+-------+---+
```

<br>

## 데이터프레임의 SQL을 이용한 데이터 조회

데이터프레임은 SQL 쿼리를 이용하여 데이터를 조회할 수 있습니다. 데이터프레임을 이용하여 뷰를 생성하고, SQL 쿼리를 실행하면 됩니다.

<br>

### 뷰생성

데이터프레임을 SQL로 조회하기 위해서 데이터프레임에 이름을 부여해주어야 합니다. `createOrReplaceTempView`를 이용하여 데이터프레임을 뷰로 등록하고, SQL에서 사용합니다.

```
val df = spark.read.json("/user/people.json")

// DataFrame으로 뷰를 생성 
df.createOrReplaceTempView("people")

// 스파크세션을 이용하여 SQL 쿼리 작성 
scala> spark.sql("SELECT * FROM people").show()
+----+-------+
| age|   name|
+----+-------+
|null|Michael|
|  30|   Andy|
|  19| Justin|
+----+-------+
```

<br>

### SQL 사용

생성한 뷰를 이용하여 데이터베이스에 문의하듯이 SQL을 호출하면 됩니다.

```shell
// 조회 조건 추가 
scala> spark.sql("SELECT * FROM people WHERE age > 20").show()
+---+----+
|age|name|
+---+----+
| 30|Andy|
+---+----+

// 그룹핑 추가 
scala> spark.sql("SELECT age, count(1) FROM people GROUP BY age").show()
+----+--------+
| age|count(1)|
+----+--------+
|  19|       1|
|null|       1|
|  30|       1|
+----+--------+
```

<br>



---

**Reference**

https://wikidocs.net/28531

https://wikidocs.net/28555

https://wikidocs.net/28555