# Language Model 01

**언어 모델이란 단어 시퀀스(문장)에 확률을 할당하는 모델을 말합니다.** 이를 통해 모델은 문장이 올바른지 판단할 수 있습니다. 통곙 기반한 전통적인 언어 모델(Statstical Language Model, SLM)에 대해 배워봅니다. 통계 기반 언어 모델은 실제 사용하는 자연어를 근사하기에는 많은 한계가 있었고, 인공 신경망이 이를 많이 해결해 주면서 통계 기반 언어 모델을 사용도가 많이 줄었습니다.

하지만, 여전히 n-gram은 자연어 처리 분야에서 활발히 이용되고 있으며, 통계 기반 방법론에 대한 이해는 언어 모델에 대한 전체적 시야를 갖는 데 도움이 됩니다.



# 1 Language Model

## 1) 언어 모델

언어 모델은 가장 자연스러운 단어 시퀀스를 찾아내는 모델입니다. 이전 단어들이 주어졌을 때 다음 단어를 예측하는 방법을 주로 사용합니다. 

다른 방법으로는 양쪽의 단어들로부터 가운데 단어를 예측하는 모델이 있습니다. 이 유형의 언어 모델은 BERT 가 있습니다.

언어 모델링이란 주어진 단어들로부터 아직 모르는 단어를 예측하는 작업을 말합니다. 언어 모델을 문법(grammar)라고 비유하기도 합니다. 단어 조합이나 문장의 적절/적합성을 알려주는 일을 하는 것이 마치 문법과 유사하기 때문입니다.

<br>

## 2) 단어 시퀀스의 확률 할당

언어 모델은 두 문장의 확률을 비교하여 좋은 번역, 교정, 인식 등 을 선택합니다.

a. 기계 번역(Machine Translation)

b. 오타 교정(Spell Correction)

c. 음성 인식(Speech Recognition)

<br>

## 3) 주어진 이전 단어들로부터 다음 단어 예측하기

a. 단어 시퀀스의 확률
$$
P(W) = P(w_1, w_2, ... w_n)
$$
​	하나의 단어를 $w$, 단어 시퀀스를 $W$ 라고 하면, $n$개의 단어가 등장하는 단어 시퀀스의 확률은 위와 같습니다.

b. 다음 단어 등장 확률
$$
P(w_n \vert w_1, ..., w_{n-1})
$$
​	$n-1$개의 단어가 나열된 상태에서 $n$번째 단어의 확률(조건부 확률)은 위와 같습니다.

<br>

## 4) 언어 모델의 간단한 직관

​	기계도 인간과 유사하게, 앞에 어떤 단어들이 나왔는지 고려하여 후보가 될 수 있는 여러 단어들에 대해 확률을 예측해보고 가장 높은 확률을 가진 단어를 선택합니다.

<br>

## 5) 검색 엔진에서의 언어 모델 예

검색 엔진은 입력된 단어들의 나열에 대해서 다음 단어를 예측하는 언어 모델을 사용하고 있습니다.

![](https://wikidocs.net/images/page/21668/%EB%94%A5_%EB%9F%AC%EB%8B%9D%EC%9D%84_%EC%9D%B4%EC%9A%A9%ED%95%9C.PNG)

<br>

---

# 2 Statistical Language Model, SLM

### 1) 조건부 확률

$$
P(A, B) = P(A)P(B \vert A)
$$



​	**조건부 확률의 연쇄 법칙(chain rule)**
$$
\begin{align}
	P(x_1, x_2, ..., x_n)
	  & = P(x_1) P(x_2 \vert x_1) \cdots P(x_n \vert x_1, \dots, x_n) \newline
	  & = \prod_{n=1}^n P(x_n \vert x_1, \dots, x_{n-1} )
\end{align}
$$
<br>

### 2) 문장에 대한 확률

각 단어는 문맥이라는 관계로 인해 이전 단어의 영향을 받습니다. 또한 이런 단어들로부터 하나의 문장이 완성됩니다. 따라서 문장이 확률을 구하기 위해 조건부 확률을 사용합니다. 

예를 들어 "An adorable little boy is spreading smiles" 문장이 올바른 지에 대한 확률은 아래와 같이 구합니다.
$$
\begin{gather}
P(\text{An adorable little boy is spreading smiles}) = \newline 
P(\text{An})  ×  P(\text{adorable|An})  ×  P(\text{little|An adorable})  ×  P(\text{boy|An adorable little}) ×  P(\text{is|An adorable little boy}) \newline  ×  P(\text{spreading|An adorable little boy is})  ×  P(\text{smiles|An adorable little boy is spreading})
\end{gather}
$$


<br>

### 3) 카운트 기반의 접근

An adorable little boy가 나왔을 때, is가 나올 확률을 구해봅니다.
$$
P\text{(is|An adorable little boy}) = \frac{\text{count(An adorable little boy is})}{\text{count(An adorable little boy })}
$$
예를 들어 학습 데이터에서 An adorable little boy가 100번 있었고, 그 다음에 is가 있는 경우는 30번이라고 하면, 위 결과는 30% 가 됩니다.

<br>

### 4) 카운트 기반 접근의 한계 - 희소 문제(Sparsity Problem)

언어 모델은 실생활에 사용되는 언어의 확률 분포를 근사 모델링 합니다. 실제 자연어의 확률 분포에 근사해야 합니다. 그런데 카운트 기반으로 접근하려고 한다면 매우 많은 코퍼스(corpus) 데이터를 필요로 합니다.

데이터가 충분치 못해 학습 데이터에서 언어를 정확히 모델링하지 못하는 문제를 희소 문제라 합니다. 위 문제를 해결하기 위해 n-gram 또는 smoothing, back-off 등의 일반화(generalization) 기법이 존재합니다. 하지만 근본 해결책은 아니기 때문에, 언어 모델의 트렌드는 통계적 언어 모델에서 인공 신경망 언어 모델로 넘어가게 됩니다.







---

**Reference**

https://wikidocs.net/21668

https://wikidocs.net/21687