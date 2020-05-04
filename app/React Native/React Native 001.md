# React Native 001

# 1 React Native(RN) 란?



| React.js                                                    | React Native                              |
| ----------------------------------------------------------- | ----------------------------------------- |
| 사용자 인터페이스 build를 위한 JavaScript 라이브러리        | 특별한 React 컴포넌트의 집합              |
| 웹 개발에 주로 사용됨                                       | 컴포넌트는 Native 위젯으로 컴파일됨       |
| ReactDOM.render()  은 추가로 웹지원이 가능                  | Native 플랫폼 API는 JavaScript를 노출함   |
| React 자체는 플랫폼-agnostic함(그 자체로 쉽게 배울 수 있음) | Javascript와 Native 플랫폼 코드를 연결함. |

React.js + React Native = 실제 Native Mobile 앱(iOS, Android)



## React Native 동작 원리

* HTML 을 번역할 수는 없고, `<View>`, `<Text>` 등의 태그를 이용
* React + React Native를 컴파일하여 실제 Natvie App을 생성

| React for the Web | Native Component(Android) | Native Component (iOS) | React Native  |
| ----------------- | ------------------------- | ---------------------- | ------------- |
| `<div>`           | `android.view`            | `UIView`               | `<View>`      |
| `<input>`         | `EditText`                | `UITextField`          | `<TextInput>` |



### React Native 에서 Native App / Platform으로의 전환

* RN에서 생성한 코드 중 View 는 Native App에서 컴파일된 뷰가 됩니다.(Native Views)
* RN에서 JavaScript 코드는 Native App에서도 간직하고 있다가, JavaScript 코어(가상머신)에서 운영체제가 자동 번역하여 브릿지(Bridge)를 통해 Native 플랫폼 모듈 / API 과 연동이 되도록합니다.

![](https://i.ibb.co/fXwHjdt/image.png)



---

### Expo, React Natvie CLI

**Expo CLI / TOOL**

* 써드파티 서비스 무료
* Managed 앱 개발
* 편의성, 사용성 높아 개발이 간단
* 하지만 Expo 에코시스템에 제한되어 있음

**React Native CLI**

* 리액트 네이티브 팀, 커뮤니티
* 기본 설정만 되어 있음
* 사용의 편리함, 유용성 없음
* 하지만 Native 의 어떤 코드든 통합할 수 있는 유연함을 제공

> 결론적으로, Expo를 잘사용하게 된다면, eject를 통해 CLI를 써도 괜찮을 것입니다. 
>
> App 코드와 설정은 Expo Client (App)에 로드되고 Native Device / Simulator에서 보이게 됩니다.

## Expo 설치, 실행

```shell
$ npm install expo-cli --global
```

```shell
$ expo init myNewProject
$ cd myNewProject
$ expo start
```

그 후 화면에 QR 코드가 뜨는데, Tunnel 로 설정을 바꾼 후 스마트폰으로 QR 코드를 스캔하면, 앱화면이 렌더링 됩니다. 그 전에 스마트폰에는 expo client 앱을 다운받으시면 됩니다.

그 다음은 App.js 수정하여 앱 개발을 하면 됩니다.

Expo는 공기계 또는 개인 스마트폰에서 화면을 볼 수 있도록 연결이 가능하며,

Android Studio(Windows, MacOS) 또는 Xcode(MacOS) 에서 시뮬레이터를 실행시켜 expo와 연동할 수도 있습니다.





---

## React Native 특징

**Hard work**

* "한번 배우고, 모든 곳에 쓴다."
* 컴포넌트의 크로스 플랫폼 스타일링이 거의 필요 없음 → 스타일 컴포넌는 커스텀이나 서드파티 라이브러리 이용
* 선빌드 컴포넌트의 기본 셋만 준비하면 됨
* Responsive 디자인을 생성하는 툴을 사용하거나, 특별한 responsiveness가 필요없음.

**Alternatives**

* 리액트 네이티브는 매달 마다 새로운 버전이 등장, 커다란 변화가 일어나기도 함
* 또한 변할 수 있는 서드파티 패키지에 대한 의존성이 강함
* 버그 수정 / 제 2 해결책(workaround)이 필요
* 대안 1 : Real Native Apps 빌드 → Android를 우해 Java / Android 를 배움, iOS를 위해 Swift / Objective C를 배움
* 대안 2 : Progressive Web App 빌드 → 사용자는 이를 지원하는 브라우저/OS 를 사용하지 않을 것이라 잘 쓰지이 않음.
* 대안 3 : Ionic 또는 유사한 솔루션을 사용, 하지만 WebView 때문에 성능이 좋지 않음.

---

### 학습 순서

1) Getting Started → React Native 기초 → 디버깅 → Real Apps, 스타일링, 컴포넌트 → 반응형 & 적응형  앱

2) 네비게이션 → Redux를 통한 상태 관리 → Shop App으로 프로젝트 연습 → User 인풋 다루기 → Http Requests

3) User Authentication → Native Device 특징 → 다른 작업흐름(non-expo) → App 배포(publish)















