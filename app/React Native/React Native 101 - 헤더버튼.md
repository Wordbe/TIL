# React Native - 헤더버튼





## 헤더버튼

```jsx
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/UI/HeaderButton';
...

const ProductOverviewScreen = (props) => {
  
}

ProductOverviewScreen.navigationOptions = (navData) => {
  return {
    headerTitle: '포도마켓',
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

헤더버튼이란, 네비게이터에 추가하는 버튼으로 사용자가 쉽고 빠르게 특정 페이지로 이동할 때 사용한다.


리액트 네이티브에서 이를 만들기 위해 `react-navigation-header-buttons` 라이브러리를 사용한다.

태그 컴포넌트를 만들어보자.

`<HeaderButtons> ... </HeaderButtons>`

이 안에 원하는 내용을 넣어주면 된다.



headerRight 속성을 사용하면 헤더 오른쪽에 헤더버튼을 생성한다.



---

기존 것을 그대로 사용하지 않고, 내 환경에 맞추어 사용하고자 한다면,

헤더버튼컴포넌트로 내가 만든 custom 헤더버튼 컴포넌트를 사용할 수 있다.


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

아이콘은 `@expo/vector-icons` 라이브러리에서 가져왔다.

뿐만 아니라 아이콘 사이즈도 설정해보았다.





 



