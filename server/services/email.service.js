const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = 'https://plotter-one.vercel.app';
const FROM_EMAIL = 'onboarding@resend.dev';
async function sendNotificationEmail({ to, subject, title, body, storyId }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] Skipping email send: RESEND_API_KEY not found');
    return;
  }

  if (!to) return;

  const url = `${BASE_URL}/?story=${storyId}`;

  try {
    await resend.emails.send({
      from: `Plotter <${FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #E8754A;">${title}</h2>
          <p style="font-size: 16px; color: #333;">${body}</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #E8754A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Teleport to the story
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">You received this because someone interacted with your journey on Plotter.</p>
        </div>
      `,
    });
    console.log(`[Email] Notification sent to ${to}`);
  } catch (err) {
    console.error('[Email] Failed to send email:', err.message);
  }
}

module.exports = { sendNotificationEmail };
