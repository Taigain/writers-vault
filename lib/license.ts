import { createPublicKey, verify as cryptoVerify } from 'node:crypto'

export const LICENSE_PUB_B64 = 'MCowBQYDK2VwAyEAD25klAY1hV7glvH1/6CKdMJTi01TqKXakJygJyl1r2k='

export type LicenseState = {
  isPro: boolean
  source: 'key' | 'trial' | null
  expiresAt: string | null
  trialAvailable: boolean
}

export function verifyLicenseKey(text: string): { t: string; e: number } | null {
  try {
    const parts = text.split('.')
    if (parts.length !== 3 || parts[0] !== 'WV1') return null
    const payload = Buffer.from(parts[1], 'base64url')
    const sig = Buffer.from(parts[2], 'base64url')
    const pub = createPublicKey({ key: Buffer.from(LICENSE_PUB_B64, 'base64'), format: 'der', type: 'spki' })
    if (!cryptoVerify(null, payload, pub, sig)) return null
    const obj = JSON.parse(payload.toString('utf8')) as { t?: string; e?: number }
    if (obj.t !== 'pro') return null
    return { t: 'pro', e: typeof obj.e === 'number' ? obj.e : 0 }
  } catch {
    return null
  }
}

export function computeState(r: { keyText: string; proUntil: Date | null; trialUsedAt: Date | null }): LicenseState {
  const now = Date.now()
  const key = r.keyText ? verifyLicenseKey(r.keyText) : null
  const keyPro = Boolean(key && (key.e === 0 || key.e > now))
  const trialPro = Boolean(r.proUntil && r.proUntil.getTime() > now)
  const isPro = keyPro || trialPro
  return {
    isPro,
    source: keyPro ? 'key' : trialPro ? 'trial' : null,
    expiresAt: keyPro
      ? key!.e === 0
        ? null
        : new Date(key!.e).toISOString()
      : trialPro && r.proUntil
        ? r.proUntil.toISOString()
        : null,
    trialAvailable: r.trialUsedAt == null,
  }
}