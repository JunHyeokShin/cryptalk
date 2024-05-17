import axios from 'axios'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { BsArrowRepeat } from 'react-icons/bs'

type People = {
  username: string
  email: string
  image: string | null
}[]

export default function PeopleList() {
  const [isLoading, setIsLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [people, setPeople] = useState<People>()
  const session = useSession()
  const currentUserEmail = session.data?.user?.email

  useEffect(() => {
    if (session.status === 'authenticated') {
      axios
        .get(`/api/friend/${currentUserEmail}`)
        .then((res) => {
          setPeople(res.data)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [session, refresh])

  return (
    <div>
      {isLoading ? (
        <div className="text-gray-600">불러오는 중...</div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              setIsLoading(true)
              setRefresh(refresh + 1)
            }}
            className="rounded-xl hover:bg-gray-100 active:bg-gray-200 p-2"
          >
            <BsArrowRepeat className="text-[16px]" />
          </button>
          {people?.map((person) => (
            <div className="flex items-center m-1">
              <Image
                src="/images/default_profile.png"
                alt="프로필 이미지"
                width={36}
                height={36}
                className="rounded-full mr-2"
              />
              <div>{person.username}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
