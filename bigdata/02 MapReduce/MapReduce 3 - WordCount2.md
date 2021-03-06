# MapReduce 2 - WordCount2



워드카운트2 에서는

* `setup` 함수를 이용하는 방법
* 카운터를 이용하는 방법
* 분산 캐시를 이용하는 방법
* 옵션 파서를 이용하는 방법

을 알아봅니다.



### 소스코드

```java
package sdk;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
import org.apache.hadoop.mapreduce.Counter;
import org.apache.hadoop.util.GenericOptionsParser;
import org.apache.hadoop.util.StringUtils;

public class WordCount2 {

    public static class TokenizerMapper extends Mapper<Object, Text, Text, IntWritable> {

        // 문자의 개수를 세는 카운터 
        static enum CountersEnum {
            INPUT_WORDS
        }

        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();

        private boolean caseSensitive;  // 대소문자 구분 
        private Set<String> patternsToSkip = new HashSet<String>(); // 문자에서 제거할 기호 

        private Configuration conf;

        // 맵작업의 설정 
        @Override
        public void setup(Context context) throws IOException, InterruptedException {
            conf = context.getConfiguration();
            caseSensitive = conf.getBoolean("wordcount.case.sensitive", true);  // 대소문자 구분 
            if (conf.getBoolean("wordcount.skip.patterns", false)) {    // 스킵 패턴 파일을 분산 캐쉬에서 가져와서 patternsToSkip에 설정
                URI[] patternsURIs = Job.getInstance(conf).getCacheFiles();
                for (URI patternsURI : patternsURIs) {
                    Path patternsPath = new Path(patternsURI.getPath());
                    String patternsFileName = patternsPath.getName().toString();
                    parseSkipFile(patternsFileName);
                }
            }
        }

        private void parseSkipFile(String fileName) {
            try (BufferedReader fis = new BufferedReader(new FileReader(fileName))) {
                String pattern = null;
                while ((pattern = fis.readLine()) != null) {
                    patternsToSkip.add(pattern);
                }
            } catch (IOException ioe) {
                System.err.println("Caught exception while parsing the cached file '" + StringUtils.stringifyException(ioe));
            }
        }

        @Override
        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {

            String line = (caseSensitive) ? value.toString() : value.toString().toLowerCase();

            // patternsToSkip과 일치하는 문자를 제거 
            for (String pattern : patternsToSkip) {
                line = line.replaceAll(pattern, "");
            }

            StringTokenizer itr = new StringTokenizer(line);
            while (itr.hasMoreTokens()) {
                word.set(itr.nextToken());
                context.write(word, one);

                // 카운터에 1을 더함  
                Counter counter = context.getCounter("User Custom Counter", CountersEnum.INPUT_WORDS.toString());
                counter.increment(1);
            }
        }
    }

    public static class IntSumReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
        private IntWritable result = new IntWritable();

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
        Configuration conf = new Configuration();

        // 옵션 파서를 이용해서 옵션의 개수가 2 또는 4개가 아니면 오류 메시지 출력후 종료
        // -D로 전달되는 옵션은 conf에 설정 
        GenericOptionsParser optionParser = new GenericOptionsParser(conf, args);
        String[] remainingArgs = optionParser.getRemainingArgs();
        if (!(remainingArgs.length != 2 || remainingArgs.length != 4)) {
            System.err.println("Usage: wordcount <in> <out> [-skip skipPatternFile]");
            System.exit(2);
        }

        // 맵리듀스 잡 설정 
        Job job = Job.getInstance(conf, "word count 2");
        job.setJarByClass(WordCount2.class);
        job.setMapperClass(TokenizerMapper.class);
        job.setCombinerClass(IntSumReducer.class);
        job.setReducerClass(IntSumReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        // 옵션으로 -skip 으로 전달된 파일 경로를 분산 캐쉬에 추가하고,
        // wordcount.skip.patterns를 true로 설정 
        List<String> otherArgs = new ArrayList<String>();
        for (int i = 0; i < remainingArgs.length; ++i) {
            if ("-skip".equals(remainingArgs[i])) {
                job.addCacheFile(new Path(remainingArgs[++i]).toUri());
                job.getConfiguration().setBoolean("wordcount.skip.patterns", true);
            } else {
                otherArgs.add(remainingArgs[i]);    // 파일경로 
            }
        }
        FileInputFormat.addInputPath(job, new Path(otherArgs.get(0)));
        FileOutputFormat.setOutputPath(job, new Path(otherArgs.get(1)));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```



---

### `setup`함수를 이용하는 방법

맵리듀스 프레임워크는 `map`, `reduce` 함수 실행 전, `setup`함수를 호출 합니다. 작업에 필요한 설정값 처리와 전처리를 합니다. 컨텍스트에서 설정값 가져와서 설정에 이용합니다.

```java
@Override
public void setup(Context context) throws IOException, InterruptedException {
    conf = context.getConfiguration();
    caseSensitive = conf.getBoolean("wordcount.case.sensitive", 
    ...
}
```



---

### Counter 이용

카운터는 enum을 이용하여 카운터에 등록하고, 컨텍스트에서 카운터를 가져와서 사용하면 됩니다. 이렇게 사용한 카운터는 로그에서 확인할 수 있습니다.

```java
// 문자의 개수를 세는 카운터 
static enum CountersEnum {
    INPUT_WORDS
}

// 카운터 이용 
Counter counter = context.getCounter("User Custom Counter", CountersEnum.INPUT_WORDS.toString());
counter.increment(1);
```



카운터를 이용하면 맵리듀스 실행 로그에서 카운터 값을 확인할 수 있습니다.

```java
        WRONG_MAP=0
        WRONG_REDUCE=0
    User Custom Counter
        INPUT_WORDS=9
    File Input Format Counters 
        Bytes Read=57
```





