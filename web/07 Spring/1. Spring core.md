# Spring Core



# 1. Spring



**1) Spring Framework**

* 엔터프라이즈급(좀 큰) app을 구축할 수 있는 가벼운 솔루션, 원스탑숍(One-Stop-Shop)
* 모듈화가 잘 되어 있습니다.
* IoC 컨테이너 입니다.
* 트랜잭션을 선언적으로 관리할 수 있습니다.
* 완전한 기능을 갖춘 MVC framework를 제공합니다.
* AOP를 지원합니다.
* 스프링은 도메인 논리코드와 쉽게 분리될 수 있는 구조로 되어 있습니다.



One-Stop-Shop : 모든 과정을 한꺼번에 해결하는 상점.



---

**2) 프레임워크 모듈**

![](https://i.ibb.co/q1C6bTS/image.png)

* Spring 프레임워크는 약 20개의 모듈로 구성되어 있습니다.
* 필요한 모듈만 가져다 사용 가능합니다.





---

**3) AOP와 Instrumentation**

* spring-AOP : AOP alliance와 호환되는 방법으로 AOP를 지원합니다.
* spring-aspects : AspectJ와의 통합을 제공합니다.
* spring-instrument : instrumentation을 지원하는 클래스와 특정 WAS에서 사용하는 클래스로 구현체를 제공합니다. BCI(Byte Code Instrumentations)는 런타임이나 로드(load) 때 클래스의 바이트 코드에 변경을 가하는 방법을 말합니다.



---

**4) 메시징(Messaging)**

* spring-messaging : 스프링 프레임워크4는 메시지 기반 app을 작성할 수 있는 Message, MessageChannel, MessageHandler를 제공합니다. 각 모듈에는 메소드에 메시지를 맵핑하기 위한 annotation도 포함되어 있으며, spring MVC와 유사합니다.



---

**5) 데이터 접근(Data Access) / 통합(Integration)**

* JDBC, ORM, OXM, JMS, 트랜잭션 모듈로 구성되어 있습니다.
* spring-jdbc : 자바 JDBC 프로그래밍을 쉽게 사용할 수 있도록 도와줍니다.

* spring-tx : 선언적 트랜잭션 관리를 제공합니다.
* spring-orm : JPA, JDO, Hibernate를 포함한 ORM API를 위한 통합레이어를 제공합니다.
* spring-oxm : JAXB, Castor, XMLBeans, JiBX, XStream과 같은 Object/XML 맵핑을 지원합니다.
* spring-jms : 메시지 생성(producing), 사용(consuming)을 위한 기능을 제공하고, spring framework 4.1부터는 spring-messaging 모듈과의 통합을 제공합니다.



---

**6) 웹(web)**

* 웹 계층은 spring-web, spring-webmvc, spring-websocket, spring-webmvc-portlet 모듈로 구성됩니다.
* spring-web : 멀티 파트 파일 업로드, 서블릿 리스너 등 웹 지향 통합 기능을 제공합니다. HTTP 클라이언트와 Spring의 원격 지원을 위한 웹 부분을 제공합니다.
* spring-webmvc : Web-Servlet 모듈이라고도 하며, Spring MVC, REST 웹 서비스 구현을 포함합니다.
* spring-websocket : 웹 소켓을 지원합니다.
* spring-webmvc-protlet : 포틀릿 환경에서 사용할 MVC 구현을 제공합니다.





---

# 2. Spring IoC/DI 컨테이너



**1) 컨테이너(Container)**

* **인스턴스의 생명주기를 관리**합니다.
* 생성된 **인스턴스들에게 추가적인 기능을 제공**합니다.



예를 들어, Servlet는 Tomcat이 자동으로 생성해주었습니다. Servlet을 실행해주는 WAS는 Servlet 컨테이너를 가지고 있다고 합니다. 또한 jsp 파일 → servlet 파일로 변환 등의 관리도 tomcat이 대신해주었습니다.



