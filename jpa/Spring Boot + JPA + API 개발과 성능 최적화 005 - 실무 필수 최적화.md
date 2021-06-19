# Spring Boot + JPA + API 개발과 성능 최적화 005 - 실무 필수 최적화

## OSIV와 성능 최적화

- OSIV, Open Session In View : 하이버네이트 기준

- OEIV, Open EntityManger In View : JPA 기준

  관례상 OSIV 라 한다.

- `spring.jpa.open-in-view: true` true 기본값



### OSIV ON

![](https://i.ibb.co/BsDMQqv/image.png)



JPA 가 있는 스프링부트를 실행시키면 아래 WARN 로그가 나온다.

```shell
WARN 6185 --- [  restartedMain] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
```



OSIV 전략은 트랜잭션을 시작하고나서 API 응답이 끝날 때까지, 또는 화면인 경우 view 렌더링이 모두 끝날 때까지 데이터베이스 커넥션을 유지한다. 영속성컨텍스트가 데이터베이스를 물고, 지연로딩을 하기 위함이다.

하지만, 이 전략은 너무 긴 시간동안 데이터베이스 커넥션 리소스를 사용하게 된다. 실시간 트래픽이 중요한 애플리케이션에서는 커넥션이 모자랄 수 있고, 결국 장애로 이어질 수 있다. 예를 들어 컨트롤러에서 외부 API를 호출하면 외부 API 대기 시간 만큼 커넥션 리소스를 반환하지 않고 유지해야 한다.  



## OSIV OFF

![](https://i.ibb.co/CnXBJ5r/image.png)

- `spring.jpa.open-in-view: false`

트랜잭션을 종료할 때 영속성 컨텍스트를 닫고, 데이터베이스 커넥션도 반환하다. 커넥션 리소스를 낭비하지 않는다.

하지만, 지연로딩을 트랜잭션 안에서 처리해야 한다. 지연 로딩 코드를 모두 트랜잭션 안으로 넣어야 하는 단점이 있다. view template 에서 지연로딩이 동작하지 않는다.

트랜잭션 밖에서 지연로딩을 하면 `LazyInitializationException` 이 발생한다.

```shell
org.hibernate.LazyInitializationException: could not initialize proxy [co.wordbe.jpashop.domain.Member#1] - no Session
	at org.hibernate.proxy.AbstractLazyInitializer.initialize(AbstractLazyInitializer.java:170) ~[hibernate-core-5.4.31.Final.jar:5.4.31.Final] ...
```



<br />

### 커맨드와 쿼리 분리

실무에서 OSIV를 끈 상태에서 복잡성을 관리해보자. Command 와 Query 를 분리하는 것이 좋다.

→ 트랜잭션 외부 로직을 새로운 서비스를 만들어서 @Transactional 을 붙히고 그 안에 로직을 추가한다.



보통 비즈니스 로직은 특정 엔티티 몇개를 등록하거나 수정하는 것이므로 성능이 크게 문제되지 않는다. 하지만, 복잡한 화면을 출력하기 위한 쿼리는 화면에 맞추어 성능을 최적화하는 것이 중요하다. 하지만 그 복잡성에 비해 핵심 비즈니스에 큰 영향을 주지는 않는다.

따라서 크고 복잡한 애플리케이션 개발 시, 이 둘의 관심사를 명확하게 분리하는 선택은 유지보수성을 향상시킨다.

OrderService 를 분리하여

- OrderService : 핵심 비즈니스 로직
- OrderQueryService : 화면이나 API에 맞춘 서비스 (주로 읽기 전용 트랜잭션 사용, 조회용)

보통 서비스 계층에서 트랜잭션을 유지한다. 두 서비스 모두 트랜잭션을 유지하면서 지연 로딩을 사용할 수 있다.

> 고객 서비스의 실시간 API는 OSIV를 끄고, 
>
> ADMIN 처럼 커넥션을 많이 사용하지 않는 곳에서는 OSIV를 켠다.



