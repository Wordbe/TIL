# java 5 - 클래스



### 클래스(Class)

* **객체를 만들어내기 위한 설계도 혹은 툴**
* 연관된 변수와 메소드의 집합

### 객체(Object)

* 소프트웨어 세계에 구현할 대상
* 클래스에 선언된 모양대로 설계된 실체
* `클래스 인스턴스`라고도 불린다.
* 객체는 모든 인스턴스를 대표하는 포괄적 의미를 갖는다.
* **OOP 관점에서 클래스 타입으로 선언되었을 때 객체라고 부른다.**

### 인스턴스(Instance)

* 설계도를 바탕으로 소프트웨어 세계에 구현된 구체적 실체
* 객체가 실체화되면 인스턴스라고 부른다. 인스턴스는 메모리에 할당된다.
* 인스턴스는 객체에 포함된다.
* **OOP 관점에서 객체가 메모리에 할당되어 실제 사용될 때 인스턴스라고 부른다.**
* 추상적 개념과 구체적 실체 사이의 관계를 다룰 때 사용
  * 객체는 클래스의 인스턴스이다.
  * 프로세스는 프로그램의 인스턴스이다.



객체랑 인스턴스는 거의 비슷.



---

- 클래스 정의하는 방법
- 객체 만드는 방법 (new 키워드 이해하기)
- 메소드 정의하는 방법
- 생성자 정의하는 방법
- this 키워드 이해하기





### 클래스 정의

클래스는 OOP에서 객체를 정의해주는 틀이다. 객체의 속성과 기능을 하나로 묶어놓는 틀이다.

필드, 생성자, 메소드로 구성된다.

접근지정자(access modifier)

| 접근지정자 | 접근범위                            | 동일 클래스 | 동일 패키지 | 다른 패키지의 자식클래스 | 다른 패키지 |
| ---------- | ----------------------------------- | ----------- | ----------- | ------------------------ | ----------- |
| public     | 접근 제한 없음                      | O           | O           | O                        | O           |
| protected  | 동일 패키지와 상속 받은 클래스 내부 | O           | O           | O                        |             |
| default    | 동일 패키지 내                      | O           | O           |                          |             |
| private    | 동일 클래스 내                      | O           |             |                          |             |

`protected` 필드가 선언된 클래스를 상속받으면, 패키지가 다르더라도 그 필드에 접근할 수 있다.

<br />

### 객체 생성 (new 키워드)

클래스로부터 객체를 만드는 것을 클래스의 인스턴스화라고 한다.

new 키워드를 사용하면, 메모리 힙 영역에 데이터가 저장되며, 변수는 객체가 저장된 영역의 주소를 참조한다.



### 메소드 정의

```java
접근지정자 리턴타입 메소드명(타입 파라미터) { }
public void setName(String name) {
  this.name = name;
}
```



> **메소드 오버로딩**
>
> 파라미터 타입이나 개수만 다른 메소드를 실행하고 싶을 때, 기존에 있었던 메소드와 동일한 메소드 이름으로 파라미터 정보만 달리해서 새롭게 정의할 수 있다. 다양한 파라미터를 받아서 처리를 할 수 있다.
>
> **메소드 오버라이딩**
>
> 상위 클래스에서 정의한 메소드를 하위 클래스에서 재정의 하는 기법이다. 메소드의 변경, 확장이 용이해진다.



### 생성자 정의

1. 기본생성자 : 클래스 내부에 정의한 생성자가 없을 경우, 객체 생성시 컴파일러가 기본생성자를 만들어준다.
2. 묵시적생성자 : 파리미터가 없는 생성자
3. 명시적생성자 : 파리미터 값을 가지는 생성자

리턴 타입 없고, 생성자 이름은 클래스 이름과 같다. 모든 클래스는 생성자가 반드시 존재한다. 한 개 이상의 생성자를 가진다.

명시적 생성자를 선언하면 컴파일러 기본생성자를 만들어주지 않으므로, 파라미터 없는 생성자가 필요하면 묵시적 생성자를 적어주어야 한다.

<br />

### this 키워드

**this 키워드는 클래스가 인스턴화가 되었을 때 자기 자신의 메모리 주소**를 가지고 있다.

`this.variable` : 클래스 내부의 필드이름과, 파리미터를 통해 들어온 변수이름이 동일하다면, 클래스 내부 변수를 명시하기 위해 this 를 붙인다. `state` 메서드에서는 this 를 사용하지 못한다.

`this()` : 같은 클래스 내부에서 생성자를 호출한다. 호출하는 곳의 첫 번째에 코드를 적어야 한다. 





---

클래스 예제

- int 값을 가지고 있는 이진 트리를 나타내는 Node 라는 클래스를 정의하세요.
- int value, Node left, right를 가지고 있어야 합니다.
- BinrayTree라는 클래스를 정의하고 주어진 노드를 기준으로 출력하는 bfs(Node node)와 dfs(Node node) 메소드를 구현하세요.
- DFS는 왼쪽, 루트, 오른쪽 순으로 순회하세요.

```java
class BinaryTreeTest {
    private Node root;
    private BinaryTree binaryTree;

    /**
     *  1
     *      2
     *          4
     *              7
     *                  9
     *      3
     *          5
     *          6
     *              8
     *                  10
     */
    @BeforeEach
    void setUp() {
        Node node10 = new Node(null,null,10);
        Node node9 = new Node(null,null,9);
        Node node8 = new Node(node10,null,8);
        Node node7 = new Node(null,node9,7);
        Node node6 = new Node(node8,null,6);
        Node node5 = new Node(null,null,5);
        Node node4= new Node(node7,null,4);
        Node node3 = new Node(node5,node6,3);
        Node node2 = new Node(node4,null,2);
        Node node1 = new Node(node2,node3,1);

        binaryTree = new BinaryTree(node1);
        root = binaryTree.getRoot();
    }

    @Test
    void getRoot() {
        Assertions.assertEquals(1, root.getValue());
    }

    @Test
    void bfs() {
        binaryTree.bfs(root);
    }

    @Test
    void dfs() {
        binaryTree.dfs(root);
    }

}
```

```java
public class Node {

    private Node left;
    private Node right;
    private int value;

    public Node(Node left, Node right, int value) {
        this.left = left;
        this.right = right;
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public Node getLeft() {
        return left;
    }

    public Node getRight() {
        return right;
    }
}
```

```java
public class BinaryTree {
    private Node root;

    public BinaryTree(Node root) {
        this.root = root;
    }

    public Node getRoot() {
        return root;
    }


    public void bfs(Node root) {
        LinkedList<Node> queue = new LinkedList<>();
        queue.offer(root);

        while(!queue.isEmpty()) {
            Node node = queue.poll();
            System.out.print(node.getValue() + " ");

            if (node.getLeft() != null) {
                queue.offer(node.getLeft());
            }
            if (node.getRight() != null) {
                queue.offer(node.getRight());
            }
        }
        System.out.println();
    }

    // Inorder (left, root, right order)
    public void dfs(Node root) {
        if (root == null) return;

        dfs(root.getLeft());
        System.out.print(root.getValue() + " ");
        dfs(root.getRight());
    }
}
```











