# Kotlin Cookbook 002





# 4 함수형 프로그래밍

- 함수형 프로그래밍은
  - 불변성을 선호하고
  - 순수함수를 사용하는 경우 동시성을 쉽게 구현할 수 있으며
  - 반복보다는 변형을 사용하고
  - 조건문보다는 필터를 사용하는 코딩 스타일을 말한다.



## 1 알고리즘에서 fold 사용하기

- 반복 알고리즘을 함수형 방식으로 구현

- `fold` 함수로 시퀀스나 컬레션을 하나의 값으로 축약(reduce)한다.

  ```kotlin
  inline fun <R> Iterable<T>.fold(
  	initial: R,
    operation: (acc: R, T) -> R
  ): R
  ```

  - 똑같은 함수가 `Array`, `IntArray`, `DoubleArray` 등 명시적 타입 배열에 정의돼 있다.



```kotlin
fun sum(vararg nums: Int) = 
	nums.fold(0) { acc, n -> acc + n }
```

```kotlin
fun recursiveFactorial(n: Long): BigInteger =
	when(n) {
    0L, 1L -> BigInteger.ONE
    else -> BigInteger.valueOf(n) * recursiveFactorial(n - 1)
  }

fun factorialFold(n: Long): BigInteger =
	when(n) {
    0L, 1L -> BigInteger.ONE
    else -> (2..n).fold(BigInteger.ONE) { acc, i -> 
    	acc * BigInteger.valueOf(i) }
  }
```



## 2 reduce 함수를 사용해 축약하기

- 비어 있지 않은 컬렉션의 값을 축약하고 싶다. 이 떄 누적자의 초기값을 설정하고 싶지 않다.

  - `fold` 대신 `reduce` 를 사용한다.

  ```kotlin
  inline fun <S, T : S> Iterable<T>.reduce(
  	operation: (acc: S, T) -> S
  ): S
  ```

  ```kotlin
  public inline fun IntArray.reduce(
  	operation: (acc: Int, Int) -> Int): Int {
    if (isEmpty())
    	throw UnsupportedOperationException("Empty array can't be reduced.")
    var accumulator = this[0]
    for (index in 1..lastIndex)
    	accumulator = operation(accumulator, this[index])
    return accumulator
  }
  ```

  - 비어있는 컬렉션은 예외를 발생시킨다.
  - 누적자(accumulator)는 컬렉션의 첫 번째 원소로 초기화 한다.



## 3 꼬리 재귀 적용하기

- 재귀 프로세스 실행시 필요한 메모리를 최소화하려면
  - `tailrec` 키워드를 사용한다.
- 재귀 호출에서 스택 프레임을 많이 호출하면 `StackOverFlowError` 가 난다.
- `tailrec` 스택 프레임을 재활용하는 코드로 컴파일시 변환해준다.
- 표현은 재귀함수로 가독성 좋게 표현하면서도, 컴파일시는 메모리 효율적인 반복문으로 변환해준다.
- 조건
  - 함수는 반드시 수행하는 마지막 연산으로 자신을 호출해야 한다. (꼬리 재귀)
  - try / catch / finally 블록 안에서는 tailrec 을 사용할 수 없다.
  - JVM 백엔드에서만 꼬리 재귀가 지원된다.



---



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



---

# 7 영역 함수

- 코틀린 표준 라이브러리에는 객체 컨텍스트 안에서 코드 블록을 실행할 목적으로 만든 다수의 함수가 포함돼 있다.
- 영역함수 `apply`, `also`, `let`, `run`
- apply 는 컨텍스트 객체를 리턴한다.
- also 는 컨텍스트 객체를 리턴한다.
- let 은 블록의 결과를 리턴한다.
- run 은 블록의 결과를 리턴한다.



## 1 apply 로 객체 생성 후에 초기화하기

- `apply` 블록은 이미 인스턴스화된 객체의 추가 설정을 위해 사용하는 가장 일반적 방법이다.

- apply 함수 사용해서 객체 사용하기 전에 생성자만으로 할 수 없는 초기화한다.

