import nacl from 'tweetnacl'

export type Key = Uint8Array

export interface KeyPair {
  publicKey: Key
  secretKey: Key
}

export interface KeyPairHex {
  publicKey: string
  secretKey: string
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
