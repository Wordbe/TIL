# Scala 08 - Collection 2 - 주요 method

<br>

# 2.정렬, 그룹핑, 필터링 등 함수

콜렉션을 이용해서 주로 처리하게 될 작업에서 효율적으로 활용할 수 있는 주요 함수에 대해서 알아봅니다.

<br>

## map

`map` 함수는 콜렉션의 각 아이템에 대해서 동일한 작업을 해야할 때 사용할 수 있습니다. 다음은 리스트의 각 아이템에 대해서 1을 추가하는 작업과 대문자로 변환하는 작업입니다.

```scala
// 각 값에 1 추가 
val list = (1 to 10)
list.map(_ + 1)
// 결과 
Vector(2, 3, 4, 5, 6, 7, 8, 9, 10, 11)

// 각 문자를 대문자화 
val strs = List("david", "kevin", "james")
strs.map(_.toUpperCase)
// 결과 
List(DAVID, KEVIN, JAMES)
```

<br>

## reduce, fold

`reduce`, `fold` 함수는 콜렉션의 **데이터를 집계**할 때 사용합니다. 두 개의 함수는 동작은 비슷하지만 **fold 함수는 기본값을 제공할 수 있습니다.** 각각의 함수모두 left, right 방향을 가질 수 있습니다. 더하기(+) 연산의 경우 양쪽 방향이 동일한 결과를 나타내지만 빼기(-) 연산의 경우 방향에 따라 다른 결과를 나타냅니다.

reduce(_ + _) 에서 왼쪽 _는 누적값, 오른쪽 _는 요소입니다.

```scala
val list = (1 to 10)

list.reduce(_ + _)      // 55
list.reduceLeft(_ + _)      // 55
list.reduceRight(_ + _)     // 55

list.reduce(_ - _)      // -53
list.reduceLeft(_ - _)      // -53
list.reduceRight(_ - _)     // -5

list.fold(10)(_ + _)        // 65
```

여기서 reduceRight은 한 번에 이해가 안가는데,

다음과 같이 계산이 되어 값이 -5가 됩니다.

```
9 - 10
8 - (-1)
7 - (9)
6 - (-2)
5 - 8
4 - (-3)
3 - 7
2 - (-4)
1 - 6
-5
```

+ fold 또한 foldLeft, foldRight이 있습니다.

<br>

## groupBy

`groupBy`는 데이터를 키를 기준으로 병합할 때 사용합니다. **결과를 Map 형식으로 반환하고, 전달된 키와 리스트 형태의 데이터로 반환합니다.**

```scala
var datas = List(("A", 1), ("B", 2), ("C", 6), ("B", 2), ("A", 8), ("C", 2))
datas.groupBy(_._1).foreach({ case (k, v) => printf("key: %s, value: %s\n", k, v) })

// 결과 
key: A, value: List((A,1), (A,8))
key: C, value: List((C,6), (C,2))
key: B, value: List((B,2), (B,2))
```

<br>

## filter

`filter`는 콜렉션의 데이터를 필터링하여 없애거나 분류할 때 사용할 수 있습니다. `partition`은 콜렉션을 분류할 때 사용합니다. `find`는 데이터를 검색할 때 사용합니다. `takeWhile`과 `dropWhile`을 이용하여 원하는 부분까지 데이터를 선택할 수 있습니다.

```scala
val list = (1 to 10)
list.filter(_ > 5)  // 5 이상의 데이터 분류 
// 결과: Vector(6, 7, 8, 9, 10)

list.partition(_ % 3 == 0)  // 2로 나누어 나머지가 0인 데이터를 분류 
// 결과: (Vector(3, 6, 9),Vector(1, 2, 4, 5, 7, 8, 10))

list.find(_ == 3)   // 3을 검색 
// 결과: Some(3)

val list2 = List(1, 2, 3, -1, 4, 5, 6)
list2.takeWhile(_ > 0)
// 결과: List(1, 2, 3)

val list3 = List(1, 2, 3, 4, 5, 6)
list3.dropWhile(_ < 2)
// 결과: List(2, 3, 4, 5, 6)
```

<br>

## zip

`zip`은 두개의 콜렉션은 같은 인덱스의 데이터를 묶을 수 있습니다. 길이가 일치하지 않으면 작은 갯수 만틈만 반환합니다.

```scala
for( item <- List(1,2,3).zip(List(1,2,3)))
      println(item)
(1,1)
(2,2)
(3,3)

for( item <- List(1,2,3).zip(List(1,2,3,4)))
      println(item)
(1,1)
(2,2)
(3,3)
```

<br>

## mapValues

`mapValues`는 Map 타입의 데이터에서 밸류만 map 함수 처리를 하고 싶을 때 사용하는 함수입니다.

```scala
// value를 제곱
var maps = Map("A" -> 1, "B" -> 2, "C" -> 3, "D" -> 4, "E" -> 5)
maps.mapValues(x => x*x).foreach( x => x match { case (k, v) => printf("key: %s, value: %s\n", k, v) })

// 결과
key: E, value: 25
key: A, value: 1
key: B, value: 4
key: C, value: 9
key: D, value: 16

// value인 List의 sum을 구함 
var maps = Map("A" -> List(1, 2, 3), "B" -> List(4, 5, 6), "C" -> List(7, 8, 9))
maps.mapValues(_.sum).foreach({ case (k, v) => printf("key: %s, value: %s\n", k, v) })

// 결과 
key: A, value: 6
key: B, value: 15
key: C, value: 24
```

<br>

## sort

정렬은 `sorted`, `sortWith`, `sortBy` 세 가지 메소드를 이용할 수 있습니다. 각 메소드는 다음과 같이 사용합니다.

```scala
// sorted 사용방법 
val list = List(4, 6, 1, 6, 0)
val l_sort = list.sorted
val r_sort = list.sorted(Ordering.Int.reverse)
scala> println(l_sort)
List(0, 1, 4, 6, 6)
scala> println(r_sort)
List(6, 6, 4, 1, 0)

// sortBy 사용방법 
val sList = List("aa", "bb", "cc")
val l_sortBy = sList.sortBy(_.charAt(0))
scala> println(l_sortBy)
List(aa, bb, cc)

// sortWith 사용방법 
val l_sortWith = list.sortWith(_ <= _)
val r_sortWith = list.sortWith(_ >= _)
scala> println(l_sortWith)
List(0, 1, 4, 6, 6)
scala> println(r_sortWith)
List(6, 6, 4, 1, 0)


// 케이스 클래스의 데이터를 정렬 
// correct가 같으면 index로 정렬 
case class Person(index:Int, var correct:Int)

val persons = Array(Person(1, 3),Person(2, 4), Person(3, 4))
val list = persons.sortWith((x:Person, y:Person) => {
  if(x.correct == y.correct)
      x.index >= y.index

    x.correct > y.correct
}).toList

scala> println(list)
List(Person(2,4), Person(3,4), Person(1,3))
```



---

**Reference**

https://wikidocs.net/31491