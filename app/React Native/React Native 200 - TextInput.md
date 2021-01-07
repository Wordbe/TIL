# React Native 200 - TextInput



[리액트네이티브 공식 사이트](https://reactnative.dev/docs/textinput) 를 방문하면 TextInput 의 사용법을 자세하게 알 수 있다.



```
<TextInput
  style={styles.input}
  value={title}
  onChangeText={(text) => setTitle(text)}
  autoCapitalize="sentences"
  autoCorrect
  returnKeyType="next"
  onEndEditing={() => console.log("onEndEditing")}
  onSubmitEditing={() => console.log("onSubmitEditing")}
/>
```



TextInput 에 여러 아규먼트를 사용할 수 있다.

신기한 기능들이 많은데 하나씩 살펴보자

대부분은 이름에서 알 수 있다. 헷갈리는 것만 기록한다.

* `onChangeText` : 텍스트가 바뀔 때 마다 함수 적용
* `returnKeyType` : 자판 UI를 보면, 엔터버튼이 '완료' 대신 '다음' 이라고 뜨는 것을 확인할 수 있다.
* `onEndEditting` : 수정이 끝났을 때 함수를 호출한다.
* `onSubmitEditting` : 완료 버튼을 눌렀을 때(submit) 함수를 호출한다.





---

## 유효값 확인

`useState` 를 통해 간단히 만들어보자.

```jsx
...

const [titleValid, setTitleValid] = useState(false);
const titleChangeHandler = (text) => {
  if (text.trim().length === 0) {
    setTitleValid(false);
  } else {
    setTitleValid(true);
  }
  setTitle(text);
};

return (
          ...
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={(text) => titleChangeHandler(text)}
          />
			   {!titleValid && <Text>제목을 입력해 주세요.</Text>}
)
```

 위 처럼 만들면, 처음에는 `titleValid` 가 `false` 이기 때문에 제목 입력 인풋아래 '제목을 입력해 주세요.' 라는 문구가 표시 된다.

하지만, 텍스트를 입력하면 `onChangeText` 함수가 호출되므로, `tilteValid`가 `true` 로 변환되어 더 이상 문구가 보이지 않게 된다.





> 참고 : 유효값 체크에서 더 많은 기능을 원하면 서드파티 라이브러리인 Validate.js 를 이용하면 좋다.



---

### useReducer 사용



`react-redux` 는 리액트 네이티브 전체에서 상태관리를 하는데 유용한 스토어를 만들어준다.

하지만, 전체 단위로는 필요하지않고, 하나의 컴포넌트 안에서 데이터의 상태를 관리하고 싶을 때가 있다.

`useState` 를 사용하는 방법이 있지만, 관리하는 변수가 여러개면 일일이 하나씩 `useState` 를 만들어야 한다.

변수가 여러개지만, 하나의 컴포넌트 안에서 데이터 상태를 관리하고 싶다면 `useReducer` 를 사용해도 좋다.



```javascript
import React, { useReducer, useEffect } from 'react';

const inputReducer = (state, action) => {
  switch (action.type) {
    case INPUT_CHANGE:
      return {
        ...state,
        value: action.value,
        isValid: action.isValid
      };
    case INPUT_BLUR:
      return {
        ...state,
        touched: true
      };
    default:
      return state;
  }
};
```



컴포넌트 밖에 리듀서를 설정해준다.

인풋이 변경될 때 액션은 value와 isValid를 액션에서 받아온 값으로 바꾸어준다.

`INPUT_BLUR` 액션은 `touched`를 참으로 바꾸어준다. 이는 인풋텍스트를 한 번 터치했을때를 기억하기 위함이다. 텍스트를 한번 건드렸는데, 유효값이 아닌 상태로 (완성하지 않은 상태로) 그 텍스트인풋을 벗어나면 밑에 에러텍스트를 보여주기 위함이다.





```jsx
const Input = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue ? props.initialValue : '',
    isValid: props.initiallyValid,
    touched: false
  });

  const { onInputChange, id } = props;

  useEffect(() => {
    if (inputState.touched) {
      props.onInputChange(id, inputState.value, inputState.isValid);
    }
  }, [inputState, onInputChange, id]);

  const textChangeHandler = (text) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;
    if (props.required && text.trim().length === 0) {
      isValid = false;
    }
    if (props.email && !emailRegex.test(text.toLowerCase())) {
      isValid = false;
    }
    if (props.min != null && +text < props.min) {
      isValid = false;
    }
    if (props.max != null && +text > props.max) {
      isValid = false;
    }
    if (props.minLength != null && text.length < props.minLength) {
      isValid = false;
    }
    dispatch({ type: INPUT_CHANGE, value: text, isValid: isValid });
  };

  const lostFocusHandler = () => {
    dispatch({ type: INPUT_BLUR });
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        value={inputState.value}
        onChangeText={textChangeHandler}
        onBlur={lostFocusHandler}
      />
      {!inputState.isValid && inputState.touched && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorText}</Text>
        </View>
      )}
    </View>
  );
};
```



윗줄부터 보면, reducer의 초깃값을 설정해준다. `props` 에서 받아온 초기값이 있으면 초기값으로 `value` 에 넣어주고 그렇지 않으면 빈 스트리을 넣어준다.

`isValid`, `touched` 또한 이해가 갈 것이라 생각한다.



`props` 에서는 `onInputChange`, `id` 두개의 객체를 받아올 것이다.

우리는 텍스트인풋에서 텍스트를 변경할 때(`onChangeText`) `textChangeHandler` 를 호출한다. 이는 입력한 텍스트의 유효값을 확인하고 `INPUT_CHANGE` 액션을 호출하여 `text`, `isValid` 값을 업데이트한다.

상태가 변경된 데이터가 존재하는 순간 `useEffect` 가 실행되어 `props` 에서 받아 온 `onInputChange` 를 호출한다.





`useReducer`는 사용법이 약간 복잡하지만,

데이터의 상태 관리를 해줄 수 있는 훌륭한 도구이다.

여기서의 상태는 클라이언트의 메모리에서 유지가 되는데, 너무 많은 데이터를 저장하고 있으면

속도저하 등의 이슈가 생길 것이다.

하지만, 유효 값 체크 정도는 괜찮은 것 같다.

---









### JavaScript 참고

#### double bang (!!) 연산자

- 객체(Object)를 boolean으로 바꾸어준다.
- 거짓(0, null, undefined) 이면 `false`를 반환하고, 아니면 `true` 를 반환한다.

```js
!!oObject
```



#### + 연산자

- 객체의 숫자표현을 리턴한다.

```javascript
+text
```



### Validate.js

Formik

- React, React Native 에서 빌드를 쉽게 할 수 있도록 도와주는 라이브러리이다.
- 화면에서 데이터를 입력하는 즉시, 어떤 부분이 바뀌는지 브라우저에서 바로 볼 수 있다.



