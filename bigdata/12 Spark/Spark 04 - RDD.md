# Spark 04 - RDD

# 2 RDD 연산

RDD 연산은 트랜스포메이션과 액션이 있습니다. 

* Transformation : RDD를 이용해서 새로운 RDD를 생성
* Action : RDD를 이용해서 작업을 처리하여 드라이버에 반환하거나 파일시스템에 결과를 씀

스파크는 **지연 처리(lazy evalution)를 지원**하여 트랜스포메이션을 호출할 때는 작업을 처리하지 않고, 액션을 호출하는 시점에 작업을 처리(실제 계산 실행)하여 작업의 효율성을 제공합니다.



**예제)**

csv파일의 데이터를 읽어서 lines라는 RDD 객체를 생성하고, 각 라인의 글자 개수를 세는 **map 트랜스포메이션 함수**를 호출하고, 글자 수의 총합을 구하는 **reduce 액션 함수**를 호출합니다. map 함수를 호출할 때는 작업이 진행되지 않고, reduce 함수를 호출할 때는 클러스터에서 작업이 진행되는 것을 확인해봅니다.

```shell
// RDD 객체 생성 
scala> val lines = sc.textFile("/user/cctv_utf8.csv")
lines: org.apache.spark.rdd.RDD[String] = /user/shs/cctv_utf8.csv MapPartitionsRDD[7] at textFile at <console>:24

// map() 트랜스포메이션 호출시에는 반응 없음 
scala> val lineLengths = lines.map(s => s.length)
lineLengths: org.apache.spark.rdd.RDD[Int] = MapPartitionsRDD[8] at map at <console>:26

// reduce 액션 호출시 작업 처리 
scala> val totalLength = lineLengths.reduce((a, b) => a + b)
[Stage 1:> (0 + 0) / 2]
totalLength: Int = 18531244  
```

<br>

<br>

### 트랜스포메이션(Transformations)

트랜스포메이션은 RDD를 이용하여 데이터를 변환하고 RDD를 반환하는 작업입니다. 주요함수는 아래와 같습니다. 이외 모든 함수는 RDD API 문서를 참고합니다.

| 함수                                            | 설명                                                         |
| :---------------------------------------------- | :----------------------------------------------------------- |
| **map**(*func*)                                 | _func_로 처리된 새로운 데이터셋 반환                         |
| **filter**(*func*)                              | _func_에서 true를 반환한 값으로 필터링                       |
| **flatMap**(*func*)                             | _func_는 배열(혹은 Seq)을 반환하고, 이 배열들을 하나의 배열로 반환 |
| **distinct**([*numPartitions*])                 | 데이터셋의 중복을 제거                                       |
| **groupByKey**([*numPartitions*])               | 키를 기준으로 그룹핑 처리. (K, V) 쌍을 처리하여 (K, Iterable)로 반환 |
| **reduceByKey**(*func*, [*numPartitions*])      | 키를 기준으로 주어진 _func_로 처리된 작업 결과를 (K, V)로 반환 |
| **sortByKey**([*ascending*], [*numPartitions*]) | 키를 기준으로 정렬                                           |

트랜스포메이션은 다음처럼 사용할 수 있습니다. cctvRDD를 이용하여 처리한 트랜스포메이션은 결과값으로 RDD를 반환합니다. take 액션이 호출되기 전에는 실제 작업을 진행하지 않습니다.

```shell
// RDD 생성 
scala> val cctvRDD = sc.textFile("/user/cctv_utf8.csv")
cctvRDD: org.apache.spark.rdd.RDD[String] = /user/cctv_utf8.csv MapPartitionsRDD[1] at textFile at <console>:24

// 라인을 탭단위로 분리하여 첫번째 아이템 반환 
scala> val magRDD = cctvRDD.map(line => line.split("\t")(0))
magRDD: org.apache.spark.rdd.RDD[String] = MapPartitionsRDD[3] at map at <console>:26

// 중복 제거 
scala> val distRDD = magRDD.distinct()
distRDD: org.apache.spark.rdd.RDD[String] = MapPartitionsRDD[9] at distinct at <console>:28

// 중복 제거한 데이터를 10개만 출력 
scala> distRDD.take(10).foreach(println)
성남둔치공영주차장                                                              
울산 동구청
```

<br>

### 액션(Actions)

액션은 RDD를 이용하여 작업을 처리한 결과를 반환하는 작업입니다. 주요 함수는 아래와 같습니다. 이외 모든 함수는 RDD API 문서를 참고합니다.

