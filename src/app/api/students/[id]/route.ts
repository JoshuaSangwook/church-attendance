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

    return NextResponse.json(updatedStudent)
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
