# 4. Stopword 불용어

유의미한 단어 토큰을 선별하기 위해서는 의미가 없는 단어 토큰을 제거하는 작업이 필요합니다.

의미가 없다는 것은 자주 등장하지만 분석에는 큰 도움이 되지 않는 단어를 말합니다. 예를 들면 I, my, me, over, 조사, 접미사 등이 있습니다. 이러한 단어를 불용어(stopword)라고 하며, NLTK에서는 위와 같은 100여개 이상의 영어 단어들을 불용어로 패키지 내에서 미리 정의하고 있습니다.



불용어는 개발자가 직접 정의할 수도 있습니다.

이번 글에서는 영어 문장에서 NLTK가 정의한 영어 불용어를 제거하는 실습과 한국어 문장에서 직접 정의한 불용어를 제거해봅니다.



## 1) NLTK에서 불용어 확인하기

```python
from nltk.corpus import stopwords
stopwords.words('english')[:10]
>>
['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your']
```



## 2) NLTK를 통해 불용어 제거하기

```python
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize 

example = "Family is not an important thing. It's everything."
stop_words = set(stopwords.words('english')) 

word_tokens = word_tokenize(example)

result = []
for w in word_tokens: 
    if w not in stop_words: 
        result.append(w) 

print(word_tokens) 
print(result)
>>
['Family', 'is', 'not', 'an', 'important', 'thing', '.', 'It', "'s", 'everything', '.']
['Family', 'important', 'thing', '.', 'It', "'s", 'everything', '.']
```



## 3) 한국어에서 불용어 제거하기

한국어에서 불용어를 제거하는 방법으로는 간단하게는 토큰화 후 조사, 접속사 등을 제거하는 방법이 있습니다. 하지만 불용어를 제거하다보면 명사, 형용사 등도 제거해야 하는 상황이 오는데, 결국 사용자가 직접 불용어 사전을 만들게 되는 경우가 많습니다.

```python
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize 

example = "고기를 아무렇게나 구우려고 하면 안 돼. 고기라고 다 같은 게 아니거든. 예컨대 삼겹살을 구울 때는 중요한 게 있지."
stop_words = "아무거나 아무렇게나 어찌하든지 같다 비슷하다 예컨대 이럴정도로 하면 아니거든"
# 위의 불용어는 명사가 아닌 단어 중에서 저자가 임의로 선정한 것으로 실제 의미있는 선정 기준이 아님
stop_words=stop_words.split(' ')
word_tokens = word_tokenize(example)

result=[word for word in word_tokens if not word in stop_words]

print(word_tokens) 
print(result)
>>
['고기를', '아무렇게나', '구우려고', '하면', '안', '돼', '.', '고기라고', '다', '같은', '게', '아니거든', '.', '예컨대', '삼겹살을', '구울', '때는', '중요한', '게', '있지', '.']
['고기를', '구우려고', '안', '돼', '.', '고기라고', '다', '같은', '게', '.', '삼겹살을', '구울', '때는', '중요한', '게', '있지', '.']
```



---

**Reference**

https://wikidocs.net/22530