# YARN

YARN(Yet Another Resource Nagotiator)은 하둡2에서 도입한 클러스터 리소스 관리, 애플리케이션 라이프 사이클 관리를 위한 아키텍처입니다.



잡트래커 한 대가 클러스터의 모든 노드와 모든 애플리케이션을 관리해야 했기 때문에, 잡트래커는 많은 메모리를 할당 해야 했고, 최대 4천 대의 노드까지 관리할 수 있었습니다.

잡트래커는 슬롯 단위로 리소스를 관리하여 자원을 효율적으로 관리하지 못했었습니다. 슬롯 단위 리소스 구성 :

* 클러스터의 메모리
* CPU 자원

예를 들어 100GB의 메모리를 가지는 클러스터를 1G로 구분하여 100개의 슬롯을 만들고, 60개의 맵 슬롯, 40개의 리듀서 슬롯으로 구분합니다. 맵 슬롯이 동작하는 동안에는 리듀서 슬롯은 대기해게 됩니다.

* 또한 잡 트래커의 애플리케이션은 맵리듀스 작업만 처리할 수 있어 유연성이 부족합니다.
* 맵리듀스 API 를 구현한 작업만 처리할 수 있기 때문에 SQL 기반 처리나 인메모리 기반 작업의 처리는 어렵습니다.



## YARN 구성

* 자원 관리 : 리소스 매니저, 노드매니저
* 애플리케이션 사이클 관리 : 애플리케이션 마스터, 컨테이너

> YARN은 잡트래커의 기능을 분리하였습니다.



## 자원관리

클러스터 자원 관리는 ResourceManager 와 NodeManager를 이용하여 처리합니다.

**노드 매니저**는 클러스터의 각 노드마다 실행됩니다. 현 노드에서 자원 상태를 관리하고, 리소스매니저에서 현 자원 상태를 보고합니다.

**리소스 매니저**는 노드매니저로부터 전달받은 정보를 통해 클러스터 전체의 자원을 관리합니다. 자원 사용 상태를 모니터링하고 애플리케이션 마스터에서 자원을 요청하면 비어 있는 자원을 할당해줍니다. **스케쥴러**는 설정된 규칙에 따라 자원을 효율적으로 분배합니다.



![](http://bigdataanalyticsnews.com/wp-content/uploads/2014/09/Yarn-Architecture.png)





---

## 라이프사이클 관리

Application Lifecycle 관리는 Application Master 와 Container 에서 처리합니다.



1) **클라이언트**가 리소스 매니저에 애플리케이션을 제출하면, 

2) **리소스매니저**는 비어 있는 노드에서 **애플리케이션 마스터**를 실행합니다.

3) 애플리케이션 마스터는 작업 실행을 위한 자원을 리소스매니저에게 요청하고, 자원을 할당 받아 각 노드의 **컨테이너**를 실행합니다. (컨테이너는 작업이 실행되는 단위입니다.)

4) 컨테이너에서 작업이 종료되면 결과를 애플리케이션 마스터에게 알리고, 애플리케이션 마스터는 모든 작업이 종료되면 리소스매니저에게 알리고 자원을 해제합니다.



![](https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901687/images/hddg_0402.png)



---

## 다양한 애플리케이션

YARN 에서는 맵리듀스 API 로 구현된 프로그램 외에도 다양한 애플리케이션 실행이 가능합니다. 맵리듀스, Pig, Storm, Spark 등 하둡 에코시스템의 다양한 데이터 처리 기술을 이용할 수 있습니다.

![](https://2xbbhjxc6wk3v21p62t8n4d4-wpengine.netdna-ssl.com/wp-content/uploads/2014/07/data.png)



YARN 은 기능을 분리하여 1만 대 이상의 클러스터로 확장할 수 있습니다.



---

# 1 YARN Scheduler

리소스 매니저는 클러스터 자원을 관리하고, 애플리케이션 마스터의 요청을 받아 자원을 할당합니다. 자원 할당 시 사용 정책을 스케줄러라 합니다. 하둡에서 제공하는 스케줄러는 아래와 같습니다.

**1) FIFO Scheduler**

