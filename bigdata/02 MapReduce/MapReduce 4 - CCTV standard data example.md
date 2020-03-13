# MapReduce 4 - CCTV standard data example

맵리듀스 예제는 공공데이터 포털의 [전국 CCTV 표준 데이터](https://www.data.go.kr/dataset/15013094/standard.do;jsessionid=dp1jbk0cCHOXzZB4Z0xxWr7h.node10)를 이용하여 진행합니다. csv 파일을 다운로드하고, HDFS에 업로드 합니다.

(CSV 데이터를 다운로드 받으면 euc-kr 인코딩이라서 하둡에서 한글이 깨질수도 있습니다. 다운로드 하시면 메모장 등을 이용하여 UTF-8 인코딩으로 변환하면 됩니다.)

![](https://wikidocs.net/images/page/23717/%EA%B3%B5%EA%B3%B5cctv.PNG)



```
# 복사
$ hadoop fs -put (src) /user/cctv/

# csv 데이터 확인
$ hadoop fs -ls /user/cctv/
Found 1 items
-rw-r--r--   2 hadoop hadoop   30805141 2018-10-19 08:11 /user/cctv/data.csv
```



>1. 관리 기관명 기준으로 건수 확인
>   1. 매퍼
>   2. 리듀서
>   3. Job
>   4. 실행결과
>2. 관리 기관명(키) 기준으로 정렬하여 건수 확인
>   1. 파티셔너
>   2. Job
>   3. 실행결과
>3. 관리기관, 설치목적 기준으로 정렬하여 건수 확인
>   1. 매퍼
>   2. 복합키
>   3. 파티셔너
>   4. SortComparator
>   5. GroupingComparator
>   6. 리듀서
>   7. Job
>   8. 실행결과



---

## 관리 기관명 기준으로 건수 확인



**1) Mapper**

데이터의 첫 번째 칼럼은 '관리 기관명'입니다.

맵리듀스에서 이 데이터를 분리하려면 라인단위로 데이터를 읽어서, 탭(\\t)을 이용하여 데이터를 분리하고 첫 번째 인덱스의 데이터를 선택합니다.

```java
package com.sec.cctv;

import java.io.IOException;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class CctvMapper extends Mapper<Object, Text, Text, IntWritable> {

    private final static IntWritable one = new IntWritable(1);
    private Text word = new Text();

    @Override
    protected void map(Object key, Text value, Mapper<Object, Text, Text, IntWritable>.Context context) throws IOException, InterruptedException {

        // 관리 기관명 추출 
        String[] strs = value.toString().split("\t");
        word.set(strs[0]);

        context.write(word, one);
    }
}
```



**2) Reducer**

매퍼에서 쓴 데이터가 리스트로 전달됩니다. 이 데이터를 모두 합하면 결과를 확인할 수 있습니다.

```java
package com.sec.cctv;

import java.io.IOException;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class CctvReducer extends Reducer<Text, IntWritable, Text, IntWritable> {

    private IntWritable result = new IntWritable();

    @Override
    protected void reduce(Text key, Iterable<IntWritable> values, Reducer<Text, IntWritable, Text, IntWritable>.Context context) throws IOException, InterruptedException {

        int sum = 0;
        for(IntWritable value : values)
            sum += value.get();
        result.set(sum);

        context.write(key, result);
    }
}
```



**3) Job**

잡 함수는 작업에 관련된 정보를 전달합니다. 매퍼, 리듀서, 컴바이너를 설정하고 출력 데이터의 타입을 설정합니다. `FileInputFormat` 에 입력, 출력 경로를 지정합니다.

```java
package com.sec.cctv;

import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class CctvMain {

    public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {

        Configuration conf = new Configuration();

        Job job = Job.getInstance(conf, "cctv");
        job.setJarByClass(CctvMain.class);

        job.setMapperClass(CctvMapper.class);
        job.setCombinerClass(CctvReducer.class);
        job.setReducerClass(CctvReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```



**4) 실행결과**

위 데이터를 컴파일하고 jar 파일로 묶어 줍니다. 실행은 아래와 같이 합니다. 출력 결과는 덮어쓰지 않기 때문에 재작업을 위해 출력 위치를 지워야 합니다.

