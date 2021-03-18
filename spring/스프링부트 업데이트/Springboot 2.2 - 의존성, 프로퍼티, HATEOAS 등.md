# Springboot 2.2 - 의존성, 프로퍼티, HATEOAS 등



스프링 부트 2.2 주요 변경 내역 (출시일 2019년 10월)

* 자바 13 지원
* 의존성 변경
* 초기화 지연을 통해 애플리케이션 구동 시간을 줄이는 기능을 추가 (모든 빈을 LAZY 로딩할 수 있는 옵션, 장단점이 있다.)
* Immutable 한 `@ConfigurationProperties` (lombok 과 같이 사용하면 좋은 기능)
* Actuator: health 그룹 지원

<br />

---

## Spring HATEOAS API 변경 내역



스프링 HATEOAS 0.25 에서 1.0 으로 업데이트시 많은 부분이 바뀌었다. 

스프링부트 2.2 부터는 스프링 HATEOAS 1.0 을 사용한다.

API가 바뀌어서 인터페이스, 메소드 이름이 많이 바뀌었다. 따라서 이전버전으로 코드를 작성했다면 코드를 잘 바꾸어 주어야한다..

* `ResourceSupport` → `RepresentationModel`
* `Resource` → `EntityModel`
* `Resources` → `CollectionModel`
* `PagedResources` → `PagedModel`

<br />

---

## 의존성 및 프로퍼티 변경

<br />

### 스프링 프레임워크 5.2 사용

* 스프링 WebFlux 기반 코틀린 코루틴 지원

* RSocket 지원 (네트워크 단 지원) - backpressure 지원

* R2DBC 지원 (jdbc 단 지원) - backpressure 지원

  > Non-blocking 처리도 하면서 back pressure 기능(데이터의 스트림 대기,캐시저장,취소,삭제 등의 처리)도 지원하는 reactive stream 을 구현하려고 노력한 버전

* JUnit5 Jupiter 5.7 지원

* `@Configuration` 에 `proxyBeanMethods` 속성 추가

  ```java
  @Configuration
  public class PostConfig {
  
      @Bean
      public Object postObject() {
          return new Object();
      }
  }
  ```

  ```java
  @Component
  public class PostAppRunner implements ApplicationRunner {
  
    @Autowired
    PostConfig postConfig;
  
    @Override
    public void run(ApplicationArguments args) throws Exception {
      System.out.println(postConfig.postObject());
      System.out.println(postConfig.postObject());
      System.out.println(postConfig.postObject());
      System.out.println(postConfig.postObject());
      System.out.println(postConfig.postObject());
    }
  }
  ```

  위와 같이 출력하면 모두 같은 값이 나온다. 분명 메소드를 여러번 호출했고, 각 호출마다 새로운 Object 객체를 생성해서 원래는 다른 객체가 나와야 정상이다. 

  하지만 Bean 으로 등록된 객체는 PostConfig 는 프록시가 만들어진다.(CGlib 사용) 프록시 안에서는 메소드가 호출되었을 때 맨처음에 만들어 놓았던 객체를 캐싱해놓았다가 동일한 객체를 반환하도록 만들어놓았다. 

  ```java
  @Configuration(proxyBeanMethods = false)
  public class PostConfig {
  
    @Bean
    public Object postObject() {
      return new Object();
    }
  }
  ```

  이렇게 설정하면 프록시 빈메소드가 더이상 작동하지 않고, 서로 다른 객체가 나오게 된다. (prototype)



<br />

### 스프링 Security 5.2

* OAuth 2.0 클라이언트 기능 코어에 추가
* OAuth 2.0 리소스 서버 기능 코어에 추가
* OAuth 2.0 인증 서버 기능은 별도의 커뮤니티에 분리 (spring-projects-experimental > spring-authorization-server)

<br />

### 스프링 데이터 Moore

* 선언적 리액티브 트랜잭션 지원 (`@Transactional`)
* 리액티브 QueryDSL
* 성능 향상

<br />

### 프로퍼티 이름 변경

* `logging.file` → `logging.file.name`
* `logging.path` → `logging.file.path`

<br />

---

## 애플리케이션 구동 성능 개선

<br />

스프링부틀를 애플리케이션을 최대한 빠르게 띄우려면

* `@Configuration(proxyBeanMethods = false)` 적용하여 프록시 빈 만들지 않도록 한다.

* `spring.main.lazy-initializaation=true` : ApplicationContext(BeanFactory) 만들 때 빈을 같이 만드는게 아니라, 최대한 나중으로 미룬다. 해당하는 빈을 처음으로 사용하게 될 때까지 미룬다.

* `spring.data.jpa.repositories.bootstrap-mode=lazy` : 스프링 레포지토리를 만드는 것을 처음 사용할 때까지로 미룬다.

* `spring.jmx.enabled=false` : 기본값이 false 이다. 

  >  JMX는 Java Management Extension 의 약자이고, 애플리케이션을 관리하고 제어하는 MBean 인터페이스를 제공해준다.
  >
  > `spring.jmx.enabled=false`로 되어있을 때 애플리케이션 구동 시 jconsole 이 MBean 이 들어있는 MBean Server 를 바라보게 하는 기능을 중지한다.

