 # FP Kotlin 001 - 함수형 프로그래밍이란



# 1. 함수형 프로그래밍 특징

## 정의

- 데이터 처리의 참조 투명성 보장하고, 상태와 가변 데이터 생성을 피하는 프로그래밍 패러다임

## 특징

- 불변성 (immutable)
- 참조 투명성 (referential transparency)
- 일급 함수 (first-class-function)
- 게으른 평가 (lazy evaluation)

## 장점

- 부수효과가 없다. 동시성 프로그래밍에 적합하다.
- 간결한 코드를 만든다. 모듈성이 높아 유지보수가 쉽다.
- 예측성을 높여 컴파일러가 효율적으로 실행되는 코드를 만들어준다.

## 언어

- 하스켈
- Scala, Kotlin, Clojure

# 2. 순수한 함수란

## 동일 입력 동일 출력

- 결과에 대한 추론이 가능하고 테스트도 쉽다.
- 컴파일 타임에 코드를 최적화하거나 오류 코드를 예측하고 경고할 수 있다.
- 공유 자원이 변경되어도 걱정없이 동시성 프로그래밍이 수월하다.
- 참조 투명성을 만족한다.

## 부수효과가 없다.

- 부수효과란 함수가 실행되는 과정에서 외부의 상태(데이터)를 사용, 수정하는 것
  - 전역 변수, 정적 변수 수정
  - 파일이나 네트워크를 출력하는 작업
  - 예외 발생



# 3. 부수효과 없는 프로그램 작성하기

## 부수효과를 만드는 예

- 공유 변수 수정
- 객체의 상태 변경
  - 객체를 참조하여 상태를 변경하는 대신, 변경된 값으로 된 객체를 새로 생성한다.
  - 하지만, 값의 수정에 영속성이 있어야 하는 경우 데이터베이스에 넣어야 하는데, 이는 또다시 부수효과를 일으킬 수 있다.



# 4. 참조 투명성으로 프로그램을 더 안전하게 만들기

- 순수함수는 참조투명성을 만족시킨다.
- 참조투명성 : 프로그램의 변경 없이 어떤 표현식을 값으로 대체할 수 있다는 뜻
  - 1 + 1 은 2로 대체할 수 있다.
  - 순수함수 `f` 의 표현식 `f(x)` 가 `y` 를 반환한다면 `f(x)` 는 `y` 로 대체될 수 있다.
- 참조투명성은 컴파일러가 평가 결과를 추론할 수 있게 한다.
  - 런타임 전에 컴파일러가 코드를 최적화
  - 코드가 평가되는 시점을 늦출 수 있다.
  - 코드에 예외가 사라져서 간결해지고, 버그가 발생할 가능성은 낮아진다.
  - 스레드 안정성에 대한 고민도 덜 수 있다.

## 참조 투명하지 않은 함수

- 외부 변수 참조

## 참조 투명한 함수

- 부수효과가 없는 함수
- 부수효과가 있다면, 부수효과와 순수한 영역을 분리한다.
- 순수한 영역은 참조 투명한 함수다.



# 5. 일급함수란?

## 일급 객체

- 객체를 함수의 매개변수로 넘길 수 있다.
- 객체를 함수의 반환값으로 돌려줄 수 있다.
- 객체를 변수나 자료구조에 담을 수 있다.

예를 들어 코틀린 최상위 객체 `Any` 는 일급 객체다.

## 일급 함수

- 함수를 함수의 매개변수로 넘길 수 있다.
- 함수를 함수의 반환값으로 돌려줄 수 있다.
- 함수를 변수나 자료구조에 담을 수 있다.

일급함수를 통해 더 높은 추상화가 가능하고, 코드의 재사용성을 높일 수 있다.

람다식, 고차함수, 커링, 모나드 등도 일급함수여야 한다.



# 6. 일급 함수를 이용한 추상화와 재사용성 높이기

## 간단한 계산기 예제

