export function initIDB(id) {
  const request = window.indexedDB.open(id, 1)

  request.onupgradeneeded = (event) => {
    const db = event.target.result
    db.createObjectStore('identityKey', { keyPath: 'id' })
    db.createObjectStore('preKeys', { keyPath: 'publicKey' })
    db.createObjectStore('doubleRatchets', { keyPath: 'conversationId' })
    db.createObjectStore('messageKeyMaps', { keyPath: 'conversationId' })
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

export function getIDBPreKeyPair(id, preKeyHex) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(id, 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      const store = db
        .transaction('preKeys', 'readwrite')
        .objectStore('preKeys')
      const getRequest = store.get(preKeyHex)

      getRequest.onsuccess = (event) => {
        if (event.target.result) {
          store.delete(preKeyHex)
          resolve(event.target.result)
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

export function getIDBDrState(id, conversationId) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(id, 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      const store = db
        .transaction('doubleRatchets', 'readwrite')
        .objectStore('doubleRatchets')
      const getRequest = store.get(conversationId)

      getRequest.onsuccess = (event) => {
        if (event.target.result) {
          resolve(event.target.result.drState)
        } else {
          resolve(undefined)
        }
      }
    }
  })
}

export function updateIDBDrState(id, conversationId, drState) {
  const request = window.indexedDB.open(id, 1)

  request.onsuccess = (event) => {
    const db = event.target.result
    const store = db
      .transaction('doubleRatchets', 'readwrite')
      .objectStore('doubleRatchets')
    store.put({ conversationId, drState: drState })
  }
}

export function getIDBMessageKeyMap(id, conversationId) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(id, 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      const store = db
        .transaction('messageKeyMaps', 'readwrite')
        .objectStore('messageKeyMaps')
      const getRequest = store.get(conversationId)

      getRequest.onsuccess = (event) => {
        if (event.target.result) {
          resolve(event.target.result.keyMap)
        } else {
          resolve(undefined)
        }
      }
    }
  })
}

export function updateIDBMessageKeyMap(
  id,
  conversationId,
  messageId,
  messageKey
) {
  const request = window.indexedDB.open(id, 1)

  request.onsuccess = (event) => {
    const db = event.target.result
    const store = db
      .transaction('messageKeyMaps', 'readwrite')
      .objectStore('messageKeyMaps')
    const getRequest = store.get(conversationId)

    getRequest.onsuccess = (event) => {
      if (event.target.result) {
        let keyMap = new Map(event.target.result.keyMap)
        keyMap.set(messageId, messageKey)

        store.put({ conversationId, keyMap })
      } else {
        let keyMap = new Map()
        keyMap.set(messageId, messageKey)

        store.put({ conversationId, keyMap })
      }
    }
  }
}
