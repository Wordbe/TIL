# Object Detection finetuing 튜토리얼



본 글은 파이토치 공식 홈페이지 튜토리얼을 토대로, 부가 개념설명과 코드설명을 한 글입니다.





## Object Detection

컴퓨터비전 태스크는 Classification, Semantic Segmentation, Object Detection, Instance Segmentation 등이 있다.

그 중 Object Detection은 이미지 안에 있는 물체를 구분하여

* 1) 물체가 무엇인지 클래스를 분류하고,
* 2) 이미지에서 물체 좌표를 얻는다. 보통 좌상, 우하$(x_1, y_1), (x_2, y_2)$ 좌표를 얻는다.

즉, Object Detection은 Classifcation + Localization 이다. 또한 위 두 과업을 하기위해 Multitask Loss가 필요하다.

![](https://i.ibb.co/KxQ8jxM/image.png)









### 방법론

#### 1 Two Stage Model

>  R-CNN(2015, _Girshick_) → Fast R-CNN → Faster R-CNN (Object Detection)
>
> → Mask R-CNN (Instatnce Segmentation), Pyramid Network 등

Stage 1:  RoI(Region of Interest), 즉 물체가 있을지도 모르는 위치의 후보 영역을 제안하는 부분, `selective search` 또는 `RPN(Region Proposal Network)` 등을 이용한다.

Stage 2: 주어진 RoI들에 대해 클래스를 분류하고, bbox를 회귀하는 단계이다.

* R-CNN 계열로 불린다. Region proposal을 이용해 feature를 추출한다.
* Region proposal은 Selective Search 라는 알고리즘으로 찾아낸다.
* 속도가 느린대신, 성능이 좋다.







#### 2 One Stage Model

> SSD, YOLO( + v2, v3, v4), RetinaNet 등

Region proposal 단계를 건너뛰고, 입력 이미지 전체를 바로 네트워크에 넣어 한번에 클래스와 bbox를 찾아낸다.

* 이미지를 리사이즈 한 후, 모델에 바로 넣어서 클래스 분류, bbox 회귀를 진행한다.
* 속도가 빨라서 실시간 사용이 가능하다.
* 성능이 Two stage model에 비해 떨어지지만, 점점 연구진행이 활발히 되어 최근에는 성능을 능가했다.





---

## Instance Segmentation

여기서는 Mask R-CNN 모델을 사용한다. (pretrained)

Mask R-CNN은 Instance Segmentation이 가능한, 즉 Object detection을 포함하고 객체별 segmentation도 가능한 모델이다.



* **Segmentation**

![](https://i.ibb.co/929fP6c/image.png)

* **Mask R-CNN**

![](https://i.ibb.co/72qmdLH/image.png)





데이터는 [*Penn-Fudan Database for Pedestrian Detection and Segmentation*](https://www.cis.upenn.edu/~jshi/ped_html/)를 사용한다.

170개의 이미지에 345개의 인스턴스(보행자)가 포함되어있다. 



---

## Tutorial



### 1 데이터 환경 세팅

* COCO 데이터셋 형식의 데이터 사용을 위해 python API인 `pycocotoos` 설치

```shell
%%shell

pip install cython
# Install pycocotools, the version by default in Colab
# has a bug fixed in https://github.com/cocodataset/cocoapi/pull/354
pip install -U 'git+https://github.com/cocodataset/cocoapi.git#subdirectory=PythonAPI'
```

* Penn-Fudan 보행자 데이터 셋 다운로드

```shell
%%shell

# download the Penn-Fudan dataset
wget https://www.cis.upenn.edu/~jshi/ped_html/PennFudanPed.zip .
# extract it in the current folder
unzip PennFudanPed.zip
```

데이터는 아래와 같이 구성되어 있다.

```
PennFudanPed/
  PedMasks/
    FudanPed00001_mask.png
    FudanPed00002_mask.png
    FudanPed00003_mask.png
    FudanPed00004_mask.png
    ...
  PNGImages/
    FudanPed00001.png
    FudanPed00002.png
    FudanPed00003.png
    FudanPed00004.png
```



이미지에 사람(Object)들이 있고, 그에 해당하는 마스크(Label)가 있다.

```python
from PIL import Image
Image.open('PennFudanPed/PNGImages/FudanPed00001.png')
mask = Image.open('PennFudanPed/PedMasks/FudanPed00001_mask.png')
# each mask instance has a different color, from zero to N, where
# N is the number of instances. In order to make visualization easier,
# let's adda color palette to the mask.
mask.putpalette([
    0, 0, 0, # black background
    255, 0, 0, # index 1 is red
    255, 255, 0, # index 2 is yellow
    255, 153, 0, # index 3 is orange
])
```



### 2 데이터셋

`Pytorch`에서 딥러닝을 할 때 큰 흐름이 있다. 

Dataset 객체(클래스) 생성 → Dataloader 로 데이터셋 불러오기 → trainset, validation set 모델에 넣고 모델 학습 → 모델로 testset inference



1) `Dataset`

```python
import os
import numpy as np
import torch
import torch.utils.data
from PIL import Image


class PennFudanDataset(torch.utils.data.Dataset):
    def __init__(self, root, transforms=None):
        self.root = root
        self.transforms = transforms
        # load all image files, sorting them to
        # ensure that they are aligned
        self.imgs = list(sorted(os.listdir(os.path.join(root, "PNGImages"))))
        self.masks = list(sorted(os.listdir(os.path.join(root, "PedMasks"))))

    def __getitem__(self, idx):
        # load images ad masks
        img_path = os.path.join(self.root, "PNGImages", self.imgs[idx])
        mask_path = os.path.join(self.root, "PedMasks", self.masks[idx])
        img = Image.open(img_path).convert("RGB")
        # note that we haven't converted the mask to RGB,
        # because each color corresponds to a different instance
        # with 0 being background
        mask = Image.open(mask_path)

        mask = np.array(mask)
        # instances are encoded as different colors
        obj_ids = np.unique(mask)
        # first id is the background, so remove it
        obj_ids = obj_ids[1:]

        # split the color-encoded mask into a set
        # of binary masks
        masks = mask == obj_ids[:, None, None]

        # get bounding box coordinates for each mask
        num_objs = len(obj_ids)
        boxes = []
        for i in range(num_objs):
            pos = np.where(masks[i])
            xmin = np.min(pos[1])
            xmax = np.max(pos[1])
            ymin = np.min(pos[0])
            ymax = np.max(pos[0])
            boxes.append([xmin, ymin, xmax, ymax])

        boxes = torch.as_tensor(boxes, dtype=torch.float32)
        # there is only one class
        labels = torch.ones((num_objs,), dtype=torch.int64)
        masks = torch.as_tensor(masks, dtype=torch.uint8)

        image_id = torch.tensor([idx])
        area = (boxes[:, 3] - boxes[:, 1]) * (boxes[:, 2] - boxes[:, 0])
        # suppose all instances are not crowd
        iscrowd = torch.zeros((num_objs,), dtype=torch.int64)

        target = {}
        target["boxes"] = boxes
        target["labels"] = labels
        target["masks"] = masks
        target["image_id"] = image_id
        target["area"] = area
        target["iscrowd"] = iscrowd

        if self.transforms is not None:
            img, target = self.transforms(img, target)

        return img, target

    def __len__(self):
        return len(self.imgs)
```

데이터셋은 img, target 으로 구성되어 있는데, 

Instance Segmentation을 위해서는 target에서 “boxes”, “labes”(클래스), “masks”가 꼭 필요하다.

* “image_id”는 마스크가 속한 이미지 id이다.
* “area”는 box의 면적이다. 나중에 예측 box와 실제 box의 IoU를 쉽게 구하기 위해 미리 데이터로 저장해 놓았다. 
* “iscrowd”는 물체가 너무 작은데 많아서 하나의 군집으로 박스를 처리하여 레이블링 했는지에 관한 여부이다. object detection을 하다보면, labeling 시 위와 같은 기준이 필요한 것이 몇가지 있다. 물체가 숨어있거나, 가려져있거나 등의 경우이다.



### 3 모델

Mask R-CNN은 Faster R-CNN의 RoIAlign 이후 피쳐에 segmentation 마스크를 예측하는 CNN 가지(head)가 있다.



`torchvision`에서 모델은 쉽게 불러올 수 있다.

```python
import torchvision
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.models.detection.mask_rcnn import MaskRCNNPredictor

      
def get_instance_segmentation_model(num_classes):
    # load an instance segmentation model pre-trained on COCO
    model = torchvision.models.detection.maskrcnn_resnet50_fpn(pretrained=True)

    # get the number of input features for the classifier
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    # replace the pre-trained head with a new one
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    # now get the number of input features for the mask classifier
    in_features_mask = model.roi_heads.mask_predictor.conv5_mask.in_channels
    hidden_layer = 256
    # and replace the mask predictor with a new one
    model.roi_heads.mask_predictor = MaskRCNNPredictor(in_features_mask,
                                                       hidden_layer,
                                                       num_classes)

    return model
```

`maskrcnn_resnet50_fpn`은 resnet50을 backbone으로 fpn을 head로 쓴다는 말이다.

`pretrain=True`옵션을 통해 COCO 데이터셋으로 학습된 backbone을 불러온다.

classifier는 Fast R-CNN 그대로 사용되었으므로, COCO set 클래스수가 아닌, 커스텀셋 `num_classses`로 바꾸어준다.

마지막으로, Mask R-CNN의 predictor의 마지막 층에 은닉층 256개를 넣어 모델을 약간 수정해본다.



### 4 학습

이제, 다 모아서 모델을 학습시키려고 하는데, pytorch API를 다운받으면 편한기능을 쉽게 사용할 수 있다.

```shell
%%shell

# Download TorchVision repo to use some files from
# references/detection
git clone https://github.com/pytorch/vision.git
cd vision
git checkout v0.3.0

cp references/detection/utils.py ../
cp references/detection/transforms.py ../
cp references/detection/coco_eval.py ../
cp references/detection/engine.py ../
cp references/detection/coco_utils.py ../
```



```python
from engine import train_one_epoch, evaluate
import utils
import transforms as T


def get_transform(train):
    transforms = []
    # converts the image, a PIL image, into a PyTorch Tensor
    transforms.append(T.ToTensor())
    if train:
        # during training, randomly flip the training images
        # and ground-truth for data augmentation
        transforms.append(T.RandomHorizontalFlip(0.5))
    return T.Compose(transforms)
```

이미지 전처리는 가볍게 랜덤 좌우 뒤집기를 추가해본다. (0.5 확률로)



데이터 셋을 불러온다. 데이터 로더로 데이터셋 객체를 반환할 이터레이터(또는 제너레이터)를 만든다.

```python
# use our dataset and defined transformations
dataset = PennFudanDataset('PennFudanPed', get_transform(train=True))
dataset_test = PennFudanDataset('PennFudanPed', get_transform(train=False))

# split the dataset in train and test set
torch.manual_seed(1)
indices = torch.randperm(len(dataset)).tolist()
dataset = torch.utils.data.Subset(dataset, indices[:-50])
dataset_test = torch.utils.data.Subset(dataset_test, indices[-50:])

# define training and validation data loaders
data_loader = torch.utils.data.DataLoader(
    dataset, batch_size=2, shuffle=True, num_workers=4,
    collate_fn=utils.collate_fn)

data_loader_test = torch.utils.data.DataLoader(
    dataset_test, batch_size=1, shuffle=False, num_workers=4,
    collate_fn=utils.collate_fn)
```



GPU 가있으면 디바이스를 ‘cuda’로 바꿔 사용한다.

클래스 수 (배경과 사람)을 조정하고, 모델을 불러온다.

모델 파라미터를 불러오고, SGD 옵티마이저에 적용한다.

학습률(learning rate) 스케쥴러로 학습률이 3 에폭마다 10배 줄어들 수 있게 조정한다.

```python
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

# our dataset has two classes only - background and person
num_classes = 2

# get the model using our helper function
model = get_instance_segmentation_model(num_classes)
# move model to the right device
model.to(device)

# construct an optimizer
params = [p for p in model.parameters() if p.requires_grad]
optimizer = torch.optim.SGD(params, lr=0.005,
                            momentum=0.9, weight_decay=0.0005)

# and a learning rate scheduler which decreases the learning rate by
# 10x every 3 epochs
lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer,
                                               step_size=3,
                                               gamma=0.1)
```



이제 학습시작.

```python
# let's train it for 10 epochs
num_epochs = 10

for epoch in range(num_epochs):
    # train for one epoch, printing every 10 iterations
    train_one_epoch(model, optimizer, data_loader, device, epoch, print_freq=10)
    # update the learning rate
    lr_scheduler.step()
    # evaluate on the test dataset
    evaluate(model, data_loader_test, device=device)
```



### 5 테스트

```python
# pick one image from the test set
img, _ = dataset_test[0]
# put the model in evaluation mode
model.eval()
with torch.no_grad():
    prediction = model([img.to(device)])
    
Image.fromarray(img.mul(255).permute(1, 2, 0).byte().numpy())
Image.fromarray(prediction[0]['masks'][0, 0].mul(255).byte().cpu().numpy())
```

테스트 샘플 이미지에 대한 인퍼런스 값의 이미지, 마스크를 확인한다.



더 복잡한 예제를 원한다면, multi-machine, multi-gpu 학습을 포함하는 [`references/detection/train.py`](https://github.com/pytorch/vision/tree/v0.3.0/references/detection)API를 참조하면 좋다.

