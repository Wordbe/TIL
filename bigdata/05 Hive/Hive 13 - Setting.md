# Hive 13 - Setting



## 1. 기본설정값

하이브 쿼리 실행을 위한 기본 설정값입니다. **실행엔진 선택, 메모리 설정, 매퍼 리듀서 개수 선택**을 위한 설정입니다.

```shell
-- 하이브 실행 엔진 설정 
set hive.execution.engine=tez;
set tez.queue.name=q2;

-- TEZ AM 메모리 설정 
set tez.am.resource.memory.mb=2048;
set tez.am.java.opts=-Xmx1600m;

-- TEZ 컨테이너 메모리 설정 
set hive.tez.container.size=2048;
set hive.tez.java.opts=-Xmx1600m;

-- 테즈 엔진의 매퍼 개수 설정 
-- 매퍼는 256MB에 하나씩 생성 
set tez.grouping.max-size=256000000;
set tez.grouping.min-size=128000000;

-- 테즈 엔진의 리듀서 개수 설정 
-- 128MB에 하나씩 생성 
set mapred.reduce.tasks=-1;
set hive.exec.reducers.bytes.per.reducer=128000000;

-- 리듀서 10개 고정 
set mapred.reduce.tasks=10;

-- 다이나믹 파티션 설정 
set hive.exec.dynamic.partition.mode=nonstrict;
```

<br>

## 2. 실행엔진, 큐 설정

하이브는 버전에 따라 mr, tez, spark 실행엔진을 지원합니다. 각 엔진에 따라 YARN 큐 설정은 다음과 같습니다.

```shell
-- 실행 엔진 설정 
set hive.execution.engine=mr;
set hive.execution.engine=tez;
set hive.execution.engine=spark;

-- 실행 엔진별 커패시티 스케줄러의 큐 이름 설정 
set mapred.job.queue.name=queueName;
set tez.queue.name=queueName;
set spark.job.queue.name=queueName;
```

<br>

## 3. MR 설정

