# React 총정리

1. 리액트
   1. 만들어진 이유
      - DOM 업데이트 고민 해결(Virtual DOM을 통해 이벤트 업데이트시 모든 DOM을 새로 만들어서 렌더링), 빠른 성능
   2. 작업환경 : Node.js, Yarn, vscode, git
   3. 컴포넌트(Component)
   4. JSX
      - 리액트 생김새를 정의, 컴포넌트 파일에서 XML 코드를 작성하면, babel이 JSX를 JavaScript로 전환
   5. props (properties)
      - 컴포넌트 매개변수 / 비구조화 할당, defaultProps
   6. 조건부 렌더링 (Conditional Rendering)
   7. useState : 동적 컴포넌트 상태 관리
   8. Input 상태 관리
   9. Multi-input 상태관리
   10. useRef 1 : 특정 DOM 선택
   11. 배열 렌더링
   12. useRef 2 : 컴포넌트 안 변수 만들기
       - `useRef`로 관리하는 변수는 값이 변경돼도 컴포넌트가 리렌더링되지 않음.
   13. 배열 항목 추가하기
   14. 배열 항목 제거하기
   15. 배열 항목 수정하기
   16. useEffect
       * 마운트, 언마운트, 업데이트 시 할 작업 설정





리액트 구조의 핵심은

**Flux Architecture**

데이터는 위에서 아래로, 바뀐 상태도 위에서 아래로

View → Action → Dispatcher → Store → View

 

**Sytled-Component**

```shell
npm install -S styled-components
npm install --save-dev @types/styled-components
npm install --save-dev babel-plugin-styled-components
```



react



naver d2 flex