# React Native 002 - Basics

### Core Components

* 리액트 네이티브에 빌드 → 리액트 네이티브에 의해 제공된 네이티브 UI 위젯으로 번역(translation)

### Styling

* CSS는 없음
* Inline Styles, StyleSheet Objects (CSS 문법 기반이지만, 속성, 특징의 일부만 지원함)
* StyleSheet Objects를 권장

<br>

## 앱 구상

사소하지만, 그럼에도 불구하고 매우 중요하고 도움되는 앱을 제작해보겠습니다.

목표를 추가하는 버튼 구성, 목표 리스트 화면에 보여지고, 한 목표를 탭하면 삭제할 수 있도록 구현

---

### 중요 컴포넌트

* 텍스트를 작성하려면, `<Text>` 태그로 텍스트를 꼭 감싸주어야 함.
* `<View>` : 텍스트, 이미지, 유저 인풋에 대한 응답 등에 사용되는 스크린 위의 작은 네모 상자 원소, 기본 빌딩 블락

### 레이아웃

* 리액티브 RN의 대부분 컴포넌트는 style 속성을 가짐

  ```react
  <View style={{padding: 30}}></View>
  ```

* flex box

  * React Native의 컴포넌트는 기본 속성이 flex로 되어 있어 flex container를 이룹니다. 따라서 flex 관련 속성을 사용할 수 있습니다.

  * main-axis, cross-axis(main-axis와 수직)

  * flexDirection : 'row' (→), 'column' (↓), 'row-reverse' (←), 'column-reverse' (↑)

    web 의 flex는 'row'가 기본이지만,

    app 에서의 flex는 'column'이 기본입니다.

  * justfiyContent (main-axis기준 정렬), alignItems (cross-axis기준 정렬)

    'center', 'stretch', 'space-between', 'space-around' 등

  * flex container 안의 flex item 들에서 사용할 수 있는 속성

    * flex: 1 → flex contatiner 의 크기에 따라 flex item의 크기가 결정됨
    * 여러 flex item들이 있고, flex: 1, flex: 2 이렇게 있으면 각각 영역을 1/3, 2/3 씩 차지

* `<View>` 의 기본 크기는 안에있는 텍스트, 이미지 등의 크기에 비례



---

## Inline vs StyleSheet

* lnline 스타일은 태그안에 스타일 속성을 기록하므로, 복잡한 스타일은 가독성이 좋지 않습니다.

* StyleSheet 객체를 통해, 객체 형태로 각각의 스타일을 생성할 수 있습니다.

  ```react
  import { StyleSheet } from 'react-native';
  
  export default function App() {
      return (
          <View style={styles.style1}>
          	<View style={styles.style2}>
              </View>
          </View>
      );
  }
  
  const styles = StyleSheet.create({
      style1: {
          padding: 30
      },
      style2: {
          color: white;
      }
  })
  ```

  StyleSheet 객체는 각 스타일 문법의 검증(validation)과 잠재적인 성능 향상을 제공합니다.

