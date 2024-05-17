import SideMenu from '@/components/SideMenu'

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex h-full">
      <SideMenu />
      {children}
    </div>
  )
}
