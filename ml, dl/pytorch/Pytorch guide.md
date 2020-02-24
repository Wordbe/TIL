# [Pytorch] 파이토치를 써야하는 이유 & 텐서란

이 글은 Deep Learning with pytorch를 번역, 편집한 글 입니다.

![](https://i.ibb.co/g63MvVm/image.png)





# 1. 딥러닝과 Pytorch 라이브러리 개요

## 1) 파이토치(Pytorch)란?

파이토치는 딥러닝 프로젝트를 빌드(build)하는 데 도움을 주는 파이썬 프로그램용 라이브러리 입니다.

파이토치는 유연성(flexibility)을 강조하며, 무엇보다 파이썬에서 자연스럽습니다.(파이써닉 하다고 합니다.)

파이토치는 코어 데이터 구조인 텐서(Tensor)를 제공합니다. 이는 NumPy 배열(array)과 비슷한 다차원 배열입니다. 텐서는 수학적 연산을 가속화합니다. 파이토치는 분산 학습을 위한 패키지가 있고, worker는 데이터 불러오기(loading)를 효율적으로 처리할 수 있습니다.



이 책에서는 방대한 딥러닝 영역이 아닌, 실전에서의 문제를 푸는 딥러닝과 새로운 모델을 소개합니다. 최근 논문은 주로 아카이브(ArXiV)에 공개되어 있습니다. [https://arxiv.org](https://arxiv.org)



## 2) 딥러닝 라이브러리 비교

각광받는 두 가지 딥러닝 라이브러리가 있습니다. 이 둘을 비교해 봅시다.

| Tensorflow                           | Pytorch                                              |
| ------------------------------------ | ---------------------------------------------------- |
| Google                               | Facebook                                             |
| Define and Run                       | Define by Run                                        |
| 정적 그래프                          | 동적 그래프 (유연)                                   |
| 상품에 대한 견고한 파이프라인을 가짐 | 쉬운 덕분에 많은 연구, 교습 커뮤니티가 존재          |
| 넓은 산업적 커뮤니티가 존재          | 파이토치 연구자들, 졸업자들이 산업쪽으로 많이 넘어옴 |



파이토치는 성능적 이유로 대부분 C++과 CUDA 언어로 만들어졌습니다. 따라서 NVIDIA사의 GPU를 통한 병렬처리가 가능합니다. 하지만 주로 python을 통해 모델을 구성하고, 학습시키며, 문제를 해결할 것입니다. 

파이토치 모델은 Flask 웹 서버를 사용하여 실행될 수 있습니다.

파이토치의 텐서(tensor)는 CPU 또는 GPU에서 연산이 가능합니다. 이 연산은 텐서에서 기초적으로 제공되고, `torch.autograd`에서 정제됩니다. 

파이토치에서 신경망을 쌓기 위한 코어 모듈은 `torch.nn`입니다. 완전연결층(fully connected layer, `nn.Linear`), 합성곱층(convolutional layer, nn.Conv2d), 활성화 함수(activation function), 손실함수(loss function) 등을 정의할 수 있습니다.



![](https://i.ibb.co/47pBLjN/image.png)



데이터를 불러오거나 다루는(handling) 데 필요한 다용도기능은 `torch.util`에서 찾을 수 있습니다.

`Dataset`을 통해 개인적인(custom) 데이터를 pytorch 표준 텐서로 바꿀 수 있습니다. 

그리고 `DataLoader`를 통해 배치단위로 학습 루프에 들어가기 위한 데이터를 준비해주는 데이터 로더를 만들 수 있습니다.

뿐만 아니라 여러 대의 GPU를 데이터 로딩과 학습 연산에 사용할 수 있도록 `torch.nn.DataParallel`과 `torch.distributed`를 지원합니다.

그리고 모델의 최적화를 위해 `torch.optim`을 지원합니다.



Python 인터프리터의 비용을 줄이고 Python 런타임으로부터 독립적으로 모델을 실행시키기 위해, 파이토치는 `TorchScript`를 제공합니다. 텐서 연산에 제한된 가상 머신을 생각하면 좋습니다. 효율적 연산을 위해 Just in Time(JIT)을 지원합니다.



## 3) 준비할 하드웨어

GPU를 활용한 파이토치 연습을 위해서는 NVIDIA GTX 1070 이상의 GPU를 추천한다고 합니다.

Pytorch는 원래 Linux와 macOS를 지원했었고, 2018년부터 Winodws도 지원하게 되었습니다. 하지만 Apple 노트북은 CUDA를 지원하는 GPU를 탑재하지 않으므로 CPU만 사용가능합니다.

OS 의존성을 없애기 위해 Jupyter notebook 상에서 코드를 작성하면 좋습니다.



---

# 2. 텐서(Tensor)

```python
a = [[1.0, 2.0], [3.0, 1.0], [2.5, 1.5]]
tensor = torch.tensor(a)
tensor
>>

tensor([[1.0000, 2.0000],
        [3.0000, 1.0000],
        [2.5000, 1.5000]])
```

다음과 같은 2차원 배열을 `torch.tensor`를 통해 바로 텐서로 변환할 수 있습니다.

자세한 torch.tensor 사용법은 공식 홈페이지 문서를 참고하시기 바랍니다.

https://pytorch.org/docs/stable/tensors.html



![](https://i.ibb.co/cgLrHhM/image.png)





### Storage

텐서는 모양은 다양할 수 있지만, 저장공간은 1차원 배열로 storage에 저장됩니다.

```python
tensor.storage()
>>

1.0
2.0
3.0
1.0
2.5
1.5
[torch.FloatStorage of size 6]
```



### Transpose

텐서는 transpose가 가능합니다.

```python
tensor_t = tensor.t()
tensor_t
>>

tensor([[1.0000, 3.0000, 2.5000],
        [2.0000, 1.0000, 1.5000]])
```



하지만 transpose 후에도 저장된 순서는 같습니다.

```python
## id는 객체를 입력으로 받아서 객체의 고윳값(레퍼런스)를 반환하는 함수입니다.
id(tensor.storage()) == id(tensor_t.storage())
>>
True
```



이로서 확인할 수 있는 것은 텐서를 transpose하여도 새로운 메모리가 할당 되는 것이 아니라 storage로 부터 모양만 바꾼다는 것을 알 수 있습니다.



### Contiguous

원래 텐서와 트랜스포즈된 텐서의 연속성을 비교해 봅시다.

```python
tensor.is_contiguous()
>>
True

tensor_t.is_contiguous()
>>
False
```

contiguous한 텐서는 storage 상에서 점핑없이 순서대로 효율적이게 방문할 수 있기 때문에 메모리 접근 성능을 향상 시킬 수 있습니다.

contiguous 하지 않은 텐서는 다음과 같이 연속하게 만들 수 있습니다.

```python
tensor_t = tensor_t.contiguous()
tensor_t.is_contiguous()
>>
True
```



## Numeric type

텐서는 다양한 타입을 가지고 있습니다.

기본값(default)은 `torch.float`(=`torch.float32`)이며 32bit floating point 입니다.

그 외

 `torch.double`(=`torch.float64`)

 `torch.int8`

 `torch.uint8`

 `torch.int`(=`torch.int32`)

 `torch.long`(=`torch.int64`)

등이 있습니다.



### 텐서 저장(Serializing tensors)

pytorch는 tensor 객체를 직렬변환하기 위해 `pickle`을 이용합니다. 다음과 같이 torch 객체를 쉽게 저장할 수 있습니다. model을 저장하는데 주로 사용되는데 model이 알고보면 아주 거대한 torch 객체 덩어리임을 알 수 있습니다.

```python
torch.save(tensor, '../data/out/result.t')
```

저장한 모델은 아래와 같이 불러올 수 있습니다.

```python
loaded_tensor = torch.load('../data/out/result.t')
```



하지만 이는 pytorch 라이브러리가 없는 경우 다른 환경에서 열수가 없습니다. 파이썬은 HDF5 포맷을 지원합니다. HDF5는 널리 쓰이는 직렬 다차원 배열을 저장하는 포맷입니다. key-value 딕셔너리로 이루어져있습니다.

```
$ conda install h5py
```



```python
import h5py

filepath = '../data/out/result.hdf5'
f = h5py.File(filepath, 'w')
f.create_dataset('coords', data=points.numpy())
f.close()
```

저장된 .hdf5파일은 아래와 같이 불러옵니다.

```python
f = h5py.File(filepath, 'r')
dset = f['coords']
torch_dset = torch.from_numpy(dset)
f.close()
```





### GPU를 사용하는 텐서로 변환

주로 사용하는 방법은 다음과 같습니다.

```python
import torch
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
```

GPU 사용이 가능하다면 "cuda:0"가, 그렇지 않다면 "cpu"가 device에 저장될 것입니다.

데이터 뒤에서 .to()를 이용합니다.

```python
tensor_gpu = tensor.to(device)
```

GPU가 사용가능하다면, 이 코드는 같은 숫자 데이터를 갖는 새로운 텐서를 반환하며, 기본 RAM이 아닌 GPU의 RAM안에 저장이 됩니다.

물론 GPU가 여러대면 cuda:숫자 를 조정하여 사용할 GPU를 고를 수 있습니다.



또는 간편하게 다음과 같이 실행시킬 수도 있습니다.

```python
tensor_gpu = tensor.cuda() # default는 0 입니다.
tensor_gpu = tensor.cuda(0)
tensor_cpu = tensor.cpu()
```



이 외에도 pytorch의 Tensor를 조작할 수 있는 다양한 API가 존재합니다.

pytorch 공식사이트를 참고하시면 됩니다. (https://pytorch.org/docs/stable/index.html)



---

**Reference**

Eli Stevens, Luca Antiga, Deep Learning With pytorch, 2019