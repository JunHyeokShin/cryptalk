import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        friends: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })
    return NextResponse.json(user?.friends)
  } catch (error: any) {
    console.log(error, 'GET_FRIENDS_ERROR')
    return new NextResponse('친구 목록을 불러오는데 실패했습니다.', {
      status: 500,
    })
  }
}
