# Hive 6 - partition, bucketing, skew

<br>

## 3 파티션(Partition)

파티션은 데이터를 디렉토리로 분리하여 저장합니다. 테이블의 모든 row 정보를 읽는 대신, where 조건에서 필요한 데이터만 읽어 처리 속도를 줄일 수 있습니다.

```shell
CREATE TABLE tbl(
	col1 STRING
	PARTItionED BY (yymmdd STRING);
)
```



## 파티션 종류

고정 파티션, 동적 파티션이 있습니다. 각각 단독으로 사용할 수도 있고, 혼합해서도 사용할 수 있습니다.

고정 파티션은 테이블에 데이터를 입력하는 시점에 파티션을 전달하므로, 입력되는 파티션을 알 수 있는 반면, 동적 파티션은 칼럼 정보를 통해 파티션이 동적으로 생성되기 때문에 쿼리시 시점에서 파티션을 알 수 없습니다. 



### 고정 파티션(Static Partition)

```shell
INSERT INTO TABLE tbl(yymmdd='20180510')
SELECT name
  FROM temp;
```

INSERT 문에 파티션 정보를 고정 값으로 전달하여 입력합니다. yymmdd 파티션에 값을 직접 전달하여 파티션을 생성합니다.

아래와 같은 폴더 구조로 데이터를 생성합니다.

```shell
hdfs://[tbl 테이블 로케이션]/yymmdd=20180510/
```

<br>

### 동적 파티션(Dynamic Partition)

```shell
INSERT INTO TABLE tbl(yymmdd)
SELECT name,
       yymmdd
  FROM temp;
```

INSERT 문에 파티션 정보를 조회하는 칼럼을 전달하여 입력합니다. yymmdd 파티션에 yymmdd 칼럼을 전달하여 파티션을 동적으로 생성하는 예제입니다.

만약 yymmdd 칼럼에 20180510, 20180511 두 데이터가 있으면 아래와 같이 생성합니다.

```shell
hdfs://[tbl 테이블 로케이션]/yymmdd=20180510/
hdfs://[tbl 테이블 로케이션]/yymmdd=20180511/
```

<br>

hive는 동적 파티션만 이용하는 것을 권장하지 않기 때문에, 동적 파티션만 이용하려면 아래 설정을 해주어야 합니다.

```
set hive.exec.dynamic.partition.mode=nonstrict;
(기본값은 strict)
```



동적 파티션을 사용하면 속도가 느려지므로 동적 파티션 생성 개수에 제한이 있습니다. 이 제한을 늘리는 방법은 아래와 같습니다.

```java
-- 동적 파티션 개수 
set hive.exec.max.dynamic.partitions=1000;
-- 노드별 동적 파티션 생성 개수 
set hive.exec.max.dynamic.partitions.pernode=100;
```

<br>

동적 파티션에 NULL 값이 들어가는 경우 하이브는 NULL 값을 기본 파티션 명을 이용해서 입력합니다.

```java
-- NULL 값의 기본 파티션 명 
set hive.exec.default.partition.name=__HIVE_DEFAULT_PARTITION__;

-- 아래와 같은 형태로 파티션이 생성 
hdfs://temp/yymmdd=20180510/hh=00/
hdfs://temp/yymmdd=20180510/hh=__HIVE_DEFAULT_PARTITION__/

-- 해당 파티션을 조회할 때는 다음과 같이 사용 
SELECT *
  FROM temp
 WHERE hh = '__HIVE_DEFAULT_PARTITION__';
```

<br>

### 파티션 수정/삭제

ALTER 문을 이용합니다. 파티션 삭제시 매니지드 테이블인 경우 파티션 위치의 데이터도 함께 삭제 되므로 주의해야 합니다.

```java
-- 신규 파티션 추가 
ALTER TABLE employee ADD PARTITION (yymmdd='20180510');

-- 파티션의 LOCATION 수정  
ALTER TABLE employee PARTITION (yymmdd='20180510') SET LOCATION 'hdfs://127.0.0.1/user/';

-- 파티션 삭제 
ALTER TABLE employee DROP PARTITION (yymmdd='20180510');

-- 파티션 범위 삭제, 비교연산자를 이용해 범위 삭제 가능 
ALTER TABLE employee DROP PARTITION (yymmdd < '20180510');
ALTER TABLE employee DROP PARTITION (yymmdd >= '20180510');
```

