# Hive 5 - table 2



## 1. Data type

하이브 데이터 타입은 기본 원시 타입과 복합 타입을 지원합니다.

```
data_type
  : primitive_type
  | array_type
  | map_type
  | struct_type
  | union_type  -- (Note: Available in Hive 0.7.0 and later)

primitive_type
  : TINYINT
  | SMALLINT
  | INT
  | BIGINT
  | BOOLEAN
  | FLOAT
  | DOUBLE
  | DOUBLE PRECISION -- (Note: Available in Hive 2.2.0 and later)
  | STRING
  | BINARY      -- (Note: Available in Hive 0.8.0 and later)
  | TIMESTAMP   -- (Note: Available in Hive 0.8.0 and later)
  | DECIMAL     -- (Note: Available in Hive 0.11.0 and later)
  | DECIMAL(precision, scale)  -- (Note: Available in Hive 0.13.0 and later)
  | DATE        -- (Note: Available in Hive 0.12.0 and later)
  | VARCHAR     -- (Note: Available in Hive 0.12.0 and later)
  | CHAR        -- (Note: Available in Hive 0.13.0 and later)

array_type
  : ARRAY < data_type >

map_type
  : MAP < primitive_type, data_type >

struct_type
  : STRUCT < col_name : data_type [COMMENT col_comment], ...>

union_type
   : UNIONTYPE < data_type, data_type, ... >  -- (Note: Available in Hive 0.7.0 and later)

CREATE TABLE tbl (
  col1 INT,
  col2 STRING,
  col3 ARRAY<STRING>,
  col4 MAP<STRING, STRING>,
  col5 STRUCT<age:INT, name:STRING>,
  col6 UNIONTYPE<int, double, array<string>, struct<a:int,b:string>>
);
```



* **기본타입**

  INT, FLOAT, STRING, DATE

* **복합타입**

  array, map, struct, union

* **Array**

  배열 타입, 인덱스 접근 가능

  ```java
  SELECT col3[0] FROM tbl;
  ```

* Map

  사전 타입, 키로 접근 가능

  ```java
  SELECT col4['key1'] FROM tbl;
  ```

* **Struct**

  자바 클래스와 유사, 필드명으로 접근 가능

  ```java
  SELECT col5.age FROM tbl;
  SELECT col5.name FROM tbl;
  ```

* **Union**

  지정한 데이터 타입 중 하나를 저장합니다. 출력 시에는 `{데이터 타입번호: 데이터}` 형태로 보여집니다.

  ````java
  CREATE TABLE union_test(
    foo UNIONTYPE<int, double, array<string>, struct<a:int,b:string>>
  );
  
  -- 0: int
  -- 1: double
  -- 2: array<string>
  -- 3: struct<a:int, b:string>
  SELECT foo FROM union_test;
  {0:1}
  {1:2.0}
  {2:["three","four"]}
  {3:{"a":5,"b":"five"}}
  {2:["six","seven"]}
  {3:{"a":8,"b":"eight"}}
  {0:9}
  {1:10.0}
  ````





---

## 2. 입력(Insert), 조회(Select)

하이브 테이블의 메타 정보를 이용하여 데이터를 읽고 쓰는 작업입니다. 테이블의 메타 정보에는 실제 파일의 위치와 데이터포맷이 저장되어 있습니다.



* **입력(INSERT) :** 

  1) INSERT문으로 테이블에 데이터를 쓰는 방법

  2) 테이블의 저장위치, 테이블을 생성할 때 지정한 LOCATION에 파일을 복사하는 방법

  ​	파티션 테이블은 파티션으로 나누어진 디렉토리를 구성하고 파일을 복사하면 됩니다.

* **조회(SELECT):**

  테이블의 LOCATION의 위치에 있는 파일을 읽습니다.

  하이브는 로케이션 아래의 모든 파일을 읽기 때문에 용량이 큰 파일을 저장한다면 파티션을 이용하여 데이터를 분산하여 주는 것이 좋습니다.



* **입력과 조회 방법:**

  1) 파일을 읽어서 테이블에 쓰는 방법

  2) 테이블의 데이터를 읽어서 다른 테이블에 쓰는 방법

  3) 테이블을 읽어서 지정한 디렉토리에 쓰는 방법



---

