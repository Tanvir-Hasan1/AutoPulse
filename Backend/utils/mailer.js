const nodemailer = require("nodemailer");

const gmailUser = process.env.GMAIL_USER || "autopulse.services.app@gmail.com";
const gmailPass = process.env.GMAIL_PASS;

const hasGmailCredentials = 
  gmailPass && 
  gmailPass.trim() !== "" && 
  gmailPass !== "undefined" && 
  gmailPass !== "your_gmail_app_password" &&
  gmailPass !== "your-google-app-password";

let transporter;
if (hasGmailCredentials) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports (587)
    auth: {
      user: gmailUser,
      pass: gmailPass, // Gmail App Password
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  try {
    if (!hasGmailCredentials) {
      console.log(`\n📧 [DEVELOPMENT MOCK EMAIL]`);
      console.log(`From: AutoPulse <${gmailUser}>`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      if (text) console.log(`Text: ${text}`);
      if (html) console.log(`HTML: (printed below)\n${html}\n`);
      return { messageId: "mock-email-id-12345" };
    }

    const mailOptions = {
      from: `"AutoPulse" <${gmailUser}>`,
      to,
      subject,
      text,
      html,
      replyTo: gmailUser,
    };

    const response = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", response.messageId);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = { sendMail };
