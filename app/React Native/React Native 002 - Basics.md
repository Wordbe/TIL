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

---

## 상태, 이벤트 관리(State, Event)

* `useState` 이용, 상태와 상태 업데이트를 관리

  ```React
  import React, { useState } from 'react';
  import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
  
  export default function App() {
    const [enteredGoal, setEnteredGoal] = useState('');
    const [courseGoals, setCourseGoals] = useState([]);
  
    const goalInputHandler = (enteredText) => {
      setEnteredGoal(enteredText);
    };
  
    const addGoalHandler = () => {
      setCourseGoals(currentGoals => [...currentGoals, enteredGoal]);
    };
  
    return (
      <View style={styles.container}>
        <Text>Wordbe's App</Text>
  
        <View style={styles.innterView}>
          <TextInput
            placeholder="Course Goal"
            style={styles.textInputStyle}
            onChangeText={goalInputHandler}
            value={enteredGoal}
          />
          <Button title="Add" onPress={addGoalHandler} />
        </View>
        <View>
          {courseGoals.map((goal) => <Text key={goal}>{goal}</Text>)}
        </View>
      </View>
    );
  }
  ```

* 위 예제의 경우, enteredGoal 에 입력된 데이터를 coursGoals 에 추가하며, 이를 `map` 메소드를 이용해서 출력

* `map` 메소드에서 `Text` 태그로 출력할 때, key 입력을 해주면, 효율적으로 리스트를 관리할 수 있습니다.

---

## Styling

* `<Text>` 태그는 style 속성을 많이 지원하지 않으므로, `<View>` 로 덮어씌운 후 스타일링을 적용하는 것이 좋습니다.
* key는 루트 컴포넌트에 적용시켜주어야 합니다.
* RN styling 속성에는 CSS와 다르게 `marginVertical` 이 있습니다.

```react
<View>
	{courseGoals.map((goal) =>
	<View key={goal} style={styles.listItem}>
		<Text>{goal}</Text>
	</View>)}
</View>
```

<br>

---

## ScrollView

* web 페이지 화면이 꽉차면 자동으로 스크롤이 생기지만, 앱은 설정해주어야 합니다.

  ```react
  import { ScrollView } from 'react-native';
  ```

* 화면을 넘는 컴포넌트를 스크롤뷰로 감싸주면 됩니다.

<br>

---

## FlatList

* `ScrollView`의 경우, 보이지 않는 요소가 화면에 없더라도 모두 렌더링 되기 때문에 앱을 느리게 할 수 있습니다.
* `FlatList` 는 필요한 것만 렌더링하게 하여 스크롤링을 최적화합니다.

```react
<View>
	{courseGoals.map((goal) =>
	<View key={goal} style={styles.listItem}>
		<Text>{goal}</Text>
	</View>)}
</View>
```

위 코드를 아래와 같이 변경할 수 있습니다.

```react
<FlatList
    data={courseGoals}
    renderItem={(itemData) => {
        return (
            <View style={styles.listItem}>
                <Text>{itemData.item.value}</Text>
            </View>
        );
    }}
/>
```

* 단, 데이터는 {key, value} 형식의 자바스크립트 객체여야 합니다.

* `data` : 리스트 형식의 데이터 안에 key, value 값을 가진 객체가 있어야 합니다.

* `rennderItem` : { } 안에 함수를 넣으면, data 의 인자를 하나씩 받아 함수에 넣어 반환합니다.

* FlatList는 `key` 라는 요소를 기본 키로 인식합니다. 이를 커스터마이징 하려면 `keyExtractor`를 사용합니다.

  예) key 대신 id 를 사용할 경우

  ```react
  const addGoalHandler = () => {
      setCourseGoals((currentGoals) => [
          ...currentGoals,
          { id: Math.random().toString(), value: enteredGoal }
      ]);
  };
  ...
  <FlatList
      keyExtractor={(item, index) => item.id}
      data={courseGoals}
      renderItem={(itemData) => {
          return (
              <View style={styles.listItem}>
                  <Text>{itemData.item.value}</Text>
              </View>
          );
      }}
  />
  ```

  