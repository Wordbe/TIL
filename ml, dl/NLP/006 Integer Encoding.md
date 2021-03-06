# 6. Integer Encoding

컴퓨터는 텍스트보다 숫자를 더 잘 처리할 수 있습니다. 이에 따라 자연어 처리에서는 텍스트를 숫자로 바꾸는 여러기법들이 있습니다.

이 때 각 단어를 고유한 정수에 맵핑(mapping)시키는 전처리 작업이 필요합니다.

각 단어에 인덱스를 부여하는 방법은 여러 가지가 있는데 랜덤으로 부여할 수 도 있지만, 보통 전처리 또는 빈도수가 높은 단어들만 사용하기 위해 빈도수를 기준으로 정렬한 뒤에 인덱스를 부여합니다.



## 1) 정수 인코딩

**(1) Dictionary 사용하기**

```python
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

text = "A barber is a person. a barber is good person. a barber is huge person. he Knew A Secret! The Secret He Kept is huge secret. Huge secret. His barber kept his word. a barber kept his word. His barber kept his secret. But keeping and keeping such a huge secret to himself was driving the barber crazy. the barber went up a huge mountain."

# 문장 토큰화
text = sent_tokenize(text)
>>
['A barber is a person.', 'a barber is good person.', 'a barber is huge person.', 'he Knew A Secret!', 'The Secret He Kept is huge secret.', 'Huge secret.', 'His barber kept his word.', 'a barber kept his word.', 'His barber kept his secret.', 'But keeping and keeping such a huge secret to himself was driving the barber crazy.', 'the barber went up a huge mountain.']
```

이제 정제 작업을 병행하며 단어 토큰화를 수행해봅니다.

```python
# 정제와 단어 토큰화
vocab = {} # 파이썬의 dictionary 자료형
sentences = []
stop_words = set(stopwords.words('english'))

for i in text:
    sentence = word_tokenize(i) # 단어 토큰화 수행
    result = []

    for word in sentence: 
        word = word.lower() # 모든 단어를 소문자화하여 단어의 개수를 줄입니다.
        if word not in stop_words: # 단어 토큰화 된 결과에 대해서 불용어를 제거합니다.
            if len(word) > 2: # 단어 길이가 2이하인 경우에 대하여 추가로 단어를 제거합니다.
                result.append(word)
                if word not in vocab:
                    vocab[word] = 0 
                vocab[word] += 1
    sentences.append(result)
    
print(sentences)
>>
[['barber', 'person'], ['barber', 'good', 'person'], ['barber', 'huge', 'person'], ['knew', 'secret'], ['secret', 'kept', 'huge', 'secret'], ['huge', 'secret'], ['barber', 'kept', 'word'], ['barber', 'kept', 'word'], ['barber', 'kept', 'secret'], ['keeping', 'keeping', 'huge', 'secret', 'driving', 'barber', 'crazy'], ['barber', 'went', 'huge', 'mountain']]

print(vocab)
>>
{'barber': 8, 'person': 3, 'good': 1, 'huge': 5, 'knew': 1, 'secret': 6, 'kept': 4, 'word': 2, 'keeping': 2, 'driving': 1, 'crazy': 1, 'went': 1, 'mountain': 1}
```



다음은 빈도가 높은 순서대로 정렬해봅니다.

```python
vocab_sorted = sorted(vocab.items(), key=lambda x:x[1], reverse=True)
print(vocab_sorted)
>>
[('barber', 8), ('secret', 6), ('huge', 5), ('kept', 4), ('person', 3), ('word', 2), ('keeping', 2), ('good', 1), ('knew', 1), ('driving', 1), ('crazy', 1), ('went', 1), ('mountain', 1)]
```



높은 빈도수를 가진 단어일수록 낮은 정수 인덱스를 부여합니다.

