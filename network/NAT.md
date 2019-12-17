# NAT

Network Address Translator

Network masquerading 또는 IP-masquerading으로도 불립니다.

masquerade: 가장하다, 속이다

IP packet이 라우터나 방화벽을 통과할 때 그들의 source와 dst 주소를 re-writing하는 것을 포함합니다.



### NAT가 도입된 이유

1) IP 주소의 부족을 극복할 수 있습니다.

**Public IP Address Sharing**: 많은 host가 적은 public IP 주소를 공유할 수 있습니다. 돈과 IP 주소 공간을 절약할 수 있습니다.

2) 확장이 용이합니다. 

* **Easier Expansion**: local network는 개인적으로 주소되었고, 각각마다 public IP주소가 필요하지는 않기 때문에, **새로운 클라이언트를 local network에 추가하는 것이 쉽습니다.**

3) **Greater Local Control**: 관리자는 **private network에서 오는 제어 장점을 다 가지면서 Internet에 연결할 수 있습니다.**

4) **Increased Security**: NAT 번역은 간접 레벨을 표현합니다. organization 네트워크와 공공 인터넷 사이에 **방화벽이 자동으로 생성됩니다.**

5) 대부분 **Transparent** 합니다. : **많은 host들이 바뀔 필요없이 몇몇의 라우터만 바뀌면 되서 transparent합니다.**

![](https://i.ibb.co/FWcDs5d/image.png)

![](https://i.ibb.co/dbZjkMZ/image.png)



### NAT 개요

재사용 가능한, 가능하지 않은 주소 분류

* local addresses (Private address)

* global addresses (Public address)



### NAT 단점

1) **복잡성 (Complexity)**

​	Header manipulations

2) **public 주소의 부족**

3) **Security protocol 이슈**

​	NAT로 만들어진 변경사항이 악의적으로 datagram hacking에 의해 위조될 수 있습니다.

4) **Peer-to-Peer 통신 어려움**



### NAT 종류

1) Basic NAT

2) NAPT (Network Address Port Translation)

* IPv4 주소를 절약하는 목적으로 쓰이며, 대부분 NAT는 NAPT를 의미합니다.

* 모든 유/무선 공유기(router)는 NAPT를 지원합니다.



---

## Basic NAT operation

![](https://i.ibb.co/hDhrjJx/image.png)

1) NAT를 디자인해봅시다. host는 패킷 전송 프로세스와 같은작업을 합니다.

* DNS를 통해 서버의 IP주소를 찾습니다.
* Port를 application에 할당합니다.
* routing table을 통해 next-hop을 찾고, NAT에게 패킷을 전송합니다.(indirect forwarding)



2) NAT는 host로부터 패킷을 받습니다.

* Address Binding
* Address Translation{10.1.1.1 → 5.5.5.1}

![](https://i.ibb.co/4RLBSxd/image.png)



3) NAT는 서버로부터 패킷을 받습니다.

* Address Translation{5.5.5.1 → 10.1.1.1}



4) host는 일정 수이하로 늘릴 수 있습니다.

![](https://i.ibb.co/ZSyn1Fh/image.png)



5) Address Unbinding: 패킷이 특정 시간 안에 흐르지 않으면 session entry를 삭제합니다.



* **Translation rules: 1:1 번역**

  (1 = public IP, 1 = Private IP)

* Packet modification:

  번역을 수행한 후 바뀌는 패킷 안의 정보

  Outbound traffic : src IP, IP header checksum

  Inbound traffic: dst IP, IP header checksum





---

## NAPT operation

**(Network Address Port Translation)**

![](https://i.ibb.co/cNwvjhL/image.png)

* private network 안 노드는 동시에 외부 네트워크로 접속이 가능합니다. NAPT 도움으로 single registered IP 주소를 사용하기 때문입니다.



1) NAT는 host로부터 패킷을 받습니다. (In → out = Outbound)

* Address binding
* Address Translation{ (10.1.1.1/5000) → (5.5.5.1/1000)}

![](https://i.ibb.co/Mp7sHJR/image.png)



2) NAT는 서버로부터 패킷을 받습니다. (out → in = inbound)

* Address Translation { (5.5.5.1/1000) → (10.1.1.1/5000)}



3) host는 일정 수이하로 늘릴 수 있습니다.

![](https://i.ibb.co/YWGR6Sh/image.png)



4) Address Unbinding: 패킷이 특정 시간 안에 흐르지 않으면 session entry를 삭제합니다.



* **Translation Rules : 1:N 번역**

  (1 = public IP, N = Private IP)

* **Packet Modification**

  Outbound Traffic: src IP, IP header checksum, TU src port, TU header checksum

  Inbound Traffic: dst IP, IP header checksum, TU dst port, TU header checksum

  (TU는 TCP/UDP)



