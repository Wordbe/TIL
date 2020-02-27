## Awesome Todo 리스트 만들기

사용할 개념

* styled-components 로 컴포넌트 스타일링
* ContextAPI를 사용한 전역 상태 관리
* 배열 상태 다루기



## 1. Component 만들기



mashup-todolist 프로젝트를 생성합니다.

```
$ npx create-react-app mashup-todolist
$ cd mashup-todolist
$ yarn add react-icons styled-components
$ yarn start
```



컴포넌트 5개를 만들 것 입니다.

* **TodoTemplate**

  TodoList의 레이아웃을 설정합니다.

* **TodoHead**

  오늘 날짜, 요일을 보여주고, 앞으로 해야할 일 수를 보여줍니다.

* **TodoList**

  todos 배열을 여러개의 TodoItem 컴포넌트로 렌더링해줍니다.

* **TodoItem**

  할 일에 대한 정보를 렌더링해주는 컴포넌트입니다. 할 일의 완료 여부를 toggle 할 수 있고, 마우스를 올리면 휴지통 아이콘이 나타나며 이를 누르면 항목이 삭제됩니다.

* **TodoCreate**

  새로운 할 일을 등록해주는 컴포넌트입니다.



### 페이지에 회색 배경색상 적용

`body`태그의 CSS로 회색(`#e9ecef`) 배경색상을 적용합니다. index.css에서 해도 되지만, styled-components를 사용해 보겠습니다. 

styled-components 에서 전역 스타일을 추가하려면 `createGlobalStyle`을 사용하여 만들어진 컴포넌트를 렌더링합니다.



**App.js**

```javascript
import React from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background: #e9ecef;
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <div>안녕하세요</div>
    </>
  );
}

export default App;
```



---

### TodoTemplate 만들기

**components/TodoTemplate.js**

```javascript
import React from 'react';
import styled from 'styled-components';

const TodoTemplateBlock = styled.div`
  width: 512px;
  height: 768px;

  position: relative; /* 추후 박스 하단에 추가 버튼을 위치시키기 위한 설정 */
  background: white;
  border-radius: 16px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.04);

  margin: 0 auto; /* 페이지 중앙에 나타나도록 설정 */

  margin-top: 96px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
`;

function TodoTemplate({ children }) {
  return <TodoTemplateBlock>{children}</TodoTemplateBlock>;
}

export default TodoTemplate;
```



**App.js**

```javascript
...
import TodoTemplate from './components/TodoTemplate';
...
function App() {
  return (
    <>
      <GlobalStyle />
      <TodoTemplate>안녕하세요</TodoTemplate>
    </>
  );
}
...
```



---

### TodoHead 만들기

**components/TodoHead.js**

```javascript
import React from 'react';
import styled from 'styled-components';

const TodoHeadBlock = styled.div`
  padding-top: 48px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
  h1 {
    margin: 0;
    font-size: 36px;
    color: #343a40;
  }
  .day {
    margin-top: 4px;
    color: #868e96;
    font-size: 21px;
  }
  .tasks-left {
    color: #20c997;
    font-size: 18px;
    margin-top: 40px;
    font-weight: bold;
  }
`;

function TodoHead() {
  return (
    <TodoHeadBlock>
      <h1>2019년 7월 10일</h1>
      <div className="day">수요일</div>
      <div className="tasks-left">할 일 2개 남음</div>
    </TodoHeadBlock>
  );
}

export default TodoHead;
```



위 코드는 일반 HTML 태그를 사용하면서, TodoHeadBlock 스타일에서 CSS Selector를 사용하여 스타일링을 해주었습니다.

하나하나 모두 컴포넌트로 만들어도 상관 없지만, 조건부 스타일링을 할 필요가 없고, 기능적으로도 크게 중요하지 않은 내용이라면 CSS Selector를 사용하는 것도 좋은 방법입니다. 취향에 따라 결정하시면 됩니다.



**App.js**

```javascript
...
import TodoHead from './components/TodoHead';
...

function App() {
  return (
    <>
      <GlobalStyle />
      <TodoTemplate>
        <TodoHead />
      </TodoTemplate>
    </>
  );
}
...
```



---

### TodoList 만들기

**components/TodoList.js**

```javascript
import React from 'react';
import styled from 'styled-components';

const TodoListBlock = styled.div`
  flex: 1;
  padding: 20px 32px;
  padding-bottom: 48px;
  overflow-y: auto;
  background: gray; /* 사이즈 조정이 잘 되고 있는지 확인하기 위한 임시 스타일 */
`;

function TodoList() {
  return <TodoListBlock>TodoList</TodoListBlock>;
}

export default TodoList;
```



`flex: 1` 은 자신이 차지 할 수 있는 영역을 꽉채우도록 하는 설정입니다. 



**App.js**

````javascript
...
import TodoList from './components/TodoList';
...

