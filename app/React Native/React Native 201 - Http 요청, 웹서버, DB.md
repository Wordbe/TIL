# React Native 201 - redux-thunk, Http 요청, 웹서버, DB



1 React Native App

2 Web Server

3 Database

1, 2, 3을 연동해보자.

1에서 바로 3으로 연동하는 것은 보안상 매우 위험한데, 그 중간에 미들웨어 역할을 하는 웹서버를 넣어준다.

여기서는 React Native를 위한 간단한 웹서버가 필요하므로, 이런 기능을 빨리 제공해주는 구글의 Firebase 웹서버를 적극 이용한다.





---

## 데이터 상태 관리



react-redux 에서 데이터의 상태 관리를 할 때, `reducer`,` action` 을 사용했다.

여기서 `action` 함수만 `useDispatch` 를 통해 모든 영역에서 사용할 수 있었다.

하지만, 리덕스에 등록되어 있지 않은 다른 함수도 사용하고 싶을 때가 있다.



이를 해결하기 위해 `redux-thunk`를 사용해보자.

```console
$ yarn add redux-thunk
```



**App.js**

```javascript
import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));
```



`applyMiddleware`와 `ReduxThunk`를 스토어에 담으면 된다.





---

## 데이터를 웹서버로 전송

HTTP 요청을 통해 웹서버에 전송한다.

REST API 규칙을 따른다.



**actions/produtcs.js**

```javascript
...

export const createProduct = (title, imageUrl, price) => {
  return async (dispatch) => {
    // 여기에 비동기 코드를 넣으면 된다.
    const response = await fetch('http://localhost:8080/products.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        imageUrl,
        price
      }).then((response) => {})
    });

    const resData = await response.json();

    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: resData.name,
        title,
        imageUrl,
        price
      }
    });
  };
};
```



`fetch` 함수를 통해 `GET`, `POST`, `PUT` 등의 HTTP 요청을 할 수 있다.

`fetch`는 프로미스 객체를 리턴하고, 이 객체는 미래에 값으로 리졸브(resolve) 되어 사용되거나 에러처리된다.

프로미스 객체는 `.then()` 메소드로 값을 사용할 수 있다.

에러처리는 `.catch()` 메소드로 할 수 있다.



위 코드는, 입력 데이터를 Input으로 받았을 때, 해당 웹서버 DB에 데이터를 저장하도록 만든 것이다.

`POST` 요청을 한다.













