# Hive 09 - 유용한 함수

<br>

## 1 목록, 확인 명령어

하이브에 등록된 함수, 테이블, 데이터베이스를 확인하는 명령어는 `show`와 `desc` 또는 `describe`가 있습니다.

| 함수 | 설명                                                         |
| :--- | :----------------------------------------------------------- |
| show | 함수, 테이블, 데이터베이스의 목록을 확인                     |
| desc | 함수, 테이블, 데이터베이스의 설정값을 확인, extended, formatted 와 함께 사용하여 상세 설정을 확인 |

```powershell
-- 목록 확인
show databases;
show tables;
show functions;

-- 설명 확인 
desc table tbl;
desc extends tbl;
desc formatted tbl;
-- describe는 desc와 동일합니다. 
describe table tbl;
```

<br>

## 2 관계형 명령어

WHERE 조건에서 사용하는 관계형 명령어중 `between A and B`는 일자별 파티션으로 구분된 테이블의 조회에서 유용하게 사용할 수 있습니다. 일자 파티션이 문자형(String)으로 선언되어 있어도 자동으로 캐스팅하여 비교해 줍니다.

| 함수              | 설명                                  |
| :---------------- | :------------------------------------ |
| A between B and C | A의 값이 B 이상, C 이하이면 TRUE 반환 |

```shell
SELECT *
  FROM tbl
 WHERE yymmdd between '20180101' and '20180107';
```

<br>

## 3 논리형 명령어

논리형 명령어 중에서 어떤 데이터가 존재하는지를 검증하는 IN은 서브쿼리를 이용하여 데이터의 존재를 효율적으로 확인할 수 있습니다.

```shell
-- col 칼럼의 값이 서브쿼리의 데이터 안에 있으면 처리 
SELECT *
  FROM tbl
 WHERE col IN (SELECT col
                 FROM sub_tbl)

-- col 칼럼의 값이 a, b, c 가 아니라면 처리 
SELECT *
  FROM tbl
 WHERE col NOT IN ( 'a', 'b', 'c' )
```

<br>

## 4 복합형 생성 명령어

하이브에서 제공하는 **복합 타입(Map, Array, Struct)**을 쿼리에서 직접 생성할 수도 있습니다.

| 함수              | 설명                         |
| :---------------- | :--------------------------- |
| map(key1,val1,)   | 주어진 키와 값으로 맵을 생성 |
| array(val1,val2)  | 주어진 값으로 배열을 생성    |
| struct(val1,vla2) | 주어진 값으로 구조체를 생성  |

```shell
-- 맵 생성 
hive> select map('key1', 'value1', 'key2', 'value2');
OK
{"key1":"value1","key2":"value2"}

-- 배열 생성 
hive> select array(1, 2, 3);
OK
[1,2,3]

-- 구조체 생성 
hive> select struct(1, "a");
OK
{"col1":1,"col2":"a"}
```

<br>

## 5 기본 명령어

하이브의 기본 명령어 중에서 유용한 명령어의 사용법은 다음과 같습니다. 

<br>

### 5-1 캐스팅 명령

주어진 값의 형을 변경해야 할 필요가 있을때 `cast`를 이용합니다.

| 함수                  | 설명                  |
| :-------------------- | :-------------------- |
| cast( expr as <type>) | 주어진 값의 형을 변경 |

```
-- 문자열을 int 형으로 변경 
hive> select cast( "1" as int);
OK
1
```

<br>

### 5-2 콜렉션 명령

콜렉션을 처리하는 명령어는 다음과 같습니다.

| 함수                         | 설명                       |
| :--------------------------- | :------------------------- |
| size(Map or Array)           | 맵과 배열의 값의 수를 반환 |
| array_contains(Array, value) | 배열에 값이 있는지 확인    |
| sort_array(Array)            | 배열을 정렬                |

```shell
-- 사이즈 확인 
hive> select size(map('key1', 'value1', 'key2', 'value2'));
OK
2

-- 값이 존재하는지 확인 
hive> select array_contains(array(1, 2, 3), 2);
OK
true

-- 배열을 정렬 
hive> select sort_array(array(3, 1, 2));
OK
[1,2,3]
```

<br>

### 5-3 날짜 명령

날짜 관련 함수는 날짜의 출력 포맷을 변경할 때 주로 사용합니다. 

| 함수                                            | 설명                           |
| :---------------------------------------------- | :----------------------------- |
| unix_timestamp(string date[, string format])    | 주어진 값을 unixtime 으로 변환 |
| from_unixtime(bigint unixtime[, string format]) | unixtime을 일자로 변환         |

