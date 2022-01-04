# Redis with Spring WebFlux 002 - Redisson



## Java 라이브러리

- Jedis
  - 빠르다
  - Thread-safe 하지 않아서 사용 잘 안한다.
- Lettuce (4k stars, 유지보수중)
  - scalable, reactive-streams 지원
  - Spring Data Redis 와 함께 사용한다. (ReactiveCRUDRepository 는 없다.)
  - Low level API 지원
- **Redisson (16k stars, 유지보수중)**
  - scalable, reactive-streams 지원
  - Spring Data Redis 와 함께 사용한다. (ReactiveCRUDRepository 는 없다.)
  - 추상화가 잘 되어 있다. (레디스 자료구조를 자바 자료구조 사용하듯이 사용할 수 있다.)
  - 좋은 피쳐, 문서화가 잘되어 있다.


---

# Redis Test

## 설정

```xml
<dependencies>
  <dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.16.7</version>
  </dependency>

  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>

  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>

  <dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>io.projectreactor</groupId>
      <artifactId>reactor-bom</artifactId>
      <version>2020.0.14</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

자바 테스트 기본 설정

```java
public class RedissonConfig {
  private RedissonClient redissonClient;

  public RedissonClient getClient() {
    if (isNull(redissonClient)) {
      Config config = new Config();
      config.useSingleServer()
        .setAddress("redis://127.0.0.1:6379");
      redissonClient = Redisson.create(config);
    }
    return redissonClient;
  }

  public RedissonReactiveClient getReactiveClient() {
    return getClient().reactive();
  }
}
```

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseTest {

  private final RedissonConfig redissonConfig = new RedissonConfig();
  protected RedissonReactiveClient client;

  @BeforeAll
  public void setClient() {
    this.client = this.redissonConfig.getReactiveClient();
  }

  @AfterAll
  public void shutdown() {
    this.client.shutdown();
  }
}
```



## KeyValue 테스트

키에 접근 가능한지, 만료되는지, 만료되기 전 연장할 수 있는지 테스트한다.

```java
public class KeyValueTest extends BaseTest {

  @Test
  public void keyValueAccess() {
    RBucketReactive<String> bucket = this.client.getBucket("user:1:name", StringCodec.INSTANCE);
    Mono<Void> set = bucket.set("sam");
    Mono<Void> get = bucket.get()
      .doOnNext(System.out::println)
      .then();
    StepVerifier.create(set.concatWith(get))
      .verifyComplete();
  }

  @Test
  public void keyValueExpiry() {
    RBucketReactive<String> bucket = this.client.getBucket("user:1:name", StringCodec.INSTANCE);
    Mono<Void> set = bucket.set("sam", 5, TimeUnit.SECONDS);
    Mono<Void> get = bucket.get()
      .doOnNext(System.out::println)
      .then();
    StepVerifier.create(set.concatWith(get))
      .verifyComplete();
  }

  @Test
  public void keyValueExtendExpiry() {
    RBucketReactive<String> bucket = this.client.getBucket("user:1:name", StringCodec.INSTANCE);
    Mono<Void> set = bucket.set("sam", 5, TimeUnit.SECONDS);
    Mono<Void> get = bucket.get()
      .doOnNext(System.out::println)
      .then();
    StepVerifier.create(set.concatWith(get))
      .verifyComplete();

    // extend
    sleep(3000);
    Mono<Boolean> mono = bucket.expire(60, TimeUnit.SECONDS);
    StepVerifier.create(mono)
      .expectNext(true)
      .verifyComplete();

    // access expiration time
    Mono<Void> ttl = bucket.remainTimeToLive()
      .doOnNext(System.out::println)
      .then();
    StepVerifier.create(ttl)
      .verifyComplete();
  }
}
```

- 버킷은 레디스 value의 Object 와 대응한다.

<br />

## KeyValueObject 테스트

- binary 형태가 애플리케이션 성능에는 더 좋을 것이다.
- 하지만, 데이터 확인을 위해 객체를 스트링으로 바꾸어 레디스 value 에 저장할 것이다.

