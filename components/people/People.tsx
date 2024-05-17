'use client'

import { BsPersonCheck, BsPersonPlus } from 'react-icons/bs'
import AddFriendModal from './AddFriendModal'
import FriendRequestsModal from './FriendRequestsModal'
import { useState } from 'react'
import PeopleList from './PeopleList'

export default function People() {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false)
  const clickAddFriendModal = () => setShowAddFriendModal(!showAddFriendModal)
  const clickFriendRequestsModal = () =>
    setShowFriendRequestsModal(!showFriendRequestsModal)

  return (
    <div className="flex flex-col justify-between min-w-36 px-2 py-3 items-center bg-gray-100">
      <div className="flex flex-col">
        <PeopleList />
      </div>
      <div className="flex justify-between">
        <div
          className="rounded-xl p-2 hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
          onClick={clickAddFriendModal}
        >
          <BsPersonPlus className="text-[28px]" />
        </div>
        <div
          className="rounded-xl p-2 hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
          onClick={clickFriendRequestsModal}
        >
          <BsPersonCheck className="text-[28px]" />
        </div>
      </div>
      {showAddFriendModal && (
        <AddFriendModal clickModal={clickAddFriendModal} />
      )}
      {showFriendRequestsModal && (
        <FriendRequestsModal clickModal={clickFriendRequestsModal} />
      )}
    </div>
  )
}
