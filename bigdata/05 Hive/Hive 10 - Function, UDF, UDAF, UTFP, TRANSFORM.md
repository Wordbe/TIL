# Hive 10 - Function, UDF, UDAF, UTFP, TRANSFORM

<br>

## 1. UDF 구현

**구현 방법 2가지**

* UDF(org.apache.hadoop.hive.ql.exec.UDF) 상속

  → evaluate() 함수 구현

  → 실제 데이터 처리 부분 구현

  

* GenericUDF(org.apache.hadoop.hive.ql.udf.generic.GenericUDF) 상속

  → initialize(), evaluate(), getDisplayString() 함수 구현

  → 복합 타입의 데이터 처리

  → 데이터의 입력의 검증 부분과, 실제 처리 부분을 구현



### 1) UDF

evalutate() 함수를 오버로딩하여 구현합니다. 

```java
import java.util.Map;
import org.apache.hadoop.hive.ql.exec.UDF;
import org.apache.hadoop.io.Text;

public class SampleUDF extends UDF {
    
    public Text evaluate(Text text) {
        // 입력받은 문자를 대문자로 변환
        return new Text(text.toString().toUpperCase());
    }
    
    public int evaluate(int number) {
        // 입력받은 숫자에 1을 더하여 반환
        return number + 1;
    }
    
    public String evaluate(Map<String, String> map, String key) {
        // 입력받은 키의 값이 있으면 반환하고, 없으면 None을 반환
        return map.contaisKey(key) ? map.get(key) : "None";
    }
}
```

<br>

### 사용

```shell
-- UDF가 포함된 jar 추가
ADD JAR hdfs://user/hiveUDF.jar;
CREATE FUNCTION func AS 'com.sec.hive.udf.GeneralUDF';

-- int형은 +1
hive> select func(1);
OK
2
Time taken: 0.816 seconds, Fetched: 1 row(s)

-- 문자형은 대문자 반환 
hive> select func('small');
OK
SMALL
Time taken: 0.032 seconds, Fetched: 1 row(s)

-- 일치하는 값이 없으면 오류 
hive> select func(array(1, 2, 3));
FAILED: SemanticException [Error 10014]: Line 1:7 Wrong arguments '3': No matching method for class com.sec.hive.udf.GeneralUDF with (array<int>). Possible choices: _FUNC_(int)  _FUNC_(map<string,string>, string)  _FUNC_(string)  
```

<br>

<br>

---

### 2) GenericUDF 구현

다음 UDF는 문자열이 들어 있는 리스트를 입력받아서 문자 길이의 총합을 세는 UDF입니다. 

initialize(), evaluate(), getDisplayString() 함수를 구현하였습니다.

```java
import java.util.List;
import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.hive.ql.exec.UDFArgumentException;
import org.apache.hadoop.hive.ql.exec.UDFArgumentLengthException;
import org.apache.hadoop.hive.ql.metadata.HiveException;
import org.apache.hadoop.hive.ql.udf.generic.GenericUDF;
import org.apache.hadoop.hive.serde2.lazy.LazyString;
import org.apache.hadoop.hive.serde2.objectinspector.ListObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.ObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.PrimitiveObjectInspectorFactory;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.StringObjectInspector;
import org.apache.hadoop.io.IntWritable;

@Description(name = "sumListStringLength", value = "_FUNC_(value) - Returns value that sum list string length.", extended = "Example:\n  > SELECT _FUNC_(Array<String>) FROM table LIMIT 1;")
public class ListGenericUDF extends GenericUDF {

    ListObjectInspector listOi;

    @Override
    public ObjectInspector initialize(ObjectInspector[] arguments) throws UDFArgumentException {

        // initialize 함수에서는 
        // 입력받은 파라미터에 대한 검증
        // 반환하는 파라미터에 대한 검증
        // 함수에 입력받는 파라미터 개수 확인
        if (arguments.length != 1)
            throw new UDFArgumentLengthException("function argument need 1.");

        // 파라미터의 타입 확인
        ObjectInspector inspector = arguments[0];
        if (!(inspector instanceof ListObjectInspector))
            throw new UDFArgumentException("function argument need List");

        listOi = (ListObjectInspector) inspector;

        // 입력받는 리스트내 엘리먼트의 객체 타입 확인
        if (!(listOi.getListElementObjectInspector() instanceof StringObjectInspector))
            throw new UDFArgumentException("array argument need ");

        // 반환은 문자열의 수이므로 int 객체 반환
        return PrimitiveObjectInspectorFactory.writableIntObjectInspector;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Object evaluate(DeferredObject[] arguments) throws HiveException {
        // arguments의 객체를 형변환
        List<LazyString> list = (List<LazyString>) listOi.getList(arguments[0].get());

        if (list == null)
            return null;

        int sum = 0;

        for (LazyString str : list) {
            sum += str.getWritableObject().getLength();
        }

        return new IntWritable(sum);
    }

    @Override
    public String getDisplayString(String[] children) {

        StringBuffer buffer = new StringBuffer();
        buffer.append("sumListStringLength(Array<String>), ");

        for (String child : children)
            buffer.append(child).append(",");

        return buffer.toString();
    }
}
```

