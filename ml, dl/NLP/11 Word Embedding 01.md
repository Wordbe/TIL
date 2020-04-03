# 11 Word Embedding 01 - Word2Vec(CBOW), NNLM

자연어를 컴퓨터가 이해하고, 효율적으로 처리하기 위해 변환이 필요합니다. 전통적 방법의 한계를 개선시킨 임베딩 방법론을 배웁니다. Word2Vec과 Glove가 많이 사용됩니다.



# 1 Word Embedding

워드 임베딩은 단어를 벡터로 표현하는 것을 말합니다. 즉 단어를 밀집 표현으로 변환하는 방법을 말합니다.

## 1) 희소 표현 (Sparse Representation)

원-핫 인코딩을 통해 나온 원-핫 벡터는 대부분 0이고 하나만 1인 희소 표현 방식 인코딩입니다. 이러한 희소 표현의 문제는 단어의 개수가 늘어나면 벡터의 차원이 한없이 커진다는 점입니다. 단어 집합이 클수록 고차원 벡터가 됩니다.

* 차원의 저주 문제
* 메모리, 용량의 문제

## 2) 밀집 표현 (Dense Representation)

희소 표현과 반대로 밀집 표현이 있습니다. 사용자가 설정한 값으로 모든 단어의 벡터 표현의 차원을 맞춥니다. 0과 1만 있는 것이 아니라 실수값을 가지게 됩니다.

Ex) 강아지 = [0.2 1.8 1.1 -2.1 1.1 2.8 ... 중략 ...] # 이 벡터의 차원은 128

## 3) 워드 임베딩 (Word Embedding)

단어를 밀집 벡터(Dense vector)로 표현하는 방법을 워드 임베딩이라고 합니다. 워드 임베딩으로는 LSA, Word2Vec, FastText, Glove 등이 있습니다. 

> Keras에서 제공하는 `Embedding()`은 앞서 말한 방법이 아니라, 단어를 랜덤한 값을 가지는 밀집 벡터로 변환한 뒤에, 인공 신경망의 가중치를 학습하는 것과 같은 방식으로 단어 벡터를 학습하는 방법을 사용합니다. 

| -         | One-hot Vector           | Embedding Vector         |
| :-------- | :----------------------- | :----------------------- |
| 차원      | 고차원(단어 집합의 크기) | 저차원                   |
| 다른 표현 | 희소 벡터의 일종         | 밀집 벡터의 일종         |
| 표현 방법 | 수동                     | 훈련 데이터로부터 학습함 |
| 값의 타입 | 1과 0                    | 실수                     |

<br>

---

# 2 Word2Vec

단어 간 유사도를 반영할 수 있는 단어 벡터화 방법입니다.

## 1) 분산 표현 (Distributed Representation)

희소 표현은 단어간 유사성을 표현할 수 없기 때문에, 대안으로 단어의 '의미'를 다차원 공간에 벡터화하는 방법, "분산 표현"을 찾았습니다. 이는 임베딩 작업에 속하며, 저차원이 되었으므로 밀집 벡터에 속하기도 합니다.

분산 표현은 분포 가설(Distributed Hypothesis) 가정 하에 만들어진 표현 방법입니다. '비슷한 위치에서 등장하는 단어들은 비슷한 의미를 가진다'라는 가정입니다. 분산 표현은 분포 가설을 이용해 단어 셋을 학습하고, 벡터에 단어의 의미를 여러 차원에 분산하여 표현합니다. 이런 방법으로 단어 간 유사도를 계산할 수 있습니다.

사용자가 설정한 차원을 가지는 실수형 벡터가 됩니다. 

<br>

## 2) CBOW(Continuous Bag of Words)

Word2Vec 에는 CBOW, Skip-Gram 두 가지 방식이 있습니다. CBOW는 주변에 있는 단어들을 통해 중간에 있는 단어를 예측하고, Skip-Gram은 중간에 있는 단어로 주변 단어들을 예측합니다. 

예 : "The fat cat sat on the mat"

{"The", "fat", "cat", "on", "the", "mat"}으로부터 sat을 예측하는 것은 CBOW가 하는 일입니다. 이 때 예측해야하는 단어 sat을 **중심 단어(center word)**라고 하고, 예측에 사용되는 단어들을 **주변 단어(context word)**라고 합니다. 중심 단어를 예측하기 위해서 앞, 뒤로 몇 개의 단어를 볼지를 결정했다면 이 범위를 **윈도우(window)**라고 합니다. 윈도우 크기가 n이라고 한다면, 실제 중심 단어를 예측하기 위해 참고하려고 하는 주변 단어의 개수는 2n이 될 것입니다.

