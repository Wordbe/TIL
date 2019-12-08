# 크롬 개발자 도구



웹 개발 시 Ajax와 같은 요청처리에 대해,

Ajax 통신 오류가 났을 때 로직이 문제인지, 서버 문제인지 디버깅이 필요한 경우가 있습니다.

이런 경우 도움을 주는 크롬 개발자도구를 알아봅니다.



## 1. 크롬개발자 도구의 네트워크 패널

| Name         | Status | Type       | Initiator | Size  | Time  |
| ------------ | ------ | ---------- | --------- | ----- | ----- |
| example.html | 200    | document   | other     | 1.7KB | 396ms |
| example.css  | 200    | stylesheet | v2.html   | 853B  | 324ms |
| example.png  | 200    | svg+xml    | v2.html   | 6.3KB | 558ms |
| example.js   | 200    | script     | v2.html   | 356B  | 328ms |



위는 녹화기능을 통해 HTML, CSS, Javascript, image 파일을 내려받는 상황입니다.

서버가 자료를 잘 받았을 경우 상태(status)는 200 코드입니다.

흔히 겪는 404 응답 오류 등에 대해 문제를 쉽게 찾을 수 있습니다.

서버 응답시간 등을 파악할 수 있어 성능개선을 위한 진단 도구로도 사용됩니다.



아마존 홈페이지에서 F12 눌러 크롬 개발자 도구 보기.

https://www.amazon.com/



**Header 항목**

General

Response Header

accept-encoding : gzip 사용 확인

Request Header



**Preivew 미리보기**

**Response** 

**Timing**



녹화기능을 통해 시간별 요청받은 파일 목록 등의 정보를 알 수 있습니다.

체감속도를 분석할 때 "스크린 샷"메뉴를 이용하면 좋습니다.

다양한 탭을 통해서 XHR, JS 등 통신 항목만 추려서 결과를 확인할 수 있으므로, 디버깅이 쉽습니다.

Name, status, type과 같은 항목도 사용자에 맞게 설정하여 노출할 수 있습니다.

이를 통해 HTTP 통신과정에서 생기는 문제를 해결하는 실마리를 얻을 수 있습니다.

