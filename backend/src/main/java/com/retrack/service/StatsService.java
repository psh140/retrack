package com.retrack.service;

import com.retrack.mapper.StatsMapper;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 통계 비즈니스 로직
 * StatsMapper에서 받은 raw 집계 결과를 컨트롤러 응답에 적합한 형태로 가공한다.
 * MyBatis resultType="map" 사용 시 PostgreSQL 기본 동작으로 컬럼명이 소문자 snake_case로 반환된다.
 *
 * @since 2026-05-12
 */
@Service
public class StatsService {

    private final StatsMapper statsMapper;

    public StatsService(StatsMapper statsMapper) {
        this.statsMapper = statsMapper;
    }

    /**
     * 과제 상태별 건수 반환
     * MyBatis row 키: "status", "count"
     * 반환 형태: { "PENDING": 3, "IN_PROGRESS": 5, ... }
     */
    public Map<String, Long> getProjectStatusStats() {
        List<Map<String, Object>> rows = statsMapper.countByStatus();

        Map<String, Long> result = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String status = (String) row.get("status");
            long count = ((Number) row.get("count")).longValue();
            result.put(status, count);
        }
        return result;
    }

    /**
     * 연구비 카테고리별 합계 반환
     * MyBatis row 키: "category", "total"
     * 반환 형태: { "PERSONNEL": 1000000, "TRAVEL": 500000, ..., "total": 1500000 }
     * BudgetService.getBudgetSummary()와 동일 패턴 (전체 카테고리 대상)
     */
    public Map<String, Long> getBudgetCategoryStats() {
        List<Map<String, Object>> rows = statsMapper.sumByCategory();

        Map<String, Long> result = new LinkedHashMap<>();
        long total = 0L;
        for (Map<String, Object> row : rows) {
            String category = (String) row.get("category");
            // PostgreSQL SUM → BigDecimal 또는 Long으로 반환될 수 있어 Number로 캐스팅
            long categoryTotal = ((Number) row.get("total")).longValue();
            result.put(category, categoryTotal);
            total += categoryTotal;
        }
        result.put("total", total);
        return result;
    }

    /**
     * 과제별 연구비 소진 현황 반환
     * MyBatis row 키: "project_id", "title", "budget_total", "budget_used"
     * 각 row를 camelCase LinkedHashMap으로 변환하고 burnRate 필드를 추가하여 반환한다.
     * burnRate 계산: budgetTotal > 0 이면 (budgetUsed / budgetTotal) * 100 소수점 1자리 반올림,
     *               budgetTotal = 0 이면 0.0 반환
     */
    public List<Map<String, Object>> getBudgetBurnrate() {
        List<Map<String, Object>> rows = statsMapper.burnrate();

        for (Map<String, Object> row : rows) {
            // snake_case 키를 camelCase LinkedHashMap으로 재구성
            Map<String, Object> converted = new LinkedHashMap<>();
            converted.put("projectId", row.get("project_id"));
            converted.put("title", row.get("title"));

            long budgetTotal = row.get("budget_total") != null
                    ? ((Number) row.get("budget_total")).longValue() : 0L;
            long budgetUsed = row.get("budget_used") != null
                    ? ((Number) row.get("budget_used")).longValue() : 0L;

            converted.put("budgetTotal", budgetTotal);
            converted.put("budgetUsed", budgetUsed);

            double burnRate = budgetTotal > 0
                    ? Math.round((double) budgetUsed / budgetTotal * 100 * 10.0) / 10.0
                    : 0.0;
            converted.put("burnRate", burnRate);

            // 원본 row를 변환된 데이터로 교체
            row.clear();
            row.putAll(converted);
        }
        return rows;
    }

    /**
     * 월별 알림 발송 건수 반환
     * MyBatis row 키: "month" ("YYYY-MM" 형식), "count"
     * 가공 없이 그대로 반환 (정렬은 SQL 레벨에서 처리)
     */
    public List<Map<String, Object>> getNotificationsMonthly() {
        return statsMapper.countByMonth();
    }
}
