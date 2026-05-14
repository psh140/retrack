package com.retrack.service;

import com.retrack.annotation.LogActivity;
import com.retrack.exception.BadRequestException;
import com.retrack.exception.NotFoundException;
import com.retrack.exception.UnauthorizedException;
import com.retrack.mapper.FileMapper;
import com.retrack.mapper.ProjectMapper;
import com.retrack.storage.FileStorageStrategy;
import com.retrack.vo.FileVO;
import com.retrack.vo.ProjectVO;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 파일 관리 비즈니스 로직
 * 파일 저장소는 FileStorageStrategy 인터페이스로 추상화 — 구현체 교체 시 이 클래스 수정 불필요.
 * 활동 로그는 @LogActivity AOP 어드바이스가 자동 기록한다.
 *
 * @since 2026-05-02
 * @modified 2026-05-11 활동 로그 @LogActivity AOP로 전환
 * @modified 2026-05-14 getOriginalFilename() null 반환 시 NPE 방지 검증 추가
 */
@Service
public class FileService {

    /** 업로드 허용 확장자 화이트리스트 */
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf", "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "jpg", "jpeg", "png", "zip"
    );

    private final FileMapper fileMapper;
    private final ProjectMapper projectMapper;
    private final FileStorageStrategy fileStorageStrategy;

    public FileService(FileMapper fileMapper, ProjectMapper projectMapper,
                       FileStorageStrategy fileStorageStrategy) {
        this.fileMapper = fileMapper;
        this.projectMapper = projectMapper;
        this.fileStorageStrategy = fileStorageStrategy;
    }

    /**
     * 특정 과제의 파일 목록 반환
     * 과제가 존재하지 않으면 NotFoundException 발생
     */
    public List<FileVO> getFileList(Long projectId) {
        checkProjectExists(projectId);
        return fileMapper.findByProjectId(projectId);
    }

    /**
     * 파일 업로드
     * 빈 파일, 확장자 검증 후 UUID 파일명으로 저장.
     * DB INSERT 실패 시 저장된 파일 롤백 삭제 (@Transactional은 파일시스템을 롤백하지 않으므로 수동 처리).
     * ActivityLogAspect가 Long 반환값을 targetId로 사용하여 FILE_UPLOAD 로그를 기록한다
     * (userIdParam=2, targetIdFromReturn=true).
     *
     * @param projectId 대상 과제 ID
     * @param file      업로드 파일 (index=1)
     * @param userId    업로드한 사용자 ID (index=2)
     * @return 생성된 fileId
     */
    @LogActivity(action = "FILE_UPLOAD", targetType = "FILE",
                 userIdParam = 2, targetIdFromReturn = true)
    public Long uploadFile(Long projectId, MultipartFile file, Long userId) throws IOException {
        checkProjectExists(projectId);

        if (file.isEmpty()) {
            throw new BadRequestException("파일이 비어있습니다.");
        }

        String rawName = file.getOriginalFilename();
        if (rawName == null || rawName.isEmpty()) {
            throw new BadRequestException("파일명이 없습니다.");
        }

        // 원본 파일명에서 경로 구분자 제거 후 확장자 추출
        String originalName = new File(rawName).getName();
        String extension = extractExtension(originalName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException(
                    "허용되지 않는 파일 형식입니다. 허용 확장자: pdf, hwp, hwpx, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, zip"
            );
        }

        String savedName = UUID.randomUUID().toString() + "." + extension;
        String savedPath = fileStorageStrategy.store(file, savedName);

        FileVO fileVO = new FileVO();
        fileVO.setProjectId(projectId);
        fileVO.setFileName(originalName);
        fileVO.setFilePath(savedPath);
        fileVO.setFileType(file.getContentType());
        fileVO.setUploadedBy(userId);

        try {
            fileMapper.insert(fileVO);
        } catch (Exception e) {
            // DB INSERT 실패 시 저장된 파일 롤백
            fileStorageStrategy.delete(savedPath);
            throw e;
        }

        return fileVO.getFileId();
    }

    /**
     * 파일 삭제
     * ADMIN은 모든 파일 삭제 가능, RESEARCHER는 본인이 업로드한 파일만 삭제 가능.
     * DB DELETE 먼저 → 파일시스템 삭제 순서로 처리.
     * ActivityLogAspect가 FILE_DELETE 로그를 기록한다 (userIdParam=2, targetIdParam=1).
     *
     * @param projectId       과제 ID (index=0)
     * @param fileId          삭제할 파일 ID (index=1)
     * @param requesterUserId 요청자 ID (index=2)
     * @param requesterRole   요청자 권한
     */
    @LogActivity(action = "FILE_DELETE", targetType = "FILE",
                 userIdParam = 2, targetIdParam = 1)
    public void deleteFile(Long projectId, Long fileId,
                           Long requesterUserId, String requesterRole) throws IOException {
        FileVO file = fileMapper.findById(projectId, fileId);
        if (file == null) {
            throw new NotFoundException("존재하지 않는 파일입니다.");
        }

        // uploadedBy가 null이면 업로더가 탈퇴한 경우 — ADMIN만 삭제 가능
        if (!"ADMIN".equals(requesterRole) &&
                (file.getUploadedBy() == null || !file.getUploadedBy().equals(requesterUserId))) {
            throw new UnauthorizedException("본인이 업로드한 파일만 삭제할 수 있습니다.");
        }

        fileMapper.delete(projectId, fileId);
        fileStorageStrategy.delete(file.getFilePath());
    }

    /**
     * 파일 단건 조회 — 다운로드/삭제 전 메타데이터 확인에 사용
     *
     * @param projectId 과제 ID
     * @param fileId    파일 ID
     * @return FileVO (fileName, filePath, fileType 포함)
     */
    public FileVO getFile(Long projectId, Long fileId) {
        FileVO file = fileMapper.findById(projectId, fileId);
        if (file == null) {
            throw new NotFoundException("존재하지 않는 파일입니다.");
        }
        return file;
    }

    /**
     * 파일 Resource 로드
     * 파일시스템에 실제 파일이 없으면 IOException 발생
     *
     * @param filePath DB에 저장된 파일 경로
     * @return Resource
     */
    public Resource loadResource(String filePath) throws IOException {
        return fileStorageStrategy.load(filePath);
    }

    /**
     * 과제에 속한 파일 전체를 파일시스템에서 삭제
     * ProjectService.deleteProject() 호출 전 실행하여 고아 파일 방지
     *
     * @param projectId 삭제할 과제 ID
     */
    public void deleteAllFilesByProject(Long projectId) throws IOException {
        List<FileVO> files = fileMapper.findAllByProjectId(projectId);
        for (FileVO file : files) {
            fileStorageStrategy.delete(file.getFilePath());
        }
    }

    /** 과제 존재 여부 확인 — 없으면 NotFoundException */
    private void checkProjectExists(Long projectId) {
        ProjectVO project = projectMapper.findById(projectId);
        if (project == null) {
            throw new NotFoundException("존재하지 않는 과제입니다.");
        }
    }

    /** 파일명에서 소문자 확장자 추출 — 확장자 없으면 빈 문자열 반환 */
    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase();
    }
}