>  Web Server, WAS 복습

![](https://i.ibb.co/6Ysh5TT/image.png)

WAS는 웹 브라우저로부터 서블릿 URL에 해당하는 요청을 받으면, 서블릿을 메모리에 올린 후 실행합니다. 개발자는 서블릿 클래스를 작성하지만, 실제 메모리에 올리고 실행하는 것은 WAS가 가지고 있는 Servlet 컨테이너 입니다.

Servlet 컨테이너는 동일한 서블릿에 해당하는 요청을 받으면, 기존 메모리에 올라간 서블릿을 실행하여 웹브라우저에게 전달합니다.



---

**2) IoC**

* Inversion of Control, 제어의 역전이라고 합니다.
* 프로그램의 흐름을 제어하는 코드를 작성하는데, 이 흐름의 제어를 개발자가 아닌, 다른 프포그램이 하는 것을 IoC라고 합니다.



---

**3) DI**

* Dependency Injection, 의존성 주입입니다.
* DI는 클래스 사이의 의존관계를 빈(Bean) 설정 정보를 바탕으로 컨테이너가 자동으로 연결해주는 것을 말합니다.



DI가 적용되지 않으면, 개발자가 직접 인스턴스를 생성합니다.

```java
class Engine {
    
}

class Car {
    Engine v5 = new Engine();
}
```

![](https://i.ibb.co/HdxMLrd/image.png)





DI가 적용되면, 약속된 annotation을 이용해서 선언만 해주면 됩니다.

```java
@Component
class Engine{
    
}

@Component
class Car{
    @Autowired
    Engine v5;
}
```

![](https://i.ibb.co/2Nh0ZcD/image.png)





---

**4) Spring에서 제공하는 IoC/DI 컨테이너**

* BeanFactory : IoC/DI에 대한 기본기능을 가집니다.
* ApplicationContext : BeanFactory의 모든 기능을 포함하고, BeanFactory보다 이를 쓰는 것을 권장합니다. 트랜잭션, AOP 처리등을 할 수 있습니다. BeanPostProcessor, BeanFactoryPostProcessor 등을 자동으로 등록하고, 국제화 처리, app 이벤트 등을 처리할 수 있습니다.



---

# 3. xml파일 설정

Maven으로 Spring 프레임워크를 사용하는 프로젝트를 생성합니다.

XML 설정 파일을 만들어 IoC와 DI를 작동해봅니다.

Bean이 무엇인지 이해해봅니다.



---

**1)  Maven으로 Java 프로젝트 생성**

eclipse > 파일 > New > Maven project

group id, artifact id 는 패키지 이름이 될 것입니다. 소문자로 생성합시다.

artifact id 를 diexam01 로 설정



pom.xml 에 추가

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.6.1</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```



window > show view > others > general > problems 창 추가

문제 확인



diexam01 우클릭 > Maven > Update project > Ok

> 오류시 자바버전 확인 : diexam01 우클릭 > properties > Java compiler



main(App.java)과 test java(AppTest.java)파일을 자동으로 생성해줍니다.

AppText.java 우클릭 > run as > JUnit test

초록색 바 나타나면 성공적으로 실행 완료.



---

**2) Bean class 생성**

Source > Generate Getters and Setters 



UserBean.java

---

3. 

```java
package kr.or.connect.diexam01;

public class UserBean {
/*
 1) 기본생성자를 가져야 한다.
 2) 필드는 private하게 선언한다.
 3) getter, setter 메소드를 가진다.
 	getName(), setName() 메소드를 name 프로퍼티라고 한다.(용어 중요)
 */
	private String name;
	private int age;
	private boolean male;
	
