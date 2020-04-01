# Spark 09 - Spark Streaming

실시간 데이터 분석은 페이지 뷰에 대한 통계를 추적하거나, 머신러닝 모델을 학습시킬 수 있습니다. 로그 분석을 통해서 실시간으로 에러를 감지할 수도 있고, 현재 사용자의 구매 패턴을 분석하여 물품 추천을 할 수도 있습니다.

스파크 스트리밍은 실시간 데이터 분석을 위한 스파크의 컴포넌트 입니다. 스파크 컴포넌트에 대해서 예제를 통해 알아보겠습니다.

# 1 디스트림(DStream)

스파크 스트리밍은 실시간 데이터 분석을 위한 스파크 컴포넌트입니다. 데이터는 카프카(Kafka), 플럼(Flume), HDFS, S3, 키네시스(Kinesis), 트위터(Twitter), TCP 소켓 등 다양한 경로에서 입력을 받고, `map`, `reduce`, `window` 등 연산을 통해 데이터를 분석하여 최종적으로 파일시스템, 데이터베이스, 대시보드 등에 적재 됩니다. 또한 데이터를 스파크의 머신러닝(MLlib), 그래프 컴포넌트(GraphX)에 이용할 수도 있습니다.

![](https://spark.apache.org/docs/2.2.0/img/streaming-arch.png)

스파크 스트리밍은 실시간 데이터 스트림을 받아서 데이터를 디스트림(Distream, Distretized stream, 이산 스트림)이라 불리는 추상화 개념의 작은 배치 단위로 나누고 디스트림을 스파크 엔진으로 분석합니다.

![](https://spark.apache.org/docs/2.2.0/img/streaming-flow.png)

**디스트림은 시간별로 도착한 데이터들의 연속적인 모임**입니다. 각 디스트림은 시간별 RDD들의 집합으로 구성됩니다. 플럼, 카프카, HDFS 등 다양한 원천으로 부터 디스트림을 입력 받을 수 있습니다.

![dstream](https://spark.apache.org/docs/2.2.0/img/streaming-dstream.png) 디스트림은 RDD와 마찬가지로 두 가지 타입의 연산을 제공합니다. 하나는 새로운 디스트림을 만들어 낼 수 있는 트랜스포메이션 연산이고, 하나는 외부 시스템에 데이터를 써주는 출력 연산입니다. 디스트림은 RDD와 동일한 연산을 지원하며, 시간 관련이나 슬라이딩 윈도우 같은 실시간 분석을 위한 특별한 기능도 지원합니다.

<br>

---

# 2 스트리밍 컨텍스트 초기화

디스트림(DStream)은 스트리밍 컨텍스트를 이용하여 생성합니다. 스트리밍 컨텍스트는 스파크 config 객체나 스파크 context 객체를 이용하여 초기화 할 수 있습니다.

스트리밍 컨텍스트를 초기화 할 때는 디스트림의 처리 간격을 지정해야 합니다. 디스트림의 처리 간격이 스트림의 배치 단위가 됩니다.

#### 스파크 컨피그

스파크 컨피그를 이용하는 방법은 다음과 같이 스파크 컨텍스트나 스파크 세션 객체를 초기화할 때와 동일합니다. 스파크 컨피그에 설정 정보를 입력하고 이를 이용해서 초기화합니다.

```scala
import org.apache.spark._
import org.apache.spark.streaming._

val conf = new SparkConf().setMaster("yarn").setAppName("NetworkWordCount")
val ssc = new StreamingContext(conf, Seconds(1))    // 1초간격 배치 처리 
```

#### 스파크 컨텍스트

이미 스파크 컨텍스트 객체가 생성되어 있는경우, 스파크 컨피그를 이용하지 않고 **스파크 컨텍스트를 전달하는 방법으로 초기화** 할 수 있습니다. 스파크 쉘에서 스트리밍 컨텍스트를 이용할 때 사용할 수 있습니다.

```scala
import org.apache.spark._
import org.apache.spark.streaming._

// sc는 생성된 스파크 컨텍스트 객체 
val ssc = new StreamingContext(sc, Seconds(5))      // 5초간격 배치 처리 
```

<br>

---

# 3 Streaming Example

스파크 스트리밍의 동작 방식을 스트리밍 워드 카운트 예제를 통해서 알아보겠습니다. 스트리밍 워드 카운트는 데이터의 입력을 네트워크로 받는 점외에는 RDD를 이용한 워드 카운트 예제와 동일합니다.



## 스트리밍 워드 카운트

스트리밍 컨텍스트를 초기화 할 때 `Seconds(5)`를 전달하여 디스트림 처리 간격을 5초로 설정하였습니다.

`socketTextStream`을 이용해서 텍스트 데이터를 전달한 IP, port에 접속하여 입력 받습니다. 이 데이터를 워드 카운트 처리하고 `print`를 이용하여 화면에 출력합니다.

`start`를 호출하면 소켓 텍스트 스트림을 이용하여 원격지에 접속하여 텍스트 스트림을 입력 받습니다. `awaitTermination`을 이용하면 별도의 스레드로 작업을 시작하여 사용자의 세션이 끊어져도 계속 작업을 진행합니다.

```scala
import org.apache.spark._
import org.apache.spark.streaming._

val ssc = new StreamingContext(sc, Seconds(5))      // 5초간격 배치 처리 
val lines = ssc.socketTextStream("127.0.0.1", 9999) // 텍스트를 입력 받을 IP, port 입력 
val words = lines.flatMap(_.split(" "))
val pairs = words.map(word => (word, 1))
val wordCounts = pairs.reduceByKey(_ + _)
wordCounts.print()

ssc.start()             // 데이터 받기 시작 
ssc.awaitTermination()      // 별도의 스레드로 작업 시작 
```



## 실행

이 예제의 실행은 로그 데이터 전달을 위한 서버(netcat)와 클라이언트(스파크 스트리밍)를 실행하는 것으로 나눌 수 있습니다. 서버는 넷캣(netcat, nc)을 이용합니다.

## netcat 실행

`nc`명령을 다음과 같이 입력하면 9999 포트에서 TCP입력을 대기합니다. 연결되면 사용자 입력을 전달합니다.

```shell
# 9999 포트를 열어서 대기(listen)
$ nc -l 9999
a b c d a b c d a a a
```

## 스파크 스트리밍 실행

스파크 스트리밍은 위의 예제를 스파크 서브밋(spark-submit)을 이용하여 제출해도 되고, 스파크 쉘(spark-shell)을 이용하여 실행해도 됩니다. 스파크 서브밋을 이용하는 경우 위 예제를 입력하고 `start`를 호출하면 원격지에 접속하여 데이터를 전달 받고, 워드카운트를 처리하여 데이터를 출력합니다.

```shell
scala> ssc.start()    // 데이터 받기 시작 
-------------------------------------------
Time: 1548652935000 ms
-------------------------------------------
(d,2)
(b,2)
(a,5)
(c,2)
```

위와 같이 입력된 데이터를 시간 배치 간격으로 처리하여 출력합니다. 디스트림을 다음 처럼 시간간격으로 처리합니다.

![stream](https://spark.apache.org/docs/2.2.0/img/streaming-dstream-ops.png)





---

**Reference**

https://wikidocs.net/28982

https://wikidocs.net/28983

https://wikidocs.net/28985