# React Component Styling 3.1 - styled-component

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



styled-components 에서는 이런 문법을 사용해서 컴포넌트의 props를 읽어오기도 합니다.

```javascript
const StyledDiv = styled`
  background: ${props => props.color};
`;
```

Tagged Template Literal 을 사용하면, `${}` 에 함수를 넣어 함수를 사용할 수 도 있습니다.



예시)

```javascript
function sample(texts, ...fns) {
  const mockProps = {
    title: '안녕하세요',
    body: '내용은 내용내용 입니다.'
  };
  return texts.reduce((result, text, i) => `${result}${text}${fns[i] ? fns[i](mockProps) : ''}`, '');
}
sample`
  제목: ${props => props.title}
  내용: ${props => props.body}
`
/*
"
  제목: 안녕하세요
  내용: 내용은 내용내용 입니다.
"
*/
```



---

### styled-components 사용하기



새로운 프로젝트 생성

styled-components 설치

```
$ npx create-react-app styling-with-styled-components
$ cd styling-with-styled-components
$ yarn add styled-components
```



styled-component 를 사용하면, 스타일을 입력함과 동시에 해당 스타일을 가진 컴포넌트를 만들 수 있습니다. `div`를 스타일링 하려면 `styled.div`, `input`을 스타일링하고 싶으면 `styled.input` 처럼 사용하면 됩니다.



App.js

```javascript
import React from 'react';
import styled from 'styled-components';

const Circle = styled.div`
  width: 5rem;
  height: 5rem;
  background: ${props => props.color || 'black'};
  border-radius: 50%;
`;

function App() {
  return <Circle color="blue" />;
}

export default App;

```

Circle 컴포넌트에 color 라는 props를 넣어보았습니다.



다음으로는, `huge` 라는 props를 설정하고 크기를 더 키워서 보여주는 작업을 해봅니다.

```javascript
import React from 'react';
import styled, { css } from 'styled-components';

const Circle = styled.div`
  width: 5rem;
  height: 5rem;
  background: ${props => props.color || 'black'};
  border-radius: 50%;
  ${props =>
    props.huge &&
    css`
      width: 10rem;
      height: 10rem;
    `}
`;

function App() {
  return <Circle color="red" huge />;
}

export default App;
```

위와 같이 여러줄의 CSS 코드를 조건부로 보여주고 싶다면 `css`를 사용해야 합니다. 



---

### Button 만들기



**components/Button.js**

```javascript
import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  /* 공통 스타일 */
  display: inline-flex;
  outline: none;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  padding-left: 1rem;
  padding-right: 1rem;

  /* 크기 */
  height: 2.25rem;
  font-size: 1rem;

  /* 색상 */
  background: #228be6;
  &:hover {
    background: #339af0;
  }
  &:active {
    background: #1c7ed6;
  }

  /* 기타 */
  & + & {
    margin-left: 1rem;
  }
`;

function Button({ children, ...rest }) {
  return <StyledButton {...rest}>{children}</StyledButton>;
}

export default Button;
```



App.js

```javascript
import React from 'react';
import styled from 'styled-components';
import Button from './components/Button';

const AppBlock = styled.div`
  width: 512px;
  margin: 0 auto;
  margin-top: 4rem;
  border: 1px solid black;
  padding: 1rem;
`;

function App() {
  return (
    <AppBlock>
      <Button>BUTTON</Button>
    </AppBlock>
  );
}

export default App;
```





### polished 스타일 관련 유틸 함수 사용하기

Sass를 사용할 때는 `lighten()`, `darken()`처럼 유틸 함수를 통해 색상에 변화를 줄 수 있었습니다. CSS in JS 에서도 비슷한 유틸 함수를 사용하고 싶다면 [polished](https://polished.js.org/docs/) 라이브러리를 사용합니다.

```
$ yarn add polished
```



**Button.js**

```javascript
import React from 'react';
import styled from 'styled-components';
import { darken, lighten } from 'polished';

const StyledButton = styled.button`
  ...

  /* 색상 */
  background: #228be6;
  &:hover {
    background: ${lighten(0.1, '#228be6')};
  }
  &:active {
    background: ${darken(0.1, '#228be6')};
  }

  ...
`;

function Button({ children, ...rest }) {
  return <StyledButton {...rest}>{children}</StyledButton>;
}

export default Button;
```



버튼에 커서를 올릴 때 색상이 잘 바뀝니다.

이제 회색, 핑크색 버튼을 만들어 보려 합니다. 색상 코드를 지닌 변수를 Button.js 에 선언 하는 대신 [ThemeProvider](https://styled-components.com/docs/api#themeprovider) 기능을 사용하여 styled-components 로 만드는 전역 값을 설정해 보겠습니다.

**App.js**

```javascript
import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Button from './components/Button';

const AppBlock = styled.div`
  width: 512px;
  margin: 0 auto;
  margin-top: 4rem;
  border: 1px solid black;
  padding: 1rem;
`;

function App() {
  return (
    <ThemeProvider
      theme={{
        palette: {
          blue: '#228be6',
          gray: '#495057',
          pink: '#f06595'
        }
      }}
    >
      <AppBlock>
        <Button>BUTTON</Button>
      </AppBlock>
    </ThemeProvider>
  );
}