### 1) 파일 to 테이블

파일을 읽어서 테이블의 LOCATION에 쓰는 방법입니다.



#### 1-1 LOAD 명령으로 테이블에 쓰기

LOAD 명령으로 파일을 읽어서 테이블에 쓰면 테이블의 LOCATION에 데이터가 생성됩니다. HDFS와 로컬의 데이터를 테이블에 쓸 수 있고, 파티션 추가도 가능합니다.

LOAD 명령의 기본 문법은 다음과 같습니다. LOCAL이 있으면 로컬의 데이터를 읽고, 없으면 HDFS의 파일을 읽습니다. OVERWRITE로 파일을 덮어 쓸 수 있습니다.

```sh
LOAD DATA [LOCAL] INPATH 'filepath' [OVERWRITE] INTO TABLE tablename [PARTITION (partcol1=val1, partcol2=val2 ...)]
```

LOAD 명령을 이용한 예제는 다음과 같습니다.

```sh
-- hdfs의 파일을 읽어서 tbl 테이블에 입력 
LOAD DATA INPATH 'hdfs://127.0.0.1/user/data/sample.csv' INTO TABLE tbl;

-- hdfs의 파일을 읽어서 tbl 테이블의 파티션 yymmdd='20180510' 으로 입력 
LOAD DATA INPATH '/user/data/sample.csv' INTO TABLE tbl PARTITION(yymmdd='20180510');

-- 로컬의 파일을 읽어서 tbl 테이블에 입력 
LOAD DATA LOCAL INPATH './sample.csv' INTO TABLE tbl;

-- test.txt 파일을 sample1 테이블에 로드하고 데이터 조회 
LOAD DATA LOCAL INPATH './test.txt' INTO TABLE sample1;
```

<br>

### 1-2 테이블의 LOCATION에 파일을 복사

테이블의 메타정보에는 물리적인 파일의 위치, 즉 **LOCATION**이 존재합니다. 

테이블을 조회할 때 해당 위치의 파일을 읽기 때문에, 이 위치에 파일을 복사하면 데이터를 입력한 것과 동일한 역할을 합니다. 로컬 위치는 지정할 수는 없고, HDFS, S3 등 하둡에서 접근 가능한 파일 공유 파일 시스템을 이용해야 합니다.

테이블의 LOCATION 정보를 지정하는 방법은 CREATE 시에 지정할 수 있고, ALTER 문을 이용해서 처리할 수도 있습니다.

```shell
-- 테이블을 생성하면서 LOCATION을 지정 
CREATE TABLE employee (
  id         String,
  name       String 
) LOCATION 'hdfs://127.0.0.1/user/data/';

-- 테이블을 생성하고, 나중에 테이블의 위치를 ALTER 명령으로 지정 
CREATE TABLE employee (
  id         String,
  name       String );
-- ALTER 명령으로 테이블의 로케이션 변경 
ALTER TABLE employee SET LOCATION 'hdfs://127.0.0.1/user/data/';
```



다음은 sample1 테이블을 LOCATION을 지정하지 않고 생성한 후 ALTER 문으로 로케이션을 지정하여 데이터를 조회하는 예제입니다.

```shell
-- 테이블 생성후 조회시 데이터가 없음
hive> create table sample1(col1 string);
hive> select * from sample1;
OK
Time taken: 0.8 seconds

-- HDFS에 데이터가 존재 
$ hadoop fs -ls hdfs://0.0.0.0:8020/user/data/
2018-05-21 07:38:47         14 test.txt


-- 로케이션을 설정 후 조회시 데이터가 확인 됨 
hive> alter table sample1 set location 'hdfs://0.0.0.0:8020/user/data/';
hive> select * from sample1;
OK
a
b
c
d
f
g
h
Time taken: 0.055 seconds, Fetched: 7 row(s)
```

LOCATION을 지정하여 데이터를 조회할 때 서브 디렉토리 모두를 조회해야 한다면 옵션을 설정하여 조회하면 됩니다.

```shell
-- 하위 폴더를 모두 검색할 수 하는 옵션 
set hive.supports.subdirectories=true;
set mapred.input.dir.recursive=true;
```

<br>

---

### 1-3 테이블 파티션을 추가/수정하여 LOCATION을 파일 위치로 주는 법

