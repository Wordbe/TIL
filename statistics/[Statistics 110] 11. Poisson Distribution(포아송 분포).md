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



**충분히 많은 사건 n에 대해,**

**n이 발생할 확률이 작을 경우(각각 달라도됨) 포아송 분포로 근사하여 유용하게 해결할 수 있습니다.**



프랑스 수학자 포아송 이름을 딴 분포, 확률질량함수(PMF, probability mass function)는 다음과 같습니다.




$$
P(X=k) = \frac{e^{-\lambda}\lambda^k}{k!}, \ k \in \{0, 1, 2, ...\}
$$
$\lambda > 0$ 는 비율 모수(rate parameter)입니다.

$k < 0$이면 값은 음수가 됩니다.



**valid 확인(확률 합 = 1):**
$$
\sum_{k=0}^{\infty}\frac{e^{-\lambda}\lambda^k}{k!} = e^{-\lambda}e^{\lambda} = 1
$$
$e^{-\lambda}$는 상수, 나머지 식은 $e^{\lambda}$의 테일러 급수이므로 위와 같이 변형됩니다.



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

**Poisson Paradigm(포아송 분포 근사, Pois Approximation)**

사건(event) $A_1, A_2, \cdots, A_n, P(A_j) = p_j$, n이 크고, $p_j$가 작을 때,

사건이 모두 독립적이거나 약한 의존성(weakly dependent)을 가질 때,

$A_j$의 실행 횟수가 포아송 분포($Pois(\lambda)$)에 근사합니다. ($\lambda = \sum_{j=1}^1 p_j$)



사건이 의존적이어도, 선형성에 의해서 $A_j$의 실행 기댓값은 $p_j$의 합과 같습니다.

이항분포는 모든 p가 같은 값이어야하지만, 포아송 분포는 그렇지 않아도 됩니다.



증명: 이항분포가 포아송 분포로 수렴

$X \sim Bin(n, p)$, $n \rightarrow \infty, p \rightarrow 0, \lambda = np (constant)$ (n과 p가 수렴하는 속도가 같아야 가능합니다.)

확률질량함수, k는 고정
$$
\begin{align}
P(X=k) & = \binom{n}{k} p^k (1-p)^{n-k} \newline
& = \frac{n(n-1)\cdots (n-k+1)}{k!} \frac{\lambda^k}{n^k} (1-\frac{\lambda}{n})^n (1-\frac{\lambda}{n})^{-k} \leftarrow p = \frac{\lambda}{n} \newline
& = \frac{\lambda^k}{k!} \cdot 1 \cdot e^{-\lambda} \cdot 1 \newline
& = \frac{\lambda^k}{k!} e^{-\lambda}
\end{align}
$$


---

**이항분포와 포아송 분포의 관계**

**빗방울 예제**

![](https://i.ibb.co/FnqgcZV/image.png)



직사각형 영역을 몇천만개의 작은 사각형으로 나눴을 때,

각 사각형 당 떨어지는 빗방울의 개수를 셉니다.

각 영역에 빗방울이 떨어질 확률은 아주 작습니다. 하지만 전체 영역을 생각하면 빗방울은 거의 떨어질 수 밖에 없습니다. 



각 영역에 똑같이 확률 p로 떨어진다면 이항분포를 따를 것입니다.

하지만 같은 영역에 빗방울 2개가 떨어질 수 도 있는 등의 문제가 있습니다.

따라서 이항분포는 이 문제에 잘 맞지 않을 뿐더러, 1000! 등 !의 컴퓨터 계산은 매우 비쌉니다.



위 문제는 아주 큰 n과 아주작은 p 문제 입니다.

따라서 푸아송 분포와 잘 맞아 떨어집니다. 푸아송 분포는 계산도 쉬우므로 이를 통해 계산하면 됩니다.



**3명의 겹치는 생일**

근사로 구하기.

n이 20~30이면 $\binom{n}{3}$은 충분히 큰 수가 됩니다.

이 중 고른 3명의 사람이 생일이 같은 확률?

3명의 생일이 같을 기댓값은
$$
\binom{n}{3} \frac{1}{365^2}
$$
X 포아송 분포 근사 ($Pois(\lambda)$)) 를 따를 때, $\lambda = \binom{n}{3} \frac{1}{365^2}$

n명 중 3명을 뽑았을 때 그 3명의 생일이 모두 같은 집단이 적어도 하나 있을 확률을 구하면,
$$
P(X \geq 1) = 1 - P(X=0) \approx 1 - e^{-\lambda} \frac{\lambda^0}{0!} = 1 - e^{-\lambda}
$$
이는 간단히 계산기로 구할 수 있는 결과입니다.