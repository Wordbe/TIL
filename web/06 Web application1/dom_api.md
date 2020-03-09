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

DOM API를 조작하는 표준방법입니다.

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









---

**appendChilde(Node)**

parent.appendChilde(Node) 형식으로 쓰입니다.

parent 마지막에 node를 붙입니다.

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



---

**insertBefore(Node, Base)**



parent.insertBefore(Node, Base) 형식으로 쓰입니다.

parent의 자식노드 base앞에 node를 삽입합니다.



insertBefore은 새로운 노드를 추가할 뿐만 아니라,

원래 있던 노드를 옮기는 데 사용됩니다.(잘라내기 → 붙여넣기 원리입니다.)



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

### **실습**



**실습1**

지금 나온 DOM API를 사용해서, strawberry 아래에 새로운 과일을 하나 더 추가하시오.

추가 된 이후에는 다시 삭제하시오.

[링크 바로가기](http://jsbin.com/mebuha/1/edit?html,js,output)



**실습2**

insertBefore메서드를 사용해서, orange와 banana 사이에 새로운 과일을 추가하시오.



**실습3**

실습2를 insertAdjacentHTML메서드를 사용해서, orange와 banana 사이에 새로운 과일을 추가하시오.



**실습4**

apple을 grape 와 strawberry 사이로 옮기시오.



**실습5**

class 가 'red'인 노드만 삭제하시오.

[링크 바로가기](http://jsbin.com/redetul/1/edit?html,css,js,output)



**실습6**

section 태그의 자손 중에 blue라는 클래스를 가지고 있는 노드가 있다면, 그 하위에 있는 h2 노드를 삭제하시오.

[링크 바로가기](http://jsbin.com/ricopa/1/edit?html,css,js,output)





**풀이**

```javascript
// #1
var mango = document.createElement("li");
var mangoText = document.createTextNode("mango (appendChild)");
mango.appendChild(mangoText);
var parent = document.querySelector("ul");
parent.appendChild(mango);

// #2
var melon = document.createElement("li");
var melonText = document.createTextNode("melon (insertBefore)");
melon.appendChild(melonText);
var banana = document.querySelector("li:nth-child(3)");
parent.insertBefore(melon, banana);

// #3
var orange = document.querySelector("li:nth-child(2)");
orange.insertAdjacentHTML("afterend", "<li>melon (insertAdjacentHTML)</li>");

// #4
var apple = document.querySelector("li:nth-child(1)");
var strawberry = document.querySelector("li:nth-child(7)");
parent.insertBefore(apple, strawberry);

// #5
var reds = document.querySelectorAll("li.red");
var parent = document.querySelector("ul");
for (var i=0; i<reds.length; ++i){
  parent.removeChild(reds[i]);
}

// #6
var blues = document.querySelectorAll("section .blue");

for (var i=0; i<blues.length; ++i){
  var closestSection = blues[i].closest("section");
  var h2 = closestSection.querySelector("h2");
  closestSection.removeChild(h2);
}

또는

blues.forEach((val)=>{
  var closestSection = val.closest("section");
  var h2 = closestSection.querySelector("h2");
  closestSection.removeChild(h2);
});

또는 blues가 arraylike 타입이라서 array가 아닌경우 Polyfill 코드가 필요

Array.from(blues).forEach((val)=>{
  var closestSection = val.closest("section");
  var h2 = closestSection.querySelector("h2");
  closestSection.removeChild(h2);
});
```







---

**Reference**

https://www.edwith.org/boostcourse-web/lecture/37422/