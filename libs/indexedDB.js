export function initIDB(id) {
  const request = window.indexedDB.open(id, 1)

  request.onupgradeneeded = (event) => {
    const db = event.target.result
    db.createObjectStore('identityKey', { keyPath: 'id' })
    db.createObjectStore('preKeys', { keyPath: 'publicKey' })
  }
}

export function updateIDBIdentityKeyPair(id, keyPairHex) {
  const request = window.indexedDB.open(id, 1)

  request.onsuccess = (event) => {
    const db = event.target.result
    const store = db
      .transaction('identityKey', 'readwrite')
      .objectStore('identityKey')
    store.put({
      publicKey: keyPairHex.publicKey,
      secretKey: keyPairHex.secretKey,
      id,
    })
  }
}

export function getIDBIdentityKeyPair(id) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(id, 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      const store = db
        .transaction('identityKey', 'readwrite')
        .objectStore('identityKey')
      const getRequest = store.get(id)

      getRequest.onsuccess = (event) => {
        if (event.target.result) {
          resolve({
            publicKey: event.target.result.publicKey,
            secretKey: event.target.result.secretKey,
          })
        } else {
          resolve(undefined)
        }
      }
    }
  })
}

export function addIDBPreKeyPairs(id, keyPairsHex) {
  const request = window.indexedDB.open(id, 1)

  request.onsuccess = (event) => {
    const db = event.target.result
    const store = db.transaction('preKeys', 'readwrite').objectStore('preKeys')
    keyPairsHex.forEach((each) => {
      store.add({ publicKey: each.publicKey, secretKey: each.secretKey })
    })
  }
}
