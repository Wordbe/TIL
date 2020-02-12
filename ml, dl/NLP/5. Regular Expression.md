# 5. Regular Expression

텍스트 데이터를 전처리하다보면, 정규 표현식은 유용한 도구로서 사용됩니다.

파이썬이 지원하는 정규 표현식 모듈 re와, NLTK를 통한 정규 표현식을 이용한 토큰화를 알아봅니다.



## 1) 정규 표현식 문법과 모듈 함수

**정규 표현식 문법**

| 특수문자         | 설명                                                         |
| ---------------- | ------------------------------------------------------------ |
| .                | 한 개의 임의의 문자 (줄바꿈 문자인 \\n는 제외)               |
| ?                | 문자가 0개 또는 1개                                          |
| *                | 문자가 0개 이상                                              |
| +                | 문자가 1개 이상                                              |
| ^                | 뒤의 문자열로 문자열이 시작됨                                |
| $                | 앞의 문자열로 문자열이 끝남                                  |
| {숫자}           | 숫자만큼 반복                                                |
| {숫자 1, 숫자 2} | 숫자 1이상 숫자 2이하만큼 반복                               |
| {숫자,}          | 숫자 이상 반복                                               |
| []               | 대괄호 안 문자들 중 한 개의 문자와 매치<br />[a-z] : a ~ z 까지 범위 지정<br />[a-zA-Z] : 알파벳 전체 범위, 문자열에 알파벳이 존재하면 매치 |
| [^문자]          | 해당 문자를 제외한 문자를 매치                               |
| \|               | A\|B와 같이 쓰이며, A 또는 B라는 의미                        |



| 문자규칙 | 설명                                                        |
| -------- | ----------------------------------------------------------- |
| \\\      | 역 슬래쉬(\\) 문자 자체를 의미                              |
| \\d      | 모든 숫자, [0-9]와 같은 의미                                |
| \\D      | 숫자를 제외한 모든 문자, \[^0-9]와 같은 의미                |
| \\s      | 공백, [ \\t\\n\\r\\f\\v]와 같은 의미                        |
| \S       | 공백을 제외한 문자를 의미, \[^ \\t\\n\\r\\f\\v]와 같은 의미 |
| \\w      | 문자 또는 숫자, [a-zA-Z0-9]와 같은 의미                     |
| \W       | 문자 또는 숫자가 아닌 문자, \[^a-zA-Z0-9]와 같은 의미       |

---

**정규표현식 모듈 함수**

| 모듈 함수     | 설명                                                         |
| ------------- | ------------------------------------------------------------ |
| re.compile()  | 정규표현식을 컴파일하는 함수, 미리 컴파일해놓고 저장하면, 속도와 편의성면에서 유리합니다. |
| re.search()   | 문자열 전체에 대해서 정규표현식과 매치되는 지 검색           |
| re.match()    | 문자열의 처음이 정규표현식과 매치되는지 검색                 |
| re.split()    | 정규 표현식을 기준으로 문자열 분리하여 리스트로 반환         |
| re.findall()  | 정규 표현식과 매치되는 모든 경우의 문자열을 찾아서 리스트로 반환 |
| re.finditer() | 정규 표현식과 매치되는 모든 경우의 문자열에 대한 이터레이터 객체를 리턴 |
| re.sub()      | 정규 표현식과 일치하는 부분에 대해 다른 문자열로 대체        |



## 2) 정규 표현식 실습



### . 기호

```python
import re
r = re.compile("a.c")
r.search("abc")
>>
<_sre.SRE_Match object; span=(0, 3), match='abc'>  
```



### ? 기호

```python
r = re.compile("ab?c") # b가 0개 또는 1개
r.search("abbc") # 아무런 결과도 출력되지 않는다.
r.search("abc")
>>
<_sre.SRE_Match object; span=(0, 3), match='abc'>

r.search("ac")
>>
<_sre.SRE_Match object; span=(0, 2), match='ac'>
```



### * 기호

```python
r=re.compile("ab*c") # b가 0개 이상
r.search("a") # 아무런 결과도 출력되지 않는다.
r.search("ac")
>>
<_sre.SRE_Match object; span=(0, 2), match='ac'>

r.search("abc")
>>
<_sre.SRE_Match object; span=(0, 3), match='abc'> 

r.search("abbbbc") 
>>
<_sre.SRE_Match object; span=(0, 6), match='abbbbc'>
```



