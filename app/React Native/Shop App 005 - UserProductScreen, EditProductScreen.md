# Shop App 005



## OrderItem 컴포넌트 생성, 스타일링

**components/shop/orderItem.js**

```jsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import CartItem from './CartItem';
import Colors from '../../constants/Colors';

const OrderItem = (props) => {
  return (
    <View style={styles.orderItem}>
      <View style={styles.summary}>
        <Text style={styles.totalAmount}>${props.amount.toFixed(2)}</Text>
        <Text style={styles.date}>{props.date}</Text>
      </View>
      <Button color={Colors.primary} title="Show Details" />
    </View>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    margin: 20,
    padding: 10,
    alignItems: 'center'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15
  },
  totalAmount: {
    fontFamily: 'open-sans-bold',
    fontSize: 16
  },
  date: {
    fontFamily: 'open-sans',
    fontSize: 16,
    color: '#888'
  }
});

export default OrderItem;
```



**models/order.js**

```javascript
class Order {
  constructor(id, items, totalAmount, date) {
    this.id = id;
    this.items = items;
    this.totalAmount = totalAmount;
    this.date = date;
  }

  get readableDate() {
    return this.date.toLocaleDateString('en-EN', {
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

`toLocaleDateString` 은 날짜를 입맛에 맞게 조정할 수 있습니다. 하지만, iOS에서는 이를 자동으로 보여주는 반면, 안드로이드 화면에서는 지원을 하지 않는데요.



Android에서도 이를 적용하기 위해 `moment`를 설치합니다.

```shell
$ yarn add moment
```

 

그 후 아래와 같이 수정합니다.

```javascript
import * as moment from 'moment';

class Order {
  ...

  get readableDate() {
    // return this.date.toLocaleDateString('en-EN', {
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric',
    //   hour: '2-digit',
    //   minute: '2-digit'
    // });
    return moment(this.date).format('MMMM Do YYYY, hh:mm');
  }
}

export default Order;
```



---

## Show Details 버튼 로직



`useState`를 이용해서, 토글 버튼을 만들어봅시다.

**components/shop/OrderItem.js**

```jsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import CartItem from './CartItem';
import Colors from '../../constants/Colors';

