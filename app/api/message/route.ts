import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { senderId, preKey, conversationId, body, createdAt } =
    await request.json()

  try {
    const message = await prisma.message.create({
      data: {
        preKey,
        body,
        createdAt,
        sender: {
          connect: {
            id: senderId,
          },
        },
        conversation: {
          connect: {
            id: conversationId,
          },
        },
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })
    return NextResponse.json(message)
  } catch (error) {
    console.log(error, 'CREATE_MESSAGE_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
