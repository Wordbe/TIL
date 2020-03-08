# Redux Middleware 2 - redux-logger, redux-thunk

배울 것

* redux-logger 설치
* Redux DevTools 와 리더스 미들웨어 함께 사용하는 방법



### redux-logger 사용

 [redux-logger](https://github.com/LogRocket/redux-logger) 설치

```
$ yarn add redux-logger
```



리덕스 미들웨어를 적용할 때는 여러개의 미들웨어를 등록할 수 있습니다.

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
import logger from 'redux-logger';

const store = createStore(rootReducer, applyMiddleware(myLogger, logger)); // 여러개의 미들웨어를 적용 할 수 있습니다.

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
```

리덕스 관련 정보가 예쁘게 콘솔에 출력되었습니다.

myLogger는 삭제합시다.



### Redux DevTools 사용

**devtools 설치**

```
$ yarn add redux-devtools-extension
```





[매뉴얼 상의 사용법](https://www.npmjs.com/package/redux-devtools-extension#usage)은 아래와 같습니다.

```javascript
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(reducer, composeWithDevTools(
  applyMiddleware(...middleware),
  // other store enhancers if any
));
```



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
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(logger))
); // 여러개의 미들웨어를 적용 할 수 있습니다.

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);


serviceWorker.unregister();
```

크롬 개발자 도구에서 redux Devtools 화면이 보일 것입니다.



---

## 4 redux-thunk

redux-thunk는 리덕스에서 비동기 작업을 처리할 때 가장 많이 사용하는 미들웨어입니다. redux-thunk 미들웨어를 사용하면 **액션 객체가 아닌 함수를 디스패치** 할 수 있습니다. 리덕스 창시자인 Dan Abramov가 만들었습니다.

```javascript
const thunk = store => next => action =>
  typeof action === 'function'
    ? action(store.dispatch, store.getState)
    : next(action)
```

실제 리덕스 [코드](https://github.com/reduxjs/redux-thunk/blob/master/src/index.js)는 위와 유사합니다.

코드는 겨우 14줄이지만, 라이브러리 Weekly 다운로드 수가 140만대입니다.



함수를 디스패치할 때에는 함수에서 dispatch와 getState 를 파라미터로 받아옵니다. 이 함수를 만들어주는 함수를 thunk라고 부릅니다.



```javascript
const getComments = () => (dispatch, getState) => {
  // 이 안에서는 액션을 dispatch 할 수도 있고
  // getState를 사용하여 현재 상태도 조회 할 수 있습니다.
  const id = getState().post.activeId;

  // 요청이 시작했음을 알리는 액션
  dispatch({ type: 'GET_COMMENTS' });

  // 댓글을 조회하는 프로미스를 반환하는 getComments 가 있다고 가정해봅시다.
  api
    .getComments(id) // 요청을 하고
    .then(comments => dispatch({ type: 'GET_COMMENTS_SUCCESS', id, comments })) // 성공시
    .catch(e => dispatch({ type: 'GET_COMMENTS_ERROR', error: e })); // 실패시
};
```



async/await를 사용해도 됩니다.

```javascript
const getComments = () => async (dispatch, getState) => {
  const id = getState().post.activeId;
  dispatch({ type: 'GET_COMMENTS' });
  try {
    const comments = await api.getComments(id);
    dispatch({ type:  'GET_COMMENTS_SUCCESS', id, comments });
  } catch (e) {
    dispatch({ type:  'GET_COMMENTS_ERROR', error: e });
  }
}
```



### redux-thunk 설치

```
$ yarn add redux-thunk
```



redux-thunk는 applyMiddlewares 를 통해 적용합니다.

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
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';

const store = createStore(
  rootReducer,
  // logger 를 사용하는 경우, logger가 가장 마지막에 와야합니다.
  composeWithDevTools(applyMiddleware(ReduxThunk, logger))
); // 여러개의 미들웨어를 적용 할 수 있습니다.

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
```



### 카운터 딜레이하기

thunk 함수를 만들고. `setTimeout` 을 사용하여 액션이 디스패치되는 것을 1초씩 딜레이시켜봅니다.

**modules/counter.js**

```javascript
// 액션 타입
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';

// 액션 생성 함수
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

// getState를 쓰지 않는다면 굳이 파라미터로 받아올 필요 없습니다.
export const increaseAsync = () => dispatch => {
  setTimeout(() => dispatch(increase()), 1000);
};
export const decreaseAsync = () => dispatch => {
  setTimeout(() => dispatch(decrease()), 1000);
};

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

`increaseAsync`와 `decreaseAsync`라는 thunk 함수를 만들었습니다.



**containers/CounterContainer.js**

```javascript
import React from 'react';
import Counter from '../components/Counter';
import { useSelector, useDispatch } from 'react-redux';
import { increaseAsync, decreaseAsync } from '../modules/counter';

function CounterContainer() {
  const number = useSelector(state => state.counter);
  const dispatch = useDispatch();

  const onIncrease = () => {
    dispatch(increaseAsync());
  };
  const onDecrease = () => {
    dispatch(decreaseAsync());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
```

카운트 버튼을 누르면 액션 디스패치가 딜레이 되는 것을 알 수 있습니다.



---

**Reference**

https://react.vlpt.us/redux-middleware/03-logger-and-devtools.html

https://react.vlpt.us/redux-middleware/04-redux-thunk.html