# Hive 6 - table 4 SerDe

## 7. 서데(SerDe)

<br>

서데(SerDe, Serializer/Deserializer)는 하이브가 데이터를 해석하는 방법을 제공합니다. 하이브는 서데와 파일 포맷을 이용하여 데이터를 읽고, 쓸 수 있습니다.



Hive는 파일을 읽을 때 파일포맷(file format)을 이용하고, 디시리얼라이저(Deserializer)를 이용하여 원천 데이터를 테이블 포맷에 맞는 로우 데이터로 변환합니다. 파일을 쓸 때는 로우 데이터를 시리얼라이저(Serializer)를 이용하여 key, value 형태로 변경하고 파일포맷을 이용하여 저장 위치에 씁니다. 서데는 `doDeserialize()`, `doSerializer()`로 위 작업을 수행합니다.

* HDFS files → InputFileFormat → Deserializer → Row object
* Row object → Serialzier → OutputFileFormat → HDFS files



### Hive 기본 서데

하이브는 7가지 기본 서데(Avro, ORC, RegEx, Thrift, Parquet, CSV, JsonSerDe)를 제공합니다. 각 서데는 STORED AS 에 지정하는 파일 포맷에 따라 자동으로 선택됩니다.



**Avro, ORC, Parquet 은 서데와 인풋, 아웃풋 포맷이 설정**됩니다. 나머지는 기본 LazySimpleSerDe와 파일에 따른 인풋, 아웃풋 포맷이 설정됩니다. 테이블에 설정되는 서데는 `desc formatted` 명령으로 확인이 가능합니다.

```shell
# ORC 테이블 생성 
CREATE TABLE orc_tbl (
  col STRING
) STORED AS ORC;

# ORC 테이블 확인 
hive>desc formatted orc_tbl;

# ORC 테이블의 서데, 인풋 아웃풋 포맷
# Storage Information        
SerDe Library:          org.apache.hadoop.hive.ql.io.orc.OrcSerde    
InputFormat:            org.apache.hadoop.hive.ql.io.orc.OrcInputFormat  
OutputFormat:           org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat    

# TXT 테이블 생성 
CREATE TABLE txt_tbl (
  col STRING
);

# TXT 테이블 확인 
hive>desc formatted txt_tbl;

# TXT 테이블의 서데, 인풋 아웃풋 포맷
# Storage Information        
SerDe Library:          org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe   
InputFormat:            org.apache.hadoop.mapred.TextInputFormat     
OutputFormat:           org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat   
```



### 커스텀 서데

기본 제공하는 서데 외에 사용자가 서데를 구현할 수 있습니다. 원천데이터를 조작하여 테이블의 포맷에 맞는 데이터 형태로 변경해야 할 때 사용할 수 있습니다. 대부분 경우 데이터를 읽을 때 포맷을 변환하는 경우가 많아 `doDeserialize()`를 구현하는 경우가 많습니다.



## 예제

다음은 LazySimpleSerDe를 상속하여 커스텀 서데를 구현한 예제입니다. 아래의 샘플 데이터 처럼 값에 느낌표(!)가 들어가 있습니다. 데이터 입력시에 이를 제거하기 위한 커스텀 서데 입니다.

```shell
$ cat sample.txt
david   23!
cole    3!5
anna    !92
```

LazySimpleSerDe를 상속하고 `doDeserialize()`를 구현하였습니다.

```java
import org.apache.hadoop.hive.serde2.SerDeException;
import org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.Writable;

public class SampleSerDe extends LazySimpleSerDe {

    public SampleSerDe() throws SerDeException {
        super();
    }

    @Override
    public Object doDeserialize(Writable field) throws SerDeException {
        // 느낌표는 제거  
        String temp = field.toString().replaceAll("!", "");
        return super.doDeserialize(new Text(temp));
    }
}
```

<br>

<br>

## 사용방법

