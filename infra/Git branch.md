# Git branch



**이 글의 요약.**



서비스 개발 시 브랜치는 크게 5가지 종류가 있다.

master - 제품으로 출시될 수 있는 브랜치 (항상 유지되는 메인 코드)
feature - 기능을 개발하는 브랜치
develop -  다음 출시 버전을 개발하는 브랜치  (출시 이전에 이쪽에 머지해서 테스트)
hotfix - 출시 버전에서 발생한 버그를 수정하는 브랜치 (release나갔는데 급하게 수정이 필요할때)
release - 출시된 버전 관리 ( 배포는 이 브랜치로 )



>  Tip 1 : git 이용시 CLI 를 이용하는 것도 좋지만
>
> 소스 트리(source tree) GUI 프로그램을 설치해서 관리하는 것이 안전하다.



>  Tip 2 : branch 구분은 사소하게 구분하면 좋다.





---

## Git Flow 정책

![](https://woowabros.github.io/img/2017-10-30/git-flow_overall_graph.png)

개발 흐름을 살펴보자.

처음에는 master 브랜치가 존재하는데, develop이 갈라져 나온다.

develop 브랜치는 상시로 버그를 수정한 커밋들이 추가된다.

새로운 기능 추가 작업이 있는 경우는 develop 브랜치에서 feature 브랜치를 생성한다.

기능 추가 완료 후에는 feature 브랜치는 develop 브랜치로 merge된다.

develop에서 이번 버전에 포함되는 모든 기능이 merge되었다면 QA(Quaility Assuracne, 품질 보증)를 위해 develop 브랜치로부터 release 브랜치를 생성한다.

QA를 진행하면서 발생한 버그들은 release 브랜치에서 수정한다. 

QA를 무사히 통과했다면 release 브랜치를 master와 develop 브랜치로 merge한다.

마지막으로 출시된 master 브랜치에서 버전 태그를 추가한다.





---

`master` 브랜치

항상 오류가 없어야 할 메인 소스이다.



1) `feature` 브랜치

주로 master로부터 가지를 가지를 따서 개발을 하고,

```
$ git checkout master
```

`feature/story-60`이런식으로 가지이름을 지어서 개발을 하다가 다시 master에 merge한다.



2) `develop` 브랜치

develop은 일종의 테스트 브랜치이다.

두 명 이상의 작업자가 존재할 때 

develop 테스트 후 master에 merge 한다.

그 후 master를 develop에 merge 한다.



3) `release` 브랜치

배포 시 `master`가 아닌 `release`를 이용한다.

`master`로부터 `release/YYYYMMdd` 형식으로 딴다.

> release/20200210
>
> release/20200221

등등으로 배포 날짜에 따라 버전을 관리하고,

만약 배포 중에 오류가 난다면 이전 버전으로 되돌린다.



4) `hotfix` 브랜치

배포 시 긴급하게 수정할 오류가 있을 때 `release`로부터 `hotfix` 브랜치를  딴다.

오류를 고쳤다면 수정한 `hotfix`를 `release`로 merge하여야 한다.

 



---

**Reference**

Git flow 소스 이미지 - 우아한 형제들 깃헙(https://woowabros.github.io/img/2017-10-30/git-flow_overall_graph.png)