package com.retrack.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 파일 저장소 전략 인터페이스
 * 현재는 LocalFileStorageStrategy(Docker 볼륨)를 사용하며,
 * spring-mvc.xml의 빈 선언만 교체하면 S3 등 다른 저장소로 전환 가능
 *
 * @since 2026-05-02
 */
public interface FileStorageStrategy {

    /**
     * 파일 저장
     * @param file      업로드된 파일
     * @param savedName 저장할 파일명 (UUID + 확장자)
     * @return 저장된 파일의 전체 경로
     */
    String store(MultipartFile file, String savedName) throws IOException;

    /**
     * 파일 로드
     * @param filePath DB에 저장된 파일 경로
     * @return 파일 Resource
     */
    Resource load(String filePath) throws IOException;

    /**
     * 파일 삭제
     * @param filePath DB에 저장된 파일 경로
     */
    void delete(String filePath) throws IOException;
}
