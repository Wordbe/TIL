# Spring Core





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

**Reference**

https://www.edwith.org/boostcourse-web/lecture/20655/