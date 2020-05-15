# React Native 005 - Navigation with React Navigation



### Font 불러오기

```shell
$ expo install expo-font
```



font 가 로딩되면 화면이 렌더링 되도록 구성해봅시다.

폰트가 담긴 ttf 파일을 `assets/fonts` 에 넣어주고, 폰트를 불러옵니다.

**App.js**

```jsx
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

function fetchFonts() {
  Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf')
  });
}

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontLoaded(true)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
    </View>
  );
}
```



---

## Navigation

* 웹에서는 링크에서 `React Router`를 통해 컴포넌트로 이동합니다.
* Native App 에서는 url은 존재하지 않으며, 이벤트가 발생할 때 화면이 전환됩니다.
  * Tabs, Stack 을 누르면 컴포넌트로 이동
  * `react-navigation` 라이브러리 필요

`react-navigation` 설치

```shell
$ npm install react-navigation
(또는 $ yarn add react-navigation)

# 의존성 추가
$ expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

추가적인 navigator도 설치해줍니다.

```shell
yarn add react-navigation-stack react-navigation-tabs react-navigation-drawer
```



## StackNavigator

각각의 컴포넌트를 만든 후, StackNavigator로 이를 뭉쳐봅시다.

```react
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryMealsScreen from '../screens/CategoryMealsScreen';
import MealDetailScreen from '../screens/MealDetailScreen';

const MealsNavigator = createStackNavigator({
  Categories: CategoriesScreen,
  CategoryMeals: {
    screen: CategoryMealsScreen
  },
  MealDetail: MealDetailScreen
});

export default createAppContainer(MealsNavigator);
```



## Navigating

navigation에서 버튼을 만들어서 다른 곳으로 이동하게 만드는 예제입니다.  navigate 메소드에 `routeName`에 네비게이터에 등록해 놓은 컴포넌트를 스트링으로 적어줍니다.

```react
<View style={styles.screen}>
      <Text>The Categories Screen!</Text>
      <Button
        title="Go to Meals!"
        onPress={() => {
          props.navigation.navigate({ routeName: 'CategoryMeals' });
        }}
      />
    </View>
```



## Push, Pop, Replace

```react
<Button
    title="Go to Details"
    onPress={() => {
        props.navigation.navigate({
            routeName: 'MealDetail'
        });
    }}
/>
```

`StackNavigator`에서는 위의 코드와 같은 기능을 하도록 `props.navigation.push('Mealdetail')`을 사용할 수 있습니다.



```react
<Button title="Go Back" onPress={() => {
    props.navigation.goBack();
}} />
```

goBack() 을 통해서 이전화면으로 돌아갈 수 있습니다  위와 같은 기능을 하는 메소드로 `props.navigation.pop()` 이 있습니다. 하지만 이는 `StackNavigator `에서만 사용할 수 있습니다.



```react
<Button title="Go Back to Categories" onPress={() => {
    props.navigation.popToTop();
}} />
```

`popToTop()`을 통해 루트 컴포넌트로 이동이 가능합니다.



`props.navigation.replace()`를 사용하면, 스택에 이전 화면이 쌓이지 않고 다른 화면으로 넘어갈 수 있습니다. 따라서 이전 화면으로 돌아가는 기능이 구현되지 않습니다.



---

## Grid 카테고리

```react
function renderGridItem(itemData) {
  return (
    <View style={styles.gridItem}>
      <Text>{itemData.item.title}</Text>
    </View>
  );
}

function CategoriesScreen(props) {
  return (
    <FlatList
      keyExtractor={(item, index) => item.id}
      data={CATEGORIES}
      renderItem={renderGridItem}
      numColumns={2}
    />
  );
}
```

스크롤이 가능한 컴포넌트를 만들되, 현재 보여지는 부분만 렌더링하여 효율성을 높이기 위해 `FlatList`를 이용합니다. 데이터는 미리 `CATEGORIES` 라는 객체 배열을 만들었으며, 객체의 키는 id, title, color가 있습니다.

각 아이템을 어떻게 만들지 구성하는 `renderGridItem` 함수를 생성하여 FlatList의 인자로 넣어줍니다. `numColumns`로 칼럼 수를 정할 수 있습니다.



## 네이게이션 옵션에서 Header 설정

```react
function CategoriesScreen(props) {
  const renderGridItem = (itemData) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => {
          props.navigation.navigate({ routeName: 'CategoryMeals' });
        }}
      >
        <View>
          <Text>{itemData.item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      keyExtractor={(item, index) => item.id}
      data={CATEGORIES}
      renderItem={renderGridItem}
      numColumns={2}
    />
  );
}

CategoriesScreen.navigationOptions = {
  headerTitle: 'Meal Catgories',
  headerStyle: {
    backgroundColor: Platform.OS === 'android' ? Colors.primaryColor : ''
  },
  headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primaryColor
};
```

리액트 컴포넌트는 자바 스크립트 입장에서는 함수, 즉 객체입니다. CategoriesScreen 객체는 `navigationOptions` 멤버변수를 가집니다. `headerTitle`, `headerStyle`, `headerTintColor` (헤더 글자 색) 등을 설정할 수 있습니다.



## Navigation에서 파라미터를 넘기고 받아오는 방법

```react
<TouchableOpacity
    style={styles.gridItem}
    onPress={() => {
        props.navigation.navigate({
            routeName: 'CategoryMeals',
            params: {
                categoryId: itemData.item.id
            }
        });
    }}