- this 를 인자로 전달하고, 리턴한다.

  ```kotlin
  inline fun <T> T.apply(block: T.() -> Unit): T
  ```

  ```kotlin
  @Repository
  class JdbcOfficerDAO(private val jdbcTemplate: JdbcTemplate) {
    private val insertOfficer = SimpleJdbcInsert(jdbcTemplate)
    	.withTableName("OFFICERS")
    	.usingGeneratedKeyColumns("id")
    
    fun save(officer: Officer) =
    	officer.apply {
        id = insertOfficer.executeAndReturnKey(
        	mapOf("rank" to rank,
               "first_name" to first,
               "last_name" to last)
        )
      }
  }
  ```
  
  - `Officer` 인스턴스는 this 로서 apply 블록에 전달되기 때문에 블록 안에서 rank, first, last 속성에 접근할 수 있다.
  - `Officer` 의 id 속성은 apply 블록 안에서 갱신된 다음 `Officer` 인스턴스가 리턴된다.
  - 이처럼 결과가 컨텍스트 객체가 되어야 한다면 apply 블록은 유용하다.



## 2 부수효과 위해 also 사용하기

- 코드 흐름을 방해하지 않고 메시지를 출력하거나 다른 부수 효과를 생성하고 싶다.

  ```kotlin
  public inline fun <T> T.also(
  	block: (T) -> Unit
  ): T
  ```

  ```kotlin
  val book = createBook()
  	.also { println(it) }
  	.also { Logger.getAnonymousLogger().info(it.toString()) }
  ```

  - 블록 안에서 객체를 it 이라고 언급한다.



## 3 let 함수와 엘비스 연산자 사용하기

- 널이 아닌 레퍼런스의 코드 블록을 실행하고 싶지만, 레퍼런스가 널이라면 기본값을 리턴하고 싶다.

  ```kotlin
  public inline fun <T, R> T.let(
  	block: (T) -> R
  ): R
  ```

  - let 함수는 컨텍스트 객체가 아닌 블록의 결과를 리턴한다.

```kotlin
fun processNullableString(str: String?) =
	str?.let {
    when {
      it.isEmpty() -> "Empty"
      it.isBlank() -> "Blank"
      else -> it.capitalize()
    }
  } ?: "Null"
```





## 4 임시 변수로 let 사용하기

- 연산 결과를 임시 변수에 할당하지 않고 처리하고 싶다.
  - 연산에 let 호출을 연쇄하고, let에 제공한 람다 또는 함수 레퍼런스 안에서 그 결과를 처리한다.

```kotlin
val numbers = mutableListOf("one", "two", "three", "four", "five")
numbers.map { it.length }.filter { it > 3 }.let(::println)
```



---



# 8 코틀린 대리자(delegate)

- 표준 라이브러리의 `lazy`, `observable`, `vetoable`, `notNull` 대리자 및 사용자 정의 대리자가 있다.
- 클래스 대리자를 통해 상속을 합성(composition)으로 대체할 수 있고, 속성 대리자를 통해 획득자와 설정자를 다른 클래스에 있는 속성의 획득자와 설정자로 대체할 수 있다.
- 코틀린 라이브러리 표준 `Delegates` 객체 구현



## 1 대리자를 사용해서 합성 구현하기

- 다른 클래스의 인스턴스가 포함된 클래스를 만들고, 그 클래스에 연산을 위임하고 싶다.
  - 연산을 위임할 메소드가 포함된 인터페이스를 만들고, 클래스에서 해당 인터페이스를 구현하다음, `by` 키워드를 사용해 바깥쪽에 래퍼 클래스를 만든다.
- `by` 키워드는 포함된 객체에 있는 모든 public 함수를 이 객체를 담고 있는 컨테이너를 통해 노출할 수 있다.
- **최신 객체 지향 디자인은 강한 결합 없이 기능을 추가할 때 상속보다는 합성을 선호한다.**
  - 코틀린에서 `by` 키워드는 포함된 객체에 있는 모든 public 함수를 이 객체를 담고 있는 컨테이너를 통해 노출할 수 있다.



```kotlin
interface Dialable {
  fun dial(number: String): String
}

class Phone : Dialable {
  override fun dial(number: String) =
  	"Dialing $number..."
}

interface Snappable {
  fun takePicture(): String
}

class Camera : Snappable {
  override fun takePicture() =
  	"Taking picture..."
}

class SmartPhone(
	private val phone: Dialable = Phone(),
  private val camera: Snappable = Camera()
): Dialable by phone, Snappable by camera
```

