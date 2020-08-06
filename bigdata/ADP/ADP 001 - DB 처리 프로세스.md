

# DB 처리 프로세스

##  01 ETL

## 02 CDC

## 03 EAI

Enterprise Application Integration, 기업 애플리케이션 통합

### 1) Point to Point

### 2) Hub and Spoke

Point2point 방식은 비효율적이므로, Hub and Spoke 방식을 적용한다.

* 버스(BUS) : 허브와 app 간 연결성 확보
* 브로커(허브) : 데이터 연동 규칙을 통제
* 트랜스포머(Transformer) : 데이터 형식의 변환

### 3) EAI 구현 유형

* Mediation(Infra-communication) : EAI 엔진이 브로커로 동작. Publish/Subscribe pattern(model)
* Federation(Inter-comm.) : EAI 엔진이 외부(고객, 파트너) 정보시스템으로부터의 데이터 요청을 일괄적으로 수령하여 필요한 데이터를 전다한다. Request/Reply pattern(model)



---

## 04 데이터 연계, 통합 기법

### 1 동기화 기준

| 일괄(Batch) 통합   | 비동기식 실시간(Near Real Time) 통합 | 동기식 실시간(Real Time) 통합                          |
| ------------------ | ------------------------------------ | ------------------------------------------------------ |
| 대용량 데이터      | 중간용량                             | 목표 시스템 데이터 처리 가능할 시에만 원천 데이터 획득 |
| CDC                | CDC                                  |                                                        |
| 데이터 재처리 허용 | 데이터 재처리 허용                   | 데이터 재처리 불가                                     |
| 점대점 데이터 연계 | 다수 데이터 원천 및 목표시스템       | 단일 또는 다수 데이터 원천                             |



---

## 05 대용량 비정형 데이터 처리

### 1 대용량 로그 데이터 수집

#### 1) 대용량 비정형 데이터 수집 시스템 특징

* 초고속 수집 성능과 확장성
* 데이터 전송 보장 메커니즘
* 다양한 수집과 저장 플러그인
* 인터페이스 상속을 통한 애플리케이션 기능 확장



### 2 대규모 분산 병렬 처리

#### 1) 하둡 역사

구글, 2005 : GFS(Google File System) + MapReduce

#### 2) 하둡 등장 배경

RDBMS 의 한계 극복

#### 3) 하둡 특징

* 선형적 성능과 용량 확장
* 고장 감내성 (Fault tolerance) : 3중 복제되어 각각 물리서버에 저장
* 핵심 비즈니스 로직에 집중 : 자동 복구 기능이 있음.
* 풍부한 에코시스템 형성



### 3 데이터 연동

Sqoop 등 (java)

### 4 대용량 질의 기술

* 하둡 안 데이터를 다룰 때 Hive가 제공하는 HiveQL 이용
* SQL on Hadoop : HDFS 에 저장된 데이터에 대한 SQL 질의 처리 제공 시스템 : Hive, Tajo, Impala



