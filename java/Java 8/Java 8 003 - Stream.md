# Java 8 003 - Stream



### Stream

`Stream`은 순차적이고 병렬적인 집합(aggregate) 연산을 지원하는 요소들의 나열(sequence이다.

java Collection(List, Set) 에 특정 타입의 여러 데이터가 들어있을 때 Stream 을 통해 쉽게 다룰 수 있다.

* 데이터를 담고 있는 저장소(컬렉션)가 아니다.
* 스트림이 처리하는 데이터 소스는 변경하지 않는다. (Functional in nature)
* 스트림으로 처리하는 데이터는 오직 한 번만 처리한다.
* 나열은 무제한일 수도 있고, short circuit 메소드를 사용해서 제한할 수 있다.
* 중개 오퍼레이션은 근본적으로 lazy 하다.
* 손쉽게 병렬처리를 할 수 있다.

<br />

### Stream Pipeline

스트림 파이프라인은 연속된 데이터를 처리하는 오퍼레이션의 모음이다.

* 0개 이상의 중개 연산(intermediate operation)과 1개의 종료 연산(terminal operation)으로 구성된다.
* 스트림 데이터 소스는 종료 연산을 실행할 때만 처리한다.

<br />

Stream 예시를 하나보자.

```java
public class Application {

  public static void main(String[] args) {
    List<String> names = new ArrayList<>();
    names.add("red");
    names.add("blue");
    names.add("orange");
    names.add("brown");

    // 자료를 흘려보내면서 대문자로 바꾼다.
    Stream<String> stringStream = names.stream().map(String::toUpperCase);
    
    // 원래 데이터인 names를 출력해보면 원본은 바뀌지 않았음을 알 수 있다.
    names.forEach(System.out::println);
  }
}
```

Stream 의 장점 중 하나는 **가독성**이다. `for` 문을 이용해서 처리하는 것과 비교하면 코드가 깔끔해지는 효과가 있다.

```java
for (String name : names) {
  System.out.println(name.toUpperCase());
}
```

```java
names.stream()
  .map(String::toUpperCase).forEach(System.out::println);
```



### 중개 연산

중개형 오퍼레이션은 LAZY 하다. Stream을 리턴한다.

종료형(terminal) 오퍼레이션이 오기 전까지 실행되지는 않는다.

* `Stream`을 리턴한다.
* Stateless / Stateful 연산으로 더 상세하게 구분할 수도 있다. 대부분은 stateless 이며, `distinct` 또는 `sorted` 처럼 이전 소스 데이터를 참조해야 하는 경우는 stateful 연산이다.
* `filter`, `map`, `limit`, `skip`, `sorted` 등이 있다.

<br />

### 종료 연산

* `Stream` 을 리턴하지 않는다.
* `collect`, `allMatch`, `count`, `forEach`, `min`, `max` 등 집합(aggregate) 연산이다.

위 코드에 이어서 아래 코드를 작성해보자.

```java
names.stream().map((s) -> {
  // 출력이 되지 않는다.
  System.out.println(s);
  return s.toUpperCase();
});
```

```java
names.stream().map((s) -> {
  // 종료형 오퍼레이터를 추가해주면 실행이 된다.
  System.out.println(s);
  return s.toUpperCase();
}).collect(Collectors.toList());
```



<br />

### 병렬 연산

Stream을 사용하면 손쉽게 병렬처리를 할 수 있다. 

병렬처리는 `parallelStream` 메소드를 이용한다.

```java
List<String> names = new ArrayList<>();
names.add("red");
names.add("blue");
names.add("orange");
names.add("brown");

List<Object> collect = names.parallelStream().map(s -> {
  System.out.println(s + " " + Thread.currentThread().getName());
  return s.toUpperCase();
}).collect(Collectors.toList());
collect.forEach(System.out::println);
```

출력결과

```shell
red ForkJoinPool.commonPool-worker-23
blue ForkJoinPool.commonPool-worker-19
orange main
brown ForkJoinPool.commonPool-worker-5
RED
BLUE
ORANGE
BROWN
```

주의할 점은 병렬처리가 항상 빠른 것은 아니다는 것이다. 쓰레드를 나누어서 만들고, 수집하고, 쓰레드 끼리 왔다갔다하는 컨텍스트 스위치 비용이 많이 들기 때문이다. 단, 처리해야할 데이터나 코드가 방대한 경우에는 확실히 이점이 있을 수 있다.



<br />

---

## Stream API



1. **걸러내기**
   * `filter(Predicate)` : `Predicate` 가 true 로 반환하는 요소만 새로운 스트림으로 생성한다.
2. **변경하기**
   * `map(Function)` : `Function` 의 반환값을 새로운 스트림으로 생성한다.
   * `flatMap(Fuction)` : 요소 안에 있는 객체를 `fatten` 시키고,  `Function` 의 반환값을 새로운 스트림으로 생성한다.

<br />

`flatmap` 설명

`List<List<Fruit>>` 형태의 콜렉션을 스트림에 넘긴다고 해보자.

여기서 `flatten` 작업이란 스트림으로 들어오는 리스트 들이 있는데 그 안에 들어있는 `Fruit` 들을 쭉 나열 시키는 것이다. `flatMap()` 안에는 list 마다의 list.stream() 을 인자로 넣어주면 된다.

```java
List<List<Fruit>> fruits = new ArrayList<>();
fruits.add(redFruits);
fruits.add(greenFruits);

fruits.stream().flatMap(list -> list.stream).for(fruit -> System.out.println(fruit.getName()));
// 아래처럼 쓸 수도 있다.
// fruits.stream().flatMap(Collection:stream()).for(fruit -> System.out.println(fruit.getName()));
```

<br />

3. 생성하기
   * `generate(Supplier)` : Supplier 가 반환한 것들을 스트림으로 생성한다.
   * `iterate(T seed, UnaryOperator)` : seed 를 `UnaryOperator` 에게 넘겨주고 그 반환값들로 스트림을 생성한다.
4. 제한하기
   * `limit(long)`
   * `skip(long)`

```java
Stream.iterate(10, i -> i+1)
                .skip(10)
                .limit(10)
                .forEach(System.out::println);
```

```shell
20
21
22
23
24
25
26
27
28
29
```



5. 스트림에 있는 데이터가 특정 조건을 만족하는지 확인
   * `anyMatch()`, `allMatch()`, `nonMatch()` 

```java
fruits.stream().anyMatch(fruit -> fruit.getName().contains("apple"));
```

fruits 리스트 안에 apple 이라는 fruit 객체가 담겨있으면 스트림을 종료하고 `true`를 반환한다. 리스트 마지막까지 그렇지 않다면 `false` 를 반환한다.

6. 개수세기

   * `count()`

7. 스트림 데이터를 하나로 뭉치기

   * `reduce(identity, BiFUnction)` : (identity, 콜렉션 안의 요소) 를 받아서 BiFunction 의 반환값을 indentity에 누적시키며 결국 identity를 반환시킨다.

     ```java
     Optional<Integer> reduce = Stream.iterate(0, i -> i + 1).limit(10) // 0, 1, 2, ..., 9
                     .reduce((t, i) -> t + i); // t에 누적합
     reduce.ifPresent(System.out::println); // 45
     ```

   * `collect()` : 데이터를 모아서 특정 콜렉션 타입으로 리턴해준다.

   * `sum()`

   * `max()`