​	먼저 들어온 작업이 먼저 처리됩니다. 먼저 들어온 작업이 종료될 때까지 다음 작업은 대기합니다. 비효율적이므로 테스트 목적으로 주로 사용합니다.

**2) Fair Scheduler**

​	제출 된 작업이 동등하게 리소스를 점유합니다. 작업 큐에 작업이 제출되면 클러스터는 자원을 조절하여 작업에 균등하게 자원을 할당해 줍니다.

**3) Capacity Schduler**

​	하둡 2의 기본 스케줄러 입니다. 트리 형태로 큐를 선언하고, 각 큐 별로 자원 용량을 정해주며 자원을 할당해줍니다.



![](https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901687/images/hddg_0403.png)



### 스케줄러 설정

yarn-site.xml 파일에서 설정합니다. `yarn.resourcemanager.scheduler.class`에 다음의 클래스명을 적어주면 됩니다.

| 스케줄러          | 클래스명                                                     |
| :---------------- | :----------------------------------------------------------- |
| FIFO 스케줄러     | org.apache.hadoop.yarn.server.resourcemanager.scheduler.fifo.FifoScheduler |
| Fair 스케줄러     | org.apache.hadoop.yarn.server.resourcemanager.scheduler.fair.FairScheduler |
| Capacity 스케줄러 | org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler |

<br>

**설정 방법**

```xml
<property>
 <name>yarn.resourcemanager.scheduler.class</name>
 <value>org.apache.hadoop.yarn.server.resourcemanager.scheduler.capacity.CapacityScheduler</value>
</property>
```







<br>

---

## 1-1 Capacity Scheduler

커패시티 스케줄러는 트리 형태로 계층화된 큐를 선언하고, 큐별로 사용가능한 용량을 할당하여 자원을 관리합니다. 클러스터 자원에 여유가 있다면, 각 큐에 설정된 용량 이상의 자원을 이용하게 할 수도 있고, 운영 중에도 큐를 추가할 수 있는 유연성도 가지고 있습니다.



### 1) 스케줄러 설정 값

| 설정값                                                       | 비고                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| yarn.scheduler.capacity.maximum-applications                 | PRE, RUNNIG 상태로 설정 될 수 있는 최대 애플리케이션의 개수  |
| yarn.scheduler.capacity.maximum-am-resource-percent          | 애플리케이션 마스터(AM)에 할당 가능한 최대 비율. AM은 실제 작업이 돌지 않고 작업을 관리하는 역활을 하기 때문에 작업에 많은 컨테이너를 할당하기 위해 이 값을 적당히 조절해야 함 |
| yarn.scheduler.capacity.root.queues                          | root 큐에 등록하는 큐의 이름. root큐는 하위에 동록할 큐를 위해 논리적으로만 존재 |
| yarn.scheduler.capacity.root.[큐이름].maximum-am-resource-percent | 큐에서 AM이 사용할 수 있는 자원의 비율                       |
| yarn.scheduler.capacity.root.[큐이름].capacity               | 큐의 용량 비율                                               |
| yarn.scheduler.capacity.root.[큐이름].user-limit-factor      | 큐에 설정된 용량 * limit-factor 만큼 다른 큐의 용량을 사용할 수 있음. 클러스터의 자원을 효율적으로 사용할 수 있음. maxmimum-capacity 이상으로는 이용할 수 없음. |
| yarn.scheduler.capacity.root.[큐이름].maximum-capacity       | 큐가 최대로 사용할 수 있는 용량                              |



#### capacity-scheduler.xml 주요 설정

