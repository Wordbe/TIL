# 스프링 시큐리티 + OAuth2.0



로그인 서비스를 직접 구현하면 배보다 배꼽이 커짐

* 로그인 시 보안
* 회원가입 시 이메일 또는 전화번호 인증 등
* 비밀번호 찾기, 변경
* 회원정보 변경



`spring-security-oauth2-autoconfigure`

스프링부트 1.5 에서 사용하던 oauth2 를 스프링부트 2 버전 이상에서 자동설정하게 도와주는 라이브러리

기본 설정값은 `CommonOAuth2Provider` 라는 enum 에서 제공한다.

```java
public enum CommonOAuth2Provider {
  GOOGLE {
    @Override
    public Builder getBuilder(String registrationId) {
      ClientRegistration.Builder builder = getBuilder(registrationId, ClientAuthenticationMehtod.BASIC, DEFAULT_REDIRECT_URL);
      builder.scope("openid", "profile", "email");
      builder.authorizationUri("https://accounts.google.com/o/oauth2/v2/auth");
      builder.tokenUri("https://www.googleapis.com/oauth2/v4/token");
      builder.jwkSetUri("https://www.googleapis.com/oauth2/v3/certs");
      builder.userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo");
      builder.userNameAttributeName(IdTokenClaimNames.SUB);
      builder.clientName("Google");
      return builder;
    }
  }
}
```





<br />

---

## Client 등록

스프링부트 2 버전은 시큐리티에서 기본적으로 `{도메인}/login/oauth2/code/{소셜서비스코드}` 로 리다이렉트 URL을 지원한다.

Client가 별도로 리다이렉트 URL을 지원하는 컨트롤러를 만들필요가 없다. 시큐리티에서 이미 구현되어 있다.



**build.gradle**

```groovy
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
```

소셜 로그인 등 Client 가 소셜 기능 구현시 필요한 의존성이다.

`spring-security-oauth2-client` 와 `spring-security-oauth2-jose` 를 관리해준다.



<br />

spring security web 은 기본으로 로그인 페이지와 로그아웃 페이지를 제공한다.

`generateLoginPageHtml` 메소드를 통해 html String 을 리턴한다.

```java
package org.springframework.security.web.authentication.ui;

public class DefaultLoginPageGeneratingFilter extends GenericFilterBean {
  ...
  StringBuilder sb = new StringBuilder();

  sb.append("<!DOCTYPE html>\n"
            + "<html lang=\"en\">\n"
            + "  <head>\n"
            + "    <meta charset=\"utf-8\">\n"
            + "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n"
            + "    <meta name=\"description\" content=\"\">\n"
            + "    <meta name=\"author\" content=\"\">\n"
            + "    <title>Please sign in</title>\n"
            + "    <link href=\"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M\" crossorigin=\"anonymous\">\n"
            + "    <link href=\"https://getbootstrap.com/docs/4.0/examples/signin/signin.css\" rel=\"stylesheet\" crossorigin=\"anonymous\"/>\n"
            + "  </head>\n"
            + "  <body>\n"
            + "     <div class=\"container\">\n");
  ...
}
```







```json
https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&client_id=431170381530-0dbbu7ab0889gl80bbgmo98vgclat8g3.apps.googleusercontent.com&scope=profile%20email&state=YrIbcia4UCoCYoamYRA9ULd8qyBcgOvW35JS-vuO_O8%3D&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin%2Foauth2%2Fcode%2Fgoogle&flowName=GeneralOAuthFlow
```







---

## JWT

> Json Web Token 은 일반적으로 JWS 나 JWS + JWE 를 의미한다.
>
> * JWS (Json Web Signature) : JWT를 JWS 체계로 서명해서 시그니처와 함께 클라이언트로 전송한다. 시그니처는 JWT 에 포함된 권한(claim) 이 위조되거나 변경되지 않음을 보장한다. JWT가 암호화되지는 않는다.
> * JWE (Json Web Encryption) : JWE 체계에서는 내용이 서명없이 암호화된다. 

크게 세 부분 header, payload, signature 로 나눠진다.







(사용자 → provider)

GET `https://server.com/oauth2/authorization/google` 

(provider → 사용자)

로그인 화면



# Spring Security  + JWT



JWT 를 통해 무상태(stateless)로 사용자를 인증할 수 있다.

흐름은 아래와 같다.

1. 사용자가 로그인한다. (웹브라우저 또는 앱)
2. 서버는 로그인 요청을 받고 accessToken 을 생성하여 응답시 전달해준다. (이 때 accessToken은 secret 키를 가지고 JWT를 만든다.)
3. 사용자는 JWT를 저장해두었다가 다음 요청시 헤더에 accessToken을 담아 같이 보낸다. (헤더 Authorization bearer 타입)
4. 서버는 JWT 의 서명값(Signature)를 확인하여 변조되지 않은 올바른 토큰인지 확인한 후, 페이로드(payload) 에 있는 토큰 정보로 사용자를 판단한다. 사용자가 맞다면 요청한 정보를 응답으로 반환한다.

<br />

```
/oauth2/authorization/google
```



로그인 API

