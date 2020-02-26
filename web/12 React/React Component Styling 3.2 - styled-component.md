# React Component Styling 3.2 - styled-component





---

### Dialog 만들기



이번에는 기존 화면을 가리게 되면서 정보를 보여주는 Dialog 컴포넌트를 만들어봅니다.

**components/Dialog.js**

```javascript
import React from 'react';
import styled from 'styled-components';
import Button from './Button';

const DarkBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
`;

const DialogBlock = styled.div`
  width: 320px;
  padding: 1.5rem;
  background: white;
  border-radius: 2px;
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    font-size: 1.125rem;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 3rem;
  display: flex;
  justify-content: flex-end;
`;

function Dialog({ title, children, confirmText, cancelText }) {
  return (
    <DarkBackground>
      <DialogBlock>
        <h3>{title}</h3>
        <p>{children}</p>
        <ButtonGroup>
          <Button color="gray">{cancelText}</Button>
          <Button color="pink">{confirmText}</Button>
        </ButtonGroup>
      </DialogBlock>
    </DarkBackground>
  );
}

Dialog.defaultProps = {
  confirmText: '확인',
  cancelText: '취소'
};

export default Dialog;
```



h3, p 태그 스타일링을 아래와 같이 굳이 따로 만들어주지 않아도 됩니다.

```javascript
const Title = styled.h3``;
const Description = styled.p``;
```

styled-components 에서도 아래와 같이 Nested CSS 문법을 사용할 수 있습니다.

```javascript
const DialogBlock = styled.div`
  h3 {}
  p {}
`;
```



**App.js**

```javascript
...
import Dialog from './components/Dialog';
...
		<Dialog
          title="정말로 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
        >
          데이터를 정말로 삭제하시겠습니까?
        </Dialog>
      </>
    </ThemeProvider>
...
```



Dialog 에서 취소 버튼과 삭제 버튼의 간격이 조금 넓어보입니다. styled-components로 컴포넌트의 스타일을 덮어쓰는 방법을 알아보겠습니다.

ShortMarginButton을 만들고 기존 Button을 대체시켜봅니다.

**Dialog.js**

```javascript
...
const ShortMarginButton = styled(Button)`
  & + & {
    margin-left: 0.5rem;
  }
`;

function Dialog({ title, children, confirmText, cancelText }) {
  return (
    <DarkBackground>
      <DialogBlock>
        <h3>{title}</h3>
        <p>{children}</p>
        <ButtonGroup>
          <ShortMarginButton color="gray">{cancelText}</ShortMarginButton>
          <ShortMarginButton color="pink">{confirmText}</ShortMarginButton>
        </ButtonGroup>
      </DialogBlock>
    </DarkBackground>
  );
}
...
```



이렇게 컴포넌트의 스타일을 커스터마이징 할 때에는 해당 컴포넌트에서 `className` props를 내부 엘리먼트에게 잘 전달하고 있는지 확인해주어야 합니다.

우리가 만든 Button 컴포넌트의 경우 `...rest`를 통하여 전달되고 있습니다.



이번에는 열고 닫는 기능을 구현해봅시다. Dialog에서 `onConfirm`과 `onCancel`을 props로 받아오고, 각 함수들을 각 버튼의 `onClick`으로 설정합니다. 또한 `visible` props도 받아와서 false 일때 null을 반환하도록 합니다.



**Dialog.js**

```javascript
...
function Dialog({
  title,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  visible
}) {
  if (!visible) return null;
  return (
    <DarkBackground>
      <DialogBlock>
        <h3>{title}</h3>
        <p>{children}</p>
        <ButtonGroup>
          <ShortMarginButton color="gray" onClick={onCancel}>
            {cancelText}
          </ShortMarginButton>
          <ShortMarginButton color="pink" onClick={onConfirm}>
            {confirmText}
          </ShortMarginButton>
        </ButtonGroup>
      </DialogBlock>
    </DarkBackground>
  );
}
...
```



다음으로는 App 컴포넌트에서 `useState`를 사용하여 Dialog의 가시성 상태를 관리해봅시다.

**App.js**

```javascript
import React, { useState } from 'react';
...

function App() {
  const [dialog, setDialog] = useState(false);
  const onClick = () => {
    setDialog(true);
  };
  const onConfirm = () => {
    console.log('확인');
    setDialog(false);
  };
  const onCancel = () => {
    console.log('취소');
    setDialog(false);
  };
...
		    <Button color="gray" size="large" fullWidth>
                BUTTON
              </Button>
              <Button color="pink" size="large" fullWidth onClick={onClick}>
                삭제
              </Button>
            </ButtonGroup>
          </AppBlock>
          <Dialog
            title="정말로 삭제하시겠습니까?"
            confirmText="삭제"
            cancelText="취소"
            onConfirm={onConfirm}
            onCancel={onCancel}
            visible={dialog}
          >
            데이터를 정말로 삭제하시겠습니까?
          </Dialog>
        </>
      </ThemeProvider>
...
```





---

### 트랜지션(Transition) 구현하기

Dialog 가 나타나거나 사라질 때 트랜지션 효과를 적용해보겠습니다. [CSS Keyframe](https://developer.mozilla.org/ko/docs/Web/CSS/@keyframes) 을 사용하며, styled-components 에서 이를 사용할 때는 `keyframes` 유틸을 사용합니다.

Dialog가 나타날 때 DarkBackground 쪽에서는 서서히 나타나는 fadeIn 효과를 주고, DialogBlock에는 아래에서부터 위로 올라오는 효과를 보여주는 slideUp 효과를 주어봅니다. 애니메이션 이름은 사용자 마음대로 정할 수 있습니다.

**Dialog.js**

```javascript
import React from 'react';
import styled, { keyframes } from 'styled-components';
import Button from './Button';

const fadeIn = keyframes`
  from {
    opacity: 0
  }
  to {
    opacity: 1
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(200px);
  }
  to {
    transform: translateY(0px);
  }
`;

const DarkBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);

  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-name: ${fadeIn};
  animation-fill-mode: forwards;
