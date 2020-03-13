## MapReduce 2 - WordCount



## WordCount 예제

맵 리듀스의 처리 단계를 워드카운트 예제로 확인합니다. (하둡 맵리듀스 튜토리얼 워드 카운트 예제)

![](https://i.stack.imgur.com/199Q1.png)



워드 카운트는 파일의 문자수를 세는 프로그램입니다.



워드 카운트 전체소스를 보면 세 부분으로 나눌 수 있습니다.

* 매퍼를 구현한 TokenizerMapper
* 리듀서를 구현한 IntSumReducer
* 잡을 설정하는 main()



```java
import java.io.IOException;
import java.util.StringTokenizer;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class WordCount {

    // 맵
    public static class TokenizerMapper extends Mapper<Object, Text, Text, IntWritable> {

        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {

            // 입력된 한라인(value)을 공백을 기준으로 분할하여 
            // context 객체를 이용하여 임시파일로 저장

            StringTokenizer itr = new StringTokenizer(value.toString());
            while (itr.hasMoreTokens()) {
                word.set(itr.nextToken());
                context.write(word, one);
            }
        }
    }

    // 리듀스 
    public static class IntSumReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
        private IntWritable result = new IntWritable();

        // 키(문자)별로 전달된 문자의 개수를 모두 더하여 출력  
        public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            result.set(sum);
            context.write(key, result);
        }
    }

    public static void main(String[] args) throws Exception {
        // Job 객체를 이용하여 하둡 작업을 실행 
        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "word count");
        job.setJarByClass(WordCount.class);
        job.setMapperClass(TokenizerMapper.class);
        job.setCombinerClass(IntSumReducer.class);
        job.setReducerClass(IntSumReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);
        FileInputFormat.addInputPath(job, new Path(args[0]));  // 입력 파일위치
        FileOutputFormat.setOutputPath(job, new Path(args[1]));  // 출력 파일위치 
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```





### 실행

하둡 맵리듀스 실행은 jar 파일을 이용합니다. 워드카운트 예제를 빌드하여 jar 파일을 생성하고 실행합니다.



입력으로 사용할 파일을 생성하고, HDFS에서 복사합니다.

```console
$ cat word.txt
Deer Bear River
Car Car River
Deer Car Bear

# 작업 파일 복사
$ hadoop fs -put ./word.txt /user/word/input/
```



실행은 `hadoop jar`명령을 이용합니다.

```console
$ hadoop jar Mapreduce.jar sdk.WordCount /user/word/input /user/word/output
```

작업 대상 jar 파일과 클래스 명을 명시하고, 작업 파라미터인 입력 위치와 출력위치를 전달합니다.



### 작업결과

결과는 part 파일로 생성됩니다. 

```java
# 실행결과 확인 
$ hadoop fs -ls /user/word/output/
Found 8 items
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 05:39 /user/word/output/_SUCCESS
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 05:39 /user/word/output/part-r-00000
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 05:39 /user/word/output/part-r-00001
-rw-r--r--   2 hadoop hadoop          7 2019-02-21 05:39 /user/word/output/part-r-00002
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 05:39 /user/word/output/part-r-00003
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 05:39 /user/word/output/part-r-00004
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 05:39 /user/word/output/part-r-00005
-rw-r--r--   2 hadoop hadoop         21 2019-02-21 05:39 /user/word/output/part-r-00006

# 파일 내용 확인 
$ hadoop fs -cat /user/word/output/part*
Deer    2
Bear    2
Car 3
River   2
```



---

## 워드 카운트 처리 단계

### 입력

워드카운트의 입력은 파일 데이터입니다. 파일 위치를 파라미터로 전달하면 FileInputFormat을 이용해서 데잍터를 읽습니다. FileFormat은 지정한 위치의 파일을 라인단위로 읽어 맵에 전달합니다.

```;java
FileInputFormat.addInputPath(job, new Path(args[0]));
```



### 맵

맵은 전달받은 <key, value>에서 value 데이터를 공백 단위로 분할하여 문자 수를 세어줍니다. 맵에서 데이터를 정리하지 않습니다. 같은 문자가 있어도 합계를 내지 않고 하나씩 처리합니다.

```java
[입력, <버퍼번호, 라인>]
1, Deer Bear River
16, Car Car River
30, Deer Car Bear

[출력, <문자, 1>]
Dear 1
Bear 1
River 1
Car 1
Car 1
River 1
Dear 1
Car 1
Bear 1
```



map 함수의 **key**로 들어오는 값이 **버퍼 번호**이고, **value로 들어오는 값이 라인**이 됩니다. 

```java
public void map(Object key, Text value, Context context) throws IOException, InterruptedException {

    // 입력된 한라인(value)을 공백을 기준으로 분할하여 
    // context 객체를 이용하여 임시파일로 저장
    StringTokenizer itr = new StringTokenizer(value.toString());
    while (itr.hasMoreTokens()) {
        word.set(itr.nextToken());
        context.write(word, one);
    }
}
```



### 컴바이너

컴바이너는 잡에 설정합니다. 컴바이너는 설정해도 되고, 안해도 동작에 영향을 주지 않습니다.

컴바이너를 설정하면, 로컬에서 리듀서 작업을 합니다. 리듀서로 전달하는 결과가 줄어들 기 때문에 네트워크 자원의 사용량을 줄일 수 있습니다.



```java
[입력, <문자, 1>]
Dear 1
Bear 1
River 1
Car 1
Car 1
River 1
Dear 1
Car 1
Bear 1

[출력, <문자, List(1)>]
Dear List(1, 1)
Bear List(1, 1)
Car List(1, 1, 1)
River List(1, 1)
```



### 리듀서(Redcue)

리듀서는 키별로 전달된 등장횟수를 모두 더하여 등장회수를 생성합니다.

```java
[입력, <문자, List(1)>]
Dear List(1, 1)
Bear List(1, 1)
Car List(1, 1, 1)
River List(1, 1)

[출력, <문자, 횟수>]
Deer    2
Bear    2
Car 3
River   2
```

문자가 key로 들어오고, 등장횟수가 Iterable  형태로 전달됩니다. 이 갑을을 모두 곱하여 결과를 출력합니다.

```java
public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            result.set(sum);
            context.write(key, result);
        }
```



### 출력

지정한 위체 파일로 출력합니다. 출력 파일의 개수는 리듀서의 개수와 일치합니다.

```console
$ FileOutputFormat.setOutputPath(job, new Path(args[1]));
```







---

**Reference**

https://wikidocs.net/30235