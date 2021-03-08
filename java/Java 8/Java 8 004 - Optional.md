# Java 8 004 - Optional





```java
Lecture stock = new Lecture(1, "stock", true);
Progress progress = stock.getProgress();
if (progress != null) {
  System.out.println(progress.getStudyDuration());
}
```

여기에서 null 체크를 하지 않았다고 가정해보자, 우리는 `NullPointException` 을 심심찮게 볼 수 있다.

<br />

### NullPointerException

이처럼 java 프로그래밍에서 `NullPointException` 을 볼 수 있는 이유는 아래와 같다.

1) null 체크를 해야한다는 것을 기억하지 못할 수 있기 때문이다.

2) null 을 리턴하기 때문이다. 그리고 null을 리턴하는 것이 문제가 될 수 있다.

>  null 인 경우 에러를 던지는 방법의 경우 문제가 있다.
>
> 1) 런타임예외를 던지면 해당 코드를 사용하는 클라이언트가 에러를 더 잘 해결할 가능성이 있지만, `checkedException` 을 던지는 경우 에러처리를 강제하는 경향이 생긴다.
>
> 2) Error 가 발생하면 java 는 stack trace 를 생성하는데, 이 자체로 리소스 낭비가 된다. 필요할 때 예외를 써야지, 로직을 처리할 때 에러를 사용하는 것은 좋지 못한 습관이다.

<br />



### 값을 리턴할 수 없는 경우 해결법?

1. 예외를 던진다. 하지만 StackTrace 에 쌓이게 되므로 비용이 비싸다.
2. `null` 을 리턴한다. (비용문제는 없지만 위처럼 클라이언트 코드가 주의해야 할 사항이 생긴다.)
3. java 8부터는 `Optional` 을 리턴한다 : 클라이언트 코드에게 명시적으로 nullable 임을 알려주고, 빈 값에 대한 처리를 강제한다.

<br />



### Optional

오직 한 개가 들어 있거나, 그렇지 않을 수도 있는 컨테이너이다.

null 일 수 있는 객체를 감쌀 경우 `Optional.ofNullable()` 로 감싸면 좋다. 주로 get 메소드의 리턴타입에 많이 쓰인다.

```java
public class Lecture {
	...
  private Progress progress;

  public Optional<Progress> getProgress() {
    return Optional.ofNullable(progress);
    // 빈 객체를 반납할 경우 return null 대신 return Optional.empty() 를 이용한다.
  }
}
```

```java
System.out.println(stock.getProgress()); // stock의 progress 필드가 null 인 경우 Optional.empty
```

<br />

### 주의할 점

1. 위 예시처럼 리턴값으로만 쓰기를 권장한다.
2. 메소드 매개변수 타입, 맵의 키 타입, 인스턴스 필드 타입등으로 사용하지 않는다.

<br />

메소드 매개변수 타입으로 `Optional<>` 을 쓰는 경우를 보자.

```java
public void setProgress(Optional<Progress> progress) {
  progress.ifPresent(p -> this.progress = p);
}
```

```java
stock.setProgress(null); // NullPointException
```

`Optional` 을 통해서 null 체크를 하려는 의도였지만, null 자체가 들어오면 `ifPresent` 라는 메소드를 쓸 수 없기 때문에 바로 에러가 발생한다.

```java
public void setProgress(Optional<Progress> progress) {
  if (progress != null) {
    progress.ifPresent(p -> this.progress = p);
  }
}
```

따라서 위와 같이 기존 처럼 null 체크도 하고, `Optional.isPresent()` 로도 한 번더 체크해주는 번거로운 로직이 발생한다.

따라서 메소드 매개변수로는 `Optional` 사용을 추천하지 않는다.

<br />

* Map 에서 key는 null 이 아니어야 한다. 따라서 Map에서 `Optional` 의 사용은 권장하지 않는다. Map 의 특성을 깨는 행동이기 때문이다.

* 인스턴스 필드 자체를 `Optional` 로 사용하는 것도 권장하지 않는다. 도메인 설계를 새로해서 상위 클래스, 하위 클래스로 나누는 방법 또는 validation 처리를 하는 방법 등으로 해결하도록 한다.

```java
public Optional<Progress> progress; // 권장 X
```



3. `Optional` 을 리턴하는 메소드에 `null` 을 리턴하지 않는다. 클라이언트는 `null`을 리턴받아서 또다시 `NullPointException`을 발생시킬 것이다. `Optional` 을 사용한 의미가 무색해진다.

