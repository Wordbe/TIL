# Springboot 2.1 - 빈 오버라이딩, 자동설정, 프로퍼티, JUnit5



## 빈 오버라이딩

빈을 등록하는 방법

1. `@Bean` 등록, `@Component` 류의 어노테이션 등록
2. 자동설정이 제공하는 빈 등록 (자바 설정 파일에 `@Bean` 등록)

일반적인 빈등록 (1번)

```java
@Bean
public Book book() {
  Book book = new Book();
  book.setName("redbook");
  return book;
}
```

자동설정이 제공하는 빈등록(2번)

```java
@Configuration
public class BookAutoConfiguration {

  @Bean
  public Book book() {
    Book book = new Book();
    book.setName("bluebook");
    return book;
  }
}
```

<br />

스프링부트 2.1 버전 이후부터는 자동설정으로 빈을 등록했을 경우 기존 빈이 있다면 오버라이딩을 허용하지 않는다.

`APPLICATON FAILED TO START` 에러를 발생시킨다.

<br />

오버라이딩을 허용하려면 프로퍼티 파일에 아래를 적어주면 된다.

**application.properties**

```properties
spring.main.allow-bean-definition-overriding=true
```

그런데 이 방법대신에 `@ConditionalOnMissingBean` 을 달아주면, 이미 등록된 빈이 있을 때 자동설정의 재정의를 막을 수 있다.

```java
@Configuration
public class BookAutoConfiguration {
 
  @Bean
  @ConditionalOnMissingBean
  public Book book() {
    Book book = new Book();
    book.setName("bluebook");
    return book;
  }
}
```

<br />

---

## 자동설정 지원



### 태스크 실행

* `@EnableAsync` 를 최상위 메인 클래스 위에 붙여주어야 한다.
* 이 때 `TaskExecutionAutoConfiguration` 클래스에서 자동설정이 적용된다.
* `spring.task.execution` 프로퍼티도 제공된다.
  * `pool-size`, `thread-name-prefix` 등을 설정할 수 있다.
* `TaskExecutorBuilder` 를 제공한다.

예제) 비동기 태스크 실행 예제

```java
@Service
public class PostService {

  @Async
  public void printPost() {
    System.out.println("(post) thread: " + Thread.currentThread().getName());
  }
}
```

```java
@RestController
public class PostController {

  @Autowired
  PostService postService;

  @GetMapping("/post")
  public String post() {
    postService.printPost();
    return "hello";
  }
}
```

```java
@EnableAsync
@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
```

`localhost:8080/post` 요청 후 결과

```shell
INFO 71811 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
INFO 71811 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
INFO 71811 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 1 ms
(post) thread: task-1
```

서블릿을 띄울 때 쓰레드(nio-8080-exec-1)가 아닌, 비동기적으로 새로운 쓰레드(task-1)에서 서비스를 실행시킬 수 있다.

<br />

### 태스크 스케쥴링

* 주기적으로 프로그램을 실행하고자 할 때 사용한다.
* `@EnableScheduling` 사용 시 자동설정(`TaskSchedulingAutoConfiguration`) 을 적용한다.
* `spring.task.scheduling` 프로퍼티를 제공한다.
* `TaskSchedulerBuilder` 를 제공한다.

예시) 주기적으로 프로그램 실행

```java
@Service
public class PostService {
	...

  @Scheduled(fixedDelay = 1000 * 2)
  public void printHi() {
    System.out.println("(hi) thread: " + Thread.currentThread().getName());
  }
}
```

애플리케이션 실행 결과 (2초 마다 출력)

```shell
(hi) thread: scheduling-1
(hi) thread: scheduling-1
(hi) thread: scheduling-1
...
```

<br />

### Spring Data JDBC

* JPA 와 API 제공 형태가 거의 비슷하지만, 제공하는 기능이 좀 더 적다.
* JPA 보다 단순한 것이 장점이다. JDBC + Mybatis 조합도 괜찮다.
* `@Entity` 는 따로 붙히지 않는다.
*  `CrudRepostiory` 를 상속받아 레포지토리 인터페이스를 만든다.
* `/resources` 밑에 `schema.sql` 을 만들어서 DDL을 정의해준다. Spring 은 애플리케이션이 구동될 때 이를 자동으로 실행시켜준다.



### 그밖에

* 카프카 스트림을 지원한다.
* JMS ConnectionFactory 캐시를 지원한다.
* ElasticSearch REST 클라이언트를 지원한다.

<br />

---

## 프로퍼티 변경

스프링부트 2.1에 변경되거나 새롭게 생긴 프로퍼티

