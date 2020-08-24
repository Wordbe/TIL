# Lombok



## 생성자(Constructor) 자동생성

* `@NoArgsConstructor` : 파라미터가 없는 기본 생성자 생성
* `@AllArgsConstructor ` : 모든 필드를 파라미터로 받는 생성자 생성
* `@RequiredArgsConstructor ` : `final`이나 `@NonNull` 인 필드만 파라미터로 받는 생성자 생성

```java
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class Products {

    private Long id;

    @NonNull
    private String title;
    
    @NonNull
    private Date date;
}
```

```java
Products prod1 = new Products();
Products prod2 = new Products(Long id, String title, Date date);
Products prod3 = new Products(String title, Date date);
```





## @Builder

```java
@Builder
public class Products {

    private Long id;

    @NonNull
    private String title;
    
    @NonNull
    private Date date;
}
```

* 클래스 위에 `@Builder` annotation 을 붙이면, 빌드 패턴클래스를 손쉽게 생성할 수 있다.

