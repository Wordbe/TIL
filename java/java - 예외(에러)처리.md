# java - 예외(에러)처리



## 예외는 언제 발생하는가?



* 없는 파일을 읽으려 할 때

```java
BufferedReader br = new BufferedReader(new FileReader("없는파일"));
```

```shell
Exception in thread "main" java.io.FileNotFoundException: 없는파일 (지정된 파일을 찾을 수 없습니다)
```



* 0으로 나눌 때

```java
int c = 2 / 0;
```

```shell
Exception in thread "main" java.lang.ArithmeticException: / by zero
```



* 배열에서 지정된 크기를 넘어간 인덱스로 접근할 때

```java
int[] array = {1, 2, 3};
int third = a[3]; // 실수로 2대신 3을 입력
```

```shell
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: 3
```



---

## 예외란? (Exception vs Error)



예외(Exception) 와 오류(Error)는 모두 Throwable 예외 클래스를 상속받는다.

에러는 시스템 레벨에서 비정상적 상황이 생겼을 때 발생한다. 개발자가 미리 예측하여 처리할 수 없으므로, 애플리케이션에서 오류에 대한 처리를 신경쓰지 않는다.

반면, 예외는 개발자가 구현한 로직에서 발생할 수 있다. 따라서 발생할 상황을 미리 예측하여 처리할 수 있다. 

![](https://t1.daumcdn.net/cfile/tistory/996116375B30B71404)

Exception 의 자식클래스는 두가지 종류로 갈라진다.

컴파일 시 예외가 발생하는 `Checked Exception`, 

컴파일은 통과하지만, 런타임 시 예외가 발생하는 `Unchecked Exception` 이다. 이는 `RuntimeException` 을 상속받는다.

<br />

### Checked Exception

* 반드시 예외를 처리하고 넘어가야 한다.
* 컴파일 타임에서 예외가 발생하니 컴파일에서 실패하여 프로그램이 실행이 안되기 때문이다.
* 트랜잭션 안에서 예외 발생시 rollback 하지 않고 넘어간다.

<br />

### Unchecked Exception

* 예외 처리를 강제하지는 않는다.
* 런타임에 예외가 발생한다.
* 트랜잭션 안에서 예외 발생시 기본적으로 rollback 한다.





---

## 예외 처리하기



1. 예외 복구 **(try, catch)**

   * 예외를 잡고 다른 작업 흐름으로 유도한다. 

   ```java
   public int divide(int n) {
     int result;
     try {
       result = 10 / n;
     } catch(ArithmeticException e) {
       result = 10;
     }
     return result;
   }
   ```

   

2. 예외 전환 **(throw)**

   * 명확한 의미의 예외로 전환 후 직접 던진다.

   ```java
   public class FoolException extends RuntimeException {
     System.out.println("닉네임에 욕을 넣을 수 없어요.");
   }
   ```

   ```java
   if ("fool".eqauls(nickname)) {
     throw new FoolException();
   }
   ```

   ```shell
   Exception in thread "main" FoolException
   ```

   

   

   이제는 `FoolException` 을 `Exception` 을 상속받아 Checked Exception 으로 만들어보자. 이제 이 에러가 발생하면 컴파일시 에러가 난다.

   ```java
   public class FoolException extends Exception {
     System.out.println("닉네임에 욕을 넣을 수 없어요.");
   }
   ```

   그렇기 떄문에 아래와 같이 try, catch 문으로 감싸서 컴파일시 에러를 방지해 주어야 한다.

   ```java
   try {
     if ("fool".eqauls(nickname)) {
       throw new FoolException();
     }
   } catch (FoolException e) {
     System.out.println("FoolException 발생했습니다.");
   }
   ```

   

3. 예외처리 회피 **(throws)**

   * 처리하지 않고 호출한 쪽으로 예외를 던진다.(throw)

   

   ```java
   public void printNickname(String nickname) throws FoolException {
     if ("fool".equals(nickname)) {
       throw new FoolException();
     }
     System.out.println("닉네임: " + nickname);
   }
   ```

   ```java
   public static void main(String[] args) {
     printNickname("fool");
   }
   ```

   이렇게 하면 예외가 main 함수로 던져져서 위 코드는 에러가난다. 따라서 main 함수에서 try, catch 로 감싸주어야 한다.

   ```java
   public static void main(String[] args) {
     try {
     	printNickname("fool");  
     } catch (FoolException e) {
       System.out.println("FoolException 발생했습니다.");
     }
   }
   ```

   

---

## 트랜잭션에서 예외처리



```java
상품발송() {
    포장();
    영수증발행();
    발송();
}

포장(){
    try {
       ...
    }catch(예외) {
       포장취소();
    }
}

영수증발행() {
    try {
       ...
    }catch(예외) {
       영수증발행취소();
    }
}

발송() {
    try {
       ...
    }catch(예외) {
       발송취소();
    }
}
```

위와 같이 하면 포장취소 되었는데, 영수증이 발행된다거나

포장취소 되었는데, 발송이된다는 등 벌어져서는 안될 일이 벌어질 것이다.

이를 아래와 같이 고쳐보자.

```java
상품발송() {
    try {
        포장();
        영수증발행();
        발송();
    }catch(예외) {
       모두취소();
    }
}

포장() throws 예외 {
   ...
}

영수증발행() throws 예외 {
   ...
}

발송() throws 예외 {
   ...
}
```

포장, 영수증발행, 발송이라는 세 작업 중 하나만 실패하더라도 모두취소가 된다. 비즈니스로직에 부합한 예외 처리이다.







https://www.nextree.co.kr/p3239/

https://wikidocs.net/229





