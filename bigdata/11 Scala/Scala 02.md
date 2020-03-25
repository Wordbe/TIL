# Scala 02

<br>

# 0 Hello World

Hello World를 출력해 봅니다.

스칼라는 자바와 동일하게 프로그램을 실행하기 위해 `main()` 함수를 구현해야 합니다. 

구현 방법 2가지

1) 싱글톤 객체(object)가 `main` 함수를 구현하는 방법

2) 싱글톤 객체가 App 트레잇을 상속하는 방법 : App 트레잇이 내부적으로 `main()`함수를 구현하고 있어 1)번과 동작 방식 차이는 크지 않습니다.



### 1) Singleton object main 함수 구현

```scala
// main 함수를 생성App 을 상속하여 실행하는 방법 
object S01_HelloWorldObject {
  def main(args: Array[String]): Unit = {
    println("Hello World main")
  }
}
```



### 2) App trait 상속

```scala
object S01_HelloWorld extends App {
  println("Hello World")
}
```

<br><br>

---

# 1 객체(Object)

스칼라는 **기본자료형, 함수, 클래스등 모든 것을 객체로 취급**합니다. **객체는 Any를 최상위 클래스로 값(AnyVal) 타입과 참조(AnyRef) 타입을 상속 하여 구현**합니다. Int, Byte, String 같은 기본 자료형은 AnyVal을 상속하고, 클래스는 AnyRef를 상속합니다.

