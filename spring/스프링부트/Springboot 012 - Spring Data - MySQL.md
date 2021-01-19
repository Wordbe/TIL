

# Springboot 012 - Spring Data - MySQL



## DBCP

DataBase Connection Pool

스프링부트는 기본적으로 HikariCP 를 사용한다.

그 외 Tomcat CP, Commons DBCP2 를 지원한다.



HikariCP 의 몇가지 속성을 살펴보자.

* autoCommit : 자동으로 작업결과를 커밋한다.
* connectionTimeout : DB 에게 요청이 있을 시 연결을 시도하고 있을 시간을 설정한다. 짧을수록 에러가 잘 날 것이다. (기본은 30초다.)
* maximumPoolSize : 동시에 작업을 할 수 있는 최대 풀 개수는 CPU 코어 수보다 같거나 작다.



Hikari 설정을 프로퍼티 파일에서 할 수 있다. 자세한 속성은 HikariConfig 클래스에서 찾아 볼 수 있다.

application.properites

```shell
# DBCP
spring.datasource.hikari.maximum-pool-size=4
```

<br />

MySQL 커넥터 의존성을 추가하자.

pom.xml

```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
</dependency>
```





---

Docker 로 mysql 쉽게 설치하기



1) 도커 다운로드 : [https://www.docker.com/get-started](https://www.docker.com/get-started)

2) 도커 허브 접속 후 mysql 검색 : [https://hub.docker.com/_/mysql?tab=description&page=1&ordering=last_updated](https://hub.docker.com/_/mysql?tab=description&page=1&ordering=last_updated)

3) 터미널에서 도커 명령어를 사용하여 도커 허브로부터 mysql 도커 이미지 다운로드

```shell
$ docker pull mysql

# 도커 이미지 확인
$ docker images
```

<br />

4) 도커 이미지 실행 (컨테이너를 띄운다.)

```shell
$ docker run -p 3306:3306 --name springboot-mysql -e MYSQL_ROOT_PASSWORD=1234 -e MYSQL_DATABASE=springboot -e MYSQL_USER=your_username -e MYSQL_PASSWORD=1234 -d mysql
```

로컬의 3306 포트를 도커 컨테이너의 3306 포트와 연결해준다.

도커 컨테이너 이름은 springboot-mysql 이고, 루트의 비밀번호는 1234이며 springboot라는 데이터베이스를 하나 만들고, 새로운 유저아이디와 비밀번호를 설정한다. 

`-d` 는 데모 모드이다.



<br />

5) 도커 컨테이너 실행

```shell
$ docker container exec -i -t springboot-mysql bash

# container 는 생략가능하다.
$ docker exec -i -t springboot-mysql bash
```

`-i` 는 interactive 즉, 상호대화가 가능한 CLI 를 만드는 것이고, `-t` 는 이미지 태그 이름이다. 

컨테이너로 들어간 후 bash 를 실행시킨다.

<br />

기존에 3306 포트에 연결되어있던 DB 서버 등이 있다면 미리 종료해준다. 가령 백그라운드에 다른 mysql 서버가 실행중이라면 아래 명령어로 종료한다.

```shell
$ brew services stop mysql
```



다만 MySQL 은 GPL 라이선스이기 때문에, 수정한 소스를 모두 공개해야 하는 이슈가 있다. 하지만 이는 Database 자체를 수정하여 2차 저작물로 만들고 배포한다면 공개해야하지만, Database 와 통신하여 사용하는 웹 애플리케이션의 경우 상업용이어도 소스코드를 공개하지 않아도 된다는 말도 있다. MariaDB는 MySQL가 유료화가 되자 커뮤니티 버전(무료)처럼 만든 데이터베이스이므로 대신 사용해도 될 것 같다.



<br />

자바 DB 컨넥터 (JDBC) 를 사용해서, 자바 코드로 DB 를 조작하도록 해보자.

application.properties 에 아래를 추가하면 된다.

```java
spring.datasource.url=jdbc:mysql://localhost:3306/springboot
spring.datasource.username=wordbe
spring.datasource.password=1234
```































