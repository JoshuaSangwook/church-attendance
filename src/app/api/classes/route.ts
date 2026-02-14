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

    // 직렬화를 위해 JSON 직렬화 가능한 형태로 변환
    const serializedClasses = classes.map(cls => ({
      ...cls,
      createdAt: cls.createdAt.toISOString(),
      updatedAt: cls.updatedAt.toISOString()
    }))

    return NextResponse.json(serializedClasses)
  } catch (error) {
    console.error('Error fetching classes:', error)
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

    // 직렬화를 위해 JSON 직렬화 가능한 형태로 변환
    const serializedClass = {
      ...newClass,
      createdAt: newClass.createdAt.toISOString(),
      updatedAt: newClass.updatedAt.toISOString()
    }

    return NextResponse.json(serializedClass, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '반 생성에 실패했습니다' }, { status: 500 })
  }
}
