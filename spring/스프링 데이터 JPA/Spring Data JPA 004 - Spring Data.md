# Spring Data JPA 004 - Spring Data Common



Spring data 안에는 Spring data Common, Spring data REST 가 있고, JPA, JDBC, KeyValue, MongoDB, Redis 등이 있다.

스프링 데이터는 SQL, NoSQL 저장소를 지원하는 프로젝트의 묶음이다.

스프링 데이터 Common 은 여러 저장소를 지원하는 프로젝트의 공통 기능을 제공해준다.

스프링 데이터 REST 는 저장소의 데이터를 하이퍼미디어 기반 HTTP 리소스로(REST API로) 제공한다.

그리고, 스프링 데이터 JPA는 스프링 데이터 Common이 제공하는 기능에 JPA 관련 기능을 추가한 것이다.





## Spring Data Common

(Spring data Common)

* Repository - 마커용 인터페이스
* CrudRepository 
* PagingAndSortingRepository

---

(Spring data JPA)

* JpaRepository 





---

## Repository



**CrudRepository**

* save :  저장, 저장한 것 리턴
* saveAll : 저장, 저장한 iterable 리턴
* findById : java 8 에서 지원하는 Optional 지원
* existsById : 존재유무 확인
* findAll : 테스트할 때 많이 쓰임..
* findAllById
* count
* deleteById 등등



JpaRepository 를 상속받아서, 다양한 Repository 테스트를 해보자.



 ```java
public interface PostRepository extends JpaRepository<Post, Long> {
}
 ```



```java
@DataJpaTest
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    @Rollback(false)
    public void crudRepository() {
        // Given
        Post post = new Post();
        post.setTitle("spring title");
        assertThat(post.getId()).isNull();

      	// 1. save 테스트
        // When
        Post newPost = postRepository.save(post);

        // Then
        assertThat(newPost.getId()).isNotNull();

        // 2. findAll 테스트
        // When
        List<Post> posts = postRepository.findAll();

        // Then
        assertThat(posts.size()).isEqualTo(1);
        assertThat(posts).contains(newPost);

       	// 3. PagingAndSortingRepository 테스트
        // When
        Page<Post> page = postRepository.findAll(PageRequest.of(0, 10));

        // Then
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getNumber()).isEqualTo(0);
        assertThat(page.getSize()).isEqualTo(10);
        assertThat(page.getNumberOfElements()).isEqualTo(1);
    }
}
```



 ```java
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByTitleContains(String title, Pageable page);
    long countByTitleContains(String title);
}
 ```

위와 같이 메소드를 일련의 규칙을 담아 만들면 Spring Data JPA는 자동으로 쿼리 메소드를 만들어준다.

```java
@DataJpaTest
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    @Rollback(false)
    public void crudRepository() {
				...
	      // 4. findByTitleContains 테스트
        // When
        page = postRepository.findByTitleContains("spring", PageRequest.of(0, 10));

        // Then
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getNumber()).isEqualTo(0);
        assertThat(page.getSize()).isEqualTo(10);
        assertThat(page.getNumberOfElements()).isEqualTo(1);

	      // 5. countByTitleContains 테스트
        // When
        long spring = postRepository.countByTitleContains("spring");

        // Then
        assertThat(spring).isEqualTo(1);
    }
}
```





<br />

---

## 인터페이스 정의



Repository 인터페이스로 공개할 메소드를 직접 정의하고 싶다면,   `@RepositoryDefinition` 을 사용한다.

```java
@RepositoryDefinition(domainClass = Comment.class, idClass = Long.class)
public interface CommentRepository {

    Comment save(Comment comment);

    List<Comment> findAll();
}
```

이렇게 만들면, 아래와 같이 테스트할 수 있다.

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() {
        Comment comment = new Comment();
        comment.setComment("comment 적었다.");
        commentRepository.save(comment);

        List<Comment> all = commentRepository.findAll();
        assertThat(all.size()).isEqualTo(1);
    }
}
```



<br />

또는 공통 인터페이스를 정읠할 수 도 있다. 이 때는 `@NoRepositoryBean` 을 사용해서 공통 리포지토리를 만든 후, 다른 리포지토리에서 이것을 상속받으면 된다.

```java
@NoRepositoryBean
public interface MyRepository<T, Id extends Serializable> extends Repository<T, Id> {

    <E extends T> E save(E entity);

    List<T> findAll();

  	// 추가 메소드 구현
    long count();
}
```

```java
public interface CommentRepository extends MyRepository<Comment, Long> {
}
```

위와 똑같이 테스트 할 수 있다. 



<br />

---

## Null 처리



Spring Data 2.0 부터 java 8 의 `Optional` 을 지원한다.

```java
@NoRepositoryBean
public interface MyRepository<T, Id extends Serializable> extends Repository<T, Id> {
    // 콜렉션 타입은 null 을 리턴하는 대신, 비어있는 콜렉션을 리턴
  	List<T> findAll();
  
  	// 리턴타입으로 Optional 지원
    <E extends T> Optional<E> findById(Id id);
}
```

```java
public interface CommentRepository extends MyRepository<Comment, Long> {
}
```



```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() {
        Optional<Comment> byId = commentRepository.findById(9000l);
        assertThat(byId).isEmpty();

      	// byId가 null 이기 때문에 예외를 던질 것이다.
        Comment comment = byId.orElseThrow(IllegalArgumentException::new);
    }
}
```



**Spring 5.0 이상 Null 어노테이션 지원**

`@NonNull`, `@Nullable`, `@NonNullApi` 를 지원한다. 런타임시 null 인지 확인한다. JSR 305 어노테이션을 메타 어노테이션으로 가지고 있기 때문에 IDE (Intellij) 에 설정을 추가하면 툴의 지원을 받을 수 있다.

⇧⇧ (Shift 두번) 누르고, 'runtime assertions' 를 검색하면 나올 것이다. 'Configure annotations' 들어가서 Spring이 지원하는 `@NonNull` 과 `@Nullable` 을 추가하자.



어노테이션은 아래와 같이 사용하면 된다.

```java
@NoRepositoryBean
public interface MyRepository<T, Id extends Serializable> extends Repository<T, Id> {

    <E extends T> E save(@NonNull E entity);

    @Nullable
    <E extends T> Optional<E> findById(Id id);
}
```

이제 save 메소드에 null 을 추가해보면 그러지 말라고 툴이 강조를 해준다.





Intellij가 null 임을 강조한다.



















