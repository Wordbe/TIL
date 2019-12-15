# IP Routing Protocol



### IP Forwarding and Address Mapping



### Relationship between Addresses at Host

**Socket API**

* 소켓 생성(protocol/address family, service type, protocol) : 소켓 파일 descriptor
* 소켓 파일 descriptor → socket(protocol, L.IP, L.PORT, R.IP, R.PORT)

![](https://i.ibb.co/C1vs95G/image.png)



### Relationship between Addresses : Router / Gateway

![](https://i.ibb.co/f4LQYwS/image.png)

* "Forwarding table" = "Routing table" 을 통해 패킷전송정보 확인





### IP Forwarding and Routing Protocol

IP : 패킷 포워딩

Routing protocol : routing table을 위한 네트워크 위상정보 생성



### Routing Protocol Network Topology Information

예) A → S1 → S3 → D

Network

DataLink

Physical

![](https://i.ibb.co/Rh6btN3/image.png)



## Routing

* **라우팅**이란 한 네트워크 안 또는 다양한 네트워크 사이(또는 걸쳐서)에서 **교통(traffic)을 위한 경로를 선택하는 절차**입니다.

"High-level decision making"

* **패킷포워딩(packet forwarding)**이란 한 네트워크 인터페이스에서 다른 곳으로 **논리적으로 주소화된 네트워크 패킷을 전송**하는 것입니다.



* 라우팅 절차는 주로 라우팅테이블(=forwarding table) 기반으로 포워딩을 지시합니다. 라우팅 테이블에 다양한 네트워크 dst(destination)에 대한 경로를 기록합니다.

  (IPv4, IPv6)

* 라우팅 프로토콜로 라우팅 테이블을 구성합니다.



**Routings**

1) Source Routing : 패킷의 sender가 부분적 또는 완벽하게 패킷이 네트워크를 지나가는 경로를 명시합니다.

2) Hop-by-hop Routing : 네트워크 안의 라우터가 패킷의 dst에 기반한 경로(또는 next hop)를 결정합니다.

3) Policy-based Routing : 네트워크 관리자 정책 기반의 라우팅 결정을 사용합니다. (Inter-domian routing)







---

## Routing Algorithms

1 **Distance vector algorithms (path vector protocol)**

2 **Link-state algorithms**



## 1) Distance Vector

거리 + 방향

Distance vector는 dst 네트워크까지의 **Distance(= metric)**과 **direction(vector = next-hop)**만 아는 라우팅 프로토콜입니다.



1) 각 노드는 한 개 이상 이웃 노드(물리적으로 직접 연결된)와 정보를 주고 받습니다.

2) 데이터를 서로 교환할 수 없을 때까지 sending, receiving을 반복합니다.(라우팅 계산이 멈출때까지)

3) 각 노드는 라우팅 정보를 보내는 특정 타이밍에 의존하지 않습니다. (**Timing constraints free**)



**Distance vector table**

각 라우팅 테이블은 모든 dst router에 대한 **best distance**와 dst에 이르기 위해 사용되어야하는 **route(next-hop)**을 포함합니다.


$$
D^X(Y,Z) = c(X, Z) + min_W\{D^Z(Y, w)\}
$$
$D^X(Y,Z)$ : 노드 X에서 node Z를 지나 dst 노드 Y까지 경로값(path value)

$c(X, Z)$ : 노드 X에서 노드 Z로 가는 one-hop link cost

$min_W\{D^Z(Y, w)\}$ : 노드 Z에서 Y로 가는 최소 cost



![](https://i.ibb.co/qFH8qc1/image.png)



**Link cost changes**

1) 노드는 local link cost change를 감지

2) Distance table을 갱신

3) 최소 cost 경로에서 cost 변경시 이웃들에게 알림



"Good news travels fast!" : 경로값이 작아졌을 때는 이 정보가 이웃에게 빠르게 퍼짐

"Bad news travels slow" 

