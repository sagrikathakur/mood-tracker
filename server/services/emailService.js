import dotenv from "dotenv";
dotenv.config();

/**
 * Nodemailer Email Service for Calm Me
 * Handles sending contact emails with sender info, timestamp, and location.
 */

let transporter = null;

// Initialize Nodemailer transporter
const getTransporter = async () => {
  if (transporter) return transporter;

  try {
    // Dynamic import to support both installed and pending environments
    const nodemailer = (await import("nodemailer")).default;

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";

    // If credentials exist, use configured SMTP (e.g., Gmail / SendGrid / Custom SMTP)
    if (user && pass) {
      const isGmail = host === "smtp.gmail.com" || user.endsWith("@gmail.com");
      const cleanPass = pass.replace(/\s+/g, "");

      transporter = nodemailer.createTransport(
        isGmail
          ? {
            service: "gmail",
            auth: { user, pass: cleanPass },
          }
          : {
            host,
            port,
            secure: port === 465,
            auth: { user, pass: cleanPass },
          }
      );
    } else {
      // Development fallback: creates lightweight transporter or ethereal mock
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "ethereal.user@ethereal.email",
          pass: "ethereal.pass",
        },
      });
    }

    return transporter;
  } catch (err) {
    console.warn("[EmailService] Nodemailer warning:", err.message);
    return null;
  }
};

/**
 * Security: HTML entity encoding to prevent XSS/injection in HTML email clients
 */
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Security: Strip CRLF/newlines to prevent SMTP header injection
 */
const sanitizeHeader = (str = "") =>
  String(str).replace(/[\r\n]+/g, " ").trim();

/**
 * Send contact email to Admin with sender info, time, and location
 */
export const sendContactEmail = async ({
  name,
  email,
  topic = "General Inquiry",
  message,
  location = "Unknown Location",
  time = new Date().toLocaleString(),
}) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "sagrikathakur68@gmail.com";

  // Sanitize headers to prevent email header injection
  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);
  const safeTopic = sanitizeHeader(topic);

  // HTML-escape values to secure the email body against HTML injection
  const escapedName = escapeHtml(safeName);
  const escapedEmail = escapeHtml(safeEmail);
  const escapedTopic = escapeHtml(safeTopic);
  const escapedLocation = escapeHtml(sanitizeHeader(location));
  const escapedTime = escapeHtml(sanitizeHeader(time));
  const escapedMessage = escapeHtml(message);

  try {
    const mailer = await getTransporter();

    const mailOptions = {
      from: `"Calm Me Contact" <${process.env.SMTP_USER || "no-reply@calm-me.app"}>`,
      replyTo: safeEmail,
      to: adminEmail,
      subject: `[Calm Me] Message from ${safeName} - ${safeTopic}`,
      text: `
New message received via Calm Me contact form:

From: ${safeName} (${safeEmail})
Topic: ${safeTopic}
Date: ${escapedTime}
Location: ${escapedLocation}

Message:
${message}
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message</title>
        </head>
        <body style="margin: 0; padding: 32px 16px; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td align="center">
                <div style="max-width: 540px; width: 100%; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-sizing: border-box; text-align: left;">
                  
                  <!-- Header -->
                  <div style="margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #4b5563; display: block; margin-bottom: 4px;">
                      Calm Me
                    </span>
                    <h1 style="margin: 0; font-size: 19px; font-weight: 600; color: #111827; line-height: 1.3;">
                      New Contact Note
                    </h1>
                  </div>

                  <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 18px 0 20px 0;">

                  <!-- Details Table (Clean, light, no icons) -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 13px; margin-bottom: 22px;">
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; width: 85px; vertical-align: top; font-weight: 500;">From:</td>
                      <td style="padding: 6px 0; color: #111827; font-weight: 500;">
                        ${escapedName} &lt;<a href="mailto:${escapedEmail}" style="color: #2563eb; text-decoration: none;">${escapedEmail}</a>&gt;
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; vertical-align: top; font-weight: 500;">Topic:</td>
                      <td style="padding: 6px 0; color: #374151;">
                        <span style="display: inline-block; background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                          ${escapedTopic}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; vertical-align: top; font-weight: 500;">Date:</td>
                      <td style="padding: 6px 0; color: #374151;">
                        ${escapedTime}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280; vertical-align: top; font-weight: 500;">Location:</td>
                      <td style="padding: 6px 0; color: #374151;">
                        ${escapedLocation}
                      </td>
                    </tr>
                  </table>

                  <!-- Message Container (Soft light box) -->
                  <div style="margin-bottom: 24px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 6px;">
                      Message
                    </div>
                    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px 18px; font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap; word-break: break-word;">${escapedMessage}</div>
                  </div>

                  <!-- Action: Simple light button -->
                  <div style="margin-bottom: 26px;">
                    <a href="mailto:${escapedEmail}?subject=Re: [Calm Me] ${escapedTopic}" style="display: inline-block; background-color: #f3f4f6; color: #111827; border: 1px solid #d1d5db; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; text-decoration: none;">
                      Reply to ${escapedName}
                    </a>
                  </div>

                  <!-- Footer -->
                  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: left;">
                    Sent through the Calm Me contact form.
                  </div>

                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    if (mailer && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const info = await mailer.sendMail(mailOptions);
      console.log("[EmailService] Email sent successfully via Nodemailer. Message ID:", info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log("[EmailService] Nodemailer simulated send (Configure SMTP in .env for live dispatch):");
      console.log(`  To: ${adminEmail}`);
      console.log(`  From: ${name} <${email}>`);
      console.log(`  Time: ${time}`);
      console.log(`  Location: ${location}`);
      console.log(`  Topic: ${topic}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error("[EmailService] Failed to send email via Nodemailer:", error.message);
    // Don't throw: contact message is already stored safely in the database!
    return { success: false, error: error.message };
  }
};

