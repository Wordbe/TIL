# FP Kotlin 008 - 애플리케이티브 펑터



# 1 Applicative Functor

- 펑터의 확장
- 펑터의 한계 극복
  - 함수를 가진 펑터는 또 다른 펑터의 값을 적용해야 할 때, 컨텍스트 안에서 처리하는 것이 불가능하다.
- 애플리케이티브 펑터는 첫 번째 상자에 담겨있는 함수와 두 번째 상자안에 담겨있는 값을 꺼내 매핑하고, 다시 상자 안에 넣어서 반환한다.

```kotlin
interface Applicative<out A> : Functor<A>{
    fun <V> pure(value: V): Applicative<V>
    
    infix fun <B> apply(ff: Functor<(A) -> B>): Applicative<B>
}
```

- infix 키워드는 함수의 두 매개변수 P1, P2 를 P1 apply P2 와 같이 호출할 수 있도록 해준다.



- 애플리케이티브 스타일 프로그래밍은 컨텍스트를 유지한 상태에서 함수에 의한 연속적인 데이터 변환을 체이닝 하는 방식이다.



# 2 메이비 애플리케이티브 펑터 만들기

## 확장 함수를 사용한 Maybe Applicative Functor 만들기

- 함수형 제네릭 타입에는 공변을 사용할 수 없다.
- 따라서 상속을 사용해서 체이닝을 만들기는 어렵다.
- 확장함수를 사용해서 시도해보자.





# 3 트리 애플리케이티브 펑터 만들기

## 일반 트리 펑터

```kotlin
sealed class Tree<out A> : Functor<A> {
    abstract override fun <B> fmap(f: (A) -> B): Functor<B>

    companion object
}

data class Node<out A>(val value: A, val forest: List<Node<A>> = emptyList()) : Tree<A>() {
    override fun toString(): String = "Node($value, $forest)"

    override fun <B> fmap(f: (A) -> B): Node<B> = Node(f(value), forest.map{ it.fmap(f) })
}
```



## 애플리케이티브 펑터로 확장





# 4 이더 애플리케이티브 펑터 만들기



# 5 애플리케이티브 펑터의 법칙

Applicative Functor (af) 의 인스턴스가 지켜야 하는 법칙

- Identity

  - `pure(identity) apply af = af`
  - 항등 법칙

  ```kotlin
  fun identity() = { x: Int -> x }
  ```

  ​

- Composition

  - `pure(compose) apply af1 apply af2 apply af3 = af1 apply af2 apply af3`
  - 합성 법칙

  ```kotlin
  fun <P1, P2, P3> compose() = { f: (P2) -> P3, g: (P1) -> P2, v: P1 -> f(g(v))}
  ```

  ​

- Homomorphism

  - `pure(function) apply pure(x) = pure(function(x))`
  - 준동형 사상

  ​

- Interchange

  - `af apply pure(x) = pure(of(x)) apply af`
  - 교환 법칙
  - of 는 x 를 다른 함수의 매개변수로 제공하는 함수

  ```kotlin
  fun <T, R> of(value: T) = { f: (T) -> R -> f(value) }
  ```

  ​

위 4 가지 법칙으로 아래와 같은 정리가 도출 된다.

```kotlin
pure(function) apply af = af.fmap(function)
```











