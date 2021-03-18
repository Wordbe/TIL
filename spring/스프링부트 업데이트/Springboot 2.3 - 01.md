# Springboot 2.3



## 스프링 부트 2.3

출시일 2020년 5월

### 주요 변경 내역

* java 14 지원
* 의존성과 프로퍼티 변경
* 효율적인 컨테이너 이미지 생성 방법 제공
* Liveness 와 Readiness - 액츄에이터 통해서 지원한다. + 쿠버네티스 연동
* Graceful Shutdown 지원 - Tomcat, Jetty, Netty, Undertow 가 원래부터 지원, 스프링부트가 손쉽게 사용할 수 있도록 프로퍼티 추가
* Actuator, configprops 엔드포인트 지원 - 특정 프로퍼티가 어디서부터 왔는지 확인 가능

<br />

---

## 의존성 및 프로퍼티 변경

<br />

### 의존성 변경

1. `spring-boot-starter-web` 에서 더이상 `spring-boot-starter-validation` 모듈을 가져오지 않도록 변경되었다.

   validation 의존성은 필요하면 따로 추가한다.

   ```xml
   <dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-validation</artifactId>
   </dependency>
   ```

   

2. Spring Data Neumann 지원

   * 코틀린의 코루틴을 지원한다.

   * MongoDB, Cassandra, Couchbase SDK, QueryDSL, ElasticSearch 버전 업데이트

     **스프링부트는 하위 버전 호환성을 잘 지켜주지 않으니 잘 확인하고 마이그레이션해야한다.** (스프링은 하위호환을 잘 지켜준다.)

   * Spring Data R2DBC 추가

3. Jackson 2.11

   * `Data` 와 `Calendar` 기본 포맷 중에 timezone 표현하는 방법이 표준에 맞도록 변경되었다. (+0000 이 아닌 +00:00 이다. java 8부터 적용)
   * 필드 이름 없이 Array를 만들지 못하도록 변경되었다. Jackson 라이브러리의 변경사항을 반영해주어야 한다.

4. Spring Security 5.3

   * 문서 개선 (이미지 많아짐, 친절)
   * OAuth 2.0 클라이언트

5. JUnit Jupiter 5.6

6. Mockito 3.3

<br />

### 프로퍼티 변경

**Period 지원** : `PeriodToStringConverter`, `StringToPeriodConverter`

> * Period : 연,월, 주, 일 등 캘린더에서 날짜와 날짜 사이를 비교하는 개념
> * Duration : 시간과 시간 사이, 몇시간 몇분 몇초 몇나노초..

**`spring.data.jpa.repositories.bootstrap-mode`** 는 기본으로 deffered 모드를 지원한다.



스프링부트 업그레이드시 반드시 프로퍼티 마이그레이터로 변경해야하는 프로퍼티를 확인한다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId> 
  <artifactId>spring-boot-properties-migrator</artifactId> 
  <scope>runtime</scope>
</dependency>
```

<br />

---

## 스프링부트 애플리케이션 도커 이미지 생성

<br />



## 스프링부트 실행방법



> **메이븐 명령**
>
> maven 이 설치되어있으면 `mvn` 명령어를 사용해도되고,
>
> 프로젝트에 maven wrapper 가 있다면 `./mvnw` 명령어를 사용해도 된다.

**1) jar 파일 실행**

```shell
$ mvn package
```

target 디렉토리에 남아있던 클래스를 포함해서 패키징한다.

따라서 target 삭제하고 깔끔하게 다시 패키징하는 것을 추천한다.

```shell
$ mvn clean package
```

이제 target 디렉토리에 jar 파일이 생성된다.

```shell
$ java -jar target/the-java-springboot-0.0.1-SNAPSHOT.jar 
```



**2) 스프링부트 플러그인으로 실행**

```shell
$ mvn spring-boot:run
```



<br />

## 도커로 스프링부트 실행



### 도커 이미지 생성

먼저 도커 이미지가 필요하다.

스프링부트 프로젝트에 `Dockerfile` 을 만든다.

도커파일에는 도커 이미지를 만드는 방법을 정의한다.

```dockerfile
FROM openjdk:11.0.8-jre-slim
WORKDIR application
ARG JAR_FILE=target/the-java-springboot*.jar
COPY ${JAR_FILE} application.jar
ENTRYPOINT ["java", "-jar", "application.jar"]

