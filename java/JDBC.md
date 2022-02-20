# JDBC

- tomcat-jdbc-pool 과 hikariCP
- `commons-dbcp 1.x` 는 이해하고 있다고 가정
- Spring Boot 1.x 에서 기본 적용되는 `tomcat-jdbc-pool`
  - 기존 `commons-dbcp 1.x` 와 비교해서 동작 방식 및 사용 방법이 유사한데 성능 대폭 개선
- Spring Boot 2.x 에서 기본 적용되는 `hikariCP`
  - 기존의 모든 커넥션 풀을 압도하는 성능
  - 네트워크 장애 상황에서도 의도된 timeout 설정이 정상 동작하여 성능과 안정성 제공
  - 개발자의 기본 철학이 이전 다른 커넥션 풀과 달라 옵션 설정에 주의해야 한다.



> [Commons DBCP 이해하기](https://d2.naver.com/helloworld/5102792)
>
> - DB와 애플리케이션에서 발생하는 문제가 전체로 전파되지 않게 할 수 있다.
> - 커넥션의 개수 조정 가능
>   - initalSize
>   - maxActive : 동시에 사용할 수 있는 최대 커넥션 개수 (기본 8)
>   - maxIdle : 커넥션 풀에 반납할 때 최대로 유지되는 커넥션 개수 (기본 8)
>   - minIdle : 최소로 유지할 커넥션 개수 (기본 0)
> - 커넥션을 얻기 전 대기 시간 (maxWait)
>   - TPS (Transaction per Seconds)
>   - TPS 와 커넥션 개수와의 관계
>     - 커넥션 개수가 늘어나면 TPS 도 비례해서 증가
>     - 커넥션 개수를 무한정 늘릴 수는 없으므로, maxWait 과 같이 조절
>     - 적당한 maxWait 값은 톰캣 쓰레드풀 개수, 제한시간도 고려
> - maxWait 을 길게하면 (10초), 사용자가 2~3초 만에 응답이 안오는 것을 보고 다른 화면으로 간 경우가 자주 발생하며 이는 자원 낭비가 된다.
> - maxWait 을 너무 짧게하면, 과부하시 커넥션 풀에 여분의 커넥션이 없을 때마다 오류가 반환될 것이고, 사용자는 오류메시지를 자주 보게 된다.
> - 과부하시 발생하는 오류가 간헐적 장애라면 일시적으로 maxWait을 줄인다.
> - 자주 발생한다면 Common DBCP 의 maxActive, Tomcat 의 maxThread 값을 동시에 늘려 커넥션과 쓰레드 자원을 늘린다.
> - 자원의 한도를 넘는다면, 애플리케이션 서버를 수평 확장해야 한다.
> - Evictor 쓰레드
>   - Common DBCP 내부에서 커넥션 자원을 정리하는 구성 요소이며, 별도의 쓰레드로 실행된다.
>   - 아래 설정 가능
>     - Evictor 쓰레드가 동작하는 간격 (기본 -1, 비활성화)
>     - Evictor 쓰레드 동작시 한번에 검사할 커넥션 개수
>     - Evictor 쓰레드 동작시 커넥션의 유휴 시간을 확인해 설정값 이상일 경우 커넥션 제거 (기본 30분)
>   - Evictor 쓰레드 동작시 커넥션풀에 잠금(lock)을 거므로, 자주 실행하면 서비스 실행에 부담을 준다.
> - 커넥션풀 세팅에는 애플리케이션에서 주로 사용되는 쿼리의 성격, 사용자가 대기 가능한 시간, DBMS 와 애플리케이션 서버의 자원, 발생가능한 예외 상황, Tomcat 설정 등 많은 요소 고려

> [JDBC Internal - 타임아웃의 이해](https://d2.naver.com/helloworld/1321)
>
> - WAS 와 DBMS 사이
> - DBCP 와 JDBC

