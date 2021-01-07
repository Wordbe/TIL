# Jenkins



mac

LTS 버전 (Long Term Support, 장기지원버전) : 12주에 한 번씩 발행되어 커뮤니티의 투표를 통해 선별되는 릴리즈 버전이다. 안정성이 높다.



## 마스터-슬레이브 구조

마스터는 유저 인터페이스를 제공하고 기본 동작만 수행한다.

슬레이브는 무거운 작업들을 수행한다.



UI에서 슬레이브 노드 생성

* Jenkins > Manage Jenkins > Manage Nodes > New Node



---

젠킨스 작업실행의 생명주기

1) 폴링 Polling

2) 사전 소스코드 관리 pre SCM

3) 소스코드 관리 SCM

4) 빌드 이전 단계 Pre build

5) 빌드 단계 Build step

6) 빌드 이후 단계 Post build



---

소프트웨어 개발 생명주기



* SDLC (Software Development LifeCycle)
* 전통적 개발 생명주기
  * 기획 ➞ 개발 ➞ 테스트 ➞ 릴리스
* 지속적 소프트에어 개발 생명주기
  * 요구사항 ➞ 디자인 ➞ 개발 ➞ 빌드+테스트 ➞ 테스트 ➞ 사전 프로덕션환경으로 배포 + 테스트 ➞ 요구 사항