```

* `FROM` : 도커 허브로부터 이미지를 받아온다. 이미지가 로컬에 있다면 캐시를 확인해서 로컬이미지를 가져온다.
* `WORKDIR` : work directory 이름
* `ARG` : 아규먼트 설정, 로컬의 target 디렉토리 안에 jar 파일을 아규먼트로 넣을 것이다
* `COPY` : JAR_FILE 을 워킹디렉토리에 application.jar 이름으로 복사한다.
* `ENTRYPOINT` : 도커 컨테이너를 실행할 때 실행하는 명령어이다.

<br />

```shell
# the-java-springboot 라는 태그로 도커 이미지 빌드 (Dockerfile 이 있는 경로에서 명령어 실행)
$ docker build -t the-java-springboot .

# 도커 이미지 리스트 확인
$ docker images

# 컨테이너 실행 (--rm은 컨테이너 종료시 컨테이너를 자동으로 삭제해줌)
$ docker run --rm -p 8080:8080 the-java-springboot

# 컨테이너 실행이되면 스프링부트 서버가 작동된다 (도커파일에 지정해 놓았던 java -jar 명령어에 의해)
```

* `-t` : `--tag` 태그옵션으로, 태그옵션을 붙이지 않으면 해시값으로 임의로 이름지어져서 이미지가 저장된다.

```shell
# dive 툴(도커 이미지 탐색기)을 사용하면 도커 실행의 흐름을 쉽게 볼 수 있다.
$ brew install dive

# dive (도커 이미지 이름)
$ dive the-java-springboot
```



여기서 COPY 레이어를 보면, 클래스 파일 코드 몇 줄 수정했는데 40MB 정도의 크기가 나온다.

스프링이 java 를 패키지하는 방법이 fat jar 형태로 하나의 커다란 자르 파일에 모든 것을 담으려고 하다보니 일어난 사태이다. 스프링 애플리케이션 구동에 필요한 모든 외부 라이브러리들도 같이 묶여서 jar 파일이 형성된다.

직접 jar 파일의 구성을 확인해보면

```shell
# jar 압축 해제
$ jar -xf 파일이름
```

```shell
BOOT-INF
	classes # 애플리케이션 코드 및 리소스
	lib # 라이브러리
	classpath.idx
META-INF 
	maven # maven 프로퍼티, pom.xml
	MANIFEST.MF # MANIFEST(파일들의 그룹을 위한 메타데이터를 포함하는 파일, 파일 목록이 있다.)
org
the-java-springboot-0.0.1-SNAPSHOT.jar
```

* `BOOT-INF` : classes 폴더에 우리가 만든 코드가 들어있다.
* `META-INF` : fat jar 를 처리하는 방법을 아는 JAR_LAUNCHER 를 실행시키고 런처가 메인 애플리케이션을 실행시킨다.

문제는 도커를 실행할 때마다 매번 fat jar를 복사해서 사용한다는 점이다. 효율적인 방법을 알아보자.



<br />

---

## 효율적인 도커 이미지 만들기

스프링부트 없이 계층형으로 효율적인 도커 이미지를 만들어보자.



가장 변하지 않는 것부터 이미지 레이어 쌓기

* 애플리케이션 코드
* 라이브러리
* JDK

변하지 않는 레이어는 캐시를 사용하기 때문에 빌드가 더 효율적이다.



```dockerfile
# 생성된 jar 파일을 jdk로 압축을 푼다.
FROM openjdk:11.0.8-jdk-slim AS builder
WORKDIR source
ARG JAR_FILE=target/the-java-springboot*.jar
COPY ${JAR_FILE} application.jar
RUN jar -xf ./application.jar

# jdk -> library -> application 코드 순으로 이미지 레이어를 쌓는다.
FROM openjdk:11.0.8-jre-slim
WORKDIR application
COPY --from=builder source/BOOT-INF/lib lib
COPY --from=builder source/BOOT-INF/classes app
ENTRYPOINT ["java","-cp","app:lib/*","co.wordbe.thejavaspringboot.Application"]
```

> * jdk 에만 jar 명령이 있다. jdk, jre로 실행할 수 있다.
> * `-cp` : classpath

```shell
$ docker run --rm -p 8080:8080 effective-the-java-springboot
```

한 번 더 실행해보면, 캐시를 사용하여 더 빨리 실행되는 것을 확인할 수 있다.

<br />

---

## 스프링부트 계층형 빌드로 도커 이미지 생성



### 계층형 빌드 layers

스프링 부트 2.3+ 에서 계층형 빌드를 설정해보자.

layers 플러그인을 추가로 설정하자.

이는 jar 파일의 계층을 바뀌는 빈도가 낮은 집단 부터 높은 집단까지 나누어준다. 따라서 도커 이미지를 빌드할 때 바뀌는 빈도가 높은 집단만 수정한다면 시간을 좀 더 절약할 수 있을 것이다.

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration>
    <layers>
      <enabled>true</enabled>
    </layers>
  </configuration>
</plugin>
```

