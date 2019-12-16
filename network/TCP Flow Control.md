# TCP Flow Control



### 왜 Flow control을 사용하는가?

1986년 congestion collapse 발생, 갑작스러운 factor-of-thousand drop in bandwidth

→ 대안필요



### Flow control의 목적

* Sender는 너무 많이 빠르게 전송함으로써 receiver의 버퍼가 overflow하지 않게함.

* Sender가 보내지 않은 데이터를 receiver의 프로세싱 속도보다 빠르게 제어
  * **Receiver 측**의 전송데이터의 양이나 속도 제한
  * Receiver에서 데이터 overflow를 알리기위해 Feekback 메커니즘이 필요함



### Flow control과 Congestion control의 차이

![](https://i.ibb.co/fr9jf2n/image.png)

1) 저용량 리시버를 먹이는 빠른 네트워크 : flow control이 필요

2) 고용량 리시버를 먹이는 느린 네트워크 : congestion control이 필요



### Data-transfer

Sender는 전송할 데이터 양을 어떻게 결정하는가?

![](https://i.ibb.co/ZXsgdFB/image.png)





---

## TCP sliding window

### **motivation**

TCP의 특징은 신뢰할만한 전송을 보장하는 것입니다.

하지만, 패킷을 보내고 Ack를 받을 때까지 기다려야 하는데, link에 문제가 생겨 Ack 전송이 지연될 수 있습니다.



### **TCP window**

: Ack를 receiver로부터 받기 전에 특정 연결에서 **sender가 보낼 수 있는 unacknowledged data 양**





![](https://i.ibb.co/sKDTwXP/image.png)



### **Sliding window의 목표**

1) 데이터의 신뢰할만한 전송을 보장합니다.

2) 데이터가 순서대로 전송되도록 합니다.

3) Sender와 receiver 사이의 flow control을 실행합니다.





### **operation**

1) 고정된 크기의 sliding window를 갖는 것 대신 receiver는 sender에게 window size를 advertise합니다.

* AdvertisedWinodw 필드는 TCP header에 있습니다.

2) Sender는 어떤 시간이든 unACKed data의 AdvertisedWindow bytes보다 많이 가질수 없게 제한됩니다.

* Receiver는 연결에 할당된 메모리 양에 기반한 이 값을 선택합니다.

3) Sender와 receiver는 두드러지는 패킷을 찾기 위해 각각 **window** abstractions를 유지합니다.





### Sliding window - Sender

![](https://i.ibb.co/37BVbx9/image.png)

* SWS :: Sender가 전송할 수 있는, Acked가 아닌 outstanding frames의 수의 상한선

* LAR :: 최근 받은 ACK의 sequence number
* LFS :: 최근 보낸 frame의 sequence number



![](https://i.ibb.co/r4jtscr/image.png)

* ACK 받으면→ LAR은 오른쪽으로 1칸 이동
  * Sender는 한 frame을 더 보낼 수 있게 됩니다.
* Sender가 전송한 각 프레임에 timer를 결부짓습니다.(associate)
* Timer가 시간이 끝나면 Sender는 frame을 재전송합니다.
* Sender buffer :: SWS frames 까지



### Sliding window - Receiver

![](https://i.ibb.co/DRLwfgf/image.png)





![](https://i.ibb.co/JzL5G3y/image.png)



**Wireshark example**

![](https://i.ibb.co/LgbK6tr/image.png)

Client는 Window size를 0으로 설정하여 TCP segment를 보냅니다.

1) 181번 패킷 : win=0 → 이 때 sender는 더이상 패킷을 보낼 수 없다는 것을 알게됩니다.

2) 182번 패킷 : win=22656 이기 때문에 패킷을 client는 accept합니다.

3) 183~197번 패킷 : normal TCP communication. Acked되지 않은 segments의 수는 보이지 않습니다. 보내졌지만 ACKed되지 않은 bytes 수는 20272bytes임을 조사하여 확인할 수 있고, 이는 sender가 2280bytes(22656 - 20272)만큼 더 보낼 수 있다는 것을 의미합니다. 만약 sender가 ACK를 받는 다면 멈추게 될것입니다.

4) 198번 패킷 : Receiver(client)은 ACK=41096384389로 설정함으로써 some of bytes를 acknowledege하기로 합니다. 이는 receiver가 sender에게 "이 byte까지 모든 bytes를 받았어"라고 응답하는 것과 같습니다. **Receiver는 실제로 패킷 183을 sender로부터 acknowledged 한 것입니다.**



![](https://i.ibb.co/1LzJvFT/image.png)

* SEQ number (4109683925) 는 TCP segment에서 첫번째 byte이고, payload는 464bytes입니다. last byte가 (4109684388)임을 의미합니다.
* 따라서 ACK pkt 198에서 receiver는 ACK 4109684389를 설정함으로써 last byte 4109684388을 acknowledge 한다고 할 수 있습니다.



5) ACK는 여기로부터 그것을 가져오고싶다는 뜻이며, win=22272는 4109684389로부터 22272bytes만큼 보낼 수 있다는 의미입니다.



6) Pkt 183에서 transaction이 시작되면, receiver는 win=22656으로 설정하지만, latest ACK(Pkt 198)에 있습니다. 이것은 window size를 22272로 줄여줍니다. 따라서 sender는 더적은 bytes를 보내야 하며, 아래 이미지는 어떻게 윈도우가 sliding하여 동시에 감소하는지 보여줍니다.

