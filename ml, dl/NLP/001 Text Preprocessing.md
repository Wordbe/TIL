# Text Preprocessing

## 1. 토큰화(Tokenization)

코퍼스(corpus, 말뭉치) 데이터를 토큰(token) 단위로 나누는 작업을 토큰화라고 합니다.



## 1) 단어 토큰화 (Word Tokenization)

여기서 단어(word)는 단어구, 의미를 갖는 문자열로도 간주될 수 있습니다.

아래 입력으로부터 구두점(punctuation, 온점(.), 컴마(,), 물음표(?), 세미콜론(;), 느낌표(!)  등) 문자를 제거하는 단어 토큰화 작업을 해봅니다.

```python
"Time is an illusion. Lunchtime double so!"
```

```python
>>
"Time", "is", "an", "illusion", "Lunchtime", "double", "so"
```

구두점을 지운 후 띄어쓰기(whitespace)를 기준으로 잘라내면 됩니다.

위는 구두점, 특수문자를 제거하는 정제(cleaning) 작업을 수행한 것이지만,

보통 토큰화 작업은 이러게 단순하지는 않습니다.

<br>

## 2) 토큰화 선택

토큰화 기준은 사람마다 다를 수 있습니다.

사용용도에 맞게 구분하는 것이 올바르며, 라이브러리 별 함수마다 다른 기능을 제공합니다.

```python
from nltk.tokensize import word_tokenize
print(word_tokenize("Don't be fooled by the dark sounding name, Mr. Jone's Orphanage is as cheery as cheery goes for a pastry shop."))

>>
['Do', "n't", 'be', 'fooled', 'by', 'the', 'dark', 'sounding', 'name', ',', 'Mr.', 'Jone', "'s", 'Orphanage', 'is', 'as', 'cheery', 'as', 'cheery', 'goes', 'for', 'a', 'pastry', 'shop', '.']
```

```python
from nltk.tokenize import WordPunctTokenizer  
print(WordPunctTokenizer().tokenize("Don't be fooled by the dark sounding name, Mr. Jone's Orphanage is as cheery as cheery goes for a pastry shop."))

>>
['Don', "'", 't', 'be', 'fooled', 'by', 'the', 'dark', 'sounding', 'name', ',', 'Mr', '.', 'Jone', "'", 's', 'Orphanage', 'is', 'as', 'cheery', 'as', 'cheery', 'goes', 'for', 'a', 'pastry', 'shop', '.'] 
```

```python
from tensorflow.keras.preprocessing.text import text_to_word_sequence
print(text_to_word_sequence("Don't be fooled by the dark sounding name, Mr. Jone's Orphanage is as cheery as cheery goes for a pastry shop."))

>>
["don't", 'be', 'fooled', 'by', 'the', 'dark', 'sounding', 'name', 'mr', "jone's", 'orphanage', 'is', 'as', 'cheery', 'as', 'cheery', 'goes', 'for', 'a', 'pastry', 'shop']
```



Don't 는 Do not의 줄임말이며, 여기서 t를 접어(clitic)라고 합니다. 즉, 단어가 줄임말로 쓰일 때 생기는 형태를 말합니다.

<br>

**Penn Treebank Tokenization**

규칙 1) 하이픈으로 구성된 단어는 하나로 유지한다.

규칙 2) doesn't와 같이 아포스트로피로 접어가 함께하는 단어는 분리한다.

```python
from nltk.tokenize import TreebankWordTokenizer
tokenizer=TreebankWordTokenizer()
text="Starting a home-based restaurant may be an ideal. it doesn't have a food chain or restaurant of their own."
print(tokenizer.tokenize(text))

>>
['Starting', 'a', 'home-based', 'restaurant', 'may', 'be', 'an', 'ideal.', 'it', 'does', "n't", 'have', 'a', 'food', 'chain', 'or', 'restaurant', 'of', 'their', 'own', '.'] 
```

<br>

## 3) 문장 토큰화(Sentence Tokenization)

이 작업은 코퍼스 내에서 문장 단위로 구분하는 작업으로, 문장 분류(Sentence segmentation)라고도 불립니다.

코퍼스는 정제되어 있지 않다면 보통 문장 단위로 구분되어 있을 가능성이 높습니다.