```kotlin
class SimpleCalculator {
  fun calculate(operator: Char, num1: Int, num2: Int): Int = when (operator) {
    '+' -> num1 + num2
    '-' -> num1 - num2
    else -> throw IllegalArgumentException()
  }
}

fun main(args: Array<String>) {
  val calculator = SimpleCalculator()
  println(calculator.calculate('+', 3, 1))
  println(calculator.calculate('-', 3, 1))
}
```

## 객체지향적 계산기 예제

```kotlin
interface Calculator {
  fun calculate(num1: Int, num2: Int): Int
}

class Plus : Calculator {
  override fun calculate(num1: Int, num2: Int): Int {
    return num1 + num2
  }
}

class Minus : Calculator {
  override fun calculate(num1: Int, num2: Int): Int {
    return num1 - num2
  }
}

class OopCalculator(private val calculator: Calculator) {
  fun calculate(num1: Int, num2: Int): Int {
    if (num1 > num2 && 0 != num2) {
      return calculator.calculate(num1, num2)
    } else {
      throw IllegalArgumentException()
    }
  }
}

fun main(args: Array<String>) {
  val plusCalculator = OopCalculator(Plus())
  println(plusCalculator.calculate(3, 1))
  
  val minusCalculator = OopCalculator(Minus())
  println(minusCalculator.calculate(3, 1))
}
```

장점

- 기능 추가, 변경 시 관련 없는 모듈을 수정할 필요도 없고 내부에 대해 알필요도 없다. (캡슐화)
- 인터페이스를 이용해 쉽게 기능을 확장할 수 있다. (OCP)
- 클래스나 함수들이 한 가지 일만 하기 때문에 코드 재사용성이 높다. (SRP)
- 의존성 주입 덕분에 테스트하기가 쉽다. (DIP)



## 함수형 프로그래밍 방식으로 개선한 계산기 예제

```kotlin
class FpCalculator {
  fun calculate(calculator: (Int, Int) -> Int, num1: Int, num2: Int): Int {
    if (num1 > num2 && 0 != num2) {
      return calculator(num1, num2)
    } else {
      throw IllegalArgumentException()
    }
  }
}

fun main(args: Array<String>) {
  val fpCalculator = FpCalculator()
  println(fpCalculator.calculate({ n1, n2 -> n1 + n2 }, 3, 1))
  println(fpCalculator.calculate({ n1, n2 -> n1 - n2 }, 3, 1))
}
```

- 일급 함수를 사용해서 덧셈과 뺄셈같은 계산기에서 가장 중요한 로직을 추상화
- 비즈니스 로직을 구현하기 위한 인터페이스와 구현 클래스도 모두 없어짐
- 코드가 간결하고, 유지보수하기도 쉬워짐



# 7. 게으른 평가로 무한 자료구조 만들기

- 함수형 언어는 기본적으로 필요한 시점에 평가 (lazy evaluation)되고, 개발자가 평가 시점을 지정할 수도 있다.
- 값이 실제 필요한 시점까지 실행하지 않으므로, 시간이 오래 걸리는 작업을 효율적으로 동작시킨다.



```kotlin
val lazyValue: String by lazy {
  println("시간이 오래 걸리는 작업")
  "hello"
}

fun main(args: Array<String>) {
  println(lazyValue)
  println(lazyValue)
}

>
시간이 오래 걸리는 작업
hello
hello
```



- 선언하는 시점이 아닌, 실제 호출되는 시점에 실행한다.
- 여러번 호출되더라도 최초에 한 번만 평가를 실행한다.



## 무한대 값을 자료구조에 담기

```kotlin
val infiniteValue = generateSequence(0) { it + 5 }
infiniteValue.take(5).forEach { print("$it ") } // 0 5 10 15 20
```



- 게으른 평가 이용
- 코틀린에서는 게으르게 평가되는 자료구조인 `Sequence` 제공
- `generateSequence` 함수가 호출된 시점에서는 값이 평가되지 않으므로 이러한 표현 가능







