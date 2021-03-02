# Java 003 - 리플렉션



## 1. 스프링의 DI(Depedency Injection)의 동작 원리

```java
@Repository
public class BookRepository {
}
```

```java
@Service
public class BookService {

    @Autowired
    BookRepository bookRepository;
}
```

```java
@SpringBootTest
class BookServiceTest {

    @Autowired
    BookService bookService;

    @Test
    public void di() {
        assertThat(bookService).isNotNull();
        assertThat(bookService.bookRepository).isNotNull();
    }
}
```

`bookService` 와 `bookRepository` 가 null 아닌 것을 테스트한다. 테스트는 성공한다. 왜 그럴까?





<br />

---

## 2. 리플렉션 API : 클래스 정보 조회

<br />



### Class\<T\> 에 접근하는 방법

클래스 인스턴스를 가져오는 방법

```java
public class App
{
    public static void main( String[] args ) throws ClassNotFoundException {
        // 1. 타입을 통한 클래스 인스턴스 가져오기
        Class<Book> bookClass =  Book.class;

        // 2. 인스턴스를 통한 클래스 인스턴스 가져오기
        Book book = new Book();
        Class<? extends Book> aClass = book.getClass();

        // 3. FQCN를 통한 클래스 인스턴스 가져오 (FQCN 에 해당하는 클래스 없으면 ClassNotFoundException 발생)
        Class<?> aClass1 = Class.forName("co.wordbe.book.Book");
    }
}
```

> FQCN : Fully Qualified Class Name



<br />

### Class\<T\> 를 통해 할 수 있는 것

* 클래스의 모든 필드 가져오기

```java
Class<Book> bookClass =  Book.class;
Arrays.stream(bookClass.getDeclaredFields()).forEach(System.out::println);
```

> `.getField()` 는 public 접근지시자가 붙은 필드만 가져온다.

<br />

* 모든 필드(목록)와 필드값(목록)을 같이 출력하기

```java
Class<Book> bookClass =  Book.class;

Book book = new Book();

Arrays.stream(bookClass.getDeclaredFields()).forEach(field -> {
  try {
    field.setAccessible(true);
    System.out.printf("%s %s\n", field, field.get(book));
  } catch (IllegalAccessException e) {
    e.printStackTrace();
  }
});
```

<br />

* 모든 메소드(목록) 가져오기

```java
Arrays.stream(bookClass.getMethods()).forEach(System.out::println);
```

* 모든 선언된 생성자 보기

```java
Arrays.stream(bookClass.getDeclaredConstructors()).forEach(System.out::println);
```

* 인터페이스(목록) 가져오기

```java
Arrays.stream(bookClass.getInterfaces()).forEach(System.out::println);
```

* 상위 클래스 찾기

```java
System.out.println(WhiteBook.class.getSuperclass());
```

* Modifier 로 메소드의 다양한 기능 불러오기

```java
Class<Book> bookClass =  Book.class;
Arrays.stream(Book.class.getMethods()).forEach(m -> {
  int modifiers = m.getModifiers();
});
```

이밖에 애노테이션 불러오기, 생성자 불러오기 등을 할 수 있다.

이렇게 리플렉션은 클래스 인스턴스를 조작할 수 있는 여러 기능들을 제공한다.





<br />

---

## 3. 애노테이션과 리플렉션



주요 애노테이션 속성은 아래와 같다.

* `@Retention` (애노테이션을 유지 범위: 소스, 클래스, 런타임)
* `@Inherited` (애노테이션을 하위 클래스까지 전달)
* `@Target` (어디에 붙여서 사용할지 결정: 타입, 필드, 메소드, 생성자, 어노테이션 타입 등)

<br />

### 어노테이션 생성

```java
public @interface BookAnnotation {
}
```

```java
@BookAnnotation
public class Book { ...
```

어노테이션을 새롭게 만든다음 `Book` 클래스 위에 붙여보았다.

어노테이션을 아무런 옵션을 주지 않으면 기본적으로 주석과 같다.  소스, 클래스까지는 주석이 유지된다. 하지만 바이트코드를 로딩했을 때 메모리 상에는 남지 않는다. 즉 실행하면 어노테이션의 역할은 아무역핟로 없다.

