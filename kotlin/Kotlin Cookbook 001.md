# Kotlin Cookbook 001





# 1



- 코틀린파일 (kt) 컴파일해서 실행가능
- REPL (Read, Evaluation, Print, Loop) 으로 인터페이스 형식으로 실행가능
  - `kotlinc`
- 스크립트 (kts) 파일 실행가능
  - `kotlinc -script southpole.kts`
- 그레이들 이용해서 코틀린 프로젝트 빌드하기





# 2 코틀린 기초



## 1 널 허용 타입 사용하기

- 널 허용 타입

  - ?. (안전 호출 연산자, safe call operator)
    - 값이 널이면 null 을 반환한다.
  - ?: (엘비스 연산자)

- `as?` 안전 타입 변환

  - 타입 변환이 올바르지 않은 경우 `ClassCastException` 발생을 방지한다.

    ```kotlin
    val p1 = p as? Person // 해당 인스턴스가 널일 수도 있음
    ```



## 2 자바에 널 허용성 지시자 추가하기

- 코틀린은 컴파일시간에 타입 시스템에 널 허용성을 강제한다.
- `@NonNull`



## 3 자바를 위한 메소드 중복

- 코틀린에서 함수 매개변수에 값을 미리 지정해둘 수 있다.
- 코틀린에서 만든 이 함수를 자바에서 활용하고 싶다면, `@JvmOverloads` 어노테이션을 붙이면된다.
- 그러면 메소드를 오버로딩해서 여러개 만들어준다.



## 4 명시적으로 타입 변환하기

- 코틀린은 기본적으로 더 넓은 타입으로 자동 타입 변환하지 않는다. 예를 들어 Int 에서 Long 으로 승격하지 않는다.
- int 를 long 으로 승격시키려면 `toLong()` 사용하면 된다.
- 더하기(+) 연산자는 자동으로 long으로 변환하고 long 리터럴에 값을 더한다.

```kotlin
val intVar: Int = 3
val longVar: Long = intVar.toLong()

val longSum = 3L + intVar
```





## 9 to 로 Pair 인스턴스 생성하기

- 직접 Pair 클래스의 인스턴스 생성보다는 중위(infix) to 함수를 사용한다.

```kotlin
fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K, V>
```

- Pair 는 first, second 를 가진 데이터 클래스다.

```kotlin
data class Pair<out A, out B> : Serializable
```

- 생성자도 사용가능하지만, to 함수로 Pair 인스턴스를 생성하는 것이 일반적이다.

```kotlin
public infix fun <A, B> A.to(that: B): Pair<A, B> = Pair(this, that)
```







---

# 3 코틀린 객체 지향 프로그래밍



## 1 const 와 val 차이

- `val` 은 변경 불가능한 변수를 나타낸다. 자바에서 `final` 과 같다.
- `const` 는 컴파일타임 상수를 표시
  - 컴파일타임 상수는 객체나 동반객체(companion object) 선언의 최상위 속성이어야 한다.
  - 문자열 또는 기본 타입의 래퍼 클래이고, `getter` 를 가질 수 없다.
  - 컴파일 시점에 값을 사용할 수 있도록 main 함수를 포함한 모든 함수의 바깥쪽에 할당돼야 한다.
  - `val` 은 키워드이지만 `const` 는 변경자이다. 따라서 `const`, `val` 은 같이 쓰여야 한다.





## 2 사용자 정의 getter, setter 생성

- 코틀린은 기본적으로 `public` 으로 선언된다.

```kotlin
class Task(val name: String) {
  var priority = 3
  	set(value) {
      field = value.coreceIn(1..5)
    }
  
  val isLowPriority
  	get() = priority < 3
}

var myTask = Task().apply { priority = 4 }
```

- 쉽게 사용자 정의 getter, setter 만들 수 있다.





## 3 data class 정의하기

- equals, hashCode, toString, copy(얕은 복사)
- component1, component2, ... (속성값을 리턴)





## 4 지원 속성 기법

- 클래스 속성(property)을 클라이언트에게 노출하려면
  - 같은 타입의 속성을 하나 더 정의하고 getter, setter 를 통해 속성에 접근한다.
  - 이를 지원 속성이라 한다. (backing property)

```kotlin
class Customer(val name: String) {
  private var _message: List<String>? = null
  
  val messages: List<String>
  	get() {
      if (_messages == null) {
        _messages = loadMessages()
      }
      return _messages!!
    }
  
  private fun loadMessages(): MutableList<String> = 
  	mutableListOf(
    	"inital contact",
      "convinced them to use Kotlin",
      "sold training class. Sweet."
    ).also { println("loaded messages") }
}
```

