# Java 005 - 어노테이션 프로세서



어노테이션 프로세서로 소스를 컴파일 하기 전에 끼어들어서 또 다른 소스를 만들어줄 수 있다.



## 롬복

롬복은 애노테이션과 애노테이션 프로세서를 제공하여 표준적으로 작성해야할 코드를 대신 생성해주는 라이브러리이다.

여러 애노테이션 사용 가능.

`@Getter`, `@Setter`, `@RequiredContructor`,`@Data`, `@Value`, `@Builder` 등

`@Value` : immutable (수정은 안되고, 참조만 할 수 있게 된다.)



<br />

#### **사용방법**

1) 의존성 추가

```xml
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <version>1.18.16</version>
  <scope>provided</scope>
</dependency>
```

> scope 은 `provided` (compile 시에만 적용된다.) 로 설정하는 것이 바람직하다. 바이트코드(class파일)만 만들어주는 것이 목적이므로 런타임에서는 롬복이 전혀 적용될 필요가 없기 때문이다.
>
> 참고로 maven 에서 scope 의 기본값은 `compile` 인데 이는 compile, runtime 둘 다 적용되는 옵션이다.

2) Intellij lombok plugin 설치

3) Intellij Annotation Processor 활성화

<br />

#### **롬복 동작 원리**

롬복은 컴파일 시점에서 애노테이션 프로세서를 사용하여 소스코드의 AST(abstract syntax tree)를 조작한다. (원래 조작은 금지되어 있다..)

롬복은 자바가 제공하는 애노테이션 프로세서를 기반으로 만들어졌다. 컴파일시 끼어들어서 작동한다. 특정 애노테이션이 붙어있는 소스코드를 참조해서 다른 소스코드를 만들어낼 수 있다. 소스의 구조를 트리 형식으로 볼 수 있다. AST 는 원래 참조만 가능할 뿐 소스코드를 수정할 수는 없다.

하지만 롬복을 사용하면 결과적으로 바이트코드에 코드가 바뀌어서 들어오게 된다. 참조만 하는 것이 아니라, 특정 하위 클래스 타입으로 트릭을 써서(?) 코드를 조작한다. 일종의 해킹이다. 롬복을 개발한 개발자 중의 한 명이 non-public API 라 밝혔고 일종의 hack 이라고 말했다.



> 논란 거리
>
> * 공개된 API 가 아닌 컴파일러 내부 클래스를 사용하여 기존 소스 코드를 조작한다.
> * 이클립스의 경우 java agent를 사용해서 컴파일러 클래스까지 조작하여 사용한다. 공개된 API가 아니므로 버전 호환성 문제도 있다.
> * 그럼에도 불구하고 엄청난 편리함때문에 널리 쓰이고 있다. 롬복의 편의성을 대체하기 어렵다.
> * 다른 대안들 AutoValue, Immutables



<br />

---

## 애노테이션 프로세서

<br />

새로운 프로젝트를 열어서 어노테이션 프로세스를 만들어보자. 결과물을 jar 파일로 받아서, 다른 프로젝트에서 이용하도록 할 것이다.

`@Magic` 어노테이션을 만들어보자.

```java
@Target(ElementType.TYPE) // interface, class, enum
@Retention(RetentionPolicy.SOURCE)
public @interface Magic {
}
```

다음으로는 어노테이션 프로세서를 만들어보자

```java	
public class MagicMojaProcessor extends AbstractProcessor {

  @Override
  public Set<String> getSupportedAnnotationTypes() {
    return Set.of(Magic.class.getName());
  }

  @Override
  public SourceVersion getSupportedSourceVersion() {
    return SourceVersion.latestSupported();
  }

  @Override
  public boolean process(Set<? extends TypeElement> set, RoundEnvironment roundEnv) {
    Set<? extends Element> elements = roundEnv.getElementsAnnotatedWith(Magic.class);

    // interface 타입만 어노테이션 붙이기 허용하고 싶음
    for (Element element : elements) {
      Name elementName = element.getSimpleName();
      
      // interface 가 아닐 때에는 에러 메시지 출력
      if (element.getKind() != ElementKind.INTERFACE) {
        processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR, "Allowed Type : interface, not " + elementName);
      } else {
        processingEnv.getMessager().printMessage(Diagnostic.Kind.NOTE, "Processing " + elementName);
      }

    }
    return true;
  }
}
```

