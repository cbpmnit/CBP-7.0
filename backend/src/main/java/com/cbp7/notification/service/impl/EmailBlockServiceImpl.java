package com.cbp7.notification.service.impl;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.dto.request.CreateEmailBlockRequest;
import com.cbp7.notification.dto.response.EmailBlockDto;
import com.cbp7.notification.entity.EmailBlock;
import com.cbp7.notification.mapper.NotificationMapper;
import com.cbp7.notification.repository.EmailBlockRepository;
import com.cbp7.notification.service.EmailBlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailBlockServiceImpl implements EmailBlockService {

    private final EmailBlockRepository emailBlockRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EmailBlockDto> getAllBlocks() {
        return emailBlockRepository.findAll()
                .stream()
                .map(notificationMapper::toEmailBlockDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmailBlockDto> getActiveBlocks() {
        return emailBlockRepository.findByEnabledTrue()
                .stream()
                .map(notificationMapper::toEmailBlockDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmailBlockDto getBlockById(UUID id) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));
        return notificationMapper.toEmailBlockDto(block);
    }

    @Override
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
        return notificationMapper.toEmailBlockDto(saved);
    }

    @Override
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
        return notificationMapper.toEmailBlockDto(updated);
    }

    @Override
    @Transactional
    public EmailBlockDto toggleBlockStatus(UUID id) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));

        block.setEnabled(!Boolean.TRUE.equals(block.getEnabled()));
        EmailBlock updated = emailBlockRepository.save(block);
        return notificationMapper.toEmailBlockDto(updated);
    }

    @Override
    @Transactional
    public void deleteBlock(UUID id) {
        EmailBlock block = emailBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email block not found with id: " + id));
        emailBlockRepository.delete(block);
    }
}
