'use client'

import { useSocket } from '@/contexts/SocketContext'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ConversationBody from './ConversationBody'
import { FieldValues, useForm } from 'react-hook-form'
import { BsSend } from 'react-icons/bs'
import {
  DRState,
  initAlice,
  initBob,
  ratchetDecrypt,
  ratchetEncrypt,
} from '@/libs/double_ratchet'
import { Key, concat, decrypt, dh, keyPairFromHex } from '@/libs/crypto'
import {
  getIDBDrState,
  getIDBIdentityKeyPair,
  getIDBMessageKeyMap,
  getIDBPreKeyPair,
  updateIDBDrState,
  updateIDBMessageKeyMap,
} from '@/libs/indexedDB'
import { Session } from 'next-auth'

type Props = {
  conversationId: string
  session: Session
}

type Conversation = {
  id: string
  isGroup: boolean
  createdAt: Date
  lastMessageAt: Date
  userIds: string[]
}

type Message = {
  id: string
  preKey: string
  body: string
  senderId: string
  conversationId: string
  createdAt: Date
  sender: { name: string; image: string }
}

export default function Conversation({ conversationId, session }: Props) {
  const [info, setInfo] = useState<Conversation>()
  const [messages, setMessages] = useState<Message[]>([])
  const [drState, setDrState] = useState<DRState>()
  const currentUser = session.user
  const socket = useSocket()

  // useEffect(() => {
  //   axios.get(`/api/message/${conversationId}`).then((res) => {
  //     setMessages(res.data.messages)
  //   })
  //   socket.emit('join_conversation', conversationId)
  //   socket.on('receive_message', (message: Message) => {
  //     setMessages((prev) => [...prev, message])
  //   })
  // }, [])

  // const onSubmit = async (data: any) => {
  //   const now = new Date()
  //   let message
  //   await axios
  //     .post('/api/message', {
  //       senderId: currentUser?.id,
  //       conversationId,
  //       body: data.input,
  //       createdAt: now,
  //     })
  //     .then((res) => {
  //       message = res.data
  //     })
  //   socket.emit('send_message', message)
  //   reset()
  // }

  useEffect(() => {
    let state: DRState
    let info: Conversation
    axios.get(`/api/conversation/${conversationId}`).then((res) => {
      setInfo(res.data)
      info = res.data
    })
    getIDBDrState(currentUser?.id, conversationId).then((data) => {
      if (data) {
        setDrState(data)
        state = data
      }
    })
    axios.get(`/api/message/${conversationId}`).then(async (res) => {
      if (res.data.messages.length > 0) {
        let newMessages
        if (state) {
          const keyMap = new Map(
            await getIDBMessageKeyMap(currentUser?.id, conversationId)
          )
          let numberOfOldMessage = 0
          res.data.messages.forEach((each: Message, index: number) => {
            if (keyMap.has(each.id)) {
              const messageKey: Key = keyMap.get(each.id) as Key
              const body = JSON.parse(each.body)
              const plaintext = decrypt(
                messageKey,
                body.encryptResult.ciphertext,
                concat(conversationId, body.header),
                body.encryptResult.iv,
                body.encryptResult.tag
              )
              each.body = plaintext
              setMessages((prev) => [...prev, each])
              numberOfOldMessage = index + 1
            }
          })
          if (res.data.messages.length > numberOfOldMessage) {
            newMessages = res.data.messages.splice(numberOfOldMessage)
          }
        } else {
          // bob 상태 초기화
          // 1. 세션키 계산
          const remoteUserId =
            info?.userIds[0] !== currentUser?.id
              ? info?.userIds[0]
              : info?.userIds[1]
          const res1 = await axios.get(`/api/identityKey/${remoteUserId}`)
          const remoteIdentityKey = new Uint8Array(
            Buffer.from(res1.data.identityKey, 'hex')
          )
          const identityKeyPair = keyPairFromHex(
            await getIDBIdentityKeyPair(currentUser?.id)
          )
          const sessionKey = dh(identityKeyPair, remoteIdentityKey)
          console.log('세션키: ', Buffer.from(sessionKey).toString('hex'))
          // 2. alice가 사용한 내 preKey 가져오고 Bob으로 DR 상태 초기화
          const usedPreKeyPair = keyPairFromHex(
            await getIDBPreKeyPair(currentUser?.id, res.data.messages[0].preKey)
          ) // 이 preKey를 삭제도 해야함
          let newState = initBob(sessionKey, usedPreKeyPair)
          setDrState(newState)
          state = newState
          updateIDBDrState(currentUser?.id, conversationId, newState)
          newMessages = res.data.messages
        }
        if (newMessages) {
          newMessages.forEach((each: Message) => {
            let body = JSON.parse(each.body)

            body.header.dh = new Uint8Array(Object.values(body.header.dh))
            const {
              state: newState,
              messageKey,
              plaintext,
            } = ratchetDecrypt(
              state,
              body.header,
              body.encryptResult.ciphertext,
              body.encryptResult.iv,
              body.encryptResult.tag,
              conversationId
            )
            each.body = plaintext ? plaintext : '복호화 실패'
            setMessages((prev) => [...prev, each])
            updateIDBMessageKeyMap(
              currentUser?.id,
              conversationId,
              each.id,
              messageKey
            )
            setDrState(newState)
            state = newState
            updateIDBDrState(currentUser?.id, conversationId, newState)
          })
        }
      }
    })
    socket.emit('join_conversation', conversationId)
    socket.on('receive_message', async (message: Message) => {
      let state: DRState = await getIDBDrState(currentUser?.id, conversationId)
      if (!state) {
        const remoteUserId =
          info?.userIds[0] !== currentUser?.id
            ? info?.userIds[0]
            : info?.userIds[1]
        const res = await axios.get(`/api/identityKey/${remoteUserId}`)
        const remoteIdentityKey = new Uint8Array(
          Buffer.from(res.data.identityKey, 'hex')
        )
        const identityKeyPair = keyPairFromHex(
          await getIDBIdentityKeyPair(currentUser?.id)
        )
        const sessionKey = dh(identityKeyPair, remoteIdentityKey)
        console.log('세션키: ', Buffer.from(sessionKey).toString('hex'))
        const usedPreKeyPair = keyPairFromHex(
          await getIDBPreKeyPair(currentUser?.id, message.preKey)
        )
        state = initBob(sessionKey, usedPreKeyPair)
      }
      let body = JSON.parse(message.body)
      if (message.senderId === currentUser?.id) {
        const keyMap = new Map(
          await getIDBMessageKeyMap(currentUser?.id, conversationId)
        )
        const messageKey: Key = keyMap.get(message.id) as Key
        const plaintext = decrypt(
          messageKey,
          body.encryptResult.ciphertext,
          concat(conversationId, body.header),
          body.encryptResult.iv,
          body.encryptResult.tag
        )
        message.body = plaintext
        setMessages((prev) => [...prev, message])
      } else {
        body.header.dh = new Uint8Array(Object.values(body.header.dh))

        const {
          state: newState,
          messageKey,
          plaintext,
        } = ratchetDecrypt(
          state,
          body.header,
          body.encryptResult.ciphertext,
          body.encryptResult.iv,
          body.encryptResult.tag,
          conversationId
        )
        message.body = plaintext ? plaintext : '복호화 실패'
        setMessages((prev) => [...prev, message])
        updateIDBMessageKeyMap(
          currentUser?.id,
          conversationId,
          message.id,
          messageKey
        )
        setDrState(newState)
        updateIDBDrState(currentUser?.id, conversationId, newState)
      }
    })
  }, [])

  const onSubmit = async (data: any) => {
    const now = new Date()
    let message: Message
    if (!drState) {
      const remoteUserId =
        info?.userIds[0] !== currentUser?.id
          ? info?.userIds[0]
          : info?.userIds[1]

      const res = await axios.get(`/api/identityKey/${remoteUserId}`)
      const remoteIdentityKey = new Uint8Array(
        Buffer.from(res.data.identityKey, 'hex')
      )
      const identityKeyPair = keyPairFromHex(
        await getIDBIdentityKeyPair(currentUser?.id)
      )
      const sessionKey = dh(identityKeyPair, remoteIdentityKey)
      console.log('세션키: ', Buffer.from(sessionKey).toString('hex'))
      const res2 = await axios.get(`/api/preKeys/${remoteUserId}`)
      const remoteRatchetKey = new Uint8Array(
        Buffer.from(res2.data.preKey, 'hex')
      )
      try {
        const {
          state: newState,
          messageKey,
          header,
          encryptResult,
        } = ratchetEncrypt(
          initAlice(sessionKey, remoteRatchetKey),
          data.input,
          conversationId
        )
        setDrState(newState)
        updateIDBDrState(currentUser?.id, conversationId, newState)
        const body = JSON.stringify({ header, encryptResult })
        axios
          .post('/api/message', {
            senderId: currentUser?.id,
            preKey: Buffer.from(remoteRatchetKey).toString('hex'),
            conversationId,
            body,
            createdAt: now,
          })
          .then((res) => {
            message = res.data
            updateIDBMessageKeyMap(
              currentUser?.id,
              conversationId,
              message.id,
              messageKey
            )
            socket.emit('send_message', message)
          })
        reset()
      } catch (error) {
        console.log('암호화 오류')
      }
    } else {
      try {
        const {
          state: newState,
          messageKey,
          header,
          encryptResult,
        } = ratchetEncrypt(drState, data.input, conversationId)
        setDrState(newState)
        updateIDBDrState(currentUser?.id, conversationId, newState)
        const body = JSON.stringify({ header, encryptResult })
        axios
          .post('/api/message', {
            senderId: currentUser?.id,
            conversationId,
            body,
            createdAt: now,
          })
          .then((res) => {
            message = res.data
            updateIDBMessageKeyMap(
              currentUser?.id,
              conversationId,
              message.id,
              messageKey
            )
            socket.emit('send_message', message)
          })
        reset()
      } catch (error) {
        console.log('암호화 오류')
      }
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      input: '',
    },
  })

  return (
    <div className="flex flex-col flex-grow h-full justify-between">
      <div className="overflow-y-scroll flex flex-col-reverse">
        <ConversationBody messages={messages} />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center border-t border-gray-100 min-h-16"
      >
        <input
          id="input"
          type="text"
          {...register('input')}
          required={true}
          autoComplete="off"
          placeholder="메시지를 입력하세요..."
          className="bg-gray-100 rounded-full px-4 m-2 w-full h-11 shadow-inner"
        />
        <button
          type="submit"
          className="rounded-xl p-2 mr-2 hover:bg-gray-300 hover:shadow-md active:shadow-sm"
        >
          <BsSend className="text-[28px]" />
        </button>
      </form>
    </div>
  )
}
