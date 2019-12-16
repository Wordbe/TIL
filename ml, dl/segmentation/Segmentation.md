# Segmentation

* Segmentation(FG/BG)
* Superpixel(clustering)
* Semantic segmentation
* Instance segmentation
* Panoptic segmentation



### **segmentation목표 :** 

1) 이미지를 일관된 **객체로 분리하는 것**

2) 다음 프로세스의 효율성을 위해 **유사하게 보이는 픽셀을 같이 묶는 것**

​	→ Superpixels

<br>

### Segmentation as clustering

**clustering**

* cluster center를 알면, 각 점에 group을 할당할 수 있고, (가까운 중심점 할당)
* group을 알면, 각 그룹의 중심을 알 수 있습니다. (평균)



**우리가 feature 공간으로 선택한 것에 의존**하여 다른방식으로 픽셀을 그룹화할 수 있습니다.

ex) intensity 유사도에 따른 픽셀 그룹화

즉, **feature space의 quantization**을 통해 **segmentation label map**을 만들 수 있습니다.

```matlab
img_as_col = double(im(:));
cluster_membs = kmeans(img_as_col, K);

labelim = zeros(size(im));
for i=1:k
	inds = find(cluster_membs==i);
	meanval = mean(img_as_column(inds));
	labelim(inds) = meanval;
end
```

![](https://i.ibb.co/h2kq7jB/image.png)





---

### segmentation 종류

![](https://i.ibb.co/w0mks5N/image.png)



(b) **semantic segmentation** : things(object를 포함한 한 덩이) + stuff(sky, grass 같은 것들) 를 분할합니다. 같이 엮여있는 여러개의 객체를 따로 분할할 수는 없습니다.

(c) **Instance segmentation** : Mask-RCNN에서 처럼 object detection에 fg/bg segmentation을 추가한 것입니다. 각 RoI에 대해 28 x 28 feature를 뽑아 각 픽셀별 fg/bg binary classifcation을 합니다.

(d) **panoptic segmentation** : semantic segentation + instance segmentation





---

## Semantic Segmentation

* 이미지 안 모든 픽셀을 카테고리 별 레이블링합니다.
* instance로 나누지 않고, 오직 비슷한 pixel로만 분류합니다.



### Ideas

![](https://i.ibb.co/8XR95bQ/image.png)

특정 크기의 window를 차례대로 탐색하며(slide) patch를 추출하여 CNN으로 중심픽셀을 분류합니다.

문제 : 겹치는 patch간 공유된 feature를 재사용하지 않아 매우 비효율적입니다.



![](https://i.ibb.co/Ry6Ycjq/image.png)

Conv layer로 네트워크를 만들어 한번에 모든 픽셀을 prediction합니다.

문제 : 원본 이미지의 해상도(resolution) 그대로 conv layer을 통과시키면 비용이 비쌉니다.



![](https://i.ibb.co/m9NPXZD/image.png)

Downsampling과 Upsampling이 있는 Convolutional networks를 만듭니다.



---

## In-Network upsampling



### "Unpooling"

![](https://i.ibb.co/WGcBZxx/image.png)

pooling을 역연산하는 unpooling 방법을 배워봅시다.

* 그림을 보면 바로 알 수 있게 직관적인 방법입니다. Nearest Neighbor, Bed of Nails



### "Max Unpooling"

![](https://i.ibb.co/KXqKhQN/image.png)

Maxpooling시 어디서 값을 가져왔는지 기록하고, Max unpooling시 이를 해당위치에 놓고 나머지는 0으로 채웁니다.



---

## Learnable Upsampling : Transpose Convolution



stirde는 output/input의 움직임 간에 ratio를 줍니다.

![](https://i.ibb.co/8MNhkrf/image.png)

먼저 Output을 Input으로 바꾼 연산(우리가 아는 convolution)을 생각해봅시다. (stride=2, pad=1인 상황입니다.)

4x4가 convolution을 통과하면 2x2가 될 것입니다.

이제 이 반대의 연산(transpose convolution)을 생각해봅시다.

반대인 만큼, 일단 크기를 맞추고 시작합니다.

1) input 2x2 → output 4x4가 되어야 합니다.

2) input 한칸씩 이동하면서 3x3 필터를 적용해 값을 갱신합니다.(input값에 필터값을 곱한 결과)

3) stride 2를 지난 영역에도 3x3필터를 적용해 값을 갱신합니다. 이 때 겹친 영역은 주로 sum 연산을 한다고 합니다.

* max도 가능하고, 애초에 겹치지 않게 설계하는 것도 한 방법이 될 수 있습니다.



Transpose convolution은 Deconvolution, Upconvolution, Fracionally strided convolution, Backward strided convolution 등으로 불리기도 합니다.



연습해봅시다.

![](https://i.ibb.co/m9hXmT2/image.png)





### Convolution as Matrix Multiplication (1D example)

![](https://i.ibb.co/hgGdcZs/image.png)

왼쪽 수식에서 x y x 가 아니고 x y z 입니다.





![](https://i.ibb.co/wrnWYRd/image.png)





---

## FCN for Semantic Segmentation

Jonathan et al., "Fully convolutional neworks for semantic segmentation." CVPR, 2015.

![](https://i.ibb.co/wSkZkpf/image.png)

FC layer를 Conv layer로 변형하였습니다. 이에 따라 output으로 heatmap이 나올 수 있었습니다.

<br>

**Multi-resolution**

![](https://i.ibb.co/vsGmZNy/image.png)

**coarse한 high layer 정보를 fine한 low layer정보와 합쳤습니다.**

FCN-32s는 single stream net으로 stride 32로 upsample하였습니다.

FCN-16s은 마지막 층(conv7)과 pool4층을 합쳐 stride 16으로 upsample하였습니다.

FCN-8s은 pool3을 추가로 더해, stride 8로 upsample하였습니다. 



![](https://i.ibb.co/VNCWPkN/image.png)

결과는 FCN-8s 처럼 상위, 하위 정보를 합친 결과가 좋았습니다. (left)

다른 알고리즘과 비교했을 때도, 미세한 구조를 recover하고, 가까이 연결된 물체를 구분하며, occlusion(가리는 것)에 robust함을 알 수 있습니다.



FCN은

1) Downsampling, upsampling

2) Fully convolutional network

3) Skip connection

을 기억하면 되겠습니다.



---

### U-Net

![](https://i.ibb.co/sg8XRRM/image.png)



메디컬 이미지에서 잘 쓰입니다.



---

## Video Segmentation and spatio-temporal consistency

![](https://i.ibb.co/cXzJKZy/image.png)



Weak annotation,

Weak supervision 의 상황에서도

FlowNet에서의 OpticalFlow를 통해 FusionSeg는 좋은 성능을 보입니다.



이렇게 Appearance model과 Motion model이 합쳐진 Joint model은 더 좋은 성능을 냅니다.



한편, ADE20K 데이터셋을 통한 Annotatioin Noise 연구도 진행이 되었습니다.



## Mask^X-RCNN

마지막으로는 Mask^X R-CNN입니다.

![](https://i.ibb.co/ft6Brsk/image.png)

![](https://i.ibb.co/znn6vzW/image.png)







---

**Reference**

* COSE474 Deep Learning 2019 Fall, Hyunwoo J. Kim, MLV lab @ Korea Univ.

