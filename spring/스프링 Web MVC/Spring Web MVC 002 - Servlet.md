# Spring Web MVC 002 - Servlet



<br />

## Servlet

**서블릿(Servlet) 이란**

* 웹 통신에서 요청과 응답을 처리하는 자바 객체이다. 자바 엔터프라이즈 에디션이 웹 애플리케이션 개발용 스펙과 API를 제공해준다.
* 요청 당 쓰레드가 생성되거나, 풀에서 가져와서 사용된다.
* 주요 클래스로 `HttpServlet` 이 있다.
* 서블릿 등장이전에는 CGI (Common Gateway Interface) 기술이 있었는데 이는 요청 당 프로세스를 생성하였다. 서블릿은 CGI 에 비해서 작동이 빠르고, 플랫폼에 독립적이며, 보안이 좋고, 이식성이 강하다.



**서블릿 엔진 (=서블릿 컨테이너)** 

* Tomcat, Jetty, Undertow 같은 WAS(Web Applilcation Server)가 서블릿 엔진이다. 서블릿을 실행시킬 수 있다.
* 세션 관리, 네트워크 서비스, 서블릿 생명주기 관리, MIME 기반 메시지 인코딩, 디코딩 등의 기능을 제공한다.



**서블릿 생명주기(Servlet Lifecycle)**

1. 서블릿 컨테이너가 서블릿 인스턴스의 `init()` 메소드를 호출하여 초기화 한다.
   * `init()` 은 최초 호출시 한 번 실행이 되고, 서버가 유지된다면 다음 요청시에는 `init()` 를 실행하지 않는다.
2. 서블릿 인스턴스의 `service()`  메소드를 호출한다. 클라이언트의 요청을 처리하며, 각 요청은 별도의 쓰레드로 처리된다.
   * Http 요청을 받고, Http 응답을 만든다.
   * 보통 Http 메소드에 따라 `doGet()`, `doPost()` 등으로 이후 처리를 위임한다. 따라서 보통 바로 `doGet()`, `doPost()` 를 구현한다.
3. 서블릿 컨테이너의 판단에 따라 서블릿을 메모리에서 내려야 할 시점에 `destroy()` 메소드를 호출한다.

<br />

**예제**

```java
public class MangoServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("mango servlet init");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("mango servlet doGet");
        resp.getWriter().println("<html><head></head><body>");
        resp.getWriter().println("<h1>Welcome Mango</h1>");
        resp.getWriter().println("</body></html>");
    }

    @Override
    public void destroy() {
        System.out.println("mango servlet destroy");
    }
}
```



기본적으로 `web.xml` 파일에 서블릿, 서블릿 매핑 설정을 하는 게 맞지만, 스프링부트 환경에서 작업 중이라 자바 설정파일을 만들어서 서블릿을 매핑했다.

```java
@Configuration
public class ServletRegistrationConfig {

    @Bean
    public ServletRegistrationBean<MangoServlet> getServletRegistrationBean() {
        ServletRegistrationBean<MangoServlet> mangoServletBean = new ServletRegistrationBean<>(new MangoServlet());
        mangoServletBean.addUrlMappings("/mango");
        return mangoServletBean;
    }
}
```

브라우저에 `localhost:8080/mango` 요청을 보냈을 때, 콘솔 창에서 `init()`, `doGet()` 을 확인해보자. 그리고 한 번 더 요청했을 때 `doGet()` 만 나옴을 확인하자. (서블릿이 이미 WAS 메모리에 있으므로, init은 하지 않는다.) 마지막으로 서버를 종료시킬 때 `destroy()`를 확인해보자.



<br />

---

## 서블릿 리스너, 필터



**Servlet Listener**

리스너는 웹 어플리케이션에서 발생하는 주요 이벤트를 감지하고, 각 이벤트에 특별한 작업이 필요한 경우 사용한다.

서블릿 컨텍스트 수준의 이벤트에는 컨텍스트 라이프사이클 이벤트와 컨텍스트 애트리뷰트 변경 이벤트가 있다. 세션 수준도 마찬가지 이다.



(스프링 부트 환경에서 하려면 `@WebListner` 을 사용한다. 그 후 자바 설정파일에서 `@Configuration` 과 함께 `@ServletComponentScan` 를 붙여서 서블릿 리스너를 찾게한다.)

```java
@WebListener
public class AppleListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("Context Initialized (Apple)");
        sce.getServletContext().setAttribute("name", "apple");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Context Destroyed (Apple)");
    }
}
```





