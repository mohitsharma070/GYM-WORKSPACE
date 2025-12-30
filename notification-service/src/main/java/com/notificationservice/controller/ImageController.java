package com.notificationservice.controller;

import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.http.MediaType;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageController {
    private static final Logger log = LoggerFactory.getLogger(ImageController.class);

    @Value("${image.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("Received upload request. File name: {} | Size: {} bytes | Content type: {}", file.getOriginalFilename(), file.getSize(), file.getContentType());
        if (file.isEmpty()) {
            log.warn("No file uploaded in request.");
            return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded."));
        }
        try {
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID().toString() + (ext != null ? "." + ext : "");
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath);
            log.info("Saved file to: {}", filePath.toAbsolutePath());
            String imageUrl = "/uploads/" + filename;
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Failed to upload image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image."));
        }
    }
}
