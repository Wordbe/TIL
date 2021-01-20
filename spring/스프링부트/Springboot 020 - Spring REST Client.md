# Springboot 020 - Spring REST Client



RestTemplate, WebClinet 는 기존 spring-web 에 있던 모듈이다.

스프링부트는 이들을 Builder 로 감싸서 빈으로 등록해주고, 편안한 기능을 제공해준다.





### RestTemplate

Blocking I/O 기반의 Synchronous API 이다.

spring-boot-starter-web 의존성을 등록하면, `RestTemplateAutoConfiguration` 이 자동 설정된다. 또한 `RestTemplateBuilder` 를 빈으로 자동 등록해준다.



우선 예제를 위해 컨트롤러를 등록해주자.

```java
@RestController
public class MarketController {

    @GetMapping("/fruit")
    public String fruit() throws InterruptedException {
        Thread.sleep(5000l);
        return "fruit";
    }

    @GetMapping("/snack")
    public String snack() throws InterruptedException {
        Thread.sleep(3000l);
        return "snack";
    }
}
```

`/fruit` 을 요청하는데는 5초, `/snack` 을 요청하는데는 3초가 걸리도록 만들었다.





`RestTemplateBuilder` 에서 요청한 `getForObject` 는 다른 기본 프로그램들과 같이 동기적으로 동작할 것이다. 코드 윗줄부터 순차대로 실행된다는 뜻이다. 윗줄이 실행되고 종료가 되어야 아랫줄이 실행된다. 따라서 아래 프로그램은 5초 + 3초 = 8초정도의 시간이 소요될 것이다.

```java
@Component
public class ClientRunner implements ApplicationRunner {

    @Autowired
    RestTemplateBuilder restTemplateBuilder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        RestTemplate restTemplate = restTemplateBuilder.build();

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        // 5초 (/fruit)
        String fruitResult = restTemplate.getForObject("http://localhost:8080/fruit", String.class);
        System.out.println(fruitResult);

      	// 3초 (/snack)
        String snackResult = restTemplate.getForObject("http://localhost:8080/snack", String.class);
        System.out.println(snackResult);

        stopWatch.stop();
        System.out.println(stopWatch.prettyPrint());
    }
}
```





<br />

---

### WebClient

Non-Blocking I/O 기반의 Asynchronous(비동기) API 이다.

`WebClientAutoConfiguration` 이 자동설정되고, spring-boot-starter-web 이 의존성으로 등록되어 있다면 `RestTemplateBuilder`를 빈으로 등록해준다.



`WebClient` 사용을 위해서는 webflux를 추가한다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```





```java
@Component
public class ClientRunner implements ApplicationRunner {

    @Autowired
    WebClient.Builder builer;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        WebClient webClient = builer.build();

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();


        // 5초 (/fruit)
        // Stream 생성 (Non-blocking)
        Mono<String> fruitMono = webClient.get().uri("http://localhost:8080/fruit")
                .retrieve()
                .bodyToMono(String.class);
        // Subscribe (Non-blocking)
        fruitMono.subscribe(s -> {
            System.out.println(s);

            if (stopWatch.isRunning()) stopWatch.stop();

            System.out.println(stopWatch.prettyPrint());
            stopWatch.start();
        });

