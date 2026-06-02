import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name)
    private readonly apiKey: string | undefined
    private readonly fromEmail: string
    private readonly fromName: string

    constructor(private readonly config: ConfigService) {
        this.apiKey    = config.get<string>('BREVO_API_KEY')
        this.fromEmail = config.get<string>('EMAIL_FROM_ADDRESS') ?? ''
        this.fromName  = config.get<string>('EMAIL_FROM_NAME')    ?? 'Stagio'
    }

    async send(to: string, subject: string, html: string): Promise<void> {
        if (!this.apiKey || !this.fromEmail) {
            this.logger.warn(`Email not configured — skipping email to ${to}`)
            return
        }
        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender:      { name: this.fromName, email: this.fromEmail },
                    to:          [{ email: to }],
                    subject,
                    htmlContent: html,
                }),
            })
            if (!res.ok) {
                const body = await res.text().catch(() => '')
                this.logger.error(`Brevo error ${res.status}: ${body}`)
            }
        } catch (err) {
            this.logger.error('Failed to send email via Brevo', err)
        }
    }
}

// ── Shared HTML helpers ────────────────────────────────────────────────────

function formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function baseLayout(content: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#1d4ed8;padding:24px 32px">
          <span style="color:#ffffff;font-size:22px;font-weight:700">Stagio</span>
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="background:#f4f4f5;padding:16px 32px;text-align:center;color:#6b7280;font-size:12px">
          © ${new Date().getFullYear()} Stagio — plateforme de stages &amp; emplois
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function buildConfirmationEmail(opts: {
    recipientName: string
    offerTitle: string
    startAt: Date
    endAt: Date
    role: 'student' | 'recruiter'
}): string {
    const who = opts.role === 'student'
        ? 'Le recruteur a proposé ce créneau et vous l\'avez confirmé.'
        : 'Le candidat a confirmé le créneau d\'entretien que vous avez proposé.'

    const content = `
<h2 style="margin:0 0 8px;color:#111827">✅ Entretien confirmé</h2>
<p style="margin:0 0 24px;color:#6b7280">Bonjour ${opts.recipientName},</p>
<p style="margin:0 0 16px;color:#374151">${who}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:8px;margin-bottom:24px">
  <tr><td style="padding:20px">
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1d4ed8">${opts.offerTitle}</p>
    <p style="margin:0 0 4px;color:#374151">📅 ${formatDate(opts.startAt)}</p>
    <p style="margin:0;color:#374151">🕐 ${formatTime(opts.startAt)} – ${formatTime(opts.endAt)}</p>
  </td></tr>
</table>
<p style="margin:0;color:#6b7280;font-size:13px">Retrouvez cet entretien dans votre calendrier Stagio.</p>`

    return baseLayout(content)
}

export function buildReminderEmail(opts: {
    recipientName: string
    offerTitle: string
    startAt: Date
    endAt: Date
    delay: '24h' | '1h'
    role: 'student' | 'recruiter'
}): string {
    const label = opts.delay === '24h' ? 'demain' : 'dans 1 heure'
    const emoji = opts.delay === '24h' ? '⏰' : '🔔'

    const bodyText = opts.role === 'recruiter'
        ? `Un entretien est prévu <strong>${label}</strong>. Pensez à vous y préparer.`
        : `Votre entretien est prévu <strong>${label}</strong>. N'oubliez pas de vous y préparer !`

    const footer = opts.role === 'recruiter'
        ? `Retrouvez cet entretien dans votre calendrier Stagio.`
        : `Bonne chance !`

    const content = `
<h2 style="margin:0 0 8px;color:#111827">${emoji} Rappel d'entretien</h2>
<p style="margin:0 0 24px;color:#6b7280">Bonjour ${opts.recipientName},</p>
<p style="margin:0 0 16px;color:#374151">${bodyText}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border-radius:8px;border-left:4px solid #eab308;margin-bottom:24px">
  <tr><td style="padding:20px">
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#92400e">${opts.offerTitle}</p>
    <p style="margin:0 0 4px;color:#374151">📅 ${formatDate(opts.startAt)}</p>
    <p style="margin:0;color:#374151">🕐 ${formatTime(opts.startAt)} – ${formatTime(opts.endAt)}</p>
  </td></tr>
</table>
<p style="margin:0;color:#6b7280;font-size:13px">${footer}</p>`

    return baseLayout(content)
}
