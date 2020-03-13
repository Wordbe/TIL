# MapReduce 1 - 처리 단계



## 1 처리 단계

맵리듀스 처리 단계는 8단계로 구분합니다.



1. **입력**
   * 텍스트, csv, gzip 등 형태의 데이터를 읽어 맵으로 전달
2. **Map**
   * 입력을 분할하여 **키별**로 데이터 처리
3. **Combiner (= 로컬 리듀서)**
   * 네트워크를 타고 넘어가는 데이터를 줄이기 위해 맵의 결과를 정리
   * 작업 설정에 따라 컴바이너가 없을 수도 있음
4. **Partitioner**
   * 맵 출력 결과의 키 값을 해쉬 처리하여 넘길 리듀서를 결정
5. **Shuffle**
   * 각 리듀서로 데이터 이동
6. **Sort**
   * 리듀서로 전달된 데이터를 키 값 기준으로 정렬
7. **Reduce**
   * 리듀서로 데이터를 처리하고 결과를 저장
8. **출력**
   * 리듀서 결과를 정의된 형태로 저장

![](http://www.openwith.net/wp-content/uploads/2013/04/HadoopTutorialF0405.bmp)



---

### 입력



### InputFormat

**입력 파일이 분할되는 방식(InputSplit)이나 읽어들일 방식(RecordReader)을 정의하는 클래스**입니다. InputFormat 추상클래스를 상속하여 구현합니다.

하둡은 파일을 읽기 위한 FileInputFormat이나, 여러개의 파일을 한번에 읽을 수 있는 CombineFileInputFormat 등을 제공합니다.

```java
package org.apache.hadoop.mapreduce;

@InterfaceAudience.Public
@InterfaceStability.Stable
public abstract class InputFormat<K, V> {

  /** 
   * Logically split the set of input files for the job.  
   */
  public abstract 
    List<InputSplit> getSplits(JobContext context
                               ) throws IOException, InterruptedException;

  /**
   * Create a record reader for a given split. The framework will call
   */
  public abstract 
    RecordReader<K,V> createRecordReader(InputSplit split,
                                         TaskAttemptContext context
                                        ) throws IOException, 
                                                 InterruptedException;

}
```



### InputSplit

맵의 입력으로 들어오는 데이터를 분할 하는 방식을 제공합니다. 데이터의 위치와 읽어 들이는 길이를 정의합니다.



```java
package org.apache.hadoop.mapreduce;

@InterfaceAudience.Public
@InterfaceStability.Stable
public abstract class InputSplit {
  /**
   * Get the size of the split, so that the input splits can be sorted by size.
   */
  public abstract long getLength() throws IOException, InterruptedException;

  /**
   * Get the list of nodes by name where the data for the split would be local.
   * The locations do not need to be serialized.
   */
  public abstract 
    String[] getLocations() throws IOException, InterruptedException;

  /**
   * Gets info about which nodes the input split is stored on and how it is
   * stored at each location.
   */
  @Evolving
  public SplitLocationInfo[] getLocationInfo() throws IOException {
    return null;
  }
}
```



### RecoderReader

실제 파일에 접근하여 데이터를 읽어들입니다. 데이터를 읽어서 <키, 밸류> 형태로 반환합니다.

```java
package org.apache.hadoop.mapreduce;

import java.io.Closeable;
import java.io.IOException;

import org.apache.hadoop.classification.InterfaceAudience;
import org.apache.hadoop.classification.InterfaceStability;

/**
 * The record reader breaks the data into key/value pairs for input to the
 */
@InterfaceAudience.Public
@InterfaceStability.Stable
public abstract class RecordReader<KEYIN, VALUEIN> implements Closeable {

  /**
   * Called once at initialization.
   */
  public abstract void initialize(InputSplit split,
                                  TaskAttemptContext context
                                  ) throws IOException, InterruptedException;

  /**
   * Read the next key, value pair.
   */
  public abstract 
  boolean nextKeyValue() throws IOException, InterruptedException;

  /**
   * Get the current key
   */
  public abstract
  KEYIN getCurrentKey() throws IOException, InterruptedException;

  /**
   * Get the current value.
   */
  public abstract 
  VALUEIN getCurrentValue() throws IOException, InterruptedException;

  /**
   * The current progress of the record reader through its data.
   */
  public abstract float getProgress() throws IOException, InterruptedException;

  /**
   * Close the record reader.
   */
  public abstract void close() throws IOException;
```



### Mapper

사용자가 정의한 작업을 수행합니다. 사용자는 Mapper 클래스를 상속하고, map() 메소드를 구현하면 됩니다.

run() 메소드 구현시 실제 매퍼 작업이 동작하는 방식을 알 수 있습니다. 

setup() : 매퍼 초기화

RecordReader : 데이터 읽고 map(키, 밸류) 함수 호출

데이터를 모두 처리할 때 까지 반복

cleanup() : 리소스의 반환

```java
package org.apache.hadoop.mapreduce;

@InterfaceAudience.Public
@InterfaceStability.Stable
public class Mapper<KEYIN, VALUEIN, KEYOUT, VALUEOUT> {

    /**
     * The <code>Context</code> passed on to the {@link Mapper} implementations.
     */
    public abstract class Context implements MapContext<KEYIN, VALUEIN, KEYOUT, VALUEOUT> {
    }

    /**
     * Called once at the beginning of the task.
     */
    protected void setup(Context context) throws IOException, InterruptedException {
        // NOTHING
    }

    /**
     * Called once for each key/value pair in the input split. Most applications
     * should override this, but the default is the identity function.
     */
    @SuppressWarnings("unchecked")
    protected void map(KEYIN key, VALUEIN value, Context context) throws IOException, InterruptedException {
        context.write((KEYOUT) key, (VALUEOUT) value);
    }

    /**
     * Called once at the end of the task.
     */
    protected void cleanup(Context context) throws IOException, InterruptedException {
        // NOTHING
    }

    /**
     * Expert users can override this method for more complete control over the
     * execution of the Mapper.
     */
    public void run(Context context) throws IOException, InterruptedException {
        setup(context);
        try {
            while (context.nextKeyValue()) {
                map(context.getCurrentKey(), context.getCurrentValue(), context);
            }
        } finally {
            cleanup(context);
        }
    }
}
```



### Combiner

맵리듀스 프레임워크의 자원은 유한하므로, 맵 작업 결과를 리듀스 작업의 입력으로 전달하기 전에 먼저 정리를 하면, 데이터 전송에 필요한 자원을 줄일 수 있습니다. 컴바이너로 이를 가능하게 합니다.

최대, 최소, 카운트 함수 등은 있지만, 평균 함수는 mapper 작업 결과를 평균 내기 때문에, 리듀스 작업에 사용하면 최종 결과가 달라질 수 있습니다.

컴바이너를 사용하면, mapper 와 reducer 사이의 셔플 단계에서 전송되는 데이터양을 줄일 수 있어서 작업 속도를 향상 시킬 수 있습니다.



### Partitioner & Shuffle

맵 작업이 종료되면 작업이 끝난 노드부터 리듀서로 데이터를 전달합니다. 이를 셔플이라고 합니다.

리듀서로 데이터를 전달하기 위해서 맵의 결과 키를 리듀서로 분배하는 기준을 만드는 것을 파티션이라고 합니다. 기본적으로 사용되는 해쉬파티션을 보면, 키의 값을 이용해서 리듀서 개수만큼 파티션을 생성합니다.

```java
package org.apache.hadoop.mapreduce.lib.partition;

@InterfaceAudience.Public
@InterfaceStability.Stable
public class HashPartitioner<K, V> extends Partitioner<K, V> {

    /** Use {@link Object#hashCode()} to partition. */
    public int getPartition(K key, V value, int numReduceTasks) {
        return (key.hashCode() & Integer.MAX_VALUE) % numReduceTasks;
    }

}
```



기본 파티셔너에서 Integer.MAX_VALUE 값을 이용하여 논리합(&) 연산을 하는 이유는 파티션 번호가 양수여야 하기 때문입니다. 자바의 int형의 첫번째 byte는 0이상 양수이기 때문에 해쉬코드 연산을 통해 음수가 나오면 논리합 연산을 통해 양수로 변경합니다.



### Sort

리듀스 작업 전 전달받은 key를 이용하여 정렬을 수행합니다. 리듀스 작업을 수행하기 위해 데이터를 List<Value> 형태로 만들기 위한 그룹핑 작업도 함께 수행합니다.

리듀서의 키와 다른 값을 함께 이용하는 경우 파티셔닝, 소트, 그룹핑 작업을 거치면서 복합키를 기준으로 정렬하게 됩니다.

![](https://i.stack.imgur.com/l6IEl.png)



데이터를 정렬할 때 파티션의 기준이 되는 주키(Primary key) 외 다른 값을 기준으로 정렬할 수 있습니다. 이를Secondary Sort 라고 합니다.



### Reduce

리듀서는 키별로 정렬된 데이틀 이용해서 리듀서 작업을 진행합니다. 리듀서는 사용자가 정의한 작업을 수행합니다. 사용자는 Reducer 클래스를 상속하고, reduce() 메소드를 구현합니다.

run() 메소드를 보면, 실제 매퍼 작업이 동작하는 방식을 알 수 있습니다.

setp() : 리듀서 초기화, 데이터 읽어서 run(키, list(밸류)) 함수를 호출, 데이터를 모두 처리할 때까지 반복

cleanup() : 리소스 반환

```java
package org.apache.hadoop.mapreduce;

@Checkpointable
@InterfaceAudience.Public
@InterfaceStability.Stable
public class Reducer<KEYIN,VALUEIN,KEYOUT,VALUEOUT> {

  /**
   * The <code>Context</code> passed on to the {@link Reducer} implementations.
   */
  public abstract class Context 
    implements ReduceContext<KEYIN,VALUEIN,KEYOUT,VALUEOUT> {
  }

  /**
   * Called once at the start of the task.
   */
  protected void setup(Context context
                       ) throws IOException, InterruptedException {
    // NOTHING
  }

  /**
   * This method is called once for each key. Most applications will define
   * their reduce class by overriding this method. The default implementation
   * is an identity function.
   */
  @SuppressWarnings("unchecked")
  protected void reduce(KEYIN key, Iterable<VALUEIN> values, Context context
                        ) throws IOException, InterruptedException {
    for(VALUEIN value: values) {
      context.write((KEYOUT) key, (VALUEOUT) value);
    }
  }

  /**
   * Called once at the end of the task.
   */
  protected void cleanup(Context context
                         ) throws IOException, InterruptedException {
    // NOTHING
  }

  /**
   * Advanced application writers can use the 
   * {@link #run(org.apache.hadoop.mapreduce.Reducer.Context)} method to
   * control how the reduce task works.
   */
  public void run(Context context) throws IOException, InterruptedException {
    setup(context);
    try {
      while (context.nextKey()) {
        reduce(context.getCurrentKey(), context.getValues(), context);
        // If a back up store is used, reset it
        Iterator<VALUEIN> iter = context.getValues().iterator();
        if(iter instanceof ReduceContext.ValueIterator) {
          ((ReduceContext.ValueIterator<VALUEIN>)iter).resetBackupStore();        
        }
      }
    } finally {
      cleanup(context);
    }
  }
}
```





### 출력

### OutputFormat

출력 파일에 기록되는 형식을 설정합니다. (txt, csv 등)

```java
import java.io.IOException;

@InterfaceAudience.Public
@InterfaceStability.Stable
public abstract class OutputFormat<K, V> {

  public abstract RecordWriter<K, V> 
    getRecordWriter(TaskAttemptContext context
                    ) throws IOException, InterruptedException;

  public abstract void checkOutputSpecs(JobContext context
                                        ) throws IOException, 
                                                 InterruptedException;

  public abstract 
  OutputCommitter getOutputCommitter(TaskAttemptContext context
                                     ) throws IOException, InterruptedException;
}
```



### RecordWriter

실제 파일을 기록합니다.





---

**Reference**

https://wikidocs.net/22937