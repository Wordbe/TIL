# TypeScript 5 - 리덕스 프로처럼 사용하기

 [리덕스 튜토리얼](https://react.vlpt.us/redux/)에서 만들어봤었던 카운터와, 할 일 목록을 구현합니다.



### 프로젝트 생성

```
$ npx create-react-app ts-react-redux-tutorial --typescript
$ cd ts-react-redux-tutorial
$ yarn add redux react-redux @types/react-redux
```

* redux는 자체적으로 타입스크립트가 지원됩니다.
* react-redux는 타입스크립트를 지원하지 않습니다. 이럴 경우 `@types/`를 앞에 붙여 설치합니다.
* 라이브러리에서 공식 typescript 지원되는지 불러와서 확인해봐도 좋고, github 레포를 열어 `index.d.ts`파일이 있는지 확인해도 좋습니다.[(리덕스의 index.d.ts)](https://github.com/reduxjs/redux/blob/master/index.d.ts)
* `@types`는 라이브러리가 타입스크립트를 지원하도록 추가된 써드파티 라이브러리입니다. 라이브러리에 써드파티 타입스크립트 지원이 되는지 여부를 확인하려면  [npm](https://www.npmjs.com/search?q=%40types%2Freact-redux) 에서 `@types/라이브러리명` 을 검색하거나, [TypeSearch](https://microsoft.github.io/TypeSearch/) 에서 라이브러리명을 검색하면 됩니다.



### 카운터 리덕스 모듈 작성하기

리덕스 코드를 작성할 때, [Ducks 패턴](https://github.com/erikras/ducks-modular-redux)을 사용합니다. → 액션타입, 액션생성함수, 리듀서를 모두 한 파일에 작성하자는 의미입니다.



**src/modules/counter.ts**

```typescript
// 액션 타입을 선언합니다
// 뒤에 as const 를 붙여줌으로써 나중에 액션 객체를 만들게 action.type 의 값을 추론하는 과정에서
// action.type 이 string 으로 추론되지 않고 'counter/INCREASE' 와 같이 실제 문자열 값으로 추론 되도록 해줍니다.
const INCREASE = 'counter/INCREASE' as const;
const DECREASE = 'counter/DECREASE' as const;
const INCREASE_BY = 'counter/INCREASE_BY' as const;

// 액션 생성함수를 선언합니다
export const increase = () => ({
  type: INCREASE
});

export const decrease = () => ({
  type: DECREASE
});

export const increaseBy = (diff: number) => ({
  type: INCREASE_BY,
  // 액션에 부가적으로 필요한 값을 payload 라는 이름으로 통일합니다
  // 이는 FSA (https://github.com/redux-utilities/flux-standard-action) 라는 규칙인데
  // 이 규칙을 적용하면 액션들이 모두 비슷한 구조로 이루어져있게 되어 추후 다룰 때도 편하고
  // 읽기 쉽고, 액션 구조를 일반화함으로써 액션에 관련돤 라이브러리를 사용 할 수 있게 해줍니다.
  // 다만, 무조건 꼭 따를 필요는 없습니다.
  payload: diff
});

// 모든 액션 겍체들에 대한 타입을 준비해줍니다.
// ReturnType<typeof _____> 는 특정 함수의 반환값을 추론해줍니다
// 상단부에서 액션타입을 선언 할 떄 as const 를 하지 않으면 이 부분이 제대로 작동하지 않습니다.
type CounterAction =
  | ReturnType<typeof increase>
  | ReturnType<typeof decrease>
  | ReturnType<typeof increaseBy>;

// 이 리덕스 모듈에서 관리 할 상태의 타입을 선언합니다
type CounterState = {
  count: number;
};

// 초기상태를 선언합니다.
const initialState: CounterState = {
  count: 0
};

// 리듀서를 작성합니다.
// 리듀서에서는 state 와 함수의 반환값이 일치하도록 작성하세요.
// 액션에서는 우리가 방금 만든 CounterAction 을 타입으로 설정합니다.
function counter(
  state: CounterState = initialState,
  action: CounterAction
): CounterState {
  switch (action.type) {
    case INCREASE: // case 라고 입력하고 Ctrl + Space 를 누르면 어떤 종류의 action.type들이 있는지 확인 할 수 있습니다.
      return { count: state.count + 1 };
    case DECREASE:
      return { count: state.count - 1 };
    case INCREASE_BY:
      return { count: state.count + action.payload };
    default:
      return state;
  }
}

export default counter;
```



### 프로젝트에 리덕스 적용

**modules/index.ts**

```typescript
import { combineReducers } from 'redux';
import counter from './counter';

const rootReducer = combineReducers({
  counter
});

// 루트 리듀서를 내보내주세요.
export default rootReducer;

// 루트 리듀서의 반환값를 유추해줍니다
// 추후 이 타입을 컨테이너 컴포넌트에서 불러와서 사용해야 하므로 내보내줍니다.
export type RootState = ReturnType<typeof rootReducer>;
```



**src/index.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './modules';

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```



---

### 카운터 Presentational Component 생성

**src/components/Counter.tsx**

```typescript
import React from 'react';

type CounterProps {
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onIncreaseBy: (diff: number) => void;
}

function Counter({
  count,
  onIncrease,
  onDecrease,
  onIncreaseBy
}: CounterProps) {
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={onIncrease}>+1</button>
      <button onClick={onDecrease}>-1</button>
      <button onClick={() => onIncreaseBy(5)}>+5</button>
    </div>
  );
}

export default Counter;
```



### 카운터 Container Component 생성

**src/containers/CounterContainer.tsx**

```typescript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../modules';
import { increase, decrease, increaseBy } from '../modules/counter';
import Counter from '../components/Counter';

function CounterContainer () => {
  // 상태를 조회합니다. 상태를 조회 할 때에는 state 의 타입을 RootState 로 지정해야합니다.
  const count = useSelector((state: RootState) => state.counter.count);
  const dispatch = useDispatch(); // 디스패치 함수를 가져옵니다

  // 각 액션들을 디스패치하는 함수들을 만들어줍니다
  const onIncrease = () => {
    dispatch(increase());
  };

  const onDecrease = () => {
    dispatch(decrease());
  };

  const onIncreaseBy = (diff: number) => {
    dispatch(increaseBy(diff));
  };

  return (
    <Counter
      count={count}
      onIncrease={onIncrease}
      onDecrease={onDecrease}
      onIncreaseBy={onIncreaseBy}
    />
  );
};

export default CounterContainer;
```



**App.tsx**

```typescript
import React from 'react';
import CounterContainer from './containers/CounterContainer';

const App: React.FC = () => {
  return <CounterContainer />;
};

export default App;
```





---

## TodoList 리덕스 모듈 구현

할 일 목록을 구현해봅시다. 먼저 리덕스 모듈을 준비합니다. 

#### src/modules/todos.ts

```javascript
// 액션 타입 선언
const ADD_TODO = 'todos/ADD_TODO' as const;
const TOGGLE_TODO = 'todos/TOGGLE_TODO' as const;
const REMOVE_TODO = 'todos/REMOVE_TODO' as const;

let nextId = 1; // 새로운 항목을 추가 할 때 사용 할 고유 ID 값

// 액션 생성 함수
export const addTodo = (text: string) => ({
  type: ADD_TODO,
  payload: {
    id: nextId++,
    text
  }
});

export const toggleTodo = (id: number) => ({
  type: TOGGLE_TODO,
  payload: id
});

export const removeTodo = (id: number) => ({
  type: REMOVE_TODO,
  payload: id
});

// 모든 액션 객체들에 대한 타입 준비
type TodosAction =
  | ReturnType<typeof addTodo>
  | ReturnType<typeof toggleTodo>
  | ReturnType<typeof removeTodo>;

// 상태에서 사용 할 할 일 항목 데이터 타입 정의
export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

// 이 모듈에서 관리할 상태는 Todo 객체로 이루어진 배열
export type TodosState = Todo[];

// 초기 상태 선언
const initialState: TodosState = [];

// 리듀서 작성
function todos(
  state: TodosState = initialState,
  action: TodosAction
): TodosState {
  switch (action.type) {
    case ADD_TODO:
      return state.concat({
        // action.payload 객체 안의 값이 모두 유추됩니다.
        id: action.payload.id,
        text: action.payload.text,
        done: false
      });
    case TOGGLE_TODO:
      return state.map(todo =>
        // payload 가 number 인 것이 유추됩니다.
        todo.id === action.payload ? { ...todo, done: !todo.done } : todo
      );
    case REMOVE_TODO:
      // payload 가 number 인 것이 유추됩니다.
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

export default todos;
```



<br>

모듈을 다 만드셨으면 루트 리듀서에 todos 리듀서를 등록하세요.

#### modules/index.ts

```javascript
import { combineReducers } from 'redux';
import counter from './counter';
import todos from './todos';

const rootReducer = combineReducers({
  counter,
  todos
});

// 루트 리듀서를 내보내주세요.
export default rootReducer;

// 루트 리듀서의 반환값를 유추해줍니다
// 추후 이 타입을 컨테이너 컴포넌트에서 불러와서 사용해야 하므로 내보내줍니다.
export type RootState = ReturnType<typeof rootReducer>;
```



<br>

### 투두리스트를 위한 프리젠테이셔널 컴포넌트 준비하기

구현할 프리젠테이셔널 컴포넌트는 총 3개입니다.

- TodoInsert: 새 항목을 등록하는 용도
- TodoItem: 할 일 정보을 보여주는 용도
- TodoList: 여러개의 TodoItem 을 렌더링하는 용도



<br>

#### src/components/TodoInsert.tsx

새 항목을 등록 할 수 있는 TodoInsert 컴포넌트를 만들어봅시다. 이 컴포넌트에서는 `onInsert` 라는 props 를 받아와서 이 함수를 호출하여 새 항목을 추가하며, input 의 상태는 컴포넌트 내부에서 로컬 상태로 관리합니다.

```javascript
import React, { ChangeEvent, FormEvent, useState } from 'react';

type TodoInsertProps = {
  onInsert: (text: string) => void;
};

function TodoInsert({ onInsert }: TodoInsertProps) {
  const [value, setValue] = useState('');
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onInsert(value);
    setValue('');
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        placeholder="할 일을 입력하세요."
        value={value}
        onChange={onChange}
      />
      <button type="submit">등록</button>
    </form>
  );
}

export default TodoInsert;
```

<br>



#### src/components/TodoItem.tsx

TodoItem 컴포넌트는 각 할 일 항목에 대한 정보를 보여주는 컴포넌트이며, 텍스트 영역을 클릭하면 `done` 값이 바뀌고, 우측의 (X) 를 클릭하면 항목이 삭제됩니다. 이 컴포넌트에서는 할 일 정보를 지니고 있는 `todo`, 그리고 상태 토글 및 삭제를 해주는 함수 `onToggle` 과 `onRemove` 를 props 로 받아옵니다.

```javascript
import React, { CSSProperties } from 'react';
import { Todo } from '../modules/todos';

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  // CSSProperties 는 style 객체의 타입입니다.
  const textStyle: CSSProperties = {
    textDecoration: todo.done ? 'line-through' : 'none'
  };
  const removeStyle: CSSProperties = {
    marginLeft: 8,
    color: 'red'
  };

  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleRemove = () => {
    onRemove(todo.id);
  };

  return (
    <li>
      <span onClick={handleToggle} style={textStyle}>
        {todo.text}
      </span>
      <span onClick={handleRemove} style={removeStyle}>
        (X)
      </span>
    </li>
  );
}

export default TodoItem;
```

<br>



#### src/components/TodoList.tsx

이 컴포넌트는 여러개의 TodoItem 컴포넌트를 렌더링해줍니다. 할 일 정보들을 지니고 있는 배열인 `todos`와 각 TodoItem 컴포넌트들에게 전달해줘야 할 `onToggle` 과 `onRemove` 를 props 로 받아옵니다.

```javascript
import React from 'react';
import { Todo } from '../modules/todos';
import TodoItem from './TodoItem';

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

function TodoList({ todos, onToggle, onRemove }: TodoListProps) {
  if (todos.length === 0) return <p>등록된 항목이 없습니다.</p>;
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          todo={todo}
          onToggle={onToggle}
          onRemove={onRemove}
          key={todo.id}
        />
      ))}
    </ul>
  );
}

