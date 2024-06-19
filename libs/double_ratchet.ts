import {
  Header,
  Key,
  KeyPair,
  concat,
  decrypt,
  dh,
  encrypt,
  generateKeyPair,
  kdfChainKey,
  kdfRootKey,
  makeHeader,
} from './crypto'

const MAX_SKIP = 8

export interface DRState {
  ratchetKeyPair: KeyPair
  remoteRatchetKey?: Key
  rootKey: Key
  sendingChainKey?: Key
  receivingChainKey?: Key
  numberOfSending: number
  numberOfReceiving: number
  previousNumber: number
  skippedMessageKeys: Map<object, Key>
}

export function initAlice(sessionKey: Key, remoteRatchetKey: Key) {
  const ratchetKeyPair = generateKeyPair()
  const { rootKey, chainKey } = kdfRootKey(
    sessionKey,
    dh(ratchetKeyPair, remoteRatchetKey)
  )
  const sendingChainKey = chainKey
  const numberOfSending = 0
  const numberOfReceiving = 0
  const previousNumber = 0
  const skippedMessageKeys = new Map<object, Key>()
  console.log('Alice 상태 초기화 완료')
  return {
    ratchetKeyPair,
    remoteRatchetKey,
    rootKey,
    sendingChainKey,
    receivingChainKey: undefined,
    numberOfSending,
    numberOfReceiving,
    previousNumber,
    skippedMessageKeys,
  } as DRState
}

export function initBob(sessionKey: Key, ratchetKeyPair: KeyPair) {
  const rootKey = sessionKey
  const numberOfSending = 0
  const numberOfReceiving = 0
  const previousNumber = 0
  const skippedMessageKeys = new Map<object, Key>()
  console.log('Bob 상태 초기화 완료')
  return {
    ratchetKeyPair,
    remoteRatchetKey: undefined,
    rootKey,
    sendingChainKey: undefined,
    receivingChainKey: undefined,
    numberOfSending,
    numberOfReceiving,
    previousNumber,
    skippedMessageKeys,
  } as DRState
}

export function ratchetEncrypt(state: DRState, plaintext: string, ad: string) {
  if (!state.sendingChainKey) {
    throw new Error('암호화 오류')
  }
  const kdfResult = kdfChainKey(state.sendingChainKey)
  state.sendingChainKey = kdfResult.chainKey
  const messageKey = kdfResult.messageKey

  const header = makeHeader(
    state.ratchetKeyPair,
    state.previousNumber,
    state.numberOfSending
  )
  state.numberOfSending++
  const encryptResult = encrypt(messageKey, plaintext, concat(ad, header))
  return { state, messageKey, header, encryptResult }
}

export function ratchetDecrypt(
  state: DRState,
  header: Header,
  ciphertext: string,
  iv: string,
  tag: string,
  ad: string
) {
  const { state1, plaintext } = trySkippedMessageKeys(
    state,
    header,
    ciphertext,
    iv,
    tag,
    ad
  )
  state = state1
  if (plaintext) {
    return { state, plaintext }
  }
  if (
    !state.remoteRatchetKey ||
    Buffer.compare(header.dh, state.remoteRatchetKey) !== 0
  ) {
    state = skipMessageKeys(state, header.n)
    state = dhRatchet(state, header)
  }
  state = skipMessageKeys(state, header.n)
  if (state.receivingChainKey) {
    const kdfResult = kdfChainKey(state.receivingChainKey)
    state.receivingChainKey = kdfResult.chainKey
    const messageKey = kdfResult.messageKey
    state.numberOfReceiving++
    return {
      state,
      messageKey,
      plaintext: decrypt(messageKey, ciphertext, concat(ad, header), iv, tag),
    }
  } else {
    return { state, plaintext: undefined }
  }
}

function trySkippedMessageKeys(
  state: DRState,
  header: Header,
  ciphertext: string,
  iv: string,
  tag: string,
  ad: string
) {
  if (
    state.skippedMessageKeys.has({
      remoteRatchetKey: header.dh,
      numberOfReceiving: header.n,
    })
  ) {
    const messageKey = state.skippedMessageKeys.get({
      remoteRatchetKey: header.dh,
      numberOfReceiving: header.n,
    })
    if (!messageKey) {
      return { state1: state, plaintext: undefined }
    }
    state.skippedMessageKeys.delete({
      remoteRatchetKey: header.dh,
      numberOfReceiving: header.n,
    })
    return {
      state1: state,
      plaintext: decrypt(messageKey, ciphertext, concat(ad, header), iv, tag),
    }
  } else {
    return { state1: state, plaintext: undefined }
  }
}

function skipMessageKeys(state: DRState, until: number) {
  if (state.numberOfReceiving + MAX_SKIP < until) {
    return state
  }
  if (state.receivingChainKey) {
    while (state.numberOfReceiving < until) {
      const kdfResult = kdfChainKey(state.receivingChainKey)
      state.receivingChainKey = kdfResult.chainKey
      const messageKey = kdfResult.messageKey
      state.skippedMessageKeys.set(
        {
          remoteRatchetKey: state.remoteRatchetKey,
          numberOfReceiving: state.numberOfReceiving,
        },
        messageKey
      )
      state.numberOfReceiving++
    }
    return state
  }
  return state
}

function dhRatchet(state: DRState, header: Header) {
  state.previousNumber = state.numberOfSending
  state.numberOfSending = 0
  state.numberOfReceiving = 0
  state.remoteRatchetKey = header.dh
  let kdfResult = kdfRootKey(
    state.rootKey,
    dh(state.ratchetKeyPair, state.remoteRatchetKey as Uint8Array)
  )
  state.rootKey = kdfResult.rootKey
  state.receivingChainKey = kdfResult.chainKey
  state.ratchetKeyPair = generateKeyPair()
  kdfResult = kdfRootKey(
    state.rootKey,
    dh(state.ratchetKeyPair, state.remoteRatchetKey)
  )
  state.rootKey = kdfResult.rootKey
  state.sendingChainKey = kdfResult.chainKey
  return state
}
