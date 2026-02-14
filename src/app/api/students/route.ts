import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 모든 학생 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const students = await prisma.student.findMany({
      where: classId ? { classId: parseInt(classId) } : undefined,
      include: {
        class: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: '학생 목록을 불러오는데 실패했습니다' }, { status: 500 })
  }
}

// POST - 새 학생 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, classId } = body

    if (!name || !classId) {
      return NextResponse.json({ error: '이름과 소속 반을 입력해주세요' }, { status: 400 })
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        phone: phone || null,
        classId: parseInt(classId)
      },
      include: {
        class: true
      }
    })

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '학생 생성에 실패했습니다' }, { status: 500 })
  }
}
