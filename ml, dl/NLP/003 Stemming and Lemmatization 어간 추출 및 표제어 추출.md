# 3. Stemming and Lemmatization 어간 추출 및 표제어 추출

정규화 기법 중 코퍼스에 있는 단어의 개수를 줄일 수 있는 기법으로 stemming과 lemmatization이 있습니다.



## 1) 표제어 추출(Lemmatization)

표제어(Lemma)는 한글로는 '표제어', '기본 사전형 단어' 의 의미를 가집니다. 표제어 추출은 단어들로부터 표제어를 찾아가는 과정입니다. 단어들이 다른 형태를 가지더라도, 그 뿌리 단어를 찾아가서 단어의 개수를 줄일 수 있는지 파악합니다. 예를 들어 am, are, is는 서로 다르지만, 뿌리 단어는 be라고 할 수 있습니다. 이 단어들의 표제어는 be입니다.



표제어 추출 시 가장 섬세한 방법은 형태학적 파싱을 먼저 진행하는 것입니다. 형태소란 '의미를 가진 가장 작은 단위'를 뜻합니다. 또한 형태학(morphology)이란 형태소로부터 단어들을 만드는 학문입니다.



형태소는 두 가지 종류가 있습니다.

**1) 어간 (stem)**

​	단어의 의미를 담고 있는 단어의 핵심 부분

**2) 접사 (affix)**

​	단어에 추가적인 의미를 주는 부분



형태학적 파싱은 이 두 가지 구성 요소를 분리하는 작업을 말합니다.

NLTK에서는 표제어 추출을 위한 도구인 WordNetLemmatizer를 지원합니다.

```python
from nltk.stem import WordNetLemmatizer
n=WordNetLemmatizer()
words=['policy', 'doing', 'organization', 'have', 'going', 'love', 'lives', 'fly', 'dies', 'watched', 'has', 'starting']
print([n.lemmatize(w) for w in words])

>>
['policy', 'doing', 'organization', 'have', 'going', 'love', 'life', 'fly', 'dy', 'watched', 'ha', 'starting']
```

표제어 추출은 단어의 형태가 적절히 보존되는 양상을 보이는 특징이 있습니다.

하지만, dy나 ha와 같이 의미를 알 수 없는 단어를 출력하기도 합니다.

단어의 품사 정보를 알아야 더 정확한 결과를 얻을 수 있기 때문입니다.



```python
n.lemmatize('dies', 'v')
>>
'die'

n.lemmatize('has', 'v')
>>
'have'
```

표제어 추출은 문맥을 고려하며, 결과는 해당 단어의 품사 정보를 보존합니다. (POS 태그를 보존한다고 말할 수 있습니다.)

다음 배울 어간 추출은 수행한 결과에 품사 정보가 보존되지 않습니다. (POS 태그를 고려하지 않습니다.)



---

## 2) 어간 추출 (Stemming)

어간 추출은 형태학적 분석을 단순화한 버전이라고 볼 수 있고, 정해진 규칙만 보고 단어의 어미를 자르는 어림짐작의 작업이라고 볼 수도 있습니다. 결과 단어는 사전에 존재하지 않는 단어일 수도 있습니다.

어간 추출 알고리즘 하나로 포터 알고리즘(Porter Algorithm)을 소개합니다.

```python
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
s = PorterStemmer()
text="This was not the map we found in Billy Bones's chest, but an accurate copy, complete in all things--names and heights and soundings--with the single exception of the red crosses and the written notes."
words=word_tokenize(text)
print(words)

>>
['This', 'was', 'not', 'the', 'map', 'we', 'found', 'in', 'Billy', 'Bones', "'s", 'chest', ',', 'but', 'an', 'accurate', 'copy', ',', 'complete', 'in', 'all', 'things', '--', 'names', 'and', 'heights', 'and', 'soundings', '--', 'with', 'the', 'single', 'exception', 'of', 'the', 'red', 'crosses', 'and', 'the', 'written', 'notes', '.']
```

```python
print([s.stem(w) for w in words])
>>
['thi', 'wa', 'not', 'the', 'map', 'we', 'found', 'in', 'billi', 'bone', "'s", 'chest', ',', 'but', 'an', 'accur', 'copi', ',', 'complet', 'in', 'all', 'thing', '--', 'name', 'and', 'height', 'and', 'sound', '--', 'with', 'the', 'singl', 'except', 'of', 'the', 'red', 'cross', 'and', 'the', 'written', 'note', '.']
```



