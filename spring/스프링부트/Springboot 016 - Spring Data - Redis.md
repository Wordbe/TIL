# Springboot 016 - Spring Data - Redis



RDB 가 아닌 NoSQL 과 스프링 데이터를 연동해보자.



1) Redis 를 연동하기 위해 의존성을 추가해준다.

**pom.xml**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```



2) 로컬에 Redis 서버를 띄우기 위해 도커를 사용한다.

```shell
$ docker run -p 6379:6379 --name springboot-redis -d redis
```

Redis 는 6379가 기본포트이고, 로컬의 6379 포트와 도커 안 6379 포트를 연결해준다.

<br />

3) 도커 컨테이너를 실행시킨다.

```shell
$ docker exec -it springboot-redis redis-cli
```



4) 자바에서 템플릿으로는 `StringRedisTemplate` 또는 `RedisTemplate` 을 사용한다.

ApplicationRunner 를 만들어서 테스트해보자.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    StringRedisTemplate redisTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        ValueOperations<String, String> values = redisTemplate.opsForValue();
        values.set("name", "apple");
        values.set("category", "fruit");
        values.set("color", "red");
    }
}
```

애플리케이션을 실행시키고 레디스 CLI에 들어가면 key, value 데이터를 확인할 수 있다.

```shell
127.0.0.1:6379> keys *
1) "color"
2) "name"
3) "category"

127.0.0.1:6379> get color
"red"

127.0.0.1:6379> get name
"apple"

127.0.0.1:6379> get category
"fruit"
```



5) ORM (Hash 와 Repository)을 만들어보자.



```java
@Getter @Setter
@RedisHash("foods")
public class Food {

    @Id
    String id;

    String name;

    String color;
}

```

관계형데이터베이스 `@Entity` 와는 다르게 NoSQL 에서는 `@RedisHash` 로 해쉬키를 설정해주어야 한다.

<br />

```java
public interface FoodRepository extends CrudRepository<Food, String> {
}
```

`CrudRepository` 를 상속받아 인터페이스를 정의하면 된다.

<br />

```java
@Component
public class AppRunner implements ApplicationRunner {
  
    @Autowired
    FoodRepository foodRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Food food = new Food();
        food.setName("apple");
        food.setColor("red");

        foodRepository.save(food);

        Optional<Food> byId = foodRepository.findById(food.getId());
        System.out.println(byId.get().getName());
        System.out.println(byId.get().getColor());
    }
}
```

food 객체를 만들어서 레포지토리에 저장한다.

Id 로 food 객체를 찾아서 조회해볼 수 있다.

Redis CLI 에서 결과를 확인해보자

```shell
# 모든 키 확인
127.0.0.1:6379> keys *
1) "category"
2) "foods"
3) "name"
4) "color"
5) "foods:df52e1b7-5733-4ace-a231-1ea8c5504c5e"

# food 해쉬를 찾지만 에러
127.0.0.1:6379> get foods
(error) WRONGTYPE Operation against a key holding the wrong kind of value

# hget 으로 조회
127.0.0.1:6379> hget foods:df52e1b7-5733-4ace-a231-1ea8c5504c5e name
"apple"
127.0.0.1:6379> hget foods:df52e1b7-5733-4ace-a231-1ea8c5504c5e color
"red"

# hgetall 로 한꺼번에 모두 조회
127.0.0.1:6379> hgetall foods:df52e1b7-5733-4ace-a231-1ea8c5504c5e
1) "_class"
2) "co.wordbe.springgothree.food.Food"
3) "id"
4) "df52e1b7-5733-4ace-a231-1ea8c5504c5e"
5) "name"
6) "apple"
7) "color"
8) "red"
```







