# 1. Pytorch?

파이썬 기반 scientific 컴퓨팅 패키지 이다.

* GPU 파워를 이용하며, numpy를 대체한다.

* 최고의 flexibility와 속도를 제공하는 딥러닝 연구 플랫폼이다.



## Tensors

Tensor는 numpy의 ndarrays와 비슷하다.

여기에 더불어 텐서는 컴퓨팅을 가속하기 위한 **GPU에서도 사용가능**하다.



### 간단한 텐서조작

```python
# uninitialized 값
# 초기화되지 않은 행렬(matrix)을 선언하면, 할당된 메모리에 아무값이나 들어간다.
x = torch.empty(5, 3)

# 0~1 사이값
x = torch.rand(5, 3)

# zero 값(data type = long(8byte = 64bit))
x = torch.zeros(5, 3, dtype=torch.long)

# data로부터 바로 tensor를 구성
x = torch.tensor([5.5, 3])

# 기존에 있는 tensor기반으로 새로운 tensor 생성
x = x.new_ones(5, 3, dtype=torch.double) # double = float64(8byte)
x = torch.randn_like(x, dtype=torch.float) # override type --> type변경

# size 반환
x.size() # tuple이라서 모든 tuple연산 지원
```



### 연산(Operations)

```python
y = torch.rand(5, 3)
x + y # elementwise 덧셈 연산
torch.add(x, y) # 다른 방법

torch.add(x, y, out=result) # 출력값 result에 저장
y.add_(x) # in-place (x + y결과 값을 y에 저장)
# inplace는 모든 연산 뒤에 _를 붙이면 된다.
# ex) x.copy_(y)

x[:, 1] # numpy 인덱싱 가능

# Resize
x = torch.rand(4, 4) # torch.Size([4, 4])
y = x.view(16) # torch.Size([16])
z = x.view(-1, 2) # torch.Size([2, 8])
# -1 사용하면, 다른 차원크기를 자동으로 정해줌.
print(z)
>>
tensor([[0.0539, 0.7787],
        [0.2270, 0.9777],
        [0.5003, 0.0953],
        [0.8397, 0.8585],
        [0.2710, 0.4353],
        [0.2999, 0.5829],
        [0.7446, 0.8887],
        [0.3996, 0.9234]])


x = torch.randn(1) # 정규분포(normal distribution)에서 크기 1, 임의로 선택
x.item() # tensor 가 한 원소를 가지면, 그 값을 python number로 가져올 수 있다.
```





100가지 이상의 연산을 제공한다.

transpose, indexing, slicing, 수학 연산, 선형대수, 랜덤숫자 등등

자세한 사항은 아래 주소를 참고하면된다.

 https://pytorch.org/docs/stable/torch.html 

t, transpose, squeeze, max, min, isnan, eye, diag, fft, histc,





### Numpy Bridge(numpy와의 연결)

Torch tensor가 numpy array로 전환되면, 메모리 위치를 공유한다.(Torch tensor가 CPU 위에 있을 경우)

```python
a = torch.ones(5)
b = a.numpy() # tensor to numpy

a.add_(1)
print(a)
print(b)
>>
tensor([2., 2., 2., 2., 2.])
array([2., 2., 2., 2., 2.], dtype=float32) # b도 같이 값이 바뀐다.
```



```python
a = np.ones(5)
b = torch.from_numpy(a) # numpy to tensor
np.add(a, 1, out=a)
print(a)
print(b)
>>
array([2., 2., 2., 2., 2.])
tensor([2., 2., 2., 2., 2.], dtype=torch.float64) # b도 같이 값이 바뀐다.
```



### CUDA Tensors

.to() 메서드로 cpu 상 메모리를 gpu로, gpu 상 메모리를 cpu로 할당할 수 있다.

```python
if torch.cuda.is_available():
    device = torch.device("cuda")
    x = torch.randn(5, 3)
    x = x.to(device)
    y = torch.ones_like(x, device=device)
    z = x + y
    print(z)
    print(z.to("cpu", torch.double))
>>
tensor([[ 0.9415,  0.4488, -0.1003],
        [ 1.7513,  1.7650,  0.1830],
        [-0.0056,  2.7160,  0.8505],
        [ 1.3295,  0.4604, -0.3516],
        [ 0.7096,  3.2554,  1.5455]], device='cuda:0')
tensor([[ 0.9415,  0.4488, -0.1003],
        [ 1.7513,  1.7650,  0.1830],
        [-0.0056,  2.7160,  0.8505],
        [ 1.3295,  0.4604, -0.3516],
        [ 0.7096,  3.2554,  1.5455]], dtype=torch.float64)
```





# 2. Autograd (자동 미분)

모든 텐서 연산에 대해 자동적인 미분을 제공한다.

pytorch는 define-by-run framework인데, 사용자의 backprop이 사용자가 코드를 어떻게 짜느냐에 따라 정의된다. 모든 iteration마다 다를 수 있게 만들 수도 있다.

---

### **Tensor**

`torch.Tensor`는 파이토치 패키지에서 중요한 클래스이다.



**.requires_grade** 를 True로 설정하면,

모든 연산을 추적하기 시작하는데, forward 연산이 모두 끝나면

**.backward()** 를 호출하여 모든 gradient가 자동적으로 계산될 수 있도록 한다.

이 텐서에 대한 gradient는 **.grad** 속성에 누적(accumulated)된다.



