# Scala 03 - Function

<br>

# 5 함수

함수는 `def`로 선언합니다. **함수를 선언할 때 리턴문과 리턴 타입은 생략이 가능**하고, **매개변수의 파라미터 타입은 생략할 수 없습니다.** 리턴값이 없는 함수를 선언할 때는 `Unit`을 이용합니다. **함수의 매개변수는 불변 변수이기 때문에 재할당 할 수 없습니다.**

리턴 타입을 생략하면 컴파일러가 반환값을 이용하여 자동으로 추론합니다. 리턴문이 생략되고, 리턴 타입이 `Unit`이 아니면 함수의 마지막 값을 리턴합니다.

```scala
// 함수 선언 
def add(x: Int, y: Int): Int = {
  return x + y
}

// x는 val 이기 때문에 변경 불가 
def add(x: Int): Int = {
  x = 10 
}

// 리턴 타입 생략 가능 
def add(x: Int, y: Double) = {
  x + y
}

// 리턴 타입이 Unit 타입도 생략 가능 
def add(x: Int, y: Int) = {
  println(x + y)
}

// 리턴 데이터가 없는 경우 Unit을 선언  
def add(x: Int, y: Int): Unit = {
  println(x + y)
}
```

<br>

### 함수의 축약형

함수가 1라인으로 처리 가능한 경우에는 중괄호({}) 없이 선언할 수도 있습니다.

```scala
// 중괄호 없이 선언 
def printUpper(message:String):Unit = println(message.toUpperCase())

// 반환타입도 생략 
def printLower(message:String) = println(message.toLowerCase())
```

<br>

### 파라미터의 기본값

함수의 파라미터는 기본값을 설정할 수도 있습니다. 파라미터를 선언하는 시점에 기본값을 지정하고, 파라미터의 개수대로 전달하지 않으면 기본값을 이용합니다.

```scala
// y에 기본값 선언 
def add(x: Int, y: Int = 10): Unit = {
  println(x + y)
}

// 기본값 이용
scala> add(1)
11

// 전달값 이용 
scala> add(10, 3)
13
```

<br>

### 가변 길이 파라미터

같은 타입의 개수가 다른 가변 길이의 파라미터를 입력 받는 경우 *를 이용하면 `Seq`형으로 변환되어 입력됩니다.

```scala
// 여러개의 Int 형을 입력받아서 합계 계산 
def sum(num:Int*) = num.reduce(_ + _)

scala> sum(1, 2, 3)
res22: Int = 6

scala> sum(1)
res23: Int = 1
```

<br>

### 변수에 함수 결과 할당

함수를 `def`로 선언하지 않고 `var`, `val`로 선언할 수도 있습니다. 이렇게 하면 함수를 실행하여 그 반환값이 변수에 입력됩니다. 따라서 함수의 결과를 여러곳에서 이용할 때만 사용하는 것이 좋습니다.

```scala
val random1 = Math.random()
var random2 = Math.random()
def random3 = Math.random()

// random1, random2는 호출할 때마다 같은 값 반환
// 선언 시점에 값이 확정됨 
scala> random1
res19: Double = 0.1896318278308372
scala> random1
res20: Double = 0.1896318278308372

scala> random2
res21: Double = 0.817421180386978
scala> random2
res22: Double = 0.817421180386978

// random3은 실행시점에 값이 확정됨 
scala> random3
res24: Double = 0.4491518929189594
scala> random3
res25: Double = 0.7644113222566244
```

<br>

### 함수의 중첩

함수 안에 함수를 중첩하여 선언하고 사용할 수 있습니다.

```scala
  def run() {
    def middle() {
      println("middle")
    }

    println("start")
    middle()
    println("end")
  }

scala> run
start
middle
end
```

<br>

<br>

<br>

# 5-1람다 함수(Lambda Function)

스칼라는 익명의 람다 함수를 선언할 수 있습니다.

람다함수는 **언더바 `_`를 이용하여 묵시적인 파라미터를 지정**할 수 있습니다. 묵시적인 파라미터를 이용할 때는 언더바의 위치에 따라 파라미터가 선택됩니다.

다음의 `exec` 함수는 두개의 Int 파라미터를 받고, Int를 반환하는 고차함수 `f` 와 Int 형 파라미터 x, y를 입력받아서 `f` 함수를 호출 하면서 파라미터로 x, y를 전달하는 함수 입니다.

```scala
// exec는 3개의 파라미터(함수 f, x, y)를 받음
def exec(f: (Int, Int) => Int, x: Int, y: Int) = f(x, y)

// 람다 함수를 전달하여 처리. x+y 작업을 하는 함수 전달 
scala> exec((x: Int, y: Int) => x + y, 2, 3)
res12: Int = 5

// 선언시에 타입을 입력해서 추가적인 설정 없이 처리 가능 
scala> exec((x, y) => x + y, 7, 3)
res13: Int = 10

// 함수에 따라 다른 처리 
scala> exec((x, y) => x - y, 7, 3)
res14: Int = 4

// 언더바를 이용하여 묵시적인 처리도 가능 
scala> exec(_ + _, 3, 1)
res15: Int = 4
```

