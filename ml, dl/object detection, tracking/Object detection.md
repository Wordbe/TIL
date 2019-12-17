# Object detection

## Computer Vision Tasks

![](https://i.ibb.co/Tw6PXcs/image.png)





## Single Object Detection : Classification + Localization

![](https://i.ibb.co/s92s5r6/image.png)





## Multiple Object Detection

![](https://i.ibb.co/bJrqfQn/image.png)

한 이미지에서 각각 다른 crop을 CNN에 적용하여 객체/배경을 분류합니다.

문제 : 한 이미지에서 location, scale, aspect ratio의 많은 crop을 CNN에 적용시켜야해서 컴퓨터연산 비용이 비쌉니다.





# 1. Two-stage Object Detector

## Region proposal : Selective Search

미리 객체를 포함하고 있을법한 blobby(뚜렷하지 않은) 이미지 영역을 찾아냅니다.

상대적으로 모든 영역을 sliding window하는 것보다 빠릅니다. Selective search는 CPU에서 몇초만에 2000개의 region proposal을 제공합니다.



## Region-based Network

![](https://i.ibb.co/CszbJ2L/image.png)





|      | [R-CNN](https://arxiv.org/abs/1311.2524)                     |
| ---- | ------------------------------------------------------------ |
| 구조 | 1. Input image<br />2. Region proposals(~2k)<br />3. Feature extraction using CNN<br />4-1. Classify regions (Linear SVM)<br />4-2. Bbox regression (L2 loss) |
| 그림 | ![](https://i.ibb.co/SBP6FhP/image.png)                      |
| 특징 | - 각 픽셀마다 적용된 sliding window 대신, **selective search**를 사용해서 2000여개의 object가 있을 법한 후보 **region proposal** 생성<br />- Region proposal과 groud-truth bbox의 IoU $\geq 0.5$이면 positive, 아니면 negative로 결정<br />- background인 negative가 상대적으로 많아서 loss에 영향을 주었으므로, 32개의 positive : 96개의 negative를 합쳐 128 크기의 하나의 배치로 학습**(hard negative mining)**<br />- 각 Region proposal을 crop, **warp**하여 고정된 크기(227 x 227)로 CNN에 입력<br />- 각 클래스마다 해당 클래스가 맞는지 분류(**linear SVM**)<br />- **bbox reg를 위한 parameterization** : scale invariant, log-space 변형을 통해 예측 bbox와 ground-truth box사이에 Bbox regression를 위한 파라미터를 만들어 이를 학습할 수 있도록 함<br />- Test시 **NMS**(non-maximum suppression) 적용하여 최선의 bbox를 찾음<br />- **Pretrained, fine-tuning**을 통하여 레이블이 부족한 데이터에 대해서도 성능 향상 |
| 단점 | 각각의 이미지의 2천여개 region proposal마다 CNN 연산이 필요하므로 매우 느리다. |



문제 : 2000개의 region proposal을 CNN에 돌리려니 정말 느립니다.

해결 : convolution과 cropping을 바꾸어서 먼저 한 이미지에서 feature를 뽑고, 그 위에서 crop을 해봅니다.



<br>

---

![](https://i.ibb.co/m4PwLt0/image.png)





|      | [Fast R-CNN](https://arxiv.org/abs/1504.08083)               |
| ---- | ------------------------------------------------------------ |
| 구조 | 1. Input image<br />2. ConvNet(backbone network: AlexNet(S), VGG(M), VGG(L))<br />3. Region proposals → RoI Pooling<br />4. CNN per region<br />5-1. Classify regions (softmax)<br />5-2. Bbox regression (smooth L1 loss) |
| 그림 | ![img](https://i.ibb.co/xqTPLtK/image.png)                   |
| 특징 | - 기존 R-CNN과 달리 crop전에 **image를 ConvNet에 먼저 처리**함: 각 이미지에 대해서는 한번에 ConvNet만 통과하면 되기 때문에 **속도 개선**<br />- ConvNet에서 나온 feature에서 **selective search**를 통해 RoI를 얻음<br />- 각 RoI마다 **RoI pooling**을 하여 다음 CNN에 고정된 크기의 인풋으로 입력<br />- **multi task loss**를 가지고, pretrained model을 사용하여 성능을 개선한 **end-to-end** 모델 (RoI pooling은 backpropagtion을 통해 gradient를 구할 수 있고, 이를 통해 전체는 하나의 네트워크가 될 수 있다.)<br />- classification의 경우 SVM보다 **softmax-log loss**를 사용하여 더 좋은 결과를 얻음<br />- Bbox regression는 **smooth L1 loss**를 사용했는데, 이는 L2 loss보다 outlier에 조금 덜 민감하도록, 즉 robust한 loss를 만드는데 도움 |
| 단점 | 여전히 region proposal을 뽑아내는 데 많은 실행시간이 걸립니다. (test당 2.3초) |



Fast RCNN에서는 먼저 입력이미지를 CNN에 넣고, 나온 feature를 RoI Warp하는대신 RoI Pooling을 사용합니다. 



### RoI Pooling

![](https://i.ibb.co/kVZCxKf/image.png)

1) 논문에서는 7x7 로 RoI Pooling했지만, 여기서는 2x2로 생각해봅시다.(채널수 512는 생략)

2) 이미지에서 고양이 영역은 feature에서 4 x 5 region proposal 에 대응됩니다.(실제 논문 구현에서는 20 x 15로 했습니다.) 여기서 width, height를 각각 2로 나누어 몫을 구하면 2, 2 가되는데, 그래서 위에 보이는 파란박스처럼 (2 + 2) x (2 + 3)으로 나누어집니다.

3) 각각의 subregion에서 max-pool을 하면됩니다. (채널별로 동일하게)

손으로 계산해보았습니다.

![](https://i.ibb.co/ZSPm3DQ/image.png)



하지만 **RoI** **Pooling**은 Region feature가 input image region proposal과 미세하게 일치하지 않는다는 문제가 있습니다. 

아래에서 언급하게 될 Mask R-CNN에서 **RoI Align**을 통하여 이 문제를 해결하였습니다.



<br>

---

### RoI Align

![](https://i.ibb.co/GvvhpDf/image.png)

1) Image feature에서 region proposal은 (x, y, w, h)의 형태로 주어집니다.(x, y: 좌상단 좌표, w : 넓이, h : 높이)

2) 2x2 로 축소한다고 하면, 나눠진 subregion마다 다시 2x2로 sub-window를 나눕니다.

3) 우리는 나눠진 모든 sub-window의 중점 좌표$(x_m, y_n)$를 알 수 있고, image feature로부터는 각 픽셀값$f_{mn}$을 알 수 있습니다. 양선형보간법(bilinear interpolation)을 이용하여 각 sub-window에서는 $f_{xy}$를 얻어냅니다.

4) 각각 subregion에서 구한 feature값을 비교하여 max pooling합니다.





손으로 계산해보았습니다.

![](https://i.ibb.co/vdTtNYM/image.png)







---

![](https://i.ibb.co/jLrw1Zs/image.png)



Fast R-CNN은 이름답게 다른 네트워크에 비해 경이로운 속도를 기록했습니다.

하지만 이 시간의 대부분은 region proposal 실행시간이 차지했습니다.

그리고, Region proposal을 자동으로 제안해줄 네트워크를 생각하게 됩니다.



---

### RPN, Region Proposal Network

![](https://i.ibb.co/tHHyRjQ/image.png)

![](https://i.ibb.co/N905gz5/image.png)

![](https://i.ibb.co/cYTJpYG/image.png)



1) feature map에서 각 점마다 정해진 크기의 anchor box가 있다고 생각해봅시다.

2) 각 점마다 해당 anchor box가 객체를 포함하는지 예측합니다. 픽셀당 (1 x 20 x 15)로 logistic regression 합니다.

3) 각 positive box(객체가 있는 박스)마다 anchor로부터 ground truth box까지 변형을 예측합니다.픽셀당 (4 x 20 x 15)로 box transform regression합니다.

4) 주로 K개의 다른 size/scale의 anchor box를 사용합니다.

5) object score로 K x 20 x 15 box를 정렬하고, top 300 정도를 proposal로 취합니다.



<br>

---

![](https://i.ibb.co/92MF1dz/image.png)

![](https://i.ibb.co/8KjSZvs/image.png)



|      | [Faster R-CNN](https://arxiv.org/abs/1506.01497)             |
| ---- | ------------------------------------------------------------ |
| 구조 | 1. Input image <br />2. Pretrained backbone CNN<br />3. RPN(Region Proposal Network)<br />4. Binary classification loss + Bbox regression loss(smooth L1)<br />5. RoI Pooling → CNN<br />6. Multiple classification loss(log loss) + Bbox regression loss(smooth L1) |
| 그림 | <img style="max-height:50%; max-width:70%;" src="https://i.ibb.co/CVBGM3m/image.png"> |
| 특징 | - 첫번째 CNN에서 나온 feature에 3 x 3 spatial window를 취하여 **RPN**을 통과 후 region proposal을 생성<br />- 각 윈도우마다 3가지 scale($128^2, 256^2, 512^2$), 3가지 aspect ratio($1:1, 1:2, 2:1$)를 가진 anchor가 존재<br />- Proposal은 FC layer를 통과한 후 bbox regression 및 bbox classification(obj/non-obj)을 수행<br />- Fast R-CNN은 기존과 같음**(RoI Pooling)**<br />- Alternative training 방법을 적용해서 RPN을 먼저 학습 후, Fast R-CNN을 학습시켰고, RPN을 fine-tune한 다음 다시, Fast R-CNN을 fine-tune |
| 단점 | 정확도 성능도 개선되었고, 속도도 거의 실시간에 가깝게 되었지만, 수치상 조금의 성능발전이 좀 더 필요합니다. |









# 2. One-stage Object Detector

![](https://i.ibb.co/pW5qs72/image.png)



### YOLO : You Look Only Once

1) 입력 이미지에서 각 grid cell을 중심으로하는 base box(anchor box)들의 집합을 만듭니다.

2) 각 grid cell에서 B개의 bbox를 ground-truth와 비교하여 (dx, dy, dh, dw, confidence)를 regress합니다.

3) background를 포함하여 C클래스로 score를 예측합니다.

4) RPN과 비슷하게 작동하며, RPN은 object / non-object 이렇게 binary classification을 했다면 여기는 category-specific 분류를 합니다.

5) 출력은 7 x 7 x (**5 * B + C**) feature입니다. (YOLO)



### SSD: Single Shot multibox Detector

![](https://i.ibb.co/ZKpkgjj/image.png)

Hard negative mining과 Data augmentation이 사용되었습니다.



Loss는 confidence loss와 localization loss의 합을 사용했습니다.
$$
L(x, c, l, g) = \frac{1}{N}(L_{conf}(x, c) + \alpha L_{loc}(x, l, g))
$$
N은 짝지어진 박스 수입니다. N=0일 경우 loss = 0입니다.



localization loss는 예측박스(l)와 ground-truth box(g) 파라미터 사이의 smooth L1 loss입니다.
$$
L_{loc}(x, l, g) = \sum_{i \in Pos}^N \sum_{m \in \{cx, cy, w, h\}} x^k_{ij} smooth_{L1}(l^m_i - \hat{g}^m_j)
$$


confidence loss는 multi-class confidence에 대한 softmax loss입니다.
$$
L_{conf}(x, c) = - \sum_{i \in Pos}^N x^p_{ij} log(\hat{c}^p_i) - \sum_{i \in Neg} log(\hat{c}^0_i)
$$






**참고) Two-stage와 Single-stage를 합한 Hybrid 모델로 R-FCN도 있습니다.**









## Instance Segmentation

![](https://i.ibb.co/hYQvGVK/image.png)



Faster R-CNN과 비슷하지만, 다른점은 Mask를 예측하는 mask network가 추가되었고, RoI Pooling 대신 RoI Align을 사용했다는 것입니다.

mask network는 각 RoI마다 28 x 28 binary mask를 예측합니다.



![](https://i.ibb.co/nnhchvY/image.png)





|      | [Mask R-CNN](https://arxiv.org/abs/1703.06870?source=post_page---------------------------) |
| ---- | ------------------------------------------------------------ |
| 구조 | 1. Input image <br />2. Faster R-CNN(**RoIAlign** instead of RoI Pooling)<br />3. Multiple classification loss + Bbox regression loss + **mask prediction** |
| 그림 | ![](https://i.ibb.co/72qmdLH/image.png)                      |
| 특징 | - 물체별로 segmentation을 하는 **Instance segmentation**이 가능<br />- Faster R-CNN의 구조를 그대로 이용하되, **RPN**에서 나온 proposal에 대해 RoI Pooing에서 **RoIAlign**을 사용함으로써 좀 더 정확한 bbox를 얻을 수 있었고, 정확도 성능이 개선됨<br />- Mask prediction 을 위한 head 구조 (ResNet, FPN) |
| 단점 | instance mask와 ground truth의 IoU로 mask quality를 수치화 하는데, 이는 classification score와 큰 상관관계가 없습니다. 이를 반영하여 좀 더 발전시킨 Mask Scoring R-CNN이 나왔습니다.(Huang et al., 2019, CVPR) |



---

## Extra

## IoU : Intersection of Union

![](https://i.ibb.co/0YK7yLg/image.png)

보통 예측 bbox와 ground-truth bbox사이의 IoU 를 구해 0.5 이상이면 positive 박스로 인정합니다.



### NMS : Non-maximum Supression

![](https://i.ibb.co/QjrxnkL/image.png)

추정한 region proposal중 가장 그럴듯한 박스를 찾는 알고리즘입니다.

![](https://i.ibb.co/BBFv7Vq/image.png)

위 알고리즘이 논문에 공식적으로 적힌 pseudo code이지만,

아래와 같이 구현하기도 합니다. (결과는 같습니다.)



1) 후보 region proposal 집합 B, 해당 confidence score c를 입력으로 받습니다.

2) 아웃풋은 정제된 proposal 박스 집합 D라고 합시다.

2) 집합 B를 confidence score가 큰 순으로 정렬시키고 맨 처음(가장 큰)것 b1를 골라 D에 넣습니다.

3) B의 나머지와 b를 IoU를 비교하여 $\lambda = 0.5$(threshold)보다 크면 B로부터 그 박스를 제거합니다.

4) 남은 B에서 다음으로 confidence score가 큰(맨 처음에있는) 박스를 꺼내어 D에 추가합니다.

5) 3부터 반복하다가 B에 박스가 없으면 멈춥니다.



### Soft-NMS

![](https://i.ibb.co/ypzkXW4/image.png)

위 알고리즘을 이해하셨다면, 이 알고리즘은 초록색 부분만 추가되었습니다.

해당 proposal의 detection score을 선형적으로 또는 가우시안 함수를 통해 scaling하는 것이 추가됩니다. 이로써 조금더 좀 더 성능이 개선될 수 있습니다.



### Anchor-Free Object Detectors

지금까지 배운 Anchor-based detector는 고정된 모양과 크기의 anchor가 ground-truth와 잘 맞지 않는 misalignment의 문제가 있었습니다.

하지만, Anchor-Free는 이에 비해 자유롭습니다. 박스의 좌상단, 우하단으로 ground-truth와 비교하는 CenterNet(2019)가 대표적입니다.

![](https://i.ibb.co/ZXXmfnD/image.png)





---

**Reference**

* http://cs231n.stanford.edu/slides/2019/cs231n_2019_lecture12.pdf

* COSE474 Deep Learning 2019 Fall, Hyunwoo J. Kim, MLV lab @ Korea Univ.