- 지연 로딩 (lazy loading) 가능

```kotlin
class Customer(val name: String) {
  val message: List<String> by lazy { loadMessages() }
  
  ...
}
```





## 5 연산자 중복(operator overloading)

```kotlin
data class Point(val x: Int, val y: Int)

operator fun Point.unaryMinus() = Point(-x, -y)

fun main() {
  val point = Point(10, 20)
  println(-point) // Point(x=-10, y=-20)
}
```





## 6 나중 초기화를 위해 lateinit 사용

- 생성자 초기화시 속성에 할당값 정보가 충분하지 않을 때 nullable 로 선언된 클래스를 어떻게 생성할 것인가
- lateinit 은 var 에만, 
- lazy 는 val 에만 적용할 수 있다.



## 7 equals 재정의를 위해 ===, as?, ?: 사용

- 논리적으로 동등한 인스턴스인지 equals 구현시
- === (레퍼런스 동등 연산자)
- as? (안전 타입 변환 함수)
- ?: (엘비스 연산자)
- 를 다같이 활용한다.



- 코틀린에서 == 연산자는 자동으로 equals 함수를 호출한다.

```kotlin
override fun equals(other: Any?): Boolean {
  if (this === other) return true
  val otherVersion = (other as? KotlinVersion) ?: return false
  return this.version == otherVersion.version
}
```



## 8 싱글톤 생성하기

1. 클래스의 모든 생성자를 private 로 정의한다.
2. 필요 시 클래스를 인스턴스화하고, 인스턴스의 레퍼런스를 리턴하는 정적 팩토리 메서드를 제공한다.

코틀린에서는 `object` 키워드를 사용하기만 하면 된다.

```kotlin
object MySingleton {
  val myProperty = 3
  
  fun myFunction() = "Hello"
}
```

- 하지만 생성자를 가질 수 없다는 단점이 있다.
- 아래와 같이 static으로 호출가능하다.

```kotlin
MySingleton.myProperty
MySingleton.myFunction()
```





## 9 Nothing, 결코 존재할 수 없는 값

```kotlin
package kotlin

public class Nothing private constructor()
```

- Nothing은 인스턴스화 불가능





---





# 12 스프링 프레임워크

## 1 확장을 위해 스프링 관리 빈 클래스 오픈하기

- 스프링은 개발자가 작성한 클래스를 확장하는 프록시를 생성해야 한다.
- 코틀린 클래스는 기본적으로 닫혀있다. (final)
- 이를 해결하려면 all-open 플러그인을 사용한다.
  - 명시적으로 `open` 키워드를 추가하지 않아도 된다.
  - kotlin-spring 플러그인이 더 적합할 수도 있다.
  - 아래 스프링 어노테이션 클래스를 열도록 설정되어 있다.
    - `@Component`, `@Async`, `@Transactional`, `@Cacheable`, `@SpringBootTest`



## 2 data 클래스로 persistence 구현하기

- JPA 에서 기본 생성자가 필수이지만, data 클래스에는 기본 생성자가 없다.
  - `no-arg` 플러그인 추가 : 코틀린 엔티티에 기본 생성자를 자동으로 추가한다. 
  - `plugin-jpa` 는 아래 어노테이션이 붙은 객체에 기본생성자를 추가한다.
    - `@Entity`, `@Embeddable`, `@MapperSuperClass`
- val 속성과 함께 data 클래스를 생성하면 불변 객체가 생성되는데, JPA는 불변 객체로 작동하지 않는다.
  - 속성에 var 을 사용하는 단순 클래스 사용을 추천한다.
  - data class 사용 X



## 3 의존성 주입하기

1. 생성자가 하나뿐일 때는 의존성을 속성으로 선언하면 자동으로 오토와이어링한다.
2. `@Autowired` 를 생성자 인자에 명시적으로 사용한다.
3. 다수의 의존성을 주입할 때는 `@Autowired` 를 생성자 함수 앞에 위치시켜 간소화한다.
4. 필드 주입할 때는 `lateinit var` 구조를 사용한다.
   - 언제든지 값을 변경할 수 있으므로, 생성자 주입을 더 선호한다.
   - 속성이 필수가 아니라면 nullable 타입으로 선언할수도 있다.

```kotlin
// 1
@RestController
class GreetingController(val service: GreetingService) { ... }

// 2
@RestController
class GreetingController(@Autowired val service: GreetingService) { ... }

//3 
@RestController
class GreetingController @Autowired constructor(val service: GreetingService) { ... }

// 4
@RestController
class GreetingController {
  @Autowired
  lateinit var service: GreetingService
  ... 
}
```



---

