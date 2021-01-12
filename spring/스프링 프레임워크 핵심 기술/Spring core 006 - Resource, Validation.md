# Resource 와 Validation





## Resource 추상화



다양한 리소스를 읽어올 때는 Resource 클래스를 사용한다. 방법은 다양하다. 클래스패스 기준으로 리소스를 읽어올 수 있으며, ServletContext 기준의 상대 경로로 리소스를 불러올 수 있다. 



org.springframework.io.Resource 는

java.net.URL 을 한번 더 감싸서 추상화했다. 스프링 내부에서 많이 사용하는 인터페이스 이다.



<br />

아래 코드를 보자.

```java
...
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    ApplicationContext resourceLoader;
    // 더 명시적으로 아래와 같이 쓰는 것이 좋을 수도 있다. (ApplicationContext 는 ResourceLoader 를 상속받음)
    // ResourceLoader resourceLoader; 

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(resourceLoader.getClass());
				
      	// Resource 클래스
        Resource resource = resourceLoader.getResource("classpath:test.txt");

        System.out.println(resource.exists());
        System.out.println(resource.getDescription());
        System.out.println(Files.readString(Path.of(resource.getURI())));
    }
}

```



test.txt 파일은 resources 폴더에 위치하면 된다.

ApplicationContext 를 받아온 리소스로더로부터 `getResource()` 메소드로 특정 경로의 리소스를 불러올 수 있다.

이렇게 불러온 Resource 는 다양한 메소드를 지원한다. `getInputStream()`, `exist()`, `isOpen()`, `getDescrption()`, `getURI()` 등

또한 다양한 구현체가 있다.

* UrlResource 는 http, https, ftp, file, jar 프로토콜을 기본으로 지원한다.
* ClassPathResource 는 접두어 classpath: 를 지원한다.
* FileSystemResource : 접두어 file:/// 을 지원한다.
* ServletContextResource 는 웹애플리케이션 루트에서 상대 경로로 리소스를 찾는다. 기본값이다. 가장 많이 사용하는 리소스이다.

<br />

리소스를 읽어올 때는,

Resource 타입은 location 문자열과 ApplicationContext 타입에 의해 결정된다.

| ApplicationContext 타입         | Resource 타입          |
| ------------------------------- | ---------------------- |
| ClassPathXmlApplicationContext  | ClassPathResource      |
| FileSystemXmlApplicationContext | FileSystemResource     |
| WebApplicationContext           | ServletContextResource |



<br />

추가로 ApplicationContext 타입상관없이 문자열( file:///, claspath: )을 조작항 리소스타입을 정할 수 있다.



다시 위 예제를 보면,

ApplicationContext 를 가져와서 getResource()  안에  "test.txt"만 쓰면 기본적으로 ServletContextResource 로 Resource 타입이 잡힌다.

이렇게 되면 상대 경로에 test.txt 파일이 없기 때문에 URI를 가져오지 못한다.

이 때 classpath: 접두어를 앞에 붙여주면 `ClassPathResource` 로 타입이 지정된다. 따라서 resources 폴더 안에 있는 test.txt 파일의 URI 를 가져오고, 파일을 읽을 수 있게 된다.











---

## Validation 추상화



**org.springframework.validation.Validator**

주로 spring MVC 에서 사용하지만, 웹 MVC 전용은 아니다. 애플리케이션에서 사용하는 객체 검증을 위한 일반적 인터페이스이다.



예제를 만들기 위해 이벤트릃 하나 생성한다.

```java
@Getter
@Setter
public class RedEvent {
    Integer id;

    String title;
}
```



이제 위 이벤트를 가지고 Validator 를 구현해보자.

Validator를 사용하려면 두 가지 메소드를 구현해야 한다.

supports, validate

```java
public class RedEventValidator implements Validator {
    @Override
    public boolean supports(Class<?> aClass) {
        return RedEvent.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "title", "notempty", "제목이 있어야 합니다.");
    }
}
```





애플리케이션 러너에 이벤트와 에러를 등록한 후 `validate()` 메소드를 사용해보자.

```java
@Component
public class AppRunner implements ApplicationRunner {

  @Override
  public void run(ApplicationArguments args) throws Exception {
      // event 설정
      RedEvent event = new RedEvent();
      // error 설정
      // BeanPropertyBindingResult 는 spring MVC 가 직접 만들어준다.
      Errors errors = new BeanPropertyBindingResult(event, "event"); 

      RedEventValidator eventValidator = new RedEventValidator();
      eventValidator.validate(event, errors);

      errors.getAllErrors().forEach(e -> {
          System.out.println("-------- error code --------");
          Arrays.stream(e.getCodes()).forEach(System.out::println);
          System.out.println(e.getDefaultMessage());
      });
    }
  }
}
```


title 이 없을 때 에러가 발생하는 것을 보여준다.



<br />

---

**Springboot 에서 이를 더 쉽게 이용해보자.**



springboot 2.3 버전 이후 부터는 validation 을 따로 등록해야 한다.

pom.xml (maven)

```xml
...
				<dependency> 
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
```

build.gradle (gradle)

```gradle
depedencies {
	...
	implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```



이벤트에 아래와 같은 필드를 등록시키고 애노테이션을 넣어서 검증 조건을 추가해주자.

`@NotEmpty`, `@NonNull` 등의 애노테이션을 위해 spring-boot-starter-validation 의존성이 필요하다.

```java
@Getter
@Setter
public class RedEvent {
    Integer id;

    @NotEmpty
    String title;

    @NotNull @Min(0)
    Integer limit;

    @Email
    String email;
}

```



```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    Validator validator;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(validator.getClass());

        // event 설정
        RedEvent event = new RedEvent();
        event.setLimit(-1);
        event.setEmail("abc32®");
      
      	// error 설정
        Errors errors = new BeanPropertyBindingResult(event, "event"); 

        validator.validate(event, errors);
        System.out.println(errors.hasErrors());

        errors.getAllErrors().forEach(e -> {
            System.out.println("-------- error code --------");
            Arrays.stream(e.getCodes()).forEach(System.out::println);
            System.out.println(e.getDefaultMessage());
        });

    }
}
```

세가지 에러가 출력되는 것을 확인할 수 있다.











































