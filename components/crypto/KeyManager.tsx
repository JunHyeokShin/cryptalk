'use client'

import { Session } from 'next-auth'
import { useEffect } from 'react'
import {
  addIDBPreKeyPairs,
  getIDBIdentityKeyPair,
  initIDB,
  updateIDBIdentityKeyPair,
} from '@/libs/indexedDB'
import axios from 'axios'
import {
  KeyPairHex,
  generateKeyPair,
  generateKeyPairs,
  keyPairToHex,
} from '@/libs/crypto'

type Props = {
  session: Session
}

export default function KeyManager({ session }: Props) {
  useEffect(() => {
    initIDB(session.user?.id)

    // 개인 식별 키 관리
    getIDBIdentityKeyPair(session.user?.id).then((data) => {
      if (data) {
        axios.get(`/api/identityKey/${session.user?.id}`).then((res) => {
          if (res.status === 201 || res.data.identityKey !== data.publicKey) {
            axios.post(`/api/identityKey`, {
              id: session.user?.id,
              identityKey: data.publicKey,
            })
          }
        })
      } else {
        console.log('새로운 키 생성 후 서버와 로컬에 업로드')
        const keyPair = generateKeyPair()
        const keyPairHex = keyPairToHex(keyPair)

        axios
          .post(`/api/identityKey`, {
            id: session.user?.id,
            identityKey: keyPairHex.publicKey,
          })
          .then(() => {
            updateIDBIdentityKeyPair(session.user?.id, keyPairHex)
          })
      }
    })

    // 사전 등록 키 관리
    axios
      .get(`/api/numberOfRequiredPreKeys/${session.user?.id}`)
      .then((res) => {
        if (res.data.numberOfRequiredPreKeys > 0) {
          const keyPairs = generateKeyPairs(res.data.numberOfRequiredPreKeys)
          let keyPairsHex: KeyPairHex[] = []
          let preKeys: string[] = []

          keyPairs.forEach((each, index) => {
            keyPairsHex[index] = keyPairToHex(each)
          })
          keyPairsHex.forEach((each, index) => {
            preKeys[index] = each.publicKey
          })

          axios
            .post(`/api/preKeys`, { id: session.user?.id, preKeys })
            .then(() => {
              addIDBPreKeyPairs(session.user?.id, keyPairsHex)
            })
        }
      })
  }, [])

  return null
}
