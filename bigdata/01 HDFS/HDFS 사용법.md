# HDFS 사용법



## 7 HDFS 명령어

HDFS 커맨드는 사용자, 운영자, 디버그 커맨드로 구분됩니다. 전체 커맨드 목록은 HDFS [Commands Guide](https://wikidocs.net/26496#fnref:1)를 참고하면 좋습니다.



### 사용자 커맨드

사용자 커맨드는 `hdfs`, `hadoop` 쉘을 이용할 수 있습니다. 일부 커맨드는 `hdfs` 쉘만 이용해야 합니다. 둘 다 이용할 수 있는 경우는 각 쉘의 결과는 동일합니다.

```console
# dfs 커맨드는 둘다 동일한 결과를 출력 
$ hdfs dfs -ls
$ hadoop fs -ls 

# fsck 커맨드도 동일한 결과 출력 
$ hdfs fsck /
$ hadoop fsck /

# fs.defaultFS 설정값 확인 
$ hdfs getconf -confKey fs.defaultFS
hdfs://127.0.0.1:8020

# 명령어를 인식하지 못함 
$ hadoop getconf
Error: Could not find or load main class getconf
```



**사용자 커맨드 목록**

| 커맨드             | 비고                                                   |
| :----------------- | :----------------------------------------------------- |
| classpath          | Hadoop jar 파일에 필요한 클래스 패스 출력              |
| dfs                | 파일 시스템 쉘 명령어                                  |
| fetchdt            | 네임노드의 델리게이션 토큰 확인                        |
| fsck               | 파일 시스템 상태 체크                                  |
| getconf            | 설정된 Config 정보 확인                                |
| groups             | 사용자에 설정된 그룹 정보 확인                         |
| lsSnapshottableDir | 스냅샷이 가능한 디렉토리 목록 확인                     |
| jmxget             | JMX 인포메이션 확인                                    |
| oev                | Offline Edits Viewr, Edits 파일의 상태 확인            |
| oiv                | Offline Image Viewr, 이미지 파일의 상태 확인(2.4 이상) |
| oiv_legacy         | oiv 2.4 미만의 상태 확인                               |
| snapshotDiff       | HDFS 스냅샷의 상태 확인                                |
| version            | 버전 확인                                              |



명령어 중 필수인 `dfs`와 `fsck` 커맨드를 알아봅니다.



### dfs 커맨드

**파일시스템 쉘을 실행하는 명령어** 입니다. dfs는 `hdfs dfs`, `hadoop fs`, `hadoop dfs` 세 가지 형태로 실행이 가능합니다. 전체 명령어는 [파일 시스템 쉘 가이드](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/FileSystemShell.html)를 참고하시면 됩니다.

```console
$ hdfs dfs -ls
Found 17 items
drwxr-xr-x   - hadoop hadoop          0 2018-11-30 06:15 datas

$ hadoop fs -ls
Found 17 items
drwxr-xr-x   - hadoop hadoop          0 2018-11-30 06:15 datas
```



**dfs 커맨드 명령어**

| 명령어         | 비고                                                         |
| :------------- | :----------------------------------------------------------- |
| cat            | 파일의 내용을 확인                                           |
| text           | 텍스트 형식으로 파일을 읽음, 압축 파일도 텍스트 형식으로 확인 |
| appendToFile   | 지정한 파일에 내용을 추가(append)                            |
| checksum       | 파일의 체크섬 확인                                           |
| chgrp          | 파일의 그룹 변경                                             |
| chmod          | 파일의 모드 변경                                             |
| chown          | 파일의 소유권 변경                                           |
| count          | 지정한 경로의 디렉토리 개수, 파일개수, 파일 사이즈 확인      |
| df             | 파일시스템의 용량 확인(복제본을 포함한 용량)                 |
| du             | 지정한 경로의 용량 확인(단일 파일의 용량)                    |
| dus            | 지정한 경로의 하위 폴더를 포함한 용량 확인                   |
| expunge        | 휴지통을 비움. 파일을 영구히 삭제.                           |
| getfacl        | 디렉토리, 파일의 ACL(Access Control List) 확인               |
| setfacl        | 디렉토리, 파일의 ACL(Access Control List) 설정               |
| getfattr       | 디렉토리, 파일의 추가적인 속성 확인                          |
| setfattr       | 디렉토리, 파일의 추가적인 속성 설정                          |
| getmerge       | 주어진 경로의 파일들을 로컬의 파일로 머지                    |
| find           | 주어진 표현에 맞는 파일을 조회                               |
| ls             | 디렉토리의 파일 조회                                         |
| lsr            | 디렉토리 하위의 파일을 포함하여 조회                         |
| mkdir          | 디렉토리 생성                                                |
| copyFromLocal  | 로컬의 파일을 HDFS로 복사                                    |
| copyToLocal    | HDFS의 파일을 로컬로 복사                                    |
| cp             | 주어진 경로로 파일을 복사                                    |
| moveFromLocal  | 로컬의 파일을 HDFS로 이동                                    |
| moveToLocal    | HDFS의 파일을 로컬로 이동                                    |
| mv             | 주어진 경로의 파일을 이동, 파일이름 변경에도 이용            |
| get            | copyToLocal 명령과 비슷                                      |
| put            | copyFromLocal 명령과 비슷                                    |
| createSnapshot | 스냅샷 생성                                                  |
| deleteSnapshot | 스냅샷 삭제                                                  |
| renameSnapshot | 스냅샷 이름 변경                                             |
| rm             | 파일 삭제                                                    |
| rmdir          | 디렉토리 삭제                                                |
| rmr            | 주어진 경로의 하위 경로까지 삭제                             |
| setrep         | 레플리케이션 팩터 설정                                       |
| stat           | 주어진 옵션에 따라 파일의 정보를 확인                        |
| tail           | 파일의 마지막 1kbyte를 출력                                  |
| test           | 주어진 옵션에 따라 파일, 딜게토리의 상태 확인                |
| touchz         | 0byte 파일 생성                                              |
| truncate       | 주어진 패턴에 따라 파일 삭제                                 |
| usage          | 주어진 명령어 사용법 확인                                    |
| help           | 명령어 사용법 확인                                           |



* df는 복제개수를 포함한 전체의 용량을 표현하고, du 단일 파일 또는 경로의 용량입니다. 1M파일의 용량을 du로 확인하면 1M으로 나오지만, df로 파일 시스템의 용량을 확인하면 복제개수가 3일때 3M으로 표현됩니다.



### cat

지정한 파일을 기본 입력으로 읽어서 출력합니다.

```
$ hadoop fs -cat /user/file.txt
```

### text

지정한 파일을 텍스트 형식으로 읽습니다. gzip, snappy 등의 형식으로 압축된 파일을 자동으로 텍스트 형식으로 출력해 줍니다.

```
$ hadoop fs -text /user/file.txt
```



...



### get

HDFS의 파일을 로컬에 복사할 때 사용합니다.

- 주요옵션: `-f`

```
$ hadoop fs -get /user/data1.txt ./
# 동일한 이름의 파일이 존재하면 덮어씀 
$ hadoop fs -get -f /user/data1.txt ./
```



### put

로컬의 파일을 HDFS에 복사할 때 사용합니다.

- 주요옵션: `-f`

```
$ hadoop fs -put ./data1.txt /user/
# 동일한 이름의 파일이 존재하면 덮어씀 
$ hadoop fs -put -f ./data1.txt /user/
```



### touchz

0byte 파일을 생성합니다.

```
$ hadoop fs -touchz /user/test.txt
```



### stat

주어진 포맷에 따른 파일의 정보를 확인합니다.

```
# 주요 포맷
# %y : 마지막 수정 시간 
# %x : 마지막 접근 시간 
# %n : 파일 이름 
# %b : 파일 사이즈 (byte)
$ hadoop fs -stat "%y %n" hdfs://127.0.0.1:8020/*
```



---

### fsck 커맨드

`fsck` (file system check)커맨드는 **HDFS 파일시스템의 상태를 체크하는 명령어** 입니다. `fsck` 커맨드는 파일시스템에 블록 상태 확인, 파일의 복제 개수를 확인하여 결과를 알려줍니다. 

일반적으로 네임노드가 자동으로 상태를 복구하기 위한 작업을 진행하기 때문에 `fsck` 커맨드가 오류를 확인해도 상태를 정정하지는 않습니다.



**fsck 커맨드 명령어**

| 커맨드                         | 비고                                  |
| :----------------------------- | :------------------------------------ |
| path                           | 체크를 위한 경로                      |
| -list-corruptfileblocks        | 커럽트 상태의 블록을 출력             |
| -delete                        | 커럽트 파일 삭제                      |
| -move                          | 커럽트 블록을 /lost+found 폴더로 이동 |
| -files                         | 체크한 파일 출력                      |
| -files -blocks                 | 블록 리포트 출력                      |
| -files -blocks -locations      | 블록의 위치를 출력                    |
| -files -blocks -racks          | 블록의 랙정보 출력                    |
| -files -blocks -replicaDetails | 복제 개수 정보 출력                   |
| -files -blocks -upgradedomains | 블록의 도메인을 갱신                  |
| -includeSnapshots              | 스냅샷을 포함해서 체크                |
| -openforwrite                  | 쓰기 작업을 위해 열린 파일 출력       |
| -storagepolicies               | 블록의 저장 정책 출력                 |
| -maintenance                   | 블록의 관리 정보 출력                 |
| -blockId                       | 블록 ID 출력                          |



### 사용법

`fsck` 커맨드는 **우선 경로를 지정해야** 합니다. 파일 시스템의 상태를 체크할 경로를 지정하고 필요한 명령어를 입력하면 됩니다. `fsck` 커맨드로 파일 시스템의 상태를 확인하고, `-delete` 커맨드로 오류가 난 파일을 삭제할 수 있습니다.

```
$ hdfs fsck <path> [-list-corruptfileblocks 
                     [-move | -delete | -openforwrite] 
                     [-files [-blocks [-locations | -racks]]]] 
                     [-includeSnapshots] [-storagepolicies] [-blockId <blk_Id>]
$ hdfs fsck /
$ hdfs fsck /user/hadoop/
$ hdfs fsck /user -list-corruptfileblocks
$ hdfs fsck /user -delete
$ hdfs fsck /user -files
$ hdfs fsck /user -files -blocks

$ hdfs fsck /
Status: HEALTHY
 Total size:    7683823089 B
 Total dirs:    3534
 Total files:   14454
 Total symlinks:        0
 Total blocks (validated):  14334 (avg. block size 536055 B)
 Minimally replicated blocks:   14334 (100.0 %)
 Over-replicated blocks:    0 (0.0 %)
 Under-replicated blocks:   14334 (100.0 %)
 Mis-replicated blocks:     0 (0.0 %)
 Default replication factor:    2
 Average block replication: 1.0
 Corrupt blocks:        0
 Missing replicas:      31288 (68.58095 %)
 Number of data-nodes:      1
 Number of racks:       1
FSCK ended at Fri Dec 28 04:07:32 UTC 2018 in 172 milliseconds
```



# 운영자 커맨드

운영자 커맨드도 `hdfs`, `hadoop` 쉘을 이용할 수 있습니다. 일부 커맨드는 `hdfs` 쉘을 이용해야 합니다. 둘 다 이용할 수 있는 경우 각 쉘의 결과는 동일하며, 사용법은 다음과 같습니다.

```
# 둘다 balancer를 실행 
$ hdfs balancer
$ hadoop balancer 
```



### 운영자 커맨드 목록

운영자 커맨드는 주로 실행, 설정 관련 명령어가 많습니다. 각 명령어의 주요 옵션은 [Administration Commands](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HDFSCommands.html#Administration_Commands)를 확인하면 됩니다. 



| 커맨드            | 비고                                  |
| :---------------- | :------------------------------------ |
| namenode          | 네임노드 실행                         |
| datanode          | 데이터 노드 실행                      |
| secondarynamenode | 세컨더리 네임노드 실행                |
| balancer          | HDFS 밸렁싱 처리                      |
| cacheadmin        | 자주 읽는 데이터에 대한 캐쉬 처리     |
| crypto            | 암호화 처리                           |
| dfsadmin          | HDFS 관리를 위한 Admin 유틸리티 명령  |
| dfsrouter         | HDFS 연합 라우팅 실행                 |
| dfsrouteradmin    | 데이터 노드 라우팅 설정               |
| haadmin           | HA 실행 명령어(QJM 또는 NFS)          |
| journalnode       | QJM을 이용한 HA, 저널노드용 명령어    |
| mover             | 데이터 마이그레이션용 유틸리티 명령어 |
| nfs3              | NFS3 게이트웨이 명령어                |
| portmap           | NFS3 게이트웨이 포트맵 명령어         |
| storagepolicies   | HDFS 저장정책 설정 명령어             |
| zkfc              | 주키퍼 FailOver 컨트롤러 실행         |





### dfsadmin 커맨드

`dfsadmin` 커맨드는 hdfs의 관리를 위한 정보를 설정 및 변경할 수 있습니다. 쿼타(Quota) 설정, 노드들의 리프레쉬, 노드들의 동작 및 정지등을 처리할 수 있습니다. 주요 명령어는 다음과 같습니다.



**fsck 커맨드 명령어**

| 커맨드    | 비고                         |
| :-------- | :--------------------------- |
| -report   | HDFS 각 노드들의 상태를 출력 |
| -safemode | 세이프 모드에 진입.복구      |



**사용법**

`dfsadmin` 커맨드가 가지고 있는 명령어는 다음과 같이 다양합니다. 주요 명령어의 사용 방법을 알아보겠습니다.



**전체 명령어**

```
$ hdfs dfsadmin 
Usage: hdfs dfsadmin
Note: Administrative commands can only be run as the HDFS superuser.
    [-report [-live] [-dead] [-decommissioning]]
    [-safemode <enter | leave | get | wait>]
    [-saveNamespace]
    [-rollEdits]
    [-restoreFailedStorage true|false|check]
    [-refreshNodes]
    [-setQuota <quota> <dirname>...<dirname>]
    [-clrQuota <dirname>...<dirname>]
    [-setSpaceQuota <quota> [-storageType <storagetype>] <dirname>...<dirname>]
    [-clrSpaceQuota [-storageType <storagetype>] <dirname>...<dirname>]
    [-finalizeUpgrade]
    [-rollingUpgrade [<query|prepare|finalize>]]
    [-refreshServiceAcl]
    [-refreshUserToGroupsMappings]
    [-refreshSuperUserGroupsConfiguration]
    [-refreshCallQueue]
    [-refresh <host:ipc_port> <key> [arg1..argn]
    [-reconfig <datanode|...> <host:ipc_port> <start|status>]
    [-printTopology]
    [-refreshNamenodes datanode_host:ipc_port]
    [-deleteBlockPool datanode_host:ipc_port blockpoolId [force]]
    [-setBalancerBandwidth <bandwidth in bytes per second>]
    [-fetchImage <local directory>]
    [-allowSnapshot <snapshotDir>]
    [-disallowSnapshot <snapshotDir>]
    [-shutdownDatanode <datanode_host:ipc_port> [upgrade]]
    [-getDatanodeInfo <datanode_host:ipc_port>]
    [-metasave filename]
    [-triggerBlockReport [-incremental] <datanode_host:ipc_port>]
    [-help [cmd]]
```





**-report**

HDFS의 각 노드들의 상태를 출력합니다. HDFS의 전체 사용량과 각 노드의 상태를 확인할 수 있습니다.

- Configured Capacity: 각 데이터 노드에서 HDFS에서 사용할 수 있게 할당 된 용량
- Present Capacity: HDFS에서 사용할 수 있는 용량
- Configured Capacity에서 Non DFS Used 용량을 뺀 실제 데이터 저장에 이용할 수 있는 용량
- DFS Remaining: HDFS에서 남은 용량
- DFS Used: HDFS에 저장된 용량
- Non DFS Used: 맵리듀스 임시 파일, 작업 로그 등 데이터 노드에 저장된 블록 데이터가 아닌 파일의 용량
- Xceivers: 현재 작업중인 블록의 개수

```
$ hdfs dfsadmin -report
Configured Capacity: 165810782208 (154.42 GB)
Present Capacity: 152727556096 (142.24 GB)
DFS Remaining: 140297670656 (130.66 GB)
DFS Used: 12429885440 (11.58 GB)
DFS Used%: 8.14%
Under replicated blocks: 18861
Blocks with corrupt replicas: 0
Missing blocks: 0
Missing blocks (with replication factor 1): 0

-------------------------------------------------
Live datanodes (1):

Name: x.x.x.x:50010 (data_node)
Hostname: data_node
Decommission Status : Normal
Configured Capacity: 165810782208 (154.42 GB)
DFS Used: 12429885440 (11.58 GB)
Non DFS Used: 13083226112 (12.18 GB)
DFS Remaining: 140297670656 (130.66 GB)
DFS Used%: 7.50%
DFS Remaining%: 84.61%
Configured Cache Capacity: 0 (0 B)
Cache Used: 0 (0 B)
Cache Remaining: 0 (0 B)
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Xceivers: 2
Last contact: Thu Apr 25 08:29:50 UTC 2019
```



**-safemode**

세이프모드에 진입하고 빠져나올 수 있습니다.

| 옵션  | 비고                                                 |
| :---- | :--------------------------------------------------- |
| get   | 세이프 모드 상태를 확인                              |
| enter | 세이프 모드 진입                                     |
| leave | 세이프 모드 복구                                     |
| wait  | 세이프 모드이면 대기하다가, 세이프모드가 끝나면 회복 |

```
$ hdfs dfsadmin -safemode get
Safe mode is OFF

$ hdfs dfsadmin -safemode enter
Safe mode is ON

$ hdfs dfsadmin -safemode get
Safe mode is ON

$ hdfs dfsadmin -safemode leave
Safe mode is OFF

$ hdfs dfsadmin -safemode wait
Safe mode is OFF
```



---

**Reference**

https://wikidocs.net/26496#fn:2