<br>

### 파티션 복구

기존 데이터나 신규데이터로 테이블의 파티션을 복구해야 하는 경우 MSCK 명령을 이용합니다.

많은 파티션을 한번에 복구하게 되면 작업시간이 늘어나서 연결시간 초과 등으로 오류가 발생할 수도 있습니다. 이 경우 `hive.msck.repair.batch.size` 를 양수 값으로 설정하여 한번에 처리할 파티션 개수를 설정해서 명령어를 여러번 돌리는 것이 좋습니다.

파티션에 허용되지 않는 문자나 파티션 규칙에 맞지 않을때 오류가 발생하는데, `hive.msck.path.validation` 옵션을 ignore 로 설정하여 오류를 무시하고 진행하게 하면 됩니다.

```java
-- 0으로 설정하면 모든 파티션을 복구한다. 
set hive.msck.repair.batch.size=0;
-- 파티션에 허용되지 않는 문자가 있으면 오류가 발생하는데, ignore 로 설정하면 무시하고 넘어간다. 
set hive.msck.path.validation=ignore;

-- 파티션 복구 
MSCK REPAIR TABLE employee;
```

<br>

<br>

# 4 버켓팅(Bucketing)

버켓팅은 지정된 칼럼의 값을 해시 처리하고 지정한 수의 파일로 나누어 저장합니다. join에 사용되는 키로 버켓 칼럼을 생성하면, **소트머지 버켓(SMB) 조인**으로 처리되어 수행속도가 빨라집니다.

**파티션**은 데이터를 **디렉토리**로 나누어 저장하는 방식이고, **버켓팅**은 데이터를 **파일별**로 나누어 저장하는 방식입니다.

```shell
-- col2 를 기준으로 버켓팅 하여 20개의 파일에 저장 
CREATE TABLE tbl1(
  col1 STRING,
  col2 STRING
) CLUSTERED BY (col2) INTO 20 BUCKETS

-- col2 를 기준으로 버켓팅 하고, col1 기준으로 정렬하여 20개의 파일에 저장 
CREATE TABLE tbl2(
  col1 STRING,
  col2 STRING
) CLUSTERED BY (col2) SORTED BY (col1) INTO 20 BUCKETS
```



#### 예제

```java
-- 테이블 생성
CREATE TABLE bucketed_table (
	col1 STRING,
    col2 STRING
) CLUSTERED BY (col2) SORTED BY (col2) INTO 20 BUCKETS
LOCATION '/user/bucketed_table/';

-- 데이터 입력을 위한 소스 테이블
CREATE TABLE source_table (
	col1 ARRAY<STRING>
) ROW FORMAT DELIMITED
    COLLECTION ITEMS TERMINATED BY '\t';

-- 소스 테이블에 데이터 입력
LOAD DATA LOCAL INPATH './cctv_utf8.csv' INTO TABLE source_table;

-- 버켓팅 테이블에 데이터 입력
INSERT INTO TABLE bucekted_table
SELECT col1[0], col1[3]
FROM source_table;
```

bucketed_table에 데이터를 입력후 조회하면 다음과 같이 지정한 개수의 버켓(파일 20개)으로 데이터를 나누어 저장한 것을 확인할 수 있습니다.

