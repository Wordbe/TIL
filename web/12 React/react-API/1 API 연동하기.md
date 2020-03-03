# API 연동하기



웹 애플리케이션을 만들 때 데이터를 브라우저에만 가지고 있는 것이 아니라, 데이터를 보존하고 다른 사람들도 조회할 수 있게 하려면 서버를 만들고, 서버의 API를 사용해서 데이터를 읽고 써야 합니다.

실제 프로젝트에서는 주로 Redux 라이브러리와 Redux 미들웨어를 함께 사용하여 구현하는 경우가 많습니다. 이 도구들은 API 연동을 할 때 필수적 요소는 아닙니다. 이번 API 연동에서는 Redux 없이 컴포넌트에서 API 연동을 하는 방법과, 깔끔한 코드를 구현하는 방법에 대해 배워봅니다.

JavaScript의 비동기 처리에 대한 기본 개념을 숙지해야 하고, Promise, async/await 를 모른다면 [여기](https://learnjs.vlpt.us/async/)를 통해 개념 공부가 필요합니다.





---

## 1 API 연동 기본



새로운 프로젝트를 생성합니다.

```console
$ npx create-react-app api-integrate
$ cd api-integrate
$ yarn add axios
```



axios를 사용해서 GET, PUT, POST, DELETE 등의 메서드로 API 요청이 가능합니다. 메서드에 관한 내용은 [REST API](https://meetup.toast.com/posts/92) 를 참고합니다.



간단히는,

* GET : 데이터 조회
* POST : 데이터 등록
* PUT : 데이터 수정
* DELETE : 데이터 삭제

입니다. 이 외에 [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) (부분적 수정), [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD) (GET 요청 시 헤더 요청) 같은 메서드 들도 있습니다.



axios 는 다음과 같이 사용합니다.

```javascript
import axios from 'axios';

axios.get('/users/1');
```

get의 파라미터에는 API 주소를 넣습니다.

```javascript
axios.post('/users', {
  username: 'blabla',
  name: 'blabla'
});
```

post는 두번째 파라미터로 등록 정보를 넣습니다.



이번 API 연동 실습에서는 [JSONPlaceholder](https://jsonplaceholder.typicode.com/) 에 있는 연습용 API를 사용할 것입니다.

그 중 사용할 API는 [여기](https://jsonplaceholder.typicode.com/users)에 있습니다.



---

### useState와 useEffect로 로딩하기

`useState`로 요청 상태를 관리하고, `useEffect`를 통해 컴포넌트가 렌더링되는 시점에 요청을 시작하는 작업을 해봅니다.

요청에 대한 상태를 관리할 때는 3가지 상태를 관리해 주어야 합니다.

1) 요청의 결과

2) 로딩 상태

3) 에러



**src/Users.js**

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 요청이 시작 할 때에는 error 와 users 를 초기화하고 loading 상태를 true 로 바꿉니다.
        setError(null);
        setUsers(null);
        setLoading(true);
       	
        const response = await axios.get(
          'https://jsonplaceholder.typicode.com/users'
        );
        setUsers(response.data); // 데이터는 response.data 안에 들어있습니다.
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return null;
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.username} ({user.name})
        </li>
      ))}
    </ul>
  );
}

export default Users;
```



`useEffect`는 첫번째 파라미터로 등록하는 함수에 `async`를 사용할 수 없기 때문에 함수 내부에서 새로운 비동기 함수를 선언해주어야 합니다.



**App.js**

```javascript
import React from 'react';
import Users from './Users';

function App() {
  return <Users />;
}

export default App;
```



---

### 에러 발생 확인

```javascript
const response = await axios.get(
  'https://jsonplaceholder.typicode.com/users/showmeerror'
);
```

이상한 주소로 임의로 수정하고, 에러 발생시켜 확인하기.





----

### 버튼을 눌러서 API 재요청하기

`fetchUsers`함수를 바깥으로 꺼낸 후, 버튼을 만들어서 이 함수를 연결합니다.

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      // 요청이 시작 할 때에는 error 와 users 를 초기화하고
      setError(null);
      setUsers(null);
      // loading 상태를 true 로 바꿉니다.
      setLoading(true);
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users'
      );
      setUsers(response.data); // 데이터는 response.data 안에 들어있습니다.
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return null;
  return (
    <>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
      <button onClick={fetchUsers}>다시 불러오기</button>
    </>
  );
}

export default Users;
```





---

**Reference**

https://react.vlpt.us/integrate-api/01-basic.html