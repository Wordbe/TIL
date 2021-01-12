# Spring - spEL, 스프링 표현어



스프링 EL(Expression Language) 란 객체 그래프를 조회하고 조작하는 기능을 제공하는 언어를 말한다.

spEL은 모든 스프링 프로젝트에서 사용하는 expression language로 만들었다.



문법이나 규칙은 배우기가 쉽다.

* #{"표현식"}

* ${"프로퍼티"}

* 이런식으로 특정 객체를 가져와서 문자열처럼 사용할 수 있고, 계산도 할 수 있다. 표현식은 프로퍼티를 포함할 수 있지만, 반대로는 불가능하다. 

  가령 #{blue.data} + 1 은 가능하다.



어디에 사용되는가

- @Value 애노테이션 안에 spEL을 쓰면, 아래 필드값에 결과가 주입된다.
- @ConditionalOnExpression 어노테이션에서도 사용된다.
- 스프링 시큐리티의 경우 메소드 시큐리티, @PreAuthorize, @PostAuthorize, @PreFilter, @PostFilter, XML 인터셉터 URL 설정 등에 사용된다.
- 스프렝 데이터에서 @Query 에 사용된다.
- 화면을 만드는 템플릿엔진인 타임리프(thymeleaf) 등에서도 사용된다.



간단히 예제를 보자.

```java
package me.wordbe.springgoahead;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.stereotype.Component;

@Component
public class AppRunner implements ApplicationRunner {

    @Value("#{1 + 1}")
    int value;

    @Value("#{'안녕 ' + 'red'}")
    String greeting;

    @Value("#{1 eq 1}")
    boolean yn;

    @Value("red")
    String red;

    // application.properties (프로퍼티) 에서 blue.value 변수를 가져온다.
    @Value("${blue.value}")
    int blueValue;

    // Sample 객체의 data 필드 값을 가져온다.
    @Value("#{sample.data}")
    int sampleData;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(value);
        System.out.println(greeting);
        System.out.println(yn);
        System.out.println(red);
        System.out.println(blueValue);
        System.out.println(sampleData);

        // 아래와 같이 SpelExpressionParser 를 직접 사용할 수도 있다.
        ExpressionParser parser = new SpelExpressionParser();
        Expression expression = parser.parseExpression("10 + 20");
        Integer value = expression.getValue(Integer.class);
        System.out.println(value); // 30
    }
}
```

