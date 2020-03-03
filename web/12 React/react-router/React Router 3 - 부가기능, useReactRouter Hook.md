# React Router 3 - 부가기능, useReactRouter Hook

## 4 리액트 라우터 부가기능



### history 객체

[history](https://reacttraining.com/react-router/web/api/history) 객체는 라우트로 사용된 컴포넌트에게 match, location 과 함께 전달되는 props 중 하나입니다. 이 객체를 통해 컴포넌트 내에 구현하는 메소드에서 라우터에 직접 접근할 수 있습니다. (뒤로가기, 특정 경로로 이동, 이탈 방지 등)



**src/HistorySample.js**

```javascript
import React, { useEffect } from 'react';

function HistorySample({ history }) {
  const goBack = () => {
    history.goBack();
  };

  const goHome = () => {
    history.push('/');
  };

  useEffect(() => {
    console.log(history);
    const unblock = history.block('정말 떠나실건가요?');
    return () => {
      unblock();
    };
  }, [history]);

  return (
    <div>
      <button onClick={goBack}>뒤로가기</button>
      <button onClick={goHome}>홈으로</button>
    </div>
  );
}

export default HistorySample;
```



**App.js**

```javascript
import React from 'react';
import { Route, Link } from 'react-router-dom';
import About from './About';
import Home from './Home';
import Profiles from './Profiles';
import HistorySample from './HistorySample';

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
        <li>
          <Link to="/profiles">프로필 목록</Link>
        </li>
        <li>
          <Link to="/history">예제</Link>
        </li>
      </ul>
      <hr />
      <Route path="/" exact={true} component={Home} />
      <Route path="/about" component={About} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/history" component={HistorySample} />
    </div>
  );
};

export default App;
```



history 객체를 사용하면 조건부로 다른 곳으로 이동도 가능하고, 메시지박스를 통해 이탈을 막을 수도 있습니다.



---

### withRouter Hoc

라우트 컴포넌트가 아닌 곳에서 match / location / history 를 사용해야 할 때 씁니다.



**src/WithRouterSample.js**

```javascript
import React from 'react';
import { withRouter } from 'react-router-dom';
const WithRouterSample = ({ location, match, history }) => {
  return (
    <div>
      <h4>location</h4>
      <textarea value={JSON.stringify(location, null, 2)} readOnly />
      <h4>match</h4>
      <textarea value={JSON.stringify(match, null, 2)} readOnly />
      <button onClick={() => history.push('/')}>홈으로</button>
    </div>
  );
};

export default withRouter(WithRouterSample);
```



**src/Profiles.js**

```javascript
import React from 'react';
import { Link, Route } from 'react-router-dom';
import Profile from './Profile';
import WithRouterSample from './WithRouterSample';

const Profiles = () => {
  return (
    <div>
      <h3>유저 목록:</h3>
      <ul>
        <li>
          <Link to="/profiles/velopert">velopert</Link>
        </li>
        <li>
          <Link to="/profiles/gildong">gildong</Link>
        </li>
      </ul>

      <Route
        path="/profiles"
        exact
        render={() => <div>유저를 선택해주세요.</div>}
      />
      <Route path="/profiles/:username" component={Profile} />
      <WithRouterSample />
    </div>
  );
};

export default Profiles;
```



withRouter를 사용하면, 자신의 부모컴포넌트 기준의 match 값이 전달됩니다. 위 결과를 보면 gildong 이라는 URL Params가 있는 상황임에도 불구하고, params 쪽이 {} 로 비어있습니다. WithRouterSample은 Profiles에서 렌더링 되었고, 이 컴포넌트는 `/profile` 규칙에 일치하기 때문에 이러한 결과가 나타납니다.



---

### Switch

Switch는 여러 Route를 감싸서 그 중 규칙이 일치하는 라우트 하나만을 렌더링해줍니다. Switch를 사용하면, 아무것도 일치하지 않았을 때 보여 줄 Not Found 페이지를 구현할 수 있습니다.



**App.js**

```javascript
import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import About from './About';
import Home from './Home';
import Profiles from './Profiles';
import HistorySample from './HistorySample';

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
        <li>
          <Link to="/profiles">프로필 목록</Link>
        </li>
        <li>
          <Link to="/history">예제</Link>
        </li>
      </ul>
      <hr />
      <Switch>
        <Route path="/" exact={true} component={Home} />
        <Route path="/about" component={About} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/history" component={HistorySample} />
        <Route
          // path 를 따로 정의하지 않으면 모든 상황에 렌더링됨
          render={({ location }) => (
            <div>
              <h2>이 페이지는 존재하지 않습니다:</h2>
              <p>{location.pathname}</p>
            </div>
          )}
        />
      </Switch>
    </div>
  );
};

export default App;
```



검색창에 존재하지 않는 url을 아무거나 쳐봅시다. localhost:3000/nowhere



---

### NavLink

NavLink는 Link와 비슷합니다. 현재 경로와 Link에서 사용하는 경로가 일치하는 경우 특정 스타일, 클래스를 적용할 수 있는 컴포넌트 입니다.



**src/Profiles.js**

```javascript
import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import Profile from './Profile';
import WithRouterSample from './WithRouterSample';

const Profiles = () => {
  return (
    <div>
      <h3>유저 목록:</h3>
      <ul>
        <li>
          <NavLink
            to="/profiles/velopert"
            activeStyle={{ background: 'black', color: 'white' }}
          >
            velopert
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profiles/gildong"
            activeStyle={{ background: 'black', color: 'white' }}
          >
            gildong
          </NavLink>
        </li>
      </ul>

      <Route
        path="/profiles"
        exact
        render={() => <div>유저를 선택해주세요.</div>}
      />
      <Route path="/profiles/:username" component={Profile} />
      <WithRouterSample />
    </div>
  );
};

export default Profiles;
```



스타일이 아니라 CSS 클래스를 적용하고 싶다면 activeStyle 대신 activeClassName을 사용하면 됩니다.



이 외에도 다른 기능이 많습니다.

* **[Redirect](https://reacttraining.com/react-router/web/example/auth-workflow)**: 페이지를 리디렉트 하는 컴포넌트
* **[Prompt](https://reacttraining.com/react-router/web/example/preventing-transitions)**: 이전에 사용했던 history.block 의 컴포넌트 버전
* **[Route Config](https://reacttraining.com/react-router/web/example/route-config)**: JSX 형태로 라우트를 선언하는 것이 아닌 Angular 나 Vue 처럼 배열/객체를 사용하여 라우트 정의하기
* **[Memory Router](https://reacttraining.com/react-router/web/api/MemoryRouter)**:실제로 주소는 존재하지는 않는 라우터. 리액트 네이티브나, 임베디드 웹앱에서 사용하면 유용합니다.



---

## 5 useReactRouter Hook 사용

이전 섹션에서 `withRouter`함수를 사용해서 라우트로 사용하고 있지 않은 컴포넌트에서도 라우트 관련 props (match, history, location)을 조회하는 방법을 알아보았습니다.



`withRouter` 대신에 Hook을 사용해서 구현할 수 도 있습니다. 아직 리액트 라우터에서 공식 Hook은 지원되지 않고 있습니다.

따라서 우리는 라이브러리를 설치해서 라우터 관련 값들을 Hook으로 사용하는 방법을 알아봅니다.

[use-react-router](https://github.com/CharlesStover/use-react-router) 라이브러리를 설치합니다.

```
$ yarn add use-react-router
```



**RouterHookSample.js**

```javascript
import useReactRouter from 'use-react-router';

function RouterHookSample() {
  const { history, location, match } = useReactRouter;
  console.log({ history, location, match });
  return null;
}

export default RouterHookSample;
```



```javascript
import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import Profile from './Profile';
import WithRouterSample from './WithRouterSample';
import RouterHookSample from './RouterHookSample';

const Profiles = () => {
  return (
    <div>
      <h3>유저 목록:</h3>
      <ul>
        <li>
          <NavLink
            to="/profiles/velopert"
            activeStyle={{ background: 'black', color: 'white' }}
          >
            velopert
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profiles/gildong"
            activeStyle={{ background: 'black', color: 'white' }}
          >
            gildong
          </NavLink>
        </li>
      </ul>

      <Route
        path="/profiles"
        exact
        render={() => <div>유저를 선택해주세요.</div>}
      />
      <Route path="/profiles/:username" component={Profile} />
      <WithRouterSample />
      <RouterHookSample />
    </div>
  );
};

export default Profiles;
```



콘솔을 확인해봅시다. 프로필 목록 페이지를 열었을 때 (`/profiles`), location, match, history 객체를 조회할 수 있게 되었습니다.

물론 이 Hook은 정식 릴리즈는 아니어서 필요할 경우 사용하시면 좋습니다. 



---

**Reference**

https://react.vlpt.us/react-router/04-extra.html

https://react.vlpt.us/react-router/05-use-router-hook.html