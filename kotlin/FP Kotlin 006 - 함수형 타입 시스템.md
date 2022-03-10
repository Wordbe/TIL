# FP Kotlin 006 - 함수형 타입 시스템



- 함수형 프로그래밍에 초점을 맞춘 포괄적 관점의 타입 시스템

# 1 타입 시스템

- 코틀린이나 스칼라의 타입 시스템은 객체 지향 프로그래밍의 개념까지 포함하고 있다.



## 타입 시스템의 종류와 특징

- 훌륭한 타입 시스템은 런타임에 발생할 수 있는 오류를 컴파일 타임에 발생시킨다.
- 상대적으로 관대한 타입(weak type) 시스템은 자유도를 높여주지만, 런타임 환경에서 예상하지 못하는 오류를 만날 가능성이 높다.
- 견고한 타입(strong type) 시스템은 많은 오류를 컴파일 시점에 잡아줄 수 있지만, 언어가 복잡해지고 컴파일이 어렵기 때문에 진입 장벽이 높을 수 있다.
- 함수형 언어에서는 객체뿐만 아니라 **표현식(expression)도 타입을 가진다.** 함수도 타입을 가진다.



# 2 대수적 데이터 타입

- 대수적 타입 : 다른 타입들을 모아 형성되는 합성 타입
  - 곱 타입
  - 합 타입
- 대수적 데이터 타입의 핵심은 기존 타입을 결합하여 새로운 타입을 정의하는 것이다.



## 곱 타입

- 하나의 자료구조에 여러 가지 타입을 한 번에 정의할 수 있는 것
- 튜플, 레코드
- 두 개 이상의 타입을 AND 로 결합한 형태

```kotlin
class Circle(val name: String, val x: Float, val y: Float, val radius: Float)
```





## 합 타입 사용한 OR 결합

- 합 타입은 두 개 이상의 타입을 OR 로 결합한다.
- 코틀린은 `sealed class` 를 사용해서 합 타입을 만든다.

```kotlin
sealed class Shape
data class Circle(var name: String, val x: Float, val y: Float, val radius: Float): Shape()
data class Square(var name: String, val x: Float, val y: Float, val length: Float): Shape()
data class Line(var name: String, val x1: Float, val y1: Float, val x2: Float, val y2: Float): Shape()
```

- enum 또한 여러 가지 타입이 OR로 결합되는 합 타입의 일종이다.
- 하지만 한 가지 종류의 생성자만 가질 수 있는 제한적인 합 타입이다.
- 합 타입에서는 부분의 합이 전체가 되기 때문에 `when` 문에서 `else` 를 작성할 필요가 없다.
- 이러한 특징으로, 함수형 프로그래밍에서는 패턴 매칭이 쉽고, 부수효과(else 구문)를 처리하지 않아도 된다는 장점이 있다.
- 합 타입은 복잡한 상속 구조를 피하면서도 확장이 용이한 타입을 정의할 수 있다.



앞서 만들었던 `FunList` 는 합 타입, 코틀린의 `List` 는 곱 타입이다.



합 타입의 장점

- 타입에 포함되는 모든 타입에 대한 정의가 명확해서 컴파일러가 타입을 예측하기 쉽다.
- 더 쉽게 타입을 결합하고 확장할 수 있다.
- 생성자 패턴 매칭을 활용해서 간결한 코드를 작성할 수 있다.
- 철저한 타입체크로 더 안전한 코드를 작성할 수 있다.



대수적 타입을 사용하면 재귀적 타입 구조를 만들 수 있다.



# 3 타입의 구성요소

- 타입은 표현식(expression)이 어떤 범주에 포함되는지 알려주는 라벨이다.
- 함수형 프로그래밍에서는 함수의 타입을 이해하거나 선언하는 것이 중요하다.

## 타입 변수

```kotlin
fun <T> head(list: List<T>): T = list.first()
```



- 코틀린에서 제네릭으로 선언된 T 를 타입 변수(type variable)라 한다.
- 타입 변수로 함수를 쉽게 일반화할 수 있다.
- 타입 변수를 가진 함수를 다형 함수(polymorphic function)라 한다.
- 다형 함수는 아직 구체적 타입이 결정되지 않은 타입 변수 T 를 통해 다양한 타입의 함수가 될 수 있다.
- 타입 T 의 구체 타입은 호출될 때 결정된다.



## 값 생성자

- 타입에서 값 생성자 (value constructor) 는 타입의 값을 반환하는 것이다.



## 타입 생성자와 타입 매개변수

- 타입 생성자는 새로운 타입을 생성하기 위해서 매개변수화된 타입을 받을 수 있다.

```kotlin
sealed class Maybe<T>
object Nothing: Maybe<kotlin.Nothing>()
data class Just<T>(val value: T): Maybe<T>()
```

```kotlin
// 타입 생성자
val maybe1: Maybe<Int> = Just<Int>(5)

// 값이 할당되면 값의 타입으로 타입매개변수가 정해진다.
val maybe2 = Just(5)
```



- 일반적으로 타입을 구성하는 값 생성자에 포함된 타입들이, 타입을 동작시키는데 중요하지 않은 경우 타입 매개변수를 사용한다.





# 4 행위를 가진 타입 정의하기

- **객체지향 프로그래밍에서 행위를 가진 타입을 정의하는 방법**
  - 인터페이스
  - 추상 클래스
  - 트레이트 (trait)
  - 믹스인 (mixin)



- 인터페이스는 클래스의 기능 명세이다.
  - 클래스의 행위를 메서드의 서명 (signature) 으로 정의
  - 구현부는 작성하지 않는다.
- 트레이트는 인터페이스와 유사하지만, 구현부를 포함한 메서드를 정의할 수 있다.
- 코틀린의 interface 는 trait 이다.
- 추상 클래스는 상속 관계에서의 추상적인 객체를 나타내기 위해 사용되는 것이다.
  - 인터페이스와 트레이트와 사용 목적이 다르다.
  - 모든 종류의 프로퍼티와 생성자를 가질 수 있고, 다중 상속은 불가능하다.
- 믹스인은 클래스들 간 어떤 프로퍼티나 메서드를 결합하는 것이다.
  - 메서드 재사용성이 높고 유연하다.
  - 다중 상속에서 발생하는 모호성(diamond problem)을 해결할 수 있다.

```kotlin
...

class FullStack : Frontend, Backend {
  override val language: String
  	get() = super<Frontend>.language + super<Backend>.language
}
```

- 다중 상속에서 `language` 프로퍼티만 오버라이드해서 Frontend 와 Backend 의 language 를 믹스인했다.





## 타입 클래스와 타입 클래스의 인스턴스 선언하기

- 하스켈에서는 타입의 행위를 선언하는 방법을 타입 클래스라 한다.
- **타입 클래스**는 코틀린의 인터페이스와 유사하다.
  - 행위에 대한 선언을 할 수 있다.
  - 필요시 행위의 구현부도 포함할 수 있다.



# 5 재귀적 자료구조

- `sealed class` 를 사용해서 만든 대수적 데이터 타입을 활용하면 재귀적 자료구조를 만들 수 있다.
- 대수적 데이터 타입에서 구성하는 값 생성자의 필드에 자신을 포함하는 구조를 재귀적인 자료구조라고 한다.

```kotlin
sealed class FunList<out T>
object Nil : FunList<Nothing>()
data class Cons<out T>(val head: T, val tail: FunList<T>) : FunList<T>()
```









