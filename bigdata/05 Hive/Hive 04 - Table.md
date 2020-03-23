# Hive 4 - Table



## 1 Table



### 테이블 생성 (CREATE)



```
-- 테이블 생성 쿼리 
CREATE [TEMPORARY] [EXTERNAL] TABLE [IF NOT EXISTS] [db_name.]table_name    -- (Note: TEMPORARY available in Hive 0.14.0 and later)
  [(col_name data_type [COMMENT col_comment], ... [constraint_specification])]
  [COMMENT table_comment]
  [PARTITIONED BY (col_name data_type [COMMENT col_comment], ...)]
  [CLUSTERED BY (col_name, col_name, ...) [SORTED BY (col_name [ASC|DESC], ...)] INTO num_buckets BUCKETS]
  [SKEWED BY (col_name, col_name, ...)                  -- (Note: Available in Hive 0.10.0 and later)]
     ON ((col_value, col_value, ...), (col_value, col_value, ...), ...)
     [STORED AS DIRECTORIES]
  [
   [ROW FORMAT row_format] 
   [STORED AS file_format]
     | STORED BY 'storage.handler.class.name' [WITH SERDEPROPERTIES (...)]  -- (Note: Available in Hive 0.6.0 and later)
  ]
  [LOCATION hdfs_path]
  [TBLPROPERTIES (property_name=property_value, ...)]   -- (Note: Available in Hive 0.6.0 and later)
  [AS select_statement];   -- (Note: Available in Hive 0.5.0 and later; not supported for external tables)

-- LIKE 를 이용하여 기 존재하는 테이블과 동일하게 테이블 생성 
CREATE [TEMPORARY] [EXTERNAL] TABLE [IF NOT EXISTS] [db_name.]table_name
  LIKE existing_table_or_view_name
  [LOCATION hdfs_path];

-- 테이블의 데이터를 구분하는 기준 포맷 
row_format
  : DELIMITED [FIELDS TERMINATED BY char [ESCAPED BY char]] [COLLECTION ITEMS TERMINATED BY char]
        [MAP KEYS TERMINATED BY char] [LINES TERMINATED BY char]
        [NULL DEFINED AS char]   -- (Note: Available in Hive 0.13 and later)
  | SERDE serde_name [WITH SERDEPROPERTIES (property_name=property_value, property_name=property_value, ...)]

-- 테이블의 데이터를 저장하는 파일의 타입 
file_format:
  : SEQUENCEFILE
  | TEXTFILE    -- (Default, depending on hive.default.fileformat configuration)
  | RCFILE      -- (Note: Available in Hive 0.6.0 and later)
  | ORC         -- (Note: Available in Hive 0.11.0 and later)
  | PARQUET     -- (Note: Available in Hive 0.13.0 and later)
  | AVRO        -- (Note: Available in Hive 0.14.0 and later)
  | INPUTFORMAT input_format_classname OUTPUTFORMAT output_format_classname

-- 테이블의 제약조건 
constraint_specification:
  : [, PRIMARY KEY (col_name, ...) DISABLE NOVALIDATE ]
    [, CONSTRAINT constraint_name FOREIGN KEY (col_name, ...) REFERENCES table_name(col_name, ...) DISABLE NOVALIDATE 
```

<br>



---

### 1 저장위치

### LOCATION

테이블의 저장위치는 테이블에 쓰는 데이터의 저장위치 입니다. 사용자가 입력하지 않으면 데이터베이스의 저장위치 아래 테이블 이름의 폴더로 기본 생성됩니다.



<br>

---

## 2 테이블 타입

### MANAGED

테이블 생성시 옵션을 따로 주지 않으면 매니지드 테이블이 생성됩니다. 세션이 종료되어도 테이블의 데이터와 파일은 유지 됩니다. 테이블을 DROP 하면 파일도 함께 삭제 됩니다.

<br>

### EXTERNAL