커스텀 서데를 사용하기 위해서는 우선 **구현한 클래스를 jar 파일로 묶어서 ADD JAR 명령을 이용해 추가하고 테이블 생성시에 설정값을 추가**해 줍니다. 이후 데이터를 조회하면 느낌표가 없는 데이터를 확인할 수 있습니다.

```shell
# 클래스가 들어 있는 jar 파일 추가 
hive> ADD JAR ./hiveUDF.jar;

# 테이블 생성 시에 서데 정보 및 프로퍼티 정보 전달 
hive> CREATE TABLE serde_tbl
(
  col1 STRING,
  col2 STRING
) 
ROW FORMAT SERDE 'com.sec.hive.serde.SampleSerDe'
WITH SERDEPROPERTIES ( "field.delim" = "\t" )
;

# 샘플 데이터를 입력 
hive> LOAD DATA LOCAL INPATH './sample.txt' INTO TABLE serde_tbl;

# 데이터 조회 
hive> select * from serde_tbl;
OK
david   23
cole    35
anna    92
```

<br>

<br>

## 8. 가상칼럼(Virtual Column)

입력된 원천데이터의 위치를 확인하기 위한 가상 칼럼(Virtual Column)이 존재합니다.

| 칼럼                      | 설명                               |
| :------------------------ | :--------------------------------- |
| INPUT**FILE**NAME         | 매퍼의 입력으로 들어온 파일의 이름 |
| BLOCK__OFFSET_INSIDE_FILE | 파일에서 현재 데이터의 위치        |



가상칼럼은 다음처럼 **SELECT** 문, **WHERE 조건**에 사용할 수 있습니다.

```java
select INPUT__FILE__NAME, key, BLOCK__OFFSET__INSIDE__FILE 
  from src;

select key, count(INPUT__FILE__NAME) 
  from src 
 group by key 
 order by key;

select * 
  from src 
 where BLOCK__OFFSET__INSIDE__FILE > 12000 
 order by key;
```

<br>

<br>

---

## 9. 쿼리 분석(query analysis)



하이브에서는 `explain` 명령으로 쿼리 실행 계획을 확일할 수 있습니다. 실행 계획 전체 메뉴얼은 [하이브 메뉴얼](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Explain) 에서 확인 가능합니다.

```shell
EXPLAIN [EXTENDED|AST|DEPENDENCY|AUTHORIZATION|LOCKS|VECTORIZATION|ANALYZE] query

hive> EXPLAIN select * from tbl;
hive> EXPLAIN EXTENDED select * from tbl;
```

실행 계획은 쿼리를 실행하는 스테이지 정보, 스테이지에서 처리되는 작업의 정보가 아래와 같이 출력됩니다. **CBO(cost-based optimization)를 이용하면 테이블의 통계정보를 이용하여 최적화 합니다.**



```json
{
  "STAGE DEPENDENCIES": {
    "Stage-1": {
      "ROOT STAGE": "TRUE"
    },
    "Stage-8": {
      "DEPENDENT STAGES": "Stage-1",
      "CONDITIONAL CHILD TASKS": "Stage-5, Stage-4, Stage-6"
    },
    "Stage-5": {},
    "Stage-2": {
      "DEPENDENT STAGES": "Stage-5, Stage-4, Stage-7"
    },
    "Stage-0": {
      "DEPENDENT STAGES": "Stage-2"
    },
    "Stage-3": {
      "DEPENDENT STAGES": "Stage-0"
    },
    "Stage-4": {},
    "Stage-6": {},
    "Stage-7": {
      "DEPENDENT STAGES": "Stage-6"
    }
  }
  ,
  "STAGE PLANS": {
    "Stage-1": {
      "Tez": {
      ...
```

### 옵션

- EXTENDED : 추가 정보 확인
- AST : Abstract Syntax Tree 정보 확인
- DEPENDENCY : 테이블간 의존 정보 확인
- AUTHORIZATION : 테이블 조회 권한 정보 확인
- LOCKS : 테이블의 락 정보 확인
- VECTORIZATION : 벡터화 처리 정보 확인
- ANALYZE : 실제 참조하는 row 정보 확인

