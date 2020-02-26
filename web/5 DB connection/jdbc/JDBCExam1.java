package kr.or.connect.jdbcexam;

import java.util.List;

import kr.or.connect.jdbcexam.dao.RoleDao;
import kr.or.connect.jdbcexam.dto.Role;

public class JDBCExam1 {
	public static void main(String[] args) {
		
		// example 1
//		RoleDao dao = new RoleDao();
//		Role role = dao.getRole(100);
//		System.out.println(role);
		
		// example 2
//		int roleId = 500;
//		String description = "CTO";
//		Role role = new Role(roleId, description);
//		RoleDao dao = new RoleDao();
//		int insertCount = dao.addRole(role);
//		System.out.println(insertCount);
		
		// example 3
		RoleDao dao = new RoleDao();
		List<Role> list = dao.getRoles();
		for (Role role : list) {
			System.out.println(role);
		}
	}
}