텐서에서 history를 추적하는 것을 멈추고 싶다면, **.detatch()**를 호출하면 된다.



history 추적을 그만하고, 메모리를 사용하려면, **with torch.no_grad():** 블락 안에서 코드를 구성(wrap the code block)하면 된다. 

주로 모델을 평가(evaluation)할 때 사용한다. 학습가능한 파라미터가 requires_grad=True 상태일텐데, 우리는 테스트할 때 gradient가 필요없기 때문이다.



`Fuction` 도 autograd 실행에 중요한 클래스이다.

Tensor와 Function은 서로 연결되어 acyclic graph를 구성하는데, 이는 연산의 모든 로그(history)를 인코딩한다. 모든 텐서는 Function을 참조하는 .grad_fn 속성을 가지고 있다.



앞서 말했던 것처럼 미분을 하고 싶으면 .backward()를 호출하면 되는데, 텐서가 스칼라면 상관없지만, 벡터나 행렬이라면 gradient의 매개변수를 잘 조정해서 shape을 조절하면 좋다.



**처음에 Tensor를 생성할 때 부터 requires_grad=True 설정**

```python
x = torch.ones(2, 2, requires_grad=True)
>>
tensor([[1., 1.],
        [1., 1.]], requires_grad=True)

y = x + 2
>>
tensor([[3., 3.],
        [3., 3.]], grad_fn=<AddBackward0>)

y.grad_fn
>>
<AddBackward0 at 0x15dec14fb70>

z = y * y * 3
out = z.mean()
print(z)
print(out)
>>
tensor([[27., 27.],
        [27., 27.]], grad_fn=<MulBackward0>)
tensor(27., grad_fn=<MeanBackward1>)
```



**나중에 requires_grad_(True) 설정 (덮어씌움, in-place)**

```python
a = torch.randn(2, 2)
a = ((a * 3) / (a - 1))
print(a.requires_grad)
a.requires_grad_(True) # in-place 할 수 있다.
print(a.requires_grad)
b = (a * a).sum()
print(b.grad_fn)

False
True
<SumBackward0 object at 0x0000015DEC14FC18>
```



일반적으로 말하면, torch.autograd 는 vector-Jacobian product 연산 위한 엔진이다.



다음과 같은 상황이 있다고 하자.


$$
\begin{gather*}
l = g(y) \newline 
y = f(x) \newline

\newline 
J = 
\begin{pmatrix}
\frac{\partial y_1}{\partial x_1} & \cdots & \frac{\partial y_1}{\partial x_n} \\
\vdots & \ddots & \vdots \\
\frac{\partial y_m}{\partial x_1} & \cdots & \frac{\partial y_m}{\partial x_n}
\end{pmatrix}

\newline 
J^T = 
\begin{pmatrix}
\frac{\partial y_1}{\partial x_1} & \cdots & \frac{\partial y_m}{\partial x_1} \\
\vdots & \ddots & \vdots \\
\frac{\partial y_1}{\partial x_n} & \cdots & \frac{\partial y_m}{\partial x_n}
\end{pmatrix}

\newline 
v = 
\begin{pmatrix}
\frac{\partial l}{\partial y_1} & \cdots & \frac{\partial l}{\partial y_m}
\end{pmatrix}^T

\end{gather*}
$$




vector-Jacobian product는 다음과 같이 계산한다.
$$
\begin{align} 
\frac{\partial l}{\partial x} &= \frac{\partial l}{\partial y} \frac{\partial y}{\partial x} \newline 
& = v^T \cdot J \newline

(\frac{\partial l}{\partial x})^T & = J^T \cdot v \newline 
& = 
\begin{pmatrix}
\frac{\partial y_1}{\partial x_1} & \cdots & \frac{\partial y_m}{\partial x_1} \\
\vdots & \ddots & \vdots \\
\frac{\partial y_1}{\partial x_n} & \cdots & \frac{\partial y_m}{\partial x_n}
\end{pmatrix}
\begin{pmatrix}
\frac{\partial l}{\partial y_1} \\
\vdots \\
\frac{\partial l}{\partial y_m}
\end{pmatrix} = 
\begin{pmatrix}
\frac{\partial l}{\partial x_1} \\
\vdots \\
\frac{\partial l}{\partial x_n}
\end{pmatrix}
\end{align}
$$


```python
x = torch.randn(3, requires_grad=True)
y = x * 2
while y.data.norm() < 1000:
    y = y * 2
print(y)
>>
tensor([   90.6625, -1230.3733,   -18.2669], grad_fn=<MulBackward0>)
```



a.backward() 메서드는 스칼라 값에 대해서는 묵시적으로 답을 내주지만,

a가 벡터, 혹은 텐서일 경우 a의 바로 전단계 미분값인 v를 backward() 입력에 넣어주어야 한다.

```python
v = torch.tensor([0.1, 1.0, 0.0001], dtype=torch.float)
y.backward(v)
x.grad
>>
tensor([1.0240e+02, 1.0240e+03, 1.0240e-01])
```



grad값을 구할 필요가 없다면, requires_grad를 False로 하여,

forward의 모든 연산을 추적할 필요가 없게 한다.

```python
print(x.requires_grad)
print((x ** 2).requires_grad)
with torch.no_grad():
    print((x ** 2).requires_grad)
    
>>
True
True
False
```

