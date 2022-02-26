# WebFlux 005 - Spring Data R2DBC



# R2DBC

- R2DBC 는 JPA 가 아니다
  - Reactive Relational Database Connectivity
- early stage
- Hibernate 와는 다르다.
- 지원되는 DB
  - h2
  - MariaDB
  - MS SQL Server
  - MySQL
  - jasync-sql MySQL
  - postgreSQL

https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#r2dbc.drivers



# R2DBC Drivers

- h2 : `r2dbc:h2:mem:///userdb`
- postgres : `r2dbc:postgresql://username:password@localhost:5432/userdb`
- mysql : `r2dbc:mysql://localhost:3306/userdb`



PostgreSQL DDL

```sql
create table users (
    id serial primary key,
    name varchar(50),
    balance int
);

create table user_transaction (
    id serial primary key,
    user_id bigint,
    amount int,
    transaction_date timestamp,
	constraint fk_user_id
		foreign key (user_id) 
		references users(id) 
		on delete cascade
);
```









