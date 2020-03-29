# Spring Boot 009 - YAML 사용하기

<br>

## 2.7 속성 대신 YAML 사용하기

YAML(야믈, 와이엠엘(.yml))은 JSON의 상위집합(superset)으로, 계층적 뼈대 구조를 설정하는데 편리한 형식(format)입니다. `SpringApplication`은 classpath에 있는 [SnakeYAML](https://bitbucket.org/asomov/snakeyaml) library를 가지고 있을 때, 속성(properties)의 대안으로 자동적으로 YAML을 지원합니다.

> `spring-boot-starter`는 가장 기본적인 라이브러리고, 이것이 있으면 SnakeYAML 은 자동으로 제공됩니다.

<br>

### 2.7.1 Loading YAML



YAML 리스트는 [index] 역참조형으로 표현될 수 있습니다.

```yaml
my:
   servers:
       - dev.example.com
       - another.example.com
```

위 yaml을 아래와 같이 properties로 바꿀 수 있습니다.

```properties
my.servers[0]=dev.example.com
my.servers[1]=another.example.com
```

<br>

Spring Boot의 `Binder`를 사용해서 프로퍼티를 bind할 수 있습니다. `java.util.List` (또는 `Set`) 타입의 target bean 안의 속성을 가져야 합니다. 그래서 setter를 제공하거나 mutable 값으로 초기화해야 합니다.  아래와 같이 속성을 바인드할 수 있습니다.

```java
@ConfigurationProperties(prefix="my")
public class Config {

    private List<String> servers = new ArrayList<String>();

    public List<String> getServers() {
        return this.servers;
    }
}
```

<br>

### 2.7.2 Spring 환경에서 YAML을 속성으로 드러내기

`YamlPropertySourceLoader` 클래스는 스프링 `Environment`안의 `PropertySource`로써 YAML을 노출시키는 데 사용될 수 있습니다. 이렇게 함으로써 YAML properties에 접근하기 위해 `@Value` 어노테이션을 placeholder 문법과 함께 사용할 수 있습니다.

<br>

### 2.7.3 Multi-profile YAML 다큐먼트

`spring.profiles` 키를 사용해서 여러 프로파일 yaml 문서를 하나의 파일에 적을 수 있습니다.

```yml
server:
    address: 192.168.1.100
---
spring:
    profiles: development
server:
    address: 127.0.0.1
---
spring:
    profiles: production & eu-central
server:
    address: 192.168.1.120
```

* `development` 프로파일이 활성화일 때, `server.address` 프로퍼티는 127.0.0.1이 됩니다.

* `production` **and** `eu-central` 활성화일 때는 192.168.1.120 입니다.

* 셋 다 비활성화 일 경우는 192.168.1.100 가 됩니다.

  이 경우 default 프로파일이 활성화됩니다. 또한 `spring.security.user.password` 는 default 프로파일에서만 실행이 가능합니다.

```yml
server:
  port: 8000
spring:
  security:
    user:
      password: weak
```

<br>

예제) 여러 프로파일이 있는 경우 default 프로파일이 우선순위가 됩니다.

```yml
whiteship:
  name: Seongho YAML
---
spring:
  profiles: default
whiteship:
  name: Seongho Defualt
---
spring:
  profiles: prod
whiteship:
  name: Seongho Prod
---
spring:
  profiles: dev
whiteship:
  name: Seongho Dev
```

<br>

### 2.7.4 YAML 단점(shortcomings)

YAML 파일은 `@PropertySource` 어노테이션을 사용해서 불러올 수 없습니다.



## 2.8 Type-safe Configuration Properties

설정 속성을 주입하기 위해 `@Value("${property}")` 어노테이션을 사용하는 것은 때론 복잡하게 느껴집니다. Spring Boot는 다른 대안을 제안하는데, 강하게 타입된 bean을 지배하고, 애플리케이션에의 설정을 검증하게 합니다.



### 2.8.1 자바 빈 속성 바인딩

### 2.8.2 생성자 바인딩





### 2.8.7 복합 타입 병합

```java
@ConfigurationProperties("acme")
public class AcmeProperties {

    private final List<MyPojo> list = new ArrayList<>();

    public List<MyPojo> getList() {
        return this.list;
    }

}
```

```yml
acme:
  list:
    - name: my name
      description: my description
---
spring:
  profiles: dev
acme:
  list:
    - name: my another name
```

이 설정은 두번째 `MyPojo` 인스턴스를 리스트에 추가하지 않고, 아이템들을 합치지도 않습니다.

<br>

```ym
acme:
  list:
    - name: my name
      description: my description
    - name: another name
      description: another description
---
spring:
  profiles: dev
acme:
  list:
    - name: my another name
```



---

## **properties 를 사용하는 방법** 정리

1) `@Value` 애노테이션 사용

2) `Environment` 추출로 접근

* 1)과 2)는 속성을 `Environment`에 넣는  동일한 원리입니다. (1)이 조금 더 간편)

3) `@ConfigurationProperties` 사용

* 이 때는 Bean으로 주입하지 않아도 되고, `@ConfigurationProperties(WhiteshipProperties.class)` 등으로 사용하여 만든 속성을 주입시킬 수 있습니다.



---

**Reference**

https://www.youtube.com/watch?v=m7j6ysAW5rc&list=PLfI752FpVCS8tDT1QEYwcXmkKDz-_6nm3&index=9

https://docs.spring.io/spring-boot/docs/2.2.4.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config-yaml