```python
from nltk.tokenize import sent_tokenize
text="His barber kept his word. But keeping such a huge secret to himself was driving him crazy. Finally, the barber went up a mountain and almost to the edge of a cliff. He dug a hole in the midst of some reeds. He looked about, to mae sure no one was near."
print(sent_tokenize(text))

>>
['His barber kept his word.', 'But keeping such a huge secret to himself was driving him crazy.', 'Finally, the barber went up a mountain and almost to the edge of a cliff.', 'He dug a hole in the midst of some reeds.', 'He looked about, to mae sure no one was near.']
```

한국어)

```python
import kss
text='딥 러닝 자연어 처리가 재미있기는 합니다. 그런데 문제는 영어보다 한국어로 할 때 너무 어려워요. 농담아니에요. 이제 해보면 알걸요?'
print(kss.split_sentences(text))

>>
['딥 러닝 자연어 처리가 재미있기는 합니다.', '그런데 문제는 영어보다 한국어로 할 때 너무 어려워요.', '농담아니에요.', '이제 해보면 알걸요?']
```

<br>

## 4) 이진 분류기(Binary Classifier)

문장 토큰화에서 예외 사항을 발생시키는 온점의 처리를 위해, 입력에 따라 두 개의 클래스로 분류하는 이진 분류기를 사용하기도 합니다.

1) 온점(.)이 단어의 일부분일 경우. 즉, 온점이 약어(abbreviation)로 쓰이는 경우 (거짓)

2) 온점(.)이 문장의 구분자(boundary)일 경우 (정상)



이러한 문장 토큰화를 수행하는 오픈 소스로는 NLTK, OpenNLP, StandFord CoreNLP, splitta, LingPipe 등이 있습니다.

<br>

## 5) 한국어에서 토큰화의 어려움

영어의 경우 대부분 띄어쓰기로 토큰화를 수행해도 단어 토큰화가 잘 작동합니다. New York과 같은 합성어나 he's와 같은 줄임말에 대한 예외처리만 하면 됩니다.

하지만 한국어의 경우, 띄어쓰기 단위가 되는 단위를 '어절'이라고 하는데 어절 토큰화는 한국어 NLP에서 지양되고 있습니다. 어절 토큰화는 단어 토큰화와 다르기 때문입니다. 

<br>

**1) 한국어는 교착어이다**

근본적 이유는 한국어는 교착어라는 점에 기인합니다. 교착어란 조사, 어미 등을 붙여서 말을 만드는 언어를 말합니다. 

자연어 처리시 같은 단어임에도 불구하고, 서로 다른 조사가 붙어 다른 단어로 인식되면 자연어 처리가 힘들고 번거로워 집니다. 따라서 대부분은 조사를 분리하여줍니다.

한국어 토큰화에서는 **형태소(morpheme)**란 개념을 반드시 이해해야 합니다. 형태소는 뜻을 가진 가장 작은 말의 단위를 말합니다.

**자립형태소**: 접사, 어미, 조사와 상관없이 자립하여 사용할 수 있는 형태소. 그 자체로 단어가 된다. 체언(명사, 대명사, 수사), 수식언(관형사, 부사), 감탄사 등이 있다.

**의존 형태소**: 다른 형태소와 결합하여 사용되는 형태소. 접사, 어미, 조사, 어간을 말한다.

즉, 한국어에서 영어에서의 단어 토큰화와 유사한 형태를 얻으려면 어절 토큰화가 아닌 형태소 토큰화를 수행해야 합니다.

<br>

**2) 한국어는 띄어쓰기가 영어보다 잘 지켜지지 않는다.**

* 한국어는굳이띄어쓰기를전혀하지않고글을썻다고하더라도글을쉽게이해할수있습니다.

* Tobeornottobethatisthequestion

한국어(모아쓰기 방식)는 띄어쓰지 않아도 이해가 잘 되어 띄어쓰기가 무시되는 경우가 많은 반면, 영어(풀어쓰기 방식)는 그렇지 않습니다. 따라서 한국어에서 자연어 처리가 좀 더 어렵습니다.



<br>

## 6) 품사 태깅(Part-of-speech tagging)

단어가 어떤 품사로 쓰였는지 보는 것은 단어의 의미를 파악할 수 있는 주요 지표가 되기도 합니다. 단어 토큰화 과정에서 각 단어가 어떤 품사로 쓰였는지 구분해 놓기도 하는데, 이 작업을 품사 태깅이라고 합니다.

