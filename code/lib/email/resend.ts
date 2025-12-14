import { Resend } from 'resend'

// Initialize Resend (gracefully handle missing API key for development)
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@personal-dashboard.local'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

/**
 * Send email verification email with hashed token
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`

  // If Resend is not configured, log to console (development mode)
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.')
    console.log('📧 Verification email would be sent to:', email)
    console.log('🔗 Verification URL:', verifyUrl)
    console.log('🔑 Token (save this for manual verification):', token)
    return { success: true, dev: true }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email address - Personal Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 30px;
                border: 1px solid #e5e7eb;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .button {
                display: inline-block;
                padding: 14px 28px;
                background-color: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
              .button:hover {
                background-color: #2563eb;
              }
              .footer {
                margin-top: 40px;
                font-size: 13px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
              }
              .code {
                background-color: #f3f4f6;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🔐 Verify Your Email Address</h2>
              </div>

              <p>Welcome to Personal Dashboard!</p>

              <p>Thank you for registering. Please verify your email address by clicking the button below:</p>

              <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p class="code">${verifyUrl}</p>

              <p><strong>This link will expire in 24 hours</strong> for security reasons.</p>

              <div class="footer">
                <p><strong>Security Note:</strong> If you didn't create an account with Personal Dashboard, you can safely ignore this email.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('✅ Verification email sent to:', email)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Send verification email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  // If Resend is not configured, log to console (development mode)
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.')
    console.log('📧 Password reset email would be sent to:', email)
    console.log('🔗 Reset URL:', resetUrl)
    console.log('🔑 Token:', token)
    return { success: true, dev: true }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - Personal Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937;">🔑 Password Reset Request</h2>

              <p>You requested to reset your password for Personal Dashboard.</p>

              <p>Click the button below to reset your password:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Reset Password
                </a>
              </div>

              <p>Or copy and paste this link:</p>
              <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 13px;">${resetUrl}</p>

              <p><strong>This link expires in 1 hour</strong> for security reasons.</p>

              <div style="margin-top: 40px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <p><strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('✅ Password reset email sent to:', email)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Send password reset email error:', error)
    return { success: false, error: error.message }
  }
}
