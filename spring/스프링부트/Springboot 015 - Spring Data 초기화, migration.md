# Springboot 015 - Spring Data 초기화, migration





## 초기화



<br />

### JPA로 DB 초기화

application.properties

```shell
spring.jpa.hibernate.ddl-auto=update
```

* update : 자동으로 DB schema(테이블, 칼럼 등)가 생성된다. 기존에 것은 냅두고, 새로운 스키마를 추가해준다.
* create : 이미 있던 스키마를 제거하고 새로 스키마 생성한다. 안에 있던 데이터도 삭제된다.
* create-drop : 자동 스키마 생성하고 종료할 때 삭제한다.

```shell
spring.jpa.generate-ddl=true
```

이 옵션도 추가해야 스키마가 생성된다.



운영용 환경에서는 아래와 같이 사용하면 객체가 엔터티와 잘 매핑이 되어있는 지 검증하는데 유용하다.

```shell
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.generate-ddl=false
```



<br />

---

### SQL 스크립트로 DB 초기화



application.properties

```shell
spring.jpa.show-sql=true
```

위와 같이 설정한 후 테스트 코드를 실행하면, 사용한 DDL 스크립트가 나온다.

이를 복사해서 `schema.sql` 파일에 저장하면 springboot 는 이 파일을 읽어 데이터베이스를 초기화한다.



/resources/schema.sql

```sql
drop table if exists food CASCADE
drop sequence if exists hibernate_sequence
create sequence hibernate_sequence start with 1 increment by 1
create table food (id bigint not null, category varchar(255), name varchar(255), primary key (id))
```



<br />



또한, schema-${platform}.sql 로 파일을 만들면, 데이터베이스 종류에 따라 다른 초기화설정을 할 수 있다.



application.properties

```shell
spring.datasource.platform=postgres
```

위와 같이 설정한 후 `schema-postgres.sql` 파일을 만들고 그 안에 SQL을 넣으면 된다.





<br />

---

## Migration



데이터베이스 마이그레이션이란, 데이터베이스의 데이터 뿐 아니라, 모든 테이블, 스키마, 규칙을 다른 곳으로 이관하는 것을 말한다.

Spring과 연동되어 마이그레이션을 지원하는 플러그인으로 Flyway, Liquibase 등이 있다.

DB 에서 일어나는 변경을 sql 파일로 변경 관리할 수 있다.



<br />

Flyway 로 실습을 해보자. flyway 는 sql 파일을 사용한다.

<br />

먼저 의존성을 추가한다.

**pom.xml**

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-maven-plugin</artifactId>
  <version>7.1.1</version>
</dependency>
```



예전 실습에서 postgres 에 이미 테이블을 만들어 놓았으니, DB 를 초기화 하자. 도커 이미지를 삭제하는 방법이 쉽고 빠르다.

```shell
$ docker stop springboot-postgres
$ docker rm springboot-postgres
```



그리고 다시 이미지를 불러와, 컨테이너를 실행시켜준다.

```shell
$ docker run -p 5432:5432 -e POSTGRES_PASSWORD=1234 -e POSTGRES_USER=wordbe -e POSTGRES_DB=springboot --name springboot-postgres -d postgres
$ docker exec -it springboot-postgres bash
```

<br />

<br />

이제 스프링부트 설정을 하자.

스프링부트에서 마이그레션 디렉토리는 `db/migration`, `db/migration/{vendor} `이다. 

vender는 mysql, postgreSQL 등 db 종류이다.

<br />

/resources/db/migration 에 아래 파일을 생성한다.

마이그레션 파일 이름은 `V숫자__이름.sql` 형식을 따르도록 한다. V는 대문자, 숫자는 순차적으로, 숫자와 이름 사이 언더바 2개, 이름은 서술형태로 적어주면 된다. 나중에 버전 로그로 자세하게 남는다.

**V1__init.sql**

```sql
drop table if exists food;
drop sequence if exists hibernate_sequence;
create sequence hibernate_sequence start with 1 increment by 1;
create table food (id bigint not null, category varchar(255), name varchar(255), primary key (id));
```

스프링부트 애플리케이션을 실행시키면, 테이블과 칼럼들이 생기면서 flyway_schema_history 에 업데이트 된 버전과 내용이 기록된다.



<br />

이제 칼럼 하나를 추가해보자.

```java
@Getter @Setter @EqualsAndHashCode
@Entity
public class Food {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String category;

    private String color;
}
```

color 필드 (칼럼)을 추가했다.

<br />

**V2__addColumn_color.sql**

```sql
alter table if exists food add column color varchar(255);
```



flyway_schema_history 중에서 version 을 보자.

`V1__init.sql` 과 `V2__addColumn_color.sql `이 모두 반영되어 기록된 것을 볼 수 있다.









