# Java 004 - 프록시



`java.lang.reflect` 패키지에 프록시 클래스가 들어있다.

> 프록시 = 대리, 대리인
>
> **프록시패턴**
>
> 기존 코드를 건드리지 않고, 프록시가 대신 원하는 기능을 추가하는 형태의 프로그램이다.



## 스프링 데이터 JPA 동작 원리

엔티티의 Repository 를 만들 때, `@Repository` 라는 어노테이션을 붙이지 않아도 알아서 빈으로 등록해준다.

그리고 `JpaRepository` 를 상속받은 엔티티 레포지토리 인터페이스는 이미 구현해놓은 구현체의 메소드를 그대로 이용할 수 있다.

이런 일이 어떻게 가능한 것일까?

<br />

> 스프링 데이터 JPA 에서 인터페이스 타입의 인스턴스는 스프링 AOP 기반으로 만들어진다. `RepositoryFactorySupport` 에서 프록시를 생성한다.
>
> 이 말이 무엇인지 파헤쳐 보자.

<br />

---

## 프록시 패턴



다음의 관계로 프록시 패턴을 만든다.

* 클라이언트 →(실행) 서브젝트
* 서브젝트의 구현체 리얼 서브젝트
* 서브젝트의 또 다른 구현체 프록시
* 프록시 →(실행) 리얼서브젝트

> * 프록시와 리얼 서브젝트가 공유하는 인터페이스가 있고, 클라이언트는 인터페이스 타입으로 프록시를 사용한다.
> * 클라이언트는 프록시를 거쳐 리얼 서브젝트를 사용하기 때문에 프록시는 리얼 서브젝트에 대한 접근을 관리하거나 부가 기능을 ㅈ공하거나, 리턴값을 변경하는 것 등을 할 수 있다.
> * 리얼 서브젝트는 자신이 해야할 일(SRP, Single Responsibility principle)을 하면서 프록시를 사용해서 부가적 기능(접근 제한, 로깅, 트랜잭션 등)을 제공할 때 주로 **프록시 패턴**을 사용한다.

<br />



예제)

`클라이언트` 관점에서 Test 를 진행한다.

```java
@SpringBootTest
class BookServiceTest {

    BookService bookService = new BookServiceProxy(new DefaultBookService());

    @Test
    public void di() {
        Book book = new Book();
        book.setTitle("봄날");
        bookService.rent(book);
    }
}
```

`클라이언트` 가 실행시키고자 하는 `서브젝트`는 인터페이스 BookService이다.

```java
public interface BookService {
  
    void rent(Book book);
}
```

이 `인터페이스` 아래에는 DefaultBookService 라는 `리얼 서브젝트` 구현체가 있다.

```java
public class DefaultBookService implements BookService{

    public void rent(Book book) {
      	// 1
        System.out.println("rent: " + book.getTitle());
    }
}
```

<br />

이제 이 구현체에 특별한 기능을 추가하는 요구사항이 있다고 해보자.

1번 코드 전, 후에 `proxy start`, `proxy end` 를 출력하는 것이다.

그런데 `리얼 서브젝트`는 건드리지 않고 프록시 패턴으로 이 목표를 달성해보자.

`프록시` 클래스는 아래와 같다.

```java
public class BookServiceProxy implements BookService {

    BookService bookService;

    public BookServiceProxy(BookService bookService) {
        this.bookService = bookService;
    }

    @Override
    public void rent(Book book) {
        System.out.println("proxy start");
        bookService.rent(book);
        System.out.println("proxy end");
    }
}
```

같은 인터페이스를 구현하여서, `서브젝트`를 생성자에서 받아온다. 그리고 `서브젝트`의 메소드를 실행해시켜주면 `리얼 서브젝트`의 코드가 작동할 것이다.

우리는 여기서 앞 뒤로 원하는 코드를 넣어주면 된다.





<br />

---

## 다이나믹 프록시

프록시 패턴은 구현하기 번거롭다는 단점이 있다. 그래서 매번 프록시 코드를 만드는 것이 아니라, 리플렉션을 통해서 동적으로 상황에 맞게 프록시 코드를 구현할 수 있다. 이를 다이나믹 프록시라 한다.

> 다이나믹 프록시: 런타임에 특정 인터페이스들을 구현하는 클래스 또는 인스턴스를 만드는 기술이다.
>
> * 스프링 데이터 JPA
> * 스프링 AOP
> * Mockito
> * Hibernate lazy initialization 등에서 사용된다.





위에서 만들었던 `BookServiceProxy` 클래스는 더 이상 사용하지 않는다.

아래 `returnBook` 이라는 메소드를 새로 만들어서, `rent()` 에는 적용하고, `returnBook` 에는 적용하지 않는 코드를 만들어보자.

```java
public interface BookService {

    void rent(Book book);

    void returnBook(Book book);
}
```

```java
public class DefaultBookService implements BookService{

    public void rent(Book book) {
        System.out.println("rent: " + book.getTitle());
    }

    public void returnBook(Book book) {
        System.out.println("return: " + book.getTitle());
    }
}
```



이제 클라이언트에서 동적 프록시 코드를 만들어보자.

`Proxy.newProxyInstance` 를 사용하면 된다.

