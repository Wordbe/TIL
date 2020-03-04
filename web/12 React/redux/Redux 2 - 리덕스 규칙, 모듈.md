# 2 리덕스 3가지 규칙



**1) 하나의 애플리케이션 안에는 하나의 스토어가 존재**

한 애플리케이션에서 여러 스토어 사용은 가능하긴 하나, 권장하지 않습니다. 업데이트가 빈번하게 일어나거나, 애플리케이션 특정 부분을 완전히 분리시키게 될 때 여러 개의 스토어를 만들 수 있습니다. 하지만 이 경우 개발 도구를 활용하지 못합니다.



**2) 상태는 읽기전용**

리액트에서 state 업데이트 시, setState를 사용하고, 배열 업데이트 시 push 대신 concat 함수를 사용하여 기존 배열은 수정하지 않고 새로운 배열을 만들어 교체하는 방식을 사용합니다. 엄청 깊은 구조로 되어 있는 객체를 업데이트 할 때도 이와 같은 방식으로 기존의 객체는 건드리지 않고 Object.assign 을 사용하거나 spread 연산자(...)를 사용하여 업데이트합니다.

리덕스도 마찬가지 입니다. 새로운 상태를 생성하여 업데이트 하는 방식은 나중에 개발자 도구를 통해서 뒤로 돌릴 수도 있고 다시 앞으로 돌릴 수도 있습니다.

리덕스에서 불변성을 유지하는 이유는 데이터가 변경 되는 것을 감지하기 위해 [shallow equality](https://redux.js.org/docs/faq/ImmutableData.html#how-redux-uses-shallow-checking) 검사를 하기 때문입니다. 이를 통해 객체 변화를 감지할 때 객체의 깊숙한 안쪽까지 비교하는 것이 아니라 겉핥기 식 비교를 통해 좋은 성능을 유지합니다.

Immutable.js, Immer.js를 사용하여 불변성을 유지하며 상태를 관리하는 방법을 알아봅니다.



**3) 변화를 일으키는 함수, 리듀서는 순수한 함수**

주의사항 :

* 리듀서 함수는 이전 상태와 액션 객체를 파라미터로 받습니다.

* 이전 상태는 절대 건드리지 않고, 변화를 일으킨 새로운 상태 객체를 만들어 반환합니다.