> `@Retention` 의 기본값은 `RetentionPolicy.CLASS` 이다.



애노테이션 정보를 확인하려면 javap 옵션으로 `-v` 를 넣어주면 된다.

```shell
$ javap -c -v /path/Book.class
```

어노테이션은 보이지 않는다.

<br />

이제  리텐션을 런타임까지 바꾸어 결과를 출력해보자. 

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface BookAnnotation {
}
```

리플렉션을 통해 해당 클래스에 붙어있는 어노테이션을 출력한다.

```java
public class App
{
    public static void main( String[] args ) {
        Arrays.stream(Book.class.getAnnotations()).forEach(System.out::println);
    }
}
```

위와같이 리플레션에서 `getAnnotations()` 메소드는 상속받은 어노테이션까지 조회한다.

자기자신에만 붙어있는 애노테이션을 조회하려면 `getDeclaredAnnotations()` 메소드를 사용하면 된다.



<br />

---

## 4. 리플렉션 API 2: 클래스 정보 수정 or 실행



리플렉션 API 의 기본적인 사용법을 소개한다.



아래와 같은 Book 클래스가 있다.

```java
public class Book {

    public static String pubSta = "public static";
  
    private String title = "title";

    public Book() {
    }

    public Book(String title) {
        this.title = title;
    }
  
  	private void priVoi() {
        System.out.println("private void");
    }

    public void pubVoi() {
        System.out.println("public void");
    }

    public int pubInt(int left, int right) {
        return left + right;
    }
}
```

리플렉션을 통해 클래스 정보를 가져와보자.

클래스를 로딩하는 3가지 방법 중 3번째 였던 FQCN 을 활용하는 방법을 사용해본다.

```java
public static void main( String[] args ) throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
  
  // 클래스 로딩
  Class<?> bookClass = Class.forName("co.wordbe.book.Book");
  
  // 생성자 가져오기
  Constructor<?> constructor = bookClass.getConstructor();
  
  // 인스턴스 생성
  Book book = (Book) constructor.newInstance();
  System.out.println(book);
}
```

위는 디폴트 생성자 (파라미터가 없는 생성자) 를 가져온 케이스이고, 아래와 같이 파라미터를 담아서 생성자를 가져올 수도 있다.

```java
Constructor<?> constructor = bookClass.getConstructor(String.class);
Book book = (Book) constructor.newInstance("제목");
```



<br />

필드도 가져와보자.

```java
// 이번에는 Book.class 클래스에서 바로 필드를 가져온다.
Field pubSta = bookClass.getDeclaredField("pubSta");

// .get(object) 에서 object 에 null을 담아준다. 모든 곳에서 공통으로 사용되는 static 필드이므로 객체를 넣어줄 필요가 없다.
System.out.println(pubSta.get(null));

// 값을 세팅할 때도, 첫 번째 인자는 인스턴스여야 하지만, static 필드이므로 null을 넣는다.
pubSta.set(null, "set public static");

System.out.println(pubSta.get(null));
```

> `.getField()` : `getDeclaredField` 와 다른 점은 `getField` 는 public 필드만 가져올 수 있다는 점이다.

<br />

static 이 아닌 일반 필드도 가져와보자.

```java
Field title = bookClass.getDeclaredField("title");
Book.class.getField()
title.setAccessible(true); // private 필드에 접근하기 위함
System.out.println(title.get(book));
title.set(book, "제목 바꿈");
System.out.println(title.get(book));
```

<br />

마지막으로 메소드도 가져와보자.

메소드를 실행하려면 `invoke()` 메소드를 사용하면 된다.

```java
Method priVoi = bookClass.getDeclaredMethod("priVoi");
priVoi.setAccessible(true);
priVoi.invoke(book);

Method pubInt = bookClass.getDeclaredMethod("pubInt", int.class, int.class);
int invoke = (int) pubInt.invoke(book, 100, 200);
System.out.println(invoke);
```



<br />

---

## 5. 커스텀 DI 프레임워크 만들기



`@Inject` 어노테이션을 필드 위에 붙이면, 

필드 인스턴스를 자동으로 생성해주는 의존성 주입 어노테이션을 만들어보자.

**/src**

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Inject {
}
```

