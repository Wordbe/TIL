# DOM API

HTML은 동적으로 다양한게 변경될 수 있습니다.

DOM APIs에서 이를 지원하는 다양한 메서드와 속성이 있습니다.

라이브러리를 사용하기 전,

low-level의 DOM API를 먼저 배워봅니다.



querySelector

getElementById

등등..



createElement, createTextNode, appendChild

insertBefore, innerText, innerHTML, insertAdjacentHTML 등등



## 1. DOM Node 조작

DOM API



### 1 다양한 APIs

1) document.

2) element.



### 2 DOM 탐색 APIs

유용한 DOM element 속성

```console
var a = document.querySelector(".w3-table-all");
a.textContent
a.tagName
a.nodeType
a.innerHTML

탐색
a.childNodes
a.firstChild // 공백이나 텍스트 노드도 포함
a.firstElementChild // 이것을 주로 많이 씀
a.parentElement
a.nextSibling
a.nextElementSibling


a.remove();

```

a는 element 객체입니다.



### 3 DOM 조작 API

삭제, 추가, 이동, 교체

```javascript
a.removeChild()
a.appendChild()
a.insertBefore()
a.cloneNode()
a.replaceChild()
a.closest() // 상위로 올라가면서 근접 엘리먼트를 찾는다.
```



> Tip
>
> 개발자도구에서 커서로 선택한 아이템은
>
> console에서 $0; 를 엔터쳐서 접근할 수 있습니다.



DOM API를 조작하는 표준방법입니다.

```javascript
var div = document.createElement("div");
var str = document.createTextNode("좋은 하루");
div.appendChild(str);

$0;
$0.appendChild(div);
```

$0 이 지정한 태그 노드 아래에 div가 삽입이 되어

"좋은 하루"가 들어가는 것을 확인할 수 있습니다.



React, Vue, Angular 에서는 자동화 프레임워크 환경을 제공합니다.



>  Tip: 항상 **mdn** 사이트에서 example을 보면서 숙달하는 것이 좋습니다.



**insertBefore()**

```javascript
// table에서 3번째 값을 가져옴
var base = document.querySelector(".w3-table-all tr:nth-child(3)");

var parent = document.querySelector(".w3-table-all tbody");

var div = document.createElement("div");
var str = document.createTextNode("여기에 추가되었습니다.");
div.appendChild(str);
parent.insertBefore(div, base); // base앞에 div를 추가
```





### 4 HTML을 문자열로 처리해주는 DOM API

```console
a.innerText // getter, setter
a.innerHTML // getter, setter
a.insertAdjacentHTML
```



```javascript
var parent = document.querySelector(".w3-table-all tbody");
parent.innerText;
parent.innerHTML;

var html = parent.innerHTML;
parent.innerHTML = "<p>child...</p>"

$0.innerText += "add text";
```

get, set 모두 가능합니다.

노드를 만들어서 붙이는 작업을 별도로 하지않아도 되어서 편합니다.



**example.html**

```html
<body>
    <div>
        <p>Loafskfjsklfj afskdlhkqnxcv</p>
        <p>Locvakfjsklfjklq asdfkljqkljlw</p>
    </div>
</body>
```



**examplejs.js**

```javascript
var base = document.querySelector("div");
base.insertAdjacentHTML("afterbegin", "<h1>hello world</h1>");

var base2 = document.querySelector("p:nth-child(3)");
base2.insertAdjacentHTML("beforebegin", "<h1>나는 가운데 끼었어요.</h1>");

```



이렇게 pure한 DOM API 조작을 통해, 사용자가 보기에 가장 깔끔한 환경을 제공할 수 있습니다.

또한 이것이 숙달된다면, 다른 라이브러리 사용에도 문제가 없을 것 같습니다.









---

**Reference**

https://www.edwith.org/boostcourse-web/lecture/37422/