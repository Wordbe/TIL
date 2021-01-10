# Spring Framework Core





## 스프링

2003년 등장해서, java EE 와 호환관계이다. 서블릿 기반 애플리케이션을 만들 때 사용한다. 스프링 5부터는 WebFlux 지원으로 서블릿 기반 아닌 애플리케이션도 만들 수 있게 되었다.



### 디자인 철학

* 모든 선택은 개발자의 몫이다.
* 다양한 관점을 지향한다.
* 하위 호환성을 지킨다.
* API를 신중히 설계한다.
* 높은 수준의 코드를 지향한다.





---

## 컨테이너와 빈

IoC(Inversion of Control, 제어의 역전)은 의존성주입 (Dependency Injection)이라고도 하며 의존성있는 객체를 직접 만드는 것이 아닌, 주입 받아 사용하는 방법이다.

BeanFactory 는 스프링 IoC 컨테이너의 가장 최상위 인터페이스이다.



**빈이란?**

빈(bean)은 스프링 IoC 컨테이너가 관리하는 객체이다. 



**빈 장점**

1) 의존성 관리가 용이하다.

2) 빈으로 등록된 객체는 기본적으로 스코프가 '싱글톤'으로 정해진다.

* 싱글톤 : 객체가 하나만 만들어짐. 재사용하여 메모리를 절약하며, 런타임시 성능 최적화에 유리하다. 특히 데이터베이스와 관련된 객체들은 필드가 많기 때문에 만드는 비용이 많이 들기 때문에 싱글톤이 효율적이다.
* 프로토타입 : 매번 다른 객체가 만들어짐.

3) 라이프사이클 인터페이스를 지원해준다. 이를 활용할 수 있다.





**ApplicationContext**

* BeanFactory 를 포함한 다른 컨테이너를 상속받음.

  메시지 소스 처리 기능도 있고, 이벤트 발행 기능, 리소스 로딩 기능 등이 있다.

* 자주 사용하게 될 Beanfactory 이다.









---

## 다양한 빈 설정 방법





spring-boot-starter-web 의존성을 설정하면

관련 라이브러리들이 자동으로 다운받아진다.

* spring-beans
* spring-context
* spring-core
* spring-web
* spring-webmvc 등등





예제를 만들어보자.

- bookService 에 BookRepostory 객체를 주입시켜보자. bookService, bookRepostory 클래스는 같은 패키지에 있다.



**bookService**

```java
public class BookService {

    BookRepository bookRepository;

    public void setBookRepository(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
}
```

bookRepository를 불러와서 세터 메소드를 이용해 값을 입력한다.



<br />

#### 빈 설정 방법 1 - 원초적 방법



**resources/application.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="bookService"
          class="me.wordbe.springgoahead.BookService">
        <property name="bookRepository" ref="bookRepository" />
    </bean>

    <bean id="bookRepository"
          class="me.wordbe.springgoahead.BookRepository" />


</beans>
```

xml 설정파일에 두 클래스를 각각 빈으로 등록하고, bookService의 특성(프로퍼티)으로 bookRepository를 등록하여 참조하게 하면 된다.



```java
public class SpringApplication {

    public static void main(String[] args) {
        // bookService 와 bookRepository 가 IoC 컨테이너 (ApplicationContext) 에 빈으로 등록되었는지 확인한다.
        ApplicationContext context = new ClassPathXmlApplicationContext("application.xml");
        String[] beanDefinitionNames = context.getBeanDefinitionNames();
        System.out.println(Arrays.toString(beanDefinitionNames)); // bookService, bookRepository

        // bookService 에 bookRepository가 주입되었는지 확인해본다.
        BookService bookService = (BookService) context.getBean("bookService");
        System.out.println(bookService.bookRepository != null); // true
    }

}

```



<br />

### 빈 설정 방법 2 - spring 2.5 버전



역시 xml 파일을 설정해준다. component-scan 기능이 추가되었다.

**resources/application.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    
    <context:component-scan base-package="me.wordbe.springgoahead" />


</beans>
```



