# Spring Data JPA 003 - JPA



## Cascade

Cascade란 엔티티 상태를 전파시키는 옵션이다.



엔터티 상태란 다음 4가지를 말한다.

* `Transient` : 객체가 단지 선언되고 생성만 되었을 뿐 JPA 는 알지 못하는 상태다.

* `Persistent` : JPA가 관리중인 상태다. 예를 들어 Session.save() 할 때 이 상태가된다.  Session 같은 PersistentContext 에 객체를 넣어준다. 그 외에 하이버네이트가 1차 캐시, Dirty Checking, Write Behind 등을 관리한다.

  > * 1차 캐시 : 객체 상태를 캐시에 저장한다. 예를 들어 이미 캐시에 어떤 데이터가 존재하면 load 명령을 해도 굳이 DB에서 가져오지 않고 있던 값을 사용하여 성능을 끌어올린다.
  > * Dirty Checking : 객체의 변경사항을 계속 감시하여 반영할 지 결정한다.
  > * Write Behind : 객체의 상태변화를 데이터베이스에 최대한 늦게, 가장 필요한 시점에 적용하여 불필요한 DB I/O를 줄인다.

* `Detached` : JPA 가 더이상 관리하지 않는 객체이다. 다시 reattach 하려면 `Session.update()`, `Session.merge()`, `Session.saveOrUpdate()` 등을 사용한다. 

* `Removed` : JPA 가 관리하긴 하지만 삭제하기로 한 상태이다.





Post 와 Comment 엔터티를 양방향 관계로 정해보자.

```java
@Getter @Setter
@Entity
public class Post {

    @Id @GeneratedValue
    private Long id;

    private String title;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private Set<Comment> comments = new HashSet<>();

    public void addComent(Comment comment) {
        this.getComments().add(comment);
        comment.setPost(this);
    }
}
```

`CascadeType` 에는 Persist, Detach, Merge, Refresh, Remove 가 있지만, 이 들을 모두 설정할 것이라면 `ALL` 을 넣어주면 된다.

```java
@Getter @Setter
@Entity
public class Comment {

    @Id @GeneratedValue
    private Long id;

    private String comment;

    @ManyToOne
    private Post post;
}
```



```java
@Component
@Transactional
public class JpaRunner implements ApplicationRunner {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Post post = new Post();
        post.setTitle("Spring Data JPA");

        Comment comment = new Comment();
        comment.setComment("글 잘 봤습니다");
        post.addComent(comment);

        Comment comment1 = new Comment();
        comment1.setComment("감사합니다.");
        post.addComent(comment1);


        Session session = entityManager.unwrap(Session.class);
        session.save(post);
    }
}
```

이렇게 세션에 post 만 추가해주어도, cascade 덕분에 comment 관련되어 연결된 모든 comment 데이터도 다 `save` 된다.

delete 도 마찬가지다. 위 코드에서 맨 아래에 아래 코드아 같은 방식으로하면, post 만 삭제했는데 관련된 comment 들도 모두 삭제가 자동으로 된다.

```java
...
Session session = entityManager.unwrap(Session.class);        
Post post = session.get(Post.class, 1l);
session.delete(post);
```





<br />

---

## Fetch

연관관계가 있는 Entity 를 지금 즉시 (eager) 가져올 것인가, 나중에(lazy) 가져올 것인가 결정하는 것이다.

`@OneToMany`의  기본값은 `LAZY` 이다. 관련된 객체가 여러개일 수도 있으니 나중에 가져오는 옵션이 기본이다. 예를 들어 이것을 `EAGER` 로 바꾸고 싶다면, `FetchType.EAGER` 을 추가하면 된다.

```java
@OneToMany(mappedBy = "post", fetch = FetchType.EAGER)
```

 `@ManyToOne` 의 기본값은 `EAGER` 이다. 관련된 객체가 1개이니 바로 가져오는게 합리적으로 보인다. 위와 비슷한 방법으로 하면 된다.



참고로 `get` 은 데이터가 없다면 null 을 반환한다. 이에 반해 `load` 는 데이터가 없으면 예외를 던진다. `load` 는 프록시로도 사용할 수 있다.

```java
@Component
@Transactional
public class JpaRunner implements ApplicationRunner {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Session session = entityManager.unwrap(Session.class);

      	// post 불러오기
        Post post = session.get(Post.class, 4l);
        System.out.println("post: " + post.getTitle());

      	// comment 출력
        post.getComments().forEach(c -> {
            System.out.println("comment: " + c.getComment());
        });
    }
}
```

