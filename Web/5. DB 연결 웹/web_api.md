# WEB API



**디자인 가이드**

URI는 정보의 자원을 표현해야 합니다.

자원에 대한 행위는 HTTP method로 표현합니다.



| HTTP METHOD | 역할                                                      |
| ----------- | --------------------------------------------------------- |
| POST        | URI 요청시 리소스를 생성                                  |
| GET         | 리소스를 조회하고 해당 document에 대한 자세한 정보 가져옴 |
| PUT         | 리소스 수정                                               |
| DELETE      | 리소스 삭제                                               |



### **URI는 정보의 자원을 표현**

POST /members

​	생성

GET /members

​	멤버의 모든 정보 요청

PUT /members/1

​	수정

DELETE /members/1

​	삭제



**슬래시 구분자(/)는 계층을 나타낼 때 사용**

* URI 마지막 문자로 슬래시 구분자 포함하지 않음

* 하이픈(-)은 URI 가독성 높일 때 사용
* 언더바(_)는 사용하지 않음
* URI경로는 소문자만 사용. RFC 3986(URI 문법형식)은 URI 스키마와 호스트를 제외하고 대소문자로 구별
* 파일 확장자는 URI에 포함시키지 않음. Accept Header를 사용



**상태코드 (성공)**

200 : 클라이언트 요청을 정상적으로 수행함

201 : 클라이언트가 리소스 생성을 요청, 해당 리소스가 성공적으로 생성(POST 명령시)



**상태코드 (클라이언트로 인한 오류)**

400 : 클라이언트의 요청이 부적절 할 경우

401 : 인증되지 않은 클라이언트가 보호된 리소스 요청 시

402 : 유저 인증상태 관계없이, 응답하고 싶지 않은 리소스를 클라이언트가 요청 시

​	(400, 404 사용 권고, 403은 리소스 존재 여부 정보를 제공함)

405 : 클라이언트 사용 불가능한 method를 이용한 경우



**상태코드 (서버로 인한 오류)**

301 : 클라이언트 요청한 리소스에 대한 URI가 변경 되었을 때

​	(응답시 Location header에 변경된 URI 적어야 함)

500 : 서버에 문제가 있을 시





## WEB API 실습

webapiexam 메이븐 프로젝트 생성



webapiexam/pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>kr.or.connect</groupId>
  <artifactId>webapiexam</artifactId>
  <packaging>war</packaging>
  <version>0.0.1-SNAPSHOT</version>
  <name>webapiexam Maven Webapp</name>
  <url>http://maven.apache.org</url>
  <properties>
  	<failOnMissingWebXml>false</failOnMissingWebXml>
  </properties>
  
  <dependencies>
  
    <dependency>
  		<groupId>mysql</groupId>
  		<artifactId>mysql-connector-java</artifactId>
  		<version>5.1.45</version>
  	</dependency>
  	
  	<dependency>
  		<groupId>com.fasterxml.jackson.core</groupId>
  		<artifactId>jackson-databind</artifactId>
  		<version>2.9.4</version>
  	</dependency>
    
    <dependency>
    	<groupId>javax.servlet</groupId>
    	<artifactId>javax.servlet-api</artifactId>
    	<version>3.1.0</version>
    	<scope>provided</scope>
    </dependency>
    
    <dependency>
    	<groupId>javax.servlet</groupId>
    	<artifactId>jstl</artifactId>
    	<version>1.2</version>
    </dependency>
  	
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>3.8.1</version>
      <scope>test</scope>
    </dependency>
    
  </dependencies>
  <build>
    <finalName>webapiexam</finalName>
	<plugins>
		<plugin>
			<groupId>org.apache.maven.plugins</groupId>
			<artifactId>maven-compiler-plugin</artifactId>
			<version>3.6.1</version>
			<configuration>
				<source>1.8</source>
				<target>1.8</target>
			</configuration>
		</plugin>
	</plugins>
	</build>    
</project>
```





**RolesServlet.java**

```java
package kr.or.connect.webapiexam.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import kr.or.connect.jdbcexam.dao.RoleDao;
import kr.or.connect.jdbcexam.dto.Role;

/**
 * Servlet implementation class RolesServlet
 */
@WebServlet("/roles")
public class RolesServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
    public RolesServlet() {
        super();
    }
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setCharacterEncoding("utf-8");
		response.setContentType("application/json");
		
		RoleDao dao = new RoleDao();
		List<Role> list = dao.getRoles();
		
		ObjectMapper objectMapper = new ObjectMapper();
		String json = objectMapper.writeValueAsString(list);
		
		PrintWriter out = response.getWriter();
		out.println(json);
		out.close();
	}

}

```





**RoleByIdSerlvet.java**

```java
package kr.or.connect.webapiexam.api;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import kr.or.connect.jdbcexam.dao.RoleDao;
import kr.or.connect.jdbcexam.dto.Role;


@WebServlet("/roles/*")
public class RoleByIdServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

    public RoleByIdServlet() {
        super();
    }
    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setCharacterEncoding("uft-8");
		response.setContentType("application/json");
		
		String pathInfo = request.getPathInfo();
		String[] pathParts = pathInfo.split("/");
		String idStr = pathParts[1];
		int id = Integer.parseInt(idStr);
		
		RoleDao dao = new RoleDao();
		Role role = dao.getRole(id);
		
		ObjectMapper objectMapper = new ObjectMapper();
		String json = objectMapper.writeValueAsString(role);
		
		PrintWriter out = response.getWriter();
		out.println(json);
		out.close();
	}

}
```