![](https://i.ibb.co/3z9xjH5/image.png)



7) Pkt 199 (1448 bytes) 와 Pkt 200 (552 bytes)는 이 usable window 2000bytes로 채워진 sender로부터 전송되었습니다. 따라서 receive window에 남은 공간이 없으므로 wireshark는 즉시 탐색을 종료하고 [TCP Winodw Full] 메세지를 띄웁니다.



---

## Silly window Syndrome

Sender는 빠르게 데이터를 생성합니다.

Receiver는 한번에 한 octet씩 들어오는 데이터를 읽습니다.



* 한 application이 **한번에 한 byte씩 데이터를 생성한다면, 네트워크는 packet이 overload될것입니다.**

  1 byte씩 single character를 생성하면 41 bytes(1byte data + 40bytes 헤더) 패킷의 전송을 초래합니다.

* 문제 :
  * **네트워크 대역폭의 poor use**
  * **불필요한 computational overhead**





---

## Sender-side Silly Window Avoidance

### Nagle's algorithm

가능한 많은 횟수로 전송하는 것이 아닌, **"가능한 많은 전송(Effective TCP)"**원리에 기반한 알고리즘입니다.



* 전송할 데이터가 있는데, 윈도우가 MSS(Maximum Segment Size)보다 적게 open되어있다면, 가용한 데이터를 전송하기 전에 충분한 시간을 기다릴것입니다.
  * 기다리는 시간이 너무 길면, 상호 applicatioin에 부작용이 생깁니다.
  * 충분히 기다리지 않으면, 작은 패킷 더미를 보내고 silly window syndrome에 빠지는 위험을 감수해야 합니다.
* 해결책 : 타이머를 도입하고, 타이머가 만료되면 전송하면 됩니다.



* clock-based 타이머(예를 들면 100ms 후 만료)를 사용할 수 있습니다.
* Nagle은 **"elegant self-clocking"** solution을 도입합니다.
* Key idea :
  * 전송시 TCP가 데이터를 가지고 있는 한, sender는 결국 ACK를 받게 될 것입니다.
  * 이 **ACK**는 더 많은 데이터의 전송을 유발하면서 **timer firing**처럼 취급될 수 있습니다.



**Nagle's Algorithm**

1) 첫째 데이터는 무조건 전송됩니다.

2) 다음 데이터부터는 아래 두 규칙 중 하나를 만족시키면 전송합니다.

​	**2-1) MSS (Maximum Segment Size)** : 데이터가 segment에서 맞는 최대 크기로 모아지면, 데이터를 전송합니다.

​	**2-2) 이전 단계에서 전송된 데이터의 ACK을 sender가 받았으면**, sender가최대 크기로 데이터를 모으지 않더라도 데이터를 전송합니다. (더 기다리면 application 성능에 영향을 미치기 때문입니다.)





---

## Receiver-side Silly Window Avoidance

**두 가지 접근**

1) Receiver는 받은 데이터를 ACK할 수 있지만, increase가 중요할 때까지 window에서 increase를 advertise하지는 않습니다.

​	*** Clark's alogrithm :**

​	리시버 윈도우(rwnd)가 충분히 크지 않으면 충분히 커지기 전까지는(한 패킷을 만들 정도로 커질 경우), rwnd = 0으로 하여 보냅니다.

2) Receiver는 winodow가 advertise하기에 충분히 크지 않은 경우 ACKs를 보낼 수 없습니다.

