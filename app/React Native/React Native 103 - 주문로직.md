# React Native 103 - 주문로직



장바구니에 있는 아이템은 '바로주문' 버튼을 누르면 '주문목록' 에 담긴다.

장바구니 아이템들을 그대로 주문목록에 담아주면 된다.



리듀서와 액션을 만들어보자.

actions/orders.js

```javascript
export const ADD_ORDER = 'ADD_ORDER';

export const addOrder = (cartItems, totalAmount) => {
  return {
    type: ADD_ORDER,
    orderData: { items: cartItems, amount: totalAmount }
  };
};
```

CartScreen 컴포넌트에서 데이터를 전달받은 액션함수는 `items`, `amount` 를 리듀서로 전달한다.



reducers/orders.js

```javascript
import Order from '../../models/order';
import { ADD_ORDER } from '../actions/orders';

const initialState = {
  orders: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_ORDER:
      const newOrder = new Order(
        new Date().toString(),
        action.orderData.items,
        action.orderData.amount,
        new Date()
      );
      return {
        ...state,
        orders: state.orders.concat(newOrder)
      };
  }
  return state;
};

```

액션 유형이 `ADD_ORDER` 일 경우, 주문 데이터를 객체에 담아서 원래 orders 배열에 concat 함수로 추가시킨다.

로직은 간단하다.



Order 객체를 만들 때 첫번쨰 파라미터는 id이다.

주문 id를 만드는 방법으로 주문한 시각을 키로 설정해주었다.



---

**CartScreen.js**

```jsx
const CartScreen = (props) => {
  ...
  return (
    <View style={styles.screen}>
      ...
      <Button
          color={Colors.accent}
          title="바로주문"
          disabled={cartItems.length === 0}
          onPress={() => {
            dispatch(ordersActions.addOrder(cartItems, cartTotalAmount));
          }}
        />
    </View>
  );
};
```

`바로주문` 버튼을 누르면 `onPress` 함수로 연결되어 액션함수 `addOrder` 를 호출한다. 이 때 카트아이템과 카트총금액을 담아서 보낸다.







