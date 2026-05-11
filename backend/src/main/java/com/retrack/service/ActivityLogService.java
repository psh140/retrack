package com.retrack.service;

import com.retrack.exception.NotFoundException;
import com.retrack.mapper.ActivityLogMapper;
import com.retrack.mapper.UserMapper;
import com.retrack.vo.ActivityLogVO;
import com.retrack.vo.UserVO;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 사용자 활동 로그 비즈니스 로직
 * - 전체 로그 목록 조회 (ADMIN 전용)
 * - 특정 사용자 로그 조회 (ADMIN 전용, 사용자 존재 여부 선확인)
 *
 * @since 2026-05-11
 */
@Service
public class ActivityLogService {

    private final ActivityLogMapper activityLogMapper;
    private final UserMapper userMapper;

    public ActivityLogService(ActivityLogMapper activityLogMapper, UserMapper userMapper) {
        this.activityLogMapper = activityLogMapper;
        this.userMapper = userMapper;
    }

    /**
     * 전체 활동 로그 목록 반환 (최신순)
     *
     * @return 전체 로그 목록
     */
    public List<ActivityLogVO> getAll() {
        return activityLogMapper.findAll();
    }

    /**
     * 특정 사용자의 활동 로그 목록 반환 (최신순)
     * 존재하지 않는 사용자 ID 입력 시 NotFoundException 발생
     *
     * @param userId 조회할 사용자 ID
     * @return 해당 사용자의 로그 목록
     */
    public List<ActivityLogVO> getByUserId(Long userId) {
        UserVO user = userMapper.findById(userId);
        if (user == null) {
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }
        return activityLogMapper.findByUserId(userId);
    }
}
