import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - 출석 기록 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, note } = body

    const updated = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: {
        status,
        note: note || null
      },
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    })

    // 직렬화를 위해 JSON 직렬화 가능한 형태로 변환
    const serializedAttendance = {
      ...updated,
      date: updated.date.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      student: updated.student ? {
        ...updated.student,
        createdAt: updated.student.createdAt.toISOString(),
        updatedAt: updated.student.updatedAt.toISOString(),
        class: updated.student.class ? {
          ...updated.student.class,
          createdAt: updated.student.class.createdAt.toISOString(),
          updatedAt: updated.student.class.updatedAt.toISOString()
        } : null
      } : null
    }

    return NextResponse.json(serializedAttendance)
  } catch (error) {
    return NextResponse.json({ error: '출석 기록 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 출석 기록 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.attendance.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '출석 기록 삭제에 실패했습니다' }, { status: 500 })
  }
}
