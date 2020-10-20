# Statement Management, Redux



## Redux

* Central Store - 데이터를 메모리에 저장한다.
* Component → Dispatches → Action → Reducers
* 리듀서는 데이터를 업데이트하면 Cetral Store에 저장한다.
* Central Store에서 트리거가 발동하면 자동으로 subscription 이 되며, `props` 의 형태로 업데이트된 state 를 컴포넌트에게 전달한다.

![](https://i.ibb.co/PDjZfr4/image.png)





---

## Redux, Store 세팅



리듀서 디렉토리에는 `initalState` 와  `reducer`를  설정해준다. 

```javascript
const initialState = {
  meals: MEALS
}

const mealsReducer = (state = initalState, action) => {
  return state;
};
```

> MEALS 은 데이터 객체이다.



메인 App.js 에서는 리듀서들의 모음인 루트리듀서를 설정해준다.

루트리듀서를 store에 담는다.

Provider 에 이 store를 매개변수로 담으면 리듀서에 저장된 상태를 컴포넌트로 전달할 수 있다.

```jsx
const rootReducer = combineReducers({
  meals: mealsReducer
});

const store = createStore(rootReducer);

...
<Provider store={store}>
	<MealsNavigator />
</Provider>
```



<br />

---

## State 선택

```jsx
const MealDetailScreen = props => {
  const availableMeals = useSelector(state => state.meals.meals);
  const mealId = props.navigation.getParam('mealId');

  const selectedMeal = availableMeals.find(meal => meal.id === mealId);

  return {...}
}
```



`props.navigation.getParam()` 을 통해서 전달받은 props 안의 상태 데이터를 사용할 수 있다.



<br />



---

## Redux data, Navigation Options



```jsx
const MealDetailScreen = props => {
  const availableMeals = useSelector(state => state.meals.meals);
  const mealId = props.navigation.getParam('mealId');
  const mealTitle = props.navigation.getParam('mealTitle');

  const selectedMeal = availableMeals.find(meal => meal.id === mealId);

   useEffect(() => {
    props.navigation.setParams( {mealTitle: selectedMeal.title });
   }, [selectedMeal]);

  return {...}
}

MealDetailScreen.navigationOptions = navigationData => {
  const mealId = navigationData.navigation.getParam('mealId');
  const mealTitle = navigationData.navigation.getParam('mealTitle');
  return {
    headerTitle: mealTitle
    ...
  }
}
```



 `useEffect`를 통해 렌더링 초반에 props에 원하는 설정을 할 수 있다.

네비게이션 옵션도 위 예시처럼적극적으로 사용해보자.





<br />

---

## Dispatch Actions, Reducer 로직



리듀서를 작성하면서, 리듀서는 state와 action 파라미터를 받는다.

액션 타입에 따라 리듀서함수는 다른 리턴값을 내보낸다.

즉, 같은 state 를 입력받아서, 각기 다른 action 마다 다른 데이터를 내보내 주게 함수를 구성하는 것이다.



`actions/meals.js`

```javascript
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';

export const toggleFavorite = (id) => {
  return { type: TOGGLE_FAVORITE, mealId: id };
}
```



`reducers/meals.js`

```javascript
...
const mealsReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_FAVORITE:
      const existingIndex = state.favoriteMeals.findIndex(meal => meal.id === action.mealId);
      ...
      return { ...state, favoriteMeals: updatedFavMeals}
    default:
      return state;
  }
}
```



이제 화면에서 이 데이터를 가져오는 액션을 취하기 위해서 `useDispatch` 함수를 사용한다.

```javascript
const MealDetailScreen = props => {
  const availableMeals = useSelector(state => state.meals.meals);
  const mealId = props.navigation.getParam('mealId');

  const selectedMeal = availableMeals.find(meal => meal.id === mealId);

  const dispatch = useDispatch();
  const toggleFavoriteHandler = useCallback(() => {
    dispatch(toggleFavorite(mealId));
  }, [dispatch, mealId]);
  
  return {...};
};
```



---

## Rendering a Fallback text

```jsx
const FavortesScreen = props => {
  const favMeals = useSelector(state => state.meals.favoriteMeals);

  if (favMeals.length === 0 || !favMeals) {
    return (
      <View style={styles.content}>
        <DefaultText>Default Text</DefaultText>
      </View>
    )
  }
}
```





유용한 자료

- Official Redux Docs: https://redux.js.org/introduction/getting-started
- React Redux Docs: https://react-redux.js.org/
- Redux vs Context API: https://academind.com/learn/react/redux-vs-context-api















