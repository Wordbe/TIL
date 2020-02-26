# REST API



# 1. Rest API

클라이언트의 종류가 웹 브라우저, 안드로이드 앱, ios앱 등 다양해지면서 클라이언트에게 정보를 제공하는 방식을 하나로 일원화해야 했습니다.

일원화시키는 방식 중에 대표적 방식이 HTTP protocol 로 API를 제공하는 것입니다.

HTTP 프로토콜로 제공하는 API를 REST API 라고 합니다.



## API

Application Programming Interface 약자입니다.

API는 응용 프로그램에서 사용할 수 있도록 os나 프로그래밍 언어가 제공하는 기능을 제어할 수 있게 만든 인터페이스를 뜻합니다.

주로 파일 제어, 창 제어, 화상 처리, 문자 제어 등을 위한 인터페이스를 제공합니다.



[ https://docs.oracle.com/javase/8/docs/api/ ]( https://docs.oracle.com/javase/8/docs/api/ ) java 8의 API 문서를 볼 수 있습니다.

자바 언어가 제공하는 클래스와 인터페이스에 대한 설명이 API 문서입니다. 자바 프로그래밍을 위해 자바 언어가 제공하는 것들이 어떤 것이 있는지 알아야 합니다.

예를 들어 절댓값을 구하기 위해서는

Java API 문서에서 Math클래스의 abs()메소드를 사용하면 된다는 것을 알 수 있습니다.

이렇게 프로그래밍을 할 때 필요한 인터페이스를 API라고 합니다.



## REST API

**REpresentational State Transfer (Roy Fielding, 2000)**

핵심 컨텐츠 및 기능을 외부 사이트에서 활용할 수 있도록 제공하는 인터페이스입니다.

블로그에 글을 저장하거나, 

우체국에서 우편번호를 조회할 수 있는 기능을 제거하거나,

구글에서 구글지도를 사용할 수 있는 것들을 말합니다.



서비스 업체들이 다양한 REST API를 제공함으로써, 클라이언트는 이를 조합한 application을 만들 수 있게 되었습니다. (메시업, Mashup)



REST는 다음과 같은 스타일(제약조건)을 지켜야 합니다.

1) client-server

2) stateless

3) cache

4) uniform interface

5) layered system

6) code-on-demand (optional)



HTTP 프로토콜의 경우 4) uniform interface를 제외하고 모두 쉽게 구현이 가능합니다.

**uniform interface를 지켜야 하는 이유?**

- 독립적 진화를 위함.

  1) 클라이언트와 서버가 각각 독립적으로 진화한다.

  2) **서버의 기능이 변경되어도 클라이언트를 업데이트할 필요가 없다.** (REST를 만들게 된 계기)



**uniform interface**

1) 리소스가 URI로 식별되어야 한다.

2) 리소스를 생성(create), 수정(update), 추가(insert)하고자 할 때 HTTP 메세지의 표현을 통해 전송해야 합니다.

3) 메시지는 스스로를 설명할 수 있어야 합니다.(Self-descriptive meassage)

4) 애플리케이션 상태는 hyperlink를 이용해서 전이되야 합니다.(HATEOAS, 헤이테오스)



여기서 3), 4) 항목은 지키기가 어렵습니다. 

응답 결과에 보통 JSON 메시지를 사용하는데, 이 메시지가 어디 전달되는지, 어떤 의미를 표현해야하는 지 정하기 쉽지 않습니다.

또한 게시판에서는 상세보기, 글쓰기로 이동하는 링크가 있고, 상세보기에서는 글 수정, 글 삭제 등이 있는데 이를 HATEOAS라고 합니다. 그런데 HATEOAS를 API에서 제공하는 것이 쉽지 않습니다.



## REST API는 쉽지 않으므로, 보통 Web API(또는 HTTP API)를 사용합니다.

