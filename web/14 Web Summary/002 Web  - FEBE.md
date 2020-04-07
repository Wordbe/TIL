# 002 Web  - FE/BE

# 1 HTML

HTML 태그는 여러 종류가 있고, 각각  쓰임새에 대한 의미(Semantic)가 있습니다.

### 1 HTML tag 종류

* 링크, 이미지, 목록, 제목

### 2 HTML Layout Tag

* 레이아웃은 '배치'라는 의미로, 태그로 감싸진 정보가 화면 상의 놓이는 위치를 결정합니다.
* header, section, nav, footer, aside

### 3 HTML 구조설계

* 영역을 상단(header)/본문(body)/네비게이션(nav)/하단(footer) 등으로 나누어 정의합니다.

### 4 Class 와  ID 속성

* **1) id** : 고유한 속성, 한 HTML 문서에 하나만 사용 가능, 제어와 검색에 용이
* **2) class** : 하나의 HTML 문서안에서 중복 사용 가능, 하나의 태그의 여러 class 적용 가능, 전체적인 스타일을 일관성 있게 지정하는데 용이
* **3) data** : tag에 추가 데이터 정보 표현

<br>

****

# 2 CSS

### 1 CSS 선언

* selector(선택자), property(속성), value(값)
* 우선순위 : inline > internal = external (겹치는 경우 나중에 선언된 속성이 반영)

### 2 상속과 우선순위(CSS Specificity) 결정

* 상위에서 적용한 스타일은 하위에도 반영됩니다.(상속)
* box-model 속성 (width, height, margin, padding, border)과 같이 크기와 배치 관련 속성들은 하위 엘리먼트로 상속되지 않습니다.
* 같은 선택자(selector)라면 나중에 선언한 것이 반영됩니다.
* 선택자 표현이 구체적인 것이 있다면 먼저 적용됩니다.
  * body > span (O)
  * span (X)

* id > class > element 순으로 반영되니다. (CSS Cascading)

### 3 CSS Selector

* 엘리먼트에 style 지정을 위한 3가지 기본 선택자 : tag, id, class
* 자식 선택 (>) : 바로 아래 하위 엘리먼트를 가리킵니다.
* nth-child : 자식요소 중 n번째 태그 선택
* nth-of-type : 자식요소 중 **같은** 태그의 n번째 선택

### 4 CSS 기본 Style 변경

* 글자색(color), 배경색(background-color), 글꼴(font-family), 글꼴 크기(font-size)

### 5 Element 배치 (CSS layout)

* 배치 = layout 작업 = rendering 과정
* display

```css
display: block;
display: inline-block;
```

벽돌을 쌓듯 블록이 쌓임

```css
display: inline;
```

우측 → 아래쪽 방향으로 빈자리를 차지

* position

```css
position: static;
```

순서대로 배치

```css
position: absolute;
```

기준점에 따라 특별한 위치에 배치(top / left / right / bottom 설정)

```css
position: relative;
```

원래 자신이 위치해야할 곳을 기준으로 이동 (top / left / right/ bottom 설정)

```css
position: fixed;
```

전체화면(viewpport) 좌측, 맨 위를 기준으로 동작

* float

둥둥 떠다니도록 설정 (left, right)

* box-model : margin, box-shadow, border, padding, outline

```css
box-sizing: border-box;
```

엘리먼트 크기 고정하면서 padding 속성 변경 가능

* **flex**

```css
display: flex;
```











