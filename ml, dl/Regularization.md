## 1.  규제(Regularization)의 필요성

신경망이 몇 개의 hidden layer와 각 layer에 몇 개의 node를 가져야 할 지 일일이 정해줄 수 없다.

따라서, 충분히 큰 용량의 신경망 구조를 설계 후, 학습 과정에서 여러 규제 기법을 적용하는 방법을 구사한다.



## 2. 규제의 정의

데이터 원천에 기본적으로 내재한 정보를 사전지식(prior knowledge)라 한다.

티호노프의 규제 기법은 smooth function을 이용해서 이 사전지식을 유지하면서(가까운 데이터는 비교적 가깝게 매핑된다.) 규제가 일어난다고 가정한다.
$$
J(\theta) = J(\theta) + \lambda R(\theta)
$$
Ian Goodfellow, 2016는 규제에 대해 다음과 같이 말한다.

> 일반화 오류를 줄이려는 의도를 가지고 학습 알고리즘을 수정하는 방법 모두



## 3. 규제 기법

여러 가지 방법들 나열해보면,

- Weight Regularization

- Early stopping
- CNN의 convolution 연산처럼 가중치 공유
- Data augmentation
- Dropout
- Ensemble
- Mapping into a manifold space



### 1) Weight Regularization, 가중치 벌칙

$$
L_{regularized}(\theta; \mathbb{X}, \mathbb{Y}) = L(\theta;\mathbb{X}, \mathbb{Y} ) + \lambda R(\theta)
$$

위 식은 보통 가중치(W)를 갱신할 때만 적용하고, bias에는 원래 손실함수 J를 사용한다.

bias는 하나의 노드에만 국한되어 규제를 하지 않아도 문제가 될 것이 없고, 규제하면 오히려 과소적합이 될 우려가 있다.



#### L2 Regularization

규제 항 R로 가장 널리 쓰이는 식은 L2 norm의 제곱이고, 이 기법은 weight decay라고도 불린다.
$$
L_{regularized}(\mathbb{W}; \mathbb{X}, \mathbb{Y}) = L(\mathbb{W};\mathbb{X}, \mathbb{Y} ) + \lambda ||\mathbb{W}||^2_2

\\ where ||\mathbb{W}||^2_2 = w_1^2 + w_2^2 + ... + w_n^2
$$


L2 norm의 제곱을 미분하면 $2\mathbb{W}$가 나온다.


$$
\begin{align}
\mathbb{W} & = \mathbb{W} - \eta \nabla L_{regularized} \\
& = \mathbb{W} - \eta(\nabla L + 2\lambda \mathbb{W}) \\
& = (1-2\eta \lambda)\mathbb{W} - \eta \nabla L
\end{align}
$$


원래의 weight update 식에서 바뀐 것은 W 앞에 $(1-2\eta \lambda) $ 를 곱해준 것이다.

보통 $\eta$는 1보다 훨씬 작은 수를 사용하기 때문에 $(1-2\eta \lambda) $ 는 1보다 작다.

따라서 W값을 $2\eta \lambda $ 만큼 축소시키고, $-\eta \nabla L$ 만큼 더하는 효과를 준다.

이런 과정을 반복하면 결국, 최종 해를 원점 가까이 당기는 효과가 난다.



#### L1 Regularization

$$
L_{regularized}(\mathbb{W}; \mathbb{X}, \mathbb{Y}) = L(\mathbb{W};\mathbb{X}, \mathbb{Y} ) + \lambda ||\mathbb{W}||

\\, where ||\mathbb{W}|| = |w_1| + |w_2| + ... + |w_n|
$$


$$
\begin{align}
\mathbb{W} & = \mathbb{W} - \eta \nabla L_{regularized} \\
& = \mathbb{W} - \eta(\nabla L + \lambda sign(\mathbb{W})) \\
& = (1-2\eta \lambda)\mathbb{W} - \eta \nabla L
\end{align}
$$
L1 norm을 미분하면, sign 함수가 나오며, 이는 각 요소별로 양수면 1, 음수면 -1을 반환한다.


