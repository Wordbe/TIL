# Spring Data JPA 014 - Auditing





Auditing은 생성일자, 생성자, 수정일자, 수정자를 자동으로 등록할 수 있도록 도와준다.

엔티티의 변경 시점에 위 정보를 기록하는 기능이다.

예제를 보자.

```java
@Getter @Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    @Id @GeneratedValue
    private Long id;

    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    private Post post;

    ...

    @CreatedDate
    private Date created;

    @CreatedBy
    @ManyToOne
    private Account createdBy;

    @LastModifiedDate
    private Date updated;

    @LastModifiedBy
    @ManyToOne
    private Account updatedBy;
}
```

`@CreatedDate`, `@CreatedBy`, `@LastModifiedDate`, `@LastModifiedBy` 를 사용해서 각각을 만들었다.

`@EntityListeners(AuditingEntityListener.class)` 을 붙여주면 위 필드 4개를 자동으로 등록받을 수 있다.



단 생성한 사람, 수정한 사람을 추가하려면 아래 구현체를 추가로 구현해주어야 한다. Spring Security 를 통해 실제 사용자를 가져왔다고 가정하고 코드를 작성한다. 사용자를 찾았다면 리턴값으로 반환하면 된다.

```java
@Service
public class AccountAuditorAware implements AuditorAware<Account> {

    @Override
    public Optional<Account> getCurrentAuditor() {
        System.out.println("현재 유저를 찾고 있어요.");
        return Optional.empty();
    }
}
```

```java
@EnableJpaAuditing(auditorAwareRef = "accountAuditorAware")
public class Application { ...
```

그리고 `@EnableJpaAuditing` 를 메인 애플리케이션 위에 붙여주고 `accountAuditorAware` 빈을 등록해준다.



```java
@SpringBootTest
class CommentRepositoryTest {

    @Autowired
    CommentRepository commentRepository;

    @Autowired
    PostRepository postRepository;

    @Test
    public void getComment() {
      	// Given
        Post post = new Post();
        post.setTitle("안녕하세요.");
        Post savedPost = postRepository.save(post);

        Comment comment = new Comment();
        comment.setComment("댓글입니다.");
        comment.setPost(savedPost);
        comment.setUp(5);
        comment.setDown(2);
        commentRepository.save(comment);

      	// When
        List<Comment> all = commentRepository.findAll();

      	// Then
        assertThat(all.size()).isEqualTo(1);
    }
}
```

`@DataJpaTest` 는 데이터 관련된 부분의 빈만 등록해주므로, `accountAuditorAware` 빈은 찾지 못한다. 따라서 `@SpringBootTest` 로 통합테스트를 해보자. 실행이 잘 된다.





<br />

### JPA 의 라이프 사이클 이벤트

이벤트 리스너를 사용해서 Audit 기능으로 응요할 수도있다.

JPA 콜백으로 `@PrePersist`, `@PreRemove`, `@PostPersist`, `@PostRemove`, `@PreUpdate`, `@PostUpdate`, `@PostLad` 를 제공한다.

예를 들어서 `@PrePerist` 콜백에 생성날짜, 생성자를 입력하고, `@PreUpdate` 콜백에 수정날짜, 수정자를 입력할 수 있게 코딩할 수 있다.