* 같은 파라미터로 호출된 리듀서는 언제나 같은 결과값을 반환합니다.

  new Date(), 랜덤 숫자 생성, 네트워크 요청 등의 작업은, 실행할 때마다 다른 결과값이 나타날 수 있는 순수하지 않은 작업이므로, 리듀서 함수 바깥에서 처리해주어야 합니다. 이를 위해 [리덕스 미들웨어](https://velopert.com/3401) 를 사용합니다.





---

## 3 리덕스 사용 준비

리액트 컴포넌트 없이 리덕스에서 제공되는 기능을 연습합니다.



새로운 프로젝트 생성

```
$ npx create-react-app learn-redux
$ cd learn-redux
$ yarn add redux
```



redux를 불러와서 redux에 내장된 API를 사용해 보겠습니다.



**exercise.js**

```javascript
console.log('Hello!');
```



**index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './exercise'

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```



서버 실행

```
$ yarn start
```

콘솔창에 Hello가 나옵니다.



**exercise.js**

```javascript
import { createStore } from 'redux';

// createStore는 스토어를 만들어주는 함수입니다.
// 리액트 프로젝트에서는 단 하나의 스토어를 만듭니다.

/* 리덕스에서 관리 할 상태 정의 */
const initialState = {
  counter: 0,
  text: '',
  list: []
};

/* 액션 타입 정의 */
// 액션 타입은 주로 대문자로 작성합니다.
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';
const CHANGE_TEXT = 'CHANGE_TEXT';
const ADD_TO_LIST = 'ADD_TO_LIST';

/* 액션 생성함수 정의 */
// 액션 생성함수는 주로 camelCase 로 작성합니다.
function increase() {
  return {
    type: INCREASE // 액션 객체에는 type 값이 필수입니다.
  };
}

// 화살표 함수로 작성하는 것이 더욱 코드가 간단하기에,
// 이렇게 쓰는 것을 추천합니다.
const decrease = () => ({
  type: DECREASE
});

const changeText = text => ({
  type: CHANGE_TEXT,
  text // 액션안에는 type 외에 추가적인 필드를 마음대로 넣을 수 있습니다.
});

const addToList = item => ({
  type: ADD_TO_LIST,
  item
});

/* 리듀서 만들기 */
// 위 액션 생성함수들을 통해 만들어진 객체들을 참조하여
// 새로운 상태를 만드는 함수를 만들어봅시다.
// 주의: 리듀서에서는 불변성을 꼭 지켜줘야 합니다!

function reducer(state = initialState, action) {
  // state 의 초깃값을 initialState 로 지정했습니다.
  switch (action.type) {
    case INCREASE:
      return {
        ...state,
        counter: state.counter + 1
      };
    case DECREASE:
      return {
        ...state,
        counter: state.counter - 1
      };
    case CHANGE_TEXT:
      return {
        ...state,
        text: action.text
      };
    case ADD_TO_LIST:
      return {
        ...state,
        list: state.list.concat(action.item)
      };
    default:
      return state;
  }
}

/* 스토어 만들기 */
const store = createStore(reducer);

console.log(store.getState()); // 현재 store 안에 들어있는 상태를 조회합니다.

// 스토어안에 들어있는 상태가 바뀔 때 마다 호출되는 listener 함수
const listener = () => {
  const state = store.getState();
  console.log(state);
};

const unsubscribe = store.subscribe(listener);
// 구독을 해제하고 싶을 때는 unsubscribe() 를 호출하면 됩니다.

// 액션들을 디스패치 해봅시다.
store.dispatch(increase());
store.dispatch(decrease());
store.dispatch(changeText('안녕하세요'));
store.dispatch(addToList({ id: 1, text: '와우' }));
```

리덕스 스토어 안의 상태는 액션이 디스패치됨에 따라 업데이트됩니다. 위 코드에서 `listener`함수를 만들어서 리덕스 상태에 변화가 생겼을 때 마다 콘솔에 상태를 출력하도록 처리하였습니다.

코드 최하단에는 여러 액션들을 디스패치 했습니다. 액션이 디스패치 될 때마다 상태가 바뀌고, `linstener`함수가 호출됩니다. 브라우저를 열어 개발자 도구에서 확인이 가능합니다.



**index.js**에서 exercise.js를 불러오는 코드를 지워줍니다.

리덕스를 본격적으로 프로젝트에 적용해봅니다.



---

## 4 리덕스 모듈 생성

리덕스 모듈은 

* 액션 타입
* 액션 생성함수
* 리듀서

가 모두 들어있는 JavaScript 파일을 의미합니다.



리덕스 Github 레포에 등록되어있는 [예제 프로젝트](https://github.com/reduxjs/redux/tree/master/examples/todos/src)에는 코드가 분리되어 있습니다.

* action
  + index.js
* reducers
  * todos.js
  * visibilityFilter.js
  * index.js

액션과 리듀서가 서로 다른 파일에 정의되어 있습니다. 하지만 코드들이 꼭 분리되어야 할 필요는 없고 같이 있으면 편한 경우가 많습니다. 그래서 리듀서와 액션 코드를 하나의 파일 안에서 작성하려고 합니다. 이를 [Ducks 패턴](https://github.com/erikras/ducks-modular-redux)이라고 부릅니다. 



### couter 모듈 만들기

**modules/counter.js**

```javascript
/* 액션 타입 만들기 */
// Ducks 패턴을 따를땐 액션의 이름에 접두사를 넣어주세요.
// 이렇게 하면 다른 모듈과 액션 이름이 중복되는 것을 방지 할 수 있습니다.
const SET_DIFF = 'counter/SET_DIFF';
const INCREASE = 'counter/INCREASE';
const DECREASE = 'counter/DECREASE';

/* 액션 생성함수 만들기 */
// 액션 생성함수를 만들고 export 키워드를 사용해서 내보내주세요.
export const setDiff = diff => ({ type: SET_DIFF, diff });
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

/* 초기 상태 선언 */
const initialState = {
  number: 0,
  diff: 1
};

/* 리듀서 선언 */
// 리듀서는 export default 로 내보내주세요.
export default function counter(state = initialState, action) {
  switch (action.type) {
    case SET_DIFF:
      return {
        ...state,
        diff: action.diff
      };
    case INCREASE:
      return {
        ...state,
        number: state.number + state.diff
      };
    case DECREASE:
      return {
        ...state,
        number: state.number - state.diff
      };
    default:
      return state;
  }
}
```



### todos 모듈 만들기

**modules/todos.js**

```javascript
/* 액션 타입 선언 */
const ADD_TODO = 'todos/ADD_TODO';
const TOGGLE_TODO = 'todos/TOGGLE_TODO';

/* 액션 생성함수 선언 */
let nextId = 1; // todo 데이터에서 사용 할 고유 id
export const addTodo = text => ({
  type: ADD_TODO,
  todo: {
    id: nextId++, // 새 항목을 추가하고 nextId 값에 1을 더해줍니다.
    text
  }
});
export const toggleTodo = id => ({
  type: TOGGLE_TODO,
  id
});

/* 초기 상태 선언 */
// 리듀서의 초기 상태는 꼭 객체타입일 필요 없습니다.
// 배열이여도 되고, 원시 타입 (숫자, 문자열, 불리언 이여도 상관 없습니다.
const initialState = [
  /* 우리는 다음과 같이 구성된 객체를 이 배열 안에 넣을 것입니다.
  {
    id: 1,
    text: '예시',
    done: false
  } 
  */
];

export default function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat(action.todo);
    case TOGGLE_TODO:
      return state.map(
        todo =>
          todo.id === action.id // id 가 일치하면
            ? { ...todo, done: !todo.done } // done 값을 반전시키고
            : todo // 아니라면 그대로 둠
      );
    default:
      return state;
  }
}
```



### Root Reducer 생성

현재 두 가지 리덕스 모듈을 만들었습니다. 그래서 리듀서도 2개입니다. 한 프로젝트에 여러 개의 리듀서가 있는 경우, 하나의 리듀서로 합쳐서 사용하고 합쳐진 리듀서를 루트 리듀서(Root Reducer)라고 합니다.

리듀서를 합칠 때에는 리덕스에 내장되어있는 `combineReducers` 함수를 사용합니다.



**modules/index.js**

```javascript
import { combineReducers } from 'redux';
import counter from './counter';
import todos from './todos';

const rootReducer = combineReducers({
  counter,
  todos
});

export default rootReducer;
```

리듀서가 합쳐졌습니다. 루트 리듀서를 만들었다면 이제 스토어를 만들어봅니다.



**src/index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'redux';
import rootReducer from './modules';

const store = createStore(rootReducer); // 스토어를 만듭니다.
console.log(store.getState()); // 스토어의 상태를 확인해봅시다.

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
```

스토어를 만들고 스토어의 상태를 출력해보았습니다. 브라우저에서 이를 확인합니다.

counter, todos 서브 리듀서의 상태가 합쳐졌습니다.



### 리액트 프로젝트에 리덕스 적용하기

리액트 프로젝트에 리덕스를 적용할 때는 react-redux 라이브러리를 사용해야 합니다.

```
$ yarn add react-redux
```



**src/index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';

const store = createStore(rootReducer); // 스토어를 만듭니다.

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
```

Provider로 store를 넣어서 App을 감싸면, 렌더링되는 모든 컴포넌트는 리덕스 스토어에 접근할 수 있습니다.





---

**Reference**

https://react.vlpt.us/redux/02-rules.html

https://react.vlpt.us/redux/03-prepare.html

https://react.vlpt.us/redux/04-make-modules.html