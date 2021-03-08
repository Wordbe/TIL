# Java 8 005 - Date, Time





## Date, Time API

<br />

### 자바 8에서 새로운 날짜와 시간 API가 생긴 이유

1. `java.util.Date` 클래스는 mutable 하지 않기 때문에 thread-safe 하지 않다.
2. 클래스 이름이 명확하지 않다. (`Date` 는 날짜를 의미하는 것 같지만, 안에 시간도 포함된다.)
3. 버그가 발생할 여지가 많다. (Type-safe 하지 않고, month 는 0부터 시작하도록 되어 개발자에게 혼동을 준다.)
4. 날짜 시간 처리가 복잡한 애플리케이션은 보통 `Joda Time` 라이브러리를 사용했다.

<br />

java 에서 기존에 시간을 다룰 수 있는 기능을 제공했던 객체는 아래와 같다.

```java
Date date = new Date();
GregorianCalendar gregorianCalendar = new GregorianCalendar();
SimpleDateFormat simpleDateFormat = new SimpleDateFormat();
```

<br />

 `Date` 의 문제점을 보자.

```java
public static void main(String[] args) throws InterruptedException {
  Date date = new Date();
  long time = date.getTime();
  System.out.println(date);
  System.out.println(time);

  // 3초가 흐른다.
  Thread.sleep(3000l);

  Date date1 = new Date();
  System.out.println(date1); // Sun Mar 07 20:46:38 KST 2021
  date1.setTime(time);
  System.out.println(date1); // Sun Mar 07 20:46:35 KST 2021
}
```

* `getTime()` 은 1970년 1월 1일 00:00:00 시간(UNIX 에서 최초로 컴퓨터에 시간을 도입한 날짜, 이폭)을 기준으로 현재까지 경과한 시간을 반납한다. 리턴타입이 `long` 임을 확인하자.

* `Date` 은 mutable 하다. 즉, 특정 필드의 상태값을 바꿀 수 있다. 위 상황은 3초 전의 상황으로 시간을 바꾼 것이다. mutable 객체는 멀티쓰레드 상황에서 동일한 인스턴스의 상태값이 바뀌므로 thread-safe 하지 않다.
* 버그가 발생할 여지가 많다. 타입 안정적이지 않고, 월이 0부터 시작해서 혼란을 일으킨다. month 자리에 -10 등이 막 들어갈 수 있다.

```java
GregorianCalendar gregorianCalendar = new GregorianCalendar(2000, Calendar.JANUARY, 1);
```

따라서 month 는 `Calendar` 에서 상수를 받아와서 사용하는 게 좋다.

<br />

### Date-Time API (JAVA 8)

1. JSR-310 스팩의 구현체를 사용한다.
2. 디자인 철학은 아래와 같다.

* **Clear** : 변수명과 사용자가 생각하는 개념이 잘 맞아야 한다. (date에서 time을 가져오면 안되고, time 도 우리가 아는 시간을 반환하면 좋다.)
* **Fluent** : 코드를 읽기 쉽게 만든다. 체이닝 기법 등으로.
* **Immutable** : 멀티쓰레드-세이프 하도록 값 변경시 기존 상태를 변경하는 것이 아니라, 바뀐 값을 가진 새 인스턴스를 반환한다.
* **Extensible** : 그레고리안 달력 외에 다른 달력 시스템(불교 달력 등)과 확장이 가능하다. `java.time.chrono.` 에서 가져올 수 있다.

<br />

### 주요 API

* 사람용 시간(human time) API 와 기계용 시간(machine time) API 로 나눌 수 있다.

* 기계용 시간은 EPOCK(UTC 기준시 1970-01-01 00:00:00)으로부터 현재까지의 타임스탬프를 표현한다. 기계가 시간 계산 등에 유리하다.

  > * 타임스탬프는 instant 를 사용한다.
  > * `Instant.EPOCH` 으로 Instant 타입의 EPOCH 을 가져올 수 있다.

* 사람용 시간은 우리가 흔히 사용하는 연,월,일,시,분,초로 표현한다.

* 특정 날짜 (`LocalDate`), 시간 (`LocalTime`), 일시 (`LocalDateTime`) 를 사용할 수 있다.

* 기간을 표현할 때는 시간 기반 `Duration` 과 날짜 기반 `Period` 를 사용할 수 있다.

* `DateTimeFormatter` 를 사용해서 일시를 특정한 문자열로 포매팅할 수 있다.



<br />

---

## Date, Time API



**지금을 기계시간으로 표현**

* `Instant.now()` : 현재 UTC 를 반환한다.
* UTC(Universal Time Coordinated) 는 GMP(Greenwich Mean Time) 과 같다.

