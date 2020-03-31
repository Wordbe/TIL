# Spark 02 - 실행

## 1 실행 방법

스파크 애플리케이션은 Scala, Java, Python, R 로 구현할 수 있습니다. 각 언어로 Spark SQL 실행도 가능합니다. 스파크 애플리케이션은 jar 파일로 묶어서 실행거나, REPL 환경에서 실행할 수 있습니다.

<br>

### 언어별 실행 스크립트

스파크를 다운 받아서 `bin` 디렉토리에 들어가면, 언어별 실행할 수 있는 스크립트를 확인할 수 있습니다.

```shell
# bin 폴더 실행 파일 
-rwxr-xr-x 1 root root 1099 Nov 16  2016 beeline
-rw-r--r-- 1 root root 2143 Nov 16  2016 load-spark-env.sh
-rwxr-xr-x 1 root root 3265 Nov 16  2016 pyspark       // 파이썬 
-rwxr-xr-x 1 root root 1040 Nov 16  2016 run-example
-rwxr-xr-x 1 root root 3126 Nov 16  2016 spark-class
-rwxr-xr-x 1 root root 1049 Nov 16  2016 sparkR        // R
-rwxr-xr-x 1 root root 3026 Nov 16  2016 spark-shell   // scala repl
-rwxr-xr-x 1 root root 1075 Nov 16  2016 spark-sql     // spark on sql
-rwxr-xr-x 1 root root 1050 Nov 16  2016 spark-submit  // scala jar
```

<br>

### 스파크 애플리케이션 제출(spark-submit)

Scala, Java로 작성한 스파크 애플리케이션을 jar 파일로 만들어 `spark-submit`을 이용해 실행할 수 있습니다.

```shell
# spark-submit 실행 옵션 
$ ./bin/spark-submit \
  --class <main-class> \
  --master <master-url> \
  --deploy-mode <deploy-mode> \
  --conf <key>=<value> \
  ... # other options
  <application-jar> \
  [application-arguments]

# 클러스터 매니저가 yarn인 경우 실행 방법 
$ spark-submit --master yarn \
  --queue spark_queue \
  --class sdk.spark.SparkWordCount \
  --conf spark.shuffle.service.enabled=true \
  ./Spark-Example.jar
```

<br>

### 설정값

`spark-submit`을 이용할 때의 설정값은 다음과 같습니다.

| 설정              | 비고                                                         |
| :---------------- | :----------------------------------------------------------- |
| --master          | 클러스터 매니저 설정                                         |
| --deploy-mode     | 드라이버의 디플로이 모드 설정                                |
| --class           | main 함수가 들어 있는 클래스 지정                            |
| --name            | 애플리케이션의 이름 지정. 스파크 웹 UI에 표시                |
| --jars            | 애플리케이션 실행에 필요한 라이브러리 목록. 콤마로 구분      |
| --files           | 애플리케이션 실행에 필요한 파일 목록                         |
| --queue           | 얀의 실행 큐이름 설정                                        |
| --executor-memory | 익스큐터가 사용할 메모리 바이트 용량. 512m. 1g 등도 사용 가능 |
| --driver-memory   | 드라이버 프로세스가 사용할 메모리 바이트 용량. 512m. 1g 등도 사용 가능 |
| --num-executors   | 익스큐터의 개수 설정                                         |
| --executor-cores  | 익스큐터의 코어 개수 설정                                    |

 <br>

### deploy(배포) 모드

| 설정    | 비고                                       |
| :------ | :----------------------------------------- |
| client  | 프로그램을 실행하는 노드에서 드라이버 실행 |
| cluster | 클러스터 내부의 노드에서 드라이버 실행     |

<br>

### 클러스터 매니저 설정

| 설정            | 비고                                                 |
| :-------------- | :--------------------------------------------------- |
| spark://ip:port | 스파크 standalone 클러스터 사용                      |
| mesos://ip:port | 아파치 Mesos(메조스) 사용                            |
| yarn            | 하둡 얀 클러스터. HADOOP_CONF_DIR 설정 참조하여 처리 |
| local           | 로컬모드에서 싱글코어로 실행                         |
| local[N]        | 로컬모드에서 N개 코어로 실행                         |

<br>

### 스파크 애플리케이션 REPL 처리

스파크는 REPL 환경을 이용한 작업 처리도 지원합니다. `spark-shell`, `pyspark`를 실행하면 REPL 환경에서 인터랙티브하게 작업을 처리할 수 있습니다. `spark-shell`은 스칼라, `pyspark`는 파이썬을 지원합니다. 각 쉘을 실행할 때 옵션을 설정하여 클러스터 매니저를 지정할 수 있습니다.

<br>

### spark-shell 환경

스칼라를 이용한 처리는 `spark-shell` 을 이용합니다.

