# React Native - Reat Native CLI(Expo 없이 배포)





**Expo (Managed Workflow)**

* 설정할게 없어서 사용하기 쉽다.
* 내장된 많은 네이티브 모듈이 있다.
* Expo CLI를 통해 제어한다.
* Expo Wrapper를 포함한 Standalone 앱 배포가 가능하다.
* Android Studio, Xcode 필요없다.

**Expo (Bare Workflow)**

* Non-Expo 앱
* 임포트된 Expo 패키지를 사용한다.
* 상대적으로 설정, 관리가 쉽다.
* 네이티브 모듈도 사용가능하다.
* Android Studio와 XCode에서도 빌드, 배포가 가능하다.

**React Native CLI**

* Non-Expo 앱
* Expo 패키지를 이용할 수 있다. 사용자 설정이 필요하다.
* 자신의 것을 만들기 좋다. 자유도가 높다.
* 네이티브 모듈도 사용가능하다.
* Android Studio와 XCode에서도 빌드, 배포가 가능하다.



 

---

## React Native CLI



`expo` 를 사용하지 않고 `react-native CLI`로 앱을 실행하고, 빌드, 배포해보자.



일단 시뮬레이터를 리액트네이티브와 연결시키는 방법에 대해 아래 글에 기록해놓았다.

[[React Native CLI] - Simulator 연동(android, ios)](https://wordbe.tistory.com/entry/React-Native-CLI-Simulator-%EC%97%B0%EB%8F%99android-ios)



리액트네이티브를 실행해보자.

```shell
$ react-native run-ios
$ react-native run-android
```





> Live Reload 설정
>
> * Android Emulators: `CTRL + M` (or `CMD + M` on a Mac)
> * iOS Simulators: `CMD + D`
> * Or (위 플랫폼 둘다): 디바이스를 흔든다.
> * **"Enable Live Reload"** 를 누른다.





---



**Bare Workflow**



```javascript
react-native-unimodules
```



* 설정할 것이 react-native cli 보다 적다.
* expo가 제공하는 여러 API를 쉽게 사용할 수 있다.



---

**기존 Expo managed 프로젝트로부터 bare 프로젝트로 꺼내기**



```shell
$ expo eject
```

기타 라이브러리 추가 등록이 필요하다면,

직접 사이트에 들어가 라이브러리를 설치한다.



---



Expo

* 사용, 개발하기 쉽다.
* 배포하기 쉽다. iOS 를 Windows/Linux 에서 사용가능하다.
* 적절하고 풍성한 네이티브 모듈을 사용한다. 사용하기 쉽다.
* 앱 주변에 Wraaper가 있어서 크기가 커지고 성능에 영향을 준다.
* 내장된 네이티브 모듈에 국한적이다.



Non-Expo

* 손수 설정이 더 필요하다.
* 손수 배포해야하고, Window, Linux에서 iOS 앱은 작동안된다.
* 서드파티 라이브러리가 사용가능하다. 손수 설정해야 한다.
* Wrapper 가 없다.
* 초기화가 필요없고, 별도 설치 구성이 필요없는 기능을 제공한다.





의견 :

expo 로 만드는 것이 더 좋은 개발 환경과 유연성을 제공해준다. expo 앱에서 eject가 가능하기 때문에 잃을 것이 많이 없고, 언제든 non-expo 로 갈 수 있다.

리액트네이티브에서 제공하는 많은 라이브러리도 알고, 구성하는 방법도 안다면 react-native CLI 가 좋다. 자유도도 높고, 성능도 좋게 만들 수 있다. 



expo 한계

https://docs.expo.io/introduction/why-not-expo/?redirected

expo 없이 react native 설정 

https://reactnative.dev/docs/getting-started#installing-dependencies





















