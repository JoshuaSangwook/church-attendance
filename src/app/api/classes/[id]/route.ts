import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - 반 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, teacherName } = body

    const updatedClass = await prisma.class.update({
      where: { id: parseInt(id) },
      data: {
        name,
        teacherName
      }
    })

    // 직렬화를 위해 JSON 직렬화 가능한 형태로 변환
    const serializedClass = {
      ...updatedClass,
      createdAt: updatedClass.createdAt.toISOString(),
      updatedAt: updatedClass.updatedAt.toISOString()
    }

    return NextResponse.json(serializedClass)
  } catch (error) {
    return NextResponse.json({ error: '반 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 반 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.class.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '반 삭제에 실패했습니다' }, { status: 500 })
  }
}