<br>

<br>

---

# 5-2 커링(currying)

스칼라에서 커링은 여러 개의 인수 목록을 여러 개의 괄호로 정의할 수 있습니다. 함수를 정해진 인수의 수보다 적은 인수로 호출하면 그 리턴 값은 나머지 인수를 받는 함수입니다.

```scala
// x를 n으로 나누어 나머지가 0인지 확인하는 함수 
def modN(n:Int, x:Int) = ((x % n) == 0)     // 1번
def modN(n: Int)(x: Int) = ((x % n) == 0)   // 2번
```

위의 예제에서 함수의 파라미터를 표현하는 방법은 다르지만 같은 함수 입니다. 1번의 n, x 인수를 2번에서는 여러개의 괄호로 받은 것입니다. **2번 함수는 커링을 이용해서 n 값을 미리 바인딩 하는 다른 함수로 선언하거나, 다른 함수의 파라미터로 전달할 수 있습니다.**

```scala
def modN(n: Int)(x: Int) = ((x % n) == 0)

// modN함수를 커링을 이용하여 n 값이 정해진 변수로 호출 
def modOne:Int => Boolean = modN(1)
def modTwo = modN(2) _

println(modOne(4))  // true
println(modTwo(4))  // true
println(modTwo(5))  // false
```

커링을 이용한 스칼라의 샘플예제를 살펴보면 다음과 같습니다.

```scala
object CurryTest extends App {
  // 재귀를 이용하여 xs를 처음부터 끝까지 순환하는 filter
  // 리스트를 head, tail로 구분하여 시작부터 끝까지 순환 
  def filter(xs: List[Int], p: Int => Boolean): List[Int] =
    if (xs.isEmpty) xs
    else if (p(xs.head)) xs.head :: filter(xs.tail, p)  // :: 는 리스트를 연결하는 함수 
    else filter(xs.tail, p)

  def modN(n: Int)(x: Int) = ((x % n) == 0)
  val nums = List(1, 2, 3, 4, 5, 6, 7, 8)

  println(filter(nums, modN(2)))    // List(2, 4, 6, 8)
  println(filter(nums, modN(3)))    // List(3, 6)
}
```

<br>

<br>

# 5-3 클로저(Closure)

함수형 언어에서 클로저는 **내부에 참조되는 모든 인수에 대한 묵시적 바인딩을 지닌 함수**를 말합니다. 이 함수는 **자신이 참조하는 것들의 문맥을 포함**합니다.

클로저는 지연실행이 좋은 예입니다. **클로저 블록에 코드를 바인딩함으로써 그 블록의 실행을 나중으로 연기할 수 있습니다.** 예를 들어 클로저 블록을 정의할 때는 필요한 값이나 함수가 스코프에 없지만, 나중에 실행시에는 있을 수가 있습니다. 실행 문맥을 클로저 내에 포장하면 적절한 때까지 기다렸다가 실행할 수 있습니다.

```scala
// divide는 x/n인 함수를 반환 
def divide(n:Int) = (x:Int) => {
  x/n
}

// n에 5를 바인딩, 호출될 때마다 사용
def divideFive = divide(5)
println(divideFive(10)) // 2

// 함수 외부의 값 factor를 바인딩 
var factor = 10
def multiplier = (x:Int) => x * factor
println(multiplier(4))  // 40

factor = 100
println(multiplier(4))  // 400
```

<br>

<br>

<br>

# 5-4타입

스칼라에서 타입을 이용해서 클래스와 함수를 제네릭(Generic)하게 생성할 수 있습니다.

<br>

### 클래스 적용

다음의 예제는 클래스에 타입을 적용하여 제네릭하게 데이터를 처리하는 예제입니다. 스칼라는 기본적으로 불변(immutable) 데이터를 이용하기 때문에 **변경가능한 스택처리를 위해 import 문을 추가**하였습니다.

```scala
import scala.collection.mutable

trait TestStack[T] {
  def pop():T
  def push(value:T)
}

class StackSample[T] extends TestStack[T] {

  val stack = new scala.collection.mutable.Stack[T]

  override def pop(): T = {
    stack.pop()
  }

  override def push(value:T) = {
    stack.push(value)
  }
}

val s = new StackSample[String]

s.push("1")
s.push("2")
s.push("3")

scala> println(s.pop())
3
scala> println(s.pop())
2
scala> println(s.pop())
1
```

<br>

### 메소드 적용

메소드에도 타입을 적용하여 제네릭하게 이용할 수 있습니다.

```scala
def sample[K](key:K) {
  println(key)
}

def sample2 = sample[String] _

scala> sample2("Hello")
Hello
```





---

**Reference**

https://wikidocs.net/26141

https://wikidocs.net/29769

https://wikidocs.net/29770

https://wikidocs.net/31642

https://wikidocs.net/29988