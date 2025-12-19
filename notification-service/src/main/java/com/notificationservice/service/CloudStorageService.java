package com.notificationservice.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface CloudStorageService {
    String uploadFile(MultipartFile file) throws IOException;
    // Potentially add methods for deleting files, etc.
}
