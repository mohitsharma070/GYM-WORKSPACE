package com.gym.userservice.common;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class TemplateUtil {
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{(.*?)}}", Pattern.DOTALL);

    /**
     * Loads an HTML template from resources/templates and replaces placeholders with provided values.
     * @param templateName The template filename (e.g., "trainer_registration_notification.html")
     * @param values Map of placeholder names to values (e.g., "userName" -> "John")
     * @return The rendered template as a String, or empty string if template not found.
     */
    public static String renderTemplate(String templateName, Map<String, String> values) {
        String template = loadTemplate(templateName);
        if (template.isEmpty()) {
            return "";
        }
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String key = matcher.group(1).trim();
            String replacement = values.getOrDefault(key, "");
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private static String loadTemplate(String templateName) {
        String path = "templates/" + templateName;
        try (InputStream is = TemplateUtil.class.getClassLoader().getResourceAsStream(path)) {
            if (is == null) {
                return "";
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (Exception e) {
            return "";
        }
    }
}
