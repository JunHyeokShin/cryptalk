import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

type Params = {
  params: {
    id: string[]
  }
}

export async function GET(request: Request, { params }: Params) {
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
    return NextResponse.json(
      {
        conversationId: conversation.id,
      },
      { status: 200 }
    )
  }

  const newConversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      users: {
        connect: [{ id: params.id[0] }, { id: params.id[1] }],
      },
    },
  })

  return NextResponse.json(
    {
      conversationId: newConversation.id,
    },
    { status: 200 }
  )
}
