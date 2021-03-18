# Springboot 2.3 - Liveness, Readiness, Properties



## Liveness와 Readiness



### Linveness

현재 애플리케이션이 살아있는 지에 대한 상태값

* 상태가 비정상이고 복구하지 못한다면 보통 애플리케이션을 재기동한다.
* `LivenessState.CORRECT` 
* `LivenessState.BROKEN` : 애플리케이션을 더 이상 실행할 수 없는 상태. 재기동 해야함



### Readiness

요청을 받을 수 있는 지에 대한 상태값

* 준비가 될 때까지 해당 서버로 요청을 보내지 않고 다른 서버로 보낸다.
* `RedinessState.ACCEPTING_TRAFFIC`
* `Readiness.REFUSING_TRAFFC` : 예를 들어 애플리케이션이 많은 요청을 받아서 더 이상 요청을 받을 수 없을 경우 이 상태로 변환한다.

<br />

### 애플리케이션 상태정보 조회

**애플리케이션 내부에서**

`ApplicationAvailability`는 스프링부트 2.3부터 빈으로 자동등록된다.

```java
@RestController
public class PostController {

  @Autowired
  ApplicationAvailability availability;

  @GetMapping("/post")
  public String post() {
    return "Application is now " + availability.getLivenessState()
      + " " + availability.getReadinessState();
  }
}
```

요청을 입력하면 아래 스트링을 리턴한다.

```shell
Application is now CORRECT ACCEPTING_TRAFFIC
```

<br />

**애플리케이션 외부에서**

application.properties

```properties
# 애플리케이션 밖에서 상태 정보 조회: Actuator /health 엔드포인트 사용
management.endpoint.health.probes.enabled=true
```

health 그룹은 쿠버네티스에 배포할 때는 true 로 제공한다.

Liveness 는 `actuator/health/liveness`, Readiness 는 `actuator/health/readiness` 엔드포인트로 조회할 수 있다.

<br />

### 애플리케이션 상태변경

**상태변경하기**

> `httpie` 와 `watch` 툴을 이용해보자.
>
> http 는 curl 과 비슷한 명령어이지만 응답 본문 뿐만아니라 HTTP 정보를 동시에 가져와 준다.
>
> watch 는 요청/응답에 대해 실시간으로 관찰할 수 있게 도와준다.
>
> ```shell
> $ brew install http
> $ brew install watch
> ```
>
> 

<br />

EventPublisher 를 통해서 변경이벤ㅌ가 발생할 때, 특정 상태를 뼌경해보자.

```java
@Autowired
ApplicationEventPublisher eventPublisher;

@GetMapping("/turnoff")
public String turnoff() {
  AvailabilityChangeEvent.publish(eventPublisher, this, LivenessState.BROKEN);
  return "Broken";
}

@GetMapping("/block")
public String block() {
  AvailabilityChangeEvent.publish(eventPublisher, this, ReadinessState.REFUSING_TRAFFIC);
  return "Blocked requests";
}
```

<br />

**Liveness 테스트**

terminal A

```shell
$ watch -n1 'http localhost:8080/actuator/health/liveness'
```

원래 "status" : "UP" 이었다가

terminal B

```shell
$ http localhost:8080/turnoff
```

Liveness 가 BROKEN 이 되면서 "status" : "DOWN" 으로 바뀐다.

<br />

**Readiness 테스트**

readiness 의 경우도 마찬가지이다.

```shell
$ watch -n1 'http localhost:8080/actuator/health/readiness'
$ http localhost:8080/block
```

원래 "status" : "UP" 에서 readiness 가 `REFUSING_TRAFFIC` 상태로 바뀌면  "status" : "OUT_OF_SERVICE" 로 바뀐다.



중요한 것은 어플리케이션 상태가 바뀌어도, 기본 요청들은 정상적으로 작동이 된다는 것이다. 이 상태값을 참조하여서 어플리케이션이 어떻게 동작할지는 개발자가 결정하면 된다. 쿠버네티스는 이 상태값을 참조할 수 있다.



### 애플리케이션 상태변경 감지하기



1) `/block` 요청을 보내서 `ReadinessState.REFUSING_TRAFFIC` 상태로 만든다.

2) 상태가 변화되었으므로(ACCEPTING_TRAFFIC(UP) → REFUSING_TRAFFIC(OUT_OF_SERVICE)) 이벤트 리스너 `onStateChange` 가 이를 감지한다.

3) 만약 `ReadinessState.REFUSING_TRAFFIC` 상태이면 5초 뒤에 다시 `ReadinessState.ACCEPTING_TRAFFIC` 상태로 바꾼다.

```java
@Async
@EventListener
public void onStateChanged(AvailabilityChangeEvent<ReadinessState> readiness) throws InterruptedException {
  System.out.println("State is changed to " + readiness.getState());
  if (readiness.getState() == ReadinessState.REFUSING_TRAFFIC) {
    Thread.sleep(5000L);
    AvailabilityChangeEvent.publish(eventPublisher, this, ReadinessState.ACCEPTING_TRAFFIC);
  }
}
```

