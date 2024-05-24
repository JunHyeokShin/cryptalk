import { IconType } from 'react-icons'
import { signIn } from '@/auth'

type Props = {
  children: React.ReactNode
  provider: string
  icon: IconType
}

export default function AuthSocialButton({
  children,
  provider,
  icon: Icon,
}: Props) {
  return (
    <form
      action={async () => {
        'use server'
        await signIn(provider, { redirectTo: '/people' })
      }}
    >
      <button
        type="submit"
        className="flex justify-center items-center w-full py-2 rounded-md ring-1 ring-inset ring-gray-300 bg-white shadow-md focus:shadow-sm hover:bg-gray-50"
      >
        <Icon className="text-3xl" />
        <p className="ml-2 font-medium text-gray-700">{children}</p>
      </button>
    </form>
  )
}
