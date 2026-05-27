import nodemailer from 'nodemailer';

export interface EmailResult {
  success: boolean;
  error?: string;
}

export const sendResetEmail = async (email: string, resetUrl: string): Promise<EmailResult> => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET TRIGGERED FOR: ${email}]`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`======================================================\n`);

  // Verify that SMTP credentials are provided
  if (!emailUser || !emailPass) {
    const errorMsg = 'SMTP credentials (EMAIL_USER and/or EMAIL_PASS) are missing in backend configuration.';
    console.error(`[SMTP CONFIG ERROR] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  try {
    // Configure standard Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Verify SMTP connection configuration and authentication
    try {
      await transporter.verify();
      console.log(`[SMTP AUTH SUCCESS] Connection verified successfully for account: ${emailUser}`);
    } catch (verifyError: any) {
      const errorMsg = `SMTP authentication or connection failed: ${verifyError.message}`;
      console.error(`[SMTP AUTH ERROR] ${errorMsg}`);
      return { success: false, error: 'SMTP authentication failed. Please verify your EMAIL_USER and EMAIL_PASS.' };
    }

    const mailOptions = {
      from: `"HopeBuddy AI Support" <${emailUser}>`,
      to: email,
      subject: 'HopeBuddy AI - Password Reset Request',
      html: `
        <div style="background-color: #090514; color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; border-radius: 24px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(139, 92, 246, 0.2);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; line-height: 60px; color: white;">
              🤝
            </div>
            <h1 style="color: #a78bfa; margin-top: 15px; font-weight: 800; font-size: 24px; letter-spacing: -0.5px;">HopeBuddy AI</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Your Emotional Support & Motivation Companion</p>
          </div>
          
          <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 20px;">
            <h2 style="font-size: 18px; margin-top: 0; color: #f8fafc;">Password Reset Request</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              Hello,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              We received a request to reset the password for your HopeBuddy account. Tap the button below to choose a new password. This reset link is valid for <strong>1 hour</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
              If you cannot click the button, copy and paste the URL below into your web browser:
              <br/>
              <span style="color: #a78bfa; word-break: break-all;">${resetUrl}</span>
            </p>
            
            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin: 25px 0;" />
            
            <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
              If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #64748b;">
            <p>© 2026 HopeBuddy AI. Prioritizing mental wellness.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Password reset email sent successfully to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL FAILURE] Failed to send password reset email to ${email}. Error: ${error.message}`);
    return { success: false, error: `Nodemailer transmission failure: ${error.message}` };
  }
};
