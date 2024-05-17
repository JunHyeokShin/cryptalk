'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BsArrowRepeat, BsCheck, BsX } from 'react-icons/bs'

type Props = {
  clickModal: () => void
}

type FriendRequesters = {
  username: string
  email: string
  image: string | null
}[]

type Response = 'ACCEPT' | 'DECLINE'

export default function FriendRequestsModal({ clickModal }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [friendRequesters, setFriendRequesters] = useState<FriendRequesters>()
  const session = useSession()
  const friendRequestedEmail = session.data?.user?.email

  useEffect(() => {
    if (session.status === 'authenticated')
      axios
        .get(`/api/friend/request/${friendRequestedEmail}`)
        .then((res) => {
          setFriendRequesters(res.data)
        })
        .finally(() => {
          setIsLoading(false)
        })
  }, [session, refresh])

  const handleClick = (
    friendRequesterEmail: string | null,
    response: Response
  ) => {
    axios
      .post('/api/friend/request/response', {
        friendRequestedEmail,
        friendRequesterEmail,
        response: response,
      })
      .then((res) => toast.success(res.data))
      .finally(() => setRefresh(refresh + 1))
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-30 shadow-lg">
      <div className="bg-white px-4 py-2 rounded-lg sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-gary-900 font-medium mr-1">
              대기 중인 친구 요청
            </h1>
            <button
              onClick={() => {
                setIsLoading(true)
                setRefresh(refresh + 1)
              }}
              className="rounded-xl hover:bg-gray-100 active:bg-gray-200 p-2"
            >
              <BsArrowRepeat className="text-[16px]" />
            </button>
          </div>

          <button
            onClick={clickModal}
            className="rounded-xl hover:bg-gray-100 active:bg-gray-200"
          >
            <BsX className="text-[28px]" />
          </button>
        </div>
        <div>
          {isLoading ? (
            <div className="my-2 text-gray-600">불러오는 중...</div>
          ) : (
            <div>
              {friendRequesters?.length === 0 ? (
                <div className="my-2">대기 중인 친구 요청이 없습니다.</div>
              ) : (
                friendRequesters?.map((friendRequester) => (
                  <div className="my-2">
                    <div className="flex justify-between bg-gray-100 rounded-lg">
                      <div className="flex px-2">
                        <div className="p-2">{friendRequester.username}</div>
                        <div className="p-2">{friendRequester.email}</div>
                      </div>
                      <div className="flex items-center mx-2">
                        <button
                          className="rounded-xl hover:bg-gray-200 active:bg-gray-300"
                          onClick={() =>
                            handleClick(friendRequester.email, 'ACCEPT')
                          }
                        >
                          <BsCheck className="text-[28px] text-green-600" />
                        </button>
                        <button
                          className="rounded-xl hover:bg-gray-200 active:bg-gray-300"
                          onClick={() =>
                            handleClick(friendRequester.email, 'DECLINE')
                          }
                        >
                          <BsX className="text-[28px] text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}