# React Component Styling

## 1. Sass

Sass(Syntactically Awesome Style Sheets, 문법적으로 굉장히 멋진 스타일시트) 는 CSS pre-processor 로서, 복잡한 작업을 쉽게 할 수 있도록 하고, 코드의 재활용성을 높여주며, 코드의 가독성을 높여주어 유지보수를 쉽게해줍니다.



이 글에서는 Sass의 기초를 다룹니다.

> 더 자세한 자료 
>
> https://velopert.com/1712, 
>
> https://sass-guidelin.es/ko/



Sass는 두가지 확장자 (.scss / .sass)를 지원합니다. Sass가 처음 나왔을 때는 sass만 지원되었고, 문법이 아주 다릅니다.

**sass**

```sass
$font-stack:    Helvetica, sans-serif
$primary-color: #333

body
  font: 100% $font-stack
  color: $primary-color
```

**scss**

```scss
$font-stack:    Helvetica, sans-serif;
$primary-color: #333;

body {
  font: 100% $font-stack;
  color: $primary-color;
}
```

보통은 scss 문법이 더 많이 사용되므로, .scss 확장자로 스타일을 작성합니다.



### 시작

새로운 리액트 프로젝트 생성

```console
$ npx create-react-app styling-with-sass
```

해당 디렉터리에 들어가서 node-sass 라이브러리 설치 (Sass를 CSS로 변환해주는 역할)

```console
$ cd styling-with-sass
$ yarn add node-sass
($ npm install node-sass)
```



### Button 컴포넌트 생성

src 디렉토리에 compoent 폴더 생성

**component/Button.js**

```javascript
import React from 'react';
import './Button.scss';

function Button({ children }) {
  return <button className="Button">{children}</button>;
}

export default Button;
```

**component/Button.scss**

```scss
$blue: #228be6; // 주석 선언

.Button {
  display: inline-flex;
  color: white;
  font-weight: bold;
  outline: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  height: 2.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 1rem;

  background: $blue; // 주석 사용
  &:hover {
    background: lighten($blue, 10%); // 색상 10% 밝게
  }

  &:active {
    background: darken($blue, 10%); // 색상 10% 어둡게
  }
}
```

`$blue: #228be6;` 과 같이 스타일 파일에서 사용할 수 있는 변수를 선언할 수 있습니다.

`lighten()` 또는 `darken()`과 같이 색상, 밝기 관련 함수도 사용할 수 있습니다.



**App.js**

```javascript
import React from 'react';
import './App.scss';
import Button from './components/Button';

function App() {
  return (
    <div className="App">
      <div className="buttons">
        <Button>BUTTON</Button>
      </div>
    </div>
  );
}

export default App;
```



기존 App.css 를 App.scss로 파일이름을 수정합니다.

App.scss

```scss
.App {
  width: 512px;
  margin: 0 auto;
  margin-top: 4rem;
  border: 1px solid black;
  padding: 1rem;
}
```



---

### 버튼 사이즈 조정

버튼 크기로 `large`, `medium`, `small` 설정이 가능하도록 구현해봅시다.

**Button.js**

```javascript
import React from 'react';
import './Button.scss';

function Button({ children, size }) {
  return <button className={['Button', size].join(' ')}>{children}</button>;
}

Button.defaultProps = {
  size: 'medium'
};

export default Button;
```



className에 CSS 클래스 이름을 동적으로 넣어주는 방법은 아래와 같이 하면 됩니다.

```javascript
className={['Button', size].join(' ')}
또는
className={`Button ${size}`}
```