<br>

<br>

---

## 10. 통계 정보

하이브는 테이블의 row 수, 파일 개수, 사이즈 등의 통계정보를 이용해서 빠른 데이터처리를 지원합니다. 통계정보는 CBO를 이용한 실행계획 최적화, 단순 카운트 쿼리 등에 사용되어 처리 속도를 높여줍니다.

테이블 통계정보 설정 옵션은 아래와 같습니다.

```shell
set hive.stats.autogather=true;
set hive.stats.column.autogather=true;
```

하이브는 기본적으로 통계정보를 수집하도록 돼있어서 따로 설정하지 않아도 테이블의 메타정보를 수집합니다. 하지만 사용하는 버전, 제조사에 따라 설정이 다를 수 있기 때문에 확인하는 것이 좋습니다.



### 통계 정보 수집

DML 을 이용하여 처리할 때는 통계정보를 자동으로 수집하지만, 파일 시스템 상의 정보가 변경되지는 않습니다. 이럴 때는 `analyze` 명령으로 **통계정보를 수집하도록 설정**합니다.

`analyze` 명령은 **테이블 단위, 파티션 단위로 실행이 가능**합니다. **통계정보 수집은 맵리듀스(map reduce) 작업입니다.** 다른 작업에 영향을 미치지 않도록 주의해서 실행하는 것이 좋습니다.

```shell
ANALYZE TABLE [db_name.]tablename [PARTITION(partcol1[=val1], partcol2[=val2], ...)]  -- (Note: Fully support qualified table name since Hive 1.2.0, see HIVE-10007.)
  COMPUTE STATISTICS 
  [FOR COLUMNS]          -- (Note: Hive 0.10.0 and later.)
  [CACHE METADATA]       -- (Note: Hive 2.1.0 and later.)
  [NOSCAN];

# tbl 테이블 통계정보 수집
hive> ANALYZE TABLE tbl COMPUTE STATISTICS;
# tbl 테이블의 yymmdd가 '2018-01-01'인 파티션의 통계정보 수집 
hive> ANALYZE TABLE tbl PARTITION(yymmdd='2018-01-01') COMPUTE STATISTICS;
# 칼럼 통계정보 수집 
hive> ANALYZE TABLE tbl PARTITION(yymmdd='2018-01-01') COMPUTE STATISTICS FOR COLUMNS;
```

통계정보는 `desc extended|formatted` 커맨드로 확인할 수 있습니다. 다음처럼 테이블 정보, 파티션 정보에 통계정보가 추가되어 보여집니다.

<br>

```shell
hive> desc formatted tbl partition(yymmddval='20180101');
OK
# col_name              data_type               comment             

col1        string                                      
Partition Parameters:        
COLUMN_STATS_ACCURATE   {\"BASIC_STATS\":\"true\"}
numFiles                6                   
numRows                 618048              
rawDataSize             2230248184          
totalSize               8546118             
transient_lastDdlTime   1544059910          
```

<br>

### 통계정보 활용

수집한 통계정보를 활용하기 위해서는 설정을 이용하여 `count`함수를 이용할 때 이 쿼리를 이용하도록 설정해야 합니다. MR 작업을 하지 않고 통계정보를 이용해서 데이터를 바로 확인할 수 있습니다.

```shell
set hive.compute.query.using.stats=true;

-- 통계정보 이용 작업
hive> select count(*) from table;
```

<br>

### 통계정보 사용 시 주의할 점

통계정보는 `INSERT`명령 시 계산되어 메타데이터에 보관됩니다. 따라서 파티션 위치에 파일을 직접 복사한 경우에는 메타데이터가 갱신되지 않아서 정확한 값이 나오지 않습니다. 따라서 파일만 따로 복사한 경우는 `ANALYZE`명령을 통해 정보를 갱신해야 합니다.

<br>

<br>

---

## 11. File Merge

