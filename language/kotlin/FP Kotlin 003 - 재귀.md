# FP Kotlin 003 - 재귀



# 1 함수형 프로그래밍에서 재귀가 가지는 의미

- 재귀함수 : 함수의 구현 내부에서 자기 자신을 호출하는 함수



## 명령형 프로그래밍을 사용한 피보나치 수열

```kotlin
fun main(args: Array<String>) {
  println(fiboDynamic(10, IntArray(100)))
}

private fun fiboDynamic(n: Int, fibo: IntArray): Int {
  fibo[0] = 0
  fibo[1] = 1
  
  for (i in 2..n) {
    fibo[i] = fibo[i -1] + fibo[i - 2]
  }
  
  return fibo[n]
}
```

- 배열의 크기를 무한대로 확장하는 것은 불가능하다.



## 재귀를 사용한 피보나치 수열

- **고정 메모리 할당이나 값의 변경이 없다.**
- **메모리를 직접 할당해서 사용하지 않고, 스택에 기록해서 사용한다.**



```kotlin
private fun fiboRecursion(n: Int): Int = when (n) {
  0 -> 0
  1 -> 1
  else -> fiboRecursion(n - 1) + fiboRecursion(n - 2)
}
```

- fiboRecursion(150) 을 실행할 때 문제점은?



## 함수형 프로그래밍에서 재귀

- 재귀는 반복문에 비해 간결하게 표현할 수 있지만 문제가 있다.
  - 동적 계획법 방식보다 성능이 느리다.
  - `Stack Overflow Error` 가 발생할 수 있다.
- 코틀린은 순수한 함수형 언어는 아니지만, 시퀀스를 활용하여 무한 자료구조를 만들 수 있다.



# 2 재귀를 설계하는 방법

- 재귀가 무한루프에 빠지지 않도록 재귀를 빠져나오는 종료조건(edge condition)을 1개 이상 만든다.
- 함수 입력을 분할하여 어떤 부분에서 재귀 호출할지 결정
- 함수의 입력값이 종료조건으로 수렴하도록 재귀 호출의 입력값 결정

> 종료조건 정의할 때는 자료구조가 더이상 쪼개지지 않아 재귀의 과정이 더 이상 의미 없는 값을 사용한다. 보통 이런 값은 항등값이다.
>
> 항등값
>
> - 어떤 연산을 취해도 자기 자신이 되는 값
> - 덧셈에서는 0
> - 곱셈에서는 1
> - 리스트에서는 빈 리스트
> - 트리에서는 자식 없는 노드
> - 빈문자열 (예를 들어 문자열을 뒤집는 연산에서 빈문자열은 뒤집어도 빈문자열이므로 빈문자열은 항등원이다. 이와 같이 재귀에서 문자열을 다룰 때는 빈 문자열이 종료조건으로 자주 사용된다.)

> 모든 재귀함수는 논리적으로 수학적 귀납법으로 증명이 가능하다.





# 3 재귀에 익숙해지기



# 4 메모이제이션으로 성능 개선하기

- 메모이제이션 (memoization) 은, 반복된 연산을 수행할 때 이전에 계산했던 값을 캐싱해서 중복 연산을 제거하는 방법이다.
- 연산 횟수가 줄어 속도가 개선된다. 동적 계획법의 핵심 기술이다.



## 메모이제이션을 사용한 피보나치 수열 예제

- 불필요한 재귀호출을 줄이고, 성능을 개선할 수 있다.

```kotlin
var memo = Array(100, { -1 })

fun fiboMemoization(n: Int): Int = when {
  n == 0 -> 0
  n == 1 -> 1
  memo[n] != -1 -> memo[n]
  else -> {
    memo[n] = fiboMemoization(n - 2) + fiboMemoization(n - 1)
    memo[n]
  }
}
```

- 시간복잡도는 O(2^N) 에서 O(N)로 개선된다.



## 재귀의 문제점을 함수적으로 해결하기

- 순수함수는 부수효과가 없어야한다.
  - 하지만 memo 라는 전역변수를 선언해서 부수효과가 발생한다.
- 순수함수는 불변성을 띤다.
  - 그러나 memo를 생성하고 재귀함수 내에서 값을 수정하므로 불변성을 지키지 못한다.
