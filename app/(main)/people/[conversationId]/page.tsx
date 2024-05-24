import Conversation from '@/components/conversation/Conversation'

type Props = {
  params: { conversationId: string }
}

export default function ConversationPage({ params }: Props) {
  return <Conversation conversationId={params.conversationId} />
}
