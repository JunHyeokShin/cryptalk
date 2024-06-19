import nacl from 'tweetnacl'
import forge from 'node-forge'

export type Key = Uint8Array

export interface KeyPair {
  publicKey: Key
  secretKey: Key
}

export interface KeyPairHex {
  publicKey: string
  secretKey: string
}

export interface Header {
  dh: Key
  pn: number
  n: number
}

export function generateKeyPair() {
  return nacl.box.keyPair() as KeyPair
}

export function generateKeyPairs(number: number) {
  let keyPairs: KeyPair[] = []

  for (let i = 0; i < number; i++) {
    keyPairs[i] = generateKeyPair()
  }

  return keyPairs
}

export function keyPairToHex(keyPair: KeyPair) {
  return {
    publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    secretKey: Buffer.from(keyPair.secretKey).toString('hex'),
  } as KeyPairHex
}

export function keyPairFromHex(keyPairHex: KeyPairHex) {
  return {
    publicKey: new Uint8Array(Buffer.from(keyPairHex.publicKey, 'hex')),
    secretKey: new Uint8Array(Buffer.from(keyPairHex.secretKey, 'hex')),
  } as KeyPair
}

export function dh(ratchetKeyPair: KeyPair, remoteRatchetKey: Key) {
  return nacl.scalarMult(
    ratchetKeyPair.secretKey,
    remoteRatchetKey as Uint8Array
  ) as Key
}

export function kdfRootKey(rootKey: Key, dhOut: Key) {
  let hmac = forge.hmac.create()

  hmac.start('sha512', Buffer.from(rootKey).toString('binary'))
  hmac.update(Buffer.from(dhOut).toString('binary'))

  const output = hmac.getMac().getBytes()

  return {
    rootKey: new Uint8Array(Buffer.from(output.slice(0, 32), 'binary')) as Key,
    chainKey: new Uint8Array(
      Buffer.from(output.slice(32, 64), 'binary')
    ) as Key,
  }
}

export function kdfChainKey(chainKey: Key) {
  let hmac = forge.hmac.create()

  hmac.start('sha512', Buffer.from(chainKey).toString('binary'))
  hmac.update('constant')

  const output = hmac.getMac().getBytes()

  return {
    chainKey: new Uint8Array(Buffer.from(output.slice(0, 32), 'binary')) as Key,
    messageKey: new Uint8Array(
      Buffer.from(output.slice(32, 64), 'binary')
    ) as Key,
  }
}

export function encrypt(
  messageKey: Key,
  plaintext: string,
  associatedData: string
) {
  const iv = forge.random.getBytesSync(16)

  let cipher = forge.cipher.createCipher(
    'AES-GCM',
    Buffer.from(messageKey).toString('binary')
  )

  cipher.start({
    iv: iv,
    additionalData: associatedData,
    tagLength: 128,
  })
  cipher.update(forge.util.createBuffer(Buffer.from(plaintext)))
  cipher.finish()

  return {
    ciphertext: cipher.output.toHex(),
    iv: forge.util.bytesToHex(iv),
    tag: cipher.mode.tag.toHex(),
  }
}

export function decrypt(
  messageKey: Key,
  ciphertext: string,
  associatedData: string,
  iv: string,
  tag: string
) {
  let decipher = forge.cipher.createDecipher(
    'AES-GCM',
    Buffer.from(messageKey).toString('binary')
  )

  decipher.start({
    iv: Buffer.from(iv, 'hex').toString('binary'),
    additionalData: associatedData,
    tag: forge.util.createBuffer(Buffer.from(tag, 'hex')),
    tagLength: 128,
  })
  decipher.update(forge.util.createBuffer(Buffer.from(ciphertext, 'hex')))
  let pass = decipher.finish()

  if (pass) {
    return decipher.output.toString()
  } else {
    throw new Error('메시지 복호화 실패')
  }
}

export function makeHeader(
  ratchetKeyPair: KeyPair,
  previousNumber: number,
  number: number
) {
  return {
    dh: ratchetKeyPair.publicKey,
    pn: previousNumber,
    n: number,
  } as Header
}

export function concat(ad: string, header: Header) {
  const headerBytes = forge.util.encodeUtf8(JSON.stringify(header))
  return forge.util.encodeUtf8(ad) + headerBytes
}
