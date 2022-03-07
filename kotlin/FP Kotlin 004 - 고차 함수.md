# FP Kotlin 004 - 고차 함수



- 함수형 프로그래밍에서는 함수를 객체처럼 다룬다.

# 1 고차 함수란

- 일급 함수
  - 함수를 인자로 받거나 반환값으로 반환 가능
- 고차 함수는 아래 중 1개 이상 만족
  - 함수를  매개변수로 받는 함수
  - 함수를 반환하는 함수



명령형 언어에서 상태를 변경하거나 반복문을 사용하듯이 함수형 언어에서 문제를 해결하기 위해 반드시 고차 함수를 사용해야 한다.

- 고차 함수 사용하면
  - 코드의 재사용성을 높이고
  - 기능을 확장하기 쉽고
  - 코드를 간결하게 작성할 수 있다.



코드 재사용성 향상 예시

```kotlin
fun main(args: Array<String>) {
  val sum: (Int, Int) -> Int = { x, y -> x + y }
  val minus: (Int, Int) -> Int = { x, y -> x - y }
  val product: (Int, Int) -> Int = { x, y -> x * y }
  
  println(higherOrder(sum, 1, 5))
  println(higherOrder(minus, 1, 5))
  println(higherOrder(product, 1, 5))
}

fun higherOrder(func: (Int, Int) -> Int, x: Int, y: Int): Int = func(x, y)
```





# 2 부분 함수

- 부분 함수란 모든 가능한 입력 중 일부 입력에 대한 결과만 정의한 함수이다.
- 모든 경우의 입력에 대한 결과를 정의했을 때는 부분함수가 아니다. 
- 예외 처리는 결과를 정의한 것이 아니다.

코틀린에는 스칼라처럼 부분 함수 클래스가 없어서 따로 생성해준다.

```kotlin
class PartialFunction<in P, out R> (
  private val condition: (P) -> Boolean,
  private val f: (P) -> R
) : (P) -> R {
  
  override fun invoke(p: P): R = when {
    condition(p) -> f(p)
    else -> throw IllegalArgumentException("$p isn't supported.")
  }
  
  fun isDefinedAt(p: P): Boolean = condition(p)
}
```



## 부분 함수의 필요성

함수가 예외를 던지거나 오류값을 반환하는 것에 비해 장점이 있다.

- 호출하는 쪽에서 호출하기 전에 함수가 정상적으로 동작하는지 미리 확인할 수 있다.
- 호출자가 함수가 던지는 예외나 오류값에 대해 몰라도 된다.
- 부분 함수의 조합으로 부분 함수 자체를 재사용할 수도 있고, 확장할 수도 있다.



함수를 만들 때는 가급적 모든 입력에 대한 결과를 정의하는 것이 좋다. 그러면 부분 함수를 만들 필요가 없다.



# 3 부분 적용 함수

- 부분 함수와 이름은 비슷하지만 관계는 없다.
- 매개변수의 일부만 전달받았을 때, 제공받는 매개변수만 가지고 부분 적용 함수를 생성한다.
- 부분 적용 함수는코드를 재사용하기 위해서 쓸 수 도 있지만, 커링 함수(curried functions)를 만들기 위해서도 필요하다.




# 4 커링 함수

- 커링(currying)은 여러 개의 매개변수를 받는 함수를 분리하여, 단일 매개변수로 받는 부분 적용 함수의 체인으로 만드는 방법이다.



```kotlin
fun multiThree(a: Int, b: Int, c: Int): Int = a * b * c

fun main(args: Array<String>) {
  println(multiThree(1, 2, 3))

  val partial1 = multiThree(1)
  val partial2 = partial1(2)
  val partial3 = partial2(3)
  println(partial3)
  
  println(multiThree(1)(2)(3))
}

// currying
fun multiThree(a: Int) = { b: Int -> { c: Int -> a * b * c }}
```



커링의 장점

- 부분 적용 함수를 다양하게 재사용 가능
- 마지막 매개변수가 입력될 때까지 함수의 실행을 늦출 수 있다.



코틀린용 커링 함수 추상화하기

```kotlin
fun <P1, P2, P3, R> ((P1, P2, P3) -> R).curried(): (P1) -> (P2) -> (P3) -> R = 
  { p1: P1 -> { p2: P2 -> { p3: P3 -> this(p1, p2, p3) } } }

fun <P1, P2, P3, R> ((P1) -> (P2) -> (P3) -> R).uncurried(): (P1, P2, P3) -> R =
  { p1: P1, p2: P2, p3: P3 -> this(p1)(p2)(p3) }
```



# 5 합성 함수

- 함수를 매개변수로 받고, 함수를 반환할 수 있는 고차 함수를 이용해 두 개의 함수를 결합하는 것



> 포인트 프리 스타일 (point free style) 프로그래밍
>
> - 함수 합성을 사용해서 매개변수나 타입 선언 없이 함수를 만드는 방식
> - 가독성 높이고 간결하게 한다.

```kotlin
val absolute = { i: List<Int> -> i.map { it -> abs(it) }}
val negatvie = { i: List<Int> -> i.map { it -> -it }}
val minimum = { i: List<Int> -> i.min() }

minimum(negative(absolute(listOf(3, -1, 5, -2, -4, 8, 14))))



// 합성 함수를 위한 확장 함수 정의
infix fun <F, G, R> ((F) -> R).compose(g: (G) -> F): (G) -> R {
  return { gInput: G -> this(g(gInput)) }
}

val composed = minimum composed negative compose absolute
println(composed(listOf(3, -1, 5, -2, -4, 8, 14)))
```