---

NLTK에서는 영어 코퍼스에 품사 태깅 기능을 지원하고 있습니다.

태깅하는 기준은 여러가지가 있는데 NLTK에서는 Penn Treebank POS Tags 기준을 사용합니다.

```python
from nltk.tokenize import word_tokenize
text="I am actively looking for Ph.D. students. and you are a Ph.D. student."
print(word_tokenize(text))

>>
['I', 'am', 'actively', 'looking', 'for', 'Ph.D.', 'students', '.', 'and', 'you', 'are', 'a', 'Ph.D.', 'student', '.']
```

```python
from nltk.tag import pos_tag
x=word_tokenize(text)
pos_tag(x)

>>
[('I', 'PRP'), ('am', 'VBP'), ('actively', 'RB'), ('looking', 'VBG'), ('for', 'IN'), ('Ph.D.', 'NNP'), ('students', 'NNS'), ('.', '.'), ('and', 'CC'), ('you', 'PRP'), ('are', 'VBP'), ('a', 'DT'), ('Ph.D.', 'NNP'), ('student', 'NN'), ('.', '.')]
```

PRP는 인칭 대명사, VBP는 동사, RB는 부사, VBG는 현재부사, IN은 전치사, NNP는 고유 명사, NNS는 복수형 명사, CC는 접속사, DT는 관사를 의미합니다.



---

한국어 자연어처리를 위해서는 KoNLPy(코엔엘파이) 파이썬 패키지를 사용할 수 있습니다.

형태소 분석기로 Okt(Open Korea Text)(0.5.0버전 이하는 Twitter라고 불렸음), 메캅(Mecab), 코모란(Komoran), 한나눔(Hannaum), 꼬꼬마(Kkma)가 있습니다.

한국어 NLP에서 단어토큰화시 형태소 분석기를 사용합니다.

```python
from konlpy.tag import Okt  
okt=Okt()  
print(okt.morphs("열심히 코딩한 당신, 연휴에는 여행을 가봐요"))
>>
['열심히', '코딩', '한', '당신', ',', '연휴', '에는', '여행', '을', '가봐요']
```

```python
print(okt.pos("열심히 코딩한 당신, 연휴에는 여행을 가봐요"))
>>
[('열심히','Adverb'), ('코딩', 'Noun'), ('한', 'Josa'), ('당신', 'Noun'), (',', 'Punctuation'), ('연휴', 'Noun'), ('에는', 'Josa'), ('여행', 'Noun'), ('을', 'Josa'), ('가봐요', 'Verb')] 
```

```python
print(okt.nouns("열심히 코딩한 당신, 연휴에는 여행을 가봐요"))  
>>
['코딩', '당신', '연휴', '여행']  
```

1) morphs : 형태소 추출

2) pos: 품사 태깅(Part-of-speech tagging)

3) nouns: 명사 추출

<br>

꼬꼬마 형태소 분석기 이용

```python
from konlpy.tag import Kkma  
kkma=Kkma()  
print(kkma.morphs("열심히 코딩한 당신, 연휴에는 여행을 가봐요"))
>>
['열심히', '코딩', '하', 'ㄴ', '당신', ',', '연휴', '에', '는', '여행', '을', '가보', '아요']  
```

```python
print(kkma.pos("열심히 코딩한 당신, 연휴에는 여행을 가봐요"))
>>
[('열심히','MAG'), ('코딩', 'NNG'), ('하', 'XSV'), ('ㄴ', 'ETD'), ('당신', 'NP'), (',', 'SP'), ('연휴', 'NNG'), ('에', 'JKM'), ('는', 'JX'), ('여행', 'NNG'), ('을', 'JKO'), ('가보', 'VV'), ('아요', 'EFN')]  
```

```python
print(kkma.nouns("열심히 코딩한 당신, 연휴에는 여행을 가봐요")) 
>>
['코딩', '당신', '연휴', '여행']
```



형태소 분석기의 선택은 필요 용도에 따라 적절한 것을 사용하시면 됩니다. 예를 들어 속도를 중시한다면 메캅을 사용할 수 있습니다.



---

Reference

https://wikidocs.net/21698