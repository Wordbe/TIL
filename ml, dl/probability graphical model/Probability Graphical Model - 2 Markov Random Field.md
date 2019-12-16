# 확률 그래피컬 모델(Probability Graphical Model) - part2

# 3.Markov Random Field

마르코브 랜덤필드는 무방향그래프(undirected graph)를 이용합니다.

이웃한 노드사이에만 직접적인 상호작용, 멀리 떨어진 노드와는 이웃을 통한 간접적 상호작용을 하므로 마르코프라는 이름이 붙었습니다.

또한 확률변수들(Random variable)을 고려한 필드가 형성되므로 랜덤필드라는 이름이 붙었습니다.



## 1) 동작 원리

마르코프 랜덤필드도 그래프를 분해하여 계산량을 줄여야 합니다. 이 때 그래프의 클릭(clique)을 이용합니다. 

클릭은 모든 노드 쌍이 에지를 가지는 완전 부분그래프(complete sub-graph)입니다.

![](https://i.ibb.co/PjKCn6m/image.png)

극대 클릭(maximal clique)는 노드를 추가하면 더는 완전 그래프를 유지하지 못하는 클릭을 말합니다.

(a)에서는 {a, b, c}, {b, d}, {d, e}라는 3개의 극대 클릭을 가집니다. {a, b, c}를 예로 들면, 여기에 d를 추가할 경우 더 이상 클릭이 아니므로 이는 극대 클릭입니다.

(b)에서는 $\{x_1, x_2\}$ 등 이웃한 2개 노드 모두가 극대 클릭이 됩니다.



클릭 q는 $\psi(q)$라는 퍼센셜(potential)을 가집니다. 
$$
\psi(q) = exp(-energy(q))
$$
에너지함수 energy(q)는 응용과 목적에 따라 적절하게 정의합니다.



마르코르 랜덤필드 확률분포는 다음과 같습니다.
$$
\tilde{P}(x) = \prod_{q \in G} \psi(q)
$$
G는 마르코프 랜덤필드, q는 클릭, x는 확률벡터로 위 그림의 (a)경우 $x = (a, b, c, d, e)^T$입니다. 

그런데 $\sum_x \tilde{P}(x) =1$ 라는 보장이 없으므로, 분할함수 Z로 나누어 정규화합니다.

이를 **깁스 확률분포(Gibbs distribution)**라고 합니다. 
$$
P(x) = \frac{1}{Z}\tilde{P}(x)
$$

$$
Z = \sum_x \tilde{P}(x)
$$



![](https://i.ibb.co/QcVQqZB/image.png)

![](https://i.ibb.co/R2tg0hH/image.png)

![](https://i.ibb.co/J7yj90X/image.png)



이처럼 클릭 단위로 분해하여 퍼센셜을 계산할 수 있고, 퍼텐셜을 모두 곱하면  계산이 끝납니다.

하지만, $\tilde{P}(x)$는 정규화 되어있지 않아서 확률로 사용할 수 없고, 정규화를 위해 Z를 구해야합니다.

n개의 확률변수마다 k개의 값을 가지면 $k^n$개의 상태가 있는데, 모두 계산하려면 차원의 저주가 발생합니다. 

보통 정확한 분할함수를 구할 수 없어 추정치를 대신 사용합니다.(Goodfellow, 2016)



마르코프 랜덤필드의 목적은 확률을 최대화하는 상태를 찾는 것입니다.
$$
\hat{x} = \underset{x}{argmax} {P(x)}
$$


## 2) 영상 잡음제거

Markov Random Field는 주로 영상처리, 컴퓨터비전의 잡음 제거, 영상 복원, 에지 검출, 텍스쳐 분석, 스트레오 비전, 영상 분할 등의 문제를 풀 때 활용됩니다.

잡음 제거를 예로 들어봅시다.

![](https://i.ibb.co/hMZZwYB/image.png)



왼쪽이미지가 오른쪽이미지보다 조금 더 매끄러운 형태를 띠고 있다는 사실을 에너지함수 energy(q)에 반영하여 잡음영상으로부터 원본영상을 구합니다.



**에너지함수 공식화**
$$
\hat{x} = \underset{x}{argmax} {P(x|y)}
$$
여기서 y는 잡음영상(오른쪽), x는 원본영상(왼쪽)입니다.



**클릭 구하기**

![](https://i.ibb.co/N9h58Sn/image.png)

여기서 두가지 클릭이 있습니다.

$\{x_i, x_j\}$와 $\{x_i, y_i\}$입니다. 



**에너지 함수 설정**

잡음 제거라는 과업에 맞게 에너지함수를 정의해 봅시다. 다음은 여러 문헌에서 사용되는 에너지 함수입니다. (Geman, 1984, Besag, 1986)
$$
\begin{gather}
energy(\{x_i, x_j\}) = -\alpha x_i x_j \\
energy(\{x_i, y_i\}) = -\beta x_i y_i
\end{gather}
$$
$\alpha, \beta > 0$ 입니다.

영상의 값이 흰색일 때 -1, 검은색일 때 1이라고 하고 위 에너지함수를 해석해봅시다.

첫째 식에서 둘의 화소가 같으면 $-\alpha$ 가 되고 퍼텐셜은 $exp(-\alpha)$가 됩니다.

반대로 화소가 다르면 $\alpha$가 되고 퍼텐셜은 $exp(\alpha)$가 됩니다. $\alpha =1 $일 때 화소가 같을 때는 2.718, 다를 때는 0.3679이므로 같을 때를 선호하게 됩니다. 즉 같은 값을 가지는 상태, 매끄러운 상태로 유지하여 잡음을 제거하는 효과가 있습니다.

마찬가지로 계산하면 둘째 식에서는 $x_i, y_i$의 사이 즉, 원래 영상과 잡음 영상이 멀어지는 효과가 있습니다.


$$
\begin{align}
P(x|y) 
= & \frac{1}{Z} \prod_{q \in G} \psi(q) \\
= & \frac{1}{Z} exp(-energy(\{x_1, x_2\})) exp(-energy(\{x_1, x_3\})) \cdots \\ & exp(-energy(\{x_1, y_1\})) exp(-energy(\{x_2, y_2\})) \\
= & \frac{1}{Z} exp(-energy(\{x_1, x_2\}) -energy(\{x_1, x_3\})) \cdots \\ 
& exp(-energy(\{x_1, y_1\}) -energy(\{x_2, y_2\})) \\
= & \frac{1}{Z} exp(-energy(x, y))
\end{align}
$$
원하는 확률은 다음과 같이 계산할 수 있습니다.



위에서 공식화한 에너지함수를 풀어 원하는 $\hat{x}$를 구할 수 있습니다.

간단한 ICM(iterated conditional modes)로 최적화 알고리즘을 실행할 수 있습니다.

이는 greedy algorithm인데, 최적해를 보장하지는 못합니다. 전역 최적해에 더 근접한 알고리즘은 그래프 절단 알고리즘이 대표적입니다.(Kolmogorov, 2004)





