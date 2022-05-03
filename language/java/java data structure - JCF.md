# java data structure - JCF



## Java Collection Framework

java 에서 데이터를 저장하는 기본적인 자료구조들을 한 곳에 모아 관리한다. 편하게 사용할 수 있는 라이브러리를 제공한다.

- Collection
  - List : 순서가 있는 데이터 집합, 데이터 중복 허용
    - LinkedList  : 단 방향 포인터 구조, 순차적 접근에 용이
    - Stack
    - Vector
    - ArrayList : 양방향 포인터 구조, 삽입/삭제시 유리
  - Set : 순서가 없는 데이터 집합, 데이터 중복 불가
    - HashSet
    - LinkedHashSet : 추가된 순서, 또는 가장 최근 접근한 순대로 접근 가능
    - SortedSet → TreeSet : 자동정렬
- Map : key-value 쌍으로 이루어진 데이터 집합, 순서가 없다. 키는 중복 불가, 값은 중복 허용
  - HashTable
  - HashMap
  - LinkedHashMap : HashMap 상속받음, Map 에 있는 엔트리의 연결 리스트가 유지됨, 입력한 순서대로 반복 가능
  - SortedMap → TreeMap : 이진검색 트리



---

## HashMap

키에 대한 해시값을 사용하여 값을 저장하고 조회하며, 키-값 쌍의 개수에 따라 동적으로 크기가증가하는 연관 배열(associate array) 이다.

> associate array = dictionary = map = symbol table

HashMap은 보조 해시 함수를 사용하기 때문에, 그렇지 않은 HashTable 에 비해 해시 충돌(hash collision)이 덜 발생하여 성능상 이점이 있다.

HashMap 은 해시 충돌을 방지하기 위해 Seperate Chaining 과 보조해시함수(JDK 1.4)를 사용한다. java 8에서는 sepreate chaining에서 연결리스트대신에 트리(java 8)를 사용한다. String 클래스의 hashCode() 메소드에서 31을 승수로 사용하는 이유는 성능 향상을 위함이다.

웹 애플리케이션 서버의 경우 HTTPRequest 발생시 여러 개의 HashMap 이 생성된다. 수많은 HashMap 객체가 1초도 안 되는 시간에 생성되고, GC 대상이 된다. 컴퓨터 메모리 크기가 증가하면서, 메모리 중심적 애플리케이션 제작도 늘었다. 따라서 HashMap 에 더 많은 데이터를 저장하고 있다.



## HashSet

equals() and hashCode() 예제

```java
HashSet<Person> hashSet = new HashSet<>();

Person jack = new Person("jack", 21);
Person jack1 = new Person("jack", 21);
Person sumi = new Person("sumi", 22);

hashSet.add(jack);
hashSet.add(jack1);
hashSet.add(sumi);

System.out.println(jack.equals(jack1));
System.out.println(jack.hashCode());
System.out.println(jack1.hashCode());

hashSet.forEach(System.out::println);

hashSet.stream().sorted(Comparator.comparing(Person::toString)).forEach(System.out::println);
```

