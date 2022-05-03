# FP Kotlin 010 - 모나드





# 1 모나드 타입 클래스

- 펑터는 컨텍스트 내 값을 변경할 때 사용된다.
- 펑터는 `Just({ x -> x * 2 })` 와 `Just(5)` 같이 함수와 값이 컨텍스트 안에 있을 때는 사용할 수 없다.
- 애플리케이티브 펑터는 `apply` 함수를 사용해서 이를 해결한다.
  - 값을 컨텍스트 안에 넣는 `pure` 함수도 있다.
- `Just({ x -> x * 2})` 에 `Just(5)` 를 적용해서 `Just(10)` 을 얻을 수 있다.
- 하지만, `Just(5)` 를 `{ x -> Just(x * 2)}` 함수의 입력으로 넣으려면?
- 즉, 값이 포함된 컨텍스트를 일반적 값을 받아서 컨텍스트를 반환하는 함수의 입력으로 넣으려면 어떻게 해야할까?





모나드 타입 클래스

```kotlin
interface Monad<out A> : Functor<A> {
    fun <V> pure(value: V): Monad<V>

    override fun <B> fmap(f: (A) -> B): Monad<B> = flatMap { a -> pure(f(a)) }

    infix fun <B> flatMap(f: (A) -> Monad<B>): Monad<B>

    infix fun <B> leadTo(m: Monad<B>): Monad<B> = flatMap { m }
}
```

- 모나드는 펑터이자 애플리케이티브 펑터이며, 이에 대한 확장이다.
- 모나드는 `flatMap` 함수를 추가로 제공한다.
  - `flatMap` 으로 중첩을 펼칠 수 있다.
  - **`flatMap` 함수가 컨텍스트에 있는 값을 마치 일반 값처럼 다룰 수 있게 해준다.**



# 2 메이비 모나드

- 옵셔널, 옵션 모나드라고도 불린다.

## 활용

- 객체가 널인 경우 실패라고 본다면, 메이비 컨텍스트를 사용할 수 있다.
- 코틀린의 `?` 로 안전한 널 처리를 할 수도 있고, 가독성도 훨씬 좋다.
  - 하지만, 실패를 의미하는 값이 null 이 아니라 false, 음수값, 빈 문자열 등일 경우 메이비 모나드를 직접 만들어서 사용하면 좋다.



# 3 모나드 법칙

- 모나드 법칙은 카테고리 이론 기반으로 수학적으로 증명되었다.
- m 은 모나드
- f, g 는 값을 받아 모나드를 반환하는 함수
- x 는 값



모나드 법칙

- 왼쪽 항등 법칙
  - `pure(x) flatMap f = f(x)`
- 오른쪽 항등 법칙
  - `m flatMap pure = m`
- 결합 법칙
  - `(m flatMap f) flatMap g = m flatMap { x -> f(x) flatMap g }`





# 4 IO 모나드

- 순수 함수형 언어에서 입출력(Input/Output) 작업은 골칫거리다.
- 외부와 연결이 불가피해서 상태를 변경해야 하고, 데이터의 순수성을 깨는 컨텍스트이다.
- 코틀린, 스칼라 같은 하이브리드 언어는 입출력 작업은 명령형 프로그래밍 방식을 따른다.
- 반면 하스켈은 프로그램의 순수한 영역과 상태를 변경해야 하는 순수하지 못한 영역(side effect 가 존재하는 영역) 을 완전히 분리하는 방법으로 입출력을 구현한다.
  - 분리된 두 영역은 게으른 평가, 견고성, 모듈성 같은 순수 함수형 프로그래밍이 제공하는 장점을 유지하며 외부 영역과 소통할 수 있다.
  - IO 모나드로 분리해서 관리하고, 모나드 내부에서 일어나는 작업은 외부에 영향을 줄 수 없다.



```kotlin
fun getFirstLine(filePath: String): String = File(filePath).readLines().first()
```

- 함수 내부에서 파일 입출력 작업을 하므로 순수한 함수가 아니다.
- 순수하지 않다는 것은 참조 투명하지 않다는 것, 동일 입력에 항상 동일 출력을 보장하지 않는다는 것이다.
- 예측할 수 없고, 예외도 발생할 수 있다.
- 순수하지 않은 함수는 이것을 사용한 다른 함수를 오염(taint)시킨다.



