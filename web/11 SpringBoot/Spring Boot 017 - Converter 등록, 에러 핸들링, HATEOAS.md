# Spring Boot 017 - Converter 등록, 에러 핸들링, HATEOAS



 ### 7.1.9 ConfigurableWebBindingInitializer

Spring MVC는 특정 요청에 대한 `WebDataBinder` 를 초기화하기 위해 `WebBindingInitializer` 를 사용합니다.

`ConfigurableWebBindingInitializer`를 `@Bean`으로 등록해서 converter를 등록할 수 있습니다.

<br>

### 예제)

1 다음과 같은 컨트롤러가 있다고 가정.

**BangsongController.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BangsongController {

    @GetMapping("/bs/{id}")
    public Bangsong getBangsong(@PathVariable("id") Bangsong bangsong) {
        return bangsong;
    }
}

```

2 그냥 실행시키면, url 중 "bs"를 해석할 수 없기 때문에 에러가 발생

3 이를 Converter로 등록하는 방법에 대해 알아봅니다. 

<br>



#### Converter 사용하는 방법 (1)

**BangsongConverter.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.core.convert.converter.Converter;

public class BangsongConverter implements Converter<String, Bangsong> {

    @Override
    public Bangsong convert(String id) {
        Bangsong bangsong = new Bangsong();
        bangsong.setId(Integer.parseInt(id));
        return bangsong;
    }
}

```



**Springbootday016thymeleafApplication.java** (main)

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.support.ConfigurableConversionService;
import org.springframework.format.support.FormattingConversionService;
import org.springframework.web.bind.support.ConfigurableWebBindingInitializer;

@SpringBootApplication
public class Springbootday016thymeleafApplication {

	@Bean
	public ConfigurableWebBindingInitializer initializer() {
		ConfigurableWebBindingInitializer initializer = new ConfigurableWebBindingInitializer();
		ConfigurableConversionService conversionService = new FormattingConversionService();
		conversionService.addConverter(new BangsongConverter());
		initializer.setConversionService(conversionService);
		return initializer;
	}
	public static void main(String[] args) {
		SpringApplication.run(Springbootday016thymeleafApplication.class, args);
	}

}
```



#### Converter 사용하는 방법 (2)

**BangsongConverter.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

public class BangsongConverter implements Converter<String, Bangsong> {

    @Override
    public Bangsong convert(String id) {
        Bangsong bangsong = new Bangsong();
        bangsong.setId(Integer.parseInt(id));
        return bangsong;
    }
}

```



`WebMvcConfigurer` 이용

**MyWebConfig.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MyWebConfig implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new BangsongConverter());
    }
}
```

이 방법도 추천하지만, 스프링부트에서는 더 간단한 방법이 존재합니다.

<br>

#### Converter 사용하는 방법 (3)

**BangsongConverter.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class BangsongConverter implements Converter<String, Bangsong> {

    @Override
    public Bangsong convert(String id) {
        Bangsong bangsong = new Bangsong();
        bangsong.setId(Integer.parseInt(id));
        return bangsong;
    }
}
```

Converter를 Bean으로 등록하기만 하면됩니다! Bean으로 등록하면, WebDataBinder 등이 내부에 있으므로, 스프링 부트가 알아서 컨버터를 적용합니다.

`Component`를 추가하여 Bean을 등록하고 실행해봅시다.



---

### 7.1.11 에러 핸들링

특정 컨트롤러나 예외 타입에 대한 리턴을 하는 JSON document를 커스터마이즈하기 위해 `@ControllerAdvice`  어노테이션을 정의할 수 있습니다.

