# Scala 04 - Class 2



# 2. 패턴 매칭

스칼라의 패턴 매칭은 자바의 switch 문과 유사하지만, 자바와는 달리 기본 자료형외에 케이스 클래스를 이용한 처리가 가능합니다.

패턴매칭의 기본 문법은 다음과 같습니다. `param`의 값이 value1의 값과 비교되어 일치하는 값의 결과를 반환합니다. **언더바(_)는 어떤 값도 일치하지 않을 때 처리 결과를 출력(default)**합니다.

```scala
param match {
  case value1 => "value1"
  case _ => "default value"
}
```

패턴매칭을 이용하면 if문을 중첩하여 연달아 사용하지 않고 깔끔하게 선택조건을 구분할 수 있습니다.

<br>

### 기본 자료형 매칭

기본 자료형을 이용한 패턴 매칭의 예제를 살펴 보겠습니다.

매칭을 이용하는 방법은 다음과 같습니다. matching 함수는 파라미터 x와 case 문의 값들을 비교하여 일치하는 값을 반환합니다.

```scala
def matching(x:Int): String = x match {
  case 0 => "zero"
  case 1 => "one"
  case 2 => "two"
  case _ => "many"
}

scala> matching(1)
res8: String = one

scala> matching(4)
res9: String = many

scala> matching('a')
res10: String = many
```

<br>

### 케이스 클래스 매칭

케이스 클래스를 이용한 패턴 매칭의 예제를 살펴 보겠습니다. 먼저 **케이스 클래스 멤버 변수의 값을 이용하여 매칭을 처리**하겠습니다.

`Notification` 추상 클래스를 상속한 `Email`, `SMS`, `VoiceRecording` 케이스 클래스를 생성합니다. 이 클래스를 `showNotification` 메소드에서 패턴 매칭을 이용해 클래스마다 다른 결과를 출력할 수 있습니다. 일반 클래스는 패턴 매칭에 사용할 수 없습니다.

```scala
abstract class Notification

case class Email(sender: String, title: String, body: String) extends Notification
case class SMS(caller: String, message: String) extends Notification
case class VoiceRecording(contactName: String, link: String) extends Notification

def showNotification(notification: Notification): String = {
  notification match {
    // body 는 반환값에 사용하지 않기 때문에 _로 처리 가능 
    case Email(email, title, _) =>
      s"You got an email from $email with title: $title"
    case SMS(number, message) =>
      s"You got an SMS from $number! Message: $message"
    case VoiceRecording(name, link) =>
      s"you received a Voice Recording from $name! Click the link to hear it: $link"
  }
}

val email = Email("to@gmail.com", "Help Me", "I have a Question")
val someSms = SMS("12345", "Are you there?")
val someVoiceRecording = VoiceRecording("Tom", "voicerecording.org/id/123")

scala> println(showNotification(email))
You got an email from to@gmail.com with title: Help Me

scala> println(showNotification(someSms))
You got an SMS from 12345! Message: Are you there?

scala> println(showNotification(someVoiceRecording))
you received a Voice Recording from Tom! Click the link to hear it: voicerecording.org/id/123
```

<br>

### 케이스 클래스 매칭 패턴 가드

패턴 가드는 `if <논리 표현>` 문을 이용하여 **패턴 처리를 구체화하는 방법**입니다. 다음은 `showNotification`과 유사하지만 특정 데이터가 존재하면 다른 메시지를 출력하는 예제 입니다.

```scala
def showImportantNotification(notification: Notification, importantPeopleInfo: Seq[String]): String = {
    notification match {
        // importantPeopleInfo에 같은 이메일이 존재 
        case Email(email, _, _) if importantPeopleInfo.contains(email) => "You got an email from special someone!"
        // importantPeopleInfo에 같은 번호가 존재 
        case SMS(number, _) if importantPeopleInfo.contains(number) => "You got an SMS from special someone!"
        case other => showNotification(other) // 일치하지 않으면 showNotification 호출 
    }
}

// 패턴 체크를 위한 중요한 인물 정보 
val importantPeopleInfo = Seq("867-5309", "jenny@gmail.com")

val someSms = SMS("867-5309", "Are you there?")
val someVoiceRecording = VoiceRecording("Tom", "voicerecording.org/id/123")
val importantEmail = Email("jenny@gmail.com", "Drinks tonight?", "I'm free after 5!")
val importantSms = SMS("867-5309", "I'm here! Where are you?")

scala> println(showImportantNotification(someSms, importantPeopleInfo))
You got an SMS from special someone!

scala> println(showImportantNotification(someVoiceRecording, importantPeopleInfo))
you received a Voice Recording from Tom! Click the link to hear it: voicerecording.org/id/123

scala> println(showImportantNotification(importantEmail, importantPeopleInfo))
You got an email from special someone!

scala> println(showImportantNotification(importantSms, importantPeopleInfo))
You got an email from special someone!
```

