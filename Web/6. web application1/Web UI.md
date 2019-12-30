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



test.js

```javascript
window.addEventListener("DOMContentLoaded", ()=> {
  console.log("window Loaded.");
});

document.addEventListener("DOMContentLoaded", ()=> {
  console.log("DOM Loaded.");
});
```



위 코드를 실행시키고, 콘솔창을 보면 DOM이 window 보다 먼저 load된 것을 알 수 있습니다.



js 코드를 DOMContentLoaded 후 실행하도록 하려면 보통 아래와 같이 코드를 구성합니다.

```javascript
function init(){
  var base = document.querySelector(".outside");
  base.style.transform = "scale(4)";
  base.style.left = "300px";

  var target = document.querySelector(".outside");
  var btn = document.querySelector("button");
  btn.addEventListener("click", ()=>{
    var prev = parseInt(target.style.left);
    target.style.left = prev + 100 + "px";
  });
}



document.addEventListener("DOMContentLoaded", ()=> {
  console.log("DOM Loaded.");
  init();
});
```



load 이후에 작업을 하는 것들은 실제로 많이 사용하지 않습니다.

예를 들어 이미지 크기에 맞게 엘리먼트 크기들이 조정되어야 한다면 로드가 끝난 후 스크립트가 실행되어야 합니다.





---

# 3. Event Delegation

list(목록)가 여러 개인 UI에 각각 비슷한 이벤트를 걸어서 처리하는 방법을 알아봅니다.

* Event Delegation
* Bulbbling
* Capturing



**1) 이벤트 등록**

가로로 배치된 책 리스트, 각각 리스트에 클릭을 할 때 이벤트 발생 → addEventListener를 사용해서 이벤트 등록



```javascript
var log = document.querySelector(".log");
var lists = document.querySelectorAll("ul > li");

for (var i=0, len=lists.length; i < len; ++i){
  lists[i].addEventListener("click", function(evt){
    log.innerHTML = "IMG URL is " + evt.currentTarget.firstElementChild.src;
  });
}
```



브라우저는 4개의 이벤트리스너를 기억하고 있는데,

list 요소가 많다면 비효율적이게 됩니다.

또한 list한 개가 동적으로 추가되면, 엘리먼트에 addEventListener를 해주어야 합니다.



target 정보를 이용해 해결해봅시다.

```javascript
var ul = document.querySelector("ul");

ul.addEventListener("click", (evt)=> {
  // IMG, UL
  console.log(evt.target.tagName, evt.currentTarget.tagName);
})
```



ul > li > img 로 구성되어있는 html에서

img태그를 클릭했다면 UL에 등록한 이벤트 리스너도 실행이 됩니다.

즉 클릭한 지점이 하위 엘리먼트여도 그것을 감싸는 상위 엘리먼트까지 올라가면서 이벤트리스너가 있는지 찾아냅니다. 이를 **이벤트 버블링(Event Bubbling)**이라고 합니다.



![](https://i.ibb.co/9WJyYLT/image.png)



1 ul > 2 li > 3 img에서 각 엘리먼트에 모두 이벤트가 등록되어있다고 가정합시다.

하위엘리먼트인 3번부터 이벤트가 발생하고, 2, 1 순으로 이벤트가 발생하는 것이 **Bubbling**입니다.

반대로, 작동하는 것은 **Caputring**이라고 하며, addEventListener 메서드 3번째 인자를 true로 설정하면 됩니다.



```javascript
var ul = document.querySelector("ul");

ul.addEventListener("click", (evt)=> {
  var target = evt.target;
  // 이미지를 누르면 이미지 URL 출력
  if (target.tagName === "IMG"){
    log.innerHTML = "IMG URL은, " + target.src;
  }
  // 이미지가 아닌 border(li) 눌러도 이미지 URL 출력이 되게 함
  else if (target.tagName === "LI"){
    log.innerHTML = "IMG URL은, " + target.firstElementChild.src;
  }
})
```



위 코드는 자식노드 모두에게 이벤트를 등록하지 않고, 상위엘리먼트에 이벤트를 등록을 해서

효율적이게 표현하는 방법입니다.

이처럼 .target을 이용하는 방법은 매우 좋습니다.

이를 **event delegation(이벤트 대표위임)** 이라고 합니다.



실습을 위한 추가 소스코드

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" type="text/css" href="css/style.css">
</head>

<body>
  <ul>
    <li>
      <img src="goodTestPairs/Real_blur(clean).png" class="product-image">  </li>
    <li>
      <img src="goodTestPairs/Real_crumpled_shade(clean).png" class="product-image"> </li>
    <li>
      <img src="goodTestPairs/Real_shade(clean).png" class="product-image"> </li>
    <li>
      <img src="goodTestPairs/Real_shade.png" class="product-image"> </li>
  </ul>

  <section class="log"></section>
  <script src="animation.js"></script>
</body>
</html>
```



style.css

```css
.product-image {
  width: 150px;
  height: 150px;
}

ul > li {
  /* width: 170px;
  height: 100px;
  float: left; */
  display: inline-block;
  padding: 10px;
  border: 1px solid gray;
  background-color: rgb(253, 253, 100);
}
```





# 4. HTML Templating







---

**Reference**

https://www.edwith.org/boostcourse-web/lecture/16760/