- 부수효과를 없애기 위한 방법은
  - 이미 계산된 값을 메모리에 저장하지 않고, 재귀 함수의 매개변수로 받아서 캐싱한다.



```kotlin
fun main(args: Array<String>) {
  println(fiboFP(6))
}

fun fiboFP(n: Int): Int = fiboFP(n, 0 , 1)

tailrec fun fiboFP(n: Int, first: Int, second: Int): Int = when (n) {
  0 -> first
  1 -> second
  else -> fiboFP(n -1, second, first + second)
}
```

- `tailrec` 은 꼬리 재귀 함수라는 의미의 어노테이션
- 메모이제이션과는 다른 개념



# 5 꼬리 재귀로 최적화하기

- 꼬리 재귀란 함수가 직간접적으로 자기 자신을 호출하면서도 그 호출이 마지막 연산인 경우이다.
- 마지막 연산 호출을 꼬리 호출(tail call) 이라 한다.
- **꼬리 재귀 최적화** : 꼬리 재귀 조건에 부합하는 코드를 컴파일러가 인지하여 새로운 스택 프레임 자원을 생성하지 않고, 마치 반복문(while, for)을 사용하듯 하나의 스택에서 연산하는 것이다.
- 꼬리 재귀 최적화가 일어나면 메모이제이션과 같은 방법을 사용하지 않아도 성능을 향상시키고, 스택 오버플로를 방지할 수 있다.
- `tailrec` 을 명시하여 컴파일러에게 꼬리 재귀임을 알릴 수 있다.
- 만약 컴파일러가 최적화할 수 없다면 예외를 던진다.



## 꼬리 재귀로 다시 작성하기

- 필요하면 내부 캐싱을 위해 중간 결괏값을 재귀함수의 매개변수를 통해서 전달한다. 이 매개변수를 누산값(accumulator)이라 한다.

1. 누산값의 타입은 최종 반환값의 타입과 같다.
2. 종료조건의 반환값은 누산값이거나 누산값을 포함한 연산 결과이다.
3. 중간 결괏값을 만드는 순서는 보통 '누산값 + 새로운 값' 이다.



# 6 상호재귀를 꼬리재귀로 최적화하기

## 상호 재귀

- 상호 재귀(mutual recursion)는 함수 A가 함수 B를 호출하고, 함수 B가 다시 함수 A를 호출하는 것이다.
- 스택오버플로가 발생하지 않게 하려면 상호 꼬리 재귀로 변경해야 한다.



## 트램펄린

- 상호 꼬리 재귀를 가능하게 하려면 트램펄린(trampoline)을 사용한다.
- 트램펄린은 반복적으로 함수를 실행하는 루프다.
- 이 때 실행되는 함수를 성크(thunk)라 한다. 성크는 다음에 실행될 함수를 매번 새로 생성하여 반환한다.
- 트램펄린에서 성크는 한 번에 하나만 실행된다.
- 프로그램을 충분히 작은 성크로 쪼개고, 트램펄린을 점프하듯 반복 실행하면 스택이 커지는 것을 막을 수 있다.



```kotlin
sealed class Bounce<A>
data class Done<A>(val result: A): Bounce<A>()
data class More<A>(val thunk: () -> Bounce<A>): Bounce<A>()

tailrec fun <A> trampoline(bounce: Bounce<A>): A = when (bounce) {
  is Done -> bounce.result
  is More -> trampoline(bounce.thunk())
}
```

```kotlin
fun main(args: Array<String>) {
  println(trampoline(even(999999))) // false
  println(trampoline(odd(999999))) // true
}

fun odd(n: Int): Bounce<Boolean> = when (n) {
  0 -> Done(false)
  else -> More { even(n - 1) }
}

fun even(n: Int): Bounce<Boolean> = when (n) {
  0 -> Done(true)
  else -> More { odd(n -1 ) }
}
```



> 코틀린은 트램펄린을 위한 재료를 내장하지 않아 직접 구현해서 사용한다. 실제로는 프리 모나드(free monad)를 사용해 트램펄린 자체를 하나의 타입으로 추상화하여 사용하기도 한다.



# 7 실전 응용

- powerset 함수



# 8 마무리

- 재귀는 함수형 프로그래밍에서 매우 자주 사용된다.
- 재귀적으로 생각하고 설계하는 방법을 체득하는 것이 중요하다.