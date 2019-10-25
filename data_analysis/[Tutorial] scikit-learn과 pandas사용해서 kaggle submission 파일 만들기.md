# ****[Tutorial] scikit-learn과 pandas사용해서 kaggle submission 파일 만들기



pandas, scikit-learn 을 이용해 캐글 과제물 submission.csv 을 제작해보겠습니다.



데이터셋은 다음과 같습니다.

```python
import pandas as pd
train = pd.read_csv('http://bit.ly/kaggletrain')

train.head()
```

| FIELD1 | PassengerId | Survived | Pclass | Name                                                | Sex    | Age  | SibSp | Parch | Ticket           | Fare    | Cabin | Embarked |
| ------ | ----------- | -------- | ------ | --------------------------------------------------- | ------ | ---- | ----- | ----- | ---------------- | ------- | ----- | -------- |
| 0      | 1           | 0        | 3      | Braund, Mr. Owen Harris                             | male   | 22.0 | 1     | 0     | A/5 21171        | 7.25    |       | S        |
| 1      | 2           | 1        | 1      | Cumings, Mrs. John Bradley (Florence Briggs Thayer) | female | 38.0 | 1     | 0     | PC 17599         | 71.2833 | C85   | C        |
| 2      | 3           | 1        | 3      | Heikkinen, Miss. Laina                              | female | 26.0 | 0     | 0     | STON/O2. 3101282 | 7.925   |       | S        |
| 3      | 4           | 1        | 1      | Futrelle, Mrs. Jacques Heath (Lily May Peel)        | female | 35.0 | 1     | 0     | 113803           | 53.1    | C123  | S        |
| 4      | 5           | 0        | 3      | Allen, Mr. William Henry                            | male   | 35.0 | 0     | 0     | 373450           | 8.05    |       | S        |



---



본 과제는 **"여러 특성을 이용해 타이타닉호에서 생존여부를 예측하는 과제"** 입니다.

우리는 두가지 특징을 추출해서

간단한 linear regression 모델로 예측해봅시다.



```python
feature_cols = ['Pclass', 'Parch']
X = train.loc[:, feature_cols]
X.shape # (891, 2)
y = train.Survived
y.shape # (891,)

from sklearn.linear_model import LogisticRegression
logreg = LogisticRegression()
logreg.fit(X, y)
```

(x, y) 셋에서 MSE 가 최소가 되게 하는 파라미터 w1, w2를 찾기 위해 미분하는 과정이

LogisticRegression()에 그대로 들어있겠네요.



1차 함수로 fit시켜 파라미터(모델)를 얻습니다.



---

**test셋에 대해 예측하기**

```python
test = pd.read_csv('http://bit.ly/kaggletest')
X_new = test.loc[:, feature_cols]
X_new.shape # (418, 2)

new_pred_class = logreg.predict(X_new) # 예측
new_pred_class.shape # (418,)
```



418개의 예측결과값이 나왔습니다.

우리는 'PassengerId'와 그에 대응하는 결괏값 'Survived'가 있는 테이블을 만들어

이를 'submission.csv'파일로 저장할 것입니다.



pandas로 한줄이면 됩니다.

```python
pd.DataFrame({'PassengerId': test.PassengerId, 'Survived': new_pred_class}).set_index('PassengerId').to_csv('sub.csv')
```



---

#### TIP

pickle 파일로 저장할 수 도 있습니다. 용량을 줄인 효율적인 파일입니다.

```python
train.to_pickle('train.pk1')
```

물론 가져올 수도 있습니다.

```python
pd.read_pickle('train.pk1')
```





