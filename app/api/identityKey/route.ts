import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id, identityKey } = await request.json()

  try {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        identityKey: identityKey,
      },
    })
    return new NextResponse('개인 식별 키를 등록하였습니다.', { status: 200 })
  } catch (error) {
    return new NextResponse('개인 식별 키 등록에 실패하였습니다.', {
      status: 400,
    })
  }
}
