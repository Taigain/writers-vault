import { generateKeyPairSync } from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
const { publicKey, privateKey } = generateKeyPairSync('ed25519')
const pubDer = publicKey.export({ type: 'spki', format: 'der' })
mkdirSync('keys', { recursive: true })
writeFileSync('keys/license-private.pem', privateKey.export({ type: 'pkcs8', format: 'pem' }).toString())
console.log('LICENSE_PUB_B64 =', pubDer.toString('base64'))