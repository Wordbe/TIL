# Kotlin Cookbook 002





# 5 컬렉션

- 코틀린은 흥미로운 메서드를 컬렉션 클래스에 직접 추가한다.



## 1 배열 다루기

- 자바와 다르게 코틀린에서 Array 는 클래스

- `arrayOf` 팩토리 메소드 제공

- `Array` 는 퍼블릭 생성자 하나 제공

  ```kotlin
  val squares = Array(5) { i -> (i * i).toString() }
  ```

- `squares[1]` 처럼 대괄호를 사용해 배열 원소에 접근할 때 호출되는 public 연산자 메소드 get 과 set 이 정의되어 있다.

- 오토박싱, 언박싱 비용을 방지할 수 있는 기본 타입을 나타내는 클래스가 있다.

  - `BooleanArray`, `ByteArray`, `ShortArray` 등

- `.indices`

- `.withIndex()`



## 2 컬렉션 생성하기

- list, set, map 생성

- listOf, setOf, mapOf, mutableListOf, mutableSetOf, mutableMapOf

  ```kotlin
  public fun <T> listOf(vararg elements: T): List<T> =
  	if (elements.size > 0) elements.asList() else emptyList()
  ```

  

## 3 컬렉션에서 읽기 전용 뷰 생성하기

- 변경 가능 컬렉션에서 읽기 전용 뷰 생성
- `toList()` : List 타입의 레퍼런스를 리턴한다.



## 4 컬렉션에서 맵 만들기

```kotlin
val keys = 'a'..'f'
val map = keys.associateWith { it.toString().repeat(5).capitalize() }
print(map)
```

```shell
{a=Aaaaa, b=Bbbbb, c=Ccccc, d=Ddddd, e=Eeeee}
```



## 5 컬렉션이 빈 경우 기본값 리턴하기

- `ifEmpty()`, `ifBlank()`



## 6 주어진 범위로 값 제한하기

- `coerceIn`



## 7 컬렉션을 윈도우로 처리하기

- 컬렉션을 같은 크기로 나누고 싶으면 `chunked` 함수를 쓰고, 정해진 간격으로 컬렉션을 따라 움직이는 블록을 원한다면 `windowed` 함수를 사용한다.



## 8 리스트 구조 분해하기

- 리스트의 원소에 접근할 수 있게 구조 분해 (destructing) 를 하고 싶다.

- (a, b, c) 그룹에 리스트를 할당한다. (최대 5개 까지 가능)

  - 코틀린 표준 라이브러리 List 클래스에 N이 1부터 5까지인 `componentN` 확장 함수가 정의되어 있어 가능하다.

    ```kotlin
    @kotlin.internal.InlineOnly
    public inline operator fun <T> List<T>.component1(): T {
      return get(0)
    }
    ```

    

```kotlin
val (a, b, c, d, e) = list
```



## 9 다수의 속성으로 정렬하기

```kotlin
data class Golfer(val score: Int, val first: String, val last: String)
val golfers = listOf(
	Golfer(70, "Jack", "Nicklaus"),
  Golfer(68, "Tom", "Watson"),
  Golfer(68, "Bubba", "Watson"),
  Golfer(70, "Tiger", "Woods"),
  Golfer(68, "Ty", "Webb")
)

val sorted = golfers.sortedWith(
	compareBy({ it.score }, { it.last }, { it.first} )
)
// score, last, first 각각 오름차순으로 정렬된다.
```

```kotlin
fun <T> compareBy(
	vararg selectors: (T) -> Comparable<*>?
): Comparator<T>

fun <T> Iterable<T>.sortedWith(
	comparator: Comparator<in T>
): List<T>
```



## 10 사용자 정의 이터레이터

- 컬렉션을 감싼 클래스를 손쉽게 순회하고 싶다.
- next, hasNext 함수를 모두 구현한 이터레이터를 리턴하는 연산자 함수를 정의한다.

```kotlin
interface Iterator<out T> {
  operator fun next(): T
  operator fun hasNext(): Boolean
}
```

```kotlin
operator fun Team.iterator(): Iterator<Player> = players.iterator()
```



## 11 타입으로 컬렉션을 필터링하기

- `filterIsInstance<타입>()`, `filterIsInstanceTo(컬렉션<타입>())`



## 12 범위를 수열로 만들기

- `ClosedRange`, `LocallDateProgression`



---



# 6 시퀀스

- 코틀린 시퀀스는 자바 1.8 Stream 과 비슷
- 컬렉션에서 처리는 즉시(eager) 발생하는 반면, 시퀀스는 지연(lazy) 처리된다.
- 시퀀스를 사용하면 각각의 원소는 다음 원소가 처리되기 전에 전체 파이프라인을 먼저 완료한다.
- 데이터가 많거나, first 같은 쇼트 서킷 연산에 도움이 되고, 원하는 값을 찾았을 때 시퀀스를 종료할 수도 있다.



## 1 지연 시퀀스 사용

- 특정 조건을 만족시키는 최소량의 데이터만 처리하고 싶다.
- → 코틀린 시퀀스와 쇼트 서킷 함수를 사용한다.

```kotlin
(100 until 200).map { it * 2 }
	.filter { it % 3 == 0 }
	.first()
```

