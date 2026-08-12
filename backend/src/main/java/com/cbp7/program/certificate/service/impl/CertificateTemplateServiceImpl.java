package com.cbp7.program.certificate.service.impl;

import com.cbp7.program.certificate.dto.common.CertificateTemplateDto;
import com.cbp7.program.certificate.dto.request.SaveCertificateTemplateRequest;
import com.cbp7.program.certificate.entity.CertificateTemplate;
import com.cbp7.program.certificate.mapper.CertificateMapper;
import com.cbp7.program.certificate.repository.CertificateTemplateRepository;
import com.cbp7.program.certificate.service.CertificateTemplateService;
import com.cbp7.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateTemplateServiceImpl implements CertificateTemplateService {

    private final CertificateTemplateRepository certificateTemplateRepository;
    private final CertificateMapper certificateMapper;

    private static final String DEFAULT_FIELD_CONFIG = "{\"studentName\":{\"x\":500,\"y\":330,\"fontFamily\":\"Great Vibes\",\"fontSize\":42,\"fontWeight\":\"bold\",\"alignment\":\"center\",\"color\":\"#1e293b\"},\"studentId\":{\"x\":500,\"y\":385,\"fontFamily\":\"Inter\",\"fontSize\":16,\"fontWeight\":\"normal\",\"alignment\":\"center\",\"color\":\"#64748b\"}}";

    @Override
    @Transactional(readOnly = true)
    public CertificateTemplateDto getActivePublishedTemplate() {
        CertificateTemplate template = certificateTemplateRepository.findFirstByStatusOrderByUpdatedAtDesc("PUBLISHED")
                .orElseGet(() -> {
                    log.warn("No published certificate template found, using or creating default template");
                    return certificateTemplateRepository.findAll().stream().findFirst()
                            .orElseGet(this::createInitialDefaultTemplate);
                });
        return certificateMapper.toCertificateTemplateDto(template);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateTemplateDto> getAllTemplates() {
        List<CertificateTemplate> list = certificateTemplateRepository.findAllByOrderByCreatedAtDesc();
        if (list.isEmpty()) {
            return List.of(certificateMapper.toCertificateTemplateDto(createInitialDefaultTemplate()));
        }
        return list.stream().map(certificateMapper::toCertificateTemplateDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateTemplateDto getTemplateById(UUID id) {
        CertificateTemplate template = certificateTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate template not found with id: " + id));
        return certificateMapper.toCertificateTemplateDto(template);
    }

    @Override
    @Transactional
    public CertificateTemplateDto saveTemplate(UUID id, SaveCertificateTemplateRequest request) {
        CertificateTemplate template;
        if (id != null) {
            template = certificateTemplateRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Certificate template not found with id: " + id));
            template.setName(request.name());
            template.setBackgroundUrl(request.backgroundUrl());
            template.setFieldConfigurationJson(request.fieldConfigurationJson());
            if (request.status() != null) {
                template.setStatus(request.status());
            }
        } else {
            template = CertificateTemplate.builder()
                    .name(request.name())
                    .backgroundUrl(request.backgroundUrl() != null ? request.backgroundUrl() : "/certificates/certificate-bg.svg")
                    .fieldConfigurationJson(request.fieldConfigurationJson() != null ? request.fieldConfigurationJson() : DEFAULT_FIELD_CONFIG)
                    .status(request.status() != null ? request.status() : "DRAFT")
                    .build();
        }

        CertificateTemplate saved = certificateTemplateRepository.save(template);
        return certificateMapper.toCertificateTemplateDto(saved);
    }

    @Override
    @Transactional
    public CertificateTemplateDto publishTemplate(UUID id) {
        CertificateTemplate target = certificateTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate template not found with id: " + id));

        // Mark other templates as DRAFT
        List<CertificateTemplate> existing = certificateTemplateRepository.findAll();
        for (CertificateTemplate t : existing) {
            if (!t.getId().equals(id) && "PUBLISHED".equals(t.getStatus())) {
                t.setStatus("DRAFT");
                certificateTemplateRepository.save(t);
            }
        }

        target.setStatus("PUBLISHED");
        CertificateTemplate published = certificateTemplateRepository.save(target);
        log.info("Certificate template '{}' ({}) is now published and active.", published.getName(), published.getId());
        return certificateMapper.toCertificateTemplateDto(published);
    }

    private CertificateTemplate createInitialDefaultTemplate() {
        CertificateTemplate defaultTemplate = CertificateTemplate.builder()
                .name("Official CBP 7.0 Completion Certificate")
                .backgroundUrl("/certificates/certificate-bg.svg")
                .fieldConfigurationJson(DEFAULT_FIELD_CONFIG)
                .status("PUBLISHED")
                .build();
        return certificateTemplateRepository.save(defaultTemplate);
    }
}
