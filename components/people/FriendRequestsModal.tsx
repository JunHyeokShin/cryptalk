'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BsArrowRepeat, BsCheck, BsX } from 'react-icons/bs'

type Props = {
  clickModal: () => void
}

type Person = {
  id: string
  name: string
  image: string
}

type Response = 'ACCEPT' | 'DECLINE'

export default function FriendRequestsModal({ clickModal }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [friendRequesters, setFriendRequesters] = useState<Person[]>()
  const session = useSession()
  const currentUser = session.data?.user

  useEffect(() => {
    axios
      .get(`/api/friend/request/${currentUser?.id}`)
      .then((res) => {
        setFriendRequesters(res.data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [refresh])

  const handleClick = async (friendRequesterId: string, response: Response) => {
    await axios
      .post('/api/friend/request/response', {
        friendRequestedId: currentUser?.id,
        friendRequesterId,
        response,
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
              className="rounded-xl p-2 hover:bg-gray-100 hover:shadow-md active:shadow-sm"
            >
              <BsArrowRepeat className="text-[16px]" />
            </button>
          </div>

          <button
            onClick={clickModal}
            className="rounded-xl hover:bg-gray-100 hover:shadow-md active:shadow-sm"
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
                  <div className="my-2" key={friendRequester.id}>
                    <div className="flex justify-between bg-gray-100 rounded-full">
                      <div className="flex items-center p-2">
                        <Image
                          src={
                            friendRequester.image ||
                            '/images/default_profile.png'
                          }
                          alt="프로필 이미지"
                          width={36}
                          height={36}
                          className="rounded-full mr-2"
                        />
                        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {friendRequester.name}
                        </div>
                      </div>
                      <div className="flex items-center mx-2">
                        <button
                          className="rounded-xl hover:bg-gray-200 hover:shadow-md active:shadow-sm"
                          onClick={() =>
                            handleClick(friendRequester.id, 'ACCEPT')
                          }
                        >
                          <BsCheck className="text-3xl text-green-600" />
                        </button>
                        <button
                          className="rounded-xl hover:bg-gray-200 hover:shadow-md active:shadow-sm"
                          onClick={() =>
                            handleClick(friendRequester.id, 'DECLINE')
                          }
                        >
                          <BsX className="text-3xl text-red-600" />
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