export default TodoList;
```



<br>

---

### 투두리스트를 위한 컨테이너 컴포넌트 만들기

<br>

#### src/containers/TodoApp.ts

```javascript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../modules';
import { toggleTodo, removeTodo, addTodo } from '../modules/todos';
import TodoInsert from '../components/TodoInsert';
import TodoList from '../components/TodoList';

function TodoApp() {
  const todos = useSelector((state: RootState) => state.todos);
  const dispatch = useDispatch();

  const onInsert = (text: string) => {
    dispatch(addTodo(text));
  };

  const onToggle = (id: number) => {
    dispatch(toggleTodo(id));
  };

  const onRemove = (id: number) => {
    dispatch(removeTodo(id));
  };

  return (
    <>
      <TodoInsert onInsert={onInsert} />
      <TodoList todos={todos} onToggle={onToggle} onRemove={onRemove} />
    </>
  );
}

export default TodoApp;
```



<br>

#### src/App.tsx

```javascript
import React from 'react';
import TodoApp from './containers/TodoApp';

const App: React.FC = () => {
  return <TodoApp />;
};

export default App;
```



---



## typesafe-actions 리팩토링

[typesafe-actions](https://www.npmjs.com/package/typesafe-actions) 는 리덕스를 사용하는 프로젝트에서 액션 생성 함수와 리듀서를 훨씬 쉽고 깔끔하게 작성 할 수 있게 해주는 라이브러리입니다.

```
$ yarn add typesafe-actions
```



### Counter 리덕스 모듈 리팩토링 1

#### src/modules/counter.ts

```javascript
import {
  createStandardAction,
  ActionType,
  createReducer
} from 'typesafe-actions';

