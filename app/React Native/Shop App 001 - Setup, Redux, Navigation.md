# Shop App 001



## 1 계획

1) product overview screen : image, title, cart, detail button

2) cart detail screen

3) product detail screen

4) Navigation : shop, orders, manage products

* orders
* mange products : plus button → edit product screen



---

## 2 생성, Setup

### **Create**

```shell
$ expo init wordmall
```



### **Setup**

```shell
$ npm install --save react-native react-native-screens
$ npm install --save redux react-redux react-navigation react-navigation-header-buttons
$ npm install --save react-navigation-stack @react-native-community/masked-view react-native-safe-area-context
$ npm install --save react-native-gesture-handler react-native-reanimated
```

리덕스, 네비게이션을 사용하는 앱을 만들 것입니다.



### **Initial state & Dummy data**

`models/product.js`

```javascript
class Product {
  constructor(id, ownerId, title, imageUrl, description, price) {
    this.id = id;
    this.ownerId = ownerId;
    this.imageUrl = imageUrl;
    this.title = title;
    this.description = description;
    this.price = price;
  }
}
```

`data/dummy-data.js`

```javascript
import Product from '../models/product';

const PRODUCTS = [
  new Product(
    'p1',
    'u1',
    'Red Shirt',
    'https://cdn.pixabay.com/photo/2016/10/02/22/17/red-t-shirt-1710578_1280.jpg',
    'A red t-shirt, perfect for days with non-red weather.',
    29.99
  ),
  ...
];

export default PRODUCTS;
```



`ProductOverviewScreen` 은 우리의 메인 화면입니다.

이 곳에 띄우게 될 기본 데이터 모델을 만들고, 데이터를 만들어봅니다.



### **Redux Setting**

여러 컴포넌트를 효율적으로 관리할 수 있도록 리덕스 구조를 사용합니다.

`store/actions/products` 생성

`store/reducers/products`

```javascript
import PRODUCTS from '../../data/dummy-data';

const initialState = {
  availableProducts: PRODUCTS,
  userProducts: PRODUCTS.filter((prod) => prod.ownerId === 'u1')
};

export default (state = initialState, action) => {
  return state;
};
```



`App.js`

```jsx
import React from 'react';
import { Text, View } from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import productsReducer from './store/reducers/products';

const rootReducer = combineReducers({
  products: productsReducer
});

const store = createStore(rootReducer);

export default function App() {
  return (
    <Provider store={store}>
      <View>...</View>
    </Provider>
  );
}
```

루트리듀서를 만들고,  products 라는 키에 만들었던 `productsReducer`를 등록합니다.



### 리듀서로 state 불러오기

`screens/shop/ProductsOverviewScreen`

```jsx
import React from 'react';
import { FlatList, Text } from 'react-native';
import { useSelector } from 'react-redux';

const ProductsOverviewScreen = (props) => {
  const products = useSelector((state) => state.products.availableProducts);
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => <Text>{itemData.item.title}</Text>}
    />
  );
};

ProductsOverviewScreen.navigationOptions = {
  headerTitle: 'All Products'
};

export default ProductsOverviewScreen;
```

`useSelector`를 통해 프로젝트에서 전역적으로 루트리듀서에 등록된 `products` 리듀서를 사용할 수 있습니다.

초깃값은 앞에서 다 설정해놓았고, `const products = useSelector((state) => state.products.availableProducts);` 이렇게 필요한 값을 끌어다가 사용할 수 있습니다. 

`FlatList` 에 데이터를 넣고, 키 값을 id로 정해줍니다. 이 값은 꼭 필요하며, `FlatList`의 성능을 높여주기 위함입니다. 아이템을 렌더링하기 위해 `renderItem`에 위와 같은 방식으로 `<Text>` 컴포넌트에 아이템의 제목을 받아 리턴할 수 있습니다.



---

## 3 Navigator Setup



### 네비게이터 생성

 `navigation/ShopNavigator.js`

```javascript
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Platform } from 'react-native';

import ProductsOverviewScreen from '../screens/shop/ProductOverviewScreen';
import Colors from '../constants/Colors';

const ProductsNavigator = createStackNavigator(
  {
    ProductsOverview: ProductsOverviewScreen
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
      },
      headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary
    }
  }
);

export default createAppContainer(ProductsNavigator);
```

스택 네비게이터를 구성합니다. `ProductsOverviewScreen` 을 메인화면으로 보여줍니다.

네비게이션 기본값은, 플랫폼(Android, iOS)에 따라 `headerStyle`의 배경색상과, `headerTintColor`를 다르게 적용해줍니다.

마지막으로, `createAppContainer`에 담아서 스택 네비게이터를 내보냅니다.



`constants/Colors.js`

```javascript
export default {
  primary: '#C2185B',
  accent: '#FFC107'
};
```

자주 사용할 색상을 설정합니다.



### 네비게이터 등록

App.js 에 네비게이터를 등록해줍시다.

`App.js`

```jsx
import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import productsReducer from './store/reducers/products';
import ShopNavigator from './navigation/ShopNavigator';

const rootReducer = combineReducers({
  products: productsReducer
});

const store = createStore(rootReducer);

export default function App() {
  return (
    <Provider store={store}>
      <ShopNavigator />
    </Provider>
  );
}
```



---

Expo 앱을 통해, 만든 환경을 띄워보려고 했는데 라이브러리 의존성 에러가 났다.

부족한 라이브러리를 설치해주니, 잘 작동한다.

```shell
$ expo install react-native-screens react-native-reanimated react-native-safe-area-context @react-native-community/masked-view
```