```shell
$ spark-shell --master yarn --queue queue_name
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel).
19/01/03 08:40:29 WARN Client: Neither spark.yarn.jars nor spark.yarn.archive is set, falling back to uploading libraries under SPARK_HOME.
19/01/03 08:40:36 WARN SparkContext: Use an existing SparkContext, some configuration may not take effect.
Spark context Web UI available at http://127.0.0.1:4040
Spark context available as 'sc' (master = yarn, app id = application_1520227878653_37974).
Spark session available as 'spark'.
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 2.0.2
      /_/

Using Scala version 2.11.8 (OpenJDK 64-Bit Server VM, Java 1.8.0_121)
Type in expressions to have them evaluated.
Type :help for more information.

scala> 
```

<br>

### 설정값 변경

설정값은 `spark-submit`과 같습니다. 아래와 같이 사용하면 됩니다.

```shell
# jar 파일 추가 
$ spark-shell --master yarn \
                 --queue queue_name \
                 --jars a.jar,b.jar,c.jar \
                 --conf spark.shuffle.service.enabled=true
```

<br>

### pyspark 환경

파이썬을 이용한 처리는 `pyspark`를 이용합니다.

```shell
$ pyspark --master yarn --queue queue_name
Python 2.7.12 (default, Sep  1 2016, 22:14:00) 
[GCC 4.8.3 20140911 (Red Hat 4.8.3-9)] on linux2
Type "help", "copyright", "credits" or "license" for more information.
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel).
19/01/03 08:46:58 WARN Client: Neither spark.yarn.jars nor spark.yarn.archive is set, falling back to uploading libraries under SPARK_HOME.
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /__ / .__/\_,_/_/ /_/\_\   version 2.0.2
      /_/

Using Python version 2.7.12 (default, Sep  1 2016 22:14:00)
SparkSession available as 'spark'.
>>> 
```

<br>

### 모니터링

스파크 컨텍스트가 초기화되면 모니터링을 위한 웹UI가 생성됩니다. 스파크 쉘을 실행하면 다음과 같이 웹 UI 주소를 확인할 수 있습니다. 여기서 애플리케이션의 실행 상황을 확인할 수 있습니다.

```shell
Spark context Web UI available at http://127.0.0.1:4040
```

![spark web ui](https://i.stack.imgur.com/xjQwI.png)

<br>

---

## 1 스파크 쉘

스파크 쉘의 주요 명령어를 알아보겠습니다. **스파크쉘에서 명령어는 콜론(:)과 함께 입력**하면 됩니다.

| 명령어              | 비고                                                         |
| :------------------ | :----------------------------------------------------------- |
| help                | 지원하는 명령어를 출력                                       |
| history [num]       | 입력한 명령어를 출력. 출력할 명령어의 개수를 함게 입력할 수 있음 |
| paste [-raw] [path] | 명령어를 한줄씩 인식하지 않고 한번에 처리할 수 있게 입력.    |
| settings            | 스파크 설정값을 변경.                                        |
| quit                | 종료                                                         |

```shell
scala> :help
All commands can be abbreviated, e.g., :he instead of :help.
:edit <id>|<line>        edit history
:help [command]          print this summary or command-specific help
:history [num]           show the history (optional num is commands to show)
:h? <string>             search the history
:imports [name name ...] show import history, identifying sources of names
:implicits [-v]          show the implicits in scope
:javap <path|class>      disassemble a file or class name
:line <id>|<line>        place line(s) at the end of history
:load <path>             interpret lines in a file
:paste [-raw] [path]     enter paste mode or paste a file
:power                   enable power user mode
:quit                    exit the interpreter
:replay [options]        reset the repl and replay all previous commands
:require <path>          add a jar to the classpath
:reset [options]         reset the repl to its initial state, forgetting all session entries
:save <path>             save replayable session to a file
:sh <command line>       run a shell command (result is implicitly => List[String])
:settings <options>      update compiler options, if possible; see reset
:silent                  disable/enable automatic printing of results
:type [-v] <expr>        display the type of an expression without evaluating it
:kind [-v] <expr>        display the kind of expressions type
:warnings                show the suppressed warnings from the most recent line which had any
```

<br>

### 설정값 변경

스파크 쉘에서 스파크의 설정값을 변경할 때는 `:setting`을 이용합니다.

```shell
scala> :settings spark.debug.maxToStringFields=100
```

<br>

### 로그 출력

**스파크 쉘에서 로그를 출력할 때는 스파크 컨텍스트의 로그 레벨을 변경**합니다.

```shell
scala> sc
res16: org.apache.spark.SparkContext = org.apache.spark.SparkContext@1fb8b4d8

# 기본 정보만 출력 
scala> sc.setLogLevel("INFO")

# 디버그 모드. YARN과 통신데이터가 계속 출력 
scala> sc.setLogLevel("DEBUG")

# 기본 설정값 
scala> sc.setLogLevel("WARN")
```





---

**Reference**

https://wikidocs.net/26793