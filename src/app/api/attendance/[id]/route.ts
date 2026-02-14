import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - 출석 기록 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, note } = body

    const updated = await prisma.attendance.update({
      where: { id: parseInt(params.id) },
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

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: '출석 기록 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 출석 기록 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.attendance.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '출석 기록 삭제에 실패했습니다' }, { status: 500 })
  }
}