![scala datatype](https://docs.scala-lang.org/resources/images/tour/unified-types-diagram.svg)

<br>

### 객체의 비교

객체의 비교는 ==, != 연산자를 이용합니다. 자바에서는 문자열(String)의 비교는 `equals`를 이용했지만 스칼라는 모든것을 ==, !=으로 비교합니다.

<br>

#### 비교 연산

```scala
scala> 1 == 1
res15: Boolean = true

scala> 'a' == 'a'
res16: Boolean = true

scala> 1 == 'a'
res17: Boolean = false
```

<br>

#### 문자열 비교

```scala
val s1 = "Hello"
val s2 = "Hello"
val s3 = "HELLO"

scala> s1 == s2
res13: Boolean = true

scala> s2 == s3
res14: Boolean = false
```

<br>

#### 객체의 비교

```scala
case class Person( p1:String, p2:String )
val p1 = Person("a", "b")
val p2 = Person("a", "b")
val p3 = Person("b", "c")

scala> p1 == p2
res18: Boolean = true

scala> p2 == p3
res19: Boolean = false
```

<br><br><br>

---

# 2 자료형(Data type)

스칼라의 자료형은 자바와 동일합니다. **스칼라는 자바의 원시 자료형(Primitive Type)이 존재하지 않고, 모든 것이 클래스입니다.** **스칼라의 자료형은 자바의 자료형으로 컴파일 시점에 자동으로 변환됩니다.**

스칼라의 자료형은 **숫자형, 논리형, 문자형**이 존재합니다. 자료형 선언시에 명시적으로 변수의 타입을 선언할 수도 있고, 선언하지 않을 수도 있습니다. 선언하지 않으면 컴파일러가 자동으로 정수형은 Int, 실수형은 Double로 선언합니다.

<br>

### 자료형

### 기본 자료형

| 자료형  | 사이즈 | 설명                                     |
| :------ | :----- | :--------------------------------------- |
| Byte    | 8bit   | -128~127                                 |
| Short   | 16bit  | -32768~32767                             |
| Int     | 32bit  | -2147483648~2147483647                   |
| Long    | 64bit  | -9223372036854775808~9223372036854775807 |
| Float   | 32bit  | -3.4E38~3.4E38                           |
| Double  | 64bit  | -1.7E308~1.7E308                         |
| Char    | 16bit  | 문자형 표현                              |
| Boolean | 1bit   | 논리형 참, 거짓 표현                     |

<br>

### 참조 자료형

| 자료형  | 설명                      |
| :------ | :------------------------ |
| String  | 문자열 표현               |
| Unit    | **리턴값이 없음을 표현**  |
| Null    | Null 값 표현              |
| Nothing | **모든 객체의 서브 타입** |
| Any     | **모든 객체의 기본 타입** |
| AnyVal  | 기본 값 타입의 부모 타입  |
| AnyRef  | 참조 타입의 부모 타입     |

<br>

### 1) 숫자형

- 정수형 : Byte, Short, Int, Long
- 실수형 : Float, Double

<br>

### 캐스팅

**정수형과 실수형 사이의 업캐스팅은 자동**으로 이루어지고, **다운캐스팅은 명시적으로 처리**해야 합니다.

아래와 같이 Byte(8bit) 형을 Short(16bit) 형으로의 변환(업캐스팅. 8bit > 16bit)은 자동으로 지원됩니다. 하지만 Long(64bit)형을 Int(32bit)형으로 변환(다운캐스팅. 64bit -> 32bit)하는 것은 자동으로 처리 되지 않고 오류가 발생합니다.

**다운캐스팅의 경우 데이터의 손실 우려가 있기 때문에 자동으로 진행되지 않습니다.** 따라서 데이터 변환 메소드를 이용해서 명시적으로 진행해야 합니다.

```scala
// 더 큰 크기의 값으로 변환하는 업캐스팅은 자동으로 지원 
scala> s = b
// 더 작은 크기의 값으로 변환하는 다운 캐스팅은 오류 발생 
scala> i = l
<console>:13: error: type mismatch;
 found   : Long
 required: Int
       i = l
           ^
// 메소드를 이용하여 명시적으로 변환 
scala> i = l.toInt
i: Int = 10
```

<br>

### 데이터 형 선언

암시적인 선언은 컴파일러가 자동으로 타입을 선택합니다. 데이터 타입에 맞춰 선언하시면 됩니다.

```scala
// 암시적인 선언 
var x = 10
var y = "abc"

// 명시적인 선언 
var b: Byte = 10
var s: Short = 10
var i: Int = 10
var l: Long = 10

// 값에 약어를 추가하여 명시적 선언 
var f = 10.0f
var d = 20.0d

// 암시적인 선언, 컴파일러가 자동으로 타입을 선택 
scala> var ii = 10
ii: Int = 10

scala> var ff = 1.0
ff: Double = 1.0
```

<br>

### 2) 논리형

논리형 `Boolean`은 조건문에서 분기를 처리할 때 주로 사용합니다. `true`, `false` 값이 존재합니다.

```scala
var t = true

if(t)
	println("참")
else
	println("거짓")
```

<br>

### 3) 문자형

문자형 `Char`은 하나의 문자를 표현 할 수 있습니다.

```scala
scala> var c1:Char = 'a'
c1: Char = a

scala> var c2 = 'b'
c2: Char = b
```

<br>

<br>

<br>

---

# 3 문자열

스칼라에서 문자열의 표현은 쌍따옴표(")를 이용하여 처리합니다.

```scala
scala> val str1 = "aaa"
str1: String = aaa
```

멀티라인 문자열은 세개의 쌍따옴표(""")를 이용하여 생성합니다.

```scala
scala> val str2 = """a
     | b
     | c"""
str2: String =
a
b
c
```



### 접두어를 이용한 문자열 처리

스칼라 2.10.0 부터 문자열에 접두어(id)를 붙여서 컴파일시점에 문자열 변환을 처리하게 할 수 있습니다.

기본적으로 제공하는 접두어는 `s`, `f`, `raw` 세가지가 있습니다. 사용자가 접두어를 생성할 수도 있습니다.

<br>

### 접두어 s

**접두어`s`는 ${변수명}을 이용하여 문자열안의 변수를 값으로 치환**하여 줍니다. 계산식, 함수도 사용할 수 있습니다.

```scala
// 문자열 치환 
val name = "David"

// ${name}이 David로 변환 
scala> println(s"Hello! ${name}")
Hello! David

// 계산 값 치환 안됨 
scala> println("${ 1 + 1 }")
${ 1 + 1 }

// s 접두어가 있으면 계산식 처리 
scala> println(s"${ 1 + 1 }")
2
```

<br>

### 접두어 f

**접두어`f`는 문자열 포맷팅을 처리**합니다. 자바의 `printf()` 와 같은 방식으로 처리되고, 타입이 맞지 않으면 오류가 발생합니다.

```scala
val height:Double = 182.3 
val name = "James"

// f접두어를 이용한 값 변환 테스트
scala> println(f"$name%s is $height%2.2f meters tall")
James is 182.30 meters tall
```

<br>

### 접두어 raw

접두어`raw`은 특수 문자를 처리하지 않고 원본 문자로 인식합니다. 특수문자를 그대로 입력해야 할 때 사용할 수 있습니다.

```scala
// \n으로 개행 처리 
scala> s"가\n나"
res1: String =
가
나

// \n을 문자 그대로 인식 
scala> raw"가\n나"
res3: String = 가\n나
```

<br>

---

### 예제

문자열 처리를 이용한 예제입니다.

```scala
object S02_Strings extends App {
  var str1 = "Hello World!"
  println(str1)

  var str2 = """Hello
    World"""
  println(str2)

  // s 접두어 
  // 문자열 변환 처리 
  var str3 = s"println $str1"
  println(str3)
  println(s"2 * 3 = ${2 * 3}")
  def minus(x: Int, y: Int) = x - y
  println(s"${Math.pow(2, 3)}")
  println(s"${minus(2, 3)}")

  // f 접두어 
  // 포맷팅 처리 
  val height:Double = 182.3 
  val name = "James"
  println(f"$name%s is $height%2.2f meters tall")

  // raw 접두어 
  val rawStr = raw"가\n나"
  println(rawStr)
}
```

<br>

---

# 4 변수(Variable)

스칼라의 변수는 두가지 유형이 있습니다. 가변 변수와 불변 변수입니다. 가변 변수(variable)는 `var`, 불변 변수(value)는 `val`로 선언합니다.

가변 변수는 재할당이 가능하지만 불변 변수는 재할당이 불가능합니다. 불변 변수는 한번 값이 정해지면 변경되지 않기(immutable) 때문에 데이터 처리에 있어 단순하게 처리할 수 있는 장점이 있습니다.

```scala
var variable = 10
val value = 20

// var 값의 재할당은 처리 가능 
scala> variable = 30
variable: Int = 30

/// value 값의 재할당은 오류 발생 
scala> value = 40
<console>:12: error: reassignment to val
       value = 40
             ^
```

**스칼라는 동시처리를 중요하게 생각하기 때문에 변경 불가능한 데이터를 중요하게 생각합니다.** 데이터의 변경이 가능하면 동시처리시에 데이터에 대한 고민이 많아지게 됩니다. 따라서 불변 변수로 설정하는 것을 선호합니다.



---

**Reference**

https://wikidocs.net/26200

https://wikidocs.net/24675

https://wikidocs.net/26138

https://wikidocs.net/26139