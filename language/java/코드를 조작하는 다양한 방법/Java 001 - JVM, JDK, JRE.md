# Java 001 - JVM, JDK, JRE





## JVM, JDK, JRE

<br />

자바코드를 만들고, 컴파일하여, 실행해보자.



**1) 자바파일 생성**

```shell
$ vi ./HelloJava.java
```

```java
public class HelloJava {
  public static void main(String args[]) {
    System.out.println("Hello");
  }
}
```

:wq (저장 w, 종료 q)

<br />

**2) 컴파일**

```shell
$ javac Hello.java
```

javac은 자바컴파일러로서, 자바코드() `.java` )를 JVM이 인식할 수 있는 바이트코드(`.class`) 타입으로 변환시켜주는 명령어이다. 컴파일 후에는 `Hello.class` 파일이 생성된다. `vi` 로 이파일을 열어보면

```shell
Êþº¾^@^@^@:^@^\
^@^B^@^C^G^@^D^L^@^E^@^F^A^@^Pjava/lang/Object^A^@^F<init>^A^@^C()V     ^@^H^@  ^G^@
^L^@^K^@^L^A^@^Pjava/lang/System^A^@^Cout^A^@^ULjava/io/PrintStream;^H^@^N^A^@^EHello
^@^P^@^Q^G^@^R^L^@^S^@^T^A^@^Sjava/io/PrintStream^A^@^Gprintln^A^@^U(Ljava/lang/String;)V^G^@^N^A^@^DCode^A^@^OLineNumberTable^A^@^Dmain^A^@^V([Ljava/lang/String;)V^A^@
SourceFile^A^@
Hello.java^@!^@^U^@^B^@^@^@^@^@^B^@^A^@^E^@^F^@^A^@^V^@^@^@^]^@^A^@^A^@^@^@^E*·^@^A±^@^@^@^A^@^W^@^@^@^F^@^A^@^@^@^A^@  ^@^X^@^Y^@^A^@^V^@^@^@%^@^B^@^A^@^@^@   ²^@^G^R^M¶^@^O±^@^@^@^A^@^W^@^@^@
^@^B^@^@^@^C^@^H^@^D^@^A^@^Z^@^@^@^B^@^[
```

매우 이상한 코드가 나온다. (바이트코드)

따라서 역컴파일 명령어(`javap`) 를 써서 내용을 확인해본다.

```shell
$ javap Hello
```

```java
Compiled from "Hello.java"
public class Hello {
  public Hello();
  public static void main(java.lang.String[]);
}
```

어떤 파일로부터 컴파일이 되었는가에 대한 정보와 함께 역컴파일된 원래 자바코드가 보인다.

또는 자세한 코드 분해 내용을 확인하고 싶다면 `-c` 옵션(Disassemble the code)을 추가한다.

```shell
$ javap -c Hello
Compiled from "Hello.java"
public class Hello {
  public Hello();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public static void main(java.lang.String[]);
    Code:
       0: getstatic     #7                  // Field java/lang/System.out:Ljava/io/PrintStream;
       3: ldc           #13                 // String Hello
       5: invokevirtual #15                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
       8: return
}
```

<br /><br />

---

> **JDK** 는 JRE, 개발 툴을 포함한다.
>
> **JRE**는 **JVM**과 Library를 포함한다.
>
> 개발 툴에는 appletviewer, apt, extcheck, javadoc, jar, javap, jconsole 등이 있다.



### JVM (Java Virtual Machine)

* 자바 가상 머신
* 바이트코드(.class 파일)를 읽어들인다.
* OS에 맞는 코드로 변환한다.(인터프리터, JIT 컴파일러) 따라서 특정 플랫폼에 종속적이다.
* (여러가지) 메모리에 올리고, 코드를 실행한다.
* JVM 은 바이트코드를 실행할 수 있는 스펙이다.
* JVM 벤더로는 오라클, 아마존, Azul 등이 있다.

<br />

### JRE (Java Runtime Enviornent) - 이제 점점 사라지는 추세

* JVM 과 Library 들을 묶어서 자바 애플리케이션을 실행할 수 있도록 구성된 배포판이다.
* JVM과 핵심 라이브러리, 자바 런타임 환경에서 사용하는 property 세팅이나 리소스 파일을 가지고 있다.
* 자바 컴파일러는 들어있지 않다. 개발 관련 도구는 포함하지 않는다. (JDK 에서 제공한다.)

<br />

### JDK (Java Development Kit)

* JRE 와 개발 툴의 묶음이다.
* 소스코드를 작성할 때 사용하는 자바 언어는 플랫폼에 독립적이다. (Write Once Run Anywhere)
* 오라클 자바 11부터는 JRE를 더이상 제공하지 않는다. 자바 9부터 모듈시스템이 들어왔다. 이를 통해 JRE 를 만들수도 있다.

<br />

### Java

