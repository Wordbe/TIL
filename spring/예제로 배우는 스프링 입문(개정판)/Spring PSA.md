# Spring PSA



Portable Service Abstraction

PSA는 잘 만들어진 인터페이스라고 할 수 있다. 각각의 개발자들이 만든 코드는 확정성이 좋지 못하거나 특정 기술에 특화되어 있을 수 있다.

개발자들이 공동으로 쓰는 모듈은 그 서비스가 추상화되어 각 개발자들이 통일적, 효율적, 그리고 보다 쉬운 코드 개발이 가능하다.



스프링 웹 MVC를 예를 들어보자. (Model View Controller)

`@Controller` 애노테이션이 붙은 클래스에서 `@GetMapping`, `@PostMapping` 등을 이용해서 원하는 url을 매핑시킬 수 있다.

한편 `@RequestMapping` 어노테이션을 붙인 클래스에서 `@RequestMapping(method=RequestMethod.GET)`,  `@RequestMapping(method=RequestMethod.POST` 사용하는 방법도 있다

기존 코드느 고치지 않고 위 두가지 방법 중 편하고 효율적인 방법을 사용하면 되는 것이다.



즉, 사용하고 싶은 서비스(http url 매핑)는 추상화되어 있으며, 다른 기술로 대체되어 기존 코드의 재사용이 가능하다.





이는 Servlet 기반의 웹서버를 만들지, Reactive로 할지 결정할 때도 생각해볼 수 있다.





또한 같은 코드이지만 다른 기술로 웹서버를 실행시킬 수 있다.

스프링부트 기본 웹애플리케이션서버(WAS)는 tomcat 을 이용한다.

하지만 Webflux 를 사용하면 Tomcat 이 아닌 Netty로 실행된다. (코드가 완벽하게 호환되지는 않는다.)

그 외 제티, 언더토우 등으로도 변경 가능하다.



---

## PSA 예시들





**1) `@Transactional`**

트랜잭션이라는 서비스를 사용하고 싶다. (트랜잭션은 DB의 정합성을 맞추기 위한 규칙이다. ACID)

위 애노테이션을 붙이면 DB 명령을 실행시켰을 때 트랜잭션 처리가 되도록 작성된다.

이 역시 PSA가 이용된다.

즉, JpaTransacionManager , DatasourceTransactionManager, HibernateTransactionManager 등 여러 구현체를 사용할 수 있다.



**2) CacheManager**

이 또한 JCacheManager, ConcurrentMapCacheManager, EhCacheCacheManager 등 여러 구현체 위에서 작동할 수 있도록 변경할 수 있고,

기존코드를 고치지 않아도 된다.





