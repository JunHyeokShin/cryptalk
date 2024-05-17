import bcrypt from 'bcrypt'
import prisma from '@/libs/prismadb'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import nextAuth, { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credential',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('로그인 정보가 잘못되었습니다.')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })
        if (!user || !user?.hashedPassword) {
          throw new Error('등록되지 않은 이메일입니다.')
        }
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isCorrectPassword) {
          throw new Error('틀린 비밀번호입니다.')
        }

        return user
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = nextAuth(authOptions)

export { handler as GET, handler as POST }
