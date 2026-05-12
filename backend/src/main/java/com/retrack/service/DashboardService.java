package com.retrack.service;

import com.retrack.mapper.DashboardMapper;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 대시보드 서비스
 * 로그인한 사용자의 role에 따라 역할별 요약 데이터를 집계하여 반환한다.
 * ADMIN, MANAGER, RESEARCHER, VIEWER 4가지 역할을 분기 처리.
 *
 * @since 2026-05-12
 */
@Service
public class DashboardService {

    private final DashboardMapper dashboardMapper;

    public DashboardService(DashboardMapper dashboardMapper) {
        this.dashboardMapper = dashboardMapper;
    }

    /**
     * role에 따라 역할별 대시보드 데이터를 반환한다.
     * 알 수 없는 role은 VIEWER와 동일하게 처리한다.
     *
     * @param role   JWT에서 추출한 사용자 역할
     * @param userId JWT에서 추출한 사용자 ID
     * @return 역할별 대시보드 요약 데이터
     */
    public Map<String, Object> getDashboard(String role, Long userId) {
        if ("ADMIN".equals(role)) {
            return getAdminDashboard(userId);
        } else if ("MANAGER".equals(role)) {
            return getManagerDashboard(userId);
        } else if ("RESEARCHER".equals(role)) {
            return getResearcherDashboard(userId);
        } else {
            return getViewerDashboard(userId);
        }
    }

    /**
     * ADMIN 대시보드: 전체 과제 상태별 건수 + 전체 연구비 합계 + 전체 사용자 수 + 최근 알림 5건
     *
     * @param userId 로그인한 ADMIN의 userId (최근 알림 조회에 사용)
     * @return ADMIN 대시보드 요약 데이터
     */
    public Map<String, Object> getAdminDashboard(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("role", "ADMIN");
        data.put("projectsByStatus", toStatusMap(dashboardMapper.getProjectStatusStats()));
        data.put("totalBudget", dashboardMapper.getTotalBudget());
        data.put("totalUsers", dashboardMapper.getTotalUserCount());
        data.put("recentNotifications", dashboardMapper.getRecentNotifications(userId));
        return data;
    }

    /**
     * MANAGER 대시보드: 담당 과제 상태별 건수 + 담당 과제 연구비 합계 + 최근 알림 5건
     *
     * @param userId 로그인한 MANAGER의 userId
     * @return MANAGER 대시보드 요약 데이터
     */
    public Map<String, Object> getManagerDashboard(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("role", "MANAGER");
        data.put("projectsByStatus", toStatusMap(dashboardMapper.getProjectStatusStatsByManagerId(userId)));
        data.put("totalBudget", dashboardMapper.getBudgetByManagerId(userId));
        data.put("recentNotifications", dashboardMapper.getRecentNotifications(userId));
        return data;
    }

    /**
     * RESEARCHER 대시보드: 본인 등록 과제 상태별 건수 + 본인 과제 연구비 합계 + 최근 알림 5건
     *
     * @param userId 로그인한 RESEARCHER의 userId
     * @return RESEARCHER 대시보드 요약 데이터
     */
    public Map<String, Object> getResearcherDashboard(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("role", "RESEARCHER");
        data.put("projectsByStatus", toStatusMap(dashboardMapper.getProjectStatusStatsByUserId(userId)));
        data.put("totalBudget", dashboardMapper.getBudgetByUserId(userId));
        data.put("recentNotifications", dashboardMapper.getRecentNotifications(userId));
        return data;
    }

    /**
     * VIEWER 대시보드: 전체 과제 상태별 건수 + 최근 알림 5건
     * 알 수 없는 role도 이 메서드로 처리한다.
     *
     * @param userId 로그인한 VIEWER의 userId (최근 알림 조회에 사용)
     * @return VIEWER 대시보드 요약 데이터
     */
    public Map<String, Object> getViewerDashboard(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("role", "VIEWER");
        data.put("projectsByStatus", toStatusMap(dashboardMapper.getProjectStatusStats()));
        data.put("recentNotifications", dashboardMapper.getRecentNotifications(userId));
        return data;
    }

    /**
     * DB 집계 결과(List&lt;Map&gt;)를 { status → count } 형태의 LinkedHashMap으로 변환한다.
     * StatsService와 동일한 변환 패턴 적용.
     *
     * @param rows DB에서 반환된 상태별 건수 목록
     * @return 상태명을 키, 건수를 값으로 하는 맵
     */
    private Map<String, Long> toStatusMap(List<Map<String, Object>> rows) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            result.put((String) row.get("status"), ((Number) row.get("count")).longValue());
        }
        return result;
    }
}
