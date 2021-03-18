# Springboot 2.4 - 01 변경내역



## 스프링부트 2.4

출시일 : 2020년 11월



주요 변경 내역

* 스프링 5.3 사용
* java 15 지원
* 의존성과 프로퍼티 변경
* 설정 파일 처리 방식에 많은 변경



## 의존성과 프로퍼티

### 의존성 변경

* 스프링 플임워크 5.3
  * LTS 버전으로 5.3.x 가 계속 이어질 예정(2023년까지)이다. 5.4는 없다.
  * 스프링 5의 테마(코틀린, 리액티브, Functional, java 8+)를 완성하는 버전
  * GraalVM(그랄VM, VJM보다 더 빠르고 유지관리 하기 쉬운 VM)을 위한 개선
  * R2DBC 를 지원하는 spring-r2dbc 모듈을 제공한다.
  * queryForStream 을 제공한다.
* 스프링 데이터 2020.0
  * 버저닝을 캘린더 기반으로 바꾸었다. (코드명은 여전히 수학자 이름을 따른다.) 오캄의 면도날
  * RxJava 3 지원한다.
* 스프링 배치 4.3
  * 성능 향상

<br />

### 프로퍼티 변경

* `spring.profiles` : 설정 파일이 어떤 프로파일용인지 설정할 수 있다.
  * `spring.profile=local` : local 인 프로파일의 경우 이 아래 적힌 설정 프로퍼티를 사용하라는 설정
  * 하지만, 이름이 애매하므로 좀 더 직관적인 `spring.config.activate.on-profile` 라는 이름으로 변경되었다. (스프링부트 2.3)
  * deprecated 된 사항은 다음 다음(2번 또는 3번) 버전에서 삭제된다.

<br />

---

## 설정 파일 처리



**기존 application.properties와 application.yaml 의 문제**

1. `application.properties` 는 여러 문서를 표현할 수 없다.
2. `spring.profiles` (설정을 적용할 프로파일) 이름이 모호하다.
3. 설정을 읽어들이는 순서가 복잡하다.

<br />

**문제 1 해결**

스프링부트 2.4부터는 `application.properties` 도 파일 하나에 여러문서를 표현할 수 있다.

**application.yml**

```yaml
service:
  message: 스프링부트 2.1

---
service:
  message: 스프링부트 2.2

---
service:
  message: 스프링부트 2.3

---
service:
  message: 스프링부트 2.4
```

* `---` 를 사용해서 문서(document)를 구분할 수 있다.
* 아래 있는 문서가 위에 있는 문서의 값을 덮어쓴다.



**application.properties**

```properties
service.message=스프링부트 2.1
#---
service.message=스프링부트 2.2
#---
service.message=스프링부트 2.3
#---
service.message=스프링부트 2.4
```

* 아직은 IDEA 가 제대로 이해하지 못할 수 있다. yaml 파일로 작성하면 IDEA 가 잘인식하는데, properties 파일로 만들면 인식을 잘 못한다. 그러나 스프링부트 2.4는 지원한다.



<br />

**문제 2 해결**

`spring.profiles` 보다 직관적인 `spring.config.activate.on-profile` 을 사용한다.



>  인텔리제이 환경에서 프로파일 설정하는 방법은 3가지가 있다.
>
> Run/Debug Configurations 로 들어간다. (`shift, shift` 로 검색해보자. 또는 Edit Configurations 를 검색해서 들어간다.)
>
> Configuration 탭에서 Enviornment 화살표를 클릭한다.
>
> `prod` 라는 프로파일을 만들어보자.
>
> 방법 1) Active profiles 에 `prod` 를 입력
>
> 방법 2) VM options 에 `-Dspring.profiles.active=prod` 입력
>
> 방법 3) Program arguments 에 `--spring.profiles.active=prod` 입력

프로파일 설정을 위해 아래 프로퍼티를 사용하면 된다.

* `spring.profiles` = `spring.config.activate.on-profile` : 현재 설정을 적용할 프로파일
* `spring.profiles.include` : 추가로 사용할 프로파일
* `spring.profiles.active` : 현재 사용할 프로파일



예시)

