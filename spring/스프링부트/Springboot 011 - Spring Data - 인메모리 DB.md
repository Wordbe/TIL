# Springboot 011 - Spring Data - 인메모리 DB





스프링이 지원하는 인메모리 데이터베이스는 H2, HSQL, Derby가 있다. 

Spring JDBC (Java DataBase Connectivity) 가 클래스패스에 있으면 DB와 자바를 연결해주는 빈 클래스를 자동 설정해준다. 이렇게 H2, JDBC가 의존성에만 적혀있다면 스프링부트는 기본적으로 H2 인메모리 데이터베이스를 자동설정해준다.



DataSourceProperties 에 DB 정보가 들어있다. shift 를 두 번 누르고 찾아가 보자.

기본적으로 인메모리 데이터베이스 설정은 URL="testdb", username="sa", password="" 로 되어있다.



앱 러너로 간단한 DB 테이블 생성, insert 를 확인해보자.

 ```java
@Component
public class AppRunner implements ApplicationRunner {

    Logger logger = LoggerFactory.getLogger(AppRunner.class);

    @Autowired
    DataSource dataSource;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
      	// datasource 로 데이터베이스 연결
        try ( Connection connection = dataSource.getConnection() ) {
            logger.info(connection.getMetaData().getURL());
            logger.info(connection.getMetaData().getUserName());

            Statement statement = connection.createStatement();
            String sql = "CREATE TABLE USER(id INTEGER NOT NULL, name VARCHAR(255), PRIMARY KEY (id))";
            statement.executeUpdate(sql);
          	
          	// jdbcTemplate 도 사용할 수 있다.
	          jdbcTemplate.execute("INSERT INTO user VALUES (1, 'Apple')");
        }


    }
}
 ```



H2 콘솔을 사용하는 방법은 application.properties 에 아래 설정을 해주면 된다.

```shell
spring.h2.console.enabled=true
```

또는 spring-boot-devtools 를 사용한다면 위처럼 자동 설정되게 된다.

url에 localhost:8080/h2-console 로 접속할 수 있다.





