<br />

**ServletFilter**

서블릿 컨테이너가 요청을 서블릿으로 보내기 전, 서블릿이 응답을 서블릿 컨테이너로 보내기 전에 특별한 처리가 필요하다면 Filter 를 사용할 수 있다.



필터를 만든다.

```java
public class AppleFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("Filter init (Apple)");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("Filter doFilter (Apple)");
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        System.out.println("Filter destroy (Apple)");
    }
}
```

(스프링부트 환경에서는 필터를 등록하고, 필터에 서블릿을 등록한다.)

```java
@Configuration
public class FilterRegistrationConfig {

    @Bean
    public FilterRegistrationBean appleFilterRegistration() {
      	// 필터 등록
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new AppleFilter());
        registration.setName("appleFilter");
      
      	// 서블릿 등록
        registration.addServletNames("mango");
        return registration;
    }
}
```





<br />

---

## Spring MVC 연동

<br />

**서블릿 애플리케이션에 스프링 연동**

1) 서블릿에서 스프링이 제공하는 IoC 컨테이너를 활용할 수 있다. `ContextLoaderListener` 를 통해서 서블릿 컨텍스트를 모을 수 있다. `AnnotationConfigApplicationContext` 를 통해 어노테이션으로 이 컨텍스트를 등록할 수 있게 만들 수 있다. 



> * `ContextLoaderListener` 는 서블릿 리스너의 구현체이다. ApplicationContext 를 만들어주고, 서블릿 컨텍스트 라이프사이클에 따라 등록하고 소멸시켜 준다. 서블릿에서 IoC 컨테이너를 `ServletContext` 를 통해 꺼내서 사용할 수 있다.





<br />

2) 스프링이 제공하는 서블릿 구현체 **`DispatcherServlet`** 을 사용한다.

이 구현체는 스프링 MVC 의 핵심이며, Front Controller 역할을 한다.

> Front Contoller 는 요청을 최전방에서 받아서 여러 컨트롤러 중 적합한 컨트롤러에게 이를 배분한다.

> `ServletContext` 에 들어있는 `ApplicationContext` 가 `Root WebApplicationContext` 이다. `DispatcherServlet` 안에서는 `Servlet WebApplicationContext`가  `Root WebApplicationContext` 를 상속받는다.
>
> `ContextLoaderListener` 를 통해서 만든 `ApplicationContext` 들(즉, `Root WebApplicationContext`) 은 모든 서블릿이 공유하며 사용할 수 있다.

DispatcherServlet 하나를 등록하고, 여기에 모든 빈을 넣는 방법을 많이 사용한다.





<br />

---

## DispatcherServlet





**DispatcherServlet 초기화**

* 특별한 타입 빈들을 찾거나, 기본 전략에 해다하는 빈들을 등록한다.
* `HandlerMapping` 은 핸들러를 찾아주는 인터페이스이다. `HandlerAdapter` 는 핸들러를 실행하는 인터페이스이다.
* 그 외에 `HandlerExceptionResolver`, `ViewResolver` 등이 있다.



**DispatcherServlet 동작 순서**

1. 요청을 받고, 요청을 분석한다. (로케일, 테마, 멀티파트 등)

2. 요청을 처리할 핸들러를 찾는다. (**핸들러 매핑**에게 위임한다.)

   handler 매핑에서 여러 handler 를 찾아온다. 기본적으로 핸들러 2개를 제공한다. (`BeanNameUrlHandlerMapping`, `RequestMappingHandlerMapping`) 

   > `@GetMapping` 등 어노테이션 기반 핸들러 사용시 `RequestMappingHandlerMapping` 에서 요청매핑을 찾아 매핑해준다.

3. 핸들러를 실행할 수 있는 **핸들러 어탭터**를 찾는다.

   handler 어댑터도 기본적으로 3가지를 제공한다. 

   > 어노테이션 기반 핸들러 사용시 이 중 `RequestMappingHandlerAdapter` 가 핸들러를 실행해줄 수 있다.

4. 찾아낸 핸들러 어탭터를 사용하여 핸들러의 응답을 처리한다.

   이 때 핸들러 리턴값을 보고 그에 알맞게 처리한다. 뷰 이름에 해당하는 뷰를 찾아서 모델 데이터를 렌더링한다. 만약 `@ResponseBody` 가 있다면 Converter 를 사용해서 응답 본문을 만든다.

5. 예외가 발생했다면, 예외 처리 핸들러에 요청 처리를 위임한다.

6. 최종 응답을 보낸다.



