# 12 Word Embedding 3 - Word2Vec 영어 실습

Word2Vec은 genism 패키지에 구현돼있습니다.

## 1 영어 Word2Vec

[training data 다운로드](https://wit3.fbk.eu/get.php?path=XML_releases/xml/ted_en-20160408.zip&filename=ted_en-20160408.zip)

위 데이터를 다운로드하고, 압축을 풀어봅시다.

**ted_en-20160408.xml**

```xml
<file id="1">
  <head>
<url>http://www.ted.com/talks/knut_haanaes_two_reasons_companies_fail_and_how_to_avoid_them</url>
       <pagesize>72832</pagesize>
... xml 문법 중략 ...
<content>
Here are two reasons companies fail: they only do more of the same, or they only do what's new.
To me the real, real solution to quality growth is figuring out the balance between two activities:
... content 내용 중략 ...
To me, the irony about the Facit story is hearing about the Facit engineers, who had bought cheap, small electronic calculators in Japan that they used to double-check their calculators.
(Laughter)
... content 내용 중략 ...
(Applause)
</content>
</file>
<file id="2">
    <head>
<url>http://www.ted.com/talks/lisa_nip_how_humans_could_evolve_to_survive_in_space<url>
... 이하 중략 ...
```

얻고자 하는 실질적 데이터는 영어 문장으로만 구성된 \<content\>와 \</content\> 사이의 내용입니다. 해야할 일은 크게 두 가지입니다. 

* 1) 전처리 작업을 통해 xml 문법들은 제거합니다. 
* 2) 둘째, 내용 중 (Laughter)나 (Applause)와 같은 배경음을 나타내는 단어들을 제거해야 합니다.

<br>

## 2 Data Load, Preprocessing

```python
import re
from lxml import etree
import urllib.request
import zipfile
from nltk.tokenize import word_tokenize, sent_tokenize

urllib.request.urlretrieve("https://wit3.fbk.eu/get.php?path=XML_releases/xml/ted_en-20160408.zip&filename=ted_en-20160408.zip", filename="ted_en-20160408.zip")
# 데이터 다운로드

with zipfile.ZipFile('ted_en-20160408.zip', 'r') as z:
  target_text = etree.parse(z.open('ted_en-20160408.xml', 'r'))
  parse_text = '\n'.join(target_text.xpath('//content/text()'))
# xml 파일로부터 <content>와 </content> 사이의 내용만 가져온다.
```



300개 출력

```python
parse_text[:300]
```



전처리 수행

```python
content_text = re.sub(r'\([^)]*\)', '', parse_text)
# 정규 표현식의 sub 모듈을 통해 content 중간에 등장하는 (Audio), (Laughter) 등의 배경음 부분을 제거.
# 해당 코드는 괄호로 구성된 내용을 제거.

sent_text=sent_tokenize(content_text)
# 입력 코퍼스에 대해서 NLTK를 이용하여 문장 토큰화를 수행.

normalized_text = []
for string in sent_text:
     tokens = re.sub(r"[^a-z0-9]+", " ", string.lower())
     normalized_text.append(tokens)
# 각 문장에 대해서 구두점을 제거하고, 대문자를 소문자로 변환.

result = [word_tokenize(sentence) for sentence in normalized_text]
# 각 문장에 대해서 NLTK를 이용하여 단어 토큰화를 수행.
```

총 샘플의 갯수는 약 27만 3천개 입니다. 또한 토큰화 된 결과를 봅시다.

```python
print('총 샘플의 개수 : {}'.format(len(result)))
>> 총 샘플의 개수 : 273424
```



```python
for line in result[:3]: # 샘플 3개만 출력
    print(line)
```



```python
['here', 'are', 'two', 'reasons', 'companies', 'fail', 'they', 'only', 'do', 'more', 'of', 'the', 'same', 'or', 'they', 'only', 'do', 'what', 's', 'new']
['to', 'me', 'the', 'real', 'real', 'solution', 'to', 'quality', 'growth', 'is', 'figuring', 'out', 'the', 'balance', 'between', 'two', 'activities', 'exploration', 'and', 'exploitation']
['both', 'are', 'necessary', 'but', 'it', 'can', 'be', 'too', 'much', 'of', 'a', 'good', 'thing']
```

<br>

## 3 Word2Vec 훈련

```python
from gensim.models import Word2Vec
model = Word2Vec(sentences=result, size=100, window=5, min_count=5, workers=4, sg=0)
```

여기서 Word2Vec의 하이퍼파라미터값은 다음과 같습니다.
**size** = 워드 벡터의 특징 값. 즉, 임베딩 된 벡터의 차원.
**window** = 컨텍스트 윈도우 크기
**min_count** = 단어 최소 빈도 수 제한 (빈도가 적은 단어들은 학습하지 않는다.)
**workers** = 학습을 위한 프로세스 수
**sg** = 0은 CBOW, 1은 Skip-gram.

이제 Word2Vec에 대해서 학습을 진행하였습니다. Word2Vec는 입력한 단어에 대해서 가장 유사한 단어들을 출력하는 model.wv.most_similar을 지원합니다. man과 가장 유사한 단어들은 어떤 단어들일까요?

```python
model_result = model.wv.most_similar("man")
print(model_result)
>>
[('woman', 0.842622697353363), ('guy', 0.8178728818893433), ('boy', 0.7774451375007629), ('lady', 0.7767927646636963), ('girl', 0.7583760023117065), ('gentleman', 0.7437191009521484), ('soldier', 0.7413754463195801), ('poet', 0.7060446739196777), ('kid', 0.6925194263458252), ('friend', 0.6572611331939697)]
```

man과 유사한 단어로 woman, guy, boy, lady, girl, gentleman, soldier, kid 등을 출력하는 것을 볼 수 있습니다. 이제 Word2Vec를 통해 단어의 유사도를 계산할 수 있게 되었습니다.

<br>

## **4) Word2Vec 모델 저장하고 로드하기**

공들여 학습한 모델을 언제든 나중에 다시 사용할 수 있도록 컴퓨터 파일로 저장하고 다시 로드해보겠습니다. 이 모델을 가지고 시각화 챕터에서 시각화를 진행할 예정이므로 꼭 저장해주세요.

```python
from gensim.models import KeyedVectors
model.wv.save_word2vec_format('eng_w2v') # 모델 저장
loaded_model = KeyedVectors.load_word2vec_format("eng_w2v") # 모델 로드
```

로드한 모델에 대해서 다시 man과 유사한 단어를 출력해보겠습니다.

```python
model_result = loaded_model.most_similar("man")
print(model_result)
[('woman', 0.842622697353363), ('guy', 0.8178728818893433), ('boy', 0.7774451375007629), ('lady', 0.7767927646636963), ('girl', 0.7583760023117065), ('gentleman', 0.7437191009521484), ('soldier', 0.7413754463195801), ('poet', 0.7060446739196777), ('kid', 0.6925194263458252), ('friend', 0.6572611331939697)]
```

---

<br>

