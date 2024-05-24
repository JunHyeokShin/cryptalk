'use client'

import { useSocket } from '@/contexts/SocketContext'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Props = {
  conversationId: string
}

type Message = {
  body: string
  sender: string | null | undefined
  conversationId: string
  createdAt: Date
}

export default function Conversation({ conversationId }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const session = useSession()
  const currentUser = session.data?.user
  const socket = useSocket()

  useEffect(() => {
    socket.emit('join_conversation', conversationId)
    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message])
    })
  }, [])

  const handleClick = () => {
    const message: Message = {
      body: input,
      sender: currentUser?.name,
      conversationId,
      createdAt: new Date(),
    }
    socket.emit('send_message', message)
  }

  return (
    <div>
      {messages.map((message) => (
        <div>
          {message.sender}님의 메시지:{message.body}
        </div>
      ))}
      <input
        type="text"
        onChange={(e) => {
          setInput(e.target.value)
        }}
      />
      <button onClick={handleClick} type="button">
        전송
      </button>
    </div>
  )
}