	public UserBean();
	public UserBean(String name, int age, boolean male) {
		this.name = name;
		this.age = age;
		this.male = male;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}
	public boolean isMale() {
		return male;
	}
	public void setMale(boolean male) {
		this.male = male;
	}
}
```



---

**3) Spring Bean Factory를 이용해서 Bean 객체 이용하기**



pom.xml 다시 돌아와서 dependencies 에 **spring 프레임워크 추가**



구글 검색 : maven spring context

Maven Repository > Spring context 4. 버전 중 가장 최신 것

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>${spring.version}</version>
</dependency>
```


pom.xml

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <spring.version>4.3.25.RELEASE</spring.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>

    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>3.8.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

properties에 spring.version을 지정하여 버전을 상수변수처럼 이용하고자 합니다.

버전이 바뀔 때 이 부분만 수정하면 편합니다.



Maven Dependencies를 보면, spring context와 그에 필요한(상속받은) 프레임워크가 추가된 것을 알 수 있습니다.



diexam01 > src > main 안에 resources 폴더를 만들고

**applicationContext.xml** 파일(이 이름을 자주 사용합니다.)을 만듭니다. (공장에게 알려줄 파일)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="userBean" class="kr.or.connect.diexam01.UserBean"></bean>

</beans>
```

이렇게 객체를 하나만 가지고 있는 패턴을 singleton pattern이라고 합니다.

```java
kr.or.connect.diexam01.UserBean userBean = new kr.or.connect.diexam01.UserBean();
```

위 bean설정은 위 java코드와 유사합니다.



---

**4) ApplicationContext를 이용해서 설정파일 읽어들여 실행하기**





ApplicationContextExam01.java

```java
package kr.or.connect.diexam01;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class ApplicationContextExam01 {
	public static void main(String[] args) {
		ApplicationContext ac = new ClassPathXmlApplicationContext("classpath:applicationContext.xml");
		System.out.println("초기화 완료");
		
		UserBean userBean = (UserBean)ac.getBean("userBean");
		userBean.setName("jin");
		
		System.out.println(userBean.getName());
		
		UserBean userBean2 = (UserBean)ac.getBean("userBean");
		if (userBean == userBean2) {
			System.out.println("같은 인스턴스입니다.");
		}
	}
}
```

> 실행결과
>
> 초기화 완료
>
> jin
>
> 같은 인스턴스입니다.





applicationContext 인터페이스

ClassPathXmlApplicationContext 인스턴스 생성 > 안에 설정된 bean을 모두 메모리에 등록

main폴더 안 resource 폴더에서 생성된 xml파일은 자동으로 classpath 경로에 들어갑니다.







---

**5) DI 확인하기**

DI(의존성 주입)을 확인해봅니다.



클래스 Engine과 Car 생성

```java
package kr.or.connect.diexam01;

public class Engine {
	public Engine() {
		System.out.println("Engine 생성자");
	}
	public void exec() {
		System.out.println("엔진이 동작합니다.");
	}
}

package kr.or.connect.diexam01;

public class Car {
	private Engine v8;
	
	public Car() {
		System.out.println("Car 생성자");
	}
	
	public void setEngine(Engine e) {
		this.v8 = e;
	}
	public void run() {
		System.out.println("엔진을 이용하여 달립니다.");
		v8.exec();
	}
	public static void main(String[] args) {
		Engine e = new Engine();
		Car c = new Car();
		c.setEngine(e);
		c.run();
	}
}
```

Car을 실행한 결과:

> Engine 생성자
> Car 생성자
> 엔진을 이용하여 달립니다.
> 엔진이 동작합니다.



**의존성을 주입하여 다시 코드작성**

id가 e, c인 bean추가

<br>



applicationContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
	<bean id="e" class="kr.or.connect.diexam01.Engine"></bean>
	<bean id="c" class="kr.or.connect.diexam01.Car">
		<property name="engine" ref="e"></property>
	</bean>
</beans>
```

property는 getEngine 또는 setEngine 메소드를 의미합니다. ref="e"라고 했으니 bean id="e"에 적용됩니다.



<br>

코드를 실행할 새로운 java파일 생성

