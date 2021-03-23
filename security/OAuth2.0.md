# OAuth2.0



OAuth : 서드파티를 거치지 않고 API 에 접근할 수 있도록 하는 개방형 표준 프로토콜



* 구글, 페이스북과 같은 서비스 API 에 사용자 대신 접근하고 싶을 때
* 다른 서비스로 로그인 하기 기능을 구현하고 싶을 때



---

## 1. OAuth 2.0



* User 사용자 = Resource Owner
* Mine 서비스 = Client
* Their (Google, Facebook, Twitter) = Resource Server
  * Resource Server(데이터를 가진 서버)
  * Authorization Server(인증 담당 서버)



ID, Password 를 사용하지 않고, Their 서비스를 이용할 수 있는 방법 제공

* 사용자는 ID, Password 를 처음보는 서비스에 넘겨주지 않아도 됨
* 사용자의 ID, Password 정보를 보관하고 있지 않아도 됨

accessToken

* accessToken을 통해 Their 서비스의 부분적 접근 허용
* OAuth 를 통해 accessToken 을 얻을 수 있다.



---

## 2. 등록 (Register)



먼저 Client 는 Resource Server 에 등록과정을 거쳐야 한다.



1 Client ID : 외부 노출 가능

2 Client Secret : 외부에 노출되면 안됨

3 Authorized redirect URIs : `https://clinent/callback`



---

## 3. Resource Owner의 승인



위 register 과정을 거치면 아래와 같은 상황이 된다.



```shell
Client
* Client id : 1
* Client Secret : 2

Resource Server
* Client id : 1
* Client : 2
* redirect URL : `https://client/callback`
```



**1 Resource Owner 와 Client**

Resource Owner 는 Client 의 서비스를 사용중이다.

이제 Client 서비스에서 예를 들어 구글 캘린더에 자동으로 무언가를 적는 기능을 제공한다고 해보자. (Resource Server의 A, B 기능이라고 해보자.)

Client 는 Resource Owner 에게 구글 로그인 버튼을 보여준다.

Client 는 구글 로그인 버튼에 `https://resource.server/?client_id=1&scop=A,B&redirect_uri=https://client/callback` uri 를 만든다.

<br />



**2 Resource Owner 와 Resource Server**

Resource Owner 가 그 버튼을 누르면 위에서 만들었던 uri 링크로 접속을 한다. (요청을 보낸다.)

Resource Server 는 로그인 화면을 보여준다.

Resource Owner 는 ID, PW 를 입력한다. 

Resource Sever 는 여기서 받은 ID 와 자신이 가지고 있던 ID 를 비교한다. 요청에 들어왔던 redirect_uri 와 자신이 가지고 있떤 redirect_uri 가 같은지도 확인한다.

그 후에 Resource Owner 에게 scope 에 대한 정보(A, B)를 허용할 것인지 선택하는 화면을 보낸다.

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

Resource Server는 여기서 accessToken 을 바로 만드는 것이 아니라,

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



그리고 Resource Owner 에게 리다이렉트 요청을 보낸다. (Location: `https://client/callback?code=3`)

그러면 Resource Onwer 는 Client 에게 위 요청을 보낼 것이고, Client 는 `autorizaton code: 3` 값을 저장한다.

<br />

이제 Client 는 Resource Server 에게 아래 요청을 보낸다.

```shell
https://resource.server/token?grant_type=authorization_code&code=3&redirect_uri=https://client/callback&client_id=1&client_secret=2
```



Resource Server 는 자기가 가진 정보와 위 요청 정보가 같다면, authorization code 를 지우고, accessToken 을 발급하여 Client 에게 전송한다.

Client 도 autoriation code 를 지우고, accessToken 을 가지게 된다.

<br />

---

## 5. API 호출



API : Application Programming Interface



google API access token

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

* ------   Authorization Grant (인가 승인) ------>
* <------ Access Token & Refresh Token ------
* ------ Access Token ------>
* <------ Protected Resource ------
* ------ Access Token ------>
* <------  Invalid Token Error ------
* ------ Refresh Toekn ------>
* <------ Acces Toekn ------

Resource Server + Authorization Server



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