`;

const DialogBlock = styled.div`
  width: 320px;
  padding: 1.5rem;
  background: white;
  border-radius: 2px;
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    font-size: 1.125rem;
  }

  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-name: ${slideUp};
  animation-fill-mode: forwards;
`;
...
```



컴포넌트가 나타날 때 트랜지션 효과를 구현해보았습니다.

사라지는 트랜지션 효과도 만들어봅시다.



사라지는 효과를 구현하려면 Dialog 컴포넌트에서 두 개의 로컬 상태를 관리해주어야 합니다. 하나는 현재 트랜지션 효과를 보여주고 있는 중이라는 상태를 의미하는 `animate`, 다른 하나는 실제로 컴포넌트가 사라지는 시점을 지연시키기 위한 `localVisible`값 입니다.

`useEffect`도 작성해주어야 합니다. `visible`값이 true에서 false로 바뀌는 시점을 감지하여 `animate`값을 true로 바꿔주고, `setTimeout`함수를 사용하여 250ms 이후 false로 바꾸어 주어야 합니다.

추가로 `!visible`조건에서 null을 반환하는 대신 `!animate && !localVisible`조건에서 null을 반환하도록 수정해주어야 합니다.



**Dialog.js**

```javascript
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Button from './Button';

...

const DarkBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);

  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-name: ${fadeIn};
  animation-fill-mode: forwards;
`;

const DialogBlock = styled.div`
  width: 320px;
  padding: 1.5rem;
  background: white;
  border-radius: 2px;
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    font-size: 1.125rem;
  }

  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-name: ${slideUp};
  animation-fill-mode: forwards;
`;
...

function Dialog({
  title,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  visible
}) {
  const [animate, setAnimate] = useState(false);
  const [localVisible, setLocalVisible] = useState(visible);

  useEffect(() => {
    // visible 값이 true -> false 가 되는 것을 감지
    if (localVisible && !visible) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 250);
    }
    setLocalVisible(visible);
  }, [localVisible, visible]);

  if (!animate && !localVisible) return null;
  return (
    <DarkBackground>
      <DialogBlock>
        <h3>{title}</h3>
        <p>{children}</p>
        <ButtonGroup>
          <ShortMarginButton color="gray" onClick={onCancel}>
            {cancelText}
          </ShortMarginButton>
          <ShortMarginButton color="pink" onClick={onConfirm}>
            {confirmText}
          </ShortMarginButton>
        </ButtonGroup>
      </DialogBlock>
    </DarkBackground>
  );
}
...
```



확인/취소를 눌렀을 때 약간의 딜레이 이후에 Dialog가 사라지는 것을 확인할 수 있습니다. 잘 모르겠으면 `setTimeout`을 1000로 설정해서 딜레이가 있는지 봅시다.



이제 DarkBackground와 DialogBlock에 `disapper` props를 주어서 사라지는 효과를 만들어봅시다.

**Dialog.js**

```javascript
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Button from './Button';

const fadeIn = keyframes`
  from {
    opacity: 0
  }
  to {
    opacity: 1
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1
  }
  to {
    opacity: 0
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(200px);
  }
  to {
    transform: translateY(0px);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(200px);
  }
`;

const DarkBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);

  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-name: ${fadeIn};
  animation-fill-mode: forwards;

  ${props =>
    props.disappear &&
    css`
      animation-name: ${fadeOut};
    `}
`;

const DialogBlock = styled.div`
  width: 320px;
  padding: 1.5rem;
  background: white;
  border-radius: 2px;
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    font-size: 1.125rem;
  }

  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-name: ${slideUp};
  animation-fill-mode: forwards;

  ${props =>
    props.disappear &&
    css`
      animation-name: ${slideDown};
    `}
`;

const ButtonGroup = styled.div`
  margin-top: 3rem;
  display: flex;
  justify-content: flex-end;
`;

const ShortMarginButton = styled(Button)`
  & + & {
    margin-left: 0.5rem;
  }
`;

function Dialog({
  title,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  visible
}) {
  const [animate, setAnimate] = useState(false);
  const [localVisible, setLocalVisible] = useState(visible);

  useEffect(() => {
    // visible 값이 true -> false 가 되는 것을 감지
    if (localVisible && !visible) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 250);
    }
    setLocalVisible(visible);
  }, [localVisible, visible]);

  if (!animate && !localVisible) return null;
  return (
    <DarkBackground disappear={!visible}>
      <DialogBlock disappear={!visible}>
        <h3>{title}</h3>
        <p>{children}</p>
        <ButtonGroup>
          <ShortMarginButton color="gray" onClick={onCancel}>
            {cancelText}
          </ShortMarginButton>
          <ShortMarginButton color="pink" onClick={onConfirm}>
            {confirmText}
          </ShortMarginButton>
        </ButtonGroup>
      </DialogBlock>
    </DarkBackground>
  );
}

Dialog.defaultProps = {
  confirmText: '확인',
  cancelText: '취소'
};

export default Dialog;
```





---

**Reference**

https://react.vlpt.us/styling/03-styled-components.html