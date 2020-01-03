# Spring JDBC

JDBC를 이용해서 프로그래밍을 하게 되면 반복적인 코드가 많이 발생하고,

이는 개발자의 생산성을 떨어뜨립니다.

이를 위해 Spring JDBC가 등장했습니다.



> JdbcTemplate
>
> RowMapper



---

### Spring JDBC에서 개발자가 할 일

| 동작                            | 스프링 | 어플리케이션 개발자 |
| ------------------------------- | ------ | ------------------- |
| 연결 파라미터 정의              |        | O                   |
| 연결 오픈                       | O      |                     |
| SQL문 지정                      |        | O                   |
| 파라미터 선언, 파라미터 값 제공 |        | O                   |
| statement 준비와 실행           | O      |                     |
| 결과를 반복하는 루프 설정       | O      |                     |
| 각 iteration에 대한 작업 수행   |        | O                   |
| 모든 예외 처리                  | O      |                     |
| 트랜잭션 제어                   | O      |                     |
| 연결, statement, resultset 닫기 | O      |                     |





---

### Spring JDBC 패키지

> org.springframework.jdbc.core : 콜백 인터페이스, jdbcTemplate 관련 Helper 객체 제공
>
> org.springframework.jdbc.datasource : DataSource를 쉽게 접근하기 위한 유틸 클래스, 트랜잭션매니저 및 다양한 datasource 구현체 제공
>
> org.springframework.jdbc.object : RDBMS 저장, 조회, 갱신 절차를 안전하고 재사용 가능한 객체로 표현하는 클래스 포함
>
> org.springframework.jdbc.support : core, object 를 사용하는 JDBC 프레임워크 지원.





---

### JdbcTemplate

* org.springframework.jdbc.core에서 가장 중요한 클래스
* 리소스 생성, 해지를 처리해서 연결을 닫는 것을 잊어 발생하는 문제 피할 수 있습니다.
* statement의 생성, 실행을 처리합니다.
* **SQL 조회, 갱신, 저장 절차의 호출, ResultSet 반복호출 등을 실행합니다.**
* JDBC 예외 발생 시 org.springframework.dao 패키지이에 정의되어 있는 일반적인 예외로 변환시킵니다.



**\# 예제**

1) 열의 수 구하기

```java
int rowCount = this.jdbcTemplate.queryForInt("select count(*) from t_actor");
```

