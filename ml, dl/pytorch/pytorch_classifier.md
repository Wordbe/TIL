# Training a Classifier

## 1. Loading and normalizing CIFAR 10

```python
import torch
import torchvision
import torchvision.transforms as transforms

datapath = "D:/dataset"
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

BATCH_SIZE = 4
trainset = torchvision.datasets.CIFAR10(root=datapath, train=True,
                                       download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=BATCH_SIZE,
                                         shuffle=True, num_workers=0)
testset = torchvision.datasets.CIFAR10(root=datapath, train=False,
                                      download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=BATCH_SIZE,
                                        shuffle=False, num_workers=0)
```

배치 사이즈만큼 데이터를 불러옵시다.



그림을 간단히 출력해봅시다.

```python
import matplotlib.pyplot as plt
import numpy as np

classes = ('plane', 'car', 'bird', 'cat',
           'deer', 'dog', 'frog', 'horse', 'ship', 'truck')

def imshow(img):
    img = img / 2 + 0.5
    npimg = img.numpy()
    plt.imshow(np.transpose(npimg, (1, 2, 0)))
    plt.show()
    
dataiter = iter(trainloader)
imgs, labels = dataiter.next()
print(imgs.shape, labels.shape)
imshow(torchvision.utils.make_grid(imgs))
for j in range(4):
    print(classes[labels[j]], end='    ')
```



## 2. CNN 정의

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(3, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 5 * 5, 120) 
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)
    
    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x))) # 32x32x3 / 28x28x6 / 14x14x6
        x = self.pool(F.relu(self.conv2(x))) # 14x14x6 / 10x10x16 / 5x5x16
        x = x.view(-1, 16 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)
net = Net()
```

convolution 과 pooling, fully connected layer의 입력과 출력의 차원을 잘 이해하고 계신다면

왜 저렇게 숫자가 매칭되는지 잘 아실 겁니다.

이해를 도모하기 위해 주석으로 힌트를 달아놓았습니다.









## 3. Loss 함수 및 optimizer 정의

```python
import torch.optim as optim
LEARNING_RATE = 0.001
MOMENTUM = 0.9

criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=LEARNING_RATE, momentum=MOMENTUM)
```

CrossEntropy를 사용해봅시다.

classification에서는 CE를 주로 사용합니다.







## 4. Train the network

```python
N_EPOCH = 2
for epoch in range(N_EPOCH):
    loss_per_2000 = 0.
    for i, data in enumerate(trainloader):
        batch_img, batch_label = data
        
        optimizer.zero_grad()
        
        batch_pred = net(batch_img)
        loss = criterion(batch_pred, batch_label)
        loss.backward()
        
        optimizer.step()
        
        loss_per_step += loss.item()
        if i % 2000 == 1999:
            print(f'[{epoch + 1, i + 1}], loss: {loss_per_step / 2000}')
            loss_per_2000 = 0.
print('Finished Training')
```

두 번의 에폭에서만 학습을 해봅시다.



```python
SAVE_PATH = 'D:/dataset/weights/cifar_net.pth'
torch.save(net.state_dict(), SAVE_PATH)
```

학습 시킨 파라미터를 저장합시다.

244KB 용량을 가지네요.



conv1 = (32 x 32 x 3) x 6 = 18,432

conv2 = (14 x 14 x 6) x 16 = 18,816

fc1 = (5 x 5 x 16) x 120 = 48,000

fc2 = 120 x 84 = 10,080

fc3 = 84 x 10 = 840

모두 더하면, 18,432 + 18,816 + 48,000 + 10,080 + 840 = 96,168

bias까지 포함하면, 100,000을 넘겠군요.

python에서  float은 8byte인데 대략적으로 계산하면 800KB나 차지하는 파라미터 용량이지만,

.pth(pytorch) 파일로 저장시 용량을 효율적이로 잘 줄이는 듯 합니다.



## 5. Test

```python
correct = 0
total = 0
with torch.no_grad():
    for data in testloader:
        imgs, labels = data
        outputs = net(imgs)
        _, predicted = torch.max(outputs.data, 1)
        
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
print(f"Acc(10,000 test images): {100 * correct / total} %")
>>
Acc(10,000 test images): 54.2 %
        
```

정확도가 별로 좋지못하네요.

우리가 만든 네트워크가 이 데이터를 분류하기에 적절하지 않은 것 같습니다.



클래스별로도 확인해봅시다.

```python
net.to(device)
class_correct = [0. for i in range(10)]
class_total = list(0. for i in range(10))
with torch.no_grad():
    for data in testloader:
        imgs, labels = data[0].to(device), data[1].to(device)
        outputs = net(imgs)
        _, predicted = torch.max(outputs, 1)
        c = (predicted == labels).squeeze()
        for i in range(BATCH_SIZE):
            label = labels[i]
            class_correct[label] += c[i].item()
            class_total[label] += 1
        
for i in range(10):
    print(f"{classes[i]}:, {class_correct[i] / class_total[i] * 100}")
    
>>
plane:, 49.1
car:, 65.5
bird:, 45.0
cat:, 46.1
deer:, 37.6
dog:, 36.4
frog:, 73.2
horse:, 72.5
ship:, 45.6
truck:, 71.0
```





## 6. Training on GPU

```python
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(device)
>>
cuda:0
```

cuda:0이 출력되면 GPU를 사용하고 있다는 뜻입니다.





```python
net.to(device) # 변경
class_correct = [0. for i in range(10)]
class_total = list(0. for i in range(10))
with torch.no_grad():
    for data in testloader:
        imgs, labels = data[0].to(device), data[1].to(device) # 변경
        outputs = net(imgs)
        _, predicted = torch.max(outputs, 1)
        c = (predicted == labels).squeeze()
        for i in range(BATCH_SIZE):
            label = labels[i]
            class_correct[label] += c[i].item()
            class_total[label] += 1
        
for i in range(10):
    print(f"{classes[i]}:, {class_correct[i] / class_total[i] * 100}")
```

바뀐 부분이 보이시나요?

.to(device)를 통해 모델과 인풋을 GPU 메모리를 이용하겠다고 설정을 하면 됩니다.





## Multiple GPU



pytorch는 한 개의 GPU만 사용하도록 기본 설정 되어 있습니다.

```python
model = nn.DataParallel(model)
```

를 적절히 활용하면 될 것 같군요.

multiple GPU는 필요할 때 잘찾아보면 될 것 같습니다.



 https://pytorch.org/tutorials/beginner/blitz/data_parallel_tutorial.html 