​	*** ACK blocking** : 충분히 빈공간이 있을 때, ACK가 보내집니다.





---

## TCP delayed acknowledment

네트워크 성능을 올리기 위해, 몇몇의 ACK 응답은 합쳐져서 하나의 응답으로 보내어져 프로토콜 overhead를 줄입니다.



### 문제점

* Delayed ACK로 인한 추가적인 대기 시간이 더 많은 지연을 야기할 수 있습니다.





## Retransmissions in TCP

TCP sender는 segment를 잃었다고 생각했을 때 segment를 재전송합니다.

1) 어떤 ACK도 받지 않고, timeout이 발생

2) 여러개의 ACKs가 같은 segment에 대해 받아졌을 때



### Receiving duplicate ACKs

1) 3개 이상 duplicate ACks가 받아지면, TCP sender는 segment를 잃었다고 생각합니다.

2) TCP는 timeout을 기다리지 않고 잃어버렸을 것이라고 생각한 segment를 재전송합니다.

![](https://i.ibb.co/p1Zj4DD/image.png)



### Retransmission Timer

1) TCP sender는 각 연결마다 한개의 retransmission timer를 유지합니다.

2) 타이머가 **retransmission timeout(RTO)**에 다다르면, sender는 ACK 되지 않은 첫번째 segment를 재전송합니다.

* Timer는 아래 조건에서 시작됩니다.

  1) Packet(with payload)가 전송되고 timer가 실행되지 않을 때,

  2) 새로운 데이터를 acknowledge하는 ACK가 도착할 때

  3) segment가 재전송될 때

* Timer는 모든 segment가 ACK될 때 종료됩니다.



### Timer 설정 방법

**Retransmission Timer**의 설정은 **TCP의 성능향상에 중요합니다.**

Timout값이 너무 작으면 불필요한 재전송이 많아집니다.

Timout값이 너무 크면 재전송되기 전 많은 시간을 기다립니다.

→ 네트워크 안에서 지연시간이 정해져있지 않으므로 timer는 **적응적(adaptive)**이어야 합니다.



### RTO 값 설정

RTO값은 각 TCP가 수행하는 RTT(round-trip time)에 기반하여 설정됩니다.

* 각 TCP 연결은 segment 전송과 해당 ACK의 수령 사이 시간차를 측정합니다.

![](https://i.ibb.co/hdrKwjK/image.png)

* 지연(srtt)과 지연의 분산(rttvar)의 추정값을 계산하기 위해 exponential moving average를 사용합니다.

$$
\begin{gather}
srtt_{n+1} = a \ RTT + (1-a) srtt_n \newline 
rttvar_{n+1} = b (\vert RTT - srtt_n \vert) + (1-b)rttvar_n \newline 
RTO_{n+1} = srtt_{n+1} + 4 rttvar_{n+1}
\end{gather}
$$

$gain: a = 1/4, b = 1/8$



* 초깃값

$$
RTO_0 = 3 seconds
$$

$$
srtt_1 = RTT
$$

$$
rttvar_1 = RTT / 8
$$

* timout이 발생했을 경우, RTO값은 2배 **(Exponentail backoff)**

$$
RTO_{n+1} = min(2RTO_n, 64)
$$



---

### Karn's Algorithm

재전송된 segment 에 대한 ACK를 받았을 때, sender는 ACK가 원본 또는 재전송에 속하는지 알 수 없습니다.

즉 이 경우 RTT 측정이 애매합니다.



**Karn's algorithm**

재전송된 segment에서는 RTT를 갱신하지 않습니다.

ACK가 재전송되지 않은 segment로 부터 받았을때에만 RTT 측정을 재시작합니다.



### Mesurements 해석

![](https://i.ibb.co/HDLh3Wj/image.png)

* 재전송시도 사이 간격(초)은 아래와 같습니다.

| 0~1  | 1~2  | 2~3  | 3~4  | 4~5  | 5~6  | 6~7  | 7~8  | 8~9  | 9~10 | 10~11 | 11~12 | 12~13 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- | ----- | ----- |
| 1.03 | 3    | 6    | 12   | 24   | 48   | 64   | 64   | 64   | 64   | 64    | 64    | 64    |

* Exponential Backoff Alogrithm에 의해 재전송간 시간은 매시간마다 두배가 되었습니다.
* 64초 이후로는 증가하지 않습니다.
* TCP는 13번째 시도, 9분후 작업을 포기합니다.







---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2