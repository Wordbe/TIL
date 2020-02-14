## 1. TensorBoard setup

```python
import matplotlib.pyplot as plt
import numpy as np
import torch
import torchvision
import torchvision.transforms as transforms
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

trainset = torchvision.datasets.FashionMNIST('d:/dataset',
                                            download=True,
                                            train=True,
                                            transform=transform)
testset = torchvision.datasets.FashionMNIST('d:/dataset/',
                                           download=True,
                                           train=False,
                                           transform=transform)

BATCH_SIZE = 4
trainloader = torch.utils.data.DataLoader(trainset,
                                         batch_size=BATCH_SIZE,
                                         shuffle=True,
                                         num_workers=0)
testloader = torch.utils.data.DataLoader(testset,
                                        batch_size=BATCH_SIZE,
                                        shuffle=False,
                                        num_workers=0)

classes = ('T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
        'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle Boot')

def imshow(img, one_channel=False):
    if one_channel:
        img = img.mean(dim=0)
    img = img / 2 + 0.5
    npimg = img.numpy()
    if one_channel:
        plt.imshow(npimg, cmap='Greys')
    else:
        plt.imshow(np.transpose(npimg, (1, 2, 0)))
        
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        # input 1x28x28
        self.conv1 = nn.Conv2d(1, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 4 * 4, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)
    
    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x))) # 6x24x24 -> 6x12x12
        x = self.pool(F.relu(self.conv2(x))) # 16x8x8 -> 16x4x4
        x = x.view(-1, 16 * 4 * 4)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)
net = Net()

LEARNING_RATE = 0.001
MOMENTUM = 0.9
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=LEARNING_RATE, momentum=MOMENTUM)
```



```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter('runs/fashion_mnist_experiment_1')
```

여기서 텐서보드 버전 1.14 이상을 필요로 하며, 이에 해당하는 파이토치는 1.1 이상 버전이 호환이 된다. 





## 2. Writing to TensorBoard

**이미지추가(add_image)**

```python
dataiter = iter(trainloader)
imgs, labels = dataiter.next()

img_grid = torchvision.utils.make_grid(imgs)
imshow(img_grid, one_channel=True)

writer.add_image('four_fashion_mnist_images', img_grid)
```



## 3. TensorBoard를 이용하여 모델 조사

모델이 어떻게 생겼는지 보여준다. 신기.

**add_graph()**

```python
writer.add_graph(net, imgs)
writer.close()
```







## 4. Projector 추가하기

데이터 분포를 알 수 있다.

비지도 학습에 있는 PCA, t-SNE 등의 분석이 가능하고,

시각적으로 화려하고 보기좋게 만들어준다.

**add_embedding**

```python
def select_n_random(data, labels, n=100):
    assert len(data) == len(labels)
    
    perm = torch.randperm(len(data))
    return data[perm][:n], labels[perm][:n]

imgs, labels = select_n_random(trainset.data, trainset.targets)

class_labels = [classes[lab] for lab in labels]

features = imgs.view(-1, 28 * 28)
writer.add_embedding(features,
                    metadata=class_labels,
                    label_img=imgs.unsqueeze(1))
writer.close()
```







## 5. Model Training 추적(tracking)하기

이것이 tensorboard를 사용하는 가장 핵심 역할을 할 것 같은데,

모델의 학습이 잘 이루어지고 있는지 양상을 보여준다.

**add_scalar()** << loss 같은 스칼라 값을 기록

**add_figure()** << figure도 넣을 수 있다. 여기서는 검증과정에서 이미지와 타겟을 비교하는 plot을 넣는다.

```python
def images_to_probs(net, images):
    '''
    Generates predictions and corresponding probabilities from a trained
    network and a list of images
    '''
    output = net(images)
    # convert output probabilities to predicted class
    _, preds_tensor = torch.max(output, 1)
    preds = np.squeeze(preds_tensor.numpy())
    return preds, [F.softmax(el, dim=0)[i].item() for i, el in zip(preds, output)]


def plot_classes_preds(net, images, labels):
    '''
    Generates matplotlib Figure using a trained network, along with images
    and labels from a batch, that shows the network's top prediction along
    with its probability, alongside the actual label, coloring this
    information based on whether the prediction was correct or not.
    Uses the "images_to_probs" function.
    '''
    preds, probs = images_to_probs(net, images)
    # plot the images in the batch, along with predicted and true labels
    fig = plt.figure(figsize=(12, 48))
    for idx in np.arange(4):
        ax = fig.add_subplot(1, 4, idx+1, xticks=[], yticks=[])
        imshow(images[idx], one_channel=True)
        ax.set_title("{0}, {1:.1f}%\n(label: {2})".format(
            classes[preds[idx]],
            probs[idx] * 100.0,
            classes[labels[idx]]),
                    color=("green" if preds[idx]==labels[idx].item() else "red"))
    return fig

running_loss = 0.
for epoch in range(1):  # loop over the dataset multiple times

    for i, data in enumerate(trainloader, 0):

        # get the inputs; data is a list of [inputs, labels]
        inputs, labels = data

        # zero the parameter gradients
        optimizer.zero_grad()

        # forward + backward + optimize
        outputs = net(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        if i % 1000 == 999:    # every 1000 mini-batches...

            # ...log the running loss
            writer.add_scalar('training loss',
                            running_loss / 1000,
                            epoch * len(trainloader) + i)

            # ...log a Matplotlib Figure showing the model's predictions on a
            # random mini-batch
            writer.add_figure('predictions vs. actuals',
                            plot_classes_preds(net, inputs, labels),
                            global_step=epoch * len(trainloader) + i)
            running_loss = 0.0
print('Finished Training')
```





## 6. 학습된 모델을 평가(assess)하기

여기서는 클래스 별로 precision-recall graph를 그려주었다.

**add_pr_curve()**  : classification(분류)에서 PR graph를 그리고 분석하는데 아주 유용하다.

```python
# 1. gets the probability predictions in a test_size x num_classes Tensor
# 2. gets the preds in a test_size Tensor
# takes ~10 seconds to run
class_probs = []
class_preds = []
with torch.no_grad():
    for data in testloader:
        images, labels = data
        output = net(images)
        class_probs_batch = [F.softmax(el, dim=0) for el in output]
        _, class_preds_batch = torch.max(output, 1)

        class_probs.append(class_probs_batch)
        class_preds.append(class_preds_batch)

test_probs = torch.cat([torch.stack(batch) for batch in class_probs])
test_preds = torch.cat(class_preds)

# helper function
def add_pr_curve_tensorboard(class_index, test_probs, test_preds, global_step=0):
    '''
    Takes in a "class_index" from 0 to 9 and plots the corresponding
    precision-recall curve
    '''
    tensorboard_preds = test_preds == class_index
    tensorboard_probs = test_probs[:, class_index]

    writer.add_pr_curve(classes[class_index],
                        tensorboard_preds,
                        tensorboard_probs,
                        global_step=global_step)
    writer.close()

# plot all the pr curves
for i in range(len(classes)):
    add_pr_curve_tensorboard(i, test_probs, test_preds)
    

```



