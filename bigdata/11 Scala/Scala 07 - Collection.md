# Scala 07 - Collection

스칼라는 여러가지 유용한 기본 콜렉션 자료구조를 제공합니다. 그 중 자주사용하는 배열, 리스트, 셋, 튜플, 맵을 알아봅니다.

<br>

### 배열(Array)

배열은 길이가 고정된 고정된 자료구조입니다. 

```scala
val array1 = Array(1, 2, 3)

// 배열의 데이터 접근 
scala> array1(0)
res0: Int = 1

// 배열의 데이터 변경 
scala> array1(1) = 10
scala> array1(1)
res5: Int = 10

val array2 = Array(3, 4, 5)

// 배열 연결하기 ++
val array3 = array1 ++ array2

// 배열의 앞에 데이터 추가 
val array4 = 0 +: array3

// 배열의 뒤에 데이터 추가 
val array5 = array3 :+ 100
```

<br>

### 리스트(List)

리스트 가변적인 길이의 데이터를 저장하기 위한 자료구조입니다. 

```scala
val list1 = List(10, 20, 30, 40)
val list2 = (1 to 100).toList
val list3 = array1.toList

scala> list1
res19: List[Int] = List(10, 20, 30, 40)

scala> list1(0)
res11: Int = 10

scala> list1(3)
res12: Int = 40

scala> list1.head
res17: Int = 10

scala> list1.tail
res18: List[Int] = List(20, 30, 40)
```

<br>

### 셋(Set)

셋은 중복을 허용하지 않는 자료 구조 입니다. 셋은 전달된 값이 존재하는지 여부를 반환합니다.

```scala
val s1 = Set(1, 1, 2)

scala> s1
res23: scala.collection.immutable.Set[Int] = Set(1, 2)

// 셋은 전달된 값이 존재하는지 여부를 반환 
scala> s1(1)
res26: Boolean = true

scala> s1(2)
res27: Boolean = true

scala> s1(3)
res28: Boolean = false
```

<br>

### 튜플(Tuple)

튜플은 불변 데이터를 저장하는 자료구조입니다. 여러가지 값을 저장할 수 있습니다. 값에 접근할 때는 _1, _2와 같은 형태로 접근합니다. 튜플은 패턴매칭에 이용할 수 있습니다.

```scala
// 튜플 선언 
val hostPort = ("localhost", 80)

scala> hostPort._1
res29: String = localhost
```

튜플을 이용한 패턴 매칭은 다음과 같이 사용합니다.

```scala
// 패턴매칭 선언 
def matchTest(hostPort:(String, Int)) = hostPort match {
  case ("localhost", port) =>  println(s"localhost, $port")
  case (host, port) => println(s"$host, $port")
}

val hostPort1 = ("localhost", 80)
val hostPort2 = ("localhost", 8080)
val hostPort3 = ("127.0.0.1", 8080)

scala> matchTest(hostPort1)
localhost, 80

scala> matchTest(hostPort2)
localhost, 8080

scala> matchTest(hostPort3)
127.0.0.1, 8080
```

<br>

### 맵(Map)

맵은 사전 형식으로 데이터를 저장하는 구조입니다. 맵의 데이터를 반환하면 **Option 타입**을 반환합니다. 

> Option : 값이 있거나 없는 상태를 나타낼 수 있는 타입입니다. 값이 담겨져 있는 Option의 하위 타입은 Some[T] 이며, 값이 없으면 None입니다. Option은 Try, Future 등과 함께 대표적인 모나딕컬렉션 입니다.
>
> * null을 안전하게 대체하기 위해 만들어 진 것
> * 연속체인에서 안정적으로 사용하기 위한 것

따라서, `get`을 이용하여 데이터를 반환하기 보다는, `getOrElse`를 이용하거나, `get`의 반환값 Option을 패턴매칭을 이용하는 것이 좋습니다.

```scala
val map1 = Map(1 -> 2)
val map2 = Map("foo" -> "bar")

// Option 타입 반환 
scala> map1.get(1)
res43: Option[Int] = Some(2)

// getOrElse를 이용하여 키와 일치하는 데이터가 없으면 기본값을 반환하도록 설정 
scala> map1.getOrElse(1, 0)
res41: Int = 2

scala> map1.getOrElse(10, 0)
res45: Int = 0
```

<br>

---

# 1. 반복문

스칼라의 반복문은 `for`, `do while`, `while` 문이 있습니다. 각 반복문의 사용법을 알아보겠습니다.

## for

