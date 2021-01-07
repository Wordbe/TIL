# React Native - 배포



* 코드를 테스트하고, 정리한다.
* 앱 환경 / 개발 환경을 설정한다.
* 아이콘, 스플래시 스크린을 추가한다.
* 빌드 & 배포한다.



Expo (Managed) 

* app.json 설정을 통해 자동 asset 생성한다.
* expo publish
* expo build:android/ios
* Over the air 업데이트



Non-Expo

* 손수 설정
* Android studio / Xcode 를 이용해서 빌드
* 내장된 OTA 업데이트는 없다.



---



## expo 배포

https://docs.expo.io/versions/v34.0.0/distribution/introduction/



### Android

```shell
$ expo build:android

$ expo fetch:android:keystore

$ expo upload:android
```





### iOS

```shell
$ expo build:ios

$ expo upload:ios
```





---

## React-native CLI 배포



### iOS

1) ios/projectName.xcworkspace 파일을 Xcode로 연다.

2) Bundle Identifier 설정

3) Version 1.0

4) Build 1

5) Automaticallly 사인

6) App Icon 에서 사이즈에 맞는 아이콘 넣기 (expo는 자동으로 해줌)

7) LaunchScreen.xib

8) 시뮬레이터 설정하고 플레이 버튼 누르기



배포

prouct > Build

AppId 에 bundle identifier 에서 적었던 내용을 적는다.



https://reactnative.dev/docs/running-on-device#building-your-app-for-production

https://reactnative.dev/docs/next/publishing-to-app-store





### Android

https://reactnative.dev/docs/signed-apk-android



#### Upload 키 생성

```shell
$ keytool -genkeypair -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```



맥에서는 jdk 경로에 들어가서 아래 명령을 실행시킨다.

```shell
$ sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```





#### Gradle 설정

android/app 하위에 my-upload-key.keys 파일을 옮겨놓는다.





`android/gradle.properties` 에 아래를 추가한다.

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```





#### Gradle Config 설정



android/app/build.gradle

```gradle
...
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
...
```





#### Release APK

```shell
$ cd android
$ ./gradlew bundleRelease
```





Google Play Console 접속 > App Release 

생성된 APK를 추가한다.



Android Studio 를 열어서

app/src/main 빌드 확인

res 폴더 생성되면 우클릭 후 New > Image Asset

아이콘 사이즈별로 제작