```java
@ControllerAdvice(basePackageClasses = AcmeController.class)
public class AcmeControllerAdvice extends ResponseEntityExceptionHandler {

    @ExceptionHandler(YourException.class)
    @ResponseBody
    ResponseEntity<?> handleControllerException(HttpServletRequest request, Throwable ex) {
        HttpStatus status = getStatus(request);
        return new ResponseEntity<>(new CustomErrorType(status.value(), ex.getMessage()), status);
    }

    private HttpStatus getStatus(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        if (statusCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return HttpStatus.valueOf(statusCode);
    }

}
```

<br>

### Custom Error Pages

`/error` 폴더에 파일을 추가하여, 주어진 상ㅇ태코드에 대한 HTML 에러 페이지를 커스터마이징할 수 있습니다. 

에러페이지는 HTML 또는 템플릿을 빌드해 만들 수 있습니다. 파일 이름은 정확한 상태 코드나 시리즈 마스크여야 합니다.

예를 들면 정적 HTML 파일에 `404`를 맵핑하기 위해, 폴더구조는 아래와 같이 해야합니다.

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             +- <other public assets>
```

다른 예시로는 FreeMarker 템플릿의 `5xx` 에러를 맵핑하기 위해 아래와 같아야합니다.

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- templates/
             +- error/
             |   +- 5xx.ftlh
             +- <other templates>
```



더 복잡한 매핑은 `ErrorViewResolver` interface를 구현한 bean을 추가할 수 있습니다. 

```java
public class MyErrorViewResolver implements ErrorViewResolver {

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request,
            HttpStatus status, Map<String, Object> model) {
        // Use the request or status to optionally return a ModelAndView
        return ...
    }

}
```



[`@ExceptionHandler` methods](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc-exceptionhandlers) and [`@ControllerAdvice`](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc-ann-controller-advice) 같은 정규적인 스프링 MVC 를 사용할 수 있습니다. 그러면 `ErrorController`는 다뤄지지 않은 예외처리를 뽑아냅니다.

<br>

**BangsongController.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BangsongController {

    @GetMapping("/bs/{id}")
    public Bangsong getBangsong(@PathVariable("id") Bangsong bangsong) {
        if (bangsong.getId() == 100) {
            throw new BangsongException();
        }
        return bangsong;
    }

    @ExceptionHandler
    public ResponseEntity<String> handleException(BangsongException e, Model model) {
        return new ResponseEntity<String>(HttpStatus.I_AM_A_TEAPOT);
    }
}
```



**BansongException.java**

```java
package me.whiteship.springbootday016thymeleaf;

public class BangsongException extends RuntimeException {
}
```





```shell
$ wordbe@wordbe:java/springbootday016thymeleaf$ http :8080/bs/100
HTTP/1.1 418 
Connection: keep-alive
Content-Length: 0
Date: Wed, 08 Apr 2020 14:18:33 GMT
Keep-Alive: timeout=60
```

<br>

이번에는 @`ControllerAdvice`를 통해서 만들었던 @ExceptionHandler를 하나의 클래스에 담아서 global하게 사용할 수 있도록 설정해봅시다.

**ExceptionHandleController.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionHandleController {
    @ExceptionHandler
    public ResponseEntity<String> handleException(BangsongException e, Model model) {
        return new ResponseEntity<String>(HttpStatus.I_AM_A_TEAPOT);
    }
}
```

<br>

---

### Spring MVC 밖의 에러페이지 맵핑

Spring MVC를 사용하지 않는 애플리케이션에서는,  `ErrorPageRegistrar` 인터페이스를 사용해서 직접적으로 `Errorpages`를 등록할 수 있습니다. 이 추상화 작업은 직접적으로 서블릿 컨테이너가 내장되어 있지 않아도 되며, Spring MVC `DispatcherServlet` 이 없어도 사용 가능합니다.

```java
@Bean
public ErrorPageRegistrar errorPageRegistrar(){
    return new MyErrorPageRegistrar();
}

// ...

private static class MyErrorPageRegistrar implements ErrorPageRegistrar {

    @Override
    public void registerErrorPages(ErrorPageRegistry registry) {
        registry.addErrorPages(new ErrorPage(HttpStatus.BAD_REQUEST, "/400"));
    }

}
```

