import { auth } from '@/auth'
import Conversation from '@/components/conversation/Conversation'
import { redirect } from 'next/navigation'

type Props = {
  params: { conversationId: string }
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return (
    <Conversation conversationId={params.conversationId} session={session} />
  )
}