### +기호

```python
r=re.compile("ab+c") # b가 1개 이상
r.search("ac") # 아무런 결과도 출력되지 않는다.

r.search("abc")
>>
<_sre.SRE_Match object; span=(0, 3), match='abc'>

r.search("abbbbc")
>>
<_sre.SRE_Match object; span=(0, 6), match='abbbbc'>
```



### ^ 기호

```python
r = re.compile("^a")
r.search("bbc") # 아무런 결과도 출력되지 않는다.

r.search("ab")
<_sre.SRE_Match object; span=(0, 1), match='a'>
```



### {숫자} 기호

```python
r = re.compile("ab{2}c") # b가 2개
r.search("ac") # 아무런 결과도 출력되지 않는다.
r.search("abc") # 아무런 결과도 출력되지 않는다.

r.serach("abbc")
>>
<_sre.SRE_Match object; span=(0, 4), match='abbc'>

r.search("abbbbbc") # 아무런 결과도 출력되지 않는다.
```



### {숫자1, 숫자2 기호}

```python
r = re.compile("ab{2,8}c") # b가 2이상 8이하 개
r.search("ac") # 아무런 결과도 출력되지 않는다.
r.search("ac") # 아무런 결과도 출력되지 않는다.
r.search("abc") # 아무런 결과도 출력되지 않는다.

r.search("abbc")
>>
<_sre.SRE_Match object; span=(0, 4), match='abbc'>

r.search("abbbbbbbbc")
>>
<_sre.SRE_Match object; span=(0, 10), match='abbbbbbbbc'>

r.search("abbbbbbbbbc") # 아무런 결과도 출력되지 않는다.
```



### {숫자,} 기호

```python
r=re.compile("a{2,}bc") # a가 2개 이상
r.search("bc") # 아무런 결과도 출력되지 않는다.
r.search("aa") # 아무런 결과도 출력되지 않는다.

r.search("aabc")
>>
<_sre.SRE_Match object; span=(0, 4), match='aabc'>

r.search("aaaaaaaabc")
>>
<_sre.SRE_Match object; span=(0, 10), match='aaaaaaaabc'>
```



### [] 기호

[] 안에 문자들 중 한 개의 문자와 매치

```python
r = re.compile("[abc]") # [abc]는 [a-c]와 같다.
r.search("zzz") # 아무런 결과도 출력되지 않는다.

r.search("a")
>>
<_sre.SRE_Match object; span=(0, 1), match='a'>

r.search("aaaaaaa")
>>
<_sre.SRE_Match object; span=(0, 1), match='a'>

r.search("baac")
>>
<_sre.SRE_Match object; span=(0, 1), match='b'>
```



```python
r = re.compile("[a-z]")
r.search("AAA") # 아무런 결과도 출력되지 않는다.

r.search("aBC")
>>
<_sre.SRE_Match object; span=(0, 1), match='a'>

r.search("111") # 아무런 결과도 출력되지 않는다.
```



### \[^문자] 기호

```python
r = re.compile("[^abc]") # a, b, c를 제외한 모든 문자와 매치
r.search("a") # 아무런 결과도 출력되지 않는다.
r.search("ab") # 아무런 결과도 출력되지 않는다.
r.search("b") # 아무런 결과도 출력되지 않는다.

r.search("d")
>>
<_sre.SRE_Match object; span=(0, 1), match='d'>

r.serach("1")
<_sre.SRE_Match object; span=(0, 1), match='1'>
```



---

## 3) 정규 표현식 모듈 함수 예제

**(1) re.match()와 re.search()의 차이**

search()는 정규 표현식 전체에 대해서 문자열이 매칭되는지 본다면,

match()는 문자열의 첫 부분부터 정규 표현식과 매치하는지 확인합니다.

```python
import re
r = re.compile("ab.")

r.search("kkabc")
>>
<_sre.SRE_Match object; span=(3, 6), match='abc'>

r.match("kkabc") # None

r.match("abckkk")
<_sre.SRE_Match object; span=(0, 3), match='abc'>
```



**(2) re.split()**

```python
text="사과 딸기 수박 메론 바나나"
re.split(" ",text)
>>
['사과', '딸기', '수박', '메론', '바나나']  
```



**(3) re.findall()**

