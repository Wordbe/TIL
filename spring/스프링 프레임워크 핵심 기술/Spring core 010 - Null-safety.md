# Spring - null-safety



NullPointException 을 막는 것을 목표로 한다. Intellij 의 도움을 받는다.

스프링 5에 추가된 Null 관련 에노테이션으로 `@NonNull`, `@Nullable`, `@NonNullApi` (패키지 레벨 설정), `@NonNullFields` (패키지 레벨 설정) 이 있다.



```java
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
public class RedEventService {

    @NonNull
    public String createEvent(@NonNull String name) {
        return "red " + name;
    }
}

```

NonNull 을 사용하여 null 값이 들어오면 안된다고 명시한 부분에 null이 들어오면 주의를 주어 사전에 에러를 예방하거나, 실행이 되지 않도록 프로그램을 구성할 수 있다.



```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    RedEventService eventService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String event = eventService.createEvent(null);
    }
}

```

null 이 들어가면 안되는 자리인데, 아무 주의도 주지 않는다.

Intellij > Preference (`⌘ + ,`) > Compiler > Configure annotations... 설정을 들어간다.

Nullable Annotations에는 스프링 Nullable, NotNull Annotations 에는 스프링 NonNull을 추가해주면 된다.

인텔리제이를 재시작하고, null에 커서를 대면 주의사항을 보여주게 된다.





`@NonNullApi` 는 아래와 같이 package-info.java 파일에 등록해서 사용하면 전체 패키지에 NonNull 이 적용된다.

```java
@NonNullApi
package me.wordbe.springgoahead;

import org.springframework.lang.NonNullApi;
```













