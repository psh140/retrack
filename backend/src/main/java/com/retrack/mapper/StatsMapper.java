package com.retrack.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 통계 조회 DB 쿼리 인터페이스
 * SQL은 resources/mapper/StatsMapper.xml 에 정의
 * 모든 메서드는 집계 전용이므로 파라미터 없이 전체 데이터를 대상으로 한다.
 *
 * @since 2026-05-12
 */
@Mapper
public interface StatsMapper {

    /**
     * 과제 상태별 건수 집계
     * 반환 row 키: "status" (VARCHAR), "count" (BIGINT)
     */
    List<Map<String, Object>> countByStatus();

    /**
     * 연구비 카테고리별 합계 집계
     * 반환 row 키: "category" (VARCHAR), "total" (NUMERIC)
     */
    List<Map<String, Object>> sumByCategory();

    /**
     * 과제별 연구비 소진 현황 집계
     * 반환 row 키: "project_id" (BIGINT), "title" (VARCHAR),
     *             "budget_total" (NUMERIC), "budget_used" (NUMERIC)
     * budget_total: 과제 등록 시 입력한 총 연구비
     * budget_used:  BUDGET 테이블에 기록된 실지출 합계
     */
    List<Map<String, Object>> burnrate();

    /**
     * 월별 알림(이메일) 발송 건수 집계
     * 반환 row 키: "month" (VARCHAR, "YYYY-MM" 형식), "count" (BIGINT)
     * notifications 테이블의 sent_at 기준으로 집계
     */
    List<Map<String, Object>> countByMonth();
}
