# 하이브(Hive)

* 하이브
* 데이터베이스
* 테이블
* 함수
* 트랜잭션
* 성능최적화



## Hive

**구성요소**

* **UI**
  * 사용자가 쿼리, 기타 작업을 시스템에 제출하는 **사용자 인터페이스**
  * CLI, Beeline, JDBC 등
* **Driver**
  * **쿼리를 입력받고 작업을 처리**
  * 사용자 세션을 구현하고, JDBC/ODBC 인터페이스 API 제공
* **Compiler**
  * 메타 스토어를 참고하여 **쿼리 구문을 분석하고 실행계획 생성**
* **Metastore**
  * **DB, 테이블, 파티션의 정보를 저장**
* **Execution Engine**
  * **컴파일러에 의해 생성된 실행 계획을 실행**



![](https://wikidocs.net/images/page/23282/hive-hadoop-architecture.png)



**실행순서**

1) 사용자가 제출한 SQL문을 드라이버가 컴파일러에 요청하여 메타스토어의 정보를 이용해 처리에 적합한 형태로 컴파일

2) 컴파일된 SQL을 실행엔진으로 실행

3) 리소스매니저가 클러스터의 자원을 적절히 활용하여 실행

4) 실행 중 사용하는 원천데이터는 HDFS 등의 저장장치 이용

5) 실행결과를 사용자에게 반환



---

## 1-1 버전별 특징

하이브는 SQL을 하둡에서 사용하기 위한 프로젝트로 시작되었습니다. 페이스북에서 자사의 데이터 분석을 위해 개발하여 아파치 오픈소스 프로젝트로 넘어왔습니다.





### Hive 1.0

2012년 0.10 버전을 시작으로, 2015년 2월 1.0 버전이 발표 되었습니다.

<br>

#### 특징

- **SQL을 이용한 맵리듀스 처리**
- 파일 데이터의 논리적 표현
- 빅데이터의 배치 처리를 목표

<br><br>

### Hive 2.0

하이브 1.0을 개선하여 2016년 2월 2.0 버전이 발표 되었습니다. LLAP의 등장과 기본 실행엔진이 TEZ로 변경되어 성능이 향상되었습니다.

<br>

#### 특징

- **LLAP(Live Long and Process) 구조 추가**
- Spark 지원 강화
- CBO 강화
- HPLSQL 추가

<br>

#### LLAP

​	작업을 실행한 데몬을 계속 유지하여 **핫 데이터를 캐싱할 수 있어 빠른 속도로 데이터를 처리**할 수 있습니다. **LLAP는 작업을 도와주는 보조도구**입니다. 실제 작업을 처리하는 MR, TEZ 같은 작업 엔진이 아닙니다. 또한 HDFS같이 **데이터를 영구히 저장하지 않습니다.** 사용자가 작업 모드를 선택할 수 있으며, TEZ엔진에서만 사용할 수 있습니다.

![](https://cwiki.apache.org/confluence/download/attachments/62689557/LLAP_diagram.png?version=1&modificationDate=1474327021000&api=v2)



- [하이브 매뉴얼 LLAP](https://cwiki.apache.org/confluence/display/Hive/LLAP#LLAP-ExecutionEngine)

<br>

#### HPLSQL

오라클의 PL/SQL과 비슷한 Procedural SQL을 지원합니다. **재사용 가능한 스크립트 작성을 목표로 개발** 되었습니다. 아래와 같이 `FOR`를 이용한 루프문이나 커서등을 이용할 수 있습니다.

```
FOR i IN 1..10 LOOP
  DBMS_OUTPUT.PUT_LINE(i);
END LOOP
```

<br><br>

### Hive 3.0

2018년 5월 3.0 버전이 발표 되었습니다. 맵리듀스 엔진, 하이브 CLI를 제거하고 TEZ엔진과 비라인을 이용하여 작업을 처리하도록 수정되었습니다.

<br>

#### 특징

- **롤을 이용한 작업 상태 관리(workload management)**
- **트랜잭션 처리 강화**
- 구체화 뷰(Materialized View) 추가
- **쿼리 결과를 캐싱하여 더 빠른속도로 작업 가능**
- 테이블 정보 관리 데이터베이스 추가



### workload 관리

**롤, 권한을 이용한 작업 상태 관리 기능이 추가** 되었습니다. SQL을 이용하여 워크로드 관리를 위한 롤을 생성하고 이를 적용하여 작업의 부하에 따라 쿼리의 성능, 실행 여부를 제어할 수 있습니다.

```
CREATE RESOURCE PLAN daytime;
```

<br>

#### Materialized View

**실제 데이터를 가지는 구체화 뷰(Materialized View) 기능이 추가** 되었습니다. 집계 데이터를 개별적으로 보관하여 쿼리 수행시 빠른 속도로 데이터를 검색할 수 있습니다.

```
CREATE MATERIALIZED VIEW mv1
AS
SELECT empid, deptname, hire_date
FROM emps JOIN depts
  ON (emps.deptno = depts.deptno)
WHERE hire_date >= '2016-01-01';
```

- [하이브 구체화 뷰 메뉴얼](https://cwiki.apache.org/confluence/display/Hive/Materialized+views)



<br>

<br>

## 테이블 정보 데이터베이스 추가

기존에는 하이브메타스토어에만 확인할 수 있던 정보를 **데이터 베이스를 통해서 확인이 가능하**게 되었습니다. 전체 테이블의 칼럼 정보, 통계정보 등을 확인할 수 있고 커넥터를 이용해서 사용자가 직접 접근하여 확인할 수 도 있습니다.

```
use information_schema;

use sys;
```

<br>

<br>

<br>

---

## 2 하이브 서비스







---

**Reference**

https://wikidocs.net/23282

하이브2, 하이브3의 새 기능에 대한 상세한 참고 자료들입니다. 아래의 발표 자료들을 확인해 보시기 바랍니다.

- 하이브2의 10가지 새기능 ([바로가기](https://bigdata-madesimple.com/10-new-exciting-features-in-apache-hive-2-0-0/))
- 하이브2 - SQL, Speed, Scale ([바로가기](https://www.slideshare.net/hortonworks/apache-hive-20-sql-speed-scale-62359247))

- 하이브3의 새기능 ([바로가기](https://www.slideshare.net/Hadoop_Summit/whats-new-in-apache-hive-108051450))
- 하이브3 - New Horizon([바로가기](https://www.slideshare.net/thejasmn/hive-3-a-new-horizon-121226317))
- 하이브3의 새기능 소개 ([바로가기](https://docs.hortonworks.com/HDPDocuments/HDP3/HDP-3.1.0/hive-overview/content/hive_whats_new_in_this_release_hive.html))