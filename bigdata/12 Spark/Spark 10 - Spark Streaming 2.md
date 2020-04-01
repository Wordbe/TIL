# Spark 10 - Spark Streaming 2

# 4 Window Transformation

디스트림의 트랜스포메이션 연산은 **상태가 없는 연산(stateless)**과 **상태를 가지는 연산(stateful)**으로 나눌수 있습니다.

**상태가 없는 연산은 각 배치의 처리가 이전 배치의 데이터와 상관없이 진행**됩니다. `map`, `filter`, `reduce` 같은 **일반적인 트랜스포메이션 연산**입니다. 상**태를 가지는 연산은 이전 배치의 데이터나 중간 데이터를 이용하여 연산을 처리**합니다. 슬라이딩 윈도우와 시간별 상태를 추적하는 연산입니다. `updateStateByKey`, `reduceByWindow` 연산을 이용한 연산입니다.

### 체크 포인트

상태를 가지는 연산은 체크포인트 설정을 해주어야 합니다. 스트리밍 컨텍스트의 `checkpoint`를 이용하여 설정합니다.

```scala
ssc.checkpoint("/user/checkpoint/")
```

체크포인트를 설정하면 윈도우 트랜스포메이션의 중간계산 결과가 다음과 같이 임시 데이터로 저장됩니다.

```shell
$ hadoop fs -ls /user/checkpoint/
Found 12 items
drwxr-xr-x   - hadoop hadoop          0 2019-01-29 09:10 /user/checkpoint/5ec9afdf-200a-4300-a297-1c313849ebe4
-rw-r--r--   2 hadoop hadoop       5927 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753025000
-rw-r--r--   2 hadoop hadoop       5919 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753030000
-rw-r--r--   2 hadoop hadoop       5927 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753035000
-rw-r--r--   2 hadoop hadoop       5923 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753035000.bk
-rw-r--r--   2 hadoop hadoop       5920 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753040000
-rw-r--r--   2 hadoop hadoop       5928 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753045000
-rw-r--r--   2 hadoop hadoop       5925 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753045000.bk
-rw-r--r--   2 hadoop hadoop       5917 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753050000
-rw-r--r--   2 hadoop hadoop       5912 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753055000
-rw-r--r--   2 hadoop hadoop       5923 2019-01-29 09:10 /user/checkpoint/checkpoint-1548753055000.bk
drwxr-xr-x   - hadoop hadoop          0 2019-01-29 09:10 /user/checkpoint/receivedBlockMetadata
```



## 윈도우 트랜스포메이션

윈도우 연산은 여러 배치들의 결과를 합쳐서 디스트림 배치 간격보다 훨씬 긴시간 간격에 대한 결과를 계산합니다.

모든 윈도우 연산은 **윈도우 시간(window duration)과 슬라이딩 시간(sliding duration)**을 필요로 하며, 이 두가지 값은 모두 디스트림 배치 간격의 배수여야 합니다.

