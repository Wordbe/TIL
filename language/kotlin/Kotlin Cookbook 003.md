

# Kotlin Cookbook 003





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
> - 컴파일러가 함수만 호출하는 완전히 새로운 객체를 생성하는 것이 아닌, 해당 호출 위치를 실제 소스 코드로 대체하도록 지시한다.
>- `crossinline`
> - `inline` 함수는 가끔 다른 컨텍스트에서 실행되어야 하는 파라미터로 전달되는 람다이다. 이러한 '로컬이 아닌' 제어 흐름은 람다 내에서는 허용되지 않는다. 이 때 `crossinline` 제어자가 필요하다.



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







