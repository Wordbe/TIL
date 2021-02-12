# Spring Data JPA 012 - 여러가지 기능 2



<br />

## Projection

project 란 릴레이션에서 select 할 때 원하는 컬럼 가져오는 것이다. `select * from table` 처럼 모두를 가져올 수도 있고, 아니면 컬럼 이름을 적어서 일부만 가져올 수도 있다.





<br />

### Closed 프로젝션

인터페이스 기반 프로젝션과 클래스 기반 프로젝션이 있는데, 인터페이스 기반을 먼저 해보자. 조금 더 코드가 덜 많다.

클로즈드 프로젝션은 원하는 attribute 만 선택해서 가져오는 것이므로 쿼리의 성능을 최적화 할 수 있다.

```java
public interface CommentSummary {
    String getComment();
    int getUp();
    int getDown();
}
```

```java
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<CommentSummary> findByPost_Id(Long id);
}
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void getComment() {
        commentRepository.findByPost_Id(1l);
    }
}
```

이제 `SELECT` 절에서 comment, up, down 만 가져오게 된다.



<br />

### Open 프로젝션

Open 프로젝션은 모두 불러와서 원하는 것만 선택하는 것이다. 문자열을 더한 칼럼을 새로 만들 수도 있다. 마치 alias 를 만들어 새로운 칼럼을 만든 느낌이다. 따라서 성능 최적화는 하지 못한다.

```java
@Test
public void getComment() {
  Post post = new Post();
  post.setTitle("안녕하세요.");
  Post savedPost = postRepository.save(post);

  Comment comment = new Comment();
  comment.setPost(savedPost);
  comment.setUp(5);
  comment.setDown(2);
  commentRepository.save(comment);

  commentRepository.findByPost_Id(savedPost.getId())
    .forEach(c -> {
      System.out.println(c.getVotes());
    });
}
```

```java
public interface CommentSummary {

    String getComment();

    int getUp();

    int getDown();

    @Value("#{target.up + ' ' + target.down}")
    String getVotes();
}
```



<br />

Open 프로젝션이 가진 장점을 가지면서 성능을 최적화할 수 있도록 **Closed 프로젝션**에도 적용해보자.

```java
public interface CommentSummary {

    String getComment();

    int getUp();

    int getDown();

    default String getVotes() {
        return getUp() + " " + getDown();
    }
}
```

java 8부터 **인터페이스에 default 메소드를 구현**할 수 있다. 이를 통해 사용할 필드를 한정적으로 만들고, 원하는 칼럼을 계산해낼 수도 있게 구현할 수 있다.



<br />

### 클래스 프로젝션

```java
@AllArgsConstructor
public class CommentSummary {

    public String comment;

    public int up;

    public int down;

    public String getVotes() {
        return this.up + " " + this.down;
    }
}
```

위와 같이 인터페이스를 클래스로 바꾸고 사용할 수 있다. 아무래도 코드량이 조금 더 많아지는 느낌이있는데, 그나마 lombok 의 `@AllArgsConstructor` 어노테이션으로 생성자 코드를 생략하도록 하였다.



<br />

### 다이내믹 프로젝션 : 프로젝션 여러개

새로운 프로젝션을 만든다.

```java
public interface CommentOnly {

    String getComment();
}
```

이제 그러면 이미 존재했던 CommentSummary 와 오버로딩해서 같이 사용하고 싶은데, 그렇게 지원되지는 않는다.

따라서 제네릭을 도입해서, 매개변수로 클래스 타입을 받도록 설정한다.

```java
public interface CommentRepository extends JpaRepository<Comment, Long> {

    <T> List<T> findByPost_Id(Long id, Class<T> type);
}
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Autowired
    PostRepository postRepository;

    @Test
    public void getComment() {
        Post post = new Post();
        post.setTitle("안녕하세요.");
        Post savedPost = postRepository.save(post);

        Comment comment = new Comment();
        comment.setComment("댓글입니다.");
        comment.setPost(savedPost);
        comment.setUp(5);
        comment.setDown(2);
        commentRepository.save(comment);

        commentRepository.findByPost_Id(savedPost.getId(), CommentSummary.class)
            .forEach(c -> {
                System.out.println(c.getVotes());
            });

        commentRepository.findByPost_Id(savedPost.getId(), CommentOnly.class)
                .forEach(c -> {
                    System.out.println(c.getComment());
                });
    }
}
```

