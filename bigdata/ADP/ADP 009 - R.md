# ADP - 데이터 분석

# 1. R과 데이터마트

## 01 R 기초

* 데이터를 메모리(RAM)에 올려놓고 사용하므로, 속도가 빠르다.



### 1) 데이터 구조

* Vector(1차원), Matrix(2차원), Array(고차원), Data frame(2차원, 다른 타입가능), List

### 2) 벡터(Vector)

하나 이상의 스칼라 원소가 있는 집합. 동일 자료형을 가진다. `c()`, `seq()`, `rep()`

* 정수와 문자열을 섞으면, 모두 문자열로 변환된다.
* 범주형(Categroical) : 정성적 → 명목형, 순서형
* 수치형(Numerical) : 정랑적 → 이산형, 연속형

>R에는 4가지 벡터 타입이 있다.
>
>* numeric : 실수
>* integer : 정수
>* character : 문자열
>* factor : 범주형 변수(명목형 변수, 순서형 변수)

대표적인 `iris` 데이터셋을 살펴보자.

```R
> str(iris)
'data.frame':	150 obs. of  5 variables:
 $ Sepal.Length: num  5.1 4.9 4.7 4.6 5 5.4 4.6 5 4.4 4.9 ...
 $ Sepal.Width : num  3.5 3 3.2 3.1 3.6 3.9 3.4 3.4 2.9 3.1 ...
 $ Petal.Length: num  1.4 1.4 1.3 1.5 1.4 1.7 1.4 1.5 1.4 1.5 ...
 $ Petal.Width : num  0.2 0.2 0.2 0.2 0.2 0.4 0.3 0.2 0.2 0.1 ...
 $ Species     : Factor w/ 3 levels "setosa","versicolor",..: 1 1 1 1 1 1 1 1 1 1 ...
```

`Species` 칼럼의 경우 타입은 Factor 이고, 나머지는 numeric이다. 명목형 형태로 setosa, versicolcor, virginica 로 3가지 레벨로 되어 있다.

`factor`에서 level을 추가하고 싶다면 아래와 같이하면 된다.

```R
levels(iris$Species) <- c("setosa", "versicolcor", "virginica", "newlevel")
```



---

### 3) 행렬(Matrix)

한 가지 타입의 스칼라만 사용할 수 있다.

```R
> m <- matrix(c(1,2,3,4,5,6), ncol=2)
> m
     [,1] [,2]
[1,]    1    4
[2,]    2    5
[3,]    3    6
```

```R
matrix(data, nrow, ncol, byrow=FALSE, dimnames=NULL)
```

* `byrow` : FALSE 이면 열 우선 계산한다.

```R
> dimnames(m) <- list(c("r1", "r2", "r3"), c("c1", "c2"))
> m
   c1 c2
r1  1  4
r2  2  5
r3  3  6
```





---

### 4) Data frame

2차원, 각 **열**이 다른 타입을 가질 수 있다.



### 5) 배열(Array)

다차원 데이터



### 6) 리스트(List)

* 서로 다른 데이터 유형을 담을 수 있다.
* (키, 값) 데이터를 담는 연관 배열이다.

```R
> x <- list(name="guri", age=17)
> x
$name
[1] "guri"

$age
[1] 17
```



---

## R 그래픽 기능

### 1) 산점도(Scatter)

```R
plot(x, y)
```



### 2) 산점도 행렬

```R
pairs(iris[1:4], main="Iris 3 Species", pch=21, 
      bg=c("red", "green3", "blue")[unclass(iris$Species)])
```

각 변수들의 상관성을 그래프로 알 수 있다.



### 3) 히스토그램, 상자그림(Boxplot)

```R
hist()
boxplot()
```



---

## 02 데이터 마트(DM, Data Mart)

데이터 마트: 사용자가 관심을 갖는 비교적 작은 규모의 데이터 웨어하우스(DW, Data Warehouse)



### 1) R reshape2의 melt(), cast() 함수

* `melt()` : 여러 변수(칼럼)로 구성된 데이터를 `id`, `variable`, `value` 형태로 재구성한다.

```R
library(reshape2)
data(airquality)
names(airquality) <- tolower(names(airquality))

T <- melt(airquality, id=c("month", "day"), na.rm=TRUE)
head(T)
  month day variable value
1     5   1    ozone    41
2     5   2    ozone    36
3     5   3    ozone    12
4     5   4    ozone    18
6     5   6    ozone    28
7     5   7    ozone    23
```



```R
> str(T)
'data.frame':	568 obs. of  4 variables:
 $ month   : int  5 5 5 5 5 5 5 5 5 5 ...
 $ day     : int  1 2 3 4 6 7 8 9 11 12 ...
 $ variable: Factor w/ 4 levels "ozone","solar.r",..: 1 1 1 1 1 1 1 1 1 1 ...
 $ value   : num  41 36 12 18 28 23 19 8 7 16 ...
```

