# Spring Boot 013 - Web Application 개발

## 7. Developing Web Application

Spring Boot는 웹 애플리케이션 개발에 아주 잘 어울립니다. HTTP 서버가 내장된 서버를 Tomcat, Jetty, Undertow, Netty 등 내장 프로그램을 사용해서 만들 수 있습니다. 대부분 웹 애플리케이션은 `spring-boot-starter-web`으로 실행할 수 있습니다. reactive web 애플리케이션은 `spring-boot-webflux` 모듈을 사용할 수 있습니다.

 <br>

### 7.1 Spring Web MVC Framework

Spring Web MVC 프레임워크(간단히 [Spring MVC](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc)라고 부릅니다.)는 "모델 뷰 컨트롤러" 웹 프레임워크입니다. `@Controller` 또는 `@RestController` bean을 생성해서 HTTP 요청을 다룰 수있게 도와줍니다. 컨트롤러 안에 있는 메소드는 `@RequestMapping` 어노테이션을 사용해서 HTTP 에 매핑됩니다.

```java
@RestController
@RequestMapping(value="/users")
public class MyRestController {

    @RequestMapping(value="/{user}", method=RequestMethod.GET)
    public User getUser(@PathVariable Long user) {
        // ...
    }

    @RequestMapping(value="/{user}/customers", method=RequestMethod.GET)
    List<Customer> getUserCustomers(@PathVariable Long user) {
        // ...
    }

    @RequestMapping(value="/{user}", method=RequestMethod.DELETE)
    public User deleteUser(@PathVariable Long user) {
        // ...
    }

}
```

<br>

### 7.1.1 Spring MVC 자동 설정

자동설정은 아래 특징을 스프링 기본값으로 설정합니다.

* `ContentNegotiatingViewResolver` (요청이 원하는 뷰를 탐색하고 반환합니다.) , `BeanNameViewResolver` beans (뷰를 찾을 때 빈 이름으로 찾게 도와줍니다.)
* 정적 리소스를 지원(WebJars)
* `Converter`, `GenericConverter`, `Formatter` beans.
* `HttpMessageConverters`
* `MessageCodesResolver`
* Static `index.html`
* 커스텀 `Favicon`
* `ConfigurableWebBindingInitializer` bean



커스터마이징을 원하면 `@EnableWebMvc` 없이 `WebMvcConfigurer` 타입의`@Configuration` 클래스를 추가합니다.

`RequestMappingHandlerMapping`, `RequestMappingHandlerAdapter`, MVC 커스트마이징을 하면서 `ExceptionHandlerExceptionResolver`인스턴스를 제공하기 원하면, `WebMvcRegistrations` 타입의 빈을 선언하고 커스텀 인스턴스로 사용합니다.

Spring MVC 의 완전한 제어를 원한다면 `@EnableWebMvc` 로 어노테이트된 `@Configuration` 을 추가할 수 있습니다. 또는 `@Configuration` 어노테이트된 `DelegatingWebMvcConfiguration` 을 사용할 수 있습니다.

<br>

### 7.1.2 HttpMessageConverters

Spring MVC 는 `HttpMessageConverter `인터페이스를 사용해서 HTTP 요청과 응답을 변환합니다.

string은 기본 값으로 `UTF-8`로 인코딩 됩니다.

컨버터를 커스터마이즈하려면 `HttpMessageConverters` 클ㄹ스를 사용하면 됩니다.

```java
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.context.annotation.*;
import org.springframework.http.converter.*;

@Configuration(proxyBeanMethods = false)
public class MyConfiguration {

    @Bean
    public HttpMessageConverters customConverters() {
        HttpMessageConverter<?> additional = ...
        HttpMessageConverter<?> another = ...
        return new HttpMessageConverters(additional, another);
    }

}
```

Context에서 현재 사용되는 `HttpMessageConverter` 빈 convert의 리스트에 추가됩니다. 기본 컨버터를 같은방식으로 덮어쓰기 할 수 도 있습니다.



**예제) GsonHttpMessageConverter 추가해보기**

**config/WebConfig.java**

```java
package me.whiteship.config;

import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.GsonHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * HandlerMapping, HandlerAdapter, ExceptionHandler => use WebMvcRegistrations
 * 기타 등등 => WebMvcConfigurer
 *
 * @author Seongho Jin
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public HttpMessageConverters customConverters() {
        GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
        return new HttpMessageConverters(converter);
    }
}

```





### 7.1.3 Custom JSON Serializers 와 Deserializers

Jackson을 사용해서 JSON 데이터를 사용하려면, `JsonSerializer` 와 `JsonDeserializer` classes 를 써야 합니다. 커스텀 serializer는 보통 중간에 모듈을 사용해서 Jackson에 등록합니다. 하지만 스프링 부트는 `@JsonComponent` 어노테이션을 제공하므로, 직접 스프링 빈을 등록할 수 있습니다.

```java
import java.io.*;
import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;
import org.springframework.boot.jackson.*;

@JsonComponent
public class Example {

    public static class Serializer extends JsonSerializer<SomeObject> {
        // ...
    }

    public static class Deserializer extends JsonDeserializer<SomeObject> {
        // ...
    }

}
```

`ApplicationContext` 안에 있는 `@JsonComponent` 빈은 자동으로 잭슨에 등록됩니다. `@JsonComponent`는 `@Component` 의 meta 어노테이트이기 때문에, 일반적인 컴포넌트 스캐닝 룰이 적용됩니다.

 [`JsonObjectSerializer`](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/jackson/JsonObjectSerializer.java) 와 [`JsonObjectDeserializer`](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/jackson/JsonObjectDeserializer.java) 기저 클래스를 제공해서 표전 잭슨 버전을 대체할 수 있습니다.





