export interface CBPContentBlock {
  id: string
  title: string
  category: "HEADER" | "STUDENT" | "ATTENDANCE" | "PAYMENT" | "CERTIFICATE" | "FOOTER"
  description: string
  icon: string
  htmlSnippet: string
}

export const CBP_CUSTOM_BLOCKS: CBPContentBlock[] = [
  {
    id: "cbp-header",
    title: "CBP 7.0 Official Header",
    category: "HEADER",
    description: "MNIT Jaipur branding header banner with gradient identity bar",
    icon: "FiLayers",
    htmlSnippet: `<div style="background-color: #0f172a; padding: 24px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #00d4ff; font-family: sans-serif; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 1px;">CBP 7.0 &middot; MNIT JAIPUR</h1>
      <p style="color: #94a3b8; font-family: sans-serif; font-size: 12px; margin-top: 4px;">Capacity Building Program on Soft Skills &amp; Leadership</p>
    </div>`,
  },
  {
    id: "cbp-student-card",
    title: "Student Profile Card",
    category: "STUDENT",
    description: "Pre-formatted student identity dossier summary block",
    icon: "FiUser",
    htmlSnippet: `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-family: sans-serif;">
      <h4 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin: 0 0 12px 0; letter-spacing: 0.5px;">Student Participant Record</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Full Name:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">{{studentName}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Student ID:</td>
          <td style="padding: 6px 0; color: #0284c7; font-weight: 700; font-family: monospace; text-align: right;">{{studentId}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Email:</td>
          <td style="padding: 6px 0; color: #0f172a; font-family: monospace; text-align: right;">{{email}}</td>
        </tr>
      </table>
    </div>`,
  },
  {
    id: "cbp-qr-pass",
    title: "Dynamic Gate QR Pass",
    category: "ATTENDANCE",
    description: "Auditorium entry pass with dynamic HMAC QR code placeholder",
    icon: "FiClock",
    htmlSnippet: `<div style="background-color: #ffffff; border: 2px dashed #0284c7; border-radius: 16px; padding: 20px; text-align: center; margin: 16px 0; font-family: sans-serif;">
      <span style="background-color: #f0f9ff; color: #0369a1; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; border: 1px solid #bae6fd;">Gate Entry Scan Pass</span>
      <h3 style="color: #0f172a; font-size: 16px; font-weight: 800; margin: 12px 0 4px 0;">{{sessionName}}</h3>
      <p style="color: #64748b; font-size: 12px; margin: 0 0 16px 0;">Venue: {{venue}} &middot; {{sessionDate}}</p>
      <div style="margin: 0 auto; display: inline-block; padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <img src="{{qrCode}}" alt="Gate QR Pass" width="140" height="140" style="display: block; border-radius: 8px;" />
      </div>
      <p style="color: #0369a1; font-size: 11px; font-weight: 700; margin-top: 12px;">Show this pass at the gate scanner to record attendance</p>
    </div>`,
  },
  {
    id: "cbp-payment-receipt",
    title: "Payment Confirmation Receipt",
    category: "PAYMENT",
    description: "PhonePe payment verification transaction receipt card",
    icon: "FiCreditCard",
    htmlSnippet: `<div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 16px 0; font-family: sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="color: #065f46; font-size: 12px; font-weight: 800; text-transform: uppercase;">Payment Received</span>
        <span style="background-color: #10b981; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px;">✓ {{paymentStatus}}</span>
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #064e3b; margin-bottom: 12px;">INR {{amount}}</div>
      <div style="font-size: 11px; font-family: monospace; color: #047857;">Txn Ref: {{transactionId}} &middot; {{paidAt}}</div>
    </div>`,
  },
  {
    id: "cbp-certificate-block",
    title: "Certificate Credential Card",
    category: "CERTIFICATE",
    description: "Gold credential card with certificate download button",
    icon: "FiAward",
    htmlSnippet: `<div style="background-color: #faf5ff; border: 2px solid #d8b4fe; border-radius: 16px; padding: 20px; text-align: center; margin: 16px 0; font-family: sans-serif;">
      <h3 style="color: #581c87; font-size: 16px; font-weight: 800; margin: 0 0 6px 0;">Official Completion Certificate Issued</h3>
      <p style="color: #7e22ce; font-size: 12px; margin: 0 0 16px 0;">Credential ID: <strong style="font-family: monospace;">{{certificateNumber}}</strong></p>
      <a href="{{certificateUrl}}" target="_blank" style="display: inline-block; background-color: #7e22ce; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 800; padding: 10px 20px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Download Certificate PDF &rarr;</a>
    </div>`,
  },
  {
    id: "cbp-footer",
    title: "CBP Institutional Footer",
    category: "FOOTER",
    description: "Official MNIT Jaipur helpline and event support footer",
    icon: "FiInfo",
    htmlSnippet: `<div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-family: sans-serif; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">CBP 7.0 Secretariat &middot; Malaviya National Institute of Technology Jaipur</p>
      <p style="margin: 0;">Need support? Contact <a href="mailto:cbp.support@mnit.ac.in" style="color: #0284c7; text-decoration: none;">cbp.support@mnit.ac.in</a> | JLN Marg, Jaipur, Rajasthan 302017</p>
    </div>`,
  },
]

export const CBP_MEDIA_ASSETS = [
  {
    name: "CBP 7.0 Official Logo",
    category: "Logos",
    url: "https://cbp.mnit.ac.in/favicon/logo-landscape.webp",
  },
  {
    name: "MNIT Jaipur Crest",
    category: "Logos",
    url: "https://cbp.mnit.ac.in/assets/mnit-logo.png",
  },
  {
    name: "Soft Skills Workshop Banner",
    category: "Banners",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "VLTC Auditorium Venue Image",
    category: "Venues",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
  },
]
