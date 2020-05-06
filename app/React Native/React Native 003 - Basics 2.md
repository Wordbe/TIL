# React Native 003 - Basics 2

## Touchable 컴포넌트

```react
import { Touchable, TouchableOpacity, TouchableHighlight, TouchableNativeFeedback, TouchableWithoutFeedback } from 'react-native';
```

* `<View>` 컴포넌트 안에도 `onTouchEnd` 등 다양한 속성이 많지만, 효과를 내는 조금 더 손쉬운 방법으로 `react-native`에서 컴포넌트를 직접가져오는 것을 추천합니다.
* `TouchableOpacity` : activeOpacity 등의 속성 지원
* `TouchableHighlight` : underlayColor 등 속성 지원
* `TouchableNativeFeedback` : Android 에서만 가능
* `TouchableWithoutFeedback` : 아무 반응도 원하지 않을 때 사용

<br>

## 아이템 삭제(Delete)

```react
import GoalItem from './components/GoalItem';
import GoalInput from './components/GoalInput';

export default function App() {
  const [courseGoals, setCourseGoals] = useState([]);
  const addGoalHandler = (goalTitle) => {
    setCourseGoals((currentGoals) => [
      ...currentGoals,
      { id: Math.random().toString(), value: goalTitle }
    ]);
  };

  const removeGoallHandler = (goalId) => {
    setCourseGoals((currentGoals) => {
      return currentGoals.filter((goal) => goal.id !== goalId);
    });
  };

  return (
    <View style={styles.container}>
      <Text>Wordbe's App</Text>

      <GoalInput onAddGoal={addGoalHandler} />
      <FlatList
        keyExtractor={(item, index) => item.id}
        data={courseGoals}
        renderItem={(itemData) => {
          return (
            <GoalItem
              id={itemData.item.id}
              onDelete={removeGoallHandler}
              title={itemData.item.value}
            />
          );
        }}
      />
    </View>
  );
}
```

```react
function GoalItem(props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onDelete.bind(this, props.id)}
    >
      <View style={styles.listItem}>
        <Text>{props.title}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

<br>

## Modal Overlay 추가하기

* Modal의 visible 속성을 통해 컴포넌트를 숨기고, 드러낼 수 있습니다.

```react
<Modal visible={props.visible} animationType="fade"></Modal>
```

* Modal이 나타나고 사라질 때 애니메이션 효과도 삽입할 수 있습니다. (fade, slide)



---

## Modal 을 이용한 목록 추가/제거 앱



**GoalInput.js**

```react
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Modal } from 'react-native';

function GoalInput(props) {
  const [enteredGoal, setEnteredGoal] = useState('');
  const goalInputHandler = (enteredText) => {
    setEnteredGoal(enteredText);
  };

  const addGoalHandler = () => {
    props.onAddGoal(enteredGoal);
    setEnteredGoal('');
  };

  return (
    <Modal visible={props.visible} animationType="fade">
      <View style={styles.innerView}>
        <TextInput
          placeholder="Course Goal"
          style={styles.textInputStyle}
          onChangeText={goalInputHandler}
          value={enteredGoal}
        />
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="ADD" onPress={addGoalHandler} />
          </View>
          <View style={styles.button}>
            <Button title="CANCEL" color="red" onPress={props.onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  innerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInputStyle: {
    width: '80%',
    marginBottom: 10,
    padding: 10,
    borderColor: 'black',
    borderWidth: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%'
  },
  button: {
    width: '40%'
  }
});

export default GoalInput;
```



**GoalItem.js**

```react
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function GoalItem(props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onDelete.bind(this, props.id)}
    >
      <View style={styles.listItem}>
        <Text>{props.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listItem: {
    padding: 10,
    marginVertical: 3,
    backgroundColor: '#ccc',
    borderColor: 'black',
    borderWidth: 1
  }
});

export default GoalItem;
```



**App.js**

```react
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import GoalItem from './components/GoalItem';
import GoalInput from './components/GoalInput';

export default function App() {
  const [courseGoals, setCourseGoals] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false);

  const addGoalHandler = (goalTitle) => {
    setCourseGoals((currentGoals) => [
      ...currentGoals,
      { id: Math.random().toString(), value: goalTitle }
    ]);
    setIsAddMode(false);
  };

  const removeGoallHandler = (goalId) => {
    setCourseGoals((currentGoals) => {
      return currentGoals.filter((goal) => goal.id !== goalId);
    });
  };

  const cancelGoalAdditionHandler = () => {
    setIsAddMode(false);
  };

  return (
    <View style={styles.container}>
      <Text>Wordbe's App</Text>
      <Button title="Add New Goal" onPress={() => setIsAddMode(true)} />
      <GoalInput
        visible={isAddMode}
        onAddGoal={addGoalHandler}
        onCancel={cancelGoalAdditionHandler}
      />
      <FlatList
        keyExtractor={(item, index) => item.id}
        data={courseGoals}
        renderItem={(itemData) => {
          return (
            <GoalItem
              id={itemData.item.id}
              onDelete={removeGoallHandler}
              title={itemData.item.value}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
```