REST의 uniform interface를 지원하는 것은 쉽지 않기 때문에 많은 서비스는 일반적인 web API를 만듭니다.

 또한 REST의 모든 것을 제공하지 않으면서 REST API라고 말하는 경우도 있고, Web API(HTTP API)라고 부르는 경우도 있습니다.

이 글에서는 후자의 방식을 따릅니다.



**Deview 2018, "그런 REST API로 괜찮은가"**



Web(1991)

​	인터넷 정보공유 방법? → 정보들을 하이퍼텍스트로 연결한다.

​	표현 형식 : HTML

​	식별자 : URL

​	전송 방법 : HTTP



REST(2000)

​	120 page 논문



SOAP에 비해 REST는 단순하고 규칙이 적고 ~~쉽다.~~ 어렵다.



REST

​	분산 하이퍼미디어 시스템(예. 웹)을 위한 아키텍쳐 스타일

REST API

​	REST 아키텍쳐 스타일을 따르는 API

아키텍쳐 스타일

​	제약 조건의 집합



**웹이 잘 작동하기 위한 수많은 사람들의 피, 땀과 노력**

HTML5 첫 초안에서 권고안까지 6년

HTTP/1.1 명세 개정판 작업하는데 7년



**상호운용성(interoperability)에 대한 집착**

​	Referer 오타 안 고침, charset 잘못 지은 이름 안 고침

​	HTTP 상태 코드 416 포기, HTTP/0.9 아직 지원(크롬, 파이어폭스)



**REST가 웹의 독립적 진화에 도움을 주었음**

​	HTTP에 지속적 영향

​	Host 헤더 추가

​	길이 제한 다루는 방법 명시

​	URL에서 리소스의 정의가 추상적으로 변경(식별하고자 하는 무언가)

​	HTTP, URL에 영향을 줌

​	HTTP/1.1 명세 최신판에서 REST에 대한 언급이 들어감



REST API가 아니지만, REST API라고 부른다(현재 상태)

REST API를 구현하고 REST API라고 부른다.



|               | 웹 페이지 | HTTP API  |
| ------------- | --------- | --------- |
| Protocol      | HTTP      | HTTP      |
| Communication | 사람-기계 | 기계-기계 |
| Media type    | HTML      | JSON      |



|                  | HTML           | JSON              |
| ---------------- | -------------- | ----------------- |
| Hyperlink        | 됨 (a 태그 등) | 정의되어있지 않음 |
| Self-descriptive | 됨 (HTML 명세) | 불완전*           |

*문법 해석은 가능하지만, 의미해석하려면 별도 문서(API 문서)가 필요하다.



**Self-descriptive와 HATEOAS는 독립적 진화에 아래와 같은 도움이 된다.**

**Self-descriptive**

​	**확장 가능한 커뮤니케이션,**

​	서버나 클라이언트가 변경되더라도 오고가는 메세지는 언제나 self-descriptive하므로 언제나 해석 가능

**HATEOAS**

​	**에플리케이션 상태 전이의 late binding**

​	어디서 어디로 전이가 가능한지 미리 결정되지 않는다. 어떤 상태로 전이가 완료되고 나서야 그 다음 전이 될 수 있는 상태가 결정된다. → 링크는 동적으로 변경될 수 있다.





---

**예제**



json

```json
GET /todos HTTP/1.1
Host: example.org

HTTP/1.1 200 OK
Content-Type: application/json
[
    {"id": 1, "title": "회사 가기"},
    {"id": 2, "title": "집에 가기"}
]
```

**Self-descriptive (FAIL)**

→응답 메시지 Content-Type을 보고 media type이 application/json 확인

→HTTP명세에 media type은 IANA에 등록되어있다고 하므로, IANA에서 설명 찾음

→IANA에서 application/json의 명세는 draft-ietf-jsonbis-rfc7159bis-04이므로 링크 찾아가 명세해석

→명세에 파싱하는 방법 명시 되어있으므로 파싱 성공, **하지만 "id"와 "title"이 무엇을 의미하는지 알 방법이 없다.**



**HATEOAS (FAIL)**

