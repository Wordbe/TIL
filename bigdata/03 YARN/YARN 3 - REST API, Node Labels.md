# YARN 3 - REST API, Node Labels

리소스 매니저는 REST API를 제공합니다. 이를 통해 클러스터의 상태정보, 운영정보를 확인할 수 있습니다. JSON, XML 형식으로 응답이 제공됩니다.

[리소스 매니저 메뉴얼](https://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/ResourceManagerRest.html) 



### 클러스터 메트릭 정보 확인

클러스터 메트릭 정보를 확인하는 URI는 다음과 같습니다. 해당 URI를 GET 방식으로 호출하면 됩니다. 

헤더에 `{ 'Content-Type': 'application/json' }`로 정보를 설정하면 json 형식으로 값을 반환합니다.

```
http://<rm http address:port>/ws/v1/cluster/metrics
```



### 메트릭 확인 REST API 예제

파이썬을 이용해서 RMA 메트릭을 호출합니다.

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
import urllib, json, urllib2, datetime
from urllib2 import HTTPError

def request_get(request_url):
    return request(request_url, "GET", "", {'Content-Type': 'application/json'})

def request(request_url, request_type="GET", data="", header={}):

    opener = urllib2.build_opener(urllib2.HTTPHandler)
    request_get = urllib2.Request(request_url, data, header)
    request_get.get_method = lambda: request_type

    response = opener.open(request_get)

    response_info = response.info()
    response_body = response.read()
    json_obj = json.loads(response_body)

    print(json.dumps(json_obj, sort_keys=True, indent=4, separators=(',', ': ')))

def main():
    rma_url = "http://<RMA주소>:<RMA포트>/ws/v1/cluster/metrics"
    request_get(rma_url)

if __name__ == '__main__':
    main()
```

결과는 다음과 같습니다.

```json
{
    "clusterMetrics": {
        "activeNodes": 2,
        "allocatedMB": 0,
        "allocatedVirtualCores": 0,
        "appsCompleted": 25000,
        "appsFailed": 1,
        "appsKilled": 1,
        "appsPending": 0,
        "appsRunning": 0,
        "appsSubmitted": 1,
        "availableMB": 1,
        "availableVirtualCores": 23,
        "containersAllocated": 0,
        "containersPending": 0,
        "containersReserved": 0,
        "decommissionedNodes": 0,
        "decommissioningNodes": 0,
        "lostNodes": 0,
        "rebootedNodes": 0,
        "reservedMB": 0,
        "reservedVirtualCores": 0,
        "totalMB": 25000,
        "totalNodes": 2,
        "totalVirtualCores": 23,
        "unhealthyNodes": 0
    }
}
```



---

## YARN Node Labels

노드 레이블은 서버를 특성에 맞게 구분하여 작업을 처리하는 기능을 제공합니다.

예를 들어 SSD를 설치한 서버는 I/O가 많은 작업에 유리하고, GPU를 설치한 서버는 연산이 많은 작업에 유리합니다. 노드 레이블은 각 서버에 유리한 작업을 등록할 수 있게 도와줍니다.



### 특징

- **하나의 노드는 하나의 파티션을 가질 수 있음**(One node can have only one node partition)
  - 기본값은 DEFAULT 파티션(partition="")
  - 클러스터는 여러 파티션(여러 노드)으로 구성 가능
  - 스케줄러에서 사용자가 각 파티션이 사용할 수 있는 리소스의 양을 설정해야 함
  - 노드 레이블로 지정되지 않은 큐는 기본 파티션을 이용하게 됨
- **접근제어(ACL)**
  - 큐에서 설정된 노드만 작업에 이용할 수 있고, 이를 통해 각 노드에 대한 접근제어가 가능함
- **클러스터 사용량 제어**
  - 각 노드마다 사용할 수 있는 자원의 비율을 지정하여 사용량을 제어할 수 있음





### 파티션의 종류

- **Exclusive 파티션**
  - 클러스터의 자원에 여유가 있어도 지정한 파티션만 이용하여 작업을 처리
- **Non-Exclusive 파티션**
  - 클러스터에 여유가 있다면 DEFAULT 파티션으로 요청한 작업에 대해서 처리 가능



---

### 노드 레이블 설정

리소스 매니저에서 노드 레이블을 지원하도록 하기 위해서 `yarn-site.xml`에 다음과 같이 설정합니다.

```xml
  <property>
    <name>yarn.node-labels.enabled</name>
    <value>true</value>
  </property>
  <property>
    <name>yarn.node-labels.fs-store.root-dir</name>
    <value>hdfs://namenode:port/path/to/store/node-labels/</value>
  </property>
```



### 노드 레이블 관련 명령어

`yarn` 명령어를 이용해 노드 레이블을 추가합니다.

<br>

**클러스터의 레이블 정보 확인**

```
# 클러스터의 레이블 정보 확인 
$ yarn cluster --list-node-labels
Node Labels: <GPU:exclusivity=false>
```

<br>

**클러스터의 노드 레이블 추가 및 삭제**

```
# 클러스터 노드 레이블 추가, exclusive 기본값은 true
$ yarn rmadmin -addToClusterNodeLabels "label_1(exclusive=true),label_2(exclusive=false)"

# 클러스터 노드 레이블 삭제 
$ yarn rmadmin -removeFromClusterNodeLabels "label_1"
```

<br>

**노드 레이블 추가 및 삭제**

```
# 노드 레이블 추가 
$ yarn rmadmin -replaceLabelsOnNode “node1[:port]=label1 node2=label2”
```



<br>

---

### 스케줄러 설정

커패시티 스케줄러는 `capacity-scheduler.xml`에 설정하게 됩니다.

| 설정                                                         | 내용                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| yarn.scheduler.capacity.<queue-path>.capacity                | DEFAULT 파티션에 속하는 노드에 액세스 할 수있는 큐의 백분율 설정. 각 부모의 직계 자녀에 대한 기본 용량의 합은 100 |
| yarn.scheduler.capacity.<queue-path>.accessible-node-labels  | "hbase, storm"과 같이 관리자가 각 큐에서 레이블에 액세스 할 수 있고 쉼표로 구분하여 레이블을 지정. 큐가 레이블 hbase 및 storm에 액세스 할 수 있음을 의미함. 모든 큐는 레이블이없는 노드에 액세스 할 수 있으므로 사용자는 이를 지정하지 않아도 됨. 사용자가 이 필드를 지정하지 않으면 상위 필드에서 상속. |
| yarn.scheduler.capacity.<queue-path>.accessible-node-labels.<label>.capacity | <label> partition에 속하는 노드에 액세스 할 수있는 큐의 백분율을 설정. 각 부모 아래의 직계 자녀에 대한 <label> 용량의 합계는 100. 기본적으로 0. |
| yarn.scheduler.capacity.<queue-path>.accessible-node-labels.<label>.maximum-capacity | yarn.scheduler.capacity.<queue-path>.maximum-capacity와 유사하게 각 대기열의 레이블에 대한 최대 용량. 기본적으로 100. |
| yarn.scheduler.capacity.<queue-path>.default-node-label-expression | "hbase"와 같은 값. 즉, 응용 프로그램이 자원 요청에 노드 레이블을 지정하지 않고 큐에 제출 한 경우 "hbase"를 default-node-label-expression으로 사용. |

<br>

### 예제

어느 회사에서 엔지니어 부서(engineering), 마켓팅 부서(marketing), 영업부서(sales)가 하나의 클러스터를 1/3씩 나눠서 쓴다고 하겠습니다.

```
yarn.scheduler.capacity.root.queues=engineering,marketing,sales
yarn.scheduler.capacity.root.engineering.capacity=33
yarn.scheduler.capacity.root.marketing.capacity=34
yarn.scheduler.capacity.root.sales.capacity=33
```

엔지니어 부서와 마켓팅 부서가 업무가 늘어나서 GPU를 가지고 있는 머신들을 추가하게 되었습니다. 이 머신들로 클러스터를 따로 구축하게 되면 운영비가 늘어나서 기존의 클러스터에 머신을 추가하면서 GPU 노드 레이블을 추가해서 적용합니다. 그리고 GPU 노드들은 엔지니어 부서와 마켓팅 부서만 사용할 수 있도록 설정합니다.

엔지니어 부서와 마켓팅 부서는 GPU노드를 1/2씩 나눠서 사용할 수 있습니다.

```
yarn.scheduler.capacity.root.engineering.accessible-node-labels=GPU
yarn.scheduler.capacity.root.marketing.accessible-node-labels=GPU

yarn.scheduler.capacity.root.engineering.accessible-node-labels.GPU.capacity=50
yarn.scheduler.capacity.root.marketing.accessible-node-labels.GPU.capacity=50

yarn.scheduler.capacity.root.engineering.default-node-label-expression=GPU
```







---

**Reference**

https://wikidocs.net/54964