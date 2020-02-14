# 1. Introducing the dataset

NaN : Not a number, missing value, 삭제해서 없어졌거나, 관련이 없는 값

​	실제 데이터와 missing 데이터를 구분하기 위해 0, 빈문자열 등으로 표시하지 않고, NaN으로 표기



각 column 마다 missing data의 개수

```python
ri = pd.read_csv(datapath)
ri.isnull().sum()

>>
raw_row_number            0
date                      0
time                      0
lat                   13310
lng                   13310
subject_age              26
subject_race              7
subject_sex              32
type                      0
citation_issued           0
outcome                   0
vehicle_type              0
raw_defendant_race        0
dtype: int64
```



.sum()은 인덱스 0축(0번째 열)을 기준으로 다 더한다.

True == 1이고, False == 0이기 때문에, 다 더하면 개수를 세는 것과 같다.



# 2. Removing Columns(.drop())



미싱밸류가 있는 열만 제거해보자.



위 결과에서 'lat' 열로 예를 들어보면, 이것은 전체 행수 13641보다 작다.

즉, missing value가 있다.

```python
ri.shape
>> (13641, 13)
```



이 열을 제거해보자.

```python
ri.drop('lat', axis='columns', inplace=True) # axis=1와 같음
ri = ri.drop('lat', axis=1) # 위 문장과 같다. inplace는 변경 결과를 ri에 대입하겠다는 의미이다.
```



결과를 보면, 'lat' 열이 사라진 것을 확인할 수 있다.



그렇다면, missing value가 있는 모든 열을 제거하고 싶다면 어떨까?

이 말그대로 코드로 옮기면된다. 참 pythonic, pandasic(?) 하다.

```python
ri.dropna(axis='columns', inplace=True)
```



마지막으로, 결측값(missing value)만 있는 열을 제거하고 싶다면,

```python
ri.dropna(axis='columns', how='all', inplace=True)
```

이라고 하면 되겠습니다. how의 default값은 'any'로, NaN이 하나만 있어도 삭제하는데,

'all'이면 열의 모든 원소가 NaN이어야 삭제합니다.