> `ErrorPage`를 Filter에 의해 다뤄져서 끝나는 path와 함께 등록하면, Filter는 명시적으로 `ERROR` dispatcher로써 등록되어야 합니다. (별로 쓸 일이 없을 것 같음)



---

### 7.1.12 Spring HATEOAS

Hypermidea의 사용을 만드는 RESTful API를 개발한다면, Spring Boot는 Spring HATEOAS에 대한 자동설정을 제공합니다. 

RESTful API 논문 - HATEOAS(Hypermedia As The Engine Of Application State)

```json
{
    "name": "Allice",
    "links": [{
        "rel": "self",
        "href": "http://localhost:8080/customer/1"
    }]
}
```

HATEOAS 기반한 응답은 위와 같이, 보내는 본문의 타이틀과 링크(hypermedia) 정보를 제공해주어야 합니다.

`LinkDiscoverer` : 관련 타입의 링크를 찾습니다.

`ObjectMapper` : json ↔ object

`ObjectMapper`는 여러 `spring.jackson.*` 프로퍼티나, 또는 하나가 존재하면 `Jackson2ObjectMapperBuilder` 빈을 세팅해서 커스터마이즈 되어있습니다.

`@EnableHypermediaSupport` 를 사용해서 HATEOAS 설정을 제어할 수 있습니다. 단, 기본 커스터마이징된 `ObjectMapper` 작동이 안 될 것입니다.



> ResourceSupport 는 spring-boot 2.2.6.RELEASE 에서는 작동하지 않았고, 2.2.0 으로 다운그레이드를 했더니 메소드가 있었습니다. 실제로 Spring HATEOAS 1.0 release 이상 부터는 RepresentationModel로 바뀌었다고 적혀있습니다.



**BangsongResource.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.hateoas.ResourceSupport;

public class BangsongResource extends ResourceSupport {
    private String title;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
```



**BangsongController.java**

```java
package me.whiteship.springbootday016thymeleaf;

import org.springframework.hateoas.Link;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;

@RestController
public class BangsongController {

    @GetMapping("/bs/{id}")
    public BangsongResource getBangsong(@PathVariable("id") Bangsong bangsong) {
        if (bangsong.getId() == 100) {
            throw new BangsongException();
        }

        BangsongResource resource = new BangsongResource();
        resource.setTitle(bangsong.getId() + "번째 방송 중");

        Link link = linkTo(BangsongController.class).slash("bs").slash(bangsong.getId())
                .withSelfRel();
        Link linkList = linkTo(BangsongController.class).slash("bs").withRel("bangsongList");
        resource.add(link, linkList);


        return resource;
    }
}
```





```shell
$ wordbe@wordbe:/mnt/d/java/springbootday016thymeleaf$ http :8080/b
s/1
HTTP/1.1 200 
Content-Type: application/hal+json;charset=UTF-8
Date: Wed, 08 Apr 2020 15:12:56 GMT
Transfer-Encoding: chunked

{
    "_links": {
        "bangsongList": {
            "href": "http://localhost:8080/bs"
        },
        "self": {
            "href": "http://localhost:8080/bs/1"
        }
    },
    "title": "1번째 방송 중"
}
```

HATEOAS → 클라이언트 사이트는 bangsongList 라는 변수만 보고 서버사이드에 있는 링크 목록을 가져올 수 있습니다. 따라서 클라이언트는 모든 링크를 하드코딩 하지 않아도 되며, 서버에서 url 값이 바뀜에 따라 변동한다거나 하는 위험으로부터 안전하게 됩니다.



---

**Reference**

https://spring.io/blog/2019/03/05/spring-hateoas-1-0-m1-released#overhaul

https://www.youtube.com/watch?v=tfpvEdq0xdU&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=18&t=0s

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-web-binding-initializer