Dto 객체 먼저 하나 만들어준다.

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Student {
  private String name;
  private int age;
  private String city;
  private List<Integer> marks;
}
```

```java
public class KeyValueObjectTest extends BaseTest {

  @Test
  public void keyValueObject() {
    Student student = Student.builder()
      .name("marshal")
      .age(10)
      .city("atlanta")
      .marks(Arrays.asList(1, 2, 3))
      .build();

    RBucketReactive<Object> bucket = client.getBucket("student:1", new TypedJsonJacksonCodec(Student.class));
    Mono<Void> set = bucket.set(student);
    Mono<Void> get = bucket.get()
      .doOnNext(System.out::println)
      .then();
    StepVerifier.create(set.concatWith(get))
      .verifyComplete();
  }
}
```

<br />



## 만료된 이벤트 리스너

**Notify-keyspace-events**

레디스로 이벤트가 발생했을 때 서버 → 레디스로 알람을 전송할 수 있다.

이를 java 로 설정할 수 있는데, bucket 에 addListener 로 리스너를 추가해주면 된다.

또한 레디스는 기본적으로 알람이 비활성화되어 있으므로, redis-cli 나 redis.conf 파일에 알람 설정을 해야 한다.

https://redis.io/topics/notifications#configuration

```shell
K     Keyspace events, published with __keyspace@<db>__ prefix.
E     Keyevent events, published with __keyevent@<db>__ prefix.
g     Generic commands (non-type specific) like DEL, EXPIRE, RENAME, ...
$     String commands
l     List commands
s     Set commands
h     Hash commands
z     Sorted set commands
t     Stream commands
d     Module key type events
x     Expired events (events generated every time a key expires)
e     Evicted events (events generated when a key is evicted for maxmemory)
m     Key miss events (events generated when a key that doesn't exist is accessed)
A     Alias for "g$lshztxed", so that the "AKE" string means all the events except "m".
```

우리는 아래 명령어로, m 을 제외한 모든 이벤트에 대해 알람을 받도록 설정한다.

```shell
config set notify-keyspace-events AKE
```

이렇게 해 놓고, 자바 프로그래밍을 해보자.

```java
public class Redisson05ExpiredEventTest extends BaseTest {
  @Test
  public void expiredEventThenNotify() {
    // Redis-cli
    // config set notify-keyspace-events AKE 하여 알람 등록.

    RBucketReactive<Object> bucket = client.getBucket("user:1:name", StringCodec.INSTANCE);
    Mono<Void> set = bucket.set("sam", 5, TimeUnit.SECONDS);
    Mono<Void> get = bucket.get()
      .doOnNext(System.out::println)
      .then();
    Mono<Void> event = bucket.addListener(new ExpiredObjectListener() {
      @Override
      public void onExpired(String s) {
        System.out.println("Expired: " + s);
      }
    }).then();

    StepVerifier.create(set.concatWith(get).concatWith(event))
      .verifyComplete();

    // wait for expired event
    sleep(10000);
  }
}
```

<br />

## 삭제된 이벤트 리스너

```java
@Test
public void deletedEventThenNotify() {

  RBucketReactive<Object> bucket = client.getBucket("user:1:name", StringCodec.INSTANCE);
  Mono<Void> set = bucket.set("sam");
  Mono<Void> get = bucket.get()
    .doOnNext(System.out::println)
    .then();
  Mono<Void> event = bucket.addListener(new DeletedObjectListener() {
    @Override
    public void onDeleted(String s) {
      System.out.println("Deleted: " + s);
    }
  }).then();

  StepVerifier.create(set.concatWith(get).concatWith(event))
    .verifyComplete();

  // wait for expired event
  sleep(10000);
}
```

- 위 프로그램을 실행 해놓은 상태로, 10초안에 (sleep 을 10초했으므로) 레디스에서 `user:1:name` 이 삭제되면 이벤트 리스너가 동작한다.

```shell
# redis-cli
del user:1:name
```

```shell
# spring, redisson console
sam
Deleted: user:1:name
```

<br />

## Redis Hash → Redisson Map

```java
@Test
public void reactorMap() {
  RMapReactive<String, String> map = client.getMap("user:1", StringCodec.INSTANCE);
  Mono<String> name = map.put("name", "sam");
  Mono<String> age = map.put("age", "10");
  Mono<String> city = map.put("city", "atlanta");

  StepVerifier.create(name.concatWith(age).concatWith(city).then())
    .verifyComplete();
}
```

```shell
# redis-cli
hgetall user:1
1) "name"
2) "sam"
3) "age"
4) "10"
5) "city"
6) "atlanta"
```

<br />

```java
@Test
public void javaMap() {
  RMapReactive<String, String> map = client.getMap("user:2", StringCodec.INSTANCE);
  Map<String, String> javaMap = Map.of(
    "name", "jake",
    "age", "30",
    "city", "miami"
  );
  StepVerifier.create(map.putAll(javaMap).then())
    .verifyComplete();
}
```

```shell
# redis-cli
127.0.0.1:6379> hgetall user:2
1) "age"
2) "30"
3) "city"
4) "miami"
5) "name"
6) "jake"
```

<br />

```java
@Test
public void map3() {
  // Map<Integer, Student>
  TypedJsonJacksonCodec codec = new TypedJsonJacksonCodec(Integer.class, Student.class);
  RMapReactive<Integer, Student> map = client.getMap("users", codec);
  Student student1 = Student.builder()
    .name("sam")
    .age(10)
    .city("atlanta")
    .marks(List.of(1, 2, 3))
    .build();
  Student student2 = Student.builder()
    .name("jake")
    .age(30)
    .city("miami")
    .marks(List.of(10, 20, 30))
    .build();

  Mono<Student> mono1 = map.put(1, student1);
  Mono<Student> mono2 = map.put(2, student2);

  StepVerifier.create(mono1.concatWith(mono2).then())
    .verifyComplete();
}
```

```shell
# redis-cli
127.0.0.1:6379> hgetall users
1) "1"
2) "{\"age\":10,\"city\":\"atlanta\",\"marks\":[1,2,3],\"name\":\"sam\"}"
3) "2"
4) "{\"age\":30,\"city\":\"miami\",\"marks\":[10,20,30],\"name\":\"jake\"}"
```



---

## Local Cached Map (빠르다)

하지만, 데이터가 변경되었을 때 문제가 있는데.

이 변경에대해 즉각 다른 서버의 로컬 캐시에도 반영을 해줌으로써 문제를 해결한다.

![](https://i.ibb.co/LpxxZZC/2022-01-02-12-25-17.png)



### 중요 :star:

### Sync Starategy - NONE

- 변경된 레디스 데이터를 로컬캐시에 반영하지 않는다.

### Sync Starategy - INVALIDATE

- 현재 있는 로컬캐시 데이터를 삭제 한 후, 레디스로부터 데이터를 새로 가져온다.

### Sync Starategy - UPDATE

- 변경된 레디스 데이터를 로컬캐시에 자동으로 반영한다.

<br />

### Reconnect Starategy - CLEAR

- 장애로 네트워크가 끈긴 것을 로컬캐시가 인식한다. 일단 로컬 캐시내용은 복사되어있기 때문에 예전 그대로 유지된다. 레디스로부터 데이터를 다시 다 받아온다.

### Reconnect Starategy - NONE

- 로컬캐시는 복사된 것 그대로지만, 레디스로부터 업데이트가 되지는 않는다.



```java
public class Redisson08LocalCacheMapTest extends BaseTest {

