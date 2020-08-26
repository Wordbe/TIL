# ADP 008 - Data Analysis

# 08 군집분석  (Clustering Analysis)

목표는 **비슷한 개체끼리 한 그룹으로 묶는 것**이다.

방법으로는 **[군집 간 분산(Inter-cluster variance) 최대화]**, **[군집 내 분산(Inner-cluster variance) 최소화]** 가 있다.



## 군집 분석 단계

* 1 적절한 속성 선택
* 2 데이터 표준화(Scale)
* 3 이상치 필터링(Screen outliers)
* 4 거리 계산 : Euclidean, Maximum, Manhattan, Canberra, Binary, Minkowski 등
* 5 군집 알고리즘 선택 : 
  * 계층적 군집은 150 관찰치 이하의 적은 데이터에 적합
  * 분할군집은 더 많은 데이터 가능, 군집 개수 정해 주어야
* 6 군집 개수 결정
* 7 최종 결과 획득
* 8 군집분석 결과 시각화
  * 계층적 군집 : Dendrogram
  * 분할군집 : 이변량 Cluster plot
* 9 결과 해석 : 가능하면 군집을 네이밍, 군집의 관측치 공통점, 차이점
* 10 타당도 확인 : 군집타당성지표로는 `Dunn Index`, `Silhouette` (`fpc`, `clv`, `clValid `패키지 사용)



* Dunn Index

$$
I(C)=\cfrac { \min _{ i\neq j }{ \{ { d }_{ c }({ C }_{ i },{ C }_{ j })\}  }  }{ \max _{ 1\le l\le k }{ \{ \triangle ({ C }_{ l })\}  }  }
$$

* Silhouette

$$
s(i)=\frac { b(i)-a(i) }{ \max { \{ a(i),b(i)\}  }  }
$$



---

# 09  계층적 군집분석(Hierarchical Clustering)

병합적(Agglomerative) 방법, 분할적(Divisive) 방법이 있다.

## 계층적 군집분석(병합적) 알고리즘

* 관찰치 군집 정의
* 군집 간 거리 계산
* 가장 작은 거리를 하나의 군집으로 만든다.
* 모든 관찰치가 한의 군집으로 합쳐질 때 까지 반복한다.



* **군집 타당도** 측도를 이용해 **군집 수 결정** 가능 : `NbClust` 패키지와 군집 내 `sum of squares`, `gap statistics`가 있다.
* D지수(Dindex), 휴버트지수(Hubert Statistics) 변화를 보고 군집 수를 결정한다.



---

# 10 K-평균 군집(K-means Clustering)

계층적 군집과 달리 군집 수를 미리 정해주어야 한다. 

* `Nbclust` 패키지를 통해 적절한 군집 수를 알 수 있다.
* 군집수에 따른 집단 내 제곱합(within group sum of squares) 그래프를 그려서 적당한 군집 수를 결정할 수 도 있다. (`wssplot`)

* `randIndex` : 수정된 랜드지수 (-1 ~ 1)
* Binary 거리
* 캔버라 거리



---

# 11 Partioning Around K-medoids(PAM 군집)

K-means가 유클리드 거리로 centroid를 구할 때 평균을 이용하기 때문에 이상치에 민감하다. PAM에서는 관찰치(Medoids)를 구하기 위해 다른 거리 측정법도 사용하므로 연속형 변수나 mixed data type에도 적합시킬 수 있다.



---

# 12 혼합분포군집(Mixture Distribution Clustering)

k개의 모수적 모형(정규분포 또는 다변량 정규분포 가정)의 가중합으로 표현되는 모집단 모형을 가정하고, **모수**와 **가중치**를 자료로부터 추정한다.

이를 위해 EM 알고리즘이 사용된다.

* 1) 랜덤으로 모수 모델 초기화 후 각 관측치는 각 군집에 속할 확률이 계산된다.
* 2) E-step : 각 자료가 속한 집단에 대한 정보를 가지는 잠재변수(latent variable)를 계산한다.
* 3) M-step : 위 확률을 통해 최대우도추정으로 모수를 추정하고, 모수값이 변화가 없을 때까지 반복한다.



---

