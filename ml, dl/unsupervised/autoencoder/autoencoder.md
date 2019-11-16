# Autoencoder

오토인코더는 특징 벡터 x를 입력받아 동일한 또는 유사한 벡터 x' 를 출력하는 신경망이다.



d(입력층 노드 개수), m(인코딩 후 은닉 층 노드 개수)라 하자.

d > m 이면 오토인코더는 의미를 가진다.

훈련집합을 충실하게 복사하는 오토인코더를 만들었다고 가정하면,

새로운 샘플 x가 들어왔을 때 인코더로 추출한 h는 훨씬 적은 메모리로 저장할 수 있다.

따라서, 영상 압축, 분류, 회귀 등의 다양한 응용에 활용될 수 있다.

이렇게 차원 축소 용도로 인코더를 활용하는 방법이 있는 반면,



희소 코딩 기법(sparse coding)으로 실제 필요한 양보다 훨씬 많은 요소를 사용하는 과잉 완벽 방식으로 좋은 성능을 달성하는 방법도 있다.



오토인코더를 분류할 수 있다.

d < m, d = m, d > m 인 경우와

선형, 비선형함수를 섞었는지 경우로 분류할 수 있다.



---

**오토인코더 학습**

![](https://i.ibb.co/QfcpNh0/image.png)


$$
\widehat{\theta} = \underset{\theta}{argmin} \sum_{i=1}^n L(x_i, g(f(x_i)))
$$
L은 손실함수로, 목적함수 역할을 한다.

여러가지 손실함수가 가능하지만, 주로 MSE(평균 제곱 오차, mean square error)를 사용한다.
$$
L(x_i, g(f(x_i))) = ||x_i - g(f(x_i))||^2_2
$$


선형 매핑만 사용하고, d > m 이고, loss함수로 MSE를 사용한다면, 최적화 알고리즘이 찾아내는 가중치의 값은 PCA가 찾아내는 주성분과 같다.

d < m 인 경우는 오토인코더의 용량이 너무 큰 상태이다. 이 때는 입력을 단순히 복사하는 기능만 배울 뿐 특징을 추출하지 못하는 상황이 발생할 수도 있다. 이에 대해서는 규제를 이용해 해결하는 방법이 있다.





## 1. 규제 오토인코더(regularized autoencoder)

SAE(sparse autoencoder), DAE(denoising autoencoder), CAE(contractive autoencoder)

이들은 모두 적절한 규제 기법을 사용함으로써,

d < m 일 때 '단순 복사만 하는 기능만 배우는' 네트워크를 개선할 수 있다.

> 충분히 큰 용량의 모델을 사용하되, 적절한 regularization을 적용하여 overfitting을 방지한다라는 트렌드를 autoencoder도 따른다.



---

**SAE (Sparse AE)**
$$
SAE: \widehat{\theta} = \underset{\theta}{argmin} \sum_{i=1}^n L (x_i, g(f(x_i))) + \lambda \phi(h_i)
$$
$\phi(h_i)$는 벡터 $h_i$가 0이 아닌 요소를 희소하게 가지도록 강제하는 항이다.

이 항을 구현하는 방법은 여러가지 있는데, 예를 들어 $h_i = f(x_i)$를 계산하는 인코딩 단계 후, $h_i$를 구성하는 요소 중 큰 순서로 q개만 남기고 나머지를 0으로 바꾸어 error backpropagation 알고리즘을 적용하는 아이디어를 사용한다.(Makhzani, 2014)

학습을 마친 후에는 latent vector h를 주로 분류를 위한 특징 벡터로 사용한다.

---

**DAE(Denosing AE)**

noise가 섞인 입력을 넣어서, noise가 제거된 원래 벡터를 복구해야하는 과제이다.
$$
DAE: \widehat{\theta} = \underset{\theta}{argmin} \sum_{i=1}^n L (x_i, g(f(\widetilde{x}_i)))
$$
$\widetilde{x}_i$ 는 $x_i$에 적절히 noise를 추가한 것이다.

**즉, 잡음이 섞여 입력 변화가 있더라도, 원래 패턴으로 돌아가 '상수'로 유지되도록 강제한다.**

이 때 잡음을 제거하는 연산을 학습으로 자동으로 알아내는 셈이다.



잡음을 발생시키는 방법은 다양하다.

* 가우시안 노이즈
* 임의로 선택한 노드의 값을 0으로 만듦
* 이미지의 경우 salt-and-pepper noise 추가가능





---

**CAE(Contractive AE)**


$$
\begin{gather}
CAE: \widehat{\theta} = \underset{\theta}{argmin} \sum_{i=1}^n L (x_i, g(f(\widetilde{x}_i))) + \lambda \phi(h_i) \newline 
where, \phi(x_i, h_i) = \left \Vert \frac{\partial f}{\partial x} \right \Vert^2_F
\end{gather}
$$


CAE는 인코더 함수 f에 관심을 둔다.

f의 jacobian 행렬의 프로베니우스 놈(Frobenius, norm 아래 F로 표기, = L2 norm)을 작게 유지함으로써 규제 효과를 거둔다. 

$h_i = f(x_i)$을 규제해야 하므로, $\phi(x_i, h_i)$ 라고 쓴다.

만일 인코더가 non-linear한 항 없이 선형식으로만 이루어져있다면, 

규제항 $\phi$의 값은 단순히 인코더를 구성하는 12개의 가중치 제곱합이 된다.



CAE가 비선형식을 사용하고, $\tau_{encode}$로 시그모이드 함수를 채택하였으면,

$$
\phi(x_i, h_i) = \sum_{k=1}^3\sum_{j=1}^4w^2_{jk} (\sigma(w_jx_i)(1-\sigma (w_jx_i)))^2
$$
가 된다.



CAE 식을 보면, 

첫번째 항은 복원을 정확히 하는 역할을 하고, 

두번째 항은 위 식의 값을 작게 유지하여 규제 효과를 거두는 역할을 한다.

 최적화 알고리즘은 이 둘의 균형점을 찾아 최적해를 구한다.

규제 항이 작아지려면 $\sigma$항이 0 또는 1에 가까워야 한다. 즉, 은닉 노드가 포화상태에 도달해야 한다. 

학습이 진행되게 되면, 일부 적은 노드만 0 또는 1에서 먼 값을 가지고, 대부분은 0 또는 1에 가까워진다.



입력 공간에서 가까운 두 특징 벡터가 인코더를 통해 특징 공간으로 변환되면,

특징 공간에서 이 둘은 더 가까워지는 효과가 있다. (공간 축소 현상, contranctive)





## 2. 적층 오토인코더(stacked autoencoder)

오토인코더는 하나뿐이고, 표현력에 한계가 있으며, 여러 층으로 쌓으면 용량이 커지는 문제가 있다.





---

**층별 예비학습**

Vincent, 2010

![](https://i.ibb.co/GpLJN5P/image.png)



그림에서 보듯이, 층별로 오토인코더를 학습시킨다.

층별 예비학습 1에서 학습한 $f_1$ 의 가중치는 학습 후 고정되고,

층별 예비학습 2에서 학습한 $f_2$의 가중치도 학습 후 고정된다.

이런 식으로 층별 예비학습(layer-wise pretraining)을 거친다.



(알고리즘에서는 그 때마다 최적의 선택을 추가하는 방식을 greedy 알고리즘이라 하여,

층별 예비학습을 greedy layer-wise pretraining이라 부르기도 한다.)



그 후에는 마지막에 MLP로 지도학습을 한 후 , 전체 단계에 대해 미세조정(fine-tuning)을 한다.

층별 예비학습과 MLP학습을 통해 이미 최적점에 가까워졌으므로, 전체를 한번에 학습하더라도,

gradient vanishing과 같은 심각한 문제가 일어나지 않는다.



---

**확률 오토인코더**

결정론적(같은 입력에 대해 항상 같은 출력이 나옴) 오토인코더와 다르게,

확률 과정을 추가하여 확률 모델로 확장할 수 있다.



인코딩에서 $h=f(x)$ 가 $P_{encode}(h|x)$ 로

디코딩에서 $x = g(h)$가 $P_{decode}(x|h)$ 로 대치된다.



가장 대표적 확률 오토인코더는 RBM(Restricted Boltzmann machine)이다. RBM에서는 계산 과정을 에너지 분포로 생각한다. RBM를 여러 층으로 적층하여 DBN(deep belief network)을 구성하기도 한다.

확률 모델의 가장 큰 장점은 생성 모델로 활용할 수 있다는 것이다.



---

**층별 예비학습과 딥러닝**

MLP의 층을 늘려 깊은 구조로 만들면 성능 향상이 일어날 것이라 믿었지만,

깊은 MLP학습은 번번히 실패였다.

여기서 layer-wise pretraining (Hinton, 2006) 이 제안되었고, 

힌튼 교수는 AE에 확률 개념을 더한 DBN 이었다.

이런 이유로 층별 예비학습이 딥러닝을 촉발하였다고 평가하곤 한다.(Bengio, 2009) (Erhan, 2010)



결국은 규제기법, 활성함수 등 알고리즘 측면 향상과

GPU성능 향상, 빅데이터 확보 등으로 층별 예비학습을 하지 않아도 월등한 성능을 낼 수 있었다.(Goodfellow, 2016)