  private RLocalCachedMap<Integer, Student> studentsMap;

  @BeforeAll
  public void setupClient() {
    RedissonConfig config = new RedissonConfig();
    RedissonClient client = config.getClient();

    LocalCachedMapOptions<Integer, Student> mapOptions = LocalCachedMapOptions.<Integer, Student>defaults()
      .syncStrategy(LocalCachedMapOptions.SyncStrategy.UPDATE)
      .reconnectionStrategy(LocalCachedMapOptions.ReconnectionStrategy.NONE);
    studentsMap = client.getLocalCachedMap(
      "students",
      new TypedJsonJacksonCodec(Integer.class, Student.class),
      mapOptions);
  }

  @Test
  public void appServer1() {
    Student student1 = Student.student1();
    Student student2 = Student.student2();

    studentsMap.put(1, student1);
    studentsMap.put(2, student2);

    Flux.interval(Duration.ofSeconds(1))
      .doOnNext(i -> System.out.println(i + " ==> " + studentsMap.get(1)))
      .subscribe();

    sleep(600000); // 10분
  }

  @Test
  public void appServer2() {
    Student student1 = Student.builder()
      .name("sam-updated")
      .age(10)
      .city("atlanta")
      .marks(List.of(1, 2, 3))
      .build();
    studentsMap.put(1, student1);
  }
}
```

- sync 전략 3가지와 reconnect 전략 2가지에 따라 6가지 케이스를 모두 해볼 수 있지만, 



> LocalCacheMap 을 통해서 Config Server 를 구성할 수도 있다.
>
> - 한 서버에서 LocalCacheMap 에 마이크로서비스 전역적으로 관리하는 설정값들을 저장하고, 이 정보를 레디스에 동기화 시킨다. (`cacheMap.put(key, value)`) 
> - 다른 서버의 LocalCacheMap 은 동기화 전략을 `UPDATE` 로 가져가서 레디스의 값이 변경될때마다 해당 서버의 로컬 캐시맵도 동기화 될 수 있도록 설정한다.
> - 또한 Reconnect 전략 역시 CLEAR 로 하여 재연결시 레디스와 동기화한다.



<br />

## Message Queue



## HyperLogLog

대용량 데이터가 들어올 때 처리,

확률기반 알고리즘

- 10,000 아이템 들어온다고 가정
- 9,562 정도개만 등록되는데 이래도 괜찮다고 가정했을 때, 컴퓨팅 자원을 아낄 수 있다.



## Pub / Sub

- message queue 와 차이
  - message queue 는 producer 가 레디스에게 보내준 데이터를 각각 consumer 들이 나누어 처리한다.
  - consumer 가 없으면 queue 는 대기한다.
- pub / subscribe
  - publisher 가 발행한 메시지(토픽)는 일단 해당 토픽을 구독중인 모든 subscriber 는 다 받는다.
    - 따라서 subscriber 별로 다른 처리가 가능하다.
  - subscriber 는 특정 토픽을 지정해서 처리할 수 있다.

> LocalCacheMap 은 내부적으로 pub / sub 사용한다.

```java
public class Redisson12PubSubTest extends BaseTest {

