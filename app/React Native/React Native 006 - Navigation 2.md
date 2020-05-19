# React Native 006 - Navigation 2

## Loading Meals for Categories

```javascript
function CategoryMealScreen(props) {
  const catId = props.navigation.getParam('categoryId');
  const selectedCategory = CATEGORIES.find((cat) => cat.id === catId);

  const displayedMeals = MEALS.filter

  return (
    <View style={styles.screen}>
      <Text>The Category Meal Screen!</Text>
      <Text>{selectedCategory.title}</Text>
      <Button
        title="Go to Details"
        onPress={() => {
          props.navigation.navigate({
            routeName: 'MealDetail'
          });
        }}
      />
      <Button
        title="Go Back"
        onPress={() => {
          props.navigation.goBack();
        }}
      />
    </View>
  );
}
```

