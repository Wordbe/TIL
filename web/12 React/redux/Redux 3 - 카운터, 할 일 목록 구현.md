# Redux 3 - 카운터, 할 일 목록 구현



### Presentationl Component 생성

프리젠테이셔널 컴포넌트란, 리덕스 스토어에 직접 접근하지 않고 필요한 값 또는 함수를 props로만 받아와서 사용하는 컴포넌트입니다.

**components/Counter.js**

```javascript
import React from 'react';

function Counter({ number, diff, onIncrease, onDecrease, onSetDiff }) {
  const onChange = e => {
    // e.target.value 의 타입은 문자열이기 때문에 숫자로 변환해주어야 합니다.
    onSetDiff(parseInt(e.target.value, 10));
  };
  return (
    <div>
      <h1>{number}</h1>
      <div>
        <input type="number" value={diff} min="1" onChange={onChange} />
        <button onClick={onIncrease}>+</button>
        <button onClick={onDecrease}>-</button>
      </div>
    </div>
  );
}

export default Counter;
```

프리젠테이셔널 컴포넌트에선 주로 이렇게 UI를 선언하는 것에 집중하며, 필요한 값이나 함수는 props로 받아와서 사용하는 형태로 구현합니다.



### Container Component 생성

컨테이너 컴포넌트란, **리덕스 스토어의 상태를 조회하거나 액션을 디스패치할 수 있는 컴포넌트**를 의미합니다. **HTML 태그를 사용하지 않고 다른 프리젠테이셔널 컴포넌트들을 불러와서 사용**합니다.



**containers/CounterContainer.js**

```javascript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

function CounterContainer() {
  // useSelector는 리덕스 스토어의 상태를 조회하는 Hook입니다.
  // state의 값은 store.getState() 함수를 호출했을 때 나타나는 결과물과 동일합니다.
  const { number, diff } = useSelector(state => ({
    number: state.counter.number,
    diff: state.counter.diff
  }));

  // useDispatch 는 리덕스 스토어의 dispatch 를 함수에서 사용 할 수 있게 해주는 Hook 입니다.
  const dispatch = useDispatch();
  // 각 액션들을 디스패치하는 함수들을 만드세요
  const onIncrease = () => dispatch(increase());
  const onDecrease = () => dispatch(decrease());
  const onSetDiff = diff => dispatch(setDiff(diff));

  return (
    <Counter
      // 상태와
      number={number}
      diff={diff}
      // 액션을 디스패치 하는 함수들을 props로 넣어줍니다.
      onIncrease={onIncrease}
      onDecrease={onDecrease}
      onSetDiff={onSetDiff}
    />
  );
}

export default CounterContainer;
```

App 컴포넌트에서 CounterContainer를 불러와서 렌더링합니다.



**App.js**

```javascript
import React from 'react';
import CounterContainer from './containers/CounterContainer';

function App() {
  return (
    <div>
      <CounterContainer />
    </div>
  );
}

export default App;
```



Presentational Component와 Container Component는 리덕스의 창시자 Dan Abramov가 소개하면서 [이러한 패턴](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)으로 컴포넌트들을 구분짓는게 당연시 되었습니다.

하지만 꼭 이렇게 할 필요는 없습니다. Dan Abramov도 자신의 포스트에서 그렇게 말하고 있습니다. 프리젠테이셔널 / 컨테이너 컴포넌트를 구분지어서 작성하지만, 디렉터리상으로는 따로 구분짓지 않는 것을 선호하기도 합니다.



---

## 6 리덕스 개발자 도구 적용

리덕스 개발자 도구를 사용하면 현재 스토어의 상태를 개발자 도구에서 조회할 수 있고, 지금까지 어떤 액션들이 디스패치 되었는지, 액션에 따라 상태가 어떻게 변화했는지 확인할 수 있습니다. 또한 액션을 직접 디스패치 할 수도 있습니다.

