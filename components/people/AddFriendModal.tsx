'use client'

import { useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import Input from '../Input'
import Button from '../Button'
import { BsX } from 'react-icons/bs'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

type Props = {
  clickModal: () => void
}

export default function AddFriendModal({ clickModal }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const friendRequesterEmail = useSession().data?.user?.email

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)
    const { friendRequestedEmail } = data

    // 친구 요청
    axios
      .put('/api/friend/request', {
        friendRequesterEmail,
        friendRequestedEmail,
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
            className="rounded-xl hover:bg-gray-100 active:bg-gray-200"
          >
            <BsX className="text-[28px]" />
          </button>
        </div>
        <form className="space-y-2 my-2" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="friendRequestedEmail"
            label="상대방 이메일"
            type="email"
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
