# React Native 004 - Responsive, Adaptive User Interfaces

## 반응형, 적응형 사용자 인터페이스

자동적으로 모든 가능한 디바이스에 알맞은 모양으로 적용되도록 만들어 봅니다.

* 디바이스 차원, 방향(orientation)을 찾는 방법을 알아봅니다.
* 크기와 방향에 근거한 레이아웃 조정해봅니다.
* iOS 또는 Android 등 다른 디바이스 플랫폼을 구별하는 방법을 알아봅니다.
* 플랫폼 기반 적응형 코드 / UI 를 만들어봅니다.



## Dimension API

```react
width: '25%'
```

위와 같이 넓이를 정할 때는 퍼센트를 사용하는 것이 일관성있으며, `minWidth`, `maxWidth` 도 퍼센트로 지정하는 것이 좋습니다.

더 좋은 방법은 `Dimensiion` API를 사용하는 것입니다. 디바이스에서 width, height 등에 얼마나 많은 픽셀이 있고, 가용한 지 알려줄 수 있는 좋은 API 입니다.

```react
import { Dimensions } from 'react-native';

...
width: Dimensions.get('window').width / 4
```

width 픽셀의 1/4 만큼을 차지하도록 설정합니다.



```react
listContainer: {
    flex: 1,
    width: Dimensions.get('window').width > 350 ? '60%' : '80%'
},
```

응용해서 350 픽셀 이상일 경우 60%, 미만일 경우 80%의 넓이를 적용시킬 수 있습니다.



## 다이나믹하게 사이즈 변경

예시는 아래와 같습니다.

```react
imageContainer: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    borderRadius: (Dimensions.get('window').width * 0.7) / 2,
    borderWidth: 3,
    borderColor: 'black',
    overflow: 'hidden',
    marginVertical: Dimensions.get('window').height / 30
  },
```





---

## 가로 방향 전환

**app.json**

```json
{
  "expo": {
    "name": "guess-a-number-app",
    "slug": "guess-a-number-app",
    "platforms": ["ios", "android", "web"],
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true
    }
  }
}
```

`orientation` 에서 기본으로 portrait (초상화, 세로화면)이 정해져있습니다. 세로방향이 기본이고, 가로방향지원을 하지 않습니다.

landscape (풍경화, 가로화면)라는 값으로 바꿀 수 도 있습니다. 가로방향 화면(landscape mode)을 지원합니다.

위 코드처럼 default 로 설정해 놓으면 가로방향, 세로방향을 모두 지원합니다.



<br>

---

## Orientation, KeyboardAvodingView

```react
<KeyboardAvoidingView behavior="position" keyboardVerticalOffset={30}>

</KeyboardAvoidingView>
```

위와 같이 하면, 입력시 올라오는 키보드가 화면을 가리는 것을 방지할 수 있습니다.

* iOS : `position`을 주로 사용합니다.
* Android : `padding`을 주로 사용합니다.

`keyboardVerticalOffset` 으로 키보드로부터 오프셋값을 설정할 수 있습니다. (픽셀 단위)



---

## 가로화면, 세로화면 렌더링

가로화면과 세로화면 2가지를 구성해놓고, 화면을 돌릴 때마다 새롭게 렌더링되도록하는 코드를 만들어봅니다.

`useRef` 를 이용하여, Dimensions 에서 ‘change’를 감지할 때 (컴포넌트가 마운트 될 때), 그 화면의 넓이와 높이를 가져오게 구현해보겠습니다.

```react
const [availableDeviceWidth, setAvailableDivceWidth] = useState(
    Dimensions.get('window').width
);
const [availableDeviceHeight, setAvailableDivceHeight] = useState(
    Dimensions.get('window').height
);
```

먼저 `useState`로 디바이스의 넓이와 높이 상태를 관리합니다.

```react
useEffect(() => {
    const updateLayout = () => {
        setAvailableDivceWidth(Dimensions.get('window').width);
        setAvailableDivceHeight(Dimensions.get('window').height);
    };

    Dimensions.addEventListener('change', updateLayout);

    return () => {
        Dimensions.removeEventListener('change', updateLayout);
    };
});
```

다음은 `useEffect`와 `Dimensions.addEventListner` 를 통해 화면이 바뀔 때마다 넓와 높이를 가져와서 상태를 변경(set)합니다. 또한 화면이 바뀔 때(즉, 컴포넌트가 언마운트될 때) `Dimensions.removeEventlistner`를 통해 예전의 이벤트 리스너를 지워줍니다.

아래는 가로화면과 세로화면이 될 jsx 입니다. 