```java
@Component
public class PostAppRunner implements ApplicationRunner {

  @Autowired
  ServiceProperties serviceProperties;

  @Autowired
  Environment environment;

  @Override
  public void run(ApplicationArguments args) throws Exception {
    System.out.println(serviceProperties.getMessage());
    System.out.println("active profiles: " + Arrays.toString(environment.getActiveProfiles()) + " "
                       + "default profiles " + Arrays.toString(environment.getDefaultProfiles())
                      );
  }
}
```

결과

```shell
스프링부트 2.4
active profiles: [prod] default profiles [default]
```





<br />

**문제 3 해결**

* `spring.profiles.include`, `spring.profiles.active` 와  `spring.config.activate.on-profile` 를 함께 사용할 수 없다.
* 설정을 읽어들이는 순서가 복잡하므로, 따로 분리해서만 사용가능하게 바뀌었다.

```properties
spring.config.activate.on-profile=prod
spring.profiles.include=dev
# 에러 발생
```

<br />

---

## 설정 파일 추가



`spring.config.import` 를 통해서 설정파일을 추가할 수 있다.

`spring.config.activate.on-profile` 과 함께 사용할 수 있따. 프로파일을 추가하는 것은 안되지만, 설정 파일을 추가할 수는 있다.

추가하는 설정파일을 제일 아래 있는 문서로 취급한다. 즉, 기존의 다른 설정을 덮어쓸 수 있다.

<br />

예시)

local 이라는 프로파일에서 테스트할 것이기 때문에 Edit Configurations 에서 `-Dspring.profiles.active=local` 로 프로파일을 변경한다.



**application.properties**

```properties
spring.config.activate.on-profile=local
spring.config.import=classpath:local.properties
apple.name=로컬환경
```

**local.properties**

```properties
apple.name=이 값으로 덮어씌운다.
```



예시)

```java
@Component
public class PostAppRunner implements ApplicationRunner {

  @Autowired
  AppleProperties appleProperties;

  @Autowired
  Environment environment;

  @Override
  public void run(ApplicationArguments args) throws Exception {
    System.out.println(appleProperties.getName());
    System.out.println("active profiles: " + Arrays.toString(environment.getActiveProfiles()) + " "
                       + "default profiles " + Arrays.toString(environment.getDefaultProfiles())
                      );
  }
}
```

결과)

```shell
이 값으로 덮어씌운다.
active profiles: [local] default profiles [default]
```

<br />

<br />

---

## Configuration Tree 지원



디렉토리 구조를 읽어들일 수 있다. 

`spring.conifg.import` 값으로 여러 접두어를 지원하는데, 아무런 접두어도 사용하지 않으면 일반적인 파일이나 디렉토리(입력값이 슬래시(/)로 끝나는 경우)로 인식한다.

<br />

예시)

**file:/config/service/mesaage.txt**

```sh
Configuration Tree 입니다.
```

> file:/ 은 애플리케이션 프로젝트 폴더의 경로를 말한다.

**application.properties**

```properties
service.message=기본값
spring.config.import=optional:configtree:config/
```

* `configtree` : 접두어를 사용하면 Configuration Tree 스타일의 볼륨 기반 설정 트리를 지정할 수 있다.
* `optional` : 경로에 프로퍼티 파일이 존재하면 사용하고, 없으면 사용하지 않는다. (에러가 발생하지 않는다.)

<br />

---

## 스프링부트와 쿠버네티스 ConfigMap 연동



Optional 접두어와 쿠버네티스가 지원하는 ConfigMap을 연동하여 쿠버네티스로 구동시 특정한 프로퍼티를 읽도록 설정할 수 있다.



### 쿠버네티스 ConfigMap

* 쿠버네티스가 지원하는 볼륨(Volume) 중에 한 종류로, 설정 데이터를 pod에 추가하는 방법을 제공한다.

  pod (컨테이너를 실행시키는 서버 인스턴스) 의 설정값을 포함하고 있는 디렉토리를 만들어준다.

* 특정 환경에 종속적인 값들을 컨테이너와 분리할 수 있다.

* 컨테이너는 pod에 마운트 되어있는 ConfigMap 볼륨에 들어있는 설정을 참조하여 사용할 수 있다.



### 스프링부트와 ConfigMap 연동

* 쿠버네티스의 ConfigMap 에 들어있는 설정을 스프링부트 애플리케이션에서 `@ConfigurationProperties` 또는 `Enviornment` 를 통해 접근할 수 있다.