```python
word_to_index = {}
i = 0
for (word, frequency) in vocab_sorted :
    if frequency > 1 : # 정제(Cleaning) 챕터에서 언급했듯이 빈도수가 적은 단어는 제외한다.
        i = i+1
        word_to_index[word] = i

print(word_to_index)
>>
{'barber': 1, 'person': 2, 'huge': 3, 'secret': 4, 'kept': 5, 'word': 6, 'keeping': 7}
```

여기서는 빈도수가 적은 단어를 제외시키는 작업을 합니다. **등장 빈도가 낮은 단어는 자연어 처리에서 의미를 가지지 않을 가능성이 높기 때문입니다.**



자연어 처리를 하다보면, 텍스트 데이터에 있는 단어를 모두 사용하기 보다는, 빈도수가 가장 높은 n개의 단어만 사용하고 싶은 경우가 생깁니다.

```python
vocab_size = 5
words_frequency = [w for w,c in word_to_index.items() if c >= vocab_size + 1] # 인덱스가 5 초과인 단어 제거
for w in words_frequency:
    del word_to_index[w] # 해당 단어에 대한 인덱스 정보를 삭제
```

이제 word_to_index에는 빈도수가 높은 상위 5개 단어만 저장되어 있습니다.

이를 사용하여 단어 토큰화가 된 상태로 저장된 sentences에 있는 각 단어를 정수로 바꾸는 작업을 해봅니다.



훈련 데이터 또는 테스트 데이터에 대해서 단어 집합에 존재하지 않는 단어를 out-of-vocabulary(단어 집합에 없는 단어)의 약자로 OOV라고 합니다.

```python
word_to_index['OOV'] = len(word_to_index) + 1
```



이제 word_to_index를 통해 sentences의 모든 단어들이 맵핑되는 정수로 인코딩을 합니다.

```python
encoded=[]
for s in sentences:
    temp = []
    for w in s:
        try:
            temp.append(word_to_index[w])
        except KeyError:
            temp.append(word_to_index['OOV'])
    encoded.append(temp)
    
print(encoded)
>>
[[1, 5], [1, 6, 5], [1, 3, 5], [6, 2], [2, 4, 3, 2], [3, 2], [1, 4, 6], [1, 4, 6], [1, 4, 2], [6, 6, 3, 2, 6, 1, 6], [1, 6, 3, 6]]
```



---

**(2) Counter 사용하기**

```python
from collections import Counter
sentences = [['barber', 'person'], ['barber', 'good', 'person'], ['barber', 'huge', 'person'], ['knew', 'secret'], ['secret', 'kept', 'huge', 'secret'], ['huge', 'secret'], ['barber', 'kept', 'word'], ['barber', 'kept', 'word'], ['barber', 'kept', 'secret'], ['keeping', 'keeping', 'huge', 'secret', 'driving', 'barber', 'crazy'], ['barber', 'went', 'huge', 'mountain']]

words = sum(sentences, [])
# 위 작업은 words = np.hstack(sentences)로도 수행 가능.
print(words)
>>
['barber', 'person', 'barber', 'good', 'person', 'barber', 'huge', 'person', 'knew', 'secret', 'secret', 'kept', 'huge', 'secret', 'huge', 'secret', 'barber', 'kept', 'word', 'barber', 'kept', 'word', 'barber', 'kept', 'secret', 'keeping', 'keeping', 'huge', 'secret', 'driving', 'barber', 'crazy', 'barber', 'went', 'huge', 'mountain']

vocab = Counter(words) # 파이썬의 Counter 모듈을 이용하면 단어의 모든 빈도를 쉽게 계산할 수 있습니다.
print(vocab)
>>
Counter({'barber': 8, 'secret': 6, 'huge': 5, 'kept': 4, 'person': 3, 'word': 2, 'keeping': 2, 'good': 1, 'knew': 1, 'driving': 1, 'crazy': 1, 'went': 1, 'mountain': 1})
```

