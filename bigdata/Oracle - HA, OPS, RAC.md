# Oracle - HA, OPS, RAC



#### 1. HA

HA(High Availability) : Storage에 저장된 데이터에 장애가 발생한 경우를 대비하여, **서버의 사용 가능시간을 최대한 늘리는 것을 목표로 한 서버 구성방법**

두 대의 서버를 동일하게 구성하여 1대는 Active, 1대는 Standby로 설정합니다. Active 서버가 장애가 발생할 경우, Standby 서버가 즉시 Active 역할을 대신하여 서비스 중단이 발생하지 않도록 조치합니다. 오라클에서는 Dataguard 가 HA 구성 방식입니다.

각 서버 별 Storage를 별도로 가지고 있기 때문에, Active와 Standby 간 데이터 불일치 현상(동기화 문제)이 발생하 수 있습니다.

<br>

#### 2. OPS

OPS(Oracle Parallel Serve) : 1개의 storage를 공유하는 여러 서버(instance) 방식으로 이루어져 있습니다. 따라서 부하가 분산되고, 서비스 속도도 빨라질 수 있습니다. Instance 1에서 장애가 발생할 경우 Instance 2를 통해 Storage에 접근 가능하기 때문에 서비스가 중단되는 경우를 방지하지 위해, 서비스 중단시간을 획기적으로 개선한 HA를 구현한 방식입니다.



문제점 > **"RAC Ping"**

​	instance1 에서 업데이트 된 데이터를 instance 2 에도 동기화를 시키려면, storage에 우선 저장 후 instance2로 가져와야 하는데, 디스크 입출력에 소모되는 시간이 많아 문제가 생깁니다.

<br>

#### 3. RAC

RAC(Oracle Real Application Clusters) : Instance 1과 Instance 2 사이에 Interconnect가 있는 구조로, Interconnect는 private 망으로 디스크를 거치지 않고 메모리의 데이터를 즉시 서로 교환합니다.

이 기능을 Cache Fusion이라고도 부릅니다. 오라클 RAC를 사용하면 여러 대의 컴퓨터가 동시에 한 대의 DBMS 서버에 접속하여 데이터를 이용할 수 있습니다. 이를 통해 DB 클러스터링을 구현할 수 있습니다.





---

**Reference**

https://12bme.tistory.com/322