파티션 테이블은 파티션 별로 LOCATION을 가지고 있습니다. 파티션의 LOCATION에 파일을 이동 시키면 조회시에 해당 데이터를 이용합니다. 신규 파티션을 생성할 때와 기존 파티션의 LOCATON을 수정하는 방법은 다음과 같습니다.

```shell
-- 신규 파티션을 추가하면서 LOCATION을 지정 
ALTER TABLE employee ADD PARTITION (yymmdd='20180510') LOCATION 'hdfs://127.0.0.1/user/';

-- 기존 파티션의 LOCATION을 수정  
ALTER TABLE employee PARTITION (yymmdd='20180510') SET LOCATION 'hdfs://127.0.0.1/user/';
```



<br>

#### MSCK 문으로 파티션 연결

MSCK문은 테이블을 신규생성할 때 많이 사용합니다. 신규 테이블 LOCATON 정보에 기존 디렉토리의 정보를 매칭 시킬때 MSCK문을 이용하면 LOCATION 하위에 존재하는 디렉토리 정보를 이용하여 자동으로 파티션을 생성해 줍니다.

주로 테이블 정보가 삭제되어 테이블을 신규로 생성하고 파티션 정보를 새로 생성 할 때나, 외부에서 대량의 데이터가 추가 되어 파티션 정보를 신규로 생성하여야 할 때 유용하게 사용할 수 있습니다.

```shell
-- hdfs에 아래와 같이 폴더가 존재 
hdfs://127.0.0.1/user/employee/yymmdd=20180101

-- 테이블 생성 후 로케이션 지정 
-- 로케이션을 폴더가 존재하고, 파티션이 생성되는 위치로 지정 
CREATE TABLE employee (
  name STRING,
  age  STRING
) PARTITIONED BY (yymmdd STRING)
LOCATION 'hdfs://127.0.0.1/user/employee';

-- 파티션 연결 
MSCK REPAIR TABLE employee;
```



<br>

---

### 2) 테이블 to 테이블

테이블의 정보를 읽어서 다른 테이블에 입력하는 방법입니다.

<br>

#### INSERT 문

기본적인 데이터 입력 방식으로 테이블, 뷰의 데이터를 다른 테이블에 입력합니다. INSERT 문의 기본 문법은 다음과 같습니다.

```shell
INSERT OVERWRITE TABLE tablename1 [PARTITION (partcol1=val1, partcol2=val2 ...) [IF NOT EXISTS]] select_statement1 FROM from_statement;
INSERT INTO TABLE tablename1 [PARTITION (partcol1=val1, partcol2=val2 ...)] select_statement1 FROM from_statement;
```



INSERT 문은 이용할 때는 다음과 같이 기본 테이블에 입력할 수도 있고, 파티션 테이블에 정보를 이용하여 입력 할 수도 있습니다.

```shell
-- source의 내용을 target 테이블에 입력 
INSERT INTO TABLE target 
SELECT *
  FROM source;

-- OVERWRITE가 붙으면 해당 위치의 내용을 삭제하고 덮어 쓴다. 
INSERT OVERWRITE TABLE target PARTITION(col1 = 'a', col2)
SELECT data1,
       date2
  FROM source;
```

<br>

#### FROM INSERT 문

FROM INSERT문은 여러 테이블에 한 번에 입력할 때 사용합니다. FROM 절에 원천 데이터를 조회하여 뷰처럼 사용할 수 있습니다. FROM INSERT문의 기본 문법은 다음과 같습니다.

```shell
FROM page_view_stg pvs
INSERT OVERWRITE TABLE page_view PARTITION(dt='2008-06-08', country)
       SELECT pvs.ip, pvs.country;
```



다음은 source1, source2 테이블을 읽어서 target1, target2 테이블에 입력하는 예제입니다.

```
FROM (
  SELECT *
    FROM source1
  UNION
  SELECT *
    FROM source2
) R
INSERT INTO TABLE target1
SELECT R.name,
       R.age

INSERT OVERWRITE TABLE target2 PARTITION(col1 = 'a', col2)
SELECT R.name,
       R.age;
```

<br>

#### CREATE TABLE AS SELECT 문

