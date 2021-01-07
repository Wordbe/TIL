# Spring Boot



```java
package com.wordbe.gansig;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

```



* `@SpringBootApplication` 
  * 스프링 부트의 자동 설정, 스프링 Bean 읽기와 생성을 모두 자동으로 설정한다.
  * 이 위치부터 설정을 읽어나가므로 프로젝트의 최상단에 위치해야 한다.
* `SpringApplication.run` 
  * 내장 WAS를 실행시킨다.





---

## Spring Data JPA



Spinrg Data JPA 등장 이유

* 구현체 교체의 용이성
  * Hibernate 외 다른 구현체로 쉽게 교체하기 위함
* 저장소 교체의 용이성
  * 관계형데이터베이스 외 다른 저장소로 쉽게 교체하기 위함
  * ex) RDB ➞ MongoDB
  * Spring Data 하위 프로젝트 들은 기본적인 CRUD 인터페이스가 같기 때문이다.
  * (Spring Data JPA, Spinrg Data Redis, Spring Data MongoDB) : save(), findAll, findOne()
* 



