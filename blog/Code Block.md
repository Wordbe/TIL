# Code Block

티스토리에서 코드 블록을 생성하는 방법과 적당히 예쁘게 꾸미는 방법을 알아봅니다.



## 코드블록(Code block) 생성

1) 티스토리 `에디터 > 더보기버튼 > 코드블럭` 으로 생성하는 방법

[##_Image|kage@muZTt/btqEcmj7dav/SopsBiRJ2sW1MBOgXzzKq1/img.png|alignCenter|data-origin-width="0" data-origin-height="0"|티스토리 에디터에서 코드블럭을 클릭합니다.||_##]

[##_Image|kage@2Jg6Y/btqEcThs7kP/Hxhhv15VKS4yhouw6TGp51/img.png|alignCenter|data-origin-width="0" data-origin-height="0"|코드를 입력하고, 언어를 선택한 뒤 확인버튼을 누르면 코드블럭이 생성됩니다.||_##]



2) 마크다운(Markdown)을 이용하는 방법

마크다운 문서를 편집하여 사용하신다면, 

\` 세 개로 코드를 둘러쌓으면 코드블럭을 생성할 수 있습니다.

```html
​```javascript
	console.log("code block");
​```
```

위와 같이 첫번째 줄에 코드 언어도 기입할 수 있습니다.

생성한 후, 매우 기본적인 코드 블록 화면이 생성되었을 것입니다. 제 환경과는 다르게 말입니다.

그래서 이제 해볼 것은, 언어별로 코드블록 테마를 설정하고, 위 예시와 같이 코드 라인 숫자를 삽입하는 방법을 알아보겠습니다.



---

## 코드블록테마, Highlight.js

Highlight.js[(https://highlightjs.org/)](https://highlightjs.org/) 는 189개의 프로그래밍 언어와 91가지 스타일을 지원합니다. (version 10.0.3 기준)

하이라이트.js가 지원하는 언어는 [여기](https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md)에서 확인이 가능합니다.

우리는 컨텐츠 전송 네트워크 방식인 CDN(contents delivery network)로 이 라이브러리를 가져올 것입니다.



티스토리 관리자 url 로 가셔서 `좌측메뉴 > 꾸미기 > 스킨편집` 을 클릭합니다.

html 편집을 누르셔서 `<head> ... </head>` 사이에 아무곳에나 아래 cdn 코드를 붙여넣어주시면 됩니다.

```html
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/styles/default.min.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/highlight.min.js"></script>
```

여기서 보시면 default 스타일을 고른 것을 알 수 있고, highlight 라이브러리를 가져온 것을 알 수 있습니다.

스타일은 [위 홈페이지](https://highlightjs.org/static/demo/)에 들어가셔서 마음에 드는 것을 고르시면 됩니다. 

위 코드 2번째 라인의 default 대신 원하는 테마로 변경하시면 됩니다.



예를 들면 github 테마를 원하시면 아래와 같이 변경하세요.

```html
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/styles/github.min.css">
```



또 다른 예시는 Solarized Dark 입니다.

[##_Image|kage@tQtRt/btqEcT2RDJJ/6eCIwFsndGRow48pK0auyK/img.png|alignCenter|data-origin-width="0" data-origin-height="0"|highlight.js의 여러가지 코드 블록 스타일||_##]

등록할 때는 모두 소문자로 바꾸시고, `kebab-case` 형식으로 아래와 같이 적어주시면됩니다.

```html
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/styles/solarized-dark.min.css">
```





스타일을 고르셨다면 마지막으로 아래 코드를 바로 아래 추가 시켜서 하이라이트 js 를 불러오는 것을 실행시켜 주도록 하면 됩니다.

```html
<script>hljs.initHighlightingOnLoad();</script>
```



기타 궁금하신 사항, 기본적인 사용방법은 Highlight.js github [(https://github.com/highlightjs/highlight.js#getting-the-library)](https://github.com/highlightjs/highlight.js#getting-the-library)에 상세하게 나와있습니다.



---

## 커스텀 설정

하이라이트.js 에서 가져온 테마를 사용하되, 나만의 블로그에 맞게 조금 더 설정을 해봅시다.

html, css 에 익숙하신 분들은 원리를 금방 아실 것 같습니다.

그렇지 않더라도 제가 한 예시 코드를 제공해드릴테니, 복사하시면 됩니다.



코드블록을 생성하면,

```html
<pre>
	<code>
		console.log("code block");
	</code>
</pre>
```

`<pre>`와 `<code>` 태그가 자동으로 생성됩니다.



또한 마크다운 문법에서는 \` 로 코드를 둘러 쌓으면 `이 블록` 처럼 작은 코드 블록이 생깁니다. 이 때는

```html
<p>
    <code>
    	이 블록
    </code>
</p>
```

와 같이 html 태그 코드가 생성됩니다.



위 사실을 알았으니, css에서 이 태그에 접근해서 디자인을 수정해봅시다.

마찬가지로 `스킨 편집 > html 변경 > css` 변경 탭을 들어가셔서 수정하시면 됩니다.



### 1 폰트, 블럭 설정

```css
/* Code block style */
code {
	padding: 0.25rem;
	background-color: #F1F1F1;
	border-radius: 5px;
	font-family: "Consolas", "Sans Mono", "Courier", "monospace";
	font-size: 0.75rem;
}
pre > code {
	margin: 1rem auto;
}
```

`font-family`로 폰트를 설정합니다. 지원되는 폰트가 있으면 앞에서부터 우선순위로 폰트가 적용됩니다.

code의 속성을 공유하되,

코드블럭이면 (pre 안에 있는 code 이면) 마진 속성을 추가해주었습니다. 아래, 위 글이랑 코드블럭이랑 간격을 조금 띄워놓았고, 좌우는 중앙정렬 되도록 auto로 설정하였습니다.



### 2 Scroll 설정

```css
pre > code {
	margin: 1rem auto;
    white-space: pre;
	max-width:850px; 
	max-height:500px; 
	overflow:auto !important; /* scroll setting */
}
```

코드 블록의 최대, 최소 픽셀을 설정한 뒤, 코드가 길어서 넘치면(overflow) 자동으로 스크롤이 생기게 해주는 설정입니다. 코드가 길지 않으면 스크롤은 표시되지 않습니다.

`!important`  는 다른 css 설정에서 덮어씌워지지 않게 하는 설정입니다.



지금까지 `<pre>, <code>` 태그를 조작하는 방식으로 수정을 했지만,

hightlight.js 라이브러리가 사용된 코드블럭은 hljs 클래스에 속하게 되므로 `.hljs` 클래스를 조작해도 됩니다.

```css
.hljs {
	white-space: pre;
	max-width:850px; 
	max-height:500px; 
	overflow:auto !important; /* scroll setting */
}
```



둘 다 잘 동작하니, 기호에 맞게 사용하시면 됩니다.



---

## Line number 설정

코드 블럭에 줄 숫자를 표시하기 위해 hilightjs-line-number [(https://github.com/wcoder/highlightjs-line-numbers.js)](https://github.com/wcoder/highlightjs-line-numbers.js) 을 사용합니다.

html 의 head 사이에 아래 cdn 코드를 추가하여 라이브러리를 가져옵니다.

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/highlightjs-line-numbers.js/2.7.0/highlightjs-line-numbers.min.js"></script>
<script>hljs.initLineNumbersOnLoad();</script>
```



또한 기본 설정을 조금 변형해보았습니다.

```css
/* for block of numbers */
.hljs-ln-numbers {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    text-align: center;
    color: #ccc;
	/* border-right: 1px solid #CCC; */
    vertical-align: top;
    padding-right: 5px;

    /* your custom style here */
}

/* for block of code */
.hljs-ln-code {
    padding-left: 10px;
	text-indent: 0.75rem; /* indent added */
}
```

hilightjs-line-number 사이트에서 기본 설정을 위 코드를 통해 하라고 제공해주었고, 저는 여기서 line의 border를 없애고, code에서는 왼쪽의 들여쓰기(text-indent)를 추가해보았습니다.



[##_Image|kage@0gXxs/btqEcm5vvgo/UWN1go5neroVujACO1cus0/img.png|alignCenter|data-origin-width="0" data-origin-height="0"|무언가 원하지 않았던 스타일||_##]



그런데, UI 상의 문제가 보입니다.

기존 스킨의 css 에서 table 에 기본값으로 적용해놓은 보더 등의 설정값 때문입니다.

highlight-line-number 는 이 table 속성에 영향을 받습니다.

따라서 만약 저와 같은 오류가 있다면, 이를 수정할 필요가 있습니다.

```css
.entry-content table {
	width:100%;
	margin-bottom: 22px;
	border: 1px solid #e6e6e6;
	border-collapse: collapse;
	text-align: center;
	font-size: 0.9375em;
	line-height: 1.5714;
	color: #666;
}
.entry-content table thead th {
	padding:7px 0 11px;
	border-left: 1px solid #e6e6e6;
}
.entry-content table tbody td {
	padding:7px 0 11px;
	border-left: 1px solid #e6e6e6;
	border-top: 1px solid #e6e6e6;
}
```

을 아래와 같이 바꿔서

```css
.entry-content > table {
	width:100%;
	margin-bottom: 22px;
	border: 1px solid #e6e6e6;
	border-collapse: collapse;
	text-align: center;
	font-size: 0.9375em;
	line-height: 1.5714;
	color: #666;
}
.entry-content > table thead th {
	padding:7px 0 11px;
	border-left: 1px solid #e6e6e6;
}
.entry-content > table tbody td {
	padding:7px 0 11px;
	border-left: 1px solid #e6e6e6;
	border-top: 1px solid #e6e6e6;
}
```

엔트리-컨텐츠의 자식인 테이블의 경우만 저 속성을 사용하도록, 스킨 전체의 설정을 살짝 바꿔보았습니다.

`<code>` 안의 table을 커스텀 설정하는 등 또 다른 좋은 방법도 생각해 볼 수 있을 것입니다.