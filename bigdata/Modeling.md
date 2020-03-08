# Data Modeling

데이터 모델링은 실제 데이터를 물리적으로 데이터베이스화 하기 위해 이루어지는 과정 중 한 단계입니다.

개념 모델링 → 논리 모델링 → 물리 모델링 순으로 진행합니다.



**1) 개념 모델링(Conceptual Data Modeling)**

​	조직, 사용자의 데이터 요구 사항을 찾고 분석합니다.

​	**핵심 엔터티**와 그들 간 **관계를 발견**하고, **개체-관계 다이어그램(ERD, Entity-Relationship Diagram)을 생성**합니다. 개체-관계 다이어그램은 조직과 다양한 데이터베이스 사용자에게 어떠한 데이터가 중요한지 나타내기 위함입니다. 

​	1) 개념 데이터 모델은 사용자와 시스템 개발자의 데이터 요구 사항 발견을 지원합니다.

​	2) 개념 데이터 모델은 현 시스템이 어떻게 변형되어야 하는가를 이해하는 데 유용합니다.



**(2) 논리 모델링(Logical Data Modeling)**

​	데이터 모델링 프로세스의 입력(input)으로, 비즈니스 정보의 논리적 구조와 규칙을 명확하게 표현하는 기법, 과정입니다. 즉, 물리적 스키마를 설계 하기 전 '데이터 모델' 상태를 일컫는 말입니다. 누가, 어떻게 데이터에 접근하는 지 기법을 담고 있습니다.

 * **데이터 정규화**

   데이터 모델의 일관성을 확보하고, 중복을 제거하여 각 속성들이 적절한 엔터티에 배치되도록 하며 신뢰성 있는 데이터 구조를 얻는 데 목적이 있습니다.

* **논리데이터 모델의 상세화**

  식별자 확정, 정규화, M:M 관계 해소, 참조 무결성 규칙 정의, 이력 관리 전략



**3) 물리 모델링(Physical Data Modeling)**

​	논리 데이터 모델이 데이터 저장소로서 컴퓨터 하드웨어에 표현되는 방법(물리적 스키마)을 결정합니다. **테이블, 칼럼 등의 물리적 저장 구조**와, **사용될 저장 장치**, **자료 추출을 위한 접근 방법 등을 결정**해야 합니다.



---

## 다차원 모델링

* **OLTP (Online Transaction Processing)** : 온라인 트랜잭션 처리

  ​	현재 업무의 효율적인 처리를 위함

  ​	관계형 데이터베이스(RDB) 사용

* **OLAP (Online Analytical Processing)** : 온라인 분석 처리

  ​	의사결정에 도움되는 데이터 분석을 위함

  ​	다차원 DB (MDB or MDDB) 사용



다차원 모델링의 종류로 별, 눈꽃송이, 복합(Composite) 스키마 등이 있습니다.





## 스타스키마(Star Schema)

![](http://www.sqler.com/files/attach/images/368174/404/499/fb5d4afb6b8279b5d83362a68a3982ba.png)

이미지 출처: http://www.sqler.com/files/attach/images/368174/404/499/fb5d4afb6b8279b5d83362a68a3982ba.png



* <u>하나의 사실(Fact) 테이블과 다수의 차원(Dimension) 테이블로 구성</u>됩니다. 실제 사용자가 쉽게 이해할 수 있도록 단순하게 모델링 되며, 원하는 보고서를 만들기 위해 필요한 <u>조인의 횟수를 줄임</u>으로써 사용자 질의에 빠른 속도로 응답할 수 있는 장점이 있습니다.

* 각 차원은 기본 키 - 왜래 키 관계에 따라 Fact 테이블에 직접 연결된 단일 Dimension 테이블을 기반으로 합니다.

* Star 스키마는 대용량에서 많이 사용됩니다. 분석 관점이 명확하고 데이터 건수가 많은 경우는 유리하지만, 다양한 관점으로 분석 요구시 차원테이블이 추가되고 Fact 테이블에 대해 변경이 일어날 경우 처음부터 다시 쌓거나 다른 Fact 텡블을 만들어야 하는 불편함이 있습니다. 이럴 때는 Snowflake 스키마가 더 적합할 수 있습니다.





## 스노우 플레이크 스키마(Snowflake Schema)

![](http://www.sqler.com/files/attach/images/368174/404/499/305e4fd2537ba061b427b1ca3131f825.png)

이미지 출처: http://www.sqler.com/files/attach/images/368174/404/499/305e4fd2537ba061b427b1ca3131f825.png



* 스노우플레이크 스키마는 확장에 용이합니다. 
* 많은 데이터를 보유할 수 있으므로 성능과 집계에 영향을 미칩니다.
* 데이터 중복은 피할수있으나, 이해하기 어려운 단점이 있습니다.



---

**Reference**

http://www.dbguide.net/db.db?cmd=view&boardUid=12733&boardConfigUid=9&categoryUid=216&boardIdx=31&boardStep=1

https://dbrang.tistory.com/1381

https://unabated.tistory.com/entry/OLTP-OLAP

[https://unabated.tistory.com/entry/%EB%8B%A4%EC%B0%A8%EC%9B%90-%EB%AA%A8%EB%8D%B8%EB%A7%8112](https://unabated.tistory.com/entry/다차원-모델링12)