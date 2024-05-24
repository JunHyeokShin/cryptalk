import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { friendRequesterId, friendRequestedId } = await request.json()
    let friendRequesterUser, friendRequestedUser

    try {
      friendRequesterUser = await prisma.user.findUniqueOrThrow({
        where: {
          id: friendRequesterId,
        },
      })
    } catch (error) {
      return new NextResponse(
        '요청자의 정보를 확인할 수 없습니다. 다시 로그인을 시도해주세요.',
        { status: 400 }
      )
    }

    try {
      friendRequestedUser = await prisma.user.findFirstOrThrow({
        where: {
          id: friendRequestedId,
        },
      })
    } catch (error) {
      return new NextResponse('유저를 찾을 수 없습니다.', {
        status: 400,
      })
    }

    if (friendRequesterUser?.friendIds.includes(friendRequestedId)) {
      return new NextResponse('이미 친구로 등록된 유저입니다.', { status: 400 })
    }
    if (friendRequesterUser?.id === friendRequestedId) {
      return new NextResponse('자기 자신에게 요청을 보낼 수 없습니다.', {
        status: 400,
      })
    }

    await prisma.user.update({
      where: {
        id: friendRequestedId,
      },
      data: {
        friendRequests: {
          connect: {
            id: friendRequesterId,
          },
        },
      },
    })
    return new NextResponse('친구 요청을 보냈습니다.', { status: 200 })
  } catch (error) {
    console.log(error, 'REQUEST_FRIEND_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
