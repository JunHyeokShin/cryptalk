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
        preKeys: true,
      },
    })

    if (user.preKeys.length > 0) {
      const [firstKey, ...remainingKeys] = user.preKeys

      await prisma.user.update({
        where: {
          id: params.id,
        },
        data: {
          preKeys: remainingKeys,
        },
      })
      return NextResponse.json({ preKey: firstKey }, { status: 200 })
    } else {
      return new NextResponse(
        '해당 유저의 사전 등록 키가 등록되어 있지 않습니다.',
        { status: 400 }
      )
    }
  } catch (error) {
    return new NextResponse('해당 유저를 찾을 수 없습니다.', { status: 400 })
  }
}
