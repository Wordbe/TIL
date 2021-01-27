# Spring REST API 06 - Spring REST Docs



Spring REST Docs 는 소스에 관한 설명을 제공할 수 있는 정형화된 documents 를 만드는 기능을 제공한다.

Docs 를 만들 때 swagger 를 사용할 수도 있지만, Spring REST Docs 로 만들어보자.

Spring Docs 에서 문서 조각을 `snippets` 라 한다. 문서 조각이 모인 Docs를 `Asciidoctor` 조립하여 HTML 문서를 만든다.





테스트

* MockMvc
* WebTestClinet
* REST Aussured 등등

<br />

REST Docs 를 사용해보자.

pom.xml 에 REST Docs 의존성을 추가한다.

```xml
<dependency>
  <groupId>org.springframework.restdocs</groupId>
  <artifactId>spring-restdocs-mockmvc</artifactId>
  <scope>test</scope>
</dependency>
```



이제 테스트 클래스에 `@AutoConfigureRestDocs` 어노테이션을 붙이고, `.andDo(document("제목"))` docs 파일을 만들어보자

스프링부트에서 REST Doc 자동설정은 `@AutoConfigureRESTDocs` 를 사용하면 된다.

```java
@SpringBootTest
@AutoConfigureRestDocs
public class EventControllerTest {
  ...
		@Test
    public void createEvent() throws Exception {
    ...
    mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaTypes.HAL_JSON)
                    .content(objectMapper.writeValueAsString(event))
                        )
                .andDo(print())
                .andExpect(status().isCreated())
                .andDo(document("create-event")) // Document 생성
                ;
  }
}
```

실행시키면 `target/generated-snippets/` 에 create-event 폴더가 생기고, docs 파일들이 만들어진다.

* `andDo(document("문서이름", snippets))` 의 형태로 사용하면 된다. 





<br />

---

### RestDocMockMvc 커스터마이징



커스마이징할 설정 파일을 test 폴더 하위에 놓으면 된다.

**test/common/RestDocsConfiguration.java**

```java
...
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;

@TestConfiguration
public class RestDocsConfiguration {

    @Bean
    public RestDocsMockMvcConfigurationCustomizer restDocsMockMvcConfigurationCustomizer() {
        return configurer -> configurer.operationPreprocessors()
                .withRequestDefaults(prettyPrint())
                .withResponseDefaults(prettyPrint());
    }
}
```

`@TestConfiguration` 어노테이션을 붙이면 테스트 환경 설정을 수정할 수 있다.

여러 프로세서가 있는데 그 중 `pretty printer` 를 사용하였다. 조금 더 예쁘게 프린팅할 수 있다.

이로써 요청 본문과 응답 본문을 '예쁘게' 문서화 시킬 수 있다.



```java
@SpringBootTest
@AutoConfigureRestDocs
@Import(RestDocsConfiguration.class)
public class EventControllerTest {
  ...
}
```

다시 실행하면 기존에 있던 것을 날리고, 덮어씌운다.





<br />

---

### 문서화



**링크 문서화**

```java
.andDo(document("create-event",
                links(
                  linkWithRel("self").description("link to self"),
                  linkWithRel("query-events").description("link to query events"),
                  linkWithRel("update-event").description("link to update event")
                )
               ))
```

links() 함수를 추가하면, 링크정보를 담은 `links.adoc` 파일이 생성된다.

<br />



**요청 헤더, 요청 필드 문서화**

```java
requestHeaders(
  headerWithName(HttpHeaders.ACCEPT).description("accept header"),
  headerWithName(HttpHeaders.CONTENT_TYPE).description("content type header")
),
requestFields(
  fieldWithPath("name").description("name of event"),
  ...
  fieldWithPath("limitOfEnrollment").description("limitOfEnrollment of event")
),
```

`request-headers.adoc`, `request-fields.adoc` 문서가 생성된다.

<br />

**응답 헤더, 응답 필드 문서화**

