# Springboot 2.3 -  Properties, Actuator



## 스프링부트 2.3의 actuator/configprops 엔드포인트 변경 내역

* 프로퍼티값을 어디서 읽어왔는지 알려준다. (configuration properties 에서 등록한 것들 다 보여준다.)



먼저 service.message 라는 프로퍼티를 등록해보자.

**application.properties**

```properties
service.message=my service
```

```java
@AllArgsConstructor @Getter
@ConstructorBinding
@ConfigurationProperties(prefix = "service")
public class ServiceProperties {
  private String message;
}
```

그리고 메인 애플리케이션 클래스위에 `@ConfigurationPropertiesScan` 을 붙히면 `ServiceProperties` 프로퍼티 클래스를 탐색해서 빈에 등록해준다. `@ConstructBinding` 을 하면 message 는 Immutable 한 속성이 되어 값을 바꿀 수 없게 된다.

<br />

application.properties

```properties
# 선별적으로 공개
management.endpoints.web.exposure.include=info,health,configprops
```

```properties
# 모두 공개 이후 선별적으로 비공개
management.endpoints.web.exposure.include=*
management.endpoints.web.exposure.exclude=shutdown
```



<br />

내가 등록한 프로퍼티를 `configprops` 에서 확인할 수 있다.

스프링부트 2.3에서는 "origin" 이라는 속성도 자동으로 추가해준다. 프로퍼티를 어디로부터 읽어왔는지 알려주고 있다. (class path resource [application.properties])

```json
// http://localhost:8080/actuator/configprops
...
"beans": {
  "service-co.wordbe.thejavaspringboot.service.ServiceProperties": {
    "prefix": "service",
    "properties": {
      "message": "my service"
    },
    "inputs": {
      "message": {
        "value": "my service",
        "origin": "class path resource [application.properties] - 32:17"
      }
    }
  }, ...
```



<br />

---

## 프로퍼티 한글 깨짐 현상 해결



아래와 같이 한글로 프로퍼티를 작성하고, 콘솔에서 출력하면 한글 깨짐 현상이 발생한다.

```properties
service.message=나의 서비스
```

콘솔 인코딩을 UTF-8로 바꾸어도 같은 현상이 발생한다. (웹 브라우저에서 출력해도 그렇다.)



**원인 & 해결방법**

java 는 properties 파일을 `ISO 8859-1` 인코딩을 사용해서 읽어들이는데, 이 인코딩으로 표현할 수 없는 문자는 `Unicode`로 작성해야 한다.

즉, 한글을 그대로 적어주면 기존 인코딩방식으로 인코딩을하지 못하니, 적을 때 Unicode 로 적어주어야 한다.

그런데 우리가 일일이 Unicode 로 한글을 변환해서 적는 것은 번거로우니 IDE 의 도움을 받자.

Preferences (`cmd + ,` ) > Editor > File Encodings > Properties Files 에서 

Transparent native-to-ascii conversion 박스를 체크표시로 바꾸어주면 된다.







