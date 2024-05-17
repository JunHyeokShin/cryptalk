import bcrypt from 'bcrypt'
import prisma from '@/libs/prismadb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    if (!email || !username || !password) {
      return new NextResponse('회원가입 정보가 잘못되었습니다.', {
        status: 400,
      })
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (exist) {
      return new NextResponse('이미 등록된 이메일입니다.', { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
      },
    })
    return NextResponse.json(user)
  } catch (error: any) {
    console.log(error, 'REGISTERATION_ERROR')
    return new NextResponse('알 수 없는 오류가 발생했습니다.', { status: 500 })
  }
}