```shell
$ hadoop fs -ls /user/bucketed_table/
Found 20 items
-rwxr-xr-x   2 hadoop hadoop      55246 2018-11-08 05:22 /user/bucketed_table/000000_0
-rwxr-xr-x   2 hadoop hadoop        101 2018-11-08 05:22 /user/bucketed_table/000001_0
-rwxr-xr-x   2 hadoop hadoop       2227 2018-11-08 05:22 /user/bucketed_table/000002_0
-rwxr-xr-x   2 hadoop hadoop    3171874 2018-11-08 05:22 /user/bucketed_table/000003_0
-rwxr-xr-x   2 hadoop hadoop         65 2018-11-08 05:22 /user/bucketed_table/000004_0
-rwxr-xr-x   2 hadoop hadoop     102704 2018-11-08 05:22 /user/bucketed_table/000005_0
-rwxr-xr-x   2 hadoop hadoop          0 2018-11-08 05:22 /user/bucketed_table/000006_0
-rwxr-xr-x   2 hadoop hadoop     636043 2018-11-08 05:22 /user/bucketed_table/000007_0
-rwxr-xr-x   2 hadoop hadoop         92 2018-11-08 05:22 /user/bucketed_table/000008_0
-rwxr-xr-x   2 hadoop hadoop         42 2018-11-08 05:22 /user/bucketed_table/000009_0
-rwxr-xr-x   2 hadoop hadoop     379097 2018-11-08 05:22 /user/bucketed_table/000010_0
-rwxr-xr-x   2 hadoop hadoop     148419 2018-11-08 05:22 /user/bucketed_table/000011_0
-rwxr-xr-x   2 hadoop hadoop      49212 2018-11-08 05:22 /user/bucketed_table/000012_0
-rwxr-xr-x   2 hadoop hadoop       1866 2018-11-08 05:22 /user/bucketed_table/000013_0
-rwxr-xr-x   2 hadoop hadoop       2082 2018-11-08 05:22 /user/bucketed_table/000014_0
-rwxr-xr-x   2 hadoop hadoop        123 2018-11-08 05:22 /user/bucketed_table/000015_0
-rwxr-xr-x   2 hadoop hadoop       1268 2018-11-08 05:22 /user/bucketed_table/000016_0
-rwxr-xr-x   2 hadoop hadoop     834307 2018-11-08 05:22 /user/bucketed_table/000017_0
-rwxr-xr-x   2 hadoop hadoop       3631 2018-11-08 05:22 /user/bucketed_table/000018_0
-rwxr-xr-x   2 hadoop hadoop         62 2018-11-08 05:22 /user/bucketed_table/000019_0
```

<br>

<br>

---

## 5. 스큐(Skew)

스큐는 칼럼에 특정 데이터가 주로 들어오는 경우 분리하여 저장하는 기능입니다.

파티션과 유사하지만 용도가 다릅니다. 파티션은 주로 데이터를 크게 구분하는 용도로, 보통 일자별 구분할 때 많이 사용하는 반면, 스큐는 칼럼의 데이터를 구분할 때 사용합니다.

예를 들어 num 칼럼에 1~1000 데이터가 들어오는데, 주로 1, 2의 데이터가 많다면 스큐는 1, 2와 나머지 로 구성된 3개 디렉토리나 파일로 구별하여 저장합니다. 네임노드의 관리 포인트가 줄어드는 효과가 있습니다.

파티션과 스큐를 사용했을 때 생성되는 데이터 구조는 다음과 같습니다.

```shell
# 파티션은 데이터를 크게 구분할 때 사용
/year=2018/month=07/day=01
/year=2018/month=07/day=02

# 스큐는 칼럼의 데이터를 구분할 때 사용 
/year=2018/month=07/day=01/code=1
/year=2018/month=07/day=01/code=2
/year=2018/month=07/day=01/code=HIVE_DEFAULT_LIST_BUCKETING_DIR_NAME/
```

스큐의 기본 문법은 다음과 같습니다.

```
CREATE TABLE tbl (
  col1 STRING,
  col2 STRING
) SKEWED BY (col1) on ('value1', 'value2' ) [STORED as DIRECTORIES];
```

<br>

### 예제

다음은 col2 칼럼에 1로 들어오는 데이터 많을 때 스큐 테이블을 생성하는 예제 입니다.

```shell
-- 스큐 테이블 생성 
-- col2에 들어오는 값중 1로 들어오는 값만 스큐로 저장 
CREATE TABLE skewed_table (
  col1 STRING,
  col2 STRING
) SKEWED BY (col2) ON ('1')
STORED AS DIRECTORIES
LOCATION '/user/skewed_table/';

-- 소스 테이블의 데이터를 스큐 테이블에 입력 
INSERT INTO TABLE skewed_table
SELECT col1[0], col1[4]
  FROM source_table;
```

스큐 테이블에 값을 입력하면 다음 같이 개별 디렉토리에 값을 보관하게 됩니다. **STORED AS DIRECTORIES 옵션**을 주지 않으면 디렉토리 구분없이 파일로 따로 저장합니다.

