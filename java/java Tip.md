# java Tip



StringBuilder 를 사용하여 스트링을 이어붙이면 빠르다.



---

스트링 형변환 (int to String)

* String.valueOf(number)
* "" + number
* Integer.toString(number)

https://stackoverflow.com/questions/5071040/java-convert-integer-to-string



---

BigInteger : long 보다 더 큰 정수형을 표현

BigDecimal : double 보다 더 큰 실수형 표현





---

## enum

자바 Enum

* 열거체 비교시 값과 타입까지 체크한다.
* 열거체 상수값이 재정의되어도 다시 컴파일 할 필요가 없다.

```java
enum Color {
  RED("빨강"), 
  ORANGE("주황"), 
  YELLOW("노랑")
    
  private final String name;
  Color(String name) {
    this.name = name;
  }
  public String getName() {
    return name;
  }
}
```

```java
Colors[] colors = Colors.values(); // 열거체의 모든 상수를 저장한 배열을 반환
Color color = Colors.valueOf("ORANGE"); // 전달된 문자열과 일치하는 열거체 상수를 반환
Colors.YELLOW.ordinal(); // 해당 열거체 상수가 열거체 정의에서 정의된 순서(0부터 시작)를 반환
```



