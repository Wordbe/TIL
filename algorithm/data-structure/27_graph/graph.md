## 그래프 사용의 예

* 철도망의 안정성 분석 - 28 절단점 찾기 알고리즘
* 소셜 네트워크 분석 - 29 BFS(너비 우선 탐색)
* 인터넷 전송 속도 계산 - 31 최소 스패닝 트리
* 한 붓 그리기 (오일러 경로) - 28.4 DFS(깊이 우선 탐색)
* 외환 거래 - 30 최단 거리 알고리즘



## 암시적 그래프 구조들

그래프 형태를 갖는 구조가 아니라도, 그래프를 통해서 표현하면 쉽게 해결할 수 있는 문제들이 있음.

이를 암시적 그래프(implicit graph)라 한다.

* 할일 목록 정리 - 위상 정렬(topological sort) - 28 DFS(깊이 우선 탐색)
* 15-퍼즐 - 29, 30 최단 경로 문제
* 게임판 덮기 - 32 이분 그래프, 이분 매칭 알고리즘
* 회의실 배정 - 28 강 결합성 문제



## 그래프의 표현:  인접행렬과 인접리스트

인접행렬 : 

​	장 - 두 정점을 잇는 간선(u, v)이 있는지 한 번의 배열 접근만으로 확인할 수 있다.

​	단 - 실제 간선 개수와 상관없이 O(|V|<sup>2</sup>) 공간을 사용한다. (밀집 그래프, dense graph)

`vector<vector<bool> > adjmatrix` 혹은

`vector<vector<int> > adjmatrix` (가중치 그래프)



인접리스트:

​	장 - O(|V| + |E|)의 간선 수를 가진다. (희소 그래프, sparse graph)

​	단 - 간선(u, v)의 존재를 확인하기 위하여 연결 리스트 adjacent[u]를 처음 부터 읽어가면서, 원소를 일일이 비교해야 한다.

`vector<list<int> > adjlist`

