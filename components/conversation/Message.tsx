'use client'

import clsx from 'clsx'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

type Props = {
  message: {
    id: string
    body: string
    senderId: string
    conversationId: string
    createdAt: Date
    sender: { name: string; image: string }
  }
  prevSender: string | undefined
}

export default function Message({ message, prevSender }: Props) {
  const session = useSession()
  const currentUser = session.data?.user

  const time = new Date(message.createdAt)

  return (
    <div>
      <div
        className={clsx(
          `mb-1.5 items-start gap-2`,
          message.senderId === currentUser?.id
            ? 'flex flex-row-reverse'
            : 'flex'
        )}
      >
        {prevSender !== message.senderId ? (
          <Image
            src={message.sender.image || '/images/default_profile.png'}
            alt="프로필 이미지"
            width={36}
            height={36}
            className="rounded-full shadow-md"
          />
        ) : (
          <div className="w-9 h-9"></div>
        )}
        <div
          className={clsx(
            'flex flex-row items-end max-w-[75%]',
            message.senderId === currentUser?.id ? 'flex-row-reverse' : ''
          )}
        >
          <p
            className={clsx(
              `rounded-xl p-2 shadow-md`,
              message.senderId === currentUser?.id
                ? 'bg-slate-200'
                : 'bg-zinc-200'
            )}
          >
            {message.body}
          </p>
          <p className="text-xs text-gray-700 p-1">
            {('0' + time.getHours()).slice(-2) +
              ':' +
              ('0' + time.getMinutes()).slice(-2)}
          </p>
        </div>
      </div>
    </div>
  )
}
