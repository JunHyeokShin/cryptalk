import Image from 'next/image'
import AuthForm from './components/AuthForm'

export default function Home() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8bg-gray-100">
      <div className="sm:mx-auto sm:w-full">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={48}
          height={48}
          className="mx-auto"
        />
        <h1 className="mt-4 text-center text-3xl font-black text-gray-900">
          CRYPTALK
        </h1>
        <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-gray-900">
          세상에서 가장 먼 귓속말
        </h2>
      </div>
      <AuthForm />
    </div>
  )
}
