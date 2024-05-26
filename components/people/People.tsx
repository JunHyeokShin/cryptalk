'use client'

import { useEffect, useState } from 'react'
import { BsArrowRepeat, BsPersonCheck, BsPersonPlus } from 'react-icons/bs'
import AddFriendModal from './AddFriendModal'
import FriendRequestsModal from './FriendRequestsModal'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Person from './Person'

type Person = {
  id: string
  name: string
  image: string
}

export default function People() {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [people, setPeople] = useState<Person[]>()
  const session = useSession()
  const currentUser = session.data?.user

  useEffect(() => {
    if (currentUser) {
      axios
        .get(`/api/friend/${currentUser?.id}`)
        .then((res) => {
          setPeople(res.data)
        })
        .catch((error) => {
          toast.error(error.response.data)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [session, refresh])

  function clickAddFriendModal() {
    setShowAddFriendModal(!showAddFriendModal)
  }

  function clickFriendRequestsModal() {
    setShowFriendRequestsModal(!showFriendRequestsModal)
  }

  return (
    <div className="flex flex-col justify-between w-48 px-2 py-3 items-center bg-gray-100">
      <div className="flex flex-col w-full overflow-x-scroll">
        {isLoading ? (
          <div className="text-gray-600 text-center">불러오는 중...</div>
        ) : (
          people?.map((person) => <Person key={person.id} person={person} />)
        )}
      </div>
      <div className="flex w-full justify-around">
        <button
          onClick={() => {
            setIsLoading(true)
            setRefresh(refresh + 1)
          }}
          className="rounded-xl p-2 hover:bg-gray-200 hover:shadow-md active:shadow-sm"
        >
          <BsArrowRepeat className="text-[28px]" />
        </button>
        <div
          className="rounded-xl p-2 hover:bg-gray-200 hover:shadow-md active:shadow-sm cursor-pointer"
          onClick={clickAddFriendModal}
        >
          <BsPersonPlus className="text-[28px]" />
        </div>
        <div
          className="rounded-xl p-2 hover:bg-gray-200 hover:shadow-md active:shadow-sm cursor-pointer"
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