```java
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

@SpringBootTest
class BookServiceTest {

    BookService bookService = (BookService) Proxy.newProxyInstance(BookService.class.getClassLoader(), new Class[]{BookService.class},
            new InvocationHandler() {
                BookService bookService = new DefaultBookService();
                @Override
                public Object invoke(Object o, Method method, Object[] args) throws Throwable {
                    if (method.getName().equals("rent")) {
                        System.out.println("proxy start");
                        Object invoke = method.invoke(bookService, args);
                        System.out.println("proxy end");
                        return invoke;
                    }

                    return method.invoke(bookService, args);
                }
            });

    @Test
    public void di() {
        Book book = new Book();
        book.setTitle("봄날");
        bookService.rent(book);
        bookService.returnBook(book);
    }
}
```



위 방법의 제약사항

* 클래스 타입에서는 동적 프록시 코드를 만들지 못한다. 
* 인터페이스에서만 구현한다.

유연한 구조가 아니므로 스프링 AOP 가 등장하였으니, 이를 사용하면 좋을 것 같다.





<br />

---

## 클래스 프록시



### CGlib 사용

CGlib 은 스프링, 하이버네이트 등에서 사용한다.

하지만 버전 호환성이 좋지 않아서 서로 다른 라이브러리 내부에 내장된 형태로 제공되기도 한다.

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib</artifactId>
  <version>3.3.0</version>
</dependency>
```

```java
public class BookService {

  public void rent(Book book) {
    System.out.println("rent: " + book.getTitle());
  }

  public void returnBook(Book book) {
    System.out.println("return: " + book.getTitle());
  }
}
```

```java
@SpringBootTest
class BookServiceTest {

    MethodInterceptor handler = new MethodInterceptor() {
        BookService bookService = new BookService();
        @Override
        public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
            if (method.getName().equals("rent")) {
                System.out.println("proxy start");
                Object invoke = method.invoke(bookService, args);
                System.out.println("proxy end");
                return invoke;
            }
            return method.invoke(bookService, args);
        }
    };
    BookService bookService = (BookService) Enhancer.create(BookService.class, handler);

    @Test
    public void di() {
        Book book = new Book();
        book.setTitle("봄날");
        bookService.rent(book);
        bookService.returnBook(book);
    }
}
```

<br />

### ByteBuddy

바이트 코드 조작 뿐만 아니라 런타임(다이나믹) 프록시를 만들 때도 사용할 수 있다.

```xml
<dependency>
  <groupId>net.bytebuddy</groupId>
  <artifactId>byte-buddy</artifactId>
  <version>1.10.18</version>
</dependency>
```

```java
public class BookServiceTest {

  @Test
  public void di() throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
    Class<? extends BookService> proxyClass = new ByteBuddy().subclass(BookService.class)
      .method(named("rent")).intercept(InvocationHandlerAdapter.of(new InvocationHandler() {
      BookService bookService = new BookService();

      @Override
      public Object invoke(Object o, Method method, Object[] args) throws Throwable {
        System.out.println("proxy start");
        Object invoke = method.invoke(bookService, args);
        System.out.println("proxy end");
        return invoke;
      }
    }))
      .make().load(BookService.class.getClassLoader()).getLoaded();

    BookService bookService = proxyClass.getConstructor(null).newInstance();

    Book book = new Book();
    book.setTitle("봄날");
    bookService.rent(book);
    bookService.returnBook(book);
  }
}
```



단 위 두 방법들(CGlib, Bytebuddy)은 클래스가 상속받지 못하게 구조가 되어있을 경우 프록시를 만들 수 없다.

* 예를 들어  final 클래스인 경우(상속 X), private 생성자만 있는 경우(상속 X) 등이 있다.

  > 자식 클래스는 부모 클래스를 상속받을 때 부모 클래스의 생성자를 호출하므로, private 생성자로 되어있으면 접근하지못해 상속받지 못한다.



따라서 인터페이스를 사용하는 방법을 권장한다.



<br />

---

## 동적 프록시 예시



### Mockito

```java
public class BookService {

  BookRepository bookRepository;

  public BookService(BookRepository bookRepository) {
    this.bookRepository = bookRepository;
  }

  public void rent(Book book) {
    Book save = bookRepository.save(book);
    System.out.println("rent: " + save.getTitle());
  }

  public void returnBook(Book book) {
    bookRepository.save(book);
  }
}
```

```java
public class BookServiceTest {

  @Test
  public void di() {
    BookRepository bookRepositoryMock = mock(BookRepository.class);
    Book hibernateBook = new Book();
    hibernateBook.setTitle("mock object hibernateBook");
    when(bookRepositoryMock.save(any())).thenReturn(hibernateBook);

    BookService bookService = new BookService(bookRepositoryMock);

    Book book = new Book();
    book.setTitle("봄날");
    bookService.rent(book);
    bookService.returnBook(book);
  }
}
```

`Mockito`의 프록시 기능을 이용해서 bookRepository 객체를 stubbing 을 할 수 있다. (인터페이스 가짜 객체를 만들어놓고, 조건적으로 사용될 때까지 대기시킨다.)

<br />

### Hibernate

**lazy initialization**

```java
@Getter @Setter
@Entity
public class Book {

    @Id @GeneratedValue
    private Long id;

    private String title;

    @OneToMany
    private List<Note> notes;
}
```

```java
@Getter @Setter
@Entity
public class Note {

    @Id @GeneratedValue
    private Integer id;

    private String title;
    
}
```

Hiberante 에서 기본 fetching 전략이 lazy이다. Book 엔티티를 가져올 때 Note 데이터를 같이 가져오지 않는다. Note 객체를 가져오긴 하나, 가짜 객체(프록시)를 만든다. 그리고 실제 Note 에 접근할 때 쿼리가 발생한다.

