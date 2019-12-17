# ARP, Address Resolution Protocols



**인터페이스(interface)란?**

* 컴퓨터와 개인/공공 네트워크간 상호연결의 점(point)

* 네트워크 인터페이스는 일반적으로 NIC(Network interface card)이지만, 물리적 형태는 같지 않습니다.
* 소프트웨어로 구현이 가능합니다.





**HOST IP 구현의 모델** (RFC1112)

![](https://i.ibb.co/fNvq27d/image.png)



## ARP (Address Resolution Protocol)

**Ethernet** address resolution protocol : 네트워크 protocol 주소를 48bit Ethernet 주소로 바꾸어 ethernet 하드웨어에서 전송이 가능하게 합니다.

![](https://i.ibb.co/JHmJNjW/image.png)

* IP주소는 TCP/IP protocol에서만 유효합니다.

* Physical network는 hardware 주소를 가집니다 : 

  ex) 48bits Ethernet 주소, 16(또는 48)bits Token Ring



ARP는

네트워크레이어(3)도 아니고,

데이터링크레이어(2)도 아닌 이 사이 2.5layer에 위치합니다.



### Manual mapping

실제로 가능은 합니다.

하지만, 

1) tedious(짜증, 지루), 

2) error prune(실수 쉬움), 

3) manual updating(갱신) 등의 이유로 자동화하가 필요한 측면에서 ARP가 등장하였습니다.



**장점**

1) Dynamic mapping이 가능합니다. (랜카드 바뀌었을 때 자동 동적 맵핑)

2) 어떤 네트워크 layer protocol에서도 사용가능합니다.(Not IP-specific)

3) 데이터링크 레이어 프로토콜을 도와주는 프로토콜입니다.

4) broadcasting으로만 ARP가 동작합니다.

<br>

**Switching**

![](https://i.ibb.co/K0QxwsB/image.png)



---

## ARP Operation

1) 서버1(SVR1, IP: 1.1.1.10)는 서버2(SVR2, IP: 1.1.1.20)에게 패킷을 보내고자 합니다.

2) SVR1은 SVR2와 NetIDs를 비교하여 dst node가 자신과 같은 네트워크에 있음을 알고 있습니다.

​	**Routing table lookup** : 자신의 routing table

![](https://i.ibb.co/YNqQcXQ/image.png)

3) SVR1은 자신의 **ARP table**을 참조하여 SV2의 MAC주소를 알아냅니다. 하지만 ARP table은 비어있습니다.(**ARP miss** 발생)

4) SVR1은SVR2의 맥주소를 찾기 위해 **ARP request**를 lan1 port에게 보냅니다.

​	아래는 전송되는 ARP Packet과 ARP Request를 보여줍니다.

![](https://i.ibb.co/Phq8kjy/image.png)

5) S1은 ARP packet을 받고, src MAC주소를 기록합니다. switch는 들어오는 패킷이 IP packet인지 ARP Packet인지 고려하지 않습니다. S1의 Mac table에는 src 맥주소 m1이 port fe1과 연결된다고 기록되어집니다. ▶이를 switch의 **self-learning**이라고 부릅니다.

![](https://i.ibb.co/rbwBMBs/image.png)

★ Switch는 들어온 frame의 source MAC 주소를 인접한 Port에 연결하여 MAC table에 기록합니다.

6) S1은 들어온 패킷의 dst MAC 주소를 찾습니다. **broadcast**로 일단 주변에 **ARP request**를(들어온 포트는 제외) 다 보냅니다. 이 때 SVR2와 R1이 받게됩니다.

7) R1은받은 ARP request 패킷의 target IP주소를 찾지만 주소가 자신의 것이 아님을 확인하고는 패킷을 버립니다.(discard)

8) SVR2은 **ARP reply**로 응답합니다. **(unicast)**

![](https://i.ibb.co/zX1wSpP/image.png)

위는 ARP reply 패킷입니다.



9) ARP reply 패킷을 받은 S1은 MAC table에 이를 기록합니다.

10) S1은 MAC table을 참조하여 받은 패킷의 dst MAC 주소로 ARP reply 패킷을 fe1 port로 전송합니다.

![](https://i.ibb.co/x37024k/image.png)

11) SVR1은 ARP reply 패킷의 값을 자신의 ARP table에 기록합니다.

![](https://i.ibb.co/pXs27c4/image.png)

12) 이로써 SVR1은 SVR2에 IP packet을 보낼 준비가 되었고, port lan1으로 IP packet을 전송합니다.

![](https://i.ibb.co/m9MSNmH/image.png)



<br>

---

## Routing with ARP

![](https://i.ibb.co/2sWLh0K/image.png)



Router를 거쳐 다른 네트워크에 가는 조금 더 복잡한 상황을 생각해봅시다.

SVR1이 SVR3으로 IP 패킷을 보내는 과정입니다.



1) SVR1은 ARP request를 보냅니다.

2) R1은 ARP reply로 응답합니다.

3) SVR1은 IP packet을 R1로 보냅니다.

4) R1은 ARP request를 보냅니다.

![](https://i.ibb.co/Qk0SC0v/image.png)

5) Swtich 2는 R1로 부터온 ARP request 패킷의 src MAC 주소를 기록합니다. 그후 들어온 포트를 제외하고 ARP request를 broadcast합니다. (SVR3, SVR4로 갑니다.)

![](https://i.ibb.co/QDb1525/image.png)

6) SVR3은 ARP reply로 응답합니다.

![](https://i.ibb.co/n3yYH8Q/image.png)

7) R1은 받은 ARP reply 패킷을 ARP table에 추가합니다.

![](https://i.ibb.co/1Mk2tcS/image.png)

8) R1은 SVR3에게 IP packet을 보냅니다.

![](https://i.ibb.co/m94rzGm/image.png)







---

## Gratuitous ARP

Gratuitous : 불필요한 (그레투이터스)



자기 자신의 IP 주소를 가리키는(targeting) ARP request를 만듭니다.

즉, 누군가의 MAC주소를 알려는 의도가 아닙니다.



1) Duplicate IP 주소 탐색

​	host는 gratuitous ARP를 보내고, 다른 host로부터 응답이 있으면 host가 이미지사용하는 IP 주소가 존재함을 알 수 있습니다.



2) ARP table 갱신

​	같은 서브넷에 존재하는 host나 router의 ARP table을 갱신할 때 사용됩니다.



---

## Proxy ARP

주로 라우터가 ARP request에 응답할 때 사용하는 technique입니다.

자신의 identity를 속임으로써(faking), 라우터는 "실제" dst로 가는 라우팅 패킷에 대한 책임을 얻습니다.

Proxy ARP는 라우팅 또는 default gateway 설정 없이 서브넷에 있는 machine이 멀리 떨어진 subnet에 다다를 수 있도록 돕습니다.



장점으로는 각 네트워크마다 라우터를 가질필요없이, 한 라우터를 가지고 네트워크를 설정할 수 있습니다.

하지만 ARP traffic 양이 늘어나고, host는 ARP table에 모든 IP를 유지해야 한다는 단점이 있습니다.







---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2