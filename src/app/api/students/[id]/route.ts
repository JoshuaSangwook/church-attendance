import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - 학생 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, classId } = body

    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone: phone || null,
        classId: parseInt(classId)
      },
      include: {
        class: true
      }
    })

    // 직렬화를 위해 JSON 직렬화 가능한 형태로 변환
    const serializedStudent = {
      ...updatedStudent,
      createdAt: updatedStudent.createdAt.toISOString(),
      updatedAt: updatedStudent.updatedAt.toISOString(),
      class: updatedStudent.class ? {
        ...updatedStudent.class,
        createdAt: updatedStudent.class.createdAt.toISOString(),
        updatedAt: updatedStudent.class.updatedAt.toISOString()
      } : null
    }

    return NextResponse.json(serializedStudent)
  } catch (error) {
    return NextResponse.json({ error: '학생 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 학생 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.student.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '학생 삭제에 실패했습니다' }, { status: 500 })
  }
}
