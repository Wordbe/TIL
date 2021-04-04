# OAuth2.0



> ## OAuth란?
>
> * 인터넷 사용자들이 비밀번호를 제공하지 않고 다른 웹사이트 상의 자신들의 정보에 대해 웹사이트나 애플리케이션의 접근 권한을 부여할 수 있는 공통적인 수단으로서 사용되는, 접근 위임을 위한 개방형 표준이다. (wikipedia)
> * 즉, 서비스별 제각각인 인증방식을 표준화한 인증방식이다.
> * 다르게 표현하면 서드파티를 사용하지 않고,  API 에 접근할 수 있도록 하는 개방형 표준 프로토콜이다.



### OAuth 사용 사례

* 구글, 페이스북과 같은 서비스 API 에 사용자 대신 접근하고 싶을 때
* 다른 서비스로 로그인 하기 기능을 구현하고 싶을 때



이제 대략 6단계에 거쳐서 OAuth 의 인증절차를 차근차근 알아보자.

---

## 1. OAuth 2.0

<br />

#### 용어 정리



![](https://i.ibb.co/6ntRNR5/2021-04-04-11-35-26.png)

* 사용자 (Resource Owner) : 애플리케이션 서비스를 사용하는 사용자(우리)를 말한다.
* 서비스 (Client) : 애플리케이션 서비스를 말한다.
* 서비스 제공자 (Resource Server) : Google, Facebook, Twitter 등 OAuth 를 통해 접근을 지원하는 제공자를 말한다.
  > Resource Server 는 사실 2개로 나눌 수 있지만, 이 글에서는 잠시 둘을 통칭하여 Resource Server로 한다.
  >
  > * Resource Server(데이터를 가진 서버)
  > * Authorization Server(인증 담당 서버)

<br />

우리가 특정 앱을 쓴다고 가정해보자. 앱은 우리에게 로그인을 요구한다. 하지만, 회원가입이란 것은 얼마나 번거로운 작업인가?



이 때 OAuth 를 사용한다면 사용자와 서비스 측에서 모두 얻을 수 있는 장점이 있다.

* 사용자:  ID, Password 를 처음보는 서비스에 넘겨주지 않아도 됨
* 서비스: 관리하기 조심스럽고, 방대할수도 있는 사용자의 ID, Password 정보를 보관하고 있지 않아도 됨

즉, OAuth2 는 사용자가 서비스에게 직접 ID, Password 등 개인정보를 제공하지 않고, 원래 가입되어 있던 Google 같은 서비스 제공자의 서비스를 이용할 수 있는 방법 제공한다.



<br />

이 때 access token을 통해 사용자를 인증하게 된다.

> #### accessToken
>
> * accessToken을 통해 서비스제공자의 서비스의 부분적 접근 허용
> * OAuth 를 통해 accessToken 을 얻을 수 있다.



---

## 2. 등록 (Register)



먼저 Client 는 Resource Server 에 등록과정을 거쳐야 한다.

![](https://i.ibb.co/mchXR3c/2021-04-04-11-41-12.png)

Client 는 Resource Server 의 사이트로 들어가서 몇 가지 정보(redirec URI 포함)를 입력하고

`clientId`, `clientSecret` 을 발급받는다.

>1. Client ID : 외부 노출 가능
>
>2. Client Secret : 외부에 노출되면 안됨
>
>3. Authorized redirect URIs : 사용자의 인증이 성공했을 경우 콜백함수로 리다이렉트할 주소이다. 예) `https://clinent/callback`



위 register 과정을 거치면 각 Client와 Resource Server는 아래 정보를 저장하고 있게 된다.

```shell
Client
* Client id : 1
* Client Secret : 2

Resource Server
* Client id : 1
* Client : 2
* redirect URL : `https://client/callback`
```



---

## 3. Resource Owner의 승인



![](https://i.ibb.co/JyHW631/2021-04-04-11-52-57.png)

**1) Resource Owner 와 Client**

Resource Owner 는 Client 의 서비스를 사용중이다.

이제 Client 서비스에서 예를 들어 구글 캘린더에 자동으로 무언가를 적는 기능을 제공한다고 해보자. (Resource Server의 A, B 기능이라고 해보자.)

Client 는 Resource Owner 에게 구글 로그인 버튼을 보여준다.

Client 는 구글 로그인 버튼에 `https://resource.server/?client_id=1&scope=A,B&redirect_uri=https://client/callback` uri 를 만든다.

<br />



**2) Resource Owner 와 Resource Server**