![](https://wikidocs.net/images/page/22660/%EB%8B%A8%EC%96%B4.PNG)

윈도우 크기를 정했다면, 윈도우를 계속 움직여서 주변 단어와 중심 단어 선택을 바꿔가며 학습을 위한 데이터 셋을 만들 수 있는데, 이 방법을 **슬라이딩 윈도우(sliding window)**라고 합니다.

![](https://wikidocs.net/images/page/22660/word2vec_renew_1.PNG)

Word2Vec의 입력은 모두 원-핫 벡터가 되어야 합니다. 출력 또한 원-핫 벡터입니다. Word2Vec의 은닉층(hidden layer)은 활성화 함수가 존재하지 않으며, Lookup table 연산을 담당하는 층으로 은닉층과 구분하기 위해 투사층(projection layer)이라고 부르기도 합니다.

![](https://wikidocs.net/images/page/22660/word2vec_renew_2.PNG) 



투사층의 크기는 M입니다. 입력층과 투사층의 사이의 가중치 W는 V x M 행렬이고, 투사층과 출력층 사이 가중치 W'는 M x V 행렬입니다. (V는 단어 집합의 크기 입니다.) W과 W'는 전치(transpose)한 것이 아닌 다른 행렬입니다. CBOW는 주변 단어로 중심 단어를 더 정확히 맞추기 위해 W와 W' 를 계속 업데이트 해 나아갑니다.

![](https://wikidocs.net/images/page/22660/word2vec_renew_3.PNG)

입력 벡터$x$는 i번째 인덱스가 1이고, 나머지는 0인 원-핫 벡터입니다. 이 벡터를 가중치 W 행렬과 곱하면, W 행렬은 i번째 행을 그대로 읽어오는 것(lookup)과 동일합니다. 그래서 결과값을 룩업 테이블(lookup table)이라고 부릅니다. 

![](https://wikidocs.net/images/page/22660/word2vec_renew_4.PNG)

<div style="text-align:center;"><em>https://wikidocs.net/images/page/22660/word2vec_renew_4.PNG</em></div>

투사층에서 벡터의 평균을 구하는 부분은 CBOW가 Skip-Gram과 다른 차이점이기도 합니다. Skip-Gram은 입력이 중심 단어 하나이기 때문에 투사층에서 벡터의 평균을 구하지 않습니다.

![](https://wikidocs.net/images/page/22660/word2vec_renew_5.PNG)

스코어 벡터($y$)의 j 번째 인덱스가 가진 0~1 사이 값은 j 번째 단어가 중심 단어일 확률을 나타냅니다. 스코어 벡터는 실제 벡터($\hat{y}$) 중심 단어의 원-핫벡터와 가까워져 합니다. 따라서 이 두 벡터의 오차를 줄이기 위해 CBOW의 손실함수(loss function)는 cross-entropy를 사용합니다.
$$
H(\hat{y}, y) = -\sum_{j=1}^{\vert V \vert} y_j log(\hat{y_j})
$$
이 함수가 최소화되는 방향으로 학습해야 하며, 역전파(Back Propagation)를 수행하면 W와 W'가 학습이 됩니다.

<br>



## 3) NNLM vs Word2Vec

![img](https://wikidocs.net/images/page/22660/word2vec_renew_7.PNG)



NNLM(Neural Net Language Model)은 단어 간 유사도를 구할 수 있도록 워드 임베딩의 개념을 도입하였고, NNLM의 느린 학습 속도와 정확도를 개선하여 탄생한 것이 Word2Vec입니다.

NNLM과 Word2Vec의 차이를 비교해봅시다. 우선 예측하는 대상이 달라졌습니다. NNLM은 언어 모델이므로 다음 단어를 예측하지만, Word2Vec(CBOW)은 워드 임베딩 자체가 목적이므로 다음 단어가 아닌 중심 단어를 예측하게 하여 학습합니다. 중심 단어를 예측하게 하므로서 NNLM이 예측 단어의 이전 단어들만을 참고하였던 것과는 달리, Word2Vec은 예측 단어의 전, 후 단어들을 모두 참고합니다.

구조도 달라졌습니다. 위의 그림은 n을 학습에 사용하는 단어의 수, m을 임베딩 벡터의 차원, h를 은닉층의 크기, V를 단어 집합의 크기라고 하였을 때 NNLM과 Word2Vec의 차이를 보여줍니다. Word2Vec은 우선 NNLM에 존재하던 활성화 함수가 있는 은닉층을 제거하였습니다. 이에 따라 투사층 다음에 바로 출력층으로 연결되는 구조입니다.

Word2Vec이 NNLM보다 학습 속도에서 강점을 가지는 이유는 은닉층을 제거한 것뿐만 아니라 추가적으로 사용되는 기법들 덕분이기도 합니다. 대표적인 기법으로 **계층적 소프트맥스(hierarchical softmax)**와 **네거티브 샘플링(negative sampling)**이 있습니다. 



* **Word2Vec과 NNLM의 학습 속도가 차이: 연산량을 비교**

우선 입력층에서 투사층, 투사층에서 은닉층, 은닉층에서 출력층으로 향하며 발생하는 NNLM의 연산량을 보겠습니다.
NNLM : 
$$
(n×m)+(n×m×h)+(h×V)
$$




추가적인 기법들까지 사용하였을 때 Word2Vec은 **출력층에서의 연산에서 VV를 log(V)log(V)로 바꿀 수 있는데**, 이에 따라 Word2Vec의 연산량은 아래와 같으며 이는 NNLM보다 배는 빠른 학습 속도를 가집니다.
Word2Vec : 
$$
(n×m)+(m×log(V))
$$
<br> 방향으로 파라미터 $v_c$를 업데이트하면 됩니다.











---

**Reference**

https://wikidocs.net/22660