```
<configuration>

    <property>
        <name>yarn.scheduler.capacity.maximum-applications</name>
        <value>10000</value>
    </property>

    <property>
        <name>yarn.scheduler.capacity.maximum-am-resource-percent</name>
        <value>0.1</value>
        <description>
            애플리케이션 마스터에 할당 가능한 최대 비율.
        </description>
    </property>

    <property>
        <name>yarn.scheduler.capacity.resource-calculator</name>
        <value>org.apache.hadoop.yarn.util.resource.DefaultResourceCalculator</value>
    </property>

    <property>
        <name>yarn.scheduler.capacity.root.queues</name>
        <value>prd,stg</value>
        <description>
            The queues at the this level (root is the root queue).
        </description>
    </property>

    <!-- capacity -->
    <property>
        <name>yarn.scheduler.capacity.root.prd.capacity</name>
        <value>80</value>
    </property>

    <property>
        <name>yarn.scheduler.capacity.root.stg.capacity</name>
        <value>20</value>
    </property>

    <!-- user-limit-factor -->
    <property>
        <name>yarn.scheduler.capacity.root.prd.user-limit-factor</name>
        <value>1</value>
    </property>

    <property>
        <name>yarn.scheduler.capacity.root.stg.user-limit-factor</user-limit-factor</name>
        <value>2</value>
    </property>

    <!-- maximum-capacity -->
    <property>
        <name>yarn.scheduler.capacity.root.prd.maximum-capacity</name>
        <value>100</value>
    </property>

    <property>
        <name>yarn.scheduler.capacity.root.stg.maximum-capacity</name>
        <value>30</value>
    </property>

</configuration>
```



---

### 2) Scheduler 설정

계층 구조로 큐를 설정하는 예제입니다. prod, dev, eng, sicence 큐가 있습니다.



## 큐의 계층 구조

- root
  - prod[capacity:40%, max:100%]
  - dev[capacity:60%, max:75%]
    - eng[capacity:50%]
    - science[capacity:50%]



## capacity-scheduler.xml 설정

큐별 설정값을 지정할 때는 xml의 `name`에 큐의 계층 형태로 설정할 큐 이름을 지정해야 합니다.

```
<?xml version="1.0"?>
<configuration>
  <property>
    <name>yarn.scheduler.capacity.root.queues</name>
    <value>prod,dev</value>
  </property>
  <property>
    <name>yarn.scheduler.capacity.root.dev.queues</name>
    <value>eng,science</value>
  </property>
  <property>
    <name>yarn.scheduler.capacity.root.prod.capacity</name>
    <value>40</value>
  </property>
  <property>
    <name>yarn.scheduler.capacity.root.dev.capacity</name>
    <value>60</value>
  </property>
  <property>
    <name>yarn.scheduler.capacity.root.dev.maximum-capacity</name>
    <value>75</value>
  </property>
  <property>
    <name>yarn.scheduler.capacity.root.dev.eng.capacity</name>
    <value>50</value>
  </property>
  <property>
    <name>yarn.scheduler.capacity.root.dev.science.capacity</name>
    <value>50</value>
  </property>
</configuration>
```



---

# 스케줄러 설정 확인

설정된 큐의 목록과 현재 사용중인 용량을 확인하는 명령어는 다음과 같습니다. 위의 예제에 설정된 정보는 다음과 같이 출력됩니다.

```
# Capacity: 설정된 용량
# MaximumCapacity: 최대 사용할 수 있는 용량, 기본값 100
# CurrentCapacity: 현재 사용중인 용량 

$ mapred queue -list
======================
Queue Name : prod 
Queue State : running 
Scheduling Info : Capacity: 20.0, MaximumCapacity: 100.0, CurrentCapacity: 0.0 
======================
Queue Name : dev 
Queue State : running 
Scheduling Info : Capacity: 60.0, MaximumCapacity: 75.0, CurrentCapacity: 0.0 
    ======================
    Queue Name : eng 
    Queue State : running 
    Scheduling Info : Capacity: 50.0, MaximumCapacity: 100.0, CurrentCapacity: 0.0 
    ======================
    Queue Name : science 
    Queue State : running 
    Scheduling Info : Capacity: 50.0, MaximumCapacity: 100.0, CurrentCapacity: 0.0 
```



## 큐 설정 변경

운영중 스케줄러의 설정을 변경할때는 capacity-scheduler.xml 파일을 수정하고 다음 명령을 이용해서 설정을 변경하면 됩니다. capacity, user-limit-factor, maximum-capacity 수정, root의 신규 큐 추가는 가능하지만, 큐의 삭제, 하위 큐 추가는 오류가 발생하기 때문에 리소스 매니저를 새로 실행해야 합니다.

```
# capacity-scheduler.xml 을 설정을 통해 큐를 다시 설정
$ yarn rmadmin -refreshQueues
```







### 스케줄러 설정시 주의 사항

