/** Replace these with your two Google account emails. Must match supabase/schema.sql */
export const ALLOWED_EMAILS = [
  'barmud9798@gmail.com',
  'inbirbir@gmail.com',
] as const

export function isAllowedEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return (ALLOWED_EMAILS as readonly string[]).includes(email.toLowerCase())
}
