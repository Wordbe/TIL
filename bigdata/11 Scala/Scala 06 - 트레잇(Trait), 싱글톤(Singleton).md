# Scala 06 - 트레잇(Trait), 싱글톤(Singleton)

트레잇(Trait)은 자바의 인터페이스와 유사합니다. 메소드를 정의만 해놓을 수 있고, 기본 구현을 할 수도 있습니다. 추상 클래스(abstract class)와 달리 생성자 파라미터는 가질 수 없습니다.

트레잇에서는 가변 변수, 불변 변수 둘 다 선언이 가능합니다. 트레잇을 구현하는 클래스에서 가변 변수는 수정이 가능하지만, 불변 변수는 수정할 수 없습니다.

트레잇의 기본 메소드는 상속되고, `override` 키워드를 이용해 메소드를 재정의 할 수 있습니다.

트레잇은 `extends`로 상속하고 여러 개의 트레잇을 `with` 키워드로 동시에 구현할 수 있습니다.

상속하여 구현할 수 있으므로, 추상클래스와 비슷하지만 멤버변수는 가질 수 없습니다. 추상클래스는 하나만 상속할 수 있지만, 트레잇은 여러 개를 상속할 수 있습니다. 생성자 멤버변수가 필요하면 추상클래스를 이용하는 것이 좋고, 멤버 변수가 필요 없다면 트레잇을 이용하는 것이 좋습니다.



```scala
// 트레잇 정의
trait Machine {
    val serialNumber: Int = 1
    def work(message: String)
}

trait KrMachine {
    var conturyCode: String = "kr"
    def print() = println("한글 출력")
}

// 클래스에서 트레잇 상속
class Computer(location: String) extends Machine with KrMachine {
    this.conturyCode = "us"
    def work(message: String) = println(message)
}

class Car(location: String) extends Machine with KrMachine {
    def work(message: String) = println(message)
    override def print() = println("운전 중 입니다.")
}

var machine = new Computer("노트북")
var car = new Car("포르쉐")

scala> machine.work("computing...")
computing...

scala> machine.print()
한글 출력

scala> println(machine.conturyCode)
us

scala> car.work("driving...")
driving...

scala> car.print() 
운전중입니다.

scala> println(car.conturyCode)
kr

```

<br>

---

# 8. 싱글톤 객체

스칼라 `object` 선언자로 싱글톤 객체를 생성합니다. 싱글톤 객체의 메서드는 전역적으로 접근하고 참조할 수 있습니다.

싱글톤 객체는 직접 접근해서 사용할 수 도 있고, import 를 선언하여 이용할 수도 있습니다.

```scala
Object Bread {
    val name: String = "기본빵"
    def cooking() = println("빵만드는 중...")
}

// import 이용
scala> import Bread.cooking
scala> cooking
빵만드는 중...

// 직접 접근 
scala> Bread.cooking
빵만드는 중...
```

<br>

## 컴패니언(Companion)

싱글톤 객체와 클래스가 같은 이름을 사용하면 컴패니언이라고 합니다.

**컴패니언은 정적 메소드의 보관 장소를 제공**합니다. **자바의 `static` 을 이용한 정적 데이터는 스칼라에서는 컴패니언을 이용하여 처리하는 것을 추천합니다.** 팩토리 메소드 같은 정적 메소드는 컴패니언을 이용하여 작성하고, 일반적인 데이터는 클래스를 이용하여 정적 데이터와 일반 데이터를 분리하여 관리할 수 있습니다. 

```scala
class Dog

object Dog {
    def bark = println("bark")
}

scala> Dog.bark
bark
```

<br>

### 컴패니언을 이용한 팩토리 예제

```scala
class Email(val username: String, val domainName: String)

object Email {
  def fromString(emailString: String): Option[Email] = {
    emailString.split('@') match {
      case Array(a, b) => Some(new Email(a, b))
      case _ => None
    }
  }
}

val scalaCenterEmail = Email.fromString("scala.center@epfl.ch")
scalaCenterEmail match {
  case Some(email) => println(
    s"""Registered an email
       |Username: ${email.username}
       |Domain name: ${email.domainName}
     """)
  case None => println("Error: could not parse email")
}

scala>
Registered an email
Username: scala.center
Domain name: epfl.ch
```

<br>

---

**Reference**

https://wikidocs.net/26144