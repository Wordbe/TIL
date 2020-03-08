# Redux Middleware

리덕스 미들웨어는 리덕스의 핵심 기능입니다. Context API 또는 MobX를 사용하는 것과 차별화가 되어 있는 부분입니다.

리덕스 미들웨어를 통해 액션을 디스패치한 후, 리듀서에서 그 액션을 받아와 업데이트 하기 전에 추가 작업을 할 수 있습니다.

액션 → 미들웨어 → 리듀서 → 스토어



**추가할 수 있는 작업**

* 조건에 따라 액션을 무시
* 액션을 콘솔에 출력하거나 서버쪽에 로깅
* 액션 디스패치 후 이를 수정하여 리듀서에게 전달
* 액션 발생 시 이에 기반하여 다른 액션 발생시킴
* 액션 발생 시 특정 JavaScript 함수 실행



리덕스에서 미들웨어를 사용하는 주된 용도는 **비동기 작업 처리** 입니다. 예를 들어 리액트 앱에서 백엔드 API 를 연동해야 한다면 리덕스 미들웨어를 사용하여 처리합니다.

일반적으로 리덕스 미들웨어 라이브러리를 설치합니다. 비동기 작업과 관련된 미들웨어 라이브러리는 [redux-thunk](https://github.com/reduxjs/redux-thunk), [redux-saga](https://github.com/redux-saga/redux-saga), [redux-observable](https://redux-observable.js.org/), [redux-promise-middleware](https://www.npmjs.com/package/redux-promise-middleware) 등이 있습니다.

redux-saga, redux-observable 경우 액션을 모니터링 할 수 있어서, 액션 디스패치 후 원하는 함수를 호출하거나 라우터를 통해 다른 주소로 이동하는 것이 가능합니다.

redux-thunk, redux-saga 이 두 라이브러리가 가장 많이 사용됩니다. 이 두가지로 비동기 작업을 효율적으로 처리하는 방법을 배워봅니다. [redux-logger](https://www.npmjs.com/package/redux-logger) 라이브러리를 사용하여 미들웨어를 적용하는 법도 알아봅니다.



## 1 리덕스 프로젝트



```
$ npx create-react-app learn-redux-middleware
$ cd learn-redux-middleware
$ yarn add redux react-redux
```



카운터 예제를 생성합니다.



### 리덕스 모듈 준비

액션 타입, 액션 생성함수, 리듀서를 한 파일에 작성하는 Ducks 패턴을 사용하도록 합니다.

원래 Ducks 패턴을 따르는 리덕스 모듈에서는 액션 이름에 `couter/INCREASE` 접두어를 두지만, 지금은 액션이름이 중복되는 일이 없으니 편의상 생략하도록 합니다.



**modules/counter.js**

```javascript
// 액션 타입
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';

// 액션 생성 함수
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

// 초깃값 (상태가 객체가 아니라 그냥 숫자여도 상관 없습니다.)
const initialState = 0;

export default function counter(state = initialState, action) {
  switch (action.type) {
    case INCREASE:
      return state + 1;
    case DECREASE:
      return state - 1;
    default:
      return state;
  }
}
```



루트 리듀서를 생성합니다.

**modules/index.js**

```javascript
import { combineReducers } from 'redux';
import counter from './counter';

const rootReducer = combineReducers({ counter });

export default rootReducer;
```



### 프로젝트에 리덕스 적용

루트 리듀서를 불러온 후 새로운 스토어를 만들고 Provider로 프로젝트에 적용합니다.



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



### Presentational Component 준비

**components/Counter.js**

```javascript
import React from 'react';

function Counter({ number, onIncrease, onDecrease }) {
  return (
    <div>
      <h1>{number}</h1>
      <button onClick={onIncrease}>+1</button>
      <button onClick={onDecrease}>-1</button>
    </div>
  );
}

export default Counter;
```



### Container 만들기

**containers/CouterContainer.js**

```javascript
import React from 'react';
import Counter from '../components/Counter';
import { useSelector, useDispatch } from 'react-redux';
import { increase, decrease } from '../modules/counter';

function CounterContainer() {
  const number = useSelector(state => state.counter);
  const dispatch = useDispatch();

  const onIncrease = () => {
    dispatch(increase());
  };
  const onDecrease = () => {
    dispatch(decrease());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
```



이제 App에서 CounterContainer를 렌더링 하고, 개발 서버를 구동합니다.

```
$ yarn start
```





**App.js**

```javascript
import React from 'react';
import CounterContainer from './containers/CounterContainer';

function App() {
  return <CounterContainer />;
}

export default App;
```







---

## 2 미들웨어 생성, 이해

리덕스 미들웨어를 만들 때 [템플릿](https://redux.js.org/advanced/middleware#the-final-approach) 을 참조합니다.

미들웨어는 결국 하나의 함수입니다. 함수를 연달아서 두번 리턴합니다. 



```javascript
const middleware = store => next => action => {
  // 하고 싶은 작업...
}
```



다음과 의미가 같습니다.

```javascript
function middleware(store) {
  return function (next) {
    return function (action) {
      // 하고 싶은 작업...
    };
  };
};
```



* _store_는 리덕스 스토어 인스턴스입니다. dispatch, getState, subscribe 내장함수가 들어있습니다.

* _next_는 액션을 다음 미들웨어에게 전달하는 함수입니다. next(action) 형태로 사용합니다. 다음 미들웨어가 없다면 리듀서에게 액션을 전달해줍니다. next를 호출하지 않으면 액션이 무시처리되어 리듀서에게 전달되지 않습니다.

* _action_은 현재 처리하고 있는 액션 겍체입니다.



![](https://i.imgur.com/fZs5yvY.png)

그림 출처: https://i.imgur.com/fZs5yvY.png (미들웨어의 구조)



리덕스 스토어에는 여러 미들웨어를 등록할 수 있습니다. 새로운 액션이 dispatch 되면 첫번째로 등록한 미들웨어가 호출됩니다. 그 미들웨어에서 next(action)을 호출하면 다음 미들웨어로 액션이 넘어가고, store.dispatch 를 사용하면 다른 액션을 추가로 발생시킬 수 있습니다.



---

### 미들웨어 작성

**middlewares/myLogger.js**

```javascript
const myLogger = store => next => action => {
  console.log(action); // 먼저 액션을 출력합니다.
  const result = next(action); // 다음 미들웨어 (또는 리듀서) 에게 액션을 전달합니다.
  return result; // 여기서 반환하는 값은 dispatch(action)의 결과물이 됩니다. 기본: undefined
};

export default myLogger;
```



### 미들웨어 적용

applyMiddleware 를 사용해서 스토어에 미들웨어를 적용합니다.

**index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import myLogger from './middlewares/myLogger';

const store = createStore(rootReducer, applyMiddleware(myLogger));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
```



### 미들웨어 수정

액션이 리듀서까지 전달되고 난 후의 새로운 상태를 확인하고 싶으면 다음과 같이 수정합니다.

```javascript
const myLogger = store => next => action => {
  console.log(action); // 먼저 액션을 출력합니다.
  const result = next(action); // 다음 미들웨어 (또는 리듀서) 에게 액션을 전달합니다.

  // 업데이트 이후의 상태를 조회합니다.
  console.log('\t', store.getState()); // '\t' 는 탭 문자 입니다.

  return result; // 여기서 반환하는 값은 dispatch(action)의 결과물이 됩니다. 기본: undefined
};

export default myLogger;
```



미들웨어 안에서 다양한 것을 할 수 있습니다. 예를 들어 액션 값을 객체가 아닌 함수를 받아오게 만들어서 액션이 함수타입이면 실행하도록 할 수도 있습니다. (redux-thunk 기능)



```javascript
const thunk = store => next => action =>
  typeof action === 'function'
    ? action(store.dispatch, store.getState)
    : next(action)
```



리덕스 관련 값들은 콘솔에 로깅하는 것 보다는 [redux-logger](https://github.com/LogRocket/redux-logger) 미들웨어를 사용하는 것이 좋습니다.





---

**Reference**

https://react.vlpt.us/redux-middleware/

https://react.vlpt.us/redux-middleware/01-prepare.html

https://react.vlpt.us/redux-middleware/02-make-middleware.html