<br>

### 사용

```shell
ADD JAR hdfs:///user/hiveUDF.jar;
CREATE FUNCTION listFunc AS 'com.sec.hive.udf.ListGenericUDF';

hive> select * from listTable;
OK
["1","2","3"]
["4","5","6"]
["7","8","9"]
["abcdefg","alskdjfalskd","alksdfjalskdfj"]
["aslkdfjalskdf","asldkjfalskd","asldkfja"]
["asldkfjalskd","asdlkfjalskdjflaksd","asldkjfalsdkjflkasd","alsdkjfalkdjf"]

-- col_list 를 입력받아서 문자열의 길이를 더하여 반환 
hive> select listFunc(col_list)
    >   from listTable;
OK
3
3
3
33
33
63
Time taken: 0.307 seconds, Fetched: 6 row(s)
```

<br>

<br>

---

## 2. UDAF 구현

**UDAF는 `AbstractGenericUDAFResolver`를 상속하여 구현합니다.** Resolver를 상속하여 파라미터 타입 체크를 처리하고 데이터 처리를 구현한 Evaluator 클래스를 반환합니다.

- **Resolver 클래스:**
  - 파라미터 타입체크
  - 오퍼레이터 구현
  - 실제 처리 프로세스 구현체(GenericUDAFEvaluator)를 반환
- **Evaluator 클래스:**
  - init(), merge(), terminatePartial() 등의 실제 처리 구현
  - getNewAggregationBuffer() - 집계에 사용할 AggregationBuffer 반환
  - reset - aggregation 이 재사용될 때의 처리
  - init - 입력 받는 아규먼트와 반환값의 타입을 지정
  - iterate - 매퍼가 동작하는 동안 반복하는 작업
  - terminatePartial - 부분적으로 집계작업을 종류할 때 작업
  - merge - 집계작업의 결과를 머지할 때
  - terminate - 작업이 종료될 때

실제 데이터의 처리는 아래과 같습니다. init() 함수로 초기화 후 iterate() 함수로 데이터를 처리합니다. 매퍼의 마지막에 terminatePartial() 함수로 중간 결과를 반환하고, 리듀서에서 다시 merge()를 통해 각 매퍼의 결과를 머지합니다. 그리고 terminate()를 통해 결과를 반환합니다.