- 입출력 작업을 모나드 안에서만 가능하게 한다.
- 순수하지 못한 여역에서 꺼내온 데이터는 순수한 영역에서 사용할 수 있는 불변 데이터가 된다.

```kotlin
fun getFirstWord(lines: List<String>): String = lines.first().split(" ").first()

fun getLines(filePath: String): List<String> = File(filePath).readLines()

fun main() {
  val lines = getLines(filePath) // 불변하도록 val 로 선언
  println(getFirstWord(lines))
}
```





# 5 리스트 모나드

```kotlin
sealed class FunList<out T> {
    companion object
}

object Nil : FunList<kotlin.Nothing>() {
    override fun toString(): String = "[]"
}

data class Cons<out T>(val head: T, val tail: FunList<T>) : FunList<T>() {
    override fun toString(): String = "[${foldLeft("") { acc, x -> "$acc, $x" }.drop(2)}]"
}

tailrec fun <T, R> FunList<T>.foldLeft(acc: R, f: (R, T) -> R): R = when (this) {
    Nil -> acc
    is Cons -> tail.foldLeft(f(acc, head), f)
}

fun <T> funListOf(vararg elements: T): FunList<T> = elements.toFunList()

private fun <T> Array<out T>.toFunList(): FunList<T> = when {
    this.isEmpty() -> Nil
    else -> Cons(this[0], this.copyOfRange(1, this.size).toFunList())
}

// Monoid
fun <T> FunList<T>.mempty() = Nil

infix fun <T> FunList<T>.mappend(other: FunList<T>): FunList<T> = when (this) {
    Nil -> other
    is Cons -> Cons(head, tail.mappend(other))
}

// Functor
infix fun <T, R> FunList<T>.fmap(f: (T) -> R): FunList<R> = when (this) {
    Nil -> Nil
    is Cons -> Cons(f(head), tail.fmap(f))
}

// Applicative Functor
fun <T> FunList.Companion.pure(value: T): FunList<T> = Cons(value, Nil)

infix fun <T, R> FunList<(T) -> R>.apply(f: FunList<T>): FunList<R> = when (this) {
    Nil -> Nil
    is Cons -> f.fmap(head) mappend tail.apply(f)
}

infix fun <T, R> FunList<T>._apply(f: FunList<(T) -> R>): FunList<R> = when (this) {
    Nil -> Nil
    is Cons -> f.fmap { it(head) } mappend tail._apply(f)
}

// flatMap 2 ways
//infix fun <T, R> FunList<T>.flatMap(f: (T) -> FunList<R>): FunList<R> = when (this) {
//    Nil -> Nil
//    is Cons -> f(head) mappend tail.flatMap(f)
//}

infix fun <T, R> FunList<T>.flatMap(f: (T) -> FunList<R>): FunList<R> = fmap(f).flatten()

fun <T, R> FunList<T>.foldRight(acc: R, f: (T, R) -> R): R = when (this) {
    Nil -> acc
    is Cons -> f(head, tail.foldRight(acc, f))
}

fun <T> FunList<FunList<T>>.flatten(): FunList<T> = foldRight(mempty()) { t, r: FunList<T> -> t mappend r }

// contains
tailrec fun <T> FunList<T>.contains(element: T): Boolean = when (this) {
    Nil -> false
    is Cons -> if (head == element) true else tail.contains(element)
}

// distinct
fun <T> FunList<T>.distinct(): FunList<T> =
    foldLeft(Nil as FunList<T>) { acc, x -> if (acc.contains(x)) acc else Cons(x, acc) }

// reverse
tailrec fun <T> FunList<T>.reverse(acc: FunList<T> = Nil): FunList<T> = when (this) {
    Nil -> acc
    is Cons -> tail.reverse(Cons(head, acc))
}

fun main() {
    val list1 = funListOf(1, 2, 3)

    println(Nil flatMap { x -> funListOf(x) })
    println(list1 flatMap { x -> funListOf(x, -x) })

    val result = funListOf(1, 2)
        .flatMap { x -> funListOf(x to 'a', x to 'c') }
        .fmap { x -> x.first to x.second.uppercaseChar() }
        ._apply(funListOf({ x -> x.second }, { x -> x.second + x.first }))
        .distinct()
        .reverse()
    println(result)
}
```





