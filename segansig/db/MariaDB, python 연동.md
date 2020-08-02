# MariaDB 다운로드, 계정 설정



> 이 글의 목표: MariaDB환경 로컬에 구축한다.

<br>

## MariaDB 다운로드

마리아디비 공식 사이트에서 무료로 다운받는다. [https://mariadb.org/download/](https://mariadb.org/download/)

MariaDB 를 사용한 이유는 기존 익히 알고 있던 mysql과 비슷한 환경이면서, 속도 성능이 더 좋기 때문이다. 또한 Mysql은 Orcle이 인수하여 무료버전, 유료버전으로 나뉘었으며 무료버전은 사용이 제한적이다. 또한 지속적인 업그레이드가 MariaDB가 좋다는 말이 있다.

<br>

참고로 글쓴이는 윈도우 환경이다.

다운로드 후 쭉쭉 설치해주면 되는데, 중간에 비밀번호는 잘 설정하고, 잘 **기억하자**. (개인적 공간에 기록해두자.)

![](https://blog.kakaocdn.net/dn/dcmZAe/btqGbqE6HFp/THxSqtdqs5jcNCeQNk8tkk/img.png)



<br>

## MariaDB 설정

MySQL Client (MariaDB 10.3 (x64)) 을 검색해서 프롬프트 창을 열어보자.

<br>

### 1 root 계정으로 접속

```shell
$ mysql -u root -p
```

* `-u`는 유저, `-p`는 패스워드를 의미한다. 이미 생성되어있는 root 계정으로 아까 설정한 비밀번호를 통해 접속한다.

<br>

데이터베이스를 생성하고, 접속하자.

```shell
> create database mydb default character set utf8mb4;
> use mydb
```

> Tip: 한글을 사용하기위해 utf8을, 이모지를 같이 사용하기 위해 utf8mb4를 기본 캐릭터셋으로 설정한다.

<br>

테이블을 생성하고, 샘플 레코드를 insert 하는 작업은 생략한다.

<br>





---

### 2 새로운 user 계정 생성

이 작업은 스킵해도 좋지만, root 계정 외의 다른 계정을 생성하고 싶었다.

```shell
> show databases;
> use mysql;
> show tables;
> SELECT host, user, password FROM user;
```

데이터베이스가 어떤 것들이 있는지 보고, 

그 중 mysql db로 접속해서, 

어떤 테이블들이 있는지 보고, 

user 테이블에서 host, user, password 칼럼을 조회한다.

<br>

```shell
> CREATE USER '계정아이디'@'%' IDENTIFIED BY '비밀번호';
```

예를 들어 `CREATE USER 'jin'@'localhost' IDENTIFIED BY '비밀번호';` 이면 localhost에서만 jin이라는 계정으로 db에 접속이 가능하다.

<br>

이제 이 사용자가 DB또는 테이블에 접근하는 권한을 줄 수 있다.

```shell
> GRANT ALL PRIVILEGES ON 데이터베이스.* TO '계정아이디'@'%';
```

데이터베이스.테이블 (*는 모든 테이블) 에 대한 권한을 주는 것이다.

<br>

데이터 베이스를 나가고, 만든 계정으로 다시 접속해보자.

```shell
> exit
> mysql -u 계정아이디 -p
```











