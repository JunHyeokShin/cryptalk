'use client'

import { useSocket } from '@/contexts/SocketContext'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ConversationBody from './ConversationBody'
import { FieldValues, useForm } from 'react-hook-form'
import { BsSend } from 'react-icons/bs'

type Props = {
  conversationId: string
}

type Message = {
  id: string
  body: string
  senderId: string
  conversationId: string
  createdAt: Date
  sender: { name: string; image: string }
}

export default function Conversation({ conversationId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const session = useSession()
  const currentUser = session.data?.user
  const socket = useSocket()

  useEffect(() => {
    axios.get(`/api/message/${conversationId}`).then((res) => {
      setMessages(res.data.messages)
    })
    socket.emit('join_conversation', conversationId)
    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message])
    })
  }, [])

  const onSubmit = async (data: any) => {
    const now = new Date()
    let message
    await axios
      .post('/api/message', {
        senderId: currentUser?.id,
        conversationId,
        body: data.input,
        createdAt: now,
      })
      .then((res) => {
        message = res.data
      })
    socket.emit('send_message', message)
    reset()
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