- SmartPhone 클래스는 생성자에서 Phone 과 Camera 를 인스턴스화핟고 모든 public 함수를 Phone 과 Camera 인스턴스에 위임할 수 있도록 정의할 수 있다.

```kotlin
class SmartPhoneTest {
  private val smartPhone: SmartPhone = SmartPhone()
  
  @Test
  fun `Dialing delegates to internal phone`() {
    assertEquals("Dialing 555-1234...", smartPhone.dial("555-1234"))
  }
  
  @Test
  fun `Taking picture delegates to internal camera`() {
    assertEquals("Taking picture...", smartPhone.takePicture())
  }
}
```

- 코틀린 바이트코드 보기 수행 후, 디컴파일 결과

```java
public final class Smartphone implements Dialable, Snappable {
  private final Dialable phone;
  private final Snappable camera;
  
  public SmartPhone(@NotNull Dialable phone, @NotNull Snappable camera) {
    this.phone = phone;
    this.camera = camera;
  }
  
  @NotNull
  public String dial(@NotNull String number) {
    return this.phone.dial(number);
  }
  
  @NotNull
  public String takePicture() {
    return this.camera.takePicture()
  }
}
```





## 2 lazy 대리자 사용하기

- 어떤 속성이 필요할 때까지 해당 속성의 초기화를 지연시키고 싶다.

- `lazy` 대리자를 사용하려면 람다를 제공해야 한다.

  ```kotlin
  fun <T> lazy(initializer: () -> T): Lazy<T>
  
  fun <T> lazy(
  	mode: LazyThreadSafeMode, initializer: () -> T
  ): Lazy<T>
  
  fun <T> lazy(lock: Any?, initializer: () -> T): Lazy<T>
  ```

- mode 기본값은 `LazyThreadSafeMode.SYNCHRONIZED`

  - lazy 에 제공된 초기화 람다가 예외를 던지면, 다음 번 접근할 때 값 초기화를 시도한다.
  - 오직 하나의 스레드만 Lazy 인스턴스를 초기화할 수 있게 락을 사용

- `PUBLICATION`

  - 초기화 함수가 여러 번 호출될 수 있지만 첫 번째 리턴값만 사용 됨

- `NONE`

  - 락이 사용되지 않음



```kotlin
val ultimateAnswer: Int by Lazy {
  println("computing the answer")
  42
}
```

```kotlin
println(ultimateAnswer)
println(ultimateAnswer)
```

- 두 번 호출시 computing the answer 은 처음 초기화될 때 한 번만 출력된다. 
- 내부적으로 코틀린은 값을 캐시하는 `Lazy` 타입의 ultimateAnswer$delegate 라는 특별한 속성을 생성한다.



## 3 값이 널이 될 수 없게 만들기

- 처음 접근이 일어나기 전 값이 초기화되지 않았다면 예외를 던지고 싶다.
- `notNull` 함수 이용해서 예외 던지는 대리자를 제공한다.

```kotlin
var shouldNotBeNull: String by Delegates.notNull<String>()
```

- 속성에 값이 제공되기 전 접근을 시도하면 코틀린이 `IllegalStateException` 을 던진다.

```kotlin
@Test
fun `uninitialized value thorws exception`() {
  assertThrows<IllegalStateException> { shouldNotBeNull }
}

@Test
fun `initialize value then retrieve it`() {
  shouldNotBeNull = "Hello, World!"
  assertDoesNotThrow { shouldNotBeNull }
  assertEquals("Hello, World!", shouldNotBeNull)
}
```

- 표준 라이브러리의 notNull 구현 (`Delegates.kt`)

```kotlin
object Delegates {
  fun <T : Any> notNull(): ReadWriteProperty<Any?, T> = NotNullVar()
  // ...
}

private class NotNullVar<T: Any>() : ReadWriteProperty<Any?, T> {
  private var value: T? = null
  
  override fun getValue(thisRef: Any?, property: KProperty<*>): T {
    return value ?: throw IllegalStateException(
    	"Property ${property.name} should be initialized before get.") 
  }
  
  override fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
    this.value = value
  }
}
```

