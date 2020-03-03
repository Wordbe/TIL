## 5 Context와 함께 사용하기

리액트의 Context와 API 연동을 함께 하는 방법을 알아봅니다.

컴포넌트에서 필요한 외부 데이터들은 컴포넌트 내부에서 `useAsync` 같은 Hook을 사용하면 충분하지만, 다양한 컴포넌트로부터의 데이터가 필요한 상황도 있습니다.(예컨데, 현재 로그인된 사용자의 정보, 설정 등이 있습니다.) 이 때 Context를 사용하면 개발이 편리해집니다.



### Context 준비

**src/UsersContext.js**

```javascript
import React, { createContext, useReducer, useContext } from 'react';

// UsersContext 에서 사용 할 기본 상태
const initialState = {
  users: {
    loading: false,
    data: null,
    error: null
  },
  user: {
    loading: false,
    data: null,
    error: null
  }
};

// 로딩중일 때 바뀔 상태 객체
const loadingState = {
  loading: true,
  data: null,
  error: null
};

// 성공했을 때의 상태 만들어주는 함수
const success = data => ({
  loading: false,
  data,
  error: null
});

// 실패했을 때의 상태 만들어주는 함수
const error = error => ({
  loading: false,
  data: null,
  error: error
});

// 위에서 만든 객체 / 유틸 함수들을 사용하여 리듀서 작성
function usersReducer(state, action) {
  switch (action.type) {
    case 'GET_USERS':
      return {
        ...state,
        users: loadingState
      };
    case 'GET_USERS_SUCCESS':
      return {
        ...state,
        users: success(action.data)
      };
    case 'GET_USERS_ERROR':
      return {
        ...state,
        users: error(action.error)
      };
    case 'GET_USER':
      return {
        ...state,
        user: loadingState
      };
    case 'GET_USER_SUCCESS':
      return {
        ...state,
        user: success(action.data)
      };
    case 'GET_USER_ERROR':
      return {
        ...state,
        user: error(action.error)
      };
    default:
      throw new Error(`Unhanded action type: ${action.type}`);
  }
}

// State 용 Context 와 Dispatch 용 Context 따로 만들어주기
const UsersStateContext = createContext(null);
const UsersDispatchContext = createContext(null);

// 위에서 선언한 두가지 Context 들의 Provider 로 감싸주는 컴포넌트
export function UsersProvider({ children }) {
  const [state, dispatch] = useReducer(usersReducer, initialState);
  return (
    <UsersStateContext.Provider value={state}>
      <UsersDispatchContext.Provider value={dispatch}>
        {children}
      </UsersDispatchContext.Provider>
    </UsersStateContext.Provider>
  );
}

// State 를 쉽게 조회 할 수 있게 해주는 커스텀 Hook
export function useUsersState() {
  const state = useContext(UsersStateContext);
  if (!state) {
    throw new Error('Cannot find UsersProvider');
  }
  return state;
}

// Dispatch 를 쉽게 사용 할 수 있게 해주는 커스텀 Hook
export function useUsersDispatch() {
  const dispatch = useContext(UsersDispatchContext);
  if (!dispatch) {
    throw new Error('Cannot find UsersProvider');
  }
  return dispatch;
}
```



id를 가지고 사용자의 정보를 가져오는 API를 호출하려면 아래와 같은 형식으로 해주어야 합니다.

```javascript
dispatch({ type: 'GET_USER' });
try {
  const response = await getUser();
  dispatch({ type: 'GET_USER_SUCCESS', data: response.data });
} catch (e) {
  dispatch({ type: 'GET_USER_ERROR', error: e });
}
```

요청 시작시 액션을 디스패치하고, 요청 성공 또는 실패 시 또 다시 디스패치하는 것이 핵심입니다.



---

### API 처리 함수 만들기



axios를 불러온 다음, 코드 하단 부분에 `getUsers`와 `getUser` 함수를 작성해봅니다.

