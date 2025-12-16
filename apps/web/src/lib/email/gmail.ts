import nodemailer from "nodemailer";

export type GmailConfig = {
  user: string;
  pass: string;
};

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

const gmailConfig: GmailConfig = {
  user: process.env.GMAIL_USER ?? "",
  pass: process.env.GMAIL_APP_PASSWORD ?? "",
};

export function createGmailTransporter() {
  if (!gmailConfig.user || !gmailConfig.pass) {
    console.warn("Gmail credentials not configured. Email sending will be simulated.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailConfig.user,
      pass: gmailConfig.pass,
    },
  });
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const transporter = createGmailTransporter();

  if (!transporter) {
    console.log(`[Email Simulation] To: ${params.to}, Subject: ${params.subject}`);
    console.log(`[Email Simulation] Content: ${params.html.substring(0, 200)}...`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: gmailConfig.user,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to send email to ${params.to}:`, message);
    return { success: false, error: message };
  }
}

export function generateCredentialsEmailHtml(params: {
  displayName: string;
  accountId: string;
  password: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .credentials-item { margin: 10px 0; }
    .credentials-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .credentials-value { font-size: 18px; color: #111827; font-family: monospace; background: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 4px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>社内ストア アカウント情報</h1>
    </div>
    <div class="content">
      <p>${params.displayName} 様</p>
      <p>社内ストアのアカウント情報をお知らせいたします。</p>
      
      <div class="credentials">
        <div class="credentials-item">
          <div class="credentials-label">アカウントID</div>
          <div class="credentials-value">${params.accountId}</div>
        </div>
        <div class="credentials-item">
          <div class="credentials-label">パスワード</div>
          <div class="credentials-value">${params.password}</div>
        </div>
      </div>
      
      <p>以下のボタンからログインページにアクセスできます。</p>
      
      <a href="${params.loginUrl}" class="button">ログインページへ</a>
      
      <div class="footer">
        <p>このメールは自動送信されています。</p>
        <p>ご不明な点がございましたら、管理者までお問い合わせください。</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
