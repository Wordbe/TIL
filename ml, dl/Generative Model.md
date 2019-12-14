# Generative Model

들어가기 전에..



### 2017 : Explosion of GANs

Source → Target domain transfer (CycleGAN. Zhu et al. 2017)

Text → Image 합성 (Reed et al. 2017)

Many GAN application(Pix2pix. Isola 2017)

BigGAN: Brock et al., 2019



### Autoencoders

**Unsupervised Learning**

Goal: 기저에 깔려있는 데이터의 숨은 구조를 학습

예: clustering, dimensionality reduction, feature learning, density estimation





## Generative Model

주어진 훈련집합에 대해, 같은 분포로 부터 새로운 샘플을 생성합니다.

Training data ~ $p_{data}(x)$ → Generated samples ~ $p_{model}(x)$

$p_{data}(x)$와 유사한 $p_{model}(x)$ 를 학습시키는 것이 목적.





일반적으로 생성 모델은 주로 MLE(Maximum likelihood estimation)을 구합니다.

어떤 모델(probability distribution)을 estimate한 뒤에 maximum-likely한지 따지는 loss function을 사용합니다.

Likelihood(가능도, 우도)는 다음과 같이 정의됩니다.
$$
P(\theta \vert X) = \frac{P(X\vert \theta) P(\theta)}{P(X)}
$$
이는 posterior $P(X\vert \theta)$와 비례하기 때문에 이를 통해 구하기도 합니다.
$$
\prod_{i=1}^m P_{model} (X; \theta)
$$
m개의 주어진 sample에 대해 가장 그럴듯한 확률분포를 찾아내는 것이 목표입니다.
$$
\begin{align}
\theta^* & = \underset{\theta}{argmax} \prod_{i=1}^m P_{model} (X; \theta) \newline 
& = \underset{\theta}{argmax} \ log\prod_{i=1}^m P_{model} (X; \theta) \newline
& = \underset{\theta}{argmax} \ \sum_{i=1}^m log P_{model} (X; \theta) \newline
& = \underset{\theta}{argmax} \ \mathbb{E}_{x \sim p_{data}}log P_{model} (X\vert \theta) \newline 
\end{align}
$$
최적 파라미터 $\theta^*$를 찾기 위해 KL divergence를 주로 이용합니다.
$$
\theta^* = \underset{\theta}{argmin} \ D_{KL}(P_{data}(X) \Vert P_{model} (X; \theta))
$$
실제 문제에서는 $p_{data}$를 알수없고, m개의 훈련집합으로 추정한 것을 사용합니다.

결국 KL divergence를 최소화하는 것은 훈련집합의 log-likelihood를 최대화하는 것이 됩니다.







* 생성모델은 비지도학습의 핵심 문제인 밀도 추정(density estimation)을 다룹니다.

명시적(explicit) 밀도 추정 : 명시적으로 $p_{model}(x)$을 정의하고 해결

묵시적(implicit) 밀도 추정 : 명시적 정의없이 $p_{model}(x)$로부터 샘플을 뽑을 수 있는 모델을 학습합니다.



 ### Why Generative model?

* artwork, super-resolution, colorization 등을 위해 실사 샘플을 위해

* 시계열데이터의 생성모델은 simulation과 planning으로도 활용가능(강화학습 응용)
* 생성모델을 학습시키는 것은 일반적인 feature로서 유용한 잠재적표현(latent representation)의 추론을 가능하게 할 수 있습니다.



### Generative vs Discriminative models

1) Generative models

데이터 $X$가 생성되는 과정을 두 개의 확률모형 $P(Y), P(X\vert Y)$로 정의하고 베이즈룰을 사용해 $p(Y\vert X)$를 간접적으로 구합니다. 
$$
P(Y \vert X) = \frac{P(X\vert Y) P(Y)}{P(X)}
$$
generative model은 레이블정보가 있어도 되고(지도학습 기반 생성모델의 선형판별분석), 없어도 가능합니다.(비지도학습 기반 Gaussian mixture model, 토픽모델링 등)



또한 $P(X\vert Y)$를 구축하기 때문에 이 모델로 $X$를 샘플링할 수 있습니다. (다양한 샘플 생성가능)





2) Discriminative models

$P(Y\vert X)$ : 데이터 $X$가 주어졌을 때 레이블 $Y$가 나타날 조건부확률입니다. 결정 모델(discriminative model)은 이를 직접적으로 반환하는 모델을 가리킵니다. 레이블 정보가 있어야 하므로 지도학습에 속하며 X의 레이블을 잘 구분하는 결정경제(decision boundary)를 학습하는 것이 목표가 됩니다. (예. 선형회귀)



### 생성 모델의 분류(Taxonomy of Generative models)