- object 키워드를 사용해서 Delegates 싱글톤 인스턴스를 정의했다. Delegates 에 포함된 notNull 함수는 자바의 static 처럼 동작한다.
- 이렇게 대리자(delegate)를 작성할 때는 싱글톤 클래스, 팩토리 메소드, private 구현 클래스 조합을 자주 사용한다.



## 4 observable 과 vetoable 대리자 사용

- 속성의 변경을 가로채서 필요에 따라 변경을 거부하고 싶다.
- 변경 감지에는 `observable` 을 사용하고, 변경의 적용 여부 결정할 때는 `vetoable` 함수와 람다를 사용한다.
- observable, vetoable 함수의 구현은 개발자가 대리자를 직접 작성할 때 참고할 만한 좋은 패턴이다.

```kotlin
fun <T> observable(
	initialValue: T,
  onChange: (property: KProperty<*>, oldValue: T, newValue: T) -> Unit
): ReadWriteProperty<Any?, T>

fun <T> vetoable(
	initialValue: T,
  onChange: (property: KProperty<*>, oldValue: T, newValue: T) -> Boolean): ReadWriteProperty<Any?, T>
```

```kotlin
object Delegates {
  // ...
  inline fun <T> observable(initialValue: T,
                           crossinline onChange: (property: KProperty<*>,
                                                 oldValue: T,
                                                 newValue: T) -> Unit): ReadWriteProperty<Any?, T> =
  	object : ObservableProperty<T>(initialValue) {
      override fun afterChange(property: KProperty<*>,
                              oldValue: T,
                              newValue: T) = onChange(property, oldValue, newValue)
    }
  
  inline fun <T> vetoable(initialValue: T,
                         crossinline onChange: (property: KProperty<*>,
                                               oldValue: T,
                                               newValue: T) -> Boolean): ReadWriteProperty<Any?, T> =
  	object : ObservalableProperty<T>(initialValue) {
      override fun beforeChange(property: KProperty<*>,
                               oldValue: T,
                               newValue: T): Boolean = onChange(property, oldValue, newValue)
    }
}
```

```kotlin
abstract class ObservableProperty<T>(initialValue: T) : ReadWriteProperty<Any?, T> {
  private var value = initialValue
  
  protected open fun beforeChange(property: KProperty<*>,
                                 oldValue: T,
                                 newValue: T): Boolean = true
  
  protected open fun afterChange(property: KProperty<*>,
                                 oldValue: T,
                                 newValue: T): Unit {}
  
  override fun getValue(thisRef: Any?, property: KProperty<*>): T {
    return value
  }
  
  override fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
    val oldValue = this.value
    if (!beforeChange(property, oldValue, value)) {
      return
    }
    this.value = value
    afterChange(property, oldValue, value)
  }
}
```

>- `inline`
>  - 컴파일러가 함수만 호출하는 완전히 새로운 객체를 생성하는 것이 아닌, 해당 호출 위치를 실제 소스 코드로 대체하도록 지시한다.
>- `crossinline`
>  - `inline` 함수는 가끔 다른 컨텍스트에서 실행되어야 하는 파라미터로 전달되는 람다이다. 이러한 '로컬이 아닌' 제어 흐름은 람다 내에서는 허용되지 않는다. 이 때 `crossinline` 제어자가 필요하다.



## 5 대리자로서 Map 제공하기

- 맵으로 객체를 초기화하고 싶다.

```kotlin
data class Project(val map: MutableMap<String, Any?>) {
  val name: String by map,
  val priority: Int by map,
  val completed: Boolean by map
}
```

- 맵의 키에 해당하는 값으로 클래스 속성을 초기화한다.

```kotlin
private fun getMapFromJSON() =
	Gson().fromJson<MutableMap<String, Any?>>(
  	"""{ "name": "bear", "priority": 5, "completd": true }""",
    MutableMap::class.java
  )

@Test
fun `create project from map parsed from JSON string`() {
  val project = Project(getMapFromJSON())
  assertAll(
    { assertEquals("bear", project.name) },
    { assertEquals(5, project.priority) },
    { assertTrue(project.completed) }
  )
}
```



