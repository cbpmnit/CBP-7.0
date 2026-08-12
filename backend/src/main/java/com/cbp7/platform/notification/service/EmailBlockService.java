package com.cbp7.platform.notification.service;

import com.cbp7.platform.notification.dto.request.CreateEmailBlockRequest;
import com.cbp7.platform.notification.dto.response.EmailBlockDto;

import java.util.List;
import java.util.UUID;

public interface EmailBlockService {
    List<EmailBlockDto> getAllBlocks();
    List<EmailBlockDto> getActiveBlocks();
    EmailBlockDto getBlockById(UUID id);
    EmailBlockDto createBlock(CreateEmailBlockRequest request);
    EmailBlockDto updateBlock(UUID id, CreateEmailBlockRequest request);
    EmailBlockDto toggleBlockStatus(UUID id);
    void deleteBlock(UUID id);
}