function App() {
  return (
    <>
      <GlobalStyle />
      <TodoTemplate>
        <TodoHead />
        <TodoList />
      </TodoTemplate>
    </>
  );
}
...
````



---

### TodoItem 만들기

react-icons 에서 MdDone, MdDelelte 아이콘을 사용하겠습니다.

**components/TodoItems.js**

```javascript
import React from 'react';
import styled, { css } from 'styled-components';
import { MdDone, MdDelete } from 'react-icons/md';

const Remove = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dee2e6;
  font-size: 24px;
  cursor: pointer;
  &:hover {
    color: #ff6b6b;
  }
  display: none;
`;

const TodoItemBlock = styled.div`
  display: flex;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;
  &:hover {
    ${Remove} {
      display: initial;
    }
  }
`;

const CheckCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: 1px solid #ced4da;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  cursor: pointer;
  ${props =>
    props.done &&
    css`
      border: 1px solid #38d9a9;
      color: #38d9a9;
    `}
`;

const Text = styled.div`
  flex: 1;
  font-size: 21px;
  color: #495057;
  ${props =>
    props.done &&
    css`
      color: #ced4da;
    `}
`;

function TodoItem({ id, done, text }) {
  return (
    <TodoItemBlock>
      <CheckCircle done={done}>{done && <MdDone />}</CheckCircle>
      <Text done={done}>{text}</Text>
      <Remove>
        <MdDelete />
      </Remove>
    </TodoItemBlock>
  );
}

export default TodoItem;
```



TodoItemBlock 에서 사용된 기능은 [Component Selector](https://styled-components.com/docs/advanced#referring-to-other-components) 입니다. 이 스타일은 TodoItemBlock 위에 커서가 있을 때 Remove 컴포넌트를 보여줍니다.



**components/TodoList.js**

```javascript
...
import TodoItem from './TodoItem';
...

function TodoList() {
  return (
    <TodoListBlock>
      <TodoItem text="프로젝트 생성하기" done={true} />
      <TodoItem text="컴포넌트 스타일링 하기" done={true} />
      <TodoItem text="Context 만들기" done={false} />
      <TodoItem text="기능 구현하기" done={false} />
    </TodoListBlock>
  );
}
...
```



---

### TodoCreate 만들기

이 컴포넌트에서는 react-icons의 MdAdd를 사용합니다.

또한 `useState`를 사용하여 토글할 수 있는 open 값을 관리하고, 이 값이 true일 때 아이콘을 45도 돌려서 X 모양이 보여지게 한 후 버튼 색상을 빨간색으로 바꿔줍니다. 그리고 할 일을 입력할 수 있는 폼도 보여줍니다.



**components/Todocreate.js**

```javascript
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { MdAdd } from 'react-icons/md';

const CircleButton = styled.button`
  background: #38d9a9;
  &:hover {
    background: #63e6be;
  }
  &:active {
    background: #20c997;
  }

  z-index: 5;
  cursor: pointer;
  width: 80px;
  height: 80px;
  display: block;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  position: absolute;
  left: 50%;
  bottom: 0px;
  transform: translate(-50%, 50%);
  color: white;
  border-radius: 50%;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: 0.125s all ease-in;
  ${props =>
    props.open &&
    css`
      background: #ff6b6b;
      &:hover {
        background: #ff8787;
      }
      &:active {
        background: #fa5252;
      }
      transform: translate(-50%, 50%) rotate(45deg);
    `}
`;

const InsertFormPositioner = styled.div`
  width: 100%;
  bottom: 0;
  left: 0;
  position: absolute;
`;

const InsertForm = styled.form`
  background: #f8f9fa;
  padding-left: 32px;
  padding-top: 32px;
  padding-right: 32px;
  padding-bottom: 72px;

  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  border-top: 1px solid #e9ecef;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  width: 100%;
  outline: none;
  font-size: 18px;
  box-sizing: border-box;
`;

function TodoCreate() {
  const [open, setOpen] = useState(false);

  const onToggle = () => setOpen(!open);

  return (
    <>
      {open && (
        <InsertFormPositioner>
          <InsertForm>
            <Input autoFocus placeholder="할 일을 입력 후, Enter 를 누르세요" />
          </InsertForm>
        </InsertFormPositioner>
      )}
      <CircleButton onClick={onToggle} open={open}>
        <MdAdd />
      </CircleButton>
    </>
  );
}

export default TodoCreate;
```



**App.js**

```javascript
...
import TodoCreate from './components/TodoCreate';
...

function App() {
  return (
    <>
      <GlobalStyle />
      <TodoTemplate>
        <TodoHead />
        <TodoList />
        <TodoCreate />
      </TodoTemplate>
    </>
  );
}
...
```









---

**Reference**

https://react.vlpt.us/mashup-todolist/01-create-components.html