어간 추출은 단순 규칙에 기반하여 이루어지기 때문에, 사전에 없는 단어들이 포함되어 있습니다.

예를 들면, 

ALIZE → AL

ANCE → 제거

ICAL → IC

규칙을 가집니다.

```python
words=['formalize', 'allowance', 'electricical']
print([s.stem(w) for w in words])
>>
['formal', 'allow', 'electric']
```



어간 추출은 표제어 추출보다 일반적으로 빠릅니다. 포터 어간 추출기는 정밀하게 설계되어 정확도가 높으므로 영어 자연어 처리에서 어간 추출을 하고자 한다면 가장 준수한 선택입니다.

NLTK에서는 그 외에도 랭커스터 스태머(Lancasterr Stemmer) 알고리즘을 지원합니다.

```python
from nltk.stem import LancasterStemmer
l=LancasterStemmer()
words=['policy', 'doing', 'organization', 'have', 'going', 'love', 'lives', 'fly', 'dies', 'watched', 'has', 'starting']
print([l.stem(w) for w in words])

>>
['policy', 'doing', 'org', 'hav', 'going', 'lov', 'liv', 'fly', 'die', 'watch', 'has', 'start']
```

Lancaster Stemmer는 Porter Stemmer와 다른 결과를 보여줍니다. 따라서 사용하고자 하는 코퍼스에 스태머를 적용해보고 어떤 스태머가 적합한 지 판단하여 사용해야 합니다.



마지막으로, 같은 단어에 대해 표제어 추출과 어간 추출을 수행했을 때 결과를 비교해 봅니다.

> **Stemming**
>
> am → am
>
> the going → the go
>
> having → hav

> **Lemmatization**
>
> am → be
>
> the going → the going
>
> having → have



---

## 3) 한국어에서의 어간 추출

한국어는 5언 9품사 구조를 가지고 있습니다.

| 언     | 품사               |
| ------ | ------------------ |
| 체언   | 명사, 대명사, 수사 |
| 수식언 | 관형사, 부사       |
| 관계언 | 조사               |
| 독립언 | 감탄사             |
| 용언   | 동사, 형용사       |

이 중 특히 용언(동사, 형용사)은 어간(stem)과 어미(ending)의 결합으로 구성됩니다.



**(1) 활용(conjugation)**

활용은 한국어를 포함하여 인도유럽어(indo-european language)에서도 주로 볼 수 있는 언어적 특징 중 하나를 말하는 통칭적 개념입니다.

활용이란 어간(stem)이 어미(ending)를 가지는 것을 말합니다.

**어간** : 용언을 활용할 때, 원칙적으로 모양이 변하지 않는 부분. 활용에서 어미에 선행하는 부분. 때론 어간의 모양도 바뀔 수 있음

**어미** : 용언의 어간 뒤에 붙어서 활용하면서 변하는 부분. 여러 문법적 기능 수행



**(2) 규칙 활용**

규칙 활용에서는 어간이 어미를 취할 때 어간의 모습이 일정 합니다.

> 예)  잡/어간  + 다/어미

어간이 어미가 붙기전의 모습과 어미가 붙은 후의 모습이 같으므로 규칙 기반으로 어미를 단순 분리해주면 어간 추출이 가능합니다.



**(3) 불규칙 활용**

불규칙 활용은 어간이 어미를 취할 때 어간의 모습이 바뀌거나 취하는 어미가 특수한 어미일 경우를 말합니다.

> 예) '듣-, 돕-, 곱-, 잇-, 오르-, 노랗-' → '듣/들-, 돕/도우-, 곱/고우-, 잇/이-, 올/올-, 노랗/노라-' 와 같이 어간의 형식이 달라지는 경우

> 예) '오르 + 아/어 → 올라, 하 + 아/어 → 하여, 이르 + 아/어 → 이르러, 푸르 + 아/어 →푸르러'와 같이 일반적인 어미가 아닌 특수한 어미를 취하는 경우



불규칙 활용의 경우 어간에 어미가 붙는 과정에서 어간의 모습이 바뀌었으므로 단순 분리로 어간 추출이 불가능하고 더 복잡한 규칙이 필요합니다.





---

Reference

https://wikidocs.net/21707