> `AbstractProcessor` 와 같은 Processor 인터페이스를 통해서 여러 라운드(rounds)에 걸처 소스 및 커파일 된 코드를 처리할 수 있다.

<br />

main 폴더 아래에`/resources/META-INF/services` 폴더를 만든다.

그리고 `javax.annotation.processing.Processor` 파일을 만들어서, 방금 만든 프로세서의 풀 패키지 네임을 적어준다.

> 이런 파일을 manifest 파일이라 한다.

```shell
co.wordbe.magic.MagicMojaProcessor
```



일단 방금 적은 것을 주석 처리하고, 메이븐 install 을 해보자.

주석 처리한 이유는 install 시에 `MagicMojaProcessor.class` 클래스 파일이 먼저 필요하기 때문이다. 즉, `MagicMojaProcessor.java` 를 먼저 컴파일해놓아서 바이트코드를 만들어 놓아야 한다.

```shell
$ mvn clean install
```

이제 `/target` 에 해당 클래스파일이 생성되었다면 다시, 메이븐을 install 해보자. (클래스파일이 있어야하니, clean 을 하면 안되겠다.)

```shell
$ mvn install
```



<br />

> **AutoService**
>
> 위에 과정을 손쉽게 만들어주는 라이브러리가 `AutoService` 이다. 이 역시 어노테이션 프로세서 원리로 만들어졌다.
>
> `java.util.ServiceLoader` 용 파일 생성 유틸리티이다.
>
> `/resources/META-INF/services` 아래 `co.wordbe.magic.MagicMojaProcessor` 리소스파일을 만들어준다.
>
> 라이브러리 의존성을 추가하고 아래처럼 사용하면 된다.
>
> ```xml
> <dependency>
>     <groupId>com.google.auto.service</groupId>
>     <artifactId>auto-service</artifactId>
>     <version>1.0-rc7</version>
> </dependency>
> ```
>
> 
>
> ```java
> @AutoService(Processor.class)
> public class MagicMojaProcessor extends AbstractProcessor { ... }
> ```
>
> ```shell
> $ mvn clean install
> ```



> `ServiceProvider`
>
> AutoService 는 ServiceProvider 개념이 담겨있다. 확장 포인트를 제공한다.

<br />

이제 타겟 디렉토리에서 `magic-moja-1.0.-SNAPSHOT.jar` 파일이 만들어진 것을 확인할 수 있다.

이 파일을 로컬에 가지고 있다면, 다른 프로젝트에서 의존성을 추가하여 이 파일을 불러와 사용할 수 있다. 

```xml
<dependency>
	<groupId>co.wordbe</groupId>
  <artifactId>magic-moja</artifactId>
  <version>1.0-SNAPSHOT</version>
</dependency>
```



<br />

---

## 어노테이션 프로세서 (이어서)

위에서 만들었던 어노테이션 프로세서를 완성해보자.

> * `javax.annotation.processing.Filer`
>
> Filer 인터페이스는 소스 코드, 클래스 코드 및 리소스를 생성할 수 있는 인터페이스이다.



소스코드 생성 유틸리티로 `javapoet` 이 있다. 의존성을 추가해서 사용해보자.

```xml
<dependency>
  <groupId>com.squareup</groupId>
  <artifactId>javapoet</artifactId>
  <version>1.13.0</version>
</dependency>
```

