'use client'

import { Session } from 'next-auth'
import Image from 'next/image'
import { useState } from 'react'
import ProfileModal from './ProfileModal'

type Props = {
  session: Session | null
}

export default function ProfileButton({ session }: Props) {
  const [showProfileModal, setShowProfileModal] = useState(false)

  function clickProfileModal() {
    setShowProfileModal(!showProfileModal)
  }

  return (
    <div>
      <button
        onClick={clickProfileModal}
        className="p-1 rounded-full hover:opacity-90 hover:bg-gray-300 hover:shadow-md active:shadow-sm"
      >
        <Image
          src={session?.user?.image || '/images/default_profile.png'}
          width={36}
          height={36}
          alt="profile"
          className="rounded-full"
        />
      </button>
      {showProfileModal && (
        <ProfileModal clickModal={clickProfileModal} session={session} />
      )}
    </div>
  )
}
