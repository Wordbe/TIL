# Java - Package





## 1 패키지 (Package)

자바에서 패키지는 관련된 클래스를 그룹화할 때 사용한다. 파일을 담는 폴더라고 생각하면 된다. 

클래스 간 이름이 겹치는 것을 막고 유지하기 좋은 코드를 만들기 위해 패키지를 사용한다.

두 가지 패키지가 있다.

* 내장된 패키지 (Built-in packages) : Java API 로부터의 패키지 이다.
  * Java API는 이미 쓰여진 클래스의 라이브러리이다. 자유롭게 사용가능하다.
* 사용자 정의 패키지 (User-defined package)









---

## 2 Import 임포트 키워드



자바 라이브러리는 패키지와 클래스로 나뉜다.

`import` 키워드는 클래스나 패키지를 가져온다.

```java
import package.name.Class;   // 하나의 클래스를 가져온다.
import package.name.*;   // 전체 패키지를 가져온다.
```





---

## 3 classpath



클래스패스는 JRE 가 클래스나 다른 소스 파일을 검색하는 경로이다.

> JRE (Java Runtime Environment)



클래스 검색 경로는 `--classpath` 옵션을 사용해서 설정할 수 있다. (JDK 툴에서 사용하며, 선호되는 방법이다.)

또는 `CLASSPATH` 환경 변수로 설정할 수도 있다.

`--classpath` 가 선호되는 이유는 다른 어플리케이션에 영향을 주지 않고 각 어프리케이션을 독립적으로 설정할 수 있기 때문이다.



```shell
$ sdkTool -classpath classpath1;classpath2...
# sdkTool: java, javac, javadoc, apt 등

$ set CLASSPATH=classpath1;classpath2...
# CLASSPATH는 환경변수
```





---

## 4 접근제어자 (접근지시자)



자바에는 4가지 접근제어자가 있다.

`private`, `default`, `protected`, `public` 오른쪽으로 갈 수록 접근 권한이 넓어진다.





### private

```java
public class Fruit {
    private String apple;
    private String getApple() {
        return this.apple;
    }
}
```

private이 붙은 필드, 메소드는 해당 클래스에서만 접근 가능하다.





### default

접근제어자를 별도로 지정하지 않으면 `default` 접근제어자가 붙는다. 해당 패키지 내에서만 접근 가능하다.



```java
package white.house;

public class FruitSweet {
    String apple = "apple from FruitSweet";
}
```



```java
package white.house;

public class Fruit {
    String apple = "apple from Fruit";

    public static void main(String[] args) {
        FruitSweet sweet = new FruitSweet();
        System.out.println(sweet.apple);
    }
}
```



`Fruit` 클래스는 `FruitSweet` 클래스와 같은 패키지내에 있으므로 `SweetFruit` 의 `apple` 필드에 접근가능하다.





### protected

`protected` 가 붙은 필드, 메소드는 

동일 패키지내의 클래스 (`default`와 동일)

또는 해당 클래스를 상속받은 외부 패키지의 클래스에서 접근 가능하다. (`protected` 에서 추가)





```java
package white.category;

public class Food {
  protected String food = "food"
}
```



```java
package white.house;

import category.Food;

public class Fruit extends Food {
    public static void main(String[] args) {
        Fruit fruit = new Fruit();
        System.out.println(fruit.food);
    }
}
```





### public

`public` 접근 제어자가 붙은 변수, 메소드는 어떤 클래스에서라도 접근이 가능하다.



접근제어자를 통해 필드와 메소드의 접근 권한을 통일적으로 설정할 수 있어 일관적인 프로그래밍을 할 수 있고, 실수도 줄일 수 있다.