하이브 작업 중 mapper 단독 작업의 경우 파일이 많이 생성될 수 있습니다. 작은 사이즈 파일이 많이 생기면 HDFS 입장에서는 부담이기 때문에 파일을 묶어주는 것이 좋습니다. 이 때 머지를 설정합니다.

파일 머지를 이용할 때 주의할 점은 너무 작은 사이즈의 파일이 많을 때 사용하면 작업시간이 길어질 수 있습니다. 예를 들어 1KB 사이즈 파일 3000개를 256MB 사이즈로 묶는 머지 작업을 추가하면 시간이 오래 걸릴 수 있으니 주의해야 합니다.

```shell
-- 맵퍼 단독 작업일 때 머지 
set hive.merge.mapfiles=true;
-- 맵리듀스 작업일 때 머지 
set hive.merge.mapredfiles=true;
-- 테즈 작업일 때 머지 
set hive.merge.tezfiles=true;
-- 머지 작업의 대상이 되는 파일 사이즈(32MB이하)
set hive.merge.smallfiles.avgsize=32000000;
-- 머지 파일을 묶을때 기준(256MB)
set hive.merge.size.per.task=256000000;
```

<br>

---

## 12. 파일 압축



하이브를 이용하여 INSERT DIRECTORY, CTAS 문으로 파일을 생성할 때 **원하는 타입의 형태로 파일을 압축**할 수 있습니다. **압축 가능한 코덱은 io.compression.codecs에 설정**되어 있어야 합니다.

```xml
    <property>
        <name>io.compression.codecs</name>
        <value>org.apache.hadoop.io.compress.GzipCodec,
               org.apache.hadoop.io.compress.DefaultCodec,
               org.apache.hadoop.io.compress.BZip2Codec,
               org.apache.hadoop.io.compress.SnappyCodec,
               com.hadoop.compression.lzo.LzoCodec,
               com.hadoop.compression.lzo.LzopCodec
        </value>
    </property>
```

작업 결과를 압축하기 위해서 작업전에 처리 결과를 압축하겠다는 설정과 압축 코덱을 지정해야 합니다. Gzip으로 압축하는 방법은 다음과 같습니다.

```shell
# 압축 여부 설정 
set hive.exec.compress.output=true;
# 압축 코덱 설정
set mapred.output.compression.codec=org.apache.hadoop.io.compress.GzipCodec;
```

<br>

### 압축 사용

INSERT DIRECTORY와 CTAS문을 이용해서 처리 결과를 압축하는 방법을 알아보겠습니다.

```shell
set hive.exec.compress.output=true;
set mapred.output.compression.codec=org.apache.hadoop.io.compress.GzipCodec;

# table을 읽어서 /user/tables/에  CSV 형태로 압축하여 저장 
INSERT OVERWRITE DIRECTORY 'hdfs:///user/tables/'
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
SELECT *
  FROM table
 WHERE name = 'csv'
;

# table을 읽어서 csvsample 테이블러 저장 
CREATE TABLE csvsample
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
LOCATION '/user/csv/'
AS 
SELECT *
  FROM table
 WHERE name = 'csv'
;
```

**파일을 압축하여 저장한 결과는 다음과 같이 .gz 파일로 생성**됩니다. 생성되는 파일의 개수는 매퍼 only 잡은 매퍼의 개수이고 리듀서 작업은 리듀서의 개수로 생성됩니다. 파일 개수 조정이 필요하면 매퍼와 리듀서의 개수를 저절하면 됩니다.

```shell
$ hadoop fs -ls /user/csv/
-rwxr-xr-x   2 hadoop hadoop   72361505 2019-04-03 08:05 /user/csv/000000_0.gz
-rwxr-xr-x   2 hadoop hadoop   74060122 2019-04-03 08:05 /user/csv/000001_0.gz
-rwxr-xr-x   2 hadoop hadoop   60733841 2019-04-03 08:05 /user/csv/000002_0.gz
```





---

**Reference**

https://wikidocs.net/25306

https://wikidocs.net/26785

https://wikidocs.net/26789

https://wikidocs.net/30570

https://wikidocs.net/33356