# 013 Expo 없이 App 빌딩



지금은 Expo에 배포를 맡겼습니다.

하지만, 더 이상 Expo에 의존하지 않으려 합니다. 또한 앱이 규모가 커지면, 다른 배포 도구가 필요합니다.



## 대안

Expo는 워크플로우를 관리합니다. 세팅할 것이 하나도 없고, 사용하기 편리하고, 많은 네이티브 모듈이 빌트인 되어있습니다.

Expo CLI로 제어가 가능하고, Standalone app(Expo가 필요없는)이 배포가 가능합니다. 즉, 안드로이드 스튜디오나 XCode가 기술적으로 필요하지 않습니다.



| Expo - Bare Workflow                                         | React Natvie CLI                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| None-Expo App                                                | None-Expo App                                                |
| 여전히 엑스포 패키지 불러옴                                  | Expo 패키지 이용가능, 매뉴얼 설정 필요                       |
| 설정, 관리 쉬움                                              | 자신의 것을 관리                                             |
| 아무 네이티브 모듈이나 사용가능하고, Android Studio나 Xcode로 빌드하고, 배포한다. | 아무 네이티브 모듈이나 사용가능하고, Android Studio나 Xcode로 빌드하고, 배포한다. |



---



## Reactive Native CLI로 앱 build하기

https://reactnative.dev/docs/environment-setup 를 방문합니다.

운영체제와, 타겟앱을 설정하고, 순서대로 진행합니다.



```shell
$ react-native run-android
```





### Live Reload

Android 에뮬레이터의 경우, `Ctrl + M` (`CMD + M`, MAC)를

iOS 시뮬레이터의 경우, `CMD + M`을 누르면 “Enable Live Reload” 설정이 완료됩니다.



---

## Native Module을 Non-Expo 앱에 추가하기



예시) Image Picker API 추가

구글 검색 후 깃헙 들어가서 Getting Started를 따라합니다.

```shell
$ npm install --save react-native-image-picker
$ react-native link react-native-image-picker
```



`.eslintrc.js` 에 자동으로 추가가 됩니다.

Usage 전체 코드를 복사해서, 필요한 부분을 수정하여 사용합니다.



이렇게 해서 image picker를 사용하는데, 클릭을 하여도 아무런 일이 발생하지 않는 오류가 생깁니다.

`src/main/AndroidManifest.xml`에서

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

부분을 위와 같이 변경하면 됩니다.



ios 도 비슷합니다.

`project명/info.plist`

```plist
<key>...
```

등을 깃헙페이지에서 복사 붙여넣기 합니다.







---

## Expo의 Bare Workflow 이해하기



세세한 엑스포 CLI의 모든 것을 이용하지 않고, 필요한 react native기능만 사용할 때 사용합니다.

expo-cli, react-native-cli 가 모두 필요합니다.



```shell
$ expo init RNWithExpoBare
```

그 후 name과 displayname을 설정해줍니다.



이렇게하여 만들어진 새 프로젝트는,

`react-native-unimodules` 페이지(깃헙)에 소개된 것처럼 android와 ios가 설정되어 있습니다.

`react-native-unimodules` 는 엑스포 API를 Non-expo 앱에 지원하는 역할을 합니다.



Bare Worflow 에는 사용할 수 있는 기본 API를 지원합니다. (ex. expo-location)



기존 Expo-CLI 보다는 조금 느리지만, Bare Workflow를 통하여 react-native-cli로 로컬에 화면을 띄울 수 있습니다.





---

## Expo의 Managed Workflow로 부터 내보내기(eject)



iOS 설정을 위해서,

```shell
$ pod install
```

을 실행하고,



Android 설정을 위해서는

https://github.com/expo/expo/tree/master/packages/react-native-unimodules 를 참고하여,

`AndroidManifest.xml` 에 복사 붙여넣기 합니다.



예제로 `react-native-maps` 를 설치해봅시다.

Google Map API

Google Clooud Platform > Maps SDK for Android

```xml
<meta-data 
           android:name="com.google.android.geo.API_KEY"
           .../>
```

 구글 맵을 안드로이드에 연동합니다.



이로써, image-picker를 통해 사진을 찍어서 앱에 업로드하고, maps를 통해 구글 맵으로 내 위치를 앱에 저장할 수 있는 간단한 stand alone 앱을 만들 수 있었습니다.



Expo는 사용, 개발이 쉽고, Non-expo는 손수 설정을 해야 합니다. 하지만 그만큼 더 자유롭고, 독창적으로 구현할 수 있는 기능(thrid-parity 라이브러리 이용)이 많습니다. Expo는 native 모듈에 국한되어 있습니다.

Expo는 iOS, Windows/Linux를 포함해서 배포가 가능하지만, Non-expo는 iOS 앱은 맥에서만 지원됩니다.

Expo 는 크기와 성능이 중요하므로, wrapper 안에서 사용해야 하지만, Non-expo는 wrapper가 필요 없습니다.