```javascript
import React, { createContext, useReducer, useContext } from 'react';
import axios from 'axios';

...

export async function getUsers(dispatch) {
  dispatch({ type: 'GET_USERS' });
  try {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users'
    );
    dispatch({ type: 'GET_USERS_SUCCESS', data: response.data });
  } catch (e) {
    dispatch({ type: 'GET_USERS_ERROR', error: e });
  }
}

export async function getUser(dispatch, id) {
  dispatch({ type: 'GET_USER' });
  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    dispatch({ type: 'GET_USER_SUCCESS', data: response.data });
  } catch (e) {
    dispatch({ type: 'GET_USER_ERROR', error: e });
  }
}
```



---

### Context 사용하기

**App.js**

```javascript
import React from 'react';
import Users from './Users';
import { UsersProvider } from './UsersContext';

function App() {
  return (
    <UsersProvider>
      <Users />
    </UsersProvider>
  );
}

export default App;

```



Users 컴포넌트 코드를 Context를 사용하는 형태의 코드로 전환해봅니다.

**Users.js**

```javascript
import React, { useState } from 'react';
import { useUsersState, useUsersDispatch, getUsers } from './UsersContext';
import User from './User';

function Users() {
  const [userId, setUserId] = useState(null);
  const state = useUsersState();
  const dispatch = useUsersDispatch();

  const { data: users, loading, error } = state.users;
  const fetchData = () => {
    getUsers(dispatch);
  };

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return <button onClick={fetchData}>불러오기</button>;

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
      <button onClick={fetchData}>다시 불러오기</button>
      {userId && <User id={userId} />}
    </>
  );
}

export default Users;
```



useUsersState() 와 useUsersDispatch()를 사용해서 state와 dispatch를 가져오고, 요청 시작시 getUsers() 함수 안에 dispatch를 넣어서 호출했습니다.

User 컴포넌트도 전환해보겠습니다.



**User.js**

```javascript
import React, { useEffect } from 'react';
import { useUsersState, useUsersDispatch, getUser } from './UsersContext';

function User({ id }) {
  const state = useUsersState();
  const dispatch = useUsersDispatch();
  useEffect(() => {
    getUser(dispatch, id);
  }, [dispatch, id]);

  const { data: user, loading, error } = state.user;

  if (loading) return <div>로딩중..</div>;
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

useEffect를 통해 id 값이 바뀔 때마다 getUser() 함수를 호출해줍니다. getUser 함수 사용시 현재 props로 받아온 id 값을 넣어주었습니다.



**이렇게 Context 와 비동기 API 연동의 정석을 배워보았습니다. 이 패턴을 잘 활용하면 좋습니다.**

이제 반복되는 로직을 제거하여 깔끔한 코드를 구성해봅시다.



리팩토링을 위해 api가 들어있는 파일을 따로 분리해주겠습니다.



**api.js**

```javascript
import axios from 'axios';

export async function getUsers() {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/users'
  );
  return response.data;
}

export async function getUser(id) {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  return response.data;
}

```



또한 비동기를 다루는 함수를 따로 모아 파일을 분리하겠습니다.



**asyncActionUtils.js**

```javascript
// 이 함수는 파라미터로 액션의 타입 (예: GET_USER) 과 Promise 를 만들어주는 함수를 받아옵니다.
export default function createAsyncDispatcher(type, promiseFn) {
  // 성공, 실패에 대한 액션 타입 문자열을 준비합니다.
  const SUCCESS = `${type}_SUCCESS`;
  const ERROR = `${type}_ERROR`;

  // 새로운 함수를 만듭니다.
  // ...rest 를 사용하여 나머지 파라미터를 rest 배열에 담습니다.
  async function actionHandler(dispatch, ...rest) {
    dispatch({ type }); // 요청 시작됨
    try {
      const data = await promiseFn(...rest); // rest 배열을 spread 로 넣어줍니다.
      dispatch({
        type: SUCCESS,
        data
      }); // 성공함
    } catch (e) {
      dispatch({
        type: ERROR,
        error: e
      }); // 실패함
    }
  }

  return actionHandler; // 만든 함수를 반환합니다.
}
```



이렇게 되면 UserContext 코드를 깔끔하게 리팩토링 할 수 있습니다.

**UsersContext.js**

```javascript
import React, { createContext, useReducer, useContext } from 'react';
import createAsyncDispatcher from './createAsyncDispatcher';
import * as api from './api'; // api 파일에서 내보낸 모든 함수들을 불러옴