## 6 사용자 정의 대리자 만들기

- 어떤 클래스의 속성이 다른 클래스의 획득자와 설정자를 사용하게끔 만들고 싶다.

```kotlin
interface ReadOnlyProperty<in R, out T> {
  operator fun getValue(thisRef: R, property: KProperty<*>): T
}

interface ReadWriteProperty<in R, T> {
  operator fun getValue(thisRef: R, property: KProperty<*>): T
  operator fun setValue(thisRef: R, property: KProperty<*>, value: T)
}
```

- 흥미롭게도 대리자를 만들려고 위 인터페이스를 구현할 필요는 없다.
- 클래스에 연산자 함수를 만들고 `by` 로 변수 옆에 쓰면된다.

```kotlin
import kotlin.reflect.KProperty

class MyDelegate {
  operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
    return "$thisRef, thank you for delegating '${property.name}' to me!"
  }
  
  operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
    println("'$value' has been assigned to '${property.name}' in $thisRef.")
  }
}

fun main() {
  val p: String by MyDelegate()
  println(p)
  p = "NEW"
}
```

```shell
null, thank you for delegating 'p' to me!
'NEW' has been assigned to 'p' in null.
```

















---

# 13 코루틴과 구조적 동시성

- 코루틴은 동시성 코드를 마치 동기코드처럼 작성할 수 있게 도와준다.
  - 콜백 메소드나 리액티브 스트림과 같은 다른 방법보다 더 쉽게 동시성 코드를 작성할 수 있다.
- 코루틴 영역(scope), 코루틴 컨텍스트(context), 적절한 코루틴 빌더와 디스패처 선택하기, 코루틴 동작 조정하기
- 코루틴을 일시정지(suspend)하고 재개(resume)할 수 있다.
  - `suspend` 키워드로 함수를 만들면 복잡한 멀티스레딩 코드를 직접 작성하지 않고도 함수를 임시 정지하고 나중에 다른 스레드에서 이 정지된 함수를 재개할 수 도 있다는 것을 시스템에게 알려줄 수 있다.



## 1 코루틴 빌더 선택

- 새 코루틴 생성하려면 `runBlocking` (최상위 함수), `launch`, `async` (`CoroutineScope` 의 확장함수) 중 하나를 사용할 수 있다.



### runBlocking 빌더

- 현재 쓰레드를 블록하고, 모든 내부 코루틴이 종료될 때까지 블록한다.

- 시그니처

  ```kotlin
  fun <T> runBlocking(block: suspend CoroutineScope.() -> T): T
  ```

- 인자로 받은 suspend 함수를 실행하고, 실행한 함수가 리턴하는 값을 리턴한다.



### launch 빌더

- 독립된 프로세스를 실행하는 코루틴을 시작한다. 코루틴에서 리턴 받을 필요가 없을 때 사용

- launch 는 job 인스턴스를 리턴. 이를 통해 코루틴 취소가 가능

- 시그니처

  ```kotlin
  fun CoroutineScope.launch(
  	context: CoroutineContext = EmptyCoroutineContext, // 다른 코루틴과 상태를 공유하기 위해 사용
    start: CoroutineStart = CoroutineStart.DEFAULT, // DEFAULT, LAZY, ATOMIC, UNDISPATCHED
    block: suspend CoroutineScope.() -> Unit
  ): Job
  ```



### async 빌더

- 값을 리턴해야 하는 경우 async 를 사용한다.

- 시그니처

  ```kotlin
  fun <T> CoroutineScope.async(
  	context: CoroutineContext = EmptyCoroutineContext,
    start: CoroutineStart = CoroutineStart.DEFAULT,
    block: suspend CoroutineScope.() -> T	
  ): Deferred<T>
  ```

- 지연된 인스턴스(`Diferred`)로 리턴값을 감싼다.

  - 자바스크립트의 Promise 또는 자바의 Future 과 비슷하다.
  - `await`은 이렇게 생산된 값을 리턴하기 전에 코루틴이 완료될 때까지 기다린다.



### coroutineScope 빌더

- 종료 전에 포함된 모든 코루틴이 완료될 때까지 기다리는 일시중단함수이다.

