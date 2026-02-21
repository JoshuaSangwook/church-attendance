import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 출석 일지 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const whereClause: any = {}

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { student: { name: 'asc' } }
      ]
    })

    const logs = attendances.map(att => ({
      date: att.date.toISOString().split('T')[0],
      studentName: att.student.name,
      className: att.student.class.name,
      status: att.status,
      note: att.note || '',
      isQuietTimeDone: att.isQuietTimeDone || false
    }))

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching attendance logs:', error)
    return NextResponse.json({ error: '출석 일지를 불러오는데 실패했습니다' }, { status: 500 })
  }
}
