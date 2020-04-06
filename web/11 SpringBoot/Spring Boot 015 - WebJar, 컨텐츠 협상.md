# Spring Boot 015 - WebJar, 컨텐츠 협상



또한 `/webjars/**` 경로에 있는 모든 리소스는 jar 파일로부터 서비스됩니다.

> 애플리케이션이 jar로 패키지되어있다면 `src/main/webapp` 폴더는 사용하지 않습니다. 



스프링 부트는 Spring MVC에 의해 제공되는 심화된 소스 핸들링 특징을 지원합니다.

* version agnostic URLs : 버전을 명시할 필요없게 만들어 줌

* cache-busting : 캐시값으로 변경된 내용을 계속 반영하도록 업데이트시킴



Webjars를 위한 버전 agnostic(배우지 않아도 사용하기 쉬운) URL을 사용하기 위해서는 `webjars-locator-core`의존성을 추가해야 합니다.

예시) **resource/static/hello.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <scrit src="/webjars/jquery/3.4.1/jquery.min.js"></scrit>
    <script>
        $(document).ready(function() {
            console.log("ready!");
        });
    </script>
</head>
<body>
<h1>Hello Static</h1>
</body>
</html>
```

이런식으로 프론트엔드 웹 소스(라이브러리)를 webjar로 가져올 수 있습니다.

<br>

이제 **pom.xml** 에 `webjars-locator-core`를 추가합니다.

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>webjars-locator-core</artifactId>
</dependency>
```

**hello.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <scrit src="/webjars/jquery/jquery.min.js"></scrit>
    <script>
        $(document).ready(function() {
            console.log("ready!");
        });
    </script>
</head>
<body>
<h1>Hello Static</h1>
</body>
</html>
```



cache-busting을 위해 캐시 기능을 켭니다. devtools 는 sesible default 값을 가지게 하므로, 캐시 기능을 해제할 수 있습니다. 따라서 pom.xml에서 devtool을 잠시 지워봅시다. 

`<link href="/css/spring-2a2d595e6ed9a0b24f027f2b63b134d6.css"/>`  등에 효율적으로 컨텐츠 해시를 더함으로써 cache busting을 할 수 있습니다.

**applicatin.properties**

```properties
spring.resources.chain.strategy.content.enabled=true
spring.resources.chain.strategy.content.paths=/**
```

<br>

---

### 7.1.6 Welcome Page

스프링 부트는 static 과 templated 웰컴 페이지를 둘 다 제공합니다. 먼저 `index.html` 파일을 찾습니다. 못 찾으면 index 템플릿을 찾습니다. 만약 찾았으면 자동으로 웰컴페이지를 사용합니다.

우선순위는 아래와 같습니다.

1. root 로 맵핑한 핸들러 맵핑
2. index.html
3. index 템플릿

<br>

### 7.1.7 Custom Favicon

static 리소스와 함께 스프링부트는 설정된 static content 위치에서 `favicon.ico`를 찾습니다. 파일이 존재하지 않다면 자동으로 애플리케이션의 파비콘을 이용합니다.

<br>

### 7.1.8 Path Matching and Content Negotiation



스프링 부트는 접미사(suffix) 패턴 패칭을 기본적으로 비활성화합니다. `"GET /projects/spring-boot.json"` 는 `@GetMapping("/projects/spring-boot"`와 매치되지 않는 것 등등을 의미합니다. 이게 스프링 MVC가 선택한 최선의 방법입니다. 이 특징은 주로 과거에 "Accept" 요청 헤더를 보내지 않는 HTTP 클라이언트에게 유용했습니다. 하지만 요즘은 Content Negotiation이 더 신뢰할 만 합니다.

>  받고자 하는 컨텐츠 타입은 "Accept" 헤더로 받거나, `"GET /projects/spring-boot?format=json"` 처럼 파라미터 맨뒤에 format=json을 붙이는 것을 권장합니다. 

```properties
spring.mvc.contentnegotiation.media-types.markdown=text/markdown
```

마크다운을 달라고 할 수도 있습니다.



대체로 접미사 패턴을 open해서 사용하기보다는, 접미사 패턴을 등록하는 것이 더 보안적으로 좋습니다.

````properties
spring.mvc.contentnegotiation.favor-parameter=true
````

user?format=json

url 요청이 됩니다.

```properties
spring.mvc.contentnegotiation.favor-parameter=true
spring.mvc.contentnegotiation.favor-path-extension=true
spring.mvc.pathmatch.use-registered-suffix-pattern=true
```

user.json

까지 요청이 됩니다.





---

**Reference**

https://www.youtube.com/watch?v=-jaRc_78b4I&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=15

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-message-codes