const OrderItem = (props) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <View style={styles.orderItem}>
      ...
      <Button
        color={Colors.primary}
        title={showDetails ? 'Hide Details' : 'Show Details'}
        onPress={() => {
          setShowDetails((prevState) => !prevState);
        }}
      />
      {showDetails && (
        <View style={styles.detailItems}>
          {props.items.map((cartItem) => (
            <CartItem
              key={cartItem.productId}
              quantity={cartItem.quantity}
              amount={cartItem.sum}
              title={cartItem.productTitle}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ...
});

export default OrderItem;
```

`showDetails` 를 처음에는 false로 설정해놓은 후, 버튼을 누를  때마다(`onPress`) `setShowDetails`를 통해 false는 true로, true는 false로 바꿉니다.

여기서 토글 버튼을 누를 때마다 아래 View 컴포넌트가 보이게 하려면 `{showDetails && <View>}` 형식으로 써주면 됩니다.





---

## 사용자 상품 화면 만들기

### screens/user/UserProductScreen.js

```jsx
import React from 'react';
import { FlatList, Button, Platform, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import HeaderButton from '../../components/UI/HeaderButton';
import ProductItem from '../../components/shop/ProductItem';
import Colors from '../../constants/Colors';
import * as productsActions from '../../store/actions/products';

const UserProductsScreen = (props) => {
  const userProducts = useSelector((state) => state.products.userProducts);
  const dispatch = useDispatch();

  const editProductHandler = (id) => {
    props.navigation.navigate('EditProduct', { productId: id });
  };

  const deleteHandler = (id) => {
    Alert.alert('Are you sure?', 'Do you really want to delete this item?', [
      { text: 'No', style: 'default' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          dispatch(productsActions.deleteProduct(id));
        }
      }
    ]);
  };

  return (
    <FlatList
      data={userProducts}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => (
        <ProductItem
          image={itemData.item.imageUrl}
          title={itemData.item.title}
          price={itemData.item.price}
          onSelect={() => {
            editProductHandler(itemData.item.id);
          }}
        >
          <Button
            color={Colors.primary}
            title="Edit"
            onPress={() => {
              editProductHandler(itemData.item.id);
            }}
          />
          <Button
            color={Colors.primary}
            title="Delete"
            onPress={deleteHandler.bind(this, itemData.item.id)}
          />
        </ProductItem>
      )}
    />
  );
};

UserProductsScreen.navigationOptions = (navData) => {
  return {
    headerTitle: 'Your Products',
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
    ),
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Add"
          iconName={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
          onPress={() => {
            navData.navigation.navigate('EditProduct');
          }}
        />
      </HeaderButtons>
    )
  };
};

export default UserProductsScreen;
```

상품을 관리하는 화면을 만들어봅시다. 일종의 관리자 페이지입니다.

핵심 사항을 이야기해보면 다음과 같습니다.

* redux의 `useSelector`를 통해, 미리 등록해 놓은 userProducts 리듀서를 가져옵니다. 

  * [store/reducers/products.js](#store/reducers/products.js)
  * [store/actions/products.js](#store/actions/products.js)

* `FlatList` 로 가져온 `userProducts`를 화면에 나타냅니다. 

* 화면에 나타낼 때 `renderItem`에서 [`ProductItem`](#components/shop/ProductItem.js) 컴포넌트를 따로 만들어 이를 반환시켰습니다.(jsx 스타일)

* `ProductItem`에서는 상품 컴포넌트 혹은 Edit 버튼을 누르면 `editProductHandler` 함수가 호출되면서 `EditProduct`라는 네비게이션으로 이동하게 됩니다.

  Editproduct 네비게이터는 StackNavigator로써, [`EditProductScreen.js` ](#screens/user/EditProductScreen.js)화면을 보여줍니다.

* 또한 Delete 버튼을 누르면, `deleteHandler` 함수에 `itemData.item.id`를 파라미터로 넣어서 함수를 호출합니다.

  ```jsx
  <Button 
  	...
      onPress={deleteHandler.bind(this, itemData.item.id)}
  />
  ```

  는 아래와 같이 풀어서 쓸 수 있습니다.

  ```jsx
  <Button 
  	...
      onPress={() => {
          deleteHandler(itemData.item.id)
      }}
  />
  ```

  



### store/reducers/products.js

```javascript
import PRODUCTS from '../../data/dummy-data';
import {
  DELETE_PRODUCT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT
} from '../actions/products';
import Product from '../../models/product';

const initialState = {
  availableProducts: PRODUCTS,
  userProducts: PRODUCTS.filter((prod) => prod.ownerId === 'u1')
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PRODUCT:
      const newProduct = new Product(
        new Date().toString(),
        'u1',
        action.productData.title,
        action.productData.imageUrl,
        action.productData.description,
        action.productData.price
      );
      return {
        ...state,
        availableProducts: state.availableProducts.concat(newProduct),
        userProducts: state.userProducts.concat(newProduct)
      };
    case UPDATE_PRODUCT:
      const productIndex = state.userProducts.findIndex(
        (prod) => prod.id === action.pid
      );
      const updatedProduct = new Product(
        action.pid,
        state.userProducts[productIndex].ownerId,
        action.productData.title,
        action.productData.imageUrl,
        action.productData.description,
        state.userProducts[productIndex].price
      );
      const updatedUserProducts = [...state.userProducts];
      updatedUserProducts[productIndex] = updatedProduct;
      const availableProductIndex = state.availableProducts.findIndex(
        (prod) => prod.id === action.pid
      );
      const updatedAvailableProducts = [...state.availableProducts];
      updatedAvailableProducts[availableProductIndex] = updatedProduct;
      return {
        ...state,
        availableProducts: updatedAvailableProducts,
        userProducts: updatedUserProducts
      };
    case DELETE_PRODUCT:
      return {
        ...state,
        userProducts: state.userProducts.filter(
          (product) => product.id !== action.pid
        ),
        userProducts: state.availableProducts.filter(
          (product) => product.id !== action.pid
        )
      };
  }
  return state;
};
```

리듀서는 위와 같습니다. CREATE, UPDATE, DELETE 가 있습니다.



### store/actions/products.js

```javascript
export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';

export const deleteProduct = (productId) => {
  return { type: DELETE_PRODUCT, pid: productId };
};

export const createProduct = (title, description, imageUrl, price) => {
  return {
    type: CREATE_PRODUCT,
    productData: {
      title,
      description,
      imageUrl,
      price
    }
  };
};

