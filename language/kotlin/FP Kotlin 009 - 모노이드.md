# FP Kotlin 009 - 모노이드



# 1 모노이드란

- **모노이드는 연관 바이너리 함수 (associative binary function) 와 항등값 (identity) 을 가진 대수적 타입이다.**
- 연관 바이너리 함수 : 곱셈, 덧셈, 리스트 결합하기 같이 두 개의 매개변수와 반환값의 타입이 동일한 바이너리 함수
  - 결합 법칙 (associative law) 만족
  - (a + b) + c = a + (b + c)



# 2 모노이드 타입 클래스

```kotlin
interface Monoid<T> {
    fun mempty(): T
    
    fun mappend(m1: T, m2: T): T
}
```

- mempty : 항등원 반환
- mappend : 바이너리 함수 반환
- 두 함수는 모노이드가 가진 값의 타입을 반환한다.



## 모노이드 법칙

- 항등값과 바이너리 함수를 가지고 있다.
- 항등 법칙과 결합 법칙을 만족한다.

정리하면

- `mappend(mempty(), x) = x`
- `mappend(x, mempty()) = x`
- `mappend(mappend(x, y), z) = mappend(x, mappend(y, z))`



## mconcat

- 모든 모노이드 입력 리스트를 하나로 줄일 수 있다.





# 3 Maybe 모노이드 만들기

```kotlin
object MaybeMonoid {
    fun <T> monoid(inValue: Monoid<T>) = object : Monoid<Maybe<T>> {
        override fun mempty(): Maybe<T> = functor.Nothing

        override fun mappend(m1: Maybe<T>, m2: Maybe<T>): Maybe<T> = when {
            m1 is functor.Nothing -> m2
            m2 is functor.Nothing -> m1
            m1 is Just && m2 is Just -> Just(inValue.mappend(m1.value, m2.value))
            else -> functor.Nothing
        }
    }
}
```





# 4 Foldable 이진 트리에 foldMap 함수 만들기

## foldMap 함수

- 폴더블 자료구조가 가진 모든 값을 단항 함수로 매핑해서 모노이드로 결합한 결괏값을 반환한다.
- 입력은 단항 함수와 모노이드로 받는다.



