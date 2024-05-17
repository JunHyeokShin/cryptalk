import Conversations from '@/components/conversations/Conversations'

type Props = {
  children: React.ReactNode
}

export default function ConversationsLayout({ children }: Props) {
  return (
    <div className="flex">
      <Conversations />
      <div>{children}</div>
    </div>
  )
}
