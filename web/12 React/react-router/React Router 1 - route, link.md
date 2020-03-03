# React Router

* react-router를 통한 리액트 SPA 만들기.



### SPA 란?

**Single Page Application, SPA**은 페이지가 1개인 어플리케이션이라는 뜻입니다. 전통적인 웹 어플리케이션 구조는 여러 페이지로 구성되어 있습니다. 유저가 요청할 때마다 새로고침되며 페이지를 로딩할 때마다 서버로부터 리소스를 전달받아 해석 후 렌더링을 합니다. HTML 파일, 템플릿 엔진 등을 사용하여 app view가 어떻게 보여질지도 서버에서 담당했었습니다.

웹에서 제공되는 정보가 많아지기 시작하면서 속도 측면에서 문제가 있었고 이를 해결하기 위해 캐싱(cashing)과 압축을 통해 서비스를 제공했습니다. 하지만 사용자와 인터랙션이 많은 현대 웹 app에서는 이 또한 충분치 않습니다. _렌더링을 서버에서 담당한다는 것_은 렌더링을 위한 서버 자원이 사용되는 것이고 불필요한 트래픽이 낭비되는 것이기 때문입니다.

그래서 리액트 같은 라이브러리 또는 프레임워크를 사용해서 뷰 렌더링을 유저 브라우저가 담당하도록 하고, 애플리케이션을 브라우저에 로드 한 다음 필요한 데이터만 서버로부터 전달받아 보여주는 전략을 사용하게 됩니다.

싱글 페이지가 한 화면만 있는 것은 아닙니다. 블로그에는 홈, 포스트 목록, 포스트, 글쓰기 등의 화면이 있고 이 화면에 따라 주소도 만들어 주어야 합니다. 주소가 있어야 유저가 북마크도 할 수 있고, 서비스에 구글을 통해 유입될 수 있기 때문입니다. **다른 주소에 다른 뷰를 보여주는 것을 라우팅**이라고 하는데, 이 기능은 리액트에 내장되어있지 않습니다. 따라서 직접 브라우저 API를 사용하고 상태를 설정하여 다른 뷰를 보여주어야 합니다.



### react-router

react-router는 써드파티 라이브러리(Third party library)로서, 공식은 아니지만 가장 많이 사용되고 있는 라이브러리 입니다. (페이스북 공식 라우팅 라이브러리는 없습니다.) 이 라이브러리는 클라이언트 사이드에서 이뤄지는 라우팅을 간단하게 해줍니다. 더불어 서버 사이드 렌더링도 도와주는 도구들이 함께 들어있습니다. 또한 react-native에서도 사용할 수 있습니다.

만약, 여러 화면으로 구성된 웹 어플리케이션을 만들고자 한다면, react-router는 필수 라이브러리가 될 것입니다.



### SPA 의 단점

SPA의 단점은 앱의 규모가 커지면, JavaScript 파일 사이즈가 너무 커진다는 것입니다. 유저가 실제로 방문하지 않을수도 있는 페이지에 관련된 렌더링 관련 스크립트도 불러오기 때문입니다. 하지만 [Code Splitting](https://velog.io/@velopert/react-code-splitting) 을 사용하면 라우트 별로 파일을 나눠서 트래픽과 로딩속도를 개선할 수 있습니다.

react-router처럼 브라우저 측에서 JavaScript를 사용하여 라우트를 관리하는 것의 잠재적 단점은 자바스크립트를 실행하지 않는 일반 크롤러에선 페이지의 정보를 제대로 받아가지 못한다는 점입니다. 따라서 구글, 네이버, 다음 등 검색엔진에서 페이지가 검색결과에 잘 안 나타날 수도 잇습니다. 또한 JavaScript가 실행될 때까지 페이지가 비어있기 때문에 JavaScript 파일이 아직 캐싱되지 않은 사용자는 아주 짧은 시간동안 흰 페이지가 나타날 수 도 있습니다. 이는 _서버사이드 렌더링_을 통하여 해결할 수 있습니다.



---

## 1 리액트 라우터 프로젝트



### 프로젝트 생성, 라이브러리 연동

```
$ npx create-react-app router-tutorial
$ cd router-tutorial
$ yarn add react-router-dom
```



라우터 적용은 index.js 에서 `BrowserRouter`컴포넌트를 사용하여 구현합니다.

**index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // * BrowserRouter 불러오기
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// * App 을 BrowserRouter 로 감싸기
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

serviceWorker.unregister();
```



### 페이지 컴포넌트 생성

**src/Home.js**

```javascript
import React from 'react';

const Home = () => {
  return (
    <div>
      <h1>홈</h1>
      <p>이곳은 홈이에요. 가장 먼저 보여지는 페이지죠.</p>
    </div>
  );
};

export default Home;

```



**src/About.js**

```javascript
import React from 'react';

const About = () => {
  return (
    <div>
      <h1>소개</h1>
      <p>이 프로젝트는 리액트 라우터 기초를 실습해보는 예제 프로젝트랍니다.</p>
    </div>
  );
};

export default About;
```



### Route: 특정 주소에 컴포넌트 연결하기

사용자가 요청하는 주소에 따라 다른 컴포넌트를 보여주도록 하겠습니다. `Route` 컴포넌트를 사용합니다.

```javascript
<Route path="주소 규칙" component={보여줄 컴포넌트}>
```

와 같이 사용하면 됩니다.



**src/App.js**

```javascript
import React from 'react';
import { Route } from 'react-router-dom';
import About from './About';
import Home from './Home';

const App = () => {
  return (
    <div>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </div>
  );
};

export default App;
```



서버를 실행시켜봅시다.

```
$ yarn start
```



localhost:3000 뒤에 `/`를 들어가면 홈 컴포넌트가 보여집니다.

그런데 `/about`을 하면 About 컴포넌트만 보여지는 것이 아니라, 두 컴포넌트가 모두 보여집니다.

이는 `/` 라는 공통 규칙이 있기 때문에 발생한 현상입니다. 이를 수정해봅시다.



**App.js**

```javascript
...
	  <Route path="/" exact={true} component={Home} />
      <Route path="/about" component={About} />
...
```



### Link: 누르면 다른 주소로 이동시키기

리액트 라우터를 사용할 때는 `<a href="...">...<a>` 태그를 사용하면 안됩니다. 만약 한다면, onClick에 `e.preventDefault()`를 호출하고 따로 JavaScript 주소를 변환시켜 주어야 합니다.

SPA를 위해서는 Link라는 컴포넌트를 사용해야 합니다. a 태그의 기본 속성은 페이지를 이동시키면서, 페이지를 새로 불러오기 때문입니다. 그렇게 되면 리액트 앱에서 상태들도 초기화 되고, 렌더링된 컴포넌트도 모두 사라지고 새로 렌더링을 하게 됩니다. 

**Link 컴포넌트는** [HTML5 History API](https://developer.mozilla.org/ko/docs/Web/API/History) 를 사용하여 **브라우저의 주소만 바꿀 뿐 페이지를 새로 불러오지는 않습니다.**



**src/App.js**

```javascript
import React from 'react';
import { Route, Link } from 'react-router-dom';
import About from './About';
import Home from './Home';

const App = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/about">소개</Link>
        </li>
      </ul>
      <hr />
      <Route path="/" exact={true} component={Home} />
      <Route path="/about" component={About} />
    </div>
  );
};

export default App;
```





---

**Reference**

https://react.vlpt.us/react-router/

https://react.vlpt.us/react-router/01-concepts.html