import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 통계 데이터 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    if (classId) {
      where.student = { classId: parseInt(classId) }
    }

    // 전체 출석 기록
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    })

    // 반별 통계
    const classStats = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true }
        },
        students: {
          include: {
            attendances: {
              where
            }
          }
        }
      }
    })

    // 출석률 계산
    const stats = classStats.map((cls: any) => {
      const totalAttendances = cls.students.reduce((sum: number, s: any) => sum + s.attendances.length, 0)
      const presentCount = cls.students.reduce((sum: number, s: any) =>
        sum + s.attendances.filter((a: any) => a.status === 'PRESENT').length, 0
      )
      const absentCount = cls.students.reduce((sum: number, s: any) =>
        sum + s.attendances.filter((a: any) => a.status === 'ABSENT').length, 0
      )

      return {
        class: cls,
        totalStudents: cls._count.students,
        totalAttendances,
        presentCount,
        absentCount,
        attendanceRate: totalAttendances > 0
          ? Math.round((presentCount / totalAttendances) * 100)
          : 0
      }
    })

    return NextResponse.json({
      attendances,
      classStats: stats
    })
  } catch (error) {
    return NextResponse.json({ error: '통계 데이터를 불러오는데 실패했습니다' }, { status: 500 })
  }
}
