package com.cbp7.certificate.generator;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

@Component
public class PdfCertificateGenerator {

    public byte[] generateCertificatePdf(String studentName, String studentId, String certificateNumber, LocalDate issueDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, Color.DARK_GRAY);
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(0, 102, 204));
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 14, Color.BLACK);
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(153, 0, 0));
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11, Color.GRAY);

            Paragraph pHeader = new Paragraph("CAPACITY BUILDING PROGRAMME 7.0", titleFont);
            pHeader.setAlignment(Element.ALIGN_CENTER);
            pHeader.setSpacingAfter(15);
            document.add(pHeader);

            Paragraph pSubHeader = new Paragraph("CERTIFICATE OF PARTICIPATION", subTitleFont);
            pSubHeader.setAlignment(Element.ALIGN_CENTER);
            pSubHeader.setSpacingAfter(25);
            document.add(pSubHeader);

            Paragraph pIntro = new Paragraph("This is proudly presented to", textFont);
            pIntro.setAlignment(Element.ALIGN_CENTER);
            pIntro.setSpacingAfter(15);
            document.add(pIntro);

            Paragraph pName = new Paragraph(studentName.toUpperCase() + " (" + studentId + ")", nameFont);
            pName.setAlignment(Element.ALIGN_CENTER);
            pName.setSpacingAfter(20);
            document.add(pName);

            Paragraph pBody = new Paragraph("for successfully completing the Capacity Building Programme (CBP 7.0) with required attendance and active engagement.", textFont);
            pBody.setAlignment(Element.ALIGN_CENTER);
            pBody.setSpacingAfter(35);
            document.add(pBody);

            Paragraph pFooter = new Paragraph("Certificate No: " + certificateNumber + "   |   Date: " + issueDate, metaFont);
            pFooter.setAlignment(Element.ALIGN_CENTER);
            document.add(pFooter);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate PDF certificate: " + e.getMessage(), e);
        }
    }
}
