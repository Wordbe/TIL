# Java 002 - 바이트코드 조작



## 코드 커버리지 : jacoco



jacoco 자바 코드 커버리지 플러그인 등록

**pom.xml**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.6</version>
      <executions>
        <execution>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>report</id>
          <phase>prepare-package</phase>
          <goals>
            <goal>report</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

```shell
$ mvn clean verify
```



**/target/site/jacoco/index.html** 을 브라우저에서 연다.

그러면 코드커버리지 화면이 나온다. 테스트를 했을 때 무슨 코드를 많이 썼는지, 적게 썼는지 통계 자료를 보여준다.

아래와 같이 커버리지 비율이 일정보다 낮을 경우 에러가 발생하게 플러그인 `execution` 을 조작할 수 있다.

```xml
<!-- 커버리지 비율 조절기능 -->
<execution>
	<id>jacoco-check</id>
  <goals>
		<goal>check</goal>
  </goals>
	<configuration>
    <rules>
			<rule>
        <element>PACKAGE</element>
        <limits>
					<limit>
						<counter>LINE</counter>
            <value>COVEREDRATIO</value>
            <minimum>0.50</minimum>
					</limit>
        </limits>
			</rule>
    </rules>
	</configuration>
</execution>
```



<br />

---

## 바이트 코드 조작 : ByteBuddy

<br />

바이트 코드를 조작하는 다양한 라이브러리가 있다.

* ASM

> visitor 패턴, adapter 패턴

* Javasist

* ByteBuddy (추천) : 쉽고 편한 API 제공

  ```xml
  <!-- https://mvnrepository.com/artifact/net.bytebuddy/byte-buddy -->
  <dependency>
      <groupId>net.bytebuddy</groupId>
      <artifactId>byte-buddy</artifactId>
      <version>1.10.21</version>
  </dependency>
  ```

<br />

ByteBuddy 을 사용해보자.

```java
public class Hat {

    public String pullOut() {
        return "";
    }
}
```

```java
public class App 
{
    public static void main( String[] args ) {
        try {
            new ByteBuddy().redefine(Hat.class)
                    .method(named("pullOut")).intercept(FixedValue.value("비둘기!!"))
                    .make().saveIn(new File("/Users/path/project-name/target/classes/"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        // System.out.println(new Hat().pullOut());
    }
}
```

애플리케이션을 실행시키고, `/target/classes` 에서 컴파일된 `.class` 파일을 보자. 아래처럼 바이트코드가 조작이 되어 변경된 것을 확인할 수 있다.

```java
package co.wordbe;

public class Hat {
    public Hat() {
    }

    public String pullOut() {
        return "비둘기!!";
    }
}
```



이제 다시 한번 실행을 시키면, 비둘기!! 가 출력되는 것을 볼 수 있다.

```java
public class App 
{
    public static void main( String[] args ) {
//        try {
//            new ByteBuddy().redefine(Hat.class)
//                    .method(named("pullOut")).intercept(FixedValue.value("비둘기!!"))
//                    .make().saveIn(new File("/Users/path/project-name/target/classes/"));
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

        System.out.println(new Hat().pullOut());
    }
}
```



그런데 매번 바이트코드 조작을 위한 실행 한번, 실제 실행 한번을 하면 번거로워진다.

따라서 아래와 같이 코드를 변경할 수 있다. 

```java
public class App 
{
    public static void main( String[] args ) {
        ClassLoader classLoader = App.class.getClassLoader();
        TypePool typePool = TypePool.Default.of(classLoader);

        try {
            new ByteBuddy().redefine(
                    typePool.describe("co.wordbe.App").resolve(),
                    ClassFileLocator.ForClassLoader.of(classLoader))
                    .method(named("pullOut")).intercept(FixedValue.value("비둘기!!"))
                    .make().saveIn(new File("/Users/rdijin/rdiforest/workspace/the-java/target/classes/"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(new Hat().pullOut());
    }
}
```

