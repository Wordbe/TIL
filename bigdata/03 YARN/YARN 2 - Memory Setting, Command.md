# YARN 2 - Memory Setting, Command

**메모리**는 `yarn-site.xml` 에서 설정을 변경할 수 있습니다. 노드매니저의 메모리, CPU개수, 컨테이너에 할당 할 수 있는 최대, 최소 메모리 등을 설정할 수 있습니다. 기본값은 [yarn-default.xml](https://hadoop.apache.org/docs/r2.7.2/hadoop-yarn/hadoop-yarn-common/yarn-default.xml) 에 있습니다.



### 리소스 매니저 설정

- yarn.nodemanager.resource.memory-mb
  - 클러스터의 각 노드에서 컨테이너 운영에 설정할 수 있는 메모리의 총량
  - 노드의 OS를 운영할 메모리를 제외하고 설정
  - 노드의 메모리가 32G인경우 운영체제를 위한 4G를 제외하고 28G를 설정
- yarn.nodemanager.resource.cpu-vcores
  - 클러스터의 각 노드에서 컨테이너 운영에 설정할 수 있는 CPU의 개수
- yarn.scheduler.maximum-allocation-mb
  - 하나의 컨테이너에 할당할 수 있는 메모리의 최대값
  - 8G가 기본 값
- yarn.scheduler.minimum-allocation-mb
  - 하나의 컨테이너에 할당할 수 있는 메모리의 최소값
  - 1G가 기본값
- yarn.nodemanager.vmem-pmem-ratio
  - 실제 메모리 대비 가상 메모리 사용 비율
  - mapreduce.map.memory.mb * 설정값의 비율로 사용 가능
  - 메모리를 1G로 설정하고, 이 값을 10으로 설정하면 가상메모리를 10G 사용
- yarn.nodemanager.vmem-check-enabled
  - 가상 메모리에 대한 제한이 있는지 확인하여, true 일 경우 메모리 사용량을 넘어서면 컨테이너를 종료
  - false 로 설정하여 가상메모리는 메모리 사용량 넘어서도 컨테이너 종료하지 x
- yarn.nodemanager.pmem-check-enabled
  - 물리 메모리에 대한 제한이 있는지 확인하여, true 일 경우 메모리 사용량을 넘어서면 컨테이너를 종료

```xml
  <property>
    <name>yarn.nodemanager.resource.memory-mb</name>
    <value>28672</value>
  </property>
  <property>
    <name>yarn.nodemanager.resource.cpu-vcores</name>
    <value>8</value>
  </property>
  <property>
    <name>yarn.scheduler.maximum-allocation-mb</name>
    <value>8192</value>
  </property>
  <property>
    <name>yarn.scheduler.minimum-allocation-mb</name>
    <value>1024</value>
  </property>
  <property>
    <name>yarn.nodemanager.vmem-pmem-ratio</name>
    <value>2.1</value>
  </property>
  <property>
    <name>yarn.nodemanager.pmem-check-enabled</name>
    <value>true</value>
  </property>
  <property>
    <name>yarn.nodemanager.vmem-check-enabled</name>
    <value>false</value>
  </property>
```





---

# 3 YARN Command(명령어)

사용자 커맨드, 운영자 커맨드로 구분됩니다.

[YARN Commands Guide](https://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YarnCommands.html) 참고



### 사용자 커맨드

사용자 커맨드 목록은 다음과 같습니다. 주요 옵션인 `application` 과 `logs` 입니다.





### 사용자 커맨드 목록

| 명령어             | 설명                              |
| :----------------- | :-------------------------------- |
| application        | 애플리케이션 정보 확인, 작업 종료 |
| applicationattempt | 애플리케이션 Attempt 정보         |
| classpath          | 필요한 클래스 정보                |
| container          | 컨테이너 정보                     |
| jar                | jar 파일 실행                     |
| logs               | 애플리케이션 로그 확인            |
| node               | 노드 정보                         |
| queue              | 큐 정보                           |
| version            | 버전 정보                         |
| envvars            | 환경 변수 정보                    |



### 1) application 커맨드

application 커맨드는 애플리케이션의 정보를 확인하고, 작업을 종료할 수 있습니다. 주요 커맨드는 다음과 같습니다.



#### 작업 목록 확인

`-list` 옵션을 이용해서 현재 작업중인 작업 목록을 확인할 수 있습니다. 작업상태, 진행상황, 작업큐, 트래킹 URL 정보를 확인할 수 있습니다.

```
$ yarn application -list 
Total number of applications (application-types: [] and states: [SUBMITTED, ACCEPTED, RUNNING]):19
                Application-Id      Application-Name        Application-Type          User       Queue               State         Final-State         Progress                        Tracking-URL
application_1536937158836_712399    OOZIE-launcher              MAPREDUCE        hadoop          q1             RUNNING           UNDEFINED                95%   http://host:43902
application_1536937158836_712407    HIVE-ID                     TEZ              hadoop          q2             RUNNING           UNDEFINED             67.77%   http://host:33535/ui/
```

<br>

#### 작업 상태 확인

작업 목록에서 확인한 작업 ID(Application-Id)를 이용하여 현재 작업 상태를 확인할 수 있습니다.

```
$ yarn application -status application_1234_1
Application Report : 
    Application-Id : application_1234_1
    Application-Name : HIVE-name
    Application-Type : MAPREDUCE
    User : hadoop
    Queue : prd
    Start-Time : 1560327373054
    Finish-Time : 0
    Progress : 95%
    State : RUNNING
    Final-State : UNDEFINED
    Tracking-URL : http://host:43902
    RPC Port : 43360
    AM Host : host
    Aggregate Resource Allocation : 2459450 MB-seconds, 960 vcore-seconds
    Diagnostics : 
```

<br>



#### 작업 종료

`-kill` 옵션을 이용해서 작업을 강제로 종료할 수 있습니다. 작업 목록에서 확인한 애플리케이션 아이디나 잡아이디를 이용하면 됩니다.

```
$ yarn application -kill <application_id>
```



### 2) applicationattempt 커맨드

애플리케이션의 현재 시도(attempt) 정보를 확인할 수 있습니다. 애플리케이션은 설정에 따라 오류가 발생하면 자동으로 재작업하기 때문에 관련된 정보를 확인할 수 있습니다.

```
$ yarn applicationattempt -list application_1234_1
Total number of application attempts :1
         ApplicationAttempt-Id                 State                        AM-Container-Id                        Tracking-URL
appattempt_1234_1_000001                     RUNNING                     container_1234_1_01_000001    http://host:20888/proxy/application_1234_1/
```



<br>

### 3) container 커맨드

**현재 애플리케이션이 동작중인 컨테이너의 정보**를 확인할 수 있습니다. Attempt ID(ApplicationAttempt-Id)를 이용하여 정보를 확인합니다.

```
$ yarn container -list appattempt_1234_1_000001
Total number of containers :94
                  Container-Id            Start Time             Finish Time                   State                    Host       Node Http Address                                LOG-URL
container_1234_1_01_138704    Wed Jun 12 08:40:17 +0000 2019                   N/A                 RUNNING    host-1:8041    http://host-1:8042 http://host-1:8042/node/containerlogs/container_1234_1_01_138704/hadoop
container_1234_1_01_138638    Wed Jun 12 08:40:02 +0000 2019                   N/A                 RUNNING    host-2:8041    http://host-2:8042 http://host-2:8042/node/containerlogs/container_1234_1_01_138638/hadoop
```



### 4) logs 커맨드

logs 커맨드는 **작업이 종료된 잡의 로그를 확인**하는 명령입니다. 작업중인 잡의 로그는 히스토리 서버에 저장되기 전이라서 확인할 수 없습니다. 작업중인 잡은 작업목록에서 확인한 트래킹 URL에 접속해서 확인하면 됩니다. CLI 환경이라면 `lynx` 커맨드를 이용하면 되고, 웹으로 접속해서 확인할 수 있습니다.

```
$ yarn logs -applicationId <application_id>
```



<br>

---

# 운영자 커맨드

주요 옵션인 `rmadmin` 입니다.



### 운영자 커맨드 목록

| 명령어             | 설명                                    |
| :----------------- | :-------------------------------------- |
| daemonlog          | 로그 레벨 설정                          |
| nodemanager        | 노드매니저 실행                         |
| proxyserver        | 프록시 서버 실행                        |
| resourcemanager    | 리소스매니저 실행                       |
| rmadmin            | 리소스매니저 어드민 클라이언트 명령     |
| schedulerconf      | 스케쥴러 설정 업데이트                  |
| scmadmin           | 공유 캐쉬 매니저 어드민 클라이언트 명령 |
| sharedcachemanager | 공유 캐쉬 매니저 실행                   |
| timelineserver     | 타임라인 서버 실행                      |



### rmadmin

rmadmin 옵션을 이용해서 **리소스매니저에 동록된 큐와 노드 정보를 갱신**할 수 있습니다.

#### 큐정보 갱신

커패시티 스케줄러 설정(capacity-scheduler.xml)을 다시 읽어서 정보를 갱신합니다.

```
$ yarn rmadmin -refreshQueues
```





---

**Reference**

https://wikidocs.net/27332

https://wikidocs.net/27357#fn:1