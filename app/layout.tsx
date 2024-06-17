import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"
import clsx from "clsx"
import SessionContext from "@/contexts/SessionContext"
import { Toaster } from "react-hot-toast"
import ThemeContext from "@/contexts/ThemeProvider"

const noto_sans_kr = Noto_Sans_KR({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "크립톡(Cryptalk)",
  description: "종간단 암호화 채팅 서비스(End-to-End Encrypted Chat Service)",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={clsx(noto_sans_kr.className, "h-screen")}>
        <ThemeContext>
          <Toaster />
          <SessionContext>{children}</SessionContext>
        </ThemeContext>
      </body>
    </html>
  )
}
