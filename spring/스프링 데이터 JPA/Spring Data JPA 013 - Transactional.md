# Spring Data JPA 013 - Transactional



## Transaction





스프링 데이터 JPA가 제공하는 Repository의 모든 메소드는 `@Transactional`이 적용되어 있다.

**`@Transactional` 애노테이션**을 들여다 보자. 

클래스, 인터페이스, 메소드에 사용할 수 있고, 메소드에 가장 가까운 애노테이션의 우선순위가 높다.

`RuntimeException` 또는 `Error` 가 발생하면 rollback 이 자동으로 일어난다. 특별한 롤백 옵션을 추가할 수도 있다.

Transaction manager 를 설정할 수도 있지만 기본은 jpa `transactionManager` 를 사용한다.

<br />



Isolation 은 여러 레벨로 설정할 수 있고, 데이터의 동시성(성능)과 무결성(신뢰성)을 조절할 수 있다.

> **Isolation 의 여러 옵션**
>
> * DEFAULT : 데이터베이스 종류따라 다르지만 보통 READ_COMMITED 로 설정되어 있다.
> * READ_UNCOMMITTED : dirty read, non-repeatable read, phantom read 모두 발생할 수 있다. (성능은 좋다.)
> * READ_COMMITED : dirty read 를 막는다. non-repeatable read 와 phantom read 가 발생할 수 있다. 
> * REPEATABLE_READ : dirty read, non-repeatable read 를 막는다. phantom read 는 발생할 수 있다.
> * SERIALIZABLE : dirty read, non-repeatable read, phantom read를 모두 막는다. (성능이 가장 안좋다.)



Propagation 은 트랜잭션을 어떻게 전파시킬지 옵션을 설정할 수 있다.

> **Propagation 의 여러 옵션**
>
> * MANDATORY : 현재 트랜잭션을 지원하고, 아무것도 없다면 예외를 발생시킨다.
> * NESTED : 현재 트랜잭션이 존재하면 nested 트랜잭션안에서 실행한다. 그렇지 않으면 PROPAGATION_REQUIRED 처럼 행동한다.
> * NEVER : 트랜잭션하지 않게 실행한다. 트랜ㄴ잭션 존재하지 않으면 예외를 발생시킨다.
> * NOT_SUPPORTED : 트랜잭션하지 않게 실행한다. 트랜잭션 하나가 존재하면 그 트랜잭션을 지속한다.
> * REQUIRED : 현재 트랜잭션을 지원한다. 아무것도 없으면 새로운 것을 생성한다.
> * REQUIRES_NEW : 새로운 트랜잭션을 생성한다. 트랜잭션 하나가 존재하면 그 트랜잭션을 지속한다.
> * SUPPORTS : 현재 트랜잭션을 지원한다. 아무것도 없으면 트랜잭션하지 않게 실행한다.



<br />

JPA 구현체로 Hibernate를 사용할 때 데이터를 변경하는 연산이 없으면 성능을 위해 readOnly 를 true로 주는 것이 좋다.

```java
public interface CommentRepository extends JpaRepository<Comment, Long> {
  
    @Transactional(readOnly = true)
    <T> List<T> findByPost_Id(Long id, Class<T> type);
}
```

변경 사항이 없다면, 위와 같이 어노테이션을 달면 좋다.

이 때 flush 모드를 NEVER로 설정하게 되는데, persistent context 는 더 이상 변경을 감지하는 작업 (dirty checking)을 하지 않아도 되므로, 성능상 이점이 생긴다.

