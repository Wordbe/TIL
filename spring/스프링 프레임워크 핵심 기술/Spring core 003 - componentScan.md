# Spring core 003 - @ComponentScan, 빈 스코프







## ComponentScan

스프링부트 어노테이션인 `@SpringBootApplication` 은 `@ComponentScan` 을 포함하고 있다.

`@SpringBootApplication` 이 Application 클래스 위에 붙어있다고 해보자.

컴포넌트 스캔은 빈을 찾아 등록하는데, 스캔하는 범위는 Application 와 같은 경로에 있는 모든 파일 / 하위 파일들이다.



`@ComponentScan` 은 @Repository`, `@Service`, `@Controller`, `@Configuration` 을 포함하고 있다.

또한 스캔할 애노테이션을 필터할 수 있는 기능도 제공한다.



컴포넌트 스캔에서 초기에 등록해야할 빈이 많을 경우, 초기 구동 시간이 오래 걸릴 수 있다. 하지만 일단 구동이 되면 후에 느려지진 않는다. 이를 방지하려고 한다면 function 을 이용해 빈을 등록할 수 있다.

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        var app = new SpringApplication(DemoApplication.class);
        app.addInitializers((ApplicationContextInitializer<GenericApplicationContext>) ctx -> {
          	// initialize 사용하여 함수형 빈을 등록할 수 있다. (람다식으로 변경)
            ctx.registerBean(CarService.class);
          
          	// ApplicationRunner 와 Supplier로 사용자 함수를 실행시킬 수도 있다.
            ctx.registerBean(ApplicationRunner.class, () -> args1 -> System.out.println("함수형 빈 정의"));
        });
        app.run(args);
    }
}

```



<br />

---

## Bean Scope



빈의 스코프 기본값은 싱글톤이다. 객체의 인스턴스가 1개만 만들어지고, 재사용되는 방법이다. 자원관리 면에서 효율적이다.

반면, 여러 인스턴스를 필요로 할 때는 프로토타입을 쓴다. 종류로는 Request, Session, Websocket 등이 있다.



프로토타입 빈이 싱글톤 빈을 참조하면 문제가 없지만,

싱글톤 빈이 프로토타입 빈을 참조하면 여러 인스턴스를 사용하려는 의도와 맞지 않는 결과가 생긴다.





해결방법은 Scope 어노테이션에 proxyMode를 `ScopedProxyMode.TARGET_CLASS` 로 설정해주는 것이다.

이렇게 되면 다른 라이브러리를 참조하여 Prototype 객체를 프록시로 감싸서 새로운 빈을 만들어 준다.

그럼 그 빈은 싱글톤이 참조하여도 여러 인스턴스를 호출할 수 있게 된다.

```java
@Component 
@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class Prototype {
}
```



그 외에도 Object-Provider, Provider(표준) 가 있다.





Runner를 하나 만들어서 아래와 같이 확인할 수 있다.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    ApplicationContext ctx;

    @Override
    public void run(ApplicationArguments args) throws Exception {
     		// 3개 모두 같은 인스턴스
        System.out.println("singleton");
        System.out.println(ctx.getBean(Single.class));
        System.out.println(ctx.getBean(Single.class));
        System.out.println(ctx.getBean(Single.class));	
      
        // 3개 모두 다른 인스턴스
        System.out.println("prototype");
        System.out.println(ctx.getBean(Prototype.class));
        System.out.println(ctx.getBean(Prototype.class));
        System.out.println(ctx.getBean(Prototype.class));

      	// 3개 모두 다른 인스턴스
        System.out.println("prototype referred by singleton");
        System.out.println(ctx.getBean(Single.class).getPrototype());
        System.out.println(ctx.getBean(Single.class).getPrototype());
        System.out.println(ctx.getBean(Single.class).getPrototype());
    }
}

```