출력을 보면, fetch의 기본 타입은 LAZY 이므로 post 를 먼저 출력하고, `select` 문으로 comment 들을 가져온 후 그 다음 comment 를 출력해주는 것을 볼 수 있다.



<br />

---

## Query



JPQL (HQL) 을 이용해서 쿼리를 만들 수 있다.

> Java Persistence Query Language / Hibernate Query Language

JPQL 은 데이터베이스 테이블이 아닌, 객체 모델의 Entity 이름을 사용하면 된다. JPA 또는 그 구현체 Hibernate 가 만든 쿼리를 SQL 로 변환해서 실행해준다.

```java
@Component
@Transactional
public class JpaRunner implements ApplicationRunner {

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        TypedQuery<Post> query = entityManager.createQuery("SELECT p FROM Post AS p", Post.class);
        List<Post> posts = query.getResultList();
        posts.forEach(System.out::println);
    }
}
```



타입-세이프 한 쿼리작성은 아래와 같이 `Criteira` 로 할 수 있다.

```java
CriteriaBuilder builder = entityManager.getCriteriaBuilder();
CriteriaQuery<Post> query = builder.createQuery(Post.class);
Root<Post> root = query.from(Post.class);
query.select(root);

List<Post> resultList = entityManager.createQuery(query).getResultList();
resultList.forEach(System.out::println);
```



Native Query 를 직접 작성하는 방법도 있다. SQL 쿼리를 그대로 작성해주면 된다.

```java
List<Post> posts = entityManager.createNativeQuery("select * from Post", Post.class).getResultList();
        posts.forEach(System.out::println);
```



<br />

---

## Spring Data JPA

```java
@Repository
@Transactional
public class PostRepository {

    @PersistenceContext
    EntityManager entityManager;

    public Post add(Post post) {
        entityManager.persist(post);
    }

    public void delete(Post post) {
        entityManager.remove(post);
    }

    public List<Post> findAll() {
        return entityManager.createQuery("select p from Post as p", Post.class).getResultList();
    }
}
```

이렇게 일일이 구현하던 것을 다른 인터페이스에 미리 구현해 놓았다. 그 인터페이스가 `JpaRepository` 인데, 이를 상속받아 레포지토리 인터페이스를 만들면 된다.

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}

```

그 후 `@EnableJpaRepositories` 를 원래 메인 클래스 위에 등록해야 하는데 `@SpringBootApplication` 이 이미 자동설정을 지원해준다.



```java
@Component
@RequiredArgsConstructor
@Transactional
public class JpaRunner implements ApplicationRunner {

    PostRepository postRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        postRepository.findAll().forEach(System.out::println);
    }
}
```

이런식으로 `PostRepository` 를 주입받아서 사용할 수 있다.







<br />

#### JpaRepository 빈 등록 원리

`@EnableJpaRepositories` 어노테이션을 쭉 탐색해서 들어가보면, 처음에 `@Import(JpaRepositoriesRegistar.class)` 를 들어가서, 결국 최상위 인터페이스 `ImportBeanDefinitionRegistar` 까지 올라간다. 

`JpaRespository`를 상속받으면  Repository 에 `@Repository` 를 붇이지 않아도 빈으로 등록되어 사용될 수 있다.

원래는 아래 예시와 비슷하다.

우선 예시 클래스 Jara 를 만들자.

```java
@Getter @Setter
public class Jara {

    private String name;
}

```

그리고 `ImportBeanDefinitionRegistrar` 을 구현해서 Registrar 를 만들자.

```java
public class JaraRegistrar implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry, BeanNameGenerator importBeanNameGenerator) {

        // Jara 클래스 빈 등록
        GenericBeanDefinition beanDefinition = new GenericBeanDefinition();
        beanDefinition.setBeanClass(Jara.class);
      	// name 필드에 strawberry 세팅
        beanDefinition.getPropertyValues().add("name", "strawberry");

      	// 레지스트리에 빈정의를 등록
        registry.registerBeanDefinition("jara", beanDefinition);
    }
}
```

```java
@Component
@Transactional
public class JpaRunner implements ApplicationRunner {

    @Autowired
    Jara jara;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(jara.getName());
    }
}
```

이제 주입받아와서 빈처럼 사용할 수 있다.





**TIP**

"?" 에 들어있는 값 출력을 위해서는 application.properites 에 설정을 추가해주면 된다.

```shell
# spring.jpa.show-sql=true 와 같은 기능
logging.level.org.hibernate.SQL=debug

# ? 보기
logging.level.org.hibernate.type.descriptor.sql=trace
```







