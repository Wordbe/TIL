# [springboot] mysql - java (JPA) 연동



자바에서는 데이터베이스와 자바를 연동하는 방법을 만들어낸다.

jdbc(java database connectivity) 를 사용하면 된다.



이 글에서는 java springboot jpa를 사용할 때 mysql을 jdbc를 통해 연결하는 방법을 알아본다.

먼저, 빌드도구로 여기서는 gradle을 사용한다. (maven 은 maven 홈페이지 - spring boot) 를 참고하면 좋다.





## mysql

우선, mysql 이 사용자 환경에 설치되어 있어야 한다.

본인은 맥os에서 `rdijin` 이라는 유저환경에 mysql을 설치했다.

설치는 brew를 통해 간단히 설치했다.

```shell
% brew install mysql
```



mysql을 처음에 root 계정으로 접속한다.

```shell
% mysql -u root -p
% (password 입력)
```

그리고 mysql의 새로운 계정을 만들고 싶어서 만들었다.



[MariaDB 다운로드, 계정 설정](https://wordbe.tistory.com/entry/MariaDB-%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C-%EA%B3%84%EC%A0%95-%EC%84%A4%EC%A0%95) 를 클릭해서 참조하면 된다. 참고로 maridadb의 기본 환경은 mysql과 동일하고, 시작, 종료 명령어 등도 mysql을 그대로 사용해도 된다.



---

## gradle



그레들 설정을 한다.

CoC(Convention over Configuration) 개념을 적극적으로 활용하자.



gradle.build

```
...
dependencies {
		// spring-boot-data-jpa
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // mysql - jdbc
    runtimeOnly 'mysql:mysql-connector-java'
}
```





---

## resources

gradle이 소스를 읽을 때 application 설정을 해보자.



resource/application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/segansig?serverTimezone=UTC&characterEncoding=UTF-8
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: rdijin
    password: password
  jpa:
    properties:
      hibernate:
        show_sql: false
        format_sql: true
        ddl-auto: update
    open-in-view: false
    generate-ddl: true
```



> * password는 String으로 처리되어야 한다.
>
>  숫자로 넣어도 그냥 String으로 인식하는데, 숫자를 문자로 바꾸는 로직이 있다. 따라서 만약 숫자가 0으로 시작한다면 0은 무시할 수도 있다. 숫자라면 마음편히 따옴표안에 비밀번호를 넣어주는 것이 좋다.



---

## JPA



jpa는 더 자세하게 다른 글에서 설명한다.

아무튼 위처럼 설정하면 mysql 데이터베이스와 자바가 잘 연동되었고,

jpa 도 자연스럽게 연결되었을 것이다.



방법은 아래와 같다.

1) jpa에서 entity를 생성한 후 데이터베이스 테이블의 이름과 매칭시킨다.

2) jpa repostiory 를 상속받아서 (이 때 Long타입의 key와 함께 매칭시킨다.) entity repository를 만든다.

3) controller 등으로 jpa 데이터가 잘 연동이 되었는지 브라우저에서 확인해본다.



