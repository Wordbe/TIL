# FP Kotlin 005 - 컬렉션으로 데이터 다루기



# 1 함수형 컬렉션의 데이터 처리

- 리스트, 셋, 배열, 맵
- 부수효과가 없는 고차 함수 : `map`, `filter` 등 콤비네이터(combinator) 제공



## 리스트

- 보통 Cons(constructor) 라 불리는 구성요소의 연결 구조를 가진다.

### 연결 리스트

```kotlin
sealed class FunList<out T> {
  object Nil: FunList<Nothing>()
  data class Cons<out T>(val head: T, val tail: FunList<T>): FunList<T>()
}
```



### addHead 추가

```kotlin
fun <T> FunList<T>.addHead(head: T): FunList<T> = FunList.Cons(head, this)
```

- 함수형 컬렉션에서 제공하는 함수는 불변성을 지키고, 부수효과를 없애기 위해 원본 데이터를 변경하지 않고, 가공된 데이터를 매번 새로 생성하여 반환한다.
- 생성 비용을 최소화하기 위해 게으른 평가 (lazy evaluation)와 내부 캐싱을 사용한다.



### appendTail 추가

```kotlin
fun <T> FunList<T>.appendTail(value: T): FunList<T> = when (this) {
  FunList.Nil -> Cons(value, Nil)
  is FunList.Cons -> Cons(head, tail.appendTail(value))
}
```

- 꼬리 재귀가 아니므로 스택에 안전하지 않다.

따라서 아래와 같이 꼬리 재귀로 변경

```kotlin
tailrec fun <T> FunList<T>.appendTail(value: T, acc: FunList<T> = Nil): FunList<T> = when (this) {
  FunList.Nil -> Cons(value, acc).reverse()
  is FunList.Cons -> tail.appendTail(value, acc.addHead(head))
}

tailrec fun <T> FunList<T>.reverse(acc: FunList<T> = FunList.Nil): FunList<T> = when (this) {
  FunList.Nil -> acc
  is FunList.Cons -> tail.reverse(acc.addHead(head))
}
```



### getTail

```kotlin
fun <T> FunList<T>.getTail(): FunList<T> = when (this) {
  FunList.Nil -> throw NoSuchElementException()
  is FunList.Cons -> tail
}
```



<br />

# 2 컬렉션 데이터 걸러 내기

## filter

```kotlin
fun functionalFilter(numList: List<Int>): List<Int> =
  numList.filter { it % 2 == 0 }
```



- 코드가 간결해져서 가독성이 좋다.
- 결괏값을 저장하기 위해 별도 리스트를 생성할 필요가 없다.
- 비즈니스 로직에 집중할 수 있다.
- 버그가 발생할 확률이 낮다.
- 테스트가 용이하다.
- 유지보수가 용이하다.



```kotlin
tailrec fun <T> FunList<T>.filter(acc: FunList<T> = FunList.Nil, p: (T) -> Boolean): FunList<T> = 
when (this) {
  FunList.Nil -> acc.reverse()
  is FunList.Cons -> if (p(head)) {
    tail.filter(acc.addHead(head), p)
  } else {
    tail.filter(acc, p)
  }
}
```





# 3 컬렉션 데이터 변경하기

```kotlin
// 명령형 맵
fun imperativeMap(numList: List<Int>): List<Int> {
  val newList = mutableListOf<Int>()
  for (num in numList) {
    newList.add(num + 2)
  }
  
  return newList
}
```

```kotlin
// 함수형 맵
fun functionalMap(numList: List<Int>): List<Int> {
  return numList.map { it + 2 }
}
```

- 둘 다 내부적으로 새로운 리스트를 만들어 반환하므로 부수효과가 없다.



## map

```kotlin
tailrec fun <T, R> FunList<T>.map(acc: FunList<R> = FunList.Nil, f: (T) -> R): FunList<R> = when (this) {
  FunList.Nill -> acc.reverse()
  is FunList.Cons -> tail.map(acc.addHead(f(head)), f)
}
```



### funListOf

```kotlin
fun <T> funListOf(vararg elements: T): FunList<T> = elements.toFunList()

private fun <T> Array<out T>.toFunList(): FunList<T> = when {
  this.isEmpty() -> FunList.Nil
  else -> FunList.Cons(this[0], this.copyOfRange(1, this.size).toFunList())
}
```



# 4 컬렉션 데이터 단계별로 줄이기

