'use client'

import Script from 'next/script'
import { useSyncExternalStore } from 'react'

// Same key + values as the former @jikl/lib CookieBar, so existing visitors keep their choice.
const KEY = 'cookie_consent' // "true" | "false"

// Consent store backed by localStorage (+ in-memory fallback for private mode)
const listeners = new Set<() => void>()
let memoryConsent: string | null = null

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => {
  try {
    return localStorage.getItem(KEY) ?? memoryConsent
  } catch {
    return memoryConsent
  }
}

const getServerSnapshot = () => undefined // undefined = not known yet (server + hydration)

type Props = {
  gaId: string
  labels: { message: string; accept: string; deny: string }
}

/** Cookie consent bar + Google Analytics. GA is loaded only after the visitor accepts. */
export function Analytics({ gaId, labels }: Props) {
  const consent = useSyncExternalStore<string | null | undefined>(subscribe, getSnapshot, getServerSnapshot)

  const choose = (value: 'true' | 'false') => {
    memoryConsent = value
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* private mode */
    }
    listeners.forEach((listener) => listener())
  }

  if (!gaId) return null

  return (
    <>
      {consent === 'true' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}

      {consent !== undefined && consent !== 'true' && consent !== 'false' && (
        <div className="fixed bottom-0 inset-x-0 w-full min-h-[80px] p-4 z-50 flex items-center justify-between shadow-md bg-[var(--cookies)] text-[var(--foreground)] border-t border-[var(--link)]">
          <p className="px-2 sm:text-base text-xs">{labels.message}</p>
          <div className="flex justify-center justify-end items-center flex-wrap gap-2 px-2 sm:text-sm text-xs">
            <button
              type="button"
              onClick={() => choose('true')}
              className="cursor-pointer p-2 min-w-[90px] rounded-md bg-[var(--link)] border border-[var(--link)] text-[var(--background)] before:duration-300 hover:text-[var(--background)] hover:border-[var(--foreground)] hover:bg-[var(--foreground)]"
            >
              {labels.accept}
            </button>
            <button
              type="button"
              onClick={() => choose('false')}
              className="cursor-pointer p-2 min-w-[90px] rounded-md bg-[var(--background)] border border-[var(--foreground)] text-[var(--foreground)] before:duration-300 hover:text-[var(--background)] hover:border-[var(--background)] hover:bg-[var(--foreground)]"
            >
              {labels.deny}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
