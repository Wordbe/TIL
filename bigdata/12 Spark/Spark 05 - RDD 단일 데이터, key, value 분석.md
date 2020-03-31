# Spark 04 - RDD 단일 데이터, key, value 분석

## 1 단일 데이터 분석

   단일 데이터 분석은 숫자를 이용해서 합계, 평균 등을 구해봅니다.



### 합계

`reduce` 함수를 사용할 수 있습니다. 

```scala
val data = Array(1, 2, 3, 4, 5)
val rdd = sc.parallelize(data)

rdd.reduce(_ + _)
// 또는 rdd.reduce((x, y) => x + y)
```

```shell
scala> rdd.reduce(_ + _)
res0: Int = 15                                                                  

scala> rdd.reduce((x, y) => x + y)
res1: Int = 15  
```

언더바(_)를 이용한 묵시적 처리는 스칼라에서 지원하는 처리 방식이며, 파라미터의 순서를 이용해 자동으로 처리합니다.

<br>

### 평균

```scala
val data = Array(1, 2, 3, 4, 5)
val dataLength = data.length
val rdd = sc.parallelize(data)

rdd.reduce(_ + _) / dataLength
```

위와 같이 쉽게 구할 수 있지만, `map` 연습 차원에서 조금 더 복잡하게 `map`을 응용해서 구해보겠습니다.

```scala
val data = Array(1, 2, 3, 4, 5)
val rdd = sc.parallelize(data)
val sum = rdd.map(x => (1, x)).reduce((x, y) => (x._1 + y_1, x._2 + y._2))
val mean = sum._2 / sum._1
```

```shell
scala> val mod = result._2 / result._1
mod: Int = 3
```

<br>

### 필터링

`filter`를 이용합니다. 2 초과 데이터만 출력해봅니다.

```scala
val data = Array(1, 2, 3, 4, 5)
val rdd = sc.parallelize(data)

rdd.filter(_ > 2).collect()
```

```shell
scala> rdd.filter(_ > 2).collect()
res17: Array[Int] = Array(3, 4, 5)  
```

<br>

### 데이터 집합

RDD 데이터는 교집합(intersection), 차집합(subtract), 합집합(union), 곱(외적, cartesian)처리가 가능합니다.

```scala
val data1 = Array(1, 2, 3, 4, 5)
val rdd1 = sc.parallelize(data1)

val data2 = Array(3, 4, 5, 6, 7)
val rdd2 = sc.parallelize(data2)
```

```shell
scala> rdd1.union(rdd2).collect()
res19: Array[Int] = Array(1, 2, 3, 4, 5, 3, 4, 5, 6, 7)                         

scala> rdd1.intersection(rdd2).collect()
res20: Array[Int] = Array(4, 3, 5)

scala> rdd1.subtract(rdd2).collect()
res21: Array[Int] = Array(2, 1)

scala> rdd1.cartesian(rdd2).collect()
res22: Array[(Int, Int)] = Array((1,3), (1,4), (2,3), (2,4), (1,5), (1,6), (1,7), (2,5), (2,6), (2,7), (3,3), (3,4), (4,3), (4,4), (5,3), (5,4), (3,5), (3,6), (3,7), (4,5), (4,6), (4,7), (5,5), (5,6), (5,7))
```

<br>

---

## 2 (Key, Value) 쌍 분석

워드카운트 분석과, 정렬, 필터링 방법을 알아봅니다.

### Word Count

`map`을 이용하여 (key, count)로 분리하고, `reduceByKey` 를 이용하여 그룹화하여 개수의 합계를 구해봅시다. 키를 기준으로 정렬할 때는 `sortByKey`를 이용하여 처리할 수 있습니다.

```scala
val wordsRDD = sc.parallelize(Array("a", "b", "c", "d", "a", "a", "b", "b", "c", "d"))
val pairs = wordsRDD.map(w => (w, 1))
val counts = pairs.reduceByKey(_ + _)
val sorted = counts.sortByKey()
```

```shell
scala> sorted.collect()
res35: Array[(String, Int)] = Array((a,3), (b,3), (c,2), (d,2))
```

<br>

### Word Count - 정렬 기준

