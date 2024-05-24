import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import AuthSocialButton from '@/components/auth/AuthSocialButton'
import { FcGoogle } from 'react-icons/fc'
import { BsGithub } from 'react-icons/bs'

export default async function AuthPage() {
  const session = await auth()

  if (session) {
    redirect('/people')
  }

  return (
    <div className="flex flex-col h-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <Image src="/images/logo.svg" alt="Logo" width={60} height={60} />
        <h1 className="mt-4 font-black text-3xl text-gray-900">CRYPTALK</h1>
        <h2 className="mt-2 font-medium text-xl text-gray-800">
          세상에서 가장 먼 귓속말
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 w-96 mt-4">
        <AuthSocialButton provider="google" icon={FcGoogle}>
          Google
        </AuthSocialButton>
        <AuthSocialButton provider="github" icon={BsGithub}>
          GitHub
        </AuthSocialButton>
      </div>
    </div>
  )
}
