# Spring Boot + JPA 003 - 웹 계층 개발







> API 는 규격이다.
>
> 엔티티에 변경사항이 있었는데, 이것이 API 응답에 반환되면 안된다. 따라서 API 컨트롤러에서는 DTO 만 사용하자. 단, 서버 사이드 렌더링에서 템플릿에 모델을 전달할 때는 엔티티를 그대로 사용해도 괜찮다. 하지만, 컨트롤러별 DTO를 만들어 사용하는 것을 권장한다.



## 변경 감지와 병합(merge)



> TL; DR
>
> - 병합(merge)이 아닌, 변경감지로 UPDATE 로직을 만든다. (null로 업데이트할 위험이 있기 때문이다.)

### 준영속 상태

* 영속성 컨텍스트가 더 이상 관리하지 않는 엔티티를 말한다.
* 예를 들어 `itemService.saveItem(book)` 에서 수정을 시도하는 `Book` 객체 이다. 이 객체는 이미 DB에 한 번 저장되어서 식별자가 존재한다. 이렇게 임의로 만들어낸 엔티티도 기존 식별자를 가지고 있으면 준영속 엔티티로 본다.

```java
@PostMapping("/items/{itemId}/edit")
public String updateItem(@PathVariable String itemId, @ModelAttribute("form") BookForm form) {

  Book book = new Book();
  book.setId(form.getId());
  book.setName(form.getName());
  book.setPrice(form.getPrice());
  book.setStockQuantity(form.getStockQuantity());
  book.setAuthor(form.getAuthor());
  book.setIsbn(form.getIsbn());

  itemService.saveItem(book);
  return "redirect:/items";
}
```

여기서 `itemdId` 는 DB에 저장된 id 이다. `updateItemForm` 로직에서 이 아이디를 받고, 새로운 엔티티를 만들어 집어넣는다. (DB에는 있지만, 엔티는 영속성 컨텍스트에 들어있지 않은 준영속 상태)  준영속 상태의 엔티티를 저장하려고할 때, 변경감지는 일어나지 않는다.



### 준영속 엔티티 수정하는 2가지 방법

* 변경 감지 기능 사용
  트랜잭션 안에서 영속성 컨텍스트에서 엔티티를 다시 조회한 후 데이터를 수정한다. 트랜잭션 커밋 시점에 변경감지(dirty checking)가 동작해서 DB에 update SQL을 실행시킨다.

 ```java
 @Transactional
 public void updateItem(Long itemId, Book bookParam) {
   // bookParam 은 준영속 상태 엔티티
  
   Item item = itemRepository.findOne(itemId); // 조회시 영속성 컨텍스트 안에 있음
   item.setPrice(bookParam.getPrice()); // 이 때 데이터 수정하면, 자동 변경 감지
   item.setName(bookParam.getName());
   item.setStockQuantity(bookParam.getStockQuantity());
 }
 ```

* 병합(`merge`) 사용

  병합은 준영속 상태의 엔티티를 영속 상태로 변경할 때 사용하는 기능이다.

  merge 는 받은 객체로 먼저 DB를 조회하고, 받은 객체의 값으로 모두 변경한다.



​				**주의:** 

​				**변경감지기능을 사용하면 원하는 속성만 선택해서 변경가능하지만, 병합을 사용하면 모든 속성이 덮어쓰인다.** 

​				**즉, 병합시 값이 없으면 `null` 로 업데이트 될 위험이 있다. (병합은 모든 필드를 교체한다.)**

```java
@Transactional
public void update(Item itemParam) {
  Item mergeItem = em.merge(item);
}
```

![](https://i.ibb.co/p2B4xZP/image.png)

> 병합 동작 방식
>
> 1. merge() 실행
> 2. 파라미터로 넘어온 준영속 엔티티의 식별자 값으로 1차 캐시에서 엔티티를 조회한다.
>    1. 1차 캐시에 엔티티가 없으면, DB에서 엔티티를 조회하고, 1차 캐시에 저장한다.
> 3. 조회한 영속성 엔티티(mergeMember)에 member 엔티티의 값을 채워 넣는다. 
> 4. 영속 상태인 mergeMember 를 반환한다.
> 5. 트랜잭션 커밋 시점에 변경 감지 기능이 동작해서 DB에 UPDATE SQL이 실행된다.



결론

* 엔티티를 변경할 때는 항상 변경 감지를 사용한다.
* 컨트롤러에서 어설프게 엔티티를 생성하지 않는다.
* 트랜잭션이 있는 서비스 계층에 식별자(`id`)와 변경할 데이터를 명확하게 전달한다. (파라미터 또는 DTO)
* 트랜잭션이 있는 서비스 계층에서 영속 상태의 엔티티를 조회하고, 엔티티의 데이터를 직접 변경한다.
* 트랜잭션 커밋 시점에 변경 감지가 실행된다.



---







