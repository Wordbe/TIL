# Spring Data JPA 004 - Spring Data Common





## Query



**Spring Data 저장소의 메소드 이름으로 쿼리를 만들 수 있다.**

1) 메소드 이름을 분석해서 쿼리를 만든다. (`CREATE`)

2) 미리 정의해 둔 쿼리를 찾아 사용한다. (`USE_DECLARED_QUERY`)

3) 미리 정의한 쿼리를 찾아보고 없으면 생성한다. (`CREATE_IF_NOT_FOUND`)



아래와 같이 설정할 수 있다.

```java
@SpringBootApplication
@EnableJpaRepositories(queryLookupStrategy = QueryLookupStrategy.Key.CREATE_IF_NOT_FOUND)
public class Application { ...
```

기본값은 `CREATE_IF_NOT_FOUND` 이다.



<br />

**쿼리를 만드는 방법을 알아보자.**

> 리턴타입 {접두어}{도입부}By{프로퍼티 표현식}[조건식]{[And|Or]}{프로퍼티 표현식[조건식]}{정렬조건} {매개변수}

* 접두어: Find, Get, Query, Count 등
* 도입부: Distinct, First(N), Top(N)
* 프로퍼티 표현식: 예를 들어 Person.Address.ZipCode는 find[Person]ByAddress_ZipCode 로 표현할 수 있다.
* 조건식: IgnoreCase, Between, LessThan, GreaterThan, Like, Contains 등
* 정렬조건: OrderBy{프로퍼티}Asc|Desc
* 리턴타입: E, Optional\<E\>, List\<E\>, Page\<E\>, Slice\<E\>, Stream\<E\>
* 매개변수: Pageable, Sort (Pageable 은 sort를 포함한다.) 





<br />

**쿼리를 찾는 방법**

메소드 이름으로 쿼리를 표현하기 힘든 경우에 사용한다. 저장소 기술에 따라 다르고, JPA 에는 `@Query`와 `@NamedQuery`가 있다.

어노테이션 우선 순위는 Query, Procedure, NameQuery 순이다.



**예시 1) 기본**

```java
public interface CommentRepository extends MyRepository<Comment, Long> {

    List<Comment> findByCommentContainsIgnoreCaseAndLikeCountGreaterThan(String keyword, int likeCount);
}
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() {
        // Given
        Comment comment = new Comment();
        comment.setLikeCount(11);
        comment.setComment("spring data jpa 잘 배우겠습니다.");
        commentRepository.save(comment);

        // When
        List<Comment> comments = commentRepository.findByCommentContainsIgnoreCaseAndLikeCountGreaterThan("Spring", 10);

        // Then
        assertThat(comments.size()).isEqualTo(1);
    }
}
```



**예시 2) 여러 개 정렬 **

```java
public interface CommentRepository extends MyRepository<Comment, Long> {

    List<Comment> findByCommentContainsIgnoreCaseOrderByLikeCountAsc(String keyword);
}
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() {
        // Given
        this.createComment(33, "spring comment1");
        this.createComment(22, "SPRING comment2");

        // When
        List<Comment> comments = commentRepository.findByCommentContainsIgnoreCaseOrderByLikeCountAsc("Spring");

        // Then
        assertThat(comments.size()).isEqualTo(2);
        assertThat(comments).first().hasFieldOrPropertyWithValue("likeCount", 22);
    }

    private void createComment(int likeCount, String comment) {
        Comment newComment = new Comment();
        newComment.setLikeCount(likeCount);
        newComment.setComment(comment);
        commentRepository.save(newComment);
    }
}
```





**예시 3) 페이징**

```java
public interface CommentRepository extends MyRepository<Comment, Long> {

    Page<Comment> findByCommentContainsIgnoreCase(String keyword, Pageable pageable);
}
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() {
        // Given
        this.createComment(33, "spring comment1");
        this.createComment(22, "SPRING comment2");

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "LikeCount"));

        // When
        Page<Comment> comments = commentRepository.findByCommentContainsIgnoreCase("Spring", pageRequest);

        // Then
        assertThat(comments.getNumberOfElements()).isEqualTo(2);
        assertThat(comments).first().hasFieldOrPropertyWithValue("likeCount", 33);
    }

    private void createComment(int likeCount, String comment) {
        Comment newComment = new Comment();
        newComment.setLikeCount(likeCount);
        newComment.setComment(comment);
        commentRepository.save(newComment);
    }
}
```





**예시 4) Stream**

```java
Stream<Comment> findByCommentContainsIgnoreCase(String keyword, Pageable pageable);
```

```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() {
        // Given
        this.createComment(33, "spring comment1");
        this.createComment(22, "SPRING comment2");

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "LikeCount"));

        // When
        try (Stream<Comment> comments = commentRepository.findByCommentContainsIgnoreCase("Spring", pageRequest)) {
            Comment firstComment = comments.findFirst().get();
            // Then
            assertThat(firstComment.getLikeCount()).isEqualTo(33);
        }
    }

    private void createComment(int likeCount, String comment) {
        Comment newComment = new Comment();
        newComment.setLikeCount(likeCount);
        newComment.setComment(comment);
        commentRepository.save(newComment);
    }
}
```





---

## 비동기 Query



메서드를 호출해서 실행하는 것을 별도의 쓰레드에 위임해야한다.