EXTERNAL 옵션은 매니지드 테이블과 파일 삭제 정책을 제외하고 동일합니다. **익스터널 테이블은 DROP하면 파일은 그대로 유지됩니다.** 사용자의 실수로 인한 파일 삭제를 방지하기 위해서 EXTERNAL 테이블로 관리하는 것이 좋습니다.

<br>

### TEMPORARY

TEMPORARY 옵션은 현재 세션에서만 사용하는 테이블을 생성 할 수 있습니다. **현재 세션이 종료되면 제거되기 때문에 임시 테이블 생성에 사용하면 좋습니다.**





<br>

---

## 3. 파티션

### PARTITIONED BY

파티션은 폴더 구조로 데이터를 분할하여 저장합니다. PARTITIOND BY에 지정한 칼럼의 정보를 이용하여 폴더 단위로 데이터가 생성됩니다. 파티션 생성시 **정보의 제공 유무에 따라** **다이나믹 파티션과** **스태틱 파티션**이 있습니다.

**하이브는 폴더 단위로 데이터를 읽기 때문에 파티션이 없다면 테이블의 모든 데이터를 읽게 됩니다.** 시간이 갈 수록 데이터가 쌓이게 되면 점점 조회 시간이 길어집니다. 이를 방지하기 위하여 일자나 특정 조건을 이용하여 파티션을 지정하고, 조회시에 파티션을 이용하여 데이터를 조회하면 조회 속도를 높일 수 있습니다.

```
-- 일자를 기준으로 파티션 생성 
CREATE TABLE tbl(
  col1 STRING
) PARTITIONED BY (yymmdd STRING);

-- 데이터 저장 구조 
hdfs://tbl/yymmddval=20180501/0000_0
hdfs://tbl/yymmddval=20180502/0000_0
hdfs://tbl/yymmddval=20180503/0000_0

-- 조회
SELECT yymmdd, count(1)
  FROM tbl
 WHERE yymmdd between '20180501' and '20180503'
 GROUP BY yymmdd
```



<br>

---

## 4. 버켓팅, 스큐

### CLUSTERED BY SORTED BY INTO BUCKETS

**버켓팅은 CLUSTERED BY** 를 이용하여 설정합니다. 일반적으로 S**ORTED BY와 함께 사용**합니다. 설정한 버켓의 개수(파일의 개수)에 지정한 칼럼의 데이터를 해쉬처리하여 저장합니다.

버켓팅한 테이블은 조인시에 SMB 조인으로 처리할 수 있게 되어 조인시에 속도가 빨라집니다.

```
-- col2 를 기준으로 버켓팅 하여 20개의 파일에 저장 
CREATE TABLE tbl(
  col1 STRING,
  col2 STRING
) CLUSTERED BY col2 SORTED BY col2  INTO 20 BUCKETS
```



<br>

---

### SKEWED BY

**스큐는 값을 분리된 파일에 저장하여 특정한 값이 자주 등장할 때 속도를 높이는 방법**입니다.

```
-- col1의 col_value 값을 스큐로 저장  
CREATE TABLE tbl (
  col1 STRING,
  col2 STRING
) SKEWED BY (col1) on ('col_value');
```







<br>

---

## 5. 테이블 포맷(ROW FORMAT)

테이블 포맷(ROW FORMAT)은 데**이터를 칼럼단위로 구분하는 구분자(delimeter)와 데이터를 해석하는 방법을 지정하는 서데(SerDe)를 지정**합니다. 사용자가 지정하지 않으면 기본 구분자와 서데를 사용합니다.



<br>

### DELIMITED

**하이브는 구분자에 따라서 데이터를 분리하여 칼럼 단위로 보여줍니다**. 하이브의 구분자를 설정하는 방법은 아래와 같습니다.

- 기본 구분자
- 칼럼 구분자: \001,
- 콜렉션 아이템 구분자: \002,
- 맵 아이템 구분자: \003

