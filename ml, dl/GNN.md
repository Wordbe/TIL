# GNN -part1

**들어가기 앞서서, graph와 기계학습을 알아봅시다.**



## Discrete Manifolds

graph나 data manifolds 상에서 데이터를 어떻게 분석할 것인가?

* Data manifold (isomap) 를 이용한 방법

* Social networks, brain, recommendation system, 3D system 등에 응용



---

**그래프에서 기계학습 과제**

1) Node Classification

2) Link Prediction

3) Community Detection

4) Network Similarity



---

**Feature Learning in Graphs**

* Zachary's Karate Club Network

  "DeepWalk, 2014"



---

**GNN이 해결할 수 있는 도전과제(Challenges)**

1) 고정된 해상도, 그리드를 가진 이미지에서 CNN

2) Text에서 RNN

3) 효율적인 Pooling

4) Regular grid, vector space가 아닌 complex topology

5) 고정되어 있지 않은 node 순서

6) 동형사상(Isomorphism), 순열불변(Permutation Invariant)



## 1. Node Representation Learning

**종류**

* 전통적 graph embedding
  - IsoMap, LLE, Laplacian Eigenmap

* Graph factorization (Ahmed et al., 2013) - 무향그래프(undirected graph) 사용

* Neural word embeddings (Bengio et al., 2003)

* Word2vec (skipgram)

  단어 간 유사도를 반영할 수 있도록 단어의 의미를 벡터화 한 방법

  Word2vec에는 CBOW(Continuous Bag of Words)와 skipgram 두 가지 방식이 있으며,

  CBOW는 주변 단어들로부터 중간 단어를 예측하는 방법이고

  skip-gram은 중간에 있는 단어로 주변 단어를 예측하는 방법입니다.

* LINE: Large-scale Information Network Embedding (WWW, 2015)
* DeepWalk: Online Learning of Social Representation (KDD, 2014)
* node2vec: Scalable Feature Learning of Networks (KDD, 2016)



---

### **1) LINE : Large-scale Information Network Embedding**



사용 그래프, Operational Range:

​	directed, undirected, and/or weighted graphs



목적함수 (Objective functions):

​	the first-order and second-order proximity(근접)



확장성, Scalability:

​	비동기 확률 그레디언트 하강 (Asynchronous stochastic gradient decent)

​	하나의 머신에 수백만 노드(nodes)와 수십억 간선(edges)



**First-order proximity** : KL divergence between $p_1, \hat{p}_1$

​	현실세계 네트워크에서 두 노드의 유사도를 측정할 때 사용됩니다.

​	두 노드의 가중치가 큰 엣지로 연결되어 있을 때 값이 큽니다.

​	무향그래프에서만 사용이 가능합니다.
$$
p_1(v_i, v_j) = \frac{w_{ij}}{\sum_{(m, n) \in E} w_{mn}} \ \ \hat{p}_1(v_i, v_j) = \frac{exp(u_i^T u_j)}{\sum_{(m, n) \in V \times V} exp(u_m^T u_n)}
$$
$p_1$은 ground truth로 사용됩니다. 

모든 정점 쌍 에 대해 $\hat{p}_1$를 구하여 $p_1$과의 KL divergence를 구한 후, 이 거리가 최소가 되는 값으로 학습을 진행시킵니다.

![](https://i.ibb.co/j5FkjzZ/image.png)



**Second-order proximity**

​	두 노드가 비슷한 이웃들(neighbors)과 연결되어 있을 때 큽니다.

​	무향그래프, 유향그래프 둘 다에서 사용이 가능합니다.


$$
p_2(v_j \vert v_i) = \frac{w_{ij}}{\sum_{k \in N(i)} w_{ik}} \ \ \hat{p}_2(v_i \vert v_j) = \frac{exp(u_i^T u_j)}{\sum_{k \in V} exp(u_k^T u_i)}
$$


![](https://i.ibb.co/sbGDb1Z/image.png)

$p_2$를 미리 구한 뒤,

각 점마다 $\hat{p}_2$를 구해서 KL divergence로 비교합니다.



직접 레이블($p_1, p_2$)을 만들어서 학습할 수 있으므로 self-supervised learning 이라고 할 수 있습니다.





**Optimization Tricks**

SGD + Negative sampling

​	임의로 한 에지와 여러 개의 negative 에지들 샘플링



**edge의 가중치 분산이 클 때 문제가 생김**

​	그레디언트의 Large variance 

​	이것을 해결하는 solution으로 edge sampling이 있습니다.

​	weight과 binary edges 관한 sampling edges



Complexity : $O(d K|E|)$

​	dimensionality d, negative samples 개수 k, edges 수 E



---

### **2) DeepWalk: Online Learning of Social Representations**



Word2vec의 skipgram과 유사합니다.

'문장'으로 네트워크를 임의 탐색(random walk)



---

**Alogrithm 1 : DeepWalk**

Input 으로는

graph G(V, E), 

윈도우 사이즈 w, 

임베딩 사이즈 d, 

점마다 보폭(walk) $\gamma$, 

보폭 길이 t 가 주어집니다.



Output 으로는

matrix of vertex representation $\Phi \in \mathbb{R}^{\vert V \vert \times d}$ 이 나옵니다.



1) uniform 하게 샘플 representation $\Phi$을 뽑습니다. 

2) V로 부터 binary tree를 생성합니다.

