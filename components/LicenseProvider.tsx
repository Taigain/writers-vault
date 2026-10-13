'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getLicenseState } from '@/lib/licenseActions'
import type { LicenseState } from '@/lib/license'
import { premiumShown, type PremiumKey } from '@/lib/premium'
import LicenseDialog from './LicenseDialog'

type Ctx = {
  state: LicenseState
  refresh: () => Promise<void>
  open: () => void
}

const LicenseCtx = createContext<Ctx | null>(null)

export function useLicense(): Ctx {
  const c = useContext(LicenseCtx)
  if (!c) throw new Error('LicenseProvider missing')
  return c
}

export function usePremium(key: PremiumKey) {
  const { state, open } = useLicense()
  const shown = premiumShown(key)
  return { shown, unlocked: shown && state.isPro, open }
}

export default function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LicenseState>({
    isPro: false,
    source: null,
    expiresAt: null,
    trialAvailable: true,
  })
  const [openDlg, setOpenDlg] = useState(false)
  const refresh = useCallback(async () => {
    try {
      setState(await getLicenseState())
    } catch {
      /* ignore */
    }
  }, [])
  useEffect(() => {
    void refresh()
  }, [refresh])
  return (
    <LicenseCtx.Provider value={{ state, refresh, open: () => setOpenDlg(true) }}>
      {children}
      {openDlg && (
        <LicenseDialog
          onClose={() => {
            setOpenDlg(false)
            void refresh()
          }}
        />
      )}
    </LicenseCtx.Provider>
  )
}