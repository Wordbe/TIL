# Spring Boot 018 - CORS(Spring Web MVC 마무리)

**CORS(Cross-orgin resource sharing)** : 무슨 크로스 도메인 요청이 승인되는지에 대한 유연한 방법을 설정할 수 있습니다.

1) 내가 어디에 있는 지(origin) 알림 

2) 서버 응답

- orgin 사이트를 허용하면 Access-Control-Allow-Origin(ACAO): 클라이언트 주소 헤더 응답
- cross-origin request를 지원하지 않으면 에러
- 모든 도메인을 허락하면 ACAO: * 반환

`@CrossOrigin` 어노테이션 사용하면 자동 설정됩니다. 전역 CORS 설정은 `WebMvcConfigurer` 와 `addCorsMappings(CorsRegistry)` 설정으로 가능합니다.

---

<br>

원칙적으로는 한 도메인에서 다른 도메인으로 접근을 막습니다.

이를 서버쪽에서 허용하기 위해 CORS를 이용합니다.

예제를 알아봅니다.



1. **Server**

방송 객체 생성

```java
package me.whiteship;

public class Bangsong {
    private String streamerName;
    private String title;

    public String getStreamerName() {
        return streamerName;
    }

    public void setStreamerName(String streamerName) {
        this.streamerName = streamerName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
```

컨트롤러에 "/bs" 주소로 GetMapping 후 CrossOrigin 적용

```java
package me.whiteship;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BangsongController {

    @CrossOrigin
    @GetMapping("/bs")
    public Bangsong bangsong() {
        Bangsong bangsong = new Bangsong();
        bangsong.setStreamerName("wordbe");
        bangsong.setTitle("스프링부트 2.0 레퍼런스 코딩");
        return bangsong;
    }
}
```

메인 실행

```java
package me.whiteship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```



2. **Client**

기존 서버 포트는 8080, 클라이언트 포트는 9000

**application.properties**

```properties
server.port = 9000
```



http://localhost:9000/ 페이지.

url 접속하여 이벤트 발생 시 ajax 비동기 통신으로 http://localhost:8080/bs (서버)를 호출.

**resources/static/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script>
        $(document).ready(function() {
            console.log("ready");

            $.ajax({
              url: "http://localhost:8080/bs",
              success: function( result ) {
                console.log(result);
              },
              error: function(e) {
                console.log(e);
              }
            });
        });
    </script>
</head>
<body>
    <h1>Client Application !</h1>
</body>
</html>
```

```java
package me.whiteship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClientApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClientApplication.class, args);
    }
}
```



( + ) `@CrossOrigin` 대신 전역 CORS 를 사용

서버에 다음 파일을 생성

```java
package me.whiteship;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MyWebClass implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/bs").allowedOrigins("*");
    }
}
```





이상 Servlet 기반 웹 MVC는 모두 마무리 하였습니다.



**스프링 부트 핵심 제공 기능**

1. CoC (Convention over Configuration) : 자잘한 수동 환경설정을 하나의 규칙(관습)으로 제공

2. Auto-configuration : `spring-boot-web-starter`

3. overlapping transitive dependencies 일관성 유지

   (A → B → C 처럼 얽힌 의존성의 겹침을 일관성있게 유지)



**리액티브(Reactive)**

* Streaming, Lightweight, Real-time

* 사용자가 소프트웨어를 사용하기 위해 입력을 발생시켰을 때, 꾸물거리지 않고 최대한 빠른 시간 내에 응답한다는 의미





---

**Reference**

https://www.youtube.com/watch?v=HGUgrrqtK8U&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=18

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-web-binding-initializer