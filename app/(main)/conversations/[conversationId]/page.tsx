type Props = {
  params: { conversationId: string }
}

export default function ConversationPage({ params }: Props) {
  return (
    <div>
      <p>{params.conversationId}</p>
    </div>
  )
}
