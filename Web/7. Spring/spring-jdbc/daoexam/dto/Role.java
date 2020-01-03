package kr.or.connect.daoexam.dto;

public class Role {
	private int roleId;
	private String description;
	
	public int getRoleId() {
		return roleId;
	}
	public void setRoleId(int roleId) {
		this.roleId = roleId;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	
	// 결과 값 확인 용이
	@Override
	public String toString() {
		return "Role [roldID=" + roleId + ", description=" + description + "]";
	}
	
}
