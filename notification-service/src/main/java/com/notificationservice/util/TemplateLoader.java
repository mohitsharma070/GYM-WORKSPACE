package com.notificationservice.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TemplateLoader {
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{(.*?)}}", Pattern.DOTALL);

    /**
     * Loads an HTML template from resources/templates and replaces placeholders with provided values.
     * @param templateName The template filename (e.g., "transactional-notification.html")
     * @param values Map of placeholder names to values
     * @return Rendered HTML string, or empty string if template not found
     */
    public static String renderTemplate(String templateName, Map<String, String> values) {
        String templateContent = loadTemplateContent(templateName);
        if (templateContent.isEmpty()) {
            return "";
        }
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(templateContent);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String key = matcher.group(1).trim();
            String replacement = values.getOrDefault(key, "");
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private static String loadTemplateContent(String templateName) {
        String resourcePath = "templates/" + templateName;
        try (InputStream is = TemplateLoader.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (is == null) {
                return "";
            }
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        } catch (IOException e) {
            return "";
        }
    }
}