하지만, `Hat()` 이라는 클래스가 다른 곳에서 먼저 불려졌다면 사실 원래 의도대로 작동하지는 못한다.

아래에서 해결책을 제시한다.



<br />

---

## javaagent



새로운 프로젝트를 만들자.



### Bytebuddy 바이트 조작 코드 생성

bytebuddy 를 추가한다.

**pom.xml**

```xml
<dependencies>
  <dependency>
    <groupId>net.bytebuddy</groupId>
    <artifactId>byte-buddy</artifactId>
    <version>1.10.21</version>
  </dependency>
</dependencies>
```

```java
public class AppAgent {

    public static void premain(String agentArgs, Instrumentation inst) {
        new AgentBuilder.Default()
                .type(ElementMatchers.any())
                .transform((builder, typeDescription, classLoader, javaModule) -> builder.method(named("pullOut")).intercept(FixedValue.value("비둘기!!"))).installOn(inst);
    }
}
```

<br />

### javaagent jar 파일 생성

이제 javaagent JAR 파일을 만들어보자.

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-jar-plugin</artifactId>
      <version>3.2.0</version>
      <configuration>
        <archive>
          <index>true</index>
          <manifest>
            <addClasspath>true</addClasspath>
          </manifest>
          <manifestEntries>
            <mode>development</mode>
            <url>${project.url}</url>
            <key>value</key>
            
            <Premain-Class>co.wordbe.AppAgent</Premain-Class>
            <Can-Redefine-Classes>true</Can-Redefine-Classes>
            <Can-Retransform-Classes>true</Can-Retransform-Classes>
            
          </manifestEntries>
        </archive>
      </configuration>
    </plugin>
  </plugins>
</build>
```

18줄에서 `Premain` 방식은 클래스 실행 전에 바이트 코드를 붙이는 것이다. `Agenttime` 으로하면 런타임 중에 동적으로 붙일 수도 있다.

instrumentation 을 사용한다.

이제 패키징을 하자.

```shell
$ mvn clean package
```

패키지 후 jar 위치 경로를 복사해준다.

```java
/Users/path/project-name/target/the-java-agent-1.0-SNAPSHOT.jar
```



이제 원래 프로젝트로 돌아가서 

`Edit Configuration > Application > App > Build and run 영역 중에서 Modify Options > Add VM Options`

를 들어가서 위 `-javaagent:복사한 경로` 를 입력하고 apply, ok 를 누른다.

이제 실행시키면 성공적으로 `비둘기!! `가 나오는 것을 확인할 수 있다.



이러한 방버은 클래스 로더의 로딩 시에 바이트 코드 조작을 한다. 기존 코드를 건드리지 않으므로 Transparent 하다고 한다. `.class` 파일의 내용은 바뀌지 않고, 코드를 실행하면 클래스 로더의 로딩 과정에서 바이트코드의 조작이 된다.

<br />

---

바이트 코드를 조작해서 다양한 응용이 가능하다.

1. 프로그램 분석 - 코드에서 버그를 찾는 툴, 코드 복잡도 계산
2. 클래스파일 생성 - 프록시(lazy 로딩, mock), 특정 API 호출 접근 제한, 스칼라 같은 언어의 컴파일러
3. 기타 - 프로파일러(newrelic(성능측정)), 최적화, 로깅 등 자바 소스를 건드리지 않고 코드 변경이 필요한 경우 사용한다.
4. 스프링이 컴포넌트 스캔을 하는 방법 (ASM)
   * 컴포넌트 스캔으로 빈으로 등록할 후보 클래스 정보를 찾는데 사용한다.
   * `ClassPathScanningCandidateComponentProvider` → `SimpleMetadataReader`
   * ClassReader, Visitor 패턴을 이용한다.



ASM, Javassist, ByteBuddy, CGlib 등을 참고하면 좋다.

