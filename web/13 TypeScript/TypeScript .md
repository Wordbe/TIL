# TypeScript

### TypeScript 를 사용하는 이유

**1) IDE를 더욱 적극적으로 활용 (자동완성, 타입확인)**

​	리액트 컴포넌트의 경우 props 전달 값은 무엇인지 JSX를 작성하는 과정에서 바로 알 수 있습니다. 리덕스와 함께 사용할 때도 스토어 안에 어떤 상태가 들어있는지 바로 조회가 가능해서 편리합니다.



**2) 실수방지**

​	함수, 컴포넌트 등의 타입 추론을 통해 사소한 오타를 만들면 코드를 실행하지 않더라도 IDE 상에서 바로 알 수 있습니다. 예를 들어 null 체킹도 확실히 할 수 있습니다.



---

## 1 타입스크립트 연습

```
$ mkdir ts-practice # ts-practice 라는 디렉터리 생성
$ cd ts-practice # 해당 디렉터리로 이동
$ yarn init -y # 또는 npm init -y
```



ts-practice 안에 package.json 파일이 만들어집니다.



### 타입스크립트 설정파일 생성

**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

이 파일을 직접 만들 수도 있지만, 보통 명령어를 사용하여 자동 생성합니다.

```
$ yarn global add typescript
```



디렉터리 안에서

```
$ tsc --init
```

명령어를 치면 tsconfig.json 파일이 생성됩니다.

(또는 `npm install -g typescript`)



* target : 컴파일된 코드가 실행되는 환경을 정의합니다. 예를 들면 es5로 설정하면 화살표 함수가 function 키워드를 사용하는 함수로 변환됩니다. 하지만, es6로 설정하면 화살표 함수를 그대로 유지해줍니다.
* module : 컴파일된 코드가 사용하는 모듈 시스템을 정의합니다. 예를 들어 common으로 설정하면 `export default Sample` 을 컴파일한 코드에서는 `export.default = helloWorld` 로 변환해주지만, 이값은 es2015로 하면 `export default Sample`을 그대로 유지합니다.
* strict : 모든 타입 체킹 옵션을 활성화 합니다.
* esModuleInterop : commonjs 모듈 형태로 이루어진 파일을 es2015 모듈 형태로 불러올 수 있게 해줍니다. [(참고)](https://stackoverflow.com/questions/56238356/understanding-esmoduleinterop-in-tsconfig-file)

현재 기본 설정에서 한 가지 속성을 추가해봅니다.

* outDir : 컴파일된 파일들이 저장되는 경로를 지정할 수 있습니다.



**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  }
}
```



---

### TypeScript 파일 생성

**src/practice.ts**

```typescript
const message: string = 'hello world';
console.log(message);
```



```
$ tsc
```

명령을 실행하면 

**dis/practice.js** 가 생성 됩니다.

```javascript
"use strict";
var message = 'hello world';
console.log(message);
```



---

### 기본 타입

`let`과 `const`를 사용하여 값을 선언하는 연습을 해봅시다.



**src/practice.ts**

```typescript
let count = 0; // 숫자
count += 1;
count = '갑자기 분위기 문자열'; // 이러면 에러가 납니다!

const message: string = 'hello world'; // 문자열

const done: boolean = true; // 불리언 값

const numbers: number[] = [1, 2, 3]; // 숫자 배열
const messages: string[] = ['hello', 'world']; // 문자열 배열

messages.push(1); // 숫자 넣으려고 하면.. 안된다!

let mightBeUndefined: string | undefined = undefined; // string 일수도 있고 undefined 일수도 있음
let nullableNumber: number | null = null; // number 일수도 있고 null 일수도 있음

let color: 'red' | 'orange' | 'yellow' = 'red'; // red, orange, yellow 중 하나임
color = 'yellow';
color = 'green'; // 에러 발생!
```



TypeScript를 사용하면 이렇게 변수나 상수 타입을 지정할 수 있고, 사전에 지정한 타입이 아닐 경우 에러를 발생시킵니다.



---

### 함수에서 타입 정의



**src/practice.ts**

```typescript
function sum(x: number, y: number): number {
  return x + y;
}

