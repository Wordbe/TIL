# CI / CD



## CI (Continuous Integration, 지속적 통합)

- 모든 소스 코드가 실행되고 있꼬, 누구든 현재 소스에 접근할 수 있는 단일 점을 유지한다.
- 빌드 프로세스를 자동화해서 누구든 소스로부터 시스템을 빌들하는 단일 명령어를 사용할 수 있게 한다.
- **테스팅을 자동화**해서 단일 명령어로 언제든지 시스템에 대한 건전한 테스트 수트를 실행할 수 있게 한다.
- 누구나 현재 실행 파일을 얻으면 **지금까지 가장 완전한 실행 파일**을 얻었다는 확신을 가지게 한다.



## Travis CI

- Jenkins : 젠킨스는 설치형이기 때문에 이를 위한 EC2 인스턴스가 하나더 필요하다. 
- Travis ; 가볍게 사용하기 위해 깃허브에서 제공하는 무료 CI 서비스인 Travis 를 사용한다.
- AWS CodeBuild : 빌드 시간만큼 요금 부과됨



```yaml
language: java
jdk:
  - openjdk 8

branches:
  only:
    - master

# Travis CI 서버의 Home
cache:
  directories:
    - '$HOME/.m2/repository'
    - '$HOME/.gradle'

script: "./gradlew clean build"

# CI 실행 완료 시 메일로 알람
notifications:
  email:
    recipients:
      - one@example.com
```





## Travis CI + AWS S3

- Travis CI 는 AWS S3 에게 jar를 전달한다.
- Travis CI 는 AWS CodeDeploy 에게 배포요청을 한다.
- S3 는 CodeDeploy 에게 jar 를 전달한다.

CodeDeploy는 빌드도 하고 배포도 할 수 있다. CodeDeploy 역시 깃허브 코드를 가져오는 기능을 지원한다.

하지만 S3를 이용해서 빌드파일을 따로 보관하면 배포와 빌드를 분리할 수 있는 환경을 만들 수 있다. 즉, 빌드없이 배포만 필요할 때 배포만 요청할 수 있다.



## AWS Key 발급

일반적으로 AWS 서비스에 외부 서비스가 접근할 수 없다. 접근 권한을 가진 Key 를 생성해서 사용한다. AWS 에서 인증 서비스로 IAM (Identity and Access Management) 를 제공한다.

IAM를 통해 Travis CI 가 AWS S3 와 CodeDeploy 에 접근할 수 있도록 설정한다.

IAM 비밀키는 한번만 보거나, 저장할 수 있다. 단, 잊어버린 경우는 얼마든지 새로 발급할 수 있다.



## S3 버킷 생성

Simple Storage Service

S3는 일종의 파일서버다.

보통 게시글을 쓸 때 나오는 첨부파일 등록을 구현할 때 많이 사용된다.



### .travis.yml 추가

```yaml
language: java
jdk:
  - openjdk 8

branches:
  only:
    - master

# Travis CI 서버의 Home
cache:
  directories:
    - '$HOME/.m2/repository'
    - '$HOME/.gradle'

script: "./gradlew clean build"

before_deploy:
  - zip -r segansig-service *
  - mkdir -p deploy
  - mv segansig-service.zip deploy/segansig-service.zip

deploy:
  - provider: s3
    access_key_id: $AWS_ACCESS_KEY # Travis repo settings 에 설정한 AWS IAM 엑세스 키
    secret_access_key: $AWS_SECRET_KEY # Travis repo settings 에 설정한 AWS IAM 비밀키
    bucket: segansig-build
    region: ap-northeast-2
    skip_cleanup: true
    acl: private
    local_dir: deploy # before_deploy 에서 생성한 디렉토리
    wait-until-deployed: true

# CI 실행 완료 시 메일로 알람
notifications:
  email:
    recipients:
      - one@example.com
```





마지막에 이런 문구가 나오면 성공한 것이다.

