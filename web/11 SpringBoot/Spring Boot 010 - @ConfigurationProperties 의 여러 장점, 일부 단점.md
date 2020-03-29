# Spring Boot 010 - @ConfigurationProperties 의 여러 장점, 일부 단점



### 2.8.5 Third-party Configuration

클래스를 주석(annotate)하기 위해 `@ConfigurationProperties` 를 사용하는 것 뿐 아니라, `@Bean` 메소드에서도 사용할 수 있습니다.

건드릴 수 없는 클래스가 있을 때,

​	즉,

```java
@ConfigurationProperties("whiteship")
@Component
public class WhiteshipProperties {
    
}
```

라고 클래스 위에 어노테이션을 명시할 수 없을 때,

메인 클래스에 와서

```java
public class Application {

    @Bean
    @ConfigurationProperties("whiteship")
    public WhiteshipProperties whiteshipProperties() {
        return new WhiteshipProperties();
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

위와 같이 클래스를 바인딩 할 수 있습니다.

<br>

### 2.8.6 Relaxed Binding

`@ConfigurationProperties` 빈에 `Environment` 속성을 파인딩 하기 위해 완화된 규칙을 사용할 수 있습니다.

Kebab case → kebab-case

```java
@ConfigurationProperties(prefix="acme.my-project.person")
public class OwnerProperties {

    private String firstName;

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

}
```

위 코드에서, 속성 이름으로 아래 모두가 사용될 수 있습니다.

| Property                            | 내용                                                         |
| :---------------------------------- | :----------------------------------------------------------- |
| `acme.my-project.person.first-name` | Kebab case로 `.properties` 와 `.yml` 파일에서 사용을 권장합니다. |
| `acme.myProject.person.firstName`   | 표준 camel case 문법입니다.                                  |
| `acme.my_project.person.first_name` | Underscore notation으로, `.properties` 와 `.yml` 파일의 대안 형식으로 사용됩니다. |
| `ACME_MYPROJECT_PERSON_FIRSTNAME`   | Upper case 형식으로, 시스템 환경변수에서 사용하는 것을 권장합니다. |

annotation의 `prefix` 값은 반드시 kebab case여야 합니다.

<br>

### 2.8.8 Properties Conversion

커스텀 타입 변환이 필요하면 `ConversionService` 빈을 제공할 수 있습니다. 또는 property editor(`CustomEditorConfigurer`), 또는 custom `Converters`(`@ConfigurationPropertiesBinding`)를 사용할 수 있습니다.

>  요청하는 의존성은 생성시간에 충분히 초기화 되지 않을 수 있습니다. 



#### Converting durations

`java.time.Duration`을 드러내면(expose), 다음 포맷이 사용 가능합니다.

* 주기적인 `long` 표현
* `java.time.Duration`에서 사용된 ISO-8601 포맷
* 읽을 수 있는 포맷(10s 등)

기본 유닛은 밀리세컨드고, `@DurationUnit`을 사용해서 덮어쓰기(override)할 수 있습니다.

<br>

#### 2.8.9 @ConfigurationProperties Validation

Maven > starter-web > org.hibernate.validator:hibernate-validator:6.0.18.Final

이 있으면 `javax.validation`을 사용할 수 있습니다.



커스텀 Spring `Validator`을 추가할 수 있습니다. `@Bean`메소드는 `static` 으로 선언되어야 합니다. 설정 속성 validator는 어플리케이션 생명주기에서 매우 일찍 생성됩니다. `@Bean` 메소드를 static으로 선언하는 것은 `@Configuration` 클래스를 인스턴스화 하기 전에 빈을 생성하는 좋은 방법이 될 수 있습니다.

<br>

### 2.8.10. @ConfigurationProperties vs. @Value

| Feature                                                      | `@ConfigurationProperties` | `@Value` |
| :----------------------------------------------------------- | :------------------------- | :------- |
| [Relaxed binding](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config-relaxed-binding) | Yes                        | No       |
| [Meta-data support](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/appendix-configuration-metadata.html#configuration-metadata) | Yes                        | No       |
| `SpEL` evaluation                                            | No                         | Yes      |

@Value는 아주 순수한 포맷으로 바인딩 해야 합니다. 키 값이 완전히 똑같아야 합니다.

따라서 @ConfigurationProperties를 쓰는 것을 추천합니다.

<br>

SpEL : Spring Expression Language

가령 `whiteship.number2 = ${}` 등의 표현은 사용가능하지만,

`#`이 앞에 붙으면 사용하지 못합니다.

<br>

#### Meta-data Support

IDE 지원 기능입니다. properties 파일에서 자동완성을 지원합니다. 



---

**Reference**

https://www.youtube.com/watch?v=0QUNXpRHVVM&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=10

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config-conversion