```kotlin
fun sum(list: FunList<Int>): Int = when (list) {
  FunList.Nil -> 0
  is FunList.Cons -> list.head + sum(list.tail)
}
```

- 하나의 값으로 줄이는 작업을 일반화한 고차 함수가 폴드 함수이다.
- 컬렉션의 값들을 왼쪽에서 오른쪽으로 줄여나가는 함수를 `foldLeft` 라 한다.
- `foldRight` 과 달리 꼬리 재귀이므로 스택에 안전하다.

```kotlin
tailrec fun <T, R> FunList<T>.foldLeft(acc: R, f: (R, T) -> R): R = when (this) {
  FunList.Nil -> acc
  is FunList.Cons -> tail.foldLeft(f(acc, head), f)
}
```

```kotlin
fun <T, R> FunList<T>.foldRight(acc: R, f: (T, R) -> R): R = when (this) {
  FunList.Nil -> acc
  is FunList.Cons -> f(head, tail.foldRight(acc, f))
}
```



- `foldLeft` 를 활용한 `sum`

```kotlin
fun FunList<Int>.sum(): Int = foldLeft(0) { acc, x -> acc + x }
```





## foldLeft vs foldRight

- `foldLeft` : 리스트 크기가 크거나, f 함수의 실행 비용이 클 때 사용
- `foldRight` : 리스트 크기가 예측 가능하고, f 함수의 실행 부담이없는 일반 리스트 변환에 사용
  - `mapByFoldRight` 에서 `addHead` 가 사용되는데, 이는 `mapByFoldLeft` 에서 `appendTail` 보다 성능이 빠르므로 일반 리스트 변환에는 `foldRight` 을 사용한다.



# 5 여러 컬렉션 데이터 합치기

## zipWith

```kotlin
tailrec fun <T1, T2, R> FunList<T1>.zipWith(f: (T1, T2) -> R, list: FunList<T2>, acc: FunList<R> = FunList.Nil): FunList<R> = when {
  this === FunList.Nil || list === FunList.Nil -> acc.reverse()
  else -> getTail().zipWith(f, list.getTail(), acc.addHead(f(getHead(), list.getHead()))
}
```



# 6 코틀린 리스트를 사용한 명령형 방식과 함수형 방식 비교



코틀린 컬렉션 사용하면 안되는 예

- 성능에 민감할 때
- 컬렉션 크기가 고정되어 있지 않을 때
- 고정된 컬렉션 크기가 매우 클 때

코틀린의 컬렉션은 즉시 평가(eager evaluation)된다. 게으른 평가(lazy evaluation)로 실행되지 않기 때문에 성능이 떨어진다.

- **게으른 평가를 위한 컬렉션으로 시퀀스(sequence)가 있다.**
- 자바의 Stream 도 기본적으로 게으르게 평가된다.

```kotlin
fun main() {
  val bigIntList = (1..10000000).toList()
  val start = System.currentTimeMillis()
  
  realFunctionalWay(bigIntList)
  println("${System.curretMillis() - start} ms")
}

fun realFunctionalWay(intList: List<Int>): Int =
  intList.asSequence()
	.map { n -> n * n }
	.filter { n -> n < 10 }
	.first()
```





# 7 게으른 컬렉션 FunStream

```kotlin
sealed class FunStream<out T> {
  object Nil: FunStream<Nothing>()
  data class Cons<out T>(val head: () -> T, val tail: () -> FunStream<T>): FunStream<T>()
}
```

- 입력 매개변수를 람다로 받는다.
- 이렇게 하면 Cons 가 생성되는 시점에 입력 매개변수는 평가되지 않는다.
- 실제로 값이 필요한 시점에 값이 평가된다.
- sequence 같은 게으른 평가를 위한 컬렉션을 사용하지 않아도 된다.



## forEach

```kotlin
tailrec fun <T> FunStream<T>.forEach(f: (T) -> Unit): Unit = when(this) {
  FunStream.Nil -> Unit
  is FunStream.Cons -> {
    f(head())
    tail().forEach(f)
  }
}
```





# 8 실전 응용

## printFunList

```kotlin
fun<T> printFunList(list: FunList<T>) = list.toStringByFoldLeft()

fun <T> FunList<T>.toStringByFoldLeft(): String = 
  "[${foldLeft("") { acc, x -> "$acc, $x" }.drop(2)}]"
```































