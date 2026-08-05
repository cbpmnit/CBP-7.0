package com.cbp7.notification.processor;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TemplateProcessorService {

    public String processTemplate(String templateContent, Map<String, String> variables) {
        if (templateContent == null || templateContent.isEmpty()) {
            return "";
        }

        if (variables == null || variables.isEmpty()) {
            return templateContent;
        }

        String processed = templateContent;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            if (entry.getKey() != null) {
                String placeholder = "{{" + entry.getKey() + "}}";
                String replacement = entry.getValue() != null ? entry.getValue() : "";
                processed = processed.replace(placeholder, replacement);
            }
        }

        return processed;
    }
}
