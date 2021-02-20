# Spring Web MVC 010 - 파일업로드, 다운로드





## 파일 업로드 - MultipartFile



MultipartFile 은 파일 업로드시 사용하는 메소드 아규먼트이다. `MultipartResolver` 라는 빈이 설정 되어 있어야 사용이 가능하다. 단, 스프링부트는 자동 설정이 되어있다. 이를 사용하면 POST 요청의 `multipart/form-data` 정보에 들어있는 파일을 참조할 수 있다.



간단한 파일업로드를 구현해보자.

```java
@Controller
public class FileController {

    @GetMapping("/files")
    public String fileUploadForm(Model model) {
        return "files/index";
    }

    @PostMapping("/files")
    public String fileUpload(@RequestParam MultipartFile file,
                             RedirectAttributes attributes) {
        // save
        String message = file.getOriginalFilename() + " is uploaded.";
        attributes.addFlashAttribute("message", message);
        return "redirect:/files";
    }

}
```





**resources/files/index.html**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>File Index</title>
</head>
<body>

<div th:if="${message}">
    <h2>업로드 된 파일</h2>
    <h3 th:text="${message}" />
</div>

<form method="POST" enctype="multipart/form-data" action="#" th:action="@{/files}">
    File: <input type="file" name="file"/>
    <input type="submit" value="Upload"/>
</form>
</body>
</html>
```

화면에서 14 라인의 form 을보면, POST 요청에 인코딩타입을 `multipart/form-data` 로 보내준다. 그러면 데이터는 th:action에 적힌 `/files` URL로 도착한다.

> \<form action="#"\>  은 현재 페이지와 같은 페이지(URL)로 submit 을 하게 된다.

<br />

테스트코드는 아래와 같이 구현할 수 있다. 파일을 POST 요청에 담아보내야 하는데 `MockMultipartFile` 를 사용해서 이름, 원래파일이름, content-type, 내용을 담아주면 된다.

```java
@SpringBootTest
@AutoConfigureMockMvc
class FileControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  public void fileUploadTest() throws Exception {
    // Given
    MockMultipartFile file = new MockMultipartFile(
      "file",
      "test.txt",
      "text/plain",
      "For test".getBytes());

    // When
    this.mockMvc.perform(multipart("/files").file(file))
    // Then
      .andDo(print())
      .andExpect(status().is3xxRedirection())
      ;
  }
```

컨트롤러의 응답은 redirect 였으므로 `is3xxRedirection` 메소드로 검사하면 된다.



> 추가로 여러 파일을 업로드하려면 아규먼트로 `List<MultipartFile>` 을 사용하는 등 응용할 수 있다.
>
> 파일 업로드에 관련된 스프링 부트 설정 클래스는 `MultipartAutoConfiguration`, `MultipartProperites` 가 있다.

<br />

---

## 파일 다운로드



### ResponseEntity







우선 다운로드할 파일이 서버에 있어야 하므로, 이미지를 구해서 `/resources `아래에 옮겨 놓는다.



그리고 다운로드 컨트롤러를 만들어보자.

```java
@Controller
public class FileController {

    @Autowired
    private ResourceLoader resourceLoader;

    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> fileDownload(@PathVariable String filename) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:" + filename);
        File file = resource.getFile();

        Tika tika = new Tika();
        String mediaType = tika.detect(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment;filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, mediaType)
                .header(HttpHeaders.CONTENT_LENGTH, file.length() + "")
                .body(resource);
    }

}
```

* 스프링 `ResourceLoader` 를 통해 파일 리소스를 읽어온다.

* 미디어타입(파일의 종류)을 알아내기 위해 `tika` 라이브러리를 이용하면 편리하다. 의존성을 추가한다.

  build.gradle

  ```shell
  // Find a file Media-type
  implementation 'org.apache.tika:tika-core:1.25'
  ```

* 파일 다운로드의 응답으로 헤더에 설정할 내용들이 있다.

  * `CONTENT_DISPOSITON` : 사용자가 파일을 다운받을 때 파일의 이름을 정할 수 있다.
  * `CONTENT_TYPE` : 컨텐츠 타입은 tika 를 이용해서 미디어타입(`image/jpg`, `image/png` 등) 을 알아낸다.
  * `CONTENT_LENGTH` : 컨텐츠의 길이를 말해준다.
  * `ResponseEntity` 는 응답 상태코드, 응답 헤더, 응답 본문을 만들어서 브라우저에 반환해준다.



