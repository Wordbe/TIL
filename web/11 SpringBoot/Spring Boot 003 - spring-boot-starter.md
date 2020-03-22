# Spring Boot 003 - spring-boot-starter



# 1. Starters

의존성들이 충돌나지 않도록 도와줍니다.

`spring-boot-starter-data-jpa` 등을 바로 연동해서 쓸 수 있습니다.

공식적인 starter는 `spring-boot-starter-*` 규칙을 따릅니다. 이 이름 구조는 starter를 찾기 위함입니다. 



[커스텀 Starter 만들기](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-custom-starter) 를 알아봅시다. 써드파티(third party) 스타터는 공식 artifacts 이름인 `spring-boot`로 시작하면 안됩니다. `thirdpartyproject-spring-boot-starter` 이런 식으로 이름을 짓는 것이 좋습니다.



---

### Creating Your Own Starter

* `autoconfigure`은 자동 설정 코드를 포함합니다.
* `starter` 모듈을 `autoconfigure` 모듈을 포함하여 추가적인 의존성을 제공합니다.

하나의 모듈에서 두 가지 역할을 만들 수 있게 하셔도 좋습니다.



#### Naming

configurate 키(key)를 제공할 때, Spring Boot 에서 사용하는 네임스페이스(namespaces) 안의 키 (`server`, `management`, `spring` 등)를 포함하지 말아야 합니다. 



#### `autoconfiguration` Module

* 라이브러리와 함께 시작해야 하는 것들을 포함하는 모듈입니다.

> 라이브러리는 모두 optional 로 정의합니다. 이로써 특정 라이브러리가 없더라도 작동이 가능하게하고, 특정 라이브러리가 있어야 실행되게 함으로써 autoconfigure 모듈을 쉽게 추가할 수 있습니다. 



#### `starter` Module

starter는 텅 빈 jar 파일이며, 유일한 목적은 라이브러리와 같이 작동해야할 때 필요한 의존성을 제공하는 것입니다.

스타터가 다른 스타터를 필요로 한다면, 반드시 명시를 해놓아야 합니다. 불필요한 의존성을 포함하는 것을 피해야 합니다. 즉, 선택적 의존성(optional dependency)을 추가하지 말아야 합니다. 

> optional dependency?
>
> ```xml
> <dependencies>
>     <dependency>
>         <groupId>org.springframework.boot</groupId>
>         <artifactId>spring-boot-starter-web</artifactId>
>         <optional>true</optional>
>     </dependency>
> </dependencies>
> ```
>
> 소스 코드 안에서 위와 같이 작성하면, 어떤 조건에 따라 의존성을 사용여부를 결정하도록 할 수 있습니다.



