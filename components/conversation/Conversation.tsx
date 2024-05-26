'use client'

import { useSocket } from '@/contexts/SocketContext'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Props = {
  conversationId: string
}

type Message = {
  id: string
  body: string
  senderId: string
  conversationId: string
  createdAt: Date
  sender: { name: string }
}

export default function Conversation({ conversationId }: Props) {
  const [input, setInput] = useState('')
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

  const handleClick = async () => {
    const now = new Date()
    let message
    await axios
      .post('/api/message', {
        senderId: currentUser?.id,
        conversationId,
        body: input,
        createdAt: now,
      })
      .then((res) => {
        message = res.data
      })
    socket.emit('send_message', message)
  }

  return (
    <div className="flex flex-col flex-grow h-full justify-between">
      <div className="overflow-y-scroll flex flex-col-reverse">
        <div>
          {messages.map((message) => (
            <div key={message.id}>
              {message.sender.name}님의 메시지:{message.body}
            </div>
          ))}
        </div>
      </div>
      <div>
        <input
          type="text"
          onChange={(e) => {
            setInput(e.target.value)
          }}
          className="h-8"
        />
        <button onClick={handleClick} type="button">
          전송
        </button>
      </div>
    </div>
  )
}
