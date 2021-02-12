# Spring Data JPA 010 - JPA Repository



스프링 부트를 사용할 때는 `@EnableJpaRepositories` 가 자동으로 등록된다. `@SpringBootApplication` 안에 연결되어 있다. 스프링 부트는 사용하지 않는다면 `@Configuration` 과 위 어노테이션을 같이 사용해주면 JpaRepository를 사용할 수 있다.

JpaRepository 의 구현체인 SimpleJpaRepository 에 이미 `@Repository` 가 이미 붙어있기 때문에 빈 으로 등록하기 위해 JpaRespository 에 `@Repository` 를 꼭 붙이지 않아도 된다.

>  스프링이 제공하는 `@Repository` 는 SQLException 또는 JPA와 관련된 Exception을 스프링의 `DataAccessException` 으로 변환해준다.
>
>   예를 들어서 엔터티의 id 값을 생성하지 않고, 데이터베이스에 `save` 하려고 했다면, hibernate 에서는 `IdentifierGenerationException` 에러가 발생하는데, 이를 스프링의 `JpaSystemException` 의 하위 예외인 `JpaSystemException` 를 발생시켜준다. 



<br />

---

## JpaRepository.save()



`save` 는 insert, update 둘 다 할 수 있다.

`persist()` Transient Persistent

`id` 가 없으면 `Transient` 상태임을 인지하고, `save` 로 저장시 `persist()` 메소드를 사용하게 된다.

`id` 가 기존에 존재하면 `Detached` 상태임을 인지하고, `save`로 저장시 `merge()` 메소드를 사용한다.



**예제) Transient, Detached, Persistent 객체**

```java
// Transient
Post post = new Post();
post.setTitle("설날 연휴 공지");

// Persistent
Post savedPost = postRepository.save(post); // persist

assertThat(entityManager.contains(post)).isTrue();
assertThat(entityManager.contains(savedPost)).isTrue();
assertThat(savedPost == post).isTrue();

// Detached
Post updatedPost = new Post();
updatedPost.setId(post.getId());
updatedPost.setTitle("설날 연휴 공지(수정)");

// Persistent
Post savedUpdatedPost = postRepository.save(updatedPost); // merge

assertThat(entityManager.contains(updatedPost)).isFalse(); // merge 에서는 전달받은 객체의 복사본을 Persistent 상태로 만들고 전달하므로 detached 객체는 영속화되지 않음.
assertThat(entityManager.contains(savedUpdatedPost)).isTrue();
assertThat(savedUpdatedPost == updatedPost).isFalse();
```

이렇게 persist, merge 기 되는 엔티티를 구분하면서 코딩하는 것은 중요하고, 실수를 줄이는 방법은 `save`에 파라미터로 넘겨준 객체를 사용하는 것이 아니라 `save` 시에 반환되는 객체를 사용하는 것이다.





**예제 2) 영속화된 객체 vs 그렇지 않은 객체**

```java
@Test
public void crud() {
  Post post = new Post();
  post.setTitle("설날 연휴 공지");
  Post savedPost = postRepository.save(post);// persist

  Post updatedPost = new Post();
  updatedPost.setId(post.getId());
  updatedPost.setTitle("설날 연휴 공지(수정)");
  Post savedUpdatedPost = postRepository.save(updatedPost);// merge
	
  // updatedPost는 Detached 상태이므로 hibernate가 영속성 관리를 하지 않는다. 따라서 자동으로 업데이트 되지 않는다.
  updatedPost.setTitle("변경");

  List<Post> all = postRepository.findAll();
  assertThat(all.size()).isEqualTo(1);
}
```

Detached : 자동 변경되지 않음.







```java
// savedUpdatedPost는 Persistent 상태이므로 hibernate가 영속성 관리를 한다. 따라서 자동으로 업데이트 된다.
savedUpdatedPost.setTitle("변경");
```



Persistent : 자동 변경 됨.



managed 객체의 장점이다. update 를 명시하지 않아도 hibernate 가 객체 상태를 감지하다가 변경 필요하다고 판단하면 트랜잭션 완료 전에 모두 업데이트 하게 된다.

Hibernate 는 한 트랜잭션 안에서 데이터의 변화 상태를 감지하며, `select` 쿼리 실행 직전의 경우처럼 데이터의 값 반영이 꼭 필요한 시점에서 이전의 변경사항에 대해 업데이트한다. 하지만 변경해야한다는 로직이 있어도 필요없다고 느껴지면 데이터 변경을 데이터베이스에 반영하지 않는다.









