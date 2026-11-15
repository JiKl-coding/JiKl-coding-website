import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const MAX_LENGTH = { name: 100, email: 254, message: 5000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: the hidden "website" field is only filled in by bots — pretend success.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (
    name.length > MAX_LENGTH.name ||
    email.length > MAX_LENGTH.email ||
    message.length > MAX_LENGTH.message ||
    !EMAIL_RE.test(email) ||
    /[\r\n]/.test(name)
  ) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
  }

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

  try {
    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'noreply@yourdomain.com',
        to: process.env.RESEND_TO || 'you@yourdomain.com',
        subject: `Nová zpráva od ${name}`,
        replyTo: email,
        html: `
          <h2>Zpráva z jikl-coding.com od ${safeName}</h2>
          <p><strong>Zpráva:</strong></p>
          <p>${safeMessage}</p>
          <p><strong>Jméno:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
        `,
      })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json({ error: 'Email not sent' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Email not sent' }, { status: 500 })
  }
}
