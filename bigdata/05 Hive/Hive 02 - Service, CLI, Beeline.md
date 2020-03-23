# Hive Service



![](https://i.stack.imgur.com/17mZy.png)



하이브가 편리성을 위해 제공하는 서비스를 알아봅니다.



## 1. 메타스토어

메타스토어 서비스는 HDFS 데이터 구조를 저장하는 실제 DB를 가지고 있습니다. 3가지 실행모드가 있습니다.

테스트로 동작할 때는 임베디드 모드, 실제 운영에서는 리모트 모드를 많이 사용합니다.

![](http://develop.sunshiny.co.kr/attach/1/6755941387.jpg)



- 임베디드(Embeded)
  - 별도의 데이터 베이스를 구성하지 않고 더비 DB를 이용한 모드
  - 한번에 하나의 유저만 접근 가능
- 로컬(Local)
  - 별도의 데이터베이스를 가지고 있지만, 하이브 드라이버와 같은 JVM에서 동작
- 리모트(Remode)
  - 별도의 데이터베이스를 가지고, 별도의 JVM에서 단독으로 동작하는 모드
  - 리모트로 동작하는 하이브 메타스토어를 [HCat 서버](https://wikidocs.net/23683#fn:1)라고도 함





## 2. 하이브서버2 (hiveserver2)

하이브서버2는 다른 언어로 개발된 클라이언트와 연동 서비스를 제공합니다. 기존 하이브서버1을 개선하여 인증과 다중 사용자 동시성을 지원합니다. Thrift, JDBC, ODBC 연결을 사용하는 애플리케이션과 통신하여 하이브 연산을 수행하고 결과를 반호나합니다.





## 3. 비라인(beeline)

일반적인 CLI처럼 내장형 모드로 작동하거나, JDBC로 하이브서버2 프로세스에 접근할 수 있는 하이브 명령형 인터페이스입니다. CLI는 로컬 하이브 서비스에만 접근할 수 있지만, 비라인은 원격 하이브 서비스에 접속할 수 있습니다.



---

# 3 Hive CLI

CLI(Command Line Interface)는 하이브 쿼리를 실행하는 기본 도구입니다. 인터랙티브 쉘을 이용하여 사용자의 명령을 입력할 수 있습니다. 쿼리 실행 방법, 유용한 옵션, 내부 명령어를 알아봅니다. 



### CLI 옵션

하이브 CLI 주요 옵션은 다음과 같습니다. hiveconf는 옵션 값을 설정할 때, hivervar는 쿼리에 변수를 지정할 때 이용합니다.

```
usage: hive
 -e <quoted-query-string>         커맨드 라인으로 실행할 쿼리 
 -f <filename>                    쿼리가 작성된 파일을 이용하여 실행할 경우 
 --hiveconf <property=value>      하이브 설정값 입력 
                                  예) --hiveconf tez.queue.name=queue
 --hivevar <key=value>            쿼리에서 사용할 변수 입력 
                                  예) --hivevar targetDate=20180101

-- 옵션 지정 방법 
$ hive --hiveconf tez.queue.name=queue --hivevar targetDate=20180101
```



### 쿼리 실행

3가지 방법이 있습니다.

<br>

**1) 인터렉티브 쉘 입력**

하이브 CLI를 실행하고, 쉘을 이용하여 입력하는 방법입니다.

```
-- hive 실행후 쿼리 입력 
$ hive
hive> select 0;
OK
0
Time taken: 1.367 seconds, Fetched: 1 row(s)

hive> select * from table;
```



**2) 커맨드 라인 입력**

커맨드 라인입력은 `-e` 옵션을 이용합니다.

```
-- 커맨드 라인에서 바로 입력 
$ hive -e "select * from table"

-- 옵션을 이용하여 쿼리의 실행 엔진과, 변수를 설정 
-- 커맨드 라인입력에서 설정값 전달 
$ hive -e 'SELECT * FROM table WHERE yymmdd=${hivevar:targetDate}' \
   --hiveconf hie.execution.engine=tez \
   --hiveconf tez.queue.name=queue_name \
   --hivevar targetDate=20180101
```

<br>

**3) 파일 입력**

파일 입력은 쿼리를 파일로 저장해 놓고 해당 파일을 지정하는 방식입니다. `-f` 옵션을 이용합니다.

```
$ cat sample.hql
SELECT * FROM table WHERE yymmdd=${hivevar:targetDate}

-- 파일을 이용하여 쿼리 입력 
$ hive -f sample.hql --hivevar targetDate=20180101
```

<br>

**로깅 방법**

하이브 CLI는 log4j를 이용하여 로깅합니다. 로깅 방법을 변경하고자 할 때는 log4j 설정 파일을 변경하거나 `--hiveconf` 옵션을 이용합니다.

```
-- 로깅 레벨, 파일 위치 변경 
hive --hiveconf hive.log.file=hive_debug.log \
  --hiveconf hive.log.dir=./ \
  --hiveconf hive.root.logger=DEBUG,DRFA
```



---

### CLI 내부 명령어