단점은?

* 애플리케이션 구동 시 처리할 작업을 나중으로 미뤘으므로, 런타임 작동시 요청처리 시간이 느려질 수 있다. (예) 초기화 되지 않은 빈을 만듦

* 애플리케이션 구동 시 발생해야 했던 에러가 애플리케이션 동작 중에 발생할 수 있다. (fail-fast 에 반하는 동작이다.)

  > Fail-fast
  >
  > 문제가 있을 때 빠르게 에러를 일으키고, 프로그램을 중지시킨다.

<br />

---

## @ConfigurationProperties 개선

<br />

### @ConfigurationPropertiesScan



예시) 프로퍼티 변수를 만들어보자.

applicatin.properties

```properties
# ConfigurationProperties
apple.count=2
apple.name=red
```

그리고 `@ConfigurationProperties`  어노테이션을 사용해서 프로퍼티를 등록한다.

```java
@Getter @Setter
@ConfigurationProperties(prefix = "apple")
public class AppleProperties {

  private int count;
  private String name;
}
```

이 때 인텔리제이에서 위에 팝업이 뜨는데, pom.xml 에 어노테이션 프로세서를 등록해주면 된다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-configuration-processor</artifactId>
  <optional>true</optional>
</dependency>
```

어노테이션 프로세서를 사용하면 IDE 툴에서 프로퍼티파일에서 등록된 프로퍼티의 자동완성을 지원해준다.

```java
@ConfigurationPropertiesScan
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

이제 `@ConfigurationPropertiesScan` 를 메인 애플리케이션 클래스 위에 붙여주고 실행시키면 된다.

`@ConfigurationPropertiesScan` 을 사용하면 `@ConfigurationProperties` 를 붙인 프로퍼티클래스를 따로 빈으로 등록하지 않아도 프로퍼티를 등록해준다.

`@Component` 로 붙히면 `@ComponentScan` 으로 빈으로 등록된다. 프로퍼티로 등록되지는 않는다.

따라서 `@ConfigurationPropertiesScan` 을 사용하도록 하고, `@Component` 는 빼는 것이 좋다.

<br />

### Immutable `@ConfigurationProperties` 지원

위 코드에서는 프로퍼티 변수를 setter 를 이용해서 바꿀 수 있는데 Immutable 로 만들어 이런 기능을 방지한다.

수정자(setter)가 아닌 생성자를 사용해서 프로퍼티를 바인딩할 수 있는 기능을 지원한다.

`@ConstructorBinding` 어노테이션을 사용하면 된다. 

이 방법은`@ConfigurationPropertiesScan` 또는`  `@ConfigurationProperties` 를 통해 빈으로 만드는 경우메나 작동한다.



생성자, getter, setter 등은 lombok 을 사용해서 줄이면 더 편하다.

```java
@Getter @AllArgsConstructor
@ConstructorBinding
@ConfigurationProperties(prefix = "apple")
public class AppleProperties {

  private int count;
  private String name;
}
```

<br />

---

## Actuator, health 엔드포인트 변경



### Actuator Health

health 엔드포인터를 연결하면 (`localhost:8080/actuator/health`) 애플리케이션이 상태 정보를 확인할 수 있다.

* `HealthContributor` 를 사용해서 커스텀한 health 체크를 추가할 수 있다.

* 스프링부트가 기본으로 다양한 구현체를 제공하고 있다.

  `HealthContributor` 인터페이스는 `CompositeHealthContributor` 와 `HealthIndicator` 라는 서브 인터페이스가 있고, 이에 대한 구현 클래스에 다양한 indicator 들이 이미 등록되어 있다. 각 인디케이터는 특정 상황에 맞게 상태를 측정하여 health 에 담아 제공한다.

정보를 출력하는 몇가지 옵션을 알아보자.

**application.properties**

```properties
# Actuator health

# status 정보만 기록
management.endpoint.health.show-components=always 

# status, details 정보 포함
management.endpoint.health.show-details=always
```

```json
// http://localhost:8080/actuator/health/

// show-components
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

<br />

스프링부트 2.2에서는 `/actuator/health` 엔드포인트 응답이 details 에서 components 로 바뀌었다.

```shell
$ curl -H "Accept: application/vnd.spring-boot.actuator.v2+json" http://localhost:8080/actuator/health
```

details 로 나온다.

```shell
$ curl -H "Accept: application/vnd.spring-boot.actuator.v3+json" http://localhost:8080/actuator/health
```

components 로 나온다.

<br />

### Health 그룹

여러 `HealthIndicator` 를 묶어서 설정할 수 있는 기능을 제공한다.

```properties
management.endpoint.health.show-components=always
management.endpoint.health.group.mygroup.include=ping,db
management.endpoint.health.group.mygroup.show-details=always
```

```json
// http://localhost:8080/actuator/health/

{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  },
  "groups": [
    "mygroup"
  ]
}
```

```json
// http://localhost:8080/actuator/health/mygroup

{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "H2",
        "validationQuery": "isValid()"
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```















