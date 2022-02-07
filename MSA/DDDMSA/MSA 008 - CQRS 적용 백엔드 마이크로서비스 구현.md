# MSA 008 - CQRS 적용 백엔드 마이크로서비스 구현

# 1 도서 마이크로서비스 개발

- 입고 도서 등록
- 재고 도서 등록
- 재고 도서 변경

- 내부 아키텍처 결정
- API 설계
- 도메인 모델링
- 유스케이스 흐름

## 내부영역 - 도메인 모델 개발

- 값 객체를 도입하면 도메인 모델의 표현력이 증가하고, 무결성이 유지되며, 잘못된 대입을 막을 수 있고, 로직이 코드의 이곳저곳에 흩어지는 것을 방지하는 등 장점이 많다.
  - `@Embeddable`, `@Embbeded`

## 내부영역 - 서비스 개발, 레포지토리 개발

## 외부영역 - REST 컨트롤러 개발

- 재고 도서 정보 조회
- 입고 도서 등록, 수정, 삭제
- 재고 도서 등록, 수정, 삭제

## 외부영역 - 아웃바운드 어댑터 개발

```java
@Service
public class BookProducerImpl implements BookProducer {
    ...
    public void sendBookCreateEvent(BookChanged bookChanged) throws ExecutionException, InterrupedException, JsonProcessingException {
        String message = objectMapper.writeValueAsString(bookChanged);
        producer.send(new ProducerRecord<>(TOPIC_CATALOG, message)).get();
    }
    
    public void sendBookDeleteEvent(BookChanged bookDeleteEvent) throws ExecutionException, InterrupedException, JsonProcessingException {
        String message = objectMapper.writeValueAsString(bookDeleteEvent);
        producer.send(new ProducerRecord<>(TOPIC_CATALOG, message)).get();
    }
}
```



## 외부영역 - 인바운드 어댑터 개발

- 도서 마이크로서비스는 대출, 반납아이템 정보 메시지를 수신해서 재고 도서 대출 가능 상태를 업데이트한다.
- 발행된 비동기 메시지를 수신하는 것은 인바운드 컨슈머 어댑터로 구현한다.

```java
@Service
public class BookConsumer {
    ...
    public static final String TOPIC = "topic_book";
    
    @PostConstruct
    public void start() {
        log.info("kafka consumer starting...");
        this.kafkaConsumer = new KafkaConsumer<>(kafkaProperties.getConsumerProps());
        Runtime.getRuntime().addShutdownHook(new Thread(this::shutdown));
        
        // 토픽 구독
        kafkaConsumer.subscribe(Collections.singleton(TOPIC));
        log.info("kafka conuser started");
        
        executorService.execute(() -> {
            try {
                while (!closed.get()) {
                    ConsumerRecords<String, String> records = kafkaConsumer.poll(Duration.ofSeconds(3));
                    
                    for (ConsumerRecord<String, String> record: records) {
                        log.info("consumed message in {} : {}", TOPIC, record.value());
                        StockChanged stockChanged = new ObjectMapper().readvalue(record.value(), StockChanged.class);
                        // 도서 서비스 호출, 매개변수로 도서 일련번호, 도서 상태 전달
                        bookService.processChangeBookState(stockChanged.getBookId(), stocChanged.getBookStatus());
                    }
                }
                kafkaConsumer.commitSync();
            } catch (WakeupException e) {
                if (!closed.get()) throw e;
            } catch (Exception e) {
                log.error(e.getMessage, e);
            } finally {
                log.info("kafka consumer close");
                kafkaConsumer.close();
            }
        });
    }
}
```

- 컨슈머 어댑터는 대출 서비스가 발송한 메시지의 토픽을 구독하며, 메시지를 폴링(polling) 한다.

<br />

# 2 도서 카탈로그 마이크로서비스

- 도서 목록 조회와 검색을 위한 읽기 전용 마이크로서비스
- 도서 마이크로서비스와 함께 CQRS 패턴 적용
- 저장소는 조회, 검색 속도가 빠른 MongoDB 사용
- 도서 마이크로서비스에서 발행한 도서변경됨(`BookChanged`) 도메인 이벤트 메시지를 수신해서 도서 카탈라고 저장소를 동기화

- 기능 소개
- 내부 아키텍처 결정
- API 설계
- 도메인 모델링
  - 도서 카탈로그 엔티티 하나
  - 엔티티이자 애그리거트루트

## 내부영역 - 도메인 모델 개발

- MongoDB 이므로 `@Entity` 대신 `@Document`
- API 는 조회 만 있음
- 다른 서비스의 비동기 메시지 요청에 따라 데이터 일관성을 맞추기 위해 생성, 변경 기능 제공. 컨슈머 어댑터에 의해 호출된다.

## 내부 영역 - 서비스 개발, 리포지토리 개발

```java
@Repository
public interface BookCatalogRepository extends MongoReposiotry<BookCatlog, String> {
    Page<BookCatalog> findByTitleContaining(String title, Pageable pageable);
    
    List<BookCatalog> findTop10ByOrderByRentCntDesc();
}
```

- 쿼리메서드 사용

## 외부영역 - REST 컨트롤러 개발

- `/book-catalogs/top-10`

## 외부영역 - 인바운드 어댑터 개발

![](https://i.ibb.co/m4k5QfP/image.png)

- 도서 카탈로그 마이크로서비스의 컨슈머 어댑터에서 받는 `BookChanged` 이벤트 유형은 4가지이다. (생성, 수정, 삭제, 상태변경)
- 메시지 수신한뒤 `BookCatalogService` 의 각긱 다른 메서드를 호출한다.





