# 4 react-async, 요청 상태 관리

요청 상태 관리

지난 번에 만들었던 `useAsync`와 비슷한 함수가 있는 라이브러리 입니다.

이 함수 이름도 `useAsync`입니다. 커스텀 Hook을 만들기 귀찮을 때 사용하면 됩니다.

우리가 만들었던 커스텀 Hook은 배열을 반환했던 반면, 이 Hook은 객체 형태를 반환합니다.



라이브러리 설치

```
$ yarn add react-async
```



react-async 의 [README](https://github.com/ghengeveld/react-async) 공식 사용법

```javascript
import { useAsync } from "react-async"

const loadCustomer = async ({ customerId }, { signal }) => {
  const res = await fetch(`/api/customers/${customerId}`, { signal })
  if (!res.ok) throw new Error(res)
  return res.json()
}

const MyComponent = () => {
  const { data, error, isLoading } = useAsync({ promiseFn: loadCustomer, customerId: 1 })
  if (isLoading) return "Loading..."
  if (error) return `Something went wrong: ${error.message}`
  if (data)
    return (
      <div>
        <strong>Loaded some data:</strong>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  return null
}

```

react-async의 `useAsync`를 사용할 때는 호출할 함수 promiseFn를 넣고, 파라미터도 필드 이름(customerId)과 함께 넣어주어야 합니다. 



---

### User 컴포넌트 전환



**User.js**

```javascript
import React from 'react';
import axios from 'axios';
import { useAsync } from 'react-async';

async function getUser({ id }) {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  return response.data;
}

function User({ id }) {
  const { data: user, error, isLoading } = useAsync({
    promiseFn: getUser,
    id,
    watch: id
  });

  if (isLoading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.username}</h2>
      <p>
        <b>Email:</b> {user.email}
      </p>
    </div>
  );
}

export default User;

```

`useAsync`객체를 사용할 때는 프로미스를 반환하는 함수의 파라미터를 객체 형태로 해주어야 합니다.

```javascript
async function getUser({ id })
```

처럼 넣어주어야 합니다.

그리고 `useAsync`를 사용할 때 watch에 특정 값을 넣어주면 이 값이 바뀔 때마다 promiseFn 에 넣은 함수를 다시 호출하게 됩니다.

조금 더 복잡한 비교 시 [watchFn](https://github.com/ghengeveld/react-async#watchfn) 을 사용하면 됩니다.



---

### Users 컴포넌트 전환

**Users.js**

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useAsync } from 'react-async';
import User from './User';

async function getUsers() {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/users'
  );
  return response.data;
}

function Users() {
  const [userId, setUserId] = useState(null);
  const { data: users, error, isLoading, reload } = useAsync({
    promiseFn: getUsers
  });

  if (isLoading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return <button onClick={reload}>불러오기</button>;
  return (
    <>
      <ul>
        {users.map(user => (
          <li
            key={user.id}
            onClick={() => setUserId(user.id)}
            style={{ cursor: 'pointer' }}
          >
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
      <button onClick={reload}>다시 불러오기</button>
      {userId && <User id={userId} />}
    </>
  );
}

export default Users;
```



`reload`함수를 사용하면 데이터를 다시 불러올 수 있습니다.

Users 컴포넌트를 만들 때, 불러오기 버튼을 눌러야만 데이터를 불러왔었지만, 이렇게 하면 컴포넌트를 렌더링하는 시점부터 데이터를 불러오게 됩니다.

이전 섹션에 배웠던 `skip`처럼 렌더링 시점이 아닌, 사용자의 특정 인터랙션에 따라 API를 호출하고 싶다면 `promiseFn`대신 `deferFn`을 사용하고, `reload`대신 `run`함수를 사용하면 됩니다.



**Users.js**

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useAsync } from 'react-async';
import User from './User';

...

function Users() {
  const [userId, setUserId] = useState(null);
  const { data: users, error, isLoading, run } = useAsync({
    deferFn: getUsers
  });
  ...

  return (
    <>
      <ul>
        {users.map(user => (
          <li
            key={user.id}
            onClick={() => setUserId(user.id)}
            style={{ cursor: 'pointer' }}
          >
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
      <button onClick={run}>다시 불러오기</button>
      {userId && <User id={userId} />}
    </>
  );
}

export default Users;
```

이제 렌더링 시에 데이터 요청을 하는 것이 아니라, 불러오기 버튼을 눌렀을 때 데이터 요청을 하게 됩니다.



_**react-async**_의 useAsync는 옵션이 다양하고(promiseFn, deferFn, watch, ...) 결과 값도 객체 안에 다양한 값이 들어있어서 (run, reload, ...) 헷갈릴 수 있지만, 다양한 기능이 내장되어 있고(예컨데, 요청을 취소할 수도 있습니다.) Hook을 직접 만들 필요없이 바로 불러와서 사용할 수 있는 장점이 있습니다.



Hook은 직접 만들어 사용해도 좋고, 라이브러리를 불러와서 사용해도 좋습니다.



---

**Reference**

https://react.vlpt.us/integrate-api/04-react-async.html