```java
responseHeaders(
  headerWithName(HttpHeaders.LOCATION).description("location header"),
  headerWithName(HttpHeaders.CONTENT_TYPE).description("content type header")
),
responseFields(
  fieldWithPath("id").description("id of event"),
  ...
  fieldWithPath("eventStatus").description("eventStatus of event"),
  fieldWithPath("_links.self.href").description("link to self"),
  fieldWithPath("_links.query-events.href").description("link to query events"),
  fieldWithPath("_links.update-event.href").description("link to update event")
)
```

응답의 경우 HATEOAS 를 위해 만든 _links 정보도 모두 입력해주어야 한다. 이렇게 모두 작성해주는 것이 바람직하다. 나중에 API 가 변경되었을 경우 보고 찾아서 판단할 수 있는 토대가 되기 때문이다.

<br />

모두 서술하는 것을 원하지 않는다면 일부만 서술하기 위해 `relaxedResponseFields` 를 사용한다.

```java
// 예시) 링크정보는 넣지 않음.
relaxedResponseFields(
  fieldWithPath("id").description("id of event"),
  ...
  fieldWithPath("eventStatus").description("eventStatus of event")
)
```

이렇게 해도 테스트 에러없이 다큐먼트를 만들 수 있다.

<br />

<br />

<br />

---

## REST Docs 문서 빌드하기



`/src/main/asciidoc/index.adoc` 폴더를 만들고, 문서 포맷과 내용을 복사한다.



pom.xml 에 플러그인을 추가한다.

```xml
<plugin>
  <groupId>org.asciidoctor</groupId>
  <artifactId>asciidoctor-maven-plugin</artifactId>
  <version>1.5.8</version>
  <executions>
    <execution>
      <id>generate-docs</id>
      <phase>prepare-package</phase>
      <goals>
        <goal>process-asciidoc</goal>
      </goals>
      <configuration>
        <backend>html</backend>
        <doctype>book</doctype>
      </configuration>
    </execution>
  </executions>
  <dependencies>
    <dependency>
      <groupId>org.springframework.restdocs</groupId>
      <artifactId>spring-restdocs-asciidoctor</artifactId>
      <version>${spring-restdocs.version}</version>
    </dependency>
  </dependencies>
</plugin>

<plugin>
  <artifactId>maven-resources-plugin</artifactId>
  <executions>
    <execution>
      <id>copy-resources</id>
      <phase>prepare-package</phase>
      <goals>
        <goal>copy-resources</goal>
      </goals>
      <configuration>
        <outputDirectory>
          ${project.build.outputDirectory}/static/docs
        </outputDirectory>
        <resources>
          <resource>
            <directory>
              ${project.build.directory}/generated-docs
            </directory>
          </resource>
        </resources>
      </configuration>
    </execution>
  </executions>
</plugin>
```



* line 10: `process-asciidoc` 은 asciidoc 아래 있는 모든 adoc 문서를 html로 변환해준다.
* line 34: `copy-resources` 는 소스 데이터 (generated-docs) 를 출력 디렉토리에 `/static/docs` 폴더 아래 만들어준다. 이 경로는 빌드 후에 `static` 폴더 아래 생기므로 `http://localhost:8080/docs/{파일이름.html}` 로 요청하면 화면에 html 화면이 나타날 수 있다.



이제 `mvn package` 를 실행하면, test 가 실행될 때 `process-asciidoc` 과 `copy-resources` 가 실행된다.

그렇다면 이제 애플리케이션을 실행시키면, [http://localhost:8080/docs/index.htm](http://localhost:8080/docs/index.html#resources-events-create) 에 접속이 가능할 것이다.

이 중 이벤트 생성의 url은 `http://localhost:8080/docs/index.html#resources-events-create`와 같다. 따라서 REST API의 self-descriptive message 조건을 위해 `create-event` 의 셀프 설명 문서는 위 url을 참고하도록 하자.



컨트롤러 수정.

```java
@PostMapping
public ResponseEntity createEvent(@RequestBody @Valid EventDto eventDto, Errors errors) {
  ...
  eventResource.add(new Link("/docs/index.html#resources-events-create").withRel("profile"));

  return ResponseEntity.created(createdUri).body(eventResource);
}
```



테스트 수정.

```java
links(
  ...
  linkWithRel("profile").description("link to profile")
),
...,
responseFields(
  ...
  fieldWithPath("_links.profile.href").description("link to profile")
)
```











