java 5가 제공하는 `Future` 는 non-blocking 하게 쓸 수 있다. `Future.get()` 에서 blocking 처럼 사용되어서 비동기 코드를 만들 수가 없다.

반면, spring 이 제공하는 `ListenableFuture` 는 비동기로 사용할 수 있다.



```java
@DataJpaTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Test
    public void crud() throws ExecutionException, InterruptedException {
        // Given
        this.createComment(33, "spring comment1");
        this.createComment(22, "SPRING comment2");

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "LikeCount"));

        // When
        ListenableFuture<List<Comment>> future =
                commentRepository.findByCommentContainsIgnoreCase("Spring", pageRequest);
        System.out.println("is done?" + future.isDone());

        future.addCallback(new ListenableFutureCallback<List<Comment>>() {
            @Override
            public void onFailure(Throwable throwable) {
                System.out.println(throwable);
            }

            @Override
            public void onSuccess(List<Comment> comments) {
                System.out.println(" Async 결과 ");
                System.out.println(comments.size());
            }
        });
    }

    private void createComment(int likeCount, String comment) {
        Comment newComment = new Comment();
        newComment.setLikeCount(likeCount);
        newComment.setComment(comment);
        commentRepository.save(newComment);
    }
}
```





그러나 이렇게 작성하면 문제가 있다.

**1) hibernate 가 똑똑해서 insert 를 하지 않는 문제**

기존에 동기적 코드 실행에서는 하이버네이트가 `findByCommentContainsIgnoreCase` 에서 생성하는 쿼리를 보고,

```java
this.createComment(33, "spring comment1");
this.createComment(22, "SPRING comment2");
```

위 두 생성 쿼리를  flush 를 한다. (persistent 상태에 있던 hibernate 쿼리를 DB에 보낸다.)

하지만, `ListenableFuture` 을 통해서 non-blocking 코딩을 해 놓은 이상 line 16~32 줄은 코드에 없다고 봐도 무방하다. 즉 첫 번째 쓰레드가 이 코드를 간직하고 있고, 두 번째 쓰레드는 이를 못보는 것이다. 따라서 하이버네이트는 이후에 실행할 쿼리가 없다고 생각하고 위 두 생성 쿼리를 flush 하지 않는다.

이 때문에 `flush` 코드를 직접 넣어주어야 한다.



**2) 메인 쓰레드가 먼저 끝나버리는 문제**

non-blocking 코드를 가져간 쓰레드의 코드는 비동기 코드가 호출될 것을 기다리고 있는데, 그 전에 메인 쓰레드가 끝나버린다. 즉 'Async 결과' 라는 문구는 테스트에서 출력되지 않는다. 이는 이 아랫줄에 메인쓰레드가 기다릴 수 있는 코드를 추가하거나, 비동키 코드를 호출하는 코드를 추가해서 해결한다.



**1), 2) 해결**

일단 메인 애플리케이션 위에 `@EnableAsync` 를 달아준다.

그리고 테스트코드를 수정하자.

```java
@Test
public void crud() throws ExecutionException, InterruptedException {
  // Given
  this.createComment(33, "spring comment1");
  this.createComment(22, "SPRING comment2");
  
  // 1) 문제해결
  commentRepository.flush();
  List<Comment> all = commentRepository.findAll();
  assertThat(all.size()).isEqualTo(2);

  PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "LikeCount"));

  // When
  ListenableFuture<List<Comment>> future =
    commentRepository.findByCommentContainsIgnoreCase("Spring", pageRequest);
  System.out.println("is done?" + future.isDone());

  future.addCallback(new ListenableFutureCallback<List<Comment>>() {
    @Override
    public void onFailure(Throwable throwable) {
      System.out.println(throwable);
    }

    @Override
    public void onSuccess(List<Comment> comments) {
      System.out.println(" Async 결과 ");
      System.out.println(comments.size());
    }
  });

  // 2) 문제해결
  Thread.sleep(5000l);
}
```





**3) 트랜잭션 문제** (미해결)

트랜잭션 문제가 있다. 한 쓰레드가 실행되고나서 다른 쓰레드는 첫번째 쓰레드의 쿼리를 확인하지 못한다. 한 트랜잭션에서 두 쓰레드가 실행되는데, 각 쓰레드는 스코프가 다르다. 서로 언제 끝날지 모르는 상황이고, 한 쓰레드의 영역에서 작동하는 쿼리를 다른 쓰레드에서 확인할 수 없다. 그래서 한 트랜잭션 아래에서 의도했던 쿼리를 수행할 수 없다.

어플리케이션에서 비동키 코드로 성능상 얻는 이점은 거의 없다. 쓰레드가 2개 작동하여, 한 쓰레드가 비동기 코드를 담당하는 동안, 메인 쓰레드가 동시에 다른 일을 (Thread.sleep) 하는 효율을 보인 정도이다. 속도에 성능을 주는 DB connection pool 연결 과정은 똑같다. 비동키 쿼리 테스트를 추천하지 않는 이유이다.

>  비동기 쿼리를 사용하려면 `WebFlux` 를 사용할 것을 추천한다. Reactive 를 지원하는 jdbc 데이터베이스는 없기 때문에, MongDB 같은 NoSQL 을 사용하면 된다.





