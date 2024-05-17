import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: { friendRequestedEmail: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: params.friendRequestedEmail,
      },
      include: {
        friendRequests: {
          select: {
            username: true,
            email: true,
            image: true,
          },
        },
      },
    })
    return NextResponse.json(user?.friendRequests)
  } catch (error: any) {
    console.log(error, 'GET_FRIEND_REQUESTS_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