>모든 스타터는 코어 Spring Boot(`spring-boot-starter`)를 직접적이든 간접적이든 참조해야 합니다. 따라서 Spring Boot의 코어 기능들은 core 스타터에 추가 될 것입니다.

 `org.springframework.boot` 그룹 아래에 제공되는 어플리케이션 스타터는 [여기](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/using-spring-boot.html#using-boot)에서 확인하 실 수 있습니다.



activemq, batch, cache, data-cassandra, data-elasticsearch, jdbc, jpa, mongodb, security, test, validation, web, webflux, websocket 등의 애플리케이션 스타터가 있습니다.

<br>

* **프로덕션 스타터**

`spring-boot-starter-actuator` : 모니터링 기능 제공



* **기술적인 스타터** - 특정 기술에 따라 바꿔낄 수 있습니다.

`spring-boot-starter-log4j2`

`spring-boot-starter-logging`

`spring-boot-starter-tomcat` 등



* 그 밖에 spring 밖에서 만든 스타터는 [README 파일](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-project/spring-boot-starters/README.adoc)을 참고하면 됩니다.

<br>

<br>

---

# 2. 코드 구조화시키기

스프링부트는 특정 코드 구조를 강요하지 않습니다.



#### 1) "defuault" package 는 만들지 않는 것이 좋습니다.

디폴트 패키지란, src/main/java 에서 패키지를 만들지 않고, 바로 java 클래스 파일을 만드는 것을 말합니다.

이 경우  `@ComponentScan`, `@ConfigurationPropertiesScan`, `@EntityScan`,  `@SpringBootApplication`에서 문제를 일으킬 수 있습니다. 모든 jar 로부터 모든 클래스가 읽혀지기 때문입니다.

> 패키지 이름은 `com.example.project` 처럼 지으시면 좋습니다.



#### 2) Main 클래스 위치

main 어플리케이션 클래스는 다른 클래스보다 위에 있는 root 패키지 않에 놓는 것이 좋습니다.

`@EnableAutoConfiguration` 이 주로 main 클래스에 있기 때문에, 특정 아이템에 대한 검색 패키지를 정의합니다. 예를 들어 JPA 어플리케이션을 사용할 때, `@Entity` 아이템을 검색하는 데 `@EnableAutoConfiguration`이 사용됩니다. 

main이 루트 패키지에 있으면 `@ComponentScan`은 `basePackage` 속성 사용 없이도 사용될 수 있습니다. 또한 `@SrpingBootApplication`도 사용할 수 있습니다. 



여기서는 `com.example.myapplication`이 루트 패키지 입니다. (default 패키지는 패키지 없이 java 폴더 바로 아래 만든 클래스를 말합니다.)

```shell
com
 +- example
     +- myapplication (root package)
         +- Application.java
         |
         +- customer
         |   +- Customer.java
         |   +- CustomerController.java
         |   +- CustomerService.java
         |   +- CustomerRepository.java
         |
         +- order
             +- Order.java
             +- OrderController.java
             +- OrderService.java
             +- OrderRepository.java
```



보통 main 메소드는 아래와 같이 `@SpringBootApplication`아래에서 선언합니다.

**Example.java**

```java
package com.example.myapplication;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

<br>

<br>

---

# 3. 설정 클래스(Configuration Classes)

java, xml 중 하나를 정해 주 소스(primary source)를 정할 것을 권장합니다. 주로 java를 주 소스로 정하고, main 메소드가 주요 `@Configuration`으로써의 좋은 후보중 하나입니다.

>XML 설정으로도 사용할 수 있습니다. 이런 예제가 아직 많을 수도 있습니다. 하지만 가능하면 모두 java 기반 설정으로 바꾸는 것이 좋습니다. `Enable*` 어노테이션을 검색하고 바꿔줍니다.



### 추가 설정파일 import

`@Import` 어노테이션을 사용해서 추가적인 설정 클래스를 불러올 수 있습니다. `@ComponentScan`을 통해 자동적으로 스프링 컴포넌트를 읽어들이게 할 수 있습니다.



**여러가지 Bean 설정 방법**

**1) `@Import`를 통한 방법 :**

메인 메서드위에 @Configuration, @Import(UserService.class)를 설정하면,

user 패키지 안에 있는 UserService 클래스를 임포트 해올 수 있습니다.



**2) `@ComponentScan`을 통한 방법 :** 

![](https://i.ibb.co/vVMmd4n/image.png)

ComponentScan을 main 메서드 위에 설정하고(Example.java), configuration(ServiceConfig.java)을 픽업하도록 해서 그 안에 있는 클래스인 UserService(UserService.java)를 bean으로 등록하게 합니다.



**3)** `@ComponentScan` 를 메인 메서드 위에 설정해 놓고, configuration 패키지를 따로 작성할 필요 없이, UserService 클래스 위에 

```java
@Service
@ComponentScan
@Repository
@Controller
```

중 하나를 맥락에 맞게 골라(여기서는 @Service) 설정하면 됩니다. 





---

**Reference**

https://www.youtube.com/watch?v=w9wqpnLHnkY&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=3

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/using-spring-boot.html#using-boot

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-custom-starter

