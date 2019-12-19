# IP Sec



## 서론

* 인터넷을 위한 원래 디자인 모델

  인터넷 상 데이터는 누가 공유하고 수정하든 자유였습니다.

  하지만 많은 사람들이 사용하게 되면서 security가 필요하게 되어졌습니다.



### Internet Threats

1) Identity spoofing

2) 서비스 거절

3) privacy 침해

4) data integrity loss

5) replay attack



### Solution

1) Confidentiality

2) Integrity

3) Authentication



### Security CIA Triad

![](https://i.ibb.co/wKFbXYB/image.png)



### Public-key Cryptography

유저는 두개의 키를 생성 합니다. public key와 private key 쌍입니다.

* mutually cancelling
  * public key로 encrypt한 것은 private key로 decrypt할 수 있습니다.
* 공개키는 모두에게 알려져있습니다.
* 암호키는 감추어져 있습니다. 유저만 해독할 수 있습니다.
* private으로 encryption 하는 것을 digital signature라고 합니다.



### 각 층마다 Security Measures 

![](https://i.ibb.co/WttB1xW/image.png)





## IPSec

Security at IP layer

IPsec은 IETF에서 개발된 표준 오픈 프레임워크입니다.



* IPsec은 IP 층을 통과하는 모든 traffic에 보안을 제공합니다.
* end user는 보안 메커니즘을 배울 필요가 없습니다.
* IPsec은 각 유저별 보안을 제공하는 granularity를 가집니다.

* IPsec은 라우팅 아키텍쳐를 보호하는 추가적인 이점을 가집니다.



### IPsec Service

IPsec은 프로토콜이 아닙니다. 네트워크 레이어에서 보안을 제공하는 서비와 프로토콜의 집합을 일컫는 용어입니다.

![](https://i.ibb.co/VvhTZ5B/image.png)

1) 접근 제어

2) connectionless integrity

3) 데이터 원본 인가

4) replayed 패킷의 rejection

5) Confidentiality

6) 제한된 traffic flow confidentiality



### IPsec 기술

1) Diffie-Hellman key exchange - peers 간 키를 형성

2) Encryption (DES) - confidentiality 제공

3) Keyed hash 알고리즘 (MD5, SHA-1) - 메시지 인가 제공



### IPsec 구조

![](https://i.ibb.co/WtRSVyw/image.png)

AH : Authentication header (인가 헤더)

ESP : Encapsulating Security payload

IKE : Internet Key Exchange



### 1) Security Association (SA)

**"두 노드가 정보를 교환하기 위해 Key를 주고 받는 과정"** 입니다.

보안 연관

SA 당 오직 하나의 서비스가 가능합니다 : AH 또는 ESP



SA를 identify하는 3요소

1) Security Parameter Index(SPI)

2) IP Destination Address

3) Security Protocol Identifier



### 2) Security Policy Database (SPD)

* 인터페이스를 통과하는 모든 IP traffic에 대한 정책을 정의합니다.

* IP header 정보에 기반해서 3가지중 하나의 action을 취합니다.

  : Protect, Discard, Bypass



### 3) IPsec 구성요소

1) Authentication Header(AH) 와 Encapsulating Security Protocol(ESP)

2) Internet Key Exchange(IKE)

​	: 두 peers 사이에서 SA를 협상하고 keying material을 교환합니다.



![](https://i.ibb.co/4KvMqfM/image.png)



### 4) IPsec 모드

1) Transport Mode - 상위 레이어 프로토콜을 보호합니다.

![](https://i.ibb.co/J5PFymV/image.png)

기존 IP datagram에 **IPSec Header** 삽입



2) Tunnel Mode - 전체 IP payload를 보호합니다.

![](https://i.ibb.co/4WzwZjn/image.png)

기존 IP datagram에 **IPSec Header, Original IP Header** 삽입



### 5) Authentication Header (AH)

* 이 정보는 헤더에 추가되어 다음 서비스를 제공합니다.
  * Access Control
  * Connectionless integrity
  * Data origin authentication
  * Rejection of replayed packets
* 추가 정보
  * Sequence number(32bit)
  * Integrity check value



1) source authentication과 data integrity를 제공합니다.

**2) Packet encryption은 지원되지 않습니다.**

3) source spoofing과 replay attack을 막을 수 있습니다.

![](https://i.ibb.co/ZMbf4v3/image.png)

4) Anti-replay attack

5) Integrity Check Value(ICV)





### 6) ESP : Encapsulating Security Payload (ESP)

서비스 종류 3가지

1) confidentiality only

2) Integrity only

3) confidentiality and Integrity



다른 것

1) Anti-replay service

2) Limited traffic flow confidentiality



1) source authentication과 data integrity를 제공합니다.

**2) Packet encryption이 지원됩니다. (symmetric key encryption 이용하여서)**

3) 리시버는 이전 교환된 키를 사용하여 데이터를 decrypt합니다.



![](https://i.ibb.co/PZsWJFP/image.png)



![](https://i.ibb.co/Rc62JSd/image.png)





### 7) Internet Key Exchange (IKE)

IKE는 SA와 협상한, peers간 인가시킨 보안 채널을 생성합니다.



**phases**

1) Authentication

2) Key Exchange

3) Establishing SA





### 8) Authentication

IPsec에서 두 peers는 서로 identify가 필요합니다.

1) Pre-shared keys

2) Public key cryptography





## 결론

* IPsec은 public network에서 보안 private network 생성을 위한 방법을 제공합니다.

* Application과 OS는 바뀔 필요가 없습니다.
* IPsec 기반한 상품은 상업적으로 고갈되었습니다.
* 사용자는 자기 기계에 IPsec을 사용할 수 있습니다.



---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2