export const updateProduct = (id, title, description, imageUrl, price) => {
  return {
    type: UPDATE_PRODUCT,
    pid: id,
    productData: {
      title,
      description,
      imageUrl,
      price
    }
  };
};
```

액션함수는 위와 같이 인풋과 아웃풋을 간단히 명시해주면 됩니다. 인풋은 화면에서 호출할 때 넣을 것이고, 아웃풋은 리듀서 함수에게 전달됩니다.



### components/shop/ProductItem.js

```javascript
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform
} from 'react-native';

import Card from '../UI/Card';

const ProductItem = (props) => {
  let TouchableCmp = TouchableOpacity;
  if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableCmp = TouchableNativeFeedback;
  }
  return (
    <Card style={styles.product}>
      <View style={styles.touchable}>
        <TouchableCmp onPress={props.onSelect} userForeground>
          <View>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={{ uri: props.image }} />
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>{props.title}</Text>
              <Text style={styles.price}>${props.price.toFixed(2)}</Text>
            </View>
            <View style={styles.actions}>{props.children}</View>
          </View>
        </TouchableCmp>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  product: {
    height: 300,
    margin: 20
  },
  touchable: {
    borderRadius: 10,
    overflow: 'hidden'
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '60%'
  },
  details: {
    alignItems: 'center',
    height: '17%',
    padding: 10
  },
  title: {
    fontFamily: 'open-sans-bold',
    fontSize: 18,
    marginVertical: 4
  },
  price: {
    fontFamily: 'open-sans',
    fontSize: 14,
    color: '#888'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '23%',
    paddingHorizontal: 20
  }
});

export default ProductItem;
```

ProductItem 컴포넌트의 기본 짜임새를 알아두면 좋을 것 같습니다.



### screens/user/EditProductScreen.js

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Platform
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productActions from '../../store/actions/products';

const EditProductScreen = (props) => {
  const prodId = props.navigation.getParam('productId');
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((prod) => prod.id === prodId)
  );
  const dispatch = useDispatch();

  const [title, setTitle] = useState(editedProduct ? editedProduct.title : '');
  const [imageUrl, setImageUrl] = useState(
    editedProduct ? editedProduct.imageUrl : ''
  );
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState(
    editedProduct ? editedProduct.description : ''
  );

  const submitHandler = useCallback(() => {
    if (editedProduct) {
      dispatch(
        productActions.updateProduct(prodId, title, description, imageUrl)
      );
    } else {
      dispatch(
        productActions.createProduct(title, description, imageUrl, price)
      );
    }
    props.navigation.goBack();
  }, [dispatch, prodId, title, description, imageUrl, price]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  return (
    <ScrollView>
      <View style={styles.form}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={StyleSheet.input}
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
        </View>
        <View style={styles.formControl}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={StyleSheet.input}
            value={imageUrl}
            onChangeText={(text) => setImageUrl(text)}
          />
        </View>
        {editedProduct ? null : (
          <View style={styles.formControl}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={StyleSheet.input}
              value={price}
              onChangeText={(text) => setPrice(text)}
            />
          </View>
        )}
        <View style={styles.formControl}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={StyleSheet.input}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
        </View>
      </View>
    </ScrollView>
  );
};

EditProductScreen.navigationOptions = (navData) => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: navData.navigation.getParam('productId')
      ? 'Edit Prduct'
      : 'Add Product',
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFn}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20
  },
  formControl: {
    width: '100%'
  },
  label: {
    fontFamily: 'open-sans-bold',
    marginVertical: 8
  },
  input: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1
  }
});

export default EditProductScreen;
```

* 네비게이션으로부터 파라미터 productId를 받아옵니다. 이 파라미터는 네비게이터를 호출할 때 인풋으로 같이 넣어주었었습니다.

  또한 수정된상품 변수를 만들기 위해 리덕스로 `userProducts`를 받아옵니다. 이 때 `find()`함수를 통해 prodId와 일치하는 상품만 가져옵니다.

* `useState`를 통해 `<TextInput>`에서 사용자로부터 받아올 `title`, `imageUrl`, `price`, `description`의 상태를 제어합니다.

* `submitHandler` 함수는 수정할 상품이 이미 `userProducts`에 있다면, `updateProduct`를 하고, 그렇지 않다면 `createProduct`를 하는 함수입니다. react의 `useCallback` 함수를 통해 리렌더링할 때 불필요하게 상태를 업데이트 하지 않도록 최적화합니다.

* `useEffect`를 통해 화면이 처음 렌더링 될 때, `submitHandler`를 파라미터로 세팅하여 네비게이션이 이를 `submit`이라는 키로 받을 수 있도록 합니다.

