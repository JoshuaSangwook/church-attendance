import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 주별 통계 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // 전체 출석 기록 조회
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // 날짜별 그룹화 (주차 계산을 위함)
    const weeklyData: Record<string, { present: number; total: number }> = {}

    attendances.forEach(a => {
      const date = new Date(a.date)
      const year = date.getFullYear()
      const weekNumber = getWeekNumber(date)
      const weekKey = `${year}-W${weekNumber}`

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { present: 0, total: 0 }
      }

      weeklyData[weekKey].total++
      if (a.status === 'PRESENT') {
        weeklyData[weekKey].present++
      }
    })

    // 주별 통계 배열로 변환
    const weeklyStats = Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        presentCount: data.present,
        totalCount: data.total
      }))
      .sort((a, b) => a.week.localeCompare(b.week))

    return NextResponse.json({
      weeklyStats
    })
  } catch (error) {
    console.error('주별 통계 조회 에러:', error)
    return NextResponse.json({ error: '주별 통계를 불러오는데 실패했습니다' }, { status: 500 })
  }
}

// ISO 주차 구하는 함수
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
