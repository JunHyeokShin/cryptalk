import People from '@/components/people/People'

type Props = {
  children: React.ReactNode
}

export default function PeopleLayout({ children }: Props) {
  return (
    <div className="flex flex-grow">
      <People />
      {children}
    </div>
  )
}
