'use client'

import { useSocket } from '@/contexts/SocketContext'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

type Props = {
  person: {
    id: string
    name: string
    image: string
  }
}

export default function Person({ person }: Props) {
  const params = useParams()
  const session = useSession()
  const router = useRouter()
  const currentUser = session.data?.user
  const socket = useSocket()

  const handleClick = () => {
    axios
      .get(`/api/conversation/${currentUser?.id}/${person.id}`)
      .then((res) => {
        if (
          params.conversationId &&
          res.data.conversationId !== params.conversationId
        ) {
          socket.emit('leave_conversation', params.conversationId)
        }
        router.push(`/people/${res.data.conversationId}`)
      })
  }

  return (
    <button
      className="flex items-center w-full p-2 rounded-full hover:bg-gray-200 hover:shadow-md active:shadow-sm hover:cursor-pointer"
      type="button"
      onClick={handleClick}
    >
      <Image
        src={person.image || '/images/default_profile.png'}
        alt="프로필 이미지"
        width={36}
        height={36}
        className="rounded-full mr-2"
      />
      <p className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {person.name}
      </p>
    </button>
  )
}
