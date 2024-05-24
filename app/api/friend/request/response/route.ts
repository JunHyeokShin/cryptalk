import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { friendRequestedId, friendRequesterId, response } =
      await request.json()

    if (response === 'ACCEPT') {
      const friendRequestedUser = await prisma.user.update({
        where: {
          id: friendRequestedId,
        },
        data: {
          friends: {
            connect: {
              id: friendRequesterId,
            },
          },
          friendRequests: {
            disconnect: {
              id: friendRequesterId,
            },
          },
        },
      })
      await prisma.user.update({
        where: {
          id: friendRequesterId,
        },
        data: {
          friends: {
            connect: {
              id: friendRequestedId,
            },
          },
        },
      })
      return new NextResponse('친구 요청을 수락하였습니다.', { status: 200 })
    }
    if (response === 'DECLINE') {
      const friendRequestedUser = await prisma.user.update({
        where: {
          id: friendRequestedId,
        },
        data: {
          friendRequests: {
            disconnect: {
              id: friendRequesterId,
            },
          },
        },
      })
      return new NextResponse('친구 요청을 거절하였습니다.', { status: 200 })
    }
  } catch (error) {
    console.log(error, 'RESPONSE_REQUEST_FRIEND_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