# 13 밀도기반군집(Density-based Clustering)

* 밀도가 높은 데이터가 가까이 위치하면 동일한 군집으로 묶는 방식이다.
* 임의의 형태의 군집을 찾는 장점이 있다.
* 대표적으로 DBSCAN(Density-Based Spatial Clustering of Application with Noise) 알고리즘이 있다.
* 2개의 파라미터 (**Eps**, 군집 내 개체 최소수(**MinPts**))

Step

* 1) eps, minPts 설정
* 2) 잡음점 군집에서 제외
* 3) eps 반경 안에 있는 코어점들을 서로 연결
* 4) 연결된 코어점들을 하나의 군집으로 형성
* 5) 경계점은 코어점을 포함하는 군집 중 하나에 할당

장점

* K-means 와는 달리 군집 수를 미리 정할 필요가 없다.
* 임의 형태를 가지는 군집 찾을 수 있다.
* 잡음 정보를 제공하며 이상치에 민감하지 않다.
* DB 값 순서에 민감하지 않다.

단점

* 경계점은 두 군집 모두에 속할 수 있다.



---

# 14 퍼지 군집(Fuzzy Clustering)

k-means 또는 PAM 군집 등에서 자료의 각원소들은 한 개의 군집으로만 할당된다. 이를 하드군집 또는 비퍼지군집이라한다.

퍼지군집(또는 소프트군집)은 **각 원소는 각 군집에 속할 확률**을 갖는다. 

* `fanny`



---

# 15 K-NN (K-Nearest Neighbors)

K-NN 분류모형은 새로운 데이터에 대해 가장 유사한(거리) K개의 과거자료 결과를 이용하여 다수결로 분류한다.

과거의 자료를 단순 저장하고, 새로운 데이터가 있을 시 비교하여 분류하기 때문에 Lazy model 또는 사례기반 학습이라 한다.

* 단점: 데이터 지역 구조에 민감하다.

```R
data(iris)
install.packages("DMwR")
library(DMwR)

df <- sample(1:nrow(iris), as.integer(0.7 * nrow(iris)))
trainiris <- iris[df, ]
testiris <- iris[-df, ]

# k=3
nc3 <- kNN(Species~., trainiris, testiris, norm=FALSE, k=3)
table(testiris[, 'Species'], nc3)

# k=5
nc5 <- kNN(Species~., trainiris, testiris, norm=FALSE, k=5)
table(testiris[, 'Species'], nc5)
```



---

# 16 SVM, Suport Vector Machine

* 마진 : 서로 다른 클래스에 속하는 점들 사이의 최단 거리
* 초평면 : 데이터를 특성별로 분리하는 초평면이란, 가장 가까운 훈련 데이터 까지 거리가 가장 큰 경우

* SVM은 입력 피처의 2차 이상 다항식을 비선형으로 모형화 할 수 있다. 이를 커널기법(Kernel Trick)이라 한다.
* 2개 파라미터: cost(초평면과 마진 간격 결정), gamma(영향력을 미치는 범위)
  * cost가 크면 마진을 좁게형성, 초평면이 복잡해진다.

```R
data(iris)

library(e1071)
svm <- svm(Species~., data=iris, type="C-classification", kernel='radial', cost=10, gamma=0.1)
# type: svm 수행방법 (분류, 회귀)
# kernel: radial은 가우시안 RBF
# degree: 다항 커널의 경우 모수(차수)이며, gamma, cost 등이 있다.
summary(svm)

pred <- predict(svm, iris, decision.values = TRUE)
table(pred, iris$Species)
```





---

# 17 연관성분석(Association Analysis)

상품, 서비스 등의 조합을 찾아내 상품 추천, 상품 배치, 마케팅 개발 등으로 끼워팔기를 통해 이득을 볼 수 있게하는 데이터 마이닝 기법.

### 1) `arules` 패키지

* Apriori, ECLAT

> FP-GROWTH 알고리즘
>
> 후보 빈발항목집합 생성하지 않고, FP-Tree를 이용하여 빠르게 빈발항목집합을 추출할 수 있다.



---

# 18 순차 패턴 분석(Sequence Pattern Analysis)

What goes after what?