```
-- 하이브의 기본 구분자를 이용한 테이블 생성 
--   입력 데이터
$ cat sample.txt 
a,val1^val2^val3,key1:val1^key2:val2

-- ROW FORMAT을 이용한 테이블 생성 
CREATE TABLE tbl (
 col1 STRING,
 col2 ARRAY<STRING>, 
 col3 MAP<STRING, STRING>
) ROW FORMAT DELIMITED
   FIELDS TERMINATED BY ','
   COLLECTION ITEMS TERMINATED BY '^'
   MAP KEYS TERMINATED BY ':';

-- 데이터 로드 
LOAD DATA LOCAL INPATH './sample.txt' INTO TABLE tbl;

-- 데이터 조회, 구분자에 따라 데이터가 구분 됨 
hive> select * from tbl;
OK
a   ["val1","val2","val3"]  {"key1":"val1","key2":"val2"}

-- 지정가능한 구분자 
  FIELDS TERMINATED BY '\t'            -- 칼럼을 구분하는 기준
  COLLECTION ITEMS TERMINATED BY ','   -- 리스트를 구분하는 기준
  MAP KEYS TERMINATED BY '='           -- 맵데이터의 키와 밸류를 구분하는 기준
  LINES TERMINATED BY '\n'             -- 로(row)를 구분하는 기준
  ESCAPED BY '\\'                      -- 값을 입력하지 않음
  NULL DEFINED AS 'null'               -- null 값을 표현(0.13 버전에서 추가)
```





<br>

---

## 6. 서데(SerDe)

**서데는 데이터를 해석하는 방법을 지정**합니다. 하이브에서 제공하는 서데는 **기본서데, 정규식(RegExSerDe), JSON(JsonSerDe), CSV(OpenCSVSerde)가 존재**합니다. 사용자가 개발하여 적용할 수도 있습니다. 각 서데의 상세한 사용법은 [하이브 위키](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL#LanguageManualDDL-RowFormats&SerDe)를 참고하면 됩니다. 각 서데의 사용법은 다음과 같습니다.

```
-- RegEx 서데 
-- 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
CREATE TABLE apachelog (
  host      STRING,
  identity  STRING,
  user      STRING,
  time      STRING,
  request   STRING,
  status    STRING,
  size      STRING,
  referer   STRING,
  agent     STRING )
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
  "input.regex" = "([^]*) ([^]*) ([^]*) (-|\\[^\\]*\\]) ([^ \"]*|\"[^\"]*\") (-|[0-9]*) (-|[0-9]*)(?: ([^ \"]*|\".*\") ([^ \"]*|\".*\"))?"
);

-- JSON 서데 
CREATE TABLE my_table(
  a string, 
  b bigint 
) ROW FORMAT SERDE 'org.apache.hive.hcatalog.data.JsonSerDe'
STORED AS TEXTFILE;

-- CSV 서데 
CREATE TABLE my_table(
  a string, 
  b string
) ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'
WITH SERDEPROPERTIES (
   "separatorChar" = "\t",
   "quoteChar"     = "'",
   "escapeChar"    = "\\"
)  
STORED AS TEXTFILE;
```





<br>

---

## 7. 저장 포맷(STORED AS)

**STROED AS는 데이터를 저장하는 파일 포맷**을 지정합니다. 저장 포맷은 TEXTFILE, SEQUENCEFILE, ORC, PARQUET 등이 존재합니다. 사용자가 개발하여 적용할 수도 있습니다. 상세한 내용은 [하이브 위키](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL#LanguageManualDDL-StorageFormatsStorageFormatsRowFormat,StorageFormat,andSerDe)를 확인하면 됩니다.

```
-- 저장 포맷을 ORC로 설정하고, ORC 관련 설정정보 전달 
CREATE TABLE tbl (
  col1 STRING
) STORED AS ORC 
TBLPROPERTIES ("orc.compress"="SNAPPY");

-- INPUTFORMAT, OUTPUTFORMAT을 따로 지정하는 것도 가능 
CREATE TABLE tbl1 (
  col1 STRING 
) STORED AS INPUTFORMAT  "com.hadoop.mapred.DeprecatedLzoTextInputFormat"
            OUTPUTFORMAT "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat";
```









---

**Reference**

https://wikidocs.net/23469