![](https://www.wisdomjobs.com/tutorials/data-flow-with-partial-results-for-a-udaf.png)

<br>

### 구현

```java
import org.apache.hadoop.hive.ql.exec.UDFArgumentTypeException;
import org.apache.hadoop.hive.ql.metadata.HiveException;
import org.apache.hadoop.hive.ql.parse.SemanticException;
import org.apache.hadoop.hive.ql.udf.generic.AbstractGenericUDAFResolver;
import org.apache.hadoop.hive.ql.udf.generic.GenericUDAFEvaluator;
import org.apache.hadoop.hive.serde2.objectinspector.ObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.PrimitiveObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.PrimitiveObjectInspector.PrimitiveCategory;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.PrimitiveObjectInspectorFactory;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.PrimitiveObjectInspectorUtils;
import org.apache.hadoop.hive.serde2.typeinfo.PrimitiveTypeInfo;
import org.apache.hadoop.hive.serde2.typeinfo.TypeInfo;

/**
 * String, int 를 입력받아서 합계를 반환
 * 
 * @author User
 *
 */
public class SumInt extends AbstractGenericUDAFResolver {

    @Override
    public GenericUDAFEvaluator getEvaluator(TypeInfo[] info) throws SemanticException {

        // 파라미터는 하나만 받음 
        if (info.length != 1) {
            throw new UDFArgumentTypeException(info.length - 1, "Exactly one argument is expected.");
        }

        // 파라미터의 카테고리가 프리미티브 타입이 아니면 예외 처리 
        if (info[0].getCategory() != ObjectInspector.Category.PRIMITIVE) {
            throw new UDFArgumentTypeException(0, "Only primitive type arguments are accepted but " + info[0].getTypeName() + " was passed as parameter 1.");
        }

        // 전달된 파라미터의 타입이 스트링이면 SumStringEvaluator, 아니면 SumIntEvaluator 처리 
        PrimitiveCategory category = ((PrimitiveTypeInfo)info[0]).getPrimitiveCategory();

        if (category == PrimitiveCategory.STRING || category == PrimitiveCategory.INT) {
            return new SumEvalutor();
        } else {
            throw new UDFArgumentTypeException(0, "Only string, int type arguments are accepted but " + info[0].getTypeName() + " was passed as parameter 1.");
        }
    }

    @SuppressWarnings("deprecation")
    public static class SumEvalutor extends GenericUDAFEvaluator {

        protected PrimitiveObjectInspector inputOI;

        @Override
        public ObjectInspector init(Mode m, ObjectInspector[] parameters) throws HiveException {
            super.init(m, parameters);

            inputOI = (PrimitiveObjectInspector) parameters[0];
            return PrimitiveObjectInspectorFactory.javaIntObjectInspector;
        }

        static class SumAggregationBuffer implements AggregationBuffer {
            int sum;
        }

        @Override
        public AggregationBuffer getNewAggregationBuffer() throws HiveException {
            SumAggregationBuffer sum = new SumAggregationBuffer();
            sum.sum = 0;
            return sum;
        }

        @Override
        public void reset(AggregationBuffer agg) throws HiveException {
            ((SumAggregationBuffer) agg).sum = 0;
        }

        @Override
        public void iterate(AggregationBuffer agg, Object[] parameters) throws HiveException {
            ((SumAggregationBuffer) agg).sum += getInt(parameters[0]);
        }

        @Override
        public Object terminatePartial(AggregationBuffer agg) throws HiveException {
            return ((SumAggregationBuffer) agg).sum;
        }

        @Override
        public void merge(AggregationBuffer agg, Object partial) throws HiveException {
            ((SumAggregationBuffer) agg).sum += getInt(partial);
        }

        @Override
        public Object terminate(AggregationBuffer agg) throws HiveException {
            return ((SumAggregationBuffer) agg).sum;
        }

        public int getInt(Object strObject) {
            return PrimitiveObjectInspectorUtils.getInt(strObject, inputOI);
        }
    }
}
```

### 사용방법

```shell
-- UDF가 포함된 jar 추가 
ADD JAR hdfs:///user/hiveUDF.jar;
CREATE FUNCTION sumInt AS 'com.sec.hive.udf.SumInt';

-- 데이터 확인 
hive> select * from intTable;
OK
1
2
3
4
5
6
7
8
9
10

-- 처리 결과 확인 
select sumInt(col)
  from intTable;
Query ID = hadoop_20181113081733_822f2f53-139c-419b-bb67-fb9e572994a4
Total jobs = 1
Launching Job 1 out of 1
OK
55
Time taken: 14.06 seconds, Fetched: 1 row(s)
```

<br>

<br>

---

## 3. UDTF 구현



**UDTF는 `GenericUDTF`를 상속하여 구현합니다.**

- initialize() : 입력 파라미터의 검증과 칼럼이름을 반환
- process() : 실제 데이터 처리를 반환, forward() 함수에 데이터를 넘김
- close() : 자원의 반환을 처리

<br>

### 구현

다음은 딜리미터(delimiter, 구분문자)를 입력받아 문자열을 분할하고 테이블 데이터를 반환하는 UDTF 예제 입니다.

```java
import java.util.ArrayList;

import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.hive.ql.exec.UDFArgumentException;
import org.apache.hadoop.hive.ql.metadata.HiveException;
import org.apache.hadoop.hive.ql.udf.generic.GenericUDTF;
import org.apache.hadoop.hive.serde2.objectinspector.ObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.ObjectInspectorFactory;
import org.apache.hadoop.hive.serde2.objectinspector.PrimitiveObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.StructObjectInspector;
import org.apache.hadoop.io.Text;

@Description(name = "string_parse", value = "_FUNC_(delimiter, string) - ")
public class StringParseUDTF extends GenericUDTF {

    private transient final Object[] forwardListObj = new Object[1];
    protected PrimitiveObjectInspector inputOI1;
    protected PrimitiveObjectInspector inputOI2;

    @Override
    public StructObjectInspector initialize(ObjectInspector[] argOIs) throws UDFArgumentException {

        inputOI1 = (PrimitiveObjectInspector) argOIs[1];
        inputOI2 = (PrimitiveObjectInspector) argOIs[1];

        ArrayList<String> fieldNames = new ArrayList<String>();
        ArrayList<ObjectInspector> fieldOIs = new ArrayList<ObjectInspector>();

        fieldNames.add("col");
        fieldOIs.add(inputOI1);
        fieldOIs.add(inputOI2);

        return ObjectInspectorFactory.getStandardStructObjectInspector(fieldNames, fieldOIs);
    }

    @Override
    public void process(Object[] o) throws HiveException {
        String delim = (String) inputOI1.getPrimitiveJavaObject(o[0]);
        String datas = (String) inputOI2.getPrimitiveJavaObject(o[1]);

        for(String str: datas.split(delim)) {
            forwardListObj[0] = new Text(str);
            forward(forwardListObj);
        }
    }

    @Override
    public void close() throws HiveException { }
}
```

<br>

### 사용방법

```shell
-- UDF가 포함된 JAR 추가 및 함수 생성 
ADD JAR hdfs:///user/hiveUDF.jar;
CREATE TEMPORARY FUNCTION parseStr AS 'com.sec.hive.udf.StringParseUDTF';


hive> SELECT parseStr(",", "1,2,3");
OK
1
2
3

hive> SELECT parseStr("-", "a-b-c");
OK
a
b
c
```

<br>

<br>

---

## 4. TRANSFORM



TRANSFORM 함수는 입력데이터가 정형 데이터가 아닐떄 **파이썬 스크립트를 이용하여 입력데이터를 정형구조로 변경**할 때 사용합니다.

사용자가 구현한 파이썬 스크립트와 TRANSFORM 함수를 이용하여 비정형 데이터를 처리하는 예제를 알아보겠습니다. 예를 들어 아래의 형식으로 <입력>되는 로그를 <출력>처럼 처리하고 싶을 때 사용할 수 있습니다.

```
<입력>
DATA1
Column1-1
Column1-2
DATA2
Column2-1
Column2-2

<출력>
DATA1   Column1-1   Column1-2
DATA2   Column2-1   Column2-2
```

<br>

### 구현

입력을 출력의 구조적인 형태로 변경하는 파이썬 스크립트를 아래 처럼 구현할 수 있습니다.



```python
#!/usr/bin/python
# -*- coding: utf-8 -*-
import re, json, sys, time

def readFile():
    with sys.stdin as lines:
        str_list = []

        for line in lines:
            # DATA 시작하면 출력
            if line.startswith("DATA") and len(str_list) != 0:
                print "\t".join(str_list)
                del str_list[:]
                str_list.append(line.strip())
            else:
                str_list.append(line.strip())

        # 마지막 데이터 출력 
        print "\t".join(str_list)

if __name__ == "__main__":
    readFile()
```

<br>

### 사용방법

```shell
-- 테이블 생성 
CREATE EXTERNAL TABLE sample_temp
(
    rawLine                STRING
)
LOCATION "/user/data/txt/";

-- trsnsform(입력 칼럼명) using 파일위치 as (출력 칼럼)
-- 이런 형태로 입력하면 아래와 같은 결과를 확인할 수 있다. 
SELECT TRANSFORM(rawLine) USING "hdfs:///user/custom_mapred.py" AS (type, dt1, dt2)
  FROM sample_temp;
Total MapReduce CPU Time Spent: 1 seconds 710 msec
OK
DATA1   Column1-1   Column1-2
DATA2   Column2-1   Column2-2
```







---

**Reference**

https://wikidocs.net/23564

https://wikidocs.net/23566

https://wikidocs.net/23567

https://wikidocs.net/23568