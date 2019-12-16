# TCP Congestion Control



## Congestion control

**Congestion이란?**

* 네트워크가 다루기에 너무 많고 빠른 소스 전송

* Flow control과는 다릅니다.

* manifestation 명시

  1) lost packets(라우터에서 buffer overflow)

  2) long delay(라우터 버퍼에서 queueing)



### Causes/costs of congestion

**시나리오1**

두개의 sender, 두개의 receiver

하나의 router, 무한대의 버퍼

재전송없음

C는 출력링크의 수용력

![](https://i.ibb.co/nbzZjgk/image.png)

* congested됐을 때 large delay
* 최대 달성 throughput



<br>

---

**시나리오2**

하나의 라우터, 유한개의 버퍼

sender는 lost 패킷을 재전송함

* timout 패킷의 재전송이 수행됩니다. 즉, queue가 유한하면 패킷 loss가 발생합니다.

![](https://i.ibb.co/zPzPK8L/image.png)

A : 이상적 상황 : Sender는 라우터 버퍼가 가용할 때만 packet을 전송합니다. 따라서 packet이 손실되지 않습니다.

B : 덜 이상적 상황 : Sender는 패킷을 잃어버릴때만 재전송합니다. 라우터 버퍼가 꽉차서 패킷을 잃을수도 있기 때문입니다.

C : 가장 현실적 상황 : 라우터 버퍼는 꽉찰 것이고, 패킷은 잃어버리게 될 것입니다. 패킷은 상당히 지연될것이고 sender의 timer는 timeout되어 두 상황모두 재전송이 일어납니다. 즉, 패킷의 심각한 지연 때문에 불필요한 재전송이 증가합니다.

* Congestion의 비용:

  "goodput"에 대한 더많은 재전송, 불필요한 재전송





<br>

---

**시나리오3**

4개의 sender

multiho paths

timout/retransmit

![](https://i.ibb.co/mHhF7Wk/image.png)

* 데이터 트래픽이 증가함에 따라, congestion이 커지고, 지연시간도 증가합니다.

* 또 다른 Congenstion 비용 :

  패킷이 드랍될 때, 패킷에 사용된 upstream 전송 용량이 낭비됩니다.





---

### TCP Congestion window

* TCP에서 **sender의 window size**는 **receive window size(RcvWindow)** 뿐 아니라 **네트워크의 congestion**에 의해서도 조정되어야 합니다.

* **congestion window(CongWin)는 sender에 의해 유지됩니다.**

  (cf. slinding window size는 receiver에 의해 유지됩니다.)



* **CongWin**은 **sender에 의해 계속적으로 재계산되는 동적 파라미터입니다**. 감지된 네트워크 congestion에 대한 함수로서 값이 변경됩니다.

![](https://i.ibb.co/hdmkLGb/image.png)



---

## TCP Congestion Control

1) End-to-End control (네트워크 도움 없이)

2) Sender는 unAcked 데이터의 양을 제한시킴으로서 전송을 제한시킴

​	**LastByteSent - LastByteAcked $\le$ CongWin(cwnd) $\le$ rwnd**

3) Sender의 전송률
$$
rate = \frac{CongWin}{RTT} Bytes/sec
$$
4) **Sender가 congestion을 감지하는 방법**

* loss event = **timout 또는 3 duplicate Acks**

* TCP sender는 loss event 후 rate(CongWin)을 감소시킵니다.



5) 3가지 메커니즘:

​	AIMD, Slow start, Conservative after timeout event



6) sender가 ACK 수령에 실패하거나, timer가 만료되었다면, pakcet loss가 발생했기 때문에 congestion으로 인식합니다.

→ sender는 cwnd를 줄임으로서 데이터 전송 속도를 조절합니다.



7) sender는 packet loss가 일어날 때까지 가용한 bandwitdh를 탐지하면서 cwnd를 증가시킵니다.





---

### TCP AIMD

1) **Multiplicative Decrease:** loss event후 CongWin을 절반으로 줄임

2) **Additive Increase:** loss event의 부재에서 RTT마다 1MSS씩 CongWin 증가시킴 (probing)

![](https://i.ibb.co/x8M5qxj/image.png)



---

### TCP Slow Start

1) 연결 시작시 **CongWin = 1MSS**

2) 연결 시작시 첫째 loss event까지 지수적으로 빠르게 속도 증가

	* CongWin은 매 RTT마다 2배
	* 매 ACK 수령마다 CongWin 증가가 이루어짐

3) 가용한 bandwith >> MSS / RTT

![](https://i.ibb.co/rb3mxfv/image.png)

* 이미 꽉찬 환경일수도 있기 때문에

  첫 phase에서 Congenstion을 피하기 위해, 네트워크에 전송하는 데이터의 양을 늘려가며 조심히 적절한 window size를 조사합니다.

  1) TCP sender가 빠르게 올바른 window size를 찾을 수 있게 도와줍니다.

  2) 연결초기에 약간의 delay가 있습니다.



* 초기 속도는 느리지만, 지수적으로 빠르게 증가합니다.(ramps up)

![](https://i.ibb.co/gSKhDhQ/image.png)



<br>

---

### TCP Congestion policy

* 3 duplicate ACKs 후에는

  CongWin 절반으로, window는 선형적으로 증가

* Timeout 후에는

  CongWin은 1MSS로 설정, window는 지수적으로 증가, threshold에서 선형적으로 증가

![](https://i.ibb.co/d07NLfM/image.png)

* 3 duplicate ACKs 후에는 TCP가 consgestion가 있지만, 몇몇의 segment는 Acked되었기 때문에 네트워크는 여전히 작동한다고 결론을 내립니다.
  - **Fast recovery** : **재전송 timeouts에 대한 대기시간을 줄이는 것이 목적입니다.**
* Timout 후에는 네트워크가 응답이 없어 더 악화된 상황입니다.
  * slow start의 threshold는 timeout 시점에서의 CongWin의 절반값입니다.



<br>

---

### TCP Variation

end-to-end congestion control을 달성하기 위해 다른 알고리즘을 사용하는 TCP의 구현입니다.

Tahoe, Reno, NewReno, Vegas

SACK, Rome, Paris



### **TCP Tahoe Window control**

* TCP sender는 두개의 새로운 변수를 유지합니다.

1) **cwnd** : congenstion window

​	초깃값 cwn = 1 MSS

2) **ssthresh** : slow-start threshold

​	초깃값 ssthresh = 65535(매우높게)



* **send_win = min(rwin, cwnd)**

  TCP에서 sendor의 윈도우 사이즈는 RcvWindow, congestion 둘다에 의해서 조절되어야 합니다.







---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2