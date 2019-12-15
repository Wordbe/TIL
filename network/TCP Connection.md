# TCP Connection

**Connection-oriented client/server application program을 위한 소켓 API**



### TCP 장점

1) Communication is transparently reliable (Byte stream connection)

2) 적절한 순서로 데이터가 전달됩니다.

3) Application 프로그래머가 아래 문제에 대해 신경쓰지 않아도 됩니다.

	* Lost, delayed packet
	* Timeouts, Retransmission
	* 복사된 packets
	* packets arriving out of sequence
	* Flow and Congestion control



![](https://i.ibb.co/r0TNfHR/image.png)



### Socket 타입

1) **Stream socket** (connection-oriented socket)

* 신뢰할만한, 연결된 네트워크 서비스 제공
* 에러 없는, 고장 없는 패킷 (TCP 사용)
* 응용: telnet, ssh, http 등

2) **Datagram socket** (connectionless socket)

* 신뢰하지 못하는, best-effort 네트워크 서비스 제공
* 패킷을 잃을 수도 있고, 고장난 채 도착할 수도 있음(UDP 사용)
* 응용: streaming audio, video (realplayer)

![](https://i.ibb.co/smMmjTv/image.png)



### Connection이란?

**"서로 상대방의 IP, Port 정보를 아는 것"**

정의된 소켓주소 쌍을 가지고 있으면 application 소켓이 연결되어있다고 합니다.

1) **host**에 대한 IP주소와 Port숫자 

2) **peer**에 대한 IP주소와 Port숫자 



### 1) Socket 생성

```c
#include <sys/types.h>
#include <sys/socket.h>

int socket(int domain, int type, int protocol);

int s;
s = socket(AF_INET, SOCK_STREAM, 0);
```



* domain : 소켓 형식(종류)

​	PF_INET(Protocol Family) 또는 AF_INET(Address Family)

* type : 통신 방식
* protocol : 소켓에서 이용할 프로토콜, 보통 0 지정(시스템이 값 결정)



오늘날까지 IP 주소체계는 오직 IP 프로토콜에서만 사용하므로,

**하나의 주소 체계가 여러 프로토콜을 지원하지 않습니다.**

리눅스 경우 모두 **AF**를 사용하길 권장합니다.



### 2) Socket Bind

```c
int bind(int s, struct sockaddr *name, int namelen)

int s;
struct sockaddr sin;

memset((char*)&sin, '\0', sizeof(sin));
sin.sin_family = AF_INET;
sin.sin_port = htons(9000);
sin.sin_addr.s_addr = inet_addr("192.168.100.1");
memset(&(sin.sin_zero), 0, 8);

bind(s, (struct sockaddr *)&sin, sizeof(struct sockaddr));
```



* 소켓을 특정 IP, Port와 바인드(연결) 합니다.
* bind()는 소켓함수가 생성한 socket descriptor s에 sockaddr 구조체인 sin에 지정한 정보를 연결합니다.
* sockaddr 구조체에 저장하는 정보는 소켓 타입, IP 주소, Port 번호입니다.



소켓 번호는 응용프로그램이 알고 있는 정보, 소켓 주소는 네트워크 시스템(TCP/IP)이 알고 있는 정보이므로 이들의 관계를 묶어야(bind) 응용 프로세스와 네트워크 시스템 간 패킷 전송이 가능합니다. 즉, application layer와 transport layer를 연결한 셈입니다.

서버는 미리지정한 포트번호**(well-known port number)**와 자신의 **IP 주소**(DNS를 통해 얻음)를 서버프로그램이 사용하는 소켓번호에 bind()로 연결하여, 클라이언트가 서비스를 받을 수 있게 합니다.



### 3) Socket Connect

```c
int connect(int s, const struct sockaddr *name, int namelen);

int s;
struct sockaddr sin;

memset((char*)&sin, '\0', sizeof(sin));
sin.sin_family = AF_INET;
sin.sin_port = htons(9000);
sin.sin_addr.s_addr = inet_addr("192.168.100.1");
memset(&(sin.sin_zero), 0, 8);

connect(s, (struct sockaddr *)&sin, sizeof(struct sockaddr));
```

* connect 함수는 클라이언트가 서버와 연결을 요청할 때 사용합니다.
* s가 가리키는 소켓을 sin이 가리키는 주소로 연결합니다.



### 4) Socket Accept

* Accept함수는 클라이언트 연결 요청을 수락합니다.
* 이 때 클라이언트와 통신을 위해 커널이 자동으로 소켓을 생성합니다.





## TCP header

![](https://i.ibb.co/277DgcD/image.png)



### Sequence number

ISN(initial sequence number)을 지정(랜덤), 맨 처음 segment의 data 크기만큼(예. 256bytes) 순차적으로 더해 뒤에 segmented stream을 만듭니다.

이에 따라 segment가 고장났더라도 receiver는 들어오는 모든 data bytes를 적절한 순서로 배열할 수 있습니다.



### Acknowledgement number

segment의 소스가 connection 파트너로부터 다음에 받기를 예상하는 바이트 번호를 hold합니다.

이 필드값은 segment의 ACK control flag bit가 설정되어있을 때만 의미있습니다.



### TCP header length

![TCP packet](https://i.ibb.co/3WyW8hq/image.png)

<div style="text-align:center;">TCP packet</div>



* IP 헤더처럼, TCP 헤더길이는 32bit로 표현됩니다. TCP header안에 포함된 TCP 옵션이 없다면 적어도 20bytes 이상이어야 합니다.

* TCP 패킷안의 DATA양은 IP 헤더의 total length 필드로부터 계산할 수 있습니다.

  Data amount = Total length - (IP header + TCP header)



### Control Flags

FIN : 연결 종료

SYN : sequence number 동기화

RST : 연결 리셋

PSH : Push the data

ACK : acknowledgement 필드값 유효한지

URG : urgent pointer 필드값 유효한지



### Establishing the connection

![](https://i.ibb.co/QQM8czr/image.png)

1) Client는 server에 접속요청메시지(SYN)를 전송하고 SYN_SENT 상태가 됩니다.

2) Server는 SYN 요청받은 후 Client에게 요청을 수락(SYN+ACK)하고 SYN_RECEIVED 상태가 됩니다.

3) Client는 server에게 수락확인(ACK)을 보내고 server는 ESTABLISHED 상태가 됩니다.





### Connection shutdown

![](https://i.ibb.co/b5Qn2QB/image.png)

ESTABLISHED : 연결되어있는 상태

1) 연결종료하고자 하는 client는 server에게 FIN=1 설정 후 전송하고 소켓을 FIN_WAIT_1 상태로 변경

2) FIN을 받은 server는 CLOSE_WAIT 상태로 변경되며 FIN에 대응되는 ACK전송

3) ACK 전송받은 client는 FIN_WAIT_2 상태로 변경되며 server의 FIN을 기다립니다.

4) server는 연결종료를 위해 FIN 패킷을 전송하고 소켓을 LAST_ACK 상태로 변경

5) FIN 받은 client는 TIME_WAIT 상태로 변경하고 FIN에 대응되는 ACK전송

6) ACK받은 server는 소켓을 CLOSED상태로 변경

7) 시간이 경과한 뒤 client도 소켓을 CLOSED상태로 변경







---

**Reference**

cose342 "Computer Network", Juho Choi, 2019-2