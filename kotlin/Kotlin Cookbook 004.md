# Kotlin Cookbook 004



# 9 테스트



## 1 테스트 클래스 수명주기 설정하기

- JUnit5 테스트 수명주기를 테스트 함수당 한 번 (기본값) 대신, 클래스 인스턴스당 한 번씩 인스턴스화 하고 싶다.
- 테스트 인스턴스 수명주기를 `PER_CLASS` 로 하면 테스트 함수 양과 상관없이 테스트 인스턴스가 딱 하나만 생성된다.

```kotlin
@TestInstance(TestInstance.Lifecyle.PER_CLASS)
class JUnit5ListTests {
  private val strings = listOf("this", "is", "a", "list", "of", "strings")
  
  private lateinit var modifiable : MutableList<Int>
  
  @BeforeEach
  fun setUp() {
    modifiable = mutableListOf(3, 1, 4, ,1, 5)
    println("Before: $modifiable")
  }
  
  @AfterEach
  fun finish() {
    println("After: $modifiable")
  }
  
  @Test
  fun test1() {
    // ...
  }
  
  @Test
  fun test2() {
    // ...
  }
}
```

또는 src/test/resource/junit-platform.properties 파일을 생성한다.

```properties
junit.jupiter.testinstance.lifecycle.default = per_class
```





## 2 테스트에 데이터 클래스 사용하기

- 코드를 부풀리지 않고 객체의 여러 속성을 체크하고 싶다.
  - 원하는 속성을 모두 캡슐화하는 데이터 클래스를 생성한다.
- `data class` 로 정의했다면, `equals` 메소드가 클래스 내부에 정의되므로 아래와 같이 테스트할 수 있다.

```kotlin
@Test
internal fun `use data class`() {
  val book = service.findBookById("1935182943")
  val expected = Book(isbn = "1935182943",
                     title = "Making Java Groovy",
                     author = "Ken Kousen",
                     published = LocalDate.of(2013, Month.SEPTEMBER, 30))
  
  assertThat(book, `is`(expected))
}
```





## 3 기본 인자와 함께 도움 함수 사용하기

- 테스트 객체를 빠르게 생성해보자.
- 원본 클래스를 수정하지 말고, 기본 인자를 가진 helper 함수를 만든다.

```kotlin
fun createBook(
	isbn: String = "149197317X",
  title: String = "Moder Java Recipes",
  author: String = "Ken Kousen",
  published: LocalDate = LocalDate.parse("2017-08-26")
) = Book(isbn, title, author, published)
```





## 4 여러 데이터에 JUnit5 테스트 반복하기

- `@ParameterizedTest`, `@MethodSource`
- 테스트 수명주기가 기본 옵션인 `LifeCycle.PER_METHOD` 라면 테스트 데이터 소스함수를 companion object 안에 위치시켜야 한다.
  - 그리고 JUnit 자바 라이브러리가 메소드 소스를 static 으로 간주하므로 `@JvmStatic` 을 붙여야 한다.

```kotlin
companion object {
  @JvmStatic
  fun fibs() = listOf(
  	Arguments.of(1, 1), 
    Arguments.of(2, 1),
    Arguments.of(3, 2),
    Arguments.of(4, 3),
    Arguments.of(5, 5),
    Arguments.of(6, 8),
    Arguments.of(7, 13)
  )
}

@ParameterizedTest(name = "fibonacci({0}) == {1}")
@MethodSource("fibs")
fun `first 7 Fibonacci numbers (companion method)`(n: Int, fib: Int) = 
	assertThat(fibonacci(n), `is`(fib))
```





## 5 파라미터화된 테스트에 data 클래스 사용하기

```kotlin
data class FibonacciTestData(val n: Int, expected: Int)
```











# 10 입력/출력

코틀린에서는 개발자 대신 `use` 함수를 사용해서 리소스를 닫는다.



## 1 use로 리소스 관리하기

- 자바 1.7에 도입된 try-with-resource 구문을 코틀린은 지원하지 않는다.
- 이 때 사용할 리소스가 `Closeable` 인터페이스를 구현한 클래스여야 한다.
- `File`, `Stream` 등 많은 클래스가 `Closeable` 을 구현한다.
- 코틀린은 `Closeable` 의 확장함수 `use` 를 제공한다.  Reader 와 File 에는 `useLines` 을 추가했다.

```kotlin
inline fun <T> File.useLines(
	charset: Charset = Charsets.UTF_8,
  block: (Sequence<String>) -> T
): T = bufferedReader(charset).use { block(it.lineSequence()) }
```





## 2 파일에 기록하기

```kotlin
File("myFile.txt").writeText("My data")
```





---

