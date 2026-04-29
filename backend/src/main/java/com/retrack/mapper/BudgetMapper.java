package com.retrack.mapper;

import com.retrack.vo.BudgetVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 연구비 관련 DB 쿼리 인터페이스
 * SQL은 resources/mapper/BudgetMapper.xml 에 정의
 *
 * @since 2026-04-29
 */
@Mapper
public interface BudgetMapper {

    /** 특정 과제의 연구비 목록 조회 (사용 일시 역순) */
    List<BudgetVO> findByProjectId(Long projectId);

    /**
     * 연구비 단건 조회 (projectId + budgetId 조합)
     * 과제 소속 여부 검증에 사용
     */
    BudgetVO findById(@Param("projectId") Long projectId, @Param("budgetId") Long budgetId);

    /**
     * 연구비 등록
     * useGeneratedKeys=true 로 INSERT 후 budgetId가 자동 채워짐
     */
    void insert(BudgetVO budget);

    /** 연구비 수정 (category, description, amount, usedAt) */
    void update(BudgetVO budget);

    /** 연구비 삭제 (projectId 함께 확인하여 타 과제 항목 삭제 방지) */
    void delete(@Param("projectId") Long projectId, @Param("budgetId") Long budgetId);

    /**
     * 카테고리별 연구비 집계
     * 반환: [{category, total}, ...]
     */
    List<Map<String, Object>> summary(Long projectId);
}
