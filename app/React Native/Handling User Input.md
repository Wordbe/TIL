# Handling User Input



## TextInput

TextInput 에는 다양한 옵션들이 있습니다.

```jsx
<TextInput 
	...
    keyboardType='default'
    autoCapitalize='sentences'
    autoCorrect
    returnKeyType='next'
    onEndEditing={() => console.log("onEndEditing")}
    onSubmitEditing={() => console.log("onSubmitEditing")}
/>
```

예를 들어 keyboardType으로 키보드 타입을 설정할 수 있습니다.

다양한 옵션을 사용해봅시다.



## Validating Text

텍스트가 올바른 지 검정하는 방법은 여러가지가 있지만, Validate.js 를 사용할 수도 있습니다.



```
wget --no-check-certificate 'https://docs.google.com/uc?export=download&id=FILEID' -O FILENAME
```

```
wget --load-cookies /tmp/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=FILEID' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=FILEID" -O FILENAME && rm -rf /tmp/cookies.txt
```





```
wget --load-cookies /tmp/cookies.txt "https://drive.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://drive.google.com/uc?export=download&id=10WWR4Jc7s0YPG4k4ZFhe3jqlFRGEQMGG' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=10WWR4Jc7s0YPG4k4ZFhe3jqlFRGEQMGG" -O 337_skbase_skhynix_contest_baseline.zip && rm -rf /tmp/cookies.txt
```



## useReducer

