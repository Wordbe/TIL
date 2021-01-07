# 실천 IaaS



Infrastructrue as as service



## 5 실천 지속적 통합, 지속적 딜리버리

코드를 변경한 후 소스코드관리 시스템에 등록만 하면 다른 명시적 조치 필요 없이 자동으로 테스트 및 배포가 수행된다.

지속적 통합 (CI) 도구



1) `git push` 소스 변경

2) 소스 변경 통지  : github ➞ slack

3) Web Hook으로 변경 통지 : github ➞ CI 서버

4) 인프라설정 : Jenkins ➞ ansible

5, 7) 처리할 때마다 통지 : Jenkins ➞ slack

6) 인프라 테스트 : Jenkins ➞ Serverspec





---

### 1) github, slack 연결

코드를 변경하고 `git push` 를 하면, 슬랙에 메시지가 올 수 있도록 설정할 수 있다.



**슬랙 깃헙 인테그레이션 설치 및 설정**

[https://my.slack.com/apps](https://my.slack.com/apps)

github enterprise server 검색

설치한 후 슬랙의 프로젝트, 채널과 연결



**Web Hooks 설정**

[https://github.com/My Account/My Repository/settings/hooks](https://github.com/My Account/My Repository/settings/hooks)

에 들어가서 Payload URL 입력하면 된다.

> content type : application/json
>
> SSL verification : Enable SSL verification





---

### 2) github, jenkins 연결

`git push` 하면 배포 처리가 실행된다.



CI 서버가 git 명령어를 사용할 수 있도록 조작한다.

inbound / outbound 가 모두 인터넷 통신이 가능해야 한다.



---

### 3) jenkins, slack 연결

Job 이벤트를 슬랙에 통지한다.



### 4) Jenkins, Ansible 연결

Job에 의해 인프라 구축을 수행한다.



### 5) Jenkins, Serverspec 연결

Job에 의한 인프라 테스트 실시



### 6) github 에서 Jenkins 프로비저닝 연결



---

이렇게 지속적 통합/딜리버리로 개발, 구축, 테스트를 하나로 할 수 있다.













---

## ELK Stack



### 1) LogStash

Web서버 Access 로그를 판독한대로 Elasticsearch 로 전송한다.



* 인풋블록
* 필터블록
  * grok 필터
    * 첫 번째 filter로 gork Plug-In 이 작동한다. 문자열을 분석하고 분할하는 플러그인이다.
  * data 필터
  * geoip 필터
    * 글로벌 IP 주소로부터 대략적 위치 정보 분석한다.
    * "x_forwarded_for" => "54.199.178.168"
  * grok 필터
  * useragent 필터
* 아웃풋블록





### 2) Elasticsearch

로그 정보를 축적한다. Kibana의 Access에 대응해서 가시화에 필요한 정보를 반환한다.







### 3) Kibana

개발자, 운용자가 로그 정보를 가시화/분석하기 위해 검색하는 화면이다. (Kibana 서버에 Kibana, Elasticsearch 포함)

access.log

syslog, CPU 사용률, 메모리 사용량 등 모니터링 가능





















