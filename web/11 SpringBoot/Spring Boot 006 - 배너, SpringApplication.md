# Spring Boot 006 - 배너, SpringApplication



```java
public static void main(String[] args) {
    SpringApplication.run(MySpringConfiguration.class, args);
}
```

`INFO` 로깅 메시지가 보입니다. `INFO` 외 로그레벨을 보려면, [Log Levels](https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-custom-log-levels) 을 참고합니다.

resources 폴더 아래에

`application.properties` 파일을 생성합니다.

```
logging.level.root=warn
logging.level.org.springframework.web=debug
logging.level.org.hibernate=error
```

원하는 설정을 입력하면, 로그 레벨을 설정할 수 있습니다.



## 1.1 Startup Failure

`FailureAnalyzers` 을 등록하면, 시작단계에서의 실패를 체크할 수 있습니다.

예를 들어 이미 사용하고 있는 8080 포트에서 웹 애플리케이션을 실행한다면, 아래와 비슷한 메시지를 보게 될 것입니다.

```
***************************
APPLICATION FAILED TO START
***************************

Description:

Embedded servlet container failed to start. Port 8080 was already in use.

Action:

Identify and stop the process that's listening on port 8080 or configure this application to listen on another port.
```





> 스프링 부트는 여러가지 `FailureAnalyzers` 종류를 지원합니다.



다른 방법으로 예외 처리에 대한 로그를 볼 수 없다면, full conditions report를 나타내어 무엇이 틀렸는 지 확인해 볼 수 있습니다.

`org.springframework.boot.autoconfigure.logging.ConditionEvaluationReportLoggingListener=DEBUG` 를 등록합니다.



---

### 1.3 Banner 커스터마이징

`banner.txt` 파일을 classpath에 추가하거나, `spring.banner.location` 프로퍼티를 설정해서 시작시 나오는 화면을 변경할 수 있습니다.

파일이 UTF-8을 제외한 인코딩을 가지고 있다면 `spring.banner.charset`을 설정할 수 있습니다.

또한 신기하게도, `banner.gif`, `banner.jpg`, `banner.png` 를 classpath에 추가하고, `spring.banner.image.location`를 설정함으로써 이 이미지를 ASCII art로 만들어낼 수 있습니다.



resource 에 banner.txt 를 생성합니다.

구글에 ASCII art genertator 를 검색해서, 만들고 싶은 아스키 아트를 만들어 복사해옵니다.

banner.txt에 복사하고, 원하는 변수를 가져와서 출력하도록 합니다.

**banner.txt**

```txt
 __      __                .______.
/  \    /  \___________  __| _/\_ |__   ____
\   \/\/   /  _ \_  __ \/ __ |  | __ \_/ __ \
 \        (  <_> )  | \/ /_/ |  | \_\ \  ___/
  \__/\  / \____/|__|  \____ |  |___  /\___  >
       \/                   \/      \/     \/

Wordbe's Spring Boot : ${spring-boot.formatted-version}
${application.title} Version: ${application.formatted-version} Version: ${application.formatted-version}
```

여기서 application.formatted-version 변수는 manifest 파일에 의존합니다. 이 파일은 maven 빌드 시 생성되므로, 우리는 implementation 버전을 추가해주도록 합니다.

**pom.xml** 의 build > plugins 에 다음을 추가해줍니다.

```xml
...
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <configuration>
        <archive>
            <manifestEntries>
                <Implementation-Version>1.0.0</Implementation-Version>
                <Implementation-Title>SpringBootDayByDay</Implementation-Title>
            </manifestEntries>
        </archive>
    </configuration>
</plugin>
```

그 후 메이븐을 업데이트 합니다.

```shell
$ mvn clean package
```

```shell
java -jar target\springbootday004-1.0-SNAPSHOT.jar
```

<br>

<br>

<br>

---

### 1.4 SpringApplication 커스터마이징

```java
public static void main(String[] args) {
//        SpringApplication.run(Application.class, args);
        SpringApplication application = new SpringApplication(Application.class);
        application.setBannerMode(Banner.Mode.OFF);
        application.run(args);
    }
```

SpringApplication을 위와 같이 응용해서 사용할 수 있습니다. 배너를 안나오도록 설정해 보았습니다.

<br>

### 1.5 Fluent Builder API

`ApplicationContext`는 Spring에서 매우 중요한 클래스 중 하나입니다. bean factory로 사용이 되었습니다. 이를 스프링부트에서 사용하려면, `SpringApplicationBuilder`를 이용합니다.

<br>



### 1.6 애플리케이션 Events, Listeners

모든 Bean은 ApplicationContext 안에서 관리가 됩니다. Listener는 이에 속하지 않을 수 있습니다. 애플리케이션을 만들기 전에도 동작하는 이벤트의 리스너가 있을 수 있기 때문입니다. 자동으로 등록되게 하고 싶으면, `META-INF/spring.factories`파일에 `org.springframework.context.ApplicationListener`를 이용해서 key, value로 등록해주면 됩니다.

ApplicationListener 를 하나 등록해봅시다.

예제)

루트 패키지 아래에 리스너 클래스 생성

**MyListener.java**

```java
package me.whiteship;

import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationListener;

public class MyListener implements ApplicationListener<ApplicationStartedEvent> {

    @Override
    public void onApplicationEvent(ApplicationStartedEvent applicationStartedEvent){
        System.out.println("APPLICATION IS STARTED");
    }
}

```



**Application.java** (main)

```java
...
public static void main(String[] args) {
    SpringApplication application = new SpringApplication(Application.class);
    application.addListeners(new MyListener());
    application.run(args);
}
```



프로그램이 실행되면, 리스너 타이밍에서 MyListener 가 실행되는 것을 볼 수 있습니다.







---

**Reference**

https://www.youtube.com/watch?v=38UK7BRJf1o

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features