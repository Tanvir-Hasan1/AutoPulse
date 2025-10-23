const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_TOKEN);

async function sendMail({ to, subject, text, html }) {
  try {
    const response = await resend.emails.send({
      from: `AutoPulse <${process.env.RESEND_MAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = { sendMail };
