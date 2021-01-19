# Springboot 013 - Spring Data - PostgreSQL





PostgreSQL 은 무료 오픈소스 DBMS 이다. 스프링 데이터와 연동하는 법을 알아보자.



우선 의존성에 포스트그레스큐엘을 추가한다.

pom.xml

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
</dependency>
```

<br />



그리고 스프링 데이터소스에 DB 서버와 데이터베이스를 연동시켜주고, 접속 아이디와 비밀번호를 알려주자.

application.properties

```shell
spring.datasource.url=jdbc:postgresql://localhost:5432/springboot
spring.datasource.username=wordbe
spring.datasource.password=1234
```



이제 postgreSQL 을 도커에서 실행시켜보자.

```shell
$ docker run -p 5432:5432 -e POSTGRES_PASSWORD=1234 -e POSTGRES_USER=wordbe -e POSTGRES_DB=springboot --name springboot-postgres -d postgres
```

이렇게하면 postgres 이미지가 만약 없어도 `docker pull posgres` 를 자동으로 하여 이미지를 다운받고, 이미지를 실행시킨다.

로컬의 5432 포트와 도커 안의 postgres 포트를 5432로 연결시키고, 관리자 비밀번호를 1234로 설정한다.

DB 의 새로운 유저 아이디와 비밀번호를 설정하고, 이미지 이름은 springboot-postgres 로 설정한다.



도커 컨테이너를 실행시킨다.

```shell
$ docker exec -i -t springboot-postgres bash
```



postgreSQL 은 MySQL, oracle 등과 명령어가 조금 다르다.

```shell
# 관리자권한으로 DB postgreSQL 접속
/# su - postgres

# DB 에 로그인
# psql springboot -U wordbe -W 도 가능
$ psql springboot --username wordbe --password
Password: 1234

# 데이터베이스 조회
-# \list

# 테이블 조회
-# \dt

# 쿼리
-# SELECT * FROM food;
```



자바 코드를 실행하여, 테이블을 생성하고 데이터를 추가해보자.

```java
@Component
public class AppRunner implements ApplicationRunner {

    Logger logger = LoggerFactory.getLogger(AppRunner.class);

    @Autowired
    DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try ( Connection connection = dataSource.getConnection() ) {
            logger.info(String.valueOf(dataSource.getClass()));
            logger.info(connection.getMetaData().getDriverName());
            logger.info(connection.getMetaData().getURL());
            logger.info(connection.getMetaData().getUserName());

            Statement statement = connection.createStatement();
            String sql = "CREATE TABLE food(id INTEGER NOT NULL, name VARCHAR(255), PRIMARY KEY (id))";
            statement.executeUpdate(sql);
            statement.executeUpdate("INSERT INTO food VALUES (1, 'Apple')");
        }
    }
}

```





























