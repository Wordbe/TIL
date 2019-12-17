# Mobile IPv4, IPv6



![](https://i.ibb.co/6PtzRBB/image.png)

**IP 라우팅 모델**

* 주소는 위상적으로 중요한 순으로 할당되어있습니다.
* address prefix에 기반한 라우팅입니다.
* Mobile node(MN)은 이동할 때 새로운 주소로 할당 되어야 합니다.



**IP session 연속성**

* TCP connection은 [src IP, src Port, dst IP, dst Port]로 정의되어있습니다.
* MN의 주소는 진행중인 IP session(identity)을 보존하기 위해 그 위치(location)에 상관없이 보존되어야 합니다.





**Mobile node가 움직일 때**

>MN 주소 유지시 routing이 실패하고, (locator 역할 실패)
>
>MN 주소 변경시 IP session이 깨집니다. (identifier 역할 실패)



### 해결 : Two-tier IP addressing

![](https://i.ibb.co/KWQfx17/image.png)

* **MN은 static IP주소는 보존하되, 다른 서브넷으로 움직일 때 임시적인 CoA(Care-of-address)를 사용합니다.**

**HoA (Home Address) - 원래 정적 IP 주소**

**CoA (Care-of Address) - 임시 IP 주소**



# Mobile IPv4 (RFC3344)

주요 구성

* HA (Home Agent)
* FA (Foreign Agent) - 주로 router
* MN (Mobile Node)



### New Message/Options

* 장소 관리와 연관된 새로운 signal messsage 추가

  * Agent Discovery
  * Regstration

* 주요 역할

  1) MN - 네트워크 연결의 변경 감지시 agent advertisement를 듣고(listen), registration을 시작합니다.

  2) HA - mobility 서비스를 처리하고 중재합니다.

  3) FA - HA, MN 사이에서 registration 요청과 응답을 전달합니다. 캡슐을 제거하여 MN에게 datagram을 전달합니다.



### Mobile IPv4 Operation

**1) MN at Home Network**

![](https://i.ibb.co/y4hnzqK/image.png)



**2) Agent Discovery**

![](https://i.ibb.co/ZSrrLrN/image.png)

MN이 외부 네트워크로 가면, 1) MN은 Agent Solicitation(ICMP), 2) router는 Agent advertisement(ICMP), 3) MN은 새로운 CoA(FA-CoA)를 얻습니다.



**3) Registration**

![](https://i.ibb.co/c3gt4gS/image.png)

1) MN은 FA에게 등록 요청을 하고, 2) FA는 HA에게 등록요청하면 HA는 Registration table을 작성합니다. 그 후 3) HA는 FA에게 등록 응답, 4) FA는 MN에게 등록응답을 합니다.



**4) Packet delivery: CN to MN**

![](https://i.ibb.co/XWmbFhJ/image.png)

CN은 HA에게 패킷 전송 (payload, src: CN addr, dst: MN HoA)

HA는 FA에게 패킷 전송(payload, src: CN addr, dst: MN HoA, **src: HA addr, dst MN CoA**)

FA는 MN에게 패킷 전송 (payload, src: CN addr, dst: MN HoA)



**MN to CN**

![](C:\Users\seong\AppData\Roaming\Typora\typora-user-images\image-20191218061600050.png)

dst 알고있으므로 직접 전송



**5) After handover**

![](https://i.ibb.co/gW9Wvk6/image.png)

![](https://i.ibb.co/CQynSsj/image.png)



**6) Triangular routing**

![](https://i.ibb.co/Bjbk18T/image.png)





### Mobile IPv4 Features

* Triangle Routing

  CN → HA → MN. MN → CN

  - 서비스 질을 악화시킵니다.
  - MIP4 라우트 최적화는 아직 표준이 아닙니다.

* FA는 많은 Visitor List를 가지게 될 수도 있습니다.

* Two CoA modes

  FA-CoA

  - MN은 FA로 부터 CoA를 받습니다
  - 새로운 CoA에 대한 복제본은 없습니다.

  Co-located CoA

  - DHCP 기반 CoA 할당입니다.
  - DHCP 서버는 CoA의 uniqueness를 보장해야 합니다.





### Ingress Filtering

inbound traffic의 src 주소 스푸핑(spoofing)을 막기위해 많은 인터넷 서비스 제공자가 사용하는 라우터 패킷 필터링 기술입니다.

src 주소로 HoA를 가지는 패킷의 전송은 필터링을 거칩니다.



"Reverse Tunneling"

solution: Router는 inbound 패킷을 HA로 터널 전송합니다.





---

# Mobile IPv6 (RFC 3775)

주요 구성

* HA
* MN
* **(no FA) : IPv6에서는 IP주소를 자동으로 할당하기 때문입니다.(Autoconfiguration service)**



### New Message/Options

* Binding 관리와 관련된 새로운 signal 메시지

  BU : Binding Update

  BAck : Binding Acknowledgement

  BRR : Binding Refresh Request

  BE : Binding Error

* Binding Authentication과 관련된 새로운 signal 메시지

  HoTi : Home Test Init

  CoTI : Care-of Test Init

  HoT : Home Test

  CoT : Care-of Test

* 새로운 dst 옵션

  Home address dst 옵션

* 새로운 라우팅 헤더 타입

  라우팅 헤더 타입 2



### Mobile IPv6 Operation

1) MN at Home Network



2) Router Advertisement & Router Solicitation

![](https://i.ibb.co/7vw9GnJ/image.png)



3) Movement to a Foreign Network

![](https://i.ibb.co/VHDHZnG/image.png)





4) Packet Tunneling

![](https://i.ibb.co/Pz0pLQW/image.png)

* IPv6 extention header의 장점

  1) IPv6 헤더 외부에 있습니다.

  2) Router는 hop-by-hop 옵션만 봅니다.

  3) 라우터의 forwarding 성능에 영향이 없습니다.

  4) 새로운 헤더와 옵션을 쉽게 확장할 수 있습니다.



5) Return Routability with CN

![](https://i.ibb.co/rFkRYgm/image.png)

![](https://i.ibb.co/p45Swqv/image.png)





6) Route optimization after BU with CN

![](https://i.ibb.co/qY1MFys/image.png)



7) CN의 binding 수명이 만료에 가까울 때

![](https://i.ibb.co/8950CjJ/image.png)



### Mobile IPv6 Features

* CoA 만드는 방법: Auto-configuration
* DAD(Duplication Address Detection) 필요



* Triangle routing은 면했지만, 최적이 아닌 라우팅이 기본값입니다.

* Route 최적화가 지원됩니다.

* Security

  MN, HA 사이 : 강한 보안 (IPSec)

  MN, CN 사이 : 약한 보안 (Return Routability)



### Ingress filtering in MIPv6

* Home Address Dst Option

### CN to MN 패킷 프로세싱

* Mobility는 IP layer에서 transparent합니다.
* MN으로 가고, 에서 오는 패킷은 항상 Home address를 운반합니다.
* Routing type 2를 사용한 CN to MN Packet 전송









---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2