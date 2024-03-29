# Unit Testing 007 - 가치 있는 단위 테스트를 위한 리팩터링



# 1 리팩터링할 코드 식별하기



## 1 코드의 네 가지 유형

- 코드 복잡도 또는 도메인 유의성 → 버그 방지하므로 단위 테스트에서 가장 이롭다.
  - **도메인 유의성 : 코드가 프로젝트의 문제 도메인에 얼마나 의미 있는지**
- 협력자 수



### 1 도메인 모델과 알고리즘

- 도메인 계층
- 함수형 코어
- 단위 테스트하기 적합하다.

### 2 간단한 코드

- 테스트할 가치가 없다. (도메인 유의성 낮다.)

### 3 컨트롤러

- 애플리케이션 서비스 계층
- 가변 쉘
- 통합 테스트를 통해 간단히 테스트한다.

### 4 지나치게 복잡한 코드

- 컨트롤러 또는 도메인 모델과 알고리즘으로 분리한다.





## 2 험블 객체 패턴으로 지나치게 복잡한 코드 분할

- Humble Object = 도메인 객체와 비슷
- 애플리케이션 서비스 계층은 험플 래퍼라고도 ㅂ루ㅡㅁ.
- 단일 책임 원칙을 지킨다.
- 테스트 가능한 설계가 테스트를 용이하게 할 뿐만아니라, 유지보수가 쉽게 해준다.



# 2 가치있는 단위 테스트를 위한 리팩터링하기



- 활성 레코드 패턴 (Active Record Pattern))))
  - 도메인 클래스가 스스로 데이터베이스를 검색하고 다시 저장하는 방식
  - 단순 프로젝트에는 잘 작동하지만, 코드베이스가 커지면 확장이 어렵다.
  - 비즈니스로직과 프로세스 외부 의존성 통신 사이에 분리가 없기 때문이다.



## 1단계 : 암시적 의존성을 명시적으로 만들기

- DB, 메시지 버스 등은 인터페이슬르 둔 후, 인터페이스를 주입한다.
  - 테스트는 목으로 처리



## 2단계 : 애플리케이션 서비스 계층 도입 

- 외부시스템과 통신은 험블 컨트롤러 (애플리케이션 서비스) 로 책임을 옮긴다.



## 3단계 : 애플리케이션 서비스 복잡도 낮추기

- ORM 사용해 데이터베이스를 도메인 모델에 매핑하면, 재구성 로직을 옮기기에 적절한 위치가 될 수 있다.
- 혹은 도메인 클래스를 인스턴스화 할 수 있는 팩토리 클래스를 작성한다.



## 4단계 : 새 Company 클래스 소개

- 책임을 잘못 뒀거나, 추상화가 없다.
- 문제를 해결하려면 새로운 도메인 클래스를 고려한다.



# 3 최적의 단위 테스트 커버리지 분석



## 1 도메인 계층과 유틸리티 코드 테스트

- 도메인 모델과 알고리즘 : 코드 복잡도나 도메인 유의성이 높다. 회귀방지가 뛰어나고, 협력자도 거의 없어 유지비가 가장 낮다.



## 3 전제조건 테스트

- 권장하는 지침은 도메인 유의성이 있는 모든 전제조건은 테스트한다.
  - ex) 직원 수가 음수면 안된다.
  - 그러나 도메인 유의성이 없는(없어도 되는) 코드는 짜지 않는다.





---

# 4 컨트롤러에서 조건부 로직 처리

비즈니스 로직과 오케스트레이션의 분리는 아래 단계로 비즈니스 연산이 있을 때 효과적이다.

1. 저장소에서 데이터 검색
2. 비즈니스 로직 실행
3. 데이터를 다시 저장소에 저장

하지만 이렇지 않은 로직은?

1. 외부에 대한 모든 읽기와 쓰기를 비즈니스 연산 가장자리로 밀어내기
   - 성능 저하
2. 도메인 모델에 프로세스 외부 의존성 주입하기
   - 도메인 모델의 테스트 유의성 저하
3. **의사 결정 프로세스 단계를 더 세분화하기**
   - 컨트롤러가 복잡
   - **→ 컨트롤러가 복잡해지는 것을 완화한다.**





세가지 특성의 균형을 맞춘다.

1. 도메인 모델 테스트 유의성
2. 컨트롤러 단순성
3. 성능 : 프로세스 외부 의존성에 대한 호출 수

트레이드 오프가 있다. 세가지 중 두가지를 선택한다.





## 1 CanExecute / Execute 패턴 사용

- 비즈니스 로직이 도메인 모델에서 컨트롤러로 유추되는 것을 방지
- do() 메서드에대해 canDo() 를 두고, canDo() 가 성공적으로 실행되는 것을 do() 의 전제조건으로 한다.



## 2 도메인 이벤트를 사용해 도메인 모델 변경 사항 추적

- 도메인 모델을 현재 상태로 만든 단계를 빼기 어려울 때가 있다.
- 도메인 이벤트는 이미 일어난 일이기 때문에 항상 과거시제로 명명한다.
- 도메인 이벤트는 값이고, 불변이다.

```kotlin
data class EmailChangedEvent(val userId: Int, val newEmail: String)
```





# 5 결론

- 컨트롤러에 비즈니스 로직을 피할 수 없는 것처럼, 도메인 클래스에 모든 협력자를 제거할 수 있는 경우는 거의 없다.
- 그러나 협력자가 여러개 있어도, 프로세스 외부 의존성을 참조하지 않으면 도메인 클래스는 지나치게 복잡하지는 않을 것이다.
- 추상화할 것을 테스트하기보다, 추상화를 테스트하는 것이 더 수비다.
  - 도메인 이벤트는 프로세스외부 의존성 호출 위의 추상화에 해당한다.
  - 도메인 클래스의 변경은 데이터 저장소의 향후 수정에 대한 추상화이다.

