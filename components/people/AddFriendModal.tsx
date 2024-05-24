'use client'

import { useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { BsX } from 'react-icons/bs'
import Input from '../Input'
import Button from '../Button'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import toast from 'react-hot-toast'

type Props = {
  clickModal: () => void
}

export default function AddFriendModal({ clickModal }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const session = useSession()
  const currentUser = session.data?.user

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      friendRequestedId: '',
    },
  })

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)
    const { friendRequestedId } = data
    await axios
      .post('/api/friend/request', {
        friendRequesterId: currentUser?.id,
        friendRequestedId,
      })
      .then(() => {
        toast.success('친구 요청을 보냈습니다.')
        clickModal()
      })
      .catch((error) => {
        toast.error(error.response.data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-30 shadow-lg">
      <div className="bg-white px-4 py-2 rounded-lg sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-gary-900 font-medium">친구 요청 보내기</h1>
          <button
            onClick={clickModal}
            className="rounded-xl hover:bg-gray-100 hover:shadow-md active:shadow-sm"
          >
            <BsX className="text-[28px]" />
          </button>
        </div>
        <form className="space-y-2 my-2" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="friendRequestedId"
            label="상대방 ID 값을 입력하세요"
            type="text"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              요청 보내기
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
