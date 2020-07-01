# Shop App - 003





## 상품들을 장바구니에 추가하기

새로운 리듀서와, 액션함수를 생성합니다.

먼저 액션을 만들어봅시다.

**store/actions/cart.js**

```javascript
export const ADD_TO_CART = 'ADD_TO_CART';

export const addToCart = (product) => {
  return { type: ADD_TO_CART, product: product };
};
```

나중에 `dispatch` 함수에서 액션을 호출할 때 사용하게 될 `ADD_TO_CART` 변수를 정의하고, 이를 `addToCart`라는 액션함수에 type으로 넣어줍니다. 이 액션함수의 인풋은 상품인 product입니다.





**store/reducer/cart.js**

```javascript
import { ADD_TO_CART } from '../actions/cart';
import CartItem from '../../models/cart-item';

const initialState = {
  items: {},
  totalAmount: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const addedProduct = action.product;
      const prodPrice = addedProduct.price;
      const prodTitle = addedProduct.title;

      let updatedOrNewCartItem;

      // 이미 상품이 담겨있는 경우
      if (state.items[addedProduct.id]) {
        updatedOrNewCartItem = new CartItem(
          state.items[addedProduct.id].quantity + 1,
          prodPrice,
          prodTitle,
          state.items[addedProduct.id].sum + prodPrice
        );
        return {
          ...state,
          items: { ...state.items, [addedProduct.id]: updatedCartItem },
          totalAmount: state.totalAmount + prodPrice
        };
      } else {
        updatedOrNewCartItem = new CartItem(1, prodPrice, prodTitle, prodPrice);
        return {
          ...state,
          items: { ...state.items, [addedProduct]: updatedOrNewCartItem },
          totalAmount: state.totalAmount + prodPrice
        };
      }
  }

  return state;
};
```

리듀서는 항상 초기상태(`initialState`) 를 정의해주고,

액션 조건에 따라 상태를 업데이트 하는 코드를 작성하면 됩니다.

상품이 새로 닮길 때마다 (ADD_TO_CART) 기존 장바구니에 새 아이템을 추가하는 작업을 합니다.



이제 컴포넌트에 가서, 만든 리듀서를 사용해봅시다.

```jsx
import React from 'react';
import { FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import ProductItem from '../../components/shop/ProductItem';
import * as cartActions from '../../store/actions/cart';

const ProductsOverviewScreen = (props) => {
  const products = useSelector((state) => state.products.availableProducts);
  const dispatch = useDispatch();
  return (
    <FlatList
      ...
      renderItem={(itemData) => (
        <ProductItem
          ...
          onAddToCart={() => {
            dispatch(cartActions.addToCart(itemData.item));
          }}
        />
      )}
    />
  );
};

ProductsOverviewScreen.navigationOptions = {
  headerTitle: 'All Products'
};

export default ProductsOverviewScreen;
```

`useDispatch` 함수를 react-redux로 부터 불러와서, dispatch 함수를 사용합니다. 



또한 만든 리듀서를 전역적으로 사용하기 위해 루트 리듀서에 이를 입력해주어야 하겠죠.

**App.js**

```jsx
import React, { useState } from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';

import productsReducer from './store/reducers/products';
import cartReducer from './store/reducers/cart';
import ShopNavigator from './navigation/ShopNavigator';

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer
});

const store = createStore(rootReducer);

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf')
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => {
          setFontLoaded(true);
        }}
      />
    );
  }
  return (
    <Provider store={store}>
      <ShopNavigator />
    </Provider>
  );
}
```



또한, 폰트를 불러오지 않았다면, 앱로딩 중 폰트가 비동기로 로드되도록 코드를 구현합니다.

```shell
$ npm install --save expo-font
```



---

## 장바구니 상품 만들기

장바구니 스크린 화면을 만듭니다.

**screens/shop/CartScreen.js**

```jsx
import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import Colors from '../../constants/Colors';

const CartScreen = (props) => {
  const cartTotalAmount = useSelector((state) => state.cart.totalAmount);
  const cartItems = useSelector((state) => {
    const transformedCartItems = [];
    for (const key in state.cart.items) {
      transformedCartItems.push({
        productId: key,
        productTitle: state.cart.items[key].productTitle,
        productPrice: state.cart.items[key].productPrice,
        quantity: state.cart.items[key].quantity,
        sum: state.cart.items[key].sum
      });
    }
    return transformedCartItems;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Total:{' '}
          <Text style={styles.amount}>${cartTotalAmount.toFixed(2)}</Text>
        </Text>
        <Button
          color={Colors.accent}
          title="Order Now"
          disabled={cartItems.length === 0}
        />
      </View>
      <View>
        <Text>CART ITEMS</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    margin: 20
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  summaryText: {
    fontFamily: 'open-sans-bold',
    fontSize: 18
  },
  amount: {
    color: Colors.primary
  }
});

export default CartScreen;
```

`useSelector`를 통해 리덕스 스토어에 저장된 cart 리듀서를 가져옵니다.

* `Button` 컴포넌트의 `disabled` 속성은 조건에 따라 버튼을 비활성화 할 수 있습니다. 여기서는 장바구니 아이템이 없을 때 주문을 하지 못하도록 비활성화합니다.





한편, 메인페이지에는 네비게이션에서 `headerRight`에 장바구니 아이콘을 추가합니다.

**screens/shop/ProductOverviewScreen.js**

```jsx
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import HeaderButton from '../../components/UI/HeaderButton';
...
ProductsOverviewScreen.navigationOptions = (navData) => {
  return {
    headerTitle: 'All Products',
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Cart"
          iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
          onPress={() => {
            navData.navigation.navigate('Cart');
          }}
        />
      </HeaderButtons>
    )
  };
};
```



헤더 버튼은 크기 조절, 플랫폼별로 종류 제어를 위해 커스텀 `HeaderButton`을 만듭니다.

**components/UI/HeaderButton.js** 

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



---

## CartItem 컴포넌트 생성



장바구니 화면에서, 장바구니 상품의 골격인 CartItem Component입니다.

```javascript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartItem = (props) => {
  return (
    <View style={styles.cartItem}>
      <TexT style={styles.itemData}>
        <Text style={styles.quantity}>{props.quantity} </Text>
        <Text style={styles.mainText}>{props.title}</Text>
      </TexT>
      <View style={styles.itemData}>
        <Text style={styles.mainText}>${props.amount.toFixed(2)}</Text>
        <TouchableOpacity onPress={props.onRemove} style={styles.deleteButton}>
          <Ionicons
            name={Platform.OS === 'android' ? 'md-trash' : 'ios-trash'}
            size={23}
            color="red"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    padding: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20
  },
  itemData: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantity: {
    fontFamily: 'open-sans',
    color: '#888',
    fontSize: 16
  },
  mainText: {
    fontFamily: 'open-sans-bold',
    fontSize: 16
  },
  deleteButton: {
    marginLeft: 20
  }
});

export default CartItem;
```



CartScreen.js 에서 FlatList를 생성해서 위 CartItem을 넣어봅시다.

```jsx
<FlatList
    data={cartItems}
    keyExtractor={(item) => item.productId}
    renderItem={(itemData) => (
        <CartItem
            quantity={itemData.item.quantity}
            title={itemData.item.propductTitle}
            amount={itemData.item.sum}
            onRemove={() => {}}
            />
    )}
/>
```