![window](https://spark.apache.org/docs/2.2.0/img/streaming-dstream-window.png) 윈도우 시간은 처리에 필요한 시간의 개수이고, 슬라이딩 시간은 처리 시간 간격입니다. 위 그림에서 윈도우 시간은 3이 되고, 슬라이딩 시간은 2입니다.

<br>

## 윈도우 트랜스포메이션 예제

`reduceByKeyAndWindow`를 이용한 윈도우 연산은 다음과 같이 처리합니다. 스트리밍 워드 카운트와 동일한 연산을 처리하고, 윈도우 연산을 위한 단계가 하나더 추가 됩니다.

윈도우에 들어가는 배치를 위한 계산과, 윈도우에서 벗어나는 배치를 위한 연산을 추가하고, 윈도우 시간과 슬라이딩 시간 간격을 입력하면 처리할 수 있습니다.

```scala
import org.apache.spark._
import org.apache.spark.streaming._

val ssc = new StreamingContext(sc, Seconds(5))
val lines = ssc.socketTextStream("1.1.1.1", 9999)
val words = lines.flatMap(_.split(" "))
val pairs = words.map(word => (word, 1))
val wordCounts = pairs.reduceByKey(_ + _)

// 체크 포인트 설정 
ssc.checkpoint("/user/checkpoint")
// 윈도우 트랜스포메이션 설정 
val wordCountWindow = wordCounts.reduceByKeyAndWindow( 
    {(x, y) => x + y}, // 윈도에 들어가는 새로운 배치들의 계산 
    {(x, y) => x - y}, // 윈도에서 벗어나는 범위의 값을 계산 
    Seconds(30), // 윈도우 시간 
    Seconds(10)  // 슬라이딩 시간 
)
wordCountWindow.print()

ssc.start()
ssc.awaitTermination()
```

<br>

## 실행

스트리밍 윈도우 예제를 실행하고 넷캣을 이용하여 다음과 같이 실행합니다.

```shell
$ nc -l 9999
a b c d a b c d a a a
a b c d a b c d a a a
```

그리고 스트리밍 윈도우가 다음과 같이 처리합니다. 데이터의 처리 간격(슬라이딩 시간)은 10초이고, 윈도우 시간 간격은 30초입니다. 30초전의 데이터를 이용해서 10초마다 데이터를 처리합니다.

```shell
cala> ssc.start()    // 데이터 받기 시작 
-------------------------------------------                                     
Time: 1548749875000 ms - 2019년 January 29일 Tuesday AM 8:17:55
-------------------------------------------
(d,2)
(b,2)
(,1)
(a,5)
(c,2)

-------------------------------------------
Time: 1548749885000 ms - 2019년 January 29일 Tuesday AM 8:18:05
-------------------------------------------
(d,4)
(b,4)
(,1)
(a,10)
(c,4)

-------------------------------------------
Time: 1548749895000 ms - 2019년 January 29일 Tuesday AM 8:18:15
-------------------------------------------
(d,4)
(b,4)
(,1)
(a,10)
(c,4)

-------------------------------------------
Time: 1548749905000 ms - 2019년 January 29일 Tuesday AM 8:18:25
-------------------------------------------
(d,2)
(b,2)
(,0)
(a,5)
(c,2)

-------------------------------------------
Time: 1548749915000 ms - 2019년 January 29일 Tuesday AM 8:18:35
-------------------------------------------
(d,0)
(b,0)
(,0)
(a,0)
(c,0)
```

<br>

---

# 5 DStream연산

디스트림의 연산은 이전에 살펴 본 트랜스포메이션 연산, 윈도우 연산 외에 조인, 유니온 연산, 출력 연산을 이용할 수 있습니다.



## 조인, 유니온 연산

스트림의 조인과 유니온 연산도 쉽게 처리할 수 있습니다. 스트림끼리의 연산은 `join`, `leftOuterJoin`, `rightOuterJoin`, `fullOuterJoin`, `union` 연산을 이용해서 처리할 수 있습니다.

### 디스트림간의 연산

```scala
val stream1: DStream[String, String] = ...
val stream2: DStream[String, String] = ...
val joinedStream = stream1.join(stream2)
```

조인의 윈도우 연산도 쉽게 처리할 수 있습니다. 다음과 같이 `window`를 이용하여 시간간격을 입력하면 됩니다.

```scala
val windowedStream1 = stream1.window(Seconds(20))
val windowedStream2 = stream2.window(Minutes(1))
val joinedStream = windowedStream1.join(windowedStream2)
```

<br>

#### 조인 연산 예제

```scala
import org.apache.spark._
import org.apache.spark.streaming._

val ssc = new StreamingContext(sc, Seconds(5))
val lines1 = ssc.socketTextStream("1.1.1.1", 9999)
val wordCounts1 = lines1.flatMap(_.split(" ")).map(word => (word, 1)).reduceByKey(_ + _)

val lines2 = ssc.socketTextStream("1.1.1.1", 9998)
val wordCounts2 = lines2.flatMap(_.split(" ")).map(word => (word, 1)).reduceByKey(_ + _)

val unionStream = wordCounts1.union(wordCounts2)
unionStream.print()

ssc.start()
```

<br>

### RDD와 디스트림간 연산

RDD와 디스트림간의 연산도 `transform`을 이용해서 처리 가능합니다.

```scala
val dataset: RDD[String, String] = ...
val windowedStream = stream.window(Seconds(20))...
val joinedStream = windowedStream.transform { rdd => rdd.join(dataset) }
```



## 출력 연산

디스트림 연산의 결과는 출력 연산(Output Operation)을 이용해서 **파일시스템이나 데이터베이스에 외부 저장소에 저장**할 수 있습니다.

| 함수                                    | 비고                                                         |
| :-------------------------------------- | :----------------------------------------------------------- |
| print()                                 | 디스트림 배치의 데이터에서 10개를 출력. 디버그용             |
| saveAsTextFiles(*prefix*, [*suffix*])   | 디스트림 배치의 데이터를 **텍스트 파일**로 저장. 파일 명은 prefix-TIME_IN_MS[.suffix]로 저장 |
| saveAsObjectFiles(*prefix*, [*suffix*]) | 디스트림 배치의 데이터를 **시퀀스 파일**로 저장.             |
| saveAsHadoopFiles(*prefix*, [*suffix*]) | 디스트림 배치의 데이터를 **하둡 파일**로 저장                |
| foreachRDD(func)                        | 디스트림에 함수를 적용하여 RDD를 생성하고 이를 출력하는 범용적인 출력 연산. 주어진 함수는 외부 시스템에 데이터를 쓰는 함수. |

<br>

### 파일 저장

파일을 저장하는 함수는 저장할 디렉토리와 접미어를 파라미터로 받습니다. 각 배치의 결과는 주어진 디렉토리아래 저장되고 저장시간과 접미어가 폴더명으로 생성됩니다.

```scala
wordCounts.saveAsTextFiles("/user/stream/txt_data", "txt")
```

파일로 저장하면 다음과 같이 주어진 폴더명으로 디렉토리를 생성하고 시간대별로 폴더를 생성하여 데이터를 저장합니다.

```shell
$ hadoop fs -ls -R /user/shs/stream/
drwxr-xr-x   - hadoop hadoop          0 2019-01-29 10:21 /user/shs/stream/txt_data-1548757278000.txt
-rw-r--r--   2 hadoop hadoop          0 2019-01-29 10:21 /user/shs/stream/txt_data-1548757278000.txt/_SUCCESS
-rw-r--r--   2 hadoop hadoop         12 2019-01-29 10:21 /user/shs/stream/txt_data-1548757278000.txt/part-00000
-rw-r--r--   2 hadoop hadoop         12 2019-01-29 10:21 /user/shs/stream/txt_data-1548757278000.txt/part-00001
drwxr-xr-x   - hadoop hadoop          0 2019-01-29 10:21 /user/shs/stream/txt_data-1548757281000.txt
```

<br>

### foreachRDD를 이용한 범용 연산

`foreachRDD`를 이용한 연산은 RDD의 모든 연산을 사용할 수 있습니다. 이를 이용해서 외부 DB에 데이터를 저장할 수 있습니다.

```scala
dstream.foreachRDD { rdd =>
  val connection = createNewConnection()  // executed at the driver
  rdd.foreach { record =>
    connection.send(record) // executed at the worker
  }
}
```







---

**Reference**

https://wikidocs.net/29108

https://wikidocs.net/29109