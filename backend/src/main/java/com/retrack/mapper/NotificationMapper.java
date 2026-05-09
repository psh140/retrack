package com.retrack.mapper;

import com.retrack.vo.NotificationVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 알림 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/NotificationMapper.xml 에 정의
 *
 * @since 2026-05-09
 */
@Mapper
public interface NotificationMapper {

    /** 특정 사용자의 알림 목록 조회 (최신순) */
    List<NotificationVO> findByUserId(Long userId);

    /** 알림 단건 조회 */
    NotificationVO findById(Long notificationId);

    /** 알림 저장 (status: PENDING으로 초기 저장) */
    void insert(NotificationVO notification);

    /**
     * 발송 상태 업데이트
     * @param notificationId 대상 알림 ID
     * @param status         변경할 상태 (SENT / FAILED)
     * @param sentAt         발송 처리 일시
     */
    void updateStatus(@Param("notificationId") Long notificationId,
                      @Param("status") String status,
                      @Param("sentAt") LocalDateTime sentAt);
}
