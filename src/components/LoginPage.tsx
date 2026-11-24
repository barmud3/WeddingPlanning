import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { signInWithGoogle, unauthorized, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ההתחברות נכשלה')
      setBusy(false)
    }
  }

  if (unauthorized) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-3xl text-[var(--leaf-deep)]">אין גישה</p>
        <p className="mt-3 text-[var(--ink-soft)]">
          החשבון הזה לא מורשה לצפות בתקציב החתונה.
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-8 rounded-full bg-[var(--leaf)] px-6 py-3 text-white transition hover:bg-[var(--leaf-deep)]"
        >
          התנתקות
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--gold)]">פרטי · לשניים בלבד</p>
      <h1 className="font-display mt-3 text-5xl text-[var(--leaf-deep)] sm:text-6xl">
        תקציב החתונה
      </h1>
      <p className="mt-4 max-w-sm text-[var(--ink-soft)]">
        מעקב פשוט אחרי הוצאות, תשלומים ויתרות — במקום אחד.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSignIn()}
        className="mt-10 inline-flex items-center gap-3 rounded-full bg-[var(--leaf)] px-7 py-3.5 text-white shadow-[var(--shadow)] transition hover:bg-[var(--leaf-deep)] disabled:opacity-60"
      >
        <GoogleIcon />
        {busy ? 'פותח Google…' : 'התחברות עם Google'}
      </button>
      {error && <p className="mt-4 text-sm text-[var(--blush)]">{error}</p>}
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l.1.1 6.2 5.2C39.2 36.3 44 31 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  )
}