→다음 상태로 전이할 링크가 없다.



반면, html 은 위 두 조건을 만족한다.



→→→

**REST 하게 만들어보기**



**Self-descriptive**

**방법 1: Media type**

1) 미디어 타입 하나 정의

2) 미디어 타입 문서 작성 → "id", "title" 의미 정의

3) INAN에 미디어 타입 등록 → 만든 문서를 미디어 타입의 명세로 등록

```json
GET /todos HTTP/1.1
Host: example.org

HTTP/1.1 200 OK
Content-Type: application/vnd.todos+json
[
    {"id": 1, "title": "회사 가기"},
    {"id": 2, "title": "집에 가기"}
]
```

단점

미디어 타입 문서 작성 번거로움.



**방법 2: Profile**

1) "id", "title" 의미 정의한 명세 작성

2) link 헤더에 profile relation으로 해당 명세 링크

```json
GET /todos HTTP/1.1
Host: example.org

HTTP/1.1 200 OK
Content-Type: application/json
LInk: <https://example.org/docs/todos>; rel="rofile"

[
    {"id": 1, "title": "회사 가기"},
    {"id": 2, "title": "집에 가기"}
]
```

단점

클라이언트가 Link헤더(RFC 5988)와 profile(RFC 6906)을 이해해야 한다.

Content negotiation을 할 수 없다.



**HATEOAS**

**방법 1: data로**

data에 다양한 방법으로 하이퍼링크 표현



```json
GET /todos HTTP/1.1
Host: example.org

HTTP/1.1 200 OK
Content-Type: application/json
LInk: <https://example.org/docs/todos>; rel="rofile"

[
    {
    	"link": "https://example.org/todos/1",
    	"title": "회사 가기"
    }
]
[
    {
    	"link": "https://example.org/todos/2",
    	"title": "집에 가기"
    }
]
```



단점

링크 표현법을 직접 정의해야한다.



```json
GET /todos HTTP/1.1
Host: example.org

HTTP/1.1 200 OK
Content-Type: application/vnd.api+json
LInk: <https://example.org/docs/todos>; rel="rofile"

{
	"data": [{
     	"type": "todo",
        "id":"1",
        "attributes": {"title": "회사 가기"},
        "links": {"self": "http://example.com/todos/1" }
    }, {
        "type": "todo",
        "id":"2",
        "attributes": {"title": "집에 가기"},
        "links": {"self": "http://example.com/todos/2" }   
    }]
}
```

기존 API를 많이 고쳐야 해서 번거롭다 (침투적)



**방법 2: HTTP 헤더로**

Link, Location 등의 헤더로 링크를 표현한다.

```json
POST /todos HTTP/1.1
Content-Type: application/json

{
    "title": "점심 약속"
}

HTTP/1.1 204 No Content
Location: /todos/1
Link: </todos/>; rel="collection"
```

단점

정의된 relation만 활용한다면 표현 한계



방법 1,2 둘다 사용하면 좋습니다.



---

Hyperlink는 반드시 URI 여야 할 필요는 없다. - 하이퍼링크가 되면 된다.

Meida type 등록은 필수가 아니다. - 이해만 할 수 있으면 된다. 사실 하면 좋다.



---

**정리**

* 대부분 REST API는 사실 REST를 따르지 않는다.
* REST 제약조건 중 특히 Self-descriptive와 HATEOAS를 잘 만족하지 않는다.
* REST는 긴 시간에 걸쳐(수십년) 진화하는 웹앱을 위한 것이다.
* REST를 따를 것인지는 API 설계자들이 스스로 판단한다.
* REST를 따르겠다면, Self-descriptive와 HATEOAS를 만족시켜야 한다.
  * custom medi type이나 profile link relation 등으로 만족시킨다.
  * HTTP 헤더나 본문에 링크를 담아 만족시킨다.
* REST를 따르지 않겠다면
  * HTTP API라고 부를 수 있다
  * REST API라고 부를 수 있다.(Roy가 싫어한다..)