```scala
val wordsRDD = sc.parallelize(Array("a", "b", "c", "d", "a", "a", "b", "b", "c", "d", "d", "d", "d"))
val pairs = wordsRDD.map(w => (w, 1))
val counts = pairs.reduceByKey(_ + _)

// 오름차순 정렬
val sortedV = counts.sortBy(v => v._2)
val sortedV = counts.sortBy(v => v._2, true)

// 다음의 두가지 방법은 같은 결과를 처리(내림차순 정렬)
val sortedV = counts.sortBy(v => v._2, false)
val sortedV = counts.sortBy({ case (word, count) => count } , false)
```

```shell
scala> sortedV.collect()
res39: Array[(String, Int)] = Array((d,5), (a,3), (b,3), (c,2))
```

`sortBy`의 데이터는 튜플로 전달되어 튜플의 인덱스 접근법을 사용할 수 있습니다. 스칼라의 `case`문법을 이용하여 변수명으로도 접근할 수 있습니다.

<br>

### Filtering : `filter()`

```scala
val wordsRDD = sc.parallelize(Array("a", "b", "c", "d", "a", "a", "b", "b", "c", "d", "d", "d", "d"))
val pairs = wordsRDD.map(w => (w, 1))
val counts = pairs.reduceByKey(_ + _)

val filtered = counts.filter { case(k, v) => v > 3 }    // value가 3 초과인 데이터 
val filtered = counts.filter { case(k, v) => k == "a" } // key가 a인 데이터 
```

```shell
scala> filtered.collect()
res40: Array[(String, Int)] = Array((d,5))   

scala> filtered.collect()
res46: Array[(String, Int)] = Array((a,3))                                       
```

<br>

### (Key, Value)에서 Value만 처리 : `mapValues()`

`mapValues`를 사용해봅시다.

```scala
val wordsRDD = sc.parallelize(Array("a", "b", "c", "d", "a", "a", "b", "b", "c", "d", "d", "d", "d"))
val pairs = wordsRDD.map(w => (w, 1))
val counts = pairs.reduceByKey(_ + _)

val added = counts.mapValues(x => x * x)    // value 만 들어오는 처리 
val added = counts.map({ case (k, v) => (k, v*v) }) // map을 이용하여 동일한 처리 
```

```shell
scala> added.collect()
res44: Array[(String, Int)] = Array((d,25), (b,9), (a,9), (c,4))   
```

<br>

### Partitioning : `partitionBy`

데이터 파티셔닝 처리를 위해서는 `partitionBy`를 이용해서 파티셔너를 지정합니다. 사용자가 파티셔너를 따로 구현할 수 도 있습니다.

```scala
// 해쉬 파티셔너 적용을 위해 import 필요함 
import org.apache.spark.HashPartitioner

val pairs = wordsRDD.map(w => (w, 1)).partitionBy(new HashPartitioner(100)).persist()
val counts = pairs.reduceByKey(_ + _)
val added = counts.mapValues(x => x * x)
```

```shell
scala> pairs.partitioner
res45: Option[org.apache.spark.Partitioner] = Some(org.apache.spark.HashPartitioner@64)
```

> `persist()`는 연산값을 기억해 놓는 함수입니다.

<br>

### Join : `join`

`union`, `join` 을 이용하여 데이터 조인을 처리할 수 있습니다.

키, 밸류는 키를 기준으로 조인을 처리합니다.

```scala
val wordsRDD = sc.parallelize(Array("a", "b", "c", "d", "a", "a", "b", "b", "c", "d", "d", "d", "d"))
val pairs = wordsRDD.map(w => (w, 1))
val counts = pairs.reduceByKey(_ + _)

val filteredA = counts.filter({case(k, v) => k == "a"})
val filteredB = counts.filter({case(k, v) => k == "b"})
filteredA.collect()
filteredB.collect()

val unionRDD = filteredA.union(filteredB)
val joinRDD = unionRDD.join(filteredB)
```

```shell
scala> unionRDD.collect()
res55: Array[(String, Int)] = Array((a,3), (b,3))

scala> joinRDD.collect()
res56: Array[(String, (Int, Int))] = Array((a,(3,3)))
```







---

**Reference**

https://wikidocs.net/28502

https://wikidocs.net/28511