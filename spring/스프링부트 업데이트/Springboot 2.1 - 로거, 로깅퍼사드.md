# Springboot 001 - update



## 스프링부트 2.1

### 스프링부트 2.1 변경 내역

(출시일 2018년 10월)

* 자바 11을 지원한다.
* spring data JPA에서 LAZY 모드를 지원한다.
* spring boot 2.1 은 spring framework 5.1 을 사용한다. 
* 빈 오버라이딩을 기본으로 허용하지 않는다.
* Actuator 에 `/info`, `/health` 를 공개하도록 바뀌었다.
* 프로퍼티 변경이 많고, IDE 도움을 받는 것이 좋다.
* 로깅 그룹이 추가되었다.

<br />

## 의존성 버전 변경



### 스프링 프레임워크 5.0 → 스프링 프레임워크 버전 5.1

* 로거 설정 개선이 되었고, spring-jcl 이 도와준다.
* ComponentScan 과정이 너무 오래걸려서 컴포넌트 인덱스 기능을 제공해서 성능을 높인다. 기본값으로는 설정되지 않는다. `spring-context-indexer` 의존성을 추가하면 된다.
* 함수형 프로그래밍 스타일을 지원한다.
* 코틀린을 지원한다.
* 리액티브 프로그래밍 모델을 지원한다.
* JUnit 5를 지원한다.

<br />

### JUnit 4.2 → JUnit 5.2

* JUnit 5 = 5번째이므로 Jupiter 라고 이름을 지었다.
* Extension 모델을 지원한다.
* 람다를 지원한다.

<br />

### 톰캣 8.5.39 → 톰캣 9

* Blocking I/O (BIO) 커넥터가 사라지고, Non-Blocking I/O (NIO) 커넥터를 기본으로 사용한다.
* HTTP/2 지원
* 웹소켓 2.0 지원
* 서블릿 4.0 / JSP 2.4 지원

<br />

### 하이버네이트 5.2 → 하이버네이트 5.3

* JPA 2.2 를 지원하게 되었다.
* Java 8의 Date 와 Time 을 지원하게 되었다.

<br />

---

## Spring-JCL



로깅 퍼사드(Logging Facade) 와 로거(Logger)를 구분해보자.



### 로깅 퍼사드

* JCL 은 Jakarta Commons Logging 를 말한다. 자카르타.
* SLF4J : Simple Logging Facade For Java

### 로거

* JUL
* Log4j (2015년 아파치개발팀 개발 중단)
* Log4j2, Logback

> slf4j, log4j, logback 은 같은 사람이 만들었다.

스프링은 로깅 퍼사드를 사용한다. 로깅 퍼사드라는 껍데기를 사용해서 실제 로깅작업을 하는 로거를 선택한다. 스프링은 JCL 을 사용한다.

slf4j 는 어떤 로거를 고를지 컴파일타임에 결정하여 런타임시 문제가 발생하지 않는다.

반면, JCL 은 런타임시에 로거를 동적으로 바인딩한다. 클래스 로더를 탐색할 때 다양한 문제가 발생한다.

**JCL 은 레거시에서 많이 쓰이고, 현재는 거의 모두 SLF4J를 사용한다.**

**로거로는 주로 Logback 또는 Log4j2 를 사용한다.**

<br />

**Q1. 기존에 이미 다른 로깅 퍼사드나 로거를 사용중인 프로젝트는 어떻게 하는가? → 브릿지**

* 기존에 로그퍼사드로 JCL을 사용하고 있다면 SLF4J를 사용할 수 있도록 중간에 JCL-over-SLFJ4 라는 **브릿지(bridge)**를 놓는다.
* 또는 기존에 로그퍼사드없이 Log4j 를 사용하고 있었다면 Log4j-to-SLF4J 라는 **브릿지**를 사용해서 SLFJ4 로 변환하여 사용한다.

**Q2. SLF4J가 사용할 로거는 어떻게 정하는가? → 바인더**

* SLF4J API 로 들어온 호출이 Log4j-SLF4J 라는 **바인더(binder)**를 거쳐서 특정 로거(예를 들면 Log4j2, Log4j)를 사용하게 하면 된다.
* Logback 로거를 사용하게 하려면 중간에 logback-classic 이라는 **바인더**를 사용한다.

<br />

### SLF4J 설정

예) 기존 JCL 대신에 SLF4J 와 Log4j 를 사용하기 위한 설정

