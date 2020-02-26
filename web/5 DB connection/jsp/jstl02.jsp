<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- <%
	request.setAttribute("n", 10);
%> --%>

<c:set var="n" scope="request" value="10"></c:set>
<c:set var="score" scope="request" value="83"></c:set>
<% 
	List<String> list = new ArrayList<>();
	list.add("hello");
	list.add("world");
	list.add("!!!");
	
	request.setAttribute("list", list);
%>
<c:import url="http://localhost:8080/firstweb/jsp/jspValue.jsp" var="urlValue" scope="request" />
<c:import url="https://www.google.com/" var="googleValue" scope="request" />

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
<c:if test="${n == 0 }">
	n과 0은 같습니다.
</c:if>
<c:if test="${n == 10 }">
	n과 10은 같습니다.
</c:if>

<c:choose>
	<c:when test="${score >= 90 }">
		A학점 입니다.
	</c:when>
	<c:when test="${score >= 80 }">
		B학점 입니다.
	</c:when>
	<c:otherwise>
		F학점 입니다.
	</c:otherwise>
</c:choose>
<br>

<c:forEach items="${list }" var="item" begin="1">
	${item }<br>
</c:forEach>

URL에서 읽어들인 값: ${urlValue }
Google에서 읽어들인 값:<br> ${googleValue }

</body>
</html>