4. Optional 에 primitive 타입을 넣지 않는 것을 권장한다. 

   boxing, unboxing 이 발생하므로 성능이 좋아지지 않는다. 대신 `OptionalInt`, `OptionalLong`, `OptionalDouble` 등을 사용한다.

5. Collection, Map, Stream, Array, Optional 은 `Optional` 로 감싸지 않는다. 

   그 자체로 비어있는지 판단할 수 있는 메소드가 있다.



<br />

---

## Optional API



1. Optional 만들기
   * `Optional.of()`
   * `Optional.ofNullable()`
   * `Optional.empty()`
2. Optional 에 값의 유무 확인하기
   * `isPresent()`
   * `isEmpty()` (java 11부터 제공, `isPresent` 와 반대)
3. Optional 에 있는 값 가져오기
   * `get()`
   * 비어있는 Optional 에서 꺼내기 위해서는 `ifPresent` 를 활용한다.

```java
public class Application {

  public static void main(String[] args) {

    List<Lecture> springLecture = new ArrayList<>();
    springLecture.add(new Lecture(1, "stock", true));
    springLecture.add(new Lecture(2, "fixed income", true));

    Optional<Lecture> optional = springLecture.stream()
      .filter(lecture -> lecture.getTitle().startsWith("apple"))
      .findFirst();

		optional.ifPresent(lecture -> System.out.println(lecture.getTitle())); // Optional.empty
  }
}
```

`NoSuchElementException` 이 발생할 수 있으므로 `get()` 전에는 값이 있는지 확인하는 메소드를 사용한다.

<br />

4. Optional 에 값이 있는 경우
   * `ifPresent(Consumer)`
5. Optional 에 값이 있으면 가져오고, 없는 경우 처리 (리턴)
   * `orElse(T)`

`orElse` 는 optional 안에 객체가 존재하든, 하지 않든 메소드의 안에 넣어준 객체를 새로 생성한다.

```java
public class Application {

  public static void main(String[] args) {

    List<Lecture> springLecture = new ArrayList<>();
    springLecture.add(new Lecture(1, "stock", true));
    springLecture.add(new Lecture(2, "fixed income", true));

    Optional<Lecture> optional = springLecture.stream()
      .filter(lecture -> lecture.getTitle().startsWith("apple"))
      .findFirst();

    Lecture lecture1 = optional.orElse(createNewClass);
    System.out.println(lecture1.getTitle()); // apple
  }
  
  private static Lecture createNewClass() {
    return new Lecture(10, "apple", false);
  }
}
```

<br />

6. Optional에 값이 있으면 가져오고 없는 경우 처리

optional 안에 객체가 없을 때만 새로 생성해주고 싶다면 `orElseGet` 을 사용한다.

```java
public class Application {

  public static void main(String[] args) {
    ...

    Lecture lecture = optional.orElseGet(Application::createNewClass);
    System.out.println(lecture.getTitle()); // apple
  }
}
```

<br />

7. Optional 에 값이 있으면 가져오고 없는 경우 에러를 던짐
   * `orElseThrow()`

optional 안에 객체가 없을 때 반환할 것이 없다면, 에러를 발생시키는 방법도 있다. 

```java
// 기본 에러는 NoSuchElementException 을 던진다.
Lecture lecture = optional.orElseThrow();

// IllegalArgumentException 등을 발생시킬 수도 있다.
Lecture lecture = optional.orElseThrow(() -> {
  return new IllegalArgumentException();
});

// 아래와 같이 메소드 레퍼런스로 생성자를 참조하여 에러를 던질수도 있다.
Lecture lecture = optional.orElseThrow(IllegalStateError::new);
```

8. Optional 에 들어있는 값 걸러내기 : `filter(Predicate)`
9. Optional 에 들어있는 값 변환하기 :
   *  `map(Function)`
   * `flatMap(Function)` : Optional 안에 들어있는 인스턴스가 Optional 인 경우에 사용하면 편리하다.

> stream의 `filter`, `map` 등도 optional 을 반납해준다.



```java
Optional<Lecture> optional = springLecture.stream()
                .filter(lecture -> lecture.getTitle().startsWith("apple"))
                .findFirst();

// map으로 optional 을 품은 optional 처리
Optional<Optional<Progress>> progress1 = optional.map(Lecture::getProgress);
Optional<Progress> progress2 = progress1.orElse(Optional.empty());

// flatMap을 활용하면 위 두 줄과 같은 표현이 된다.
Optional<Progress> progress = optional.flatMap(Lecture::getProgress);
```

