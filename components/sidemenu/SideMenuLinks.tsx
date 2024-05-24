'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BsChatFill, BsPeopleFill } from 'react-icons/bs'

export default function SideMenuLinks() {
  const params = useParams()
  const conversationId = params.conversationId ? params.conversationId : ''

  return (
    <div className="flex flex-col text-gray-700 items-center">
      <Link
        href={`/people/${conversationId}`}
        className="rounded-xl p-2 hover:bg-gray-300 hover:shadow-md active:shadow-sm"
      >
        <BsPeopleFill className="text-[28px]" />
      </Link>
      <Link
        href={`/conversations/${conversationId}`}
        className="rounded-xl p-2 hover:bg-gray-300 hover:shadow-md active:shadow-sm"
      >
        <BsChatFill className="text-[28px]" />
      </Link>
    </div>
  )
}
