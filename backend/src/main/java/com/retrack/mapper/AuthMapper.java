package com.retrack.mapper;

import com.retrack.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 인증 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/AuthMapper.xml 에 정의
 */
@Mapper
public interface AuthMapper {

    /** 신규 사용자 등록 */
    void insertUser(UserVO user);

    /** 이메일로 사용자 조회 (로그인 시 사용) */
    UserVO findByEmail(String email);

    /** 이메일 중복 여부 확인 (회원가입 시 사용) */
    boolean existsByEmail(String email);
}
