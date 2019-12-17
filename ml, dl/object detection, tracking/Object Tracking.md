# Object Tracking

**VOT : Visual Object Tracking**

**MOT : Multiple Object Tracking**



---

## **Visual Object Tracking**

* 비디오에서 객체의 상태(location, velocity, track id, appearance, class)를 예측

**Model-free tracking : "center, bbox, segmentation"**

**Model-based tracking : "6 DoF, N DoF" (Degree of Freedom)**



**Challenges in object tracking**

* initialization, updating, association 일련의 과정이 적용되어야.

* 동영상에서 나타나는 Illumination(빛비춤), Rotation/Motion, Occlusion(가림), Articulation/deformation(명료도, 변형)

<br>

**Online vs offline tracking**

Online : forward만, 더 많은 물체 감지 가능

Offline : forward/backward, 좀 더 정확





## Single-Object Tracking

* template mathcing - bbox, matching similarity score 계산

* mean-shift : clustering algorithm, 임의 분포 정하고 밀도계산 후 k-means와 유사하게 clustering

* correlation tracking : Conv filter로 이미지 전체 조사, bbox reg, nice obx선택
* Siamese CNN (twin) : distance metric사용, 다른 인풋과 feature공유



### Template Tracking, matching

visual model 통과후 similarity score 측정





### Tracking as Detection

![](https://i.ibb.co/WPpwJL2/image.png)

주어진 타켓 object에서 negative 샘플을 찾아 타겟을 구분합니다.

타겟을 찾는 효과적인 방법중 하나입니다.





### Discriminative Correlation Filters(DCF)

Correlation Filter

​	frequency domain -- fft 먼저

​	conv neural network



![](https://i.ibb.co/3SXhSHk/image.png)
$$
\underset{F}{arg min} \ \Vert T \star F - G \Vert ^2
$$
closed-form solution입니다. FFT(Fast Fourier Transform)으로 빠른 연산이 가능합니다.

빠르고, 결정적(Discriminative) 이지만,

제한된 범위와 feature 문제를 가지고 있습니다.



---

### MDNet : Multi-domain CNNs

1) target 후보를 그립니다.

2) 최적 상태를 찾습니다.

3) 훈련샘플을 모읍니다.

4) 필요시 CNN을 갱신합니다.

5) 1)부터 다시 반복

![](https://i.ibb.co/6sW9FTw/image.png)



multi domain 학습이고, 훈련시 모든 비디오마다 fine-tune 작업을 해야하기 때문에 느립니다.





### RPN for tracking

![](https://i.ibb.co/k5nVHF6/image.png)

* feature에 대한 Siamese(사이어미즈) network 
* Region proposal 과 matching
* Classification 과 bbox regression 수행
* central anchors과 cosine window 적용





### VOT challenge/metrics

![](https://i.ibb.co/tMkjhGn/image.png)



### Simple Online and Realtime Tracking

SORT, Bewley et al., ICIP 2016.



* Kalman Filter 사용 - 다음 프레임에서 bbox 예측하기 위해
* Hungarian Algorithm (Bbox association)
* 어떤 점에서 각 target의 상태는 (u, v, r, h, $\dot{x}, \dot{y}, \dot{r}, \dot{h}$)로 모델화 됩니다.
* (u, v)는 bbox 중심좌표, r은 aspect ratio, h는 height
* overdot은 미분(velocities)을 의미합니다.
* Hungarian Algorithm에 대한 점수는 IOU로 연관되어 집니다.





---

**Reference**

COSE474 Deep Learning 2019 Fall

Hyunwoo J. Kim

MLV Lab @ Korea Univ.





