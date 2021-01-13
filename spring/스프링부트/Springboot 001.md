# Springboot 001



스프링부트 목표

* 빠르고 폭넓은 사용성
* 컨벤션으로 정해져있는 설정 사용, 여기에 사용자 설정 추가 쉽게 가능
* 비즈니스 로직에 추가로 다양한 기능 제공
* 코드 생성하지 않고, xml 설정 필요없다.



## 스프링부트 프로젝트 생성

Intellij > File > New > Project

Gradle > Name(ArtifactId) 및 GroupId 작성 > Finish



**gradle.build**

```shell
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.4.1'
    id 'io.spring.dependency-management' version "1.0.10.RELEASE"
}

group 'me.wordbe'
version '1.0-SNAPSHOT'

repositories {
    mavenCentral()
    jcenter()
}

dependencies {
    implementation('org.springframework.boot:spring-boot-starter-web')
    testImplementation('org.springframework.boot:spring-boot-starter-test')
}

test {
    useJUnitPlatform()
}
```

plugins 에서, 자바, 스프링부트 (버전 선택), 스프링 의존성 관리 (버전 선택)를 설정한다.

* `io.spring.dependency-management` : 라이브러리 간 버전 관리를 해준다. 중요한 기능이다. maven 에서는 spring-boot-starter-parent를 상속받아서 의존성을 관리하자. parent가 결국 dependency managment 모듈과 지어진다.

repositories 의 기본으로 메이븐중앙 저장소를 이용할 것이다. 여기 추가로 다양한 라이브러리가 있고 업로드가 쉬운 jcenter도 추가해도 된다.

다음은 dependencies 에서 필요한 의존성을 추가하자. spring-boot-starter-web, test 를 추가했다.

마지막으로 테스트시 JUnit을 사용하기로 설정한다.





## 스프링 이니셜라이저

이니셜라이져를 사용하면 쉽게 프로젝트를 생성할 수 있다.

Maven / Gradle , Java / Kotilin / Groovy 

그리고 각각 버전들, 프로젝트 이름 등을 정의할 수 있다.

https://start.spring.io/ 

여기서 generate를 누른다음 다운받은 것을 실행시키면 프로젝트가 켜진다.





## 스프링 프로젝트 구조

src 와 gradle 로 나뉜다.

src 는 main 과 test로 나뉜다.

src 안에 resource 가 있는데 classpath 키워드로 경로를 설정할 수 있다.

src 안에서 디폴트 패키지(기본패키지)를 만들고 그 안에 Application 메인 메소들르 구현하면 좋다. 실행 시 해당 패키지 내의 컴포넌트들만 빈에 등록되고 실행이 되도록하기 위함이다.

test 안에서 테스트를 한다.



---



## 자동 설정

`@SpringBootApplication` 안에 여러 어노테이션이 있다.

조금 살펴보면, `@SpringBootConfiuration` 은 기존 `@Configuration` 을 사용하며, 기능도 비슷하다. 빈 설정을 제공한다.



**`@ComponentScan`** 는 어노테이션이 붙은 클래스의 같은 패키지 내(히위 패키지 포함)에서 컴포넌트들을 스캔하여 **빈을 등록한다.**

* 컴포넌트라 함은 `@Component` 애노테이션을 말하고, 이는 `@Configuration`, `@Repository`, `@Service`, `@Controller`, `@RestController` 를 포함한다.

**`@EnableAutoConfiguration`** 은 추가적으로 **빈을 한 번더 읽어 등록한다.** 기본적으로 `@Configuration` 가 들어있고, 스프링부트의 설정을 위한 어노테이션이다. spring.factories 안의 EnableAutoConfiguration 키값을 가지고 여기에 포함된 설정을 읽는다. 그 후 `@ConditionalOn???` 에 따라서 조건에 맞게 빈을 등록한다.





<br />

`@EnableAutoConfiguration` 을 응용해보자.

