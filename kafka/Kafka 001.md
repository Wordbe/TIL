# Kafka 001



# Kafka

- 소스 애플리케이션으로부터 타겟 애플리케이션으로 데이터 전송 중개
- 카프카 토픽은 큐(producer → topic → consumer)
- 낮은 지연시간, 높은 처리량





# Kafka Topic

## 토픽의 구성

```shell
# kafka topic
click_log
send_sms
location_log
```

- 하나의 토픽은 여러 개의 파티션으로 구성가능
- 토픽은 큐 구조이고, producer 가 데이터를 하나씩 보내면 큐에 record 가 쌓인다.
- FIFO 방식으로 consume 된다.
- consumer 가 record 를 가져가도 데이터가 삭제되지 않고 파티션에 남는다.
- 새로운 컨슈머가 토픽에 붙는다면 record 0번 부터 다시 가져갈 수 있다.
  - 다만, 컨슈머 그룹이 다르고, `auto.offset.reset=earliest` 옵션으로 설정되어 있어야 한다.
  - 이렇게 동일 데이터를 2번 처리할 수 있다는 장점이 카프카를 사용하는 중요한 이유기도 하다.



## 토픽이 2개 이상 있는 경우

- producer 로부터 들어가는 데이터는 '키' 를 정하지 않았다면 (null) 라운드 로빈으로 번걸아 할당된다.
- 키를 지정해주었고 기본 파티셔너를 사용한다면, 키의 해시값을 구하고 특정 파티션에 할당된다.

## 파티션

- 파티션은 늘릴 수는 있으나 줄일 수는 없으므로 주의해야 한다.
- 파티션을 늘리면 컨슈머를 늘려서 데이터 처리를 분산시킬 수 있다.

## 파티션의 레코드 삭제

- 최대 레코드 보존 시간 `log.retention.ms`
- 최대 레코드 보존 크기 (byte) : `log.retention.byte`



<br />

# Kafka Producer



- 데이터를 생성하는 역할
- 특정 토픽으로 데이터를 publish 할 수 있다.
- kafka broker 로 데이터 전송할 때 전송 성공여부를 알 수 있고, 실패 시 재시도를 할 수 있다.

```groovy
// gradle
compile group: 'org.apache.kafka', name: 'kafka-clients', version: '2.3.0'
```

- 주의사항으로 broker 와 client 의 하위호환성을 숙지해야 한다.



## 카프카 프로듀서

```java

Properties configs = new Properties();
configs.put("bootstrap.servers", "localhost:9092");
configs.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
configs.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

KafkaProducer<String, String> producer = new KafkaProducer<>(configs);
ProducerRecord record = new ProducerRecord<String, String>("click_log", "1", "login"); // key 없이 전송가능 ("1" 제거)
producer.send(record);
producer.close();
```

- 카프카 브로커의 주소 목록은 두 개 이상의 ip, port 를 설정하는 것을 권장 (HA 확보)
- 직렬화는 Byte array, String, Integer 시리얼라이즈를 사용할 수 있다.
- 키 : 토픽의 파티션을 지정할 때 사용한다. (해시값을 계산한 후 특정 파티션에만 들어가게 할 수 있다.)
  - 토픽에 파티션을 추가하면, 키가 동일한 파티션으로 들어간다는 보장을 할 수 없다.
- producer record 인스턴스를 생성할 때, 어떤 토픽에 담을 것인지, 어떤 key, value 를 담을 것인지 선언한다.



<br />

# Broker, Replication, ISR

## Broker

- 복제는 핵심이다. 클러스터에서 서버가 장애가 생길 때 가용성을 보장하는 가장 좋은 방법이 복제이기 때문이다.
- Kafka 브로커는 카프카가 설치되어 있는 서버 단위를 말한다.
- 보통 3개 이상 브로커를 구성한다.

## Replication

- 파티션의 복제를 뜻한다.
- partition 1개에 replication 1 이면, 원본 1개만 존재한다.
- partion 1개에 replication 3으로 설정되어 있다면, 원본 1개와 복제본 2개가 각각 브로커에 저장된다.
  - Leader partition : 원본 1개
  - Follower partition : 나머지 2개
  - 원본, 복제본을 합쳐서 ISR 이라고 부른다.
- 브로커의 개수보다 replication 수가 많을 수는 없다.

## ISR

- In Sync Replica
- 원본 + 복제본

<br />

## Replication 과 ack

