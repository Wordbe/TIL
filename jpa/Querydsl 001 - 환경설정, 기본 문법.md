# Querydsl 001 - 환경설정, 기본 문법

Query DSL (Domain Specific Language)



<br />

---

# 1. 환경설정

Querydsl 사용을 위해 설정이 필요하다.



Gradle > Tasks > other > compileQuerydsl

```groovy
plugins {
    id 'org.springframework.boot' version '2.5.1'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    // querydsl plugin 추가
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
    id 'java'
}

group = 'co.wordbe'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    // querydsl library 추가
    implementation 'com.querydsl:querydsl-jpa'
    implementation 'org.projectlombok:lombok:1.18.18'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
    useJUnitPlatform()
}

// querydsl 버전에 맞게 추가
def querydslDir = "$buildDir/generated/querydsl"
querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}
sourceSets {
    main.java.srcDir querydslDir
}
configurations {
    querydsl.extendsFrom compileClasspath }
compileQuerydsl {
    options.annotationProcessorPath = configurations.querydsl
}
```



엔티티를 다 만들었다면, 아래 명령어로 Q엔티티를 생성한다.

```shell
$ ./gradlew clean compileQuerydsl
```

<br />

---

# 2. Querydsl 문법

<br />

## 기본 Q-Type 활용

Q클래스 인스턴스 사용하는 2가지 방법

```java
QMember qMemeber = new QMember("m"); // 1. 별칭 직접 지정 (기본은 member1 로 쓰여있다.)
QMember qMemeber = QMember.member; // 2. 기본 인스턴스 사용
```

2번의 경우 스태틱 임포트를 통해 예쁘게 사용할 수도 있다.

```java
import static co.wordbe.querydsl.entity.QMember.*;

Member member1 = queryFactory
                .select(member)
                .from(member)
                .where(member.username.eq("member1"))
                .fetchOne();
```

```properties
jpa:
    properties:
      hibernate:
        format_sql: true # 실행한 SQL 로그
        use_sql_comments: true # 실행한 JPQL 로그
```

JPQL 로그를 보면 기본으로 alias 는 member1 인 것을 볼 수 있지만,

1번 방법 처럼 별칭을 정해주면 m 으로 바뀐 것을 확인할 수 있다.

<br />

---

## 검색 조건 쿼리



- 검색조건 : `.and()`, `or()`