* 프로그래밍 언어인데 JDK 전체를 통칭하여 말하기도 한다.
* JDK에 들어있는 자바 컴파일러(javac)를 사용하여 바이트코드(.class)로 컴파일할 수 있다.
* 오라클에서 만든 Oracle JDK는 11버전부터 상용으로 사용할 때 유료이다.

<br />

### JVM 언어

* JVM 기반으로 동작하는 프로그래밍 언어이다.
* 다른 언어로 작성했다고 하더라도 `.class` 파일 또는 `.java` 파일형태로 만들 수 있다면 JVM 을 통해 익숙한 환경에서 실행할 수 있다.
* 클로저, 그루비, JRuby, Jython, Kotlin, Scala 등

코틀린 예시)

```shell
# 코틀린 파일 생성
$ vi Hello.kt
```

```kotlin
fun main(args: Array<String>) {
  println("Hello, Kotlin")
}
```

```shell
# 코틀린 컴파일
$ kotlinc Hello.kt
```

```shell
# 코틀린 역컴파일
$ javap -c HelloKt
Compiled from "Hello.kt"
public final class HelloKt {
  public static final void main(java.lang.String[]);
    Code:
       0: aload_0
       1: ldc           #9                  // String args
       3: invokestatic  #15                 // Method kotlin/jvm/internal/Intrinsics.checkNotNullParameter:(Ljava/lang/Object;Ljava/lang/String;)V
       6: ldc           #17                 // String Hello, Kotlin
       8: astore_1
       9: iconst_0
      10: istore_2
      11: getstatic     #23                 // Field java/lang/System.out:Ljava/io/PrintStream;
      14: aload_1
      15: invokevirtual #29                 // Method java/io/PrintStream.println:(Ljava/lang/Object;)V
      18: return
}
```

아쉽지만 실행은 java 명령어로 할 수 없다. 아래와 같이 `jar` 파일로 만들어서 실행하는 방법이 있다.

```shell
$ kotlinc Hello.kt -include-runtime -d hello.jar
$ java -jar hello.jar
```

>  `-d` : destination





<br />

---

## JVM 구조



### 클래스 로더 시스템

* `.class` 파일에서 바이트코드를 읽고 메모리에 저장한다.
* 로딩(loading)은 클래스를 읽어오는 과정, 링크(linking)는 레퍼런스를 연결하는 과정, 초기화(initialization)는 `static` 값들을 초기화하고 변수에 할당하는 과정을 말한다.

> `static` 으로 선언한 클래스는 다른 클래스에서도 사용할 수 있다.

<br />

### 메모리

* 메소드에는 클래스 수준의 정보(클래스 이름, 부모 클래스 이름, 메소드, 변수)들을 저장한다. 공유 자원이다.

* 힙(heap) 영역에는 실제 객체(인스턴스)를 저장한다. 공유 자원이다.

* 스택(stack) 영역에는 쓰레드마다 런타임 스택을 만들고, 그 안에 메소드 호출 블럭(스택 프레임)을 쌓는다. 스택 프레임은 메소드 콜이다. (쉽게 이해하자면 에러메시지 로그에 함수 호출내역들이 쌓인 것을 봤을 것이다.) 스택은 쓰레드마다 하나씩 만들어준다.