```react
let listContainerStyle = styles.listContainer;

if (availableDeviceWidth < 350) {
    listContainerStyle = styles.listContainerBig;
}

if (availableDeviceHeight < 500) {
    // 가로화면
    return (
        <View style={styles.screen}>
            <Text style={DefaultStyles.title}>Opponent's Guess</Text>
            <View style={style.controls}>
                <MainButton onPress={nextGuessHandler.bind(this, 'lower')}>
                    <Ionicons name="md-remove" size={24} color="white" />
                </MainButton>
                <NumberContainer>{currentGuess}</NumberContainer>
                <MainButton onPress={nextGuessHandler.bind(this, 'greater')}>
                    <Ionicons name="md-add" size={24} color="white" />
                </MainButton>
            </View>
            <View style={listContainerStyle}>
                <FlatList
                    keyExtractor={(item) => item}
                    data={pastGuesses}
                    renderItem={renderListItem.bind(this, pastGuesses.length)}
                    contentContainerStyle={styles.list}
                    />
            </View>
        </View>
    );
}

return (
    // 세로화면 (기본값)
    <View style={styles.screen}>
        <Text style={DefaultStyles.title}>Opponent's Guess</Text>
        <NumberContainer>{currentGuess}</NumberContainer>
        <Card style={styles.buttonContainer}>
            <MainButton onPress={nextGuessHandler.bind(this, 'lower')}>
                <Ionicons name="md-remove" size={24} color="white" />
            </MainButton>
            <MainButton onPress={nextGuessHandler.bind(this, 'greater')}>
                <Ionicons name="md-add" size={24} color="white" />
            </MainButton>
        </Card>
        <View style={listContainerStyle}>
            <FlatList
                keyExtractor={(item) => item}
                data={pastGuesses}
                renderItem={renderListItem.bind(this, pastGuesses.length)}
                contentContainerStyle={styles.list}
                />
        </View>
    </View>
);
```



---

## Expo의 ScreenOrientation API

react-native의 Dimensions, Orietation 대신 다른 API를 사용할 수 있습니다. 대부분 활용은 react-native가 제공하는 것으로 충분하지만, expo의 lock, unlock기능은 쓸만합니다.

```react
import { ScreenOrientation } from 'expo';

ScreenOrientation.lockAsync(ScreenOrientation.Orientationock.PORTRAIT);
```

이와 가티 설정하면, `PORTRAIT` 버전, 즉 세로화면으로 고정되게 됩니다.



위 방법이 안되면 아래를 참고해보세요.

```shell
$ expo install expo-screen-orientation
```

```react
import * as ScreenOrientation from 'expo-screen-orientation';
```



---

## 플랫폼 API

지금까지, 리액트 네이티브로 앱을 만들어 본 결과 유일하게 `Button` 속성만 플랫폼(Android, iOS) 별로 다른 스타일을 띄고 있었습니다. 플랫폼 별로 다른 스타일을 적용하는 방법을 알아봅니다.

```react
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  header: {
    backgroundColor: Platform.OS === 'android' ? Colors.primary : 'green',
    borderBottomColor: Platform.OS === 'ios' ? '#ccc' : 'transparent',
    borderBottomWidth: Platform.OS === 'ios' ? 1 : 0
  },
  title: {
    color: Platform.OS === 'ios' ? Colors.primary : 'white'
  }
});
```

위와 같이 `Platform.OS` 에 따라서 다른 스타일을 구현할 수 있습니다.

가독성을 좋게하기 위해서는 아래와 같은 방법이 더 좋아보입니다.

```react
<View
    style={{
        ...styles.headerBase,
            ...Platform.select({
            ios: styles.headerIOS,
            android: styles.headerAndroid
        })
    }}
>
</View>

const styles = StyleSheet.create({
  headerBase: {
    width: '100%',
    height: 90,
    paddingTop: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerIOS: {
    backgroundColor: 'white',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1
  },
  headerAndroid: {
    backgroundColor: Colors.primary,
    borderBottomColor: 'transparent',
    borderBottomWidth: 0
  }
});
```



### Platform.select

```react
const MainButton = (props) => {
  let ButtonComponent = TouchableOpacity;

  if (Platform.OS === 'android' && Platform.Version >= 21) {
    ButtonComponent = TouchableNativeFeedback;
  }

  return (
    <View style={styles.buttonContainer}>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 25,
    overflow: 'hidden'
  }
});
```

* 변수이름을 `let ButtonComponent`와 같이 대문자로 만들면, 컴포넌트를 변수로 받아올 수 있습니다.
* `overflow: ‘hidden’`은 자식컴포넌트가 이 컴포넌트의 경계를 넘지않게 설정하는 것입니다.

플랫폼 별로 파일을 딸만들어 구성하는 것도 복잡한 코드를 유지, 보수하는데 좋은 방법입니다. 이름은 아래와 같이 지어주면, 리액트 네이티브가 의존성있는 파일들을 자동 연계해줍니다.

`MainButton.android.js`, `MainButton.ios.js`



---

## SafeAreaView

아이폰의 경우, 디자인 특성 상 위쪽에 있는 노치(notch)와 아래쪽에 있는 바(home screen Task Manager indicator bar) 때문에 화면 뷰가 방해를 받을 수 있습니다.

리액트 네이티브는 자동으로 이를 처리해주는 `SafeAreaView` 컴포넌트를 제공합니다. `SafeAreaView`는 추가적인 패딩을 제공하여 보기 좋은 뷰를 만들어줍니다. 뷰 전체 영역을 이 컴포넌트로 씌워주기만 하면 됩니다. 이는 전체 앱에 대해 적용하면 좋으므로, `App.js` 의 뷰 컴포넌트를 감싸주면 좋습니다.

+) navigation을 통해 이를 해결할 수 도 있습니다.









