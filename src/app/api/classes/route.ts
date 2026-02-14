import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 모든 반 조회
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json({ error: '반 목록을 불러오는데 실패했습니다' }, { status: 500 })
  }
}

// POST - 새 반 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, teacherName } = body

    if (!name || !teacherName) {
      return NextResponse.json({ error: '반 이름과 담당 선생님 이름을 입력해주세요' }, { status: 400 })
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        teacherName
      }
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '반 생성에 실패했습니다' }, { status: 500 })
  }
}
