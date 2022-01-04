# Redis with Spring WebFlux 001


배울 것

- Scalable, Performant Reactive Microservices
- Redis + 다양한 데이터 구조
- Redis + Spring WebFlux

목차

- Redis
- Redisson
- Spring WebFlux Caching
- Spring WebFlux & Redis : Performance
- Trending Service
- Chat Application With WebSocket
- Redis Authentication
- GeoSpatial Application - Restaurant Locator



## Redis 는 왜 필요한 것인가?

1. Network Call 이 반복된다. → 캐싱
2. Heavy Computation 반복 → 캐싱
3. External API → 자주 사용되는 API 를 분석해서 비용을 줄이자.
4. Trending Info → 실시간 트렌드 데이터

---

# Redis

- 빠르다 (ms)
- MySQL 보다 빠르다.
- 인메모리 DB 이다.
- Multi-purpose Data-Structure Server
- 유즈케이스
  - Caching
  - Pub/Sub
  - Message Queue
  - Streaming
  - GeoSpatial

  <br />
-   Free, Open Source
-   redis.io
-   redislabs.com (상업적인 클라우드 서비스, MongoDB 의 atlas 같은 것)


## Redis Server / CLI
redis-cli → redis server (6379)

## Redis Key-value
- 키, 밸류 둘 다 simple string  (숫자를 저장해도 스트링으로 저장된다.)
- 2^32 keys (40억)
- 512MB 최대 사이즈

```shell
set key value
get key

set a b
OK
get a
"b"
get c
(nil)
set somekey "some value"
```

- 레디스에는 table / collection 개념이 없다.
- 키 이름을 표준으로 하길 권한다.
```shell
set user:1:name sam
set user:2:name jake
```

### 키에 관한 명령
```shell
keys *

# 이런식으로 필요한 키만 찾는 것을 추천
keys user*

# 키를 페이지네이션해서 준다.
scan 0
1) next page
2) 키들 나열

# 매칭
scan 0 match user*

# 갯수
scan 0 match user* count 3

# 키 삭제 (결과로 삭제된 개수가 나옴)
del user:1:name
(integer) 1

del user:1:name user:2:name
(integer) 2

# 모든 키 삭제
flushdb

# 키 만료시간 설정
# 10초후에 키 a는 만료된다.
set a b ex 10

# 키 만료시간 조회 (time to live)
ttl a
(integer) 7

# 만료시간 부여
# 키 a에 60초 만료시간 부여
expire a 60
```

- 키에 만료시간을 부여하는 것은 다양한 용도로 활용될 수 있다.

