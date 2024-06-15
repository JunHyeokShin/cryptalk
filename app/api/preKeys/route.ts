import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id, preKeys } = await request.json()

  try {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        preKeys: {
          push: preKeys,
        },
      },
    })
    return new NextResponse('사전 등록 키를 등록하였습니다.', { status: 200 })
  } catch (error) {
    return new NextResponse('사전 등록 키 등록에 실패하였습니다.', {
      status: 400,
    })
  }
}
