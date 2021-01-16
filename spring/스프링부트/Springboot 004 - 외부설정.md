# Springboot - 외부설정, 프로파일



스프링부트 외부에서 변수설정을 할 수 있다.

예를 들면 application.properties 에 변수를 등록하면, `@Value` 어노테이션으로 값을 가져와 사용할 수 있었다.

또한 YAML 파일, 환경변수 등록, 커맨드라인 아규먼트 (`--var`) 로 외부 변수를 등록할 수 있다.



예를 들어보자.

**application.properties**

```shell
blue.name = river

blue.age=${random.int} # 랜덤 변수를 사용할 수도 있다.
blue.nameage = ${blue.name} ${blue.age} # 프로퍼티 안의 변수들을 다시 사용할 수도 있다.
```



애플리케이션 러너로 테스트를 해보자. `@Value` 어노테이션으로 프로퍼티 변수값을 가져올 수도 있다.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Value("${blue.age}")
    private int age;
  
    @Value("${blue.nameage}")
    private String nameage;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("-----------------------------");
        System.out.println(age);
	      System.out.println(nameage);
    }
}
```

스프링부트 메인 애플리케이션을 실행시키면 잘 동작한다. (인텔리제이 실행 :  `ctrl + R`)





여기서 커맨드라인을 통해 같은 아규먼트에 다른 값을 떠어주면 어떨까?

```shell
# 메이븐을 초기화하고 업데이트해준다.
$ mvn clean package

$ java -jar target/springgoman-0.0.1-SNAPSHOT.jar --blue.age=16
```

이렇게 하면 커맨드라인 명령의 우선순위가 높기 때문에 age는 16으로 바뀌어서 출력이 될 것이다.



> 프로퍼티 우선 순위
>
> 1. 유저 홈 디렉토리에 있는 spring-boot-dev-tools.properties
>
> 2. 테스트에 있는 @TestPropertySource
>
> 3. @SpringBootTest 애노테이션의 properties 애트리뷰트
>
> 4. 커맨드 라인 아규먼트
>
> 5. SPRING_APPLICATION_JSON (환경 변수 또는 시스템 프로티) 에 들어있는
>
>    프로퍼티
>
> 6. ServletConfig 파라미터
>
> 7. ServletContext 파라미터
>
> 8. java:comp/env JNDI 애트리뷰트
>
> 9. System.getProperties() 자바 시스템 프로퍼티
>
> 10. OS 환경 변수
>
> 11. RandomValuePropertySource
>
> 12. JAR 밖에 있는 특정 프로파일용 application properties
>
> 13. JAR 안에 있는 특정 프로파일용 application properties
>
> 14. JAR 밖에 있는 application properties
>
> 15. JAR 안에 있는 application properties
>
> 16. @PropertySource
>
> 17.  기본 프로퍼티 (SpringApplication.setDefaultProperties)

<br />



application.properties 가 어디서 사용되냐에 따라서도 우선순위가 생긴다.

1. file:../config/
2. file:../
3. classpath:/config/
4. classpath:/

기본적으로 classpath:/ 는 `/target/classes` 폴더로, 메이븐 패키지를 하면 이 안에 application.properites 가 들어있다. 따라서 1, 2, 3 경로에 application.properties 파일을 새로 만든다면 그 것이 우선순위가 높기 때문에 기존의 것을 덮어씌울 것이다.

file: 은 스프링부트 프로젝트 폴더경로를 말한다.



<br />

---

## @ConfiguratinProperties 로 외부설정



`@ConfiguratinProperties` 애노테이션을 이용하면 타입-세이프한 변수 받아오기가 가능하다.



아래와 같이 프로퍼티 클래스를 하나만들고, 위 애노테이션을 붙여 준 후, 빈으로 등록하자(`@Component`)

```java
@Getter @Setter
@Component
@ConfigurationProperties("blue")
public class BlueProperties {
    private String name;
    private int age;
    private String nameage;
    private Duration sessionTimeout = Duration.ofSeconds(30);
}

