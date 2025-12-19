package com.notificationservice.service.impl;

import com.notificationservice.service.CloudStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service("localStorageService") // Qualify the service bean name
public class LocalStorageService implements CloudStorageService {

    @Value("${app.image.upload-dir:./uploads}") // Default to ./uploads if not specified
    private String uploadDir;

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath); // Create directory if it doesn't exist

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension; // Generate unique file name
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath); // Save file to local storage

        // Return a URL that Spring Boot can serve statically
        // Assuming /images/** is mapped to the uploadDir
        return "/images/" + fileName;
    }
}
