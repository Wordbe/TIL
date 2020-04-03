# 12 Word Embedding 02 - SGNS, Hierarchical Softmax

SGNS는 Skip-Gram with Nagative Sampling의 줄임말입니다.



## 4) Skip-gram

![](https://wikidocs.net/images/page/22660/word2vec_renew_6.PNG)

Skip-Gram은 중심 단어에서 주변 단어를 예측하려고 합니다. 여러 논문의 성능을 비교했을 때 전반적으로 Skip-gram이 CBOW보다 성능이 좋다고 알려져 있습니다.



![](http://i.imgur.com/8zNRwsn.png)

CBOW의 중심 단어(벡터)는 단 한 번의 업데이트 기회를 가지지만, Skip-gram의 경우 중심단어는 4번의 기회를 확보할 수 있습니다.(윈도우 크기 n = 2인 경우) 말뭉치가 크기가 동일하더라도 학습량이 네 배 차이난다는 의미입니다. 이와 같은 이유로 Word2Vec 수행 시 Skip-gram을 주로 사용합니다.



#### Training

$$
P(o|c)=\frac { exp({ u }_{ o }^{ T }{ v }_{ c }) }{ \sum _{ w=1 }^{ W }{ exp({ u }_{ w }^{ T }{ v }_{ c }) }  }
$$

위 식의 좌변은 중심단어 $c$가 주어졌을 때 주변단어 $o$ 가 되는 확률입니다. 이를 최대로 하는 것이 목표입니다. $v$는 입력층-은닉층 사이 가중치 행렬 $W$의 행벡터, $u$는 은닉층-출력층을 잇는 가중치 행렬 $W'$의 열벡터입니다.



![](http://i.imgur.com/zuSZWdL.png)

예를 들어 숫자로 표현하면, (중심단어 원핫벡터) x (가중치행렬) = (가중치 행렬 $W$의 행 벡터) = $v_c$가 무슨 의미인지 드러납니다. (원핫벡터 특성 상 행렬을 곱하면 W의 모든 값이 사용되지 않습니다.)
$$
\begin{bmatrix}
	1 & 2 & 3 & 2 & 5 \\
	3 & 5 & 2 & 1 & 4 \\
	8 & 3 & 2 & 7 & 1 
\end{bmatrix}
\begin{bmatrix}
0 \\ 1 \\ 0 \\ 0 \\ 0
\end{bmatrix}
=
\begin{bmatrix}
2 \\ 5\\ 3
\end{bmatrix}
$$
마찬가지로, n = 2 일 때, [0 0 0 1 0] 의 첫 번째 주변 단어는 [0 1 0 0 0] 이기 때문에, 위 식을 순서대로 보면 (은닉층-출력층을 잇는 가중치 행렬) x (정답레이블 원핫벡터) = (가중치 행렬 $W'$의 열 벡터) = $u_w$라는 것을 알 수 있습니다.

따라서 각 중심단어 후보 $w$ 마다 처음부터 끝까지 돌아가면서, 내적값 $u_w^T v_c$ 를 구해 softmax을 구한 것이 위 확률입니다. 벡터 내적은 코사인이므로 내적값은 단어벡터 간 **코사인유사도를 높인다는 의미**로 이해할 수도 있습니다.

분모는 줄일 수록 좋은데, 윈도우 크기 내에 등장하지 않는 단어들은 중심단어와이 유사도를 감소시킨다라는 의미로 이해할 수 있습니다.
$$
\begin{align*}
\frac { \partial  }{ \partial { v }_{ c } } \ln { P(o|c) } &=\frac { \partial  }{ \partial { v }_{ c } } \ln { \frac { exp({ u }_{ o }^{ T }{ v }_{ c }) }{ \sum _{ w=1 }^{ W }{ exp({ u }_{ w }^{ T }{ v }_{ c }) }  }  } \\ 
&=\frac { \partial  }{ \partial { v }_{ c } } { u }_{ o }^{ T }{ v }_{ c }-\frac { \partial  }{ \partial { v }_{ c } } \ln { \sum _{ w=1 }^{ W }{ exp({ u }_{ w }^{ T }{ v }_{ c }) }  } \\ 
&={ u }_{ o }^{ T }-\frac { 1 }{ \sum _{ w=1 }^{ W }{ exp({ u }_{ w }^{ T }{ v }_{ c }) }  } (\sum _{ w=1 }^{ W }{ exp({ u }_{ w }^{ T }{ v }_{ c }) } \cdot { u }_{ w })\\ 
&={ u }_{ o }^{ T }-\sum _{ w=1 }^{ W }{ \frac { exp({ u }_{ w }^{ T }{ v }_{ c }) }{ \sum _{ w=1 }^{ W }{ exp({ u }_{ w }^{ T }{ v }_{ c }) }  }  } \cdot { u }_{ w }\\ 
&={ u }_{ o }^{ T }-\sum _{ w=1 }^{ W }{ P(w|c)\cdot  } { u }_{ w }
\end{align*}
$$
Negative Log Softmax($-ln P(o\vert c)$) 를 사용한 손실함수(loss function) 만든 후, 이 값을 최소화 시키는 최적화를 진행하면 됩니다.

위 식과 같이 미분을 이용한 Gradient Descent를 사용합니다.
$$
{ v }_{ c }^{ t+1 }={ v }_{ c }^{ t }+\alpha ({ u }_{ o }^{ T }-\sum _{ w=1 }^{ W }{ P(w|c)\cdot  } { u }_{ w })
$$
$\alpha$는 학습률입니다. 위와 같은 방식으로 파라미터 $v_c$를 업데이트하면 됩니다.

<br>



## 5) SubSampling

Word2Vec의 파라미터는 $W, W'$입니다. 보통 말뭉치에 단어 수가 10만 개 정도라는 점을 고려하면, N(임베딩 차원수)이 100차원만 되도 (10만 x 100) x 2 = 2000만 개의 숫자를 구해야 합니다. **이 때문에 말뭉치에서 자주 등장하는 단어는 학습량을 확률적 방식으로 줄이기로 했습니다.** 등장빈도만큼 업데이트 될 기회가 많기 때문입니다.

$w_i$(i번째 단어)를 학습에서 제외시키기 위해 아래와 같이 확률을 정의합니다.
$$
P(w_i) = 1 - \sqrt{\frac{t}{f(x_i)}}
$$
$f(w_i)$는 i 번째 단어가 말뭉치에 등장한 비율을 말합니다. (i번째 단어 빈도 / 전체 단어수)

t는 사용자 지정 값으로 0.00001을 권합니다.

만일 $f(w_i)$가 0.01로 나타나는 빈도 높은 단어(예컨대 조사 ‘은/는’)는 위 식으로 계산한 $P(w_i)$가 0.9684나 되어서 100번의 학습 기회 가운데 96번 정도는 학습에서 제외하게 됩니다. 반대로 등장 비율이 적어 $P(w_i)$가 0에 가깝다면 해당 단어가 나올 때마다 빼놓지 않고 학습을 시키는 구조입니다. **subsampling**은 학습량을 효과적으로 줄여 계산량을 감소시키는 전략입니다.



## 6) Negative Sampling

대체적으로 Word2Vec를 사용한다고 하면 **SGNS(Skip-Gram with Negative Sampling)**을 사용합니다. 

위에서 배운 Word2Vec 모델에는 한 가지 문제점이 있습니다. 바로 속도입니다. Word2Vec의 마지막 출력층을 주목해봅시다. 소프트맥스를 적용하려면 분모에 해당하는 값, 즉 중심단어와 나머지 모든 단어의 내적을 한 뒤, 이를 다시 exp를 취해줘야 합니다. 보통 전체 단어가 10만개 안팎으로 주어지니까 계산량이 어마어마해집니다. 

**이 때문에 소프트맥스 확률을 구할 떄는, 일부 단어만 뽑아 계산을 하게 됩니다.** 이를 Negative sampling이라고 합니다. 절차를 알아봅니다.

* 지정한 윈도우 사이즈(n) 내에 등장하지 않는 단어(negative sample)를 5~20개 정도 뽑습니다.
* 이를 정답 단어와 합쳐 전체 단어처럼 소프트맥스 확률을 구합니다.

윈도우 내에 등장하지 않은 어떤 단어($w_i$)가 negative sample로 뽑힐 확률은 아래처럼 정의됩니다. 
$$
P(w_i) = \frac{f(w_i)^{3/4}}{\sum_{j=0}^n f(w_j)^{3/4}}
$$
$f(w_i)$는 sub-sampling에서와 같이 i 번째 단어가 말뭉치에 등장한 비율을 말합니다. (i번째 단어 빈도 / 전체 단어수)

예를 들어봅니다. 영어로 된 어떤 말뭉치에서 각 단어들이 아래와 같은 값들을 가진다고 해봅시다.

> is : 0.9^(3/4) = 0.92
> Constitution : 0.09^(3/4) = 0.16
> bombastic : 0.01^(3/4) = 0.032

$f(w_i)$을 곱씹어 보면, is는 말뭉치에서 흔한 단어, bombastic은 흔하지 않은 단어라고 볼 수 있습니다. 그런데 $f(w_i)^{3/4}$의 값은 각각 위와 같으므로, negative sampling을
할 때 bombastic이 뽑힐 확률은 is보다는 상대적으로 많이 늘게 됩니다. 하지만 애초부터 등장비율이 0.9로 컸던 is는 negative sampling을 할 때 bombastic보다 절대적으로 높은 확률로 뽑히겠지만, bombastic처럼 드라마틱하게 늘지는 않습니다.

* is : 0.9 => 0.92 : 2.2% 증가
* bombastic : 0.01 => 0.032 : 220% 증가

요컨대 negative sampling을 할 때 각 단어의 말뭉치 출현확률을 고려해, 적게 출현하는 단어에 학습 기회를 상대적으로 더 부여하는 방안이라고 이해하면 좋습니다.



추가적으로, Sub sampling과 Negative sampling은 학습하기 전 미리 샘플링을 해놓는 것이 일반적입니다.

---

## 7. Hierarchical Softmax

Negative sampling은 빈번하게 출연하는 단어가 있는 말뭉치에 적합한 반면, Hierarchical softmax는 빈번하게 출현하지 않는 단어들로 된 말뭉치에 유리하다고 알려져있습니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile24.uf.tistory.com%2Fimage%2F2162314D58C65AF02F9FD6)

이 모델은 skip-gram 처럼 $W$ 를 학습시키지 않고, 개별 노드들에 딸려있는 길이 $N$짜리 벡터를 학습시키도록 설계되어 있습니다. 각 개별노드는 leaf 노드도 포함됩니다. 이렇게 단어 leaf에 포함된 벡터는 언어모델 못지 않게 중요하게 생각하는 워드 벡터가 됩니다.

$L(w)$ : 트리 root에서 단어 leaf w까지 가는 거리. $L(w_2) = 3$

$n(w, i)$ : 트리 root에서 단어 leaf w까지 가는 길에 놓여있는 i번째 노드. 이 노드들은 벡터 $v_{n(w, i)}$가 딸려있습니다.

$ch(n(w, i))$ : $n(w, i)$의 왼쪽 자식 노드



이제 root에서부터 단어 $w$ 까지 가는 길에 놓여있는 노드에 딸려 있는 벡터와 단어 leaf $w_i$ 와 연관된 벡터리 $v_{w_i}$ 를 내적하고, sigmoid 함수를 적용해서 확률로 만들고, leaf까지 내려가며 확률들을 연달아 곱합니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile26.uf.tistory.com%2Fimage%2F26460D4058C661222D9D84)
$$
[n(w, j+1) = ch(n(w, j))]
$$
를 통해 softmax 계산에서 벗어날 수 있습니다. 
$$
\sigma(v_n^T v_{w_i}) + \sigma(-v_n^T v_{w_i}) = 1
$$
을 만족합니다.

확률 P을 구할 때 summation을 할 필요없이, 곱하기만 해도 전체 sum이 1인 확률을 보장받을 수 있습니다. 위와 같은 트리형태에서 $L(w)$은 평균적으로 $log(|V|)$에 비례하므로, 원래 덧셈에서 O(|V|)와는 더 짧게 곱셈은 O(log(|V|)) 시간복잡도를 가지게 되어 성능이 개선됩니다.



---

**Reference**

https://wikidocs.net/22660

[https://ratsgo.github.io/from%20frequency%20to%20semantics/2017/03/30/word2vec/](https://ratsgo.github.io/from frequency to semantics/2017/03/30/word2vec/)

https://dalpo0814.tistory.com/7