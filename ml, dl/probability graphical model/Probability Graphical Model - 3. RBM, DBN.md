# 확률 그래피컬 모델(Probability Graphical Model) - part3

# 4. RBM과 DBN

RBM(Restricted Boltzmann Machine)은 통계 물리(statistical physics)의 세부분야인 통계 역학(statistical mechanics)을 이용합니다. 따라서 통계 역학을 일군 볼츠만, 깁스 이름이 자주 등장합니다.





![](https://i.ibb.co/K94zV1R/image.png)

BM은 학습이 매우어려워 거의 사용하지 않습니다.

대신 RBM(harmonium)이라는 같은 종류의 노드 사이에는 에지를 허용하지 않는 구조를 제안하게 됩니다.(Smolensky, 1986)

이후 대조발산(contrastive divergence) 학습 알고리즘이 제안되어 이 구조는 빛을 보게 됩니다.(Hinton, 2002)

그 후 RBM 층을 여러개 쌓아 만든 DBN(Deep belief network)가 제안되고, 빠르게 학습할 수 있는 층별 사전학습(layer-wise pretraining) 알고리즘이 제안되면서(Hinton, 2006) 딥러닝을 널리 확산하는 기폭제가 되었습니다.



## 1) RBM 구조와 원리

RBM은 노드값에 따라 에너지가 정해지며, 에너지가 낮을수록 발생 확률이 높습니다. RBM을 잘 학습하면, 원하는 특정 패턴을 높은 확률로 발생시킵니다. 즉, RBM은 원하는 샘플을 높은 확률로 생성하는 생성 모델(Generative model)이며, 역전파 알고리즘 등 분류 학습을 적용시키면 분별 모델(Discriminative model)로 사용할 수도 있습니다.



**RBM 구조**

RMB은 위 그림 (c)처럼 무방향 바이파타이트 그래프(undirected bipartite graph)입니다. 같은 종류 노드 사이에는 에지가 없고, 가시노드(visible node)와 은닉 노드(hidden node) 사이에만 노드가 있는 bipartite graph입니다.

학습 시 알아내야 하는 매개변수는 가중치 W와 가시노드 바이어스 a, 은닉노드 바이어스 b 입니다.
$$
\theta = \{W, a, b\}
$$

$$
W =
\begin{pmatrix}
w_{11} & w_{12} \\
w_{21} & w_{22} \\
w_{31} & w_{32}
\end{pmatrix}
$$

여기에 모든노드는 0 또는 1, 두 가지 값만 가진다고 가정합니다.



**에너지와 확률분포**

RBM 가시층과 은닉층에 x와 h값이 지정되면, 에너지 함수를 계산할 수 있습니다.
$$
\begin{align}
energy(x, h) & =
-\sum_{i=1}^da_i x_i -\sum_{j=1}^m b_i h_i -\sum_{i=1}^d \sum_{j=1}^m x_i w_{ij} h_j \\
& = - a^T x - b^T h - x^T W h
\end{align}
$$
에너지를 통해 x, h 가 발생할 확률을 구할 수 있습니다.
$$
P(x, h) = \frac{1}{Z} exp(-energy(x, h))
$$

$$
Z = \sum_x \sum_h exp(-energy(x, h))
$$

Z는 P(x, h)를 다 더하면 1이 되게 만들어줍니다.

P(x, h)는 깁스 확률분포(Gibb's distribution)라고 합니다.



결합확률을 통해 확률 벡터 x가 발생할 확률을 구할 수 있습니다.
$$
P(x) = \sum_h P(x, h) = \frac{1}{Z} \sum_h exp(-energy(x, h))
$$
x가 가질 수 있는 모든 경우에 대해 확률을 계산 할 수 있습니다.

$P((0,0,0)^T), P((1,0,0)^T), \cdots, P((1,1,1)^T)$ 

매개변수 값에 따라 에너지를 품고, 에너지는 샘플의 발생 확률을 규정합니다. 어떤 샘플은 자주발생하지만, 다른 샘플은 희소하게 발생하는 이유로 RBM을 스토캐스틱 생성 모델(Stochastic Generative Model)이라고 합니다.



## 2) RBM 학습

RBM 목적은 $\mathbb{X} = \{x_1, x_2, \cdots, x_n\}$에 속한 특징 벡터는 높은 확률로 발생시키고, $\mathbb{X}$에 속하지 않은 샘플은 낮은 확률로 발생시키는 것입니다. RBM은 레이블이 없어도되는 비지도 학습 입니다.



**목적함수**
$$
J(\theta) = \prod_{x \in \mathbb{X}} P(x) \ 또는\  \sum_{x \in \mathbb{X}} log P(x)
$$
왼쪽 식은 1보다 작은 수를 여러 번 곱할 경우 언더플로가 발생할 수 있으므로 주로 오른쪽 수식을 이용합니다.
$$
\widehat{\theta} = \underset{\theta}{argmax} \sum_{x \in \mathbb{X}} log P(x)
$$


**대조 발산 알고리즘(CD, contrastive divergence)**

현실적인 시간 안에 위 알고리즘을 풀어 최적의 매개변수를 구하는 알고리즘은 없습니다. 따라서 근사해를 구하는 대조발산 알고리즘을 사용합니다.(Hinton, 2002)

위 식은 목적함수가 확률을 나타내고, 이를 최대화해야 하므로 SGD가 아닌 SGA(Stochastic Gradient Ascent)를 사용합니다.

목적함수를 파라미터 $w_{ij}$로 미분하여 그레디언트를 구하면 다음과 같습니다.
$$
\frac{\partial log P(x)}{\partial w_{ij}} = \langle x_ih_j\rangle_{data} - \langle x_i h_j\rangle_{model}
$$
매개변수 갱신(parameter update)
$$
w_{ij}= w_{ij} + \rho(\langle x_ih_j\rangle_{data} - \langle x_i h_j\rangle_{model})
$$
그레디언트를 구하는데 RBM의 스토캐스틱 샘플 생성능력을 활용합니다. 샘플을 발생하는 과정은 깁스 샘플링(Gibbs sampling)을 따릅니다.

우선 $x = (x_1, x_2, \cdots, x_d)^T$를 입력하고, 스토캐스틱 하게 하면 됩니다.
$$
p(h_j =1|x) = \sigma(b_j + \sum_{i=1}^d x_i w_{ij})
$$


$\sigma$()는 logistic 시그모이드 함수 입니다.


$$
h_j = \begin{cases}
1, if\ random(0\tilde{}1) < p(h_j = 1|x) \\
0, otherwise
\end{cases}
$$
이렇게 은닉 노드값 m개를 모두 샘플링 하였다면, 이제 반대로 은닉노드로 가시노드값을 샘플링합니다. 
$$
p(x_i =1|h) = \sigma(a_j + \sum_{j=1}^m h_jw_{ij})
$$

$$
x_i = \begin{cases}
1, if\ random(0\tilde{}1) < p(x_i = 1|h) \\
0, otherwise
\end{cases}
$$

![](https://i.ibb.co/yfRdF1k/image.png)

은닉층 샘플링 → 가시층 샘플링 → 은닉층 샘플링 → 가중치 갱신 으로 작동합니다.

이 과정을 한 번만하면 $CD_1$이라고 하며, 제대로 된 샘플을 얻기 위해서는 임의로 초기화된 가시 벡터로 시작해서 여러개의 샘플링 작업을 거친 $CD_n$을 진행해야 합니다. (Hinton, 2002)



**RBM 응용**

차원축소에 쓰여 데이터를 비지도학습으로 분류하는데 쓰일 수 있습니다. MNIST에서 2차원 축소하였을 때 RBM은 PCA보다 좋은 성능을 거두었습니다.(Hinton, 2006)

또한 정보검색, 협업 필터링 추천 시스템, 음성 인식 등에도 적용할 수 있습니다.



한편 지도학습으로 확장할 수도 있습니다. 

RBM을 특징분류기로 사용하여 RBM 거친 노드들 뒷 단에 분류층을 두어 지도학습을 하거나,

입력에서부터 레이블 정보 추가하여 높은 확률의 결과를 부류로 분류하는 것 등이 잇습니다.



## 3. DBN

RBM을 여러 층으로 쌓아 깊은 구조의 신경망, 즉 DBN(Deep Belief Network)를 만듭니다.



784 → 1000 → 500 → 250 → 30

이렇게 4층을 쌓아 먼저 예비학습을 한 후,

784 → 1000 → 500 → 250 → 30 → 250 → 500 → 1000 → 784

로 대칭적으로 펼칩니다. 이 때 펼친 곳의 가중치는 펼치기 전 해당 $W$에 $W^T$가 됩니다.

그 다음으로는 펼친 네트워크 8층 전체를 학습하는 미세조정(fine tuning) 단계를 거쳐 마무리 합니다.

예비 학습 단계를 가충치 초기화 목적으로 사용했다고 간주할 수 있으므로, 미세조정 후 수렴에 성공할 확률이 높습니다.



**DBN의 응용**

DBN은 RBM의 확률적 특성을 그대로 이어받습니다. 여기에 신경망의 특징 공간 변환 능력과 분산 처리 능력이 더해집니다.

784 → 1000 → 500 → 250 → 30 → 2

로 만들어 2차원으로 가시화할 수 도 있고,

위에 예시 처럼 오토인코더로 사용할 수 도 있습니다.

SAE, DAE, CAE 등 결정론적 오토인코더와 달리 DBN은 확률 오토인코더로 작동할 수 있습니다.

