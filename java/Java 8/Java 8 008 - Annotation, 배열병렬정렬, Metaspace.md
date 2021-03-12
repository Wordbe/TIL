# Java 8 008 - Annotation, 배열병렬정렬, Metaspace



* java 8 부터 어노테이션을 타입 선언부에도 사용할 수 있게 되었다.
* 또한 어노테이션을 중복해서 사용할 수도 있게 되었다.

<br />

### 어노테이션 타입 선언부에 달기

> 타입 선언부
>
> * 제네릭 타입
> * 변수 타입
> * 매개변수 타입
> * 예외 타입 등

타입 선언부에 어노테이션을 달려면 어노테이션의 `@Target`을 설정한다.

 `TYPE_PARAMETER` : 타입 변수에만 사용할 수 있다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE_USE)
public @interface Cap {
}
```

```java
static class BlueCap<@Cap T> {
}
```

`TYPE_USE` : 타입 변수를 포함해서 모든 타입 선언부에 사용할 수 있다.

```java
@Target(ElementType.TYPE_USE)
```

```java
@Cap
public class Application {

  public static void main(String[] args) throws @Cap RuntimeException { // 예외 타입

  }

  static class BlueCap<@Cap T> { // 제네릭 타입
    private @Cap String name; // 변수 타입
    
    public static <C> void print(@Cap C c) { // 매개변수 타입
      System.out.println(c);
    }
  }
}
```



<br />

### 어노테이션 중복해서 사용하기

같은 어노테이션을 반복해서 사용하는 방법

기본 어노테이션에 `@Repeatable` 을 추가한다. (중복해서 사용할 어노테이션)

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE_USE)
@Repeatable(CapContainer.class)
public @interface Cap {
    String value();
}
```

어노테이션 컨테이너를 만든다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE_USE)
public @interface CapContainer {
    Cap[] value();
}
```

이 때 `@Retention` 과 `@Target` 등은 컨테이너가 기본 어노테이션을 포함할 수 있는 범위로 정해준다. 같아도 된다.

`Cap[]` 배열을 선언한다.



이제, 리플렉션에서 `getAnnotationsByType` 으로 어노테이션 정보를 가져올 수 있다.

```java
@Cap("red")
@Cap("black")
public class Application {

  public static void main(String[] args) throws ExecutionException, InterruptedException {
    Cap[] caps = Application.class.getAnnotationsByType(Cap.class);
    Arrays.stream(caps).forEach(c -> System.out.println(c.value()));
  }
}
```

```shell
red
black
```



또는 `getAnnotation` 을 사용할 수도 있다.

```java
CapContainer capContainer = Application.class.getAnnotation(CapContainer.class);
Arrays.stream(capContainer.value()).forEach(c -> System.out.println(c.value()));
```

<br />

---

## 배열의 Parallel 정렬



`Arrays.parallelSort()` 는 Fork/Join 프레임워크를 사용해서 배열을 병렬로 정렬하는 기능을 제공한다.

`forkJoin` 프레임워크에서 제공받은 여러 쓰레드에서 분산해서 처리한다. 병합정렬의 분할정복 원리로 배열을 계속하여 둘로 쪼개서 작은 부분을 정렬하고 다시 합치는 원리로 작동한다.

> `Arrays.sort()` 는 싱글쓰레드에서 quicksort 로 작동한다. O(NlogN)

```java
int size = 2000;
int[] numbers = new int[size];
Random random = new Random();
IntStream.range(0, size).forEach(i -> numbers[i] = random.nextInt());

// sort()
long start = System.nanoTime();
Arrays.sort(numbers);
System.out.println("Serial sorting: " + (System.nanoTime() - start));

// parallelSort()
IntStream.range(0, size).forEach(i -> numbers[i] = random.nextInt());
start = System.nanoTime();
Arrays.parallelSort(numbers);
System.out.println("Parallel sorting: " + (System.nanoTime() - start));
```

```shell
Serial sorting: 709581
Parallel sorting: 145922
```

알고리즘의 효율성은 시간복잡도 O(NlogN), 공간복잡도 O(N)으로 같다.

<br />

---

## Metaspace

JVM의 PermGen 메모리 영역이 없어지고, Metaspace 영역이 생겼다.



### PermGen

* Permanent Generation, 클래스의 메타데이터 정보를 담아두는 공간이다.
* Heap 영역의 일부이다.
* 기본값으로 제한된 크기를 가진다.
* `-XX:PermSize=N` : PermGen 초기사이즈를 설정한다.
* `-XX:MaxPermSize=N` : PermGen 최대 사이즈를 설정한다.

> OS가 제공하는 메모리(native memory) 중에 JVM 이 관리하는 메모리를 보자.
>
> * Eden (Young generation)
> * Old generation
> * PermGen - 64MB, 128MB 등 고정된 사이즈로 만들어진다. 이 공간이 넘치면, GC를 해도 넘치면 에러가 발생한다. (out of memory)
>   * 해결 : 일단 PermGen 사이즈를 높인다. 근본적으로는 어디선가 동적으로 클래스를 만들고 있는 곳을 찾아서 해결해야 한다.



### Metaspace

* 클래스 메탇이터를 담는 곳이다.
* java 8 에서는 PermGen 을 JVM이 아닌 navtive memory 에 metaspace 라는 이름으로 만들어 놓는다. 
* 따라서 java 8부터는 PermGen 관련 java 옵션은 무시한다.
* 기본적으로 제한된 크기를 가지지 않는다. 필요한 만큼 계속 늘어난다.
* `-XX:MetaspaceSize=N` : Metaspace 초기사이즈를 설정한다.
* `-XX:MaxMetaspaceSize=N` : Metaspace 최대 사이즈를 설정한다.



GC : Young generation, Old generation, Full GC