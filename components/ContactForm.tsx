'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { translations } from '@/lib/i18n'

export default function ContactForm() {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en'] ?? translations.cs

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) setStatus('sent')
      else throw new Error('Email not sent')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="w-full scroll-mt-[120px] px-4 max-w-2xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold underline text-center uppercase mb-8">{t.nav.contact}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder={locale === 'cs' ? 'Jméno' : 'Name'}
          value={form.name}
          onChange={handleChange}
          required
          className="p-3 rounded border border-[var(--foreground)]/90"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="p-3 rounded border border-[var(--foreground)]/90"
        />
        <textarea
          name="message"
          placeholder={locale === 'cs' ? 'Zpráva' : 'Message'}
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          className="p-3 rounded border border-[var(--foreground)]/90"
        />
        <button
          type="submit"
          className="relative overflow-hidden self-center px-6 py-2 font-semibold border rounded cursor-pointer text-[var(--foreground)] border-[var(--foreground)] transition-all duration-300 ease-in-out
                     before:absolute before:inset-0 before:translate-y-[-100%] before:bg-[var(--foreground)]
                     hover:before:translate-y-0 before:transition-transform before:duration-300
                     hover:text-[var(--background)]"
          disabled={status === 'sending'}
        >
          <span className="relative z-10">
            {status === 'sending' ? (locale === 'cs' ? 'Odesílání…' : 'Sending…') : (locale === 'cs' ? 'Odeslat' : 'Send')}
          </span>
        </button>
        {status === 'sent' && <p className="text-[var(--link)] text-center">{locale === 'cs' ? 'Zpráva odeslána ✔' : 'Message sent ✔'}</p>}
        {status === 'error' && <p className="text-[var(--link)] text-center">{locale === 'cs' ? 'Chyba při odesílání ✖' : 'Sending failed ✖'}</p>}
      </form>
    </section>
  )
}