```
# 실행
$ hadoop jar cctv.jar com.sec.cctv.CctvMain /user/cctv/ /user/cctv_output/

# 결과 확인
$ hadoop fs -ls /user/cctv_output/
Found 8 items
-rw-r--r--   2 hadoop hadoop          0 2018-10-19 08:36 /user/cctv_output/_SUCCESS
-rw-r--r--   2 hadoop hadoop       2869 2018-10-19 08:36 /user/cctv_output/part-r-00000
-rw-r--r--   2 hadoop hadoop       2965 2018-10-19 08:36 /user/cctv_output/part-r-00001
-rw-r--r--   2 hadoop hadoop       2052 2018-10-19 08:36 /user/cctv_output/part-r-00002
-rw-r--r--   2 hadoop hadoop       2418 2018-10-19 08:36 /user/cctv_output/part-r-00003
-rw-r--r--   2 hadoop hadoop       2786 2018-10-19 08:36 /user/cctv_output/part-r-00004
-rw-r--r--   2 hadoop hadoop       2902 2018-10-19 08:36 /user/cctv_output/part-r-00005
-rw-r--r--   2 hadoop hadoop       2986 2018-10-19 08:36 /user/cctv_output/part-r-00006

# 파일의 내용 확인 
$ hadoop fs -cat /user/cctv_output/part-r-00003
CCTV통합관제센터  160
강원랜드    56
경기도 광명시 정보통신과   342
경기도 시흥시청    1112
경기도 안양시 (교통정책과) 1041
경기도 양평군청    997
```



맵리듀스를 실행하면, 아래와 같은 로그를 확인할 수 있습니다. 로그에 데이터 처리에 사용된 리소스 정보를 확인할 수 있습니다. 사용된 매퍼, 리듀서, 컴바이너 수와 사용량 등을 확인할 수 있습니다.

```java
$ hadoop jar cctv.jar com.sec.cctv.CctvMain  /user/cctv/ /user/cctv_output/ 
18/10/19 09:11:39 INFO impl.TimelineClientImpl: Timeline service address: http://host_url:8188/ws/v1/timeline/
18/10/19 09:11:40 INFO client.RMProxy: Connecting to ResourceManager at host_url/host_url:8032
18/10/19 09:11:40 WARN mapreduce.JobResourceUploader: Hadoop command-line option parsing not performed. Implement the Tool interface and execute your application with ToolRunner to remedy this.
18/10/19 09:11:40 INFO input.FileInputFormat: Total input paths to process : 1
18/10/19 09:11:40 INFO lzo.GPLNativeCodeLoader: Loaded native gpl library
18/10/19 09:11:40 INFO lzo.LzoCodec: Successfully loaded & initialized native-lzo library [hadoop-lzo rev 418fa8c602f2a4b153c1a89806305f6b5a27a524]
18/10/19 09:11:40 INFO mapreduce.JobSubmitter: number of splits:1
18/10/19 09:11:40 INFO Configuration.deprecation: mapred.job.queue.name is deprecated. Instead, use mapreduce.job.queuename
18/10/19 09:11:40 INFO mapreduce.JobSubmitter: Submitting tokens for job: job_1520227878653_30488
18/10/19 09:11:40 INFO impl.YarnClientImpl: Submitted application application_1520227878653_30488
18/10/19 09:11:40 INFO mapreduce.Job: The url to track the job: http://host_url:20888/proxy/application_1520227878653_30488/
18/10/19 09:11:40 INFO mapreduce.Job: Running job: job_1520227878653_30488
18/10/19 09:11:45 INFO mapreduce.Job: Job job_1520227878653_30488 running in uber mode : false
18/10/19 09:11:45 INFO mapreduce.Job:  map 0% reduce 0%
18/10/19 09:11:50 INFO mapreduce.Job:  map 100% reduce 0%
18/10/19 09:11:54 INFO mapreduce.Job:  map 100% reduce 29%
18/10/19 09:11:55 INFO mapreduce.Job:  map 100% reduce 43%
18/10/19 09:11:56 INFO mapreduce.Job:  map 100% reduce 86%
18/10/19 09:11:57 INFO mapreduce.Job:  map 100% reduce 100%
18/10/19 09:11:57 INFO mapreduce.Job: Job job_1520227878653_30488 completed successfully
18/10/19 09:11:57 INFO mapreduce.Job: Counters: 49
    File System Counters
        FILE: Number of bytes read=12425
        FILE: Number of bytes written=1043109
        FILE: Number of read operations=0
        FILE: Number of large read operations=0
        FILE: Number of write operations=0
        HDFS: Number of bytes read=30805288
        HDFS: Number of bytes written=18978
        HDFS: Number of read operations=24
        HDFS: Number of large read operations=0
        HDFS: Number of write operations=14
    Job Counters 
        Launched map tasks=1
        Launched reduce tasks=7
        Data-local map tasks=1
        Total time spent by all maps in occupied slots (ms)=115650
        Total time spent by all reduces in occupied slots (ms)=1541250
        Total time spent by all map tasks (ms)=2570
        Total time spent by all reduce tasks (ms)=17125
        Total vcore-milliseconds taken by all map tasks=2570
        Total vcore-milliseconds taken by all reduce tasks=17125
        Total megabyte-milliseconds taken by all map tasks=3700800
        Total megabyte-milliseconds taken by all reduce tasks=49320000
    Map-Reduce Framework
        Map input records=139632
        Map output records=139632
        Map output bytes=4103862
        Map output materialized bytes=12397
        Input split bytes=147
        Combine input records=139632
        Combine output records=635
        Reduce input groups=635
        Reduce shuffle bytes=12397
        Reduce input records=635
        Reduce output records=635
        Spilled Records=1270
        Shuffled Maps =7
        Failed Shuffles=0
        Merged Map outputs=7
        GC time elapsed (ms)=529
        CPU time spent (ms)=9210
        Physical memory (bytes) snapshot=2002321408
        Virtual memory (bytes) snapshot=34572668928
        Total committed heap usage (bytes)=1917845504
    Shuffle Errors
        BAD_ID=0
        CONNECTION=0
        IO_ERROR=0
        WRONG_LENGTH=0
        WRONG_MAP=0
        WRONG_REDUCE=0
    File Input Format Counters 
        Bytes Read=30805141
    File Output Format Counters 
        Bytes Written=18978
```





