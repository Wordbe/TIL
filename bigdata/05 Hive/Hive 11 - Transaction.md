# Hive 11 - Transaction

<br>

# 1. Transaction



하이브는 v0.13 부터 [하이브 트랜잭션](https://cwiki.apache.org/confluence/display/Hive/Hive+Transactions)을 지원합니다. HDFS는 파일 수정이 없어 모든 기능이 완벽하게 지원되지 않고 아래 기능만 지원합니다. 기본(default) 트랜잭션 설정은 off로 되어 있습니다. 

* BEGIN, COMMIT, ROLLBACK 지원 하지 않고, auto-commit 만 지원
* ORC 파일 포맷, 버켓팅 설정이 된 managed 테이블에서만 지원
* Non-ACID 세션에서는 ACID 테이블에 접근 불가



### 트랜잭션 처리 순서

HDFS는 파일의 변경/수정을 지원하지 않습니다. **HDFS에서 트랜잭션을 지원하기 위해서는 데이터를 베이스(base) 파일에 기록하고, 트랜잭션(생성/수정/삭제)이 발생할 때마다 델타(delta) 파일에 내용을 기록합니다. 이제 파일을 읽을 때 베이스와 델타 파일의 내용을 적용하여 수정된 내용을 반환합니다.**

1. 테이블이나 파티션은 베이스 파일의 집합으로 저장
2. insert, update, delete 에 대해서는 델타 파일로 저장
3. 읽는 시점에 베이스 파일과, 델터 파일을 합쳐서 수정된 내용을 반환

파일시스템에 저장된 파일을 확인하면 아래와 같은 형태입니다. base_xxx 파일과 delta_xxx 파일이 함께 존재합니다.

```shell
hive> dfs -ls -R /user/hive/warehouse/t;
drwxr-xr-x   - ekoifman staff          0 2016-06-09 17:03 /user/hive/warehouse/t/base_0000022
-rw-r--r--   1 ekoifman staff        602 2016-06-09 17:03 /user/hive/warehouse/t/base_0000022/bucket_00000
drwxr-xr-x   - ekoifman staff          0 2016-06-09 17:06 /user/hive/warehouse/t/delta_0000023_0000023_0000
-rw-r--r--   1 ekoifman staff        611 2016-06-09 17:06 /user/hive/warehouse/t/delta_0000023_0000023_0000/bucket_00000
drwxr-xr-x   - ekoifman staff          0 2016-06-09 17:07 /user/hive/warehouse/t/delta_0000024_0000024_0000
-rw-r--r--   1 ekoifman staff        610 2016-06-09 17:07 /user/hive/warehouse/t/delta_0000024_0000024_0000/bucket_00000
```

<br>

### 컴팩션(Compaction)

컴팩션은 **델타 파일(delta_xxx)을 정리하는 작업**입니다. 트랜잭션이 많아지면 델타 파일의 개수가 늘어나고 파일의 사이즈가 커지면서 **네임노드의 관리포인트가 늘어나**게 됩니다. 이 **부하를 줄이기 위해서 백그라운드 서비스로 컴팩션이 수행**됩니다.

**델타 파일이 많아지면 마이너 컴팩션**이 발생하여 **델타 파일을 하나로 합치고**, **델타 파일이 점점 커지면 메이저 컴팩션**이 발생하여 **베이스 파일의 내용을 수정**하게 됩니다. 컴팩션은 트랜잭션이 발생할 때 처리되지 않고, **주기적으로 수행되는 컴팩션 스케줄에 따라 맵리듀스 잡으로 실행**됩니다.

- 마이너 컴팩션(minor compaction) :델타 파일을 모아서 버켓당 하나의 델타 파일로 다시 생성
- 메이저 컴팩션(major compaction) : 베이스 파일과 델타 파일을 새로운 베이스 파일로 생성

<br>

### 베이스(Base) 파일과 디렉토리 구조

파티션이 적용되지 않은 t 라는 테이블을 생성하였을 때 HDFS를 확인하면 구조가 다음과 같습니다. base_ 파일이 기본 파일이고, delta_ 파일이 델타 파일입니다. 실제 데이터를 읽을 때 하이브는 base_ 파일의 내용에 delta_ 파일의 내용을 합쳐서 수정사항을 반영하여 반환하게 됩니다.

```shell
hive> dfs -ls -R /user/hive/warehouse/t;
drwxr-xr-x   - ekoifman staff          0 2016-06-09 17:03 /user/hive/warehouse/t/base_0000022
-rw-r--r--   1 ekoifman staff        602 2016-06-09 17:03 /user/hive/warehouse/t/base_0000022/bucket_00000
drwxr-xr-x   - ekoifman staff          0 2016-06-09 17:06 /user/hive/warehouse/t/delta_0000023_0000023_0000
-rw-r--r--   1 ekoifman staff        611 2016-06-09 17:06 /user/hive/warehouse/t/delta_0000023_0000023_0000/bucket_00000
drwxr-xr-x   - ekoifman staff          0 2016-06-09 17:07 /user/hive/warehouse/t/delta_0000024_0000024_0000
-rw-r--r--   1 ekoifman staff        610 2016-06-09 17:07 /user/hive/warehouse/t/delta_0000024_0000024_0000/bucket_00000
```

<br>

### 트랜잭션, 컴팩션 설정

트랜잭션은 `hive.txn.manager`과 `hive.support.concurrency`를 설정해야 합니다.

```shell
set hive.support.concurrency=true;
set hive.txn.manager=org.apache.hadoop.hive.ql.lockmgr.DbTxnManager;
```

컴팩션은 `hive.compactor.initiator.on`를 설정해야 합니다.

```shell
set hive.compactor.initiator.on=true;
set hive.compactor.worker.threads=3;
```

- [ConfigurationProperties-TransactionsandCompactor](https://cwiki.apache.org/confluence/display/Hive/Configuration+Properties#ConfigurationProperties-TransactionsandCompactor)



<br>

### 트랜잭션 테이블 생성

트랜잭션 테이블은 버켓팅을 설정해야 하고, 테이블 저장 타입을 ORC로 설정해야 합니다. 그리고 테이블 프로퍼티에 `"transactional"="true"`를 설정하면 됩니다.

```shell
CREATE TABLE table_name (
  id                int,
  name              string
)
CLUSTERED BY (id) INTO 2 BUCKETS STORED AS ORC
TBLPROPERTIES ("transactional"="true",
  "compactor.mapreduce.map.memory.mb"="2048",     -- specify compaction map job properties
  "compactorthreshold.hive.compactor.delta.num.threshold"="4",  -- trigger minor compaction if there are more than 4 delta directories
  "compactorthreshold.hive.compactor.delta.pct.threshold"="0.5" -- trigger major compaction if the ratio of size of delta files to
                                                                   -- size of base files is greater than 50%
);
```

<br>

### 테이블 컴팩션 설정

테이블 컴팩션 설정방법은 다음과 같습니다.

```shell
ALTER TABLE table_name COMPACT 'minor' 
   WITH OVERWRITE TBLPROPERTIES ("compactor.mapreduce.map.memory.mb"="3072");  -- specify compaction map job properties
ALTER TABLE table_name COMPACT 'major'
   WITH OVERWRITE TBLPROPERTIES ("tblprops.orc.compress.size"="8192");         -- change any other Hive table properties
```

<br>

### 트랜잭션 확인

트랜잭션 처리 상황은 다음의 명령으로 확인합니다.

```shell
hive> show transactions;
OK
Transaction ID  Transaction State   Started Time    Last Heartbeat Time User    Hostname
96  OPEN    1584422197000   1584422197000   hadoop  home
```

<br>

<br>

<br>

---

# 2. Lock

트랜잭션과 락은 동시성을 지원하는 장치입니다. 트랜잭션은 작업의 논리적인 단위입니다. **락은 트랜잭션을 처리할 때 테이블, 파티션에 접근을 제어하는 용도로 사용합니다.**

자세한 것은 [Hive-Locking](https://cwiki.apache.org/confluence/display/Hive/Locking) 을 참고하면 좋습니다.

<br>

### 락의 종류: 공유 잠금, 배타적 잠금

락은 Shared(S), Exclusive(X)가 있습니다. 데이터베이스에서 락은 공유 잠금(S)과 배타적 잠금(X)이 있습니다. **공유 잠금은 읽기 잠금(Read Lock)**이라고도 불립니다. 다른 트랜잭션에서 데이터를 읽으려고 할 때 다른 공유 잠금은 허용되지만, 배타적 잠금은 허용되지 않습니다.

**배타적 잠금은 쓰기 잠금(Write Lock)**이라고도 불립니다. **데이터를 변경(INSERT, UPDATE, DELETE)하려고 할 때 다른 트랜잭션에서 데이터를 읽거나 변경하지 못하게 배타적 잠금을 설정**합니다. 배타적 잠금이 걸리면 공유 잠금, 배타적 잠금을 설정할 수 없습니다.

<br>

### 락의 획득

락은 논파티션 테이블과 파티션 테이블에서 따로 동작합니다. **논파티션 테이블은 직관적**으로 동작합니다. **테이블을 읽을 때는 S잠금을 획득하고, 다른 작업에서는 X잠금을 획득합니다.**

**파티션 테이블**은 **읽을 때 테이블에 S잠금, 파티션에 S잠금을 획득**합니다. **다른 작업에서는 테이블에 S잠금, 파티션에 X잠금을 획득**합니다.

락을 획득하는 방법은 다음과 같습니다.

| Hive Command                                            | Locks Acquired                           |
| :------------------------------------------------------ | :--------------------------------------- |
| select .. T1 partition P1                               | S on T1, T1.P1                           |
| insert into T2(partition P2) select .. T1 partition P1  | S on T2, T1, T1.P1 and X on T2.P2        |
| insert into T2(partition P.Q) select .. T1 partition P1 | S on T2, T2.P, T1, T1.P1 and X on T2.P.Q |
| alter table T1 rename T2                                | X on T1                                  |
| alter table T1 add cols                                 | X on T1                                  |
| alter table T1 replace cols                             | X on T1                                  |
| alter table T1 change cols                              | X on T1                                  |
| alter table T1 concatenate                              | X on T1                                  |
| alter table T1 add partition P1                         | S on T1, X on T1.P1                      |
| alter table T1 drop partition P1                        | S on T1, X on T1.P1                      |
| alter table T1 touch partition P1                       | S on T1, X on T1.P1                      |
| alter table T1 set serdeproperties                      | S on T1                                  |
| alter table T1 set serializer                           | S on T1                                  |
| alter table T1 set file format                          | S on T1                                  |
| alter table T1 set tblproperties                        | X on T1                                  |
| alter table T1 partition P1 concatenate                 | X on T1.P1                               |
| drop table T1                                           | X on T1                                  |

<br>

### 락 확인

락을 확인하는 명령어입니다.

```shell
SHOW LOCKS <TABLE_NAME>;
SHOW LOCKS <TABLE_NAME> EXTENDED;
SHOW LOCKS <TABLE_NAME> PARTITION (<PARTITION_DESC>);
SHOW LOCKS <TABLE_NAME> PARTITION (<PARTITION_DESC>) EXTENDED;
```

하이브에서 락은 아래와 같이 확인합니다.

```shell
hive (default)>  show locks;
OK
Lock ID Database    Table   Partition   State   Blocked By  Type    Transaction ID  Last Heartbeat  Acquired At UseHostname Agent Info
406.1   default table_name  NULL    ACQUIRED                    SHARED_READ 96  0   1584422197000   hadoop  home    hadoop_20200317051637_e6f8965b-eb5d-4281-b60a-8dc7f499c7d5
Time taken: 0.014 seconds, Fetched: 2 row(s)
```







---

**Reference**

https://wikidocs.net/23571

https://wikidocs.net/73364