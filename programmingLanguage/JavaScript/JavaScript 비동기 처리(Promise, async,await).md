# JavaScript 비동기 처리(Promise, async/await)

![](https://i.imgur.com/hh3Mawr.png)



동기적 작업은 한 작업이 끝날 때까지 기다리는 동안 다른 작업을 할 수 없습니다.

비동기 작업은 흐름을 멈추지 않고 동시에 여러 작업을 처리할 수 있고, 기다리는 과정에서 다른 함수도 호출할 수도 있습니다.



연산량이 많은 함수를 만들어봅니다.

**index.js**

```javascript
function work() {
  const start = Date.now();
  for (let i = 0; i < 1e9; i++) {}
  const end = Date.now();
  console.log(end - start + 'ms');
}

work();
console.log('다음 작업');
```



만약 이 작업이 진행되는 동안 다른 작업을 하려면 비동기 형태로 전환해 주어야 합니다. `setTiemout`을 이용해야 합니다.

```javascript
function work() {
  setTimeout(() => {
    const start = Date.now();
    for (let i = 0; i < 1000000000; i++) {}
    const end = Date.now();
    console.log(end - start + 'ms');
  }, 0);
}

console.log('작업 시작!');
work();
console.log('다음 작업');
```



`setTimeout` 함수는 첫번째 파라미터에 넣은 함수를 두 번째 파라미터에 넣은 시간(ms)이 흐른 후 호출해 줍니다. 0을 넣으면 바로 실행한다는 의미 즉, 0ms이후를 의미하지만, 실제는 4ms 이후에 실행됩니다. ([참고](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Reasons_for_delays_longer_than_specified))

`setTimeout`을 사용하면 정한 작업이 백그라운데에서 수행되기 때문에 기존 코드 흐름을 막지 않고 동시에 다른 작업을 진행할 수 있습니다.



work 함수가 끝난다음에 어떤 작업을 처리하고 싶다면, 콜백(callback)함수를 파라미터로 전달해주면 됩니다. 콜백 함수란 함수 타입의 값을 파라미터로 넘겨줘서 파라미터로 받은 특정 작업이 끝나고 호출해 주는 것입니다.



```javascript
function work(callback) {
  setTimeout(() => {
    const start = Date.now();
    for (let i = 0; i < 1000000000; i++) {}
    const end = Date.now();
    console.log(end - start + 'ms');
    callback();
  }, 0);
}

console.log('작업 시작!');
work(() => {
  console.log('작업이 끝났어요!')
});
console.log('다음 작업');
```

```
>>
작업 시작!
다음 작업
498ms
작업이 끝났어요!
```



다음과 같은 작업들은 주로 비동기적으로 처리합니다.

* Ajax Web API 요청 : 서버에서 데이터를 불러올 경우, 요청을 하고 서버에서 응답을 할 때까지 대기를 해야되기 때문에 비동기작업을 합니다.
* 파일 읽기 : 주로 서버에서 파일을 읽을 때 비동기 처리를 합니다.
* 암호화/복호화 : 암호화/복호화 시 시간이 어느정도 걸리는 경우가 있어 비동기처리를 합니다.
* 작업 예약 : 단순히 어떤 작업을 몇초 후 스케쥴링 해야 하는 상황에서 setTimeout을 사용하여 비동기 처리를 합니다.



비동기작업을 다룰 때 callback 외에도 promise, async/awit 문법을 사용합니다. 이어서 배워봅니다.



---

## Promise

프로미스는 비동기 작업을 편하게 처리하기 위에 ES6에 도입된 기능입니다. 예전에는 콜백 함수로 처리했어야 했는데, 이 경우 코드가 쉽게 난잡해지게 됩니다.



숫자 n을 파라미터로 받아서 다섯번에 걸쳐 1초마다 1씩 더해 출력하는 작업을 setTimeout 으로 구현해봅니다.

```javascript
function increaseAndPrint(n, callback) {
  setTimeout(() => {
    const increased = n + 1;
    console.log(increased);
    if (callback) {
      callback(increased);
    }
  }, 1000);
}

increaseAndPrint(0, n => {
  increaseAndPrint(n, n => {
    increaseAndPrint(n, n => {
      increaseAndPrint(n, n => {
        increaseAndPrint(n, n => {
          console.log('끝!');
        });
      });
    });
  });
});
```

비동기적으로 하는 일이 많아질수록, 코드의 깊이가 깊어지는 현상이 발생합니다. 이런 식의 코드를 콜백지옥(Callback Hell)이라고 부릅니다. Promise를 사용해서 이 현상을 방지할 수 있습니다.



### Promise

Promise는 성공할 수도, 실패할 수도 있습니다. 성공할 때는 resolve를 호출해주고, 실패할 때는 reject를 호출해주면 됩니다. 

지금 당장 실패하는 상황은 고려하지 않고, 1초 뒤에 성공시키는 상황에 대해 구현해봅니다.

```javascript
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});

myPromise.then(n => {
  console.log(n);
});
```

resovle 호출 시 특정 값을 파라미터로 넣어주면, 이 값을 작업이 끝나고 나서 사용할 수 있습니다. 작업이 끝나고 나서 또 다른 작업을 해야 할 때는 Promise 뒤에 `.them(...)`을 붙여서 사용합니다.



```javascript
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error());
  }, 1000);
});

myPromise
  .then(n => {
    console.log(n);
  })
  .catch(error => {
    console.log(error);
  });
```

위 코드는 1초 후 실패되게 하는 코드입니다.

실패하는 상황에서는 `reject`를 사용하고, `.catch`를 통하여 실패했을 시 수행할 작업을 설정할 수 있습니다.

이제, Promise를 만드는 함수를 작성해봅니다.

```javascript
function increaseAndPrint(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const value = n + 1;
      if (value === 5) {
        const error = new Error();
        error.name = 'ValueIsFiveError';
        reject(error);
        return;
      }
      console.log(value);
      resolve(value);
    }, 1000);
  });
}

increaseAndPrint(0).then((n) => {
  console.log('result: ', n);
})
```



Promise 속성 중에는 then 내부에 넣은 함수에서 Promise를 또 리턴하면 연달해서 사용할 수 있습니다.

```javascript
increaseAndPrint(0)
  .then(n => {
    return increaseAndPrint(n);
  })
  .then(n => {
    return increaseAndPrint(n);
  })
  .then(n => {
    return increaseAndPrint(n);
  })
  .then(n => {
    return increaseAndPrint(n);
  })
  .then(n => {
    return increaseAndPrint(n);
  })
  .catch(e => {
    console.error(e);
  });
```



그리고 위 코드는 다음과 같이 정리할 수 있습니다.

```javascript
increaseAndPrint(0)
  .then(increaseAndPrint)
  .then(increaseAndPrint)
  .then(increaseAndPrint)
  .then(increaseAndPrint)
  .then(increaseAndPrint)
  .catch(e => {
    console.error(e);
  });
```



이렇게 하면 비동기 작업 개수가 많아져도 코드의 깊이가 깊어지지 않습니다.

하지만 Promise도 불편한 점이 있습니다. 에러를 잡을 때 몇 번째에서 발생했는지 알기 어렵고, 특정 조건에 따라 분기 나누는 작업도 어렵고, 특정 값을 공유해가면서 작업을 처리하기도 까다롭습니다. 

async/await를 사용하면 이런 문제점을 해결할 수 있습니다.



---

### async / await

async/await 문법은 ES8 에 해당하는 문법으로서, Promise를 더욱 쉽게 사용할 수 있게 해줍니다.

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function process() {
  console.log('안녕하세요!');
  await sleep(1000); // 1초쉬고
  console.log('반갑습니다!');
}

process();
```

함수 선언 시 함수 앞부분에 `async` 키워드를 붙여줍니다. 그리고 Promise 앞부분에 `await`를 넣어주면 프로미스가 끝날 때 까지 기다렸다가 다음 작업을 수행할 수 있습니다.

`async` 함수에서 에러를 발생 시킬 때 `throw`를 사용하여, 에어를 잡아낼 때는 `try/catch`문을 사용합니다.

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeError() {
  await sleep(1000);
  const error = new Error();
  throw error;
}

async function process() {
  try {
    await makeError();
  } catch (e) {
    console.error(e);
  }
}

process();
>>
    Error
```



이번에는 비동기 함수를 몇개 더 만들어봅니다.

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getDog = async () => {
  await sleep(1000);
  return '멍멍이';
};

const getRabbit = async () => {
  await sleep(500);
  return '토끼';
};
const getTurtle = async () => {
  await sleep(3000);
  return '거북이';
};

async function process() {
  const dog = await getDog();
  console.log(dog);
  const rabbit = await getRabbit();
  console.log(rabbit);
  const turtle = await getTurtle();
  console.log(turtle);
}

process();
```

`getDog`은 1초, `getRabbit`은 0.5초, `getTurtle`은 3초가 걸리며 순서대로 실행되고 있습니다. 즉 하나가 끝나야 다음 작업이 시작됩니다.  함수들을 `process` 함수에서 연달아서 사용하게 되면서, `process`가 실행되는 총 시간은 4.5초가 됩니다.

이제 이 세 함수를 동시에 진행하기 위해 `Promise.all`을 이용해보겠습니다.

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getDog = async () => {
  await sleep(1000);
  return '멍멍이';
};

const getRabbit = async () => {
  await sleep(500);
  return '토끼';
};
const getTurtle = async () => {
  await sleep(3000);
  return '거북이';
};

async function process() {
  const [dog, rabbit, turtle] = await Promise.all([
    getDog(),
    getRabbit(),
    getTurtle()
  ]);
  console.log(dog);
  console.log(rabbit);
  console.log(turtle);
}

process();
```

```
>>
'멍멍이'
'토끼'
'거북이'
```

`Promise.all` 을 사용할 때는, 등록한 프로미스 중 하나로 실패하면 모든 것이 실패하는 것으로 간주합니다.



이번에는 `Promise.race`를 사용해봅니다. 이는 여러개의 프로미스를 등록해서 실행했을 때, 가장 빨리 끝난 것 하나만 결과값으로 가져옵니다.

```javascript
...
async function process() {
  const first = await Promise.race([
    getDog(),
    getRabbit(),
    getTurtle()
  ]);
  console.log(first);
}

process();
```

`Promise.race`경우 가장 빠른 Promise가 먼저 성공하기 전에, 가장 먼저 끝난 Promise가 실패하면 이를 실패로 간주합니다. 즉 `getRabbit`에서 에러를 발생시킨다면 에러를 잡아낼 수 있지만,  `getTurtle`이나 `getDog`에서 발생한 에러는 무시됩니다.



---

**Reference**

https://learnjs.vlpt.us/async/

https://learnjs.vlpt.us/async/01-promise.html

https://learnjs.vlpt.us/async/02-async-await.html