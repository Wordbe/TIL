# Web UI

# 1. 서비스 개발을 위한 디렉토리 구성

웹브라우저 렌더링에 필요한 javascript와 css 파일 구성방법을 이해해봅시다.

디렉토리 구성은 곧 환경설정입니다.



1) Javascript 파일 구성

* 간단한 내용이라면 한페이지에 작성
* 의미에 맞게 구분

2) HTML안에 Javascript 구성

```html
<html>
  <head>
    <link rel="stylesheet" href="./css/main.css">
  </head>
  <body>
    <h1>Hello, my site!</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi similique, fuga illo neque iste, quam magnam modi numquam ipsam tenetur dignissimos porro, sapiente aspernatur cupiditate odit veniam dolorum doloribus provident!</p>

    <script src="js/common.js"></script>
    <script src="js/main.js"></script>
  </body>
</html>
```



* CSS는 head태그 상단에 위치

  CSS 코드가 간단해서 html의 head 안에 위치시키면 http 요청을 따로 보내지 않아 좋습니다. 하지만, 코드가 길어지면 html 파일을 수정하기 번거롭기 때문에 따로 css파일을 만들고 html에 링크를 거는 것이 좋습니다.

  ```html
  <link rel="stylesheet" href="./css/main.css">
  ```

  

* Javascript는 body태그 닫히기 전에 배치 (소스파일의 의존성에 따른 순서대로)

  브라우저는 html 코드를 위에서부터 한 줄씩 파싱하는데, head 부분에 javascript 코드를 구성하면 document가 제대로 구성되지 않은 상태에서 먼저 실행됩니다. 따라서 body에서 html코드를 구성한 다음 맨 아래 \<script\>\</script\>를 작성하는 것이 좋습니다.

   ```html
  <script src="js/main.js"></script>
   ```







---

# 2. DOMContentLoaded 이벤트

보통 로딩 이후 javascript 파일 동작이 이뤄집니다.

javascript가 실행되야 할 적절한 타이밍을 알아봅니다.



html, css 파일을 내려받고 브라우저 상 배치, 렌더링 작업이 수행됩니다. 필요한 이미지 파일을 다운받게 되고, 각 엘리먼트들의 관계가 구성되는 DOM Tree가 생성됩니다.

DOM Tree를 구성 후 event를 확인한 후에 자바스크립트를 작업하는 것이 일반적입니다.



**1) load와 DOMContentLoaded의 차이**

* 크롬개발자도구 > Network panel 에서 확인이 가능합니다.
* DOM Tree 분석이 끝나면 DOMContentLoaded 이벤트가 발생합니다.
* 그 외 모든 자원들을 내려받고, 브라우저에 렌더링(화면표시)까지 끝난시점에서 Load가 발생합니다.
* 이 때 필요한 시점에서 두 개의 이벤트를 이용해서 자바스크립트를 실행할 수 있습니다.
* 보통 DOM Tree가 만들어진 후 DOM APIs를 통해 DOM에 접근할 수 있기 때문에, 대부분 js 코드는 DOMContentLoaded 이후 실행하도록 구현하는게 빠르게 동작하는 방법이라서 이를 많이 사용합니다.



