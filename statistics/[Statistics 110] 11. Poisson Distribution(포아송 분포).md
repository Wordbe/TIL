## [Statistics 110] 11. Poisson Distribution(포아송 분포)



**수업 전 자주하는 실수 정리:**

Sympathetic magic(공감 주술): 확률변수(random variable)와 확률분포(distribution)를 구별하지 못하고 오용하는 실수

"Word is not the thing, the map is not the territory"

확률변수를 집, 분포는 집의 설계도이다.





---

## Poisson Distribution

포아송 분포

통계학에서 가장 중요한 이산형분포

$ X \sim Pois(\lambda)$라고 표기



프랑스 수학자 포아송 이름을 딴 분포, 확률질량함수(PMF, probability mass function)는 다음과 같다.




$$
P(X=k) = \frac{e^{-\lambda}\lambda^k}{k!}, \ k \in \{0, 1, 2, ...\}
$$
$\lambda > 0$ 는 비율 모수(rate parameter)이다.

$k < 0$이면 값은 음수가 된다.



**valid 확인(확률 합 = 1):**
$$
\sum_{k=0}^{\infty}\frac{e^{-\lambda}\lambda^k}{k!} = e^{-\lambda}e^{\lambda} = 1
$$
$e^{-\lambda}$는 상수, 나머지 식은 $e^{\lambda}$의 테일러 급수이므로 위와 같이 변형된다.



**기댓값 확인:**
$$
\begin{align}
E(X) = & e^{-\lambda} \sum_{k=0}^{\infty} k \frac{\lambda^k}{k!} \newline
= & \lambda e^{-\lambda} \sum_{k=1}^{\infty} \frac{\lambda^{k-1}}{(k-1)!} \newline
= & \lambda e^{-\lambda}e^{\lambda} = \lambda
\end{align}
$$




---

**Often used for applications**

각 시도에서 성공할 확률은 작으면서 많은 시도를 했을 때, 성공한 횟수를 세는 경우



완벽한 포아송 분포는 아니지만, 그럴 것이라고 생각하여 포아송 분포로 근사할 수 있는 예들

(1) 한 시간에 받는 이메일 개수

(2) 초콜릿 칩 쿠기 안에 든 초코의 수

(3) 특정 지역에서의 1년간 지진 발생 수



---

Poisson Paradigm

사건(event) $A_1, A_2, \cdots, A_n, P(A_j) = p_j$, n이 크고, $p_j$가 작을 때,

사건이 모두 독립적이거나 약한 의존성(weakly dependent)을 가질 때,



