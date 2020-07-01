# Shop App 004



## Delete Items 추가하기

**store/actions/cart.js**

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

장바구니에서 아이템을 지우는 액션함수를 하나 생성합니다. `removeFromCart`



**store/reducers/cart.js**

```javascript
import { ADD_TO_CART, REMOVE_FROM_CART } from '../actions/cart';
import CartItem from '../../models/cart-item';

const initialState = {
  items: {},
  totalAmount: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
          ...
    case REMOVE_FROM_CART:
      const selectedCartItem = state.items[action.pid];
      const currentQty = selectedCartItem.quantity;
      let updatedCartItems;
      if (currentQty > 1) {
        // 지우지 않고, 감소시킨다.
        const updatedCartItem = new CartItem(
          selectedCartItem.quantity - 1,
          selectedCartItem.productPrice,
          selectedCartItem.productTitle,
          selectedCartItem.sum - selectedCartItem.productPrice
        );
        updatedCartItems = { ...state.items, [action.pid]: updatedCartItem };
      } else {
        updatedCartItems = { ...state.items };
        delete updatedCartItems[action.pid];
      }
      return {
        ...state,
        items: updatedCartItems,
        totalAmount: state.totalAmount - selectedCartItem.productPrice
      };
  }

  return state;
};
```

장바구니에 담긴 아이템을 지우는 리듀서를 만들어봅시다.

액션에서 넘긴 인자는 `type`과 `pid`입니다. 이를 잘 기억해봅시다.

* `selectedCartItem` : 현 상태에 있는 아이템을 `pid`키로 가져옵니다.



새로운 `CartItem`을 생성한 후,

1) 기존 아이템이 존재한다면,

```javascript
updatedCartItems = { ...state.items, [action.pid]: updatedCartItem };
```

기존 상태에서 아이템을 복사하고, `action.pid` 키를 가진 상품은 갱신된 `CartItem`으로 수정해줍니다. 

리액트는 모든 객체를 다시 생성해서 해당부분만 수정하는 것이 자연스럽습니다.



2) 그렇지 않다면,

`action.pid`를 가진 상품을 삭제합니다. (`delete`)



---

## Orders에 리덕스 로직 추가하기

product, cart와 마찬가지로 orders (주문을 받는 화면)도 리덕스 로직을 만들어 봅시다.



주문 정보를 담을 새로운 객체 모델을 생성합니다.

**models/order.js**

```javascript
class Order {
  constructor(id, items, totalAmount, date) {
    this.id = id;
    this.items = items;
    this.totalAmount = totalAmount;
    this.date = date;
  }
}

export default Order;
```

id, 아이템, 총수량, 날짜가 담기게 됩니다.



**store/actions/orders.js**

```javascript
export const ADD_ORDER = 'ADD_ORDER';

export const addOrder = (cartItems, totalAmount) => {
  return {
    type: ADD_ORDER,
    orderData: { items: cartItems, amount: totalAmount }
  };
};
```

액션 함수를 만들어주는 것이 익숙해져야 합니다. 객체를 반환하게 되는데, `type`에 액션 함수를 호출명을 담고, `orderData` 에 데이터 정보를 담습니다.



**store/reducers/orders.js**

```javascript
import { ADD_ORDER } from '../actions/orders';
import Order from '../../models/order';

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

새로운 주문을 생성합니다. 반환값으로는 기존 상태에 새로운 주문을 추가하는 로직을 구현합니다. (`concat`)





---

## 주문화면과 SideDrawer 만들기



이제 상태와 액션을 담은 리덕스 로직을 완성했으니, 주문 화면을 만들어봅시다!

**screens/shop/OrdersScreen.js**

```jsx
import React from 'react';
import { FlatList, Text, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/UI/HeaderButton';

const OrdersScreen = (props) => {
  // 리덕스에 저장된 orders 객체를 가져옵니다.
  const orders = useSelector((state) => state.orders.orders);

  return (
    // 주문 목록을 FlatList로 나타냅니다.
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => <Text>{itemData.item.totalAmount}</Text>}
    />
  );
};

OrdersScreen.navigationOptions = (navData) => {
  return {
    headerTitle: 'Your Orders',
    headerLeft: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    )
  };
};

export default OrdersScreen;
```

`navigationOption` 에 데이터를 보내, 네비게이션 화면을 반납해봅시다.

`headerTitle`을 통해 네비게이션의 제목을 정해줍니다.

`headerLeft`에 `HeaderButtons`를 구현합니다. 컴포넌트는 `react-navigation-header-buttons` 라이브러리로 부터 가져오며,

그 안에 커스텀 HeaderButton을 따로 만들겠습니다.

**components/UI/HeaderButton**

```jsx
import React from 'react';
import { Platform } from 'react-native';
import { HeaderButton } from 'react-navigation-header-buttons';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';

const CustomHeaderButton = (props) => {
  return (
    <HeaderButton
      {...props}
      IconComponent={Ionicons}
      iconSize={23}
      color={Platform.OS === 'android' ? 'white' : Colors.primary}
    />
  );
};

export default CustomHeaderButton;
```

`Ionicons`아이오니콘을 받아와서, 사이즈조정, 플랫폼 옵션 조정을 커스터마이징 했습니다.



마지막으로, 네비게이션의 구조를 변형했습니다.

**navigation/ShopNavigator.js**

```jsx
import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ProductsOverviewScreen from '../screens/shop/ProductOverviewScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
import OrdersScreen from '../screens/shop/OrderScreen';
import Colors from '../constants/Colors';

const defaultNavOptions = {
  headerStyle: {
    backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
  },
  headerTitleStyle: {
    fontFamily: 'open-sans-bold'
  },
  headerBackTitleStyle: {
    fontFamily: 'open-sans'
  },
  headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary
};

const ProductsNavigator = createStackNavigator(
  {
    ProductsOverview: ProductsOverviewScreen,
    ProductDetail: ProductDetailScreen,
    Cart: CartScreen
  },
  {
    navigationOptions: {
      drawerIcon: (drawerConfig) => (
        <Ionicons
          name={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
          size={23}
          color={drawerConfig.tintColor}
        />
      )
    },
    defaultNavigationOptions: defaultNavOptions
  }
);

const OrdersNavigator = createStackNavigator(
  {
    Orders: OrdersScreen
  },
  {
    navigationOptions: {
      drawerIcon: (drawerConfig) => (
        <Ionicons
          name={Platform.OS === 'android' ? 'md-list' : 'ios-list'}
          size={23}
          color={drawerConfig.tintColor}
        />
      )
    },
    defaultNavigationOptions: defaultNavOptions
  }
);

const ShopNavigator = createDrawerNavigator(
  {
    Products: ProductsNavigator,
    Orders: OrdersNavigator
  },
  {
    contentOptions: {
      activeTintColor: Colors.primary
    }
  }
);

export default createAppContainer(ShopNavigator);
```

`DrawerNavigator`를 추가하여, 이 곳에 두 종류의 네비게이션을 담았습니다.

각 네비게이션 설정은 각각의 `StackNavigator`에 담았습니다.

