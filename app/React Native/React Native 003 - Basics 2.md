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