# [RL] 강화학습 part1  - policy, value function

**Reinforcement Learning**



# 1. 강화학습 원리와 성질

state, action을 번갈아 가면서 목표를 달성합니다.

강화학습 교과서(Sutton, 2017) 참고



## 1) 계산 모형

**상태, 행동, 보상**

**state, action, reward**

![](https://i.ibb.co/Ht67bC8/image.png)


$$
f:(s_t, a_t) \rightarrow (s_{t+1}, r_{t+1})
$$
$s_t$에서 행동 $a_t$를 취하면, 새로운 상태 $s_{t+1}$로 바뀌고 보상 $r_{t+1}$을 받습니다.

t = T (마지막 순간은 주로 T로 표기합니다. 위 예시는 T=5) 인 순간에 과업이 성공했으므로 보상 1을 주면 됩니다. 만약 중간에 넘어지면 보상 -1을 주고, $r_1$~$r_4$의 중간 보상은 0으로 설정합니다.

하지만, 마지막 순간의 상태는 중간 상태의 영향을 받아 성립되었으므로, 최종 순간의 보상을 이전 상태에 나눠주어야 할 수도있습니다. 이를 신뢰 할당 문제(credit assignment problem)라고 합니다.

<br>

**에이전트와 환경**

**에이전트(agent)**는 **행동**을 결정하고, **환경(environment)**은 **상태** 전환과 **보상**액 결정을 담당합니다.

마르코프 결정 프로세스(Markov Decision Process)는 문제 정의시 주어지는 정보입니다. 환경은 **MDP** 에 따라 다음 상태와 보상을 결정합니다.

강화 학습은 주어진 MDP에서 최적의 행동을 결정하는 정책을 찾아야 합니다.



강화학습의 목표는 '누적' 보상액을 최대화하는 것입니다. 즉 순간 이득을 최대화하는 행동이 아니라 긴 시간 동안 누적 보상액이 최대가 되는 행동을 선택해야 합니다. 에이전트가 행동을 선택하는 데 사용하는 규칙을 **정책(policy)**이라고 하며, 강화 학습 알고리즘은 최적의 정책을 찾아야 합니다.



상태, 행동, 보상은 연속값일 수도 있지만, 대부분 응용에서는 이산값을 가집니다.

![](https://i.ibb.co/HqkCXzr/image.png)





<br>

**약속 표기**

상태집합: $ \mathbb{S} = \{s_1, s_2, \cdots, s_n\} $

행동집합: $ \mathbb{A} = \{a_1, a_2, \cdots, a_n\} $

보상집합: $ \mathbb{R} = \{r_1, r_2, \cdots, r_n\} $



<br>

**정책**

로봇이 동, 서, 남, 북으로 이동할 수 있는 행동이 있다고 했을 때,

모든 방향으로 나아갈 확률이 같게 할 수 있습니다. 하지만 이런 확률정책은 다수의 경로도 같은 누적보상액을 만들 수 있게 하여 좋지 않을 수 있으므로,

예를 들면, 맨 위 행은 더 이상 북으로 갈곳이 없으므로 북을 제외한 나머지 방향에 똑같이 1/3 확률을 부여하고 북은 0으로 부여하는 것이 더 좋을 수 있습니다.



## 2) 탐험과 탐사

**탐험과 탐사 갈등(Exploration and exploitation conflict)**

탐험은 전체 공간을 골고루 찬는 반면, 탐사는 특정한 곳 주위를 집중적으로 찾아보는 전략입니다. 탐험은 시간이 너무 오래 걸리고, 탐사는 지역 최적점에 머물 수 있다는 문제가 있습니다.



강화학습에서는 탐사(exploitation)로 치우치면 열등 해를 얻는 상황이 많습니다.

예를 들어 k-손잡이 밴딧(k-am bandit) 문제에서

![](https://i.ibb.co/5xpZYSk/image.png)

3, 4, 1, 2, 5, 4, 3, 1, 2, 5, 4, **2** 

12번 만에 2에서 잭팟(큰 돈)이 나왔다고 해봅시다.

사용자는 어느 기계가 몇의 확률로 잭팟이 나오는지 알지 못하는 상황입니다.



**탐사 방식**에서는 2에서 잭팟이 나왔으므로 이후 2를 뽑을 것입니다.

하지만 **탐험 방식**에서는 나온 2정보를 무시하고 모두를 골고루 뽑을 것입니다.



이 둘의 방식을 보완하기 위해 **균형 방식**을 사용합니다.

2번에서 잭팟이 나온 이후로 2번 기계를 더 자주 선택하는 대신 다른 기계에게도 계속 기회를 주며 잭팟이 또 터지면 새로운 정보를 고려하여 확률을 배분하고 수정하는 것입니다.



## 3) 마르코프 결정 프로세스(MDP)

**MDP : Markov Decision Process**



현재 상태에서 행동을 결정할 때 이전 이력은 중요하지 않고, 현재 상황이 중요한 조건을 **마르코프 성질(Markov Property)**을 지녔다고 합니다. 예를 들면 바둑이 있습니다.

마르코프 성질은 다음을 만족합니다.
$$
P(s_{t+1}, r_{t+1} | s_0,a_0,r_1, s_1,a_1, \cdots, r_{t-1}, s_{t-1}, a_{t-1}, r_t, s_t, a_t) = P(s_{t+1}, r_{t+1} | s_t, a_t)
$$

$$
P(s_{t+1}, r_{t+1} | s_t, a_t) = P(s', r|s, a)
$$





하지만, 모든 응용문제가 마르코프 성질을 만족하지는 않습니다. 날씨 예측, 그리고 앞서말한 바둑도 사실 앞 선 이력이 뒤에 나올 상태를 예측하는데 도움이 됩니다. 

강화학습은 마르코프 성질을 만족한다는 전제하에 동작합니다. 따라서 Markov property를 근사하게라도 만족하는 문제에 국한하거나, 근사하게 만족할 수 있도록 상태 표현을 설계해서 적용합니다. 
$$
\mathbb{S} = \{맑은 후 맑음, 비온후맑음, 눈온후맑음, \cdots, 눈온후눈\}
$$
등으로 특징을 섞어 표현하면 마르코프 성질에 근사하게 표현할 수 있습니다.

<br>

**환경모델로서 MDP**
$$
MDP 확률분포 : P(s', r|s, a)
$$
**결정론적(Deterministic) MDP**

​	딱 한가지 상태와 보상이 있는 경우, 나머지 보상은 전부 0

**확률론적(Stochastic) MDP**

​	다음 상태와 보상이 확률적으로 결정되는 경우





# 2. 정책과 가치함수

강화 학습의 핵심은 좋은 정책을 찾아내는 것입니다. 

좋은 정책이 있으면 누적 보상을 최대로 만들 최적 행동을 매 순간 선택할 수 있습니다.

정책 공간은 너무 방대해서 최적 정책을 찾는 접근 방법은 무모하며,

최적 정책을 찾아가는 길잡이 역할을 하는 가치함수를 소개합니다.



## 1) 정책(policy)

정책이란 상태 s에서 행동 a를 취할 확률을 모든 상태와 행동에 대해 명시한 것입니다.
$$
\pi(a|s) = P(a|s), \forall s, \forall a
$$
$\pi$는 정책함수입니다.

<br>

**최적 정책**
$$
\pi_1 : P(동|i) = P(서|i)=P(남|i) = P(북|i) = \frac{1}{4},\  i=2, \cdots, 15
$$
i는 상태(격자)를 의미하는데, 정책 $\pi_1$같은 경우 동, 서, 남, 북 으로 가는 확률이 모두 같으므로 위 식과 같이 정책을 나타낼 수 있습니다.



![](https://i.ibb.co/Yj4N9RT/image.png)

마찬가지로 $\pi_3, \pi_4$를 구해볼 수 있습니다.

그림에서 $\pi_4$의 경우 가장 짧은 시간에 목표 상태에 도달하여 최고의 누적 보상액을 받았음을 알 수 있습니다. 강화학습은 학습 알고리즘을 통해 MDP에서 이와 같은 최적 정책을 찾아야 합니다.

<br>

**최적 정책 찾기**

goodness($\pi$)가 정책 $\pi$의 품질을 측정해주는 함수라고 합시다.
$$
\hat{\pi} = \underset{\pi}{argmax}\ goodness(\pi)
$$
학습 알고리즘은 위를 만족하는 정책 $\hat{\pi}$를 알아내어야 합니다.

바둑 같은 문제 에서는 상태공간(state space)이 방대합니다.

정책 공간(policy space)은 서로 다른 정책 집합을 뜻하며, 상태 공간보다 훨씬 방대합니다.

따라서 강화학습에서는 정책공간을 일일이 직접 탐색하는 대신 '가치함수'를 이용합니다.

최적 가치함수를 찾으면 최적 정책을 찾는 것은 사소한(trivial) 문제가 됩니다.

<br>

## 2) 가치함수(Value function)

가치함수는 특정 정책의 좋은 정도(상태 s로부터 종료 상태 이르기까지 누적 보상치의 추정치)를 평가합니다. 정책 $\pi$에서 추정하며 상태 s의 함수이므로 $v_{\pi}(s)$로 표기합니다.

즉, 위에서 쓰인 goodness는 곧 가치함수로 바뀝니다.
$$
\hat{\pi} = \underset{\pi}{argmax}\ v_{\pi}(s), \forall s \in \mathbb{S} 
$$

$$
v_{\pi}(s) = \sum_{s에서 출발하는 모든 경로 z}P(z)\mathbb{r}(z)
$$

P(z)는 경로 z의 발생확률, $\mathbb{r}(z)$는 경로 z의 누적 보상액입니다.



---

**에피소드 과업과 영구 과업**
$$
\mathbb{r}(z) = r_{t+1} + r_{t+2} + \cdots + r_T
$$
경로 z에 따른 보상액은 누적하여 다음과 같이 구할 수 있습니다.



z는 다음과 같이 표현할 수 있습니다.

![](https://i.ibb.co/FDrqf8t/image.png)

강화학습에서 유한 경로를 가진 과업을 에피소드 과업(episode task)이라고 합니다.

반면, 무한경로를 가진 과업을 영구과업(continuing task)이라고 합니다.

특별히 영구과업은 무한대 보상을 막기 위해 할인 누적 보상액(discounted accumulating reward)을 사용합니다. $\gamma$를 할인율(discounting rate)이라고 하며, $0 \leq \gamma \leq 1$입니다.
$$
\mathbb{r}(z) = r_{t+1} + \gamma r_{t+2} + \gamma^2 r_{t+3} + \cdots = \sum_{k=1}^{\infty} \gamma^{k-1} r_{t+k}
$$


0이면 $r_{t+1}$만 남으므로 순간의 이득을 최대화하는 탐욕 방법인 근시안적 보상액이 되며,

1이면 맨 위의 식처럼 된다.

따라서 할인 누적 보상액은 현재에서 멀어질수록 보상을 할인하여 공헌도를 낮추는 전략을 사용합니다.



---

**가치함수 추정을 위한 순환식**

마치 점화식처럼, 다음 상태에서의 가치함수를 표현하여, 가치함수를 간단히 쓸 수 있습니다.
$$
v_{\pi}(s) = \sum_{a \in \mathbb{A}(s)} P(a|s)(r + v_{\pi}(s')), \forall s \in \mathbb{S}
$$


---

**스토캐스틱 프로세스에서 가치함수 추정**

지금 까지 수식은 결정론적 프로세스(deterministic process)였습니다.

결정론적 프로세스는 많은 응용을 설명하지 못하지만,

현실에서 모든 요인을 상태 변수에 반영하는 대신 주요 요인만 반영하고 나머지는 무시한 상황서의 상태, 행동, 보상을 스토캐스틱 프로세스(stochastic process)라고 합니다.

스토캐스틱한 성질은 **P(s', r|s,a)** 확률로 표현됩니다. 이는 **MDP 확률분포**입니다. 즉, **상태 s에서 행동 a를 취했을 때 상태 s'로 전환하고 보상 r을 받을 확률**입니다. 스토캐스틱은 이 값이 여러개일 수 있으므로, 모두 더해줍니다.

가치함수는 MDP 확률분포가 제공하는 정보와 정책 $\pi$가 제공하는 정보를 모두 활용하여 정책을 평가합니다.
$$
v_{\pi}(s) = \sum_{a \in \mathbb{A}(s)} P(a|s) \sum_{s'} \sum_r P(s', r|s, a)(r + v_{\pi}(s')), \forall s \in \mathbb{S}
$$


무한 경로를 가진 응용문제에는 할인율을 적용한식을 사용하면 됩니다.
$$
v_{\pi}(s) = \sum_{a \in \mathbb{A}(s)} P(a|s) \sum_{s'} \sum_r P(s', r|s, a)(r + \gamma v_{\pi}(s')), \forall s \in \mathbb{S}
$$


위 두식은 **상태 가치 함수(State value function)**라고 합니다.

위 두식의 순환식을 가치함수를 위한 벨만 수식(Bellman equation)이라고 하며, 현재 상태의 가치는 다음 상태의 가치의 관계를 간결하게 표현합니다.

이와는 다르게 상태와 행동에 대한 가치함수는 **상태-행동 가치함수(state-action value function)**라고 하며 식은 아래와 같습니다.
$$
q_{\pi}(s, a) = \sum_{s'} \sum_r P(s', r|s, a)(r + \gamma v_{\pi}(s')), \forall s \in \mathbb{S}, \forall a \in \mathbb{A}
$$


## 3) 최적 가치 함수

최적 가치함수를 알아 최적 정책을 쉽게 결정할 수 있습니다.
$$
\hat{v}(s) = v_{\hat{\pi}}(s) = \underset{\pi}{max}\ v_{\pi}(s), \forall s \in \mathbb{S}
$$

$$
\hat{v}(s) = \underset{a \in \mathbb{A}(s)}{max}  \sum_{s'} \sum_r P(s', r|s, a)(r + v_{\pi}(s')), \forall s \in \mathbb{S}
$$

상태 가치함수는 mean 연산을 통해 구하는 반면, 최적 가치함수는 max 연산을 통해 구합니다.
$$
\hat{v}(s) = \underset{a \in \mathbb{A}(s)}{max}  \sum_{s'} \sum_r P(s', r|s, a)(r + \gamma v_{\pi}(s')), \forall s \in \mathbb{S}
$$
위 는 무한경로를 위해 할인율을 적용한 수식입니다.



다음은 강화학습의 보편적인 문제 풀이 과정입니다.

![](https://i.ibb.co/ncFbKcQ/image.png)

1) 처음에는 임의값으로 정책을 설정하고 출발합니다.

2) 정책에 따라 가치함수를 계산합니다.(정책의 품질 평가)

3) 얻은 가치함수로 더 나은 정책으로 개선합니다.

​	정책의 평가와 개선은 MDP 확률분포를 기초로 이루어집니다.

4) 정책 개선 싸이클이 없을 때까지 반복합니다.

​	동적 프로그래밍, 몬테카를로 방법, 시간차 학습 알고리즘은 모두 이 아이디어에 근거합니다.







---

**Reference**

기계학습, 오일석, 2017, 09. 강화학습