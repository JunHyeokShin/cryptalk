import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: params.id,
      },
      select: {
        identityKey: true,
      },
    })
    if (user.identityKey) {
      return NextResponse.json(
        { identityKey: user.identityKey },
        { status: 200 }
      )
    } else {
      return NextResponse.json({ identityKey: null }, { status: 201 })
    }
  } catch (error) {
    return new NextResponse('해당 유저를 찾을 수 없습니다.', { status: 400 })
  }
}
