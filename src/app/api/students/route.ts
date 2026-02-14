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

    // 직렬화를 위해 JSON 직렬화 가능한 형태로 변환
    const serializedStudents = students.map(student => ({
      ...student,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
      class: student.class ? {
        ...student.class,
        createdAt: student.class.createdAt.toISOString(),
        updatedAt: student.class.updatedAt.toISOString()
      } : null
    }))

    return NextResponse.json(serializedStudents)
  } catch (error) {
    console.error('Error fetching students:', error)
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
