# Scala 04 - Class

클래스는 `class`를 이용하여 생성할 수 있습니다. 클래스를 선언할 때는 멤버변수를 선언할 수 있습니다. 멤버 변수는 생략이 가능합니다.

```scala
// 클래스 선언 
class Person(name:String, age:Int)
// 클래스 생성 
val p = new Person("David", 30)

// 멤버 변수 생략 가능 
class A
```

<br>

### 클래스 멤버변수

멤버 변수를 선언할 때 가변 변수와 불변 변수를 명시적으로 선언할 수 있습니다.

**가변 변수**는 컴파일러가 클래스 내부에 자동으로 getter, setter 메소드를 생성합니다. 가변 변수로 선언된 값은 읽고, 쓰는 것이 가능합니다. **불변 변수**는 컴파일러가 getter만 생성합니다. 불변 변수로 선언된 값은 읽는 것만 가능합니다.

가변 변수, 불변 변수로 선언되지 않은 변수는 getter, setter 가 생성되지 않기 때문에 클래스 내부에서만 사용할 수 있습니다.

```scala
// 기본형 
class Animal(name: String) {
  println(s"${name} 생성")
}

// 가변
class Dog(var name: String) {
  println(s"${name} 생성")
}

// 불변 
class Cat(val name: String) {
  println(s"${name} 생성")
}

var ani = new Animal("동물")
var dog = new Dog("개")
var cat = new Cat("고양이")

// 기본 멤버 변수는 접근 불가 
scala> println(ani.name)
<console>:27: error: value name is not a member of Animal
       println(ani.name)
                   ^

scala> println(dog.name)
개

scala> println(cat.name)
고양이

scala> dog.name = "바둑이"
dog.name: String = 바둑이

// 불변 변수는 재할당 불가 
scala> cat.name = "나비"
<console>:26: error: reassignment to val
       cat.name = "나비"
                ^
```

<br>

### 멤버변수의 디폴트 값

클래스 멤버변수는 변수의 종류에 상관없이 디폴트 값을 입력할 수 있습니다. 멤버변수의 값을 입력하지 않으면 디폴트 값을 이용합니다.

```scala
// 기본 멤버 변수, 변수, 상수 모두 기본값 설정 가능 
class Person1(name:String, age:Int)
class Person2(var name:String, var age:Int = 10)
class Person3(val name:String="Ted", val age:Int)

var p1 = new Person1("David", 12)
var p2 = new Person2("Tomphson")
var p3 = new Person3("David", 12)

// name 에 기본값을 입력할 수 없어서 오류 발생 
var p3 = new Person3(12)  
scala> var p3 = new Person3(12)
<console>:13: error: not enough arguments for constructor Person3: (name: String, age: Int)Person3.
Unspecified value parameter age.
       var p3 = new Person3(12)
                ^
```

<br>

### 클래스의 메소드

클래스의 메소드는 함수의 선언과 동일하게 `def`로 선언합니다.

```scala
class Person(name:String, age:Int) {
    def greeting() = println(s"${name}님은 ${age}살 입니다.")
}
```

## 메소드 오버라이드(override)

`override` 선언자를 이용하여 메소드를 오버라이드 할 수 있습니다. `new`를 이용하여 클래스 생성시에 오버라이드하여 메소드를 재정의 할 수 있습니다.

```
class Person(name:String, age:Int, val job:String) {
    def greeting() = println(s"${name}님은 ${age}살 입니다.")
    def work() = println(s"직업은 ${job}입니다. ")
}

// work 함수 오버라이딩 
class Writer(name:String, age:Int) extends Person(name, age, "") {
    override def work() = println(s"직업은 작가입니다.")
}

scala> w.greeting
David님은 15살 입니다.

scala> w.work
직업은 작가입니다.

// 클래스 생성시 메소드 오버라이드. public 변수를 사용하는 메소드만 오버라이드 가능 
val p = new Person("David", 15, "학생") {
  override def work() = println(s"job is ${job}. ")
}

scala> p.greeting
David님은 15살 입니다.

scala> p.work
job is 학생. 
```

# 생성자

스칼라는 따로 생성자가 존재하지 않습니다. 클래스 바디부분에 있는 코드가 바로 실행되기 때문에 이 부분에 처리 로직을 넣어주면 됩니다.

```
class Person(name:String, age:Int) {
    def greeting() = println(s"${name}님은 ${age}살 입니다.")
    println("초기화 완료")
}

scala> val p = new Person("David", 15)
초기화 완료
p: Person = Person@522c2a19
```

# 상속과 추상 클래스

상속은 `extends`를 이용합니다. 일반 클래스와 추상클래스 모두 상속할 수 있습니다.

추상클래스는 `abstract`를 이용합니다. 추상클래스는 매개변수를 가질 수 있습니다. 메소드를 선언만 하고 구현은 자식 클래스에 맡길 수 도 있고 기본 메소드를 구현할 수도 있습니다.

```
// 추상클래스 선언 
abstract class Person(name: String, age: Int) {
  def work
  def status(str: String)
  def greeting() = println(s"${name}님은 ${age}살 입니다.")
}

// Person 추상 클래스를 상속 
class Player(name: String, age: Int) extends Person(name, age) {
  def work = { println("일합니다.") }
  def status(str: String) = println(s"$str 상태 입니다.")
}

scala> var p = new Player("칼", 30)
scala> p.work
일합니다.

scala> p.status("깨있는")
깨있는 상태 입니다.
```



# 봉인 클래스(Sealed class)

스칼라는 봉인 클래스를 지원합니다. 봉인 클래스는 하위 타입이 모두 한파일에 있어야 합니다. 관련 클래스를 한파일에 모두 입력하게 강제할 수 있기 때문에 관리의 효율성이 높아집니다. 봉인 클래스는 `sealed`를 이용하고 트레잇도 봉인할 수 있습니다.

다음과 같이 `file1.scala`에 다음과 같이 봉인 추상클래스 `Furniture`를 생성하고, `file2.scala`에서 `Desk` 클래스를 선언하면 "illegal inheritance from sealed class Furniture" 오류가 발생합니다.

```
// file1.scala
sealed abstract class Furniture
case class Couch() extends Furniture
case class Chair() extends Furniture

// file2.scala
case class Desk() extends Furniture
  -> illegal inheritance from sealed class Furniture
```