// 액션 type 선언
const INCREASE = 'counter/INCREASE';
const DECREASE = 'counter/DECREASE';
const INCREASE_BY = 'counter/INCREASE_BY';

// 액션 생성함수를 선언합니다
export const increase = createStandardAction(INCREASE)();
export const decrease = createStandardAction(DECREASE)();
export const increaseBy = createStandardAction(INCREASE_BY)<number>(); // payload 타입을 Generics 로 설정해주세요.

// 액션 객체 타입 준비
const actions = { increase, decrease, increaseBy }; // 모든 액션 생성함수들을 actions 객체에 넣습니다
type CounterAction = ActionType<typeof actions>; // ActionType 를 사용하여 모든 액션 객체들의 타입을 준비해줄 수 있습니다

// 이 리덕스 모듈에서 관리 할 상태의 타입을 선언합니다
type CounterState = {
  count: number;
};

// 초기상태를 선언합니다.
const initialState: CounterState = {
  count: 0
};

// 리듀서를 만듭니다
// createReducer 는 리듀서를 쉽게 만들 수 있게 해주는 함수입니다.
// Generics로 리듀서에서 관리할 상태, 그리고 리듀서에서 처리 할 모든 액션 객체들의 타입을 넣어야합니다
const counter = createReducer<CounterState, CounterAction>(initialState, {
  [INCREASE]: state => ({ count: state.count + 1 }), // 액션을 참조 할 필요 없으면 파라미터로 state 만 받아와도 됩니다
  [DECREASE]: state => ({ count: state.count - 1 }),
  [INCREASE_BY]: (state, action) => ({ count: state.count + action.payload }) // 액션의 타입을 유추 할 수 있습니다.
});

