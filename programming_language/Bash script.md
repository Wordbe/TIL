# Bash script

Windows 10, bash 환경에서 작업하였습니다.

cmd 열고

```
$ bash
```





**1) 출력하기**

```console
echo "hello world"
printf "hello world"
printf "%s %s" hello world
```

echo는 개행문자(줄바꿈)를 포함합니다.



---

**2) 주석**

`#` 기호로 시작





---

**3) 함수**

앞에 function을 붙여도 되고, 생략해도 됩니다.

overiding 되었을 시 코드 상 아래쓰인 함수가 작동합니다.

매개변수는 ${@} 형태로 받아옵니다.

```bash
echo_test(){
  echo "string test"
}

echo_test

function echo_test(){
  echo "string test 2"
  echo "factor: ${@}"
}

echo_test hi
```



**결과**

```console
string test
string test 2
factor: hi
```



---

### **4) 변수(Variable)**

"=" 기호 앞뒤로 공백없이 입력하면 대입연산자가 됩니다.

선언된 변수는 전역변수(global variable)입니다.

함수 안에서는 지역변수 사용하능 하고, 변수 명 앞에 `local`을 붙입니다.

변수 명 앞에 `export` 를 사용하면 환경변수(enviornment variable)로 설정되어 자식 스크립트에서 사용 가능합니다. 이 때 예약변수(reserved variable)와 겹치지않게 주의합니다.

환경변수는 `.bash_profile`에 저장합니다.



mybash.sh

```bash
# 전역변수 mystring
mystring="hello world"
echo ${mystirng}

function echo_test(){
  # 지역변수 mystring, 함수 호출 종료시 변수 삭제
  local mystring="local mystring"
  echo "${mystring}"
}

echo_test

# 전역변수 mystring
echo ${mystring}

# 환경변수 선언
export external="hi"
# 자식스크립트 호출
/mnt/d/wsl/mybash/export_test.sh
```

export_test.sh

```bach
echo ${external}
```



결과

```console
local mystring
hello world
hi
```



---

#### 예약변수

HOME - 사용자 홈 디렉토리

PATH - 실행 파일을 찾을 경로

LANG - 프로그램 실행시 기본 지원 언어

PWD - 현재 작업 디렉토리

FUNCNAME - 현재 함수이름

SECONDS - 스크립트가 실행된 시간(초)

SHLVL - 쉘 레벨(중첩된 길이를 나타냄)

SHELL - 로그인해서 사용하는 쉘

PRID - 부모 프로세스 PID

BASH - BASH 실행 파일 경로

BASH_ENV - 스크립트 실행시 BASH 시작 파일을 읽을 위치 변수

BASH_VERSION

BASH_VERSINFO

MIAL - 메일 보관 경로

MAILCHECK - 메일 확인 시간

OSTYPE - 운영체제 종류

TERM - 로긴 터미널 타입

HOSTNAME - 호스트 이름

HOSTTYPE - 시스템 하드웨어 종류

MACHTYPE - 머신 종류, 시스템 하드웨어 종류 상세

LOGNAME - 로그인 이름

UID - 사용자 UID

EUID - su명령에서 사용하는 사용자의 유효 아이디값

USER - 사용자 이름(=USERNAME)

GROUPS - 사용자 그룹

HISTFILE - `history`파일 경로

HISTFILESIZE - `history` 파일 크기

HOSTSIZE - `history` 저장되는 개수

HISTOCONTROL - 중복되는 명령 기록 유무

DISPLAY - 디스플레이 이름

IFS - 입력 필드 구분자(default: ` ` 빈칸)

VISUAL - VISAUL 편집기 이름

EDITOR - 기본 편집기 이름

COLUMNS - 현 터미널 또는 윈도우 터미널의 칼럼 수

LINES - 터미널 라인 수

LS_COLORS - ls 명렁의 색상 옵션

PS1 - 기본 프롬프트 변수(default: `bash\$`)

PS2 - 보조 프롬프트 변수(default: `>`), "\\"을 사용해서 명령 행을 연장할 때 사용

PS3 - 쉘 스크립트에서 select 사용시 프롬프트 변수(default: `#?`)

PS4 - 쉘 스크립트에서 디버깅 모드의 프롬프트 변수(default: `+`)

TMOUT - 지정한 시간 이후 로그아웃, 0이면 제한이 없음.



#### 위치 매개변수(Positional Parameters)

