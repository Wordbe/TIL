# Hive 08 - Function

Hive 함수는 UDF, UDAF, UDTF 로 구분할 수 있습니다. 또한 사용자가 직접 함수를 등록하여 사용할 수도 있습니다.



### UDF

**UDF(User-Defined Function)**는 1개의 열(row)을 처리하여, 1개의 열을 반환하는 함수입니다. substr(), round() 등

```shell
-- 문자열의 두번째 index 부터 3개의 자를 반환 
hive> select substr('ABCDEFG', 2, 3);
OK
BCD

hive> select substr(col1, 2, 3)
        from tbl1;
OK
BCD    
```

<br>

### UDAF

**UDAF(User-Defined Aggregation Function)** 는 N개의 열을 이용하여, 1개의 열을 반환합니다. RDB의 윈도우 함수라 할 수 있습니다. count(), sum(), max() 등

```shell
SELECT count(1)
  FROM tbl1
 GROUP BY col1
;
```

<br>

### UDTF

**UDTF(User-Defined Table Generating Function)**는 1개 열을 받아, N개의 열을 반환합니다. 리스트, 맵 형태의 데이터를 테이블로 보여줄 때 사용합니다. 단독으로 사용할 수 도 있고, Lateral View와 함께 사용하여 원테이블의 데이터와 조인한 형태로 값을 보여줄 수도 있습니다.

```shell
hive> select explode(array(1, 2, 3));
OK
1
2
3
```



#### UDTF 종류

- **explode, inline, posexplode**
  - array, map, struct 형식의 데이터를 테이블 형태로 반환
- **json_tuple**
  - json 문자열을 파싱하여 반환
  - get_json_object() 와 비슷한데 속도가 빠름
  - xpath를 이용한 처리는 안됨
- **url_tuple**
  - url 문자를 파싱
  - HOST, PATH, QUERY, REF, PROTOCOL, AUTHORITY, FILE 를 반환
- **stack**
  - 전달한 데이터를 여러개의 행으로 반환

<br>

### UDTF 함수 예제

```shell
-- EMPLOYEE 테이블의 내용 확인 
hive> desc employee;
OK
id                      string                                      
name                    string                                      
lists                   array<string>                               
maps                    map<string,string>                          
salary                  int    

hive> select * from employee;
OK
id-1    john    ["a","b","c","d"]   {"k1":"v1","k2":"v2"}   100
id-2    sam ["e","f","g","h"]   {"k3":"v3","k4":"v4"}   300
id-3    tim ["i","j","k","l"]   {"k5":"v5","k6":"v6"}   1000
id-4    paul    ["z","c","v","b"]   {"k7":"v7","k8":"v8"}   800
id-5    kill    ["q","w","e","r"]   {"k9":"v9","k0":"v0"}   600


-- 리스트를 explode() 함수를 이용하여 테이블 형태로 반환 
hive> select explode(lists) as col1
    >   from employee;
OK
a
b
c
d
e
f
g
h
i
j
k
l
z
c
v
b
q
w
e
r
Time taken: 0.054 seconds, Fetched: 20 row(s)

-- 맵을 explode() 함수를 이용하여 key, value 테이블 형태로 반환 
hive> select explode(maps) as (key, value) 
    >   from employee;
OK
k1  v1
k2  v2
k3  v3
k4  v4
k5  v5
k6  v6
k7  v7
k8  v8
k9  v9
k0  v0
Time taken: 0.052 seconds, Fetched: 10 row(s)


-- 리스트를 posexplode() 함수를 이용하여, 포지션 칼럼 형태로 반환 
hive> select posexplode(lists) as (pos, col1)
    >   from employee;
OK
0   a
1   b
2   c
3   d
0   e
1   f
2   g
3   h
0   i
1   j
2   k
3   l
0   z
1   c
2   v
3   b
0   q
1   w
2   e
3   r
Time taken: 0.059 seconds, Fetched: 20 row(s)

-- inline, array, struct 를 이용한 JSON 문자열의 테이블화 예제 
hive> SELECT inline(array(   struct(get_json_object(str, "$.key1"))
    >                      , struct(get_json_object(str, "$.key2")) ))
    >   FROM ( SELECT '{ "key1": "a", "value1" : "1", "key2": "b", "value2" : "2" }' AS str ) t
    > ;
OK
a
b
Time taken: 0.031 seconds, Fetched: 2 row(s)
```

<br>

### LATERAL VIEW

UDTF 함수 결과를 기존 테이블의 칼럼에 추가하여, 조인된 테이블 처럼 보이게 도와줍니다.

```shell
-- listTable 결과 확인 
hive> select col_list from listTable;
OK
["1","2","3"]
["4","5","6"]
["7","8","9"]

-- explode() 함수의 결과 
hive> SELECT explode(col_list)
    >   FROM listTable;
OK
1
2
3
4
5
6
7
8
9
Time taken: 0.05 seconds, Fetched: 9 row(s)

-- LATERAL VIEW 를 이용해 기존 테이블의 결과와 함께 출력 
hive> SELECT col_list, item
    >   FROM listTable LATERAL VIEW explode(col_list) t as item
    > ;
OK
["1","2","3"]   1
["1","2","3"]   2
["1","2","3"]   3
["4","5","6"]   4
["4","5","6"]   5
["4","5","6"]   6
["7","8","9"]   7
["7","8","9"]   8
["7","8","9"]   9
Time taken: 0.142 seconds, Fetched: 9 row(s)
```

<br>

### 사용자 정의 함수

기본 함수 외에 사용자가 함수를 생성할 수 있습니다. 

1) JAVA 함수를 생성하고, jar 파일로 묶어서 ADD JAR 명령으로 jar 파일을 추가하여 사용합니다.

2) CREATE FUNCTION 명령으로 함수를 생성합니다.

3) SELECT 문을 통해 사용합니다. 

상세한 개발 방법은 [하이브 메뉴얼](https://cwiki.apache.org/confluence/display/Hive/HivePlugins)을 참고하시기 바랍니다.

```shell
-- JAR 추가 및 함수 생성 
ADD JAR hdfs:///user/hive/SampleUDF.jar;
CREATE TEMPORARY FUNCTION time_stamp AS 'sdk.hive.TimeStampUDF';

-- 기존 함수와 같은 형태로 사용 
SELECT time_stamp(col1)
  FROM sample;
```







---

**Reference**

https://wikidocs.net/23565