| 함수                       | 설명                                                         |
| :------------------------- | :----------------------------------------------------------- |
| **reduce**(*func*)         | _func_를 이용하여 데이터를 집계(두 개의 인수를 받아서 하나를 반환). 병렬처리가 가능해야 함 |
| **collect**()              | 처리 결과를 배열로 반환. 필터링 등 작은 데이터 집합을 반환하는데 유용 |
| **count**()                | 데이터셋의 개수 반환                                         |
| **first**()                | 데이터셋의 첫번째 아이템 반환(take(1)과 유사)                |
| **take**(*n*)              | 데이터셋의 첫번째 부터 _n_개의 배열을 반환                   |
| **saveAsTextFile**(*path*) | 데이터셋을 텍스트 파일로 지정한 위치에 저장                  |
| **countByKey**()           | 키를 기준으로 카운트 반환                                    |
| **foreach**(*func*)        | 데이터셋의 각 엘리먼트를 _func_로 처리. 보통 Accmulator와 함께 사용 |

액션은 다음처럼 사용할 수 있습니다. cctvRDD를 이용하여 처리한 **액션은 결과를 드라이버(스파크쉘)에 반환하거나, 파일로 저장**할 수 있습니다.

```scala
// RDD 생성
scala> val cctvRDD = sc.textFile("/user/cctv_utf8.csv")
cctvRDD: org.apache.spark.rdd.RDD[String] = /user/cctv_utf8.csv MapPartitionsRDD[1] at textFile at <console>:24

// 첫번째 라인 반환 
scala> cctvRDD.first()
res0: String = 관리기관명    소재지도로명주소    소재지지번주소 설치목적구분  카메라대수   카메라화소수  촬영방면정보  보관일수    설치년월    관리기관전화번호    위도  경도  데이터기준일자 제공기관코드  제공기관명

// 10개의 라인을 출력
scala> cctvRDD.take(10).foreach(println)
관리기관명   소재지도로명주소    소재지지번주소 설치목적구분  카메라대수   카메라화소수  촬영방면정보  보관일수    설치년월    관리기관전화번호    위도  경도  데이터기준일자 제공기관코드  제공기관명
제주특별자치도 제주특별자치도 제주시 동문로9길 3 제주특별자치도 제주시 건입동 1120    생활방범    1       청은환타지아 북측 4가    30      064-710-8855    33.5132891  126.5300275 2018-04-30  6500000 제주특별자치도

// 텍스트 파일로 지정한 위치에 저장 
scala> cctvRDD.saveAsTextFile("/user/cctvRDD")
[Stage 7:>                                                          (0 + 0) / 2]

// 저장한 파일을 확인 
$ hadoop fs -ls /user/cctvRDD/
Found 3 items
-rw-r--r--   2 hadoop hadoop          0 2019-01-22 04:05 /user/cctvRDD/_SUCCESS
-rw-r--r--   2 hadoop hadoop   15333006 2019-01-22 04:05 /user/cctvRDD/part-00000
-rw-r--r--   2 hadoop hadoop   15332503 2019-01-22 04:05 /user/cctvRDD/part-00001
```

<br>

### 함수 전달

RDD 연산을 처리할 때 매번 작업을 구현하지 않고, 함수로 구현하여 작업을 처리할 수도 있습니다.

**함수를 전달 할 때**는 외부의 변수를 이용하지 않는 **순수 함수를 이용하는 것이 좋습니다.** 클러스터 환경에서 외부 변수의 사용은 잘못된 결과를 생성할 가능성이 높기 때문입니다.

```scala
// RDD에 map, reduce 함수를 람다함수로 전달
scala> cctvRDD.map(line => line.length).reduce((a, b) => a + b)
res12: Int = 18531244

// 함수 구현체 
object Func {
  // line의 길이를 반환하는 함수 
  def mapFunc(line: String): Int = { line.length }
  // a, b의 합을 반환하는 함수 
  def reduceFunc(a:Int, b:Int): Int = { a + b }
}

// RDD에 mapFunc, reduceFunc를 전달
scala> cctvRDD.map(Func.mapFunc).reduce(Func.reduceFunc)
res11: Int = 18531244                                                           
```

<br>

### 캐쉬 이용

**RDD는 처리 결과를 메모리나 디스크에 저장하고 다음 계산에 이용할 수 있습니다.** **반복작업의 경우 이 캐쉬를 이용해서 처리 속도를 높일 수 있습니다.** 하지만 단일작업의 경우 데이터 복사를 위한 오버헤드가 발생하여 처리시간이 더 느려질 수 있습니다. 따라서 작업의 종류와 영향을 파악한 후에 캐슁을 이용하는 것이 좋습니다.

**RDD는 `persist()`, `cache()` 메소드를 이용하여 캐슁을 지원합니다.** 캐슁한 데이터에 문제가 생기면 자동으로 복구합니다. 또한 **저장 방법을 설정할 수 있어서, 메모리나 디스크에 저장 할 수도** 있습니다. 캐슁 관련 주요 설정은 공식문서를 참고 하시기 바랍니다.

| 설정            | 설명                                                         |
| :-------------- | :----------------------------------------------------------- |
| MEMORY_ONLY     | RDD를 메모리상에 저장. 메모리보다 용량이 크면 일부만 저장하고 필요할 때마다 계산. 기본값 |
| MEMORY_AND_DISK | RDD를 메모리상에 저장. 메모리보다 용량이 크면 일부는 메모리, 일부는 디스크에 저장 |
| DISK_ONLY       | RDD를 디스크에 저장                                          |