**CTAS 문**은 테이블을 생성하면서 데이터를 입력합니다. SELECT 로 조회한 데이터를 CREATE 문으로 생성한 테이블에 입력합니다. CREATE 시에 기존에 테이블 생성할 때와 동일하게 부가 정보를 입력하여 생성할 수 있습니다.

```shell
-- source_table을 target_table 로 생성 
CREATE TABLE target_table
   AS
SELECT *
  FROM source_table;


-- CREATE 문과 동일하게 생성하고 AS 문 다음에 SELECT 문 입력 
CREATE TABLE new_key_value_store
   ROW FORMAT SERDE "org.apache.hadoop.hive.serde2.columnar.ColumnarSerDe"
   STORED AS RCFile
   AS
SELECT (key % 1024) new_key, concat(key, value) key_value_pair
  FROM key_value_store
  SORT BY new_key, key_value_pair;
```

<br>

### INSERT, UPDATE, DELETE, MERGE

하이브 0.14 부터는 INSERT, UPDATE, DELETE, MERGE 문을 지원합니다. 하이브 버전에 따라 실행되지 않을 수도 있습니다. **UPDATE, DELETE 는 트랜잭션 설정**을 하여야만 사용할 수 있습니다.

```shell
CREATE TABLE students (name VARCHAR(64), age INT, gpa DECIMAL(3, 2))
  CLUSTERED BY (age) INTO 2 BUCKETS STORED AS ORC;

-- INSERT 
INSERT INTO TABLE students
  VALUES ('fred flintstone', 35, 1.28), ('barney rubble', 32, 2.32);

-- UPDATE
UPDATE students SET age = 10 WHERE name = 'fred flintstone';

-- DELETE
DELETE FROM students WHERE name = 'fred flintstone';

-- MERGE
MERGE INTO <target table> AS T USING <source expression/table> AS S
ON <boolean expression1>
WHEN MATCHED [AND <boolean expression2>] THEN UPDATE SET <set clause list>
WHEN MATCHED [AND <boolean expression3>] THEN DELETE
WHEN NOT MATCHED [AND <boolean expression4>] THEN INSERT VALUES<value list>
```

<br>

<br>

---

## 3) 테이블 to 디렉토리

**테이블 데이터를 조회하여 디렉토리에 파일로 생성하는 방법입니다.**



### INSERT DIRECTORY 문

테이블의 데이터를 읽어서 지정한 위치에 파일을 출력합니다. ROW FORMAT을 이용하여 데이터를 저장하는 방법을 설정할 수 있습니다. 기본 문법은 다음과 같습니다.

```shell
INSERT OVERWRITE [LOCAL] DIRECTORY directory1
  [ROW FORMAT row_format] [STORED AS file_format] (Note: Only available starting with Hive 0.11.0)
  SELECT ... FROM ...

Hive extension (multiple inserts):
FROM from_statement
INSERT OVERWRITE [LOCAL] DIRECTORY directory1 select_statement1
[INSERT OVERWRITE [LOCAL] DIRECTORY directory2 select_statement2] ...


row_format
  : DELIMITED [FIELDS TERMINATED BY char [ESCAPED BY char]] [COLLECTION ITEMS TERMINATED BY char]
        [MAP KEYS TERMINATED BY char] [LINES TERMINATED BY char]
        [NULL DEFINED AS char] (Note: Only available starting with Hive 0.13)
```



다음은 디렉토리에 파일을 쓰는 예제입니다. source 테이블의 정보를 읽어서 지정한 디렉토리에 저장할 수 있습니다. ROW FORMAT을 이용하여 원하는 형태로 변형하여 저장 할 수도 있습니다.

```shell
# /user/ 디렉토리에 source 테이블을 읽어서 저장 
INSERT OVERWRITE DIRECTORY 'hdfs://1.0.0.1:8020/user/'
SELECT *
  FROM source
;

# /user/ 디렉토리에 source 테이블을 읽어서 칼럼 구분을 탭으로 저장 
INSERT OVERWRITE DIRECTORY 'hdfs://1.0.0.1:8020/user/'
   ROW FORMAT DELIMITED
   FIELDS TERMINATED BY '\t'
SELECT *
  FROM source
;

# /user/ 디렉토리에 source 테이블을 읽어서 칼럼 구분을 콤마으로 저장하면서 Gzip으로 압축 
# 파일을 CSV 형태로 압축하여 저장 
set hive.exec.compress.output=true;
set mapred.output.compression.codec=org.apache.hadoop.io.compress.GzipCodec;

INSERT OVERWRITE DIRECTORY 'hdfs://1.0.0.1:8020/user/'
   ROW FORMAT DELIMITED
   FIELDS TERMINATED BY ','
SELECT *
  FROM source
;
```

