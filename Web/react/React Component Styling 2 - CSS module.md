# React Component Styling 2 - CSS Module

## 2. CSS Module

CSS module 기술을 사용하면, 리액트 프로젝트에서 컴포넌트 스타일링을 할 때, CSS 클래스가 중첩되는 것을 완벽히 방지할 수 있습니다.

CRA로 만든 프로젝트에서 CSS Module을 사용할 때는 CSS 파일의 확장자를 `.module.css`로 하면 됩니다.

**Box.module.css**

```css
.Box {
  background: black;
  color: white;
  padding: 2rem;
}
```



리액트 컴포넌트 파일에서 CSS 파일을 불러올 때 CSS 파일에 선언한 클래스 이름들은 모두 고유해집니다. 고유 CSS 클래스 이름이 만들어지는 과정에서는 파일 경로, 파일 이름, 클래스 이름, 해쉬값 등이 사용될 수 있습니다.



**Box.js**

```javascript
import React from "react";
import styles from "./Box.module.css";

function Box() {
  return <div className={styles.Box}>{styles.Box}</div>;
}

export default Box;
```

`className`을 설정할 때는 `styles.Box`이렇게 `import`로 불러온 `styles` 객체 안에 있는 값을 참조할 수 있습니다.

클래스 이름에 대해 고유한 이름이 만들어지기 때문에 실수로 CSS 클래스 이름이 **다른 관계 없는 곳에서 사용한 CSS 클래스 이름과 중복되는 일에 대해 걱정할 필요가 없습니다.**



이 기술은 다음 상황에 유용합니다.

* 레거시 프로젝트에서 리액트를 도입할 때 (기존 프로젝트에 있던 CSS 클래스아 이름이 중복되어도 스타일이 꼬이지 않습니다.)
* CSS 클래스를 중복되지 않게 작성하기 위하여 CSS 클래스 네이밍 규칙을 만들기 귀찮을 때



리액트 컴포넌트를 위한 클래스를 작성할 때 CSS 클래스 네이밍 규칙은 다음과 같습니다.

1. 컴포넌트 이름은 다른 컴포넌트와 중복되지 않게 한다.
2. 컴포넌트 최상단 CSS 클래스는 컴포넌트 이름과 일치시킨다. (예)  `.Button`
3. 컴포넌트 내부에서 보여지는 CSS 클래스는 CSS Selector를 잘 활용한다. (예) `.MyForm .my-input`

이 규칙 외에도 BEM Convention 도 있긴 하지만, 부적합하다고 생각하는 사람들도 있습니다.

CSS 클래스 네이밍 규칙을 만들고 따르기가 싫다면, CSS Module을 사용하면 됩니다.



CSS Module은 별도로 설치해야 할 라이브러리가 없습니다. 이 기능은 webpack에서 사용하는 css-loader에서 지원됩니다. CRA로 만든 프로젝트에서는 이미 적용되어 있습니다.



src안에 components 디렉토리를 만들어봅시다.

**components/CheckBox.js**

```javascript
import React from 'react';

function CheckBox({ children, checked, ...rest }) {
  return (
    <div>
      <label>
        <input type="checkbox" checked={checked} {...rest} />
        <div>{checked ? '체크됨' : '체크 안됨'}</div>
      </label>
      <span>{children}</span>
    </div>
  );
}

export default CheckBox;
```



App.js

```javascript
import React, { useState } from 'react';

import CheckBox from './components/CheckBox';

function App() {
  const [check, setCheck] = useState(false);
  const onChange = e => {
    setCheck(e.target.checked);
  };
  return (
    <div>
      <CheckBox onChange={onChange} checked={check}>
        다음 약관에 모두 동의
      </CheckBox>
      <p>
        <b>check: </b>
        {check ? 'true' : 'false'}
      </p>
    </div>
  );
}

export default App;
```



위에서 input이 아닌 텍스트 부분을 선택했는데도 값이 바뀌는 이유는, `label`태그로 해당 내용을 감싸주었기 때문입니다.



이제 스타일링을 해봅시다.

```console
$ yarn add react-icons
```