이제 두 프로젝션을 테스트해보자. 실행이 잘 된다.





<br />

---

## Specification

QueryDSL 의 Predicate 와 유사하다. 여러 쿼리 설정을 좀 더 손 쉽게 해준다.

DDD (에릭 에반스) 에서 언급하는 Specification 개념을 사용하였다.



**Specification 을 위한 의존성 설정.**

1, 2 둘 중 하나를 추가한다.



1. 메이븐 디펜던시

```xml
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-jpamodelgen</artifactId>
</dependency>
```



2. 메이븐 플러그인 활용

```xml
<plugin>
  <groupId>org.bsc.maven</groupId>
  <artifactId>maven-processor-plugin</artifactId>
  <version>2.0.5</version>
  <executions>
    <execution>
      <id>process</id>
      <goals>
        <goal>process</goal>
      </goals>
      <phase>generate-resources</phase>
      <configuration>
        <processors>
          <processor>org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor</processor>
        </processors>
      </configuration>
    </execution>
  </executions>
  <dependencies>
    <dependency>
      <groupId>org.hibernate</groupId>
      <artifactId>hibernate-jpamodelgen</artifactId>
      <version>${hibernate.version}</version>
    </dependency>
  </dependencies>
</plugin>
```



인텔리제이에서 Preferences > Build, Execution, Deployment > Compiler > Annotation Processors 들어간 다음,

Enable annotation processing 체크박스 선택 후 아래 Annotatation Processors 박스에 `+` 버튼을 눌러서 `org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor` 을 추가하면 된다.

<br />

우선 Specs 클래스를 만든다. 여기에 만들 쿼리를 작성한다.

```java
import org.springframework.data.jpa.domain.Specification;

public class CommentSpecs {

    public static Specification<Comment> isBest() {
        return (root, query, builder) -> builder.isTrue(root.get(Comment_.best));
    }

    public static Specification<Comment> isGood() {
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get(Comment_.up), 10);
    }

}
```

그리고 테스트에서 손쉽게 사용하면 된다.

```java
@Test
public void specs() {
  Page<Comment> page = commentRepository.findAll(isBest().or(isGood()), PageRequest.of(0, 10));
}
```







<br />

---

## Query by Example

<br />

QBE는 단순한 인터페이스르 통해 동적으로 쿼리를 만드는 기능을 제공한다.

Example 은 일종의 쿼리이다. Probe 와 ExampleMatcher 를 입력받아 사용할 수 있다. probe는 도메인 객체로써, 필드에 값을 가지고 있다. ExampleMatcher 는 probe에 들어있는 필드 값들을 쿼리할 데이터와 비교할 수 있도록 정의한 것이다

별다른 코드 생성기나 애노테이션 처리기가 필요 없으며, 데이터 기술에 독립적인 API 를 가져서 좋지만, nested 또는 프로퍼티 그룹 제약 조건을 만들지 못하고, 조건이 제한적이기 때문에 쿼리 작성에 한계가 있다. 

```java
@Test
public void qbe() {
  Comment probe = new Comment();
  probe.setBest(true);

  ExampleMatcher exampleMatcher = ExampleMatcher.matchingAny()
    																						.withIgnorePaths("up", "down");

  Example<Comment> example = Example.of(probe, exampleMatcher);

  commentRepository.findAll(example);
}
```

레포지토리에는 `QueryByExampleExecutor` 를 상속받아 사용할 수 있다.

```java
public interface CommentRepository extends JpaRepository<Comment, Long>, JpaSpecificationExecutor<Comment>, QueryByExampleExecutor<Comment> { ...
```



<br />