export default counter;
```



액션 생성 함수를 매번 직접 만들 필요 없이 [`createStandardAction`](https://www.npmjs.com/package/typesafe-actions#createstandardaction) 을 사용해서 한 줄로 쉽게 작성 할 수 있게 되었습니다.

[`createReducer`](https://www.npmjs.com/package/typesafe-actions#createreducer) 는 리듀서를 `switch` 문이 아닌 객체 형태로 작성 할 수 있게 해줍니다. 취향에 따라 다르긴 하겠지만, 저는 이 방식이 `switch` 문을 사용하는 것 보다 코드가 훨씬 간결하다고 생각합니다.

#### src/App.tsx

```javascript
import React from 'react';
import CounterContainer from './containers/CounterContainer';

const App: React.FC = () => {
  return <CounterContainer />;
};

export default App;
```



---

### Counter 리덕스 모듈 리팩토링 2

`createReducer` 를 사용 할 때 우리는 객체 형태로 작성을 해주었습니다. 이 함수에서는 [메서드 체이닝 방식](https://www.npmjs.com/package/typesafe-actions#using-createreducer-api-with-type-free-syntax)을 통해서 구현하는 기능도 지원해줍니다.

#### src/modules/counter.ts

```javascript
import {
  createStandardAction,
  ActionType,
  createReducer
} from 'typesafe-actions';

