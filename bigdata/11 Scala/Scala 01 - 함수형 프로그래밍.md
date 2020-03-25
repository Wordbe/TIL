# Scala 01 - Functional Programming

빅데이터 분석기술 중 주목 받고 있는 Spark를 알아봅니다.

Spark는 인메모리 기반 처리로 하둡의 맵리듀스에 비해 100배 빠른 속도를 제공하고, 머신러닝, 그래프처리 등 빅데이터 분석을 위한 통합 컴포넌트 서비스를 제공합니다.

스파크는 스칼라(Scala)로 작성되어 자바보다 간결한 코드로 작업을 표현할 수 있습니다. 스칼라는 JVM에서 동작하기 때문에 기존 자바 라이브러리를 모두 사용할 수 있습니다.



# 1. Scala

스칼라는 2004년 마틴 오더스키가 발표했으며, 객제 지향 언어의 특징과 함수형 언어의 특징을 함께 가지는 다중 패러다임 프로그래밍 언어입니다.

<br>

### 특징

### 1 JVML 언어

스칼라는 자바가상머신(JVM)에서 동작하는 JVML언어 입니다. **JVML(Java Virtual Machine Language)** 언어는 자바가상머신 위에서 동작하는 언어들로 **scala, kotlin, Groovy** 등이 있습니다.

자바 가상 머신 위에서 동작하기 때문에 자바의 모든 라이브러리를 사용할 수 있습니다. 스칼라는 **스칼라 컴파일러를 통해 스칼라 코드를 바이트 코드로 변환**하고, 바이트 코드는 JVM 상에서 자바와 동일하게 실행됩니다.

