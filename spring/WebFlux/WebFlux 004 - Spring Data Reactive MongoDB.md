# WebFlux 004 - Spring Data Reactive MongoDB



프로젝트 구축

- product-service : NoSQL → Spring Data Reactive MongoDB
- user-service : RDBMS → R2DBC (Reactive Driver for Relational DB)
- order-service → Spring Data JPA




## Producer-Service

- product-service
- productDto
- embedded MongoDB → MongoDB 설치



## Spring Data Reactive MongoDB

| Blocking Drvier | Reactive Driver |
| --------------- | --------------- |
| Optional<T>     | Mono<T>         |
| List<T>         | Flux<T>         |
| long (count)    | Mono<Long>      |
| boolean         | Mono<Boolean>   |

