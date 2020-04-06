# 12 Word Embedding 3 - Word2Vec 한국어 실습



## 2  한국어 Word2Vec 만들기(네이버 영화 리뷰)

```python
import urllib.request
from konlpy.tag import Okt
from gensim.models.word2vec import Word2Vec
import pandas as pd
import matplotlib.pyplot as plt
urllib.request.urlretrieve("https://raw.githubusercontent.com/e9t/nsmc/master/ratings.txt", filename="ratings.txt")
train_data = pd.read_table('ratings.txt')
train_data[:5] # 상위 5개 출력
```

![img](https://wikidocs.net/images/page/50739/review1.PNG)

```python
print(len(train_data)) # 리뷰 개수 출력
200000
# NULL 값 존재 유무
print(train_data.isnull().values.any())
True
train_data = train_data.dropna(how = 'any') # Null 값이 존재하는 행 제거
print(train_data.isnull().values.any()) # Null 값이 존재하는지 확인
False
print(len(train_data)) # 리뷰 개수 출력
199992
# 정규 표현식을 통한 한글 외 문자 제거
train_data['document'] = train_data['document'].str.replace("[^ㄱ-ㅎㅏ-ㅣ가-힣 ]","")
train_data[:5] # 상위 5개 출력
```

![img](https://wikidocs.net/images/page/50739/review2.PNG)

```python
# 불용어 정의
stopwords = ['의','가','이','은','들','는','좀','잘','걍','과','도','를','으로','자','에','와','한','하다']
# 형태소 분석기 OKT를 사용한 토큰화 작업 (다소 시간 소요)
okt = Okt()
tokenized_data = []
for sentence in train_data['document']:
    temp_X = okt.morphs(sentence, stem=True) # 토큰화
    temp_X = [word for word in temp_X if not word in stopwords] # 불용어 제거
    tokenized_data.append(temp_X)
# 리뷰 길이 분포 확인
print('리뷰의 최대 길이 :',max(len(l) for l in tokenized_data))
print('리뷰의 평균 길이 :',sum(map(len, tokenized_data))/len(tokenized_data))
plt.hist([len(s) for s in tokenized_data], bins=50)
plt.xlabel('length of samples')
plt.ylabel('number of samples')
plt.show()
리뷰의 최대 길이 : 72
리뷰의 평균 길이 : 10.716703668146726
```

![img](https://wikidocs.net/images/page/50739/review_distribution.PNG)

```python
from gensim.models import Word2Vec
model = Word2Vec(sentences = tokenized_data, size = 100, window = 5, min_count = 5, workers = 4, sg = 0)
# 완성된 임베딩 매트릭스의 크기 확인
model.wv.vectors.shape
(16477, 100)
print(model.wv.most_similar("최민식"))
[('한석규', 0.8789200782775879), ('안성기', 0.8757420778274536), ('김수현', 0.855679452419281), ('이민호', 0.854516863822937), ('김명민', 0.8525030612945557), ('최민수', 0.8492398262023926), ('이성재', 0.8478372097015381), ('윤제문', 0.8470626473426819), ('김창완', 0.8456774950027466), ('이주승', 0.8442063927650452)]
print(model.wv.most_similar("히어로"))
[('슬래셔', 0.8747539520263672), ('느와르', 0.8666149377822876), ('무협', 0.8423701524734497), ('호러', 0.8372749090194702), ('물의', 0.8365858793258667), ('무비', 0.8260530233383179), ('물', 0.8197994232177734), ('홍콩', 0.8120777606964111), ('블록버스터', 0.8021541833877563), ('블랙', 0.7880141139030457)]
```

---

## 3 한국어 Word2Vec 만들기(위키피디아)

이번에는 위키피디아 한국어 덤프 파일을 다운받아서 한국어로 Word2Vec을 직접 진행해보겠습니다. 영어와 크게 다른 점은 없지만 한국어는 형태소 토큰화를 해야만 좋은 성능을 얻을 수 있습니다. 간단히 말해 형태소 분석기를 사용합니다.

<br>

### **1) 위키피디아 한국어 덤프 파일 다운로드**

https://dumps.wikimedia.org/kowiki/latest/

![img](https://wikidocs.net/images/page/22660/bz2.PNG)

위 링크에는 많은 위키피디아 덤프 파일들이 존재합니다. 그 중에서 사용할 데이터는 kowiki-latest-pages-articles.xml.bz2 파일입니다. 해당 파일은 xml 파일므로, Word2Vec을 원활하게 진행하기 위해 파일 형식을 변환해줄 필요가 있습니다.

<br>

### **2) 위키피디아 익스트랙터 다운로드**

해당 파일을 모두 다운로드 받았다면 위키피디아 덤프 파일을 텍스트 형식으로 변환시켜주는 오픈소스인 '위키피디아 익스트랙터'를 사용할 것입니다. '위키피디아 익스트랙터'를 다운로드 받기 위해서는 윈도우의 명령 프롬프트나 MAC과 리눅스의 터미널에서 아래의 git clone 명령어를 통해 다운로드 받을 수 있습니다.

```shell
$ git clone "https://github.com/attardi/wikiextractor.git"  
```

<br>

### **3) 위키피디아 한국어 덤프 파일 변환**

위키피디아 익스트랙터와 위키피디아 한국어 덤프 파일을 동일한 디렉토리 경로에 두고, 아래 명령어를 실행하면 위키피디아 덤프 파일이 텍스트 파일로 변환됩니다. 컴퓨터마다 다르지만 보통 10분 내외의 시간이 걸립니다.

```shell
python WikiExtractor.py kowiki-latest-pages-articles.xml.bz2  
```

텍스트 파일로 변환된 위키피디아 한국어 덤프는 총 6개의 디렉토리(2018년 10월 기준)로 구성되어져 있습니다. AA ~ AF의 디렉토리로 각 디렉토리 내에는 wiki_00 ~ wiki_90이라는 파일들이 들어있습니다. 각 파일들을 열어보면 이와 같은 구성이 반복되고 있습니다.

```xml
<doc id="문서 번호" url="실제 위키피디아 문서 주소" title="문서 제목">
내용
</doc>
```

예를 들어서 AA 디렉토리의 wiki_00 파일을 읽어보면, 지미 카터에 대한 내용이 나옵니다.

```xml
<doc id="5" url="https://ko.wikipedia.org/wiki?curid=5" title="지미 카터">
지미 카터
제임스 얼 "지미" 카터 주니어(, 1924년 10월 1일 ~ )는 민주당 출신 미국 39번째 대통령(1977년 ~ 1981년)이다.
지미 카터는 조지아 주 섬터 카운티 플레인스 마을에서 태어났다. 조지아 공과대학교를 졸업하였다. 그 후 해군에 들어가 전함·원자력·잠수함의 승무원으로 일하였다. 1953년 미국 해군 대
위로 예편하였고 이후 땅콩·면화 등을 가꿔 많은 돈을 벌었다.
... 이하 중략...
</doc>
```

이제 이 6개 AA ~ AF 디렉토리 안의 wiki00 ~ wiki90 파일들을 하나의 텍스트 파일로 통합하겠습니다. (만약, 더 간단히 하고 싶다면 모든 디렉토리 파일을 통합하지 않고, 하나의 디렉토리 내의 파일들에 대해서만 통합 작업을 진행하고 모델의 입력으로 사용할수도있습니다. 하지만 모델의 성능은 전체 파일에 대해서 진행한 경우보다 좋지 않을 수 있습니다.)

작업은 6개의 디렉토리 내 파일들에 대해서 각 하나의 파일로 통합 후, 6개의 파일을 다시 하나로 통합하는 순서로 진행합니다.

### 4) 훈련 데이터 만들기

우선 AA 디렉토리 안의 모든 파일인 wiki00 ~ wiki90에 대해서 wikiAA.txt로 통합해보겠습니다. 프롬프트에서 아래의 커맨드를 수행합니다. (윈도우 환경 기준)

```shell
copy AA디렉토리의 경로\wiki* wikiAA.txt
```

해당 커맨드는 AA디렉토리 안의 wiki로 시작되는 모든 파일을 wikiAA.txt 파일에 전부 복사하라는 의미를 담고있습니다. 결과적으로 wiki00 ~ wiki90파일의 모든 내용은 wikiAA.txt 파일이라는 하나의 파일에 내용이 들어가게 됩니다.

각 디렉토리에 대해서도 동일하게 진행합니다.

```shell
copy AB디렉토리의 경로\wiki* wikiAB.txt
copy AC디렉토리의 경로\wiki* wikiAC.txt
copy AD디렉토리의 경로\wiki* wikiAD.txt
copy AE디렉토리의 경로\wiki* wikiAE.txt
copy AF디렉토리의 경로\wiki* wikiAF.txt
```

이렇게 되면 현재 경로에는 각 디렉토리의 파일들을 하나로 합친 wikiAA.txt 부터 wikiAF.txt라는 6개의 파일이 생깁니다. 그럼 이제 이 파일들에 대해서도 하나의 파일로 합치는 작업을 진행해보겠습니다.

```shell
copy 현재 디렉토리의 경로\wikiA* wiki_data.txt
```

이제 모든 텍스트 파일을 하나로 만든 훈련 데이터가 완성되었습니다.

<br>

### **5) 훈련 데이터 전처리 하기**

```python
f = open('wiki_data.txt 파일의 경로', encoding="utf8")
# 예를 들어 윈도우 바탕화면에서 작업하는 경우
# f = open(r'C:\Users\USER\Desktop\wiki_data.txt', encoding="utf8")
```

우선 파일을 불러왔습니다. 파일이 정상적으로 저장되었는지 5개의 줄만 출력해보겠습니다.

```python
i=0
while True:
    line = f.readline()
    if line != '\n':
        i=i+1
        print("%d번째 줄 :"%i + line)
    if i==5:
        break 
f.close()
1번째 줄 :<doc id="5" url="https://ko.wikipedia.org/wiki?curid=5" title="지미 카터">
2번째 줄 :지미 카터
3번째 줄 :제임스 얼 "지미" 카터 주니어(, 1924년 10월 1일 ~ )는 민주당 출신 미국 39번째 대통령 (1977년 ~ 1981년)이다.
4번째 줄 :지미 카터는 조지아주 섬터 카운티 플레인스 마을에서 태어났다. 조지아 공과대학교를 졸업하였다. 그 후 해군에 들어가 전함·원자력·잠수함의 승무원으로 일하였다. 1953년 미국 해군 대위로 예편하였고 이후 땅콩·면화 등을 가꿔 많은 돈을 벌었다. 그의 별명이 "땅콩 농부" (Peanut Farmer)로 알려졌다.
5번째 줄 :1962년 조지아 주 상원 의원 선거에서 낙선하나 그 선거가 부정선거 였음을 입증하게 되어 당선되고, 1966년 조지아 주 지사 선거에 낙선하지만 1970년 조지아 주 지사를 역임했다. 대통령이 되기 전 조지아주 상원의원을 두번 연임했으며, 1971년부터 1975년까지 조지아 지사로 근무했다. 조지아 주지사로 지내면서, 미국에 사는 흑인 등용법을 내세웠다.
```

정상적으로 출력되는 것을 볼 수 있습니다. 이제 본격적으로 Word2Vec을 위한 학습 데이터를 만들어보겠습니다.

```python
from konlpy.tag import Okt  
okt=Okt()
fread = open('wiki_data.txt 파일의 경로', encoding="utf8")
# 파일을 다시 처음부터 읽음.
n=0
result = []

while True:
    line = fread.readline() #한 줄씩 읽음.
    if not line: break # 모두 읽으면 while문 종료.
    n=n+1
    if n % 5000==0: # 5,000의 배수로 While문이 실행될 때마다 몇 번째 While문 실행인지 출력.
        print("%d번째 While문." % n)
    tokenlist = okt.pos(line, stem=True, norm=True) # 단어 토큰화
    temp=[]
    for word in tokenlist:
        if word[1] in ["Noun"]: # 명사일 때만
            temp.append((word[0])) # 해당 단어를 저장함

    if temp: # 만약 이번에 읽은 데이터에 명사가 존재할 경우에만
      result.append(temp) # 결과에 저장
fread.close()
```

여기서는 형태소 분석기로 KoNLPy의 Okt를 사용하여 명사만을 추출하여 훈련 데이터를 구성하겠습니다. 위 작업은 시간이 꽤 걸립니다. 훈련 데이터를 모두 만들었다면, 훈련 데이터의 길이를 확인해보겠습니다.

```python
print('총 샘플의 개수 : {}'.format(len(result))
총 샘플의 개수 : 2466209
```

약 240만여개의 줄(line)이 명사 토큰화가 되어 저장되어 있는 상태입니다. 이제 이를 Word2Vec으로 학습시킵니다.

### **6) Word2Vec 훈련시키기**

```python
from gensim.models import Word2Vec
model = Word2Vec(result, size=100, window=5, min_count=5, workers=4, sg=0)
```

학습을 다했다면 이제 임의의 입력 단어로부터 유사한 단어들을 구해봅시다.

```python
model_result1 = model.wv.most_similar("대한민국")
print(model_result1)
[('한국', 0.6331368088722229), ('우리나라', 0.5405941009521484), ('조선민주주의인민공화국', 0.5400398969650269), ('정보통신부', 0.49965575337409973), ('고용노동부', 0.49638330936431885), ('경남', 0.47878748178482056), ('국내', 0.4761977791786194), ('국무총리실', 0.46891751885414124), ('공공기관', 0.46730121970176697), ('관세청', 0.46708711981773376)]
model_result2 = model.wv.most_similar("어벤져스")
print(model_result2)
[('스파이더맨', 0.8560965657234192), ('아이언맨', 0.8376990556716919), ('데어데블', 0.7797115445137024), ('인크레더블', 0.7791407108306885), ('스타트렉', 0.7752881050109863), ('엑스맨', 0.7738450765609741), ('슈퍼맨', 0.7715340852737427), ('어벤저스', 0.7453964948654175), ('슈퍼히어로', 0.7452991008758545), ('다크나이트', 0.7413955926895142)]
model_result3 = model.wv.most_similar("반도체")
print(model_result3)
[('전자부품', 0.7620885372161865), ('실리콘', 0.7574189901351929), ('집적회로', 0.7497618198394775), ('웨이퍼', 0.7465146780014038), ('태양전지', 0.735146164894104), ('트랜지스터', 0.7293091416358948), ('팹리스', 0.7275552749633789), ('디램', 0.722482442855835), ('전자제품', 0.712360143661499), ('그래핀', 0.7025551795959473)]
```

<br>

---

### 3. 사전 훈련된 Word2Vec 임베딩(Pre-trained Word2Vec embedding) 소개

자연어 처리 작업을 할때, **케라스의 Embedding()**를 사용하여 갖고 있는 훈련 데이터로부터 처음부터 임베딩 벡터를 훈련시키기도 하지만, 위키피디아 등의 방대한 데이터로 사전에 훈련된 **워드 임베딩(pre-trained word embedding vector)**를 가지고 와서 해당 벡터들의 값을 원하는 작업에 사용 할 수도 있습니다.

예를 들어서 **감성 분류 작업을 하는데 훈련 데이터의 양이 부족한 상황**이라면, 다른 방대한 데이터를 **Word2Vec이나 GloVe 등으로 사전에 학습시켜놓은 임베딩 벡터들을 가지고 와서** 모델의 입력으로 사용하는 것이 때로는 더 좋은 성능을 얻을 수 있습니다.

여기서는 사전 훈련된 워드 임베딩을 가져와서 간단히 단어들의 유사도를 구해보는 실습을 해보겠습니다. 실제로 모델에 적용해보는 실습은 사전 훈련된 워드 임베딩 챕터에서 진행합니다.

<br>

### **1) 영어**

이번에는 구글이 제공하는 사전 훈련된(미리 학습되어져 있는) Word2Vec 모델을 사용하는 방법에 대해서 알아보도록 하겠습니다. **구글은 사전 훈련된 3백만 개의 Word2Vec 단어 벡터들을 제공합니다**. **각 임베딩 벡터의 차원은 300**입니다. gensim을 통해서 이 모델을 불러오는 건 매우 간단합니다. 이 모델을 다운로드하고 파일 경로를 기재하면 됩니다.

모델 다운로드 경로 : https://drive.google.com/file/d/0B7XkCwpI5KDYNlNUTTlSS21pQmM/edit

압축 파일의 용량은 약 1.5GB이지만, 파일의 압축을 풀면 약 3.3GB의 파일이 나옵니다.

```python
import gensim

# 구글의 사전 훈련된 Word2Vec 모델을 로드합니다.
model = gensim.models.KeyedVectors.load_word2vec_format('GoogleNews-vectors-negative300.bin 파일 경로', binary=True)  
print(model.vectors.shape) # 모델의 크기 확인
(3000000, 300)
# 모델의 크기는 3,000,000 x 300. 즉, 3백만 개의 단어와 각 단어의 차원은 300
# 파일의 크기가 3기가가 넘는 이유를 계산해보면 아래와 같다.
# 3 million words * 300 features * 4bytes/feature = ~3.35GB
print (model.similarity('this', 'is')) # 두 단어의 유사도 계산하기
print (model.similarity('post', 'book'))
0.407970363878
0.0572043891977
print(model['book']) # 단어 'book'의 벡터 출력
[ 0.11279297 -0.02612305 -0.04492188  0.06982422  0.140625    0.03039551
 -0.04370117  0.24511719  0.08740234 -0.05053711  0.23144531 -0.07470703
... 300개의 값이 출력되는 관계로 중략 ...
  0.03637695 -0.16796875 -0.01483154  0.09667969 -0.05761719 -0.00515747]
```

### **2) 한국어**

한국어의 미리 학습된 Word2Vec 모델은 박규병님의 깃허브 주소인 https://github.com/Kyubyong/wordvectors 에 공개되어져 있습니다. 박규병님이 공개한 직접적인 다운로드 링크는 아래와 같습니다.

모델 다운로드 경로 : https://drive.google.com/file/d/0B0ZXk88koS2KbDhXdWg1Q2RydlU/view

위의 링크로부터 77MB 크기의 ko.zip 파일을 다운로드 받아서 압축을 풀면 ko.bin이라는 50MB 크기의 파일이 있습니다. 이 파일을 로드하고 유사도를 계산해보겠습니다.

```python
import gensim
model = gensim.models.Word2Vec.load('ko.bin 파일의 경로')
result = model.wv.most_similar("강아지")
print(result)
[('고양이', 0.7290453314781189), ('거위', 0.7185634970664978), ('토끼', 0.7056223750114441), ('멧돼지', 0.6950401067733765), ('엄마', 0.693433403968811), ('난쟁이', 0.6806551218032837), ('한마리', 0.6770296096801758), ('아가씨', 0.675035297870636), ('아빠', 0.6729634404182434), ('목걸이', 0.6512461304664612)]
```

------

참고 : **Word2vec** 모델은 자연어 처리에서 단어를 밀집 벡터로 만들어주는 단어 임베딩 방법론이지만 최근에 들어서는 **자연어 처리를 넘어서 추천 시스템에도 사용되고 있는 모델**입니다. 우선 적당하게 데이터를 나열해주면 Word2vec은 위치가 근접한 데이터를 유사도가 높은 벡터를 만들어준다는 점에서 착안된 아이디어입니다.







---

**Reference**

https://wikidocs.net/50739