`DispatcherServlet` 을 힌 단계 파고 들어가면 `initViewResolvers` 를 볼 수 있다. 핸들러를 모두 찾아서 handlerMapping 에 빈을 집어 넣는다. 위에서 말했던 핸들러 매핑이 없을 경우 기본전략 중에서 사용한다.

`ViewResolver` 를 사용하면, 뷰 이름에 대한 기본 설정을 할 수 있다. 기본적으로 `InternalResourceViewResolver` 타입으로 정의되어있다.  prefix, suffix 설정 등을 할 수 있다.





<br />

---

## Spring MVC 구성요소



### DispatcherServlet

DispatcherSerlvet 의 기본전략은 `DispatcherServlet.properties` 에 명시되어 있다. DispatcherServlet 초기화시 특정 타입에 해당하는 빈을 찾아낸다.

DispatcherSerlvet에 추가하거나 수정할 수 있는 구성 대표적인 인터페이스는 아래와 같다. (아래 9가지 이외에 더 다양한 인터페이스가 있다.)

<br />

**1 MultipartResolver**

* 파일 업로드 요청 처리에 필요한 인터페이스이다. 스프링 부트에서는 기본적으로 `StandardServletMultipartResolver` 를 제공한다.
* HttpServletRequest 를 MultipartHttpServletRequest 로 변환해주어서 요청이 담고 있는 file 을 꺼낼 수 있는 API 를 제공한다.

**2 LocaleResolver**

* 적절한 지역 정보를 제공한다. 클라이언트의 위치(locale) 정보를 파악하는 인터페이스이다.
* `AcceptHeaderLocaleResolver` 가 기본 구현체이고, accept-language 를 보고 판단하는 기본전략을 사용한다.
* 세션 기반, 쿠키 기반 등도 있다.

**3 ThemeResolver**

* 테마(theme) 리졸버는 애플리케이션에 설정된 테마를 파악하고 변경할 수 있는 인터페이스이다.

**4 HandlerMapping** (여러 빈 사용가능)

* 요청을 처리할 핸들러(컨트롤러의 메소드)를 찾는 인터페이스이다.
* bean 이름 기반, 어노테이션 기반 핸들러 매핑이 있다.

**5 HandlerAdapter** (여러 빈 사용가능)

* 핸들러매핑이 찾아낸 핸들러를 처리하는 인터페이스이다.
* 스프링 MVC 확장력의 핵심으로, 핸들러를 원하는 대로 커스터마이즈 할 수 있다.

**6 HandlerExceptionResolver** (여러 빈 사용가능)

* 요청 중에 발생한 에러를 처리하는 인터페이스이다. 예를 들어 `@ExceptionHandler` 로 예외 처리 핸들러를 만들 수 있다.

**7 RequestToViewNameTranslator**

* 핸들러에서 뷰 이름을 명시적으로 리턴하지 않은 경우(`return viewname` 생략), 요청을 기반으로 뷰 이름을 판단하여 제공해주는 인터페이스이다.

**8 ViewResovler **(여러 빈 사용가능)

* 뷰 이름(string)에 해당하는 뷰를 찾아내는 인터페이스이다.
* 스프링부트에서는 뷰리졸버가 여러 개(`InternalResourceViewResolver`, `BeanNameViewResolver`, `ContentNegotiatingVeiwResolver` 등) 등록되어 있다.

**9 FlashMapManager**

* `FlashMap` 인스턴스를 가져오고 저장하는 인터페이스이다. 주로 리다이렉트를 사용할 때 요청 매개변수를 사용하지 않고, 데이터를 전달하고 정리할 때 사용한다. 기본 구현체는 세션 기반으로 만들어져 있다.( `SessionFlashMapManager` )

  > 리다이렉트
  >
  > POST 요청을 하여 데이터를 받고 저장한 후, 리다이렉트로 GET 요청을 하여 다른 페이지를 보여준다. 즉, 리다이렉트는 화면에서 같은 url으로 새로고침(refresh)을 하면 POST요청(form 요청) 중복으로 반복하여 발생하므로 방지하기 위한 패턴이다. POST 대신 GET 요청으로 화면을 보여준다.



**스프핑 부트로 스프링 MVC를 사용할 때** 자바 애플리케이션에 내장 톰캣을 만들고, 그 안에 `DispatcherServlet` 을 등록한다. 여러 자동 설정이 있고, 스프링 부트의 주관에 따라 여러 인터페이스 구현체를 빈으로 등록해놓았다.





