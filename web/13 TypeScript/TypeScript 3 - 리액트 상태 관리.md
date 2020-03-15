# TypeScript 3 - 리액트 상태 관리



`useState`, `useReducer`를 사용하여 컴포넌트 상태를 관리하는 방법을 알아봅니다.



### 카운터 예제

**src/Counter.tsx**

```typescript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState<number>(0);
  const onIncrease = () => setCount(count + 1);
  const onDecrease = () => setCount(count - 1);
  return (
    <div>
      <h1>{count}</h1>
      <div>
        <button onClick={onIncrease}>+1</button>
        <button onClick={onDecrease}>-1</button>
      </div>
    </div>
  );
}

export default Counter;
```



`useState`를 사용할 때, `useState<number>()`와 같이 Generics 를 사용하여 상태가 어떤 타입인지 설정만 추가하면 됩니다.



**src/App.tsx**

```typescript
import React from 'react';
import Counter from './Counter';

const App: React.FC = () => {
  return <Counter />;
};

export default App;
```



사실 Generics 를 쓰지 않아도 잘 작동합니다. 상태가 `null` 이거나 아닐 수도 있을 때 Generics를 활용하면 좋습니다.

```typescript
type Information = { name: string; description: string };
const [info, setInformation] = useState<Information | null>(null);
```



---

### 인풋 상태 관리하기



**src/MyForm.tsx**

```typescript
import React, { useState } from 'react';

type MyFormProps = {
  onSubmit: (form: { name: string; description: string }) => void;
};

function MyForm({ onSubmit }: MyFormProps) {
  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  const { name, description } = form;

  const onChange = (e: any) => {
    // e 값을 무엇으로 설정해야할까요?
    // 일단 모를떄는 any 로 설정합니다.
  };

  const handleSubmit = (e: any) => {
    // 여기도 모르니까 any 로 하겠습니다.
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={name} onChange={onChange} />
      <input name="description" value={description} onChange={onChange} />
      <button type="submit">등록</button>
    </form>
  );
}

export default MyForm;
```



onChange 에서 e 객체의 타입이 무엇인지 모를 때는 일단 any로 놔두고, 이를 알기 위해 JSX 폼에서 커서를 `onChange`위에 올려 놓으면 됩니다.

커서를 올리면 어떤 타입을 써야하는 지 알 수 있고, 마우스로 드래그하여 복사하면 됩니다.





onChange 의 e 객체 타입 : `React.ChangeEvent<HTMLInputElement>`

onSubmit 타입 : `React.FormEvent<HTMLFormElement>`

을 확인할 수 있습니다.



---

### useReducer 사용



**src/Counter.tsx**

```typescript
import React, { useReducer } from 'react';

type Action = { type: 'INCREASE' } | { type: 'DECREASE' }; // 이렇게 액션을 | 으로 연달아서 쭉 나열하세요.

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'INCREASE':
      return state + 1;
    case 'DECREASE':
      return state - 1;
    default:
      throw new Error('Unhandled action');
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  const onIncrease = () => dispatch({ type: 'INCREASE' });
  const onDecrease = () => dispatch({ type: 'DECREASE' });

  return (
    <div>
      <h1>{count}</h1>
      <div>
        <button onClick={onIncrease}>+1</button>
        <button onClick={onDecrease}>-1</button>
      </div>
    </div>
  );
}

export default Counter;
```



위 상황은 액션들이 `type` 값만 가지고 있어서 간단한 경우입니다. 액션 객체에 필요한 다른 값이 있다면, 다른 값들과 타입 안에 명시해주면, 추후 리듀서 작성 시 자동완성이 되고, `dispatch`할 때 타입 검사도 해줍니다.



**src/ReducerSample.tsx** 에서 확인해봅시다.

```typescript
import React, { useReducer } from 'react';

type Color = 'red' | 'orange' | 'yellow';

type State = {
  count: number;
  text: string;
  color: Color;
  isGood: boolean;
};

type Action =
  | { type: 'SET_COUNT'; count: number }
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_COLOR'; color: Color }
  | { type: 'TOGGLE_GOOD' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_COUNT':
      return {
        ...state,
        count: action.count // count가 자동완성되며, number 타입인걸 알 수 있습니다.
      };
    case 'SET_TEXT':
      return {
        ...state,
        text: action.text // text가 자동완성되며, string 타입인걸 알 수 있습니다.
      };
    case 'SET_COLOR':
      return {
        ...state,
        color: action.color // color 가 자동완성되며 color 가 Color 타입인걸 알 수 있습니다.
      };
    case 'TOGGLE_GOOD':
      return {
        ...state,
        isGood: !state.isGood
      };
    default:
      throw new Error('Unhandled action');
  }
}

function ReducerSample() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    text: 'hello',
    color: 'red',
    isGood: true
  });

  const setCount = () => dispatch({ type: 'SET_COUNT', count: 5 }); // count 를 넣지 않으면 에러발생
  const setText = () => dispatch({ type: 'SET_TEXT', text: 'bye' }); // text 를 넣지 않으면 에러 발생
  const setColor = () => dispatch({ type: 'SET_COLOR', color: 'orange' }); // orange 를 넣지 않으면 에러 발생
  const toggleGood = () => dispatch({ type: 'TOGGLE_GOOD' });

  return (
    <div>
      <p>
        <code>count: </code> {state.count}
      </p>
      <p>
        <code>text: </code> {state.text}
      </p>
      <p>
        <code>color: </code> {state.color}
      </p>
      <p>
        <code>isGood: </code> {state.isGood ? 'true' : 'false'}
      </p>
      <div>
        <button onClick={setCount}>SET_COUNT</button>
        <button onClick={setText}>SET_TEXT</button>
        <button onClick={setColor}>SET_COLOR</button>
        <button onClick={toggleGood}>TOGGLE_GOOD</button>
      </div>
    </div>
  );
}

export default ReducerSample;
```



**App.tsx**

```typescript
import React from 'react';
import ReducerSample from './ReducerSample';

const App: React.FC = () => {
  return <ReducerSample />;
};

export default App;
```



---

**Reference**

https://react.vlpt.us/using-typescript/03-ts-manage-state.html