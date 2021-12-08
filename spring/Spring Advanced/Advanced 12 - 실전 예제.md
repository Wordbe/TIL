# Advanced 12 - 실전 예제



```java
@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;

    @Trace
    public void request(String itemId) {
        examRepository.save(itemId);
    }
}
```

```java
@Repository
public class ExamRepository {
    private static int seq = 0;

    /**
     * 5번에 1번 실패하는 요청
     */
    @Trace
    @Retry(value = 4)
    public String save(String itemID) {
        seq++;
        if (seq % 5 == 0)
            throw new IllegalStateException("예외 발생");
        return "ok";
    }
}
```





# 로그 출력 AOP

- `@Trace` : 어노테이션으로 로그 출력하기

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Trace {
}
```

```java
@Slf4j
@Aspect
public class TraceAspect {

  @Before("@annotation(co.wordbe.springaop.exam.annotation.Trace)")
  public void doTrace(JoinPoint joinPoint) {
    Object[] args = joinPoint.getArgs();
    log.info("[trace] {}, args: {}", joinPoint.getSignature(), args);
  }
}
```

```java
@Slf4j
@Import({TraceAspect.class})
@SpringBootTest
class ExamServiceTest {

  @Autowired
  ExamService examService;

  @Test
  void test() {
    for (int i=0; i<5; i++) {
      log.info("client request i={}", i);
      examService.request("data" + i);
    }
  }
}
```

- ExamService, ExamRepository 메소드에 `@Trace` 어노테이션을 붙여 AOP 를 적용한다.

# 재시도 AOP

- `@Retry` : 어노테이션으로 예외 발생시 재시도 하기

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Retry {
    int value() default 3;
}
```

```java
@Slf4j
@Aspect
public class RetryAspect {

  @Around("@annotation(retry)")
  public Object doRetry(ProceedingJoinPoint joinPoint, Retry retry) throws Throwable {
    log.info("[retry] {}, retry: {}", joinPoint.getSignature(), retry);

    int maxRetry = retry.value();
    Exception exceptionHolder = null;

    for (int retryCount=1; retryCount<=maxRetry; retryCount++) {
      try {
        log.info("[retry] try count={}/{}", retryCount, maxRetry);
        return joinPoint.proceed();
      } catch (Exception e) {
        exceptionHolder = e;
      }
    }
    throw exceptionHolder;
  }
}
```

```java
@Slf4j
@Import({TraceAspect.class, RetryAspect.class})
@SpringBootTest
class ExamServiceTest {

  @Autowired
  ExamService examService;

  @Test
  void test() {
    for (int i=0; i<5; i++) {
      log.info("client request i={}", i);
      examService.request("data" + i);
    }
  }
}
```

- ExamRepository 메소드에 `@Retry` 어노테이션을 붙여 AOP 를 적용한다.

> 참고 : 스프링이 제공하는 `@Transactional` 은 가장 대표적인 AOP 이다.