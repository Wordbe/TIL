# Tab UI

Tab은 자주 사용되는 UI 중 하나 입니다.

많은 컨텐츠를 효과적으로 보여줄 수 있습니다.



---

**1) 자주 보는 Tab UI 형태**

상단 메뉴를 누르면, 새로고침 없이 아래 내용이 변경됩니다.

![](https://i.ibb.co/MMhw9FB/image.png)



기본 코드

```html
<html>
  <header>
    <style>
      h2 {
        text-align: center;
      }
      h4 {
        margin: 0px;
      }
      .tab {
        width: 600px;
        margin: 0px auto;
      }
      .tabmenu {
        background-color: bisque;
      }
      .tabmenu > div {
        display: inline-block;
        width: 140px;
        text-align: center;
        height: 50px;
        line-height: 50px;
        cursor: pointer;
      }
      .content {
        padding: 5%;
        background-color: antiquewhite;
      }
    </style>
  </header>
  <body>
    <h2> TAB UI TEST </h2>
    <div class="tab">
      <div class="tabmenu">
        <div>crong</div>
        <div>jk</div>
        <div>pobi</div>
        <div>honux</div>
      </div>
      <section class="content">
        <h4>hello jk</h4>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Error dignissimos nostrum voluptates atque fuga natus molestiae distinctio provident perferendis consequatur, ipsum saepe libero omnis quibusdam obcaecati placeat quidem excepturi explicabo. </p>
      </section>
    </div>
  </body>
</html>
```

![](https://i.ibb.co/mR6Wgzn/image.png)

실습을 위해 다음과 같은 UI 를 만들었습니다.





---

**2) Tab UI에 생명 불어넣기**



**EventListenr 등록**

우선 tabmenu를 클릭하는 이벤트가 발생하는 순간의 요청을 받아보도록 합시다.

```javascript
let tabmenu = document.querySelector(".tabmenu");
tabmenu.addEventListener("click", (evt)=>{
console.log(evt.target.innerText);
})
```







**Ajax 코드 구현**

Using XMLHttpRequest 를 검색하면

https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

Ajax 통신을 할 수 있는 방법을 알려줍니다.

```javascript
function makeTemplate(data, clickedName){
    let html = document.getElementById("tabcontent").innerHTML;
    let resultHTML = "";
    for (var i=0, len=data.length; i<len; ++i){
        if (data[i].name === clickedName) {
            resultHTML = html.replace("{name}", data[i].name)
                .replace("{favorites}", data[i].favorites.join(", "));
            break;
        }
    }
    console.log(resultHTML);
    document.querySelector(".content").innerHTML = resultHTML;
}

function sendAjax(url, clickedName) {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", ()=>{
        let data = JSON.parse(oReq.responseText);
        makeTemplate(data, clickedName);
    });
    oReq.open("GET", url);
    oReq.send();
};

let tabmenu = document.querySelector(".tabmenu");
tabmenu.addEventListener("click", (evt)=>{
    // console.log(evt.target.innerText);
    sendAjax("./json/json.txt", evt.target.innerText);
})
```



html

```html
<html>
  <header>
    <style>
      h2 {
        text-align: center;
      }
      h4 {
        margin: 0px;
      }
      .tab {
        width: 600px;
        margin: 0px auto;
      }
      .tabmenu {
        background-color: bisque;
      }
      .tabmenu > div {
        display: inline-block;
        width: 140px;
        text-align: center;
        height: 50px;
        line-height: 50px;
        cursor: pointer;
      }
      .content {
        padding: 5%;
        background-color: antiquewhite;
      }
    </style>
  </header>
  <body>
    <h2> TAB UI TEST </h2>
    <div class="tab">
      <div class="tabmenu">
        <div>crong</div>
        <div>jk</div>
        <div>pobi</div>
        <div>honux</div>
      </div>
      <section class="content">
        <h4>hello jk</h4>
        <p>golf, facebook</p>
      </section>
    </div>

    <script src="js.js">
    </script>

    <script id="tabcontent" type="text/x-my-template">
      <h4>hello {name}</h4>
      <p>{favorites}</p>
    </script>
  </body>
</html>
```



script 태그의 type은 MIME  타입으로 지정되도록 규정되어 있습니다.

그래서 "text/x-my-template"



**기능 정의**

1) Tab 메뉴를 누르면 Ajax를 통해서 데이터를 가져온 후, 그 내용이 화면에 노출됩니다.

2) 다른 Tab 메뉴를 누르면 역시 동일하게 Ajax를 데이터를 가져온 후 그 내용이 화면에 노출됩니다.

3) 화면에 노출하기 위해 HTML코드를 가져오고, 서버에서 받은 데이터를 HTML Templating 작업을 해야 합니다.

4) 화면에 추가하기 위해서 DOM API를 사용합니다.







---

**Reference**

https://www.edwith.org/boostcourse-web/lecture/16771/

https://www.edwith.org/boostcourse-web/lecture/20588/