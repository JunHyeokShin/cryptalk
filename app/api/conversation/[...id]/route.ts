import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: {
    id: string[]
  }
}

export async function GET(request: Request, { params }: Params) {
  if (params.id.length === 1) {
    try {
      const conversation = await prisma.conversation.findUniqueOrThrow({
        where: {
          id: params.id[0],
        },
      })
      return NextResponse.json(conversation, { status: 200 })
    } catch (error) {
      return new NextResponse('해당 대화방을 찾을 수 없습니다.', {
        status: 400,
      })
    }
  } else {
    try {
      const user1 = await prisma.user.findUniqueOrThrow({
        where: {
          id: params.id[0],
        },
      })
      const user2 = await prisma.user.findUniqueOrThrow({
        where: {
          id: params.id[1],
        },
      })
    } catch (error) {
      return new NextResponse('대화 상대가 존재하지 않습니다.', { status: 400 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        userIds: {
          hasEvery: [params.id[0], params.id[1]],
        },
      },
    })

    if (conversation) {
      return NextResponse.json(conversation, { status: 200 })
    }

    const newConversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: params.id[0] }, { id: params.id[1] }],
        },
      },
    })

    return NextResponse.json(newConversation, { status: 200 })
  }
}
