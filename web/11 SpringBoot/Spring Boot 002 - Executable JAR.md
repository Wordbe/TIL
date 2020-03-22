# Spring Boot 002



## Executable Jar 생성



필요한 의존성을 모두 가진(self-contained), 실행가능한 jar file("fat jars" 라고도 불림)을 생성합니다.



>* jar 파일 : 여러개의 자바 클래스 파일과, 클래스들이 이용하는 관련 리소스 및 메타데이터를 하나의 파일로 모아서 자바 플랫폼에 응용 소프트웨어나 라이브러리를 배포하기 위한 소프트웨어 패키지 포맷의 파일
>* war 파일 : **W**ebApplication **Ar**chive, 즉 웹 어플리케이션 저장소이며 웹 어플리케이션을 압축해 저장해 놓은 파일입니다. 개발한 웹어플리케이션 프로젝트가 WAS에서 돌아갈 수 있는 구조를 담고 있으며 JSP 및 서블릿 빈클래스 등의 소스가 컴파일 되어 저장되며 기타 이미지 및 자원들이 포함되어 있습니다.



---

(여기서부터는 Executable jar 에 대한 더 상세한 설명이니, 건너뛰어도 됩니다.)

> java에는 nested jar 파일을 불러오는 표준 방법이 없습니다. 이를 위해 "uber" jar를 사용합니다. 하지만 uber jar 또한 어떤 라이브러리를 쓰는지 알기 어렵고, 같은 이름을 가진 파일이 있으면 문제가 될 수 있습니다.
>
> 그래서 스프링 부트는 다른 방법을 사용합니다.

`spring-boot-loader`는 Maven이나 Gradle plugin을 사용하면, 실행 가능한 Jar 파일을 자동으로 생성해줍니다.

Nested JARs (jar 파일 안에 여러 jar파일 들이 묶여 있는 것) 파일을 java가 불러오는 것은 불가능합니다. 따라서 스프링부트가 지원하는 방법은 아래와 같습니다.

<br>

**스프링 부트 Loader-compatible jar 파일**

```jar
example.jar
 |
 +-META-INF
 |  +-MANIFEST.MF
 +-org
 |  +-springframework
 |     +-boot
 |        +-loader
 |           +-<spring boot loader classes>
 +-BOOT-INF
    +-classes
    |  +-mycompany
    |     +-project
    |        +-YourClasses.class
    +-lib
       +-dependency1.jar
       +-dependency2.jar
```

어플리케이션 클래스는 nested `BOOT-INF/classes` directory 안에 있어야 합니다. 의존성은 nested `BOOT-INF/lib` directory 안에 있어야 합니다.

<br>

**스프링 부트 Loader-compatible war 파일**

```war
example.war
 |
 +-META-INF
 |  +-MANIFEST.MF
 +-org
 |  +-springframework
 |     +-boot
 |        +-loader
 |           +-<spring boot loader classes>
 +-WEB-INF
    +-classes
    |  +-com
    |     +-mycompany
    |        +-project
    |           +-YourClasses.class
    +-lib
    |  +-dependency1.jar
    |  +-dependency2.jar
    +-lib-provided
       +-servlet-api.jar
       +-dependency3.jar
```

의존성은 nested `WEB-INF/lib` directory안에 있어야 합니다. 실행할 때는 필요하지만, 웹 컨테이너를 배포하는데 필요없는 의존성은 `WEB-INF/lib-provided` 안에 있어야 합니다.



#### "JarFile"

스프링 부트는 `org.springframework.boot.loader.jar.JarFile`를 통해 표준 jar 파일을 읽어올 수 있습니다. 아래와 같은 정보를 기록합니다. unpack 할 필요도 없고, 모든 데이터를 메모리에 올려놓을 필요도 없습니다.

```
myapp.jar
+-------------------+-------------------------+
| /BOOT-INF/classes | /BOOT-INF/lib/mylib.jar |
|+-----------------+||+-----------+----------+|
||     A.class      |||  B.class  |  C.class ||
|+-----------------+||+-----------+----------+|
+-------------------+-------------------------+
 ^                    ^           ^
 0063                 3452        3980
```



#### Executable Jars 실행

3가지 런처(`JarLauncher`, `WarLauncher`, `PropertiesLauncher`)가 있는데, 이 들의 목표는 nestsed jar 파일을 읽어들이는 것이 목표입니다. 

`Launcher`는 `Main-Class`에 설정해주어야 합니다. Maven 플러그인이 이를 자동으로 해주니 신경쓰지 않아도 됩니다.



