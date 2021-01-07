# React Native 202 - 데이터 가져오기 (fetch)





앱이 실행되자마자 서버에 있는 DB데이터를 가져와서 조회하려고 한다.

예를 들면, 아마존 홈페이지를 누르고 쇼핑탭에가면 쇼핑 상품들이 쫙 뜨는 것을 구현하고 싶다.

데이터는 메모리에 있는 것이 아니라 서버(server-side)에 있기 때문에, HTTP 의 `GET` 요청을 통해 데이터를 받는다.



---



리덕스에서 프로젝트의 액션을 보자.



`redux` 는 기본적으로 액션 객체를 디스패치한다. (`{type: ACTION_TYPE }` 과 같은 액션 객체)

따라서 액션 생성자는 아래와 같이 파라미터를 받아와서 바로 액션 객체를 리턴해주는 함수였다.

```javascript
export const fetchProducts = (products) => {
  return { type: SET_PRODUCTS, products: products };
}
```



하지만 비동기 작업에서는 액션 객체를 반환할 때, 파라미터가 조회될 때까지 기다리는 작업 이후에 반환하길 원한다.

또는 여러 데이터 상태에 따라서 액션 객체를 반환할지 말지도 결정해주고 싶다.

`redux-thunk` 를 통해 액션 객체 반환을 한 번 더 감싸서 수정할 수 있다. (비동기 작업에서는 이를 많이 활용한다.)

thunk에서는 `dispatch`, `getState` 인자를 받을 수 있어서, 액션 함수 안에서 이를 활용하여 비동기작업을 만든다.



promise 로 할 수도 있지만, `async`, `await` 를 이용해보자.



---

### redux-thunk



`fetchProducts` 액션을 정의한다.



**actions/products.js**

```javascript
export const fetchProducts = () => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        'https://example.com/products.json'
      );

      if (!response.ok) {
        // ok = '200'
        throw new Error('무언가가 잘못되었습니다.');
      }

      const resData = await response.json();
      const loadedProducts = [];
      for (const key in resData) {
        loadedProducts.push(
          new Product(
            key,
            'u1',
            resData[key].title,
            resData[key].imageUrl,
            resData[key].price
          )
        );
      }
      dispatch({ type: SET_PRODUCTS, products: loadedProducts });
    } catch (err) {
      // 오류 발생시 고객 분석 서버로 전송한다.
      throw err;
    }
  };
};
```

`dispatch`  파라미터를 받아서, 액션객체를 바로 디스패치 할 수 있다.

이 때, javascript fetch 함수를 사용하여 불러올 db 서버를 설정하고, 다 불려오면 await 에서 응답객체를 받는다.

그리고 이를 디스패치 할 수 있도록 설정해놓았다.

`async`, `await` 에서 응답, 에러, 로딩중 등을 구현할 때는 위와 같이 try, catch 문을 사용하면 된다.



---

추가로 업데이트도 살펴보자.

```javascript
export const updateProduct = (id, title, imageUrl) => {
  return async (dispatch) => {
    const response = await fetch(
      `https://example.com/products/${id}.json`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          imageUrl
        })
      }
    );

    if (!response.ok) {
      throw new Error('무언가가 잘못되었습니다!');
    }

    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        imageUrl
      }
    });
  };
```



HTTP 요청 중

`PUT` 은 데이터를 덮어씌우며 업데이트한다.

`PATCH` 는 필요한 부분만 대체하면서 업데이트한다.



특정 id 일 때만 상품을 변경하도록 설정해놓았다.

