# Spring Web MVC 003 - Spring MVC 설정

<br />

## @EnableWebMvc

어노테이션 기반 스프링 MVC 를 사용할 때, 웹 MVC 에 필요한 설정을 편리하게 설정해준다. `@Configuration` 과 함께 자바 설정 클래스에 같이 붙이면 된다.

Dispatcher 에 등록된 기본 인터페이스 외에 다양한 인터페이스가 추가된다. delegation(위임) 패턴으로 되어 있어서 확장성이 좋다.



<br />

## WebMvcConfigurer

`@EnableWebMvc` 에서 제공하는 다양한 인터페이스를 커스터마이즈 할 때, `WebMvcConfigurer` 을 상속받아서, 메소드를 오버라이딩하면 편하다.



**스프링부트 없이 스프링 웹 MVC 를 활용하는 방법 정리**

* **web.xml 설정**을 통해 `servletContext`, `WebApplicationContext`, `DispatcherServlet` 을 등록한다.

* 또는 web.xml 대신 **`WebApplicationInitializer`** 를 사용해서 **java 설정**을 한다. `onStartup`  메소드 오버라이딩하여 `WebApplicationContext` 를 등록하고,  이를 `DispatcherServlet` 에 서블릿으로 등록한다. 그리고, 원하는 url 을 매핑해준다.

  > `WebApplicationContext` 에는 `servletContext` 서블릿 (기존 서블릿 빈 들을 담고 있음)을 설정해주어야 하고, 서블릿 빈을 탐색할 수 있도록 만든 자바 설정 파일 (예. WebConfig.java) 를 `WebApplicationContext` 에 등록해준다.

* WebConfig 를 만들었다면, `@Configuration`, `@EnableWebMvc` 를 추가한다. 빈을 스캔하려면 `@ComponentScan` 도 등록한다.

   WebMvcConfigurer 를 상속받고, 원하는 설정을 위해 메소드 오버라이딩을 한다. (이렇게하면 `@Bean` 으로 등록하는 것보다 간편하다.) 뷰리졸버, 포매터, 인터셉터 등등을 구현하면 된다.



**Intellij 세팅**

* 메이븐(또는 그레들)으로 프로젝트를 실행한다.
* pom.xml 에 servlet API 의존성을 추가한다.
* WAS(톰캣)은 별도로 다운받는다.(mac OS 인 경우, `.sh` 로 끝나는 파일들의 실행권한을 부여한다. (`chmod +x ./*.sh` )
* Run/Debug Configuration 에서 톰캣 서버, 로컬로 설정한다.
* 어플리케이션을 실행시킨다.



<br />

---

## 스프링부트에서 스프링 MVC 설정



스프링 애플리케이션 안에는 Spring IoC Container 와 내장된 톰캣이 있다. 내장 톰캣에는 `DispatcherServlet` 이 있는데 이는 Spring IoC Container  를 상속받아 만들어진다.

스프링 부트의 주관이 적용된 자동 설정이 동작한다. jsp 보다 thymeleaf 를 선호하고, json을 지원하며, 정적리소스를 지원( 그 외 welcomepage, fivicon을 지원한다)한다. 

`spring-boot-autoconfigure` > `EnableAutoConfiguration` 을 보면 자동으로 스프링 부트가 하는 설정들을 볼 수 있다.

`DispatcherServlet.java`  에서 `doService()` 에 브레이크 포인트를 정하고 디버그로 실행시켜보자. 자동설정된 여러 인터페이스를 볼 수 있다. 



**스프링 MVC 커스터마이징**

* `application.properties` 에 설정을 추가하는 것이 가장 간편한 설정 방법이다. 스프링 부트 설정을 그대로 사용하면서 원하는 설정을 추가한다.
* `@Configuration` + `implements WebMvcConfigurer` : 스프링 부트의 스프링 MVC 자동 설정을 그대로 쓰면서, 추가 설정을 하는 방법이다.
* `@Configuration`+ `@EnableWebMvc` 를 같이 사용하면 스프링 부트의 스프링 MVC 자동 설정을 더 이상 사용하지 않게 된다. 커스터마이징은 `implements WebMvcConfigurer` 을 구현하여 한다.







