# JavaScript

Javascript로 데이터를 표현하기 위해

배열(array)과 객체(object)를 이용합니다.



## 1. Javascript Array(배열)



### Declaration

```javascript
var a = [1, 2, 3, "hello", null, true, [[{1:0}]]];

console.log(a.length);
console.log(a[500]);

>>
    7
	undefined
```



### Method

a.push()

a.indexOf(x) : x가 배열 a에 있는지 확인 - 있으면 a[x] 출력

a.join() : 배열의 문자열로 합침

a.slice()

a.concat(x) : a에 x를 붙인 값을 반환. a는 바뀌지 않습니다.

	* Spread operator : [...a, x] 라고하면 위와 문법이 똑같습니다.



inplace되는 것과 안되는 것에 유의하여 method를 사용합니다.

* inplace : 메소드 결과 배열이 그 결과값으로 바뀜



**배열 탐색(forEach, map, filter)**

```javascript
var b = [...a, 2, 3];
b.forEach(function(v, i, o) {
  console.log(v);
});

>>
1
2
3
hello
null
true
[ [ { '1': 0 } ] ]
2
3
```



**forEach는 인자로 함수를 받습니다.**

이는 javascript의 특이한 구조로써, **가독성을 향상** 시킵니다.



function의 기본 인자로는 value, index, output를 나타내도록, v, i, o를 쓰는 습관이 있는데 이를 legacy라고 합니다.



```javascript
var mapped = b.map(function(v) {
  return v * 2; // b의 원소를 순서대로 값을 변경 시킨 후에 반환
})
console.log(mapped);
>>
    [ 2, 4, 6, NaN, 0, 2, NaN, 4, 6 ]
```





## 2. Javascript Object(객체)

javascript 객체는 key와 value로 이루어진 dictionary 자료구조입니다.

object 형태는 {}이고,

**서버와 클라이언트 간에 데이터를 교환할 때 object 포맷과 비슷한 방법으로 데이터를 주고 받습니다. (JSON 파일)**



**객체 선언**

```javascript
var myFriend = {key: "value", addition: [{name: 'codesquad'}, {age: 2}]};
console.log(myFriend.key);
console.log(myFriend["key"]);
console.log(myFriend.addition[0].name);

>>
value
value
codesquad
```



**객체 탐색**

기본적으로 **for ... in** 구문은 객체를 탐색하기 위한 문법입니다.

```javascript
for (key in myFriend){
  console.log(myFriend[key]);
}

>>
value
[ { name: 'codesquad' }, { age: 2 } ]
```



> 다른방법

```javascript
console.log(Object.keys(myFriend));
>>
[ 'key', 'addition' ]
```

Object.keys() 를 이용합니다.

```javascript
Object.keys(myFriend).forEach(function(v) {
  console.log(myFriend[v]);
});
>>
value
[ { name: 'codesquad' }, { age: 2 } ]
```

for ... in 을 더 많이 쓰는 것 같습니다.





## 실습

https://gist.github.com/crongro/ade2c3f74417fc202c8097214c965f27

```javascript
var res = [];
Object.keys(data).forEach((key1) => {
  Object.keys(data[key1]).forEach((key2) => {
    if (typeof(data[key1][key2]) == "number"){
      res.push(key2);
    }
  });
});
console.log(res);

>>
    [ 'window', 'window', 'image', 'image', 'text', 'text', 'text' ]
```





https://gist.github.com/crongro/a9a118977f82780441db664d6785efe3

```javascript
function search(obj, res){
  if (obj["type"] == "sk"){
    res.push(obj["name"]);
  }
  obj["childnode"].forEach(el => {
    search(el, res);
  });
  return res;
}

var res = [];
data.forEach((el) =>{
  search(el, res);
});
console.log(res);

>>
    [ 'Yong', 'hary', 'solvin', 'hani', 'chulsu' ]
```





---

**Reference**

Boost course - Web application

https://www.edwith.org/boostcourse-web/lecture/16746/