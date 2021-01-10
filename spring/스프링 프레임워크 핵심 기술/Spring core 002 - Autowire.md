# Spring IoC - Autowire



**`@Autowired`**

의존성을 주입할 때 사용한다.

**필드, 세터, 생성자 위에 붙여 의존성을 주입할 수 있다.**



A클래스에 B클래스를 연결지어 보자(의존성을 주입해보자)

이 때, A는 빈에 등록되었고, B는 빈에 등록되어있지 않다.



A클래스의 생성자에 `@Autowired`를 붙일 경우, 주입하려는 B클래스가 빈에 등록되어 있지않으므로 바로 에러가 난다. 파라미터로 받는 B클래스가 빈 공장에서 찾을 수 없으므로 생성자가 생성되지 않아 A클래스가 만들어지지 않기 때문이다.

A의 필드나 세터 위에 붙일 경우도 에러가 난다. 하지만 이 때는 required 옵션으로 에러발생은 방지할 수 있다.

```java
@Autowired(required = false)
```

required 기본값은 true 이다. 생성자에는 이 옵션을 넣어봐도 에러가 발생한다. 이유는 위에서 설명했다.



<br />

---

### 같은 타입의 빈이 여러 개 등록되어 있는 경우

<br />

BookRepository 인터페이스가 있고, RedBookRepository 와 BlueBookRepository 가 있다고 생각해보자.

`@Autowired`로 연결되었을 경우 어떤 빈을 주입받아야할지 몰라 에러가 난다.



해결법은 사용할 빈(redBookRepository)에 `@Repository` 에 `@Primary` 를 붙이는 것이다. (추천)

또는 `@Autowired` 에 `@Qualifier("redBookRepository")` 를 붙인다.

또는 해당 타입의 빈을 모두 받으면 된다.

```java
@Autowired
List<BookRepository> bookRepositories;
```



받아온 빈이 내가 선택한 빈이 맞는지 쉽게 확인하기 위해 `ApplicationRunner`를 활용해보자.

**BookSerivceRunner** 를 같은 패키지 안에 만들어준다.

```java
@Component
public class BookServiceRunner implements ApplicationRunner {

    @Autowired
    BookService bookService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        bookService.printBookRepository();
    }
}

```

이렇게 만들면, 웹서버가 실행된 후 콘솔에서 확인할 수 있다.

BookService에 printBookRespository 도 만들어주면 된다.

```java
public void printBookRepository() {
  System.out.println(this.bookRepository.getClass());
}
```





<br />

---

### Autowired 가 작동하는 원리



`BeanPostPrecessor` 은 새로 만든 빈 인스턴스를 수정할 수 있는 라이프 사이클 인터페이스이다.

BeanFactory 의 라이프사이클 중 11번째에서 `BeanPostPrecessor`의  `postProcessBeforeInitialization` 를 실행시킨다.

여기서 `@Autowired` 로 연결된 빈 들의 의존성 주입이 일어난다.

더 정확히는 `BeanPostProcessor` 을 상속받은 `AutowiredAnnotationBeanPostProcessor` 가 애노테이션 처리기 역할을 한다.



`AutowiredAnnotationBeanPostProcessor` 빈은 아래에서 확인할 수 있다.

```java
package me.wordbe.springgoahead;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class BookServiceRunner implements ApplicationRunner {
  
    @Autowired
    ApplicationContext applicationContext;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        AutowiredAnnotationBeanPostProcessor bean = applicationContext.getBean(AutowiredAnnotationBeanPostProcessor.class);
        System.out.println(bean);
    }
}

```