```

pom.xml 파일에도 아래의 의존성을 하나 추가해주어야 한다.

```xml
<!-- @ConfigurationProperties -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-configuration-processor</artifactId>
  <optional>true</optional>
</dependency>
```



<br />

그러면 다른 클래스에서 @Autowired 로 빈을 주입받아 사용할 수 있다. 여기 4가지 변수가 하나의 프로퍼티로 묶여서 사용될 수 있는 것이다.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    BlueProperties blueProperties;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("-----------------------------");
        System.out.println(blueProperties.getAge());
        System.out.println(blueProperties.getName());
        System.out.println(blueProperties.getNameage());
        System.out.println(blueProperties.getSessionTimeout());
    }
}
```



원래 `@ConfigurationProperties` 를 사용하라면 메인 클래스에 @EnableConfigurationProperties` 로 프로퍼티 클래스를 등록해야 하지만, 스프링부트에서는 자동으로 설정하게 되어있다.

또한 저렇게 `@Component` 로 빈 등록을 해준 것처럼, `@Bean` 으로 등록된 메소드에서도 똑같이 `@ConfigurationProperties` 어노테이션을 적용해줄 수 있다.



`@ConfigurationProperties` 의 장점은 융통성이 있는 바인딩(relaxed binding)이다. properties 파일에서 변수로 등록한  blue-name(케밥), blue_name(언더스코어), blueName(카멜) , 그리고 모두 대문자인 BLUENAME 의 모든 문자열을 같은 변수로 바인딩해준다. `@Value` 어노테이션보다 좋은 장점이 된다.

또한 properties 파일에서는 모든 것이 문자열로 작성되는데, 프로퍼티 클래스에서 자동으로 타입을 변환(conversion)할 수 있다. 

그리고 프로퍼티 값 검증도 할 수 있다. `@Validated` 어노테이션을 붙인 뒤 `@NotNull`, `@Min`, `@NotEmpty`, `@Email` 등의 어노테이션을 필드 위에 붙여서 쉽게 값 검증을 할 수 있다. 검증에 부적합 할 경우  `FailureAnalyzer` 가 예쁘게 에러메시지를 제공해준다.

또한 메타 정보를 생성해주어서 properties 파일에 자동완성기능이 생기기도 한다.





<br />

---

## 프로파일



프로파일 설정으로 개발환경을 구분할 수 있다.

`@Profile` 어노테이션을 `@Comfiguration` 또는 `@Component` 위에 같이 붙여주면 된다.



레드와 블루에 같은 이름의 빈이 등록되어 있다. 그런데 프로파일은 다르게 설정되어 있다. 여기서 레드만 이용하려면 어떻게할까?

```java
@Profile("prod")
@Configuration
public class RedConfig {
    @Bean
    public String hello() {
        return "(RedConfig) profile prod";
    }
}
```

```java
@Profile("test")
@Configuration
public class BlueConfig {
    @Bean
    public String hello() {
        return "(BlueConfig) profile test";
    }
}
```



<br />

### spring.profiles.active

application.properties 에 아래와 같이 활성화 프로파일을 prod 로 등록해주면 된다.

```shell
spring.profiles.active=prod
```



앱 러너에서 한번 확인해보자.

```java
@Component
public class AppRunner implements ApplicationRunner {
    @Autowired
    private String hello;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(hello); // 출력: (RedConfig) profile prod
    }
}
```

또한 위와 같이 하면, application-prod.properties 파일을 새로 만들어 리소스파일에 등록하여, 프로파일에서의 설정을 만들 수도 있다.

application-prod.properties

```shell
blue.name=(application-prod) blue name
```

blue.name 변수에 저 값이 들어간다.



<br />

### spring.profiles.include

또 하나의 추가기능은 새로운 프로파일을 추가하는 것이다.

proddb 프로파일을 추가해보자.



application.properties

```shell
spring.profiles.include=proddb
```



 application-{profile}.properties 형식의 파일을 리소스폴더에 만들어주면 된다.

application-proddb.properties

```shell
blue.age=300
```

blue.age 변수에 300이 설정된다.















