# Chat App



레퍼런스



* [Aman Mittal](https://medium.com/@amanhimself?source=post_page-----533352870497--------------------------------) 리액티브네이티브 파이어베이스 채팅앱 튜토리얼
  *  https://heartbeat.fritz.ai/chat-app-with-react-native-part-2-firebase-user-authentication-with-react-native-firebase-533352870497
* **BinBytes** 웹/앱/게임 개발 기업 : https://github.com/binbytes/react-native-firebase-chat
* **Chatkitty** 채팅 서비스 : https://www.chatkitty.com/#
  * 채팅서비스 part 1~4 가이드 : https://www.chatkitty.com/guides/
  * 깃헙 : https://github.com/ChatKitty/chatkitty-example-react-native/tree/tutorial/part-1





---

##  react-native-vector-icons 아이콘 깨질 때

또는 react-native-paper 에서 IconButton 아이콘이 나오지 않을 때



## 설치

```
yarn add react-native-vector-icons
yarn add @types/react-native-vector-icons
```



## iOS

여기서는 CocoaPods를 사용해 설치하는 것만 살펴본다. React Native 0.60.0 이상의 버전이라면 CocoaPods를 사용하는 것이 일반적이다.

수동 설치와 `react-native link`를 활용한 설치는 [라이브러리의 도큐먼테이션](https://github.com/oblador/react-native-vector-icons)을 참고하자.



#### Podfile

```podfile
pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
```

Podfile에 위 코드를 추가하였으면 설치 프로세스를 진행하자.

```
cd ios && pod install
```



### Info.plist

ios/{project}/info.plist 에 아래 내용을 추가한다.

```xml
<key>UIAppFonts</key>
<array>
  <string>AntDesign.ttf</string>
  <string>Entypo.ttf</string>
  <string>EvilIcons.ttf</string>
  <string>Feather.ttf</string>
  <string>FontAwesome.ttf</string>
  <string>FontAwesome5_Brands.ttf</string>
  <string>FontAwesome5_Regular.ttf</string>
  <string>FontAwesome5_Solid.ttf</string>
  <string>Foundation.ttf</string>
  <string>Ionicons.ttf</string>
  <string>MaterialIcons.ttf</string>
  <string>MaterialCommunityIcons.ttf</string>
  <string>SimpleLineIcons.ttf</string>
  <string>Octicons.ttf</string>
  <string>Zocial.ttf</string>
  <string>Fontisto.ttf</string>
</array>
```







## Android

### android/app/build.gradle

다음을 추가한다.

```
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

안드로이드에서는 이외의 설정이 필요하지 않다.



이제 원하는 아이콘을 골라서 사용한다.

https://oblador.github.io/react-native-vector-icons/





---

# Firestore 추가







Firestore 안에 콜렉션 만들기





---

함수: auth().signInWithEmailAndPassword(email, password); 

```javascript
FirebaseAuthTypes.UserCredential
  
  export interface UserCredential {
    /**
     * Any additional user information assigned to the user.
     */
    additionalUserInfo?: AdditionalUserInfo;
    /**
     * Returns the {@link auth.User} interface of this credential.
     */
    user: User;
  }
```



하지만 위 함수 리턴값을 받아오면 바로 user 값이 담기는데 이유가 무엇일까?



---

## 참고자료



RN + Firebase SDK 조합

* 유투브 [Build a React Native Chat App with Firebase in 20 MINUTES!](https://www.youtube.com/watch?v=eR1vP-W1emI)

  * React Native 화면 2개(login, chat 화면) + 네비게이션
  * Firebase 는 이미 만들어져있는 프로젝트 연동

* Expo 블로그 [How To Build A Chat App With React Native](https://blog.expo.io/how-to-build-a-chat-app-with-react-native-3ef8604ebb3c)

  * Firebase Basic Chat

  * 필요한 것

    * 메시지 저장소 서버
    * 사용자 이름 가져오는 화면 (Main.js)
    * 메시지 주고 받는 화면 (Chat.js)

  * `react-native-gifted-chat`

  * `import firebase from 'firebase'`

  * firbase > 웹 앱 > Firbase SDK snippet

    ```html
    <!-- The core Firebase JS SDK is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js"></script>
    
    <!-- TODO: Add SDKs for Firebase products that you want to use
         https://firebase.google.com/docs/web/setup#available-libraries -->
    <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js"></script>
    
    <script>
      // Your web app's Firebase configuration
      // For Firebase JS SDK v7.20.0 and later, measurementId is optional
      var firebaseConfig = {
        apiKey: "AIzaSyC7Wrock2kDNEScxZLz6WoF7bm25cfxjWs",
        authDomain: "chatapp-76929.firebaseapp.com",
        projectId: "chatapp-76929",
        storageBucket: "chatapp-76929.appspot.com",
        messagingSenderId: "1051351756321",
        appId: "1:1051351756321:web:9acfb9f5b368cb082f3d60",
        measurementId: "G-V6E4JGVBYR"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      firebase.analytics();
    </script>
    ```

  * 사용자 인증하고 데이터베이스 접근

    * `uid`, `timestamp`, `messages`





---

Stream

Chat API 사용 (30일 무료)

tutorial: [React Native Chat App Tutorial](https://getstream.io/chat/react-native-chat/tutorial/#setup)

github: [GetStream](https://github.com/GetStream)/**[stream-chat-react-native](https://github.com/GetStream/stream-chat-react-native)**

장점

* 시장 출시 기간
* 커스터마이징
* 확장 가능한 채팅 API
* 강력한 보안
* Multi tenancy(다중 점유 권리)
* 쉬운 통합

기능

* 소셜 메시징
* 팀 협업
* Livestream
* 고객 지원
* 맞춤형 활용 : 텔레메디슨, 데이팅앱, 가상이벤트, 교육용채팅, 게임채팅
* React, **RN**, Android, Flutter, iOS 언어 지원