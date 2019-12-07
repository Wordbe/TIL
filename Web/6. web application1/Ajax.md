# Ajax



# 1. Ajax응답 처리와 비동기

**1) Ajax와 비동기**

새로고침없이 웹 화면의 일부분을 수정합니다.

자바스크립트 엔진과 웹 브라우저의 렌더링이 별도로 진행됩니다.



```javascript
function ajax() {
  var oReq = new XMLHttpRequest();

  oReq.addEventListener("load", function(){
    console.log(this.responseText);
  })

  oReq.open("GET", "localhost");
  oReq.send();
}
```

line 4의 익명함수는 line 8, 9보다 더 늦게 실행됩니다.

이 익명함수는 비동기로 실행되며, event queue에 보관되었다가 load 이벤트가 발생하면(서버로부터 브라우저가 데이터를 받으면) call stack에 실행 중인 함수가 없어 비어었을 시 stack에 올라와서 실행됩니다.

![](https://i.ibb.co/NC73X5Q/image.png)



---

**2) Ajax 응답처리**

서버로부터 받아온 JSON 데이터는 문자열 형태이므로 브라우저에서 바로 실행할 수가 없습니다.

문자열 파싱을 통해 문자열을 자바스크립트 객체로 변환해야 데이터에 접근이 가능합니다.



브라우저에는 JSON객체를 제공하며, 이를 통해 자바스크립트 객체로 변환할 수 있습니다.

```javascript
var jsonObject = JSON.parse("jsonStringFromServer")
```



**ajax.js**

```javascript
function ajax() {
  var oReq = new XMLHttpRequest();

  oReq.addEventListener("load", function(){
    console.log(typeof this.responseText);
    var jsonobj = JSON.parse(this.responseText);
    console.log(typeof jsonobj);
    var fruit = jsonobj.favorites[1];
    var outside = document.querySelector(".outside");
    outside.innerHTML += ("<span> " + fruit + "</span>");
  })

  oReq.open("GET", "server_example.json");
  oReq.send();
}

ajax();
```



크롬 개발자도구의 network 패널에서 UI에서 어떤 방식으로 데이터를 가져오는지 확인할 수 있습니다.



---

**3) Cross domain 문제**

XHR 통신은 보안을 이유로 다른 도메인간 요청을 금합니다.

즉, XHR에서는 Ajax 통신이 불가능합니다.



이를 회피하기 위해 **JSONP**라는 방식이 널리 사용되고 있으며,

표준방법으로는 **CORS**가 있습니다.



CORS를 사용하기 위해서는 백엔드코드에서 헤더설정을 해야하는 번거로움이 있습니다.

JSONP는 비표준이지만, 사실상 표준으로 CORS로 가기전 많은 곳에서 이용중입니다.

JSONP는 **HTML의 script 요소로부터 요청되는 호출에는 보안상 정책이 적용되지 않는다는 점을 이용한 우회 방법** 입니다.



JSONP 전송여부는 크롬 개발자도구 > network > JS 에서 확인할 수 있습니다.





---

**Philip Roberts: What the heck is the event loop anyway?**



Javascript

call stack

one thread == one call stack == one thing at a time



blocking

프로그램이 느릴 때 작동



문제는 코드를 브라우저 상에서 실행하기 때문.

하나의 코드가 실행되는 동안 다른 것이 동작할 수 없음.



solution

asynchronous callbacks



Concurrency & the Event Loop

one thing at a time, except not really

 

**Code**

코드에서 한 줄 한 줄 실행

**Call stack**

함수 실행시 call stack으로 이동

**Web apis**

비동기 함수는 web apis에서 작동한 후, callback queue에서 대기

**render queue**

매 초마다 렌더링 할 수 있는지 여부 체크 후, 렌더링

**callback queue**

call stack이 모두 끝나면, callback queue 맨 앞에 있는 것부터 실행



![](https://i.ibb.co/T0xxLz2/image.png)







---

**Reference**

https://www.edwith.org/boostcourse-web/lecture/16756/