3) 각 점 마다 하나씩 늘려가며 ($\gamma$)까지

​	O = V를 셔플하여 뽑은 점 집합

4) O 에 있는 각 점마다

​	$W_{v_i}$ = random walk generated

​	**Skipgram**($\Phi, W_{v_i}, w$)로 update procedure



---

**Algorithm 2 : SkipGram**

$W_{v_i}$의 각 점 $v_j$마다

​	$W_{v_i}$에서 $v_j$에서 w만큼 떨어진 의 각 점 $u_k$마다

​		$J(\Phi) = - logPr(u_k \vert \Phi(v_j))$	

​		$\Phi = \Phi - \alpha * \frac{\partial J}{\partial \Phi} $



---

### **DeepWalk Process**



![](https://i.ibb.co/0JvWjcL/image.png)



**Random walk generate**

슬라이딩 윈도우 (윈도우 length = 2w + 1)로 랜덤워크 $W$를 생성합니다.



**Representation mapping**

생성된 랜덤워크에서 중심좌표 $v_1$을 representation $\Phi(v_1)$으로 매핑합니다.



**Hierarchical softmax**
$$
Pr(u_k \vert \Phi(v_j)) = \prod_{l=1}^{\lceil log \vert V \vert \rceil } Pr(b_l \vert \Phi (v_j))
$$
위 식(계층적 소프트맥스)을 이용해서 Skipgram의 목적함수를 구한 후, 

representation $\Phi$를 업데이트 시킵니다.





### 3) node2vec : Scalable Feature Learning for Networks

BFS : homophily(friendships) 의 성질과

DFS : structural equivalence 성질 둘 다를 이용





--

**Node representation Learning 비교**

| Algorithm | Neighbor Expansion | Proximity  | Optimization         | Validation Data |
| --------- | ------------------ | ---------- | -------------------- | --------------- |
| LINE      | BFS                | 1st or 2nd | Negative Sampling    | No              |
| DeepWalk  | Random Walk(DFS)   | 2nd        | Hierarchical softmax | No              |
| Node2Vec  | BFS + DFS          | 1st        | Negative Sampling    | Yes             |







---

## 2. GNN(Graph Neural Networks)



### Embedding

목적: node를 임베딩 공간으로 인코딩(예. dot product)

원래 그래프에서 유사도를 보존하면서 인코딩하는 것이 관건

![](https://i.ibb.co/PrJxBf3/image.png)

![](https://i.ibb.co/cTrWzr6/image.png)



주로 Transductive learning(예. embedding lookups) 입니다. 즉, 새로운 샘플에 대해 inference할 수 없습니다.



GNN은 Inductive learning을 가능케 합니다.

또한 parameter sharing이 가능합니다.

ENC(v) 는 그래프 구조에 의존적인 함수입니다.

node features를 포함합니다.



>  **GNN 목차**
>
> 1) Basics
>
> 2) GCN(Graph Convolutional Networks)
>
> 3) GraphSAGE
>
> 4) Gated GNN
>
> 5) GAT(Graph Attention Networks)



---

### **1) GNN : Basics**

* V : a set of vertices (점 집합)
* A : adjacency matrix (인접행렬)

* $X \in \mathbb{R}^{m \times \vert V \vert}$ : node feature (노드 특징)

* 핵심 아이디어 : 그래프 구조는 이웃(neighborhoods)을 정의한다.
* 지역 이웃(local neighborhoods)에서의 Aggregation(또는 message passing)



**Neighborhood Aggregation**

