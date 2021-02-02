# Spring Data JPA 001 - ORM



### JPA

Java Persistence API (자바 영속성 애플리케이션 프로그래밍 인터페이스)

애플리케이션 개발시 SQL 코드에 잠식 당하는 것을 막고, 도메인 주도 개발(Domain Driven Development) 기반의 프로그래밍으로 비즈니스 로직을 구현하는데 집중할 수 있다. 덕분에 개발 생산성이 높아지고, DB에 독립적 프로그래밍이 가능하다. 타입-세이프한 쿼리 작성과 Persistent Context가 제공하는 캐시 기능으로 성능 최적화까지 할 수 있다.



## RDBMS 와 Java

JDBC 는 관계형 데이터베이스와 자바의 연결 고리이다. 데이터베이스는 자바 프로그램의 켜짐과 꺼짐에 상관없이 지속될 수 있는 데이터를 저장한다. 이를 영속화라고 한다. 



### JDBC 사용

Java DataBase Connectivity : 자바 프로그램에서 데이터베이스를 조작할 수 있도록 연결해준다.

DB 마다 jdbc 드라이버가 다르다. 여기서는 postgreSQL 데이터베이스를 사용한다. 의존성을 추가하자.

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version>42.2.18</version>
</dependency>
```

```java
public class Application {
    public static void main(String[] args) throws SQLException {
      
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String username = "postgres";
        String password = "1234";

        try (Connection connection = DriverManager.getConnection(url, username, password)) {
            System.out.println("Conection created: " + connection);

//            String sql = "CREATE TABLE account (id int, username varchar(255), password varchar(255))";
            String sql = "INSERT INTO account VALUES (1, 'joody', '1234');";
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.execute();
            }
        }
    }
}
```

기존 관계형데이터베이스를 조작하는 것은 중요하다. 그러나 몇가지 문제가 있다. 

1.  SQL을 실행하는 데 드는 자원 비용이 비싸다. DB에서 테이블을 만들고, 데이터를 불러와서 매핑하고 타입 변환하는 등의 과정이 번거롭다. 

   커넥션을 만드는 비용도 비싸다. 이를 관리하기 위해 커넥션 풀이라는 개념이 있고, 여러 DBCP가 있다. 스프링은 보통 커넥션 풀로 hikari 를 사용한다. 커넥션 풀에서 미리 커넥션을 만들어 놓고, 필요할 때마다 받아서 쓴다. 커넥션을 만드는 비용이 거의 들지 않는다. 

2.  여러가지 DB 가 있으므로 각각 SQL 언어가 다르다. 
3. 스키마를 바꾸면 바꾸어야 할 코드가 너무 많아진다.
4. 반복적으로 작성해야 하는 코드도 많다. 
5. 언제 필요할 지 모르는 데이터를 불안하니 미리 읽어와야 하는 등의 문제가 있다. 특히 연관관계가 복잡하고 많은 쿼리에서 지연 로딩 등을 구사하기 쉽지 않다. 할 순 있지만, 좀 더 편리한 툴이 필요하다.



<br />

---

## ORM

위에서 JDBC 예제를 다루어 보았는데, 비즈니스 로직과 관계 없는 깔끔하지 않은 코드드들이 많이 보인다. 도메인 모델을 사용하면 좀 더 간편하면서도 같은 기능을 할 수 있는 코딩을 할 수 있다.

```java
Account account = new Account("joody", "1234");
accountRepository.save(account);
```

도메인 모델을 사용하면, 객체지향 프로그래밍으로 데이터를 제어할 수 있다. 다양한 디자인 패턴을 적용하는 것이 쉽고, 코드의 재사용성도 증가하게 된다. 비즈니스 로직이 구현하기 편해지고, 테스트 코드도 짜기 쉬워진다.



ORM 이란 Object Relation Mapping 의 약자이다. 애플리케이션의 클래스와 데이터베이스의 테이블 사이의 매핑 정보를 기술한 메타데이터를 사용해서 자바 어플리케이션 객체를 SQL DB의 테이블에 자동으로, 깨끗하게(transparent) 영속화 해주는 기술이다. 

여기서 매핑 정보란 (애플리케이션 : 데이터베이스)의 관계에 해당하는 것으로  (클래스 : 테이블), (필드 : 칼럼) 등을 말한다. 이 매핑에 관한 코딩(jdbc, sql)을 자동으로 해주고, 비즈니스 로직 외 필요했던 코딩을 최소한으로 깔끔하게 만들어준다.



JPA 는 ORM 을 위한 인터페이스이고,Hibernate 는 JPA 인터페이스의 구현체이다. Hibernate 과 같은 ORM 을 사용하면 여러 장점이 있다.

1. 생산성이 좋아진다. 
2. 코드가 간결해진다. 따라서 유지보수성이 좋아진다. 
3. 테이블과 객체 사이에 캐시가 존재한다. 캐시와 변경사항을 비교하여 꼭 필요한 경우에만 DB 쿼리를 실행시킨다. 이런 관점에서 성능이 좋아진다. 이 외에 성능 최적화를 위한 방법을 제공해준다.
4. MySQL, PostgreSQL 등 서로 다른 sql 벤더가 많은데, Hibernate 는 벤더 독립적이다. Dialect 만 설정해주면 소스코드를 고치지 않아도 벤더에 맞는 쿼리로 바꾸어준다.

하지만 단점도 있다. SQL 에 대한 지식 뿐만 아니라, Hibernate, JPA 의 방대한 지식을 학습해야 한다. 사용하려는 사람은 이를 극복해야 한다.



<br />

---

### ORM: 객체와 릴레이션의 패러다임 불일치

객체를 릴레이션에 매핑할 때 문제들이 발생한다. ORM 은 이에 대한 해결책을 제시한다.



#### 밀도(Granularity)

* 객체 : 다양한 크기의 객체를 만들 수 있고, 커스텀 타입을 만들기 쉽다.
* 릴레이션 : 테이블이 있고, 기본 데이터 타입이있다. 그 외의 타입을 만들 때 사용자 정의 타입을 만들 수는 있지만 UDT (User-defined Type) 은 표준 자체도 잘 정의되어 있지 않고, 벤더 간 호환이 잘 안되기 때문에 잘 사용하지 않는다.



#### 서브타입(Subtype)

* 객체 : 상속 구조를 만들고, 다형성을 지원한다.
* 릴레이션 : 테이블은 상속이 없다. 표준 기술 중 상속을 구현한 것이 없다. 다형성을 지원하지 않는다. ORM은 다형성을 지원한다.



#### 식별성(Identity)

* 객체 : 레퍼런스 동일성으로 `==` ,  인스턴스 동일성으로 `equals()`(권장) 를 사용한다.
* 릴레이션 : 주키 (primary key) 를 확인한다.



#### 관계(Association)

* 객체 : 객체 안의 참조(reference)된 다른 객체로 관계를 표현하고, 방향이 존재한다. N:N 관계를 가질 수 있다.
* 릴레이션 : 외래키(foreign key)로 관계를 표현한다. 외래키는 방향이 없다. 또는 양방향이다. 1:1 또는 1:N 관계이다. N:N 관계는 없다. N:N 관계는 Join 테이블 또는 링크 테이블을 사용해서 2개의 1:N 관계로 풀어낸다.



#### 데이터 네비게이션(Navigation)

* 객체 : 레퍼런스를 이용해서 다른 객체로 이동이 가능하다. 콜렉션을 순회할 수 있다.
* 릴레이션 : 데이터베이스에서 쿼리 수가 적을 수록 성능이 좋다. 따라서 join을 이용해서 한 번에 쿼리를 실행하려고 하지만, 너무 많은 Join 도 성능에 문제를 준다. lazy loading (필요할 때마다 불러오는 것) 을 하자니 n+1 select 문제가 발생한다.