      	// 3초 (/snack)
        // Stream 생성 (Non-blocking)
        Mono<String> snackMono = webClient.get().uri("http://localhost:8080/snack")
                .retrieve()
                .bodyToMono(String.class);
        // Subscribe (Non-blocking)
        snackMono.subscribe(s -> {
            System.out.println(s);

            if (stopWatch.isRunning()) stopWatch.stop();

            System.out.println(stopWatch.prettyPrint());
            stopWatch.start();
        });
    }
}
```

webClient.get() 요청하는 코드를 Mono 에 담아놓는 스트림을 생성한다. 이는 마치 벽으로 막힌 물처럼 흐르지 않고 제자리에 있다. 즉, 아무 실행도 일어나지 않는다. 그리고 코드는 이것이 실행되지 않아도 아래줄을 읽게 된다. (Non-blocking)

subscribe 메소드를 쓰면 위에서 만들어 놓았던 stream 이 흐른다. 하지만 이역시 Non-blocking 이기 때문에 이 작업이 콜백으로 호출되면서 아래줄의 코드가 그대로 실행된다.

따라서 위 코드를 실행시켜보면, 3초가 걸린 `/snack` 의 호출이 먼저 종료되고, 동시에 진행중이던 `/fruit` 요청이 5초 후 종료된다. 따라서 총 소요된 시간은 5초이다.







<br />

---

## 커스터마이징



### RestTemplate

기본적으로 `java.net.HttpURLConnection`을 사용한다.



지역적(로컬)으로 커스터마이징하는 방법은 아래와 같다.

```java
@Component
public class ClientRunner implements ApplicationRunner {

    @Autowired
    RestTemplateBuilder restTemplateBuilder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        RestTemplate restTemplate = restTemplateBuilder
                .rootUri("http://localhost:8080") // rootUri 정의
                .build();
				...
        // 5초 (/fruit)
        String fruitResult = restTemplate.getForObject("/fruit", String.class);
        System.out.println(fruitResult);

        // 3초 (/snack)
        String snackResult = restTemplate.getForObject("/snack", String.class);
        System.out.println(snackResult);
				...
    }
}
```



전역적(글로벌) 커스터마이징은 아래와 같다.

```java
@SpringBootApplication
public class SpringgothreeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringgothreeApplication.class, args);
    }

    @Bean
    public RestTemplateCustomizer restTemplateCustomizer() {
        return restTemplate -> restTemplate.setUriTemplateHandler(new DefaultUriBuilderFactory("http://localhost:8080"));
    }
}
```





<br />

RestTemplate 은 기본으로 `java.net.HttpURLConnection` 을 사용한다고 했다. 이것을 Apache HttpClient 로바꾸고 싶다면 아래와 같이 하면 된다.



1) 의존성을 추가한다.

pom.xml

```xml
<dependency>
  <groupId>org.apache.httpcomponents</groupId>
  <artifactId>httpclient</artifactId>
</dependency>
```



2) 새로운 빈을 `HttpComponentsClientHttpRequestFactory` 로 재정의하면 된다.

```java
@Bean
public RestTemplateCustomizer restTemplateBuilder() {
  return (RestTemplateCustomizer) restTemplate -> restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
}
```



<br />

### WebClient

기본적으로 Reactor Netty 기반 HTTP 클라이언트를 사용한다.



지역적(로컬)으로 커스터마이징하는 방법은 아래와 같다.

```java
@Component
public class ClientRunner implements ApplicationRunner {

    @Autowired
    WebClient.Builder builer;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        WebClient webClient = builer
                .baseUrl("http://localhost:8080") // base url 정의
                .build();

	      ...
        // Stream 생성 (Non-blocking)
        Mono<String> fruitMono = webClient.get().uri("/fruit")
       
        ...
        // Stream 생성 (Non-blocking)
        Mono<String> snackMono = webClient.get().uri("/snack")
        ...
    }
}
```



전역적(글로벌) 커스터마이징은 아래와 같다.

```java
package co.wordbe.springgothree;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.reactive.function.client.WebClientCustomizer;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpringgothreeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringgothreeApplication.class, args);
    }
    
    @Bean
    public WebClientCustomizer webClientCustomizer() {
        return webClientBuilder -> webClientBuilder.baseUrl("http://localhost:8080");
    }
}
```





<br />

---

## 스프링부트 다양한 기능들



* 캐시 
* 메시징 (JMS, AMQP, Kafka)
* Validation
* Email
* JTA
* Spring Integration
* Spring Session
* WebSocket
* Kotlin 등등