...

export const getUsers = createAsyncDispatcher('GET_USERS', api.getUsers);
export const getUser = createAsyncDispatcher('GET_USER', api.getUser);

```



리듀서 코드도 리팩토링 해봅시다.

`initalAsyncState`객체와 `createAsyncHandler` 함수를 만들어 내보내(export)겠습니다.



**asyncActionUtils.js**

```javascript
// 이 함수는 파라미터로 액션의 타입 (예: GET_USER) 과 Promise 를 만들어주는 함수를 받아옵니다.
export function createAsyncDispatcher(type, promiseFn) {
...
}

export const initialAsyncState = {
  loading: false,
  data: null,
  error: null
};

// 로딩중일 때 바뀔 상태 객체
const loadingState = {
  loading: true,
  data: null,
  error: null
};

// 성공했을 때의 상태 만들어주는 함수
const success = data => ({
  loading: false,
  data,
  error: null
});

// 실패했을 때의 상태 만들어주는 함수
const error = error => ({
  loading: false,
  data: null,
  error: error
});

// 세가지 액션을 처리하는 리듀서를 만들어줍니다
// type 은 액션 타입, key 는 리듀서에서 사용할 필드 이름입니다 (예: user, users)
export function createAsyncHandler(type, key) {
  // 성공, 실패에 대한 액션 타입 문자열을 준비합니다.
  const SUCCESS = `${type}_SUCCESS`;
  const ERROR = `${type}_ERROR`;

  // 함수를 새로 만들어서
  function handler(state, action) {
    switch (action.type) {
      case type:
        return {
          ...state,
          [key]: loadingState
        };
      case SUCCESS:
        return {
          ...state,
          [key]: success(action.data)
        };
      case ERROR:
        return {
          ...state,
          [key]: error(action.error)
        };
      default:
        return state;
    }
  }

  // 반환합니다
  return handler;
}
```



**UsersContext.js**

```javascript
import React, { createContext, useReducer, useContext } from 'react';
import {
  createAsyncDispatcher,
  createAsyncHandler,
  initialAsyncState
} from './asyncActionUtils';
import * as api from './api'; // api 파일에서 내보낸 모든 함수들을 불러옴

// UsersContext 에서 사용 할 기본 상태
const initialState = {
  users: initialAsyncState,
  user: initialAsyncState
};

const usersHandler = createAsyncHandler('GET_USERS', 'users');
const userHandler = createAsyncHandler('GET_USER', 'user');

// 위에서 만든 객체 / 유틸 함수들을 사용하여 리듀서 작성
function usersReducer(state, action) {
  switch (action.type) {
    case 'GET_USERS':
    case 'GET_USERS_SUCCESS':
    case 'GET_USERS_ERROR':
      return usersHandler(state, action);
    case 'GET_USER':
    case 'GET_USER_SUCCESS':
    case 'GET_USER_ERROR':
      return userHandler(state, action);
    default:
      throw new Error(`Unhanded action type: ${action.type}`);
  }
}

...
```



반복되는 코드를 제거하는 작업으로, 코드가 깔끔해졌습니다. 위와 같이 자주 사용되는 코드는 함수화해서 재사용하면 좋습니다.



+) API 연동을 할 때, Redux 또는 MobX 같은 상태 관리 라이브러리를 함께 사용하기도 합니다. Redux의 이점은 조금 더 체계적으로 비동기 관련 액션을 관리할 수 있고 [redux-saga](https://github.com/redux-saga/redux-saga) 와 [redux-observable](https://github.com/redux-observable/redux-observable) 같은 미들웨어 라이브러리를 사용하여 복잡한 비동기 작업을 쉽게 처리할 수 있다는 것입니다.

나중에 [서버사이드 렌더링](https://asfirstalways.tistory.com/244)을 구현하게 될 시 서버에서 가지고 있는 데이터를 쉽게 보존하여, 그대로 브라우제에게 전달하는 과정이 훨씬 쉬워지게 됩니다. 이는 나중에 알아보도록 합니다.



---

**Reference**

https://react.vlpt.us/integrate-api/05-using-with-context.html