```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-context</artifactId>
  <scope>runtime</scope>
  
  <!-- 1. 필요없는 JCL 의존성을 배제한다. -->
  <exclusions>
    <exclusion>
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>

<!-- 2. 레거시(JCL) 코드용 브릿지(jcl-over-slf4j)를 추가한다. -->
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>jcl-over-slf4j</artifactId>
  <scope>runtime</scope>
</dependency>

<!-- 3. SLF4J 로깅퍼사드를 추가한다. -->
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <scope>runtime</scope>
</dependency>

<!-- 4. SLF4J 바인더(slf4j-log4j12)를 설정한다. -->
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-log4j12</artifactId>
  <scope>runtime</scope>
</dependency>

<!-- 5. Log4j 로거를 추가한다.-->
<dependency>
  <groupId>log4j</groupId>
  <artifactId>log4j</artifactId>
  <scope>runtime</scope>
</dependency>
```

위와 같은 방법은 장황하고 복잡하다.

<br />

### Spring-jcl

기존 스프링 프레임워크에서 (JCL을 사용하는) 로깅하는 코드를 전부 고칠 수 없고, JCL 대신 SLF4J 를 권장하고 있다. SLF4J 를 사용하기 위해서는 복잡하고 장황한 설정을 해야한다. 따라서 스프링팀은 JCL 용 브릿지를 만들었다. (spring-jcl)

Spring-jcl 은

* JCL-over-SLF4j 브릿지의 대체제이다.
* classpath 에 Log4j2 가 있다면 JCL을 사용한 코드가 Log4j2를 사용한다.
* classpath 에 SLF4J 가 있다면 JCL을 사용한 코드가 SLF4J를 사용한다.

따라서 spring-jcl 이 있다면

* Log4J2를 사용할 때는 별다른 브릿지나 바인더가 필요없다.
* SLF4J를 사용할 때도 JCL를 exclusion하거나 JCL용 브릿지를 추가할 필요가 없다.

<br />

### 스프링부트 2.x 로깅 시스템

* **스프링부트는 기본적으로 SLF4J 로깅퍼사드와 logback 로거를 사용한다.**
* logback을 사용하기 위한 바인더로 `logback-classic` 을 사용한다.
* `log4j-to-slf4j`, `jul-to-slf4j`라는 브릿지를 제공하여 로거들이 slf4j 로깅퍼사드를 사용하도록 하고 결국 로거로 logback을 사용하게 된다.

<br />

---

### 스프링부트에서 로거 Log4j2 로 변경하기 (예제)

> 예제 목표: SLF4J → Log4j-to-SLF4j → Log4j2 로 설정

<br />

기존에 있었던 의존성을 확인해보자.

인텔리제이에서 오른쪽에 메이븐 탭을 누르면 의존성을 볼 수 있다.

콘솔로 보려면 아래와 같은 메이븐 명령어를 치면 된다.

```shell
$ ./mvnw dependency:tree 
```

<br />

```shell
spring-boot-starter
	spring-boot-starter-logging
		logback-classic # 바인더
			logback-core # 로거
		log4j-to-slf4j # 브릿지
		jul-to-slf4j # 브릿지
```

기존에는 SLF4J → logback-classic → logback 으로 구성되어있었다.

우리는 여기서 바인더인 logback-classic와 로거 logback을 삭제하고, 대신 log4j2 로거를 사용할 것이다.

<br />

**pom.xml**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter</artifactId>
  <!-- spring-boot-starter-logging 삭제 -->
  <exclusions>
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
<!-- log4j2 로거 추가 -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

```shell
$ ./mvnw dependency:tree 
```

```shell
[INFO] +- org.springframework.boot:spring-boot-starter-log4j2:jar:2.4.3:compile
[INFO] |  +- org.apache.logging.log4j:log4j-slf4j-impl:jar:2.13.3:compile # 바인더
[INFO] |  |  \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile # 로거 api
[INFO] |  +- org.apache.logging.log4j:log4j-core:jar:2.13.3:compile # 로거
[INFO] |  +- org.apache.logging.log4j:log4j-jul:jar:2.13.3:compile # 로거 어댑터
[INFO] |  \- org.slf4j:jul-to-slf4j:jar:1.7.30:compile # 브릿지
```

spring-boot-starter-log4j2 모듈이 들어온 것을 확인할 수 있다.

log4j2 는 의존성을 불러올 때 log4j 라는 이름의 라이브러리를 가져온다. log4j 를 바탕으로 만들어졌기 때문에 그럴 것이다.