> 1 부트 클래스 로더 (java 런타임 라이브러리 읽음)
>
> 2 시스템 클래스로더 (application, 상위단 라이브러리 읽음)
>
> 3 컨텍스트 클래스 로더 (각 클래스 관련 라이브러리 읽음)(대부분의 컨테이너는 자신만의 클래스 로더가 따로 있으므로, ContextClassLoader가 각각인 경우가 많습니다.)



스프링부트에서는 클래스를 불러올 때 `Thread.getContextClassLoader()`를 사용해야 합니다. 

예를 들어 `ClassLoader.getSystemClassLoader()`를 사용하면 실패합니다.**`java.util.Logging` 은 이와 같은 시스템 클래스 로더를 사용하므로, 로깅 시 다른 로깅 프로그램을 사용해야 합니다.(slf4j, log4j 등)**

---

(이어서)



Executable jar 을 생성하기 위해, `spring-boot-maven-plugin`을 `pom.xml`에 추가합니다.

**pom.xml**

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```



바뀐 설정이 있으므로 메이븐을 업데이트 시켜줍니다.(build)

```shell
$ mvn package
```



jar 파일안에 무엇이 들어있는 지 확인합니다.

```shell
$ jar tvf spring-boot-day001-0.0.1-SNAPSHOT.jar
```



jar 파일을 실행합니다.

```shell
$ java -jar spring-boot-day001-0.0.1-SNAPSHOT.jar
```







---

# Part III. 스프링 부트 사용하기

빌드 시스템, auto-configuration, 어플리케이션 실행 방법 등을 알아봅니다. 개발 프로세스를 쉽게 해주는 방법을 배웁니다.



### Build Systems

스프링 부트는 의존성 관리를 지원하는 빌드 시스템을 쓰는 것을 권장하고 있습니다. 그래서 Maven 또는 Gradle 중 하나를 선택해 쓰는 것을 권장합니다. 



### 의존성 관리(Dependency Management)

스프링 부트를 업그레이드하면, 의존성도 같이 관리해줍니다. 

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.4.RELEASE</version>
</parent>
```

이 부분은 스프링 부트를 상속받는 부분이고, 의존성관리도 알아서 해줍니다.

또한 dependency에 들어가면 property가 있는데, 이 안에 있는 프로퍼티를 오버라이딩(overriding) 할 수 있습니다. 그래서 앱에서 원하는 버전을 설정할 수 있습니다.



> **버전 Tip**
>
> SNAPSHOT : 매일 매일 빌드하는 버전
>
> MILESTONE(M 버전) : snapshot 보다는 긴 주기로 빌드
>
> RELEASE Candidate(RC): snapshot, M 버전 보다 더 긴 주기로, 정리된 형태로 빌드
>
> snapshot이나 milestone에서는 새로 개발 중인 interface, 기능이 있고 실험하고 있다면 바꿀 수 있음, RC 버전 부터는 주로 바꾸지 않음.
>
> Generally Available(GA 버전) : 가장 안정된 버전, Maven 중앙 저장소에 업데이트 됨.



되도록 GA 버전을 쓰는 것을 권장합니다.

특히, spring framework의 버전을 바꾸는 것은 피하는 것이 좋습니다. (spring boot는 spring framework 버전에 강한 의존성을 가집니다.)



스프링부트 버전은 서드파티(Third party) 버전까지 지원합니다.(예. hibernate-validator)



### Maven

`spring-boot-starter-parent`를 상속받아 메이븐 사용이 가능합니다. 아래 기능을 제공합니다.

* Java 1.8
* UTF-8 소스 인코딩
* 의존성 관리 섹션
* 합리적인(sensible) 리소스 필터링
* 플러그인 설정(exec plugin, Git commit Id, shae)
* `application.properties`와 `application.yml`을 위한 리소스 필터링



`spring-boot-starter-parent` POM 을 이용하는 대신, `scope-import`를 사용할 수도 있습니다. 단, 의존성 오버라이딩은 할 수 없습니다. 의존성을 오버라이딩 하려면 `dependencyManagement`안에 따로 설정을 해주면 됩니다.

```xml
<dependencyManagement>
    <dependencies>
        <!-- Override Spring Data release train provided by Spring Boot -->
        <dependency>
            <groupId>org.springframework.data</groupId>
            <artifactId>spring-data-releasetrain</artifactId>
            <version>Fowler-SR2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.2.4.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

여기서 dependency를 BOM이라 합니다.

> **BOM**(Bill of Material)은 특정 제품(Item)이 어떠한 부품(Item)으로 구성되는지에 대한 정보를 담고 있습니다



Maven을 이용하려면 pom.xml 에 아래를 추가하면 됩니다. (spring-boot-starter-parent를 사용하는 전제 하)

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```







---

**Reference**

https://www.youtube.com/watch?v=PicKx3lDGLk&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=2

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/getting-started.html#getting-started

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/appendix-executable-jar-format.html#executable-jar