>
```

위 컴포넌트는 파라미터를 넘기고 있습니다. `props.navigation.navigate()` 안에 객체의 키로 `params` 의 value안에 넘기고 싶은 파라미터를 입력할 수있습니다.

```react
function CategoryMealScreen(props) {
  const catId = props.navigation.getParam('categoryId');
  const selectedCategory = CATEGORIES.find((cat) => cat.id === catId);

  return (
    <View>
      <Text>{selectedCategory.title}</Text>
    </View>
  );
}
```

파라미터를 받아오는 컴포넌트 입니다. `props.navigation.getParam()` 을 통해 전달받은 id 파라미터를 읽어들이고,  id와 일치하는 객체를 받아 멤버변수 title을 출력하고 있습니다.



## 동적 네비게이션 옵션(Dynamic NavigationOptions)

받아온 파라미터를 통해 동적으로 헤더 등의 네비게이션 설정 값을 설정할 수 있습니다.

```react
CategoryMealScreen.navigationOptions = (navigationData) => {
  const catId = navigationData.navigation.getParam('categoryId');
  const selectedCategory = CATEGORIES.find((cat) => cat.id === catId);

  return {
    headerTitle: selectedCategory.title,
    headerStyle: {
      backgroundColor: Platform.OS === 'android' ? Colors.primaryColor : ''
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primaryColor
  };
};
```

navigationOptions 객체에 함수를 넣고, 객체를 반환시키면 됩니다.



---

## Default Navigation Option 설정

기본 네비게이션 옵션 설정은  반복되는 코드를 줄이는 데 많은 도움이 됩니다.

Navigator 에서 설정하면 됩니다.

**MealsNavigator.js**

```react
const MealsNavigator = createStackNavigator(
  {
    Categories: {
      screen: CategoriesScreen,
      navigationOptions: {
        headerTitle: 'Meal Categories'
      }
    },
    CategoryMeals: {
      screen: CategoryMealsScreen
    },
    MealDetail: MealDetailScreen
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Platform.OS === 'android' ? Colors.primaryColor : ''
      },
      headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primaryColor
    }
  }
);

export default createAppContainer(MealsNavigator);
```

* `defaultNavigationOptions` 는 기본 네비게이터 설정값을 정할 수 있습니다. 헤더 스타일의 속성이 자식 컴포넌트에서도 있어서 중복된다면, CSS 처럼 자식 컴포넌트에서 설정한 것이 더 우선순위가 됩니다.



* `mode: ‘modal’` : 스크린을 넘기는 방식을 modal 형식으로 바꿉니다. 즉, 아래에서 위로 슬라이드 되는 방식으로 뷰가 넘어갑니다. 안드로이는 기본값이 이것이라 이렇게 설정해도 변함이없지만, iOS의 경우 원래는 좌우 슬라이드에서 아래 위로 슬라이가 됩니다.
* `initialRouteName: ‘Categories’` : 초기에 렌더링 되는 뷰를 설정합니다.

```shell
$ npm install --save react-native-screens
또는
$ yarn add react-native-screens
```

App.js  에서 다음 코드를 입력해주면, screen 설정을 더 효율적으로 할 수 있습니다. (화면이 다른 점은 없습니다.) 그래서 이 코드를 넣는 것을 추천합니다.

```react
import { useScreens } from 'react-native-screens';

useScreens();
```



## 스타일링, 리팩토링

```react
function CategoryGridTile(props) {
  let TouchableCmp = TouchableOpacity;

  if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableCmp = TouchableNativeFeedback;
  }
  return (
    <View style={styles.gridItem}>
      <TouchableCmp style={{ flex: 1 }} onPress={props.onSelect}>
        <View
          style={{ ...styles.container, ...{ backgroundColor: props.color } }}
        >
          <Text style={styles.title} numberOfLines={2}>
            {props.title}
          </Text>
        </View>
      </TouchableCmp>
    </View>
  );
}

const sytles = StyleSheet.create({
  gridItem: {
    flex: 1,
    margin: 15,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden'
  },
  container: {
    flex: 1,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
    padding: 15,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  title: {
    fontFamily: 'open-sans-bold',
    fontSize: 22,
    textAlign: 'right'
  }
});

export default CategoryGridTile;
```

스타일링시 iOS에서는 잘 반영되는데, 안드로이드에서는 그렇지 못한 속성들이 있습니다. 특히 버전 21 이상의 안드로이드 경우에는 `TouchableOpacity` 대신  `TouchableNativeFeedback`을 사용하여 조금 더 부드러운 UI를 제공하였습니다. 

컨테이너 속성의 다양한 shadow 속성들을 익혀놓으면 좋을 것 같고, 그 안에 있는 아이템의 정렬방식을 main-axis, cross-axis 둘다 ‘flex-end’로 설정하여서 데이터의 타이틀이 오른쪽 아래에 위치하게 만들었습니다.



