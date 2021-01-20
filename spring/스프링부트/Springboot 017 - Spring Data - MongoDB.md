# Springboot 017 - Spring Data - MongoDB





MongoDB 는 json 기반의 다큐먼트 데이터베이스이다.

스프링부트와 연동하여 사용하는 방법을 알아보자.



### 의존성을 추가한다.

**pom.xml**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

<br />



### MongoDB 설치, 실행

docker 를 통해 mongodb를 설치하고 실행한다.

```shell
$ docker run -p 27017:27017 --name springboot-mongodb -d mongo
```

스프링부트가 localhost:27017 에 기본으로 mongodb 서버를 연동한다. 따라서 로컬 db 27017:도커 db 27017 를 연결해준다.

mongo 데몬을 실행시킨다.



몽고 도커 컨테이너를 실행시키고, 몽고디비를 실행시키자.

```shell
$ docker exec -it springboot-mongodb bash
/# mongo
>
```

```shell
> db
test

> use test
switched to db test
```





<br />

### 테스트

이제 애플리케이션 러너로 몽고디비에 데이터를 넣어보자.



일단 food 객체를 만들어주자

```java
@Getter @Setter
@Document(collection = "foods")
public class Food {

    @Id
    String id;

    String name;

    String color;
}

```

다큐먼트 기반인 몽고디비는 `@Document` 어노테이션에 collection 에 객체(key) 이름을 지어주면 된다.





#### **템플릿 사용**

```java
@SpringBootApplication
public class SpringgothreeApplication {

    @Autowired
    MongoTemplate mongoTemplate;
    
    public static void main(String[] args) {
        SpringApplication.run(SpringgothreeApplication.class, args);
    }

    @Bean
    public ApplicationRunner applicationRunner() {
        return args -> {
            Food food = new Food();
            food.setName("apple");
            food.setColor("red");

            mongoTemplate.insert(food);
            System.out.println(food);
        };
    }
}
```



몽고디비에서 확인해보자.

```shell
> db.foods.find({})
{ "_id" : ObjectId("60077e866f01e07e374ee5d3"), "name" : "apple", "color" : "red", "_class" : "co.wordbe.springgothree.food.Food" }
```





<br />

#### **레포지토리 사용**

```java
public interface FoodRepository extends MongoRepository<Food, String> {
}

```



```java
@SpringBootApplication
public class SpringgothreeApplication {

    @Autowired
    FoodRepository foodRepository;

    public static void main(String[] args) {
        SpringApplication.run(SpringgothreeApplication.class, args);
    }

    @Bean
    public ApplicationRunner applicationRunner() {
        return args -> {
            Food food = new Food();
            food.setName("strawberry");
            food.setColor("red");
            foodRepository.insert(food);

            System.out.println(food);
        };
    }
}
```



몽고 DB에 insert가 잘 되었는지 확인해보자.

```shell
> db.foods.find({})
{ "_id" : ObjectId("60077e713b05c92c60150336"), "name" : "strawberry", "color" : "red", "_class" : "co.wordbe.springgothree.food.Food" }
{ "_id" : ObjectId("60077e866f01e07e374ee5d3"), "name" : "apple", "color" : "red", "_class" : "co.wordbe.springgothree.food.Food" }
```



<br />

#### 테스트코드 (내장형 몽고DB)

테스트용으로 내장형 몽고DB 를 사용할 수 있다. 아래 의존성을 추가한다.

pom.xml

```xml
<dependency>
  <groupId>de.flapdoodle.embed</groupId>
  <artifactId>de.flapdoodle.embed.mongo</artifactId>
</dependency>
```



슬라이싱 테스트가 가능하다.

```java
...
import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class FoodRepositoryTest {

    @Autowired
    FoodRepository foodRepository;

    @Test
    public void findByName() {
        Food food = new Food();
        food.setName("grape");
        food.setColor("purple");

        foodRepository.save(food);
        Optional<Food> byId = foodRepository.findById(food.getId());
        assertThat(byId).isNotEmpty();
        assertThat(byId.get().getName()).isEqualTo("grape");
    }
}
```



내장 test 용 db 이기 때문에, 실제 mongdb 서버에 영향을 주지 않는다.

테스트 실행 시 `save` 메소드로 새로운 food 객체를 집어넣었는데 실제 mongodb에는 반영되지 않은 것을 볼 수 있다.









