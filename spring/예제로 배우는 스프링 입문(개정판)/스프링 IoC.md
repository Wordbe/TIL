# 스프링 IoC



## IoC

Inversion of Control, 제어의 역전

일반적인 의존성 제어권은 내가 사용할 의존성은 내가 만드는 것이다.

제어의 역전 (IoC)은 내가 사용할 의존성은 이미 만들어져 있는 것에 연결한다는 의미이다.

* 의존성 주입(DI, Dependency Injection)은 일종의 IoC 이다.







---

## IoC 컨테이너



`BeanFactory` 는 IoC 컨테이너다. 

`ApplicationContext` 는 `BeanFactory` 를 상속받는다.

ApplicationContext

* 빈을 만들고, 의존성을 엮어주고 제공한다.



Bean

* 인텔리제이에서 Bean은 '녹색 콩'으로 표시해준다.
* 애노테이션이 붙어있거나 특정 인터페이스를 상속한다.
* `Bean` 애노테이션으로 직접 빈으로 등록할수도 있다.

* `ApplicationContext` 안에 모든 빈들이 다 들어있다.
* 하지만 `applicationContext.getBean()` 을 통해 주입을 받아오는 경우는 거의 없다. bean으로 등록된 객체를 그냥 사용하면 되기 때문이다.



Bean은 기본적으로 Singleton 인데 큰 장점을 가진다.

* 객체 하나를 재사용한다. 특히 멀티쓰레드 상황에서 싱글톤 객체를 사용하는 것은 번거로운 일인데, IoC 컨테이너를 활용하면 쉽게 끌어다 사용하기만 하면 된다.



---

## Bean



내 객체를 빈에 등록하면 사용하고, 관리하기가 쉬워진다.

빈이 만들어지는 과정은 다소 복잡하다.

스프링 IoC 컨테이너 만들고 그 안에 빈으로 등록하는 일련의 과정이 있는데 이를 Lifecycle callback 이라한다.

이 정도의 흐름만 알아두고, 빈을 등록하는 방법을 알아보자.



**빈 등록방법**

1) @Component 애노테이션 붙이기

* @Repository, @Serivce, @Controller, @Configuration 은 모두 @Component에 포함된다.
* 위와같이 클래스 위에 애노테이션을 등록해놓으면 스프링부트는 `@SpringbootApplication` > `@ComponentScan` > `@Component` 과정으로 최상위 클래스부터 bean으로 등록된 객체를 찾는다.

2) 직접 빈으로 등록, java 설정, xml 설정

java 설정 예시

```java
package org.springframework.samples.petclinic.sample;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SampleConfig {

	@Bean
	public SampleController sampleController() {
		return new SampleController();
	}
}
```



3) Repository 는 스프링 데이터 JPA가 제공하는 기능으로 빈으로 등록이 된다. Repository 인터페이스를 상속받는 클래스를 찾아서 클래스의 구현체를 만들어 빈으로 등록한다.





---

## 의존성주입

`@Autowired`

* 필드, 세터, 생성자에 사용할 수 있다.
* 스프링 레퍼런스에서 권장하는 방법은 생성자에 애노테이션을 붙이는 것이다. 해당 클래스에서 애노테이션으로 의존성이 꼭 필요한 클래스를 지정해놓을 수 있기 때문에, 의존성이 담기지 않고 실행되는 에러를 방지할 수 있다.
* 필드나 세터 인젝션의 경우 순환 참조를 해결하는 경우에서 사용하면 좋다..

스프링버전 4.3 이상이면 `@Autowired` 애노테이션을 생략할 수 있다.



의존성주입

* 필드로 할 경우

  ```java
  @Controller
  class SampleController {
  	@Autowired
  	private Sample sample;
  }
  ```

* 생성자로 할 경우

  ```java
  @Controller
  class SampleController {
  	private final Sample sample;
    
    @Autowired
  	public SampleController(Sample sample) {
      this.sample = sample;
    }
  }
  ```

* 세터로 할 경우

  ```java
  @Controller
  class SampleController {
  	private Sample sample;
    
  	@Autowired
    public void setSample(Sample sample) {
      this.sample = sample;
    }
  }
  ```



물론 스프링 4.3 이후버전은 모두 `@Autowired`를 삭제해도 좋다.