pod 안에 `/etc/config` 라는 마운트경로가 생기고,

여기에 application.properties 파일이 생성되고 my.message 변수가 생긴다.

ConfigMap 정의

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: k8s-configmap
data:
  application.properties: |
    my.message: hello kubernetes
```

볼륨 정의 및 마운팅

```yaml
spec:
  volumes:
    - name: k8s-configmap-volume
      configMap:
        name: k8s-configmap
  containers:
      - name: app-demo
        image: demo-springboot23:0.0.1-SNAPSHOT
        volumeMounts:
          - mountPath: /etc/config
            name: k8s-configmap-volume
```

스프링은 이 값을 아래처럼 읽어나갈 수 있다.

**application.properties**

```properties
# kubernetes configMap
spring.config.import=optional:/etc/config/
```

<br />



쿠버네티스 pod 쉘 열기

```shell
$ kubectl exec --stdin --tty [pod 이름] -- /bin/bash
```



<br />

---

## 클라우드 플랫폼 기반 설정



**특정 클라우드 플랫폼에 배포했을 때 설정 파일 사용하기**

* `spring.config.activate.on-cloud-platform` 값으로 CloudPlatform을 사용할 수 있다.
* 특정 프로파일이 아니라 특정 클라우드 플랫폼에 배포했을 때 설정 파일을 사용하도록 설정할 수 있다.



**지원하는 클라우드 플랫폼**

* kubernetes
* cloud_foundary
* heroku
* sap
* none



**application.properties**

```properties
spring.config.activate.on-cloud-platform=kubernetes
spring.config.import=classpath:k8s-test.properties
```

**k8s-test.properties**

```properties
service.message=클라우드 플랫폼: 쿠버네티스
```



<br />

---

## 프로파일 그룹



프로파일을 세밀하게 만들 경우, 특정 프로파일 하나에 다른 여러 프로파일을 그룹으로 묶어서 동시에 사용할 수 있다.

```properties
# profile group
spring.profiles.group.local=localService,localController
spring.profiles.group.dev=devService,devController
```

* `local` 이라는 프로파일을 사용할 때, `localService`, `localController` 프로파일도 사용함.
* `dev` 이라는 프로파일을 사용할 때, `devService`, `devController` 프로파일도 사용함.



예시)

인터페이스 정의

```java
public interface MyService {

    String getMessage();
}
```

local 서비스, 컨트롤러

```java
@Profile("localService")
@Service
public class LocalService implements MyService {

  @Override
  public String getMessage() {
    return "local";
  }
}
```

```java
@Profile("localController")
@Controller
public class LocalController {

  @Autowired
  MyService myService;

  @GetMapping("/local")
  public String hello() {
    return myService.getMessage();
  }
}
```

dev 서비스, 컨트롤러

```java
@Profile("devService")
@Service
public class DevService implements MyService {

  @Override
  public String getMessage() {
    return "dev";
  }
}
```

```java
@Profile("devController")
@Controller
public class DevController {

  @Autowired
  MyService myService;

  @GetMapping("/dev")
  public String hello() {
    return myService.getMessage();
  }
}
```

**결과**

* 프로파일을 local 로 설정하고, `/local` 엔드포인트 요청을 보내면, "local" 이 출력된다.
* 마찬가지로 프로파일을 dev로 설정하고, `/dev` 엔드포인트로 요청을 보내면, "dev"가 출력된다.

<br />

---

### 설정 파일 추가기능 확장

* 커스텀한 접두어를 제공할 수 있는 확장 방법을 제공한다.
* `classpath:`, `configtree:`, `file:`
* 가령, redis:, zookeeper: 등
* `ConfigurationDataLocationResolver`, `ConfigDataLoader` 참고



<br />

### 설정 Tip

스프링의 프로퍼티 설정이 복잡하고 이전처럼 쓰고싶다면,

```properties
spring.config.use-legacy-processing=true
```

로 쓰고, 스프릥부트 2.3과 동일하게 처리한다.

<br />

스프링부트 2.4로 업데이트해도 괜찮은 경우

* application.yaml 을 사용하지 않는다.
* application-{profile}.properties 처럼 구체적인 프로파일용 프로퍼티파일을 작성해서 사용하는 방법이 있는데, 이를 많이 사용하지 않는다.

