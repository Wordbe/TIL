# 8 단어 분리(Byte Per Encoding, BPE)

기계가 훈련 단계에서 학습한 단어들의 집합을 "단어 집합(vocabulary)"이라고 합니다. 테스트 단계에서 기계가 학습하지 못한 데이터가 등장하면, 그 단어를 OOV(Out of Voclalbrury, 단어집합에 없는 단어) 또는 UNK(Unknown Token)라고 합니다. 모르는 단어가 등장하면, 문제를 제대로 풀지 못하는 상황을 OOV 문제라고 합니다.

단어 분리(Subword segmentation) 작업은 하나의 단어는 의미있는 여러 내부 단어(subwords)의 조합으로 구성된 경우가 많기 때문에, 하나의 단어를 여러 내부 단어로 분리해서 단어를 이해해 보겠다는 의도를 가진 전처리 작업입니다.

단어 분리는 OOV 문제를 완하하며, 기계 번역 등에서도 주요 전처리로 사용되고 있습니다. 단어 분리 tokenizer인 BPE(Byte pair Ending) 알고리즘과 실무에서 사용할 수 있는 구현체 Sentencepiece를 알아봅니다.

<br>

## 1 BPE

* 1994년 제안된 압축 알고리즘 → 후에 자연어 처리 단어 분리 알고리즘으로 응용

* 자연어 처리에서 BPE는 단어분리(word segmentt)