![](https://i.ibb.co/Q81f4fx/image.png)



각 노드마다 정의된 인풋 특징으로 시작합니다.
$$
h^0_{v} = x_v
$$

$$
h_v^k = \sigma (W_k \sum_{u \in N(v)} \frac{h_u^{k-1}}{\vert N(v) \vert} + B_k h^{k-1}_v), \forall k > 0
$$



$\sigma$는 Nonlinear transform으로 ReLU, tanh, sigmoid 등을 사용할 수 있습니다.

점 v의 k 번째 특징($h^k_v$)은 k-1번째에서의 이웃한 점의 평균(Averaging message from neighbors)과 k-1번째의 점 v에 $B_k$를 곱한 값(Linear transform of its previous layer's embedding)으로 표현할 수 있습니다. 
$$
z_v = h^K_v
$$
마지막 층에서의 임베딩 입니다.



unsupervised loss로는 cosine similarity function을 사용합니다.
$$
J_G(z_v) = -log(\sigma(z_v^T z_u)) - Q \cdot \mathbb{E}_{u_n \sim P_n(v) log (\sigma (-z^T_v z_{u_n}))}
$$


반면, Supervised loss로는 CrossEntropy를 사용합니다.(node classification 에 사용됩니다.)
$$
L = \sum_{v \in V} y_v log(\sigma (w^T z_v)) + (1-y_v)log(1-\sigma(w^Tz_v))
$$


**Inductive learning으로서의 GNN**

따라서 위 loss를 최소화하는 파라미터 w를 알면, inductive learning(귀납적 학습)이 가능합니다.

* inductive learning이란, label이 있는 data를 통해 모든 data를 분류할 수 있는 일반적인 모델을 만들어 나가는 학습을 의미합니다.

* 반면, transductive learning은 일반적인 모델을 찾는 것이 아니라, 주어진 data들만을 잘 분류할 수 있는 최적의 알고리즘을 학습합니다. 따라서 새로운 data가 들어왔을 때 inference할 수 없다는 단점을 가지게 됩니다.

파라미터와 함수를 공유할 수 있는 모델을 만들면 이 함수를 새로운 그래프에도 적용시킬 수 있게 됩니다.

---

## 2) GCN(Graph Convolutional Networks)

**GCN 특징**

* graph convolution의 근사(approximation)

* 더 많은 파라미터 공유(parameter sharing)

* Down-weights high degree neighbors



그래프에서 점 v의 k번째  특징은 아래와 같이 정의할 수 있습니다.
$$
h_v^k = \sigma (W_k \sum_{u \in N(v) \cup v} \frac{h_u^{k-1}}{\sqrt{\vert N(u) \vert \vert N(v) \vert}}) 
$$


---

## 3) graphSAGE

**graph** **SA**ample and aggre**G**at**E**

![](https://i.ibb.co/jwryvLS/image.png)



$h_v^k$를 표현하기 위한 다양한 방법들이 있네요.

AGG는 용도에 따라 바뀔 수 있습니다.

1) MEAN 
$$
AGG = \sum_{u \in N(v)} \frac{h_u^{k-1}}{N(v)}
$$
2) Pool: $\gamma$ max, min, mean, ...
$$
AGG = \gamma (\{Qh_u^{k-1}, \forall u \in N(v)\})
$$
3) LSTM or GRU
$$
AGG = LSTM(\{Qh_u^{k-1}, \forall u \in N(v)\})
$$


---

## 4) Gated GNN

그래프를 더 깊게 쌓아서(100+ layers) 학습할 수 있을까?

라는 아이디어에는 overfitting, 너무 많은 parameters, vanishing/exploding gradients 등의 문제가 생깁니다.



층 별로 파라미터를 공유하는 RNN model을 통해 20 층이상의 GNN을 쌓은 논문입니다.

GRU는 Gated Recurrent Unit입니다.

![](https://i.ibb.co/DRFfXN4/image.png)



**Message-Passing Neural Networks**

Gated GNN의 일반화입니다.

다음 식은 대부분 GNN을 포괄합니다.

* 엣지($e_{u, v}$)는 feature를 가질 수 있습니다.
  $$
  m^k_v = \sum_{u \in N(v)} M(h^{k-1}_u, h_v^{k-1}, e_{u, v})
  $$

* LSTM, GRU 등으로 노드 상태(state)를 갱신합니다.
  $$
  h_v^k = U(h^{k-1}_v, m_v^k)
  $$
  

---

## 5) GAT(Graph Attention Networks)

어떤 이웃(neighbors)은 다른 이웃보다 더 중요할 수 있다는 점,

즉 attention mechanism을 반영합니다.
$$
h^k_v = \sigma(\sum_{u \in N(v) \cup v} \alpha_{u, v} W^k h^{k-1}_u)
$$
$\alpha_{u, v}$는 각 이웃에 대한 attention(또는 weights)입니다.

다양한 변형(variation)이 가능합니다.
$$
a_{v, u} = \frac{exp(LeakyReLU(\alpha^T [Qh_v, Qh_u]))}{\sum_{u' \in N(v) \cup v} exp(LeakyReLU(a^T [Qh_v, Qh_{u'}]))}
$$




---

**Reference**

cose474 Deep Learning

Prof. Hyeonwoo. Kim, Joonhyeon. Lee

MLV Lab @ Korea University