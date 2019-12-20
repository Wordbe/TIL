Statistics 110

Introduction to Probability

Joseph K.

Harvard and Standford University



# 1. Probability and Counting(확률과 셈 원리)

"실험을 하면 어떤 일이 일어난다."



일반적 정의

**A sample space** : the set of all possible outcomes of an experiment.

**An event** : a subset of the sample space.



S (표본공간) 안에 A (사건)이 일어난다.

Naive definition of probability :
$$
P(A) = \frac{\# \  favorable \  outcomes}{\
# \  possible  \  outcomes}
$$
**Assumes all outcomes equally likely, finite sample space**

유한 공간에, 모든 결과가 일어날 가능성이 똑같아야 한다.



event A가 일어날 확률

favorable to A (A가 일어날 가능성)



ex) 동전 던지기

H H

H T

T H

T T

4개의 결과,

뒷면이 두번 나오는 결과 1번



**Counting (계산법)**

**Multiplication Rule (곱의 법칙)**

if have experiment with n, possible outcomes, 

and for each outcome of 1st expt there are $n_2$ outcomes for 2nd expt

......, for each there are $n_r$ outcomes for $r^{th}$ expt, then, 

$n_1 n_2 \dots n_r$ overall possible outcomes.



수백만의 가지가 있는 나무를 상상할 수 있다. 이해하는 좋은 방법: 수형도



**Binomial coef (이항계수)**

: number of subsets of size k of group of n people
$$
\binom{n}{k} = \frac{n!}{(n-k)!k!}
$$


ex) prob of full house in poker, 5 card hand (포커 카드 총 개수는 52장)

**확률 문제를 풀 때 구체적인 숫자로 예시를 그리는 것이 정말 도움된다.**

풀하우스는 3장, 2장 같은 카드

서로다른 종류의 카드는 13장있다.

answer:
$$
\frac{13 \cdot \binom{4}{3} \cdot 12 \cdot \binom{4}{2}}{\binom{52}
{5}}
$$


Sampling table (표본표)

choose k objects out of n

| .                 | 순서 고려(order matter) | 순서 x             |
| ----------------- | ----------------------- | ------------------ |
| 교체(replacement) | $n^k$                   | $\binom{n+k-1}{k}$ |
| 교체 x            | $n(n-1) \dots (n-k+1)$  | $\binom{n}{k}$     |

