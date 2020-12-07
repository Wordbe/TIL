# React Native 102 - 아이템 삭제로직



장바구니 안에 담긴 아이템을 삭제하는 것을 만들어 보고자 한다.



`cart` 라는 액션과 리듀서를 통해 `REMOVE_FROM_CART` 의 액션이 주어지면 `state` 의 아이템을 제거하는 로직을 세워본다.

진행 순서는 다음과 같다.

* 장바구니에 들어가서 아이템 삭제버튼을 누른다. → `useDispatch` 함수에서 액션함수 `REMOVE_FROM_CART` 를 호출한다.
* 아이템 수량이 1개있으면 아이템을 삭제한다. → `reducer` 에서 해결한다.
* 2개이상 있으면 수량을 하나 줄인다. → `reducer` 에서 해결한다.
* 전체금액(`totalAmount`)도 같이 변경해준다. → `reducer` 에서 해결한다.



---

### CartScreen에서 삭제시 호출함수 설정

```jsx
const dispatch = useDispatch();
...

return (
  ...
  <FlatList
    data={cartItems}
    keyExtractor={(item) => item.productId}
    renderItem={(itemData) => (
      <CartItem
        quantity={itemData.item.quantity}
        title={itemData.item.productTitle}
        amount={itemData.item.sum}
        onRemove={() => {
          dispatch(cartActions.removeFromCart(itemData.item.productId));
        }}
        />
    )}
  />
  ...
  )
```



`onRemove`는 삭제할 때 호출하는 함수로 설정해놓았다. 이 함수 안에서 `useDispatch` 를 통해 `removeFromCart` 라는 액션함수를 호출한다. 이 때 상품아이디를 파라미터로 보내준다.



---

### action

action 함수를 만들어본다.

```javascript
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

export const addToCart = (product) => {
  return { type: ADD_TO_CART, product: product };
};

export const removeFromCart = (productId) => {
  return { type: REMOVE_FROM_CART, pid: productId };
};
```



장바구니에 추가 기능을 하는 `addToCart`  와 더불어 `removeFromCart` 를 추가해주었다.



---

### reducer

```javascript
export default (state = initialState, action) => {
  switch (action.type) {
    ...

    case REMOVE_FROM_CART:
      const selectedCartItem = state.items[action.pid];
      const currentQty = selectedCartItem.quantity;
      let updatedCartItems;
      if (currentQty > 1) {
        // 수량을 줄임. 삭제하지 않음.
        const updatedCartItem = new CartItem(
          currentQty - 1,
          selectedCartItem.productPrice,
          selectedCartItem.productTitle,
          selectedCartItem.sum - selectedCartItem.productPrice
        );
        updatedCartItems = { ...state.items, [action.pid]: updatedCartItem };
      } else {
        // 삭제함.
        updatedCartItems = { ...state.items };
        delete updatedCartItems[action.pid];
      }

      return {
        ...state,
        items: updatedCartItems,
        totalAmount: state.totalAmount - selectedCartItem.productPrice
      };
  }
```



위 처럼 로직을 세워서 삭제 기능을 구현한다.



