import 'server-only';

import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Falta RESEND_API_KEY para enviar correos.');
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

type SendInvitationEmailParams = {
  to: string;
  invitationUrl: string;
  invitedBy?: string;
};

export async function sendInvitationEmail({
  to,
  invitationUrl,
  invitedBy,
}: SendInvitationEmailParams) {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error('Falta RESEND_FROM_EMAIL para enviar correos.');
  }

  const sender = invitedBy ? `${invitedBy} via Ferretería Moncasa` : 'Ferretería Moncasa';

  return getResendClient().emails.send({
    from,
    to,
    subject: 'Tu invitación para acceder al panel de Moncasa',
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; background: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px;">
          <p style="margin: 0 0 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; color: #f59e0b; text-transform: uppercase;">Ferretería Moncasa</p>
          <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">Tienes acceso al panel administrativo</h1>
          <p style="margin: 0 0 16px; font-size: 16px; color: #334155;">${sender} te ha invitado a administrar el sitio. Usa el siguiente enlace para aceptar la invitación y completar tu acceso.</p>
          <p style="margin: 0 0 24px;"><a href="${invitationUrl}" style="display: inline-block; background: #f59e0b; color: #0f172a; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 700;">Aceptar invitación</a></p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="margin: 0; font-size: 14px; word-break: break-all; color: #2563eb;">${invitationUrl}</p>
          <p style="margin: 24px 0 0; font-size: 13px; color: #64748b;">Si no esperabas este correo, puedes ignorarlo con seguridad.</p>
        </div>
      </div>
    `,
    text: [
      'Ferretería Moncasa',
      '',
      'Tienes acceso al panel administrativo.',
      `${sender} te ha invitado a administrar el sitio.`,
      '',
      `Aceptar invitación: ${invitationUrl}`,
      '',
      'Si no esperabas este correo, puedes ignorarlo con seguridad.',
    ].join('\n'),
  });
}