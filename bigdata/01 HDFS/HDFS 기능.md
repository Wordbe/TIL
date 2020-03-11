# HDFS 기능



## 2 HDFS Federation

**네임노드는 파일 정보 메타데이터를 메모리에서 관리합니다. 파일이 많아지면 메모리 사용량이 늘어나**고, 이를 해결하기 위해 하둡 v2 부터는 HDFS Federation을 지원합니다.

**HDFS 페더레이션은 디렉토리 단위로 네임노드를 등록하여 사용하는 것**입니다.

예를 들어 user, hadoop, tmp 세 개의 디렉토리가 존재할 때, 각 디렉토리 단위로 총 3개의 네임노드를 실행하여 파일을 관리하게 하는 것입니다.

HDFS Federation을 사용하면 파일, 디렉토리 정보를 가지는 네임스페이스와 블록의 정보를 가지는 블록 풀을 각 네임노드가 독립적으로 관리합니다. 네임스페이스와 블록풀을 네임스페이스 볼륨이라고 하며, 이는 독립적으로 관리되기 때문에 하나의 네임노드에 문제가 생겨도 다른 네임노드에 영향을 주지 않습니다.



![](https://hadoop.apache.org/docs/r2.7.2/hadoop-project-dist/hadoop-hdfs/images/federation.gif)



---

## 3 HDFS 고가용성

HDFS는 네임노드가 단일 실패 지점입니다. **네임 노드에 문제가 생기면 모든 작업이 중지되고, 파일을 읽거나 쓸 수 없게 됩니다.** 하둡 v2에서 이 문제를 해결하기 위해서 HDFS 고가용성(High Availability)을 제공합니다.



HDFS 고가용성은 **이중화된 두 대의 서버**인 **액티브(active) 네임노드**와 **스탠바이(standby) 네임노드**를 이용하여 지원합니다. 액티브 네임노드와 스탠바이 네임노드는 데이터 노드로부터 블록 리포트와 하트비트를 모두 받아서 동일한 메타데이터를 유지하고, 공유 스토리지를 이용하여 에디트파일을 공유합니다.



### QJM(Quorum Journal Manager)

![](https://hadoopabcd.files.wordpress.com/2015/02/quorum-journal-with-zk.png)

QJM은 HDFS 전용 구현체로, 고가용성 에디트 로그를 지원하기 위해 설계되었고 HDFS의 권장 옵션입니다. QJM은 저널 노드 그룹에서 동작하며, 각 에디트 로그는 전체 저널 노드에 동시에 쓰여집니다. 

일반적으로 저널 로그는 3개입니다. 이 중 하나가 손상되어도 문제가 없습니다. 이러한 방식은 ZooKeeper 작동 방식과 매우 유사합니다. 물론 HDFS 고가용성은 액티브 네임노드를 선출하기 위해 주키퍼를 사용합니다.

스탠바이 네임노드를 활성화시키는 전환 작업은 장애복구 컨트롤러(failover controller)라는 새로운 객체로 관리됩니다. 다양한 방법으로 장애복구 컨트롤 구현할 수 있지만, 기본 설정은 하나의 네임노드만 활성 상태에 있다는 것을 보장하기 위해 주키퍼를 이용합니다.



### NFS(Network File System)

NFS를 이용하는 방법은 Edit 파일을 공유 스토리지를 이용하여 공유하는 방법입니다. 하나의 네임노드만 에디트 로그를 기록하도록 할 수 있습니다.

![](https://hadoopabcd.files.wordpress.com/2015/02/sharededit-with-zk.png)





---

## 4 HDFS 세이프모드

HDFS의 세이프모드(safemode)는 데이터 노드를 수정할 수 없는 상태입니다. 데이터는 읽기 전용 상태가 되고, 추가와 수정, 복제가 불가능 합니다. 관리자가 서버 운영 정비를 위해 세이프모드를 설정할 수도 있고, 네임노드에 문제가 생겨서 정상적 동작을 할 수 없을 때 자동으로 세이프 모드로 전환됩니다.



세이프 모드에서 파일 수정은 아래와 같은 오류를 냅니다.

```console
$ hadoop fs -put ./samaple.txt /user/sample.txt
put: Cannot create file/user/sample2.txt._COPYING_. Name node is in safe mode.
```



```console
# 세이프 모드 상태 확인
$ hdfs dfsadmin -safemode get
Safe mode is OFF

# 세이프 모드 진입
$ hdfs dfsadmin -safemode enter
Safe mode is ON

# 세이프 모드 해제
$ hdfs dfsadmin -safemode leave
Safe mode is OFF
```



### 세이프 모드의 복구

HDFS 운영 중 네임노드 서버에 문제가 생겨서 세이프 모드에 진입하는 경우, 네임노드 자체 문제와 데이터 노드의 문제일 경우가 많습니다.

```console
# HDFS의 무결성 체크
$ fsck

# 각 데이터 노드의 상태를 확인하여 문제를 확인
$ hdfs dfsadmin -report
```

위를 참고하여 문제를 해결한 후 세이프 모드를 해제하면 됩니다.





---

## 5 HDFS 데이터 블록 관리

데이터 노드에 문제가 생기면, 데이터 블록도 문제가 발생할 수 있습니다.



### CORRUPT 블록

HDFS는 하트비트를 통해 데이터 블록에 문제가 생기는 것을 감지하고 자동으로 복구를 진행합니다. 다른 데이터 노드에 복제된 데이터를 가져와서 복구합니다. 하지만, 문제가 생겨 복구하지 못하면 Corrupt 상태가 됩니다. Corrupt 상태의 파일은 삭제하고, 원본 파일을 다시 HDFS에 올려주어야 합니다.



**커럽트 상태 확인**

```console
# root 상태 체크
$ hdfs fsck /

# /user/hadoop/ 디렉토리 상태 체크
$ hdfs fsck /user/hadoop/

Status: HEALTHY
 Total size:    1378743129 B
 Total dirs:    612
 Total files:   2039
 Total symlinks:        0
 Total blocks (validated):  2039 (avg. block size 676185 B)
 Minimally replicated blocks:   2039 (100.0 %)
 Over-replicated blocks:    0 (0.0 %)
 Under-replicated blocks:   2039 (100.0 %)
 Mis-replicated blocks:     0 (0.0 %)
 Default replication factor:    2
 Average block replication: 1.0
 Corrupt blocks:        0
 Missing replicas:      4004 (66.258484 %)
 Number of data-nodes:      1
 Number of racks:       1
FSCK ended at Thu Dec 06 05:31:42 UTC 2018 in 37 milliseconds


The filesystem under path '/user/hadoop' is HEALTHY
```



커럽트 상태의 방지를 위해 중요한 파일은 복제 개수를 늘려주면 좋습니다.

```console
The filesystem under path '/user/hadoop' is CORRUPT

# 커럽트 상태의 파일 삭제 
$ hdfs fsck -delete

# /user/hadoop/ 의 복제 개수를 5로 조정 
$ hadoop fs -setrep 5 /user/hadoop/
# /user/hadoop/ 하위의 모든 파일의 복제 개수를 조정 
$ hadoop fs -setrep 5 -R /user/hadoop/
```



**복제 개수 부족 상태**

```console
# /user/hadoop/ 의 복제 개수를 5로 조정 
$ hadoop fs -setrep 5 /user/hadoop/

# /user/hadoop/ 하위의 모든 파일의 복제 개수를 조정 
$ hadoop fs -setrep 5 -R /user/hadoop/
```





---

## 6 HDFS 휴지통

HDFS는 사요자의 실수로 인한 파일 삭제를 방지하기 위해 휴지통 기능을 제공합니다.

휴지통 기능 설정 시, 사용자의 홈디렉토리 아래 휴지통 디렉토리(/user/유저명/.Trash)로 이동됩니다. 물론 복구 가능 파일입니다.

휴지통 디렉토리는 지정한 간격으로 체크포인트를 형성하고, 유효 기간이 만료되면 체크포인트르 삭제합니다. 삭제 되면 해당 블록을 삭제하고, 사용자에게 반환합니다.



### 휴지통 설정

| 설정값                       | 비고                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| fs.trash.interval            | 체크포인트를 삭제하는 시간 간격, 0이면 휴지통 기능을 끔      |
| fs.trash.checkpoint.interval | 체크포인트를 확인하는 간격(분). fs.trash.interval 과 같거나 작아야 함. 체크포인터가 실행될 때마다 체크포인트를 생성하고, 유효기간이 지난 체크포인트는 삭제. |



**휴지통 설정값**

**core-site.xml**

```xml
<property>
	<name>fs.trash.intervals</name>
    <value>1440</value>
</property>
<property>
	<name>fs.trash.checkpoint.interval</name>
    <value>120</value>
</property>
```



**휴지통 명렁**

```console
# 휴지통 비우기
# haddop fs -expunge

# 휴지통을 이용하지 않고 삭제
$ hadoop fs -rm -skipTrash /user/data/file
```





---

## 8 WebHDFS REST API 사용법

HDFS는 REST API를 이용하여 파일을 조회하고, 생성, 수정, 삭제하는 기능을 제공합니다. 이 기능을 이용하여 원격지에서 HDFS의 내용에 접근하는 것이 가능합니다. [WebHDFS 공식문서](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/WebHDFS.html)



### REST API 설정

**hdfs-site.xml**

```xml
<property>
    <name>dfs.webhdfs.enabled</name>
    <value>true</value>
</property>
<property>
    <name>dfs.namenode.http-address/name>
    <value>0.0.0.0:50070</value>
</property>
```



### 파일 리스트 확인

위에 설정한 http 포트로 요청을 하면 json 형식으로 결과를 반환합니다. `curl` 명령을 이용하여 요청을 처리하는 방법은 다음과 같습니다.

```
# /user/hadoop/ 위치를 조회 
$ curl -s http://127.0.0.1:50070/webhdfs/v1/user/hadoop/?op=LISTSTATUS 
```







---

**Reference**

https://wikidocs.net/23624

https://wikidocs.net/23628

https://wikidocs.net/25321

https://wikidocs.net/25326

https://wikidocs.net/33948

https://wikidocs.net/65812