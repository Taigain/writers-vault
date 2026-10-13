import { sign, createPrivateKey } from 'node:crypto'
import { readFileSync } from 'node:fs'
const days = Number(process.argv[2] ?? 0)
const payload = Buffer.from(JSON.stringify({ t: 'pro', e: days > 0 ? Date.now() + days * 86400000 : 0 }))
const priv = createPrivateKey(readFileSync('keys/license-private.pem', 'utf8'))
const sig = sign(null, payload, priv)
console.log('WV1.' + payload.toString('base64url') + '.' + sig.toString('base64url'))