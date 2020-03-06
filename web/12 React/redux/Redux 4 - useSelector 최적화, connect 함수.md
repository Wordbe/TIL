# Redux 4 - useSelector 최적화, connect 함수



## 8 useSelector 최적화



리액트 컴포넌트에서 리덕스 상태를 조회해서 사용할 때 최적화를 위해 고려할 사항을 알아봅니다.

Presentational Component를 `React.memo`를 사용하여 리렌더링을 최적화 해주었습니다. Container Component 에서는 어떤 것을 검토하는지 알아봅니다.

리액트 개발자 도구의 톱니바퀴를 눌러 Highlight Updates를 체크합니다.



카운터의 +, -를 누르면 하단의 할 일 목록이 리렌더링 되진 않지만, 할 일 목록의 항목을 토글 할 때는 카운터가 리렌더링되는 것을 확인 할 수 있습니다.

기본적으로 `useSelector`를 사용해서 리덕스 스토어의 상태를 조회할 때 상태가 바뀌지 않았으면 리렌더링 하지 않습니다.



**TodosContatiner.js**

```javascript
const todos = useSelector(state => state.todos);
```

TodosContatiner의 경우 카운터 값이 바뀔 때 `todos` 값엔 변화가 없으니까, 리렌더링 되지 않습니다.



**CounterContatiner.js**

```javascript
const { number, diff } = useSelector(state => ({
  number: state.counter.number,
  diff: state.counter.diff
}));
```

반면, CounterContatiner에서는 `useSelector` Hook 을 통해 매번 렌더링 될 때마다 새로운 객체 `{number, diff}`를 만드는 것이기 때문에 상태가 바뀌었는지 확인할 수 없어서 낭비 렌더링이 이루어지고 있는 것입니다.



이를 최적화 하기 위해 2가지 방법을 알아봅니다.



1) `useSelector`를 여러 번 사용합니다.

```javascript
const number = useSelector(state => state.counter.number);
const diff = useSelector(state => state.counter.diff);
```

위와 같이 하면 해당 값들이 하나라도 바뀌면 컴포넌트가 리렌더링됩니다.



2) react-redux의 `shallowEqual`함수를 `useSelector` 두 번째 인자(`equalityFn`)로 전달해주는 것입니다.

```javascript
import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

function CounterContainer() {
  // useSelector는 리덕스 스토어의 상태를 조회하는 Hook입니다.
  // state의 값은 store.getState() 함수를 호출했을 때 나타나는 결과물과 동일합니다.
  const { number, diff } = useSelector(
    state => ({
      number: state.counter.number,
      diff: state.counter.diff
    }),
    shallowEqual
  );

  (...)
```

`equalityFn`은 이전 값과 다음 값을 비교하여 true가 나오면 리렌더링을 하지 않고, false가 나오면 리렌더링을 합니다. react-redux의 내장 함수로서, 객체 안의 가장 겉에 있는 값을 모두 비교해줍니다.

```javascript
equalityFn?: (left: any, right: any) => boolean
```



겉에 있는 값이란

```javascript
const object = {
  a: {
    x: 3,
    y: 2,
    z: 1
  },
  b: 1,
  c: [{ id: 1 }]
}
```

위에서 object.a, object.b, object.c 를 말합니다. `shallowEqual`은 object.a.x 또는 object.c[0] 값은 비교하지 않습니다.



위 둘중 한 방식을 최적화를 하면, 컨테이너 컴포넌트가 필요한 상황에서만 리렌더링이 될 것입니다.



---

## 9 connect 함수

connect 함수는 컨테이너 컴포넌트를 만드는 또 다른 방법으로, 사실 앞으로 사용할 일이 많이 없습니다. `useSelcector`, `useDispatch`가 매우 편하기 때문입니다.

리액트 컴포넌트를 만들 때는 함수형 컴포넌트로 만드는 것이 권장되고, 꼭 필요할 때만 클래스형 컴포넌트를 작성합니다. 클래스형 컴포넌트의 경우 Hooks를 사용하지 못하기 때문에 connect 함수를 사용하게 됩니다.

