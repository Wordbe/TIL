# Redux Middleware

리덕스 미들웨어는 리덕스의 핵심 기능입니다. Context API 또는 MobX를 사용하는 것과 차별화가 되어 있는 부분입니다.

리덕스 미들웨어를 통해 액션을 디스패치한 후, 리듀서에서 그 액션을 받아와 업데이트 하기 전에 추가 작업을 할 수 있습니다.

액션 → 미들웨어 → 리듀서 → 스토어



**추가할 수 있는 작업**

* 조건에 따라 액션을 무시
* 액션을 콘솔에 출력하거나 서버쪽에 로깅
* 액션 디스패치 후 이를 수정하여 리듀서에게 전달
* 액션 발생 시 이에 기반하여 다른 액션 발생시킴
* 액션 발생 시 특정 JavaScript 함수 실행



리덕스에서 미들웨어를 사용하는 주된 용도는 **비동기 작업 처리** 입니다. 예를 들어 리액트 앱에서 백엔드 API 를 연동해야 한다면 리덕스 미들웨어를 사용하여 처리합니다.

일반적으로 리덕스 미들웨어 라이브러리를 설치합니다. 비동기 작업과 관련된 미들웨어 라이브러리는 [redux-thunk](https://github.com/reduxjs/redux-thunk), [redux-saga](https://github.com/redux-saga/redux-saga), [redux-observable](https://redux-observable.js.org/), [redux-promise-middleware](https://www.npmjs.com/package/redux-promise-middleware) 등이 있습니다.

redux-saga, redux-observable 경우 액션을 모니터링 할 수 있어서, 액션 디스패치 후 원하는 함수를 호출하거나 라우터를 통해 다른 주소로 이동하는 것이 가능합니다.

redux-thunk, redux-saga 이 두 라이브러리가 가장 많이 사용됩니다. 이 두가지로 비동기 작업을 효율적으로 처리하는 방법을 배워봅니다. [redux-logger](https://www.npmjs.com/package/redux-logger) 라이브러리를 사용하여 미들웨어를 적용하는 법도 알아봅니다.



## 1 리덕스 프로젝트









---

**Reference**

https://react.vlpt.us/redux-middleware/

https://react.vlpt.us/redux-middleware/01-prepare.html