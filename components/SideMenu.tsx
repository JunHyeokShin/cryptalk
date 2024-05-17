'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { BsBoxArrowLeft, BsChatFill, BsPeopleFill } from 'react-icons/bs'

export default function SideMenu() {
  const session = useSession()
  const router = useRouter()
  const params = useParams()
  const conversationId = params.conversationId ? params.conversationId : ''

  const handleClick = () => {
    signOut({ redirect: false })
  }

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      router.push('/')
      toast.success('로그아웃되었습니다.')
    }
  }, [session.status])

  return (
    <div className="flex flex-col justify-between bg-gray-200 px-2 py-3 shadow">
      <div className="flex flex-col text-gray-700">
        <Link
          href={`/people/${conversationId}`}
          className="rounded-xl p-2 hover:bg-gray-300 active:bg-gray-400"
        >
          <BsPeopleFill className="text-[28px]" />
        </Link>
        <Link
          href={`/conversations/${conversationId}`}
          className="rounded-xl p-2 hover:bg-gray-300 active:bg-gray-400"
        >
          <BsChatFill className="text-[28px]" />
        </Link>
      </div>
      <div className="flex">
        <button
          onClick={handleClick}
          className="rounded-xl p-2 hover:bg-gray-300 active:bg-gray-400"
        >
          <BsBoxArrowLeft className="text-[28px]" />
        </button>
      </div>
    </div>
  )
}
