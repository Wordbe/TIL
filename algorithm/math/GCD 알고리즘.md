# GCD 알고리즘

GCD(Greatest Common Divider, 최대공약수)를

구하는 방법 중 하나로 유클리드 호체법(유클리드 알고리즘, Euclidean algorithm)이 있습니다.



유클리드 호제법은 간단합니다.

a, b의 최대 공약수를 (a, b)라고 정의하면 다음과 같은 관계가 성립합니다.
$$
\begin{align}
(a, b) = (b, r) \newline &
where, a \geq b, 0 \leq r < b
\end{align}
$$
단, a, b는 정수이고, a를 b로 나눈 나머지는 r 입니다.



---

**증명은 비교적 간단하지만, 수식이 조금 복잡할 수 있습니다.**

따라서 최대한 핵심 수식만 쓰고, 나머지는 말로 풀었습니다.





증명은 다음과 같습니다.



**1)**
$$
(a, b) = d, a = d \alpha, b = d\beta
$$
라고 가정하여**(단, $\alpha$ 와 $\beta$는 서로소입니다.)** $a = bq + r$에 대입하면 
$$
r = d(\alpha - \beta q)
$$
임을 알 수 있습니다. 즉, $r$이 $d$의 배수임을 알 수 있고,

식의 간단함을 위해 $r = d\rho$ 라고 할수 있습니다.



**2)**

**이제 $b$와 $r$이 공약수 $d$를 가지는 식으로 드러나게 되었는데요.**

$\beta$와 $r$의 관계를 알아보기 위해 다음과 같은 가정을 하도록 합니다.


$$
(\beta, \rho) = d' > 1, \beta = d' \beta', \rho = d'\rho'
$$
이라고 가정 한 후, $a = bq + r$ 에 대입하면
$$
\alpha = d'(\beta q + \rho')
$$
임을 알 수 있습니다. 즉, $\alpha$는 $d'$의 배수입니다.



**3)**

하지만 이는 $\alpha$와 $\beta$가 서로소 라는 조건에 모순이 되므로,

이는 곧 $(\beta, \rho) = d' > 1$ 이라는 가정에 모순이 됩니다.

즉,
$$
(\beta, \rho) = 1
$$
입니다.



**4)** 따라서 
$$
b = d\beta, r = d\rho
$$
이었으므로 3)의 결과를 바탕으로 
$$
(b, r) = d
$$
임을 알게 됩니다. 

즉 $ (a, b) = (b, r) = d $라는 것이 증명되었습니다.



---

알고리즘을 알았으면,

**코드로 구현해봅시다**



```cpp
void swap(int& a, int& b){
    int temp = a;
    a = b;
    b = temp;
}

int GCD(int a, int b){
    int n;
    if (a < b) swap(a, b);
    while (!b == 0){
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}
```











참고 -  [https://ko.wikipedia.org/wiki/%EC%9C%A0%ED%81%B4%EB%A6%AC%EB%93%9C_%ED%98%B8%EC%A0%9C%EB%B2%95](https://ko.wikipedia.org/wiki/유클리드_호제법) 

