# React Component Styling - 3

## 3. styled-component

CSS in JS 기술을 소개합니다. 이 기술을 사용하는 라이브러리 [styled-component](https://styled-components.com/) 를 다뤄봅니다.

가장 인기있는 라이브러리 입니다. 대안으로는 emotion, styled-jsx가 있습니다.



### Tagged Template Literal

Tagged Template Literal 문법을 짚고 넘어갑시다. styled-component가 내부적으로 어떻게 작동하는 지 이해할 수 있습니다. 완벽히 이해한다기 보다 가볍게 읽고 넘어갑시다.

[Template Literal](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Template_literals) 은 문자열 조합을 쉽게 할 수 있는 ES6 문법입니다.

```javascript
const name = 'react';
const message = 'hello ${name}';

console.log(message);
>>
"hello react"
```



`${}`안에 문자열 또는 숫자가 아닌, 객체를 넣으면 아래와 같이 됩니다.

```javascript
const object = { a: 1 };
const text = '${object}'
console.log(text)
>>
"[object Object]"
```

함수를 넣으면 아래와 같이 됩니다.

```javascript
const fn = () => true
const msg = '${fn}';
console.log(msg);
>>
"() => true"
```



Template Literal을 사용하면서도 내부에 넣은 JavaScript 값을 조회하고 싶을 때는 Tagged Template Literal 문법을 사용할 수 있습니다.

```javascript
const red = '빨간색';
const blue = '파란색';
function favoriteColors(texts, ...values) {
  console.log(texts);
  console.log(values);
}
favoriteColors`제가 좋아하는 색은 ${red}과 ${blue}입니다.`
```

> 파라미터의 rest 문법이 사용되었습니다. 입력한 문자열은 모두 분해되어, 넣어준 텍스트와 `${}`를 통해 넣어준 자바스크립트 값을 따로 볼 수 있습니다.

```
(3) ["제가 좋아하는 색은 ", "과 ", "입니다.", raw: Array(3)]
(2) ["빨강", "파랑"]
```



---

**Reference**

https://react.vlpt.us/styling/03-styled-components.html