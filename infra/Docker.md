# Docker

설치환경

> Distributor ID: Ubuntu
> Description:    Ubuntu 18.04.3 LTS
> Release:        18.04
> Codename:       bionic



Windows 는 10 pro이상에서 다운이 가능합니다.

Windows 또는 Mac은 공식 홈페이지 참조.

https://docs.docker.com/docker-for-windows/

https://docs.docker.com/docker-for-mac/







## 1. Install

**1) 이전 버전을 삭제합니다**

```console
$ sudo apt-get remove docker docker-engine docker.io containerd runc
```



**2) docker repository를 설정합니다. 이 레포로 부터 docker를 설치하고 업데이트 할 것입니다.**

```console
$ sudo apt-get update

$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```



 그 후 docker의 공식 GPG key를 추가합니다. 

```console
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 확인
$ sudo apt-key fingerprint 0EBFCD88

pub   rsa4096 2017-02-22 [SCEA]
      9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
sub   rsa4096 2017-02-22 [S]
```



**3) 안정적인 레포를 만들기 위해 다음을 실행합니다.** (x86_64 / amd64 경우)

```console
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```



---



**4) Docker engine - commutiy 설치**

```console
$ sudo apt-get update

$ sudo apt-get install docker-ce docker-ce-cli containerd.io

$ sudo docker run hello-world
```



​	



## 2. 설치 후 설정 (선택)

* 도커는 TCP port 대신에 Unix socket을 바인드합니다. Unix socket은 기본적으로 `root` 유저 권한입니다. 
* 따라서 non-root user(우리 같은 사용자)는 docker 명령어를 입력할 때마다 그 앞에 `sudo`를 붙여야 합니다.
* 이를 해결하기 위해 docker라는 Unix 그룹을 만들고 user를 추가됩니다.



```console
 # docker 그룹 생성
 $ sudo groupadd docker 
 
 # docker 굷에 유저 추가
 $ sudo usermod -aG docker $USER
 
 # 로그아웃, 다시 로그인
 $ newgrp docker
```







---

**Reference**

https://docs.docker.com/install/linux