# FP Kotlin 007 - 펑터 Functor

- 함수형 프로그래밍은 카테고리 이론이라는 수학적 원리를 토대로 만들어졌다.
- 함수형 언어에선느 수학적으로 증명된 개념들의 구현체를 만들어 제공한다.



# 1 펑터란

- Functor 는 **매핑할 수 있는 것(can be mapped over)이라는 행위를 선언한 타입 클래스**이다.
- 매핑할 수 있는 것은 map 과 동일

```kotlin
fun <T, R> Iterable<T>.map(f: (T) -> R): List<R>
```

- 펑터는 추상화된 타입 클래스이므로 컨테이너형 타입이 가진 구체적 타입까지 포함해서 정의하지 않는다.
  - `List<T>` 와 같이 일반화된 타입을 가진다.
  - 따라서 한 개의 매개변수를 받는 타입 생성자 (type constructor) 이다.



## 펑터 선언하기

- 펑터는 map 연산을 추상화한다.

```kotlin
interface Functor<out A> {
  fun <B> fmap(f: (A) -> B): Functor<B>
}
```

- 코틀린의 타입 클래스는 인터페이스로 정의한다.





# 2 메이비 펑터 만들기

- `Maybe` 는 값이 있을 수도 있고 없을 수도 있는 컨테이너형 타입이다.
- 함수 반환값을 메이비로 선언하여 함수의 실패 가능성을 포함하기 위한 목적으로 주로 사용된다.
- 코틀린은 `?` 로 널 처리가 가능하여 메이비와 같은 타입을 지원하지 않는다.
- 자바에서는 `Optional`

```kotlin
sealed class Maybe<out A> : Functor<A> {
  abstract override fun toString(): String
  abstract override fun <B> fmap(f: (A) -> B): Maybe<B>
}
```



**구현체**

Just 는 값을 반드시 포함한 상태다.

```kotlin
data class Just<out A>(val value: A) : Maybe<A>() {
  override fun toString(): String = "Just($value)"
  override fun <B> fmap(f: (A) -> B): Maybe<B> = Just(f(value))
}
```



Nothing 은 값이 없는 상태다.

```kotlin
object Nothing : Maybe<kotlin.Nothing>() {
  override fun toString(): String = "Nothing"
  override fun <B> fmap(f: (kotlin.Nothing) -> B): Maybe<B> = Nothing
}
```





```kotlin
fun main() {
  println(Just(10).fmap { it + 10 }) // Just(20)
  println(Nothing.fmap { a: Int -> a + 10 })  // Nothing
}
```



- 펑터는 타입 생성자에서 컨테이너형 타입을 요구한다.
- 어떤 값을 담을 수 있는 타입은 항상 펑터로 만드는 것을 생각해 볼 수 있다. 펑터의 `fmap` 은 유용하게 사용된다.



# 3 트리 펑터 만들기



**Tree Functor**

- Maybe 와 비슷하게 만듦
  - 값이 없으면 `EmptyTree`
  - 값이 있으면 `Node`



# 4 이더 펑터 만들기

- Maybe 와 Tree 는 타입 생성자의 매개변수가 한 개 뿐이다.
- 만약 타입 매개변수가 2개 이상인 타입을 Functor 의 인스턴스로 만들려면 어떻게 해야 할까?
- 이더로 확인해보기
- **이더는 left 또는 right 타입만 허용하는 대수적 타입**
- 이더는 타입 매개변수가 2개다.



- Functor 의 타입 생성자는 매개변수가 1개 이므로, 다른 2개 이상의 매개변수를 가지는 타입을 Functor 의 인스턴스로 만들기 위해서는 `fmap` 함수에 의해서 변경되는 매개변수를 제외한 나머지 값들을 고정해야 한다.





# 5 단항 함수 펑터 만들기

> 일급 함수는 아래 3 조건을 만족한다.
>
> - 함수를 매개변수로 넘길 수 있다.
> - 함수를 반환값으로 돌려 줄 수 있다.
> - 함수를 변수나 자료구조에 담을 수 있다.

```kotlin
val f2 = { a: Int -> a * 2 }
val g2 = { b: Int -> Just(b) }
val f2g2 = UnaryFunction(f2).fmap(g2)
println(f2g2.invoke(5))
```

- UnaryFunction 은 숫자를 받아서 `Maybe` 를 반환했다.
- 이런 함수를 일반적으로 승급(lifting) 함수라 한다.



# 6 펑터의 법칙

- 펑터의 법칙 (functor law) : 펑터가 되기 위한 두가지 법칙
  1. 항등 함수 (identity function) 에 펑터를 통해 매핑하면, 반환되는 펑터는 원래 펑터와 같다.
  2. 두 함수를 합성한 함수의 매핑은 각 함수를 매핑한 겨롸를 합성한 것과 같다.



## 펑터 제 1법칙

## 펑터 제 2법칙

```kotlin
fmap(f compose g) == fmap(f) compose fmap(g)
```



> 펑터 법칙을 만족하도록 펑터를 만드러야 하는 이유
>
> - 펑터의 법칙을 만족하면 어떻게 동작할 것인가에 대한 동일한 가정을 할 수 있다.
> - 예측 가능성은 함수가 안정적으로 동작하게 할 수 있다.
> - 추상적 코드로 확장할 때도 도움이 된다.

매개변수가 1개인 함수를 매개변수로 받는 함수에서 

매개변수가 2개인 함수를 넣으면 컴파일 오류가 난다. 이 때 커링을 사용하면 된다.

```kotlin
fun main() {
  val product: (Int, Int) -> Int = { x: Int, y: Int -> x * y }
  val curriedProduct: (Int) -> (Int) -> Int = product.curried()
  val maybeProductTen: Maybe<(Int) -> Int> = Just(10).fmap(curriedProduct)
  
  println(maybeProductTen.fmap { it(5) }) // Just(50)
}
```