하이브 CLI의 주요 내부 명령어는 다음과 같습니다. 상세한 설명은 하이브 [메뉴얼](https://wikidocs.net/24771#fn:2)을 참고하면 됩니다.

| 커맨드            | 설명                                       |
| :---------------- | :----------------------------------------- |
| exit              | 종료                                       |
| reset             | 설정값 초기화                              |
| set <key>=<value> | 설정값 입력                                |
| set               | 하이브의 설정값 출력                       |
| set -v            | 하둡, 하이브의 설정값 출력                 |
| add file <>       | 파일 추가                                  |
| add files <>      | 여러개의 파일 추가, 공백으로 경로 구분     |
| add jar <>        | jar 파일 추가                              |
| add jars <>       | 여러개의 jar 파일 추가, 공백으로 경로 구분 |
| !<command>        | 쉘 커맨드 실행                             |
| dfs <dfs command> | 하둡 dfs 커맨드 실행                       |



jar 파일 추가는 사용자가 구현한 UDF, SerDe 등 자바 클래스 사용할 때 jar 파일의 위치를 지정합니다. 파일 추가는 스크립트나 UDF에서 내부적으로 사용하는 메타 파일 등을 추가할 때 사용합니다.

```
-- 옵션 설정 
hive> set mapred.reduce.tasks=32;
-- 모든 옵션 값 확인 
hive> set;
-- CLI 상에서 설정한 옵션 초기화 
hive> reset;
-- 쉘커맨드 실행 
hive> !ls -alh;
-- dfs 커맨드 실행 
hive> dfs -ls /user/;
-- 파일 추가 
hive> add file hdfs:///user/sample.txt;
-- 여러개의 파일 추가. 공백으로 구분 
hive> add files hdfs:///user/sample1.txt hdfs:///user/sample2.txt;
-- jar 파일 추가 
hive> add jar hdfs:///user/sample.jar;
```



---

## 4 Beeline

비라인은 [SQLLine](http://sqlline.sourceforge.net/#manual) 기반의  하이브서버2(hiveserver2)에 접속하여 쿼리를 실행하기 위한 도구 입니다. JDBC 를 사용하여 하이브서버2에 접속합니다. 비라인 접속 옵션은 [하이브 비라인 실행 매뉴얼](https://cwiki.apache.org/confluence/display/Hive/HiveServer2+Clients#HiveServer2Clients-BeelineCommandOptions)을 참고하시면 됩니다.

<br>

### Beeline 접속

비라인에서 하이브서버2에 접속하는 방법은 비라인 CLI 실행 후 입력하는 방법과, CLI를 실행하면서 옵션으로 입력하는 방법이 있습니다.

하이브서버2의 접근포트는 `hive.serveer2.thrift.port` 에 설정된 정보를 이용합니다.

<br>

### 비라인 SQLLine 커맨드

비라인에서는 느낌표를 이용하여 SQLLine 커맨드를 입력 할 수 있습니다. SQLLine 커맨드의 상세한 내용은 매뉴얼을 참고하시면 됩니다.

```
0: jdbc:hive2://localhost:10000> !columns tbl;
0: jdbc:hive2://localhost:10000> !quit
0: jdbc:hive2://localhost:10000> !columns tbl;
```

<br>

### 비라인 하이브 커맨드

비라인에서 사용할 수 있는 주요 하이브 커맨드는 다음과 같습니다. CLI와 동일한 커맨드를 이용할 수 있습니다.

| 커맨드            | 설명                                       |
| :---------------- | :----------------------------------------- |
| reset             | 설정값 초기화                              |
| set <key>=<value> | 설정값 입력                                |
| set               | 하이브의 설정값 출력                       |
| set -v            | 하둡, 하이브의 설정값 출력                 |
| add file <>       | 파일 추가                                  |
| add files <>      | 여러개의 파일 추가, 공백으로 경로 구분     |
| add jar <>        | jar 파일 추가                              |
| add jars <>       | 여러개의 jar 파일 추가, 공백으로 경로 구분 |
| dfs <dfs command> | 하둡 dfs 커맨드 실행                       |

```
0: jdbc:hive2://localhost:10000> set mapred.reduce.tasks=32;
No rows affected (0.044 seconds)

0: jdbc:hive2://localhost:10000> reset;
No rows affected (0.134 seconds)

0: jdbc:hive2://localhost:10000> dfs -ls /user/;
+------------------------------------------------------------------------------+--+
|                                  DFS Output                                  |
+------------------------------------------------------------------------------+--+
| drwxrwxrwx   - hadoop hadoop          0 2018-12-04 07:14 /user/hadoop        |
+------------------------------------------------------------------------------+--+
```



### 출력 포맷

비라인은 출력포맷을 설정할 수 있습니다. XML, CSV, TSV 형태로 설정할 수 있기 때문에 처리 결과를 이용하여 다른 작업을 해야 하는 경우에 편리하게 이용할 수 있습니다.

```
# --outputformat=[table/vertical/csv/tsv/dsv/csv2/tsv2]
$ beeline --outputformat=csv -f sample.hql
```





---

**Reference**

https://wikidocs.net/23683

https://wikidocs.net/24771

https://wikidocs.net/25252#fn:2