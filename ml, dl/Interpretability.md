# Interpretability



**ConvNet 안에서 벌어지는 일**

**첫째층 필터**를 시각화해보면,

![](https://i.ibb.co/cQHd7Zs/image.png)

**마지막층**에서는,

​	한 이미지에서 4096-차원의 특징벡터가 나오고(AlexNet), 많은 이미지에 실행시켜 feature vector를 모읍니다



* **Nearest Neighbors**

마지막층 특징 공간에서 L2 Nearest Neighbor를 구해서 test image를 비교해보면, 유사한 그림끼리 매칭되는 것을 알 수 있습니다.

![](https://i.ibb.co/r70bbyM/image.png)

* **Dimensionality Reduction**

마지막 층 feature vector의 공간을 시각화 할 수도 있습니다. 4096 차원을 2차원으로 차원축소하는 것입니다. 간단한 알고리즘으로 PCA(Principal Component Analysis)를 할수도있고, 조금 더 복잡하지만 좋은 성능을 내는 알고리즘으로 t-SNE를 사용할 수 있습니다.

![](https://i.ibb.co/bmpZzS5/image.png)



**Visualizing Activations**

중간층 feature map을 확인 할수도 있습니다.



**Maximally Activating Patches**

conv5 layer에서 128개중 17번째 channel을 고릅니다.

많은 이미지를 네트워크에서 실행시키고, 선택한 채널에서 값을 기록합니다.

최대 활성값에 대응되는 이미지 패치를 시각화합니다.



---

### **Saliency**

saliency : 중요한

아이템은 그것의 주변이웃으로 부터 두드러지는 어떤 상태나 질에 있습니다.

>  Wiki 정의: saliency detection은 중요한 attention mechanism으로 감지할 수 있는 데이터의 대부분 적절한 부분집합에서 유기체가 그 제한적 지각과 인식 자원에 집중하게 하여 학습과 살아남음(survival) 촉진합니다. 



### Perturbation Analysis

CNN에 입력값을 넣기전 이미지의 부분을 마스크씌운 후, 얼마나 많은 예측확률이 변화했는지 확인

![](https://i.ibb.co/YTPN7TW/image.png)



### Gradient?

**어떤 픽셀이 classification에서 문제가 되는가?**



forward pass에는 확률을 계산

backward에서는

이미지 픽셀에 대해 unnormalized class score의 그레디언트를 계산, 절댓값을 취하여 RGB채널에서 최댓값을 얻음



![](https://i.ibb.co/ZxLM3TF/image.png)



### Saliency Maps

위에 강아지 객체를 찾은 saliency(쎄일런시) map.

Supervision 없는 Segmentation 방식으로 쓰이기도 합니다.

![](https://i.ibb.co/QcX4PMK/image.png)



### Advanced Technique

guided backprop을 통한 중간 feature

![](https://i.ibb.co/TTfjHx6/image.png)



각 ReLU를 통해 양의 그레디언트만 역전파하여 나이스한 이미지를 볼 수 있습니다. (guided backprop)





### Visualizing CNN features: Gradient Ascent



1) 이미지를 0으로 설정합니다.

다음을 반복합니다.

2) 현재 스코어를 계산하기 위해 image를 포워드합니다.

3) 이미지픽셀에 대해 뉴런값의 그레디언트를 얻기위해 역전파합니다.

4) 이미지에 작은 업데이트를 합니다.

​                       

**(Guided backprop)** : 뉴런에 응답하는 이미지 부분을 찾습니다.
$$
I^* = \underset{I}{arg max} f(I) + R(I)
$$
$f(I)$는 뉴런값을, $R(I)$는 자연 이미지 regularizer를 의미합니다.

**Gradient Ascent** : 최대로 neuron을 활성화시킨 합성 이미지를 생성합니다.


$$
\underset{I}{argmax}\ S_c(I) - \lambda \Vert I \Vert^2_2
$$
이미지의 L2 norm으로 규제를 합니다. 주기적으로 최적화과정에서도 이를 적용합니다.

가우시안 블러를 추가하고, 작은 값을 가진 픽셀을 0으로 바꾸고, 작은 그레디언트를 가지는 픽셀도 0으로 바꿉니다.



(1) Gaussian blur image

(2) Clip pixels with small values to 0

(3) Clip pixels with small gradients to 0



Adding "multi-faceted" visualization gives nice results.

(more careful regularization, center-bias)



---

### Adversarial example

Untargeted attack : fool a model to misclassify input as any wrong class

모델을 속입니다.
$$
\underset {\delta \in \triangle(x)}{max} l(h_{\theta}(x+\delta), y)
$$


Targeted attack: fool a model to misclassify as a specific class ($\tilde{y} \neq y$)
$$
\underset {\delta \in \triangle(x)}{min} l(h_{\theta}(x+\delta), \tilde{y})
$$


### DeepDream : Amplify existing feature

특정 뉴런을 최대화하는 이미지를 합성하기보다, 네트워크에서 특정 레이어의 뉴런 activation을 증폭하자는 아이디어 입니다.

CNN에서 이미지와 layer를 고른 후, repeat;

1) Forward : 선택한 층에서 activation 계산

2) 선택한 층의 그레디언트를 자신의 activation과 같게 설정
$$
I^* = \underset{i}{argmax}\ \sum_i f_i(I)^2
$$
3) Backward : 이미지에서 그레디언트를 계산한다.

