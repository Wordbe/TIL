# React Router 2



## 2 파라미터와 쿼리

페이지 주소 형식은 파라미터와 쿼리로 나눠질 수 있습니다.

>파라미터: /profiles/velopert
>쿼리: /about?details=true



무조건 따라야 하는 규칙은 없지만, 일반적으로 파라미터는 id나 이름을 가지고 조회를 할 때 사용하고, 쿼리의 경우 키워드 검색이나 요청을 할 때 필요한 옵션을 전달하여 사용합니다.



### URL Params

**src/Profile.js**

```javascript
import React from 'react';

// 프로필에서 사용 할 데이터
const profileData = {
  velopert: {
    name: '김민준',
    description:
      'Frontend Engineer @ Laftel Inc. 재밌는 것만 골라서 하는 개발자'
  },
  gildong: {
    name: '홍길동',
    description: '전래동화의 주인공'
  }
};

const Profile = ({ match }) => {
  // 파라미터를 받아올 땐 match 안에 들어있는 params 값을 참조합니다.
  const { username } = match.params;
  const profile = profileData[username];
  if (!profile) {
    return <div>존재하지 않는 유저입니다.</div>;
  }
  return (
    <div>
      <h3>
        {username}({profile.name})
      </h3>
      <p>{profile.description}</p>
    </div>
  );
};

export default Profile;
```

파라미터를 받을 때는 match 안에 있는 params 값을 참조합니다.  [match](https://reacttraining.com/react-router/web/api/match) 객체 안에는 현재 주소가 `Route` 컴포넌트에서 정한 규칙과 어떻게 일치하는지 정보가 들어있습니다.

이제 Profile을 App에 적용해봅니다. path 규칙에 `/profiles/:username`라고 넣어주면 username에 해당하는 값을 파라미터로 넣어주어서 Profile 컴포넌트에서 match props를 통해 전달받을 수 있게 구현합니다.

**App.js**

```javascript
import React from 'react';
import { Route, Link } from 'react-router-dom';
import About from './About';
import Home from './Home';
import Profile from './Profile';

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
      <Route path="/profiles/:username" component={Profile} />
    </div>
  );
};

export default App;
```



/profiles/velopert 경로를 직접들어가서 확인하시면 됩니다.



---

### Query

쿼리는 라우트 컴포넌트에게 props 로 전달되는 location 객체에 있는 search 값에서 읽어올 수 있습니다. location 객체는 현재 앱이 갖고 있는 주소 정보를 지니고 있습니다.

```javascript
{
  key: 'ac3df4', // not with HashHistory!
  pathname: '/somewhere'
  search: '?some=search-string',
  hash: '#howdy',
  state: {
    [userDefined]: true
  }
}
```

이런 식으로 가지고 있습니다.

search 값은 문자열 형태로 되어있습니다. 객체 형태로 변환은 수동으로 해야합니다.

이는 [qs](https://www.npmjs.com/package/qs) 라이브러리의 도움을 받으면 편합니다.

```
$ yarn add qs
```



**About.js**

```javascript
import React from 'react';
import qs from 'qs';

const About = ({ location }) => {
  const query = qs.parse(location.search, {
    ignoreQueryPrefix: true
  });
  const detail = query.detail === 'true'; // 쿼리의 파싱결과값은 문자열입니다.

  return (
    <div>
      <h1>소개</h1>
      <p>이 프로젝트는 리액트 라우터 기초를 실습해보는 예제 프로젝트랍니다.</p>
      {detail && <p>추가적인 정보가 어쩌고 저쩌고..</p>}
    </div>
  );
};

export default About;
```





---

## 3  Subroutes

서브 라우트는 라우트 내부에 라우트를 만드는 것을 의미합니다. 컴포넌트를 만들어서 그 안에 또 Route 컴포넌트를 렌더링하면 됩니다.



**Profiles.js**

```javascript
import React from 'react';
import { Link, Route } from 'react-router-dom';
import Profile from './Profile';

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
    </div>
  );
};

export default Profiles;
```

Route 컴포넌트에서 `component`대신에 `render`가 사용되었습니다. 즉 컴포넌트가 아니라, JSX 자체를 렌더링 할 수 도 있습니다. JSX를 렌더링하는 것이므로 상위 영역에서 props나 기타 값들을 전달해 줄 수도 있습니다.



**App.js**

```javascript
import React from 'react';
import { Route, Link } from 'react-router-dom';
import About from './About';
import Home from './Home';
import Profiles from './Profiles';

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
      </ul>
      <hr />
      <Route path="/" exact={true} component={Home} />
      <Route path="/about" component={About} />
      <Route path="/profiles" component={Profiles} />
    </div>
  );
};

export default App;
```



서비스에서 특정 라우트 내에 탭 같은 것을 만들게 된다면, 단순 state로 관리하는 것보다 서브라우트로 관리하는 것을 권장합니다. setState 를 할 필요가 없고, 링크를 통해 다른 곳에서 쉽게 진입 시킬 수 있고, 검색엔진 크롤링까지 고려한다면 검색엔진 봇이 더욱 다양한 데이터를 수집해 갈 수 있기 때문입니다.









---

**Reference**

https://react.vlpt.us/redux/

https://react.vlpt.us/react-router/03-subroutes.html