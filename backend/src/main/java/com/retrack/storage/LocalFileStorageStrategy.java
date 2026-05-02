package com.retrack.storage;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 로컬 파일시스템(Docker 볼륨) 저장 구현체
 * spring-mvc.xml에서 baseDir(/app/uploads/)을 생성자로 주입받음
 * S3 등 다른 저장소로 교체 시 이 클래스만 새로 구현하면 됨
 *
 * @since 2026-05-02
 */
public class LocalFileStorageStrategy implements FileStorageStrategy {

    private final Path baseDir;

    /** baseDir 없으면 자동 생성 */
    public LocalFileStorageStrategy(String baseDir) throws IOException {
        this.baseDir = Paths.get(baseDir);
        Files.createDirectories(this.baseDir);
    }

    /** 파일을 baseDir/savedName 경로에 저장하고 전체 경로 반환 */
    @Override
    public String store(MultipartFile file, String savedName) throws IOException {
        Path target = baseDir.resolve(savedName);
        file.transferTo(target.toFile());
        return target.toString();
    }

    /** 경로로 FileSystemResource 반환 */
    @Override
    public Resource load(String filePath) throws IOException {
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            throw new IOException("파일을 찾을 수 없습니다: " + filePath);
        }
        return resource;
    }

    /** 파일 삭제 (파일이 없어도 예외 발생하지 않음) */
    @Override
    public void delete(String filePath) throws IOException {
        Files.deleteIfExists(Paths.get(filePath));
    }
}