---

### NAPT 단점

* IP 주소 사용비를 최대화하려는 방법인데, IP주소를 바꾸기 위해 IP layer와 TCP/UDP layer가 함께 고려되어야 해서 몇가지 문제가 생깁니다.



**1) Performance 저하**

* IP 주소/ Port 변환 작업이 복잡하고, 속도가 느립니다.

**2)** ALG(Application layer gateway)가 없으면 **Port-sensitive service(talk, realplayer)가 지원되지 않습니다.** 

**3) Packet reassembly 이슈**

**4) Peer-to-Peer 통신이 쉽지 않습니다.**



---

## NAPT Filtering Behavior

**필터링 행동(Filtering behavior)**은 inbound 패킷을 받은 NAT가 packet을 accept할지 drop할지 결정하는 규칙입니다. 패킷의 src IP, src Port값에 따라 결정됩니다.





### Endpoint-Independent 필터링

= FullCone NAT



inbound 패킷의 (1) dst IP, (2) dst Port 만 고려합니다.

![](https://i.ibb.co/W3YHVF3/image.png)



여기서 {dst IP/dst Port = {5.5.5.1/1000}} 이면 외부에서 오는 어떤 패킷이든 모두 host A로 전송합니다.



<br>

---

### Address-Dependent 필터링

여기서 address는 External endpoint의 주소를 의미합니다.

즉, inbound 패킷의 src IP를 말합니다.

Address-dependent 필터링은

**(1) dst IP, (2) dst Port, (3) Src IP**를 고려합니다.



**1) Restricted Cone NAT**

![](https://i.ibb.co/QKy9Rv8/image.png)

Inbound 패킷이 {1.1.1.1/Any port} to {5.5.5.1/1000}이면 허락(accept)합니다.



**2) Port Restricted Cone NAT**

Inbound 패킷이 {Any IP/5000} to {5.5.5.1/1000}이면 허락(accept)합니다.



<br>

---

### Address and Port-Dependent 필터링

**= Symmetric NAT**



**(1) dst IP, (2) dst Port, (3) src IP, (4) src Port** 를 확인합니다.

![](https://i.ibb.co/TmVdSyq/image.png)



여기서 Inbound packet이 {1.1.1.1/80} to {5.5.5.1/1000} 이면 accept합니다.



>RFC 4787 권고(REQ-8) 에서는 transparency가 가장 중요하다면, Endpoint-Independent Filtering을 사용할 것을 권합니다.





---

## Hairpinning Behavior

**Hairpinning**은 같은 NAT안의 다른 internal endpoint가 NAT를 통해 서로 통신하는 능력(ability)입니다.

![](https://i.ibb.co/dP9fbST/image.png)



특정 NAT안에서 두 무선 터미널이 서로 통신하는 전형적인 예(카카오 보이스톡)를 들어봅시다.



---

### **External source IP 주소/포트**

![](https://i.ibb.co/9Th1jCT/image.png)



1) Host A는 {5.5.5.2/1001}에게 패킷을 보내고 다시 받을 것을 예상합니다.

* Host A는 NAT 밖에 나가면서 src가 {5.5.5.1/1000} 로 바뀝니다. 이 패킷은 {5.5.5.2/1001}로 전달됩니다.

* 패킷은 NAT안으로 들어오면서 dst가 {10.1.1.2/5001}로 바뀝니다. 이 패킷은 Host B로 전달 됩니다.



![](https://i.ibb.co/b3CxnBR/image.png)

* Host B는 다시 {5.5.5.1/1000}에게 패킷을 보냅니다.
* 패킷은 NAT 밖을 나가면서 src가 {5.5.5.2/1001}로 바뀌게 됩니다.
* 패킷은 NAT 안으로 들어오면서 dst가 {10.1.1.1/5000}으로 바뀌게 되어 Host A에게 전달됩니다.

2) Host A는 {5.5.5.2/1001}로부터 응답을 받았습니다. accept 되었습니다.



* Host A의 외부주소(5.5.5.1)와 Host B의 외부주소(5.5.5.2)는 다른 값으로 표현되었습니다. 하지만 두 값은 NAT의 behavior에 따라 같게 될수도 있습니다.



---

### Internal source IP 주소/포트

![](https://i.ibb.co/rwF2V1H/image.png)

* Host A는 {5.5.5.2:1001}에게 패킷을 보내고 {5.5.5.2:1001}로부터 다시 받을 것을 기대합니다. 하지만 NAT binding table에 의하면 NAT inside에서 오는 소스 IP:port는 {10.1.1.1:5000}, {10.1.1.2:5001} 둘 중 하나여야 하므로, discard하게 됩니다.













---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2