$$
\begin{align}
\mathbb{W} & = \mathbb{W} - \eta \nabla L_{regularized} \\
& = \mathbb{W} - \eta(\nabla L + \lambda sign(\mathbb{W}) \\
& = \mathbb{W} - \eta \nabla L - \eta \lambda sign(\mathbb{W})
\end{align}
$$
이 역시 w의 부호에 따라 각각 따져보면, 결국 해를 원점으로 당기는 효과가 있다.

여러 문헌에서 L1 norm을 사용하면 0이되는 weight가 많다는 현상이 이론적, 실험적으로 입증되었다.

이 현상을 희소성(sparsity)이라 하며, 0인 weight는 제거 가능하다.

이를 Neural Net에 적용하면, 0이 된 weight를 제거함으로써 완전연결을 희소연결로 바꾸어 overfitting을 방지하는 기능을 한다고 봐도 무방하다.



### 2) Early Stopping, 조기 멈춤

검증집합(validation set)의 오류가 최저인 지점을 만나면 그곳에서 멈추는 전략을 취한다. (Prechelt, 2012)



검증오류 그래프는 계속 감소하는 것이 이상적인데, 실제로는 올라갔다 내려가는 경우도 있고, 진폭이 심해서



검증오류가 한 번 올라갔다가 바로 멈추는 것이 아니라,

patience factor(참을성 인자, p)를 설정한다.

예를 들어 p = 10으로 정했다면,

10번이상 오류가 예전보다 더 크다면, 조기 멈춤을 하게 된다.



### 3) Data Augmentation, 데이터 확대

과대적합을 확실히 해결하는 방법 중 하나는 충분히 큰 training set으로 학습하는 것이다.

이를 위해 데이터를 증식시키는 방법으로 크게

1 선형변환

2 비선형변환

이 있다.



**선형 변환**은 영상에 있는 물체의 이동, 회전, 크기 변환 등을 한다. 이를 어파인 변환(Affine transform)이라고 하기도 한다. (x, y) 를 (ax + b, ay + b)로 옮기는 변환이라고 생각하면 된다.

하지만, 선형 변환을 통해 만든 데이터가 실제 다른 클래스가 되어버리기도 하는데, 예를 들어 숫자 6을 180도 회전하면 9가 되어 전혀 다른 클래스가 되어버린다.

이를 위해 같은 부류에 속하는 샘플 2개 사이의 모핑 변환을 자동으로 알아낸 다음, 모핑을 통해 더 자연스럽게 새로운 데이터를 생성하는 방법을 제안하였다. (Hauberg, 2016)

모핑은 **비선형 변환**으로, 어파인 변환보다 훨씬 다양한 데이터를 생성할 수 있다.



이 외에도 이미지의 일부를 뜯어내어 데이터를 생성 (**patch**) 하기도 하고, 

**좌우, 상하를 반전**하기도 한다. (Krizhevsky, 2012)



또한, RGB 화소에서 PCA 변환을 적용하여, 고유벡터, 고윳값 정보를 이용해 색상을 변환하기도 한다.



입력에 noise를 섞거나 더 선명하게 하는 기법도 있다. (Gaussian blur, constrast, sharpen, brighten) (Poole, 2014) 이는 고급 특징 수준에서의 데이터를 확대하는 효과로 볼 수 있다.



### 4) Dropout, 드롭아웃

드롭아웃은 마치 여러개의 예측기를 결합하는 접근방식을 가지며, 앙상블 기법의 일종으로 볼 수 있다.

하지만, 앙상블 기법은 각 모델마다 하이퍼 매개변수를 설정하고 학습시키는 힘든 작업을 포함하고, 모델을 저장하는데 메모리가 많이 필요하다. 또, 예측 단계에서 시간이 많이 소요되어 실시간 동작에서의 적용이 불가능하다.

드롭아웃은 앙상블 효과를 거두면서, 하나의 모델만 사용하는, 가중치 공유방식을 사용한다.

보통 입력층에서는 0.2 비율로, 은닉층에서는 0.5비율로 가중치 연결을 제거하면 좋다고 알려져있다. (Srivastava, 2014)

또한 P<sub>hidden</sub>을 제거한 layer는 $\frac{1}{P_{hidden}}$ 만큼 그 layer의 노드 수를 증가시켜 주면 된다.



### 5) Ensemble, 앙상블 기법

1 Model averaing, Voting - 모델 출력의 평균을 구하거나, 투표하여 최종결과를 구한다.

2 Bagging - boostrp aggregating의 약어로, 부트스트랩 기법을 앙상블 기법으로 확장한 것이다.

3 Boosting - i번째 만든 예측기가 틀린 샘플을 i+1번째 예측기가 잘 인식할 수 있는 방식의 연계성을 가지도록 앙상블을 구축한다.



앙상블은 실제로 일반화 능력을 향상시킨다는 것이 이론적, 실험적으로 입증되었다.







[참고 - 기계학습, 오일석]

