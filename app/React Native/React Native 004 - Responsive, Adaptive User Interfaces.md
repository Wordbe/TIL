# React Native 004 - Responsive, Adaptive User Interfaces

## 반응형, 적응형 사용자 인터페이스

자동적으로 모든 가능한 디바이스에 알맞은 모양으로 적용되도록 만들어 봅니다.

* 디바이스 차원, 방향(orientation)을 찾는 방법
* 크기와 방향에 근거한 레이아웃 조정
* iOS 또는 Android 등 다른 디바이스 플랫폼을 구별하는 방법
* 플랫폼 기반 적응형 코드 / UI



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

