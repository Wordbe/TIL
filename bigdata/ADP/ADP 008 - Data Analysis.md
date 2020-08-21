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