# Spring Boot 014 - HttpMessageConverter, Static 리소스 맵핑

* jackson : Java Object를 JSON로 또는 반대로 변환하는 라이브러리
* gson : json 을 생성하고 파싱하는 라이브러리



> 단축키 Tip: Search everything(including code and menus) (Press Shift twice)



RestController는 return 타입을 @ResponseBody 를 붙여준 것이나 다름없습니다. 따라서 RestContoller를 사용한다는 것은 httpMessageConverter를 쓴 것과 동일합니다. 

String converter는 복합객체에서 사용되지 않습니다.

기본적으로 json 형태로 변환되고, 



불러올 클래스에 `@XmlRootElement` 어노테이션을 붙이고,

```shell
curl --header "Accept: application/xml"  http://localhost:8080/user
```

위와 같이 application/xml을 부르면 xml 이 리턴됩니다.

<br>

### 7.1.4 MessageCodesResolver	

Spring MVC는 `MessageCodesResolver` 바인딩 에러로부터 에러 메시지 렌더링에 대한 에러 코드를 생성하는 전략을 가지고 있습니다. `spring.mvc.message-codes-resolver-format` property을 `PREFIX_ERROR_CODE` 또는 `POSTFIX_ERROR_CODE`로 설정하면, 스브링 부트는 이를 생성합니다.

<br>

### 7.1.5 Static Content

기본적으로, 스프링 부트는 `/static` 폴더(또는 `/public`, `/resources`, `/META-INF/resources`)에서 static content를 서비스합니다. static content는 Spring MVC 로부터`ResourceHttpRequestHandler` 를 사용합니다. 따라서 `WebMvcConfigurer` 를 추가하고 `addResourceHandlers` 메소드를 오버라이딩함으로써 동작을 수정할 수 있습니다.



**resources/static/hello.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h1>Hello Static</h1>
</body>
</html>
```

http://localhost:8080/hello.html 을 연결하면 이 화면이 나오게 됩니다.

이는 우리가 따로 컨트롤러를 지정해주지 않았지만, 이렇게 url이 맵핑되어있지 않은 경우,

서버의 default servlet에게 컨트롤을 위임합니다. 스프링은 항상 `DispatcherServlet`를 통해 요청을 다룰 수 있기 때문입니다.



* 또한 `spring.mvc.static-path-pattern` 속성을 통해 리소스의 맵핑을 커스터마이징 할 수 있습니다.

**application.properties**

```properties
spring.mvc.static-path-pattern=/resources/**
```

이렇게하면, http:///localhost:8080/static/hello.html 의 경로에서 hello.html 뷰가 보이게 됩니다.



* `spring.resources.static-locations` 속성에 명시한 위치는 root 패키지에 연결되도록 설정됩니다.

**application.properties**

```properties
spring.resources.static-locations = classpath:/html
```

이번에는 html/hello.html 에 있는 html을 보여주고 싶다면, 위와 같이 로케이션을 설정해주면 됩니다. http://localhost:8080/hello.html 로 들어가서 잘 되는지 봅시다.







---

**Reference**



https://www.youtube.com/watch?v=CZYlgdKaGHI&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=14

https://youtu.be/-jaRc_78b4I?list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3