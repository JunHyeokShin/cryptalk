import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthContext from '@/components/auth/AuthContext'

const noto_sans_kr = Noto_Sans_KR({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '크립톡(Cryptalk)',
  description: '종간단 암호화 채팅 서비스(End-to-End Encrypted Chat Service)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={noto_sans_kr.className}>
        <AuthContext>
          <Toaster />
          {children}
        </AuthContext>
      </body>
    </html>
  )
}