<br />

**/test**

```java
public class BuyService {

    @Inject
    BuyRepository buyRepository;
}
```

```java
public class BuyRepository {
}
```

테스트 할 것은 아래와 같다.

```java
public class ContainerServiceTest {

    @Test
    public void getObject_BuyRepository() {
        BuyRepository buyRepository = ContainerService.getObject(BuyRepository.class);
      	// BuyRepository 인스턴스가 잘 생성되는지 테스트
        assertNotNull(buyRepository);
    }

    @Test
    public void getObject_BuyService() {
        BuyService buyService = ContainerService.getObject(BuyService.class);
      	// buyService 인스턴스가 잘 생성되는지 테스트
        assertNotNull(buyService);
      	// buyService 인스턴스를 생성하면 buyRepostiory 인스턴스도 자동으로 생성(Injection)되는지 테스트
        assertNotNull(buyService.buyRepository);
    }
}
```

<br />

**/src**

```java
public class ContainerService {

  public static <T> T getObject(Class<T> classType) {
    T instance = createInstance(classType);
    
    // (클래스 자기자신에서, 상속하는 클래스 제외) 선언된 필드를 순회
    Arrays.stream(classType.getDeclaredFields()).forEach(f -> {
      
      // 필드 중에 Inject 어노테이션이 붙어있으면
      if (f.getAnnotation(Inject.class) != null) {
        
        // 필드 타입의 인스턴스 생성
        Object fieldInstance = createInstance(f.getType());
        
        // private 필드도 접근 허용
        f.setAccessible(true);
        try {
          
          // 인스턴스 set
          f.set(instance, fieldInstance);
        } catch (IllegalAccessException e) {
          throw new RuntimeException(e);
        }
      }
    });
    return instance;
  }
	
  // 인스턴스 생성
  private static <T> T createInstance(Class<T> classType) {
    try {
      // 클래스 타입으로부터 리플렉션 사용하여 생성자 불러오고, 인스턴스 생성
      return classType.getConstructor(null).newInstance();
    } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
      throw new RuntimeException(e);
    }
  }
}
```



이렇게 한 후에는 인스톨 명령어를 실행시켜서, 위 내용이 담긴 코드를 `jar` 파일로 만든다. (로컬에 특정 경로에 생성됨)

```shell
$ mvn install
```

<br />

이제 다른 프로젝트를 실행해서, (아래 그룹 아이디, 아티팩트아이디, 버전 정보는 위에서 만든 프로젝트의 `pom.xml `에서 가져온다.)

```xml
<dependency>
  <groupId>co.wordbe</groupId>
  <artifactId>the-java</artifactId>
  <version>1.0-SNAPSHOT</version>
</dependency>
```

를 추가하면 여기서 만든 나만의 라이브러리를 사용할 수 있다.

`@Inject` 어노테이션으로 다른 클래스의 주입이 잘되는지 확인해볼 수 있다.





<br />

---

## 6. 리플렉션 정리

리플렉션은 쓰임새를 모르고 잘못 사용하면 아래와 같은 문제를 일으킬 수 있다.

* 기능이 강력한 만큼, 지나친 사용은 성능 이슈를 야기할 수 있다. 반드시 필요한 경우(Setter 가 없어서 리플렉션으로 대신 set 한다던가)에만 사용해야 한다.
* 컴파일 타임에 확인되지 않고 런타임 시에만 발생하는 문제를 만들 수 있다. (예. 어노테이션의 `RetentionType` 지정)
* 접근 지시자를 무시할 수 있다. (예. 강제로 `setAccessible(true)`)

<br />

**다른 프레임워크에서 리플렉션 사용 예시**

스프링에서는 리플렉션을 이용해서 의존성을 주입하고, MVC 뷰에 넘어온 데이터를 객체에 바인딩하기도 한다.

하이버네이트에서는 `@Entity` 클래스에 Setter 가 없다면 리플렉션을 사용한다.

그 외 JUnit 도 `ReflectionUtils` 등을 제공한다.





