# 11 그 밖의 코틀린 기능



## 1 코틀린 버전

```kotlin
KotlinVersion.CURRENT
```





## 2 반복하여 람다 실행하기

```kotlin
repeat(5) {
  println("counting: $it")
}
```



## 3 완벽한 when 강제하기

```kotlin
val <T> T.exhaustive: T
	get() = this
```

```kotlin
when (n % 3) {
  0 -> "0"
  1 -> "1"
  2 -> "2"
  else -> "no"
}.exhaustive
```

- 리턴을 강제한다.



## 4 정규표현식과 함께 replace 함수 사용하기

```kotlin
assertEquals("********", "one.two.".replace(".".toRegex(), "*"))
```

- 정규표현식에서 `.` 는 모든 단일 글자를 의미한다.



## 5 바이너리 문자열로 변환하고 되돌리기

- radix 를 인자로 받는 toString, toInt 함수 중복을 사용한다.



## 6 실행 가능한 클래스 만들기

- 클래스에서 단일 함수를 간단하게 호출하고 싶다
- 함수를 호출할 클래스에서 `invoke` 연산자 함수를 재정의한다.



```kotlin
class AstroRequest {
  companion object {
    private const val ASTRO_URL =
    	"http://api.open-notify.org/astros.json"
  }
  
  operator fun invoke(): AstroResult {
    val responseString = URL(ASTRO_URL).readText()
    return Gson().fromJson(responseString, AstroResult::class.java)
  }
}

internal class AstroResultTest {
  val request = AstreRequest()
  
  @Test
  internal fun `get people in space`() {
    val result = request()
    assertThat(result.people.size, `is`(result.number.toInt()))
  }
}
```





## 7 경과 시간 측정하기

- `measureTimeMillis`, `measureNanoTime`
- JMH



## 8 스레드 시작하기

- 코드 블록을 동시적 스레드에서 실행하고 싶다.
- `kotlin.concurrent` 패키지의 thread 함수를 사용한다.

```kotlin
fun thread(
	start: Boolean = true,
  isDaemon: Boolean = false,
  contextClassLoader: ClassLoader? = null,
  name: String? = null,
  priority: Int = -1,
  block: () -> Unit
): Thread {
  val thread = object : Thread() {
    public override fun run() {
      block()
    }
  }
  
  if (isDaemon)
  	thread.isDaemon = true
  if (priority > 0)
  	thread.priority = priority
  if (name != null)
  	thread.name = name
  if (contextClassLoader != null)
  	thread.contextClassLoader = contextClassLoader
  if (start)
  	thread.start()
  return thread
}
```





## 9 TODO 로 완성 강제하기

- 개발자가 특정 함수나 테스트 구현을 끝마치게 하고 싶다.
- 함수 구현을 완성하지 않으면 예외를 던지는 TODO 함수를 사용한다.

```kotlin
public inline fun TODO(reason: String): Nothing = 
	throw NotImplementedError("An operation is not implemented: $reason")
```

```kotlin
fun `todo test`() {
  assertThrows<NotImplementedError> {
    TODO("seriously, finish this")
  }
}
```





## 10 Random 의 무작위 동작 이해하기

- 난수 생성



## 11 함수 이름에 특수 문자 사용하기

- 함수 이름을 읽기 쉽게
- underscore 을 사용하거나, 함수 이름을 백틱으로 감쌀 수 있다.(이러면 공백을 넣을 수 있다.) 하지만 테스트에서만 사용하자.



## 12 자바에게 예외 알리기

- 코틀린에서 체크 예외(checked exception)를 던지는 경우, 자바에게 해당 예외가 체크 예외임을 알려주고 싶다.
- 함수 시그니처에 `@Throws` 를 추가한다.
- 코틀린 모든 예외는 언체크(unchecked) 예외다. 즉, 컴파일러는 개발자에게 해당 예외를 처리할 것을 강제하지 않는다. 
  - 코틀린은 throws 키워드가 없다.

```kotlin
fun doCheckedException() {
  throw IOException()
}
```

```java
// 컴파일 에러 : 자바에서는 doCheckedException 함수가 예외를 던지지 않는다고 생각하기 때문이다.
public static void useTryCatchBlock() {
  try {
    doCheckedException();
  } catch (IOException e) {
    e.printStackTrace();
  }
}

// 컴파일은 되지만 IDE와 컴파일러는 불필요한 코드가 있다고 경고할 것이다.
public static void useThrowsClause() throws IOException {
  doCheckedException();
}
```

```kotlin
@Throws(IOException::class)
fun doCheckedException() {
  throw IOException()
}
```

- 이와 같이 하면, 자바에서 IOException을 대비하면 된다.


