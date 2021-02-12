# Spring Data JPA 011 - 여러가지 기능 1



## JPA 쿼리 메소드



JPA 에서 쿼리메소드 사용시  아래와 같은 키워드를 제공한다.

> 1.  And, Or
> 2. Is, Equals
> 3. LessThan, LessThanEqual, GreaterThan, GreaterThanEqual
> 4. After, Before
> 5. IsNull, IsNotNull, NotNull
> 6. StartingWith, EndingWith, Containing
> 7. OrderBy
> 8. Not, In, NotIn
> 9. True, False
> 10. IgnoreCase



쿼리를 찾아서 사용하는 기능도 제공한다.

엔터티에 정의한 쿼리를 찾아 사용할 수 있다. `@NamedQuery`, `@NamedNativeQuery` 

<br />

`@NamedQuery` 를 사용해보자.

```java
@Getter @Setter
@Entity
@NamedQuery(name = "Post.findByTitle", query = "SELECT p FROM Post AS p WHERE p.title = ?1")
public class Post {

    @Id @GeneratedValue
    private Long id;

    private String title;

    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
}
```

JPQL 로 쿼리를 만들고 사용해보았다. 레포지토리에 쿼리를 등록해준다.

```java
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByTitle(String title);
}
```

```java
@Test
public void findByTitle() {
  Post post = new Post();
  post.setTitle("설날 연휴 공지");
  Post savedPost = postRepository.save(post);

  List<Post> all = postRepository.findByTitle("설날 연휴 공지");
  assertThat(all.size()).isEqualTo(1);
}
```

테스트가 성공적으로 이루어진다. 하지만 Entity 객체가 조금 지저분해 보이기 때문에 다른 방법도 이용해보자.



<br />

아래와 같이하면, 레포지토리에 쿼리를 적어도 되니 뭔가 더 괜찮아 보인다.

```java
public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT p FROM Post AS p WHERE p.title = ?1")
    List<Post> findByTitle(String title);
}
```

네이티브 쿼리를 사용하려면, `@Query` 인자로 `nativeQuery=true` 를 넣어주면 된다.

```java
@Query(value = "SELECT * FROM Post AS p WHERE p.title = ?1", nativeQuery = true)
List<Post> findByTitle(String title);
```



<br />

---

## Sort



```java
@Query(value = "SELECT p FROM Post AS p WHERE p.title = ?1")
List<Post> findByTitle(String title, Sort sort);
```

```java
@Test
public void findByTitle() {
  Post post = new Post();
  post.setTitle("설날 연휴 공지");
  Post savedPost = postRepository.save(post);

  List<Post> all = postRepository.findByTitle("설날 연휴 공지", Sort.by("title"));
  assertThat(all.size()).isEqualTo(1);
}
```

Sort 파라미터 인자로는 프로퍼티 레퍼런스(엔터티 필드)나 `SELECT` 절에서 정의했던 alias 만 가능하다. alias는 가령 `SELECT title AS myTitle FROM POST WHERE = ?1` 라는 쿼리안에서 `myTitle` 이라고 할 수 있다.

그 외에 Order By 절에서 함수를 호출하는 경우 Sort를 사용하지 못한다. 다만 함수를 쓰고 싶다면 트릭을 써서 가능하다. `JpaSort.unsafe()` 로 감싸면 된다.

```java
List<Post> all = postRepository.findByTitle("설날 연휴 공지", JpaSort.unsafe("LENGTH(title)"));
```





<br />

---

## Named Parameter, SpEL



Named Parameter 는 매개변수를 ?1, ?2 같은 방법으로 채번을 통해 참조하는 대신, 변수명으로 참조하는 방법이다.

아래를 보면 `@Param` 안에 변수명을 `WHERE` 조건에서 사용하고 있는 것을 볼 수 있다. postTitle 로 들어오는 매개변수를 title_1 이라는 변수명으로 바꾸어서 쿼리에서 사용할 수 있는 것이다.

```java
@Query(value = "SELECT p FROM Post AS p WHERE p.title = :title_1")
List<Post> findByTitle(@Param("title_1") String postTitle);
```



SpEL, Spring Expression Language (스프링 표현어) 

`@Query` 에서 엔티티 이름을 제공해준다. 따라서 표현식 안에서 `#entityName` 을 통해 엔티티 이름을 그대로 가져와서 사용할 수도 있다.

```java
@Query(value = "SELECT p FROM #{#entityName} AS p WHERE p.title = ?1")
List<Post> findByTitle(String title, Sort sort);
```

따라서 FROM 뒤에 있었던 Post 라는 엔티티이름을 `#{#entityName}` 처럼 SpEL로 사용할 수 있다.





<br />

---

## Update 쿼리 메소드



업데이트 쿼리를 활용해서 업데이트 쿼리 메소드도 만들 수 있다.

```java
@Query("UPDATE Post p SET p.title = ?1 WHERE p.id = ?2")
int updateTitle(String title, Long id);
```

```java
@Test
public void updateTitle() {
  // Given
  Post post = new Post();
  post.setTitle("설날 연휴 공지");
  Post savedPost = postRepository.save(post);
  
  // When
  String updatedTitle = "설날 연휴 공지(변경)";
  int update = postRepository.updateTitle(updatedTitle, post.getId());
  
  // Then
  assertThat(update).isEqualTo(1);
}
```

이렇게하면 성공적으로 테스트는 완료된다.

하지만 후에 한가지 문제가 있다. 아래를 보자.

