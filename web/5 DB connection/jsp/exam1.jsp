<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
id : <%=getId() %>
<%!
	String id = "u001"; // 멤머 변수 선언
	public String getId() { // 메서드 선언
		return id;
	}
%>

<%-- jsp 주석입니다!!
	여러줄로 사용가능합니다.
 --%>
 <!-- html 주석입니다 -->
 <%
 	// 자바 주석입니다.
 	/*
 		여러줄도 가능합니다.
 	*/
 %>
<%
	for (int i=1; i<=5; ++i){
%>
<H<%=i %>>아름다운 한글</H<%=i %>>
<%
	}
%>

<%
	StringBuffer url = request.getRequestURL();

	out.print("url :" + url.toString());
	out.print("<br>");
%>
</body>
</html>