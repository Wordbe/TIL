# Spring Data JPA 006 - 도메인 이벤트





## 이벤트 프로그래밍

스프링 프레임워크는 이벤트 기능을 제공한다. 

`ApplicationContext` 는 `BeanFactory` 인터페이스를 상속받았고, `ApplicationEventPublisher` 인터페이스도 상속받은 인터페이스이다.

이벤트는 `ApplicationEvent` 를 상속받아 만들면 되고,

리스너는 `ApplicationListner`를 구현하여 만들면 된다. 또는 스프링부트가 제공하는 어노테이션 `@EventListener`를 사용해도 된다.



**1 이벤트 생성**

```java
@Getter
public class PostPublishEvent extends ApplicationEvent {

    private final Post post;

    public PostPublishEvent(Object source) {
        super(source);
        this.post = (Post) source;
    }
}
```

**2 이벤트 리스너 생성**

```java
public class PostListener {

    @EventListener
    public void onApplicationEvent(PostPublishEvent postPublishEvent) {
        System.out.println(postPublishEvent.getPost().getTitle() + " published.");
    }
}
```

이벤트 리스너는 bean 에 등록되어 있어야 테스트에서 사용할 수 있다. 지금 테스트는 `@DataJpaTest` 를 하고 있는데, 이는 데이터 관련된 `@Repository` 등의 것들만 빈으로 등록이 되기 때문에 위에 리스너는 빈에 등록되어있지 못하다. 따라서 `test` 폴더에 따로 설정파일을 만들어서 빈으로 등록해주는 방법이 깔끔하다.



**3 이벤트 리스너 빈 등록**

```java
@Configuration
public class PostRepositoryTestConfig {

    @Bean
    public PostListener postListener() {
       return new PostListener();
    }
}
```

<br />

> 또는 '테스트' 만을 위한 리스너라면  2번 3번을 묶어서 한번에 설정파일에 리스너를 등록하는 방법도 좋다.
>
> ```java
> @Configuration
> public class PostRepositoryTestConfig {
>     @Bean
>     public ApplicationListener<PostPublishEvent> postListener() {
>         return postPublishEvent ->
>                 System.out.println(postPublishEvent.getPost().getTitle() + " published.");
>     }
> }
> ```



테스트 코드를 보자.

```java
@DataJpaTest
@Import(PostRepositoryTestConfig.class)
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Autowired
    ApplicationContext applicationContext;

    @Test
    public void event() {
      	// Given
        Post post = new Post();
        post.setTitle("사내 휴일 공지 발표");
        PostPublishEvent event = new PostPublishEvent(post);

      	// When
        applicationContext.publishEvent(event);
    }
}
```

Then 을 안 만들어 덜 만든 것 같긴하지만 이벤트가 발행된 후, 이벤트 리스너가 잘 작동하는 지 확인할 수 있다.

> `@Import(PostRepositoryTestConfig.class)` 를 통해 `test` 디렉토리에 있는 설정 파일의 빈을 불러온다.



<br />

---

## 스프링 데이터 Common 이 제공하는 도메인 이벤트



스프링 데이터의 **도메인 이벤트 퍼블리셔**는 아래와 같다.

* `@DomainEvents`: 이벤트를 모아놓는다.
* `@AfterDomainEventPublication`:  모인 이벤트를 비운다.



`AbstractAggregateRoot` 는 스프링이 제공해주는 도메인 이벤트 publisher 이다.

엔터티에 상속받아서 등록할 수 있다.

```java
@Entity
public class Post extends AbstractAggregateRoot<Post> {

    ...

    public Post publish() {
        this.registerEvent(new PostPublishEvent(this));
        return this;
    };
}
```

`publish` 메소드를 새로 만들어주자.



테스트 코드를 보자.

```java
@DataJpaTest
@Import(PostRepositoryTestConfig.class)
class PostRepositoryTest {

    @Autowired
    PostRepository postRepository;

    @Test
    public void crud() {
        Post post = new Post();
        post.setTitle("book");

        // Transient
        assertThat(postRepository.contains(post)).isFalse();

      	// Post 의 메소드를 실행하면서 저장될 수 있다.
        postRepository.save(post.publish());
        // Persistent
        assertThat(postRepository.contains(post)).isTrue();

        postRepository.delete(post);
        postRepository.flush();
    }
}
```

17번째줄을 보자. 데이터를 save 하는 과정에서 도메인 이벤트가 실행될 수 있는 것을 볼 수 있다.

이 때 publish 메소드에 있었던 `registerEvent`를 통해 이벤트가 발행되고, 이벤트 리스너가 동작한다.

