import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 출석 기록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const classId = searchParams.get('classId')

    const attendances = await prisma.attendance.findMany({
      where: {
        ...(date && {
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lte: new Date(date + 'T23:59:59.999Z')
          }
        }),
        ...(classId && {
          student: {
            classId: parseInt(classId)
          }
        })
      },
      include: {
        student: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    return NextResponse.json(attendances)
  } catch (error) {
    return NextResponse.json({ error: '출석 기록을 불러오는데 실패했습니다' }, { status: 500 })
  }
}

// POST - 출석 기록 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, date, status, note } = body

    if (!studentId || !date || !status) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: parseInt(studentId),
          date: new Date(date)
        }
      },
      update: {
        status,
        note: note || null
      },
      create: {
        studentId: parseInt(studentId),
        date: new Date(date),
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

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: '출석 기록 생성에 실패했습니다' }, { status: 500 })
  }
}