글자(character) 단위에서 점차적으로 단어 집합(vocabulary)을 만들어 내는 Bottom up 방식의 접근을 사용합니다. 데이터 안에 있는 단어들은 글자(character) 또는 유니코드(unicode) 단위로 단어집합을 만들고, 가장 많이 등장하는 유니그램을 하나의 유니그램으로 통합합니다. [Sennrich et al. (2016)](https://arxiv.org/pdf/1508.07909.pdf)



```shell
# dictionary
l o w : 5,  l o w e r : 2,  n e w e s t : 6,  w i d e s t : 3
```

딕셔너리를 참고로 한 초기 단어 집합(vocabulary)을 아래와 같습니다. 간단히 말해 초기 구성은 글자 단위로 분리된 상태입니다.

```shell
# vocabulary
l, o, w, e, r, n, w, s, t, i, d
```

<br>

여기서 가장 빈도수가 높은 유니그램 쌍을 하나의 유니그램으로 통합하는 과정을 총 n회 반복(iteration)합니다. 위 딕셔너리에서는 빈도수가 현재 가장 높은 유니그램 쌍은 (e, s) 입니다.

**1회 - 딕셔너리를 참고로 하였을 때 빈도수가 9로 가장 높은 (e, s)의 쌍을 es로 통합합니다.**

```shell
# dictionary update!
l o w : 5,
l o w e r : 2,
n e w es t : 6,
w i d es t : 3
# vocabulary update!
l, o, w, e, r, n, w, s, t, i, d, es
```

**2회 - 빈도수가 9로 가장 높은 (es, t)의 쌍을 est로 통합합니다.**

```shell
# dictionary update!
l o w : 5,
l o w e r : 2,
n e w est : 6,
w i d est : 3
# vocabulary update!
l, o, w, e, r, n, w, s, t, i, d, es, est
```

**3회 - 빈도수가 7로 가장 높은 (l, o)의 쌍을 lo로 통합합니다.**

```shell
# dictionary update!
lo w : 5,
lo w e r : 2,
n e w est : 6,
w i d est : 3
# vocabulary update!
l, o, w, e, r, n, w, s, t, i, d, es, est, lo
```



이와 같은 방식으로 총 10회 반복하였을 때 얻은 딕셔너리와 단어 집합은 아래와 같습니다.

```shell
# dictionary update!
low : 5,
low e r : 2,
newest : 6,
widest : 3
# vocabulary update!
l, o, w, e, r, n, w, s, t, i, d, es, est, lo, low, ne, new, newest, wi, wid, widest
```

이 경우 테스트 과정에서 'lowest'란 단어가 등장한다면, 기존에는 OOV에 해당되는 단어가 되었겠지만 BPE 알고리즘을 사용한 위의 단어 집합에서는 더 이상 'lowest'는 OOV가 아닙니다. 기계는 우선 'lowest'를 전부 글자 단위로 분할합니다. 즉, 'l, o, w, e, s, t'가 됩니다. 그리고 기계는 위의 단어 집합을 참고로 하여 'low'와 'est'를 찾아냅니다. 즉, 'lowest'를 기계는 'low'와 'est' 두 단어로 인코딩합니다. 그리고 이 두 단어는 둘 다 단어 집합에 있는 단어이므로 OOV가 아닙니다.



---

### 코드 실습

```python
import re, collections

num_merges = 10
vocab = {'l o w </w>' : 5,
         'l o w e r </w>' : 2,
         'n e w e s t </w>':6,
         'w i d e s t </w>':3
         }
```

`</w>`는 단어 맨 끝에 붙이는 특수 문자이고, 각 단어는 글자(character) 단위로 분리합니다.

```python
def get_stats(vocab):
    pairs = collections.defaultdict(int)
    for word, freq in vocab.items():
        symbols = word.split()
        for i in range(len(symbols) - 1):
            pairs[symbols[i], symbols[i + 1]] += freq
    return pairs

def merge_vocab(pair, v_in):
    v_out = {}
    bigram = re.escape(' '.join(pair))
    p = re.compile(r'(?<!/S)' + bigram + r'(?!\S)')
    for word in v_in:
        w_out = p.sub(''.join(pair), word)
        v_out[w_out] = v_in[word]
    return v_out

for i in range(num_merges):
    paris = get_stats(vocab)
    best = max(pairs, key=pairs.get)
    vocab = merge_vocab(best, vocab)
    print(best)
```

```shell
('e', 's')
('es', 't')
('est', '</w>')
('l', 'o')
('lo', 'w')
('n', 'e')
('ne', 'w')
('new', 'est</w>')
('low', '</w>')
('w', 'i')
```



## 2 WPM(Wordpiece Model)

WPM의 아이디어를 제시한 논문 : https://static.googleusercontent.com/media/research.google.com/ko//pubs/archive/37842.pdf
구글이 위 WPM을 변형하여 번역기에 사용했다는 논문 : https://arxiv.org/pdf/1609.08144.pdf

기존의 BPE 외에도 WPM(Wordpiece Model)이나 Unigram Language Model Tokenizer와 같은 단어 분리 토크나이저들이 존재합니다. 여기서는 WPM에 대해서만 간략히 언급합니다. 구글은 WPM을 일종의 BPE의 변형으로 소개합니다. WPM은 BPE과는 달리 빈도수가 아니라 **우도(likelihood)를 통해서 단어를 분리**합니다. 여기서는 자세한 설명은 생략하겠습니다. 2016년에 논문(위 링크 참고)에서 구글은 자신들의 구글 번역기에서 WPM이 수행된 결과에 대해서 기술하였습니다.

**WPM을 수행하기 이전의 문장:** Jet makers feud over seat width with big orders at stake
**WPM을 수행한 결과(wordpieces):** _J et _makers _fe ud _over _seat _width _with _big _orders _at _stake

Jet는 J와 et로 나누어졌으며, feud는 fe와 ud로 나누어진 것을 볼 수 있습니다. WPM은 모든 단어의 맨 앞에 _를 붙이고, 단어는 내부단어(subword)로 통계에 기반하여 띄어쓰기로 분리합니다. 여기서 언더바 _는 문장 복원을 위한 장치입니다. 예컨대, WPM의 결과로 나온 문장을 보면, Jet → _J et와 같이 기존에 없던 띄어쓰기가 추가되어 내부 단어(subwords)들을 구분하는 구분자 역할을 하고 있습니다. 그렇다면 기존에 있던 띄어쓰기와 구분자 역할의 띄어쓰기는 어떻게 구별할까요? 이 역할을 수행하는 것이 단어들 앞에 붙은 언더바 입니다. **WPM이 수행된 결과로부터 다시 수행 전의 결과로 돌리는 방법은 현재 있는 모든 띄어쓰기를 전부 제거하고, 언더바를 띄어쓰기로 바꾸면 됩니다.**

구글의 WPM은 오픈소스로 공개되지 않았습니다.

<br>

## 3 SentencePiece

논문 : https://arxiv.org/pdf/1808.06226.pdf
센텐스피스 깃허브 : https://github.com/google/sentencepiece

결론적으로 실무에서 단어 분리를 위해서 어떤 구현체를 사용해야 하냐고 묻는다면, **구글의 센텐스피스(Sentencepiece)를 사용합니다.** 구글은 BPE 알고리즘과 Unigram Language Model Tokenizer를 구현한 센텐스피스를 깃허브에 공개하였습니다. 기존의 BPE 알고리즘 논문 저자 또한 BPE 코드를 깃허브에 공개하기는 했지만, 이를 실무에 사용하기에는 속도가 매우 느리므로 센텐스피스를 사용하는 것을 권장합니다.

센텐스피스의 이점은 또 있습니다. 단어 분리 알고리즘을 사용하기 위해서, 데이터에 단어 토큰화를 먼저 진행한 상태여야 한다면 이 단어 분리 알고리즘을 모든 언어에 사용하는 것은 쉽지 않습니다. 영어와 달리 한국어와 같은 언어는 단어 토큰화부터가 쉽지 않기 때문입니다. 그런데, 이런 사전 토큰화 작업(pretokenization)없이 전처리를 하지 않은 데이터(raw data)에 바로 단어 분리 토크나이저를 사용할 수 있다면, 이 토크나이저는 그 어떤 언어에도 적용할 수 있는 토크나이저가 될 것입니다. 센텐스피스는 이 이점을 살려서 구현되었습니다. **센텐스피스는 사전 토큰화 작업없이 단어 분리 토큰화를 수행하므로 언어에 종속되지 않습니다.**

센텐스피스 실습은 향후 추가 예정입니다.



---

**Reference**

https://wikidocs.net/22592

BPE 알고리즘 논문 : https://arxiv.org/pdf/1508.07909.pdf
BPE 알고리즘 논문 저자의 깃허브 : https://github.com/rsennrich/subword-nmt
서브워드 알고리즘 비교 : https://medium.com/@makcedward/how-subword-helps-on-your-nlp-model-83dd1b836f46
WPM의 아이디어를 제시한 논문 : https://static.googleusercontent.com/media/research.google.com/ko//pubs/archive/37842.pdf
WPM을 사용한 구글의 번역기에 대한 논문 : https://arxiv.org/pdf/1609.08144.pdf
WPM 참고 자료 : https://norman3.github.io/papers/docs/google_neural_machine_translation.html
유니그램 언어 모델을 이용한 단어 분리 : https://arxiv.org/pdf/1804.10959.pdf
센텐스피스 사용한 한국어 실습 참고 자료 : https://bab2min.tistory.com/622
wordpiece Vs. sentencepiece : https://mc.ai/pre-training-bert-from-scratch-with-cloud-tpu/
https://mlexplained.com/2019/11/06/a-deep-dive-into-the-wonderful-world-of-preprocessing-in-nlp/