- 100개 계산 후
- 또 100개 계산 (bad design)

```kotlin
(100 until 200).map { it * 2 }
	.first { it % 3 == 0 }
```

- 100개 계산 후
- 오직 3개만 계산
- `first()` 는 술어를 만족하는 첫 번째 원소를 발견하는 순간 진행을 멈춘다. 이러한 방식을 **쇼트 서킷**이라 부른다.

```kotlin
(100 until 2_000_000).asSequence()
	.map { println("doubling $it"); it * 2 }
	.filter { println("filtering $it"); it % 3 == 0 }
	.first()
```

```shell
doubling 100
filtering 200
doubling 101
filtering 202
doubling 102
filtering 204

# 오직 6개만 연산한다.
```

- 시퀀스 API 는 컬렉션에 들어있는 함수와 같은 함수를 가지지만, 시퀀스에 대한 연산은 중간 연산, 최종 연산 범주로 나뉜다.
- map, filter 같은 중간 연산은 새로운 시퀀스를 리턴한다.
- first, toList 같은 최종 연산은 시퀀스가 아닌 다른 것을 리턴한다.
- **최종 연산 없이는 시퀀스가 데이터를 처리하지 않고 지연된다.**



## 2 시퀀스 생성하기

- 값으로 이뤄진 시퀀스 생성
- 이미 원소가 있다면 `sequenceOf` 사용하고, Iterable 이 있다면 `asSequence` 를 사용한다. 그 외는 시퀀스 생성기를 사용한다.

```kotlin
fun Int.isPrime() =
	this == 2 || (2..ceil(sqrt(this.toDouble())).toInt())
	.none { divisor -> this % divisior == 0 }
```

```kotlin
fun nextPrime(num: Int) = 
	generateSequence(num + 1) { it + 1 }
		.first(Int::isPrime())
```

```kotlin
fun <T: Any> generateSequence(
	seed: T?,
  nextFunction: (T) -> T?
): Sequence<T>
```



## 3 무한 시퀀스 다루기

- null 을 리턴하는 시퀀스 생성기를 사용하거나, `takeWhile` 같은 시퀀스 확장 함수를 사용한다.

```kotlin
fun firstNPrimes(count: Int) =
	generateSequence(2, ::nextPrime)
		.take(count)
		.toList()

fun primeLessThan(max: Int): List<Int> =
	generateSequence(2) { n -> if (n < max) nextPrime(n) else null }
		.toList()
		.dropLast(1)

fun primeLessThan(max: Int): List<Int> =
	generateSequence(2, ::nextPrime)
		.takeWhile { it < max }
		.toList()
```



## 4 시퀀스에서 yield 하기

- 구간을 지정해서 시퀀스에서 값을 생성하고 싶다.

- `yield` 중단 (suspend) 함수와 함께 sequence 를 사용한다.

  ```kotlin
  fun <T> sequence(
  	block: suspend SequenceScope<T>.() -> Unit
  ): Sequence<T>
  ```

- sequence 함수는 주어진 블록에서 평가되는 시퀀스를 생성한다.

- 이 블록은 인자 없는 람다 함수이고, void 를 리턴하며 평가 후에 SequenceScope 타입을 받는다.

- 필요할 때 yield 해서 값을 생성하는 람다를 제공해야 한다.

```kotlin
fun fibonacciSequence() = sequence {
  var terms = Pair(0, 1)
  
  while (true) {
    yield(terms.first)
    terms = terms.second to terms.first + terms.second
  }
}
```

```kotlin
abstract suspend fun yield(value: T)

abstract suspend fun yieldAll(iterator: Iterator<T>)
suspend fun yieldAll(elements: Iterable<T>)
suspend fun yieldAll(sequence: Sequence<T>)
```

- yield 함수는 sequence 연산에 제공된 람다를 받는 SequenceScope 의 일부다.
- **yield 함수는 이터레이터에 값을 제공하고 다음 값을 요청할 때까지 값 생성을 중단한다.**
- yield 는 suspend 함수가 생성한 시퀀스 안에서 각각의 값을 출력하는데 사용된다.
- yield 가 suspend 함수라는 사실은 코루틴과도 잘 동작한다는 의미다.
- 코틀린 런타임은 코루틴에 값을 제공한 후 다음 값을 요청할 때 까지 해당 코루틴을 중단시킬 수 있다.

```kotlin
@Test
fun `fist 10 Fibonacci numbers from sequence`() {
  val fis = fibonacciSequence()
  	.take(10)
  	.toList()
}
```

- `take` 연산에 의해 `yield` 가 호출될 때마다 무한루프는 값을 하나씩 제공한다.
- `yieldAll` 은 다수의 값을 이터레이터에게 넘겨준다.

```kotlin
val sequence1 = sequence {
  var start = 0
  yield(0)
  yieldAll(1..5 step 2)
  yieldAll(generateSequence(8) { it * 3 })
}
```

```shell
# sequence1 는 0, 1, 3, 5, 8, 24, 72, ... 를 원소로 갖는 시퀀스
# take 함수 사용해서 sequence1 에 접근하면 원하는 수만큼 원소를 리턴할 수 있다.
```


