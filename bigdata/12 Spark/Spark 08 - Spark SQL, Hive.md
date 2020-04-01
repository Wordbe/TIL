# Spark 08 - Spark SQL, Hive

# 1 하이브 메타스토어 연결

스파크 세션을 초기화할 때 `hive.metastore.uris` 정보를 제공하여 하이브 메타스토어와 연결합니다. `sql`을 이용하여 스파크 SQL을 처리할 수 있습니다.

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder().appName("sample").config("hive.metastore.uris",
"thrift://hive_metastore_ip:hive_metastore_port").enableHiveSuport().getOrCreate()

// 스칼라 세션을 이용한 조회
spark.sql("SELECT * FROM temp")

// 스칼라 쉘(scala-shell 에서 이용 방법)
sql("SELECT * FROM temp")
```

<br>

## 스파크 SQL 쿼리

스파크 SQL은 하이브의 people 테이블을 이용하여 확인해 보겠습니다. people 테이블은 name, age 칼럼을 가지는 테스트용 테이블입니다.

```shell
-- 하이브 쿼리 
hive> select * from people;
OK
david   15
paul    32
smith   40
jin 27
ryan    46
```

<br>

### 조회

데이터 조회는 `SELECT`를 이용합니다. `sql`을 이용하여 조회를 하면 데이터프레임이 반환되는 것을 확인할 수 있습니다.

```shell
scala> sql("select * from people")
res19: org.apache.spark.sql.DataFrame = [name: string, age: int]

scala> sql("select * from people").show()
+-----+---+                                                                     
| name|age|
+-----+---+
|david| 15|
| paul| 32|
|smith| 40|
|  jin| 27|
| ryan| 46|
+-----+---+
```

<br>

### 조인

조인은 SQL 을 이용하여 조인을 할 수도 있고, 데이터프레임의 조인 명령을 이용할 수도 있습니다.

#### 1) SQL을 이용한 조인

표준 SQL의 조인 명령을 그대로 사용할 수 있습니다.

```scala
scala> sql("""SELECT a.name, b.age 
     |          FROM people a, people b
     |         WHERE a.name = b.name""").show()
+-----+---+                                                                     
| name|age|
+-----+---+
|david| 15|
| paul| 32|
|smith| 40|
|  jin| 27|
| ryan| 46|
+-----+---+
```

<br>

#### 2) 데이터프레임을 이용한 조인

데이터 프레임을 이용한 조인은 명령어 체인을 이용하여 처리할 수 있습니다.

```scala
val peopleA = sql("select name, age as a_age from people")
val peopleB = sql("select name, age as b_age from people")
```

```shell
scala> peopleA.join(peopleB, "name").select("a_age").show()
+-----+                                                                         
|a_age|
+-----+
|   15|
|   32|
|   40|
|   27|
|   46|
+-----+
```

---

### 저장

데이터를 저장하는 방법은 `write`를 이용합니다. 저정 데이터의 포맷과 저장 모드를 지정하고 저장 위치를 전달하면 데이터를 저장합니다.

`coalesce`를 이용하여 파티션의 개수를 지정하여 파티션의 개수(최종 파일의 개수)를 지정할 수 있습니다.

> coalesce : "연합하다, 합치다"

```shell
sql("""select * from people""")
.coalesce(1).write.format("json")
.mode(SaveMode.Overwrite).save("/user/people")
```

파일은 다음과 같은 형태로 저장됩니다.

```shell
$ hadoop fs -ls /user/people/
Found 2 items
-rw-r--r--   2 hadoop hadoop          0 2019-01-30 06:04 /user/people/_SUCCESS
-rw-r--r--   2 hadoop hadoop        126 2019-01-30 06:04 /user/people/part-r-00000-d88fccf6-4468-4490-bb91-ba96721fac85.json
```

<br>

---

# 2 UDF

스파크 SQL은 기본적으로 제공하는 함수외에 사용자가 함수(UDF. User Defined Function)를 만들어서 사용할 수도 있습니다. 스파크 세션에 함수를 등록하고 쿼리에 직접 사용할 수도 있고, 메소드 체인에 연결하여 사용할 수도 있습니다.

### 스파크 세션 등록

스파크 세션에 함수를 등록하고 사용할 때는 `register`를 이용합니다. 등록하는 함수의 이름과 등록할 함수를 전달합니다.

```scala
// 함수 생성
object UDFs {
    def uppercase(param: String): String = param.toUpperCase()
}

// 스파크 세션에 UDF로 등록
spark.udf.register("uppercase", UDFs.uppercase_)
```



```shell
scala> sql("""select uppercase(name) from people""").show()
+---------+                                                                     
|UDF(name)|
+---------+
|    DAVID|
|     PAUL|
|    SMITH|
|      JIN|
|     RYAN|
+---------+
```

<br>

### 메소드 체인에서 사용

메소드 체인에서 직접 사용하기 위해서는 UDF 함수로 변환해 주어야 합니다. `udf`로 함수를 한번 더 감싸주면 메소드 체인에서 직접 이용할 수 있습니다.

```scala
import org.apache.spark.sql.functions.udf
val upper = udf(UDFs.uppercase _)
```

```scala
scala> peopleDF.withColumn("nameUpper", upper(peopleDF("name"))).show()
+-----+-----+---------+                                                         
| name|a_age|nameUpper|
+-----+-----+---------+
|david|   15|    DAVID|
| paul|   32|     PAUL|
|smith|   40|    SMITH|
|  jin|   27|      JIN|
| ryan|   46|     RYAN|
+-----+-----+---------+

scala> peopleDF.select(upper(peopleDF("name"))).show()
+-----------+                                                                   
|upper(name)|
+-----------+
|      DAVID|
|       PAUL|
|      SMITH|
|        JIN|
|       RYAN|
+-----------+
```

<br>

### 하이브 UDF 사용

스파크 SQL에서는 하이브 UDF를 그대로 사용할 수 있습니다. 기존에 사용하던 하이브 쿼리를 그대로 이용하면 됩니다. **주의 할 점은 버전에 따라 ADD JAR 명령에서 오류가 발생할 수도 있습니다.** 이때는 스파크 실행시에 --jars 옵션을 이용하여 jar 파일을 추가하면 됩니다.

```shell
sql("""ADD JAR hdfs:///user/sample.jar""")
sql("""CREATE TEMPORARY FUNCTION sampleudf AS 'sdk.hive.SampleUDF'""")
sql("""SELECT sampleudf('a')""")
```





---

**Reference**

https://wikidocs.net/29386

https://wikidocs.net/29410