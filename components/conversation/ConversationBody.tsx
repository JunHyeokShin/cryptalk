import Message from './Message'

type Props = {
  messages: {
    id: string
    body: string
    senderId: string
    conversationId: string
    createdAt: Date
    sender: { name: string; image: string }
  }[]
}

export default function ConversationBody({ messages }: Props) {
  return (
    <div className="px-2 py-3">
      {messages.map((message, index) => (
        <Message
          message={message}
          key={message.id}
          prevSender={index > 0 ? messages[index - 1].senderId : undefined}
        />
      ))}
    </div>
  )
}
