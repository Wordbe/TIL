# [mac] jupyter, virtualenv, python, pip 설치



jupyter 노트북을 통한 파이썬 사용이 많아지고 있습니다.

머신러닝, 딥러닝을 배우고자 하는 사람들이 늘어서 그렇겠지요.

이를 위한 코딩의 첫 번째 관문인, 

프로그래밍 언어(python) > 가상환경(virtualenv) > 스크립트 에디터(jupyter 노트북) 환경을 구축해봅시다.

> 이 글의 목표 입니다.
>
> 1. mac os 에서 파이썬을 설치한다.
> 2. virtaulenv 를 통해 가상환경을 구성한다.
> 3. 가상환경안에서 jupyter notebook을 실행시킨다.



**% 단계적으로 구성되어있으니 필요하신 부분만 보셔도 됩니다.**





## 1. python install

mac 터미널은 우선 사용자 아이디로 접속이 됩니다.

기본으로 파이썬이 깔려있었지만, 저는 brew를 통해 파이썬을 다시 깔았습니다. 

```shell
% brew install python
```



</br>

brew를 통해 설치한 python 정보를 봅시다.

```shell
% brew info python
python@3.8: stable 3.8.5 (bottled)
Interpreted, interactive, object-oriented programming language
https://www.python.org/
/usr/local/Cellar/python@3.8/3.8.5 (4,452 files, 69.2MB) *
  Poured from bottle on 2020-09-22 at 00:58:19
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/python@3.8.rb
License: Python-2.0
==> Dependencies
Build: pkg-config ✘
Required: gdbm ✔, openssl@1.1 ✔, readline ✔, sqlite ✔, xz ✔
==> Caveats
Python has been installed as
  /usr/local/bin/python3

Unversioned symlinks `python`, `python-config`, `pip` etc. pointing to
`python3`, `python3-config`, `pip3` etc., respectively, have been installed into
  /usr/local/opt/python@3.8/libexec/bin

You can install Python packages with
  pip3 install <package>
They will install into the site-package directory
  /usr/local/lib/python3.8/site-packages

See: https://docs.brew.sh/Homebrew-and-Python
```

16줄에 보면 brew로 설치된  python, python-config, pip 이 각각 3 버전에도 연결이 되어있고, `/usr/local/opt/python@3.8/libexec/bin` 경로에 설치되어 있다고 나옵니다.

이를 우리 환경변수에 등록해봅시다.

```shell
export PATH="/usr/local/opt/python@3.8/libexec/bin:$PATH"
```





</br>

파이썬이 어디 있는지 찾아봅시다.

```shell
% where python
/usr/local/opt/python@3.8/libexec/bin/python
/usr/bin/python
```

위에 있는 것이 `brew` 패키지를 통해 설치한 파이썬이고, 아래는 기본 설치된 파이썬입니다.



</br>

설치된 버전도 확인해볼까요?

```shell
% python -V
Python 3.8.5

% pip -V
pip 20.2.3 from /Users/rdijin/Library/Python/3.8/lib/python/site-packages/pip (python 3.8)
```



파이썬 설치 완료,





---

## 2. virtualenv (가상환경) 설치



가상환경은 프로젝트마다 원하는 환경을 구축할 때 용이합니다. `pip freeze` 명령어로 그 환경에 설치된 라이브러리들을 한꺼번에 뽑아낼 수도 있어서 다른 환경에서도 똑같은 환경을 구축할 수 있는 장점이 있습니다.



### virtualenv 설치

```shell
% pip install virtualenv
```

</br>



### 내 가상환경 생성

```shell
(원하는 폴더에 들어가서)
% virtaulenv apple
```

이러면 apple이라는 이름의 가상환경이 생성되고, 하나의 폴더가 생긴다.

이때 `apple/bin` 디렉토리 안을 자세히보면 새로운 python과 pip 환경이 생성된 것을 볼 수 있다.



</br>

### 가상환경 실행

```shell
% source apple/bin/activate

(apple) %
```

가상환경을 실행하면 위와같이 (apple) 이라는 표시가 나온다.

위 가상환경 안에서 python, pip을 명령어를 사용한다면 위에서 말한 `apple/bin` 디렉토리 안의 python, pip 과 연결된다.





</br>

## 3. jupyter notebook

우선 주피터 노트북을 설치하자.

```shell
(apple) % pip install jupyter
```



그리고 실행시켜보자.

```shell
(apple) % jupyter notebook
```



나는 여기서 오류가 2개나 났었다. 

**하나**는 jupyter 노트북 실행 후 새로운 파일(Untitled.ipynb)이 생성되지 않는 것이었다.

`error to write a readonly database` 에러였다.

아래와 같이 해결했다.

```shell
% jupyter --paths
```

이렇게 치면 data: 에서 첫번째 나오는 줄의 경로가 파일을 만드는 권한과 관련되어 있다.

그 경로에 가서 다음과 같이 권한을 부여해주면 된다.

```shell
% sudo chmod -R 777 /Users/rdijin/Library/Jupyter/
```



</br>

**둘째**는 ipynb 파일을 열려고 클릭한 순간, 

브라우저 창에서 `500 Internal Server Error` 가 나는 것이었다.

구글을 뒤져보다가 nbconvert 라이브러리 관련 문제임을 알게 되었고, 이를 업데이트 해주었다.

하지만, 잘 안되어서 좀 더 찾아보니 아예 아래의 특정한 버전으로 설치하라는 것이었다.

```shell
% pip install nbconvert==5.4.1
```

해본 결과 성공했다.







