

# OAuth2.0 이란

https://datatracker.ietf.org/doc/html/rfc6749 공식문서

**토큰 기반 인가 프레임워크 이다.**

인증 후, OAuth 로 인가를 받으면 access token 이 발급된다.

(인증이 선행되어야 인가가 진행될 수 있다.)



### OAuth 1.0 에 비해 장점

- 모바일 애플리케이션에서 사용이 용이해졌다.
- HTTPS 사용해야 하므로 보안 강화
- access token 에 만료기간이 생겼다.
- 인증 방식(Grant type, 토큰발급유형) 1가지 → 5가지로 확대
  1. 인가코드 발급 (Authorization Code Grant) : 가장 많이 쓰인다.
     - Authorization Code Grant (인가코드 발급 = 권한코드 증서) 방식의 OAuth2
  2. 암묵적 발급 (Implicit Grant)
  3. 클라이언트 증명 발급 (Client Credentials Grant)
  4. 리소스 오너 비밀번호 증명 발급 (Resource Owner Password Credential Grant)
  5. Refresh



# OAuth2를 활용하기 위해 4가지 구성이 필요함.

- Resource Owner : 사용자
- Client : 애플리케이션 서비스
- Authorization Server : **매표소**. 접근토큰, 리프레시토큰 발급, 재발급 하는 곳
- Resource Server : **검표 하는 곳**. access token 을 확인하고, scope 을 확인하고, 에러 코드와 비인가 접근에 대한 처리를 진행한다.

OAuth Provider = Autorization Server + Resource Server

RFC6749 OAuth2.0

```bash
+--------+                                           +---------------+
|        |--(A)------- Authorization Grant --------->|               |
|        |                                           |               |
|        |<-(B)----------- Access Token -------------|               |
|        |               & Refresh Token             |               |
|        |                                           |               |
|        |                            +----------+   |               |
|        |--(C)---- Access Token ---->|          |   |               |
|        |                            |          |   |               |
|        |<-(D)- Protected Resource --| Resource |   | Authorization |
| Client |                            |  Server  |   |     Server    |
|        |--(E)---- Access Token ---->|          |   |               |
|        |                            |          |   |               |
|        |<-(F)- Invalid Token Error -|          |   |               |
|        |                            +----------+   |               |
|        |                                           |               |
|        |--(G)----------- Refresh Token ----------->|               |
|        |                                           |               |
|        |<-(H)----------- Access Token -------------|               |
+--------+           & Optional Refresh Token        +---------------+

             Figure 2: Refreshing an Expired Access Token
```

<br />

<br />

# OAuth2 토큰 발급 요청 파라미터

**(Client → Authorization Server 요청 시)**

1. client_id, client_secret
   - 인가서버로 부터 인가를 받고 토큰을 받기위해 Client가 가진 id와 비밀번호가 필요하다.
2. redirect_uri
   - 토큰 발행 요청시 브라우저 제어권을 OAuth Provider 에게 주었다가, 다시 돌려 받을 때 필요하다. Resource Owner 가 이용하고자 하는 서비스는 Client 가 제공하는 서비스 이기 떄문이다.
3. response_type
   - 토큰 발급 요청시 Authorization Server 의 응답 유형에 대한 정의이다.
   - 예) Authorizatio Code 방식에서 처음에는 response_type: code 로 하여 인가코드를 받고, 그 다음에 response_type : token 으로 하여 토큰을 받는다.
4. grant_type
   - Authorization Server는 Client 가 요청한 토큰 발급 유형대로 토큰을 발급한다.
   - Implict 방식은 즉시 토큰을  발행하는 토큰발급유형이므로 grant_type 정보를 사용하지 않는다.
5. scope (optional)
   - OAuth Provider 인증시 고객(Resource Owner)에게 Client 에서 고객의 리소스 접근에 대한 동의를 물어본다. 이 때 고객이 승인한 리소스의 범위를 scope 이라고 한다.
   - Authorization Server 로 토큰을 발급 받은 후 Resource Server 를 지나서 실제 리소스에 접근하려 할 때, Client 별로 접근 가능한 리소스를 구별해놓은 정보다.
