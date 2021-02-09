# Spring Data JPA 005 - Repository







## Custom Repository

> 짤막한 Intellij 단축키 Tip
>
> * `command + 1` : 왼쪽 옆에 프로젝트 창 커서가도록 하기
> * `esc` : 다시 코드 창으로 커서가 온다.
> * `command +` ` : 프로젝트 2개이상 띄워져있을 때 프로젝트 변경 
> * `shift + command + T` : Test 로 탭 전환



쿼리 메소드(쿼리 생성 및 쿼리 찾아쓰기)로 해결되지 않는 경우 코딩으로 스프링 데이터 리포지토리 인터페이스에 필요한 기능을 직접 구현 가능하다.



**1) 새로운 기능을 추가**

테스트 코드

```java
@DataJpaTest
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    public void crud() {
        postRepository.findMyPost();
    }
}
```

Post 와 PostRepository

```java
@Getter @Setter
@Entity
public class Post {

    @Id @GeneratedValue
    private Long id;

    private String title;

    @Lob
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
}
```

본문은 255자가 넘을 수도 있는데 `@Lob` 어노테이션을 달아주면 된다.

```java
public interface PostRepository extends JpaRepository<Post, Long>, PostCustomRepository {
}
```

새로운 기능을 추가하려면 레포지토리에 새로운 레포지토리 인터페이스 (`PostCustomRepository`)를 만들어서 함께 상속을 받아오면 된다.



커스텀 리포지토리에 `findMyPost` 라는 메소드를 추가해보자.

```java
public interface PostCustomRepository {
    List<Post> findMyPost();
}
```

```java
@Repository
@Transactional
public class PostCustomRepositoryImpl implements PostCustomRepository {

    @Autowired
    EntityManager entityManager;

    @Override
    public List<Post> findMyPost() {
        System.out.println("custom findMyPost");
        return entityManager.createQuery("SELECT  p FROM  Post AS p", Post.class).getResultList();
    }
}
```

이제 테스트를 실행시키면, 정상 작동하는 것을 볼 수 있다.

<br />

**2) 기본 기능 덮어쓰기**

`JpaRepository` 기존 기능에 있었던 delete 를 덮어씌워서 custom delete 를 만들어보자.

```java
public interface PostCustomRepository<T> {

    List<Post> findMyPost();

    void delete(T entity);
}
```

타입까지 상속받게 한다.

```java
@Repository
@Transactional
public class PostCustomRepositoryImpl implements PostCustomRepository<Post> {

    @Autowired
    EntityManager entityManager;

    @Override
    public List<Post> findMyPost() {
        System.out.println("custom findMyPost");
        return entityManager.createQuery("SELECT  p FROM  Post AS p", Post.class).getResultList();
    }

    @Override
    public void delete(Post entity) {
        System.out.println("custom delete");
        entityManager.remove(entity);
    }
}
```

메소드를 오버라이드하여 원하는 delete 함수를 구현한다.

<br />

이제 테스트를 해보자.

```java
@DataJpaTest
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    public void crud() {
        Post post = new Post();
        post.setTitle("book");
        postRepository.save(post);
        postRepository.delete(post);
    }
}
```

hibernate 가 똑똑하게 쿼리를 날리지 않는 것을 예측해보자.

 `insert`와 `delete` 가 동시에 있는 조건에서는 생성하고 삭제하면 원래와 같게되니 둘 다 불필요한 쿼리 실행을 하지 않을 것이다. 

이 사이에 `select` 를 넣어보자.

```java
postRepository.save(post);
postRepository.findMyPost();
postRepository.delete(post);
```

우선  `select` 는 `insert`, `delete` 에 상관없이 DB에 저장된 데이터를 조회하는 것이므로, 실행이 될 것이다.

 `select` 가 있다면, `select` 에 `insert`가 영향을 주므로 `insert` 쿼리는 실행이 된다.

그런데 `delete` 는 쿼리가 실행되지 않는다. `@DataJpaTest` 를 따라가보면 `@Transactional` 이 붙어있고, 이는 테스트가 끝난 후 DB 를 원래 상태로 되돌려 놓기 때문에, 굳이 불필요한 `delete` 를 실행하지 않는다.

따라서 `delete` 도 실행시키려면 반드시 `flush`를 해주어야 한다.

```java
@DataJpaTest
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    public void crud() {
        Post post = new Post();
        post.setTitle("book");
        postRepository.save(post);
        postRepository.findMyPost();
        postRepository.delete(post);
        postRepository.flush();
    }
}
```



<br />

**접미어(postfix) 설정하기**

메인 애플리케이션 위에 `@EnableJpaRepositories(repositoryImplementationPostfix = "MyPostfix")` 를 붙여서 원하는 postfix를 설정해준다. 원래 기본값은 `Impl` 이다. 그리고 만들어주었던 Impl 레포지토리의 이름을 바꾸면 된다.



<br />

---

## 기본 Repository 커스터마이징



위에서는 공통 레포지토리가 `JpaRepository` 이고 여기에 내가 만든 레포지토리를 같이 상속받아서 사용했었다.

여기서 볼 것은, 공통 레포지토리를 내가 만든 레포지토리로 사용하는 것이다.

즉 위에서 만들었던 `postRepository` 는 `JpaRepository` 를 상속받는 것이 아니라, 내가 만든 `CommonRepository` 를 상속받는 방식으로 커스터마이징 할 것이다.

```java
public interface PostRepository extends CommonRepository<Post, Long> {
}
```

<br />

`CommonRepository` 을 만들기 위해서는 `JpaRepository` 를 상속받는다.

원하는 기능을 인터페이스에 정의한다.

```java
@NoRepositoryBean
public interface CommonRepository<T, ID extends Serializable> extends JpaRepository<T, ID> {

    boolean contains(T entity);
}
```

이제 `CommonRepository`의 구현체를 만들 것이다. 이 구현체는 구현 받기전에 `SimpleJpaRepository` 를 상속받아야 한다.

> `SimpleJpaRepository` 는 `JpaRepository` 의 구현체의 자식 클래스이다.. (복잡하다...)

```java
public class CommonRepositoryImpl<T, ID extends Serializable> extends SimpleJpaRepository<T, ID> implements CommonRepository<T, ID> {

    private EntityManager entityManager;

    // 생성자
    public CommonRepositoryImpl(JpaEntityInformation<T, ?> entityInformation, EntityManager entityManager) {
        super(entityInformation, entityManager);
        this.entityManager = entityManager;
    }
   
    // 구현할 메소드 오버라이딩
    @Override
    public boolean contains(Object entity) {
        return entityManager.contains(entity);
    }
}
```

이렇게 해주고 마지막으로 메인 어플리케이션 위에 아래와 같이 설정해주면 된다.

```java
@EnableJpaRepositories(repositoryBaseClass = CommonRepositoryImpl.class)
public class Application { ...
```

<br />

그리고 테스트를 해보자.

```java
@DataJpaTest
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    public void crud() {
        Post post = new Post();
        post.setTitle("book");

        // Transient
        assertThat(postRepository.contains(post)).isFalse();

        postRepository.save(post);
      
        // Persistent
        assertThat(postRepository.contains(post)).isTrue();
    }
}
```

테스트 코드가 올바르게 작동하는 것을 볼 수 있다.