<br>

### 케이스 클래스 패턴 매칭 예제

다음은 색상을 출력하는 케이스 클래스 패턴 매칭 예제입니다. Color를 상속한 Red, Green, Blue 클래스를 이용하여 색상의 값을 보여줍니다.

```scala
package sdk.scala.sample

object PatternMatchingSample2 extends App {

  class Color(val red:Int, val green:Int, val blue:Int)

  case class Red(r:Int) extends Color(r, 0, 0)
  case class Green(g:Int) extends Color(0, g, 0)
  case class Blue(b:Int) extends Color(0, 0, b)

  def printColor(c:Color) = c match {
    case Red(v) => println("Red: " + v)
    case Green(v) => println("Green: " + v)
    case Blue(v) => println("Blue: " + v)
    case col:Color => {
      printf("Red: %d, Green: %d, Bluee: %d\n", col.red, col.green, col.blue)
    }
    case _ => println("invalid color")
  }

  printColor(Red(10))
  printColor(Green(20))
  printColor(Blue(30))
  printColor(new Color(10, 20, 30))
  printColor(null)
}
```

<br>

### 클래스 타입 매칭

케이스 클래스의 타입을 이용한 패턴 매칭의 예제를 살펴 보겠습니다. 케이스 클래스의 타입을 자동으로 확인하여 함수를 호출합니다.

```scala
abstract class Device
case class Phone(model: String) extends Device {
  def screenOff = "Turning screen off"
}

case class Computer(model: String) extends Device {
  def screenSaverOn = "Turning screen saver on..."
}

// Device를 받아서 클래스의 타입을 자동으로 확인하여 다른 처리 
def goIdle(device: Device) = device match {
  case p: Phone    => p.screenOff
  case c: Computer => c.screenSaverOn
}

  val phone = Phone("Galaxy")
  val computer = Computer("Macbook")

scala> println(goIdle(phone))
Turning screen off

scala> println(goIdle(computer))
Turning screen saver on...
```

<br>

숫자와 문자열 형식의 값을 전달하여 성적을 표현하는 패턴 매칭 예제를 확인해 보겠습니다. **아래와 같은 방식으로 패턴 매칭을 사용하면 if 문을 열거하지 않고도 깔끔하게 문제를 표현할 수 있습니다.**

```scala
object PatternMatchingSample extends App {
  val VALID_GRADES = Set("A", "B", "C", "D", "F")

  def letterGrade(value:Any):String = value match {
    case x if (90 to 100).contains(x) => "A"
    case x if (80 to 90 ).contains(x) => "B"
    case x if (70 to 80 ).contains(x) => "C"
    case x if (60 to 70 ).contains(x) => "D"
    case x if ( 0 to 60 ).contains(x) => "F"
    case x:String if VALID_GRADES(x.toUpperCase()) => x.toUpperCase()
  }

  println(letterGrade(91))
  println(letterGrade(72))
  println(letterGrade(44))
  println(letterGrade("B"))
}
```

<br>

<br>

<br>

# 3.Mix in Composition

믹스인 컴포지션은 **클래스와** **트레잇**을 상속할 때 **서로 다른 부모의 변수, 메소드 를 섞어서 새로운 정의를 만드는 것**입니다.

추상 클래스 A는 message 변수를 가지고 있습니다. 클래스 B는 추상 클래스 A를 상속 하면서 변수 message를 초기화합니다. 트레잇 C는 추상 클래스 A를 상속하면서 loudMessage 함수를 선언합니다.

클래스 D는 클래스 B와 트레잇 C를 믹스인하여 클래스 B의 message 를 이용하는 loudMessage 함수를 생성할 수 있습니다.

```scala
abstract class A {
  val message: String
}

class B extends A {
  val message = "I'm an instance of class B"
}

trait C extends A {
  def loudMessage = message.toUpperCase()
}

class D extends B with C
```

이 클래스를 생성하고 실행하면 다음과 같이 확인할 수 있습니다.

```scala
scala> val d = new D
d: D = D@2c674d58

scala> println(d.message) 
I'm an instance of class B

scala> println(d.loudMessage)
I'M AN INSTANCE OF CLASS B
```