  @Test
  public void subscriber1() {
    RTopicReactive topic = client.getTopic("slack-room", StringCodec.INSTANCE);
    topic.getMessages(String.class)
      .doOnError(System.out::println)
      .doOnNext(System.out::println)
      .subscribe();
    sleep(600_000);
  }

  @Test
  public void subscriber2() {
    RTopicReactive topic = client.getTopic("slack-room", StringCodec.INSTANCE);
    topic.getMessages(String.class)
      .doOnError(System.out::println)
      .doOnNext(System.out::println)
      .subscribe();
    sleep(600_000);
  }
}
```

subscriber 대기시켜 놓고 프로듀서로 공급해보자.

```shell
# redis-cli
publish key message

publish slack-room hi
publish slack-room "how ar you guys?"
```



아래와 같이 pattern 으로 응용할 수 있다.

```java
@Test
public void subscriber3() {
  RPatternTopicReactive patternTopic = client.getPatternTopic("slack-room", StringCodec.INSTANCE);
  patternTopic.addListener(String.class, new PatternMessageListener<String>() {
    @Override
    public void onMessage(CharSequence pattern, CharSequence topic, String msg) {
      System.out.println(pattern + " : " + topic + " : " + msg);
    }
  }).subscribe();
  sleep(600_000);
}
```

```shell
slack-room* : slack-room : hi
```

- subscriber3 는 slack-room* 패턴에 대해 모두 구독가능하다.

























