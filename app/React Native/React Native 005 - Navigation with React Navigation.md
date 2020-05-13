# React Native 005 - Navigation with React Navigation



### Font 불러오기

```shell
$ expo install expo-font
```



font 가 로딩되면 화면이 렌더링 되도록 구성해봅시다.

폰트가 담긴 ttf 파일을 `assets/fonts` 에 넣어주고, 폰트를 불러옵니다.

**App.js**

```React
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



