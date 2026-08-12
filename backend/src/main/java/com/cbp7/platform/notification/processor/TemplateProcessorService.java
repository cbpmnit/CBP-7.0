package com.cbp7.platform.notification.processor;

import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TemplateProcessorService {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}");

    public String processTemplate(String templateContent, Map<String, String> variables) {
        if (templateContent == null || templateContent.isEmpty()) {
            return "";
        }

        if (variables == null) {
            variables = Map.of();
        }

        Matcher matcher = VARIABLE_PATTERN.matcher(templateContent);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String varName = matcher.group(1);
            String rawValue = variables.get(varName);

            String replacement;
            if (rawValue != null) {
                // Perform HTML escaping for standard string variables to prevent HTML injection/XSS
                // Do not escape if the variable ends with 'Html' or 'Link' (e.g. activationLink, certificateUrl)
                if (varName.endsWith("Html") || varName.endsWith("Link") || varName.endsWith("Url") || varName.equalsIgnoreCase("qrCode")) {
                    replacement = rawValue;
                } else {
                    replacement = HtmlUtils.htmlEscape(rawValue);
                }
            } else {
                // Strictly default to empty string when missing - NO static mock data contamination
                replacement = "";
            }

            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    public List<String> extractVariables(String templateContent) {
        if (templateContent == null || templateContent.isBlank()) {
            return List.of();
        }

        List<String> vars = new ArrayList<>();
        Matcher matcher = VARIABLE_PATTERN.matcher(templateContent);
        while (matcher.find()) {
            String varName = matcher.group(1);
            if (!vars.contains(varName)) {
                vars.add(varName);
            }
        }
        return vars;
    }

    public void validateVariables(String templateContent, List<String> allowedVariables) {
        if (templateContent == null || templateContent.isBlank() || allowedVariables == null || allowedVariables.isEmpty()) {
            return;
        }

        List<String> usedVariables = extractVariables(templateContent);
        List<String> invalidVariables = new ArrayList<>();

        for (String varName : usedVariables) {
            if (!allowedVariables.contains(varName)) {
                invalidVariables.add(varName);
            }
        }

        if (!invalidVariables.isEmpty()) {
            throw new IllegalArgumentException("Template contains unsupported variable placeholders: " + String.join(", ", invalidVariables));
        }
    }
}