- Producer 는 토픽을 생성해서 리더 파티션에게 보낸다.

- 전달 할 때는 ack 옵션이 있는데, 0, 1, all 옵션이 있다.

  - 0 : 프로듀서는 리더파티션에 데이터를 전송하고 응답값을 받지 않는다.

    - 리더파티션에 잘 전달되었고, 팔로워 파티션에 잘 복제되었는지 알 수 없고, 보장할 수 없다.
    - 속도는 빠르지만 데이터 유실 가능성이 있다.

  - 1 : 리더 파티션에 전달 여부는 응답값으로 받지만, 복제여부는 전달받지 못한다.

    - 리더 파티션은 데이터를 잘 받았지만, 그 후 브로커가 장애가 난다면 복제가 잘 이루어지지 않을 수 있으므로 데이터 유실 가능성이 생긴다.

  - all : leader, follower 응답 모두 전달받는다.

    - 데이터 유실은 없다.

    - 모든 브로커를 확인해야 하므로 속도가 느리다.

      ![](https://i.ibb.co/8cZxSjs/2022-01-25-9-23-04.png)



## Replication count

- replication 이 많아지면 안정적이지만, 브로커의 리소스 사용량도 많아진다.
- 카프카로 들어오는 데이터량과 retention date (저장시간) 을 고려하여 replication 수를 정하는 것이 좋다.
- 3개 이상의 브로커 사용시 replication 은 3을 추천한다.



<br />



# Kafka Consumer

## Consumer 역할

- Topic 의 partition 으로부터 데이터 polling

  - 메시지를 가져와서 특정 DB 에 저장하거나 또 다른 파이프라인으로 전달한다.

- 파티션 offset 위치 기록 (commit)

  - 오프셋이란 파티션에 있는 데이터번호
  - 토픽 별로, 파티션 별로 따로 지정된다. 
  - 컨슈머가 어느지점까지 읽었는지 확인하는 용도로 활용된다.
  - 컨슈머가 poll 로 데이터를 가져가면, `__consuemr_offsets` 토픽에 읽었던 offset 정보를 저장한다.
    - 따라서 컨슈머에 장애가 발생해도, 중지된 위치부터 다시 복구하여 데이터 처리를 할 수 있다. (HA)

- Consumer group 을 통해 병렬처리

  - 병렬처리 한다면, 파티션 개수보다 적거나 같은 개수로 컨슈머를 설정한다.
  - 나머지 컨슈머는 놀게 된다.

  ![](https://i.ibb.co/bFmydyT/2022-01-25-11-32-50.png)

  - 또한 컨슈머 그룹이 여러개라면, `__consumer_offsets` 도 별개로 저장된다.
  - 컨슈머 그룹별로, 토픽별, 파티션별로 저장된다.

  ![](https://i.ibb.co/S6fX95F/2022-01-25-11-35-13.png)



<br />

## Kafka consumer - java

```groovy
// gradle
compile group: 'org.apache.kafka', name: 'kafka-clients', version: '2.3.0'
```

- kafka client 가 kafka broker 와 호환가능한 버전인지 반드시 확인한다.



```java
Properties configs = new Properties();
configs.put("bootstrap.servers", "localhost:9092");
configs.put("group.id", "click_log_group");
configs.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
configs.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(configs);

consumer.subscribe(Arrays.asList("click_log")); // topic 전체를 가지고 온다.
// 해당 topic 의 특정 partition 만 가지고 오려면 아래와 같이
// TopicPartition partition0 = new TopicPartition(topicName, 0);
// TopicPartition partition1 = new TopicPartition(topicName, 1);
// consumer.assign(Arrays.asList(partition0, partition1));

while(true) {
  ConsumerRecords<String, String> records = consumer.poll(500);
  for (ConsumerRecord<String, String> record: records) {
    System.out.println(record.value());
    // 이 곳에서 다른 DB 에 저장하는 로직을 넣는다.
  }
}
```

- 가용성을 늘리기 위해 여러 브로커를 등록하는 것을 권장

- 컨슈머 그룹(`group.id`) : 컨슈머 묶음

- 폴링 루프 : poll 메소드가 포함된 루프

  - 컨슈머가 허락하는 한 많은 데이터를 읽는다.
  - 500ms 동안 데이터가 들어오길 기다리고, poll 실행된다.
    - 데이터가 들어오지 않는다면, 빈 값을 반환하고 records 는 빈 값으로 저장된다.

  ​