for 문을 사용하는 방법은 다음과 같습니다. `to`와 `until`은 간단하게 시퀀스를 생성하게 도와주는 스칼라의 문법입니다. to는 이하의 리스트를 생성하고, until은 미만의 시퀀스를 생성합니다.

```scala
// 0에서 3이하의 시퀀스 
for (num <- 0 to 3)
    println(num)
0
1
2
3

// 0에서 3미만의 시퀀스 
for (num <- 0 until 3)
    println(num)
0
1
2

// 콜렉션의 데이터 출력 
val strs = Array("A", "B", "C", "D", "E")
for (str <- strs)
    println(str)
A
B
C
D
E
```

<br>

## 배열의 인덱스와 함께 for 문 처리

인덱스와 함께 처리하는 방법은 배열의 길이만큼 인덱스를 호출하여 처리하거나, `zipWithIndex` 함수를 이용합니다.

```scala
// 콜렉션의 데이터를 인덱스와 함께 출력 
for(index <- 0 until strs.length)
    println(index, strs(index))
(0,A)
(1,B)
(2,C)
(3,D)
(4,E)

// 콜렉션의 데이터를 zipWithIndex를 이용하여 인덱스와 함께 출력 
for((value, index) <- strs.zipWithIndex)
    println(value, index)
(A,0)
(B,1)
(C,2)
(D,3)
(E,4)
```

<br>

## 맵의 키, 밸류를 for문 처리

맵의 키, 밸류는 튜플로 전달됩니다. for문 처리시에 이 값들을 이용하면 됩니다.

```scala
// 맵 데이터 출력 
val map = Map("k1" -> "v1", "k2" -> "v2", "k3" -> "v3", "k4" -> "v4", "k5" -> "v5")
for ((k, v) <- map)
  println(k, v)

(k2,v2)
(k5,v5)
(k1,v1)
(k4,v4)
(k3,v3)
```

<br>

## 중첩 for 문

중첩 for문은 자바처럼 for문을 두개를 이용해서 생성할 수도 있지만, 세미 콜론(;)을 이용하여 생성할 수도 있습니다. 간단한 중첩문 생성 방법은 다음과 같습니다.

```scala
for (x <- 0 to 2; y <- 0 to 2)
    println(x, y)

(0,0)
(0,1)
(0,2)
(1,0)
(1,1)
(1,2)
(2,0)
(2,1)
(2,2)
```

<br>

## 조건식 추가

for문에 데이터 생성을 위한 조건식을 이용할 수도 있습니다. 세미콜론으로 if문을 분할하여 여러개의 조건을 추가할 수도 있습니다.

```scala
for (num <- 0 to 3; if num != 2)
    println(num)
0
1
3

for (x <- 0 to 2; y <- 0 to 2; if x < 1)
    println(x, y)
(0,0)
(0,1)
(0,2)

for (x <- 0 to 2; y <- 0 to 2; if x < 1; if y < 1)
    println(x, y)
(0,0)
```

<br>

## yield를 이용한 시퀀스 컴프리헨션

스칼라의 시퀀스 컴프리헨션(Sequence Comprehension)은 for문의 끝에 **yield를 이용해서 for문에서 생성한 값들의 시퀀스를 반환**합니다.

```scala
// 0에서 n이하의 시퀀스에서 5의 배수로 구성된 시퀀스 생성 
def fives(n: Int) = {
    for( x <- 0 to n; if x % 5 == 0)
      yield x
}

for(num <- fives(100))
    println(num)

0
5
10
15
20
25
30
35
40
45
50
55
60
65
70
75
80
85
90
95
100
```

<br>

다음은 0에서 num미만의 숫자로 이루어진 조합에서 합이 sum인 값의 조합을 찾는 예제입니다. checkSum 함수는 `IndexedSeq`를 반환하기 때문에 foreach를 이용하여 아래와 같이 처리할 수 있습니다.

```scala
def checkSum(num: Int, sum: Int) =
    for (
      start <- 0 until num;
      inner <- start until num if start + inner == sum
    ) yield (start, inner); 

checkSum(20, 32) foreach {
    case (i, j) =>
      println(s"($i, $j)")
}
```

<br>

## do..while 문

`do while`문은 조건이 참 일동안 반복됩니다.

```scala
var i = 0;

do{
    println(i)
    i += 1
} while( i < 3)

0
1
2
```

# while 문

`while`문은 조건이 참일동안 반복됩니다.

```scala
  var num = 0;
  while (num < 3) {
    num += 1
    println(num);    
  }

1
2
3
```



---

**Reference**

https://wikidocs.net/30225

https://wikidocs.net/31355