import SideMenuLinks from "./SideMenuLinks"
import { auth, signOut } from "@/auth"
import { BsBoxArrowLeft } from "react-icons/bs"
import ProfileButton from "./ProfileButton"
import DarkModeToggleButton from "@/components/DarkModeToggleButton"

export default async function SideMenu() {
  const session = await auth()

  return (
    <div className="flex flex-col justify-between bg-gray-200 dark:bg-neutral-900 px-2 py-3 shadow">
      <SideMenuLinks />
      <div className="flex flex-col items-center">
        <DarkModeToggleButton />
        <ProfileButton session={session} />
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="rounded-xl p-2 hover:bg-gray-300 dark:hover:bg-neutral-800 hover:shadow-md active:shadow-sm dark:hover:shadow-zinc-700 dark:hover:shadow-md dark:active:shadow-sm"
          >
            <BsBoxArrowLeft className="text-[28px]" />
          </button>
        </form>
      </div>
    </div>
  )
}
