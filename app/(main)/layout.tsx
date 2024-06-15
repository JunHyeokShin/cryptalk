import { auth } from '@/auth'
import KeyManager from '@/components/crypto/KeyManager'
import SideMenu from '@/components/sidemenu/SideMenu'
import { redirect } from 'next/navigation'

type Props = {
  children: React.ReactNode
}

export default async function MainLayout({ children }: Props) {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex h-full">
      <KeyManager session={session} />
      <SideMenu />
      {children}
    </div>
  )
}
