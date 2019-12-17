# ICMP

Internet Control Message Protocol



## ICMPv4

ICMP 메시지의 목적은 커뮤니케이션 환경에서 문제에 데한 피드백을 제공하려고 하는 것입니다. IP를 신뢰할만하게 만드려는 것이 아닙니다.



* host와 router간 IP 상태와 에러 메시지를 의사소통하는데 쓰입니다.
* hosts간 ICMP 메시지를 route하기 위해 IP를 사용합니다.
* IP와 같이 실행되야 합니다.
  * IP header 안에는 잃어버린 bit를 탐색하는 checksum을 가지고 있습니다. 반면, datagram에는 없습니다.
* ICMP data는 IP datagram의 payload로써 운반됩니다.
  * 때문에 추가적인 메시지 포맷을 명시합니다.



---

**ICMPv4 message**

![](https://i.ibb.co/74rp3x2/image.png)

protocol : ICMP(1)

checksum : ICMP type과 시작하는 ICMP 메시지의 1의 보수 합의 16bit 1의 보수 ?



* ICMP의 주요 과업은 Reporting입니다. error detection이 아닙니다.
* error message는 원래 sender로 보내집니다. IP header가 src, dst IP주소만 가지고 있기 때문입니다.



**ICMP 메시지는 두 class로 나눠집니다.**

1. **ICMP error reporting messages**

   : IP 패킷 프로세싱 중 발생한 문제를 리포트합니다.

   **1) Dst Unreachable**

   **2) Redirect**

   3) Source quench

   **4) Time Exceeded**

   **5) Parameter Problem**



2. **ICMP query messages**

   : 라우터나 다른  host로부터 특정 정보를 얻은 관리자에 의해 사용됩니다.

   **1) Echo**

   **2) Router solicitation, Router advertisement**

   3) Timestamp

   4) Address Mask



---

### 1. ICMP Error Reporting Message



**ICMP error message는 다음과 같은 결과를 받음으로써 보내지면 안됩니다.**

1) ICMP error message

2) IP broadcast 혹은 IP multicast 주소로 정해진 datagram

3) 링크 레이어 broadcast로써 보내진 datagram

4) non-initial fragment

5) src 주소가 단일 host로 정해지지 않은 datagram



**Dst Unreachable(3)**

: 라우터나 호스트가 datagram을 전송할수 없을 때

**Redirect Message(5)**

: 라우터가 최단경로의 전송 시스템을 특정 dst에게 알려주고 싶을 때

**Source Quench Message(4)** (발신지 억제)

: gateway는 buffer space가 없을 때 internet datagram을 버립니다. 라우터나 dst host상의 congestion 때문에 datagram이 버려질 때 source에게 REPORT 됩니다.

**Time Exceeded Message(11)**

: 시간 초과시

**Parameter Problem Message(12)**

: datagram header에서 모호성이 존재할 때 보내집니다.





---

### 2. ICMP Query Messages



#### Echo

* Echo 또는 Echo reply message입니다. (오진단을 위해 reachability 체크)
* Echo reply는 echo request를 받은 host나 router로부터 보내집니다.
* reachability를 `ping` 명령어를 수행하여 검증합니다.



#### ICMPv4 Router Discovery Messages

ICMP의 확장입니다. 이웃 라우터를의 IP주소를 찾기위해 host가 multicast나 broadcast 네트워크에 attach될 수 있게 합니다.



**Neighboring : 같은 서브넷에 속한 IP 주소를 가지는 것입니다.**



* host가 IP datagram을 직접연결된 subnet에 보낼 수 있기 전에, 그 subnet에서 적어도 하나의 operational router의 주소를 찾아야 합니다.



* 다른 방법으로는, Multicast link의 사용을 위해 ICMP message 쌍을 사용하는 것입니다.
  * Router Advertisement와 Router Solicitations

* 각 router는 해당 각 multicast 인터페이스로부터 주기적으로 router advertisement를 브로드캐스트합니다. IP주소를 광고하는 것입니다.
* link에 연결된 host가 시작하게 되면, Router solicitation을 브로드캐스트하여 즉각적인 advertisement를 요청합니다.
* router discovery messages는 라우팅 프로토콜을 구성하지 않습니다.
  * host가 이웃 라우터의 존재를 찾을 수 있게는 돕지만, 특정 도착지에 최선으로 도착하도록 하진 못합니다.
* Host가 도착지로 가기 위해 poor first-hop router를 찾았다면, 더 좋은 hop을 찾도록 라우터로부터 ICMP Redirect를 받아야 합니다.



#### ICMPv4 Time Stamp

: 두 시스템의 clock 동기화를 위해 사용됩니다.



#### ICMPv4 Address mask

: host와 router는 서브넷 마스크에게 부트시 거주할 네트워크를 요청할 수 있습니다.









---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2