두 개의 프로젝트가 있다고 가정하면,

A 프로젝트에서 만든 빈을 spring.factories 파일로 저장하여, B 프로젝트에서 불러오게 할 수 있다. B 프로젝트에서 프로퍼티 파일만 수정하면, 그에 맞는 값을 자동으로 손 쉽게 불러오도록 해보자.

설정해야할 것들이 몇가지 있지만, 한 번 설정해오면 다른 프로젝트에서 끌어와 쉽게 자동 설정 할 수 있으므로 원리와 방법을 익혀보자.



**A 프로젝트**

프로젝트를 처음만들 때 아래와 같이 메이븐을 설정해주자. spring-boot-autoconfigure 모듈은 자동 설정을 하기 위한 모듈인데 B프로젝트의 spring-boot-starter 모듈(필요한 의존성을 정의하는 모듈)과 합쳐서 같이 만들것이다. (A 프로젝트를 B 프로젝트에 의존성 추가)

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>co.wordbe</groupId>
    <artifactId>springboot-autoconfigure</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>14</maven.compiler.source>
        <maven.compiler.target>14</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- 자동 설정을 위한 라이브러리 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure-processor</artifactId>
            <optional>true</optional>
        </dependency>

      	<!-- EnableConfigurationProperties 사용을 위한 라이브러리-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
  
  	<!-- dependency manager -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.4.1</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

</project>
```

<br />

A 프로젝트 안의 클래스

```java
@Getter
@Setter
@ToString
public class RedUser {
    String name;
    int age;
}

```

<br />

위 클래스의 필드값을 프로퍼티에 따라 설정해주는 클래스이다. B 프로젝트의 프로퍼티 정보를 받아 올 것이다.

```java
@Getter
@Setter
@ConfigurationProperties("reduser") // 프로퍼티명
public class RedUserProperties {
    private String name;
    private int age;
}
```

<br />

설정 프로퍼티를 활성화 될 수 있도록 어노테이션(`@EnableConfigurationProperties`)을 붙인다. 그리고 메소드를 빈(`@Bean`)으로 등록하자.

`RedUser` 객체를 생성하여 (다른 프로젝트안에서 설정된) 프로퍼티 파일을 읽어와서 이름과 나이를 변경하도록 한다.

```java
@Configuration
@EnableConfigurationProperties(RedUserProperties.class)
public class RedUserConfig {

    @Bean
    @ConditionalOnMissingBean // 스프링부트는 @ComponentScan + @EnableAutoConfiguration 두 번 빈등록을 하므로 이미 값이 설정된 빈이 있다면 후에 덮어쓰지 않도록 방지하는 어노테이션
    public RedUser user(RedUserProperties properties) {
        RedUser redUser = new RedUser();
        redUser.setName(properties.getName());
        redUser.setAge(properties.getAge());
        return redUser;
    }
}
```

<br />

이제 resources/META-INF/spring.factories 를 만들어서 **`EnableAutoConfiguration`** 이 탐색할 항목에 등록해주자.

```shell
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  co.wordbe.RedUserConfig
```

```shell
# 메이븐 명령어 실행
$ mvn install
```



<br />

**B 프로젝트 테스트**

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.4.1</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>co.wordbe</groupId>
    <artifactId>springgoman</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>springgoman</name>
    <description>SpringBoot Concept and Application</description>

    <properties>
        <java.version>11</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 스프링 자동 설정 (A 프로젝트 의존성 추가)--> 
        <dependency>
            <groupId>co.wordbe</groupId>
            <artifactId>springboot-autoconfigure</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```



application.properties

```properties
reduser.name = property redname
reduser.age = 16
```



ApplicationRunner로 테스트하면, RedUser 빈이 성공적으로 주입되고, B 프로젝트에서 프로퍼티로 설정한 값이 자동으로 RedUser에 들어가게 된다.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    RedUser redUser;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(redUser);
    }
}

```