![](https://i.ibb.co/RPQMrfz/image.png)



---

## 1) PixelRNN and PixelCNN

### PixelRNN

van der Oord et al. 2016

* image의 코너부터 시작해 이미지 픽셀을 생성합니다.
* RNN(LSTM)을 사용하여 모델링된 이전 픽셀에 의존합니다.
* 단점 : 순차적 생성으로 느립니다.



### PixelCNN

* image 코너에서 부터 시작하여 픽셀을 생성합니다.
* 맥락 영역에서 CNN을 사용하여 모델되므로 이전 픽셀에 의존적입니다.
* 학습이 PixelRNN보다 빠릅니다. (학습 이미지로부터 맥락 영역 값을 알고있기 때문에 병렬 합성곱 연산이가능합니다.)
* 생성은 여전히 순차적으로 일어나서 느립니다.

* 학습 : 훈련 이미지의 likelihood를 최대화합니다.



### Fully Visible belief network

명시적 밀도 모델
$$
p(x) = \prod_{i=1}^n p(x_i \vert x_1, \dots, x_{i-1})
$$
image x의 likelihood를 1차원 분포의 곱으로 분해하기 위해 chain rule을 사용

$p(x)$는 image x의 likelihood → maximize!

$p(x_i \vert x_1, \dots, x_{i-1})$는 주어진 모든 이전픽셀에 대해 i번째 픽셀값의 확률



pixel value에 대한 복잡한 분포가 필요하기 때문에,

neural network로 표현해보자.



**PixelRNN and PixelCNN**

장점 :

* likelihood p(x)를 명시적으로 계산가능
* likelihood는 좋은 evaluation metric이 됨
* 샘플링이 잘됨

단점 :

* 순차적 생성(Sequential generation)은 느림







## 2) Generative Adversarial Network

## Gaussian Distribution

![](https://i.ibb.co/kSnL9yQ/image.png)



## GAN

Ian Goodfellow et al., "Generative Adversarial Nets", NIPS 2014



문제: 간접적 방법으로 복잡하고, 고차원 훈련집합 분포로부터 샘플을 얻고싶다.

해결: 간단한 분포(random noise)로부터 샘플링하여 훈련집합 분포로 변형되도록 학습한다.

**복잡한 transformation을 표현하기위해 neural network를 사용한다.**

![](https://i.ibb.co/sCy7NYf/image.png)



Generator : 실제처럼 보이는 이미지를 생성하여 Discriminator를 속입니다.

Discriminator : 실제(real)와 가짜(fake) 이미지를 구분합니다.

![](https://i.ibb.co/L87ZfSq/image.png)



---

**Minimax game**

minimax objective function:
$$
\underset{\theta_g}{min}\  \underset{\theta_d}{max} [ \mathbb{E}_{x \sim p_{data}}log D_{\theta_d}(x) + \mathbb{E}_{z \sim p_{z}}log (1-D_{\theta_d}(G_{\theta_g}(z)))]
$$




**Discriminator는** **위 목적함수를 maximize,**

$D_{\theta_d}(x)$ : 실제 데이터 $x$에 대한 Discriminator output → 1(real)에 수렴하도록 학습

$D_{\theta_d}(G_{\theta_g}(z))$ : 생성된 가짜 데이터 $G(z)$에 대한 Discriminator output → 0(fake)에 수렴하도록 학습



**Generator는 위 목적함수를 minimize 하길 원함.**

$D_{\theta_d}(G_{\theta_g}(z))$ → 1(real)에 수렴하도록 학습

![](https://i.ibb.co/ngzBNRc/image.png)

![](https://i.ibb.co/rpmkVjm/image.png)



GAN 학습 알고리즘을 종합해봅시다.



1) for 훈련집합 반복 수(epoch)마다

​	2) for k step 마다 (k=1 또는 k>1, 최고의 룰은 없음.)

​		3) prior $p_g(z)$로부터 m개의 noise sample의 미니배치를 샘플링합니다.

​		4) 데이터 생성 분포 $p_{data}(x)$로부터 m example의 미니배치를 샘플링합니다.

​		5) ascending stochastic gradient로 discriminator를 업데이트 합니다.
$$
\nabla_{\theta_d} \frac{1}{m} \sum_{i=1}^m [ log D_{\theta_d}(x^{(i)}) + log (1-D_{\theta_d}(G_{\theta_g}(z^{(i)})))]
$$
​	6) for

​		7) prior $p_g(z)$로부터 m개의 noise sample의 미니배치를 샘플링합니다.

​		8) ascending stochastic gradient로 generator를 업데이트 합니다.(향상된 목적함수)
$$
\nabla_{\theta_g} \frac{1}{m} \sum_{i=1}^m [ log D_{\theta_d}(G_{\theta_g}(z^{(i)}))]
$$
**훈련 종료후, generator를 통해 새로운 이미지를 생성할 수 있습니다.**



---

### Generative Adversarial Nets: Convolutional Architectures



![](https://i.ibb.co/vwWb4jG/image.png)

![](https://i.ibb.co/B6N9WBF/image.png)





**GANs**

명시적 밀도함수와 함께 작동하지 않습니다.



장점:

* Beautiful, state-of-the-art samples

단점:

* Trickier / more unstable to train
* p(x), p(z|x)와 같은 inference queries를 해결할 수 없습니다.







---

**Reference**

https://kakalabblog.wordpress.com/2017/07/27/gan-tutorial-2016/

https://ratsgo.github.io/statistics/2017/09/23/MLE/

[https://ratsgo.github.io/generative%20model/2017/12/17/compare/](https://ratsgo.github.io/generative model/2017/12/17/compare/)

cose474 Deep learning

prof. Hyunwoo Kim

Junhyun Lee

MLV lab at Korea University, 2019