→ **Count to infinity 문제** 발생 : 경로값이 커졌을 때 느리게(혹은 무한대 시간) 전파됨



![](https://i.ibb.co/k9gHHwJ/image.png)



$c(X, Y)$ 변경 시, Y가 이 link cost change를 알리기 전에 Z가 라우팅 정보를 Y에게 보냅니다.

그러면 Y는 Z가 새로운 경로를 가지게 되었다고 생각합니다.



Y는 Z에게 라우팅 정보를 보내게 되고, Z는 Y에서 A로 가는 라우트 cost가 2개 늘었다고 생각해서 다음과 같이 routing table을 변경합니다.

![](https://i.ibb.co/8XKXJqX/image.png)



**Routing table(=Distance table)**

| Destination | Total cost | Next hop |
| ----------- | ---------- | -------- |
| 1.0.0.0     | 1          | -        |
| 2.0.0.0     | 5          | -        |
| 3.0.0.0     | 2          | -        |

**wait** (local link cost change or message from neighbor) → **recompute** → **notify**





**Distance vector algorithm**

1) 노드가 첫째로 시작하면, 바로 옆 이웃만 아는 상태입니다.

2) 정기적으로 각 노드는 각 이웃 노드에게 자신에서부터 모든 dst에 달하는 total cost 에 대한 현재 평가(assessment)를 보냅니다.

3) 이웃노드는 이미 알고있는 정보와 비교하여 향상(improvement)된 값이 있으면 자기 라우팅 테이블에 삽입(insert)합니다.

4) 시간이 지나면, 모든 노드는 모든 dst로 가는 best next hop과 best total cost을 발견하게 됩니다.





![](https://i.ibb.co/t4GKPYn/image.png)



![](https://i.ibb.co/GPNDrT3/image.png)

이 작업은 각 라우터 A, B, C, D, E마다 진행되어 각각에서의 라우팅 테이블을 갱신합니다.



![](https://i.ibb.co/g6TZ6ws/image.png)





---

## 2) Link-state algorithms

* 네트워크의 그래프 맵입니다. (Network Topology Map)
* 각 노드는 연결할 수 있는 다른 노드에 대한 정보를 전체 네트워크에 전달(flood)합니다.
* 각 노드는 **독립적**으로 map에 이 정보를 모읍니다(assemble).



* 이 맵을 이용하여 각 라우터는 독립적으로 모든 노드로의 최소비용 경로(the least-cost path)결정합니다. 표준 최단경로 알고리즘 Dijkstra를 이용합니다.
  * 현재 노드를 root로 하는 Tree 그래프를 생성
  * root로부터 다른 노드의 경로는 그 노드까지의 least-cost path



**Routing table(link-state table)**

| Originating router | Network | cost |
| ------------------ | ------- | ---- |
| A                  | 1.0.0.0 | 1    |
| A                  | 2.0.0.0 | 5    |
| A                  | 3.0.0.0 | 2    |



**Link-state algorithms**

1) 같은 네트워크 주소를 가진 entry들을 비교합니다. 

2) 최소 비용을 가진 것으로 값을 갱신합니다.





---

## 3) Path vector routing

* distance vector routing의 확장

  * 유연한 라우팅 정책 지원
  * count-to-infinity 문제 회피

* Key idea: 모든 경로 advertise

  Distance vector는 dst 마다 distance metrix을 전송하지만, Path vector는 dst마다 entire path를 전송합니다.



* 각 자동시스템에서 한 노드(또는 여러노드)는 전체 자동시스템을 대표하여 행동합니다. (Speaker node)
* Speaker node는 metric이 아닌 자신의 자동시스템(IBGP) 또는 다른 자동시스템(EBGP)안의 노드의 **path**를 **advertise**합니다.

metric의 단위는? 모름

누가 정의한것인가? 아무도 안함



![](https://i.ibb.co/5G97GvH/image.png)