---

### 분산 캐시 이용

분산 캐시는 잡에 `addCacheFile` 을 이용하여 등록합니다. 맵 리듀스에서 이용할 때는 `getCacheFiles`를 이용합니다.

```java
// main()
if ("-skip".equals(remainingArgs[i])) {
    job.addCacheFile(new Path(remainingArgs[++i]).toUri());
    job.getConfiguration().setBoolean("wordcount.skip.patterns", true);
} 

// setUp에서 이용하는 방법 
URI[] patternsURIs = Job.getInstance(conf).getCacheFiles();
```



---

### 옵션 파서 이용

사용자가 개별적으로 설정을 추가하지 않아도, 설정값을 효율적으로 추가할 수 있습니다. 실행시점에 사용자가 입력한 설정값의 접두어를 분석하여 `conf`에 설정합니다.

```java
// 옵션 파서
GenericOptionsParser optionParser = new GenericOptionsParser(conf, args);

// 실행시 설정 추가 
$ hadoop jar SdkMapreduce.jar sdk.WordCount2 -Dmapred.job.queue.name=queue_name /user/word/input2 /user/word/output2
```



---

## WordCount2 실행



원본 데이터를 HDFS에 복사합니다.

```console
$ cat file1.txt 
Hello World, Bye World!

$ cat file2.txt 
Hello Hadoop, Goodbye to hadoop.

# 파일 복사
$ hadoop fs -put file*txt /user/word/input2/
```



워드카운트2를 실행하고 결과를 확인합니다.

```console
$ hadoop jar SdkMapreduce.jar sdk.WordCount2 /user/word/input2 /user/word/output2

$ hadoop fs -ls /user/word/output2/
Found 8 items
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 07:44 /user/word/output2/_SUCCESS
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 07:44 /user/word/output2/part-r-00000
-rw-r--r--   2 hadoop hadoop         15 2019-02-21 07:44 /user/word/output2/part-r-00001
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 07:44 /user/word/output2/part-r-00002
-rw-r--r--   2 hadoop hadoop          0 2019-02-21 07:44 /user/word/output2/part-r-00003
-rw-r--r--   2 hadoop hadoop         10 2019-02-21 07:44 /user/word/output2/part-r-00004
-rw-r--r--   2 hadoop hadoop         17 2019-02-21 07:44 /user/word/output2/part-r-00005
-rw-r--r--   2 hadoop hadoop         25 2019-02-21 07:44 /user/word/output2/part-r-00006

# 실행 결과 확인
$ hadoop fs -cat /user/word/output2/part*
Bye 1
Goodbye 1
Hadoop, 1
World,  1
Hello   2
World!  1
hadoop. 1
to  1
```



### 대소문자 구분하지 않고 실행

`wordcount.case.sensitive` 옵션을 통해 가능합니다.

```
$ hadoop jar SdkMapreduce.jar sdk.WordCount2 -Dwordcount.case.sensitive=false /user/word/input2 /user/word/output2

# 실행결과 확인 
$ hadoop fs -cat /user/word/output2/part*
bye 1
world!  1
hadoop, 1
hello   2
world,  1
goodbye 1
hadoop. 1
to  1
```



### 기호는 제거하고 처리하도록 실행

기호 제거를 위해 패턴 파일을 먼저 HDFS에 올려야 합니다.

```console
$ cat replace.txt 
\!
\,
\.

# 패턴 파일 업로드 
$ hadoop fs -put ./replace.txt /user/word/replace.txt

# 패턴 파일 실행 
$ hadoop jar SdkMapreduce.jar sdk.WordCount2 -Dmapred.job.queue.name=queue_name -Dwordcount.case.sensitive=false /user/word/input2 /user/word/output2 -skip /user/word/replace.txt  

# 실행결과 확인 
$ hadoop fs -cat /user/word/output2/part*
world   2
bye 1
hadoop  2
hello   2
goodbye 1
to  1
```





---

## 2 보조 도구

맵리듀스 작업을 처리하는 데 도움을 주는 유틸리티를 알아봅니다.



### 카운터

하둡은 **맵리듀스 잡의 진행 상황을 확인**할 수 있는 **카운터(Counter)**를 제공합니다. 잡은 기본적으로 맵리듀스의 **작업상황, 입축력 상황**을 확인할 수 있는 카운터를 제공합니다. 사용자가 카운터를 생성하여 사용할 수 도 있습니다.

```java
18/10/19 08:23:02 INFO mapreduce.Job: Counters: 13
    Job Counters 
        Failed map tasks=4
        Killed reduce tasks=7
        Launched map tasks=4
        Other local map tasks=3
        Data-local map tasks=1
        Total time spent by all maps in occupied slots (ms)=327375
        Total time spent by all reduces in occupied slots (ms)=0
        Total time spent by all map tasks (ms)=7275
        Total time spent by all reduce tasks (ms)=0
        Total vcore-milliseconds taken by all map tasks=7275
        Total vcore-milliseconds taken by all reduce tasks=0
        Total megabyte-milliseconds taken by all map tasks=10476000
        Total megabyte-milliseconds taken by all reduce tasks=0
```





### 분산 캐시(Distributed Cache)

맵 리듀스 잡에서 공유되는 데이터를 이용할 때 분산 캐시를 사용합니다. 맵리듀스 잡에서 데이터 조인해야 할 경우 사용할 수 있습니다.

```java
// 드라이버에 등록
Job job = new Job();
...
job.addCacheFile(new Path(filename).toUri());

// 맵퍼에서 사용
Path[] localPaths = context.getLocalCacheFiles();
```







---

**Reference**

https://wikidocs.net/30669

https://wikidocs.net/23642