```shell
-- 문자열 일자를 unix 타임으로 변환 
hive> select unix_timestamp("2018-01-01 00:00:00", 'yyyy-MM-dd HH:mm:ss');
OK
1514764800

-- unix 타임을 지정한 타입의 문자열로 변환 
hive> select from_unixtime(1514764800, 'yyyy-MM-dd HH:mm:ss');
OK
2018-01-01 00:00:00
```

<br>

### 5-4 조건 함수

조건 함수는 조건에 따라 값의 출력을 변경할 때 사용할 수 있습니다.

| 함수                          | 설명                                |
| :---------------------------- | :---------------------------------- |
| if(조건,참,거짓)              | 조건을 이용하여 맞는 값을 반환      |
| isnull( a )                   | null 값인지 체크                    |
| nvl(T value, T default_value) | null 이면 기본값 반환               |
| COALESCE(T v1, T v2, ...)     | null 이 아닐경우 순서대로 값을 반환 |

```shell
-- 조건문이 True이면 참의 값, False 이면 거짓의 값 
hive> select if(1=1,'a','b');
OK
a

-- 조건이 null 이면 true 반환 
hive> select isnull(null);
OK
true

-- 입력값이 null 이면 기본값 반환 
hive> select nvl(null, 'a');
OK
a

-- 입력값이 null이 아니면 입력값 반환 
hive> select nvl('b', 'a');
OK
b

-- 순서대로 null 이 아닌 최초의 값을 반환 
hive> select coalesce(null,'a','b');
OK
a

hive> select coalesce(1,'a','b');
OK
1

hive> select coalesce(null,null,'b');
OK
b
```

<br>

### 5-5 문자열 함수

문자열을 조작하는 함수는 종류가 다양합니다. 그 중에서 자주 사용되는 함수는 다음과 같습니다.

다음은 문자열을 병합하는 함수 입니다.

| 함수                                         | 설명                       |
| :------------------------------------------- | :------------------------- |
| concat(string A, string B)                   | string A와 string B를 병합 |
| concat_ws(string SEP, string A, string B...) | SEP를 이용하여 문자열 병합 |
| concat_ws(string SEP, array<string>)         | SEP를 이용하여 문자열 병합 |

* SEP은 '구분자'라는 뜻의 seperator에서 따왔습니다.



```shell
-- 문자열 병합 
hive> select concat('A','B');
OK
AB

-- SEP를 기준으로 문자열을 병합 
hive> select concat_ws(',','a','b');
OK
a,b

-- SEP를 기준으로 배열의 문자열을 병합 
hive> select concat_ws(',',array('a','b','c'));
OK
a,b,c
```

<br>

다음은 문자열을 조작하는 함수 입니다.

| 함수                                       | 설명                              |
| :----------------------------------------- | :-------------------------------- |
| substr(string A, int start)                | start 지점부터 끝까지 문자열 반환 |
| substring(string A, int start, int length) | start부터 length 만큼 문자열 반환 |
| trim(string A)                             | 문자열 앞, 뒤의 공백을 제거       |
| replace(string A, string old, string new)  | A안의 old 문자열을 new로 변경     |

```shell
-- start 지점부터 끝까지 문자를 반환 
hive> select substr('123456789',3);
OK
3456789

-- start 지점부터 지정한 개수의 문자를 반환 
hive> select substr('123456789',3,2);
OK
34

-- 문자열 양쪽의 공백을 제거 
hive> select trim(' 123 ');
OK
123

-- 문자열에 존재하는 old 문자를 new 문자로 변환 
hive> select replace('123123123','2','a');
OK
1a31a31a3
```

<br>

다음은 문자열을 맵, 배열로 변환하는 함수 입니다.

| 함수                                       | 설명                                                       |
| :----------------------------------------- | :--------------------------------------------------------- |
| str_to_map(text[, delimiter1, delimiter2]) | String을 구분자를 이용하여 키, 값으로 구분하여 맵으로 변환 |
| split(string str, string pat)              | 문자열을 구분하여 배열로 반환                              |

```shell
-- 문자열을 맵으로 변환 
hive> select str_to_map('a:1,b:2,c:3', ',' ,':');
OK
{"a":"1","b":"2","c":"3"}

-- 문자열을 배열로 변환 
hive> select split('a,b,c',',');
OK
["a","b","c"]
```



---

**Reference**

https://wikidocs.net/25258