applicationContextExam02.java

```java
package kr.or.connect.diexam01;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class ApplicationContextExam02 {
	public static void main(String[] args) {
		ApplicationContext ac = new ClassPathXmlApplicationContext("applicationContext.xml");
		Car car = (Car) ac.getBean("c");
		car.run();
	}
}
```

실행결과 :

>Engine 생성자
>Car 생성자
>엔진을 이용하여 달립니다.
>엔진이 동작합니다.







**DI 주입의 장점:**

사용자는 사용할 Car 클래스만 알고있으면 됩니다.

Engine은 실행코드에서 클래스가 나올 필요가 없습니다.



---

Spring 컨테이너가 관리하는 객체를 빈(bean)이라고 합니다.

new로 생성해서 사용하는 객체는 빈이라고하지 않습니다.

Spring은 빈을 생성할 때 싱글톤(singleton)객체로 생성합니다.

싱글톤은 메모리에 하나만 생성한다는 것입니다.





---

# 4. Java Config를 이용한 설정

Java config와 어노테이션을 사용해서 빈을 정의하고, DI하는 방법을 알아봅니다.

Javaconfig 설정파일 내용을 이해합니다.

Spring은 다양한 어노테이션을 지원합니다.

@ComponentScan, @Component, @Autowired 어노테이션의 쓰임새를 이해합니다.



java class 파일을 만들었을 때 가장 먼저 할일은

"나는 config 파일입니다"를 알려주는 것입니다.

@Configuration 을 클래스위에 적음으로써 가능합니다.



ApplicationConfig.java

```java
package kr.or.connect.diexam01;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {
	@Bean
	public Car car(Engine e) {
		Car c = new Car();
		c.setEngine(e);
		return c;
	}
	
	@Bean
	public Engine engine() {
		return new Engine();
	}
}
```

ApplicationContextExam03.java

```java
package kr.or.connect.diexam01;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class ApplicationContextExam03 {
	public static void main(String[] args) {
		ApplicationContext ac = new AnnotationConfigApplicationContext(ApplicationConfig.class);
		
		Car car = (Car) ac.getBean("car");
		car.run();
	}
}
```





method 이름은 조금씩 다를 수 있고, 형변환도 귀찮을 수 있습니다.

파라미터를 이용한 방법으로 바꾸어 봅시다.



```java
Car car = (Car) ac.getBean(Car.class);
```

이 부분을 살짝 바꾸어주면 가능합니다.



@ComponentScan 은 해당 클래스가 있으면 자동으로 어노테이션하게 도와줍니다.

뒤에는 반드시 해당 패키지 이름을 적습니다.

컨트롤러, 서비스, 레퍼지토리 등에서 어노테이션 붙여있는 bean을 모두 검색합니다.



@Autowired을 클래스 선언부 위에 적어주면,

set 메소드를 적을 필요가 없어집니다.



ApplicationConfig2.java

```java
package kr.or.connect.diexam01;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan("kr.or.connect.diexam01")
public class ApplicationConfig2 {

}
```



그리고 Car와 Engine 클래스 위에 @Component 어노테이션을 붙여야 합니다.



ApplicationContextExam04.java

```java
package kr.or.connect.diexam01;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class ApplicationContextExam04 {
	public static void main(String[] args) {
		ApplicationContext ac = new AnnotationConfigApplicationContext(ApplicationConfig2.class);
		
		Car car = (Car) ac.getBean(Car.class);
		car.run();
	}
}
```

실행결과 :

> Engine 생성자
> Car 생성자
> 엔진을 이용하여 달립니다.
> 엔진이 동작합니다.





---

**Reference**

https://www.edwith.org/boostcourse-web/lecture/20655/

https://www.edwith.org/boostcourse-web/lecture/20656/

https://www.edwith.org/boostcourse-web/lecture/20657/

https://www.edwith.org/boostcourse-web/lecture/20658/