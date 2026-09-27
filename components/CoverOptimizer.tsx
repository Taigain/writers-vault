'use client'

import { useEffect } from 'react'
import { normalizeCovers } from '@/lib/actions'

export default function CoverOptimizer() {
  useEffect(() => {
    try {
      const KEY = 'wv-covers-norm-v1'
      if (localStorage.getItem(KEY)) return
      localStorage.setItem(KEY, '1')
      void normalizeCovers().catch(() => localStorage.removeItem(KEY))
    } catch {
      /* ignore */
    }
  }, [])
  return null
}