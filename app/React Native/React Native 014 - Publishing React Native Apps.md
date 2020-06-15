# React Native 014 - Publishing React Native Apps



# Deployment

절차는 다음과 같습니다.

1. 코드를 Test하고 수정(polish)합니다.
2. name, identifier 등 앱, 배포 설정을 합니다.
3. 아이콘과 스플래시 화면(Splash screen, 이미지, 로고, 현재 버전을 포함하는 창)을 추가합니다.
4. 빌드하고 배포합니다.



| Expo (managed)                                         | Non-Expo                                  |
| ------------------------------------------------------ | ----------------------------------------- |
| app.json을 통해 설정하고, 자동으로 asset이 생성됩니다. | 손수 설정합니다.                          |
| expo publish                                           | Android Studio / XCode를 통해 빌드합니다. |
| expo build:android  / build:ios                        | 내장된 OTA 업데이트를 제공하지 않습니다.  |
| 무선 업그레이드(OTA, Over the air)                     |                                           |



---

## App, 배포 설정하기



### Configuration with app.json

```json
{
    "expo": {
        "name": "Great Places",
        "slug": "great-places",
        "privacy": "public",
        "sdkVersion": "34.0.0",
        "platform": [
            "ios",
            "android",
            "web"
        ],
        "version": "1.0.0",
        "orientation": "portrait", (default)
    	"icon": "./assets/icon.png",
    	"splash": {
			...
        },
		"updates": {
            "fallbackToCacheTimeout": 0
        },
		"assetBundlePatterns": [
            "**/*"
        ],
		"ios": {
            ...
        }
    }
}
```



```shell
$ expo publish
```

  콘솔창에 나온 주로로 이동한 후, 나타난 QR코드를 단말기 카메라를 통해 찍으면,

expo client 앱을 통해 작성한 화면을 볼 수 있습니다.



---

## Icon, Splash 화면 설정하기



아이콘과 스플래시 화면으로 설정할 이미지를 `./assets` 경로에 넣습니다.



**app.json**

```json
"description": Some text

...
"icon": "./assets/아이콘.png"
"splash": {
    "image": "./assets/스플래시.png",
    "resizeMode": "contain",
    "backgroundColor": "#171717"
}
...
"ios": {
    "supportsTablet": true,
    "icon": ...,
    "splash": ...
}
"android": {
    "icon": "...",
    "splash": "...",
    "adaptiveIcon": {
        "foregroundImage": "./assets/place-adaptive.png",
        "backgroundColor": "#171717"
    }
}
```

안에 들어갈 속성은 [https://docs.expo.io/workflow/configuration/](https://docs.expo.io/workflow/configuration/)  를 참고합니다.

단순이 “icon”만 설정하는 것이 아니라,

android 속성에서 `adaptiveIcon`을 설정해주는 것이 버전간 안정성을 높이는 방법입니다.



---

## 오프라인 Assets Bundle 사용하기

app.json

```json
"assetBundlePatterns": ["**/*"],
```

맨 처음에는 위와 같이 적혀있습니다. 모든 폴더의 모든 파일을 사용하는 설정입니다.

인터넷 연결이 되어있지 않아도, 서버에 있는 파일을 사용할 수 있습니다.



---

## OTA(Over The Air) 업데이트

app.json

```json
"updates": {
    "fallbackToCahceTimeout": 0, (milliseconds)
}
```



첫번째 배포에는, 이미지를 다운로드하고, 업데이트, 설치합니다.

두번재부터는 이미 올라와있는 이미지를 사용하여, 수정한 부분만 빠르게 바뀌게 설정합니다.



---

## 배포를 위한 App 빌드하기 (Android, iOS)



**app.json**

```json
"ios": {
    "bundleIdentifier": "com.academind.great-places",
    "buildNumber": "1.0.0",
    ...
}
"andorid": {
   "package": "com.academind.great-places",
   "versionCode": 1,
    ...
}
"permissions": [
    "ACCESS_FINE_LOCATION",
    "CAMERA",
    "WRITE_EXTERNAL_STORAGE",
],
"config": {
	"googleMaps": {
        "apiKey": STRING
    }
}
```

app에서 필요한 허가와, google map API key 등을 설정합니다.



설정을 마쳤으면 배포해봅시다.

```shell
$ expo publish
```



Standalone App을 빌드해봅시다.

```shell
$ expo build:android -t app-bundle
```

Expo 클라우드 서버에 빌드합니다.

keystore을 입력해서 다음에 접속할 때도 같은 key를 입력해야 합니다.



애플의 경우는, 배포시 \$99 를 지불해야 합니다.

```shell
$ expo build:ios
```



다시, 안드로이드로 와서, 수정한 앱을 다시 배포하려면

```shell
$ expo fetch:android:keystore
```



이제 구글 플레이스토어에 업로드합니다.

```shell
$ expo upload:android
```



[https://docs.expo.io/distribution/uploading-apps/](https://docs.expo.io/distribution/uploading-apps/) 를 참고합니다.







---

## Expo 없이 iOS 앱 배포하기

XCode를 이용합니다.

맥OS 및 Apple ID가 필요합니다.

Display name을 설정합니다.

App icon 을 설정합니다.



App Store Connect > New App



---

## Expo 없이 Android 앱 배포하기

build.gradle

grde.properti es

```shell
$ cd android/
$ ./gradlew bundleRelease
```



[Google Play Console](https://developer.android.com/distribute/console) > App Release

앱 아이콘 설정하기 : Android Studio > app> res > configure Image Asset



---

그 외



\- 홈 화면이 나타날 때 앱 이름 설정: https://stackoverflow.com/questions/5443304/how-to-change-an-android-apps-name

\- 앱의 bundle identifier, 패키지 이름 (다른 파일에서 tweaking을 필요로 한다.) https://developer.android.com/studio/build/application-id

\- 앱 허가 정책: https://developer.android.com/guide/topics/manifest/manifest-intro#perms

앱 버전을 설정하고, 앱 업데이트 시 매번 바꿔야 한다. `build.gradle`파일로 가능하다.  https://developer.android.com/studio/publish/versioning