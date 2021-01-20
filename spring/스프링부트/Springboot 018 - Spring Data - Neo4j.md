# Springboot 018 - Spring Data - Neo4j



Neo4j는 노드와 연관관계를 영속화하는데에 RDB 보다 다양한 장점이 있는 데이터베이스이다.



### 의존성추가

pom.xml

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-neo4j</artifactId>
</dependency>
```

<br /> 

### Docker로 Neo4j 설치, 실행

```shell
$ docker run -p 7474:7474 -p 7687:7687 --name springboot-neo4j -d neo4j
```

http 프로토콜용 포트(7474), 볼트(bolt) 프로토콜용 포트(7687)를 각각 매핑해주어야 한다. 7474 포트에서 동작하는 브라우저가 서버에 매핑 될 수 있다.

`-d` 데몬 옵션으로 neo4j 이미지를 실행한다. (이미지가 없으면 자동으로 docker hub에서 다운받아진다.)

그리고 neo4j는 도커 컨테이너에서 CLI를 실행시키는 것 외에 브라우저에서 인터렉티브한 그래픽환경을 제공해주기 때문에 이것을 이용하면 편하다.

[http://localhost:7474/browser](http://localhost:7474/browser) 로 접속하면 된다.

<br />



### user 설정



![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FAY9bN%2FbtqUcByy3j2%2FMEbRRKyblK4hOKKw1XMMP0%2Fimg.png)



neo4j 아이디로 접속을 하기 위해, 초기 비밀번호는 neo4j 이다.

접속을하면 반드시 비밀번호를 바꿔주라고 한다. 편의상 1234로 바꿀 것이다. 이렇게 되면 기본 접속 정보가 달라지므로, springboot 에도 이 속성을 적용시켜주어야 접속이 가능하다.

아래 프로퍼티 파일을 수정하자.

application.properties

```shell
spring.data.neo4j.username=neo4j
spring.data.neo4j.password=1234
```



![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbV5xBr%2FbtqT90ZF7w6%2FUB4ugK4KlesA5VOK6BOR51%2Fimg.png)

<br />

<br />

### SessionFactory 사용

Spring 에서 neo4j를 제어하기 위한 방법으로 SessionFactory 빈을 제공한다.



Food 노트엔터티를 하나 만들어보자.

```java
@Getter @Setter
@NodeEntity
public class Food {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String color;
}
```

`@NodeEntity` 어노테이션을 붙인다.

<br />

**SessionFactory 이용**

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    SessionFactory sessionFactory;

    @Override
    public void run(ApplicationArguments args) throws Exception {
				
      	// Food 노트 엔터티의 노드 데이터 생성
      	Food food = new Food();
        food.setName("apple");
        food.setColor("red");

      	// 세션 열고, Food 노트 엔터티에 저장, 종료
        Session session = sessionFactory.openSession();
        session.save(food);
        sessionFactory.close();

        System.out.println(food);
    }
}
```



![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbWNKQ5%2FbtqT3thuiQ5%2Fqalo3gcJsjVohjmdURHw11%2Fimg.png)





<br />

### Neo4jRepostiory 사용

Spring 에서 neo4j를 제어하기 위한 방법으로 Repository 를 제공하기도 한다.



**Neo4jRepostiory 이용**

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
    }
}
```

이렇게 하면 위에서 SessionFactory 를 사용할 때와 같은 결과를 낼 수 있다.

<br />

추가로 노드엔터티간 관계를 엮어보자.

Store 이라는 노드엔터티를 만들자.

```java
@Getter @Setter
@NodeEntity
public class Store {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Relationship(type = "has")
    private Set<Food> foods = new HashSet<>();
}
```

StoreRepository도 만든다.

```java
public interface FoodRepository extends Neo4jRepository<Food, Long> {
}
```



```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    StoreRepository storeRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {

        Store store = new Store();
        store.setName("ABC mart");

        Food food = new Food();
        food.setName("strawberry");
        food.setColor("red");

        store.getFoods().add(food);

        storeRepository.save(store);
    }
}

```

Store 노드엔터티가 Food 노트엔터티를 가지고 있다고 관계를 맺었었다.

Store 객체과 Food 객체를 만들고 store에 food를 추가하여 store 레포지토리에 store를 추가하자.







![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8e9Pb%2FbtqUejqO2qU%2FXZ06QL8dbn67oAyuSREpTK%2Fimg.png)