```java
public class MagicMojaProcessor extends AbstractProcessor {
  ...

    @Override
    public boolean process(Set<? extends TypeElement> set, RoundEnvironment roundEnv) {
      Set<? extends Element> elements = roundEnv.getElementsAnnotatedWith(Magic.class);

      // interface 타입만 어노테이션 붙이기 허용하고 싶음
      for (Element element : elements) {
        Name elementName = element.getSimpleName();

        // interface 가 아닐 때에는 에러 메시지 출력
        if (element.getKind() != ElementKind.INTERFACE) {
          processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR, "Allowed Type : interface, not " + elementName);
        } else {
          processingEnv.getMessager().printMessage(Diagnostic.Kind.NOTE, "Processing " + elementName);
        }

        // ---------------------------------------------------------------
        // 이제 Filer를 가지고 소스 코드를 생성해보자.
        TypeElement typeElement = (TypeElement) element;
        ClassName className = ClassName.get(typeElement);

        MethodSpec pullOut = MethodSpec.methodBuilder("pullOut")
          .addModifiers(Modifier.PUBLIC)
          .returns(String.class)
          .addStatement("return $S", "Rabbit")
          .build();

        TypeSpec magicMoja = TypeSpec.classBuilder("MagicMoja")
          .addModifiers(Modifier.PUBLIC)

          // @Magic 애노테이션이 붙어있는 인터페이스의 이름을 구현하는 구현체로 리턴값을 받을 수 있도록 한다.
          // Moja moja = new MagicMoja();
          .addSuperinterface(className)

          .addMethod(pullOut)
          .build();

        Filer filer = processingEnv.getFiler();
        try {
          JavaFile.builder(className.packageName(), magicMoja).build().writeTo(filer);
        } catch (IOException e) {
          processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR, "FATAL ERROR: " + e);
        }
      }
      return true;
  }
}
```



이렇게하면 `MagicMoja.java` 파일이 만들어진다.

```java
public class MagicMoja implements Moja {
  public String pullOut() { return "Rabbit!"; }
}
```

그런데 IDE 에서 MagicMoja 를 타이핑해보니, 빨간 줄에러가 난다. `/target` 디렉토리에 있으면 IDE 가 인식을 하지 못한다.

<br />

어노테이션 프로세서로 만들어진 클래스파일을 인텔리제이에서 사용하는 방법은 아래와 같다.

1) `⌘ + ;` 단축키를 사용해서 Preferences 에 들어간다. Annotation Processors > Enable anootation processing 박스를 체크한다.

2) `⌘ + ;` > Modules 에 들어간다. `/target/generated-sources/annotations` 폴더를 클릭하고 이를  소스로 인식할 수 있도록 Source 탭을 누른다. (이 폴더안에 어노테이션 프로세서가 만들어주었던 `MagicMoja.java `파일이 생긴다.)

<br />

---

이제 Moja 인터페이스에 @Magic 애노테이션을 붙이고,

```java
@Magic
public interface Moja {

    String pullOut();
}

```

pullOut 메소드를 실행시켜보자.

```java
public class App
{
  public static void main( String[] args ) {
    Moja moja = new MagicMoja();
    System.out.println(moja.pullOut());
}
```

```shell
Rabbit!!
```

<br />

---



애노테이션 프로세스 사용 예

* `@Override` : 오버라이딩 함수가 아닌 함수 위에 이 어노테이션을 붙이면 컴파일 시 에러를 발생시켜주는 고마운 애노테이션이다.
* `Dagger2` : 컴파일 타임에 DI 을 지원한다. 런타임시 시간을 절약할 수 있다. 즉, 런타임 비용이 사라진다.
* 안드로이드 라이브러리
  * `ButterKnife` : `@BindView`는 뷰 아이디와 애노테이션을 붙인 필드를 바인딩시켜준다.
  * `DeepLinkDispatch` : 특정 URI 링크를 Activity 로 연결할 때 사용한다.

