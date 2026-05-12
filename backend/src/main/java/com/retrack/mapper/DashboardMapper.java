package com.retrack.mapper;

import com.retrack.vo.NotificationVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 대시보드 집계 DB 쿼리 인터페이스
 * SQL은 resources/mapper/DashboardMapper.xml 에 정의
 * 역할별 요약 데이터를 위한 집계 전용 쿼리
 *
 * @since 2026-05-12
 */
@Mapper
public interface DashboardMapper {

    /** 전체 과제 상태별 건수 (VIEWER/ADMIN용) */
    List<Map<String, Object>> getProjectStatusStats();

    /** 특정 사용자가 등록한 과제 상태별 건수 (RESEARCHER용) */
    List<Map<String, Object>> getProjectStatusStatsByUserId(@Param("userId") Long userId);

    /** 특정 사용자가 담당하는 과제 상태별 건수 (MANAGER용) */
    List<Map<String, Object>> getProjectStatusStatsByManagerId(@Param("managerId") Long managerId);

    /** 전체 연구비 합계 (ADMIN용) */
    long getTotalBudget();

    /** 특정 사용자가 등록한 과제의 연구비 합계 (RESEARCHER용) */
    long getBudgetByUserId(@Param("userId") Long userId);

    /** 특정 사용자가 담당하는 과제의 연구비 합계 (MANAGER용) */
    long getBudgetByManagerId(@Param("managerId") Long managerId);

    /** 전체 사용자 수 (ADMIN용) */
    long getTotalUserCount();

    /** 특정 사용자의 최근 알림 5건 (모든 역할) */
    List<NotificationVO> getRecentNotifications(@Param("userId") Long userId);
}