데이터 구조를 보면 알겠지만, 내가 정해준 칼럼 id(month, day)를 제외한 나머지 칼럼은 `variable`이라는 속성에 `factor` 타입으로 담고, `value` 속성에 해당되는 값을 기록한다.



* `cast()` : `melt()`된 데이터를 원상복구 한다.

```R
library(reshape)
> T <- cast(T)
> head(T)
  month day ozone solar.r wind temp
1     5   1    41     190  7.4   67
2     5   2    36     118  8.0   72
3     5   3    12     149 12.6   74
4     5   4    18     313 11.5   62
5     5   5    NA      NA 14.3   56
6     5   6    28      NA 14.9   66
```



---

### 2) plyr

* `ply()` 함수는 앞에 두 문자를 접두사로 가진다. 첫 번째 문자는 입력데이터 형태, 두 번째 문자는 출력 데이터 형태이다. 
  * 예를 들어 `ddply`는 입력 데이터 타입과 출력 데이터 타입이 `data.frame` 이다.
* 데이터를 분리(split)하고, 특정 함수를 적용(apply)하고, 결과를 재결합(combine) 처리한다.

```R
set.seed(999)
d <- data.frame(year=rep(2018:2020, each=6), count=round(runif(9, 0, 20)))
d

library(plyr)
applyfunction <- function(x) {
  mean.count = mean(x$count)
  sd.count = sd(x$count)
  cv = sd.count / mean.count
  data.frame(cv.count=cv)
}
> ddply(d, "year", applyfunction)
  year  cv.count
1 2018 0.6974429
2 2019 0.6138888
3 2020 0.6974429
```



---

### 3) data table

데이터 프레임과 유사하지만, 빠른 그룹핑, 순서화(ordering), 짧은 문장을 지원에서 속도가 빠르다.

```R
library(data.table)
CARS <- as.data.table(cars)
# tables 에 메타정보가 저장된다.
tables()

# 칼럼 타입을 알아볼 수 있다.
sapply(CARS, class)

# 특정 칼럼을 키로 등록해서 빠르게 접근이 가능하다.
setkey(CARS, speed)
```



----

## 03 결측값 처리, 이상값 검색

결측값을 처리할 때 고려사항

* 효율성 문제
* 자료처리, 분석의 복잡성 문제
* 관측값과 결측값 차이에서의 편이(bias)



### 1) 결측값(Missing value)의 대치법(Imputation)

* 완전 응답 개체분석 : 결측값을 모두 제거한다.
* 평균대치법
* 단순확률 대치법 : 평균대치법에서 확률값 부여한 후 대치한다.
* 다중대치법

```R
> y <- c(2,3,4,NA)

# 결측값 찾기
> is.na(y)
[1] FALSE FALSE FALSE  TRUE

> mean(y)
[1] NA

# 결측값 제하고 평균
> mean(y, na.rm=TRUE)
[1] 3
```



* `complete.cases()`는 결측값이 없는 행만 추출한다.

```R
library(reshape)
data(french_fries)
french_fries[!complete.cases(french_fries), ]
    time treatment subject rep potato buttery grassy rancid painty
315    5         3      15   1     NA      NA     NA     NA     NA
455    7         2      79   1    7.3      NA    0.0    0.7      0
515    8         1      79   1   10.5      NA    0.0    0.5      0
520    8         2      16   1    4.5      NA    1.4    6.7      0
563    8         2      79   2    5.7       0    1.4    2.3     NA
```



### 2) 이상값(Outlier) 검색

상황에 따라 이상값 처리 방법을 결정한다.

* 의도하지 않게 잘못 입력한 경우(bad data)
* 위 경우에서 분석 목적에 맞지 않아 제거해야 하는 경우(bad data)
* 의도되지 않았지만 분석에 포함해야 하는 경우(이상값)
* 의도된 이상값

`outliers` 패키지를 이용해 이상값을 찾을 수 있다.

```R
install.packages("outliers")
library(outliers)
set.seed(999)

y = rnorm(100)
# 평균과 가장 큰 차이가 나는 값을 출력한다.
outlier(y)
# 평균과 가장 큰 차이가 나는 값(반대 방향으로)을 출력한다.
outlier(y, opposite = TRUE)

dim(y) <- c(20, 5)
# 각 열마다 평균과 가장 큰 차이가 나는 값을 출력한다.
outlier(y)
```

또는 `boxplot`을 이용한다.

```R
boxplot(y)
```



### 3) 왜도(skew), 첨도(kurtosis)

```R
# 자유도 5인 카이제곱분포에서 난수 100개를 뽑으면, 오른쪽으로 기울어진 분포가 나타난다.
x <- rchisq(100, 5)
hist(x)

# psych 패키지에서 왜도, 첨도 확인이 가능하다.
library(psych)
describe(x)
   vars   n mean   sd median trimmed  mad  min   max range skew kurtosis   se
X1    1 100 4.73 2.53   4.44    4.57 2.54 0.35 11.16 10.81 0.47    -0.48 0.25
```

