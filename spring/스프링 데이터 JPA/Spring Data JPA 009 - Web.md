# Spring Data JPA 009 - Web



스프링 데이터는 다양한 웹 지원 기능을 제공한다. 스프링부트를 사용할 시 모든 것이 자동 설정된다. 일반 스프링을 사용하는 경우 자바 설정 파일에  `@Configuration` 과 함께 `@EnableSpringDataWebSupport` 를 붙이면 된다.



Spring Data 가 지원하는 여러 웹 기능을 알아보자.

1. **도메인 클래스 컨버터**

2. **Pageable, Sort**

   `@RequestHandler` 메소드에서 Pageable, Sort 매개변수를 사용할 수 있다.

3. **HATEOAS**

   또한 Page 관련해서 HATEOAS 기능을 제공한다. `HATEOAS` 란 Hypermedia As The Engine Of Application State 의 약자로 쉽게 말해, 리소스 자원의 위치(uri)를 링크로 담아서 리소스 HTTP 요청에 같이 보내는 것을 말한다. 관련 클래스로 `PagedResourcesAssembler`, `PagedResource` 가 있다.

4. **Payload 프로젝션**

   `@ProjectedPayload`, `@XBRead`, `@JsonPath` 를 사용해서 가져오고 싶은 데이터의 일부를 지정할 수 있다.  즉 요청으로 들어오는 데이터 중 일부만 바인딩해서 받아오는 것이다. 

5. **추가 기능**

   핸들러의 매개변수(요청 쿼리 매개변수)를 QueryDSL 의 Predicate 로 바꾸어준다.



<br />

---

## DomainClassConverter



`DomainClassConverter`를 보면, 자동으로 `ConverterRegistry` 를 상속받고 있도록 등록되어 있다. `ConverterRegistry` 에 들어가면, 스프링 MVC 에서 어떤 데이터를 바인딩 받을 때 등록된 것을 사용하게 된다. `DomainClassConverter`에는 크게 ToEntityConverter, ToIdConverter 가 등록이 된다. `id`, `Entity` 간 상호 변화를 할 수 있도록 돕는다.



먼저 Post 엔티티와 레포지토리, 컨트롤러를 만들고 테스트를 만들어보자.

```java
@Getter @Setter
@Entity
public class Post {

    @Id @GeneratedValue
    private Long id;

    private String title;

    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
}
```

```java
public interface PostRepository extends JpaRepository<Post, Long> {
}
```

```java
@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;

    @GetMapping("/posts/{id}")
    public String getPost(@PathVariable Long id) {
        Optional<Post> byId = postRepository.findById(id);
        Post post = byId.get();
        return post.getTitle();
    }
}
```

```java
@SpringBootTest
@AutoConfigureMockMvc
public class PostControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    PostRepository postRepository;

    @Test
    public void getPost() throws Exception {
      	// Given
        Post post = new Post();
        post.setTitle("Jack");
        postRepository.save(post);

      	// When
        mockMvc.perform(get("/posts/8"))
                .andDo(print())
        // Then
                .andExpect(status().isOk())
                .andExpect(content().string("Jack"))
                ;
    }
}
```



여기서 우리는 컨트롤러에서 id 로 받은 파라미터를 직접 Post 객체로 바꿔준 후, 제목을 리턴했다. 그런데 `DomainClassConverter` 는 이를 자동으로 변환해주므로, 코드를 단축할 수 있다.

```java
@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;

    @GetMapping("/posts/{id}")
    public String getPost(@PathVariable("id") Post post) {
        return post.getTitle();
    }
}
```

유용하게 쓰면 좋을 것 같다.



<br />

---

## Pageable, Sort 매개변수

 

Pageable 을 쓰면 그 안에 Sort 도 같이 있기 때문에 Pageable 을 사용하는 것이 좋다.

스프링 MVC의 `HandlerMethodArgumentResolver` 는 스프링 MVC 핸들러 메소드에서 매개변수로 받을 수 있는 객체를 확장하고 싶을 때 사용할 수 있는 인터페이스이다. 이를 통해 Pageable, Sort 파라미터를 받을 수 있다.

<br />

테스트를 만들어보자. `GET` 요청할 때 파라미터를 준다. Pageable 이 제공하는 `page`, `size`, `sort` 등의 속성 매개변수를 넣어서 요청해보자.

아래와 같이 요청했다면 `localhost:8080/posts` URI 요청에 `?page=0&size=10&sort=created,desc&sort=title` 가 추가되었을 것이다.

```java
@Test
public void getPosts() throws Exception {
  // Given
  Post post = new Post();
  post.setTitle("Jack");
  postRepository.save(post);

  // When
  mockMvc.perform(get("/posts")
                  .param("page", "0")
                  .param("size", "10")
                  .param("sort", "created,desc")
                  .param("sort", "title"))
    .andDo(print())
    // Then
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.content[0].title", is(equalTo("Jack"))));
  ;
}
```

컨트롤러에는 아래 메소드를 추가한다.

```java
@GetMapping("/posts")
public Page<Post> getPosts(Pageable pageable) {
  return postRepository.findAll(pageable);
}
```





<br />

---

## HATEOAS



HATEOAS 를 제공하는 의존성을 추가한다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
```



아래와 같이 만들어주면, 기존 객체를 `EntityModel` 로 감싸는 순간 HATEOAS 엔티티 모델을 만들고, `PagedModel`로 감싸서 Peagable 정보를 함께 묶는 객체가 된다(DTO 역할). 핸들러 매개변수로는 `PagedResourcesAssembler` 를 사용해서 Page 객첼ㄹ 손쉽게 PagedModel 로 변환시킬 수 있다.

```java
@GetMapping("/posts")
public PagedModel<EntityModel<Post>> getPosts(Pageable pageable, PagedResourcesAssembler<Post> assembler) {
  return assembler.toModel(postRepository.findAll(pageable));
}
```

그리고 이 페이지 정보에는 페이지에 해당하는 링크가 담겨져 들어가게 된다.

<br />

테스트를 작성해보자. 스프링 HATEOAS 를 사용하여 전달된 `PagedModel` 모델에는 기존 객체의 필드들의 집합들이 `_embedded.postList` 속성안에 묶여서 들어가게 된다.

```java
@Test
public void getPosts() throws Exception {
  createPosts();

  mockMvc.perform(get("/posts")
                  .param("page", "2")
                  .param("size", "10")
                  .param("sort", "created,desc")
                  .param("sort", "title"))
    .andDo(print())
    .andExpect(status().isOk())
    .andExpect(jsonPath("$._embedded.postList[0].title", is(equalTo("Jack"))));
  ;
}

private void createPosts() {
  int postsCount = 100;

  while(postsCount > 0) {
    Post post = new Post();
    post.setTitle("Jack");
    postRepository.save(post);
    postsCount--;
  }
}
```

잘 작동하는 것을 볼 수 있다.











 