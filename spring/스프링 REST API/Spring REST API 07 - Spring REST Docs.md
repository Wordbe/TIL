Spring REST API 07 - Spring REST Docs



### Test DB 설정



PostgreSQL 드라이버 의존성을 추가한다.

pom.xml

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

<br />

그리고 로컬(또는 DB 서버)에서 도커를 사용하여 PostgreSQL 컨테이너를 띄우고, 실행하자.

```shell
$ docker run --name eventdb -p 5432:5432 -e POSTGRES_PASSWORD=1234 -d postgres
$ docker exec -it eventdb bash
```

<br />

PostgreSQL 접속

```shell
# PostgreSQL 접속
/# su - postgres

# 관리자로 접속
$ psql -d postgres

# 유저 + 패스워드로 접속
$ psql -U postgres -W
Password:

# 테이블 확인
postgres=# \dt
```

<br />



이제 스프링으로 넘어와서, application.properties 에 속성을 추가한다.

데이터소스를 postgreSQL로 변경하자.

```shell
spring.datasource.username=postgres
spring.datasource.password=1234
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.driver-class-name=org.postgresql.Driver
```

<br />

하이버네이트를 설정하고, 실행된 쿼리들이 콘솔에 나오도록 환경설정을 바꾸어보자.

```shell
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
spring.jpa.properties.hibernate.format_sql=true

logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

<br />



`/test/resources/application.properties` 를 만들고 똑같이 적용해준다.

그리고 인텔리제이 > Project Structure 에서 테스트 리소스를 위에 만든 리소스폴더로 경로를 잡아주면 된다.

컴파일 > 테스트로 리소스 복사 > 테스트 컴파일 > 테스트 리소스 복사(덮어씌움) 과정을 거치므로,

소스 메인에서 등록한 `application.properties` 에 있었던 내용이 사라질 수 있다.

따라서 `application-test.properties` 라는 파일명으로 이름을 변경해보자. 이 속성에서는 테스트에서만 사용될 환경을 구성하는 것이 되고, 소스 메인에 있던 application.properties는 소스, 테스트 전체적으로 공동사용하는 속성을 만들게 된다.

```shell
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver

spring.datasource.hikari.jdbc-url=jdbc:h2:mem:testdb
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```







단 `application-test` 는 스프링부트 테스트가 읽어올 수 없으므로, 프로파일을 설정한다.

```java
@SpringBootTest
...
@ActiveProfiles("test")
public class EventControllerTest { ...
```



이제 테스트를 실행시키면, 테스트환경에서는 h2 데이터베이스를 쓰게되고, application.properties 에 설정해 놓았던, 로깅 설정도 공통으로 잘 적용될 것이다.

















