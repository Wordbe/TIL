# Spring Petclinic



## 프로젝트 설정

spring-petclinic 깃 클론하기.





## 프로젝트 살펴보기



**Tip **

INFO 레벨의 로그만 보일 때.

브라우저 요청시에 콘솔나오지 않는 로그확인 하는 법 : DEBUG 레벨의 로그를 본다.





**브라우저에 url 을 검색하고, 서비스가 화면에 보여지는 과정**

1) 브라우저 url 요청

2) `dispatcherServlet` 

3) 컨트롤러 호출  `@GetMapping`, `@PostMapping` 등

4) model 객체를 만들어서 view 이름을 리턴한다.

5) view가 브라우저 화면에 보여진다.





---



**Tip**

* Intellij 메인 Application 실행 : `ctrl + r`

* 화면만 고쳤을 때는 애플리케이션을 다시 실행해 줄 필요없이 빌드만 다시해주면 된다. 빌드 : `cmd + f9`

* `@InitBinder` : 스프링 validator 사용 시, `@Valid` 어노테이션으로 검증이 필요한 객체를 가져오기 전에 수행할 메소드를 지정해주는 어노테이션이다.

* `left join` vs `left join fetch` : `fetch`는 hibernate가 더디게 데이터를 가져오지 않고 바로 가지고 오게하여 DB 조회 성능을 높이는 옵션이다.

* datasource 의 스키마, 데이터는 어디에 정의되어있는 지는 `application.properties` 에 명시해 놓는다.

  



---





LastName을 검색했을 때 클라이언트와 웹서버에서 일어나는 일들을 보자.



1) 브라우저가 http://localhost:8080/owners?lastName= 요청

2) findOwner 뷰에서 `GET` 메소드로 파라미터(firstName) 전송(form - submit)

3) processFindForm 이 데이터를 받아서 

```java
@GetMapping("/owners")
	public String processFindForm(Owner owner, BindingResult result, Map<String, Object> model) 
```

뷰를 리턴한다.

* owners/ownerDetails
* owners/ownersList