export default App;
```

`theme`을 설정하면 `ThemeProvider` 내부에 렌더링된 styled-components 로 만든 컴포넌트에서 `palette` 를 조회하여 사용할 수 있습니다. Button 컴포넌트에서 방금 선언한 `palette.blue`를 조회해 봅니다.



**Button.js**

```javascript
import React from 'react';
import styled from 'styled-components';
import { darken, lighten } from 'polished';

const StyledButton = styled.button`
  ...

  /* 색상 */
  ${props => {
    const selected = props.theme.palette[props.color];
    return css`
      background: ${selected};
      &:hover {
        background: ${lighten(0.1, selected)};
      }
      &:active {
        background: ${darken(0.1, selected)};
      }
    `;
  }}
...
`;

function Button({ children, ...rest }) {
  return <StyledButton {...rest}>{children}</StyledButton>;
}

Button.defaultProps = {
  color: 'red';
};
...
```



위에서 props.theme.palette.blue 등으로 조회하는 대신 비구조화 할당 문법으로 가독성을 높여주면 좋습니다.

```javascript
...
/* 색상 */
  ${({ theme, color }) => {
    const selected = theme.palette[color];
    return css`
      background: ${selected};
      &:hover {
        background: ${lighten(0.1, selected)};
      }
      &:active {
        background: ${darken(0.1, selected)};
      }
    `;
  }}
...
```



또한 색상을 따로 분리하여 코드를 구현할 수도 있습니다.

```javascript
...
const colorStyles = css`
  ${({ theme, color }) => {
    const selected = theme.palette[color];
    return css`
      background: ${selected};
      &:hover {
        background: ${lighten(0.1, selected)};
      }
      &:active {
        background: ${darken(0.1, selected)};
      }
    `;
  }}
`;
...

const StyledButton = styled.button`
...
  /* 색상 */
  ${colorStyles}
...
`;
```





**App.js**

```javascript
...
	  <AppBlock>
        <Button>BUTTON</Button>
        <Button color="gray">BUTTON</Button>
        <Button color="pink">BUTTON</Button>
      </AppBlock>
...
```

파란색, 회색, 분홍색 버튼이 잘 나타난 것을 볼 수 있습니다.



`size`  props 를 설정해서 버튼의 크기를 다양하게 만들어보겠습니다.

**Button.js**

```javascript
...
const sizes = {
  large: {
    height: '3rem',
    fontSize: '1.25rem'
  },
  medium: {
    height: '2.25rem',
    fontSize: '1rem'
  },
  small: {
    height: '1.75rem',
    fontSize: '0.875rem'
  }
};

const sizeStyles = css`
  ${({ size }) => css`
    height: ${sizes[size].height};
    font-size: ${sizes[size].fontSize};
  `}
`;
...
const StyledButton = styled.button`
  ...

  /* 크기 */
  ${sizeStyles}

  ...
`;

```



**App.js**

```javascript
const ButtonGroup = styled.div`
  & + & {
    margin-top: 1rem;
  }
`;


function App() {
...
  	  <AppBlock>
        <ButtonGroup>
          <Button size="large">BUTTON</Button>
          <Button>BUTTON</Button>
          <Button size="small">BUTTON</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button color="gray" size="large">
            BUTTON
          </Button>
          <Button color="gray">BUTTON</Button>
          <Button color="gray" size="small">
            BUTTON
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button color="pink" size="large">
            BUTTON
          </Button>
          <Button color="pink">BUTTON</Button>
          <Button color="pink" size="small">
            BUTTON
          </Button>
        </ButtonGroup>
      </AppBlock>
...
}
...
```

위에서 ButtonGroup 컴포넌트도 만들어서 위 아래 버튼간 여백을 `1rem`으로 설정했습니다.



다음은 Button 컴포넌트에 `outline` props를 설정하여 이 값이 true일 때 테두리만 지닌 버튼을 보여주도록 설정해봅니다. `colorStyles`만 수정해봅시다.

**Button.js**

```javascript
...
const colorStyles = css`
  ${({ theme, color }) => {
    const selected = theme.palette[color];
    return css`
      background: ${selected};
      &:hover {
        background: ${lighten(0.1, selected)};
      }
      &:active {
        background: ${darken(0.1, selected)};
      }
      ${props =>
        props.outline &&
        css`
          color: ${selected};
          background: none;
          border: 1px solid ${selected};
          &:hover {
            background: ${selected};
            color: white;
          }
        `}
    `;
  }}
`;
...
```



**App.js**

```javascript
...
	  <ButtonGroup>
          <Button size="large" outline>
            BUTTON
          </Button>
          <Button color="gray" outline>
            BUTTON
          </Button>
          <Button color="pink" size="small" outline>
            BUTTON
          </Button>
        </ButtonGroup>
...
```



마지막으로 `fullWidth` props가 주어졌을 때 버튼의 크기가 100%를 차지하도록 만들어봅시다.

**Button.js**

```javascript
...

const fullWidthStyle = css`
  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
      justify-content: center;
      & + & {
        margin-left: 0;
        margin-top: 1rem;
      }
    `}
`;
...
/* 기타 */
  & + & {
    margin-left: 1rem;
  }

  ${fullWidthStyle}
`;
```



**App.js**

```javascript
...
 	    <ButtonGroup>
          <Button size="large" fullWidth>
            BUTTON
          </Button>
          <Button size="large" color="gray" fullWidth>
            BUTTON
          </Button>
          <Button size="large" color="pink" fullWidth>
            BUTTON
          </Button>
        </ButtonGroup>
...
```





---

**Reference**

https://react.vlpt.us/styling/03-styled-components.html