2019년 이전 작성된 리덕스와 연동된 컴포넌트들은 connect 함수로 작성되었을 것입니다. 리액트 프로젝트를 유지, 보수하게 될 일이 있다면 connect 함수를 종종 접할 수 있습니다.



### HOC란?

Higher-Order Component를 의미하며, 리액트 컴포넌트를 개발하는 하나의 패턴으로써, 컴포넌트의 로직을 재활용 할 때 유용한 패턴입니다. connect는  [HOC](https://velopert.com/3537)입니다.

HOC의 용도는 _컴포넌트를 특정 함수로 감싸서 특정 값 또는 함수를 props로 받아와서 사용할 수 있게 해주는 패턴_ 입니다.

예를 들어, 특정 함수 또는 값을 props로 받아와서 사용하고 싶은 경우 이러한 패턴을 사용합니다. 리액트에 Hook이 도입되기 전에는 HOC 패턴이 자주 사용되었지만, 지금은 만들 이유가 없어졌습니다. 대부분의 경우 Hook으로 대체할 수 있고 커스텀 Hook을 만드는 것이 쉽기 때문입니다.

HOC을 직접 구현하는 일은 거의 없기 때문에 HOC 작성법을 배우거나 이해하기 위해 시간을 쏟을 필요는 없습니다. HOC 컬렉션 라이브러리인 [recompose](https://github.com/acdlite/recompose) 를 참고하면 됩니다.



```javascript
const enhance = withState('counter', 'setCounter', 0)
const Counter = enhance(({ counter, setCounter }) =>
  <div>
    Count: {counter}
    <button onClick={() => setCounter(n => n + 1)}>Increment</button>
    <button onClick={() => setCounter(n => n - 1)}>Decrement</button>
  </div>
)
```

위 HOC은 마치 `useState` 와 비슷합니다. 

`withState` 함수를 사용해서 enhance 컴포넌트에 props로 특정 값과 함수를 넣어주는 함수를 만들었습니다. 그리고 컴포넌트를 만들 때 enhance로 감싸주는, 원하는 값과 함수를 props를 통해 사용합니다.



### connect 사용

connect 함수는 리덕스 스토어 안에 있는 상태를 props로 넣을 수도 있고, 액션을 디스패치하는 함수를 props로 넣을 수도 있습니다.



**containers/CounterContainer.js**

```javascript
import React from 'react';
import { connect } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

function CounterContainer({ number, diff, onIncrease, onDecrease, onSetDiff }) {
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

// mapStateToProps 는 리덕스 스토어의 상태를 조회해서 어떤 것들을 props 로 넣어줄지 정의합니다.
// 현재 리덕스 상태를 파라미터로 받아옵니다.
const mapStateToProps = state => ({
  number: state.counter.number,
  diff: state.counter.diff
});

// mapDispatchToProps 는 액션을 디스패치하는 함수를 만들어서 props로 넣어줍니다.
// dispatch 를 파라미터로 받아옵니다.
const mapDispatchToProps = dispatch => ({
  onIncrease: () => dispatch(increase()),
  onDecrease: () => dispatch(decrease()),
  onSetDiff: diff => dispatch(setDiff(diff))
});

// connect 함수에는 mapStateToProps, mapDispatchToProps 를 인자로 넣어주세요.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CounterContainer);

/* 위 코드는 다음과 동일합니다.
  const enhance = connect(mapStateToProps, mapDispatchToProps);
  export defualt enhance(CounterContainer);
*/
```



mapStateToProps 는 컴포넌트에 props로 넣어줄 리덕스 스토어 상태에 관련된 함수이고, mapDispatchToProps는 컴포넌트 proops로 넣어줄 액션을 디스패치하는 함수들에 관련된 함수입니다. 

참고로 mapDispatchToProps는 redux 라이브러리에 내장된 bindActionCreators 함수를 사용하면 아래와 같이 리팩토링이 가능합니다.

```javascript
import React from 'react';
import { bindActionCreators } from 'redux'; 
import { connect } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

...

// mapDispatchToProps 는 액션을 디스패치하는 함수를 만들어서 props로 넣어줍니다.
// dispatch 를 파라미터로 받아옵니다.
const mapDispatchToProps = dispatch =>
  // bindActionCreators 를 사용하면, 자동으로 액션 생성 함수에 dispatch 가 감싸진 상태로 호출 할 수 있습니다.
  bindActionCreators(
    {
      increase,
      decrease,
      setDiff
    },
    dispatch
  );

// connect 함수에는 mapStateToProps, mapDispatchToProps 를 인자로 넣어주세요.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CounterContainer);
```



connect 함수에서는 mapDispatchToProps가 함수아 아니라 객체형태일 때는 bindActionCreators를 대신 호출해줍니다.



```javascript
import React from 'react';
import { connect } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

...

// mapDispatchToProps가 함수가 아니라 객체면
// bindActionCreators 를 connect 에서 대신 해줍니다.
const mapDispatchToProps = {
  increase,
  decrease,
  setDiff
};

// connect 함수에는 mapStateToProps, mapDispatchToProps 를 인자로 넣어주세요.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CounterContainer);
```



### connect 함수 깔끔하게 작성하기

mapStateToTprops 와 mapDispatchProps를 따로 선언하지 않고, connect 함수를 사용할 때 인자 쪽에서 익명함수로 바로 만들어 사용하면 코드가 깔끔해집니다.



**containers/TodosContainer.js**

```javascript
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import Todos from '../components/Todos';
import { addTodo, toggleTodo } from '../modules/todos';

function TodosContainer({ todos, addTodo, toggleTodo }) {
  const onCreate = text => addTodo(text);
  const onToggle = useCallback(id => toggleTodo(id), [toggleTodo]); // 최적화를 위해 useCallback 사용

  return <Todos todos={todos} onCreate={onCreate} onToggle={onToggle} />;
}

export default connect(
  state => ({ todos: state.todos }),
  {
    addTodo,
    toggleTodo
  }
)(TodosContainer);
```



### **connect에서 알아두어야 할 것**

**1) [mapStateToProps](https://react-redux.js.org/api/connect#mapstatetoprops-state-ownprops-object)의 두 번째 파라미터 ownProps**

이 파라미터는 생략이 가능합니다. 컨테이너 컴포넌트를 렌더링 할 때 직접 넣어주는 props를 가리킵니다. `<CounterContainer myValue={1} />1`라고 하면 {myValue: 1} 값이 ownProps가 됩니다.

두 번째 파라미터는 다음과 같은 용도로 활용할 수 있습니다.

```javascript
const mapStateToProps = (state, ownProps) => ({
    todo: state.todos[ownProps.id]
});
```

리덕스에 어떤 상태를 조회할 지 설정하는 과정에서 현재 받아온 props에 따라 다른 상태를 조회할 수 있습니다.



**2) connect의 3번째 파라미터 [mergeProps](https://react-redux.js.org/api/connect#mergeprops-stateprops-dispatchprops-ownprops-object)**

생략이 가능한 파라미터입니다. 컴포넌트가 실제로 전달받게 될 props를 정의합니다.

```javascript
(stateProps, dispatchProps, ownProps) => Object
```

이 함수를 따로 지정하지 않으면 결과는 `{ ...ownProps, ...stateProps, ...dispatchProps }`입니다.



**3) connect의 4번째 파라미터 [options](https://react-redux.js.org/api/connect#options-object)**

컨테이너 컴포넌트가 어떻게 동작할 지에 대한 옵션을 정할 수 있고, 생략이 가능합니다. [참조](https://react-redux.js.org/api/connect#options-object)

이 옵션을 통하여 Context 커스터마이징, 최적화를 위한 비교 작업 커스터마이징 및 ref 관련 작업을 할 수 있습니다.







---

**Reference**

https://react.vlpt.us/redux/08-optimize-useSelector.html

https://react.vlpt.us/redux/09-connect.html