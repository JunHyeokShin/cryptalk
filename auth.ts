import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from './libs/prismadb'
import NextAuth, { NextAuthConfig } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Github,
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
