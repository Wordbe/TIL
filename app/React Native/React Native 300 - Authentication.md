# React Native 300 - Auth, 자동로그인, 자동로그아웃



![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FXyWpM%2FbtqQU0aVmMS%2FLPchVUbQ2AjG6J4mx9daJk%2Fimg.png)



클라이언트(리액트네이티브 모바일앱)가 서버에게 인증 데이터를 보내면, 서버는 세션에서 인증 데이터를 저장하며 클라이언트에게 세션 키를 리턴한다.

무상태(stateless) 를 다루는 웹 애플리케이션은 RESTful API 또는 GraphQL API 를 이용해 세션에서 인증을 관리한다.

하지만 모바일 앱의 경우, 서버가 각 클라이언트의 인증을 관리하지 않기 대문에 다른 방법이 필요하다.

이 때 세션 대신 토큰을 이용한다.



모바일 앱이 인증 데이터를 보내면, 서버는 서버만 아는 개인키(private key)를 만들어 토큰의 형태로 모바일 앱에게 보낸다.

그러면 `Redux storage` 같은 곳에 이 토큰을 저장한다. 앱이 실행되는 동안 메모리에 저장되어 리덕스가 관리한다.

모바일 앱이 서버에서 보호되는 필요한 리소스가 있을 경우, 토크와 함께 요청을 전달하면 서버가 유효한 토큰인지 판단한 후에,

유효한 토큰이면 알맞은 데이터를 반환한다.



여기서 사용할 서버인 firebase 는 토큰을 자동생성해주니, 쉽게 학습해보자.



 

---

## 자동 로그인





 `tokenId` 와 `userId` 를 저장해놓고, 사용자가 접속할 때 사용하면 된다.

리덕스에 저장해놓으면 메모레이 저장되므로 앱이 다시시작될 때 데이터가 날라간다.

따라서 리덕스가 아닌 디바이스에 저장한다.

`AsyncStorage` 를 사용해서 디바이스의 하드드라이브에 데이터를 저장할 수 있다. 



우선 라이브러리를 다운받자.

```console
$ yarn add @react-native-async-storage/async-storage
```





**auth.js**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// tokenId, userId 저장
AsyncStorage.setItem(
    'userData',
    JSON.stringify({
      token: token,
      userId: userId
    })
  );

// tokenId, userId 불러오기
const userData = await AsyncStorage.getItem('userData');
```

위와 같은 형식으로 사용에 따라 알맞게 사용해주면 된다.





---

## 자동 로그아웃



사용자가 로그인한 후에 만료시간이 지나면 자동 로그아웃되는 로직을 만들어보자.



우선 로그아웃을 만들어보자.

로그아웃 액션은 간단하다. 

비동기 저장소에 있는 `userData`를 삭제하고,

리듀서에서는 초깃값을 반환하면 된다.



**actions/auth.js**

```javascript
export const logout = () => {
  AsyncStorage.removeItem('userData');
  return { type: LOGOUT };
};
```

**reducers/auth.js**

```javascript
export default (state = initialState, action) => {
  switch (action.type) {
    ...
    case LOGOUT:
      return initialState;
    ...
  }
};
```



로그아웃 버튼은 `drawerNavigator` (좌측 상단 햄버거 메뉴를 누르면 서랍처럼 나옴) 에 만들었다.

```jsx
const ShopNavigator = createDrawerNavigator(
  ...
  {
   ...

    // 로그아웃
    contentComponent: (props) => {
      const dispatch = useDispatch();

      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
            <DrawerNavigatorItems {...props} />
            <Button
              title="로그아웃"
              onPress={() => {
                dispatch(authActions.logout());
              }}
            />
          </SafeAreaView>
        </View>
      );
    }
  }
);
```



이제 자동으로 로그아웃을 만들어보자.

우선 로그인 함과 동시에 만료시간만큼 `timer` 를 작동시킨다.



```javascript
let timer;

export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem('userData');
  return { type: LOGOUT };
};

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};

const setLogoutTimer = (expirationTime) => {
  return (dispatch) => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};
```



`setLogoutTimer` 액션 생성자는 로그인 시 이 액션을 호출한다. 그러면 비동기함수인 `setTimeout` 이 시간을 세고, 만료시간이 지나면 `logout()` 액션을 디스패치한다.

그리고 로그아웃시에는 `timer`를 초기화 해주는 함수를 호출한다.



그렇다면, 시간이 만료되었을 때 화면을 로그인화면으로 어떻게 되돌릴 것인가?

로그아웃 액션을 호출하면, 리덕스 데이터의 상태가 바뀐다. (모두 초기화 된다.)

이를 `useEffect` 가 감지하여, 인증 토큰이 없다면(초기화) 해당 화면을 호출하면 된다.



조금 더 디테일한 방법으로는,

`useRef`를 통해서 `ShopNavigator` DOM 을 참조하여

인증이 되어있지 않으면( `isAuth = false` ) 참조한 DOM 에서 네비게이션 액션함수를 디스패치한다.

```jsx
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import ShopNavigator from './ShopNavigator';

const NavigationContainer = (props) => {
  const navRef = useRef();
  const isAuth = useSelector((state) => !!state.auth.token);

  useEffect(() => {
    if (!isAuth) {
      navRef.current.dispatch(
        NavigationActions.navigate({ routeName: 'Auth' })
      );
    }
  }, [isAuth]);
  return <ShopNavigator ref={navRef} />;
};

export default NavigationContainer;

```



참고사항으로는, ios는 괜찮지만 안드로이드의 경우 `setTimeout` 함수가 1시간을 넘으면 경고메시지를 보낸다는 것이다.

테스트해보니 한 1분 정도는 괜찮았다.

리액트 네이티브가 해결해주거나, 다른 방법을 찾아보는 게 좋을 것 같다.