sum(1, 2);
```



숫자의 총합을 구하는 sumArr 함수를 만들어봅니다.

**src/practice.ts**

```typescript
function sumArray(numbers: number[]): number {
  return numbers.reduce((acc, current) => acc + current, 0);
}

const total = sumArray([1, 2, 3, 4, 5]);
```



함수에서 아무것도 반환하지 않을 때는 반환 타입을 void로 설정합니다.

```typescript
function returnNothing(): void {
  console.log('I am just saying hello world');
}
```



---

### interface 사용해보기

interface는 클래스 또는 객체를 위한 타입을 지정할 때 사용되는 문법입니다.



클래스에서 interface를 implements 하기



**practice.ts**

```typescript
// Shape 라는 interface 를 선언합니다.
interface Shape {
  getArea(): number; // Shape interface 에는 getArea 라는 함수가 꼭 있어야 하며 해당 함수의 반환값은 숫자입니다.
}

class Circle implements Shape {
  // `implements` 키워드를 사용하여 해당 클래스가 Shape interface 의 조건을 충족하겠다는 것을 명시합니다.

  radius: number; // 멤버 변수 radius 값을 설정합니다.

  constructor(radius: number) {
    this.radius = radius;
  }

  // 너비를 가져오는 함수를 구현합니다.
  getArea() {
    return this.radius * this.radius * Math.PI;
  }
}

class Rectangle implements Shape {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  getArea() {
    return this.width * this.height;
  }
}

const shapes: Shape[] = [new Circle(5), new Rectangle(10, 5)];

shapes.forEach(shape => {
  console.log(shape.getArea());
});
```



이런식으로 width, height 멤버 변수를 선언한 뒤 constructor에서 해당 값을 하나하나 설정해주었습니다. TypeScript에서는 constructor의 파라미터에 `public` 또는 `private` [accessor](https://www.typescriptlang.org/docs/handbook/classes.html#accessors) 를 사용하여 이 작업을 생략할 수 있습니다.

```typescript
// Shape 라는 interface 를 선언합니다.
interface Shape {
  getArea(): number; // Shape interface 에는 getArea 라는 함수가 꼭 있어야 하며 해당 함수의 반환값은 숫자입니다.
}

class Circle implements Shape {
  // `implements` 키워드를 사용하여 해당 클래스가 Shape interface 의 조건을 충족하겠다는 것을 명시합니다.
  constructor(public radius: number) {
    this.radius = radius;
  }