4) 이미지를 업데이트한다.

```python
def objective_L2(dst):
    dst.diff[:] = dst.data

def make_step(net, step_size=1.5, end='inception_4c/output',
             jitter=32, clip=True, objective=objective_L2):
    src = net.blobs['data']
    dst = net.blobs[end]
    
    # Jitter image
    ox, oy = np.random.randint(-jitter, jitter+1, 2)
    src.data[0] = np.roll(np.roll(src.data[0], ox, -1), oy, -2) #apply jitter shift
    
    net.forward(end=end)
    objective(dst)
    net.backward(start=end)
    g = src.diff[0]
    
    # L1 Normalize gradients
    src.data[:] += step_size/np.abs(g).mean() * g
    
    # Jitter image
    src.data[0] = np.roll(np.roll(src.data[0], -ox, -1), -oy, -2)
    
    # Clip pixel values
    if clip:
        bias = net.transformer.mean['data']
        src.data[:] = np.clip(src.data, -bias, 255-bias)
```





### Feature Inversion

이미지에 대한 주어진 CNN feature에 대해, 새로운 이미지를 찾아라:

- 주어진 feature vector에 매치되고,
- 자연스러워 보이는(image prior regularization)

![](https://i.ibb.co/rF1wBKR/image.png)



---

### Texture Synthesis

주어진 어떤 텍스쳐의 샘플 패치에 대해, 같은 텍스쳐를 가진 더 큰 이미지를 생성할 수 있는가?

Texture synthesis : Nearest neighbor

![](https://i.ibb.co/7vFKy3X/image.png)





### Neural Texture Synthesis: Gram Matrix

* CNN의 각 층은 C x H x W 텐서 feature을 줍니다. C차원 벡터의 H x W grid라고 할 수 있습니다.
* 두개의 C차원 벡터를 외적(outer product, cross product)하면 co-occurrence를 측정하는 C x C 행렬을 얻습니다. 

![](https://i.ibb.co/FxdyKrT/image.png)

* 모든 HW 개의 벡터 pairs를 각각 평균하면 C x C  모양의 **Gram Matrix**를 얻습니다.

이는 계산하기에 효율적입니다.  C x H x W 로부터 C x HW로 feature를 reshape한 후에 $G = FF^T$를 계산하면 됩니다.



1) ImageNet에서 CNN을 pretrain합니다

2) input texture를 CNN으로 forward하고, 매 층마다 activation을 기록합니다. layer i는 $C_i \times H_i \times W_i$모양의 피쳐맵을 제공합니다.

3) 각 층마다 $C_i \times C_i$모양의 Gram matrix를 계산합니다. feature의 외적을 구합니다.
$$
G^i_{ij} = \sum_k F^i_{ik}F^i_{jk}
$$
4) 랜덤 노이즈로부터 생성 이미지를 초기화합니다.

5) 생성 이미지를 CNN에 통과시키고, 각 층마다 Gram matrix를 계산합니다.

6) Gram matrices 사이의 weighted sum L2 distance Loss를 계산합니다. 
$$
L(\overrightarrow{x}, \hat{\overrightarrow{x}}) = \sum_{i=0}^L w_l \frac{1}{4N^2_lM^2_l} \sum_{i,j} (G^l_{ij} - \hat{G}^l_{ij})^2
$$
7) 이미지에서 그레디언트를 얻기 위해 Backprop을 합니다.

8) 이미지에서 gradient step을 합니다.

9) 5번으로 돌아갑니다.

![](https://i.ibb.co/9YYtmqZ/image.png)



---

### Neural Style Transfer: Feature + Gram Reconstruction

![](https://i.ibb.co/Tt0rxM1/image.png)



![](https://i.ibb.co/CQHdnfw/image.png)



문제점: Style transfer는 많은 forward/backward를 필요로해서 VGG model을 계산하는 속도가 느립니다.

해결: Style transfer를 수행할 또 다른 신경망을 학습시킵니다.



![](https://i.ibb.co/gyFb2Nr/image.png)





 Instance Normalization을 통해

하나의 네트워크로부터 다양한 스타일을 형성할 수 있습니다.

![](https://i.ibb.co/K6w2mGv/image.png)

