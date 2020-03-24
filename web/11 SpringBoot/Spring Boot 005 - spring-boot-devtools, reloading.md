# Spring Boot 005 - spring-boot-devtools, reloading

Spring Boot의 Devtools(Developer Tools)는 개발의 편의를 위한 도구를 지원합니다.

오늘 설명할 내용은

* Property 캐싱 설정
* 자동 재시작(restart)
* LiveReload(새로고침)
* Global Settings
* 원격 애플리케이션 실행

입니다.



<br>

### 8.1 Property 기본값

Spring Boot가 지원하는 몇몇 라이브러리는 **성능을 향상하기 위해 캐시를 사용합**니다. 예를 들어 [template engines](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-spring-mvc-template-engines) 반복적으로 템플릿 파일을 파싱하는 것을 피하기 위해 컴파일된 템플릿을 캐싱합니다.

**static resource를 서비스할 때 spring MVC는 HTTP 캐싱 헤더를 응답(response)에 추가합니다.**



캐싱은 production에서는 이익이 되지만, 개발시기에는 불이익입니다. 애플리케이션에서 방금 만든 변화를 보는 것을 막기 때문입니다. 이러한 이유로 `spring-boot-devtools`는 **디폴트로 캐싱을 비활성화** 합니다.

캐싱 옵션은 `application.properties`에서 설정가능합니다. 그리고 production 용으로 패키징할 때는 cashing이 자동으로 활성화됩니다.

이렇게 property 값을 손수 수정하기보다는, `spring-boot-devtools` 모듈을 적용하면 자동 적용이 되어 편합니다.