<br>

<br>

---

### 4) 복합타입 입력



STRUCT와 UNIONTYPE 같은 복합 타입의 입력과 조회방법에 대해서 알아봅니다.

- **STRUCT**
  - 자바의 Value Object와 유사
  - `칼럼명.속성` 형태로 데이터에 접근
- **UNIONTYPE**
  - 하나의 칼럼이 여러가지 속성을 가질 수 있음
  - 반환값으로 데이터 타입과 데이터 값을 반환



<br>

#### STRUCT

####  테이블 생성 및 조회

```shell
-- 테이블 생성 
CREATE TABLE struct_tbl (
  struct_col STRUCT<age:INT, name:STRING>
) ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t'
  COLLECTION ITEMS TERMINATED BY ','
  MAP KEYS TERMINATED BY '='
;

-- 입력 데이터 예제. 콤마(,)로 구분 
$ cat sample.tsv
1,A
2,B

-- 데이터 적용 
LOAD DATA LOCAL INPATH './sample.tsv' INTO TABLE struct_tbl;

-- 데이터 조회 방법 
hive> SELECT struct_col.age FROM struct_tbl;
1
2

hive> SELECT struct_col.name FROM struct_tbl;
A
B
```

<br>

#### STRUCT 데이터 생성

하이브에서 제공하는 기본 함수로 STRUCT를 생성하는 방법은 두 가지입니다. `struct`와 `named_struct`를 이용하는 방법입니다.

```shell
-- struct는 이름없는 데이터를 생성 
hive> SELECT struct("a", "b");
OK
{"col1":"a", "col2":"b"}

-- named_struct는 칼럼이름을 지정하고 데이터를 생성 
hive> SELECT named_struct("a", 1, "b", 2);
OK
{"a":1, "b":2}
```

<br>

####  STRUCT 데이터 입력

복합타입에 데이터를 입력하는 방법은 해당 타입의 데이터를 생성하여 입력합니다. 기본 함수를 이용하여 해당 타입의 데이터를 생성하여 원하는 테이블에 데이터를 입력할 수 있습니다.

```shell
-- named_struct를 이용하여 struct 데이터를 생성하여 struct_tbl에 입력 
FROM (
  SELECT named_struct("age", 10, "name", "aa") AS col1
) R
INSERT INTO TABLE struct_tbl
SELECT R.col1
;

-- 데이터 입력후 결과 조회 
hive> SELECT * FROM struct_tbl;
OK
{"age":10,"name":"aa"}
{"age":1,"name":"A"}
{"age":2,"name":"B"}
```

<br>

<br>

#### UNION

#### 테이블 생성 및 조회

```shell
-- 테이블 생성 
CREATE TABLE union_tbl (
  union_col UNIONTYPE<int, double, array<string>, struct<a:int, b:string>>
) ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t'
  COLLECTION ITEMS TERMINATED BY ','
  MAP KEYS TERMINATED BY '='
;

-- 콤마 구분자로 첫번재는 데이터 타입, 두번재는 값
$ cat union.tsv
0,1
1,2.0
2,a,b,c
3,1,A

-- 데이터 적용 
LOAD DATA LOCAL INPATH './union.tsv' INTO TABLE union_tbl;

-- 데이터 조회 
SELECT union_col FROM union_tbl;
{0:1}
{1:2.0}
{2:["a,b,c"]}
```

<br>

#### UNION 데이터 생성

하이브에서 제공하는 기본 함수로 UNION 데이터를 생성할 때는 `create_union`함수를 이용합니다.

```shell
-- 첫번째 0이 데이터의 인덱스 
hive> SELECT create_union(0, 60, "a");
{0:60}

-- 첫번째 1이 데이터의 인덱스 
hive> SELECT create_union(1, 60, "a");
{1:"a"}
```



---

**Reference**

https://wikidocs.net/23556

https://wikidocs.net/23562

https://wikidocs.net/64538