package com.retrack.service;

import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.mapper.UserMapper;
import com.retrack.vo.UserVO;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * 사용자 관리 비즈니스 로직
 * - 목록/상세 조회
 * - 권한 변경: 유효한 role 값인지 검증 후 업데이트
 * - 연구자 인증 승인: 중복 승인 방지
 * - 사용자 삭제
 *
 * 존재하지 않는 사용자 접근 시 NotFoundException → GlobalExceptionHandler가 404 응답
 */
@Service
public class UserService {

    /** 허용되는 권한 값 목록 (계층 순서: VIEWER < RESEARCHER < MANAGER < ADMIN) */
    private static final List<String> VALID_ROLES = Arrays.asList("VIEWER", "RESEARCHER", "MANAGER", "ADMIN");

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /** 전체 사용자 목록 반환 */
    public List<UserVO> getUserList() {
        return userMapper.findAll();
    }

    /**
     * 사용자 단건 조회
     * 존재하지 않으면 NotFoundException 발생
     */
    public UserVO getUser(Long userId) {
        UserVO user = userMapper.findById(userId);
        if (user == null) {
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }
        return user;
    }

    /**
     * 권한 변경
     * 유효하지 않은 role 문자열 입력 시 BadRequestException 발생
     */
    public void updateRole(Long userId, String role) {
        if (!VALID_ROLES.contains(role)) {
            throw new BadRequestException("유효하지 않은 권한입니다. (VIEWER / RESEARCHER / MANAGER / ADMIN)");
        }
        getUser(userId); // 존재 여부 확인 — 없으면 NotFoundException
        userMapper.updateRole(userId, role);
    }

    /**
     * 연구자 인증 승인
     * 이미 인증된 사용자에게 중복 호출 시 BadRequestException 발생
     */
    public void verifyUser(Long userId) {
        UserVO user = getUser(userId);
        if (user.isVerified()) {
            throw new BadRequestException("이미 인증된 사용자입니다.");
        }
        userMapper.updateVerify(userId);
    }

    /** 사용자 삭제 (존재하지 않으면 NotFoundException) */
    public void deleteUser(Long userId) {
        getUser(userId); // 존재 여부 확인 — 없으면 NotFoundException
        userMapper.deleteUser(userId);
    }
}
