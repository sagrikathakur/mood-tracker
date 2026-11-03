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
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
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

  try {
    const mailer = await getTransporter();

    const mailOptions = {
      from: `"Calm Me Contact" <${process.env.SMTP_USER || "no-reply@calm-me.app"}>`,
      replyTo: email,
      to: adminEmail,
      subject: `[Calm Me] New message from ${name} · ${topic}`,
      text: `
New Contact Message Received on Calm Me Sanctuary:

- Sender Name: ${name}
- Sender Email: ${email}
- Time: ${time}
- Location: ${location}
- Topic: ${topic}

Message:
${message}
      `.trim(),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FCFAF4; padding: 24px; border-radius: 16px; border: 2px solid #0a1b10; color: #0a1b10; max-width: 600px; margin: auto;">
          <div style="border-bottom: 2px dashed #0a1b10; padding-bottom: 12px; margin-bottom: 16px;">
            <h2 style="margin: 0; color: #0a1b10; font-size: 20px;">🌿 Calm Me Sanctuary · New Inbound Mail</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">Received through the contact form</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 100px; color: #0a1b10;">Sender:</td>
              <td style="padding: 6px 0;"><strong>${name}</strong> &lt;<a href="mailto:${email}" style="color: #16a34a;">${email}</a>&gt;</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #0a1b10;">Time:</td>
              <td style="padding: 6px 0;">🕒 ${time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #0a1b10;">Location:</td>
              <td style="padding: 6px 0;">📍 <strong>${location}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #0a1b10;">Topic:</td>
              <td style="padding: 6px 0;"><span style="background-color: #64DC4C; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">${topic}</span></td>
            </tr>
          </table>

          <div style="background-color: #ffffff; border: 2px solid #0a1b10; border-radius: 12px; padding: 16px; margin-top: 12px; box-shadow: 2px 2px 0px #0a1b10;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px;">Message Body:</div>
            <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1e293b;">${message}</p>
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #64748b;">
            Calm Me Developer Sanctuary · Built with care by Sagrika
          </div>
        </div>
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

