## Hive 3 - Metastore, Database

# 1-5 Metastore



**하이브 메타정보**는 **파일의 물리적인 위치**와 **데이터에 대한 논리적인 정보**로 구별할 수 있습니다. 이 메타정보를 보관하고 사용자의 요청에 따라 관련 정보를 제공하는 곳이 Hive Metastore입니다.

메타스토어는 [쓰리프트](https://thrift.apache.org/) 프로토콜을 통해 다른 서비스에 정보를 제공합니다. 메타 정보는 JDBC 드라이버를 이용하여 RDBMS에 저장됩니다.



### 메타스토어 타입

메타스토어는 실행 유형에 따른 3가지 타입이 있습니다. 메타스토어를 실행하면 하이브에서 필요한 기본 데이터베이스, 테이블을 확인하고 자동으로 생성합니다.

![](https://i.stack.imgur.com/vZjQY.png)



### 1. 임베디드 메타스토어 (Embedded Metastore)

기본설정의 하이브는 더비 DB를 사용하게 됩니다. **임베디드 메타스토어는 한번에 한명의 유저만 접근할 수 있습니다. 따라서 주로 테스트 목적**으로만 이용하는 것을 추천합니다.



### hive-site.xml 설정

```
<property>
   <name>javax.jdo.option.ConnectionURL</name>
   <value>jdbc:derby:metastore_db;create=true </value>
   <description>JDBC connect string for a JDBC metastore </description>
</property>
```





### 2. 로컬 메타스토어

**로컬 메타스토어는 하이브와 같은 JVM에서 동작**합니다. **메타 데이터는 외부의 RDBMS에 저장**합니다. 따라서 여러 사용자가 동시에 이용할 수 있습니다.

### hive-site.xml 설정

```
<property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:mysql://[IP]:[port]/[데이터베이스 이름]</value>
    <description>username to use against metastore database</description>
</property>

<property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    <value>org.mariadb.jdbc.Driver</value>
    <description>username to use against metastore database</description>
</property>

<property>
    <name>javax.jdo.option.ConnectionUserName</name>
    <value>[사용자명]</value>
    <description>username to use against metastore database</description>
</property>

<property>
    <name>javax.jdo.option.ConnectionPassword</name>
    <value>[암호]</value>
    <description>password to use against metastore database</description>
</property>
```

<br>

### 3. 원격 메타스토어

**원격 메타스토어는 메타스토어가 별도의 JVM에서 동작**합니다. 쓰리프트 프로토콜을 이용하여 접속합니다.



### hive-site.xml 설정

```
<property>
    <name>hive.metastore.uris</name>
    <value>thrift://[메타스토어 IP]:[메타스토어 Port]</value>
    <description>JDBC connect string for a JDBC metastore</description>
</property>
```



<br><br>

---

# 메타 데이터 베이스

하이브의 **테이블들에 대한 논리적인 정보는 데이터베이스에 저장**됩니다. 메타스토어 서비스는 이 데이터베이스 정보를 여러 클라이언트에게 제공합니다.

데이터베이스는 **더비, MSSQL, MySQL, 오라클 등을 지원**합니다. 이 데이터베이스에 하이브 서비스에 필요한 스키마(MySQL 생성 쿼리 [GitHub 바로가기](https://github.com/apache/hive/blob/master/metastore/scripts/upgrade/mysql/hive-schema-2.3.0.mysql.sql))를 미리 생성하고 서비스합니다. 하이브 클라이언트를 이용해서 확인하는 정보는 이 데이터베이스의 정보에 기반하고 있습니다. 따라서 **하이브 테이블 관련하여 필요한 정보를 확인하고 싶을 때**는 **데이터베이스에 직접 접속하여 확인 해도 됩니다.**



# 주요 테이블

하이브 데이터베이스의 주요 테이블은 다음과 같습니다.

| 테이블명   | 설명              |
| :--------- | :---------------- |
| DBS        | 데이터베이스 정보 |
| TBLS       | 테이블 정보       |
| PARTITIONS | 파티션 정보       |

# 메타 데이터 확인

SQL 쿼리를 이용하여 메타 데이터를 확인하는 방법은 다음과 같습니다.

## 메타 데이터 확인



```
-- DB 정보
SELECT *
  FROM DBS;


-- 테이블 정보
SELECT *
  FROM TBLS;


-- DB, 테이블 조인
SELECT *
  FROM TBLS t, DBS d
 WHERE t.DB_ID = d.DB_ID
 ORDER BY d.NAME;

-- 테이블 이름에 sample 이 들어가는 테이블을 찾아서, 디비명, 테이블명, 파티션명을 출력
SELECT d.NAME, t.TBL_NAME, p.PART_NAME
  FROM DBS d, TBLS t, PARTITIONS p
 WHERE d.DB_ID = t.DB_ID
   AND t.TBL_ID = p.TBL_ID
   AND t.TBL_NAME like '%sample%';
```

<br>

### 전체 테이블

하이브 메타스토어의 전체 테이블은 다음과 같습니다.

```
+---------------------------+
| Tables_in_hive            |
+---------------------------+
| AUX_TABLE                 |
| BUCKETING_COLS            |
| CDS                       |
| COLUMNS_V2                |
| COMPACTION_QUEUE          |
| COMPLETED_COMPACTIONS     |
| COMPLETED_TXN_COMPONENTS  |
| DATABASE_PARAMS           |
| DBS                       |
| DB_PRIVS                  |
| DELEGATION_TOKENS         |
| FUNCS                     |
| FUNC_RU                   |
| GLOBAL_PRIVS              |
| HIVE_LOCKS                |
| IDXS                      |
| INDEX_PARAMS              |
| KEY_CONSTRAINTS           |
| MASTER_KEYS               |
| NEXT_COMPACTION_QUEUE_ID  |
| NEXT_LOCK_ID              |
| NEXT_TXN_ID               |
| NOTIFICATION_LOG          |
| NOTIFICATION_SEQUENCE     |
| NUCLEUS_TABLES            |
| PARTITIONS                |
| PARTITION_EVENTS          |
| PARTITION_KEYS            |
| PARTITION_KEY_VALS        |
| PARTITION_PARAMS          |
| PART_COL_PRIVS            |
| PART_COL_STATS            |
| PART_PRIVS                |
| ROLES                     |
| ROLE_MAP                  |
| SDS                       |
| SD_PARAMS                 |
| SEQUENCE_TABLE            |
| SERDES                    |
| SERDE_PARAMS              |
| SKEWED_COL_NAMES          |
| SKEWED_COL_VALUE_LOC_MAP  |
| SKEWED_STRING_LIST        |
| SKEWED_STRING_LIST_VALUES |
| SKEWED_VALUES             |
| SORT_COLS                 |
| TABLE_PARAMS              |
| TAB_COL_STATS             |
| TBLS                      |
| TBL_COL_PRIVS             |
| TBL_PRIVS                 |
| TXNS                      |
| TXN_COMPONENTS            |
| TYPES                     |
| TYPE_FIELDS               |
| VERSION                   |
| WRITE_SET                 |
+---------------------------+
```





---

# 메타스토어 데이터베이스 설정

원격 하이브 메타스토어를 이용하기 위해 MySQL, oracle 같은 RDB에 하이브 메타스토어 스키마를 설정해야 합니다. `hive-site.xml`에 RDB에 접속을 위한 정보를 입력하고, 커맨드를 입력하여 스키마를 생성할 수 있습니다.



### hive-site.xml 설정

```xml
<?xml version="1.0"?>
<configuration>
  <property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:mysql://database_ip:database_port/database_name</value>
  </property>

  <property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    <value>org.mariadb.jdbc.Driver</value>
  </property>

  <property>
    <name>javax.jdo.option.ConnectionUserName</name>
    <value>user_name</value>
  </property>

  <property>
    <name>javax.jdo.option.ConnectionPassword</name>
    <value>password</value>
  </property>
</configuration>
```



### 스키마 생성

dbType에 사용하는 데이터베이스를 입력하면 됩니다.

mysql, mssql, oracle, postgress를 지원합니다.

```
$ hive --service schemaTool -dbType mysql -initSchema
```

<br>

`$ `

### 스키마 업그레이드

하이브 버전을 바꾸게 되면 하위버전의 스키마를 상위버전으로 업그레이드 해야 하는 경우가 생깁니다.

```
$ hive --service schemaTool -dbType mysql -upgradeSchema
```

<br>

### 스키마 정보 확인

하이브 스키마의 정보를 확인하는 방법은 아래와 같습니다.

```
$ hive --service schemaTool -dbType mysql -info
Metastore connection URL:      jdbc:mysql://database_ip:database_port/database_name
Metastore Connection Driver :  org.mariadb.jdbc.Driver
Metastore connection User:     user_name
Hive distribution version:     2.3.0
Metastore schema version:      2.3.0
schemaTool completed
```



---

# 2 Database

하이브의 데이터베이스는 **테이블의 이름을 구별하기 위한 네임 스페이스 역할**을 합니다. 또한 테이블의 데이터의 기본 저장 위치를 함께 제공합니다.

DB를 생성할 때 위치(location)를 지정하지 않으면 설정값을 기본 위치로 설정합니다. 

```java
# 기본 위치 
hive.metastore.warehouse.dir = hdfs:///user/hive/

# 데이터베이스의 기본 위치 
hdfs:///user/hive/{데이터베이스 명}.db

# 테이블의 기본 위치 
hdfs:///user/hive/{데이터베이스 명}.db/{테이블 명}
```



### 데이터 베이스 생성(CREATE)

하이브 DDL 메뉴얼에 따르면 DATABASE와 SCHEMA는 동일합니다.

데이터 베이스를 생성할 때 **저장 위치**와 **속성(property)**을 설정할 수 있습니다. IF NOT EXISTS 구문을 이용하여 같은 이름의 데이터 베이스가 있으면 생성하지 않도록 할 수 있습니다.

```
CREATE (DATABASE|SCHEMA) [IF NOT EXISTS] database_name
  [COMMENT database_comment]
  [LOCATION hdfs_path]
  [WITH DBPROPERTIES (property_name=property_value, ...)];
```



### 데이터 베이스 수정(ALTER)

ALTER를 이용하여 property, user, location을 수정할 수 있습니다.

**로케이션을 변경해도 하위 테이블의 데이터가 이동되는 것은 아닙니다.** 테이블, 파티션의 로케이션에는 영향을 미치지 않습니다. DB의 기본 로케이션만 변경됩니다.

```
ALTER (DATABASE|SCHEMA) database_name SET DBPROPERTIES (property_name=property_value, ...);   -- (Note: SCHEMA added in Hive 0.14.0)

ALTER (DATABASE|SCHEMA) database_name SET OWNER [USER|ROLE] user_or_role;   -- (Note: Hive 0.13.0 and later; SCHEMA added in Hive 0.14.0)

ALTER (DATABASE|SCHEMA) database_name SET LOCATION hdfs_path; -- (Note: Hive 2.2.1, 2.4.0 and later)
```



### 데이터 베이스 삭제(DROP)

DROP 을 이용하여 데이터베이스를 삭제 할 수 있습니다. 기본적으로 RESTRICT 옵션을 이용하고 있습니다. IF EXISTS 구문을 이용하면 데이터 베이스가 존재 할 때만 삭제할 수 있습니다.

- RESTRICT: 데이터 베이스에 테이블이 있으면 삭제 불가
- CASCADE: 테이블이 있어도 삭제 가능

```
DROP (DATABASE|SCHEMA) [IF EXISTS] database_name [RESTRICT|CASCADE];
```



### 예제

데이터 베이스 생성, 수정, 삭제하는 방법은 다음과 같습니다.

```
-- 데이터 베이스 생성 
CREATE DATABASE IF NOT EXISTS sample_database
COMMENT "test database"
LOCATION "/user/shs/sample_database/"
WITH DBPROPERTIES (
  'key1' = 'value1',
  'key2' = 'value2'
);

-- 데이터베이스 정보 확인 
hive> DESC DATABASE EXTENDED sample_database;
OK
sample_database test database   hdfs:///user/shs/sample_database    hadoop  USER    {key1=value1, key2=value2}

-- 데이터베이스 정보 수정 
ALTER DATABASE sample_database SET DBPROPERTIES ("key1"="value4"); 

hive> DESC DATABASE EXTENDED sample_database;
OK
sample_database test database   hdfs:///user/shs/sample_database    hadoop  USER    {key1=value4, key2=value2}

-- 데이터베이스 드랍
-- 하위에 테이블이 존재하면 오류가 발생 
hive> DROP DATABASE sample_database;
FAILED: Execution Error, return code 1 from org.apache.hadoop.hive.ql.exec.DDLTask. InvalidOperationException(message:Database sample_database is not empty. One or more tables exist.)

-- CASCADE 옵션을 이용하여 삭제 
hive> DROP DATABASE sample_database CASCADE;
OK
Time taken: 0.227 seconds
```



---

**Reference**

https://wikidocs.net/28353#fn:1

https://wikidocs.net/33237#fn:1

https://wikidocs.net/66718

https://wikidocs.net/23468