  // 너비를 가져오는 함수를 구현합니다.
  getArea() {
    return this.radius * this.radius * Math.PI;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {
    this.width = width;
    this.height = height;
  }
  getArea() {
    return this.width * this.height;
  }
}

const circle = new Circle(5);
const rectangle = new Rectangle(10, 5);

console.log(circle.radius);
console.log(rectangle.width);

const shapes: Shape[] = [new Circle(5), new Rectangle(10, 5)];

shapes.forEach(shape => {
  console.log(shape.getArea());
});
```



public 으로 선언된 값은 클래스 외부에서도 조회가 가능하지만, private으로 선언된 값은 클래스 내부에서만 조회할 수 있습니다. 따라서 rectangle의 width 또는 height는 외부에서 조회할 수 없습니다.



### 일반 객체를 interface로 타입 설정하기

클래스가 아닌 일반 객체를 interface를 사용하여 타입을 지정하는 방법을 알아봅니다.

**practice.ts**

```typescript
interface Person {
  name: string;
  age?: number; // 물음표가 들어갔다는 것은, 설정을 해도 되고 안해도 되는 값이라는 것을 의미합니다.
}
interface Developer {
  name: string;
  age?: number;
  skills: string[];
}

const person: Person = {
  name: '김사람',
  age: 20
};

const expert: Developer = {
  name: '김개발',
  skills: ['javascript', 'react']
};
```



Person 객체와 Developer 객체가 유사하므로, interface를 선언할 때 다른 interface를 `extends` 키워드를 통해 상속받을 수 있습니다.

```typescript
interface Person {
  name: string;
  age?: number; // 물음표가 들어갔다는 것은, 설정을 해도 되고 안해도 되는 값이라는 것을 의미합니다.
}
interface Developer extends Person {
  skills: string[];
}

const person: Person = {
  name: '김사람',
  age: 20
};

const expert: Developer = {
  name: '김개발',
  skills: ['javascript', 'react']
};

const people: Person[] = [person, expert];
```



---

### Type Alias 사용하기

`type`은 특정 타입에 별칭을 붙이는 용도로 사용합니다. 객체를 위한 타입을 설정할 수도 있고, 배열이나 아무 타입의 별칭을 지어줄 수 있습니다.

**practice.ts**

```typescript
type Person = {
  name: string;
  age?: number; // 물음표가 들어갔다는 것은, 설정을 해도 되고 안해도 되는 값이라는 것을 의미합니다.
};

// & 는 Intersection 으로서 두개 이상의 타입들을 합쳐줍니다.
// 참고: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types
type Developer = Person & {
  skills: string[];
};

const person: Person = {
  name: '김사람'
};

const expert: Developer = {
  name: '김개발',
  skills: ['javascript', 'react']
};

type People = Person[]; // Person[] 를 이제 앞으로 People 이라는 타입으로 사용 할 수 있습니다.
const people: People = [person, expert];

type Color = 'red' | 'orange' | 'yellow';
const color: Color = 'red';
const colors: Color[] = ['red', 'orange'];
```



클래스와 관련된 타입의 경우 interface를 이용하는 것이 좋고, 일반 객체 타입의 경우에는 type을 사용해도 무방합니다. 객체를 위한 타입을 정의할 때 둘 다 사용해도 상관 없고, 일관성을 유지하기만 하면 됩니다.



---

### Generics

제너릭은 타입스크립트에서 함수, 클래스, interface, type alias를 사용할 때 여러 종류의 타입에 대해 호환을 맞춰야 하는 상황에서 필요한 문법입니다.



### 함수에서 Generics 사용하기

​	어떤 타입이 올 지 모를 때는 `any`를 사용할 수 있습니다.

**practice.ts**

```typescript
function merge(a: any, b: any): any {
  return {
    ...a,
    ...b
  };
}

const merged = merge({ foo: 1 }, { bar: 1 });
```

그런데 이렇게하면 타입 유추가 불가능 한 것이나 다름 없습니다.

이럴 때 Generics를 사용하면 됩니다.

```typescript
function merge<A, B>(a: A, b: B): A & B {
  return {
    ...a,
    ...b
  };
}

const merged = merge({ foo: 1 }, { bar: 1 });
```



또다른 예시 입니다.

```typescript
function wrap<T>(param: T) {
  return {
    param
  }
}

const wrapped = wrap(10);
```

이렇게 함수에서 Generics를 사용하면 파라미터로 다양한 타입을 넣을 수도 있고, 타입 지원을 지켜낼 수 있습니다.



### interface에서 Generics 사용하기

```typescript
interface Items<T> {
  list: T[];
}

const items: Items<string> = {
  list: ['a', 'b', 'c']
};
```



### 클래스에서 Generics 사용하기

```typescript
class Queue<T> {
  list: T[] = [];
  get length() {
    return this.list.length;
  }
  enqueue(item: T) {
    this.list.push(item);
  }
  dequeue() {
    return this.list.shift();
  }
}

const queue = new Queue<number>();
queue.enqueue(0);
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.enqueue(4);
console.log(queue.dequeue());
console.log(queue.dequeue());
console.log(queue.dequeue());
console.log(queue.dequeue());
console.log(queue.dequeue());
```







---

**Reference**

https://react.vlpt.us/using-typescript/

https://react.vlpt.us/using-typescript/01-practice.html