```shell
Installing deploy dependencies
Logging in with Access Key: ****************UBAT
Beginning upload of 1 files with 5 threads.
dpl.2
Preparing deploy
dpl.3
Deploying application
Done. Your build exited with 0.
```

<br />

---

## Travis CI 와 AWS S3, CodeDeploy 연동하기



### EC2 에 IAM 역할 추가하기

- 역할은 AWS 서비스에만 할당할 수 있는 권한이다. EC2, CodeDeploy, SQS 등이 있다.
- 반면, 사용자는 AWS 서비스 외에 사용할 수 있는 권한이다. 로컬 PC, IDC 서버 등이 있다.



### CodeDeploy 에이전트 설치

```shell
$ aws s3 cp s3://aws-codedeploy-ap-northeast-2/latest/install . --region ap-northeast-2
download: s3://aws-codedeploy-ap-northeast-2/latest/install to ./install # 성공시
```



```shell
# 실행 권한 부여
$ chomod +x ./install

# codedeploy agent 설치 진행
$ sudo ./install auto
/usr/bin/env: ruby: No such file or directory # ruby 가 설치 안되어있을 경우

$ sudo yum install ruby
```

```shell
# 상태 검사
$ sudo service codedeploy-agent status
The AWS CodeDeploy agent is running as PID 3389
```



### CodeDeploy 를 위한 권한 생성

CodeDeploy 에서 EC2 에 접근하려면 마찬가지로 권한이 필요하다. AWS 서비스이므로 IAM 역할을 생성한다.



### CodeDeploy 생성

AWS 배포 삼형제

- Code Commit
  - 깃허브와 같은 코드 저장소 역할, 프라이빗 기능 지원
  - 하지만 깃허브도 무료로 프라이빗 레포지원
- Code Build
  - Travis CI 와 마찬가지로 빌드용 서비스
  - 멀티 모듈의 경우 사용할만하다. 하지만 규모 있는 서비스는 대부분 젠킨스/팀시티 등을 이용한다.
- CodeDeploy
  - AWS 배포 서비스
  - 대체제가 없다.
  - 오토 스케일링 그룹 배포, 블루 그린 배포, 롤링 배포, EC2 단톡 배포 등 많은 기능을 지원한다.

Code Commit 역할은 깃허브가, Code Build 역할은 Travis CI 가 하고 있다.



### AWS CodeDeploy 설정: appspec.yml 생성

```shell
# ec2
$ mkdir ~/app/step2
$ mkdir ~/app/step2/zip
```



**appspec.yml**

```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /home/ec2-user/app/step2/zip/
    overwrite: yes
```



**.travis.yml**

```yaml
language: java
jdk:
  - openjdk 8

branches:
  only:
    - master

# Travis CI 서버의 Home
cache:
  directories:
    - '$HOME/.m2/repository'
    - '$HOME/.gradle'

script: "./gradlew clean build"

before_deploy:
  - zip -r segansig-service *
  - mkdir -p deploy
  - mv segansig-service.zip deploy/segansig-service.zip

deploy:
  - provider: s3
    access_key_id: $AWS_ACCESS_KEY # Travis repo settings 에 설정한 AWS IAM 엑세스 키
    secret_access_key: $AWS_SECRET_KEY # Travis repo settings 에 설정한 AWS IAM 비밀키
    bucket: segansig-build
    region: ap-northeast-2
    skip_cleanup: true
    acl: private
    local_dir: deploy # before_deploy 에서 생성한 디렉토리
    wait-until-deployed: true

  - provider: codedeploy
    access_key_id: $AWS_ACCESS_KEY
    secret_access_key: $AWS_SECRET_KEY

    bucket: segansig-build
    key: segansig-service.zip

    bundle_type: zip
    application: segansig-service # CodeDeploy 에서 설정한 애플리케이션 이름
    deployment_group: segansig-service-group # CodeDeploy 에서 설정한 배포 그룹 이름

    region: ap-northeast-2
    wait-until-deployed: true

# CI 실행 완료 시 메일로 알람
notifications:
  email:
    recipients:
      - one@example.com
```

