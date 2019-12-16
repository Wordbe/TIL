# GNN -part2 GNN pooling

**GNN Pooling**

목적: 더 좋은 graph-level representation을 만들기 위함.

과제: graph classification



> 개요
>
> 1) Topology based pooling - 특정 clustering, Graclus, ...
>
> 2) Global pooling - Set2set(LSTM), SortPool(Sorting + Conv)
>
> 3) Hierarchical pooling - DiffPool(Soft Assign), gPool (projection score)

![](https://i.ibb.co/Fx2HgYJ/image.png)





## **Global Pooling**

그래프를 정해진 사이즈의 표현(representation)으로 요약합니다.

![](https://i.ibb.co/QrCfsS1/image.png)

* Simple Readout: average / max / min / etc ...
  $$
  \overrightarrow{s}^{(l)} = \frac{1}{N^{(l)}}\sum_{i=1}^{N^{(l)}}  \overrightarrow{x}_i^{(l)} \Vert \overset{N^{(l)}}{\underset{i=1} {max}} \overrightarrow{x}_i^{(l)}
  $$

* Neural Network for Readout: GG-NN / Set2Set / SortPool

  ![](https://i.ibb.co/ww9j3J2/image.png)







---

## **Hierarchical Pooling**

계층적 표현(representation)을 학습합니다.

* **DiffPool (Differentiable pooling)**

  ![](C:\Users\seong\AppData\Roaming\Typora\typora-user-images\image-20191214155127039.png)

  

$$
\begin{gather}
Z^{(l)} = GNN_{l,embed}(A^{(l)}, X^{(l)}) \newline 
S^{(l)} = softmax(GNN_{l, pool}(A^{(l)}, X^{(l)})) \newline 
X^{(l+1)} = {S^{(l)}}^T Z^{(l)} \in \mathbb{R}^{n_{l+1} \times d} \newline 
A^{(l+1)} = {S^{(l)}}^T A^{(l)} S^{(l)} \in \mathbb{R}^{n_{l+1} \times n_{l+1}}
\end{gather}
$$

* **gPool(Graph Pooling)**

  ![](https://i.ibb.co/MsBwRt1/image.png)

위 그래프는 graph pooling을 보여줍니다. Node가 4개인 그래프에서 선택된 노드 수 k = 2라고 가정한 그림입니다.

layer $l$ 의 그래프로부터 $X^{(l)}, A^{(l)}$를 구할 수 있습니다.

각 노드 feature를 5개로 설정했을 때 input feature matrix $X^{(l)} \in \mathbb{R}^{4 \times 5}$ 를 구할 수 있습니다.

또한 그래프의 인접행렬(adjacency matrix) $A^l \in \mathbb{R}^{4 \times 4}$도 구할 수 있습니다.

$p \in \mathbb{R}^5$는 학습가능한 프로젝션 벡터이며, 행렬곱 연산 / p의 크기 을 통해 을 통해 y 가 됩니다. 

k =2 이므로 높은 점수를 가진 두 노드를 선택한 후 인덱스를 기록합니다. 

이 인덱스를 이용해 $\tilde{X}, \tilde{y}$를 얻고, 둘을 element-wise product하여 $X^{l+1}$를 얻어낼 수 있습니다.

$A^{l+1}$은 단순히 $A^l$로부터 해당 인덱스를 가져온 행렬이 됩니다.
$$
\begin{gather}
y = X^l p^l / \Vert p^l\Vert \newline 
idx = rank(y, k) \newline 
\tilde{y} = sigmoid(y(idx)) \newline 
\tilde{X}^l = X^l(idx, :) \newline 
A^{l+1} = A^l(idx, idx) \newline 
X^{l+1} = \tilde{X}^l \odot (\tilde{y} 1^T_C)
\end{gather}
$$




* SAGPool (Self-Attention Graph Pooling)

  Self-Attention Graph Pooling, ICML 2019, Lee et al. 참고

* EdgePool

  Edge Contraction Pooling for Graph Neural Networks, ICML 2019, Frederik Diehl 참고





# GNNs Application in Computer Vision

## 1) Scene graph learning pipeline

Visual relationships of an image as a graph(CVPR, 2018)

predicate(술부) detection ↔ object detection



**Multi-relational tensor**

- 주어진 객체 카테고리와 가능한 술어에서 Multi-relational tensor로 매핑

- 훈련집합에서 관측된 [[Object, Predicate, Object]]  수

- Multi-relational tensor는 대부분 non-zero : extremely sparse tensor

![](https://i.ibb.co/6HycVTT/image.png)

**Scene graph learning**

- 이미지는 '그래프'로써 일상 객체로 주로 연결된 multiple relationships를 포함합니다.

- predicate detection과 object detection은 상호적으로 돕습니다.

Given : bbox and cls from Fast-RCNN

Goal : predict a graph of relationships (predicate and object) - Scene graph detection



**Module 1: Scene graph module (SG module)** 

1) Faster-RCNN : feature of object bboxes(nodes) and intersecting bbox(edges).

2) GRU : 노드와 엣지의 은닉상태(hidden state)

3) Message Pooling: weighted sum을 통한 edge-**node**-edge (node message) and node-**edge**-node (edge message)

4) Exchange and repeat

![](https://i.ibb.co/YhV7nvK/image.png)





**Module 2 : Relational module (ours, RL module)**

1) Faster-RCNN : feature of object bboxes(nodes) and intersecting bbox(edges).

2) **Tensor factorization** : 탐색된 레이블을 사용하여 술어를 탐색

