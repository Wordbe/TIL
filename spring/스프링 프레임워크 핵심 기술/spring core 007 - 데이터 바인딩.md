## 데이터 바인딩



데이터 바인딩이란 서로 다른 타입의 데이터를 함께 묶어 동기화하는 기법이다.

이 글에서는 서로 다른 유형의 데이터를 넣었을 때 알아서 원하는 유형으로 연결 시켜주는  것이라고 생각하자. 예를들면 Object 형에서 String 형으로 말이다.



스프링에서 데이터 바인딩을 하는 방법은 다양하다.

PropertyEditor, Converter, Formatter 

3가지 모두 사용가능하지만, 포매터를 추천한다. 



<br />

## PropertyEditor



**DataBinder 인터페이스**

xml 설정 값을 빈으로 넣을 때도 사용되고, spEL 에서도 사용된다. 

프로퍼티 값을 타겟 객체에 설정하는 기능을 제공하고, 사용자 입장에서는 사용자 입력값을 애플리케이션 도메인 모델에 동적으로 변환하여 넣어주는 기능을 제공한다. 입력값은 대부분 문자열이 많은데 이를 객체가 가진 여러 타입 및 도메인 타입 (int, long, boolean, Date, Event) 등으로 변환해준다.



`PropertyEditor` 는 이런 데이터 바인딩을 추상화 해놓은 클래스이다.

쓰레드-세이프 하지 않으며, 상태 정보를 저장하고 있다. (싱글톤 빈으로 등록하면 안된다. 예를 들번 1번 아이디를 가진 멤버가 2번 멤버의 정보를 지울 수 있다!) 또한 Object와 String 간 변환만 할 수 있어서 사용범위가 제한적일 수 있다.

PropertyEditor는 쓰레드-세이프 하지 않으며, 빈으로 등록하기도 어렵다는 단점으로 잘 사용하지 않고, Converter 와 Formatter 를 주로 사용한다.



예제 하나를 만들어보자.

이벤트 객체를 만든다.

```java
@ToString
@Getter
@Setter
public class RedEvent {
    private Integer id;
    private String title;
  
	  public RedEvent(Integer id) {
        this.id = id;
    }
}
```





```java
public class RedEventEditor extends PropertyEditorSupport {
    @Override
    public String getAsText() {
        RedEvent redEvent = (RedEvent) getValue();
        return redEvent.getId().toString();
    }

    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        setValue(new RedEvent(Integer.parseInt(text)));
    }
}

```

`PropertyEditorSupport` 를 상속받아 이벤트 에디터를 만드는데, 이벤트 객체를 받아 텍스트로 만드는 getAsText 를 만들고, 텍스트를 받아 이벤트 객체로 만드는 setAsText 를 만든다.





컨트롤러를 만들어서 url 을 GET 매핑해주고,

이벤트 에디터를 `@InitBinder` 에노테이션으로 등록하자.

```java
@RestController
public class RedEventController {

    // 이벤트 에디터 등록 (string → Object 변환)
    @InitBinder
    public void init(WebDataBinder webDataBinder) {
        webDataBinder.registerCustomEditor(RedEvent.class, new RedEventEditor());
    }

    @GetMapping("/event/{event}")
    public String getEvent(@PathVariable RedEvent event) {
        return event.getId().toString();
    }
}

```







테스트 코드

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
class RedEventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    public void getTest() throws Exception {
        mockMvc.perform(get("/event/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));
    }
}
```







---

## 컨버터와 포매터



기존에 사용했던 PropertyEditor 보다 조금 더 쉽게 데이터를 바인딩 해보자.



### Converter

컨버는 S 타입을 T 타입으로 변환할 수 있는 일반적 변환기이다. 상태정보가 없으므로(stateless) 스레드-세이프하다.

ConvertRegistry에 등록해서 사용하면 된다.



```java
import org.springframework.core.convert.converter.Converter;

public class RedEventConverter {

    public static class StringToEventConverter implements Converter<String, RedEvent> {

        @Override
        public RedEvent convert(String source) {
            return new RedEvent(Integer.parseInt(source));
        }
    }

    public static class EventToStringConverter implements Converter<RedEvent, String> {

        @Override
        public String convert(RedEvent source) {
            return source.getId().toString();
        }
    }
}

```

서로 간의 형변환을 어떻게 할 것인가 정의해주면 된다.





### Formatter

Object 와 String 간 변환을 담당한다. 문자열을 Locale 에 따라 다국화하는 기능을 제공한다 (선택)

FormaterRegistry에 등록해서 사용한다.

```java
import org.springframework.format.Formatter;

import java.text.ParseException;
import java.util.Locale;

public class RedEventFormatter implements Formatter<RedEvent> {

    @Override
    public RedEvent parse(String text, Locale locale) throws ParseException {
        return new RedEvent(Integer.parseInt(text));
    }

    @Override
    public String print(RedEvent redEvent, Locale locale) {
        return redEvent.getId().toString();
    }
}

```

포매터의 데이터 바인딩 방법이다. parse 와 print 메소드를 오버라이딩해준다. 이는 위에서 두 convert 메소드와 비슷하다.



<br />

**WebConfig**

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
      // Converter 
			// registry.addConverter(new RedEventConverter.StringToEventConverter());
      
      // Formatter
        registry.addFormatter(new RedEventFormatter());
    }
}
```

웹 설정파일을 하나만들어서 컨버터 또는 포맷터를 빈으로 등록(@Configuration)할 수 있도록 한다.

Formatter는 실제로 Converter를 상속받고 있기 때문에, FormatterRegistry에 컨버터와 포매터 둘다 등록할 수 있다.



<br />

**스프링 부트 & 컨버터, 포매터**



ConversionService 는 쓰레드-세이프한 변환 작업을 할 수 있다. 스프링 MVC, 빈 설정, spEL 등에서 사용한다.

`DefaultFormattingConversionService` 는 FormatterRegistry 와 ConversionService 를 상속받는다. (FormatterRegistry 는 ConverterRegistry를 상속받는다.)

그리고 `WebConversionService` 는 DefaultFormattingConversionService를 상속받는다.



**스프링부트에서는  WebConversionService 을 빈으로 등록해주고, Formatter와 Converter를 찾아 빈으로 자동 등록해준다.**

컨버터안의 클래스 메소드나 포매터를 @Component 에노테이션을 붙여 빈으로 등록하면, 스프링부트 실행시 알아서 이들을 빈으로 등록시켜주기 때문에 위의 **WebConifg 파일은 설정할 필요가 없다.**





컨버터에서 애노테이션 예시

```java
public class RedEventConverter {
  
		@Component
    public static class StringToEventConverter implements Converter<String, RedEvent> {
			...
    }
  
		@Component
    public static class EventToStringConverter implements Converter<RedEvent, String> {
			...
    }
}
```



포매터에서 어노테이션 예시

```java
@Component
public class RedEventFormatter implements Formatter<RedEvent> {
	...
}
```





#### 따라서 데이터 바인딩을 할 때 추천하는 방법은, 포매터를 작성한 후, 애노테이션으로 빈을 등록하여 스프링부트를 실행시키면된다.







**테스트 코드**

스프링부트를 이용해서 위에서 만들었던 컨트롤러를 테스트해보자.

```java
@WebMvcTest({
        RedEventConverter.StringToEventConverter.class,
        RedEventFormatter.class,
        RedEventController.class})
class RedEventControllerTest {
	...
}
```

`@WebMvcTest` 에 테스트에 사용될 빈 들을 배열로 입력해주면 된다.























