import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - 반 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, teacherName } = body

    const updatedClass = await prisma.class.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        teacherName
      }
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    return NextResponse.json({ error: '반 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 반 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.class.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '반 삭제에 실패했습니다' }, { status: 500 })
  }
}
