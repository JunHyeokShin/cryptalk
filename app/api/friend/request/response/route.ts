import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { friendRequestedEmail, friendRequesterEmail, response } =
      await request.json()

    if (response === 'ACCEPT') {
      const friendRequestedUser = await prisma.user.update({
        where: {
          email: friendRequestedEmail,
        },
        data: {
          friends: {
            connect: {
              email: friendRequesterEmail,
            },
          },
          friendRequests: {
            disconnect: {
              email: friendRequesterEmail,
            },
          },
        },
      })
      await prisma.user.update({
        where: {
          email: friendRequesterEmail,
        },
        data: {
          friends: {
            connect: {
              id: friendRequestedUser.id,
            },
          },
        },
      })
      return new NextResponse('친구 요청을 수락하였습니다.', { status: 200 })
    }

    if (response === 'DECLINE') {
      await prisma.user.update({
        where: {
          email: friendRequestedEmail,
        },
        data: {
          friendRequests: {
            disconnect: {
              email: friendRequesterEmail,
            },
          },
        },
      })
      return new NextResponse('친구 요청을 거절하였습니다.', { status: 200 })
    }
  } catch (error: any) {
    console.log(error, 'RESPONSE_REQUEST_FRIEND_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