- runBlocking 과 다르게 메인 스레드를 블록하지 않지만, 반드시 일시중단함수의 일부로서 호출돼야 한다.

- 모든 자식 코루틴이 완료될 때까지 기다린다.

- 시그니처

  ```kotlin
  suspend fun <R> coroutineScope(
  	block: suspend CoroutineScope.() -> R
  ): R
  ```

- 구조화된 동시성 : **하나의 코루틴이 실패하면 모든 코루틴이 취소될 수 있게 coroutineScope 내부에서 모든 코루틴을 실행시키는 관습이다.**



---

## 2 async/await을 withContext로 변경하기

- await 코드 간소화

- 시그니처

  ```kotlin
  suspend fun <T> withContext(
  	context: CoroutineContext,
    block: suspend CoroutineScope.() -> T
  ): T
  ```

- `withContext` 는 주어진 코루틴 컨텍스트와 함께 명시한 일시정지 블록을 호출하고, 완료될 때까지 정지한 후 결과를 리턴한다.

- 인텔리제이에서도 async 뒤에 바로 await 이 나오면 변환해주는 추천 문구가 뜬다.





## 3 Dispatcher 사용하기

- 코루틴 컨텍스트에는 `CoroutineDispatcher` 클래스의 인스턴스에 해당하는 코루틴 디스패처가 포함돼 있다.
- 디스패처는 코루틴이 어떤 쓰레드 또는 쓰레드풀에서 코루틴을 실행할지 결정한다.
- launch, async 등 빌더에서 `CoroutineContext` 파라미터를 통해 디스패처를 명시할 수 있다.
  - `Dispatcher.Default`
    - 공유 백그라운드 스레드 풀 사용, 대규모 계산 리소스를 소모하는 경우 적합
  - `Dispatcher.IO`
    - 파일 I/O, 블로킹 네트워크 I/O 등 입출력 집약적 블로킹 작업을 제거하기 위해 디자인된 스레드 온디맨드 공유 풀 사용
  - `Dispatcher.Unconfined`
    - 일반적인 애플리케이션 코드에서 사용하지 않는다.



## 4 자바 스레드 풀에서 코루틴 실행하기

- 코루틴을 사용하는 사용자 정의 스레드 풀을 만든다.

- 자바의 `ExecutorService` 의 `asCoroutineDispatcher` 함수를 사용한다. `Excutors` 클래스로 사용자 정의 스레드 풀을 정의한 다음 디스패처로 사용할 수 있게 반환한다.

- 자동으로 close 할 방법을 만들었고, `use` 메소드를 사용해야 한다.

- 시그니처

  ```kotlin
  inline fun <T: Closeable?, R> T.use(block: (T) -> R): R
  ```

- use 는 자바 Closeable 인터페이스의 확장함수로 정의되어 있다.

```kotlin
Executors.newFixedThreadPool(10).asCoroutineDispatcher().use {
  withContext(it) {
    delay(100L)
    println(Thread.currentThread().name)
  }
}
```

- use 블록 끝에서 디스패처를 닫을 것이고, 그러면 기저의 스레드도 닫힌다.





## 5 코루틴 취소하기

- 코루틴 내의 비동기 처리를 취소한다.

- `withTimeout`, `withTimeoutOrNull` 같은 함수가 리턴하는 Job 레퍼런스를 사용한다.

- 시그니처

  ```kotlin
  suspend fun <T> withTimeout(
  	timeMillis: Long,
    block: suspend CoroutineScope.() -> T
  ): T
  ```

  - Timout 초과하면 `TimoutCancellationException` 던진다.
  - 이를 캐치하거나 타움 아웃시 예외 던지는 대신 null 리턴하는 `withTimoutOrNull` 사용 가능



## 6 코루틴 디버깅

- `-Dkotlinx.coroutines.debug` 플래그를 사용해서 JVM 을 실행한다.
- @coroutine#1 등으로 해당 코루틴 이름이 기본으로 적혀나온다.
- 이를 수정하고 싶다면, `CoroutineName("myCoroutine")` 등으로 사용할 수 있다.

```kotlin
suspend fun retrievel(url: String) = coroutineScope {
  async(Dispatcher.IO + CoroutineName("async")) {
    delay(100L)
    "async result"
  }.await()
}
```