![](https://i.ibb.co/ZmyPq5c/image.png)



**Balancing the modules**

- SG module 은 표현력이 있으나 주어진 훈련집합에 매우 의존적입니다. 
- RL module은 Robust하나 tensor construnction에 의해 object를 추론(예측)하지 못합니다.

따라서 RL 모듈로부터 globally robust한 술부 분포를 얻어 SG 모듈의 술부 분포를 규제(Regularize)할 수 있습니다. 

![](https://i.ibb.co/MCW45jJ/image.png)









## 2) GNNs for Relative Attribute Learning

Efficient Relative attribute Learning using Graph Neural Networks (ECCV, 2018)

![](https://i.ibb.co/M5W8fSs/image.png)





## 3) Graph Transformer Networks 

(NeurlPS, 2019)

### **Introduction**

**Spatial Transformer Networks, NIPS 2015**

적당한 영역을 잘라내고 크기-정규화하는 spatial transformer는 추후의 분류 과업을 간단하게 하며, 우월한 분류 성능을 이끌어냅니다.



**Heterogeneous graph**

Heterogeneous graph는 다른 종류의 노드와 에지를 포함하는 그래프를 말합니다.



**Meta-path**

Meta-path는 다른 객체 종류간에 정의된 관계의 나열을 이루는 경로입니다.

Meta-path를 사용하여 어떤 그래프를 새로운 그래프로 변형할 수 있습니다.

GNN에 관한 이전 작업은 도메인 전문가에 의해 손수 선택되는 유용한 meta-path가 큰 영향을 미쳤습니다.

→ 모델이 이를 학습할 수 있는 방법을 고안?



---

### Method

**Graph Transformer Layer(GTL)**

![](https://i.ibb.co/61ksV4F/image.png)

GTL은 인정행렬 집합으로부터 부드럽게(softmax이용) 인접행렬(edge types)을 고르고, 선택된 두 인접행렬의 행렬 곱을 통해 새로운 meta-path graph를 생성합니다.



**Graph Transformer Networks(GTNs)**

![](https://i.ibb.co/tYrBCz6/image.png)

GTNs은 GTL을 사용하여 새로운 meta-path 인접행렬 셋을 생성하는 것을 학습하고, 새로운 그래프 구조에서 GCNs(Graph convolution networks)에서 처럼 graph convolution을 수행합니다.



---

### Experiments

**Q1) GTN에 의해 새로 만들어진 그래프 구조는 node representation을 학습하는데 효율적인가?**

- GTNs은 DBLP, ACM, IMDB 데이터셋에서 다른 embedding 방법, GNN 방법(DeepWalk, metapath2vec, GCN, GAT, HAN)을 가진 네트워크에 맞서 최고 높은 성능을 달성했습니다.

- 성능은 node classification에서 f1 score를 사용했습니다.



**Q2) GTN은 데이터셋에 의존하는 meta-path의 가변길이를 적응적으로 생산할 수 있는가?**



아래 그림은 각 GTL에서 인접행렬(edge type)의 어텐션 scroe입니다. (a)는 DBLP, (b)는 IMDB 데이터셋.

![](https://i.ibb.co/HKSzncG/image.png)



- 높은 attention score를 $I$(항등행렬)에 할당함으로써, GTN은 깊은 층에서도 짧은 meta-paths를 가지려고 시도했습니다.
- GTN은 데이터셋에 의존하는 가장 효율적인 meta-path length를 적응적으로 학습하는 능력을 가졌습니다.



**Q3) 어떻게 GTNs에서 생성되는 인접행렬로부터의 각 meta-path의 중요성을 확인할 수 있나?**

- GTNs에서 생성된 meta-path도 도메인 지식에 의한 Predefined meta-path와 일관적으로 높은 순위에 있었습니다.



---

### Future Work

![](https://i.ibb.co/6g0rNbT/image.png)

Scalibility.

GraphSAGE(Graph SAmple aggreGatE) : Inductive Representation Learningon Large Graphs 에서 처럼 뽑은 그래프를 통해, 그래프를 확장하고 예측합니다.







---

**Reference**

cose474 Deep learning

prof. Hyunwoo Kim

Junhyun Lee

MLV lab at Korea University, 2019