# TypeScript 4 - Context API 활용

state를 위한 context를 만들고, dispatch를 위한 context를 만듭니다.



**src/SampleContext.tsx**

```typescript
import React, { useReducer, useContext, createContext, Dispatch } from 'react';

// 필요한 타입들을 미리 선언

type Color = 'red' | 'orange' | 'yellow';

// 상태를 위한 타입
type State = {
  count: number;
  text: string;
  color: Color;
  isGood: boolean;
};

// 모든 액션들을 위한 타입
type Action =
  | { type: 'SET_COUNT'; count: number }
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_COLOR'; color: Color }
  | { type: 'TOGGLE_GOOD' };

// 디스패치를 위한 타입 (Dispatch 를 리액트에서 불러올 수 있음), 액션들의 타입을 Dispatch 의 Generics로 설정
type SampleDispatch = Dispatch<Action>;

// Context 만들기
const SampleStateContext = createContext<State | null>(null);
const SampleDispatchContext = createContext<SampleDispatch | null>(null);

// 리듀서
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

// SampleProvider 에서 useReduer를 사용하고
// SampleStateContext.Provider 와 SampleDispatchContext.Provider 로 children 을 감싸서 반환합니다.
export function SampleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    text: 'hello',
    color: 'red',
    isGood: true
  });

  return (
    <SampleStateContext.Provider value={state}>
      <SampleDispatchContext.Provider value={dispatch}>
        {children}
      </SampleDispatchContext.Provider>
    </SampleStateContext.Provider>
  );
}

// state 와 dispatch 를 쉽게 사용하기 위한 커스텀 Hooks
export function useSampleState() {
  const state = useContext(SampleStateContext);
  if (!state) throw new Error('Cannot find SampleProvider'); // 유효하지 않을땐 에러를 발생
  return state;
}

export function useSampleDispatch() {
  const dispatch = useContext(SampleDispatchContext);
  if (!dispatch) throw new Error('Cannot find SampleProvider'); // 유효하지 않을땐 에러를 발생
  return dispatch;
}
```



커스텀 Hook 인 `useSampleState`와 `useSampleDispatch` 에서는 null 체킹을 해주는 것이 중요합니다.

context 가 지닌 값이 유효하지 않으면 에러를 발생시키는 코드를 작성해주었습니다. null을 체킹하지 않는다면, `useSampleState` 결과값의 타입은 state | null 입니다. null 체킹을 하면 State 입니다.



이제 ReducerSample을 SampleProvider 로 감싸줍니다.

**App.js**

```javascript
import React from 'react';
import ReducerSample from './ReducerSample';
import { SampleProvider } from './SampleContext';

const App: React.FC = () => {
  return (
    <SampleProvider>
      <ReducerSample />
    </SampleProvider>
  );
};

export default App;
```



**src/ReducerSample.tsx**

```typescript
import React from 'react';
import { useSampleState, useSampleDispatch } from './SampleContext';

function ReducerSample() {
  const state = useSampleState();
  const dispatch = useSampleDispatch();

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



TypeScript 를 사용하는 리액트 프로젝트에서 Context API를 사용할 때 이러한 구조로 구현하면 됩니다. 





---

**Reference**

https://react.vlpt.us/using-typescript/04-ts-context.html