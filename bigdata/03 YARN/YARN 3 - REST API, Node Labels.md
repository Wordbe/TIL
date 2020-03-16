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

