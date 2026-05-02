package com.retrack.controller;

import com.retrack.annotation.RequiredRole;
import com.retrack.service.FileService;
import com.retrack.vo.ApiResponse;
import com.retrack.vo.FileVO;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * 파일 관리 API
 * - 목록 조회/다운로드: 로그인 사용자 전체 허용
 * - 업로드: RESEARCHER 이상
 * - 삭제: RESEARCHER(본인 것만) / ADMIN(전체)
 * 예외 처리는 GlobalExceptionHandler에 위임 (try-catch 없음)
 *
 * @since 2026-05-02
 */
@RestController
@RequestMapping("/api/projects/{id}/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * GET /api/projects/{id}/files
     * 파일 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getFileList(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("파일 목록 조회 성공", fileService.getFileList(id)));
    }

    /**
     * POST /api/projects/{id}/files
     * 파일 업로드 (RESEARCHER 이상)
     * uploaded_by는 JWT에서 추출한 로그인 사용자 ID로 자동 설정
     */
    @RequiredRole("RESEARCHER")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadFile(@PathVariable Long id,
                                                     @RequestParam("file") MultipartFile file,
                                                     HttpServletRequest request) throws IOException {
        Long userId = (Long) request.getAttribute("userId");
        Long fileId = fileService.uploadFile(id, file, userId);
        return ResponseEntity.ok(ApiResponse.ok("파일이 업로드되었습니다.", fileId));
    }

    /**
     * DELETE /api/projects/{id}/files/{fid}
     * 파일 삭제 — ADMIN 또는 본인이 업로드한 파일(RESEARCHER)만 가능
     */
    @RequiredRole("RESEARCHER")
    @DeleteMapping("/{fid}")
    public ResponseEntity<ApiResponse<?>> deleteFile(@PathVariable Long id,
                                                     @PathVariable Long fid,
                                                     HttpServletRequest request) throws IOException {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        fileService.deleteFile(id, fid, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("파일이 삭제되었습니다."));
    }

    /**
     * GET /api/projects/{id}/files/{fid}
     * 파일 다운로드
     * 한글 파일명 RFC 5987 인코딩으로 Content-Disposition 헤더 설정
     */
    @GetMapping("/{fid}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id,
                                                 @PathVariable Long fid) throws IOException {
        FileVO file = fileService.getFile(id, fid);
        Resource resource = fileService.loadResource(file.getFilePath());

        // RFC 5987: 한글 등 non-ASCII 파일명 인코딩
        String encodedFileName = URLEncoder.encode(file.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        String contentDisposition = "attachment; filename*=UTF-8''" + encodedFileName;

        String contentType = file.getFileType() != null
                ? file.getFileType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
