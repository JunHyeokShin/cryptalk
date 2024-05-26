import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: {
    conversationId: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const conversation = await prisma.conversation.findUniqueOrThrow({
      where: {
        id: params.conversationId,
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
    return NextResponse.json(conversation)
  } catch (error) {
    return new NextResponse('대화방을 찾을 수 없습니다.', { status: 400 })
  }
}
