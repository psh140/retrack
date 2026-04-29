package com.retrack.service;

import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.BudgetMapper;
import com.retrack.mapper.ProjectMapper;
import com.retrack.vo.BudgetRequestVO;
import com.retrack.vo.BudgetVO;
import com.retrack.vo.ProjectVO;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 연구비 관리 비즈니스 로직
 * 카테고리: PERSONNEL(인건비), TRAVEL(여비), RESEARCH_ACTIVITY(연구활동비), ETC(기타)
 *
 * @since 2026-04-29
 */
@Service
public class BudgetService {

    private static final List<String> VALID_CATEGORIES = Arrays.asList(
            "PERSONNEL", "TRAVEL", "RESEARCH_ACTIVITY", "ETC"
    );

    private final BudgetMapper budgetMapper;
    private final ProjectMapper projectMapper;

    public BudgetService(BudgetMapper budgetMapper, ProjectMapper projectMapper) {
        this.budgetMapper = budgetMapper;
        this.projectMapper = projectMapper;
    }

    /**
     * 특정 과제의 연구비 목록 반환
     * 과제가 존재하지 않으면 NotFoundException 발생
     */
    public List<BudgetVO> getBudgetList(Long projectId) {
        checkProjectExists(projectId);
        return budgetMapper.findByProjectId(projectId);
    }

    /**
     * 연구비 등록
     * 과제 존재 여부, 카테고리 유효성, 금액 양수 여부, 사용 일시 필수 검증
     *
     * @param projectId 대상 과제 ID
     * @param req       요청 바디
     * @param userId    로그인 사용자 ID (used_by 에 저장)
     * @return 생성된 budgetId
     */
    public Long createBudget(Long projectId, BudgetRequestVO req, Long userId) {
        checkProjectExists(projectId);
        validateRequest(req);

        BudgetVO budget = new BudgetVO();
        budget.setProjectId(projectId);
        budget.setCategory(req.getCategory());
        budget.setDescription(req.getDescription());
        budget.setAmount(req.getAmount());
        budget.setUsedBy(userId);
        budget.setUsedAt(req.getUsedAt());

        budgetMapper.insert(budget);
        return budget.getBudgetId();
    }

    /**
     * 연구비 수정
     * ADMIN은 모든 과제 연구비 수정 가능, 그 외에는 본인이 신청한 과제의 연구비만 수정 가능
     *
     * @param projectId       과제 ID
     * @param budgetId        수정할 연구비 ID
     * @param req             요청 바디
     * @param requesterUserId 요청자 ID
     * @param requesterRole   요청자 권한
     */
    public void updateBudget(Long projectId, Long budgetId, BudgetRequestVO req,
                             Long requesterUserId, String requesterRole) {
        ProjectVO project = projectMapper.findById(projectId);
        if (project == null) {
            throw new NotFoundException("존재하지 않는 과제입니다.");
        }
        // ADMIN이 아니면 본인이 신청한 과제의 연구비만 수정 가능
        if (!"ADMIN".equals(requesterRole) && !project.getUserId().equals(requesterUserId)) {
            throw new UnauthorizedException("본인이 등록한 과제의 연구비만 수정할 수 있습니다.");
        }
        checkBudgetExists(projectId, budgetId);
        validateRequest(req);

        BudgetVO budget = new BudgetVO();
        budget.setBudgetId(budgetId);
        budget.setProjectId(projectId);
        budget.setCategory(req.getCategory());
        budget.setDescription(req.getDescription());
        budget.setAmount(req.getAmount());
        budget.setUsedAt(req.getUsedAt());

        budgetMapper.update(budget);
    }

    /**
     * 연구비 삭제
     * 해당 과제에 속한 항목인지 확인 후 삭제
     *
     * @param projectId 과제 ID
     * @param budgetId  삭제할 연구비 ID
     */
    public void deleteBudget(Long projectId, Long budgetId) {
        checkBudgetExists(projectId, budgetId);
        budgetMapper.delete(projectId, budgetId);
    }

    /**
     * 카테고리별 연구비 집계 반환
     * 응답 형태: { "PERSONNEL": 1000000, "TRAVEL": 500000, ..., "total": 1500000 }
     *
     * @param projectId 과제 ID
     */
    public Map<String, Long> getBudgetSummary(Long projectId) {
        checkProjectExists(projectId);
        List<Map<String, Object>> rows = budgetMapper.summary(projectId);

        Map<String, Long> result = new HashMap<>();
        long total = 0L;
        for (Map<String, Object> row : rows) {
            String category = (String) row.get("category");
            // PostgreSQL SUM → BigDecimal 또는 Long 으로 반환될 수 있어 Number로 캐스팅
            long categoryTotal = ((Number) row.get("total")).longValue();
            result.put(category, categoryTotal);
            total += categoryTotal;
        }
        result.put("total", total);
        return result;
    }

    /** 과제 존재 여부 확인 — 없으면 NotFoundException */
    private void checkProjectExists(Long projectId) {
        ProjectVO project = projectMapper.findById(projectId);
        if (project == null) {
            throw new NotFoundException("존재하지 않는 과제입니다.");
        }
    }

    /** 연구비 항목 존재 여부 확인 — 없으면 NotFoundException */
    private void checkBudgetExists(Long projectId, Long budgetId) {
        BudgetVO budget = budgetMapper.findById(projectId, budgetId);
        if (budget == null) {
            throw new NotFoundException("존재하지 않는 연구비 항목입니다.");
        }
    }

    /** 요청 바디 공통 유효성 검증 */
    private void validateRequest(BudgetRequestVO req) {
        if (req.getCategory() == null || !VALID_CATEGORIES.contains(req.getCategory())) {
            throw new BadRequestException(
                    "유효하지 않은 카테고리입니다. 허용값: PERSONNEL, TRAVEL, RESEARCH_ACTIVITY, ETC"
            );
        }
        if (req.getAmount() == null || req.getAmount() <= 0) {
            throw new BadRequestException("금액은 0보다 커야 합니다.");
        }
        if (req.getUsedAt() == null) {
            throw new BadRequestException("사용 일시는 필수입니다.");
        }
    }
}