<br />

---

## 배포 자동화 구성

jar를 배포하여 실행까지 해보자.



### deploy.sh 파일 추가

프로젝트폴더/scripts/deploy.sh

```sh
#! /bin/bash

REPOSITORY=/home/ec2-user/app/step2
PROJECT_NAME=segansig

echo "> Build 파일 복사"
cp $REPOSITORY/zip/*.jar $REPOSITORY/

echo "> 현재 구동 중인 애플리케이션 id 확인"

CURRENT_PID=$(pgrep -fl segansig | grep jar | awk '{print $1}')

echo "현재 구동 중인 애플리케이션 pid: $CURRENT_PID"

if [ -z "$CURRENT_PID" ]; then
        echo "> 현재 구동 중인 애플리케이션이 없으므로 종료하지 않습니다."
else
        echo "> kill -15 $CURRENT_PID"
        kill -15 $CURRENT_PID
        sleep 5
fi

echo "> 새 애플리케이션 배포"

JAR_NAME=$(ls -tr $REPOSITORY/*.jar | tail -n 1)

echo "> JAR Name: $JAR_NAME"
echo "> $JAR_NAME 에 실행 권한 추가"

chmod +x $JAR_NAME

echo "> $JAR_NAME 실행"

nohup java -jar \
        -Dspring.config.location=classpath:/application.properties \
        $JAR_NAME > $REPOSITORY/nohub.out 2>&1 &
```



.travis.yml 파일 수정

```yaml
language: java
jdk:
  - openjdk 8

branches:
  only:
    - master

# Travis CI 서버의 Home
cache:
  directories:
    - '$HOME/.m2/repository'
    - '$HOME/.gradle'

script: "./gradlew clean build"

before_deploy:
  - mkdir -p before-deploy
  - cp scripts/*.sh before-deploy/
  - cp appspec.yml before-deploy/
  - cp build/libs/*.jar before-deploy/
  - cd before-deploy && zip -r before-deploy *
  - cd ../ && mkdir -p deploy
  - mv before-deploy/before-deploy.zip deploy/segansig-service.zip

deploy:
  - provider: s3
    access_key_id: $AWS_ACCESS_KEY # Travis repo settings 에 설정한 AWS IAM 엑세스 키
    secret_access_key: $AWS_SECRET_KEY # Travis repo settings 에 설정한 AWS IAM 비밀키
    bucket: segansig-build
    region: ap-northeast-2
    skip_cleanup: true
    acl: private
    local_dir: deploy # before_deploy 에서 생성한 디렉토리
    wait-until-deployed: true

  - provider: codedeploy
    access_key_id: $AWS_ACCESS_KEY
    secret_access_key: $AWS_SECRET_KEY

    bucket: segansig-build
    key: segansig-service.zip

    bundle_type: zip
    application: segansig-service # CodeDeploy 에서 설정한 애플리케이션 이름
    deployment_group: segansig-service-group # CodeDeploy 에서 설정한 배포 그룹 이름

    region: ap-northeast-2
    wait-until-deployed: true

# CI 실행 완료 시 메일로 알람
notifications:
  email:
    recipients:
      - one@example.com
```



appspec.yml 파일 수정 

이 파일은 CodeDeploy 를 설정하는 파일이다. 여기서 애플리케이션 시작을 위해 deploy.sh 를 실행시키라는 설정을 한다.

```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /home/ec2-user/app/step2/zip/
    overwrite: yes

permissions:
  - object: /
    pattern: "**"
    owner: ec2-user
    group: ec2-user

hooks:
  ApplicationStart:
    - location: deploy.sh
      timeout: 60
      runas: ec2-user
```



codedeploy 오류 확인

```shell
$ cd /opt/codedeploy-agent/deployment-root/
$ ll
$ cat deployment-logs/codedeploy-agent-deployments.log
```



이제 작업이 끝난 내용을 master 브랜치에 푸시만 하면 자동으로 EC2에 배포된다.

