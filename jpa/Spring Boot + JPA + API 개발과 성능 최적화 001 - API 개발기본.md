# Spring Boot + JPA + API 개발과 성능 최적화 001 - API 개발기본



# API 개발 기본

* postman 설치



### 회원 생성

엔티티 대신 DTO 를 만든다.

* 이렇게하면 엔티티를 외부에 노출하지 않을 수 있다.
* DTO에서 검증(validation)을 한다.
* 자주 바뀌는 API 스펙에 대해 유연하게 대처할 수 있다.
* API 스펙이 바뀌거나 엔티티 필드가 바뀌어도 쉽게 오류를 잡을 수 있다.

```java
@RequiredArgsConstructor
@RestController
public class MemberApiController {

    private final MemberService memberService;

    @PostMapping("/api/v1/members")
    public CreateMemberResponse saveMemberV1(@RequestBody @Valid Member member) {
        Long memberId = memberService.join(member);
        return new CreateMemberResponse(memberId);
    }

    @PostMapping("/api/v2/members")
    public CreateMemberResponse saveMemberV2(@RequestBody @Valid CreateMemberRequest request) {
        Member member = new Member();
        member.setName(request.getName());

        Long memberId = memberService.join(member);
        return new CreateMemberResponse(memberId);
    }

    @Data
    static class CreateMemberResponse {
        private Long id;

        public CreateMemberResponse(Long id) {
            this.id = id;
        }
    }

    @Data
    static class CreateMemberRequest {
        @NotEmpty
        private String name;
    }
}
```

* v2 처럼 만드는 것이 좋다.



---

### 회원 조회



```java
@RequiredArgsConstructor
@RestController
public class MemberApiController {

  private final MemberService memberService;

  @GetMapping("/api/v1/members")
  public List<Member> memberV1() {
    return memberService.findMembers();
  }
}
```

* 엔티티는 그대 로 놔둔다.
* api 관련 기능을 엔티티에 추가하면, 다른 api 에서 동일 엔티티를 사용할 경우 수정이 필요할 수 있다.
* 프레젠테이션 레이어가 DB 계층에 관여하게 하지 말자.
* 엔티티의 필드가 바뀌었을 때, API 스펙이 바뀔 우려가 있다. → 장애가 난다.
* 응답 결과는 JSON 형식으로 `{ }` 나오는 것이 확장성을 위해 좋다. 스펙에도 맞아야 한다. 리스트 `[ ]` 를 반환하면 그렇지 못하다.



아래와 같이 수정하면, 응답객체와 DTO 를 만들어야 하지만, 운영/유지보수가 쉬운 구조를 만들 수 있다.

```java
@GetMapping("/api/v2/members")
public Result memberV2() {
  List<Member> members = memberService.findMembers();
  List<MemberDto> collect = members.stream()
    .map(m -> new MemberDto(m.getName()))
    .collect(Collectors.toList());

  return new Result(collect);
}

@Data
@AllArgsConstructor
static class Result<T> {
  private T data;
}

@Data
@AllArgsConstructor
static class MemberDto {
  private String name;
}
```

