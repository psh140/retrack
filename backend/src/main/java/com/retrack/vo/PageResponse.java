package com.retrack.vo;

import lombok.Getter;
import java.util.List;

/**
 * 페이지네이션 응답 래퍼 클래스
 * 목록 조회 API에서 items + 페이지 메타데이터를 함께 반환한다.
 *
 * @since 2026-05-12
 */
@Getter
public class PageResponse<T> {

    private final List<T> items;
    private final long totalCount;
    private final int page;
    private final int size;
    private final int totalPages;

    public PageResponse(List<T> items, long totalCount, int page, int size) {
        this.items = items;
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
        this.totalPages = (int) Math.ceil((double) totalCount / size);
    }
}
