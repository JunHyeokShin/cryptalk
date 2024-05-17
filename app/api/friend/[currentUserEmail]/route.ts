import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: { currentUserEmail: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: params.currentUserEmail,
      },
      include: {
        friends: {
          select: {
            username: true,
            email: true,
            image: true,
          },
        },
      },
    })
    return NextResponse.json(user?.friends)
  } catch (error: any) {
    console.log(error, 'GET_FRIENDS_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
