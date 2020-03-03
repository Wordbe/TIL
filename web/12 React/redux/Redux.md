# Redux 1 리덕스란, keyword

* 리액트 생태계에서 사용률이 가장 높은 라이브러리
* 컴포넌트들의 상태 관련 로직을 각각의 파일로 분리, 전역 상태 관리
* Context API 에서 useReducer Hook 을 사용하는 개발 흐름과 비슷 (reducer, action)



Redux는 Context API 가 지금 형태로 사용방식이 개선 되기도 전에 만들어진 라이브러리 입니다.

[npmtrends](https://www.npmtrends.com/react-vs-redux-vs-react-redux) 에 의하면 리액트를 사용하는 프로젝트 중 45%가 리덕스를 사용한다는 것을 알 수 있습니다. redux는 리액트를 위해 만들어진 라이브러리를 맞지만, 일반 JavaScript 환경(Angular 등)에서 사용 가능합니다.



### 리덕스와 Context API를 사용하는 것의 차이

### 1) 미들웨어

리덕스에는 미들웨어(Middleware) 개념이 존재합니다. 리덕스로 상태 관리를 할 때, `useReducer`를 사용해볼 때 접했던 reducer 함수를 사용합니다. 리덕스 미들웨어를 사용하면 액션 객체가 리듀서에서 처리되기 전 원하는 작업을 수행할 수 있습니다. 

* 조건에 따라 액션을 무시
* 액션을 콘솔에 출력, 서버에 로깅
* 액션이 디스패치되었을 때 이를 수정하여 리듀서에게 전달
* 액션 발생 시 다른 액션이 발생되도록 함
* 액션 발생 시 JavaScript 함수를 실행

미들웨어는 주로 비동기 작업을 할 때 많이 사용됩니다.



### 2) 유용한 함수와 Hooks

Context API에서 `useReducer`를 사용할 때 Context를 새로 생성하고, Context의 Provider를 설정하고, Context를 편하게 사용하기 위해 커스텀 Hook을 따로 만들어 사용했었습니다. 리덕스에 이와 비슷한 기능들이 존재합니다.

`connect`함수를 통해 리덕스의 상태 또는 액션 생성 함수를 컴포넌트의 props로 받아올 수 있습니다. 

`useSelector`, `useDispatch`, `useStore` 등의 Hooks를 사용하면 손쉽게 상태 조회나 액션을 디스패치 할 수 있습니다. 

`connect`함수와 `useSelector`함수는 내부적으로 최적화가 잘 되어 있습니다. 따라서 실제 상태가 바뀔때만 컴포넌트가 리렌더링 됩니다. 반면, Context API 에서는 Context가 지닌 상태가 바뀌면 해당 Context의 Provider 내부 컴포넌트들이 모두 리렌더링 됩니다.



### 3) 하나의 커다란 상태

Context API 로 글로벌 상태를 관리할 때는 기능별로 Context를 만들어 사용하는 것이 일반적입니다. 반면 **리덕스에서는 상태를 하나의 커다란 객체에 넣어서 사용하는 것이 필수입니다.** 따라서 매번 Context를 만드는 수고를 덜 수 있습니다.



### 리덕스 사용시 고려할 점

|                                  | redux | Context API |
| -------------------------------- | ----- | ----------- |
| 프로젝트 규모가 큰 가?           | O     |             |
| 비동기 작업을 자주 하는가?       | O     |             |
| 리덕스를 배워보니 사용이 편한가? | O     |             |

3번이 특히 중요합니다. 취향에 맞는 라이브러리를 활용하는 것이 필수입니다.



본격적으로 리덕스를 배워봅니다.



---

## 1 Redux Keyword



### 1) 액션 (Action)

상태에 변화가 필요할 때, 액션을 발생시킵니다. 하나의 객체로 표현되며 다음과 같은 형식으로 이루어집니다.

```javascript
{
  type: "ADD_TODO",
  data: {
    id: 0,
    text: "리덕스 배우기"
  }
}
```

`type` 필드는 필수이며, 그 외 값은 사용자가 정하면 됩니다.



### 2) 액션 생성함수 (Action Creator)

액션을 생성하는 함수입니다. 파라미터를 받아서 액션 객체 형태를 반환합니다.

```javascript
export function addTodo(data) {
  return {
    type: "ADD_TODO",
    data
  };
}

// 화살표 함수로도 만들 수 있습니다.
export const changeInput = text => ({ 
  type: "CHANGE_INPUT",
  text
});
```

액션 생성함수를 만들어 사용하는 이유는 나중에 컴포넌트에서 쉽게 액션을 발생시키기 위함입니다. 보통 함수 앞에 export 키워드를 붙여 다른 파일에서 불러와 사용합니다.

리덕스에서 액션 생성함수는 필수는 아니며, 액션을 발생시킬 때마다 직접 액션 객체를 생성할 수도 있습니다.



### 3) 리듀서(reducer)

변화를 일으키는 함수입니다.

```javascript
function counter(state, action) {
  switch (action.type) {
    case 'INCREASE':
      return state + 1;
    case 'DECREASE':
      return state - 1;
    default:
      return state;
  }
}
```

현재 상태(state)와 전달 받은 액션(action)으로 새로운 상태를 만들어 반환합니다. `useReducer`에서 사용하는 리듀서와 같은 형태입니다.

`useReducer`에서는 일반적으로 default 부분에 

```javascript
default: throw new Error('Unhandled Action')
```

와 같이 에러발생 처리를 하는 반면,

리덕스 리듀서에서는 기존 `state`를 그대로 반환하도록 작성해야합니다.

리덕스에서는 여러 개의 서브 리듀서(Subreducer)를 만들고, 이를 합쳐서 루트 리듀서(Root reducer)를 만들 수 있습니다.



### 4) 스토어 (Store)

한 애플리케이션 당 하나의 스토어를 만듭니다. 스토어 안에는 현재 앱 상태와 리듀서가 들어가있고, 몇몇개의 내장 함수들이 있습니다.



### 5) 디스패치 (dispatch)

스토어 내장함수 중 하나입니다. 디스패치는 액션을 파라미터로 전달받아 액션을 발생시키는 함수입니다. 

```javascript
dispatch(action);
```

함수를 호출하면 스토어는 리듀서 함수를 실행시켜서 해당 액션을 처리하는 로직이 있을 시에 액션을 참고하여 새로운 상태를 반환합니다.



### 6) 구독 (subscribe)

스토어의 내장함수 중 하나입니다. subscribe 함수는 함수를 파라미터로 받아서, 액션이 디스패치 되었을 때마다 전달해준 함수가 호출됩니다.

보통 리덕스에서는 이 함수를 직접 사용하진 않으며, 대신 react-redux 라이브러리에서 제공하는 `connect`함수 또는 `useSelector` Hook을 사용하여 리덕스 상태에 구독합니다.











---

**Reference**

https://react.vlpt.us/redux/

https://react.vlpt.us/redux/01-keywords.html