* PC 레지스터(PC register) : 쓰레드마다 쓰레드 내에서 현재 실행할 instruction의 위치를 가리키는 포인터가 생성된다. PC(Program Counter는 현재 어느 위치를 실행하고 있는지 정보를 담고 있다. 쓰레드 영역에 국한 되어있으며 쓰레드 마다 생긴다.

* Native Method Stack : 네이티브 메소드를 호출할 때 필요한 별도의 스택이다. 쓰레드 마다 생성된다.

  > Native Method 란?
  >
  > java 가 아닌 C, C++ 로 만들어진 코드이다. 클래스 이름 앞에 `native` 라는 키워드가 붙어있다. 가령 `Thread.currentThread()` 가 있다.

<br />

### JNI (Java Native Interface)

* native 키워드를 붙인 API 들을 JNI(네이티브 메소드 인터페이스)라고 부른다.
* 자바 애플리케이에서 C, C++, 어셈블리로 작성된 함수를 사용할 수 있는 방법을 제공한다.
* 네이티브 메소드 라이브러리는 JNI 를 구현한 코드들을 말한다. C, C++ 로 작성된 라이브러리들이다.

<br />

### 실행 엔진

* 인터프리터 : 인터프리터는 바이트코드를 이해하고, 한줄씩 네이티브 코드로 실행시킨다.

* JIT(Just In Time) 컴파일러 : 인터프리터가 한줄 한줄 실행하면서 반복된 코드가 보이면 JIT 컴파일러로 반복되는 코드를 모두 네이티브 코드로 바꾸어 놓는다. 따라서 인터프리터는 미리 번역해놓은 코드로 효율을 높이며 코드를 실행시킬 수 있다.

* GC(Garbage Collector) : 더이상 참조되지 않는 객체를 모아 정리한다.

  > GC는 경우에 따라 옵션을 주어 사용한다. profiing 등에 사용된다. 크게보면`throughput` 위주의 GC, stop-the-world를 줄이는 GC 두가지가 있다.
  >
  >  **`stop-the-world`**  : 많은 객체를 생성하고, response time이 중요할 경우 멈춤현상을 최소화도록 GC를 사용한다. `stop-the-world` 는 GC 를 실행하기 위해 JVM이 애플리케이션을 실행을 멈추는 것이다.  `stop-the-world`  발생시 GC를 실행하는 쓰레드를 제외한 나머지 쓰레드는 모두 작업을 멈춘다. 그리고 GC 작업을 완료한 이후에 중단했던 작업을 다시 시작한다. 어떤 GC 알고리즘을 사용하더라도  `stop-the-world` 는 발생하며, 대개의 경우 GC 튜닝이란  `stop-the-world`  시간을 줄이는 것이다.



<br />

---

## 클래스 로더



로딩, 링크, 초기화 순으로 진행된다.

### Loading

* 클래스 로더가 `.class` 파일을 읽고, 이 내용에 따라 바이너리 데이터를 만들고 **메소드 영역**에 저장한다.
* 메소드 영역에는 아래를 저장한다.
  * FQCN(Fully Qualified Class Name) : 패키지이름, 클래스이름, 클래스로더가 같이 포함 된 것이 FQCN 이나 보통 패키지 경로를 풀패키지 경로라 한다.
  * 클래스, 인터페이스, 이늄
  * 메소드와 변수
* 로딩이 끝나면 해당 클래스 타입의 Class 객체를 생성하여 **힙에 저**장한다.

> ```java
> public class Fitness {
> }
> ```
>
> 가령 Fitness 클래스가 로딩이되면 해당 클래스타입의 인스턴스가 `Fitness.class` 에 저장된다. static 하게(전역적으로) 접근할 수 있다.
>
> ```java
> Fitness fitness = new Fitness();
> fitness.getClass();
> ```
>
> 또는 인스턴스가 있으면, `.getClass()` 로 객체에 접근할 수 있다.
>
> 클래스로딩 후에는 `Class<Fitness>` 타입의 객체가 힙 영역에 만들어진다.

<br />

클래스로더의 `.getParent()` 메소드는 최상위 부모 클래스를 찾아가서, 메소드를 호출한 클래스의 부모 클래스를 찾는다.

그래서 점점 내려와서 만약 자신까지 내려왔는데 찾을 수 없다면 `ClassNotFoundException` 이 발생한다. 의존성을 추가하지 않고 특정 클래스를 쓰려다가 이런 에러가 많이 발생한다.

```java
public class App 
{
    public static void main( String[] args ) {
        ClassLoader classLoader = App.class.getClassLoader();
        System.out.println(classLoader);
        System.out.println(classLoader.getParent());
        System.out.println(classLoader.getParent().getParent());
    }
}
```

```shell
jdk.internal.loader.ClassLoaders$AppClassLoader@2c13da15
jdk.internal.loader.ClassLoaders$PlatformClassLoader@7e0babb1
null
```

<br />

### Link

* Verify, Prepare, Resolve(optional) 세 단계 순으로 진행된다.
* 검증 단계에서는 `.class` 파일 형식이 유효한지 체크한다.
* Preparation 은 메모리를 준비하는 과정이다. 클래스 변수(static 변수)와 기본값에 필요한 메모리 이다.
* Resolve 에서는 심볼릭 메모리 레퍼런스를 메소드 영역에 있는 실제 레퍼런스로 교체한다.
  * 심볼릭 메소드 레퍼런스 : 객체가 다른 객체를 레퍼런트 할 때, 링크과정에서는 실제 레퍼런스를 가리키지 않고, 논리적으로만 힙의 저장된 클래스를 가리키도록한다. (선택할 수 있다.)

<br />

### 초기화

* static 변수 값을 할당한다. `static { }` (static 블럭) 이 있다면 이 때 실행된다.



클래스로더는 계층 구조로 이루어져 있고, 기본적으로 세가지 클래스 로더가 제공된다.

* 부트 스트랩 클래스 로더 - `JAVA_HOME/lib` 에 있는 코어 자바 API 를 제공한다.
* 플랫폼 클래스로더 - `JAVA_HOME/lib/ext` 폴더 또는 `java.ext.dirs` 시스템 변수에 해당하는 위치에 있는 클래스를 읽는다.
* 애플리케이션 클래스로더 - 애플리케이션의 클래스패스( 애플리케이션 실행할 때 주는 `-classpath` 옵션 또는 `java.class.path` 환경 변수의 값에 해당하는 위치) 에서 클래스를 읽는다.



