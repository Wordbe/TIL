# Springboot 014 - Spring Data JPA



> **ORM** (Object Relational Mapping)
>
> 자바 코드는 객체 지향 프로그래밍인데 이를 릴레이션과 매핑할 때 개념적으로 불일치가 일어난다. 
>
> 예를들면 객체의 다양한 크기들을 데이터 테이블에 어떻게 매핑을 시킬 수 있는가? 객체는 상속이 있지만, 테이블은 상속이 없는데 어떻게 매핑 할 것인가? Identity 는 객체의 경우 해쉬코드, equals method 를 통해 알지만, 테이블의 경우 인덱스 컬럼이 있다. 서로 다른 Object 와 Relation은 어떻게 일치시키는가? 에 관한 문제가 있다.
>
> ORM 은 이를 해결하기 위한 프레임워크고, 자바 (EE) ORM 표준으로 JPA 가 있다.

스프링 데이터 JPA는 위에서 말한 JPA를 스프링 데이터 기반으로 추상화 시켜놓은 것이다. 그 구현체로 hibernate를 사용한다.

스프링 데이터 JPA는 Repository를 빈으로 자동 등록하며, 쿼리 메소드를 자동으로 구현한다. `@EnableJpaRepositories` 를 어노테이션으로 붙이면 스프링부트가 자동으로 설정해준다. 

* 추상화 : 스프링 데이터 JPA → JPA → Hibernate → Datasource





---

## JPA test 예제



SDJ를 사용해보자.

JPA 의존성을 추가한다.

pom.xml

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```







Entity (릴레이션, 테이블) 을 클래스에 매핑하자.

```java
@Getter @Setter @EqualsAndHashCode
@Entity
public class Food {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String category;
}

```



lombok 의 `@EqulasAndHashCode` 는 아래의 코드를 만들어준다. 

```java
@Override
public boolean equals(Object o) {
  if (this == o) return true;
  if (o == null || getClass() != o.getClass()) return false;
  Food food = (Food) o;
  return Objects.equals(id, food.id) && Objects.equals(name, food.name) && Objects.equals(category, food.category);
}

@Override
public int hashCode() {
  return Objects.hash(id, name, category);
}
```



레포지토리를 만들어준다. DAO 와 비슷하다.

```java
public interface FoodRepository extends JpaRepository<Food, Long> {
}

```



<br />

슬라이싱 테스트를 위해서는 인메모리 DB 를 사용하면 편리하다.

테스트용 DB를 따로 만들지 않아도 되고, 메모리 위에서 작동하니 빠르게 실행된다.



따라서 test 스코프로 h2 DB 의존성을 추가하자.

pom.xml

```xml
<dependency>
  <groupId>com.h2database</groupId>
  <artifactId>h2</artifactId>
  <scope>test</scope>
</dependency>
```



일단 올바르게 동작하는지 확인해보자. 로거로 URL, 드라이버이름, 사용자이름도 찍어본다.

`@DataJpaTest` 는 슬라이싱테스트를 지원해준다.

`@SpringBootTest` 는 모든 빈들을 다 검사하는 통합테스트이므로, 슬라이싱테스트가 효율적이다.

```java
@DataJpaTest
class FoodRepositoryTest {

    Logger logger = LoggerFactory.getLogger(FoodRepositoryTest.class);

    @Autowired
    DataSource dataSource;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    FoodRepository foodRepository;

    @Test
    public void testFood() throws SQLException {
        try (Connection connection =  dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            logger.info(metaData.getURL());
            logger.info(metaData.getDriverName());
            logger.info(metaData.getUserName());
        }
    }
}
```







<br />

잘 작동하면 데이터를 삽입(save)하고, 조회(find)하여 올바른지 확인해보자.

```java
...
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class FoodRepositoryTest {

    @Autowired
    DataSource dataSource;

    @Autowired
    FoodRepository foodRepository;

    @Test
    public void testFood() throws SQLException {
        Food food1 = new Food();
        food1.setName("strawberry");
        food1.setCategory("fruit");

      	// INSERT
        Food food = foodRepository.save(food1);
        assertThat(food).isNotNull();
      
      	// SELECT
        Optional<Food> foodName = foodRepository.findByName(food.getName());
        assertThat(foodName).isNotEmpty();
      
      	// SELECT
        Optional<Food> nonExistingFoodName = foodRepository.findByName("apple");
        assertThat(nonExistingFoodName).isEmpty();
    }
}
```

```java
public interface FoodRepository extends JpaRepository<Food, Long> {
    Optional<Food> findByName(String name);
}

```

레포지토리에 새로운 메소드를 정의해서 사용해보자. 이름으로 객체를 찾는다. 없으면 null을 반환한다.

