// 액션 type 선언
const INCREASE = 'counter/INCREASE';
const DECREASE = 'counter/DECREASE';
const INCREASE_BY = 'counter/INCREASE_BY';

// 액션 생성함수를 선언합니다
export const increase = createStandardAction(INCREASE)();
export const decrease = createStandardAction(DECREASE)();
export const increaseBy = createStandardAction(INCREASE_BY)<number>(); // payload 타입을 Generics 로 설정해주세요.

// 액션 객체 타입 준비
const actions = { increase, decrease, increaseBy }; // 모든 액션 생성함수들을 actions 객체에 넣습니다
type CounterAction = ActionType<typeof actions>; // ActionType 를 사용하여 모든 액션 객체들의 타입을 준비해줄 수 있습니다

// 이 리덕스 모듈에서 관리 할 상태의 타입을 선언합니다
type CounterState = {
  count: number;
};

// 초기상태를 선언합니다.
const initialState: CounterState = {
  count: 0
};

// 리듀서를 만듭니다
// createReducer 는 리듀서를 쉽게 만들 수 있게 해주는 함수입니다.
// Generics로 리듀서에서 관리할 상태, 그리고 리듀서에서 처리 할 모든 액션 객체들의 타입을 넣어야합니다
const counter = createReducer<CounterState, CounterAction>(initialState)
  .handleAction(INCREASE, state => ({ count: state.count + 1 }))
  .handleAction(DECREASE, state => ({ count: state.count - 1 }))
  .handleAction(INCREASE_BY, (state, action) => ({
    count: state.count + action.payload
  }));

export default counter;
```



메서드 체이닝 형태로 구현하게 됐을 때 얻을 수 있는 정말 큰 장점이 있습니다. 바로 `handleAction` 의 첫번째 인자에 타입에 액션의 `type` 를 넣는것이 아니라 액션 생성함수 자체를 넣어도 작동한다는 것 입니다. 그렇게 하면, 액션의 `type` 을 굳이 선언 할 필요가 없어집니다.



```javascript
import { createStandardAction, createReducer } from 'typesafe-actions';

// 액션 생성함수를 선언합니다
export const increase = createStandardAction('counter/INCREASE')();
export const decrease = createStandardAction('counter/DECREASE')();
export const increaseBy = createStandardAction('counter/INCREASE_BY')<number>(); // payload 타입을 Generics 로 설정해주세요.

// 이 리덕스 모듈에서 관리 할 상태의 타입을 선언합니다
type CounterState = {
  count: number;
};

// 초기상태를 선언합니다.
const initialState: CounterState = {
  count: 0
};