하지만 조건부로 CSS클래스를 넣고싶다면 [classnames](https://github.com/JedWatson/classnames) 라이브러리를 이용하는 것이 편리합니다.

classnames 에서는 다양한 방법으로 조건부 스타일링 시 문자열, 배열, 객체 등을 전달받아 손쉽게 문자열을 조합할 수 있습니다.

```javascript
classNames('foo', 'bar'); // => 'foo bar'
classNames('foo', { bar: true }); // => 'foo bar'
classNames({ 'foo-bar': true }); // => 'foo-bar'
classNames({ 'foo-bar': false }); // => ''
classNames({ foo: true }, { bar: true }); // => 'foo bar'
classNames({ foo: true, bar: true }); // => 'foo bar'
classNames(['foo', 'bar']); // => 'foo bar'

// 동시에 여러개의 타입으로 받아올 수 도 있습니다.
classNames('foo', { bar: true, duck: false }, 'baz', { quux: true }); // => 'foo bar baz quux'

// false, null, 0, undefined 는 무시됩니다.
classNames(null, false, 'bar', undefined, 0, 1, { baz: null }, ''); // => 'bar 1'
```



classnames를 설치해봅시다.

```console
$ yarn add classnames
```



**Button.js**

```javascript
import React from 'react';
import classNames from 'classnames';
import './Button.scss';

function Button({ children, size }) {
  return <button className={classNames('Button', size)}>{children}</button>;
}

Button.defaultProps = {
  size: 'medium'
};

export default Button;
```



Button.scss에서 다른 버튼 크기를 조정해봅시다.

**Button.scss**

```scss
...
.Button {
  ...
  // 사이즈 관리
  &.large {
    height: 3rem;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 1.25rem;
  }

  &.medium {
    height: 2.25rem;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 1rem;
  }

  &.small {
    height: 1.75rem;
    font-size: 0.875rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  ...
}
```



```scss
.Button {
    &.large {}
}
```

는

```
.Button.large {}
```

와 의미가 같습니다. Button과 large CSS class가 함께 적용되어 있을 때 적용됩니다.



App.js 를 수정해봅시다.

```javascript
import React from 'react';
import './App.scss';
import Button from './components/Button';

function App() {
  return (
    <div className="App">
      <div className="buttons">
        <Button size="large">BUTTON</Button>
        <Button>BUTTON</Button>
        <Button size="small">BUTTON</Button>
      </div>
    </div>
  );
}

export default App;
```



렌더링시 버튼들이 나오는데, 버튼 사이의 여백을 설정하고 싶습니다.

Button.scss

```scss
...
.Button {
  ...
  background: $blue;
  &:hover {
    background: lighten($blue, 10%);
  }

  &:active {
    background: darken($blue, 10%);
  }

  & + & {
    margin-left: 1rem;
  }
}
```

`& + &`가 의미하는 것은 `.Button + .Button`입니다.

버튼이 함께 있다면 우측에 있는 버튼에 여백을 설정한 것입니다.



---

### 버튼 색상 설정

버튼 색상으로 `blue`, `gray`, `pink` 색을 설정하도록 구현해 보겠습니다.

>색상에 대한 고민이 들 때는 [open-color](https://yeun.github.io/open-color/)를 참조하면 좋습니다.



Button에서 color라는 props를 받아올 수 있도록 바꾸고, 기본값을 blue로 설정합니다.

Button.js

```javascript
import React from 'react';
import classNames from 'classnames';
import './Button.scss';

function Button({ children, size, color }) {
  return (
    <button className={classNames('Button', size, color)}>{children}</button>
  );
}

Button.defaultProps = {
  size: 'medium',
  color: 'blue'
};

export default Button;
```



Button.scss

```scss
$blue: #228be6;
$gray: #495057;
$pink: #f06595;

.Button {
    ...
    // 색상 관리
    &.blue {
        background: $blue;
        &:hover {
            background: lighten($blue, 10%);
        }

        &:active {
            background: darken($blue, 10%);
        }
    }

    &.gray {
        background: $gray;
        &:hover {
            background: lighten($gray, 10%);
        }
        &:active {
            background: darken($gray, 10%);
        }
  	}
    
    &.pink {
        background: $pink;
        &:hover {
            background: lighten($pink, 10%);
        }

        &:active {
            background: darken($pink, 10%);
        }
    }
    ...
}
```



이렇게 반복되는 코드는 Sass의 [mixin](https://sass-guidelin.es/ko/#mixins) 기능을 사용하여 쉽게 재사용할 수 있습니다. `button-color`라는 mixin을 만들어서 사용해봅니다.



**Button.scss**

```scss
$blue: #228be6;
$gray: #495057;
$pink: #f06595;

@mixin button-color($color) {
    background: $color;
    &:hover {
        background: lighten($color, 10%); // 색상을 10% 밝게
    }
    &:active {
        background: darken($color, 10%); // 색상 10% 어둡게
    }
}

.Button {
	...
    // 색상 관리
    &.blue {
        @include button-color($blue);
    }

    &.gray {
        @include button-color($gray);
    }

    &.pink {
        @include button-color($pink);
    }

    & + & {
        margin-left: 1rem;
    }
}
```



App.js

```javascript
import React from 'react';
import './App.scss';
import Button from './components/Button';

function App() {
  return (
    <div className="App">
      <div className="buttons">
        <Button size="large">BUTTON</Button>
        <Button>BUTTON</Button>
        <Button size="small">BUTTON</Button>
      </div>
      <div className="buttons">
        <Button size="large" color="gray">
          BUTTON
        </Button>
        <Button color="gray">BUTTON</Button>
        <Button size="small" color="gray">
          BUTTON
        </Button>
      </div>
      <div className="buttons">
        <Button size="large" color="pink">
          BUTTON
        </Button>
        <Button color="pink">BUTTON</Button>
        <Button size="small" color="pink">
          BUTTON
        </Button>
      </div>
    </div>
  );
}

export default App;
```



위와 아래 붙은 버튼의 간격을 늘려봅시다.



App.scss

```scss
.App {
  width: 512px;
  margin: 0 auto;
  margin-top: 4rem;
  border: 1px solid black;
  padding: 1rem;
  .buttons + .buttons {
    margin-top: 1rem;
  }
}
```

![](https://i.ibb.co/MZHnDxc/image.png)

멋지게 완성되었습니다.





---

### outline 옵션 만들기

`outline` 옵션을 주어 버튼에서 테두리만 보여지도록 설정을 해봅니다.



Button.js

```javascript
...
function Button({ children, size, color, outline }) {
  return (
    <button className={classNames('Button', size, color, { outline })}>
      {children}
    </button>
  );
}
...
```

`outline`값을 props로 받아와서 객체 안에 집어넣은 다음에 `classNames()`에 포함시켜 주었습니다. 이렇게 하면 `outline`값이 true일 때만 button에 `outline` CSS 클래스가 적용됩니다.



outline CSS class가 있다면 테두리만 보여지도록 스타일 코드를 수정합니다.

Button.scss

```scss
...
@mixin button-color($color) {
  background: $color;
  &:hover {
    background: lighten($color, 10%);
  }
  &:active {
    background: darken($color, 10%);
  }
  &.outline {
    color: $color;
    background: none;
    border: 1px solid $color;
    &:hover {
      background: $color;
      color: white;
    }
  }
}
...
```



App.js

```javascript
...
	  <div className="buttons">
        <Button size="large" color="blue" outline>
          BUTTON
        </Button>
        <Button color="gray" outline>
          BUTTON
        </Button>
        <Button size="small" color="pink" outline>
          BUTTON
        </Button>
      </div>
...
```

을 맨 아래에 출력합니다.



---

### 전체 너비 차지 옵션

`fullWidth` 옵션이 있으면 버튼이 전체 너비를 차지하도록 구현해보겠습니다.



**Button.js**

```javascript
...
function Button({ children, size, color, outline, fullWidth }) {
  return (
    <button
      className={classNames('Button', size, color, { outline, fullWidth })}
    >
      {children}
    </button>
  );
}
...
```



**Button.scss**

```scss
...
.Button {
    ...
    
    &.fullWidth {
    width: 100%;
    justify-content: center;
    & + & {
      margin-left: 0;
      margin-top: 1rem;
    }
  }
}
```



App.js

```javascript
...
	  <div className="buttons">
        <Button size="large" fullWidth>
          BUTTON
        </Button>
        <Button size="large" fullWidth color="gray">
          BUTTON
        </Button>
        <Button size="large" fullWidth color="pink">
          BUTTON
        </Button>
      </div>
...
```

위 jsx를 화면 맨 아래 추가합니다.



---

### ...rest props 전달하기

`onClick`을 설정해봅시다.

여기에 `onMouseMove`이벤트도 관리해봅시다.

```javascript
...
function Button({ children, size, color, outline, fullWidth, onClick, onMouseMove }) {
  return (
    <button
      className={classNames('Button', size, color, { outline, fullWidth })}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
    ...
```



필요한 이벤트가 있을 때마다 이렇게 넣어주는건 비효율적이고 귀찮습니다. 이 문제를 해결할 수 있는 문법이 [spread와 rest](https://learnjs.vlpt.us/useful/07-spread-and-rest.html)입니다. 주로 배열, 객체, 함수의 파라미터, 인자를 다룰 때 사용하는데, 컴포넌트에서도 사용할 수 있습니다.



Button.js

```javascript
...
function Button({ children, size, color, outline, fullWidth, ...rest }) {
  return (
    <button
      className={classNames('Button', size, color, { outline, fullWidth })}
      {...rest}
    >
      {children}
    </button>
  );
}
...
```

`...rest`를 사용해서 지정한 props를 제외한 값들을 `rest`객체에 모아주고, `<button>`태그에 `{...rest}`를 해주면, `rest`안에 있는 객체 안에 있는 값들을 모두 `<button>` 태그에 설정을 해줍니다.



예를 들어 `onClick`을 넣어봅시다.

App.js

```javascript
...
function App() {
  return (
    <div className="App">
      <div className="buttons">
        <Button size="large" onClick={() => console.log('클릭됐다!')}>
          BUTTON
        </Button>
        <Button>BUTTON</Button>
        <Button size="small">BUTTON</Button>
      </div>
...
```



![](https://i.ibb.co/SxSCwqd/image.png)



이렇게 컴포넌트가 어떤 props를 받을 지 모르지만, 이를 그대로 다른 컴포넌트 또는 HTML 태그에 전달해주어야 하는 상황에는 `...rest`문법을 활용하면 효율적입니다.







---

**Reference**

https://react.vlpt.us/styling/01-sass.html