```java
@Test
public void updateTitle() {
  // Given
  Post post = new Post();
  post.setTitle("설날 연휴 공지");
  Post savedPost = postRepository.save(post);
  
  // When 1
  String updatedTitle = "설날 연휴 공지(변경)";
  int update = postRepository.updateTitle(updatedTitle, post.getId());
  
  // Then 1
  assertThat(update).isEqualTo(1);

  // When 2
  Optional<Post> byId = postRepository.findById(post.getId());
  
  // Then 2
  assertThat(byId.get().getTitle()).isEqualTo(updatedTitle);
}
```

2번째 테스트에서 객체가 잘 변경되었는지 조회하는 테스트를 추가로 진행해본다. 그러면 테스트는 실패하고 만다.

여기서 post 객체는 persistent context 에 그대로 있다. 한 트랜잭션 내에서는 계속 캐시가 유지된다. 이 상태에서 조회(`findById`)를 하면 업데이트가 반영되지 않은 채 원래 자기가 가지고 있던 값을 반환한다. 업데이트 쿼리가 데이터베이스에 발생하긴 했지만, `findById` 에서는 원래 보존하고 있던 캐시를 반환했던 것이다.

> `updateTitle` 의 리턴 객체인 `update` 는 int나 void 로 정의가 가능하고, 이를 Post로 정의해서 받아오면 예외가 발생한다. (`InvalidDataAccessApiUsageException`)



해결책은 `@Modifying` 에 persistent 캐시를 제거하는 옵션을 추가하는 것이다.

```java
@Modifying(clearAutomatically = true)
@Query("UPDATE Post p SET p.title = ?1 WHERE p.id = ?2")
int updateTitle(String title, Long id);
```

persistent 캐시 안에 있던 것들을 실행해주는 `flushAutomatically=true` 옵션도 있다.

테스트는 성공하고, 문제는 해결되지만 복잡하므로 권장하지 않고, 애플리케이션 로직으로 아래왁 같이 사용하는 것을 추천한다.



```java
@Test
public void updateTitle() {
  Post post = new Post();
  post.setTitle("설날 연휴 공지");
  Post savedPost = postRepository.save(post);
  
  String updatedTitle = "설날 연휴 공지(변경)";
  post.setTitle(updatedTitle);

  List<Post> all = postRepository.findAll();
  assertThat(all.get(0).getTitle()).isEqualTo(updatedTitle);
}
```

persistent 객체를 변경하면 hibernater `SELECT`전에 자동으로 업데이트 쿼리를 실행해준다.



<br />

---

## EntityGraph



`@EntityGraph`를 이용해서 여러가지 일을 할 수 있지만 그 중 한가지는 원하는 방식으로 Fetch 전략을 선택할 수 있다. 쿼리 메소드 마다 연관 관계의 Fetch 모드를 설정할 수 있다.



우선 기본적으로 제공되는 Fetch 방법이 있다. `@ManyToOne` 처럼 끝이 one으로 끝나면 FetchType 이 기본적으로 `EAGER` 이다. 반면에 `@OneToMany` 처럼 끝이 many로 끝나면 FetchType 이 LAZY 이다. 확인해보자.

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
public interface CommentRepository extends JpaRepository<Comment, Long> {
}
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void getComment() {
        commentRepository.findById(1l);
    }
}
```

이렇게 테스트 했을 때 나타나는 쿼리를 보면, comment 와 관련된 post 를 모두 조회하는 것을 알 수 있다. `@ManyToOne`은 기본으로 `EAGER` 전략을 사용하기 때문이다.

여기서 Fetch 전략을 `LAZY`로 수정해보자.

```java
@ManyToOne(fetch = FetchType.LAZY)
```

그리고 테스트를 다시 실행하면 comment 만을 조회하는 것을 확인할 수 있다. post 는 나중에 필요할 때 조회하게 된다.



<br />

### `@EntityGraph`

이제는 원하는 연관 관계만 `@NamedEntityGraph` 로 표시하여서, Fetch 전략을 바꾸어보자.

```java
@NamedEntityGraph(name = "Comment.post",
        attributeNodes = @NamedAttributeNode("post"))
@Getter @Setter
@Entity
public class Comment {

    @Id @GeneratedValue
    private Long id;

    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    private Post post;
}
```

post 연관 관계를 `@NamedEntityGraph` 안에 지정해주었다.

```java
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(value = "Comment.post")
    Optional<Comment> getById(Long id);
}
```

이렇게 하면, 기본값으로는 설정된 attribute 는 모두 `EAGER` 로 fetch 된다. 즉 post 는 EAGER로 패치되는 것이다. 이 외에 다른 연관관계 attribute 는 LAZY로 패치된다. 단, `id`나 `comment` 같은 기본 타입은 EAGER 로 가져온다.

이 외에 그래프타입을 설정할 수 있는데, `LOAD` 는 설정한 엔티티 attribute 는 EAGER 패치, 그리고 나머지 전략은 기본 패치 전략을 따르도록 하는 옵션이다.



또는, 위와 같이 간단한 상황이라면 굳이 `@NamedEntityGraph` 를 사용하지 않고 아래와 같은 방식으로도 할 수 있다.

`@NamedEntityGraph` 는 엔터티에서 제거하고, 아래를 추가한다.

```java
@EntityGraph(attributePaths = "post")
```

간단한 상황에서는 훨씬 깔끔한 방법이 될 것이다.