<br />

### 스프링 데이터 JPA 부트스트랩 모드 지원

애플리케이션 구동 시간을 줄이기 위해 스프링 데이터 JPA 레포지토리의 생성을 지연 시키는 설정이다.

Repository 수가 적으면 구동 시간이 별차이가 없고, 많은 경우 효과가 있다.

* `DEFFERED` : 애플리케이션이 구동되는 과정에 레포지토리 객체가 필요할 수 있는데, 애플리케이션이 구동 중일 때는 가짜 객체인 프록시를 참조하게 한다. 애플리케이션이 만들어진 후 레포지토리 인스턴스를 만들어 주입해준다. (프록시 객체를 진짜 객체와 연결시켜준다.)
* `LAZY` : 애플리케이션 구동 이후에도 레포지토리를 만들지 않다가, 레포지토리가 필요한 요청이 생겨서, 레포지토리가 정말 필요할 때 진짜 레포지토리 객체가 생성된다.

```properties
spring.data.jpa.repositories.bootstrap-mode=deferred
```

<br />

### HibernateProperties

`JpaProperties` 에서 하이버네이트 관련 프로퍼티를 분리하였다.

<br />

### 마이그레이션 툴

프로퍼티를 마이그레이션하지 않아도 기존 프로퍼티로 애플리케이션 구동이 가능하다.

예를 들어

```properties
server.servlet.path=/app
```

라고 설정하면 url 기본 경로가 `localhost:8080` 에서 `localhost:8080/app` 으로 바뀐다.

하지만 이는 스프링부트 2.1로 넘어오면서 `spring.mvc.servlet.path` 라는 프로퍼티로 바뀌게 된다.

문서를 잘 찾아서 프로퍼티명을 구하는 것도 방법이지만,

아래와 같이 마이그레이션 툴의 도움을 받을 수도있다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-properties-migrator</artifactId>
  <scope>runtime</scope>
</dependency>
```

migrator 를 사용하면 버전이 업데이트 되어서 설정 방법이 바뀐 프로퍼티를 업데이트된 버전에 맞추어 적절하게 설정해준다.

또한 바뀐 프로퍼티명이 무엇인지 친절하게 출력해준다.

```shell
Property source 'Config resource 'class path resource [application.properties]' via location 'optional:classpath:/'':
	Key: server.servlet.path
		Line: 1
		Replacement: spring.mvc.servlet.path
```



하지만, 간단한 방법 중하나는 IDE 도움을 받는 것이다. 인텔리제이 상용버전(유료버전)을 사용하면, 이전 프로퍼티명을 사용했을 때 빨간 밑줄이 생기는데, `alt + enter` 를 누르면 새로운 프로퍼티명으로 replace 하는 옵션을 제공한다.

<br />

---

## JUnit5



* public 생략 가능
* `@RunWith(SpringRunner.class)` 생략 가능 : `@RunWith` 는 JUni4 에서 사용한다. `SpringRunner.class` 가 제공하는 인터페이스(`ApplicationContext` 등)를 사용해서 테스트를 진행한다.
* `Runner`와 `Rule` 을 사용하던 확장 방식이 `Extenstion` 모델로 통일 되었다.
* 모든 API 패키지가 `org.junit.jupiter` 아래에 들어있다.
* 람다식을 지원한다.

 JUnit5 에서는 `@ExtendWith` 을 사용한다. 이 어노테이션은 `@SpringBootTest` 에 메타어노테이션으로 이미 붙어있다.

```java
...
@ExtendWith({SpringExtension.class})
public @interface SpringBootTest { ...
```



```java
@SpringBootTest
@AutoConfigureMockMvc
class PostControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Test
  void testPost() throws Exception {
    mockMvc.perform(get("/post"))
      .andExpect(status().isOk())
      .andExpect(content().string("hello"));
  }
}
```



람다식을 사용할 수도 있다.

```java
@Test
void testPostLambda() throws Exception {
  ResultActions resultActions = mockMvc.perform(get("/post"));
  Assertions.assertAll(
    () -> resultActions.andExpect(status().isBadRequest()), // 테스트가 실패해도 아래 테스트가 실행된다.
    () -> resultActions.andExpect(content().string("hello world")));
}
```

이렇게 되면 중간에 테스트가 실패하더라도 5, 6번 라인을 모두 수행하여 테스트한다.

<br />

---

## DataSize



Spring framework 5.1 부터 `DataSize` 라는 새로운 타입을 지원한다. 단위를 표현하는 타입이다. 

byte(B), kilobyte(KB), megabyte(MB), gigabyte(GB), terabyte(TB) 타입을 지원한다.

<br />

스프링부트는 이와 관련하여 컨버터를 지원한다.

* `StringToDataSizeConverter`, `NumberToDataSizeConverter`

예시를 보자

**application.properties**

```properties
exampleData = 10MB
```

```java
@RestController
public class PostController {