> devtools가 적용된 전체 property를 보려면, [DevToolsPropertyDefaultsPostProcessor](https://github.com/spring-projects/spring-boot/tree/v2.2.4.RELEASE/spring-boot-project/spring-boot-devtools/src/main/java/org/springframework/boot/devtools/env/DevToolsPropertyDefaultsPostProcessor.java) 를 참조합니다.

<br>

#### 캐싱 테스트 예제

resource 에 static 폴더를 만들고 파일을 만들면, HTTP 캐싱 헤더가 '응답'에 추가되는지 확인해봅니다.

**resources/static/index.html**

```html
<!DOCTYPE HTML>
<html>
<head>
    <title>Getting Started: Serving Web Content</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>
<p>Get your greeting <a href="/greeting">here</a></p>
</body>
</html>
```



이제 main method를 실행시키면, static 폴더 아래 있는 html은 해당 URL에서 자동으로 실행이 됩니다.

index.html 을 약간 수정하고 다시 브라우저를 새로고침 해봅시다.

아무것도 바뀌지 않는데, 이 때 **IntelliJ IDE > Build > Build Project** 로 다시 빌드해줍니다.

브라우저를 띄우고, 개발자 도구(F12) 들어가 응답 창을 확인합니다.



실제로, restart 시 캐싱 덕분에 재시작시간이 빨라졌음을 알 수 있습니다.



<br>

### 8.2 자동 재시작(Restart)

`spring-boot-devtools`를 사용하는 애플리케이션은 classpath 위의 파일이 변경될때마다 자동적으로 재시작됩니다. 기본적으로 classpath에 있는 엔트리는 변경사항이 모니터링 됩니다. 하지만 static assets와 view template 등 특정 리소스는 애플리케이션을 다시 시작할 필요가 없습니다.

> 자동 재시작은 LiveLoader와 잘 연동이 됩니다. JRebel을 쓸 경우, 자동재시작이 꺼지고, dynamic class reloading이 사용됩니다.

> Devtools는 `spring-boot`, `spring-boot-devtools`, `spring-boot-autoconfigure`, `spring-boot-actuator`, and `spring-boot-starter` 이름을 가진 프로젝트는 classpath가 갱신되었을 때 자동재시작하는 것을 무시합니다.

> Devtools는 `ResourceLoader`를 커스터마이징해야 합니다. 직접적인 `getResource` 메소드를 오버라이드하는 것은 지원되지 않습니다.



**재시작 예제**

**hello/HelloService.java**

```java
package me.whiteship.hello;

import org.springframework.stereotype.Service;

@Service
public class HelloService {

    public String getMessage() {
        return "Hello Spring Boot !!";
    }
}

```





**Application.java**

```java
package me.whiteship;

import me.whiteship.hello.HelloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Application {

    @Autowired
    HelloService helloService;

    @RequestMapping("/")
    public String hello() {
        return helloService.getMessage();
    }
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

```

**빌드**(ctrl + F9)





#### Restart vs Reload

써드 파티 안의 jar 파일은 base classloader로 읽어들이고, 사용자가 만드는 클래스는 restart classloader로 읽어들입니다. 이러한 접근은 재시작이 _cold start(완전히 껏다가 다시 켜는 것)_보다 훨씬 빨리 일어나게 도와줍니다. 

아직 재시작(restart)가 느리게 느껴진다면, JRebel 같은 reloading 기술을 이용할 수도 있습니다. JRebel은 릴로딩이 편하도록 클래스를 다시 만듭니다. 



---

### 8.2.2 Excluding Resources

디폴트로, `/META-INF/maven`, `/META-INF/resources`, `/resources`, `/static`, `/public`, or `/templates` 은 재시작을 트리거하지 않지만, live reload(새로고침)는 트리거를 적용시킵니다.



### 8.2.3 추가 경로 보기

classpath 에 있지 않은 파일을 변경할 때도 재시작이다, 릴로딩이 될 수 있게 만들 수 있습니다. 



### 8.2.4 Restart 비활성화

`spring.devtools.restart.enabled` 프로퍼티를 비활성화 시킵니다. `application.properties` 안의 프로퍼티를 설정해주면 됩니다.

완전히 restart 지원을 없애려면, `spring.devtools.restart.enabled` `System` 프로퍼티를 false로 바꿔주면 됩니다.



### 8.2.5 트리거 파일 사용

특정 파일을 수정할 때만 재시작하게 끔 설정할 수도 있습니다.

설정할 트리거파일의 이름으로 `spring.devtools.restart.trigger-file` 프로퍼티를 설정하면 됩니다.

<br>

### 8.2.6 Customizing the Restart Classloader

`.jar`로 참조하고 있는 경우에도, restart 옵션을 등록할 수 있게 도와줍니다. 

`META-INF/spring-devtools.properties` 파일을 생성하고, `include`에 restart 클래스로더에 들어갈 것을 정의하고, `exclude`에는 base 클래스로더에 있는 아이템을 정의하면 됩니다.

프로퍼티 값은 regex(정규식) 패턴으로 적어도 됩니다.

<br>

---

### 8.3 Live Reload

`spring-boot-devtools` 모듈은 LiveReload 서버를 포함하고 있습니다. 

리소스가 바뀌면  브라우저를 자동으로 새로고침해주는 트리거입니다. 파일을 수정하고, 빌드만 하면 브라우저에서 자동으로 새로고침도 해줍니다. :smile:  [livereload.com](http://livereload.com/extensions/) 에서 크롬, Firefox, Safari 에서 브라우저 extenstion으로 사용할 수 있습니다. ([크롬에서 live reload 확장 설치](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei/related))

LiveReload 서버를 원하지 않으면 `spring.devtools.livereload.enabled` 속성을 false로 하면 됩니다.

<br>

---

### 8.4 Global Settings

global devtools 를 설정할 수 있습니다.`$HOME/.config/spring-boot` 디렉토리에 공통 설정을 담아놓습니다. 

```xml
spring.devtools.restart.trigger-file=.reloadtrigger
```

<br>

---

### 8.5 Remote Applications

Spring Boot는 원격으로 앱을 실행시킬 수 있습니다. 

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludeDevtools>false</excludeDevtools>
            </configuration>
        </plugin>
    </plugins>
</build>
```

jar 파일 패키징 할 때, `devtools`가 포함되게 됩니다. Sensible default 도 꺼지게 되서, 캐싱도 무효화됩니다.



### 8.5.1 원격 클라이언트 애플리케이션 실행

IDE에서 사용되도록 제작되었습니다. 

연결하려는 원격 프로젝트와 classpath가 같은 `org.springframework.boot.devtools.RemoteSpringApplication` 을 실행시키면 됩니다. 

```java
RemoteSpringApplication("https://myapp.cfapp")
```



> proxy가 필요하면 설정할 수 도 있습니다. `spring.devtools.remote.proxy.host` and `spring.devtools.remote.proxy.port` properties.

<br>

### 8.5.2 Remote Update

원격 클라이언트는 애플리케이션 local restart에서처럼 classpath를 모니터링 할 수 있습니다. 일반적으로 원격 업데이트와 재시작은 전부 다시 빌드하고 배포하는 것보다 빠릅니다.

<br>

---

### 9 production 용 애플리케이션 패키징하기

실행가능한 jars 파일은 프로덕션 배포에 사용될 수 있습니다. self-contained 되어있다면, cloud 기반 배포에도 적절합니다.

참고 "production ready" *[production-ready-features.html](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/production-ready-features.html#production-ready)* 





---

**Reference**

https://www.youtube.com/watch?v=5BhWpx7RW-w&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=5

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/using-spring-boot.html#using-boot