---

## 관리 기관명(키) 기준으로 정렬하여 건수 확인

매퍼의 결과는 리듀서로 전달될 때 셔플, 정렬 과정을 거치게 됩니다. 이 때 키를 기준으로 정렬되어 리듀서에게 전달됩니다. 이 때 파티셔너가 키를 분류하는 기준이 되고, 기본 파티셔너는 <u>해시 파티셔너</u>입니다.

관리 기관명 기준으로 정렬하려면 해시 파티셔너를 대체하는 파티셔너를 구현해야 합니다. 또한 정렬을 위해 모든 데이터를 같이 봐야 하기 때문에 1개의 리듀서를 사용해야 합니다. 리듀서 개수를 여러개로하면 파일별로 정렬된 데이터가 출력됩니다.



**1) Partitioner**

파티셔너는 `getPartition()` 메소드를 오버라이딩하면 됩니다. 여기서는 키 첫번째 문자가 파티션을 나누는 기준이 되도록 설정합니다.

```java
package com.sec.cctv;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Partitioner;

public class CctvPartitioner extends Partitioner<Text, IntWritable> {

    @Override
    public int getPartition(Text key, IntWritable value, int numPartitions) {
        return (key.toString().charAt(0)) % numPartitions;
    }

}
```



**2) job**

잡에서 리듀서 개수를 1개로 설정하고, 파티셔너를 추가해줍니다.

```java
package com.sec.cctv;

import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class CctvMain {

    public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {

        Configuration conf = new Configuration();

        Job job = Job.getInstance(conf, "cctv");
        job.setJarByClass(CctvMain.class);

        job.setNumReduceTasks(1);

        job.setMapperClass(CctvMapper.class);
        job.setCombinerClass(CctvReducer.class);
        job.setPartitionerClass(CctvPartitioner.class);
        job.setReducerClass(CctvReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```



**3) 실행 결과**

```java
# 실행결과 
$ hadoop fs -ls /user/cctv_output/
Found 2 items
-rw-r--r--   2 hadoop hadoop          0 2018-10-19 09:59 /user/cctv_output/_SUCCESS
-rw-r--r--   2 hadoop hadoop      18978 2018-10-19 09:59 /user/cctv_output/part-r-00000

# 파일 내용
$ hadoop fs -cat /user/cctv_output/part-r-00000
CCTV통합관제센터  160
가오리 1
가평군청    9
강릉시청    1
강북공영주차장 4
강북구 2
강북문화예술회관    1
강북문화정보도서관   1
강북웰빙스포츠센터   
```



---

## 관리기관, 설치목적 기준으로 정렬하여 건수 확인



복합키를 이용하여 데이터를 정렬하는 방법을 확인합니다.





**1) Mapper**



**2) 복합키**



**3) Partitioner**



**4) SortComparator**



**5) GroupingComparator**



**6) reducer**



**7) Job**



**8) 실행 결과**

---

**Reference**

https://wikidocs.net/23717#_8