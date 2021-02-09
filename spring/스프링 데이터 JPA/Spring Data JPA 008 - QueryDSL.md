# Spring Data JPA 007 - QueryDSL





쿼리 메소드는 대부분 두 가지 중 하나로 결정된다.

* Optional\<T\> findOne(Predicate) : 어떤 조건으로 1개를 찾는다.
* List\<T\>|Page\<T\>|Iterable\<T\> ... findAll(Predicate) : 어떤 조건으로 여러개를 찾는다.
* 스프링 데이터는 `QuerydslPredicateExecutor` 인터페이스를 제공한다. 여러 메소드가 있지만 위의 2가지가 대표적이다.



**너무 긴 쿼리메소드는 무엇을 실행시키는지 읽기가 너무 어렵다** 그래서 쿼리 DSL 을 사용한다.



## QueryDSL

query domain specific lanaguage (쿼리 도메인 특화 언어) 를 말한다.

타입-세이프한 쿼리를 만들 수 있도록 돕는 라이브러리이다. JPA, SQL, MongoDB, JDO, Lucene, Collection 을 지원한다.



QueryDSL 을 사용해보자.

우선 메이븐에 의존성을 추가한다.

```xml
<!-- QueryDSL -->
<dependency>
  <groupId>com.querydsl</groupId>
  <artifactId>querydsl-apt</artifactId>
  <scope>provided</scope>
</dependency>
<dependency>
  <groupId>com.querydsl</groupId>
  <artifactId>querydsl-jpa</artifactId>
</dependency>
```

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>

      <configuration>
        <excludes>
          <exclude>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
          </exclude>
        </excludes>
      </configuration>
    </plugin>

    <!-- QueryDSL -->
    <plugin>
      <groupId>com.mysema.maven</groupId>
      <artifactId>apt-maven-plugin</artifactId>
      <version>1.1.3</version>
      <executions>
        <execution>
          <goals>
            <goal>process</goal>
          </goals>
          <configuration>
            <outputDirectory>target/generated-sources/java</outputDirectory>
            <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

이렇게 의존성을 추가해주었다면, 꼭 maven 을 compile 해주자. 인텔리제이에서는 maven 탭에서 컴파일을 더블클릭해주면 된다.

<br />

엔티티와 레포지토리를 만든다.

```java
@Getter @Setter
@Entity
public class Account {

    @Id @GeneratedValue
    private Long id;

    private String username;

    private String firstName;

    private String lastName;
}
```

레포지토리에는 `QuerydslPredicateExecutor`를 같이 상속받으면 된다.

```java
public interface AccountRepository extends JpaRepository<Account, Long>, QuerydslPredicateExecutor<Account> {
}
```





간단한 테스트를 만들어보자.

```java
@DataJpaTest
class AccountRepositoryTest {

    @Autowired
    AccountRepository accountRepository;

    @Test
    public void crud() {
        Predicate predicate = QAccount.account.firstName.containsIgnoreCase("Dorsey")
                            .and(QAccount.account.lastName.startsWith("Jack"));

        Optional<Account> one = accountRepository.findOne(predicate);
        assertThat(one).isEmpty();
    }
}
```

주의할 점은 Predicate 를 자동완성할 때 `querydsl` 것을 불러오자.



위 QueryDSL 은 `findByFirstNameIngoreCaseAndLastNameStartsWithIgnoreCase` 라는 쿼리메소드를 조금 더 읽기 편하게 만들어주었다.

