6. state (optional)
   - CSRF (Cross-site Request Forgery, 사이트간 요청위조)공격을 막기 위한 정보값
   - 토큰 발행 요청시 Client 는 랜덤 특정값을 Authorization Server 에게 전달한다. Authorization Server 는 이 값을 가지고 있는 상태로 Client 에게 응답하고, 이후는 서로를 구분짓는 표식으로써 state 값을 활용한다.

<br />

<br />

# Grant type

https://blinders.tistory.com/65?category=825013

Client 가 Authorization Server 에게 토큰을 요청할 때 발급 방법(허가 유형)을 말한다.

Grant type (토큰 부여 방식)

1. **Authorization Code : 복잡한데 널리 쓰임, 신뢰성 높음**
2. Implict : 간단하지만 신뢰성 떨어진다.
3. Client Credentials : 사용자 동의 없이 토큰 발급
4. Resource Owner Password Credentials : 사용자 id, password 를 다 넘겨주고 토큰 발급
5. Refresh : 토큰 리프레시



## Authorization Code

**Authorization Code Grant Type 은 Authorization Server 에게 토큰을 발행하기 위해 code 값을 요청하고, code 값을 바탕으로 토큰을 발급받는다.**

![https://blog.kakaocdn.net/dn/bo2Pk2/btqudUcxHtg/fJCQKYtKnTsa97iwfq1zK1/img.png](https://blog.kakaocdn.net/dn/bo2Pk2/btqudUcxHtg/fJCQKYtKnTsa97iwfq1zK1/img.png)

1. response_type=code 인가코드 받음
   - 쿼리스트링으로 받음
   - code 는 토큰 발행을 위해 단 한번만 사용될 수 있다. (Client → Authorization Server 요청시) 그래서 안전하다.
2. response_type=authorization_code 접근토큰 받음



## Implicit

**Implict Grant Type 은 Client가 토큰 발행 요청하면 Authorization Server 가 최초의 요청만으로 바로 토큰을 발행한다.**

- response_type=token
- 쿼리스트링 형태로 토큰을 발급해줌 (취약..)
- 웹 브라우저 신뢰가 높고, 신뢰할 수 없는 사용자나 애플리케이션에 노출 염려가 적을 때 사용, 모바일 앱 또는 단말기에서 동작하는 웹 애플리케이션에서 주로 이용된다.



## Client Credentials

**사용자 동의 없이 Client가 토큰발행요청하면 Authorization Server는 바로 토큰 발행해준다.**

- Resource Owner(사용자)가 아닌 Client(서비스) 가 토큰 발행을 요청할 수 있는 주체가 된다.
- Authorization Server 입장에서 Client 의 신뢰가 높을 떄 사용



## Resource Owner Password Credentials

**사용자 id, password와 함께 Client가 토큰발행요청하면 Authorization Server는 바로 토큰 발행해준다.**

- Client Credentials 와 비슷하다.
- 다만, 토큰 발행 요청시 사용자(Resource Owner)의 id, password 를 추가로 보낸다.
- 아이디 비밀번호를 그대로 Client 에게 주어야 한다.
- 토큰 발행 요청 방식이 GET 메소드여서 쿼리스트링에 id, password가 다 노출된다.



## Refresh

**access token 의 탈취시 위험을 줄이면서 사용자에게 리소스에 대한 접근 편의성을 제공한다.**

- access token 이 탈취되면 사용자의 정보를 담은 리소스 서버가 뚫린다. 따라서 접근 토큰 만료주기를 짧게 한다. 만료되면 사용자는 다시 로그인을 연장해야 한다. 불편하다.
- 따라서 refresh token은 만료주기가 짧은 접근토큰을 연장한다.
- 최초 access token 발행시 함께 발행된다.
- Authorization Code, Client Credentials Grant Type 만 refresh token 을 발급받을 수 있다.