Resource Owner 가 그 버튼을 누르면 위에서 만들었던 uri 링크로 접속을 한다. (요청을 보낸다.)

Resource Server 는 로그인 화면을 보여준다.

Resource Owner 는 ID, PW 를 입력한다. 

Resource Sever 는 Owner가 요청했던 URL 에서 Client id 와 자신이 가지고 있던 Client id 를 비교한다. 요청에 들어왔던 redirect_uri 와 자신이 가지고 있던 redirect_uri 가 같은지도 확인한다.

비교하여 일치한다면 Resource Owner 에게 scope 에 대한 정보(A, B)를 허용할 것인지 선택하는 화면을 보낸다.

Resource Owner가 허용한다면, Resrouce Server 가 가지고 있는 최종값은 아래와 같다.

```shell
Resource Server
* Client id : 1
* Client : 2
* redirect URL : `https://client/callback`
* user id : 1
* scope : A, B
```



<br />

---

## 4. Resource Server의 승인

<br />

Resource Server는 여기서 `accessToken` 을 바로 만드는 것이 아니라,

임시 비밀번호인 ` authorization code `를 만든다.

```shell
Resource Server
* Client id : 1
* Client : 2
* redirect URL : `https://client/callback`
* user id : 1
* scope : A, B
* authorization code: 3
```



그리고 Resource Owner 에게 특정 주소로의 리다이렉트 요청을 보내도록 한다. (Location: `https://client/callback?code=3`)

그러면 Resource Owner 는 Client 에게 위 요청을 보낼 것이고, Client 는 `autorizaton code: 3` 값을 저장한다.

<br />

이제 Client 는 Resource Server 에게 아래 요청을 보낸다.

```shell
https://resource.server/token?grant_type=authorization_code&code=3&redirect_uri=https://client/callback&client_id=1&client_secret=2
```



Resource Server 는 자기가 가진 정보와 위 요청 정보가 같다면, authorization code 를 지우고, accessToken 을 발급하여 Client 에게 전송한다.

Client 도 authrization code 를 지우고, accessToken 을 가지게 된다.

```shell
Client
* Client id : 1
* Client : 2
* accessToken: 4
```



<br />

---

## 5. API 호출



### google API access token

* Header 에 정보 담기 (권장)

  ```shell
  GET /calendar/v3/users/me/calendarList HTTP/1.1
  Authorization: Bearer <access_token>
  Host: www.googleapis.com/
  ```

  ```shell
  curl -H "Authorization: Bearer <access_token> https://www.googleapis.com/calendar/v3/users/me/calendarList"
  ```

  

* 쿼리 파라미터로 url 뒤에 같이 보내기



<br />

---

## 6. Refresh Token



access token 은 수명이 있다. 일정 시간이 지나면 사라진다.



> * RFC (Request for Comments)
>
>   인터넷 관련된 기술의 표준안
>
> * Authorization (인가) : 유저에 대한 권한을 허락하는 것
> * Authentication (인증) : 유저가 누구인지 확인하는 절차

**RFC 6749 : The OAuth 2.0 Authorization Framework**



Client

```json
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

              Refreshing an Expired Access Token
```

[출처: RFC 6749: The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)

Resource Server 는 사실 Resource Server + Authorization Server



리프레시 토큰이 계속 갱신될 수도 있고, 리프레시 토큰을 만들지 않고 액세스 토큰을 갱신하는 경우도 있다.

구글API 는 리프레시 토큰을 사용한다.

```json
POST /token HTTP/1.1
Host: oauth2.googleapis.com
Content-Type: application/x-www-form-urlencoded

client_id=your_client_id&
client_secret=your_client_secret&
refresh_token=refresh_token&
grant_type=refresh_token
```

```json
{
  "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
  "expires_in": 3920,
  "scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
  "token_type": "Bearer"
}
```







