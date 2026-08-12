package com.cbp7.platform.admin.student;

import com.cbp7.platform.admin.student.dto.response.AdminFullStudentDetailResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Component
public class StudentProfilePdfGenerator {

    public byte[] generateStudentProfilePdf(AdminFullStudentDetailResponse details) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(15, 23, 42));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(8, 145, 178));
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(30, 41, 59));
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font fontRegular = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);

            // Header Banner
            Paragraph pHeader = new Paragraph("CAPACITY BUILDING PROGRAMME (CBP 7.0)", titleFont);
            pHeader.setAlignment(Element.ALIGN_CENTER);
            pHeader.setSpacingAfter(4);
            document.add(pHeader);

            Paragraph pSub = new Paragraph("STUDENT OFFICIAL PARTICIPANT DOSSIER", subTitleFont);
            pSub.setAlignment(Element.ALIGN_CENTER);
            pSub.setSpacingAfter(20);
            document.add(pSub);

            // Section 1: Basic Information
            addSectionHeader(document, "1. BASIC & PERSONAL DETAILS", sectionTitleFont);
            PdfPTable t1 = new PdfPTable(2);
            t1.setWidthPercentage(100);
            t1.setSpacingAfter(15);

            addCellPair(t1, "Student Name:", details.student().name(), fontBold, fontRegular);
            addCellPair(t1, "Student ID:", details.student().studentId(), fontBold, fontRegular);
            addCellPair(t1, "Email Address:", details.student().email(), fontBold, fontRegular);
            addCellPair(t1, "Contact Phone:", details.student().phone(), fontBold, fontRegular);
            addCellPair(t1, "Gender:", details.profile() != null ? details.profile().gender() : "-", fontBold, fontRegular);
            addCellPair(t1, "Date of Birth:", details.profile() != null ? details.profile().dob() : "-", fontBold, fontRegular);
            document.add(t1);

            // Section 2: Academic & Hostel
            addSectionHeader(document, "2. ACADEMIC & INSTITUTIONAL INFORMATION", sectionTitleFont);
            PdfPTable t2 = new PdfPTable(2);
            t2.setWidthPercentage(100);
            t2.setSpacingAfter(15);

            addCellPair(t2, "Institute:", details.profile() != null ? details.profile().institute() : "MNIT Jaipur", fontBold, fontRegular);
            addCellPair(t2, "Course:", details.profile() != null ? details.profile().course() : "-", fontBold, fontRegular);
            addCellPair(t2, "Branch:", details.profile() != null ? details.profile().branch() : "-", fontBold, fontRegular);
            addCellPair(t2, "Academic Year:", details.profile() != null ? details.profile().year() : "-", fontBold, fontRegular);
            addCellPair(t2, "Hosteller:", details.profile() != null && Boolean.TRUE.equals(details.profile().hosteller()) ? "Yes" : "No", fontBold, fontRegular);
            addCellPair(t2, "Room / Hostel:", details.profile() != null ? details.profile().roomNumber() : "-", fontBold, fontRegular);
            document.add(t2);

            // Section 3: Registration & Payment
            addSectionHeader(document, "3. REGISTRATION & FEE PAYMENT STATUS", sectionTitleFont);
            PdfPTable t3 = new PdfPTable(2);
            t3.setWidthPercentage(100);
            t3.setSpacingAfter(15);

            addCellPair(t3, "Registration ID:", details.registration() != null ? details.registration().registrationId() : "-", fontBold, fontRegular);
            addCellPair(t3, "Registration Status:", details.registration() != null ? details.registration().status() : "-", fontBold, fontRegular);
            addCellPair(t3, "Payment Status:", details.payment() != null ? details.payment().status() : "PENDING", fontBold, fontRegular);
            addCellPair(t3, "Fee Amount Paid:", details.payment() != null && details.payment().amount() != null ? "INR " + details.payment().amount() : "-", fontBold, fontRegular);
            addCellPair(t3, "Transaction ID:", details.payment() != null ? details.payment().transactionId() : "-", fontBold, fontRegular);
            addCellPair(t3, "Paid At:", details.payment() != null && details.payment().paidAt() != null ? details.payment().paidAt().toString().replace("T", " ") : "-", fontBold, fontRegular);
            document.add(t3);

            // Section 4: Attendance & Certificate
            addSectionHeader(document, "4. ATTENDANCE & CREDENTIAL ELIGIBILITY", sectionTitleFont);
            PdfPTable t4 = new PdfPTable(2);
            t4.setWidthPercentage(100);
            t4.setSpacingAfter(20);

            addCellPair(t4, "Total Workshop Sessions:", String.valueOf(details.attendance().totalSessions()), fontBold, fontRegular);
            addCellPair(t4, "Attended Sessions:", String.valueOf(details.attendance().attendedSessions()), fontBold, fontRegular);
            addCellPair(t4, "Attendance Percentage:", String.format("%.1f%%", details.attendance().percentage()), fontBold, fontRegular);
            addCellPair(t4, "Certificate Status:", details.certificate() != null ? details.certificate().status() : "NOT_ISSUED", fontBold, fontRegular);
            document.add(t4);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate student profile PDF dossier: " + e.getMessage(), e);
        }
    }

    private void addSectionHeader(Document document, String title, Font font) throws Exception {
        Paragraph p = new Paragraph(title, font);
        p.setSpacingBefore(8);
        p.setSpacingAfter(6);
        document.add(p);
    }

    private void addCellPair(PdfPTable table, String label, String value, Font fontBold, Font fontRegular) {
        PdfPCell c1 = new PdfPCell(new Paragraph(label, fontBold));
        c1.setBorderColor(new Color(226, 232, 240));
        c1.setPadding(6);
        c1.setBackgroundColor(new Color(248, 250, 252));

        PdfPCell c2 = new PdfPCell(new Paragraph(value != null ? value : "-", fontRegular));
        c2.setBorderColor(new Color(226, 232, 240));
        c2.setPadding(6);

        table.addCell(c1);
        table.addCell(c2);
    }
}