예) 영화 극장표 선택시  
- 한 사람이 자리를 선택했을 때 다른 사람은 이 자리를 선택하지 못하게 한다.  
- 좌석 선택 후 10분의 만료시간 동안은 다른 사람이 해당 키에 접근하지 못하게 로직을 만든다.  
- 결제가 되었다면 좌석은 지정이 되고, 결제가 안되었다면 그 키는 만료되고 해당 좌석에 다른 키가 매핑된다.
  ![](https://i.ibb.co/hd4N2nQ/2021-12-30-1-27-55.png)


```shell
# 특정 시간이 되면 만료
set a b exat 1624737950

# millisecond 단위 만료
# 3초 후 만료
set a b px 3000

# 만료기간이 설정된 키의 값을 바꾸면 만료시간은 사라진다.
set a b ex 60
ttl a
set a c
ttl a
get a

# 아래와 같이 keepttl 하면 값을 바꾸면서 만료시간도 유지한다.
set a c keepttl

# xx : 키가 존재할 때만
set a b xx
(nil)

# nx : 키가 존재하지 않을 때만
set a b nx
OK
set a c nx
(nil)
set a c xx
OK

# 존재하는지 확인
set user:1:session token ex 60
exists user:1:session
(integer) 1

# 60초후 만료..
exists user:1:session
(integer) 0
```


<br />

## 값에 관한 명령

```shell
# 값이 숫자형 문자열이라면, 값을 증가/감소 시킬 수 있음
set a 1
OK
incr a
(integer) 2
incr a
(integer) 3

decr a
(integer) 2

incr a 20
(integer) 22

decrby a 10
(integer) 12

# 소수를 증가시키기
set a 1.02
OK

incrbyfloat a .3
"1.32"

incrbyfloat a -.3
"1.02"
```


### Redis Cheet Sheet
[cheet sheet](https://cheatography.com/tasjaevan/cheat-sheets/redis/)


<br />

## 게임 예제
![](https://i.ibb.co/HpLbY2v/2021-12-30-2-06-44.png)

- 유저가 30분 동안 3개의 목숨이 있는 것을 Redis로 구현한다면?

```shell
# 초기 세팅
set user:1:lives 3 ex 1800

# 죽을 때 마다
decr user:1:lives
(integer) 2

decr user:1:lives
(integer) 1

decr user:1:lives
(integer) 0
```

### Rate Limit

외부 API 를 콜해야 하는 상황인데, expensive 하다.
따라서 10분에 100 콜만 가능하다.
이를 Redis 에서 관리할 수 있다.
```shell
# 한 유저는 10분에 100콜가지만 가능하도록 설정
set user:1:api 100 ex 600

# API 한번 요청할 때마다 1개 감소
decr user:1:api
```


<br/>



## Hash

- Set / Get
- Object 에 포함된 field 를 저장한다.
- Object 의 각각의 field 에 접근하고 업데이트할 수 있다.

```shell
# Hash
hset user:1 name sam age 10 city altlanta
(integer) 3

type user:1
hash

# key, field 를 입력하여 get 할 수 있다.
hget user:1 name
"sam"

heget user:1 age
"10"

# 모든 필드 가져오기
hgetall user:1

# 2개 field를 가진 object
hset user:2 birthYear 2020 status active

hkeys user:1

hvals user:1

hexists user:1 status

# 필드 삭제
hdel user:1 age

# 오브젝트 삭제
del user:1
```

<br />

## List (Queue)

- 순서가 있는 콜렉션
- 자바 LinkedList 와 비슷
- Queue: FIFO / Stack: LIFO 로 사용가능
- **Use cases : 레디스 리스트는 Message Queue로 사용할 수 있음.**

```shell
# right side push (left side push도 가능)
rpush users sam mike jake
(integer) 3
 
type users
list
 
# list length
llen users
(integer) 3

# list range
lrange users 0 -1
1) "sam"
2) "mkie"
3) "jake"

lrange users 0 1
1) "sam"
2) "mkie"

# pop
lpop users
"sam"

rpush users 1 2 3 4 5 6
(integer) 6

llen users
(integer) 6

lpop users
"1"

lpop users 2
1) "2"
2) "3"


```



이제 레디스를 메시지 큐처럼 사용해보자.

![](https://i.ibb.co/0Z6j5Fj/2021-12-30-10-02-44.png)

<br />

## List As Stack

```shell
rpush users 1 2

rpush users 3 4

rpush users 5

rpush users 6

lrange users 0 -1

rpop users
"6"

rpop users
"5"

rpop users
"4"


```



<br />

## Set

- 순서 없는 unique 아이템이 담긴 콜렉션
- Use cases:
  - 사용자 중 현재 로그인한 사용자 유지
  - IP 주소 / 유저 블랙리스트 유지
  - Set Intersection

```shell
# 추가
sadd users 1 2 3

sadd users 4

sadd users 5

# cardinality
scard users
(integer) 5

# 셋 안에 모든 원소 조회
smembers users

# 멤버인지 조회
sismember users 5
(integer) 1

# 삭제
srem users 5

# 임의로 아무원소 삭제
spop users
```



### Set Intersection & Union

```shell
sadd skill:java 1 2 3 4

sadd skill:js 2 3 4

sadd skill:aws 4 5 6

# 교집합
sinter skill:java skill:js skill:aws
1) "4"

# 합집합
sunion skill:java skill:js
1 2 3 4

# 차집합
sdiff skill:java skill:js
1) "1"

sinterstore java-js skill:java skill:js
smembers java-js

```

<br />

### Use cases

주문서비스에서 가짜 신용 카드를 구별하는데 사용

- Credit card

![](https://i.ibb.co/c8ZC2Gh/2021-12-31-1-48-05.png)

<br />

## Redis Sorted Set

- 순서가 있는 unique 아이템
- Use Cases:
  - 우선순위 큐
  - 영화 평점 순위 / 상품 순위
  - 자주 방문한 페이지

```shell
# sorted set
zadd 키 스코어 아이템

zadd products 0 books

zadd products 0 iphone 0 tv

# cardinality
zcard products

# 스코어 증가
zincrby products 1 books

# 전부 조회 (스코어 오름차순)
zrange products 0 -1

# 스코어와 같이 조회
zrange products 0 -1 withscores

# 맨 마지막 조회 (스코어 가장 높은 것)
zrange products -1 -1

# 맨 마지막 조회 (스코어 가장 높은 것)
zrange products 0 0 rev

# books의 순위
zrank products books

zrank products iphone

# 역순위
zrevrank products iphone

# 스코어 조회
zscore products iphone

# 스코어 가장 높은 것 삭제
zpopmax products

zcard products


```

### Redis Sorted Set as Priority Queue

![](https://i.ibb.co/2Y86KkP/2021-12-31-2-02-01.png)

prime 배송을 non-prime 보다 항상 더 앞에 둘 수 있다.

<br />

---

## Redis - Single Thread

- 레디스는 싱글스레드로 작동하며, 모든 요청에 대해 한 **트랜잭션** 단위로 실행하여 커밋된다.

### multi

- multi - begin transaction
- execute - commit

```shell
set user:1:balance 1
OK
set user:2:balance 0
OK
get user:1:balance
"1"

decr user:1:balance
incr user:2:balance

flushdb
---

set user:1:balance 1
set user:2:balance 0

# 1번 터미널
# 트랜잭션 모드
multi
(TX)> decr user:1:balance
QUEUED
(TX)> incr user:2:balance
QUEUED

# 다른 터미널에서 한 번 더
# 2번 터미널
multi
(TX)> decr user:1:balance
QUEUED
(TX)> incr user:2:balance
QUEUED

(TX)> exec
1) (integer) 0
2) (integer) 1

# 1번 터미널
(TX)> exec
1) (integer) -1
2) (integer) 2
```

- 2번 트랜잭션에서 변경된 값이 1번 트랜잭션에 반영되어서 계산된다.
- 레디스는 이렇게 자동으로 변경된 데이터를 다른 트랜잭션에도 반영시켜준다.



### watch (트랜잭션 유지)

- watch 로 감시 중인 키는 1번 트랜잭션에서 연산 중인데, 2번 트랜잭션에서 해당 키를 수정한 후 execute 했을 때, 1번 트랜잭션은 revert 된다.

```shell
watch user:1:balance user:2:balance
OK

# 1번 터미널
multi
OK
(TX)> decr user:1:balance
QUEUED
(TX)> incr user:2:balance
QUEUED

# 2번 터미널
multi
OK
(TX)> decr user:1:balance
QUEUED
(TX)> incr user:2:balance
QUEUED
(TX)> exec
1) (integer) 0
2) (integer) 1

# 1번 터미널
(TX)> exec
(nil)
```



### discard (rollback)

- multi 에서 실행했던 작업을 취소할 때 사용한다.

<br />



## Saving Data on Disk

predefined state - 레디스도 상태를 미리 정의할 수 있다.

```shell
set user:1:balance 1
set user:2:balance 0

# 백그라운드 저장
bgsave
Background saving started
```

- `/data` 에 `dump.rdb` 파일이 생성된다.















