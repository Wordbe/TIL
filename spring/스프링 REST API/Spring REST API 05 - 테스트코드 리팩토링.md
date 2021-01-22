# Spring REST API 05 - 테스트코드 파라미터 리팩토링



`JUnitParam` 을 사용해서 테스트 코드에서 매개변수만 바꾸어 중복된 코드를 제거한다.



아래와 같이 3개의 테스트를 실행하는데, 값만 바꾸어 가면서 테스트하려한다. 하지만, 반복되는 코드가 길게 있으니 보기에 좋지 않다.

`JUnitParams` 로 아래 코드를 리팩토링해보자.

```java
@Test
public void testFree(int basePrice, int maxPrice, boolean isFree) {
  //------------------------------------------------
  // Given
  Event event = Event.builder()
    .basePrice(0)
    .maxPrice(0)
    .build();

  // When
  event.update();

  // Then
  assertThat(event.isFree()).isTrue();
  
  //------------------------------------------------
  // Given
  event = Event.builder()
    .basePrice(100)
    .maxPrice(0)
    .build();

  // When
  event.update();

  // Then
  assertThat(event.isFree()).isFalse();

  //------------------------------------------------
  // Given
  event = Event.builder()
    .basePrice(0)
    .maxPrice(100)
    .build();

  // When
  event.update();

  // Then
  assertThat(event.isFree()).isFalse();
}
```

<br />



JUnit5 를 사용한다면, `@ParamterizedTest` 어노테이션을 붙이면 된다.

`spring-boot-starter-test` 의존성을 등록하면 그 안에  `org.junit.jupiter:junit-jupiter-params`  를 포함하고 있어서 위 어노테이션을 사용할 수 있다.

```java
@ParameterizedTest
@CsvSource({
  "0, 0, true",
  "100, 0, false",
  "0, 100, false"
})
public void testFree(int basePrice, int maxPrice, boolean isFree) {
  // Given
  Event event = Event.builder()
    .basePrice(basePrice)
    .maxPrice(maxPrice)
    .build();

  // When
  event.update();

  // Then
  assertThat(event.isFree()).isEqualTo(isFree);
}
```

코드가 간단해진 것을 볼 수 있다.



>  JUnit4 라면 JUnitParams 를 사용할 수 있다. pom.xml 에 의존성을 추가한다.
>
> ```xml
> <!-- https://mvnrepository.com/artifact/pl.pragmatists/JUnitParams -->
> <dependency>
>   <groupId>pl.pragmatists</groupId>
>   <artifactId>JUnitParams</artifactId>
>   <version>1.1.1</version>
>   <scope>test</scope>
> </dependency>
> ```
>
> ```java
> @Test
> @Parameters({
>   "0, 0, true",
>   "100, 0, false",
>   "0, 100, false"
> })
> public void testFree(int basePrice, int maxPrice, boolean isFree) {
>   // Given
>   Event event = Event.builder()
>     .basePrice(basePrice)
>     .maxPrice(maxPrice)
>     .build();
> 
>   // When
>   event.update();
> 
>   // Then
>   assertThat(event.isFree()).isEqualTo(isFree);
> }
> ```







---

메소드를 이용해 좀 더  type-safe 한 테스트를 해보자.

```java
@ParameterizedTest
@MethodSource("paramsForTestFree")
public void testFree(int basePrice, int maxPrice, boolean isFree) {
  // Given
  Event event = Event.builder()
    .basePrice(basePrice)
    .maxPrice(maxPrice)
    .build();

  // When
  event.update();

  // Then
  assertThat(event.isFree()).isEqualTo(isFree);
}

private static Object[] paramsForTestFree() {
  return new Object[] {
    new Object[] {0, 0, true},
    new Object[] {100, 0, false},
    new Object[] {0, 100, false},
  };
}
```

static 메소드로 데이터 객체를 구현하고 `@MethodSource` 에 넣어주면 된다.



> `JUnit 4 `+ `JUnitParams`
>
> ```java
> @Test
> @Parameters("paramsForTestFree")
> ...
> ```







