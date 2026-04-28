package com.retrack.mapper;

import com.retrack.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 사용자 관리 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/UserMapper.xml 에 정의
 */
@Mapper
public interface UserMapper {

    /** 전체 사용자 목록 조회 (최신 가입순) */
    List<UserVO> findAll();

    /** 사용자 ID로 단건 조회 */
    UserVO findById(Long userId);

    /**
     * 사용자 권한 변경
     * @param userId 대상 사용자 ID
     * @param role   변경할 권한 (VIEWER / RESEARCHER / MANAGER / ADMIN)
     * @Param 어노테이션 필수 — maven-compiler-plugin에 -parameters 미설정 시 MyBatis가 파라미터명을 인식 못함
     */
    void updateRole(@Param("userId") Long userId, @Param("role") String role);

    /** 연구자 인증 승인 (is_verified = TRUE, verified_at = NOW()) */
    void updateVerify(Long userId);

    /** 사용자 삭제 */
    void deleteUser(Long userId);
}
