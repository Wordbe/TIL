## 2. Context API 활용한 상태 관리

Todo List 애플리케이션에서, 상태 관리를 한다면 다음과 같은 구조로 구현할 수 있습니다.

![](https://i.ibb.co/L5pCHh8/image.png)



App 에서 todos 상태와, onToggle, onRemove, onCreate 함수를 갖고 있고, 해당 값들을 props를 사용해서 자식 컴포넌트들에게 전달하는 구조입니다.

하지만,  프로젝트 규모가 커지게 되면 최상위 컴포넌트인 App에서 모든 상태를 관리하기엔 App 코드가 너무 복잡해질 수도 있고, props를 전달해줘야 하는 컴포넌트가 너무 깊숙히 있을 수도 있습니다.

여기서 Context API 를 활용한다면 다음과 같이 구현이 가능합니다.

![](https://i.imgur.com/lYiiIZF.png)



선이 많아서 복잡해보이지만, 실제로 코드는 매우 깔끔합니다. 



---

### Reducer 만들기

src/TodoContext.js 파일 생성 후, `useReducer`를 사용하여 상태를 관리하는 TodoProvider 컴포넌트를 작성합니다.

```javascript
import React, { useReducer } from 'react';

const initialTodos = [
  {
    id: 1,
    text: '프로젝트 생성하기',
    done: true
  },
  {
    id: 2,
    text: '컴포넌트 스타일링하기',
    done: true
  },
  {
    id: 3,
    text: 'Context 만들기',
    done: false
  },
  {
    id: 4,
    text: '기능 구현하기',
    done: false
  }
];

function todoReducer(state, action) {
  switch (action.type) {
    case 'CREATE':
      return state.concat(action.todo);
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      );
    case 'REMOVE':
      return state.filter(todo => todo.id !== action.id);
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialTodos);
  return children;
}
```



### Context 만들기

이제 Context를 통하여 state와 dispatch를 다른 컴포넌트에서 바로 사용할 수 있게 해줄 겁니다. 한 개의 Cotext를 만들어서 state, dispatch를 함께 넘겨 주는 대신, 두 개의 Context를 넣어서 따로 따로 넣어보겠습니다. 이렇게 하면 dispatch 만 필요한 컴포넌트에서 불필요한 렌더링을 방지할 수 있습니다. 또한 관리하기에 용이하기도 합니다.



**TodoContext.js**

```javascript
import React, { useReducer, createContext } from 'react';
...
const TodoStateContext = createContext();
const TodoDispatchContext = createContext();

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialTodos);
  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}
```

Context 에서 사용할 값을 지정할 때는 Provider 컴포넌트를 렌더링 하고, value를 설정해주면 됩니다. props로 받아온 children 값을 내부에 렌더링 합니다.

이렇게 하면 state나 dispatch를 사용하고 싶을 때 다음과 같이 다른 컴포넌트에서 사용할 수 있습니다.

```javascript
import React, { useContext } from 'react';
import { TodoStateContext, TodoDispatchContext } from '../TodoContext';

function Sample() {
  const state = useContext(TodoStateContext);
  const dispatch = useContext(TodoDispatchContext);
  return <div>Sample</div>;
}
```



---

### Custom Hook 만들기

`useContext`를 직접 사용하는 대신, `useContext`를 사용하는 커스텀 Hook을 만들어 내보내 보겠습니다.



**TodoContext.js**

```javascript
...
export function useTodoState() {
  return useContext(TodoStateContext);
}

export function useTodoDispatch() {
  return useContext(TodoDispatchContext);
}
```

이렇게 해놓으면 나중에 아래와 같이 다른 파일에서 사용할 수 있습니다.

```javascript
import React from 'react';
import { useTodoState, useTodoDispatch } from '../TodoContext';

function Sample() {
  const state = useTodoState();
  const dispatch = useTodoDispatch();
  return <div>Sample</div>;
}
```



취향에 따라 `useContext`를 컴포넌트에서 바로 사용해도 상관 없습니다.



---

### nextId 값 관리하기



nextId 값을 위한 Context를 만들어주겠습니다. nextId는 새로운 항목을 추가할 때 사용할 고유 ID 입니다. 이 값은 `useRef`를 사용하여 관리해줍니다.

**TodoCotext.js**

```javascript
import React, { useReducer, createContext, useContext, useRef } from 'react';
...
const TodoNextIdContext = createContext();

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialTodos);
  const nextId = useRef(5);

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        <TodoNextIdContext.Provider value={nextId}>
          {children}
        </TodoNextIdContext.Provider>
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}
...

export function useTodoNextId() {
  return useContext(TodoNextIdContext);
}
```







---

### Custom Hook 에서 에러 처리

`useTodoState`, `useTodoDispatch`, `useTodoNextId` Hook을 사용하려면, 해당 컴포넌트가 TodoProvider 컴포넌트 내부에 렌더링되어 이써야 합니다. 

만약 TodoProvider로 감싸져있지 않다면 에러를 발생시키도록 커스텀 Hook을 수정해봅니다.

**TodoContext.js**

```javascript
...
export function useTodoState() {
  const context = useContext(TodoStateContext);
  if (!context) {
    throw new Error('Cannot find TodoProvider');
  }
  return context;
}

export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (!context) {
    throw new Error('Cannot find TodoProvider');
  }
  return context;
}

export function useTodoNextId() {
  const context = useContext(TodoNextIdContext);
  if (!context) {
    throw new Error('Cannot find TodoProvider');
  }
  return context;
}
```

꼭 해줄필요는 없지만, 에러 처리를 먼저해주면 나중에 실수했을 때 문제점을 빨리 발견할 수 있습니다.



### 컴포넌트 TodoProvider로 감싸기

**App.js**

```javascript
...
import { TodoProvider } from './TodoContext';
...

function App() {
  return (
    <TodoProvider>
      <GlobalStyle />
      <TodoTemplate>
        <TodoHead />
        <TodoList />
        <TodoCreate />
      </TodoTemplate>
    </TodoProvider>
  );
}

export default App;
```



이제 TodoHead 컴포넌트에서 `useTodoState`를 사용해보겠습니다.

**components/TodoHead.js**

```javascript
import React from 'react';
import styled from 'styled-components';
import { useTodoState } from '../TodoContext';

...

function TodoHead() {
  const todos = useTodoState();
  console.log(todos);
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



크롬 개발자도구(F12) 에서 현재 Context가 지니고 있는 `state`를 확인해봅시다.





---

**Reference**

https://react.vlpt.us/mashup-todolist/02-manage-state.html