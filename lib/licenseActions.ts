'use server'

import { prisma, schemaReady } from './prisma'
import { computeState, verifyLicenseKey, type LicenseState } from './license'

async function row() {
  await schemaReady
  const r = await prisma.license.findUnique({ where: { id: 'local' } })
  if (r) return r
  return prisma.license.create({ data: { id: 'local' } })
}

export async function getLicenseState(): Promise<LicenseState> {
  return computeState(await row())
}

export async function activateTrial(): Promise<{ ok: true } | { ok: false; error: 'used' }> {
  const r = await row()
  if (r.trialUsedAt) return { ok: false, error: 'used' }
  await prisma.license.update({
    where: { id: 'local' },
    data: { trialUsedAt: new Date(), proUntil: new Date(Date.now() + 14 * 86400000) },
  })
  return { ok: true }
}

export async function activateKey(keyText: string): Promise<{ ok: true } | { ok: false; error: 'bad' }> {
  const payload = verifyLicenseKey(keyText.trim())
  if (!payload) return { ok: false, error: 'bad' }
  await prisma.license.update({ where: { id: 'local' }, data: { keyText: keyText.trim(), proUntil: null } })
  return { ok: true }
}

export async function dropKey(): Promise<{ ok: true }> {
  await prisma.license.update({ where: { id: 'local' }, data: { keyText: '', proUntil: null } })
  return { ok: true }
}