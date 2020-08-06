# 크롤링 - Python, Selenium

Selenium 라이브러리의 핵심은, 웹 드라이버를 새로 띄워 크롤링한다는 점에 있습니다.

먼저 크롬웹드라이버를 다운받아봅니다.

### 크롬 버전 확인

크롬창을 켜고 주소창에

```
Chrome://version
```

를 입력합니다.

![](https://k.kakaocdn.net/dn/cMpbD0/btqE2tBUaKU/L7eUeeItvDVBjdAaxxkXrk/img.png)

### 크롬드라이버 다운로드

크롬드라이버를 다운받습니다. \[[https://sites.google.com/a/chromium.org/chromedriver/downloads\]](https://sites.google.com/a/chromium.org/chromedriver/downloads%5D) ([https://sites.google.com/a/chromium.org/chromedriver/downloads](https://sites.google.com/a/chromium.org/chromedriver/downloads)) 사이트 이동



![](https://k.kakaocdn.net/dn/ersB9W/btqE0QyKbrG/WZ8n29SWMqDXSMAKpNcFVK/img.png)



![](![img](https://k.kakaocdn.net/dn/civO1v/btqE00A93IV/79pbK1ikmYofRMpKSrsxR1/img.png)





다운받은 크롬드라이브를, 원하는 폴더에 이동시킵시다.

제가 만든 폴더 구조는 아래와 같습니다.

```
crawling
    chrome-driver
        chromedriver.exe
    crawling.py
```

### 크롤링 코드 생성

먼저 `selenium` 라이브러리를 설치합시다.

```
pip install selenium
```

다음으로 `crawling.py`파일 생성 후 아래와 같이 코드를 입력합니다.

```
import time
from selenium import webdriver

driver = webdriver.Chrome('./chrome-driver/chromedriver.exe')

# 구글에 접속
driver.get('http://www.google.com/')

# 2초간 대기 (웹 브라우저가 켜지는 것을 기다립니다.)
time.sleep(2)

# element name이 q인 곳을 찾습니다. (구글 검색창의 html 인풋태그 name은 'q'로 되어 있습니다.)
elem = driver.find_element_by_name('q')

# 검색 키워드 입력, 실행
elem.send_keys('Wordbe')
elem.submit()

# 5초간 동작하는 것을 보고 종료
time.sleep(5)
driver.quit()
```

이상 selenium 라이브러리를 통해 자동으로 크롬 브라우저를 제어(열기, 찾기, 입력, 닫기 등)할 수 있었습니다.