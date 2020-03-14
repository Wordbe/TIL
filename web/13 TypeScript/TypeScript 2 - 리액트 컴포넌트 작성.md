# TypeScript 2 - 리액트 컴포넌트 작성



### 프로젝트 생성

```
$ npx create-react-app ts-react-tutorial --typescript
```



뒤에 `--typescript`가 있으면 타입스크립스 설정이 적용된 프로젝트가 생성됩니다.

이미 만든 프로젝트에 타입스크립트를 적용하려면 [여기](https://create-react-app.dev/docs/adding-typescript)를 확인합니다.

**src/App.tsx** 타입스크립트를 사용하는 리액트 컴포넌트는 `*.tsx`확장자를 사용합니다.

```javascript
import React from 'react';
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
```



컴포넌트 선언 시, `function` 키워드를 사용해도 좋지만,  `const App: React.FC = () =>`처럼 화살표 함수로 선언해도 됩니다. 리액트 공식 문서나, 해외 유명 개발자들은 `function` 키워드를 주로 사용합니다. 

`React.FC` 를 사용하고, 사용하지 않는 것의 차이를 알아봅니다.



### 새로운 컴포넌트 생성

**src/Greetings.tsx**

```typescript
import React from 'react';

type GreetingsProps = {
  name: string;
};

const Greetings: React.FC<GreetingsProps> = ({ name }) => (
  <div>Hello, {name}</div>
);

export default Greetings;
```

`React.FC`를 사용할 때는 props의 타입을 Generics 로 넣어서 사용합니다. 

<br>

이 때 두가지 이점이 있습니다.

1) props 에 기본적으로 `children`이 들어가 있습니다.

​	> 중괄호 안에서 Ctrl + Space를 눌러 확인 가능합니다.

2) 컴포넌트의 defaultProps, propTypes, contextTypes 를 설정할 때 자동완성이 가능합니다.



단점도 있습니다.

1) children 이 옵션 형태로 있다보니, props 타입이 명백하지 않습니다. 

2) defaultProps 가 (아직은) 제대로 작동하지 않습니다.

​	> `React.FC` 를 생략하면 잘 되는 경우가 있습니다. 



따라서 선택은 자유지만, 사용하지 않는 것을 권장합니다. 화살표 함수 대신, function 키워드를 사용하면 아래와 같이 됩니다. 

**src/Greetings.tsx**

```typescript
import React from 'react';

type GreetingsProps = {
  name: string;
  mark: string;
  optional?: string;
  onClick: (name: string) => void; // 아무것도 리턴하지 않는다는 함수를 의미합니다.
};

function Greetings({ name, mark, optional, onClick }: GreetingsProps) {
  const handleClick = () => onClick(name);
  return (
    <div>
      Hello, {name} {mark}
      {optional && <p>{optional}</p>}
      <div>
        <button onClick={handleClick}>Click Me</button>
      </div>
    </div>
  );
}

Greetings.defaultProps = {
  mark: '!'
};

export default Greetings;
```



컴포넌트에 있어도 되고, 없어도 되는 props 가 있다면 `?` 문자를 사용합니다.

또한, 컴포넌트에서 특정 함수를 props로 받아왔다면 `(name: string) => void` 처럼 타입을 지정할 수 있습니다.



**App.tsx**

```typescript
import React from 'react';
import Greetings from './Greetings';

const App: React.FC = () => {
  const onClick = (name: string) => {
    console.log(`${name} says hello`);
  };
  return <Greetings name="Hello" onClick={onClick} />;
};

export default App;
```



이제, `yarn start`를 실행해서 잘 작동하는 지 확인해봅니다.



TypeScript 를 사용하면, 컴포넌트 렌더링을 할 때 필요한 props를 빠뜨리면, 에디터에 오류가 나타나게 됩니다. 

또한, 컴포넌트 사용 시 필요한 props 가 기억이 안날 때 커서를 컴포넌트 위에 올리거나, 컴포넌트 props 설정 부분에서 `Ctrl + Space`를 누르면 도움을 받을 수 있습니다.



---

**Reference** 

https://react.vlpt.us/using-typescript/02-ts-react-basic.html