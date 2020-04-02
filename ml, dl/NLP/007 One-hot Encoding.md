# 7. One-hot Encoding



## 1) 원-핫 인코딩

원-핫 인코딩은 그 많은 기법 중에서 단어를 표현하는 가장 기본적인 표현 방법이며,

머신러닝, 딥 러닝에서 자주 쓰이는 방법입니다.



>  **단어 집합(vocabulary) 이란?**

- 사전(vocabulary)라고도 부릅니다.

- 서로 다른 단어들의 집합입니다. 

  book과 books 같이 단어으이 변형 형태도 다른 단어로 간주합니다.



원-핫 인코딩을 위해서 먼저 해야 할 일은 단어 집합을 만드는 것입니다. 텍스트의 모든 단어를 중복을 허용하지 않고 모아놓으면 단어 집합이라고 합니다. 그리고 단어 집합에 고유한 숫자를 부여하여 정수 인코딩을 진행합니다. 

각 단어에 고유한 정수 인덱스를 붙였다고 가정할 때, 숫자로 바뀐 단어들을 벡터로 다루고 싶으면 원-핫 인코딩을 사용하면 됩니다.

**원-핫 인코딩은 단어 집합의 크기를 벡터의 차원으로 하고, 표현하고 싶은 단어의 인덱스에 1의 값을 부여하고, 다른 인덱스에는 0을 부여하는 단어의 벡터 표현 방식**입니다. 이 벡터를 one-hot vector라고 합니다.

```python
from konlpy.tag import Okt

# 코엔엘파이 Okt 형태소 분석기를 통해 문장에 대해 토큰화를 수행합니다.
okt = Okt()  
token = okt.morphs("나는 자연어 처리를 배운다")  
print(token)
>>
['나', '는', '자연어', '처리', '를', '배운다']

word2index = {}
for voca in token:
     if voca not in word2index.keys():
       word2index[voca] = len(word2index)
print(word2index)
>>
{'나': 0, '는': 1, '자연어': 2, '처리': 3, '를': 4, '배운다': 5}

def one_hot_encoding(word, word2index):
       one_hot_vector = [0]*(len(word2index))
       index=word2index[word]
       one_hot_vector[index]=1
       return one_hot_vector

one_hot_encoding("자연어",word2index)
>>
[0, 0, 1, 0, 0, 0]  
```





## 2) keras를 이용한 원-핫 인코딩

케라스에서는 원-핫 인코딩을 수행하는 유용한 도구인 to_categorical()을 지원합니다.

```python
text = "나랑 점심 먹으러 갈래 점심 메뉴는 햄버거 갈래 갈래 햄버거 최고야"

from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.utils import to_categorical

text = "나랑 점심 먹으러 갈래 점심 메뉴는 햄버거 갈래 갈래 햄버거 최고야"

t = Tokenizer()
t.fit_on_texts([text])
print(t.word_index) # 각 단어에 대한 인코딩 결과 출력.
>>
{'갈래': 1, '점심': 2, '햄버거': 3, '나랑': 4, '먹으러': 5, '메뉴는': 6, '최고야': 7}
```

위와 같이 생성된 단어 집합에 있는 단어들로만 구성된 텍스트가 있다면, text_to_sequence()를 통해 정수 시퀀스로 변환이 가능합니다.



```python
sub_text = "점심 먹으러 갈래 메뉴는 햄버거 최고야"
encoded = t.texts_to_sequences([sub_text])[0]
print(encoded)
>>
[2, 5, 1, 6, 3, 7]
```

정수 인코딩을 완료했습니다.



```python
one_hot = to_categorical(encoded)
print(one_hot)
>>
[[0. 0. 1. 0. 0. 0. 0. 0.] #인덱스 2의 원-핫 벡터
 [0. 0. 0. 0. 0. 1. 0. 0.] #인덱스 5의 원-핫 벡터
 [0. 1. 0. 0. 0. 0. 0. 0.] #인덱스 1의 원-핫 벡터
 [0. 0. 0. 0. 0. 0. 1. 0.] #인덱스 6의 원-핫 벡터
 [0. 0. 0. 1. 0. 0. 0. 0.] #인덱스 3의 원-핫 벡터
 [0. 0. 0. 0. 0. 0. 0. 1.]] #인덱스 7의 원-핫 벡터
```

원-핫 인코딩을 완료했습니다.





## 3) 원-핫 인코딩의 한계

- 이러한 표현 방식은 단어의 개수가 늘어날 수록, 벡터를 저장하기 위한 공간이 증가한다는 단점이 있습니다. 

- 단어의 유사도를 표현하지 못합니다. 원-핫 벡터로는 강아지, 개, 냉장고 등의 단어가 있을 경우 어떤 단어가 서로 더 유사한 지 표현할 수 없습니다.

  이는 검색 시스템 등에서 심각한 문제가 됩니다.

  이러한 단점을 해결하기 위해서 단어의 잠재 의미를 반영하여 다차원 공간에 벡터화 하는 기법이 있습니다.

  (1) 카운트 기반의 벡터화 방법 - LSA, HAL

  (2) 예측 기반의 벡터화 방법 - NNLM, RNNLM, Word2Vec, FastText 등

  (3) 위 두가지 방법을 모두 사용 - GloVe



---

**Reference**

https://wikidocs.net/22647