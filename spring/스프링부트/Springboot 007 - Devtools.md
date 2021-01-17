# Springboot 007 - Devtools



스프링부트는 devtools (개발도구) 라이브러리의 도움으로 좀 더 편한 환경에서 개발을 할 수 있다.

사용을 위해서는 의존성을 먼저 추가한다.



pom.xml

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

<br />

Devtools 는 캐시 설정을 개발 환경에 맞게 변경해준다.

클래스패스 안의 파일들이 변경 될 때마다 자동으로 재시작을 해준다. 

<u>파일 변경후 빌드만 다시해주면 된다.</u> 인텔리제이에서 빌드 단축키는 `⌘ + F9` 이다.

<br />

어플리케이션 실행을 직접 끄고 켜는것 (cold starts) 보다는 빠르지만, 리로링보다는 느리다. 

리스타트 하고 싶지 않은 리소스는 프로퍼티에 `spring.devtools.restart.exclude` 로 추가해주면 된다.

<br />

이렇게 자동 재시작을 해주었을 때, 브라우저 표시되는 화면이 변경될 수 있는 상황이 있다. 브라우저도 자동으로 리프레시 하려면 편안한 방법으로 크롬 익스텐션인 Live Reload 를 설치해주면 된다.

[Live Reload 설치](https://chrome.google.com/webstore/detail/live-reload/jcejoncdonagmfohjcdgohnmecaipidc?hl=ko&gl=001&authuser=5)

![](https://blog.kakaocdn.net/dn/Lmvlq/btqTPzOG77e/2Ra3R78lWoteppO6ZLkvPk/img.png)



Live Reload 를 끄려면 프로퍼티에 `spring.devtools.liveload.enabled=false` 로 설정하면 된다.

<br />

글로벌 설정으로는 `~/.spring-boot-devtools.properties` 를 만들어서 프로퍼티를 설정해주면 된다. 이는 어떤 프로퍼티보다도 우선순위가 높다.