// 리듀서를 만듭니다
// 상태의 타입은 initialState 를 참조하여 바로 유추 할 수 있고,
// 액션 객체의 타입은 액션 생성함수를 참조하여 유추 할 수 있기 때문에 Generics를 생략해도 무방합니다.
const counter = createReducer(initialState)
  .handleAction(increase, state => ({ count: state.count + 1 }))
  .handleAction(decrease, state => ({ count: state.count - 1 }))
  .handleAction(increaseBy, (state, action) => ({
    count: state.count + action.payload
  }));

export default counter;
```



이렇게 액션의 `type` 대신에 생성 함수를 참조하여 리듀서를 구현을 해주면 모든 액션 객체들의 타입인 `CounterAction` 을 준비하는것도 생략 할 수 있습니다. 그리고, `createReducer` 를 사용 할 때 해당 함수의 Generics 자체를 생략해도 상관 없게 됩니다.



---

### todos 리덕스 모듈 리팩토링하기

odos 리덕스 모듈도 방금 했던 것 처럼 `typesafe-actions` 를 사용하여 리팩토링해봅시다.

#### src/modules/todos.ts

```javascript
import {
  /* action, */
  createStandardAction,
  createAction,
  ActionType,
  createReducer
} from 'typesafe-actions';

// 액션 타입 선언
const ADD_TODO = 'todos/ADD_TODO';
const TOGGLE_TODO = 'todos/TOGGLE_TODO';
const REMOVE_TODO = 'todos/REMOVE_TODO';

let nextId = 1; // 새로운 항목을 추가 할 때 사용 할 고유 ID 값

// 액션 생성 함수

// 이 액션 생성 함수의 경우엔 파라미터를 기반하여 커스터마이징된 payload를 설정해주므로,
// createAction 이라는 함수를 사용합니다.
// 여기서 action은 액션 객체를 만드는 함수입니다
export const addTodo = createAction(ADD_TODO, action => (text: string) =>
  action({
    id: nextId++,
    text
  })
);
// 위 코드는 다음과 같은 형태로도 구현 할 수 있지만, createAction 말고 action 만 사용하면
// Action Helpers (https://www.npmjs.com/package/typesafe-actions#action-helpers-api) 지원이 안됩니다.
// export const addTodo = (text: string) => action(ADD_TODO, { id: nextId++, text })

// payload가 그대로 들어가는 액션생성함수는 정말 간단합니다.
export const toggleTodo = createStandardAction(TOGGLE_TODO)<number>();
export const removeTodo = createStandardAction(REMOVE_TODO)<number>();

// 모든 액션 객체들에 대한 타입 준비
const actions = {
  addTodo,
  toggleTodo,
  removeTodo
};
type TodosAction = ActionType<typeof actions>;

// 상태에서 사용 할 할 일 항목 데이터 타입 정의
export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

// 이 모듈에서 관리할 상태는 Todo 객체로 이루어진 배열
export type TodosState = Todo[];

// 초기 상태 선언
const initialState: TodosState = [];

// 리듀서 작성
const todos = createReducer<TodosState, TodosAction>(initialState, {
  [ADD_TODO]: (state, action) =>
    state.concat({
      ...action.payload, // id, text 를 이 안에 넣기
      done: false
    }),
  // 바구조화 할당을 활용하여 payload 값의 이름을 바꿀 수 있음
  [TOGGLE_TODO]: (state, { payload: id }) =>
    state.map(todo => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
  [REMOVE_TODO]: (state, { payload: id }) =>
    state.filter(todo => todo.id !== id)
});

export default todos;
```

#### src/App.tsx

```javascript
import React from 'react';
import TodoApp from './containers/TodoApp';

const App: React.FC = () => {
  return <TodoApp />;
};

export default App;
```



> 참고
>
> * typesafe-actions의 createStandardAction은 최신버전에서 deprecated로 분류되었습니다. (2020-01 기준)



---

**Reference**

https://react.vlpt.us/using-typescript/05-ts-redux.html