    @Value("${exampleData}")
    private DataSize exampleData;

    @GetMapping("/post")
    public String post() {
        System.out.println(exampleData);
        System.out.println(exampleData.toMegabytes());
        return "hello";
    }
}
```

테스트 실행 시 결과

```shell
10485760B
10
```



<br />

---

## 로그 그룹

<br />

기본 디버그 레벨은 `INFO` 이다.

```properties
logging.level.org.springframework.data=debug
```

프로퍼티에서 위와 같이 이를 `DEBUG` 로 바꿀 수 있다.

이렇게 `DEBUG` 로 설정할 것들이 여러개 있다면 어떨까?

```properties
logging.level.org.springframework.data=debug
logging.level.org.hibernate=debug
logging.level.javax.persistence=debug
```

아래와 같이 그룹으로 묶어서 한꺼번에 debug 처리할 수 있다. 

```properties
logging.group.mygroup=org.springframework.data, org.hibernate, javax.persistence
logging.level.mygroup=debug
```

> * logging.group.{그룹이름}={패키지}, {패키지}, {패키지}, ...
> * logging.level.{그룹이름}={로그레벨}
>
> 위 형식으로 적용해주면 된다.



스프링부트가 미리 정의해둔 그룹도 있다.

* web = 스프링 웹 MVC 관련 패키지 그룹이다.

  ```properties
  logging.level.web=debug
  ```

* sql = 스프링 JDBC아 하이버네이트 SQL을 묶어둔 로그 그룹이다.

  ```properties
  # SQL 출력
  spring.jpa.show-sql=true
  # SQL 파라미터를 출력하는 프로퍼티
  logging.level.org.hibernate.type.descriptor.sql=TRACE
  ```

  보통 JPA 에서 sql 의 로그를 출력해볼 때 위 옵션을 사용하는데, 이를 아래와 같이 sql 그룹으로 한번에 debug 모드 처리할 수 있다.

  ```properties
   logging.level.sql=debug
  ```



<br />

---

## Actuator 변경사항



**actuator 의존성 추가**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

`localhost:8080/actuator/` 엔드포인트로 연결하면 스프링 액츄에이터 기본 정보가 나온다.

여기에서 `localhost:8080/actuator/info` 엔드포인트에 우리가 프로퍼티를 추가해보자.

```properties
info.app.encoding=@project.build.sourceEncoding@
info.app.java.version=@java.version@
info.app.spring.vrsion=@spring-framework.version@
info.app.name=spring boot!!
info.mygroup.name=apple
```



<br />

git 프로퍼티 정보 추가 플러그인, build 정보 추가 플러그인도 추가해보자.

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <executions>
        <execution>
          <goals>
            <!-- build 정보 추가 플러그인 -->
            <goal>build-info</goal>
          </goals>
        </execution>
      </executions>
    </plugin>

    <!-- git 프로퍼티 정보 추가 플러그인 -->
    <plugin>
      <groupId>pl.project13.maven</groupId>
      <artifactId>git-commit-id-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

maven package 를 실행해서 다시 빌드하면 플러그인 기능을 추가할 수 있다.

> Tip
>
> IntelliJ > Maven 
>
> * 몽키스패너모양 (Build Tool Settings) > Auto reload > Any changes 하고 의존성코드수정하면 곧바로 메이븐이 변경됨
> * 테스트 스킵을 토글로 제어가능
> * Lifecycle : 원하는 단계만 따로 실행 가능





결과는 아래와 같다.

```shell
// 20210317003824
// http://localhost:8080/actuator/info

{
  "app": {
    "encoding": "UTF-8",
    "java": {
      "version": "11.0.9.1"
    },
    "spring": {
      "vrsion": "5.3.4"
    },
    "name": "spring boot!!"
  },
  "mygroup": {
    "name": "apple"
  },
  "git": {
    "branch": "main",
    "commit": {
      "id": "f3dae34",
      "time": "2021-03-16T15:37:02Z"
    }
  },
  "build": {
    "artifact": "the-java-springboot",
    "name": "the-java-springboot",
    "time": "2021-03-16T15:38:08.840Z",
    "version": "0.0.1-SNAPSHOT",
    "group": "co.wordbe"
  }
}
```