[크롬 웹 스토어](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)([파이어폭스](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)도 가능)에서 redux 확장프로그램을 설치합니다. 

[redux-devtools-extension](https://www.npmjs.com/package/redux-devtools-extension)를 설치합니다.

```
$ yarn add redux-devtools-extension
```



마지막으로, **index.js**를 수정합니다.

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import { composeWithDevTools } from 'redux-devtools-extension'; // 리덕스 개발자 도구

const store = createStore(rootReducer, composeWithDevTools()); // 스토어를 만듭니다.
// composeWithDevTools 를 사용하여 리덕스 개발자 도구 활성화

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);


serviceWorker.unregister();
```



크롬 개발자 도구의 Redux 탭에서 확인 가능합니다.



---

## 7 할 일 목록 구현



### Presentational Componen 구현

Todos라는 프리젠테이션 컴포넌트를 구현합니다.

TodoItem, TodoList, Todos 이렇게 3가지의 컴포넌트를 작성합니다. 여러 개의 컴포넌트를 만드는 이유는 컴포넌트의 리렌더링 성능을 최적화하기 위함입니다. 편의상 한 파일에 모두 작성합니다. 취향에 따라 파일 분리가 가능합니다.

**components/Todos.js**

```javascript
import React, { useState } from 'react';

// 컴포넌트 최적화를 위하여 React.memo를 사용합니다
const TodoItem = React.memo(function TodoItem({ todo, onToggle }) {
  return (
    <li
      style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
      onClick={() => onToggle(todo.id)}
    >
      {todo.text}
    </li>
  );
});

// 컴포넌트 최적화를 위하여 React.memo를 사용합니다
const TodoList = React.memo(function TodoList({ todos, onToggle }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
});

function Todos({ todos, onCreate, onToggle }) {
  // 리덕스를 사용한다고 해서 모든 상태를 리덕스에서 관리해야하는 것은 아닙니다.
  const [text, setText] = useState('');
  const onChange = e => setText(e.target.value);
  const onSubmit = e => {
    e.preventDefault(); // Submit 이벤트 발생했을 때 새로고침 방지
    onCreate(text);
    setText(''); // 인풋 초기화
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={text}
          placeholder="할 일을 입력하세요.."
          onChange={onChange}
        />
        <button type="submit">등록</button>
      </form>
      <TodoList todos={todos} onToggle={onToggle} />
    </div>
  );
}

export default Todos;
```



### Container Component 생성

**containers/TodosContainer.js**

```javascript
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Todos from '../components/Todos';
import { addTodo, toggleTodo } from '../modules/todos';

function TodosContainer() {
  // useSelector 에서 꼭 객체를 반환 할 필요는 없습니다.
  // 한 종류의 값만 조회하고 싶으면 그냥 원하는 값만 바로 반환하면 됩니다.
  const todos = useSelector(state => state.todos);
  const dispatch = useDispatch();

  const onCreate = text => dispatch(addTodo(text));
  const onToggle = useCallback(id => dispatch(toggleTodo(id)), [dispatch]); // 최적화를 위해 useCallback 사용

  return <Todos todos={todos} onCreate={onCreate} onToggle={onToggle} />;
}

export default TodosContainer;
```



렌더링해봅시다.

**App.js**

```javascript
import React from 'react';
import CounterContainer from './containers/CounterContainer';
import TodosContainer from './containers/TodosContainer';

function App() {
  return (
    <div>
      <CounterContainer />
      <hr />
      <TodosContainer />
    </div>
  );
}

export default App;
```

새 항목이 잘 등록되는지 (onCreate), 항목 클릭 시 토글이 잘 작동하는지(onToggle) 확인해봅니다.



---

**Reference**

https://react.vlpt.us/redux/05-counter.html

https://react.vlpt.us/redux/06-redux-devtools.html

https://react.vlpt.us/redux/07-implement-todos.html