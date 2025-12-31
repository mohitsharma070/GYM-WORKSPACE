package com.notificationservice.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.***REMOVED***.FTP;
import org.apache.commons.net.***REMOVED***.FTPClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;

@Component
@Slf4j
public class FtpUploader {

    private final boolean enabled;
    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String remoteDir;

    public FtpUploader(
            @Value("${app.***REMOVED***.enabled:false}") boolean enabled,
            @Value("${app.***REMOVED***.host:}") String host,
            @Value("${app.***REMOVED***.port:21}") int port,
            @Value("${app.***REMOVED***.username:}") String username,
            @Value("${app.***REMOVED***.password:}") String password,
            @Value("${app.***REMOVED***.remote-dir:}") String remoteDir) {
        this.enabled = enabled;
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.remoteDir = remoteDir;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void upload(Path localFile, String remoteFileName) {
        if (!enabled) {
            log.debug("FTP upload skipped (disabled)");
            return;
        }
        validateConfig();

        FTPClient ***REMOVED*** = new FTPClient();
        try (FileInputStream fis = new FileInputStream(localFile.toFile())) {
            ***REMOVED***.connect(host, port);
            log.info("FTP connect reply: {}", ***REMOVED***.getReplyString());
            if (!***REMOVED***.login(username, password)) {
                throw new IllegalStateException("FTP login failed: check username/password. Reply: " + ***REMOVED***.getReplyString());
            }
            log.info("FTP logged in. PWD={} Reply={}", safePwd(***REMOVED***), ***REMOVED***.getReplyString());
            ***REMOVED***.enterLocalPassiveMode();
            ***REMOVED***.setFileType(FTP.BINARY_FILE_TYPE);

            if (remoteDir != null && !remoteDir.isBlank()) {
                changeOrCreateDirectory(***REMOVED***, remoteDir);
            }

            boolean stored = ***REMOVED***.storeFile(remoteFileName, fis);
            if (!stored) {
                throw new IllegalStateException("FTP storeFile failed for " + remoteFileName + " reply: " + ***REMOVED***.getReplyString());
            }
            log.info("Uploaded file via FTP to {}/{} (PWD after upload: {})", remoteDir, remoteFileName, safePwd(***REMOVED***));
        } catch (IOException e) {
            throw new IllegalStateException("FTP upload failed: " + e.getMessage(), e);
        } finally {
            if (***REMOVED***.isConnected()) {
                try {
                    ***REMOVED***.logout();
                    ***REMOVED***.disconnect();
                } catch (IOException ignore) {
                    // ignore
                }
            }
        }
    }

    // Attempts to change to the target directory; does NOT create it if missing
    private void changeOrCreateDirectory(FTPClient ***REMOVED***, String path) throws IOException {
        String normalized = path.startsWith("/") ? path.substring(1) : path; // use relative from FTP ***REMOVED***
        if (normalized.isBlank()) {
            return;
        }
        String[] segments = normalized.split("/");
        for (String segment : segments) {
            if (segment.isBlank()) continue;
            if (!***REMOVED***.changeWorkingDirectory(segment)) {
                throw new IllegalStateException("FTP change dir failed: " + segment + " reply: " + ***REMOVED***.getReplyString());
            } else {
                log.info("FTP entered '{}'. PWD={}", segment, safePwd(***REMOVED***));
            }
        }
        log.info("FTP final PWD after path '{}': {}", path, safePwd(***REMOVED***));
    }

    private void validateConfig() {
        if (host == null || host.isBlank() || username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalStateException("FTP is enabled but host/username/password are not fully configured.");
        }
    }

    private String safePwd(FTPClient ***REMOVED***) {
        try {
            return ***REMOVED***.printWorkingDirectory();
        } catch (IOException e) {
            return "<pwd-error>";
        }
    }
}