```java
Instant instant = Instant.now();
System.out.println(instant); // 기준시 UTC = GMP
System.out.println(instant.atZone(ZoneId.of("UTC"))); // 기준시 UTC = GMP
// 2021-03-08T14:52:43.842229Z
// 2021-03-08T14:52:43.842229Z[UTC]

ZoneId zoneId = ZoneId.systemDefault(); // 내 컴퓨터의 zone
System.out.println(zoneId); 
ZonedDateTime zonedDateTime = instant.atZone(zoneId); 
System.out.println(zonedDateTime);
// Asia/Seoul
// 2021-03-08T23:52:43.842229+09:00[Asia/Seoul]
```

<br />

**사람용 일시 표현**

* `LocalDateTime.now()` : 현재 시스템 Zone 에 해당하는 (로컬) 일시를 리턴한다.
* `LocalDateTime.of(int, Month, int, int, int, int)` : 로컬의 특정 일시를 리턴한다.
* `ZonedDateTime.of(int, Month, int, int, int, int, ZonedId)` : 특정 Zone 의 특정 일시를 리턴한다.

```java
// local 컴퓨터의 zone 에 해당하는 시간을 반환
LocalDateTime now = LocalDateTime.now();
System.out.println(now);
// 2021-03-09T00:00:45.114564

LocalDateTime today = LocalDateTime.of(2021, Month.MARCH, 8, 0, 0, 0); // 시간 생성 가능

ZonedDateTime noInKorea = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
System.out.println(noInKorea);
// 2021-03-09T00:00:45.115725+09:00[Asia/Seoul]

// Instant 를 zonedDateTime 으로 쉽게 바꿀 수 있음
Instant nowInstant = Instant.now();
ZonedDateTime zonedDateTime = nowInstant.atZone(ZoneId.of("Asia/Seoul"));
System.out.println(zonedDateTime);
// 2021-03-09T00:00:45.115810+09:00[Asia/Seoul]

// zonedDateTime 을 Instant 로 쉽게 바꿀 수 있음
Instant instant = zonedDateTime.toInstant(); 
System.out.println(instant);
// 2021-03-08T15:00:45.115810Z
```

<br />

**기간을 표현하는 방법**

* `Period` / `Duration` `.between()`

```java
LocalDate today = LocalDate.now();
LocalDate future = LocalDate.of(2021, Month.APRIL, 5);

// Human Time
// 오늘과 미래 사이 날짜를 구하는 방법
Period period = Period.between(today, future);
System.out.println(period.getDays());

// 오늘과 미래 사이 날짜를 구하는 방법 2
Period until = today.until(future);
System.out.println(until.get(ChronoUnit.DAYS));

// 결과는 27로 같음 (2021-03-09 --> 2021-04-05) 식목일까지 27일 남았네.
// 참고로 둘 다 딱 day 수 차이만 반환한다. 예를 들어 3월9일과 12월25일까지 차이를 구하면 16이 나온다.
```

```java
Instant now = Instant.now();
Instant plus = now.plus(10, ChronoUnit.SECONDS);

// Machine Time
Duration between = Duration.between(now, plus);
System.out.println(between.getSeconds()); // 10
```

<br />

**파싱 또는 포매팅**

* 미리 정의해 둔 포맷을 사용한다.
* 포매팅 : `LocalDateTime.format(DateTimeFormatter)`
* 파싱 : `LocalDateTime.parse(String, DateTimeFormatter)`

```java
LocalDateTime now = LocalDateTime.now();
DateTimeFormatter MMddyyyy = DateTimeFormatter.ofPattern("MM/dd/yyyy");

System.out.println(now); // 2021-03-09T00:45:31.646002
System.out.println(now.format(MMddyyyy)); // 03/09/2021

LocalDate parse = LocalDate.parse("08/15/1998", MMddyyyy);
System.out.println(parse); // 1998-08-15
```

<br />

**java 8 API 는 레거시 API 를 지원한다.**

```java
// 기존 Date 와 Instant 상호변환
Date date = new Date();
Instant instant = date.toInstant();
Date from = Date.from(instant);

// 기존 GregorianCalendar 와 ZonedDateTime 상호변환
GregorianCalendar gregorianCalendar = new GregorianCalendar();
ZonedDateTime dateTime = gregorianCalendar.toInstant().atZone(ZoneId.systemDefault());
GregorianCalendar from1 = GregorianCalendar.from(dateTime);

// 기존 TimeZone 과 ZonedId 상호변환 가능
ZoneId zoneId = TimeZone.getTimeZone("PST").toZoneId();
TimeZone timeZone = TimeZone.getTimeZone(zoneId);
```

