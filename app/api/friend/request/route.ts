import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const { friendRequesterEmail, friendRequestedEmail } = await request.json()

    const friendRequesterUser = await prisma.user.findUnique({
      where: {
        email: friendRequesterEmail,
      },
    })
    if (!friendRequesterUser) {
      return new NextResponse(
        '요청자의 정보를 확인할 수 없습니다. 다시 로그인을 시도해주세요.',
        { status: 400 }
      )
    }

    const friendRequestedUser = await prisma.user.findUnique({
      where: {
        email: friendRequestedEmail,
      },
    })
    if (!friendRequestedUser) {
      return new NextResponse('해당 유저를 찾을 수 없습니다.', {
        status: 400,
      })
    }

    if (friendRequesterUser?.friendIds.includes(friendRequestedUser.id)) {
      return new NextResponse('이미 친구로 등록된 유저입니다.', { status: 400 })
    }
    if (friendRequesterUser?.id === friendRequestedUser.id) {
      return new NextResponse('자기 자신에게 요청을 보낼 수 없습니다.', {
        status: 400,
      })
    }

    await prisma.user.update({
      where: {
        email: friendRequestedEmail,
      },
      data: {
        friendRequests: {
          connect: {
            id: friendRequesterUser?.id,
          },
        },
      },
    })

    return new NextResponse('친구 요청을 보냈습니다.', { status: 200 })
  } catch (error: any) {
    console.log(error, 'REQUEST_FRIEND_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