```python
vocab_size=5
vocab = vocab.most_common(vocab_size) # 등장 빈도수가 높은 상위 5개의 단어만 저장
vocab
>>
[('barber', 8), ('secret', 6), ('huge', 5), ('kept', 4), ('person', 3)]


word_to_index={}
i=0
for (word, frequency) in vocab :
    i=i+1
    word_to_index[word]=i
print(word_to_index)
>>
{'barber': 1, 'secret': 2, 'huge': 3, 'kept': 4, 'person': 5}
```





---

**(3) NLTK의 FreqDist 사용하기**

```python
from nltk import FreqDist
import numpy as np

# np.hstack으로 문장 구분을 제거하여 입력으로 사용 . ex) ['barber', 'person', 'barber', 'good' ... 중략 ...
vocab = FreqDist(np.hstack(sentences))
```

NLTK에서는 빈도수 계산 도구인 FreqDist()를 지원합니다. Counter()와 같은 방법으로 사용 가능합니다.





---

## 2) Keras 텍스트 전처리

```python
from tensorflow.keras.preprocessing.text import Tokenizer

sentences=[['barber', 'person'], ['barber', 'good', 'person'], ['barber', 'huge', 'person'], ['knew', 'secret'], ['secret', 'kept', 'huge', 'secret'], ['huge', 'secret'], ['barber', 'kept', 'word'], ['barber', 'kept', 'word'], ['barber', 'kept', 'secret'], ['keeping', 'keeping', 'huge', 'secret', 'driving', 'barber', 'crazy'], ['barber', 'went', 'huge', 'mountain']]

tokenizer = Tokenizer()
tokenizer.fit_on_texts(sentences) # fit_on_texts()안에 코퍼스를 입력으로 하면 빈도수를 기준으로 단어 집합을 생성한다.
print(tokenizer.word_index)
>>
{'barber': 1, 'secret': 2, 'huge': 3, 'kept': 4, 'person': 5, 'word': 6, 'keeping': 7, 'good': 8, 'knew': 9, 'driving': 10, 'crazy': 11, 'went': 12, 'mountain': 13}

print(tokenizer.word_counts)
>>
OrderedDict([('barber', 8), ('person', 3), ('good', 1), ('huge', 5), ('knew', 1), ('secret', 6), ('kept', 4), ('word', 2), ('keeping', 2), ('driving', 1), ('crazy', 1), ('went', 1), ('mountain', 1)])

print(tokenizer.texts_to_sequences(sentences))
>>
[[1, 5], [1, 8, 5], [1, 3, 5], [9, 2], [2, 4, 3, 2], [3, 2], [1, 4, 6], [1, 4, 6], [1, 4, 2], [7, 7, 3, 2, 10, 1, 11], [1, 12, 3, 13]]


vocab_size=5
tokenizer = Tokenizer(num_words=vocab_size+1) # 상위 5개 단어만 사용
tokenizer.fit_on_texts(sentences)

```



케라스 tokenizer는 기본적으로 단어 집합에 없는 단어인 OOV에 대해서는 단어를 정수로 바꾸는 과정에서 아예 단어를 제거한다는 특성이 있습니다. 단어 집합에 없는 단어들을 OOV로 간주하여 보존하고 싶다면 Tokenizer의 인자 oov_token을 사용합니다.



```python
vocab_size=5
tokenizer = Tokenizer(num_words=vocab_size+2, oov_token='OOV')
# 빈도수 상위 5개 단어만 사용. 숫자 0과 OOV를 고려해서 단어 집합의 크기는 +2
tokenizer.fit_on_texts(sentences)
```



이제 코퍼스에 대해서 정수 인코딩을 해봅니다.

```python
print(tokenizer.texts_to_sequences(sentences))
>>
[[2, 6], [2, 1, 6], [2, 4, 6], [1, 3], [3, 5, 4, 3], [4, 3], [2, 5, 1], [2, 5, 1], [2, 5, 3], [1, 1, 4, 3, 1, 2, 1], [2, 1, 4, 1]]
```





---

Reference

https://wikidocs.net/31766