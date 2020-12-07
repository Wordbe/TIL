# React Native 104 - 주문하기



장바구니에 담은 목록을 주문화면으로 가져와 본다.



**models/orders.js**

```javascript
class Order {
  constructor(id, items, totalAmount, date) {
    this.id = id;
    this.items = items;
    this.totalAmount = totalAmount;
    this.date = date;
  }

  get readableDate() {
    return this.date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default Order;

```

주문 데이터를 저장하는 모델이다. 스키마(껍데기) 역할을 한다.

date 는 자바스크립트의 `new Date()` 객체를 받아올 것이다. 

날짜를 스트링으로 받아오기 위해서는 readableData() 같은 get 함수를 만들어서 사용자 포맷에 맞게 반환한다.





---

**reducer/orders.js**

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



리듀서에서는 주문추가(`ADD_ORDER`) 액션이 들어왔을 경우 새로운 데이터를 만들어 concat 하도록 한다. 이 때 id 이자 key로 사용되는 것은 지금 날짜를 스트링으로 변환한 값이다.



이제 클라이언트 단에서 데이터의 상태 관리를 모두 마쳤다.

데이터를 가져다가 프론트에 나타내어 보자.



---

화면의 기본 컴포넌트가 될 주문아이템을 그려보자.

**components/shop/OrderItem.js**

```jsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
...

const OrderItem = (props) => {
  return (
    <View style={styles.orderItem}>
      <View style={styles.summary}>
        <Text style={styles.totalAmount}>
          {props.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
        </Text>
        <Text style={styles.date}>{props.date}</Text>
      </View>
      <Button color={Colors.primary} title="상세보기" />
    </View>
  );
};
...

export default OrderItem;
```

`props` 으로 총금액, 날짜를 받아왔고, 화면에 표현해준다.

`Text` 컴포넌트에 담아주면 된다.

String 데이터의 경우 위처럼 Text 에 담아주어야 한다.



---

**screens/shop/OrdersScreen.js**

```jsx
import React from 'react';
import { View, FlatList, Text, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import OrderItem from '../../components/shop/OrderItem';

const OrdersScreen = (props) => {
  const orders = useSelector((state) => state.orders.orders);
  
  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => (
        <OrderItem
          amount={itemData.item.totalAmount}
          date={itemData.item.readableDate}
        />
      )}
    />
  );
};

...

export default OrdersScreen;

```

`FlatList` 를 이용해서 데이터가 많을 경우, 앞에것만 미리 렌더링 해놓고 나머지는 무한 스크롤이 되게 할 수 있도록 한다.

`OrderItem` 컴포넌트에 데이터를 넣어줄 경우, 날짜 객체를 넣어줄 때 주의한다. 날짜 객체는 스트링으로 바꾸어 주어 리액트 네이티브의 텍스트 컴포넌트 안에 놓도록 한다. 미리 정의해놓은 get 함수를 이용해서  `itemData.item.readableDate` 를 사용하면 되겠다.







