# Spring IoC - Enviornment





ApplicationContext 가 가진 속성 중 Enviornment 를 알아보자. 

간단히 말하면 프로파일 (빈들의 모음), 프로퍼티 (환경 설정) 설정을 도와준다.





## 프로파일



`ApplicationContext` 는 spring IoC 최상위 클래스인 `BeanFactory` 뿐만 아니라 `EnvironmentCapable` 도 상속받는다. 이 외에도 여러가지 클래스를 상속받는다. 따라서 `getEnviornment()` 메소드를 사용할 수 있다.

Enviornment 에서 프로파일을 받아올 수 있는데, 프로파일이란 빈들이 모인 그룹을 말한다. Enviornment의 역할은 활성화(active) 할 프로파일을 확인하고 설정을 도와주는 것이다. 따라서 사용하고 싶은 특정 bean 만 등록할 수 있다.



ApplicationRunner를 사용해서 환경을 한 번 확인해보자.



**AppRunner** 

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    ApplicationContext ctx;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Environment environment = ctx.getEnvironment();
        System.out.println(Arrays.toString(environment.getActiveProfiles())); // []
        System.out.println(Arrays.toString(environment.getDefaultProfiles())); // [default]
    }
}

```





특정 빈을 프로파일에 등록하고 싶으면 같은 패키지내에 자바 설정 파일을 만들면 된다.

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
public class Configuration {

    @Bean
    public Sample sample() {
        return new TestSample();
    }

}
```

`@Profile` 에 "test" 라는 이름의 프로파일을 등록시켰다.

이렇게 클래스 위에 `@Profile `애노테이션을 붙여도되고, 메소드 위에 붙여서 더 자세히 명시해도 된다.

또는 위처럼 설정파일을 만드는 것 대신, 빈으로 등록할 클래스 위에 직접 `@Component ` 어노테이션과 함게 `@Profile("test")` 를 등록해주면 된다. (추천)





여기서 한가지 더 설정해주어할 것이 있는데, Intellij > edit Configuration 을 들어가서

Active Profile에 방금 만들었던 test 를 등록해주면 된다.

![](https://blog.kakaocdn.net/dn/yzUv7/btqS1VTW0C5/fn9nTDKaGtzoSiH79AYFKk/img.png)

<br />

혹은 

![img](https://blog.kakaocdn.net/dn/dfkvmJ/btqS6XpJJY3/2LvDWoFuMKBN1Iw9kCFAR1/img.png)

```shell
-Dspring.profiles.active="test"
```

를 VM 옵션에 등록해주어도 된다.



또한 프로파일 표현식으로 ! (not), & (and), | (or) 을 사용할 수 있어서 아래와 예시와 같이 사용할 수 도 있다.

```java
@Profile("!test")
```

test 가 아닌 프로파일의 경우에 빈을 등록하게 된다.



<br />

---

## 프로퍼티



프로퍼티는 설정값을 다양한 방법으로 정의할 수 있도록 도와준다. Environment는 프로퍼티 소스를 설정하고, 값을 가져오도록 도와준다.

프로퍼티는 우선순위가 있는데 ServletConfig, ServletContext, JNDI (java/comp/env/), JVN 시스템 프로퍼티 (-Dkey="value"), JVM 시스템 환경변수 (운영체제 환경변수) 순으로 우선적으로 매핑하게 된다.



이것도 방법이 다양한데, (하나로 통일했으면 좋겠기도 하다. 여러가지가 필요한 경우도 있겠지만 말이다)



**방법 1)** 새로운 프로퍼티 파일 생성, @PropertySource

Environment 를 통해 프로퍼티를 추가하는 방법으로 `@ProertySource` 를 이용하면 되고, 아래와 같이 사용하면 된다.

```java
@SpringBootApplication
@PropertySource("classpath:/app.properties")
public class Application {
  ...
}
```



물론 app.properties 파일을 resources 폴더 안에 만들어서 사용하면 된다. 예컨데 어떤 프로퍼티 변수를 설정하고 값을 넣어보자.

```properties
app.name=spring
```



그러면 ApplicationContext 의 getEnviornment() 메소드 안의 `getProperty()` 메소드를 통해 위 변수 (app.name) 을 불러올 수 있다.

```java
public class AppRunner implements ApplicationRunner {

    @Autowired
    ApplicationContext ctx;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Environment environment = ctx.getEnvironment();
        System.out.println(environment.getProperty("app.name")); // spring
    }
}
```



<br />



**방법 2)** JVM 시스템 프로퍼티

VM 옵션에 -Dapp.name="spring" 이런 식으로 적어놓고, app.name 변수를 위처럼 가져올 수도 있다. 

<br />





스프링부트는 기본프로퍼티 (application.properites) 를 지원하며, 이 파일은 이미 resources 폴더안에 있다. 따라서 기본 설정값들은 이 파일에 적어놓으면 된다.







