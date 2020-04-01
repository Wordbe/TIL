# Spark 07 - Dataset, Spark 설정

## 4 데이터셋 초기화

데이터셋 연산에 대해서 알아보겠습니다. 데이타셋은 RDD와 유사하지만 객체를 직렬화 할때 자바의 기본 시리얼라이제이션이나 kyro를 사용하지 않고, 스파크의 인코더(Encoder) 를 이용하여 RDD 보다 속도가 빠릅니다.

![rdd,dataset,dataframe](https://indatalabs.com/wp-content/uploads/2017/04/pic-2-742x403.png)

<br>

### 데이터셋 초기화

데이터셋 초기화는 내부 데이터를 이용하는 방법과 외부 데이터를 이용하는 방법이 있습니다.

### 1) 내부 데이터 이용한 초기화

내부 데이터를 이용한 데이터셋 초기화는 다음과 같습니다.

```scala
val seq = Seq(
	("David", 150),
    ("White", 200),
    ("Paul", 170)
)
val peopleDS = seq.toDS()
```



```shell
scala> peopleDS.show()
+-----+---+
|   _1| _2|
+-----+---+
|David|150|
|White|200|
| Paul|170|
+-----+---+

scala> peopleDS.select("_1").show()
+-----+
|   _1|
+-----+
|David|
|White|
| Paul|
+-----+
```

<br>

### 케이스 클래스를 이용한 초기화

케이스 클래스를 이용한 내부 데이터 초기화는 다음과 같습니다. 케이스 클래스를 이용하면 데이터를 조회할 때 칼럼명을 이용할 수 있습니다.

```scala
case class People(name: String, salary: Int)
val peopleSeq = Seq(
	People("David", 150),
    People("White", 200),
    People("Paul", 170)
)
val peopleDS = peopleSeq.toDS()
```

```shell
scala> peopleDS.show()
+-----+------+
| name|salary|
+-----+------+
|David|   150|
|White|   200|
| Paul|   170|
+-----+------+


scala> peopleDS.select("salary").show()
+------+
|salary|
+------+
|   150|
|   200|
|   170|
+------+
```

<br>

### RDD를 데이터셋으로 초기화

RDD를 데이터셋으로 변환하기 위해서는 데이터 프레임으로 변경하고 데이터셋으로 변환하면 됩니다.

```scala
import org.apache.spark.sql._
import org.apache.spark.sql.types._

val peopleRDD = sc.textFile("/user/people.txt")
val peopleSchema = new StructType().add(StructField("name",   StringType, true)).add(StructField("age", IntegerType, true))
val sepPeopleRdd = peopleRDD.map(line => line.split(",")).map(x => Row(x(0), x(1).trim.toInt))
val peopleDF = spark.createDataFrame(sepPeopleRdd, peopleSchema)
peopleDF.show()

case class People(name: String, age: Long)
val peopleDS = peopleDF.as[People]
peopleDS.show()
```

<br>

### 데이타프레임을 데이터셋으로 초기화

데이터프레임을 데이터셋으로 변환하는 것은 데이터프레임에 정적데이터로 변경을 위해서 `as`를 이용해서 클래스를 지정해 주면 변환됩니다. 스키마와 클래스의 이름이 동일하면 자동으로 바인딩 됩니다.

```scala
case class People(name: String, age: Long)
val peopleDF = spark.read.json("/user/people.json")
val peopleDS = peopleDF.as[People]
```



```shell
scala> peopleDS.show()
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

## 5 Dataset 연산

DataFrame과 연산법이 동일합니다.

| 연산        | 내용           |
| ----------- | -------------- |
| 스키마 확인 | `printScheman` |
| 데이터 조회 | `select`       |
| 필터링      | `filter`       |
| 그룹핑      | `groupBy`      |
| 맵연산      | `map`          |

<br>

### 데이터셋의 SQL을 이용한 데이터 조회

데이터프레임은 SQL 쿼리를 이용하여 데이터를 조회할 수 있습니다. 데이터프레임을 이용하여 뷰를 생성하고, SQL 쿼리를 실행하면 됩니다.

### 뷰생성 및 SQL 사용

데이터프레임을 SQL로 조회하기 위해서 데이터프레임에 이름을 부여해주어야 합니다. `createOrReplaceTempView`를 이용하여 데이터프레임을 뷰로 등록하고, SQL에서 사용합니다.

```
// DataFrame으로 뷰를 생성 
peopleDS.createOrReplaceTempView("people")

// 스파크세션을 이용하여 SQL 쿼리 작성 
scala> spark.sql("""SELECT name, count(*) AS cnt
     |              FROM people
     |             WHERE age IS NOT NULL
     |             GROUP BY name""").show()
+------+---+
|  name|cnt|
+------+---+
|  Andy|  1|
|Justin|  1|
+------+---+
```

<br>

---

## 6 저장/불러오기

DataFrame과 Dataset 에서 데이털ㄹ 저장하고 불러오는 방법은 동일합니다.

### 데이터 저장

`save`를 이용합니다.

```scala
val peopleDF = spark.read.json("/user/people.json")
case class People(name: String, age: Long)
val peopleDS = peopleDF.as[People]

peopleDS.write.save("/user/ds")
peopleDF.wrtie.save("/user/df")
```

<br>

### 저장 포맷 지정

`format`을 이용하여 기본 저장 포맷을 지정할 수 있습니다. json, csv 등 형식을 제공합니다.

```scala
// 데이터 저장
peopleDS.select("name").write.format("json").save("/user/ds_1")
```

```shell
// 저장 위치 확인
$ hadoop fs -ls /user/ds_1/
Found 2 items
-rw-r--r--   2 hadoop hadoop          0 2019-01-24 07:19 /user/ds_1/_SUCCESS
-rw-r--r--   2 hadoop hadoop         53 2019-01-24 07:19 /user/ds_1/part-r-00000-88b715ad-1b5b-480c-8e17-7b0c0ea93e9f.json

// 저장 형식 확인
$ hadoop fs -text /user/ds_1/part-r-00000-88b715ad-1b5b-480c-8e17-7b0c0ea93e9f.json
{"name":"Michael"}
{"name":"Andy"}
{"name":"Justin"}
```

<br>

### 저장 모드(SaveMode)

데이터를 저장할 때 `mode`를 이용해서 파일을 덮어쓸 것인지, 이어쓸 것인지 설정할 수 있습니다. 설정은 다음과 같습니다.

| 설정                   | 비고                                               |
| :--------------------- | :------------------------------------------------- |
| SaveMode.ErrorIfExists | 파일이 있으면 에러 처리                            |
| SaveMode.Append        | 다른 이름으로 파일 추가                            |
| SaveMode.Overwrite     | 기존 파일을 삭제하고 추가                          |
| SaveMode.Ignore        | 파일이 있으면 저장하지 않고, 에러 처리도 하지 않음 |

다음과 같이 사용합니다.

```scala
// SaveMode 사용을 위해 import
import org.apache.spark.sql._

val peopleDF = spark.read.json("/user/people.json")
peopleDF.select("name", "age").write.mode(SaveMode.Overwrite).save("/user/people/")
```

<br>

---

### 테이블 저장

`saveAsTable` 을 이용합니다. 하이브 메타스토어에 연결되어 있다면 메타스토어의 정보를 이용해서 저장합니다.

```scala
peopleDF.select("name", "age").wrtie.saveAsTable("people")
```



### Bucketing, Sorting, Partitioning

데이터를 쓸 때 버켓팅, 정렬, 파티셔닝을 할 수 있습니다. 임시 테이블에서는 사용할 수 없습니다.

```scala
// 버켓팅
peopleDF.write.bucketBy(42, "name")
  .sortBy("age")
  .saveAsTable("people_bucketed")

// 파티셔닝
peopleDF.write.partitionBy("age")
  .format("json")
  .save("/user/people/")

// 파티셔닝, 버켓팅 
peopleDF.write.partitionBy("age")
  .bucketBy(42, "name")
  .saveAsTable("people_p_b")
```

<br>

### 데이터 불러오기

데이터를 불러올 때는 `load`를 이용합니다. 이전 예제에서 저장한 json 파일을 불러올때는 다음과 같이 사용합니다. 파일의 포맷을 지정할 때는 `format`을 이용하여 지정합니다.

```scala
val peopleDF = spark.read.format("json").load("/user/ds_1/")
```

```shell
scala> peopleDF.show()
+-------+
|   name|
+-------+
|Michael|
|   Andy|
| Justin|
+-------+
```



`read`에 설정된 파일로더 함수를 이용해도 됩니다.

```scala
val peopleDF = spark.read.json("/user/ds_1/")
```

```shell
scala> peopleDF.show()
+-------+
|   name|
+-------+
|Michael|
|   Andy|
| Justin|
+-------+
```

<br>

### 불러오기 포맷과 옵션 지정

`format`과 `option`을 이용하여 읽을 파일에 대한 옵션을 설정할 수도 있습니다.

```shell
$ cat people.csv
name,age
david,20
park,15
james,40
```

```scala
val peopleDF = spark.read.format("csv")
.option("sep", ",")
.option("inferSchema", "true")
.option("header", "true").load("/user/people.csv")
```

```shell
scala> peopleDF.show()
+-----+---+
| name|age|
+-----+---+
|david| 20|
| park| 15|
|james| 40|
+-----+---+
```

<br>

---

# 5. 스파크 설정

스파크 애플리케이션의 설정은 `SparkConf` 객체를 이용해서 설정합니다. 상세한 모든 설정값은 [스파크 설정 매뉴얼](https://spark.apache.org/docs/latest/configuration.html)을 참고합니다. 

### SparkConf 초기화

SparkConf 객체를 초기화 하는 방법은 다음과 같습니다.

```scala
import org.apache.spark.SparkContext
import org.apache.spark.SparkConf

// SparkContext 객체 초기화 
val conf = new SparkConf().setAppName("sample").setMaster("yarn")
conf.set("spark.executor.memory", "1g").set("spark.executor.cores", "1")
val sc = new SparkContext(conf)
```

<br>

### 메모리, 코어 설정

스파크 애플리케이션에서 사용할 메모리와 코어 설정은 다음과 같습니다.

| 설정                  | 기본값 | 비고                            |
| :-------------------- | :----- | :------------------------------ |
| spark.executor.memory | 512m   | 익스큐터가 사용할 메모리        |
| spark.executor.cores  | 1      | 애플리케이션에 사용할 코어 개수 |



---

**Reference**

https://wikidocs.net/28556

https://wikidocs.net/28567

https://wikidocs.net/28593

https://wikidocs.net/28679