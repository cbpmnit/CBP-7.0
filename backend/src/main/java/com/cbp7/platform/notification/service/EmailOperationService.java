package com.cbp7.platform.notification.service;

import com.cbp7.platform.notification.dto.request.CreateEmailOperationRequest;
import com.cbp7.platform.notification.dto.response.EmailLogDto;
import com.cbp7.platform.notification.dto.response.EmailOperationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface EmailOperationService {
    List<EmailOperationDto> getAllOperations();
    EmailOperationDto getOperationById(UUID id);
    Page<EmailLogDto> getDeliveryLogs(Pageable pageable);
    List<EmailLogDto> getLogsByOperationId(UUID operationId);
    EmailOperationDto executeOperation(CreateEmailOperationRequest request, String adminStudentId);
    byte[] exportEmailLogsCsv();
}
