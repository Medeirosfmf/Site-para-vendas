const nodemailer = require('nodemailer');

/**
 * Email Service for transactional emails (verification codes, etc.)
 * 
 * If SMTP credentials are not configured, the service runs in "dev mode"
 * and logs the email content to the console instead of sending it.
 */

// Check if SMTP is configured
const isSmtpConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!isSmtpConfigured()) {
    console.log('⚠️  SMTP não configurado — e-mails serão logados no console (modo dev)');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: (parseInt(process.env.SMTP_PORT) || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Generate the HTML template for the verification email
 */
const getVerificationEmailHTML = (name, code) => {
  const firstName = name.split(' ')[0];
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de E-mail - Imports GR</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color: #111118; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c8a834 0%, #a68b2a 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #0a0a0f; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                IMPORTS GR
              </h1>
              <p style="margin: 4px 0 0; color: rgba(10,10,15,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                Importados do Paraguai
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 20px; font-weight: 700;">
                Olá, ${firstName}! 👋
              </h2>
              <p style="margin: 0 0 28px; color: #8a8a9a; font-size: 14px; line-height: 1.6;">
                Recebemos o seu cadastro na <strong style="color: #c8a834;">Imports GR</strong>. Para confirmar seu e-mail e ativar sua conta, use o código abaixo:
              </p>

              <!-- Code Box -->
              <div style="background-color: #0a0a0f; border: 2px solid #c8a834; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <p style="margin: 0 0 8px; color: #8a8a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                  Seu código de verificação
                </p>
                <p style="margin: 0; color: #c8a834; font-size: 36px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>

              <!-- Warning -->
              <div style="background-color: rgba(200, 168, 52, 0.08); border-left: 3px solid #c8a834; border-radius: 0 8px 8px 0; padding: 14px 16px; margin-bottom: 28px;">
                <p style="margin: 0; color: #c8a834; font-size: 12px; font-weight: 600;">
                  ⏱️ Este código expira em 10 minutos.
                </p>
                <p style="margin: 4px 0 0; color: #8a8a9a; font-size: 12px;">
                  Se você não solicitou este cadastro, ignore este e-mail.
                </p>
              </div>

              <p style="margin: 0; color: #5a5a6a; font-size: 13px; line-height: 1.5;">
                Após a verificação, você terá acesso completo para navegar, favoritar e realizar pedidos na nossa loja.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 28px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; color: #4a4a5a; font-size: 11px;">
                © ${new Date().getFullYear()} Imports GR — Todos os direitos reservados.
              </p>
              <p style="margin: 6px 0 0; color: #3a3a4a; font-size: 10px;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send verification email with 6-digit code
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} code - 6-digit verification code (plain text)
 */
const sendVerificationEmail = async (email, name, code) => {
  const transport = getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"Imports GR" <noreply@importsgr.com>';

  if (!transport) {
    // Dev mode: log to console
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('📧 E-MAIL DE VERIFICAÇÃO (MODO DEV)');
    console.log('═══════════════════════════════════════════');
    console.log(`  Para: ${email}`);
    console.log(`  Nome: ${name}`);
    console.log(`  Código: ${code}`);
    console.log('═══════════════════════════════════════════');
    console.log('');
    return { success: true, mode: 'dev' };
  }

  try {
    const info = await transport.sendMail({
      from: fromAddress,
      to: email,
      subject: `${code} — Código de verificação Imports GR`,
      html: getVerificationEmailHTML(name, code),
    });

    console.log(`📧 E-mail de verificação enviado para ${email} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de verificação:', error.message);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
};