정규 표현식과 매칭되는 모든 문자열을 리스트로 리턴합니다.

```python
text="이름 : 김철수
전화번호 : 010 - 1234 - 1234
나이 : 30
성별 : 남"""  
re.findall("\d+",text)
>>
['010', '1234', '1234', '30']
```

매치하는 것이 없다면 빈 리스트를 리턴합니다.



**(4) re.sub()**

```python
text="Regular expression : A regular expression, regex or regexp[1] (sometimes called a rational expression)[2][3] is, in theoretical computer science and formal language theory, a sequence of characters that define a search pattern."
re.sub('[^a-zA-Z]',' ',text) # 알파벳 외의 문자를 공백으로 대체합니다.
>>
'Regular expression   A regular expression  regex or regexp     sometimes called a rational expression        is  in theoretical computer science and formal language theory  a sequence of characters that define a search pattern ' 
```





---

## 4) 정규 표현식 텍스트 전처리 예제

```python
import re 
text = """100 John    PROF
101 James   STUD
102 Mac   STUD"""  

re.split('\s+', text)
>>
['100', 'John', 'PROF', '101', 'James', 'STUD', '102', 'Mac', 'STUD']
```

"\\s+"는 공백을 찾아내는 정규표현식입니다. 뒤에 붙는 +는 최소 1개 이상의 패턴을 찾아낸다는 의미입니다. 따라서 최소 1개 이상의 공백 패턴을 찾아냅니다. split()은 주어진 정규표현식을 기준으로 text는 분리합니다.



```python
re.findall('\d+',text)
>>
['100', '101', '102]
```

숫자만 뽑아내는 경우는 위와 같이 할 수 있습니다.



```python
re.findall('[A-Z]',text)
>>
['J', 'P', 'R', 'O', 'F', 'J', 'S', 'T', 'U', 'D', 'M', 'S', 'T', 'U', 'D']
```

text중에서 대문자만 가져오고 싶으면 위와 같이 하면 됩니다.



대문자가 연속으로 4번 등장하는 경우는 아래와 같습니다.

```python
re.findall('[A-Z]{4}',text)
>>
['PROF', 'STUD', 'STUD']
```



아래 예제는 이름을 선별하기 위해 첫글자는 대문자, 다음글자는 소문자인 문자열을 가져옵니다.

```python
re.findall('[A-Z][a-z]+',text)
>>
['John', 'James', 'Mac']
```



마지막으로 영문자가 아닌 문자를 모두 공백으로 치환합니다.

```python
letters_only = re.sub('[^a-zA-Z]', ' ', text)
```





---

## 5) 정규 표현식을 이용한 토큰화

NLTK에서는 정규 표현식으로 단어 토큰화를 수행하는 RegexpTokenizer를 지원합니다.

```python
import nltk
from nltk.tokenize import RegexpTokenizer
tokenizer=RegexpTokenizer("[\w]+")
print(tokenizer.tokenize("Don't be fooled by the dark sounding name, Mr. Jone's Orphanage is as cheery as cheery goes for a pastry shop"))
>>
['Don', 't', 'be', 'fooled', 'by', 'the', 'dark', 'sounding', 'name', 'Mr', 'Jone', 's', 'Orphanage', 'is', 'as', 'cheery', 'as', 'cheery', 'goes', 'for', 'a', 'pastry', 'shop']
```

"\[\\w]+"는 문자 또는 숫자가 한 개 이상 포함되어 있는 것을 나타냅니다.



공백을 기준으로 토큰화 한다면 다음과 같습니다.

```python
import nltk
from nltk.tokenize import RegexpTokenizer
tokenizer=RegexpTokenizer("[\s]+", gaps=True)
print(tokenizer.tokenize("Don't be fooled by the dark sounding name, Mr. Jone's Orphanage is as cheery as cheery goes for a pastry shop"))
>>
["Don't", 'be', 'fooled', 'by', 'the', 'dark', 'sounding', 'name,', 'Mr.', "Jone's", 'Orphanage', 'is', 'as', 'cheery', 'as', 'cheery', 'goes', 'for', 'a', 'pastry', 'shop']
```

gaps=true는 정규 표현식을 토큰으로 나누기 위한 기준으로 사용한다는 뜻입니다. False이면 토큰화의 결과는 공백들만 나오게 됩니다.



---

Reference

https://wikidocs.net/21703