# java 6 - 상속



## 1 자바 상속의 특징

* 상속은 말 그대로 자식이 부모로부터 물려받는 것을 의미한다.
* 클래스 상속을 위해 `extends` 키워드를 사용한다.
* 자바에서 만드는 모든 클래스는 `Object` 클래스를 상속 받는다.



예제 Fruit.java

```java
public class Fruit {
  String name;
  
  public void setName(String name) {
    this.name = name;
  }
}
```

Apple.java

```java
public class Apple extends Fruit {
  
}
```

Apple 클래스에서 `name` 필드와 `setName` 메소드를 구현하지 않았지만, `Fruit` 클래스에서 상속받았으므로 그대로 사용가능하다.



자식 클래스는 부모 클래스의 자료형을 사용할 수 있다.

```java
Fruit apple = new Apple(); // 부모 클래스 자료형 가능
Apple apple = new Apple(); // 가능
```



'자식 `IS-A` 부모 ' 가 성립한다. (포함관계)

반면, 부모 `IS-A` 자식은 성립하지 않는다.



위에서 '사과는 과일'이지만, 

'과일은 사과'라고 할 수 없는 것을 알 수 있다.





---

## 2 super 키워드

`super` 키워드는 부모 클래스로부터 상속받은 필드나 메소드를 자식 클래스에서 참조할 때 사용하는 참조변수이다.

this와 마찬가지로 `super` 참조변수를 사용할 수 있는 대상도 인스턴스 메소드 뿐이다. 클래스메소드에서는 사용할 수 없다.



예시

```java
class Parent {
  String name = "Joe";
}

class Child extends Parent {
  String name = "Peter"
  
  void print() {
  	System.out.print(name);
    System.out.print(this.name);
    System.out.print(super.name);
  }
}
```

출력결과

```console
Peter
Peter
Joe
```

super 키워드는 부모에서 선언된 필드값을 참조할 수 있다.



---

## 3 메소드 오버라이딩

오버라이딩(overiding)이란 부모 클래스의 메소드를 자식 클래스에서 재정의해서 사용하는 것이다.



자바에서 메소드 오버라이딩 조건은 아래와 같다.

* 메소드의 선언부는 기존 메소드와 완전히 같아야 한다. (메소드 반환타입은 부모 클래스의 반환 타입으로 변환이 가능하면 변경가능하다.)
* 부모 클래스 메소드보다 접근 제어자를 더 좁은 범위로 설정할 수 없다.
* 부모 클래스 메소듭다 더 큰 범위의 예외를 선언할 수 없다.

```java
class Parent {
  void print() { System.out.println("부모클래스 print")}
}

class Child extends Parent {
  @Override // 철자 오타 방지를 위해 어노테이션을 표시
  void print() { System.out.println("자식클래스 print")} // 오버라이딩
}
```





---

## 4 다이나믹 메소드 디스패치 (Dynamic Method Dispatch)

재정의 된(오버라이딩 된) 메소드에 대한 호출이 **컴파일 타임이 아닌 런타임에 해석되는 프로세스**이다.

오버라이드 된 메소드가 참조에 의해 호출될 때 java는 참조하는 객체 유형에 따라 실행할 메소드 버전을 판별한다.

이는 런타임 다형성으로 알려져있다.



메소드의 호출이 런타임에 된다.

```java
class Parent {
  void print() { System.out.println("부모클래스 print")}
}

class Child extends Parent {
  @Override // 철자 오타 방지를 위해 어노테이션을 표시
  void print() { System.out.println("자식클래스 print")} // 오버라이딩
}

public static void main(String[] args) {
  Parent child = new Child();
}
```



---

## 5 추상 클래스(Abstract Class)

추상 메소드는 자식 클래스에서 반드시 오버라이딩해야하는 메소드이다.

이는 자식 클래스가 반드시 추상 메소드를 구현하도록 하기 위함이다.

추상메소드는 선언부만 존재하고, 구현부는 작성돼있지 않다. 작성은 자식 클래스에서 하여 구현한다.



추상 메소드를 포함하는 클래스를 추상클래스라 한다.

추상 클래스는 OOP 의 중요 특징인 다형성을 가진 메소드 집합을 정의할 수 있도록 돕는다.



```java
abstract class Parent { // 추상 클래스
  abstract void print(); // 추상 메소드
}

class Child extends Parent {
  @Override
  void print() { System.out.println("자식클래스 print")} // 추상 메소드를 오버라이딩하지 않으면 에러가 난다.
}
```



---

## 6 final 키워드

`final` 을 클래스 이름 앞에 붙이면 클래스를 상속받을 수 없음을 지정한다.

```java
final class FinalClass {
  
}

class Child extends FinalClass { // 컴파일 에러 발생
  
}
```



마찬가지로 메소드 앞에 `final` 키워드가 있으면, 자식 클래스에서 오버라이딩하여 재정의 할 수 없다.

필드 앞에 `final`을 정의하면, 상수(`const`)로 정의된다. 한 번 정의되면 값을 변경할 수 없다. 또한 자식 클래스에서 상속 받아 사용할 수 없다.



> 프로그램 전체에서 공유하며 사용할 수 있는 상수
>
> `static final` 을 사용한다.
>
> ```java
> class GlobalShare {
>   public static final double PI = 3.1415926535;
> }
> ```
>
> 



---

## 7 Object 클래스

`java.lang.Object` 클래스는 `java.lang` 패키지 중에서 가장 많이 사용되는 클래스이다.

> **java.lang 패키지**
>
> 자바에서 기본 동작 수행하는 클래스 집합이다. `import` 문을 사용하지 않아도 클래스 이름만으로 바로 사용가능하다.



Object 클래스는 모든 자바 클래스의 가장 최고 조상 클래스가 된다. 모든 클래스는 Object 클래스 메소드를 바로 사용할 수 있다.

Object 클래스는 필드는 없으며, 총 11개 메소드로 구성된다.

```java
class Object {
	String toString() {...}; // 문자열로 반환
	boolean equals(Object obj) {...}; // 같은 지 여부 반환
  protected Object clone() {...}; // 인스턴스를 복제하여 새로운 인스턴스를 생성해 반환
  protected void finalize() {...}; // 가비지컬렉터(GC)가 객체 리소스를 삭제
  Class<T> getClass() {...}; // 객체의 클래스 타입 반환
  int hashCode() {...}; // 객체의 해시 코드값 반환
  void notify() {...}; // 객체의 대기중인 하나의 스레드를 다시 실행할 때 호출
  void notifyAll() {...}; // 객체의 대기중인 모든 스레드를 다시 실행할 때 호출
  void wait() {...}; // 객체의 다른 스레드가 notify() 또는 notifyAll() 메소드 실행할 때까지 현재 스레드를 일시적으로 대기시킴
  void wait(long timeout) {...}; // 객체의 다른 스레드가 notify() 또는 notifyAll() 메소드 실행하거나 timeout시간이 지날 때까지 현재 스레드를 일시적으로 대기시킴
  void wait(long timeout, int nanos) {...}; // 객체의 다른 스레드가 notify() 또는 notifyAll() 메소드 실행하거나 timeout시간이 지나거나 다른 스레드가 현재 스레드를 인터럽트할 때까지 현재 스레드를 일시적으로 대기시킴
}

```



