// Vercel Serverless Function: Multi-Provider Real-Time Email OTP Dispatcher
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Missing email or OTP' });
  }

  const htmlTemplate = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; background: #070d18; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #38bdf8; font-size: 22px; margin: 0; font-weight: 800;">Health-Guard AI</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Medical Intelligence & Diagnostic Platform</p>
      </div>
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(56,189,248,0.25); border-radius: 12px; padding: 22px; text-align: center; margin: 20px 0;">
        <p style="color: #cbd5e1; font-size: 13.5px; margin: 0 0 14px;">Your 6-digit verification code is:</p>
        <div style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; padding: 12px; background: #0c182b; border-radius: 8px; border: 1px solid #0284c7;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 14px 0 0;">⏱️ Valid for 5 minutes. Do not share this code.</p>
      </div>
      <p style="color: #64748b; font-size: 11px; text-align: center; margin: 20px 0 0;">
        🔒 Encrypted Clinical Access Gate · Automated Security Dispatch
      </p>
    </div>
  `;

  // 1. Check Brevo API Key
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      const bRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Health-Guard AI', email: 'portal@healthguard-ai.com' },
          to: [{ email: email }],
          subject: `🔐 Your Health-Guard AI Verification Code: ${otp}`,
          htmlContent: htmlTemplate
        })
      });
      const bData = await bRes.json();
      return res.status(200).json({ success: true, provider: 'brevo', data: bData });
    } catch (e) {
      console.error('Brevo error:', e);
    }
  }

  // 2. Check Resend API Key
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const rRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Health-Guard AI <onboarding@resend.dev>',
          to: [email],
          subject: `🔐 Your Health-Guard AI Verification Code: ${otp}`,
          html: htmlTemplate
        })
      });
      const rData = await rRes.json();
      return res.status(200).json({ success: true, provider: 'resend', data: rData });
    } catch (e) {
      console.error('Resend error:', e);
    }
  }

  // 3. Check Gmail App Password SMTP (via Nodemailer)
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;
  if (gmailUser && gmailPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
      const info = await transporter.sendMail({
        from: `"Health-Guard AI" <${gmailUser}>`,
        to: email,
        subject: `🔐 Your Health-Guard AI Verification Code: ${otp}`,
        html: htmlTemplate
      });
      return res.status(200).json({ success: true, provider: 'gmail_smtp', messageId: info.messageId });
    } catch (e) {
      console.error('Gmail SMTP error:', e);
    }
  }

  // No active provider configured
  return res.status(200).json({
    success: false,
    needs_config: true,
    message: 'No email service configured. Please provide RESEND_API_KEY, BREVO_API_KEY, or GMAIL_APP_PASS.'
  });
}