<br />

### 계층형 빌드 명령어

계층형 빌드 jar 실행을 위해서는 아래와 같은 linux 옵션을 사용한다. (list, extract, help)

```shell
$ java -Djarmode=layertools -jar target/the-java-springboot-0.0.1-SNAPSHOT.jar list

>>>
dependencies
spring-boot-loader
snapshot-dependencies
application
```

<br >

`extract` : 스프링부트 계층별로 나눠서 각각 폴더에 담아준다. 이를 도커파일에서 `COPY` 해서 쌓으면서 이미지를 만들 수 있다.

```shell
$ java -Djarmode=layertools -jar target/the-java-springboot-0.0.1-SNAPSHOT.jar list
```



스프링부트 기본 계층은 아래와 같다. 가장 잘 안 바뀌는 dependencies 가 가장 밑의 층이다.

* `application` : 애플리케이션 코드 및 소스
* `snapshot-dependencies` : 버전이 SNAPSHOT 인 라이브러리
* `spring-boot-loader` : 스프링부트 JAR 런처(실행기)에 들어있는 패키지
* `dependencies` : 버전이 SNAPSHOT이 아닌 라이브러리

> SNAPSHOT : 개발 중인 버전, 데일리하게 자주 바뀜

<br />

### 계층을 이용해 도커이미지 직접 만들기

스프링부트 계층을 extract 하고, 아래와 같이 도커파일을 새로 만들 수 있다.

```dockerfile
# 생성된 jar 파일을 extract 한다.
FROM openjdk:11.0.8-jdk-slim AS builder
WORKDIR source
ARG JAR_FILE=target/the-java-springboot*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=layertools -jar application.jar extract

# dependencies -> spring-boot-loader -> snapshot-dependencies -> application 코드 순으로 이미지 레이어를 쌓는다.
FROM openjdk:11.0.8-jre-slim
WORKDIR application
COPY --from=builder source/dependencies/ ./
COPY --from=builder source/spring-boot-loader/ ./
COPY --from=builder source/snapshot-dependencies/ ./
COPY --from=builder source/application/ ./
ENTRYPOINT ["java","org.springframework.boot.loader.JarLauncher"]
```

```shell
$ docker build -t effective-the-java-springboot .
```



<br />

### spring-boot 플러그인 활용해서 도커 이미지 만들기

하지만 위 방법은 번거로우니 스프링부트는 메이븐 플러그인을 통해 도커 이미지를 만들어주는 방법을 제공한다.

내부적으로 build pack 이라는 오픈소스를 사용한다.

```shell
$ ./mvnw spring-boot:build-image
```

<br />

### 자동으로 도커이미지 빌드하기

TIP: `build-image` 를 설정파일에 추가하면 메이븐 패키징할 때 도커파일없이도 도커 이미지를 자동으로 만들어준다.

layers 를 사용하는 효율적인 방법으로 도커 이미지를 만들어준다.

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  
  <executions>
    <execution>
      <goals>
        <goal>build-image</goal>
      </goals>
    </execution>
  </executions>
  
  <configuration>
    <layers>
      <enabled>true</enabled>
    </layers>
  </configuration>
</plugin>
```

<br />

---

## Graceful 셧다운



`graceful shutdown` :  애플리케이션 서버 종료 시 현재 처리 중인 요청을 모두 마무리하고 서버를 종료하는 기능

```properties
server.shutdown=graceful
```



아래처럼 요청시 10초를 기다리게 하는 컨트롤러를 만들어 놓고,

중간에 어플리케이션을 종료해보자. 주어진 요청이 끝난 후 어플리케이션이 종료된다. (물론 강제로 바로 꺼버릴 수 있다.)

```java
@RestController
public class PostController {

  @GetMapping("/post")
  public String post() throws InterruptedException {
    Thread.sleep(10000l);
    return "hello";
  }
}
```





* 서블릿 기반 MVC와 리액티브 스트림 기반 WebFlux 모두 지원한다.

서버를 너무 오래 기다리게 할 수도 있으므로, 기존 요청 처리에 최대 기다림 시간(타임 아웃)을 정할 수 있다.

```properties
# 기본값은 30s(30초) 이다.
spring.lifecycle.timeout-per-shutdown-phase=20s
```

* Tomcat, Jetty, Netty 는 새 요청을 네트워크 단에서 받지 않고 기존 요청을 계속 진행하지만, Undertow는 새 요청에 응답으로 Service Unavailbe (503) 응답을 보낸다.



