package kr.or.connect.daoexam.dao;

public class RoleDaoSqls {
	// 상수는 대문자, 언더바 조합의 name convention을 지킬 것
	public static final String SELECT_ALL = "SELECT role_id, description FROM role ORDER BY role_id";
	public static final String UPDATE = "UPDATE role set description = :description WEHRE role_id = :roleId";
	public static final String SELECT_BY_ROLE_ID = "SELECT role_id, description FROM role WHERE role_id = :roleId";
	public static final String DELETE_BY_ROLE_ID = "DELETE FROM role WHERE role_id = :roleId";
}