```java
@EnableAsync
@SpringBootApplication
public class Application { ...
```

확인

```shell
$ watch -n1 'http localhost:8080/actuator/health/readiness'
$ http localhost:8080/block
```



<br />

---

## 쿠버네티스 연동



Liveness 와 Readiness 상태값을 쿠버네티스와 연동해보자.

* 쿠버네티스의 Liveness probe 체크 : 특정 횟수 (기본값 3회) 이상 Liveness 상태가 안 좋은 경우 애플리케이션을 재시작(restart)한다.
* 쿠버네티스의 Rediness probe 체크 : Rediness 상태가 안 좋은 경우 해당 pod (컨테이너)로 요청을 보내지 않는다.



로드밸런서가 있고 서버 3개를 띄운다. 각각의 서버를 컨테이너, pod 이라고 한다.



예시)

```yaml
apiVersion: apps/v1
kind: Depolyment
metadata:
  name: app-demo
spec:
  selector:
    matchLabels:
      app: app-demo
  replicas: 3
  template:
    metadata:
      labels:
        app: app-demo
    spec:
      containers:
        - name: app-demo
          image: the-java-springboot:0.0.1-SNAPSHOT
          ports:
            - containerPort: 8080
          
          livenessProbe:
            httpGet:
              port: 8080
              path: /actuator/health/liveness
            initialDelaySeconds: 10
            periodSeconds: 3
            failureThreshold: 2
            
          readinessProbe:
            httpGet:
              port: 8080
              path: /actuator/health/readiness
            initialDelaySeconds: 10
            periodSeconds: 3
---
apiVersion: v1
kind: Service
metadata:
  name:  app-demo
spec:
  selector:
    app:  app-demo
  type:  LoadBalancer
  ports:
    - port: 8080
      targetPort: 8080

```

* `replica: 3` : pod 를 3개 만든다.
* 만들어놓은 도커이미지 `the-java-springboot:0.0.1-SNAPSHOT` 를 사용하여 실행시킨다.
* `livenessProbe` : 라이브니스 상태를 확인하는 프로브이다.
  * `initialDelaySeconds` : 서버가 실행되고 10초 후부터 상태를 점검한다.
  * `periodSeconds` : 3초 간격마다 상태 검사한다.
  * `failureThreshold` : 2번 이상 라이브니스 체크가 실패하면 애플리케이션을 재가동한다.
* `redinessProbe` : 레디니스 상태를 확인하는 프로브이다.
  * rediness 의 경우 상태가 부적절하면 해당 서버로 요청이 들어오지 못하도록 막는다.



```shell
# k8s yaml 파일로 적용 (쿠버네틱스 시작)
$ kubectl apply -f kubernetes.yaml

# 배포상태 조회
$ kubectl get deployments.apps
# 서비스상태 조회
$ kubectl get service
# 파드 상태 조회
$ kubectl get pods
# 파드 구체적인 상태
$ kubectl describe pod [pod 이름]
# 파드 로그
$ kubectl logs [pod 이름]

# 삭제 (쿠버네티스 종료)
$ kubectl delete -f kubernetes.yaml
```



<br />

자신의 상태(host 주소, host 이름)를 확인할 수 있는 간단한 서비스를 만들고, 컨트롤러에 등록해보자.

그래서 쿠버네티스 실행시키고 http 요청보내면 응답본문으로 코드가 잘 동작하는지 확인하자.

```java
@Service
public class LocalHostService {

  public String getLocalHostInfo() {
    try {
      InetAddress localHost = InetAddress.getLocalHost();
      return String.format("host-address: %s host-name: %s",
                           localHost.getHostAddress(),
                           localHost.getHostName());
    } catch (UnknownHostException e) {
      throw new RuntimeException(e);
    }
  }
}
```

```java
@RestController
public class LocalController {

  @Autowired
  ApplicationAvailability availability;

  @Autowired
  LocalHostService localHostService;

  @GetMapping("/local")
  public String local() {
    return "Appliation is now " + availability.getLivenessState()
      + " " + availability.getReadinessState()
      + " " + localHostService.getLocalHostInfo();
  }
}
```

<br />

쿠버네티스를 띄우고, `watch` 로 pods 의 상태를 감지해보자.

```shell
$ watch -n1 'kubectl get pods'
```

http 요청으로 `/block` 을 날려보자. Readiness 가 ``REFUSING_TRAFFIC`` 상태로 바뀐다. (Ready가 0으로) 그러면 `ReadinessProbe` 는 이 상태를 감지하여, 해당 pod 으로 들어오는 요청을 받지 않는다. 그러다가 5초가 되면 다시 `ACCEPTING_TRAFFIC` 으로 바뀌게 만들어 놓았으므로, Readiness 가 1로 바뀌면서 정상 상태로 돌아온다.



http 요청으로 `/turnoff` 을 날려보자. Liveness 가 ``BROKEN`` 상태로 바뀐다. (Ready가 0이됨) 그러면 `LivenessProbe` 는 이 상태를 감지하고, pod 를 다시 restart 시킨다.(Ready가 1이됨)