![scala](https://i.stack.imgur.com/XW1Gv.png)

<br>

### 2 함수형 언어

스칼라는 함수형 언어의 특징을 가지기 때문에 자바에 비하여 코드길이가 짧습니다. **겟터, 셋터, 생성자를 제거하고, 표현식을 간소화** 하여 자바대비 짧은 코드로 동일한 내용을 작성할 수 있습니다.

![code length](https://1.bp.blogspot.com/-PL46dZDlB5U/WmXos5dFN4I/AAAAAAAAKL8/mNLo82-R0lYCwPQzjJyDvDk6UZbZ_4BaACLcBGAs/s400/Java%2Bvs%2BScala%2BCode.png)

<br>

### 3 바이트 코드 최적화

**바이트 코드를 최적화 하여하여 자바 보다 20% 정도 속도가 빠릅니다.** 같은 일을 하는 프로그램을 작성하여도 자바에 비해 코드도 짧고, 속도도 빠릅니다.

![java speed](https://jazzy.id.au/images/blogs/javascalabenchmark/scalavsjava.png)

### 4 동시성에 강함

스칼라는 **변경 불가능한 Immutable 변수**를 많이 가지고 있습니다. 이를 통해 **속성을 변경 불가능하게 하고, 순수 함수를 사용하여 병렬 프로그래밍 처리에 강합니다.**

<br>

<br>

<br>

---

# 2. 함수형 프로그래밍

스칼라는 함수형 프로그래밍 언어의 특징을 가집니다. 

<br>

### 1 함수형 언어

함수형 언어는 함수형 프로그래밍의 패러다임을 따르는 프로그래밍 언어입니다. LISP, Clojure, Erlang 등이 있고, 최근에는 함수형 언어가 아닌 C#, Java같은 **객체지향언어에서도 람다 함수의 도입을 통해 함수형 프로그래밍을 지원할 수 있도록 노력**하고 있습니다.

<br>

### 2 함수형 프로그래밍

함수형 프로그래밍은 프로그래밍 패러다임의 하나로 자료 처리를 수학적 함수의 계산으로 취급하고 상태 변화와 가변 데이터를 피하는 것입니다.

**순수 함수와 보조 함수의 조합**을 이용해서 로직 내에 존재하는 **조건문과 반복문을 제거하여 복잡성을 없애고,** **변수의 사용을 억제하여 상태 변경을 피하**고자 하는 패러다임입니다. 조건문과 반복문은 로직의 흐름을 이해하기 어렵게 하여 **가독성**을 해치고, 변수의 값은 누군가에 의해 언제든지 **변경 될 수 있어 오류 발생**의 근본적인 원인이 될 수 있기 때문입니다.

함수형 프로그래밍은 함수형 언어가 제공하는 다음의 특징을 이용합니다.

<br>

### 3 순수 함수(pure function)

**함수의 실행이 외부에 영향을 끼치지 않는 함수**입니다. 외부에 영향을 미치지 않기 때문에 **스레드-세이프(thread-safe)하고, 병렬 계산이 가능**합니다.

예)

```java
public int add(int a, int b) {
  return a + b;
}
```

<br>

### 4 익명 함수(anonymous function)

전통적인 명령형 언어는 함수에 이름이 있어야 합니다. **함수형 언어는 선언부가 없는 익명 함수를 생성하여 코드 길이를 줄이고, 프로그래밍 로직에 집중**할 수 있습니다.

다음과 같이 reduce 함수의 입력값으로 익명 함수를 제공하여 값을 처리할 수 있습니다.

```
Arrays.asList(1,2,3).stream().reduce((a,b)-> a-b).get(); 
```

<br>

### 5 고차함수(higher-order function)

함수를 인수로 취하는 함수입니다. 함수를 입력 파라미터나 출력 값으로 처리할 수 있습니다.

```
Collections.sort(new ArrayList<Integer>(), (x, y) -> x >= y ? -1 : 1);
```

<br>

<br>

<br>

---

# 3. 설치

스칼라와 스칼라 개발을 위한 IDE 설치 방법에 대해서 알아봅니다.

<br>

### 스칼라 설치

스칼라로 개발을 하기 위해서는 먼저 자바를 설치합니다. 자바의 버전과 스칼라 버전의 호환성이 있기 때문에 버전을 잘 확인하고 설치해야 합니다.

다음으로 IDE를 이용한 개발 환경 설정을 위해서 인텔리J나 이클립스 IDE를 설치합니다. **IDE에서 스칼라 라이브러리를 추가하여 주기 때문에 스칼라를 별도로 설치 하지 않아도 되어 개발이 편리합니다.** IDE를 이용할 수 없는 환경이라면 스칼라 바이너리와 스칼라 빌드 툴(SBT)을 별도로 설치하여 커맨드 라인으로 개발을 진행하면 됩니다.

여기서는 개발의 편의성을 위해서 IDE를 이용한 개발을 진행하겠습니다.

<br>

### 1 JDK 설치

터미널에서 JDK가 설치 되어 있는지 확인합니다.

`java -version` 명령으로 자바 버전을 확인합니다. JVM 버전과 스칼라 버전의 호환성은 다음과 같습니다.

| JVM version | 최소 스칼라 버전        |
| :---------- | :---------------------- |
| 9, 10       | 2.12.4, 2.11.12, 2.10.7 |
| 8           | 2.12.0, 2.11.0, 2.10.2  |
| 7           | 2.11.0, 2.10.0          |

자바의 버전을 확인하면 다음과 같습니다.

```shell
$ java -version
java version "1.8.0_40"
Java(TM) SE Runtime Environment (build 1.8.0_40-b27)
Java HotSpot(TM) 64-Bit Server VM (build 25.40-b25, mixed mode)
```

<br>

### 2 IDE 설치

스칼라는 이클립스와 인텔리J 두가지 IDE를 이용하여 개발할 수 있습니다.

<Br>

### 이클립스

이클립스는 마켓플레이스에서 스칼라 IDE를 설치하면 스칼라 프로젝트를 생성할 수 있습니다. `Help -> Eclipse Marketplace...` 를 선택하고, scala ide 를 검색하고 설치합니다.

![eclipse_scala_ide](https://wikidocs.net/images/page/24693/eclipse_scala_ide.png)

플러그인 설치 후 이클립스를 재시작하면 스칼라 프로젝트를 생성할 수 있습니다.

![eclipse_scala_project](https://wikidocs.net/images/page/24693/eclipse_scala_project.png)

<br>

### IntelliJ

IntelliJ 커뮤니티 버전을 처음 설치할 때, scala를 사용하도록 체크할 수 있습니다. 기존에 설치된 IntelliJ에 스칼라 플러그인을 설치는 `Preference -> Plugins`를 선택하고, scala를 검색하여 설치합니다.

![intellij_scala](https://wikidocs.net/images/page/24693/intellij_scala_plugin.png)

<br>

플러그인 설치후 재시작하면 프로젝트 생성에서 스칼라를 선택할 수 있습니다. `File -> New.. -> Project`를 선택하고, 빌드 툴을 선택합니다. **scala의 기본 빌드 툴인 sbt(Simple Build Tool)를 이용하는 것을 추천**합니다.

![img](https://wikidocs.net/images/page/24693/scala_project_1.png)

그리고 프로젝트 명을 입력하고, 스칼라 버전을 선택하여 프로젝트를 생성하면 됩니다.

![img](https://wikidocs.net/images/page/24693/scala_project_2.png)

---

### 스칼라 웹 REPL

스칼라를 설치하는 방법외에 [Scasite](https://scastie.scala-lang.org/)를 이용하는 방법도 있습니다.

Scasite는 웹브라우저에서 사용할 수 있는 스칼라 REPL 콘솔입니다. 스칼라의 버전을 선택하여 사용할 수 있기 때문에 스칼라를 설치하기 어려운 환경이라면 이 사이트를 이용하여 기본 문법을 공부하는 것도 좋습니다.

![scasie](https://wikidocs.net/images/page/31761/Scastie.png)

<br>

### IDE 스칼라 워크시트(worksheet)

스칼라 IDE는 워크시트를 제공합니다. 워크시트는 REPL 쉘과 유사하게 사용자의 입력을 바로 보여줍니다. 워크시트를 이용하면 따로 실행하지 않아도 변수의 데이터와 처리 과정을 바로 확인할 수 있기 때문에 테스트에 유용합니다.

**REPL 쉘 처럼 한줄한줄 입력하지 않고 코드를 작성하는 것처럼 표현하면서 데이터를 확인할 수 있기 때문에 효율적**입니다.







---

**Reference**

https://wikidocs.net/26134

https://wikidocs.net/26135

https://wikidocs.net/24693

https://wikidocs.net/31761