커패시티 스케줄러를 설정할 때는 큐의 역활에 따라 용량을 잘 배분하고, 최대 사용 가능 용량(maximum-capacity)과 사용자 제한(user-limit-factor)을 이용하여 사용할 수 있는 자원의 용량을 제한해 주는 것이 중요합니다.

큐마다 사용할 수 있는 용량이 있지만 **전체 클러스터에 여유가 있는경우** **기본 용량에 사용자 제한을 곱한 용량(capacity * user-limit-factor) 또는 이 값이 최대 사용 가능용량을 넘어 서는 경우 최대 사용 가능용량 만큼 할당** 됩니다.

> 큐의 용량 = min(capacity * user-limit-factor, maximum-capacity)

애플리케이션 마스터에 할당되는 용량 비율(yarn.scheduler.capacity.maximum-am-resource-percent)을 잘 조절해야 합니다. 제출된 작업이 많아지면서 애플리케이션 마스터가 많은 자원을 가져가면, 컨테이너를 생성할 자원이 부족해지기 때문입니다. 작업의 종류에 따라 적절한 비율을 찾는 것이 중요합니다.



---

## 1-2 Fair Scheduler

페어 스케줄러는 트리 형태로 계층화된 큐를 선언하고, 큐별 사용가능한 용량을 할당하여 자원을 관리합니다. 

예를 들어 100G의 메모리 용량을 가지는 클러스터에서 A, B 두개의 큐에 각각 최저 자원(minResource) <10000 mb, 10vcores> 최대 자원(maxResource) <60000 mb, 30vcores>을 설정하고, 각 큐가 상황에 맞게 최대 60G까지의 메모리를 사용하게 설정할 수 있습니다.



# 스케줄러 설정 값

페어 스케줄러는 `yarn-site.xml`에 스케줄러 관련 설정을 하고, `fair-scheduler.xml`에 큐 관련 설정을 저장합니다. 10초 마다 설정파일을 읽어서 큐 설정을 갱신합니다. 페어 스케줄러는 다음과 같이 설정합니다.

```xml
<property>  
 <name>yarn.resourcemanager.scheduler.class</name>  
 <value>org.apache.hadoop.yarn.server.resourcemanager.scheduler.fair.FairScheduler</value>  
</property>
```





### yarn-site.xml

| 설정값                                    | 기본값             | 비고                                           |
| :---------------------------------------- | :----------------- | :--------------------------------------------- |
| yarn.scheduler.fair.allocation.file       | fair-scheduler.xml | 설정파일의 이름                                |
| yarn.scheduler.fair.user-as-default-queue | true               | 큐이름을 지정하지 않았을 때 기본큐의 사용 여부 |
| yarn.scheduler.fair.preemption            | false              | 우선순위 선점의 사용 여부                      |





### fair-scheduler.xml

```xml
<?xml version="1.0"?>
<allocations>
    <queue name="dev">
        <minResources>10000 mb,10vcores</minResources>
        <maxResources>60000 mb,30vcores</maxResources>
        <maxRunningApps>50</maxRunningApps>
        <maxAMShare>1.0</maxAMShare>
        <weight>2.0</weight>
        <schedulingPolicy>fair</schedulingPolicy>
    </queue>

    <queue name="prd">
        <minResources>10000 mb,10vcores</minResources>
        <maxResources>60000 mb,30vcores</maxResources>
        <maxRunningApps>100</maxRunningApps>
        <maxAMShare>0.1</maxAMShare>
        <weight>2.0</weight>
        <schedulingPolicy>fair</schedulingPolicy>
        <queue name="sub_prd">
            <aclSubmitApps>charlie</aclSubmitApps>
            <minResources>5000 mb,0vcores</minResources>
        </queue>
    </queue>


  <user name="sample_user">
    <maxRunningApps>30</maxRunningApps>
  </user>
  <userMaxAppsDefault>5</userMaxAppsDefault>

    <queueMaxAMShareDefault>0.2</queueMaxAMShareDefault>

    <queuePlacementPolicy>
        <rule name="specified"/>
        <rule name="primaryGroup" create="false"/>
        <rule name="default" queue="dev"/>
    </queuePlacementPolicy>
</allocations>
```









---

**Reference**

https://wikidocs.net/22899

https://wikidocs.net/35456

https://wikidocs.net/48799