패키지의 각각 클래스에 애노테이션을 붙여서 빈을 등록한다.

```java
import org.springframework.stereotype.Repository;

@Repository
public class BookRepository {
}

```



```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookService {

    @Autowired
    BookRepository bookRepository;

    public void setBookRepository(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
}
```

빈을 등록하려면 `@Component` 애노테이션을 클래스 위에 붙여주면 된다.

`@Repository`, `@Service` 어노테이션을 추적하면 결국 `@Component` 애노테이션을 따라간다. 명시적으로 저장소와 서비스를 나타내 주기에 용이하다.

여기에 의존성을 주입할 때 (DI) `@Autowired` 애노테이션을 활용한다.



이렇게 되면 xml 설정파일에 빈을 등록하는 것보다는 조금 더 손쉽게 애노테이션으로 빈을 등록할 수 있고, 자바 파일에서 바로 확인 가능하다.





<br />

### 빈 설정 방법 3 - Java Config



위 두 클래스와 같은 패키지에 설정파일(java)을 만든다. xml 보다 뭔가 더 친근하다.



**ApplicationConfig.java**

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {

    @Bean
    public BookRepository bookRepository() {
        return new BookRepository();
    }

    @Bean
    public BookService bookService(BookRepository bookRepository) {
        BookService bookService = new BookService();

        // 의존성 주입 setter 이용
        bookService.setBookRepository(bookRepository);
        return bookService;
    }
}
```

설정 파일에서 빈 두개를 등록하고, 의존성 주입까지 했다.

이렇게 된 이상 나머지 두 클래스에서 애노테이션을 빼어도 빈 등록과 DI(의존성 주입)이 성공적으로 된 것이다.



메인 메소드를 살짝 수정한다.

```java
public class DemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(ApplicationConfig.class);
				// ...
    }

}

```

ApplicationContext (IoC 컨테이너)에 `AnnotationConfigApplicationContext` 를 통해 우리가 설정해 주었던 자바 설정 클래스를 등록해주어 빈팩토리를 받아온다.

( xml 설정에서는 `ClassPathXmlApplicationContext` 를 이용했었다. )





<br />



### 빈 설정 방법 4 - Java Config, ComponentScan



방법 3의 경우 기존 xml 에 bean 을 일일이 등록하던 것 처럼,  java config 파일에도 똑같은 행위를 해야 했다. component scan으로 이 문제를 해결해보자.



**ApplicationConfig.java**

```java
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackageClasses = SpringApplication.class) // 최상단 메인 클래스
public class ApplicationConfig {
}
```

컴포넌트스캔 애노테이션에 메인 클래스를 등록해줌으로써, 그 아래에 연관된 클래스에 등록된 모든 빈들을 알아서 스캔해주고 등록해주도록 한다.

물론, 각각 클래스 위에는 `@Component` 와 같은 애노테이션이 붙어야 하고, 의존성 주입을 위해 `@Autowired` 가 붙어야 한다.





<br />



### 빈 설정 방법 5 - springboot

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {
            String[] beanDefinitionNames = ctx.getBeanDefinitionNames();
            Arrays.stream(beanDefinitionNames).forEach(
                    System.out::println
            );
        };
    }
}
```



`@SpringBootApplication` 어노테이션에는 `@ComponentScan` 과 `@Configuration`이 내포되어 있다. 즉 자바 설정 파일자체가 이 어노테이션 하나로 완성된 것이다. 빈 등록, 의존성 주입을 알아서 해준다.

여기서 등록된 빈을 확인하기 위해 검색을 해보았는데 위와 같은 코드의 방법이 적절한 것 같다.

스프링 어플리케이션을 실행할 때 빈 등록이 된다. 그 때 커맨드라인에 등록된 빈이름들을 볼 수 있다. 내가 등록한 빈 말고도 수만은 빈들이 이미 등록된 것을 볼 수 있다.













