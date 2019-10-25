# 3. Neural Networks

뉴럴넷은 `torch.nn`을 통해 구현이 가능하다.

``nn.Module``은 층(layers)을 포함하고, `forward(input)`은 output을 리턴한다.



대표적인 학습 과정(Typical training procedure)

1) 학습가능한 파라미터를 가진 뉴럴넷을 정의한다.

2) 인풋 데이터셋에 대해 반복한다. (for all dataset(=epoch))

3) 네트워크를 통해 인풋을 진행한다.(forward)

4) loss를 계산한다.

5) 네트워크의 파라미터로 gradient를 역전파한다. (backward)

6) 파라미터(weights)를 업데이트 한다. (weight = weight - learning_rate * gradient)





---

## Define the network



가벼운 뉴럴넷 하나를 만들어보자.

![](https://i.ibb.co/0qHkbsB/image.png)



```python
class LightNet(nn.Module):
    
    def __init__(self):
        super(LightNet, self).__init__()
        self.conv1 = nn.Conv2d(N_CHANNEL_IN, N_CHANNEL_OUT, 3)
        self.conv2 = nn.Conv2d(N_CHANNEL_OUT, 16, 3)
        self.fc1 = nn.Linear(H * W * 16, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)
    
    def forward(self, x):
        x = F.max_pool2d(F.relu(self.conv1(x)), (2, 2))
        x = F.max_pool2d(F.relu(self.conv2(x)), 2)
        x = x.view(-1, self.num_flat_features(x))
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)
    
    def num_flat_features(self, x):
        size = x.size()[1:]
        num_feature = 1
        for s in size:
            num_feature *= s
        return num_feature
net = LightNet()
net

>>
LightNet(
  (conv1): Conv2d(1, 6, kernel_size=(3, 3), stride=(1, 1))
  (conv2): Conv2d(6, 16, kernel_size=(3, 3), stride=(1, 1))
  (fc1): Linear(in_features=576, out_features=120, bias=True)
  (fc2): Linear(in_features=120, out_features=84, bias=True)
  (fc3): Linear(in_features=84, out_features=10, bias=True)
)
```







이렇게 `forward` 함수만 작성하면 `backward` 함수는 autograd를 통해 자동적으로 정의된다. 

학습되는 파라미터(learnable parameter)는 다음과 같이 리턴할 수 있다.

```python
params = list(net.parameters())
print(len(params))
for i in range(len(params)):
    print(params[i].size()) # weight1, bias1, ..., weight5, bias5
>>
10
torch.Size([6, 1, 3, 3])
torch.Size([6])
torch.Size([16, 6, 3, 3])
torch.Size([16])
torch.Size([120, 576])
torch.Size([120])
torch.Size([84, 120])
torch.Size([84])
torch.Size([10, 84])
torch.Size([10])
```



각 layer의 weight은 

```python
stdv = 1. / math.sqrt(self.weight.size(1))
self.weight.data.uniform_(-stdv, stdv)
```

다음과 같은 값으로 기본 설정 된다.

self.weight.size(1) 는 input 수 이다.

이 값으로 나누는 이유는 각 레이어의 분산 분포를 학습 시작시 입력 분포와 비슷하게 하기 위함이다.

즉 LeCun Uniform Initialization을 하고 있다!

참고 https://reniew.github.io/13/ 



---

**Note**

>  `torch.nn`은 미니배치 형태의 인풋만을 지원한다. 
>
> 형식은 (nSamples x nChannels x Height x Width)의 4D 텐서이다. (nn.Conv2d)
>
> 따라서 하나의 샘플을 넣기 위해서는 앞에 (1, )을 추가해야 하는데,
>
> input.unsqueeze(0)로 간단하게 fake 배치 차원을 만들 수 있다.

---

**Recap**

* `torch.Tensor` : 다차원 배열 / autograd 연산을 지원하고(backward() 같은 것), tensor로 gradient를 보유한다.

* `nn.Module` : 신경망 모듈 / 파라미터를 캡슐화하고 GPU에 옮기고, export하고 load하는 편리한 방법이다. 

* `nn.Parameter` : 텐서 중 한 종류 / Module로 속성이 할당되었을 때 자동으로 파라미터로 등록된다.

* `autograd.Function` : autograd 연산의 forward, backwar 정의를 실행한다.

  모든 Tensor 연산은 하나 이상의 Function 노드를 생성하는데, 이 노드는 Tensor를 생성하고 history를 인코드하는 함수와 연결되어 있다.

---



## Loss Function



```console
input -> conv2d -> relu -> maxpool2d -> conv2d -> relu -> maxpool2d
      -> view -> linear -> relu -> linear -> relu -> linear
      -> MSELoss
      -> loss
```

`loss.backward()` 를 호출할 때, 전체 그래프가 loss에 대해 미분이 되는데, 이 때 그래프 안의 `requires_grad=True`인 모든 텐서는 gradient가 누적된 `.grad` 텐서를 가진다.



## Backprop

```python
net.zero_grad() # 모든 파라미터의 gradient 버퍼를 0으로 만든다.

print('conv1.bias.grad before backward')
print(net.conv1.bias.grad)

loss.backward()

print('conv1.bias.grad after backward')
print(net.conv1.bias.grad)

```





## Update the weights

SGD 알고리즘을 이용한다.

```python
# SGD 다음과 같이 구현할 수 있다.
learning_rate = 0.01
for f in net.parameters():
    f.data.sub_(f.grad.data * learning_rate)
```



하지만 Nesterov-SGD, AdaGrad, RMSProp, Adadelta, Adam, RAdam 등 다른 최적화 방법도 이용해보고 싶다.

```python
import torch.optim as optim

optimizer = optim.SGD(net.parameters(), lr=0.01)

optimizer.zero_grad() # zero the gradient buffer (꼭 해주어야 한다.)
output = net(input1)
loss = criterion(output, target)
loss.backward()
optimizer.step() # update
```

