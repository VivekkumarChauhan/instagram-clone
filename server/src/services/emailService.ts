import nodemailer from 'nodemailer';

export class EmailService {
  private static testAccount: nodemailer.TestAccount | null = null;
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.ALERT_EMAIL_FROM;
    const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

    if (user && pass && user !== 'your_email@gmail.com' && pass !== 'your_app_password') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    if (!this.testAccount) {
      this.testAccount = await nodemailer.createTestAccount();
    }

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: this.testAccount.user,
        pass: this.testAccount.pass,
      },
    });
  }

  public static async sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #08080A; color: #FFFFFF; padding: 40px 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #13131F; border: 1px solid #26263D; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(121,40,202,0.3);">
          <div style="display: inline-block; background: linear-gradient(135deg, #FF0080, #7928CA); width: 56px; height: 56px; border-radius: 16px; line-height: 56px; margin-bottom: 16px;">
            <span style="font-size: 26px; color: #FFFFFF;">⚡</span>
          </div>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: 2px; margin: 0 0 8px 0;">LUMIGRAM</h1>
          <p style="color: #A5A5C8; font-size: 14px; margin-bottom: 24px;">Your verification security code is below</p>
          
          <div style="background-color: #1A1A2B; border: 1.5px dashed #7928CA; border-radius: 14px; padding: 18px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #00DFD8;">${otp}</span>
          </div>

          <p style="color: #686888; font-size: 12px; line-height: 18px; margin-top: 24px;">
            This code expires in 10 minutes. If you did not request this verification code, please ignore this email.
          </p>
        </div>
      </div>
    `;

    console.log(`\n========================================================`);
    console.log(`📧 [EMAIL DISPATCH] RECIPIENT: ${toEmail}`);
    console.log(`🔑 VERIFICATION CODE: >>> ${otp} <<<`);

    try {
      const senderEmail = process.env.SMTP_USER || process.env.ALERT_EMAIL_FROM || 'security@lumigram.app';
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"Lumigram Security" <${senderEmail}>`,
        to: toEmail,
        subject: `${otp} is your Lumigram verification code`,
        html: htmlTemplate,
      });

      console.log(`✅ [EMAIL DISPATCH] Delivered with Message ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 [VIEW INBOX EMAIL]: ${previewUrl}`);
      }
      console.log(`========================================================\n`);
      return true;
    } catch (err: any) {
      console.log(`⚠️ [EMAIL DISPATCH] Notice: ${err.message}`);
      console.log(`========================================================\n`);
      return false;
    }
  }
}
