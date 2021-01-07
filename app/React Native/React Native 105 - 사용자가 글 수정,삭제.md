# React Native 105 - 사용자가 글 수정, 삭제





userProductsScreenj.js

사용자가 들어가서 상품을 수정하고 삭제하는 화면이다. 왼쪽에 DrawerNavigator로 이동할 수 있도록 만들어 놓았다.







### useCallback

`useCallback` 은 함수를 재사용하고 싶을 때 사용한다.

이 때 함수 안에서 사용하는 props가 있다면 `deps` 배열 안에 꼭 추가 해주어야 한다.

이로써 props 가 가장 최신 상태에 있는 것을 useCallback안의 함수가 사용할 수 있게 된다.



### useEffect

`useEffect` 는 상태가 변화될 때, 특정 함수를 실행시킨다. `useEffect` 의 두 번째 파라미터 `deps`에 함수를 넣을 수 있다.

deps 에 특정 값을 넣게 된다면, 컴포넌트가 처음 마운트 될 때에도 호출되고, 지정한 값이 바뀔 때에도 호출이 된다. 또한 언마운트시에도 호출되고, 값이 바뀌기 직전에도 호출이 된다.



```javascript
const submitHandler = useCallback(() => {
    if (editedProduct) {
      dispatch(productsActions.updateProduct(prodId, title, imageUrl));
    } else {
      dispatch(productsActions.createProduct(title, imageUrl, +price));
    }
    props.navigation.goBack();
  }, [dispatch, prodId, title, imageUrl, price]);

useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);
...
```



위 코드는 마운트 시 (또는 상태변경시, 언마운트시) 네비게이션에서 submit 키에 `submitHandler` 함수를 등록시킨다.

```jsx
const EditProductScreen = (props) => {
  ...
  const submitHandler = useCallback(() => {
    if (editedProduct) {
      dispatch(productsActions.updateProduct(prodId, title, imageUrl));
    } else {
      dispatch(productsActions.createProduct(title, imageUrl, +price));
    }
    props.navigation.goBack();
  }, [dispatch, prodId, title, imageUrl, price]);

  useEffect(() => {
      props.navigation.setParams({ submit: submitHandler });
    }, [submitHandler]);
  ...
}  
  
EditProductScreen.navigationOptions = (navData) => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: navData.navigation.getParam('productId')
      ? '상품 수정'
      : '상품 추가',
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
```



그러면 19번줄의 submitFn 에서 네비게이션 영역에 저장된 'submit', 즉  `submitHandler` 함수를 가져오는데,

29번줄을 보면 헤더버튼을 클릭시 이 함수를 실행시킨다.

그러면 `useCallback` 은 dispatch 함수를 재사용하여 실행시키고, `deps` 안에 있는 값들도 최신 값을 사용한다.

그러면 상태가 바뀌었으니, useEffect는 다시 작동해서, 상태값이 바뀐 `submitHandler` 함수를 다시 사용할 것이다.

그리고 `props.navigation.goBack();` 에 의해서 이전화면으로 돌아간다.





<br />

위와 같이 글을 수정 또는 삭제할 수 있는 로직을 만들어 보았다.









​		