![mr](https://msdnshared.blob.core.windows.net/media/MSDNBlogsFS/prod.evol.blogs.msdn.com/CommunityServer.Blogs.Components.WeblogFiles/00/00/01/66/50/7652.HadoopConfigurations_mr.png)

**MR 엔진의 애플리케이션 마스터, 매퍼, 리듀서 메모리 설정**은 다음과 같습니다.

```shell
-- 맵리듀스 애플리케이션 마스터의 메모리 설정 
set yarn.app.mapreduce.am.resource.mb=2048;  
set yarn.app.mapreduce.am.command-opts=-Xmx1600m;

-- 매퍼의 메모리 설정 
set mapreduce.map.memory.mb=2048;  
set mapreduce.map.java.opts=-Xmx1600m;

-- 리듀서의 메모리 설정 
set mapreduce.reduce.memory.mb=2048;  
set mapreduce.reduce.java.opts=-Xmx1600m;
```

<br>

## 4. TEZ 설정

![tez](https://docs.microsoft.com/ja-jp/azure/hdinsight/media/hdinsight-hadoop-hive-out-of-memory-error-oom/hive-out-of-memory-error-oom-tez-container-memory.png)

**TEZ 엔진의 애플리케이션 마스터, 컨테이너 메모리 설정은 다음과 같습니다.**

```shell
-- TEZ잡을 실행하는 애플리케이션 마스터의 메모리 설정은 다음과 같다. 
set tez.am.resource.memory.mb=2048;  
set tez.am.java.opts=-Xmx1600m;

-- TEZ엔진을 처리하는 컨테이너의 메모리 설정은 다음과 같다. 
set hive.tez.container.size=2048;  
set hive.tez.java.opts=-Xmx1600m;  // container의 80%

-- 출력결과를 소팅해야 할 때 사용하는 메모리 
set tez.runtime.io.sort.mb=800;   // container의 40%

-- 맵조인에 사용하는 메모리 
set hive.auto.convert.join.noconditionaltask.size=600;  // container의 33%
```

<br>

### 5. TEZ 엔진 실행 결과 출력

TEZ 엔진으로 작업을 처리한 후 결과에 대한 리포트를 출력하기 위한 설정값입니다. MR, Spark 엔진에서는 동작하지 않습니다.

```shell
set hive.tez.exec.print.summary=true;
```

<br>

### 6. 매퍼 설정

매퍼와 리듀서의 개수는 실행시간에 직접적인 영향을 주게 됩니다. 따라서 입력되는 데이터의 사이즈에 따라 개수를 조절해 주면 성능을 빠르게 할 수 있습니다.

<br>

#### 데이터 사이즈에 따른 매퍼 개수 설정

매퍼는 입력데이터의 사이즈가 1GB 일때 최대 매퍼 사이즈가 256MB이면 매퍼는 4개 생성되어 작업을 처리합니다.

```shell
-- MR 엔진의 매퍼당 최대 처리 사이즈 
set mapreduce.input.fileinputformat.split.maxsize=268435456;
set mapreduce.input.fileinputformat.split.minsize=134217728;

-- TEZ 엔진의 매퍼당 최대 처리 사이즈 
set tez.grouping.max-size=268435456;
set tez.grouping.min-size=134217728;
```

<br>

#### 매퍼 개수 고정

매퍼 only 잡에서 최종 생성되는 파일의 개수를 설정하거나 리소스의 효율적인 사용을 이유로 매퍼의 개수를 고정해야 할때는 다음의 설정을 이용합니다.

```shell
-- MR 엔진의 매퍼 개수 설정
set mapreduce.job.maps=1;

-- TEZ 엔진의 매퍼 개수 설정 
set tez.grouping.split-count=1;
```

<br>

### 7. 리듀서 설정

리듀서는 입력 사이즈가 1GB일때 최대 처리 사이즈가 256MB이면 리듀서 4개를 이용하여 데이터를 처리합니다. 최대 리듀서 사용개수나 리듀서 사용개수를 이용하여 리듀서의 개수를 지정할 수 있습니다. 리듀서 개수 설정 순서는 다음과 같습니다.

- 리듀서별 최대 처리 사이즈 > 최대 리듀서 사용개수 > 리듀서 사용개수

```shell
-- 리듀서 사용 개수 지정
set mapreduce.job.reduces=100;
-- 최대 리듀서 사용개수 
set hive.exec.reducers.max=100;
-- 리듀서별 최대 처리 사이즈 
set hive.exec.reducers.bytes.per.reducer=268435456;
```

<br>

### 8. 압축 설정

하이브 처리 결과를 압축하는 설정을 이용해 네트워크 통신량과 저장 용량의 이점을 가질 수 있습니다.

```shell
-- 하이브 처리 결과를 압축할 것인지 설정 
set hive.exec.compress.output=true;
set hive.exec.compress.intermediate=true;
set mapreduce.output.fileoutputformat.compress.codec=org.apache.hadoop.io.compress.SnappyCodec;
```

<br>

### 9.파일 머지 설정

HDFS는 작은 사이즈의 파일이 많으면 성능에 좋지 않습니다. 하이브는 처리 결과를 머지하는 기능을 제공합니다. avgsize 이하의 파일을 모아서 task 사이즈의 파일로 머지하여 줍니다.

작은 사이즈의 파일을 많이 생성하는 경우 머지를 사용하면 머지작업에 시간이 매우 많이 걸릴수 있습니다. 따라서 사용에 주의하시기 바랍니다.

```shell
set hive.merge.mapfiles=true;   // 매퍼 only 결과 머지
set hive.merge.mapredfiles=true;    // 맵리듀스 결과 머지 
set hive.merge.tezfiles=true;       // tez 결과 머지 
set hive.merge.size.per.task=256000000;
set hive.merge.smallfiles.avgsize=32000000;
```

---

### 10. 임시 파일 위치 설정

하이브 실행중 발생하는 임시 파일의 위치 설정은 다음과 같습니다.

```shell
set hive.exec.scratchdir=/tmp;
set hive.exec.local.scratchdir=/tmp;
set hive.exec.stagingdir=/tmp/hive-staging;
```

<br>



### 11. 다이나믹 파티션 설정

하이브의 다이나믹 파티션 설정은 다음과 같습니다.

```shell
set hive.exec.dynamic.partition=true;   -- 다이나믹 파티션 사용 여부 설정
set hive.exec.dynamic.partition.mode=nonstrict; -- 스태틱 파티션과의 혼합 사용 여부 
set hive.exec.max.dynamic.partitions.pernode=500;   -- 노드별 다이나믹 파티션 개수 설정 
set hive.exec.max.dynamic.partitions=10000;     -- 전체 다이나믹 파티션 개수 설정
```

<b>

### 12. MSCK 처리 설정

MSCK 처리를 위한 데이터가 많을 경우 배치 사이즈를 조정해서 한번에 처리할 데이터의 양을 줄여서 하이브의 부하를 줄여주는 것이 좋습니다.

```shell
-- 0으로 설정하면 모든 파티션을 복구한다. 설정한 값 만큼처리 
set hive.msck.repair.batch.size=0;
-- 파티션에 허용되지 않는 문자가 있으면 오류가 발생하는데, ignore 로 설정하면 무시하고 넘어간다. 
set hive.msck.path.validation=ignore;
```

<br>

### 13. 하위 디렉토리 조회 설정

테이블 LOCATION의 데이터와 하위에 위치한 모든 데이터를 조회해야 한다면 다음을 설정합니다.

```shell
set hive.supports.subdirectories=true;
set mapred.input.dir.recursive=true;
```

<br>

### 14 쿼리 오류 무시 설정

하이브는 hql 파일을 이용하여 쿼리를 수행하는 중 오류가 발생하면 쿼리 수행을 종료하고, `cli` 도 동작을 종료하게 됩니다. 이때 오류가 발생해도 무시하고 다음 쿼리를 수행하게 하는 옵션은 다음과 같습니다.

```shell
set hive.cli.errors.ignore=true;
```

<br>

### 15. 프롬프트에 데이터베이스명 표시

하이브 프롬프트에 현재 사용중인 데이터베이스 명을 표시하게 하면 사용자 오류에 의한 실수를 사전에 방지할 수 있습니다.

```shell
set hive.cli.print.current.db=true
```

<br>

## 16. 조회 결과 출력시에 칼럼이름 출력

데이터 조회 결과를 출력할 때 칼럼이름을 함께 출력하는 옵션은 다음과 같습니다.

```shell
set hive.cli.print.header=true;
```

<br>

### 17. 쿼리 조회 모드 설정

테이블 풀 스캔과 `msck repair` 처리시 경우에 따라 `nonstrict` 모드에서만 동작 할 경우가 있습니다. 이때는 다음의 옵션을 이용합니다.

```shell
set hive.mapred.mode=strict | nonstrict;
```





---

**Reference**

https://wikidocs.net/23573