이 라이브러리를 사용하면, Font Awesome, Ionicons, Material Design Icons 등의 아이콘들을 컴포논트 형태로 쉽게 사용할 수 있습니다. 라이브러리의 [문서](https://react-icons.netlify.com/#/)를 열어서 원하는 아이콘을 불러와서 사용하면 됩니다.

[Material Design Icons](https://react-icons.netlify.com/#/icons/md) 의 MdCheckBox, MdCheckBoxOutline을 사용하겠습니다.



**CheckBox.js**

```javascript
import React from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

function CheckBox({ children, checked, ...rest }) {
  return (
    <div>
      <label>
        <input type="checkbox" checked={checked} {...rest} />
        <div>{checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}</div>
      </label>
      <span>{children}</span>
    </div>
  );
}

export default CheckBox;
```

위와 같이 수정을 하면 텍스트 대신 아이콘이 나타나게 됩니다.



**CheckBox.module.css**

```css
.checkbox {
  display: flex;
  align-items: center;
}

.checkbox label {
  cursor: pointer;
}

/* 실제 input 을 숨기기 위한 코드 */
.checkbox input {
  width: 0;
  height: 0;
  position: absolute;
  opacity: 0;
}

.checkbox span {
  font-size: 1.125rem;
  font-weight: bold;
}

.icon {
  display: flex;
  align-items: center;
  /* 아이콘의 크기는 폰트 사이즈로 조정 가능 */
  font-size: 2rem;
  margin-right: 0.25rem;
  color: #adb5bd;
}

.checked {
  color: #339af0;
}
```

CSS Module을 작성할 때는 다른 곳과 이름이 중복되도 되기 때문에 `.icon`, `.checkbox` 등 짧고 흔한 이름을 사용해도 됩니다.



CheckBox.js

```javascript
import React from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import styles from './CheckBox.module.css';

function CheckBox({ children, checked, ...rest }) {
  return (
    <div className={styles.checkbox}>
      <label>
        <input type="checkbox" checked={checked} {...rest} />
        <div className={styles.icon}>
          {checked ? (
            <MdCheckBox className={styles.checked} />
          ) : (
            <MdCheckBoxOutlineBlank />
          )}
        </div>
      </label>
      <span>{children}</span>
    </div>
  );
}

export default CheckBox;
```



개발자 도구로 엘리먼트를 선택해보면 고유한 클래스 이름이 만들어진 것을 확인할 수 있습니다.

CSS Module을 사용할 떄는 `styles.icon`과 같이 객체안에 있는 값을 조회해야 합니다. 만약 클래스 이름에 `-`가 들어가있으면 다음과 같이 사용해야 합니다. `styles['my-class']`

또한 만약 여러개가 있다면 다음과 같이 작성합니다. `${styles.one} ${styles.two}`

이전에 Sass를 배울 때 썼었던 classnames 라이브러리에는 [bind](https://github.com/JedWatson/classnames#alternate-bind-version-for-css-modules) 기능이 있습니다. 이를 통해 CSS Module을 조금 더 편하게 사용할 수 있습니다.

우선 설치합니다

```console
$ yarn add classnames
```



CheckBox.js

```javascript
import React from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import styles from './CheckBox.module.css';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function CheckBox({ children, checked, ...rest }) {
  return (
    <div className={cx('checkbox')}>
      <label>
        <input type="checkbox" checked={checked} {...rest} />
        <div className={cx('icon')}>
          {checked ? (
            <MdCheckBox className={cx('checked')} />
          ) : (
            <MdCheckBoxOutlineBlank />
          )}
        </div>
      </label>
      <span>{children}</span>
    </div>
  );
}

export default CheckBox;
```

classnames 의 `bind`기능을 사용하면 CSS 클래스 이름을 지정해 줄 때, `cx('클래스이름')`과 같은 형식으로 편하게 사용할 수 있습니다.



아래와 같이 사용하시면 됩니다.

```javascript
cx('one', 'two')
cx('my-component', {
  condition: true
})
cx('my-component', ['another', 'classnames'])
```



### 기타내용

CSS Module은 Sass에서도 사용가능합니다. 확장자를 `.module.scss`로 바꿔주기만 하면 됩니다. 물론 `node-sass`를 설치해야 합니다.

CSS Module을 전역적 클래스이름으로 사용할 수 도 있습니다.

```css
:global .my-global-name {

}
```

Sass를 사용한다면 다음과 같이하면 됩니다.

```sass
:global {
  .my-global-name {

  }
}
```



반대로 CSS Module을 사용하지 않는 곳에서 특정 클래스에서만 고유 이름을 만들어서 사용하고 싶다면 다음과 같이 합니다.

```css
:local .make-this-local {

}
```

Sass는 다음과 같습니다.

```sass
:local {
  .make-this-local {

  }
}
```



---

**Reference**

https://react.vlpt.us/styling/02-css-module.html