| 표기 | 설명                                                         |
| ---- | ------------------------------------------------------------ |
| $0   | 실행된 스크립트 이름                                         |
| $1   | \$1, \$2, ... \${10} 인자 순서대로 변호부여, 10번째부터는 "{}"으로 감싸준다. |
| $*   | 전체 인자 값                                                 |
| $@   | 전체 인자 값(""로 변수를 감싸면 다른 결과)                   |
| $#   | 매개 변수 총 개수                                            |



```bash
function fun(){
  echo $*
  echo $@
  echo $#
}

string="myname"
fun a string $string
```

결과

```console
a string myname
a string myname
3
```





#### 특수 매개변수(Special Parameters)

| 표기 | 설명                                                  |
| ---- | ----------------------------------------------------- |
| $$   | 현재 스크립트의 PID                                   |
| $?   | 최근에 실행된 명령어, 함수, 스크립트 자식의 종료 상태 |
| $!   | 최근에 실행한 백그라운드(비동기) 명령의 PID           |
| $-   | 현재 옵션 플래그                                      |
| $_   | 지난 명령의 마지막 인자로 설정된 특수 변수            |



#### 매개변수 확장(Parameter Expansion)

- 주로 string 문자를 제어할 때 사용

indexing, slicing, insert, delete 등



---

**5) 변수 타입 지정(Variable Revisited)**

bash 변수는 타입을 구분하지 않고, 기본적으로 문자열입니다. 문맥에 따라 연산 처리합니다.

`declare`, `typeset`으로 불안전환 형태의 타입 지정명령을 지원합니다.(두 명령은 동일)

```bash
# Read only
declare -r string_variable

# 정수
declare -i number_variable=10

# 배열
declare -a array_variable

# 환경 변수
declare -x export_variable="external!"

# 현재 스크립트의 함수 출력
declare -f # 전체 출력
declare -f 함수이름 # 지정함수 출력
```





---

**6) 배열(Array)**

반드시 괄호사용 (),

1차원 배열만 지원



```bash
arr=("apple" "grape" "strawberry" "pear")
arr[4]="kiwi"

# grape(1번째 원소) 출력
echo ${arr[1]}
# 배열 전체 출력
echo ${arr[@]}
# 배열 전체 갯수 출력
echo ${#arr[@]}

# remove
unset arr[3]
echo ${arr[@]}
echo ${arr[3]} # 3은 지워져서 null이 됨
echo ${arr[4]} # kiwi

# 배열 전체 지우기
unset arr
echo ${arr[@]}
```



---

**7) 비교**

**문자열 비교**

| 표기    | 설명                            |
| ------- | ------------------------------- |
| =, ==   | 같음                            |
| !=      | 같지 않음                       |
| <(>)    | ASCII 알파벳 순서로 더 작음(큼) |
| -z      | 문자열이 NULL, 길이가 0인 경우  |
| -n      | 문자열이 NULL이 아님            |
| ${변수} | 문자열이 NUlL이 아님            |



---

**8) 반복문**

```bash
# for문
for str in "a" "b" "c"; do
  echo ${str}
done

# while : 조건이 true일 때 실행
# 방법 1
declare -i cnt=0
while (( ${cnt}<5 )); do
  echo ${cnt}
  cnt+=1
done

# 방법 2
cnt=0
while [ ${cnt} -lt 5 ]; do
  echo ${cnt}
  cnt=$(( ${cnt}+1 ))
done

# until : 조건이 false일 때 실행
cnt=10
until [ ${cnt} -le 5 ]; do
  echo ${cnt}
  cnt=$(( ${cnt}-1 ))
done
```



---

**9) 조건문**

```bash
str="hello"
str2="world"
str3="hello"

if [ ${str} == ${str2} ]; then
  echo "${str} == ${str2}"
elif [ ${str} == ${str3} ]; then
  echo "${str} == ${str3}"
else
  echo "I don't know"
fi

for el in "apple" "grape" "strawberry" "pear"; do
  case ${el} in
    apple|grape)
      echo "apple or grape: ${el}"
      ;;
    str*)
      echo "starting with str: ${el}"
      ;;
    *)
      echo "나머지(default): ${el}"
      ;;
  esac
done
```





## Tip

Bash는 공백에 매우 민감합니다. 디버깅시 잘 체크해 보시기 바랍니다.

변수는 ${변수} 형태로 사용합시다.



---

**Reference**

개발자스럽다님 블로그: https://blog.gaerae.com/2015/01/bash-hello-world.html

https://mug896.github.io/bash-shell/sh.html