## SpringApplication





**로깅**

스프링 부트를 실행하면 출력물들이 뜬다. 이 때 출력된 로그들은 INFO 레벨이다.

DEBUG 레벨로 하려면 다음과 같이 설정한다.

* Intellij > Edig Configuration > VM Options 에 `-Ddebug `라고 입력해준다.
* DEBUG 레벨에서는 좀 더 구체적인 로그정보가 나온다. 자동설정이 적용이 된 이유, 안 된 이유도 출력해준다.

<br />

**배너**

앞에 스프링부트라고 예쁘게 배너가 뜨는데, 이 또한 수정할 수 있다.

resources 에 banner.txt 를 만들어서 표현하면 된다. gif, jpg, png 도 지원한다. application.properties 에서 이 banner.txt 의 경로도 변경할 수 있다. 기본 제공 변수도 사용할 수 있다.

banner.txt

```txt
===============================================
Wordbe Springboot ${spring-boot.version}
===============================================
```

Banner 클래스 구현 후 SpringApplication.setBanner() 로도 설정하능하고, 배너를 끌 수도 있다.

<br />

**실행**

메인 메소드에서 아래와 같이 가장 기본적 방법으로 실행가능하다.

```java
SpringApplication.run(Application.class, args);
```

빌더패턴으로도 실행이 가능하다.

```java
new SpringApplicationBuilder()
                .sources(Application.class)
                .run(args);
```









<br />

---

## SpringApplication 

SpinrgApplication 의 다양한 기능을 보자.

<br />



### 이벤트

그 중 이벤트가 발생했을 때 작동하는 리스너를 추가할 수 있다. (`addListener()`)

<br />

이벤트가 시작할 때 메시지를 하나 출력해보자.

리스너를 하나 만들어보자.

```java
public class BlueListener implements ApplicationListener<ApplicationStartingEvent> {

    @Override
    public void onApplicationEvent(ApplicationStartingEvent applicationStartingEvent) {
        System.out.println("Application is starting");
    }
}

```



메인메소드에서 아래와 같이 리스너를 추가해주면 된다.

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.addListeners(new BlueListener());
        app.run(args);
    }
}

```



ApplicationStartedEvent 등 다양한 이벤트가 있어서 유연하게 활용할 수 있다.



### 웹애플리케이션 타입

Spring Web MVC 를 사용하면 SERVLET 타입, WebFlux 를 사용하면 REACTIVE 타입이 된다.

MVC, WebFlux 가 둘 다 있다면 기본은 SERVLET 타입이다.



### 애플리케이션 아규먼트

커맨드라인에서 어떤 명령어를 실행시킬 때 아규먼트를 추가하여 실행하는 것을 보았을 것이다.

인텔리제이에서 Program arguments 에 원하는 아규먼트를 추가할 수 있다.



![](https://blog.kakaocdn.net/dn/b0kPRb/btqTwWxWQwo/kwIFVlxGU2BaOlJxAKLsIk/img.png)



애플리케이션 러너로 구동이 어떻게 되는지 테스트 해보자.

저기 run 메소드의 파라미터로 `ApplicationArguments` 를 가져오는 것을 볼 수 있다.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Arrays.stream(args.getSourceArgs()).forEach(
                System.out::println
        );
       // --river
    }
}

```





























