# React Native CLI - Simulator 연동(android, ios)





`expo` 를 사용하지 않고 `react-native CLI`로 앱을 실행하고, 빌드, 배포해보자.



일단 react native cli를 설치한다.

```shell
$ yarn global add react-native-cli
또는
$ npm install -g react-native-cli 
```



그리고 reac-native 를 초기화시킨다. 새로운 프로젝트 폴더를 만든다.

```shell
$ react-native init MyReactNativeProject
```





### 1) Android

일단 안드로이드 시뮬레이터를 설치하고, react-native를 실행해보자.

참고로 mac에서 하였다.

1) 안드로이드 스튜디오를 다운받는다.

2) 우하단에 Configure 대신 SDK Manager를 누른다. 

3) SDK Platform에서 알맞은 안드로이드 버전을 깔고, SDK Tools 에서 아래를 설치한다.

* Android SDK Build-Tools
* Android Emulator
* Android SDK Platform - Tools
* Android SDK Tools (Obsolete) : 구식이라고 숨겨져있다.
* Intel x86 Emulator Accelerator
* Google Play Services : 이건 나중에 배포할 때 사용한다.

4) 이제 다시 우하단에 Configure 대신 AVD Manager를 누른다. 

5) + Create Virtual Device...를 눌러서 시뮬레이터 폰을 고르고(최대한 stable한 버전으로 고른다.) Next, Next 눌러준다.

6) 그러면 목록에 시뮬레이터가 뜨는데, Action 버튼을 눌러서 실행시킨다.



그리고, react-native 폴더에 들어가서 아래 명령을 실행한다.

```shell
$ react-native run-android
```



그러면 정상적으로 작동하고, 아까 실행한 에뮬레이터에 반가운 리액트네이티브 화면이 떠야한다.

하지만, 필자는 여러 에러들이 났다.



**첫째**는 안드로이드 스튜디오 경로를 못찾았던 것

따라서 아래와 같이 해결했다.

```shell
$ cd ~
$ vi .zshrc
```

zsh 쉘에서 기본 설정파일을 열어서 경로를 설정하도록 했다.

```shell
# Android studio 경로등록
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

자기 경로가 올바른지 체크해보려면 아까 안드로이드 스튜디오 우하단에 Configure 대신 Preference를 누른다.

그러면 Android SDK Location 에 sdk가 있어야 할 경로가 보인다.

그리고 쉘을 껐다가 다시 켠다.

또는 저 zshrc 파일을 아래와 같은 방법으로 한번 실행시켜준다.

```shell
$ source .zshrc
```





**둘째**는 아래와 같은 에러가 났다. gradle 시작하다가 뭔가 오류가 난 것 같은데... 버전 호환 오류였다.

```
error Failed to install the app. Make sure you have the Android development environment set up: https://reactnative.dev/docs/environment-setup.
```



MyReactNativeProject/android/gradle/wrapper 에 들어가서 `gradle-wrapper.properties` 에서 gradle 버전을 6.3 이상으로 올려주면 된다.

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-6.3-all.zip
```

위와 같이 설정하고



MyReactNativeProject 폴더에 가서 클린 명령을 실행시킨다.

```shell
$ .gradlew clean
```

그리고 다시

```shell
$ react-native run-anroid
```

를 작동시켜서 에러를 해결해주었다.





---

### 2) Xcode

mac 에서 ios 개발 시 필요하다.



1) Xcode 를 다운받는다.

2) Xcode Simulator를 실행시킨다.

3) MyReactNativeProject 에 들어가서 아래를 실행시킨다.

```shell
$ react-native run-ios
```



여기도 경로 에러가 있었는데, Xcode 경로를 바꿔주어 해결했다.

```shell
# xcode 경로확인
$ xcode-select -p
/Library/Developer/CommandLineTools

# xcode 경로 변경
$ sudo xcode-select --switch /Applications/Xcode.app

# xcode 경로 다시 확인
xcode-select -p  
/Applications/Xcode.app/Contents/Developer
```



