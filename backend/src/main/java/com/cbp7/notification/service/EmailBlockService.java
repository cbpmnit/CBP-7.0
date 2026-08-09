package com.cbp7.notification.service;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.dto.CreateEmailBlockRequest;
import com.cbp7.notification.dto.EmailBlockDto;
import com.cbp7.notification.entity.EmailBlock;
import com.cbp7.notification.repository.EmailBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailBlockService {

    private final EmailBlockRepository emailBlockRepository;

    @Transactional(readOnly = true)
    public List<EmailBlockDto> getAllBlocks() {
        return emailBlockRepository.findAll()
                .stream()
                .map(EmailBlockDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmailBlockDto> getActiveBlocks() {
        return emailBlockRepository.findByEnabledTrue()
                .stream()
                .map(EmailBlockDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmailBlockDto getBlockById(UUID id) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));
        return EmailBlockDto.fromEntity(block);
    }

    @Transactional
    public EmailBlockDto createBlock(CreateEmailBlockRequest request) {
        EmailBlock block = EmailBlock.builder()
                .name(request.name())
                .category(request.category() != null ? request.category().toUpperCase() : "CUSTOM")
                .content(request.content())
                .htmlSnippet(request.htmlSnippet())
                .enabled(request.enabled() != null ? request.enabled() : true)
                .build();

        EmailBlock saved = emailBlockRepository.save(block);
        return EmailBlockDto.fromEntity(saved);
    }

    @Transactional
    public EmailBlockDto updateBlock(UUID id, CreateEmailBlockRequest request) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));

        if (request.name() != null) block.setName(request.name());
        if (request.category() != null) block.setCategory(request.category().toUpperCase());
        if (request.content() != null) block.setContent(request.content());
        if (request.htmlSnippet() != null) block.setHtmlSnippet(request.htmlSnippet());
        if (request.enabled() != null) block.setEnabled(request.enabled());

        EmailBlock updated = emailBlockRepository.save(block);
        return EmailBlockDto.fromEntity(updated);
    }

    @Transactional
    public EmailBlockDto toggleBlockStatus(UUID id) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));

        block.setEnabled(!Boolean.TRUE.equals(block.getEnabled()));
        EmailBlock updated = emailBlockRepository.save(block);
        return EmailBlockDto.fromEntity(updated);
    }

    @Transactional
    public void deleteBlock(UUID id) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));
        emailBlockRepository.delete(block);
    }
}