```shell
$ hadoop fs -ls /user/skewed_table/
Found 2 items
drwxr-xr-x   - hadoop hadoop          0 2018-11-08 06:17 /user/skewed_table/HIVE_DEFAULT_LIST_BUCKETING_DIR_NAME
drwxr-xr-x   - hadoop hadoop          0 2018-11-08 06:17 /user/skewed_table/col2=1


$ hadoop fs -ls -R /user/skewed_table/
drwxr-xr-x   - hadoop hadoop          0 2018-11-08 06:17 /user/skewed_table/HIVE_DEFAULT_LIST_BUCKETING_DIR_NAME
-rw-r--r--   2 hadoop hadoop    1490659 2018-11-08 06:17 /user/skewed_table/HIVE_DEFAULT_LIST_BUCKETING_DIR_NAME/000000_0
drwxr-xr-x   - hadoop hadoop          0 2018-11-08 06:17 /user/skewed_table/col2=1
-rw-r--r--   2 hadoop hadoop    2335328 2018-11-08 06:17 /user/skewed_table/col2=1/000000_0
```

<br>

<br>

---

## 6. 정렬(Sort)

order by, sort by, distribute by, cluster by 네 가지 종류가 있습니다.

<br>

### 1) ORDER BY

**모든 데이터를 정렬하여 하나의 파일로 생성**합니다. 데이터가 클 경우 시간이 오래 걸리고, out of memory 오류가 발생할 수 있습니다. 이 때 limit 옵션을 이용하는 것이 좋습니다.

```shell
-- 테이블 풀 스캔 같은 성능에 영향을 미치는 쿼리는 nonstrict 모드에서만 동작 
set hive.mapred.mode=nonstrict;

SELECT *
  FROM tbl
 ORDER BY number;

-- strict 모드 일때는 LIMIT 가 있어야만 처리 가능 
set hive.mapred.mode=strict;

SELECT *
  FROM tbl
 ORDER BY number
 LIMIT 100;
```

<br>

### 2) SORT BY

**리듀서 별 입력된 데이터를 정렬하여 출력**합니다. 리듀서 개수 만큼 생성되는 파일의 결과가 정렬되어 출력됩니다.

[1, 4, 3, 2, 5]의 데이터를 2개의 리듀서로 처리할 때 리듀서1에 (1, 4, 3) 이 전달되고 리듀서2에 (5, 2)가 전달 되면, 2개의 리듀서가 2개의 파일을 생성하고 각각의 결과 파일이 (1, 3, 4)와 (2, 5) 로 정렬되어 출력됩니다.

```shell
SELECT *
FROM tbl
SORT BY number;
```

<br>

### DISTRIBUTE BY

**매퍼의 결과를 리듀서로 전달할 때 같은 값을 가지는 row는 같은 리듀서로 전달**됩니다. 리듀서로 전달 할 때 정렬하여 전달하지 않습니다.

[1, 4, 1, 3, 2]의 데이터를 2개의 리듀서로 처리할 때 리듀서1에 (1, 2, 1)이 전달되고 리듀서2에 (4, 3)이 전달 됩니다. 같은 값은 같은 리듀서로 전달되지만, 전달할 데이터를 정렬하지는 않습니다.

```shell
SELECT *
FROM tbl
DISTRIBUTE BY number;
```

<br>

### CLUSTER BY

sort by 와 distribute by 를 동시에 수행합니다. 즉, 같은 값을 가지는 row는 같은 리듀서에 전달되고, 리듀서 처리 결과를 정렬하여 출력합니다.

[1, 4, 1, 3, 2]의 데이터를 2개의 리듀서로 처리할 때 리듀서1에 (1, 2, 1)이 전달되고 리듀서2에 (4, 3)이 전달 하고 리듀서1 (1, 1, 2), 리듀서2 (3, 4) 형태로 절렬되어 출력합니다.

```
SELECT *
  FROM tbl
  CLUSTER BY age;
```



---

**Reference**

https://wikidocs.net/23557

https://wikidocs.net/23558

https://wikidocs.net/23559

https://wikidocs.net/23560