```scala
val txts = sc.textFile("/user/sample.txt")
val pairs = txts.flatMap(line => line.split(" ")).map(word => (word, 1))

// 각 단계의 결과를 캐슁 
scala> pairs.persist()
res39: pairs.type = MapPartitionsRDD[36] at map at <console>:26

val counts = pairs.reduceByKey(_ + _) 
scala> counts.persist()
res38: counts.type = ShuffledRDD[37] at reduceByKey at <console>:28
```

<br>

---

# 3 RDD 연산 (2)

RDD를 이용해서 기본 연산 외 복합적 연산 처리하는 방법을 알아봅니다.



## key, value 이용한 처리

스파크는 맵리듀스 처럼 (key, value) 쌍을 이용한 처리도 가능합니다. 기본적으로 제공하는 `flatMap`, `reduceByKey`, `groupByKey`, `mapValues`, `sortByKey` 를 이용해서 좀 더 편리한 처리가 가능합니다.

다음의 워드 카운트는 키, 밸류를 이용한 처리 예제입니다. 파일의 데이터를 읽어서 `flatMap`을 이용하여 단어별로 분리하고, `map`을 이용하여 단어의 개수를 세어줍니다. `reduceByKey`를 이용하여 단어별로 그룹화하여 단어가 나타낸 개수를 세어줍니다.

```scala
val txts = sc.textFile("/user/sample.txt")
val pairs = txts.flatMap(line => line.split(" ")).map(word => (word, 1))
val counts = pairs.reduceByKey(_ + _)

scala> counts.take(10).foreach(println)
(under,1)                                                                       
(better.,1)
(goals,1)
(call,3)
(its,7)
(opening,1)
(extraordinary,1)
(internationalism，to,1)
(have,4)
(include,2)
```

<br>

## Accumulator

스파크는 PC에서 단독으로 처리되는 것이 아니라 **클러스터에서 처리하기 때문에 클로져를 이용하면 결과가 달라질 수 있습니다.**

다음의 예제와 같이 `foreach()` 반복문에 외부에 선언된 `sumValue` 변수에 모든 값을 더하는 함수를 실행하면 실행 모드(local vs cluster)에 따라 결과가 달라 질 수 있습니다. **로컬 모드에서는 원하는 결과가 나오지만**, **클러스터 모드에서는 각 노드에서 로컬의 `sumValue` 변수의 값을 이용하여 작업을 처리**하기 때문에 결과가 달라집니다.

```scala
// 모든 데이터를 sumValue에 합함 
var sumValue = 0
var rdd = sc.parallelize(Array(1, 2, 3, 4, 5))
rdd.foreach(x => sumValue += x) 

// 원하는 결과가 나오지 않음 
scala> println("sum value: " + sumValue )
sum value: 0
```

<br>

스파크에서 맵리듀스의 카운터와 유사한 역할을 하는 **Accumulator**를 이용하여 **모든 노드가 공유할 수 있는 변수를 선언**해 주어야 합니다. Accumulator는 스파크 컨텍스트를 이용해서 생성합니다. 사용법은 다음과 같습니다.

```scala
var sumValue = sc.longAccumulator("Sum Accumulator")
var rdd = sc.parallelize(Array(1, 2, 3, 4, 5))
rdd.foreach(x => sumValue.add(x))

// Accmulator를 이용하여 값 처리
scala> println("sum value: " + sumValue.value)
sum value: 15
```

<br>

## 브로드캐스트(broadcast)

브로드 캐스트는 맵리듀스의 디스트리뷰트 캐시(distribute cache)와 유사한 역할을 하는 모든 노드에서 공유되는 읽기 전용 값입니다. `broadcast()` 를 이용하여 사용할 수 있습니다. 조인에 이용되는 값들을 선언하여 이용할 수 있습니다.

다음의 예제에서 `broadcastVar` 변수는 클러스터의 모든 노드에서 사용할 수 있는 값이 됩니다.

```scala
scala> val broadcastVar = sc.broadcast(Array(1, 2, 3))
broadcastVar: org.apache.spark.broadcast.Broadcast[Array[Int]] = Broadcast(0)

scala> broadcastVar.value
res0: Array[Int] = Array(1, 2, 3)
```

<br>

## 셔플

스파크에서 **조인, 정렬 작업은 셔플(Shuffle) 작업을 실행**합니다. **셔플은 파티션간에 그룹화된 데이터를 배포하는 메커니즘**입니다. 셔플은 임시 파일의 복사, 이동이 있기 대문에 많은 비용이 들게 됩니다. 셔플 관련 설정은 공식 문서를 확인하시면 됩니다.



---

**Reference**

https://wikidocs.net/28473

https://wikidocs.net/28503