import { Session } from 'next-auth'
import Image from 'next/image'
import { BsX } from 'react-icons/bs'

type Props = {
  clickModal: () => void
  session: Session | null
}

export default function ProfileModal({ clickModal, session }: Props) {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-30 shadow-lg">
      <div className="bg-white px-4 py-2 rounded-lg sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-gary-900 font-medium">프로필 정보</h1>
          <button
            onClick={clickModal}
            className="rounded-xl hover:bg-gray-100 hover:shadow-md active:shadow-sm"
          >
            <BsX className="text-[28px]" />
          </button>
        </div>
        <div className="my-2">
          <Image
            src={session?.user?.image || '/images/default_profile.png'}
            width={40}
            height={40}
            alt="profile"
            className="rounded-full"
          />
          <div>ID: {session?.user?.id}</div>
          <div>이름: {session?.user?.name}</div>
          <div>이메일: {session?.user?.email}</div>
        </div>
      </div>
    </div>
  )
}
