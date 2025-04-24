import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const data = await resend.emails.send({
        from: process.env.RESEND_FROM || 'noreply@yourdomain.com',
        to: process.env.RESEND_TO || 'you@yourdomain.com',
        subject: `Nová zpráva od ${name}`,
        replyTo: email,
        html: `
          <h2>Zpráva z jikl-coding.com od ${name}</h2>
          <p><strong>Zpráva:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <p><strong>Jméno:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
        `,
      })
      

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Email not sent' }, { status: 500 })
  }
}
