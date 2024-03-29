# Unit Testing 006 - 단위 테스트 스타일



기준틀

- 출력 기반
- 상태 기반
- 통신 기반



# 1 단위 테스트 3가지 스타일

- 출력 기반 테스트 output-based testing
- 상태 기반 테스트 state-based testing
- 통신 기반 테스트 communication-based testing



## 1 출력 기반 테스트 정의

- SUT 에 입력을 넣고 생성되는 출력을 점검하는 방식
- 함수형이다.
- 부작용 없는 코드 선호를 강조하는 프로그래밍 방식 = 함수형 프로그래밍



## 2 상태 기반 스타일 정의

- 작업이 완료된 후 시스템 상태를 확인하는 것
- 상태 : SUT나 협력자 중 하나, 또는 DB나 파일시스템 등과 같은 프로세스 외부 의존성의 상태를 말한다.



## 3 통신 기반 스타일 정의

- 목을 사용해서 테스트 대상 시스템과의 협력자 간 통신을 검증한다.







# 2 단위 테스트 스타일 비교

## 1 회귀 방지 vs 피드백 속도 지표

회귀 방지 지표

- 테스트 중 실행되는 코드의 양
- 코드 복잡도
- 도메인 유의성





## 2 리팩터링 내성 지표로 스타일 비교

- 거짓 양성 (허위 정보) 에 대한 척도
- 거짓 양성은 식별할 수 있는 동작이 아니라 코드의 구현 세부 사항에 결합된 테스트 결과



## 3 유지 보수성 지표로 스타일 비교

유지보수성은 단위 테스트의 유지비를 측정한다.

- 테스트를 이해하기 얼마나 어려운가 → 유지보수 어렵다.
- 테스트를 실행하기 얼마나 어려운가



출력 기반 테스트가 가장 유지보수하기 용이하다.

- 짧고, 간결



## 4 스타일 비교

| .                      | 출력기반 | 상태기반 | 통신기반 |
| ---------------------- | ---- | ---- | ---- |
| 리팩터링 내성을 지키기 위해 필요한 노력 | 하    | 중    | 중    |
| 유지비                    | 하    | 중    | 상    |

- 출력 기반 테스트 선호
- 출력 기반 스타일은 함수형으로 작성된 코드에만 적용할 수 있다. 객체지향 언어에 해당하지 않는다.
- 하지만 테스트를 출력 기반 스타일로 변경할 수 있다.





# 3 함수형 아키텍처 이해



## 1 Functional Programming

- 입출력을 명시한 수학적 함수는 테스트가 짧고 간결
- 이해하고 유지보수 하기 쉽다. → 테스트가 쉽다.
- 거짓 양성 빈도가 낮다.



**메서드 호출을 반환값으로 대체할 수 있으면 `수학적 함수` 다.**

메서드에 대한 호출을 해당 값으로 바꾸는 것을 참조 투명성(referential transparency)이라 한다.

```kotlin
fun increment(x: Int) = x + 1

var y = Increment(4);
y = 5

// increment 는 수학적 함수다.
```



## 2 함수형 아키텍처란

- 함수형 프로그래밍의 목표는 부작용을 완전히 제거하는 것이 아니라 (불가능)
- 비즈니스 로직을 처리하는 코드와 부작용을 일으키는 코드를 분리하는 것이다.
  - 함수형 아키텍처는 부작용을 비즈니스 연산 끝으로 몰아서 비즈니스 로직을 부작용과 분리한다.



### 함수형 코어와 가변쉘

- 결정을 내리는 코드(함수형 코어, functional core) : 부작용이 필요없으므로, 수학적 함수를 사용해 작성한다.
- 결정에 따라 작용하는 코드(가변쉘, mutable shell) : DB 변경이나 메시지 버스로 전송된 메시지와 같이 가시적 부분이 변한다.

### 함수형 코어와 가변쉘의 협력

- 가변 쉘은 모든 입력을 수집한다.
- 함수형 코어는 결정을 생성한다.
- 쉘은 결정을 부작용으로 변환한다.

출력 기반 테스트 : 함수형 코어를 두루 다루고, 가변 쉘은 적은 수의 통합 테스트를 맡긴다.





> 캡슐화와 불변성
>
> 캡슐화, 함수형 아키텍처, 불변성은 단위 테스트와 같은 목표가 있다.
>
> - 소프트웨어 프로젝트의 지속적 성장을 가능하게 하는 것
> - 캡슐화는 코드에 모순이 생기지 않도록 보호하는 행위
> - 불변성은 상태 변질에 대한 걱정을 할 필요가 없다.
>   - 함수형 프로그래밍에서는 캡슐화할 필요가 없게 된다. 단지, 인스턴스 생성시 클래스의 상태를 한 번 확인하면 된다. 그 후 인스턴스를 자유롭게 전달한다.
>
> "객체지향 프로그래밍은 작동 부분을 캡슐화해 코드를 이해할 수 있게 한다. 함수형 프로그래밍은 작동 부분을 최소화해 코드를 이해할 수 있게 한다."



## 3 함수형 아키텍처 vs 육각형 아키텍처

- 육각형 아키텍처 : 도메인 계층(비즈니스 로직 책임)과 애플리케이션 서비스 계층(DB, SMTP 등 외부 통신에 책임)을 구별한다.
  - 결정과 실행을 분리하는 함수형 아키텍처와 비슷
- 의존성의 단방향 흐름
  - 도메인 계층 클래스는 애플리케이션 서비스 클래스에 의존하지 않는다.
  - 함수형 아키텍처에서 불변 코어는 가별 쉘에 의존하지 않는다.



### 차이점은 부작용 처리

- 함수형 아키텍처 : 부작용을 불변 코어에서 비즈니스 연산 가자앚리로 밀어낸다. 가변 쉘이 처리한다.
- 육각형 아키텍처 : 도메인 계층을 제한하여 부작용을 없앤다. 모든 수정사항은 도메인 계층 내에서 이루어ㅣㄴ다. 



함수형 아키텍처는 육각형 아키텍처의 하위 집합이다.





# 4 함수형 아키텍처와 출력 기반 테스트로 전환

리팩터링 단계

- 프로세스 외부 의존성에서 목으로 변경 → 속도 향상(상), 유지보수성 향상 (중, 아직 가독성은 안좋음)
- 목에서 함수형 아키텍처로 리팩터링 → 유지보수성 향상(상)
  - `Persister` 클래스 : 가변 쉘 (애플리케이션 서비스 계층)
  - `AuditManager` 인터페이스 : 함수형 코어 (도메인 모델)
    - `FileContent`, `FileUpdate` 클래스 생성 DTO





# 5 함수형 아키텍처의 단점 이해



## 1 함수형 아키텍처의 적용 가능성

- 종종 실행 흐름이 간단하지 않다.



## 2 성능 단점

- 성능 영향이 덜한 시스템에서는 함수형 아키텍처 사용해 유지보수성을 향상 시키는 편이 낫다.



## 3 코드베이스 크기 증가

- 함수형 아키텍처는 함수형 코어와 가변쉘을 분리해야 한다.
- 궁극적으로는 코드 복잡도가 높아지고, 유지보수성이 향상되지만 초기에 코딩이 더 필요하다.
- 함수형 방식에서 순수성에 많은 비용이 든다면 순수성을 따르지 않는다.
- 모든 도메인 모델을 불변으로는 할 수 없기 때문에, 출력 기반과 상태 기반 스타일을 조합하고, 약간의 통신 기반 스타일을 섞는다.















