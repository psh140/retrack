package com.retrack.mapper;

import com.retrack.vo.ActivityLogVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 사용자 활동 로그 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/ActivityLogMapper.xml 에 정의
 *
 * @since 2026-05-11
 */
@Mapper
public interface ActivityLogMapper {

    /**
     * 활동 로그 INSERT
     * useGeneratedKeys로 logId 자동 채워짐
     *
     * @param log 저장할 로그 객체
     */
    void insert(ActivityLogVO log);

    /**
     * 전체 활동 로그 목록 조회 (최신순)
     *
     * @return 로그 목록
     */
    List<ActivityLogVO> findAll();

    /**
     * 특정 사용자의 활동 로그 목록 조회 (최신순)
     *
     * @param userId 조회할 사용자 ID
     * @return 해당 사용자 로그 목록
     */
    List<ActivityLogVO> findByUserId(Long userId);
}
