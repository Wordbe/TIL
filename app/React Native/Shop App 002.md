# Shop App 002



## 1 상품 아이템 컴포넌트

저번 시간에는 상품 개요를 보여주는 `ProductOverviewScreen` 화면에서, `FlatList`를 통해 상품 데이터 하나하나를 리스트형태로 보여주었었습니다.

오늘은 위 리스트에 담기는 하나의 상품 컴포넌트를 따로 제작해봅시다.

하나의 양식이 있고, 이것을 반복하는 형식이 있다면, 컴포넌트 객체로 따로 만드는 것이 좋습니다.

`components/shop/ProductItem.js`

```jsx
import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';

import Colors from '../../constants/Colors';

const ProductItem = (props) => {
  return (
    <View style={styles.product}>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: props.image }} />
      </View>
      <View style={styles.details}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.price}>${props.price.toFixed(2)}</Text>
      </View>
      <View style={styles.actions}>
        <Button
          color={Colors.primary}
          title="View Details"
          onPress={props.onViewDetail}
        />
        <Button
          color={Colors.primary}
          title="To Cart"
          onPress={props.onAddToCart}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  product: {
    shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    height: 300,
    margin: 20
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
    height: '15%',
    padding: 10
  },
  title: {
    fontSize: 18,
    marginVertical: 4
  },
  price: {
    fontSize: 14,
    color: '#888'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '25%',
    paddingHorizontal: 20
  }
});

export default ProductItem;
```

props를 통해서 부모 컴포넌트에서 전달하는 데이터를 받을 수 있습니다. 인자로 `image`, `title`, `price`, 리스 `onViewDetail`, `onAddToCart`를 받아옵니다.

이 컴포넌트는 디자인적 요소가 더 중요한 것 같습니다.

* 각각의 컴포넌트 상자를 `shadow` 옵션을 통해, 좀 더 아이템 같은 느낌을 주고 한 번 클릭해 보고 싶은 마음을 주는 것 같습니다
  * 그림자 색깔, 투명도, 고정 위치, 모서리의 둥근 정도, 붕뜬 정도(`elevation`) 등을 조절할 수 있습니다.
* 특정 태그의 속성을 꾸미고 싶다면, 그 태그를 `<View>`로 둘러싸서 `<View style={}>` 형식으로 디자인을 자주 제공합니다.
  * `imageContainer`, `details`, `actions`가 그 예시가 되겠습니다.
  * 특별히 `actions`에서, `react-native` 앱의 `flexDirection` 기본속성은 column이므로 이를 row(가로방향)로 수정해 주었습니다.



`screens/shop/ProductOverviewScreen.js`

```jsx
import React from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';

import ProductItem from '../../components/shop/ProductItem';

const ProductsOverviewScreen = (props) => {
  const products = useSelector((state) => state.products.availableProducts);
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => (
        <ProductItem
          image={itemData.item.imageUrl}
          title={itemData.item.title}
          price={itemData.item.price}
          onViewDetail={() => {}}
          onAddToCart={() => {}}
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

만든 컴포넌트를 임포트해서, 태그형식으로 jsx에 사용할 수 있습니다.



