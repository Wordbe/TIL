딥러닝 수업을 들으며, 과제를 해결하기 위해

노트북에 tensorflow-gpu 환경설정을 해보았습니다.

GTX 1050 달린 노트북인데, 애매한 사양이라 쓰기도 번거롭지 싶지만

내 노트북 무게를 늘린 장본인이라 생각하면.. 뽕을 뽑아야 겠다고 생각하여

설치를 하게 되었습니다.



제가 설치한 환경은 다음과 같습니다.

| 운영체제                             | **Windows 10**           |
| ------------------------------------ | ------------------------ |
| **그래픽 드라이버**                  | **Nvidia driver 431.86** |
| **C환경에서 GPU 지원프로그램**       | **CUDA 9.0**             |
| **딥러닝 지원 라이브러리(CUDA전용)** | **cuDNN 7.0.5**          |
| **언어**                             | **python 3.6.5**         |
| **딥러닝 라이브러리**                | **tensorflow-gpu 1.12**  |
| **가상환경**                         | **virtualenv**           |

~~**아나콘다 깔기 싫어서 사용안했습니다.**~~



물론 여기에 pytorch 혹은 keras 설치도 가능합니다.



우선 GPU 사양에 맞는 드라이버와, CUDA, cuDNN을 선택하셔야 하는데, 일단 글을 따라와 보시면 될 것 같습니다.



## Step 1. GPU Nvidia driver 설치

https://www.nvidia.co.kr/Download/index.aspx?lang=kr



위 링크에 들어가면, 각자의 GPU 사양에 맞는 드라이버를 설치받을 수 있습니다.

저는 GTX 1050 기준으로 

> Nvidia driver 431.86

다운 받았고, 문제 없었습니다.



GTX 1080 Ti을 이용하시는 분은, 

![img](https://i.ibb.co/KDMC0NM/image.png)

이렇게 설정하시고 다운받아주시면 되겠습니다.



드라이버가 잘 깔렸는지 확인해볼가요?

cmd 들어가셔서

> nvidia-smi

![nvidia](https://i.ibb.co/HH97RM9/image.png)

정상적으로 깔렸다면 나오는 화면입니다. 

GTX 1050 4GB 기준.



## Step 2. CUDA 설치

많은 버전이 있지만,

무난한 버전이 적당하죠. 9.0

https://developer.nvidia.com/cuda-90-download-archive?target_os=Windows&target_arch=x86_64&target_version=10&target_type=exenetwork



위 링크를 통해 다운받으 실 수 있습니다.



최신버전을 사용하고 싶으신 분들은, tensorflow 홈페이지에 가셔서 해당 GPU와 tensorflow 버전에 맞는 CUDA, cuDNN을 찾아보실 수 있습니다.



https://www.tensorflow.org/install/gpu



## Step 3. cuDNN 설치



https://developer.nvidia.com/rdp/cudnn-archive

위 링크에 가시면, 다양한 버전의 cuDNN을 다운로드 할 수 있습니다. 

(로그인 필요해서 구글계정 연동해서 빠르게 다운받았습니다.)



[Download cuDNN v7.0.5 (Dec 5, 2017), for CUDA 9.0](https://developer.nvidia.com/rdp/cudnn-archive#a-collapse705-9)

특별히 제가 사용했던 7.0.5 버전은 위 링크에 있습니다.



이렇게 다운로드 작업을 마쳤으면, 간단한 환경변수설정과 복사질? 을 해야하는데요.

cuDNN 은 zip파일로 다운받아지는데, 압축 풀어주시고 보시면

![img1](https://i.ibb.co/PDtTZmT/image.png)

폴더 3개가 보입니다.

Step 2에서 CUDA가 윈도우에 정상적으로 깔렸다면,

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0

경로에 있을 텐데 여기도 같은 폴더 3개가 있습니다.

다운받은 cuDNN 파일을 CUDA 경로 안으로 복사해주시면 됩니다.



### 3.1) 복사

1) Copy cuda\bin\cudnn64_7.dll to C:\Program Files
\NVIDIA GPU Computing Toolkit\CUDA\v9.0\bin

2) Copy cuda\ include\cudnn.h to C:\Program Files
\NVIDIA GPU Computing Toolkit\CUDA\v9.0\include

3) Copy cuda\lib\x64\cudnn.lib to C:\Program Files
\NVIDIA GPU Computing Toolkit\CUDA\v9.0\lib\x64.



### 3.2) 환경변수 설정

그 다음 

> 제어판 > 시스템 및 보안 > 시스템 > 고급 시스템 설정

가시면 환경변수 바꾸는 창이 나옵니다.

PATH에 들어가셔서

환경변수 편집이 나오면

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0\bin

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0\include

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v9.0\lib

추가해주시기 바랍니다.









## Step 4. Python 설치 및 Virtualenv 가상환경 설정

### 4.1) python 설치

python 홈페이지 들어가셔서 다운받아주시구..

저는 python 3.6.5 버전 설치했습니다.

https://www.python.org/downloads/release/python-365/ 여기 들어가셔서

[Windows x86-64 executable installer](https://www.python.org/ftp/python/3.6.5/python-3.6.5-amd64.exe) 이거 클릭, 다운



다운받으면,



### 4.2) 가상환경 설치

cmd를 관리자 권한 실행하셔서 들어가십니다.

> pip install virtualenv

등을 통해 버전을 확인해보시구요.



> virtualenv myenv

> call myenv\Scripts\activate

하면 가상환경에 진입할 수 있습니다.

> (myenv) user@#$$!



그럼 마지막으로... 텐서플로우 gpu를 깔아봅시다.



## Step 5. Tensorflow 설치 및 GPU 동작 확인

아까 들어갔던 가상환경 속에서 다음을 설치해 봅시다.

> pip install tensorflow==1.12

텐서플로 버전은 본인 환경에 맞추어 설치해주세요. 낮은 버전 사용하면 무난히 잘 돌아갑니다..



바로 python 실행시켜서 코드 돌려볼 수도 있지만



> pip install juptyer

쥬피터도 깔아봅시다.

![gpu](https://i.ibb.co/C0VkWQF/image.png)

```python
from tensorflow.python.client import device_lib
print(device_lib.list_local_devices())
```

위와 같은 명령어로 GPU가 할당되어있는지 파악할 수 있습니다.





mnist tensorflow 아무코드나 다운받고 돌려볼가요 이제~

![img3](https://i.ibb.co/y0nz8L5/image.png)



고생하셨습니다.

